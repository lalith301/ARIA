export default function Landing() {
    return (
      <div style={{
        width: "100vw", minHeight: "100vh",
        background: "#09090b",
        fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
        color: "rgba(255,255,255,0.85)",
        overflowX: "hidden",
      }}>
  
        {/* Nav */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "18px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", background: "rgba(9,9,11,0.8)", zIndex: 10 }}>
          <span style={{ fontSize: 13, letterSpacing: 6, fontFamily: "monospace", color: "rgba(255,255,255,0.5)" }}>ARIA</span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a href="/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: 1 }}>Privacy</a>
            <a href="/login" style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", textDecoration: "none", letterSpacing: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 20px" }}>
              Sign In
            </a>
          </div>
        </nav>
  
        {/* Hero */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: "80px 24px 40px" }}>
  
          {/* Glowing orb */}
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.6)", margin: "0 auto 40px", boxShadow: "0 0 30px 8px rgba(255,255,255,0.15)", animation: "pulse 2.5s ease-in-out infinite" }} />
  
          <h1 style={{ fontSize: "clamp(56px, 10vw, 110px)", fontWeight: 200, letterSpacing: 20, margin: "0 0 12px", color: "rgba(255,255,255,0.95)", lineHeight: 1 }}>ARIA</h1>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", letterSpacing: 6, marginBottom: 40, fontFamily: "monospace" }}>ADAPTIVE REALTIME INTELLIGENCE AGENT</p>
  
          <p style={{ fontSize: "clamp(16px, 2.5vw, 22px)", color: "rgba(255,255,255,0.4)", maxWidth: 560, lineHeight: 1.8, marginBottom: 16, fontWeight: 300 }}>
            Your always-available AI companion.
          </p>
          <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "rgba(255,255,255,0.25)", maxWidth: 480, lineHeight: 1.8, marginBottom: 56, fontWeight: 300 }}>
            Talk, listen, think things through — ARIA remembers you and connects to the tools you use every day.
          </p>
  
          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 80 }}>
            <a href="/login" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "16px 48px", fontSize: 13, letterSpacing: 2, textDecoration: "none", fontWeight: 400 }}>
              GET STARTED FREE
            </a>
            <a href="/login" style={{ background: "transparent", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 32px", fontSize: 13, letterSpacing: 2, textDecoration: "none" }}>
              SIGN IN
            </a>
          </div>
  
          {/* Feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, maxWidth: 900, width: "100%", marginBottom: 80 }}>
            {[
              { icon: "◎", title: "Remembers You", desc: "Tracks your preferences, mood patterns, and past conversations across sessions" },
              { icon: "◈", title: "Your Integrations", desc: "Google Calendar, Gmail, Drive, Spotify, GitHub — all in one place" },
              { icon: "◉", title: "3D Avatar", desc: "A lifelike AI companion with real-time lip sync and natural expressions" },
              { icon: "◐", title: "Voice + Text", desc: "Talk naturally with voice input and natural speech synthesis output" },
              { icon: "◑", title: "Web Search", desc: "Always up to date with real-time search for current news and information" },
              { icon: "◒", title: "Mood Aware", desc: "Detects how you're feeling and adapts its tone to match your energy" },
            ].map((f, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px", textAlign: "left" }}>
                <div style={{ fontSize: 22, marginBottom: 12, color: "rgba(255,255,255,0.3)" }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 400, marginBottom: 8, color: "rgba(255,255,255,0.7)", letterSpacing: 0.5 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
  
          {/* Bottom CTA */}
          <div style={{ textAlign: "center", padding: "48px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", width: "100%", maxWidth: 600 }}>
            <p style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", marginBottom: 32, fontWeight: 300 }}>Ready to meet ARIA?</p>
            <a href="/login" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "16px 52px", fontSize: 13, letterSpacing: 2, textDecoration: "none", display: "inline-block" }}>
              BEGIN SESSION
            </a>
          </div>
  
        </div>
  
        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "24px", borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "monospace", letterSpacing: 2 }}>
          <div style={{ marginBottom: 10, display: "flex", gap: 24, justifyContent: "center" }}>
            <a href="/privacy" style={{ color: "rgba(255,255,255,0.15)", textDecoration: "none" }}>PRIVACY POLICY</a>
            <a href="mailto:lalith300104@gmail.com" style={{ color: "rgba(255,255,255,0.15)", textDecoration: "none" }}>CONTACT</a>
          </div>
          © 2026 ARIA
        </footer>
  
        <style>{`
          @keyframes pulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
          a:hover { opacity: 0.75 !important; transition: opacity 0.2s; }
        `}</style>
      </div>
    );
  }