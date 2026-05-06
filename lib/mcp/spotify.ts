import SpotifyWebApi from "spotify-web-api-node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

let spotifyApi: SpotifyWebApi | null = null;
let tokenExpiry = 0;

function getSpotifyClient(): SpotifyWebApi {
  if (!spotifyApi) {
    spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });
  }
  return spotifyApi;
}

async function ensureToken(userId?: string): Promise<void> {
  // Try per-user token first
  if (userId) {
    try {
      const { data } = await supabase
        .from("user_integrations")
        .select("access_token, expires_at")
        .eq("user_id", userId)
        .eq("provider", "spotify")
        .single();

      if (data?.access_token) {
        const api = getSpotifyClient();
        api.setAccessToken(data.access_token);
        return;
      }
    } catch {}
  }

  // Fallback to client credentials
  if (Date.now() < tokenExpiry) return;
  const api = getSpotifyClient();
  const data = await api.clientCredentialsGrant();
  api.setAccessToken(data.body.access_token);
  tokenExpiry = Date.now() + (data.body.expires_in - 60) * 1000;
}

// Mood → search query mapping
const MOOD_QUERIES: Record<string, string> = {
  stressed: "calm relaxing stress relief",
  sad: "uplifting happy feel good",
  happy: "happy upbeat party",
  angry: "calm meditation peace",
  tired: "energizing morning coffee",
  curious: "focus concentration study",
  neutral: "popular hits today",
  working: "focus deep work concentration",
  sleeping: "sleep music ambient",
  workout: "workout gym motivation",
};

export async function searchSpotify(query: string, userId?: string): Promise<string> {
  try {
    await ensureToken(userId);
    const api = getSpotifyClient();

    // Detect mood from query
    const lower = query.toLowerCase();
    let searchQuery = query;

    for (const [mood, moodQuery] of Object.entries(MOOD_QUERIES)) {
      if (lower.includes(mood)) {
        searchQuery = moodQuery;
        break;
      }
    }

    // Search for tracks
    const result = await api.searchTracks(searchQuery, { limit: 5 });
    const tracks = result.body.tracks?.items || [];

    if (tracks.length === 0) return "No tracks found on Spotify.";

    const formatted = tracks.map(track => {
      const artists = track.artists.map(a => a.name).join(", ");
      return `• ${track.name} — ${artists}`;
    }).join("\n");

    const topTrack = tracks[0];
    const webUrl = `https://open.spotify.com/search/${encodeURIComponent(topTrack.name)}`;

    return `Found on Spotify:\n${formatted}\n\n[SPOTIFY_OPEN:${webUrl}]`;
  } catch (err: any) {
    console.error("Spotify search error:", err.message);
    return "Could not search Spotify.";
  }
}

export async function getSpotifyRecommendations(mood: string, userId?: string): Promise<string> {
  try {
    await ensureToken(userId);
    const api = getSpotifyClient();

    const moodQuery = MOOD_QUERIES[mood] || MOOD_QUERIES.neutral;
    const result = await api.searchTracks(moodQuery, { limit: 3 });
    const tracks = result.body.tracks?.items || [];

    if (tracks.length === 0) return "Could not get recommendations.";

    const formatted = tracks.map(t => `• ${t.name} — ${t.artists[0].name}`).join("\n");
    const topTrack = tracks[0];
    const spotifyUri = `spotify:search:${encodeURIComponent(topTrack.name + " " + topTrack.artists[0].name)}`;
    const webUrl = spotifyUri;
    return `Based on your mood, you might enjoy:\n${formatted}\n[SPOTIFY_OPEN:${webUrl}]`;
  } catch (err: any) {
    console.error("Spotify recommendations error:", err.message);
    return "Could not get Spotify recommendations.";
  }
}

export async function getCurrentlyPlaying(): Promise<string> {
  try {
    return "To control Spotify playback, open the Spotify app directly. I can search for music and recommend tracks for you!";
  } catch (err: any) {
    return "Could not get currently playing track.";
  }
}