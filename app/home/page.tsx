"use client";

import { useEffect, useRef } from "react";

export default function Landing() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const animate = () => {
      curX += (mouseX - curX) * 0.1;
      curY += (mouseY - curY) * 0.1;
      cursor.style.left = `${curX}px`;
      cursor.style.top = `${curY}px`;
      requestAnimationFrame(animate);
    };

    const onEnterLink = () => {
      cursor.style.width = "60px";
      cursor.style.height = "60px";
      cursor.style.borderColor = "rgba(180,140,255,0.6)";
      cursor.style.background = "rgba(120,80,255,0.08)";
    };

    const onLeaveLink = () => {
      cursor.style.width = "36px";
      cursor.style.height = "36px";
      cursor.style.borderColor = "rgba(150,100,255,0.3)";
      cursor.style.background = "transparent";
    };

    window.addEventListener("mousemove", moveCursor);
    document.querySelectorAll("a, button").forEach(el => {
      el.addEventListener("mouseenter", onEnterLink);
      el.addEventListener("mouseleave", onLeaveLink);
    });

    animate();
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#080810", fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif", overflowX: "hidden", cursor: "none" }}>

      {/* Custom cursor */}
      <div ref={cursorRef} style={{ position: "fixed", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(150,100,255,0.3)", pointerEvents: "none", zIndex: 9999, transform: "translate(-50%,-50%)", transition: "width 0.3s, height 0.3s, border-color 0.3s, background 0.3s", mixBlendMode: "screen" }} />
      <div ref={cursorDotRef} style={{ position: "fixed", width: 5, height: 5, borderRadius: "50%", background: "rgba(200,170,255,0.9)", pointerEvents: "none", zIndex: 9999, transform: "translate(-50%,-50%)", boxShadow: "0 0 8px rgba(180,140,255,0.8)" }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "24px 56px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <span style={{ fontSize: 13, letterSpacing: 7, fontFamily: "monospace", color: "rgba(255,255,255,0.5)" }}>ARIA</span>
        <a href="/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: 1, cursor: "none" }}>Privacy</a>
      </nav>

      {/* Hero */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", textAlign: "center", padding: "0 24px", overflow: "hidden" }}>

        {/* Radial glow */}
        <div style={{ position: "absolute", top: "42%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(120,80,255,0.14) 0%, rgba(60,40,180,0.07) 40%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "42%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(180,140,255,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Rings */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          {[260, 420, 600, 800].map((size, i) => (
            <div key={i} style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: `1px solid rgba(${i < 2 ? "150,100,255" : "100,70,200"},${0.1 - i * 0.02})`, animation: `ringPulse ${5 + i * 1.2}s ease-in-out ${i * 0.7}s infinite` }} />
          ))}
        </div>

        {/* Dot */}
        <div style={{ position: "relative", width: 12, height: 12, borderRadius: "50%", background: "rgba(210,180,255,0.9)", marginBottom: 52, boxShadow: "0 0 24px 6px rgba(160,120,255,0.5), 0 0 80px 30px rgba(120,80,255,0.15)", animation: "dotPulse 3s ease-in-out infinite" }} />

        {/* Title */}
        <h1 style={{ position: "relative", fontSize: "clamp(80px, 18vw, 160px)", fontWeight: 100, letterSpacing: 32, margin: "0 0 16px", lineHeight: 1, background: "linear-gradient(135deg, #ffffff 0%, #c8a8ff 40%, #ffffff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ARIA</h1>

        <p style={{ position: "relative", fontSize: 10, color: "rgba(180,150,255,0.45)", letterSpacing: 7, marginBottom: 52, fontFamily: "monospace" }}>ADAPTIVE REALTIME INTELLIGENCE AGENT</p>

        {/* Tagline */}
        <p style={{ position: "relative", fontSize: "clamp(18px, 2.5vw, 24px)", color: "rgba(255,255,255,0.6)", maxWidth: 540, lineHeight: 1.85, marginBottom: 68, fontWeight: 300 }}>
          Your always-available AI companion.<br/>Talk, listen, think things through.
        </p>

        {/* CTA */}
        <a href="/login" style={{ position: "relative", display: "inline-block", background: "linear-gradient(135deg, rgba(120,80,255,0.25), rgba(80,50,200,0.15))", color: "rgba(220,200,255,0.95)", border: "1px solid rgba(150,100,255,0.35)", borderRadius: 14, padding: "17px 72px", fontSize: 12, letterSpacing: 5, textDecoration: "none", fontWeight: 400, boxShadow: "0 0 40px rgba(120,80,255,0.2)", cursor: "none", transition: "all 0.3s" }}>
          BEGIN
        </a>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: 44, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ width: 1, height: 44, background: "linear-gradient(to bottom, transparent, rgba(150,100,255,0.35), transparent)", animation: "scrollLine 2.5s ease-in-out infinite" }} />
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "100px 56px", maxWidth: 1140, margin: "0 auto" }}>
        <p style={{ fontSize: 10, color: "rgba(150,100,255,0.5)", letterSpacing: 5, fontFamily: "monospace", marginBottom: 52, textAlign: "center" }}>WHAT ARIA CAN DO</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(150,100,255,0.12)", borderRadius: 20, overflow: "hidden" }}>
          {[
            { num: "01", title: "Remembers You", desc: "Tracks preferences, mood patterns, and conversations across every session" },
            { num: "02", title: "Smart Integrations", desc: "Google Calendar, Gmail, Drive, Spotify and GitHub — seamlessly connected" },
            { num: "03", title: "3D Avatar", desc: "Lifelike companion with real-time lip sync and natural expressions" },
            { num: "04", title: "Voice & Text", desc: "Talk naturally with voice input or type — responds in real speech" },
            { num: "05", title: "Always Updated", desc: "Real-time web search keeps ARIA informed on current events and news" },
            { num: "06", title: "Mood Aware", desc: "Detects how you're feeling and adapts its tone to match your energy" },
          ].map((f, i) => (
            <div key={i} style={{ padding: "40px 36px", background: "#080810", transition: "background 0.3s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(120,80,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "#080810")}>
              <div style={{ fontSize: 11, color: "rgba(150,100,255,0.45)", fontFamily: "monospace", letterSpacing: 2, marginBottom: 18 }}>{f.num}</div>
              <div style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.82)", marginBottom: 12, letterSpacing: 0.3 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.8 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ textAlign: "center", padding: "60px 24px 120px" }}>
        <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, transparent, rgba(150,100,255,0.2), transparent)", margin: "0 auto 60px" }} />
        <p style={{ fontSize: "clamp(24px, 4vw, 44px)", marginBottom: 12, fontWeight: 200, letterSpacing: 1, lineHeight: 1.5, background: "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(180,150,255,0.75))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          Not just an assistant.
        </p>
        <p style={{ fontSize: "clamp(24px, 4vw, 44px)", color: "rgba(255,255,255,0.3)", marginBottom: 60, fontWeight: 200, letterSpacing: 1 }}>A companion.</p>
        <a href="/login" style={{ display: "inline-block", background: "transparent", color: "rgba(180,150,255,0.65)", border: "1px solid rgba(150,100,255,0.2)", borderRadius: 10, padding: "14px 48px", fontSize: 11, letterSpacing: 4, textDecoration: "none", cursor: "none" }}>
          START SESSION
        </a>
      </div>

      {/* Footer */}
      <footer style={{ padding: "22px 56px", borderTop: "1px solid rgba(150,100,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "monospace", letterSpacing: 2 }}>© 2026 ARIA</span>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="/privacy" style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", textDecoration: "none", letterSpacing: 2, fontFamily: "monospace", cursor: "none" }}>PRIVACY</a>
          <a href="mailto:lalith300104@gmail.com" style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", textDecoration: "none", letterSpacing: 2, fontFamily: "monospace", cursor: "none" }}>CONTACT</a>
        </div>
      </footer>

      <style>{`
        @keyframes ringPulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.85;transform:scale(1.04)} }
        @keyframes dotPulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.5);box-shadow:0 0 30px 8px rgba(180,140,255,0.6),0 0 80px 30px rgba(120,80,255,0.2)} }
        @keyframes scrollLine { 0%,100%{opacity:0;transform:scaleY(0)} 50%{opacity:1;transform:scaleY(1)} }
      `}</style>
    </div>
  );
}