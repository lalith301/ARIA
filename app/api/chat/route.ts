import Groq from "groq-sdk";
import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  saveMemory,
  getRelevantMemories,
  getRecentHistory,
  getUserProfile,
  detectMood,
  extractTopics,
  getTopTopics,
  getRecentMoodTrend,
  getCommunicationStyleHint,
} from "@/lib/memory";
import { searchWeb, getWeather, CURRENT_DATE_CONTEXT } from "@/lib/tools";
import { runMCP } from "@/lib/mcp/manager";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildSystemPrompt(
  memories: string[],
  profile: any,
  currentMood: string,
  mcpResult?: string
): string {
  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";
  const lastActive = profile?.last_active ? new Date(profile.last_active) : null;
  const daysSince = lastActive
    ? Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  let prompt = `You are ARIA (Adaptive Realtime Intelligence Agent) — a warm, witty, and genuinely caring AI companion.

${CURRENT_DATE_CONTEXT}

Your core personality:
- Curious, playful when the mood is right, honest, and deeply empathetic
- You speak like a smart friend, not a customer service bot
- You naturally bring up things the user has told you before
- You are direct and give real opinions when asked
- You know current events, history, science, culture — everything

Hard rules:
- Never say "As an AI" or "I am just a language model"
- Never say "I don't have access to real-time information" — you DO have tools
- Never be sycophantic ("Great question!", "Certainly!", "Of course!")
- Keep responses SHORT — 2-3 sentences for casual/emotional chat, never pad or over-explain
- Match their energy — short message = short reply, complex question = detailed answer
- Use bullet points ONLY when listing steps, phases, options, or multiple items
- When listing phases/steps — ALWAYS use numbered list, one per line
- Never use markdown headers (##) ever
- When you have tool results, present them naturally and conversationally
- When the user confirms they want to play a Spotify track (says "yes", "play it", "sure"), always include [SPOTIFY_OPEN:https://open.spotify.com/search/TRACKNAME] at the end of your response so the button appears
- NEVER guess or invent email content — you only have subject lines, not full email bodies
- If asked what an email says, tell the user you can only see the subject line and sender, not the full content
- NEVER make up or hallucinate tool results — if a tool returns nothing or fails, say you couldn't fetch that information
- If tool results contain music tracks, ALWAYS confirm you found them — never say you couldn't find something that was returned
- The presence of [SPOTIFY_OPEN:...] in tool results means the search SUCCEEDED — always present it positively
- Only report what the tools actually return — never invent data
- For calendar events, ONLY report the exact event name, date and time returned by the tool — never guess location, topic, or additional details
- If asked for more details about a calendar event, say you can only see the event title and time, not the full details
- When a user says "yes" after you report calendar events, do NOT invent additional details — instead ask what they'd like to do with the event

Time awareness:
- It is currently ${timeOfDay} (${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })})
- ${daysSince === 0 ? "They talked to you earlier today" : daysSince === 1 ? "They last talked to you yesterday" : daysSince ? `They haven't talked to you in ${daysSince} days — acknowledge their return warmly` : "This may be a new user"}`;

  // Mood-aware behavior
  const moodInstructions: Record<string, string> = {
    stressed: `\n\nThe user seems STRESSED. Acknowledge how they're feeling FIRST before anything else. Be calm and grounding.`,
    sad: `\n\nThe user seems SAD. Lead with empathy. Validate their feelings before offering any perspective.`,
    angry: `\n\nThe user seems FRUSTRATED. Acknowledge their frustration first. Stay calm and understanding.`,
    tired: `\n\nThe user seems TIRED. Keep responses shorter and gentler. Be caring and light.`,
    happy: `\n\nThe user seems happy! Match their positive energy. Be playful and fun.`,
    curious: `\n\nThe user is curious. Engage their curiosity! Go deep on topics.`,
  };
  prompt += moodInstructions[currentMood] || "";

  // User profile
  if (profile) {
    const topTopics = getTopTopics(profile.topics_of_interest || {});
    const moodTrend = getRecentMoodTrend(profile.mood_history || []);
    const styleHint = getCommunicationStyleHint(profile.communication_style || "balanced");

    prompt += `\n\n━━ WHAT YOU KNOW ABOUT THIS USER ━━`;
    if (profile.facts?.length > 0) prompt += `\nPersonal facts:\n${profile.facts.slice(-15).join("\n")}`;
    if (topTopics.length > 0) prompt += `\n\nTopics they care about: ${topTopics.join(", ")}`;
    if (moodTrend !== "unknown" && moodTrend !== "neutral") prompt += `\n\nRecent mood pattern: ${moodTrend}`;
    if (profile.communication_style) prompt += `\n\nCommunication style: ${styleHint}`;
  }

  // Relevant memories
  if (memories.length > 0) {
    prompt += `\n\n━━ RELEVANT PAST CONVERSATIONS ━━\n${memories.join("\n")}`;
    prompt += `\n\nUse these naturally — bring them up when relevant, don't force it.`;
  }

  // MCP tool results
  if (mcpResult) {
    prompt += `\n\n━━ REAL-TIME DATA FROM TOOLS ━━\n${mcpResult}\n\nCRITICAL: Present ONLY this exact data. Do NOT add anything from past memories. Do NOT mention other events, reminders, or items not in this data. This is the ONLY source of truth right now.`;
  }

  return prompt;
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const USER_ID = user.id;
  const { messages, timezone } = await req.json();
  const userTimezone = timezone || "Asia/Kolkata";
  const latestMessage = messages[messages.length - 1]?.content || "";

  const currentMood = detectMood(latestMessage);
  const currentTopics = extractTopics(latestMessage);

  // Run everything in parallel
  // Run MCP first separately so we can short-circuit for WhatsApp QR
  const mcpResult = await runMCP(latestMessage, currentMood, USER_ID, userTimezone);

  

  const isCalendarAction = latestMessage.toLowerCase().match(/\b(reminder|event|meeting|appointment|schedule|calendar)\b/);

  const [relevantMemories, recentHistory, profile] = await Promise.all([
    isCalendarAction ? Promise.resolve([]) : getRelevantMemories(USER_ID, latestMessage),
    getRecentHistory(USER_ID, 8),
    getUserProfile(USER_ID),
  ]);
  
  const systemPrompt = buildSystemPrompt(
    relevantMemories,
    profile,
    currentMood,
    mcpResult || undefined
  );

  const contextMessages = recentHistory.length > 0
    ? recentHistory.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
    : messages;

  // Save user message async
  saveMemory(USER_ID, "user", latestMessage, currentMood, currentTopics);

  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...contextMessages,
      ...(recentHistory.length > 0 ? [{ role: "user" as const, content: latestMessage }] : []),
    ],
    stream: true,
    max_tokens: 450,
    temperature: 0.75,
  });

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          fullResponse += text;
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
      saveMemory(USER_ID, "assistant", fullResponse);
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}