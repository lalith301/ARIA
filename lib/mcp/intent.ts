export type MCPTool =
  | "calendar"
  | "gmail"
  | "drive"
  | "spotify"
  | "github"
  | "whatsapp"
  | "search"
  | "weather"
  | null;

export interface MCPIntent {
  tool: MCPTool;
  query: string;
  action?: string;
}

export function detectMCPIntent(message: string): MCPIntent {
  const lower = message.toLowerCase();

  // ─── Calendar ────────────────────────────────────────────────────────────────
  if (
    lower.match(/\b(calendar|schedule|meeting|appointment|event|reminder|remind|what.s on|my day|today|tomorrow|this week)\b/) &&
    !lower.includes("weather")
  ) {
    const isCreate = lower.match(/\b(add|create|schedule|set up|book|set a|set an|remind|reminder)\b/);
    return { tool: "calendar", query: message, action: isCreate ? "create" : "read" };
  }

  // ─── Gmail ───────────────────────────────────────────────────────────────────
  if (lower.match(/\b(email|mail|inbox|unread|message from|reply to|send.*email|check.*mail)\b/)) {
    const isSend = lower.match(/\b(send|reply|write|draft|compose)\b/);
    return { tool: "gmail", query: message, action: isSend ? "send" : "read" };
  }

  // ─── Google Drive ────────────────────────────────────────────────────────────
  if (lower.match(/\b(drive|document|doc|file|spreadsheet|find.*file|my files)\b/)) {
    return { tool: "drive", query: message, action: "search" };
  }

  // ─── Spotify ─────────────────────────────────────────────────────────────────
  if (
    lower.match(/\b(play|music|song|spotify|playlist|track|artist|album|listen)\b/) ||
    lower.match(/\b(something (calm|relaxing|upbeat|energizing|focus|happy|sad))\b/)
  ) {
    return { tool: "spotify", query: message, action: "play" };
  }

  // ─── GitHub ──────────────────────────────────────────────────────────────────
  if (lower.match(/\b(github|repo|repository|pull request|pr|issue|commit|code|branch)\b/)) {
    return { tool: "github", query: message, action: "read" };
  }

  // ─── WhatsApp ────────────────────────────────────────────────────────────────
  if (false && lower.match(/\b(whatsapp)\b/)) { // disabled — coming soon
    const isSend = lower.match(/\b(send|text|message)\b/);
    return { tool: "whatsapp", query: message, action: isSend ? "send" : "read" };
  }

  // ─── Weather ─────────────────────────────────────────────────────────────────
  if (lower.match(/\b(weather|temperature|rain|sunny|forecast|humidity|wind)\b/)) {
    return { tool: "weather", query: message };
  }

  // ─── Web Search ──────────────────────────────────────────────────────────────
  if (
    lower.match(/\b(search|look up|find|what is|who is|latest|news|current|today.s|price|stock)\b/) ||
    lower.match(/\b(how to|when did|where is|why is|who are)\b/)
  ) {
    return { tool: "search", query: message };
  }

  return { tool: null, query: message };
}