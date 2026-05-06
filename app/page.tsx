"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import * as THREE from "three";
import { Lipsync } from "wawa-lipsync";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ARIAState = "idle" | "speaking" | "listening" | "thinking";
type SessionState = "waiting" | "active" | "warning" | "ended";

const INACTIVITY_WARNING_MS = 10 * 60 * 1000;
const INACTIVITY_END_MS = 15 * 60 * 1000;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm ARIA. Think of me as your always-available companion — I can talk, listen, help you think things through, or just hang out. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [ariaState, setAriaState] = useState<ARIAState>("idle");
  const [user, setUser] = useState<any>(null);
  const [showChat, setShowChat] = useState(true);
  const [sessionState, setSessionState] = useState<SessionState>("waiting");
  const [sessionDuration, setSessionDuration] = useState(0);
  const [integrations, setIntegrations] = useState({ google: false, spotify: false });
  const [showIntegrations, setShowIntegrations] = useState(false);

  const sessionStartRef = useRef<number>(0);
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionClockRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const ariaStateRef = useRef<ARIAState>("idle");
  const animFrameRef = useRef<number>(0);
  const lipsyncFrameRef = useRef<number>(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const visualizerFrameRef = useRef<number>(0);
  const avatarMeshRef = useRef<THREE.SkinnedMesh | null>(null);
  const lipsyncRef = useRef<Lipsync | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = createClient();

  useEffect(() => { ariaStateRef.current = ariaState; }, [ariaState]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    if (typeof window !== "undefined") window.speechSynthesis.getVoices();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Check integration status + handle OAuth redirect
  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_integrations")
      .select("provider")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const providers = data?.map((d: any) => d.provider) || [];
        setIntegrations({ google: providers.includes("google"), spotify: providers.includes("spotify") });
      });
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    if (connected) {
      setIntegrations(prev => ({ ...prev, [connected]: true }));
      window.history.replaceState({}, "", "/");
    }
  }, [user]);

  const connectGoogle = () => {
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.file",
    ].join(" ");
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      redirect_uri: `${window.location.origin}/auth/google/callback`,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  const connectSpotify = () => {
    const scopes = "user-read-playback-state user-modify-playback-state streaming playlist-read-private user-library-read";
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "",
      redirect_uri: `${window.location.origin}/auth/spotify/callback`,
      response_type: "code",
      scope: scopes,
    });
    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  const resetInactivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (sessionState === "warning") setSessionState("active");
    warningTimerRef.current = setTimeout(() => {
      setSessionState("warning");
      speakText("Hey, are you still there? I can end our session if you'd like.");
    }, INACTIVITY_WARNING_MS);
    inactivityTimerRef.current = setTimeout(() => { endSession(); }, INACTIVITY_END_MS);
  }, [sessionState]);

  const startSession = async () => {
    setSessionState("active");
    sessionStartRef.current = Date.now();
    lastActivityRef.current = Date.now();
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Hey, up late?";
    let openingMessage = "";
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("user_profiles").select("last_active, facts").eq("user_id", user.id).single();
        const lastActive = profile?.last_active ? new Date(profile.last_active) : null;
        const minutesSince = lastActive ? Math.floor((Date.now() - lastActive.getTime()) / 60000) : null;
        const name = profile?.facts?.find((f: string) => f.startsWith("User's name"))?.split("is ")?.[1] || "";
        const nameStr = name ? `, ${name}` : "";
        if (!lastActive || minutesSince! > 60 * 24) openingMessage = `${timeGreeting}! I'm ARIA — your always-available companion. I can talk, listen, help you think things through, or just hang out. What's on your mind?`;
        else if (minutesSince! < 30) openingMessage = `Welcome back${nameStr}! Ready to pick up where we left off?`;
        else if (minutesSince! < 60 * 3) openingMessage = `${timeGreeting}${nameStr}! Good to see you again. What's on your mind?`;
        else openingMessage = `${timeGreeting}${nameStr}! Been a little while — what's up?`;
      }
    } catch { openingMessage = `${timeGreeting}! I'm ARIA. What's on your mind?`; }
    sessionClockRef.current = setInterval(() => { setSessionDuration(Date.now() - sessionStartRef.current); }, 1000);
    warningTimerRef.current = setTimeout(() => { setSessionState("warning"); speakText("Hey, are you still there? I can end our session if you'd like."); }, INACTIVITY_WARNING_MS);
    inactivityTimerRef.current = setTimeout(() => { endSession(); }, INACTIVITY_END_MS);
    setMessages([{ role: "assistant", content: openingMessage }]);
    speakText(openingMessage);
  };

  const endSession = () => {
    window.speechSynthesis.cancel();
    setSessionState("ended"); setAriaState("idle");
    if (sessionClockRef.current) clearInterval(sessionClockRef.current);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    speakText("It was great talking with you. See you next time!");
  };

  const newSession = () => { setSessionState("waiting"); setMessages([]); setSessionDuration(0); };

  useEffect(() => {
    const canvas = visualizerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (ariaState !== "speaking") { cancelAnimationFrame(visualizerFrameRef.current); ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
    const bars = 20; const barWidth = canvas.width / bars - 1.5;
    const draw = () => {
      visualizerFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < bars; i++) {
        const height = Math.random() * 18 + 3;
        const x = i * (barWidth + 1.5) + 0.75; const y = (canvas.height - height) / 2;
        ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.25})`;
        ctx.beginPath(); ctx.roundRect(x, y, barWidth, height, 1); ctx.fill();
      }
    };
    draw();
    return () => cancelAnimationFrame(visualizerFrameRef.current);
  }, [ariaState]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const w = container.clientWidth; const h = container.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000810);
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 1.92, 0.42); camera.lookAt(0, 1.68, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h); renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xfff0e0, 1.5));
    const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.5); keyLight.position.set(1, 2, 2); scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffd0a0, 1.0); fillLight.position.set(-2, 1, 1); scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffe0c0, 1.5); rimLight.position.set(0, 2, -3); scene.add(rimLight);
    const gridHelper = new THREE.GridHelper(10, 20, 0x0a2a4a, 0x0a2a4a); gridHelper.position.y = -0.01; scene.add(gridHelper);
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) { positions[i * 3] = (Math.random() - 0.5) * 8; positions[i * 3 + 1] = Math.random() * 5; positions[i * 3 + 2] = (Math.random() - 0.5) * 8; }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.012, transparent: true, opacity: 0.18 }));
    scene.add(particles);
    let headBone: THREE.Object3D | null = null; let neckBone: THREE.Object3D | null = null;
    (async () => {
      try {
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const loader = new GLTFLoader();
        loader.load("/avaturn.glb", (gltf) => {
          const avatar = gltf.scene;
          avatar.position.set(0, 0, 0);
          avatar.traverse((child) => {
            const mesh = child as THREE.SkinnedMesh;
            if (child.name === "Head") headBone = child;
            if (child.name === "Neck") neckBone = child;
            if (mesh.isSkinnedMesh && mesh.morphTargetDictionary) {
              if (mesh.name === "Head_Mesh") {
                avatarMeshRef.current = mesh;
                const faceMeshes: THREE.SkinnedMesh[] = [];
                avatar.traverse((c) => {
                  const m = c as THREE.SkinnedMesh;
                  if (m.isSkinnedMesh && m.morphTargetDictionary && ["Head_Mesh", "Teeth_Mesh", "Tongue_Mesh"].includes(m.name)) faceMeshes.push(m);
                });
                (window as any).__ariaFaceMeshes = faceMeshes;
              }
            }
          });
          const HIDE_MESHES = ["Body_Mesh", "avaturn_shoes_0", "avaturn_look_0"];
          avatar.traverse((child) => { if (HIDE_MESHES.includes(child.name)) child.visible = false; });
          scene.add(avatar);
        }, undefined, (err) => console.error("Avatar load error:", err));
      } catch (err) { console.error("GLTFLoader error:", err); }
    })();
    const lipsync = new Lipsync();
    lipsyncRef.current = lipsync;
    const animateLipsync = () => {
      lipsyncFrameRef.current = requestAnimationFrame(animateLipsync);
      const mesh = avatarMeshRef.current;
      if (!mesh?.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      const isSpeaking = ariaStateRef.current === "speaking";
      const t = performance.now() / 1000;
      const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
      const setMorph = (name: string, value: number) => {
        const meshes = (window as any).__ariaFaceMeshes || [mesh];
        meshes.forEach((m: THREE.SkinnedMesh) => {
          if (!m?.morphTargetDictionary || !m.morphTargetInfluences) return;
          const idx = m.morphTargetDictionary[name];
          if (idx !== undefined) m.morphTargetInfluences[idx] = lerp(m.morphTargetInfluences[idx], value, 0.35);
        });
      };
      const pauseCycle = Math.sin(t * 0.92);
      const isPausing = isSpeaking && pauseCycle > 0.92;
      const jaw = isSpeaking && !isPausing ? Math.abs(Math.sin(t * 5 + Math.sin(t * 3) * 2)) * 0.15 : Math.sin(t * 0.5) * 0.002;
      const mouth = isSpeaking && !isPausing ? Math.abs(Math.sin(t * 7 + 1)) * 0.1 : 0;
      setMorph("jawOpen", jaw); setMorph("mouthOpen", mouth);
      if (isSpeaking && !isPausing) {
        const cycle = Math.floor(t * 1.5) % 4;
        setMorph("viseme_aa", cycle === 0 ? 0.2 : 0); setMorph("viseme_O", cycle === 1 ? 0.15 : 0);
        setMorph("viseme_I", cycle === 2 ? 0.12 : 0); setMorph("viseme_U", cycle === 3 ? 0.15 : 0);
      } else { ["viseme_aa", "viseme_O", "viseme_I", "viseme_U"].forEach(n => setMorph(n, 0)); }
      const blinkCycle = Math.sin(t * 0.4);
      const blink = blinkCycle > 0.97 ? 1.0 : 0;
      setMorph("eyeBlinkLeft", blink); setMorph("eyeBlinkRight", blink);
    };
    animateLipsync();
    let t = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      t += 0.01;
      if (headBone) {
        const isSpeaking = ariaStateRef.current === "speaking";
        const isListening = ariaStateRef.current === "listening";
        const isThinking = ariaStateRef.current === "thinking";
        headBone.rotation.z = Math.sin(t * 0.25) * 0.04 + Math.sin(t * 0.9) * 0.012;
        headBone.rotation.x = Math.sin(t * 0.35) * 0.025 + (isSpeaking ? Math.sin(t * 2.8) * 0.02 : 0) + (isThinking ? Math.sin(t * 1.2) * -0.018 : 0);
        headBone.rotation.y = Math.sin(t * 0.2) * 0.035 + Math.sin(t * 0.7) * 0.015 + (isListening ? Math.sin(t * 1.5) * 0.025 : 0);
      }
      if (neckBone) { neckBone.rotation.z = Math.sin(t * 0.25 + 0.8) * 0.025; neckBone.rotation.x = Math.sin(t * 0.35 + 0.5) * 0.015; neckBone.rotation.y = Math.sin(t * 0.2 + 0.4) * 0.018; }
      rimLight.intensity = ariaStateRef.current === "speaking" ? 1.5 + Math.sin(t * 6) * 0.4 : 1.5 + Math.sin(t * 1.5) * 0.2;
      particles.rotation.y += 0.0003;
      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => { const w = container.clientWidth; const h = container.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); };
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); cancelAnimationFrame(animFrameRef.current); cancelAnimationFrame(lipsyncFrameRef.current); renderer.dispose(); if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement); };
  }, []);

  const speakText = (text: string) => {
    if (typeof window === "undefined") return;
    const clean = text.replace(/\[.*?\]\n?/g, "").trim();
    if (!clean) return;
    setAriaState("speaking");
    window.speechSynthesis.cancel();
    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name === "Karen") || voices.find(v => v.name === "Samantha") || voices.find(v => v.name === "Moira") || voices.find(v => v.lang === "en-US") || voices[0];
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.voice = preferred || null; utterance.rate = 0.92; utterance.pitch = 1.08; utterance.volume = 1.0;
      utterance.onstart = () => setAriaState("speaking");
      utterance.onend = () => setAriaState("idle");
      utterance.onerror = () => setAriaState("idle");
      window.speechSynthesis.speak(utterance);
    };
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) doSpeak();
    else { window.speechSynthesis.onvoiceschanged = () => { doSpeak(); window.speechSynthesis.onvoiceschanged = null; }; }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || sessionState !== "active") return;
    resetInactivity();
    const userMsg: Message = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history); setInput(""); setLoading(true); setAriaState("thinking");
    setMessages([...history, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }) });
      if (res.status === 401) { window.location.href = "/login"; return; }
      const reader = res.body!.getReader(); const decoder = new TextDecoder(); let full = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; full += decoder.decode(value); setMessages([...history, { role: "assistant", content: full }]); }
      speakText(full);
    } catch { setMessages([...history, { role: "assistant", content: "Sorry, something went wrong. Try again!" }]); setAriaState("idle"); }
    finally { setLoading(false); }
  };

  const toggleVoice = () => {
    if (sessionState !== "active") return;
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) { alert("Voice not supported. Try Chrome."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); setAriaState("idle"); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-US"; recognition.interimResults = false;
    recognition.onresult = (e: any) => { resetInactivity(); sendMessage(e.results[0][0].transcript); };
    recognition.onend = () => { setListening(false); setAriaState("idle"); };
    recognition.onerror = () => { setListening(false); setAriaState("idle"); };
    recognitionRef.current = recognition; recognition.start();
    setListening(true); setAriaState("listening");
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };
  const handleSignOut = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };

  const renderMessageContent = (content: string) => {
    const spotifyMatch = content.match(/\[SPOTIFY_OPEN:(.*?)\]/);
    const whatsappQR = content.match(/WHATSAPP_QR:(data:image\/png;base64,[^`\s]+)/);
    const cleanContent = content
      .replace(/\[SPOTIFY_OPEN:.*?\]/g, "")
      .replace(/WHATSAPP_QR:data:image\/png;base64,[^\s]*/g, "")
      .replace(/\[.*?\]\n?/g, "")
      .replace(/([.!?])\s+(\d+\.)/g, "$1\n\n$2")
      .trim();
    return (
      <>
        <span style={{ whiteSpace: "pre-wrap", display: "block" }}>{cleanContent}</span>
        {whatsappQR && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Scan with WhatsApp → Linked Devices → Link a Device</p>
            <img src={whatsappQR[1]} alt="WhatsApp QR Code" style={{ width: 200, height: 200, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
        )}
        {spotifyMatch && (
          <div style={{ marginTop: 10 }}>
            <button onClick={() => { if (window.confirm("Open Spotify to play this?")) window.open(spotifyMatch[1], "_blank"); }}
              style={{ background: "#1DB954", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 11, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              Open in Spotify
            </button>
          </div>
        )}
      </>
    );
  };

  const stateLabel: Record<ARIAState, string> = { idle: "online", speaking: "speaking", listening: "listening", thinking: "thinking" };
  const stateDotColor: Record<ARIAState, string> = { idle: "rgba(255,255,255,0.5)", speaking: "rgba(255,255,255,0.9)", listening: "rgba(255,255,255,0.7)", thinking: "rgba(255,255,255,0.4)" };
  const connectedCount = [integrations.google, integrations.spotify].filter(Boolean).length;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#09090b" }}>
      <audio ref={audioRef} style={{ display: "none" }} crossOrigin="anonymous" />
      <div ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse at 40% 50%, transparent 35%, rgba(0,0,0,0.55) 100%)" }} />

      {/* SESSION — WAITING */}
      {sessionState === "waiting" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(9,9,11,0.88)", backdropFilter: "blur(12px)" }}>
          <div style={{ textAlign: "center", maxWidth: 400, padding: "0 24px", animation: "luxFadeUp 0.6s ease" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.6)", margin: "0 auto 32px", boxShadow: "0 0 16px rgba(255,255,255,0.3)", animation: "luxPulse 2s ease-in-out infinite" }} />
            <h1 style={{ fontSize: 52, fontWeight: 300, color: "rgba(255,255,255,0.95)", margin: "0 0 6px", letterSpacing: 8, fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif" }}>ARIA</h1>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 5, marginBottom: 32, fontFamily: "monospace" }}>ADAPTIVE REALTIME INTELLIGENCE</div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: "0 0 48px", lineHeight: 1.8, fontWeight: 300 }}>Your always-available AI companion. Ready to talk, listen, and help you think things through.</p>
            <button onClick={startSession} style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "14px 52px", fontSize: 13, fontWeight: 400, cursor: "pointer", letterSpacing: 2, transition: "all 0.2s", fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif" }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.12)"; (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}>
              BEGIN SESSION
            </button>
            {user && <p style={{ marginTop: 24, fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "monospace", letterSpacing: 1 }}>{user.email}</p>}
          </div>
        </div>
      )}

      {/* SESSION — WARNING */}
      {sessionState === "warning" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(9,9,11,0.75)", backdropFilter: "blur(8px)" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "36px 44px", textAlign: "center", maxWidth: 340, animation: "luxFadeUp 0.4s ease" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.4)", margin: "0 auto 20px", animation: "luxPulse 2s infinite" }} />
            <h3 style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, margin: "0 0 8px", fontWeight: 300, letterSpacing: 1 }}>Still there?</h3>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: "0 0 28px", lineHeight: 1.7, fontWeight: 300 }}>You've been quiet for a while. Want to continue?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => { setSessionState("active"); resetInactivity(); }} style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 24px", fontSize: 12, cursor: "pointer", letterSpacing: 1 }}>Continue</button>
              <button onClick={endSession} style={{ background: "transparent", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 24px", fontSize: 12, cursor: "pointer" }}>End</button>
            </div>
          </div>
        </div>
      )}

      {/* SESSION — ENDED */}
      {sessionState === "ended" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(9,9,11,0.88)", backdropFilter: "blur(12px)" }}>
          <div style={{ textAlign: "center", maxWidth: 360, padding: "0 24px", animation: "luxFadeUp 0.6s ease" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.3)", margin: "0 auto 28px" }} />
            <h2 style={{ color: "rgba(255,255,255,0.85)", fontSize: 22, margin: "0 0 6px", fontWeight: 300, letterSpacing: 2 }}>Session Complete</h2>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, margin: "0 0 6px", fontFamily: "monospace", letterSpacing: 2 }}>{formatDuration(sessionDuration)}</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: "0 0 36px", lineHeight: 1.8, fontWeight: 300 }}>It was great talking with you. Come back anytime.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={newSession} style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 32px", fontSize: 12, cursor: "pointer", letterSpacing: 1 }}>New Session</button>
              {user && <button onClick={handleSignOut} style={{ background: "transparent", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 24px", fontSize: 12, cursor: "pointer" }}>Sign Out</button>}
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      {(sessionState === "active" || sessionState === "warning") && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "monospace", letterSpacing: 6 }}>ARIA</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", fontFamily: "monospace", letterSpacing: 1, fontVariantNumeric: "tabular-nums" }}>{formatDuration(sessionDuration)}</span>
            <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.08)" }} />
            <button onClick={() => setShowIntegrations(v => !v)} style={{ fontSize: 11, color: connectedCount > 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", letterSpacing: 1, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 5 }}>
              {connectedCount > 0 && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />}
              apps
            </button>
            <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.08)" }} />
            <button onClick={() => setShowChat(v => !v)} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", letterSpacing: 1, fontFamily: "monospace" }}>{showChat ? "hide" : "show"}</button>
            <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.08)" }} />
            <button onClick={endSession} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", letterSpacing: 1, fontFamily: "monospace" }}>end</button>
          </div>
        </div>
      )}

      {/* INTEGRATIONS PANEL */}
      {showIntegrations && (sessionState === "active" || sessionState === "warning") && (
        <div style={{ position: "absolute", top: 48, right: 20, zIndex: 20, background: "rgba(9,9,11,0.96)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px", minWidth: 240, backdropFilter: "blur(16px)", animation: "luxFadeUp 0.2s ease" }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginBottom: 16 }}>CONNECTED SERVICES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: integrations.google ? "#4ade80" : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Google</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>{integrations.google ? "Calendar · Gmail · Drive" : "Not connected"}</div>
                </div>
              </div>
              {!integrations.google && (
                <button onClick={connectGoogle} style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", letterSpacing: 1 }}>connect</button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: integrations.spotify ? "#1DB954" : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Spotify</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>{integrations.spotify ? "Music connected" : "Not connected"}</div>
                </div>
              </div>
              {!integrations.spotify && (
                <button onClick={connectSpotify} style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", letterSpacing: 1 }}>connect</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHAT BUBBLES */}
      {showChat && sessionState === "active" && (
        <div style={{ position: "absolute", top: 48, right: 20, bottom: 110, width: 290, zIndex: 10, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", padding: "16px 2px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", animation: "luxFadeUp 0.35s ease both", animationDelay: `${Math.min(i * 0.04, 0.25)}s` }}>
              <div style={{ fontSize: 8, letterSpacing: 3, fontFamily: "monospace", marginBottom: 5, color: "rgba(255,255,255,0.18)", paddingLeft: msg.role === "assistant" ? 3 : 0, paddingRight: msg.role === "user" ? 3 : 0 }}>
                {msg.role === "assistant" ? "ARIA" : "YOU"}
              </div>
              <div style={{ maxWidth: "90%", padding: "11px 14px", borderRadius: msg.role === "assistant" ? "18px 18px 18px 4px" : "18px 18px 4px 18px", fontSize: 12.5, lineHeight: 1.65, color: msg.role === "assistant" ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.82)", position: "relative", overflow: "hidden", background: msg.role === "assistant" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)", border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)", animation: `luxFadeUp 0.35s ease both, ${msg.role === "assistant" ? "luxFloatA" : "luxFloatB"} ${4 + (i % 3) * 0.7}s ease-in-out ${i * 0.2}s infinite` }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "0.5px", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)", animation: "luxShimmer 4s linear infinite" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  {msg.content ? renderMessageContent(msg.content) : (
                    <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      {[0, 220, 440].map(d => (<span key={d} style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.45)", display: "inline-block", animation: `dotPulse 1.3s ${d}ms ease-in-out infinite` }} />))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <canvas ref={visualizerRef} width={140} height={28} style={{ position: "absolute", bottom: 136, left: "50%", transform: "translateX(-50%)", zIndex: 10, opacity: ariaState === "speaking" ? 0.7 : 0, transition: "opacity 0.5s" }} />

      {sessionState === "active" && (
        <div style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 7, zIndex: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "5px 14px", backdropFilter: "blur(8px)", animation: "luxBorderPulse 3s ease-in-out infinite" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: stateDotColor[ariaState], transition: "background 0.3s", animation: ariaState === "speaking" ? "luxPulse 1s infinite" : ariaState === "thinking" ? "luxPulse 2s infinite" : "none" }} />
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: 2, transition: "color 0.3s" }}>{stateLabel[ariaState].toUpperCase()}</span>
        </div>
      )}

      {sessionState === "active" && (
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", width: "min(580px, 90vw)", zIndex: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "8px 10px", backdropFilter: "blur(16px)" }}>
            <button onClick={toggleVoice} style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: listening ? "rgba(255,255,255,0.1)" : "transparent", border: `1px solid ${listening ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`, cursor: "pointer", transition: "all 0.2s" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={listening ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </button>
            <textarea rows={1} value={input} onChange={e => { setInput(e.target.value); resetInactivity(); }} onKeyDown={handleKey} placeholder={listening ? "Listening..." : "Message ARIA..."} disabled={loading || listening}
              style={{ flex: 1, background: "transparent", border: "none", padding: "6px 4px", fontSize: 13, color: "rgba(255,255,255,0.75)", resize: "none", outline: "none", fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", minHeight: 34, maxHeight: 90, lineHeight: 1.5 }} />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: input.trim() && !loading ? "rgba(255,255,255,0.12)" : "transparent", border: `1px solid ${input.trim() && !loading ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`, cursor: input.trim() && !loading ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !loading ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes luxFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes luxPulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
        @keyframes luxFloatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes luxFloatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes luxShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes luxBorderPulse { 0%,100%{border-color:rgba(255,255,255,0.07)} 50%{border-color:rgba(255,255,255,0.12)} }
        @keyframes dotPulse { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:.7;transform:scale(1.3)} }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        textarea:focus { outline: none; }
      `}</style>
    </div>
  );
}