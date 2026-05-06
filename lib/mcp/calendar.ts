import { google } from "googleapis";
import { getGoogleAuth } from "./google-auth";

export async function getCalendarEvents(query: string, userId?: string): Promise<string> {
  try {
    const auth = await getGoogleAuth(userId);
    const calendar = google.calendar({ version: "v3", auth });

    const now = new Date();
    const isWeek = query.toLowerCase().includes("week");
    const isTomorrow = query.toLowerCase().includes("tomorrow");

    let timeMin = now.toISOString();
    let timeMax = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    if (isWeek) {
      timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (isTomorrow) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      timeMin = tomorrow.toISOString();
      timeMax = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    if (events.length === 0) {
      return isWeek ? "No events this week." : isTomorrow ? "Nothing scheduled for tomorrow." : "No events today.";
    }

    const formatted = events.map(event => {
      const start = event.start?.dateTime || event.start?.date || "";
      const time = start ? new Date(start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "All day";
      const date = start ? new Date(start).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "Asia/Kolkata" }) : "";
      return `• ${event.summary || "Untitled"} — ${date} at ${time}`;
    }).join("\n");

    return `Calendar events:\n${formatted}`;
  } catch (err: any) {
    console.error("Calendar error:", err.message);
    return "Could not fetch calendar events. Make sure Google is connected.";
  }
}

export async function createCalendarEvent(title: string, date: string, time: string, duration = 60, userId?: string): Promise<string> {
  try {
    const auth = await getGoogleAuth(userId);
    const calendar = google.calendar({ version: "v3", auth });

    console.log("🗓️ Creating event:", { title, date, time });

    // Parse time — handle "10 AM", "10:00 AM", "10:30 PM"
    const timeClean = time.trim().toUpperCase();
    const timeMatch = timeClean.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/);
    let hours = timeMatch ? parseInt(timeMatch[1]) : 10;
    const minutes = timeMatch?.[2] ? parseInt(timeMatch[2]) : 0;
    const isPM = timeMatch?.[3] === "PM";
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    // Parse date — handle "2026-05-03", "May 3", "3rd May"
    let startDate: Date;
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      startDate = new Date(date);
    } else {
      // Remove ordinal suffixes: 5th→5, 3rd→3, 1st→1, 2nd→2
      const cleanDate = date.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
      startDate = new Date(`${cleanDate} ${new Date().getFullYear()}`);
    }
    startDate.setHours(hours, minutes, 0, 0);

    console.log("📅 Parsed start:", startDate.toISOString());

    if (isNaN(startDate.getTime())) {
      return "I couldn't parse that date and time. Try saying something like 'May 3rd at 10 AM'.";
    }

    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: title,
        start: { dateTime: startDate.toISOString(), timeZone: "Asia/Kolkata" },
        end: { dateTime: endDate.toISOString() , timeZone: "Asia/Kolkata"},
      },
    });

    return `✅ Created "${title}" on ${startDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}.`;
  } catch (err: any) {
    console.error("❌ Create event error:", err.message);
    return `Could not create calendar event: ${err.message}`;
  }
}