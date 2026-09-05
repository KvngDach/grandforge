import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import { startOAuth } from "../lib/lichess.js";
import { C, STAGES } from "../constants/data.js";

export default function Landing() {
  const { auth } = useAuth();
  const navigate  = useNavigate();

  // Already logged in → go straight to dashboard
  useEffect(() => { if (auth) navigate("/dashboard"); }, [auth]);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans',sans-serif", fontWeight:300, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", padding:"2rem" }}>

      {/* Subtle checkerboard background */}
      <div style={{ position:"absolute", inset:0, opacity:0.03, backgroundImage:"repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)", backgroundSize:"64px 64px", pointerEvents:"none" }} />

      <div style={{ zIndex:1, textAlign:"center", maxWidth:"540px", width:"100%" }}>
        <div style={{ fontSize:"2.5rem", lineHeight:1, marginBottom:"0.5rem" }}>♟</div>

        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2.8rem,10vw,5rem)", fontWeight:700, color:C.gold, margin:"0 0 0.3rem", letterSpacing:"0.12em", lineHeight:1 }}>
          GRANDFORGE
        </h1>
        <p style={{ color:C.muted, fontSize:"0.78rem", letterSpacing:"0.28em", textTransform:"uppercase", margin:"0 0 2.5rem" }}>
          Your Daily Chess Ritual
        </p>

        {/* Stage pills */}
        <div style={{ display:"flex", gap:"0.6rem", justifyContent:"center", marginBottom:"2.5rem", flexWrap:"wrap" }}>
          {STAGES.map(s => (
            <div key={s.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.35rem", padding:"0.8rem 0.9rem", borderRadius:"8px", border:`1px solid ${C.border}`, backgroundColor:C.surface, minWidth:"72px" }}>
              <span style={{ fontSize:"1.3rem", color:s.color }}>{s.icon}</span>
              <span style={{ fontSize:"0.62rem", color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* How it works — 3 bullets */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem", marginBottom:"2.5rem" }}>
          {[
            { n:"1", t:"Log in", d:"With your free Lichess account" },
            { n:"2", t:"Train daily", d:"5 stages, locked in sequence" },
            { n:"3", t:"Improve", d:"Track your streak & progress" },
          ].map(item => (
            <div key={item.n} style={{ padding:"1rem 0.75rem", borderRadius:"10px", backgroundColor:C.card, border:`1px solid ${C.border}`, textAlign:"center" }}>
              <div style={{ fontSize:"1.1rem", color:C.gold, fontFamily:"'Cormorant Garamond',serif", marginBottom:"0.3rem" }}>{item.n}</div>
              <div style={{ fontSize:"0.82rem", color:C.text, marginBottom:"0.2rem" }}>{item.t}</div>
              <div style={{ fontSize:"0.7rem", color:C.muted }}>{item.d}</div>
            </div>
          ))}
        </div>

        <button
          onClick={startOAuth}
          style={{ padding:"0.9rem 2.8rem", fontSize:"0.85rem", background:`linear-gradient(135deg,${C.gold},#a8882c)`, color:"#0a0800", fontWeight:600, border:"none", borderRadius:"6px", cursor:"pointer", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", boxShadow:`0 4px 24px ${C.gold}40`, marginBottom:"0.75rem", width:"100%" }}
        >
          Sign in with Lichess ♟
        </button>

        <p style={{ color:C.dim, fontSize:"0.72rem", margin:0 }}>
          Free forever · No subscription · No ads · Open source
        </p>
      </div>

      <div style={{ position:"absolute", bottom:"1.5rem", color:C.dim, fontSize:"0.7rem", letterSpacing:"0.2em", textTransform:"uppercase" }}>
        Train · Play · Analyse · Improve
      </div>
    </div>
  );
}
