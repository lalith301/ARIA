export default function Landing() {
    return (
      <div style={{
        position: "relative", width: "100vw", minHeight: "100vh",
        background: "#09090b", fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
        color: "rgba(255,255,255,0.85)", overflow: "hidden"
      }}>
        {/* Background gradient */}
        <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)", pointerEvents: "none" }} />
  
        {/* Nav */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", zIndex: 10 }}>
          <span style={{ fontSize: 14, letterSpacing: 6, fontFamily: "monospace", color: "rgba(255,255,255,0.5)" }}>ARIA</span>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: 1 }}>Privacy</a>
            <a href="/login" style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textDecoration: "none", letterSpacing: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 18px" }}>Sign In</a>
          </div>
        </nav>
  
        {/* Hero */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: "0 24px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)", margin: "0 auto 40px", boxShadow: "0 0 20px rgba(255,255,255,0.2)", animation: "pulse 2s ease-in-out infinite" }} />
  
          <h1 style={{ fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 200, letterSpacing: 16, margin: "0 0 12px", color: "rgba(255,255,255,0.95)" }}>ARIA</h1>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: 6, marginBottom: 40, fontFamily: "monospace" }}>ADAPTIVE REALTIME INTELLIGENCE AGENT</p>
  
          <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "rgba(255,255,255,0.4)", maxWidth: 520, lineHeight: 1.8, marginBottom: 56, fontWeight: 300 }}>
            Your always-available AI companion. Talk, listen, think things through — ARIA remembers you and connects to the tools you use every day.
          </p>
  
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="/login" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "14px 40px", fontSize: 13, letterSpacing: 2, textDecoration: "none", transition: "all 0.2s" }}>
              GET STARTED
            </a>
            <a href="/privacy" style={{ background: "transparent", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 40px", fontSize: 13, letterSpacing: 2, textDecoration: "none" }}>
              PRIVACY POLICY
            </a>
          </div>
  
          {/* Features */}
          <div style={{ display: "flex", gap: 24, marginTop: 96, flexWrap: "wrap", justifyContent: "center", maxWidth: 800 }}>
            {[
              { icon: "◎", title: "Memory", desc: "Remembers your preferences, mood patterns, and past conversations" },
              { icon: "◈", title: "Integrations", desc: "Connects to Google Calendar, Gmail, Drive, Spotify and GitHub" },
              { icon: "◉", title: "3D Avatar", desc: "A lifelike AI companion with real-time lip sync and expressions" },
              { icon: "◐", title: "Voice", desc: "Talk naturally with voice input and speech synthesis output" },
            ].map((f, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px 28px", maxWidth: 180, textAlign: "left" }}>
                <div style={{ fontSize: 20, marginBottom: 12, color: "rgba(255,255,255,0.4)" }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 400, marginBottom: 8, color: "rgba(255,255,255,0.7)", letterSpacing: 1 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "32px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: 2 }}>
          <div style={{ marginBottom: 12 }}>
            <a href="/privacy" style={{ color: "rgba(255,255,255,0.2)", textDecoration: "none", marginRight: 24 }}>PRIVACY POLICY</a>
            <a href="mailto:lalith300104@gmail.com" style={{ color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>CONTACT</a>
          </div>
          © 2026 ARIA — ADAPTIVE REALTIME INTELLIGENCE AGENT
        </footer>
  
        <style>{`
          @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
          a:hover { opacity: 0.8; }
        `}</style>
      </div>
    );
  }