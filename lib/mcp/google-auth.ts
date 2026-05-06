import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function getGoogleAuth(userId?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Try per-user token first
  if (userId) {
    try {
      const { data } = await supabase
        .from("user_integrations")
        .select("access_token, refresh_token, expires_at")
        .eq("user_id", userId)
        .eq("provider", "google")
        .single();

        if (data?.refresh_token) {
          oauth2Client.setCredentials({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expiry_date: data.expires_at ? new Date(data.expires_at).getTime() : undefined,
          });
        
          // Force refresh if token is expired
          const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
          if (isExpired) {
            console.log("🔄 Google token expired, refreshing...");
            const { credentials } = await oauth2Client.refreshAccessToken();
            // Save new token to Supabase
            await supabase.from("user_integrations").upsert({
              user_id: userId,
              provider: "google",
              access_token: credentials.access_token,
              refresh_token: credentials.refresh_token || data.refresh_token,
              expires_at: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id,provider" });
          }

        // Auto-refresh and save new token if expired
        oauth2Client.on("tokens", async (tokens) => {
          if (tokens.refresh_token || tokens.access_token) {
            await supabase.from("user_integrations").upsert({
              user_id: userId,
              provider: "google",
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token || data.refresh_token,
              expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id,provider" });
          }
        });

        return oauth2Client;
      }
    } catch (err) {
      console.warn("No per-user Google token, using default");
    }
  }

  // Fallback to env refresh token (developer account)
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return oauth2Client;
}

// Generate Google OAuth URL for a user
export function getGoogleAuthUrl(userId: string, origin: string): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${origin}/auth/google/callback`
  );

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.file",
    ],
    prompt: "consent",
    state: userId,
  });
}

// Generate Spotify OAuth URL for a user
export function getSpotifyAuthUrl(origin: string): string {
  const scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "streaming",
    "playlist-read-private",
    "user-library-read",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: `${origin}/auth/spotify/callback`,
    scope: scopes,
  });

  return `https://accounts.spotify.com/authorize?${params}`;
}