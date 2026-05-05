export default function Privacy() {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px", fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", color: "rgba(255,255,255,0.8)", background: "#09090b", minHeight: "100vh" }}>
        <div style={{ marginBottom: 48 }}>
          <a href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: 4, fontFamily: "monospace" }}>← ARIA</a>
        </div>
  
        <h1 style={{ fontSize: 32, fontWeight: 300, letterSpacing: 2, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 48, fontFamily: "monospace" }}>Last updated: May 2026</p>
  
        <div style={{ display: "flex", flexDirection: "column", gap: 36, lineHeight: 1.8, fontSize: 15 }}>
  
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.9)", marginBottom: 12, letterSpacing: 1 }}>1. Overview</h2>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>ARIA (Adaptive Realtime Intelligence Agent) is an AI companion application. This Privacy Policy explains how we collect, use, and protect your information when you use ARIA at aria-mocha-nine.vercel.app.</p>
          </section>
  
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.9)", marginBottom: 12, letterSpacing: 1 }}>2. Information We Collect</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>We collect the following types of information:</p>
            <ul style={{ color: "rgba(255,255,255,0.5)", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong style={{ color: "rgba(255,255,255,0.7)" }}>Account information</strong> — your email address used to sign in via Supabase Auth</li>
              <li><strong style={{ color: "rgba(255,255,255,0.7)" }}>Conversation history</strong> — messages you send to ARIA, stored to provide memory and context</li>
              <li><strong style={{ color: "rgba(255,255,255,0.7)" }}>User profile data</strong> — preferences, mood trends, and topics of interest derived from conversations</li>
              <li><strong style={{ color: "rgba(255,255,255,0.7)" }}>Google account data</strong> — if you connect Google, we access your Calendar, Gmail, and Drive with your explicit permission</li>
              <li><strong style={{ color: "rgba(255,255,255,0.7)" }}>Spotify data</strong> — if you connect Spotify, we access your music preferences and playback state</li>
            </ul>
          </section>
  
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.9)", marginBottom: 12, letterSpacing: 1 }}>3. How We Use Your Information</h2>
            <ul style={{ color: "rgba(255,255,255,0.5)", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>To provide personalized AI companion responses</li>
              <li>To remember your preferences and past conversations</li>
              <li>To connect to third-party services (Google, Spotify) on your behalf</li>
              <li>To improve the quality and relevance of ARIA's responses</li>
            </ul>
          </section>
  
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.9)", marginBottom: 12, letterSpacing: 1 }}>4. Google API Services</h2>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>ARIA's use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" style={{ color: "rgba(255,255,255,0.6)" }} target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements. We only access Google data that you explicitly authorize, and we do not sell or share your Google data with third parties.</p>
          </section>
  
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.9)", marginBottom: 12, letterSpacing: 1 }}>5. Data Storage</h2>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>Your data is stored securely in Supabase (PostgreSQL database) with row-level security enabled. OAuth tokens for Google and Spotify are encrypted and stored only for the purpose of accessing those services on your behalf.</p>
          </section>
  
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.9)", marginBottom: 12, letterSpacing: 1 }}>6. Data Sharing</h2>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>We do not sell your personal data. We do not share your data with third parties except:</p>
            <ul style={{ color: "rgba(255,255,255,0.5)", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              <li>Groq — for AI language model inference (your messages are sent to Groq's API)</li>
              <li>Google — when you connect your Google account</li>
              <li>Spotify — when you connect your Spotify account</li>
              <li>Supabase — for database and authentication services</li>
            </ul>
          </section>
  
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.9)", marginBottom: 12, letterSpacing: 1 }}>7. Your Rights</h2>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>You have the right to access, correct, or delete your personal data at any time. You can disconnect Google or Spotify integrations at any time through the apps panel in ARIA. To request deletion of all your data, contact us at the email below.</p>
          </section>
  
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.9)", marginBottom: 12, letterSpacing: 1 }}>8. Cookies</h2>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>ARIA uses cookies only for authentication purposes (Supabase session management). We do not use tracking or advertising cookies.</p>
          </section>
  
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.9)", marginBottom: 12, letterSpacing: 1 }}>9. Changes to This Policy</h2>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the date at the top of this page.</p>
          </section>
  
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.9)", marginBottom: 12, letterSpacing: 1 }}>10. Contact</h2>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:lalith300104@gmail.com" style={{ color: "rgba(255,255,255,0.6)" }}>lalith300104@gmail.com</a></p>
          </section>
  
        </div>
  
        <div style={{ marginTop: 64, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: 2 }}>
          ARIA — ADAPTIVE REALTIME INTELLIGENCE AGENT
        </div>
      </div>
    );
  }