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
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "18px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", background: "rgba(9,9,11,0.85)", zIndex: 10 }}>
          <span style={{ fontSize: 13, letterSpacing: 6, fontFamily: "monospace", color: "rgba(255,255,255,0.5)" }}>ARIA</span>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textDecoration: "none", letterSpacing: 1 }}>Privacy</a>
            <a href="/login" style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", textDecoration: "none", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 18px", letterSpacing: 1 }}>Sign In</a>
          </div>
        </nav>
  
        {/* Hero Section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: "100px 24px 60px" }}>
  
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.6)", margin: "0 auto 48px", boxShadow: "0 0 40px 10px rgba(255,255,255,0.12)", animation: "pulse 2.5s ease-in-out infinite" }} />
  
          <h1 style={{ fontSize: "clamp(60px, 12vw, 120px)", fontWeight: 200, letterSpacing: 20, margin: "0 0 16px", color: "rgba(255,255,255,0.95)", lineHeight: 1 }}>ARIA</h1>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: 6, marginBottom: 48, fontFamily: "monospace" }}>ADAPTIVE REALTIME INTELLIGENCE AGENT</p>
  
          <p style={{ fontSize: "clamp(18px, 3vw, 26px)", color: "rgba(255,255,255,0.45)", maxWidth: 580, lineHeight: 1.75, marginBottom: 60, fontWeight: 300 }}>
            Your always-available AI companion — talk, listen, think things through. ARIA remembers you and connects to the tools you use every day.
          </p>
  
          {/* Primary CTA */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 100 }}>
            <a href="/login" style={{
              background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14,
              padding: "16px 52px", fontSize: 13, letterSpacing: 2,
              textDecoration: "none", fontWeight: 400,
              boxShadow: "0 0 30px rgba(255,255,255,0.05)"
            }}>
              GET STARTED FREE
            </a>
            <a href="/login" style={{
              background: "transparent", color: "rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14,
              padding: "16px 32px", fontSize: 13, letterSpacing: 2,
              textDecoration: "none"
            }}>
              SIGN IN
            </a>
          </div>
  
          {/* Features Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, maxWidth: 960, width: "100%", marginBottom: 100 }}>
            {[
              { icon: "◎", title: "Remembers You", desc: "Tracks preferences, mood patterns, and past conversations across all your sessions" },
              { icon: "◈", title: "Smart Integrations", desc: "Google Calendar, Gmail, Drive, Spotify, GitHub — all seamlessly connected" },
              { icon: "◉", title: "3D Avatar", desc: "A lifelike companion with real-time lip sync and natural facial expressions" },
              { icon: "◐", title: "Voice & Text", desc: "Talk naturally with voice input or type — ARIA responds in real speech" },
              { icon: "◑", title: "Always Updated", desc: "Real-time web search keeps ARIA informed about current events and news" },
              { icon: "◒", title: "Mood Aware", desc: "Detects how you're feeling and adapts its tone to match your energy naturally" },
            ].map((f, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "24px", textAlign: "left" }}>
                <div style={{ fontSize: 22, marginBottom: 12, color: "rgba(255,255,255,0.25)" }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "rgba(255,255,255,0.65)", letterSpacing: 0.5 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
  
          {/* Bottom CTA */}
          <div style={{ textAlign: "center", padding: "56px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", width: "100%", maxWidth: 600 }}>
            <p style={{ fontSize: 22, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontWeight: 300 }}>Ready to meet ARIA?</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.2)", marginBottom: 40, fontWeight: 300 }}>Free to use. No credit card required.</p>
            <a href="/login" style={{
              background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14,
              padding: "16px 56px", fontSize: 13, letterSpacing: 2,
              textDecoration: "none", display: "inline-block"
            }}>
              BEGIN SESSION
            </a>
          </div>
  
        </div>
  
        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "24px 40px", borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 10, color: "rgba(255,255,255,0.12)", fontFamily: "monospace", letterSpacing: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span>© 2026 ARIA — ADAPTIVE REALTIME INTELLIGENCE AGENT</span>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="/privacy" style={{ color: "rgba(255,255,255,0.12)", textDecoration: "none" }}>PRIVACY</a>
            <a href="mailto:lalith300104@gmail.com" style={{ color: "rgba(255,255,255,0.12)", textDecoration: "none" }}>CONTACT</a>
          </div>
        </footer>
  
        <style>{`
          @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
          a:hover { opacity: 0.7 !important; }
        `}</style>
      </div>
    );
  }