import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
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
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/?error=no_code", req.url));

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${req.nextUrl.origin}/auth/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    // Save to user_integrations
    await supabase.from("user_integrations").upsert({
      user_id: user.id,
      provider: "google",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      scope: tokens.scope,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider" });

    console.log("✅ Google OAuth saved for user:", user.id);
    return NextResponse.redirect(new URL("/?connected=google", req.url));
  } catch (err: any) {
    console.error("Google OAuth callback error:", err.message);
    return NextResponse.redirect(new URL("/?error=google_auth_failed", req.url));
  }
}