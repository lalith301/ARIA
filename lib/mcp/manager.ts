import { detectMCPIntent, MCPIntent } from "./intent";
import { getCalendarEvents, createCalendarEvent } from "./calendar";
import { getEmails, sendEmail } from "./gmail";
import { searchDrive } from "./drive";
import { searchSpotify, getSpotifyRecommendations } from "./spotify";
import { getGitHubInfo } from "./github";
import { initWhatsApp, getWhatsAppMessages, sendWhatsAppMessage, isWhatsAppConnected } from "./whatsapp";
import { searchWeb, getWeather } from "../tools";

export async function runMCP(message: string, userMood?: string, userId?: string): Promise<string | null> {
  const intent: MCPIntent = detectMCPIntent(message);
  console.log("🔍 MCP Intent:", intent.tool, "| Action:", intent.action, "| Message:", message.slice(0, 50));

  if (!intent.tool) return null;

  try {
    switch (intent.tool) {

      case "calendar": {
        if (intent.action === "create") {
          const calledMatch = message.match(/(?:called|named|saying|titled)\s+["']?([^"']+?)["']?\s*(?:for|on|at|$)/i);
          const title = calledMatch?.[1]?.trim() || "Event";

          const dateMatch = message.match(/(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}(?:st|nd|rd|th)?|\d{4}-\d{2}-\d{2}|today|tomorrow)/i);
          const timeMatch = message.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);

          const now = new Date();
          let date = "";
          if (dateMatch) {
            const d = dateMatch[1].toLowerCase();
            if (d === "today") date = now.toISOString().split("T")[0];
            else if (d === "tomorrow") { now.setDate(now.getDate() + 1); date = now.toISOString().split("T")[0]; }
            else date = dateMatch[1];
          } else {
            return `I can create that reminder — what date should I schedule it for?`;
          }

          if (!timeMatch) {
            return `Got it! What time should I set "${title}" for?`;
          }

          const time = timeMatch[1];
          console.log("📋 Extracted:", { title, date, time });
          return await createCalendarEvent(title, date, time, 60, userId);
        }
        return await getCalendarEvents(message, userId);
      }

      case "gmail": {
        if (intent.action === "send") {
          const toMatch = message.match(/(?:to|email)\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
          if (!toMatch) return "Who do you want to send the email to? Please provide their email address.";
          const to = toMatch[1];
          const subject = "Message from ARIA";
          const bodyMatch = message.match(/(?:saying|that says|with|message)\s+(.+)/i);
          const body = bodyMatch?.[1] || message;
          return await sendEmail(to, subject, body, userId);
        }
        return await getEmails(message, userId);
      }

      case "drive": {
        return await searchDrive(message, userId);
      }

      case "spotify": {
        if (userMood && userMood !== "neutral") {
          return await getSpotifyRecommendations(userMood, userId);
        }
        return await searchSpotify(message, userId);
      }

      case "github": {
        return await getGitHubInfo(message);
      }

      case "whatsapp": {
        if (!isWhatsAppConnected()) {
          return await initWhatsApp();
        }
        if (intent.action === "send") {
          const toMatch = message.match(/(?:to|message|text)\s+([A-Za-z]+)/i);
          const to = toMatch?.[1] || "";
          if (!to) return "Who do you want to message on WhatsApp?";
          const bodyMatch = message.match(/(?:saying|that says|with|tell them)\s+(.+)/i);
          const body = bodyMatch?.[1] || message;
          return await sendWhatsAppMessage(to, body);
        }
        return await getWhatsAppMessages(message);
      }

      case "weather": {
        const locationMatch = message.match(/(?:in|at|for)\s+([A-Za-z\s,]+?)(?:\?|$)/i);
        const location = locationMatch?.[1]?.trim() || "current location";
        return await getWeather(location);
      }

      case "search": {
        return await searchWeb(message);
      }

      default:
        return null;
    }
  } catch (err: any) {
    console.error(`MCP error (${intent.tool}):`, err.message);
    return null;
  }
}