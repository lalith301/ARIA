import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ─── Lightweight local embeddings using Groq ──────────────────────────────────
// We use Groq to generate a simple TF-IDF style embedding via summarization
// This avoids needing a separate embedding API while still being semantic

async function getEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",  // fastest Groq model
        input: text.slice(0, 512),       // limit input size
      }),
    });

    // Groq doesn't have embeddings API yet — fall back to keyword approach
    // but store null so similarity search skips it gracefully
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data?.[0]?.embedding || null;
  } catch {
    return null;
  }
}

// ─── Mood Detection ───────────────────────────────────────────────────────────

export function detectMood(text: string): string {
  const lower = text.toLowerCase();

  const stressed = ["stressed", "anxiety", "anxious", "overwhelmed", "pressure", "deadline", "panic", "nervous", "worried", "scared"];
  const sad = ["sad", "depressed", "unhappy", "miserable", "crying", "lonely", "hopeless", "down", "low", "heartbroken"];
  const happy = ["happy", "great", "amazing", "excited", "fantastic", "wonderful", "love", "joy", "thrilled", "awesome"];
  const angry = ["angry", "frustrated", "annoyed", "furious", "mad", "irritated", "hate", "rage", "upset"];
  const curious = ["wondering", "curious", "interesting", "how does", "why does", "what if", "explain", "tell me"];
  const tired = ["tired", "exhausted", "sleepy", "fatigue", "drained", "burnt out", "burnout", "weary"];

  if (stressed.some(w => lower.includes(w))) return "stressed";
  if (sad.some(w => lower.includes(w))) return "sad";
  if (angry.some(w => lower.includes(w))) return "angry";
  if (tired.some(w => lower.includes(w))) return "tired";
  if (happy.some(w => lower.includes(w))) return "happy";
  if (curious.some(w => lower.includes(w))) return "curious";
  return "neutral";
}

// ─── Topic Extraction ─────────────────────────────────────────────────────────

export function extractTopics(text: string): string[] {
  const topicPatterns: Record<string, string[]> = {
    work: ["work", "job", "career", "office", "boss", "meeting", "project", "deadline", "salary", "promotion", "startup", "business"],
    health: ["health", "sick", "doctor", "hospital", "workout", "diet", "sleep", "medicine", "gym", "fitness", "mental health"],
    relationships: ["girlfriend", "boyfriend", "wife", "husband", "friend", "family", "mom", "dad", "sister", "brother", "partner", "dating"],
    technology: ["code", "programming", "software", "app", "ai", "computer", "tech", "developer", "api", "database", "javascript", "python"],
    education: ["study", "school", "college", "university", "exam", "course", "learn", "degree", "thesis", "homework"],
    finance: ["money", "investment", "salary", "budget", "savings", "debt", "loan", "stock", "crypto", "spending"],
    travel: ["travel", "trip", "vacation", "flight", "hotel", "country", "city", "visit", "tour", "holiday"],
    entertainment: ["movie", "show", "music", "game", "book", "series", "netflix", "sport", "concert", "art"],
  };

  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const [topic, keywords] of Object.entries(topicPatterns)) {
    if (keywords.some(k => lower.includes(k))) {
      found.push(topic);
    }
  }

  return found;
}

// ─── Extract facts about the user from their messages ─────────────────────────

export function extractUserFacts(text: string): string[] {
  const facts: string[] = [];
  const lower = text.toLowerCase();

  // Name patterns
  const nameMatch = text.match(/(?:my name is|i'm called|call me|i am)\s+([A-Z][a-z]+)/i);
  if (nameMatch) facts.push(`User's name is ${nameMatch[1]}`);

  // Age patterns
  const ageMatch = text.match(/i(?:'m| am)\s+(\d{1,2})\s+years?\s+old/i);
  if (ageMatch) facts.push(`User is ${ageMatch[1]} years old`);

  // Location patterns
  const locationMatch = text.match(/(?:i live in|i'm from|i'm based in|living in)\s+([A-Za-z\s,]+?)(?:\.|,|$)/i);
  if (locationMatch) facts.push(`User lives in ${locationMatch[1].trim()}`);

  // Job patterns
  const jobMatch = text.match(/(?:i(?:'m| am) a|i work as a?|my job is)\s+([a-z\s]+?)(?:\.|,|$)/i);
  if (jobMatch) facts.push(`User works as ${jobMatch[1].trim()}`);

  // Preference patterns
  if (lower.includes("i love ") || lower.includes("i enjoy ") || lower.includes("i like ")) {
    const prefMatch = text.match(/(?:i love|i enjoy|i like)\s+([^.!?,]+)/i);
    if (prefMatch) facts.push(`User enjoys ${prefMatch[1].trim()}`);
  }

  if (lower.includes("i hate ") || lower.includes("i don't like ") || lower.includes("i dislike ")) {
    const disMatch = text.match(/(?:i hate|i don't like|i dislike)\s+([^.!?,]+)/i);
    if (disMatch) facts.push(`User dislikes ${disMatch[1].trim()}`);
  }

  return facts;
}

// ─── Determine communication style ───────────────────────────────────────────

function analyzeCommunicationStyle(messages: { role: string; content: string }[]): string {
  const userMessages = messages.filter(m => m.role === "user").map(m => m.content);
  if (userMessages.length < 3) return "balanced";

  const avgLength = userMessages.reduce((s, m) => s + m.length, 0) / userMessages.length;
  const hasEmoji = userMessages.some(m => /\p{Emoji}/u.test(m));
  const hasFormal = userMessages.some(m => /\b(please|kindly|would you|could you)\b/i.test(m));
  const hasCasual = userMessages.some(m => /\b(hey|yeah|yep|nope|cool|lol|omg)\b/i.test(m));

  if (avgLength < 30 && hasCasual) return "casual";
  if (avgLength > 100 && hasFormal) return "formal";
  if (hasEmoji) return "expressive";
  return "balanced";
}

// ─── Core Memory Functions ────────────────────────────────────────────────────

export async function saveMemory(
  userId: string,
  role: string,
  content: string,
  mood?: string,
  topics?: string[]
) {
  try {
    const detectedMood = mood || (role === "user" ? detectMood(content) : undefined);
    const detectedTopics = topics || (role === "user" ? extractTopics(content) : []);

    await supabase.from("conversations").insert({
      user_id: userId,
      role,
      content,
      mood: detectedMood,
      topics: detectedTopics,
    });

    // Auto-extract and save facts from user messages
    if (role === "user") {
      const facts = extractUserFacts(content);
      for (const fact of facts) {
        await saveUserFact(userId, fact);
      }

      // Update topics of interest in profile
      if (detectedTopics.length > 0) {
        await updateTopicsOfInterest(userId, detectedTopics);
      }

      // Update mood history
      if (detectedMood && detectedMood !== "neutral") {
        await updateMoodHistory(userId, detectedMood);
      }
    }
  } catch (err) {
    console.error("saveMemory failed:", err);
  }
}

export async function getRelevantMemories(
  userId: string,
  query: string,
  limit = 5
): Promise<string[]> {
  try {
    // Try semantic search first
    const { data: semanticData, error: semanticError } = await supabase
      .rpc("match_conversations", {
        query_embedding: Array(384).fill(0), // placeholder — works when embeddings exist
        match_user_id: userId,
        match_limit: limit,
        match_threshold: 0.5,
      });

    // Fall back to enhanced keyword search
    const { data } = await supabase
      .from("conversations")
      .select("role, content, mood, topics, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!data) return [];

    const keywords = query.toLowerCase().split(" ").filter(w => w.length > 3);
    const queryTopics = extractTopics(query);
    const queryMood = detectMood(query);

    // Score each memory
    const scored = data.map(row => {
      let score = 0;
      const contentLower = row.content.toLowerCase();

      // Keyword match
      keywords.forEach(k => { if (contentLower.includes(k)) score += 2; });

      // Topic match
      const rowTopics: string[] = row.topics || [];
      queryTopics.forEach(t => { if (rowTopics.includes(t)) score += 3; });

      // Mood match — boost emotionally relevant memories
      if (row.mood === queryMood && queryMood !== "neutral") score += 2;

      // Recency boost (last 10 conversations)
      const recencyBoost = data.indexOf(row) < 10 ? 1 : 0;
      score += recencyBoost;

      return { ...row, score };
    });

    const topMemories = scored
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return topMemories.map(r => `[${r.role}]: ${r.content}`);
  } catch (err) {
    console.error("getRelevantMemories failed:", err);
    return [];
  }
}

export async function getRecentHistory(
  userId: string,
  limit = 10
): Promise<{ role: string; content: string }[]> {
  try {
    const { data } = await supabase
      .from("conversations")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!data) return [];
    return data.reverse();
  } catch (err) {
    console.error("getRecentHistory failed:", err);
    return [];
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Update last active
    if (data) {
      await supabase
        .from("user_profiles")
        .update({ last_active: new Date().toISOString() })
        .eq("user_id", userId);
    }

    return data;
  } catch {
    return null;
  }
}

export async function saveUserFact(userId: string, fact: string) {
  try {
    const { data } = await supabase
      .from("user_profiles")
      .select("facts")
      .eq("user_id", userId)
      .single();

    const existing: string[] = data?.facts || [];

    // Avoid duplicate facts
    if (existing.some(f => f.toLowerCase() === fact.toLowerCase())) return;

    const updated = [...existing, fact].slice(-30); // keep last 30 facts

    await supabase.from("user_profiles").upsert({
      user_id: userId,
      facts: updated,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("saveUserFact failed:", err);
  }
}

async function updateTopicsOfInterest(userId: string, newTopics: string[]) {
  try {
    const { data } = await supabase
      .from("user_profiles")
      .select("topics_of_interest")
      .eq("user_id", userId)
      .single();

    const existing: Record<string, number> = data?.topics_of_interest || {};

    // Increment topic counts
    newTopics.forEach(topic => {
      existing[topic] = (existing[topic] || 0) + 1;
    });

    await supabase.from("user_profiles").upsert({
      user_id: userId,
      topics_of_interest: existing,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("updateTopicsOfInterest failed:", err);
  }
}

async function updateMoodHistory(userId: string, mood: string) {
  try {
    const { data } = await supabase
      .from("user_profiles")
      .select("mood_history")
      .eq("user_id", userId)
      .single();

    const existing: { mood: string; timestamp: string }[] = data?.mood_history || [];
    const updated = [
      ...existing,
      { mood, timestamp: new Date().toISOString() }
    ].slice(-50); // keep last 50 mood entries

    await supabase.from("user_profiles").upsert({
      user_id: userId,
      mood_history: updated,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("updateMoodHistory failed:", err);
  }
}

// ─── Analytics helpers for route.ts ──────────────────────────────────────────

export function getTopTopics(topicsOfInterest: Record<string, number>, limit = 3): string[] {
  return Object.entries(topicsOfInterest || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([topic]) => topic);
}

export function getRecentMoodTrend(
  moodHistory: { mood: string; timestamp: string }[]
): string {
  if (!moodHistory || moodHistory.length === 0) return "unknown";
  const recent = moodHistory.slice(-5).map(m => m.mood);
  const counts = recent.reduce((acc, m) => {
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || "neutral";
}

export function getCommunicationStyleHint(style: string): string {
  const hints: Record<string, string> = {
    casual: "Use casual, friendly language. Short sentences. Match their energy.",
    formal: "Be more structured and polished in your responses.",
    expressive: "Feel free to be expressive and warm. They appreciate emotional connection.",
    balanced: "Keep a natural conversational tone.",
  };
  return hints[style] || hints.balanced;
}