import { google } from "googleapis";
import { getGoogleAuth } from "./google-auth";

export async function getEmails(query: string, userId?: string): Promise<string> {
  try {
    const auth = await getGoogleAuth(userId);
    const gmail = google.gmail({ version: "v1", auth });

    const isUnread = query.toLowerCase().includes("unread");
    const q = isUnread ? "is:unread is:inbox" : "is:inbox";

    const response = await gmail.users.messages.list({
      userId: "me",
      q,
      maxResults: 5,
    });

    const messages = response.data.messages || [];
    if (messages.length === 0) return "No emails found.";

    const emails = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        });

        const headers = detail.data.payload?.headers || [];
        const subject = headers.find(h => h.name === "Subject")?.value || "No subject";
        const from = headers.find(h => h.name === "From")?.value || "Unknown";
        const fromName = from.split("<")[0].trim().replace(/"/g, "");

        return `• ${subject} — from ${fromName}`;
      })
    );

    return `${isUnread ? "Unread emails" : "Recent emails"} (subject lines only — I can't read full content):\n${emails.join("\n")}`;
  } catch (err: any) {
    console.error("Gmail error:", err.message);
    return "Could not fetch emails.";
  }
}

export async function sendEmail(to: string, subject: string, body: string, userId?: string): Promise<string> {
  try {
    const auth = await getGoogleAuth(userId);
    const gmail = google.gmail({ version: "v1", auth });

    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      body,
    ].join("\n");

    const encoded = Buffer.from(message).toString("base64url");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encoded },
    });

    return `Email sent to ${to}.`;
  } catch (err: any) {
    console.error("Send email error:", err.message);
    return "Could not send email.";
  }
}