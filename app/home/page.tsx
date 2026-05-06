export default function Landing() {
    return (
      <div style={{
        width: "100vw", minHeight: "100vh",
        background: "#09090b",
        fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
        overflowX: "hidden",
      }}>
  
        {/* Nav */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, background: "rgba(9,9,11,0)" }}>
          <span style={{ fontSize: 11, letterSpacing: 7, fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>ARIA</span>
          <a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", textDecoration: "none", letterSpacing: 1 }}>Privacy</a>
        </nav>
  
        {/* Hero */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", textAlign: "center", padding: "0 24px", overflow: "hidden" }}>
  
          {/* Animated background rings */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            {[300, 500, 700, 900].map((size, i) => (
              <div key={i} style={{
                position: "absolute", width: size, height: size,
                borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)",
                animation: `ringPulse ${4 + i * 0.8}s ease-in-out ${i * 0.5}s infinite`,
              }} />
            ))}
          </div>
  
          {/* Glowing center dot */}
          <div style={{ position: "relative", width: 12, height: 12, borderRadius: "50%", background: "rgba(255,255,255,0.8)", marginBottom: 52, boxShadow: "0 0 60px 15px rgba(255,255,255,0.08), 0 0 120px 40px rgba(255,255,255,0.03)", animation: "dotPulse 3s ease-in-out infinite" }} />
  
          {/* Title */}
          <h1 style={{ position: "relative", fontSize: "clamp(72px, 16vw, 148px)", fontWeight: 100, letterSpacing: 28, margin: "0 0 16px", color: "rgba(255,255,255,0.92)", lineHeight: 1, fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif" }}>ARIA</h1>
          <p style={{ position: "relative", fontSize: 9, color: "rgba(255,255,255,0.1)", letterSpacing: 7, marginBottom: 52, fontFamily: "monospace" }}>ADAPTIVE REALTIME INTELLIGENCE AGENT</p>
  
          {/* Tagline */}
          <p style={{ position: "relative", fontSize: "clamp(15px, 2.2vw, 20px)", color: "rgba(255,255,255,0.28)", maxWidth: 500, lineHeight: 1.9, marginBottom: 64, fontWeight: 300, letterSpacing: 0.3 }}>
            Your always-available AI companion.<br/>Talk, listen, think things through.
          </p>
  
          {/* Single CTA */}
          <a href="/login" style={{
            position: "relative",
            display: "inline-block",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.75)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "15px 64px",
            fontSize: 11,
            letterSpacing: 4,
            textDecoration: "none",
            fontWeight: 400,
            transition: "all 0.3s ease",
          }}>
            BEGIN
          </a>
  
          {/* Scroll indicator */}
          <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, animation: "fadeIn 2s ease 1.5s both" }}>
            <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent)", animation: "scrollLine 2s ease-in-out infinite" }} />
          </div>
        </div>
  
        {/* Features */}
        <div style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(255,255,255,0.05)", borderRadius: 20, overflow: "hidden" }}>
            {[
              { num: "01", title: "Remembers You", desc: "Tracks preferences, mood patterns, and conversations across every session" },
              { num: "02", title: "Smart Integrations", desc: "Google Calendar, Gmail, Drive, Spotify and GitHub — seamlessly connected" },
              { num: "03", title: "3D Avatar", desc: "Lifelike companion with real-time lip sync and natural facial expressions" },
              { num: "04", title: "Voice & Text", desc: "Talk naturally with voice input or type — responds in real speech" },
              { num: "05", title: "Always Updated", desc: "Real-time web search keeps ARIA informed on current events and news" },
              { num: "06", title: "Mood Aware", desc: "Detects how you're feeling and adapts its tone to match your energy" },
            ].map((f, i) => (
              <div key={i} style={{ padding: "36px 32px", background: "#09090b", transition: "background 0.2s" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.12)", fontFamily: "monospace", letterSpacing: 2, marginBottom: 16 }}>{f.num}</div>
                <div style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.6)", marginBottom: 10, letterSpacing: 0.3 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", lineHeight: 1.75 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Quote / CTA section */}
        <div style={{ textAlign: "center", padding: "80px 24px 140px" }}>
          <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)", margin: "0 auto 60px" }} />
          <p style={{ fontSize: "clamp(20px, 4vw, 36px)", color: "rgba(255,255,255,0.25)", marginBottom: 52, fontWeight: 200, letterSpacing: 1, lineHeight: 1.6 }}>
            Not just an assistant.<br/>A companion.
          </p>
          <a href="/login" style={{
            display: "inline-block",
            background: "transparent",
            color: "rgba(255,255,255,0.35)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            padding: "13px 44px",
            fontSize: 10,
            letterSpacing: 4,
            textDecoration: "none",
          }}>
            START SESSION
          </a>
        </div>
  
        {/* Footer */}
        <footer style={{ padding: "20px 48px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.1)", fontFamily: "monospace", letterSpacing: 2 }}>© 2026 ARIA</span>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="/privacy" style={{ fontSize: 9, color: "rgba(255,255,255,0.1)", textDecoration: "none", letterSpacing: 2, fontFamily: "monospace" }}>PRIVACY</a>
            <a href="mailto:lalith300104@gmail.com" style={{ fontSize: 9, color: "rgba(255,255,255,0.1)", textDecoration: "none", letterSpacing: 2, fontFamily: "monospace" }}>CONTACT</a>
          </div>
        </footer>
  
        <style>{`
          @keyframes ringPulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.03); }
          }
          @keyframes dotPulse {
            0%, 100% { opacity: 0.5; transform: scale(1); box-shadow: 0 0 60px 15px rgba(255,255,255,0.06); }
            50% { opacity: 1; transform: scale(1.3); box-shadow: 0 0 80px 25px rgba(255,255,255,0.1); }
          }
          @keyframes scrollLine {
            0%, 100% { opacity: 0; transform: scaleY(0.5) translateY(-10px); }
            50% { opacity: 1; transform: scaleY(1) translateY(0); }
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          a[href="/login"]:hover { opacity: 0.7 !important; }
        `}</style>
      </div>
    );
  }