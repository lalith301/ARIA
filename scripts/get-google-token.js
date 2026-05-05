/**
 * ARIA — Google OAuth Refresh Token Generator
 * Run: node scripts/get-google-token.js
 * Then visit the URL shown, authorize, and paste the code back
 */

const { google } = require("googleapis");
const readline = require("readline");

// ─── PASTE YOUR CREDENTIALS HERE ─────────────────────────────────────────────
const CLIENT_ID = "366528229366-gcrk2rt8gflfepm4d8q5vjm9s7o6g67c.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:3000/auth/google/callback";
// ─────────────────────────────────────────────────────────────────────────────

// Scopes — Calendar + Gmail + Drive
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.file",
];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent", // force refresh token
});

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  ARIA — Google OAuth Setup");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
console.log("1. Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n2. Authorize with your Google account");
console.log("3. You'll be redirected to localhost (may show error — that's ok!)");
console.log("4. Copy the 'code' parameter from the URL");
console.log("   Example: http://localhost:3000/auth/google/callback?code=COPY_THIS&scope=...\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Paste the code here: ", async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  ✅ Success! Add these to your .env.local:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GOOGLE_REDIRECT_URI=${REDIRECT_URI}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (err) {
    console.error("❌ Error getting token:", err.message);
    console.log("Make sure you copied the full code from the URL!");
  }
});