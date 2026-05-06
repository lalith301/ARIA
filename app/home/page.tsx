export default function Landing() {
    return (
      <div style={{
        width: "100vw", minHeight: "100vh",
        background: "#080810",
        fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
        overflowX: "hidden",
      }}>
  
        {/* Nav */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "22px 52px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          <span style={{ fontSize: 13, letterSpacing: 7, fontFamily: "monospace", color: "rgba(255,255,255,0.5)" }}>ARIA</span>
          <a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: 1 }}>Privacy</a>
        </nav>
  
        {/* Hero */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", textAlign: "center", padding: "0 24px", overflow: "hidden" }}>
  
          {/* Purple-blue radial glow behind title */}
          <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(120,80,255,0.12) 0%, rgba(60,40,180,0.06) 40%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(180,140,255,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
  
          {/* Animated rings */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            {[280, 420, 580, 750].map((size, i) => (
              <div key={i} style={{
                position: "absolute", width: size, height: size,
                borderRadius: "50%",
                border: `1px solid rgba(${i < 2 ? "150,100,255" : "100,80,200"},${0.08 - i * 0.015})`,
                animation: `ringPulse ${5 + i * 1.2}s ease-in-out ${i * 0.7}s infinite`,
              }} />
            ))}
          </div>
  
          {/* Glowing dot */}
          <div style={{ position: "relative", width: 10, height: 10, borderRadius: "50%", background: "rgba(200,170,255,0.9)", marginBottom: 48, boxShadow: "0 0 20px 4px rgba(160,120,255,0.4), 0 0 60px 20px rgba(120,80,255,0.15)", animation: "dotPulse 3s ease-in-out infinite" }} />
  
          {/* Title */}
          <h1 style={{ position: "relative", fontSize: "clamp(72px, 16vw, 148px)", fontWeight: 100, letterSpacing: 28, margin: "0 0 14px", lineHeight: 1, background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(200,170,255,0.85) 50%, rgba(255,255,255,0.9) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ARIA</h1>
  
          <p style={{ position: "relative", fontSize: 9, color: "rgba(180,150,255,0.4)", letterSpacing: 7, marginBottom: 52, fontFamily: "monospace" }}>ADAPTIVE REALTIME INTELLIGENCE AGENT</p>
  
          {/* Tagline */}
          <p style={{ position: "relative", fontSize: "clamp(16px, 2.2vw, 21px)", color: "rgba(255,255,255,0.55)", maxWidth: 520, lineHeight: 1.85, marginBottom: 64, fontWeight: 300 }}>
            Your always-available AI companion.<br/>Talk, listen, think things through.
          </p>
  
          {/* CTA */}
          <a href="/login" style={{
            position: "relative",
            display: "inline-block",
            background: "linear-gradient(135deg, rgba(120,80,255,0.25), rgba(80,50,200,0.15))",
            color: "rgba(220,200,255,0.9)",
            border: "1px solid rgba(150,100,255,0.3)",
            borderRadius: 12,
            padding: "15px 64px",
            fontSize: 11,
            letterSpacing: 4,
            textDecoration: "none",
            fontWeight: 400,
            boxShadow: "0 0 30px rgba(120,80,255,0.15)",
            transition: "all 0.3s ease",
          }}>
            BEGIN
          </a>
  
          {/* Scroll hint */}
          <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, transparent, rgba(150,100,255,0.3), transparent)", animation: "scrollLine 2s ease-in-out infinite" }} />
          </div>
        </div>
  
        {/* Features */}
        <div style={{ padding: "100px 52px", maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 14, color: "rgba(150,100,255,0.5)", letterSpacing: 5, fontFamily: "monospace", marginBottom: 52, textAlign: "center" }}>WHAT ARIA CAN DO</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(150,100,255,0.1)", borderRadius: 20, overflow: "hidden" }}>
            {[
              { num: "01", title: "Remembers You", desc: "Tracks preferences, mood patterns, and conversations across every session" },
              { num: "02", title: "Smart Integrations", desc: "Google Calendar, Gmail, Drive, Spotify and GitHub — seamlessly connected" },
              { num: "03", title: "3D Avatar", desc: "Lifelike companion with real-time lip sync and natural expressions" },
              { num: "04", title: "Voice & Text", desc: "Talk naturally with voice input or type — responds in real speech" },
              { num: "05", title: "Always Updated", desc: "Real-time web search keeps ARIA informed on current events and news" },
              { num: "06", title: "Mood Aware", desc: "Detects how you're feeling and adapts its tone to match your energy" },
            ].map((f, i) => (
              <div key={i} style={{ padding: "36px 32px", background: "#080810" }}>
                <div style={{ fontSize: 12, color: "rgba(150,100,255,0.4)", fontFamily: "monospace", letterSpacing: 2, marginBottom: 16 }}>{f.num}</div>
                <div style={{ fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.75)", marginBottom: 10, letterSpacing: 0.3 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.75 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Bottom CTA */}
        <div style={{ textAlign: "center", padding: "60px 24px 120px" }}>
          <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, transparent, rgba(150,100,255,0.2), transparent)", margin: "0 auto 60px" }} />
          <p style={{ fontSize: "clamp(22px, 4vw, 40px)", marginBottom: 12, fontWeight: 200, letterSpacing: 1, lineHeight: 1.5, background: "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(180,150,255,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Not just an assistant.
          </p>
          <p style={{ fontSize: "clamp(22px, 4vw, 40px)", color: "rgba(255,255,255,0.35)", marginBottom: 56, fontWeight: 200, letterSpacing: 1 }}>A companion.</p>
          <a href="/login" style={{
            display: "inline-block",
            background: "transparent",
            color: "rgba(180,150,255,0.6)",
            border: "1px solid rgba(150,100,255,0.2)",
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
        <footer style={{ padding: "20px 52px", borderTop: "1px solid rgba(150,100,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", fontFamily: "monospace", letterSpacing: 2 }}>© 2026 ARIA</span>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="/privacy" style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", textDecoration: "none", letterSpacing: 2, fontFamily: "monospace" }}>PRIVACY</a>
            <a href="mailto:lalith300104@gmail.com" style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", textDecoration: "none", letterSpacing: 2, fontFamily: "monospace" }}>CONTACT</a>
          </div>
        </footer>
  
        <style>{`
          @keyframes ringPulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.04); }
          }
          @keyframes dotPulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.4); box-shadow: 0 0 30px 8px rgba(160,120,255,0.5), 0 0 80px 30px rgba(120,80,255,0.2); }
          }
          @keyframes scrollLine {
            0%, 100% { opacity: 0; transform: scaleY(0); }
            50% { opacity: 1; transform: scaleY(1); }
          }
          a[href="/login"]:hover { opacity: 0.75 !important; }
        `}</style>
      </div>
    );
  }