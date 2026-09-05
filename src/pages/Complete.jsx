import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import { getUser } from "../lib/supabase.js";
import { C, QUOTES } from "../constants/data.js";

const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

export default function Complete() {
  const { auth } = useAuth();
  const navigate  = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth?.user?.id) return;
    getUser(auth.user.id).then(setUser).catch(console.error);
    // Clear the session from localStorage so next day starts fresh
    localStorage.removeItem("gf_session");
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans',sans-serif", fontWeight:300, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", padding:"2rem", textAlign:"center" }}>

      <div style={{ position:"absolute", inset:0, opacity:0.03, backgroundImage:"repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)", backgroundSize:"64px 64px", pointerEvents:"none" }} />

      <div style={{ zIndex:1, maxWidth:"480px", width:"100%" }}>
        <div style={{ fontSize:"3.5rem", marginBottom:"0.5rem" }}>♛</div>

        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,8vw,3rem)", fontWeight:700, color:C.gold, margin:"0 0 0.5rem" }}>
          Session Complete
        </h1>
        <p style={{ color:C.muted, marginBottom:"2.5rem", fontSize:"0.9rem" }}>
          Outstanding work. Every session brings you closer to the player you want to be.
        </p>

        {/* Stats */}
        <div style={{ display:"flex", gap:"1rem", justifyContent:"center", marginBottom:"2.5rem", flexWrap:"wrap" }}>
          {[
            { v:"50",                          l:"Puzzles solved",  c:C.gold },
            { v:`${user?.streak ?? 1} 🔥`,    l:"Day streak",     c:C.red  },
            { v:`${user?.best_streak ?? 1} 🏆`,l:"Best streak",    c:C.gold },
          ].map(s => (
            <div key={s.l} style={{ padding:"1.25rem 1.5rem", borderRadius:"10px", background:C.card, border:`1px solid ${C.border}`, minWidth:"100px" }}>
              <div style={{ fontSize:"1.6rem", fontWeight:500, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:"0.72rem", color:C.muted, marginTop:"0.2rem" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* 5 stages summary */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"1.25rem", marginBottom:"2rem", textAlign:"left" }}>
          <div style={{ fontSize:"0.68rem", color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"0.75rem" }}>Today's Training</div>
          {[
            { icon:"⚡", label:"50 Tactics puzzles",    color:C.gold   },
            { icon:"♚", label:"Endgame study (10 min)", color:C.blue   },
            { icon:"⚔", label:"10-minute rapid game",   color:C.red    },
            { icon:"◈", label:"Game analysis (5 min)",  color:C.purple },
            { icon:"◉", label:"Opening study (10 min)", color:C.green  },
          ].map(item => (
            <div key={item.label} style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.5rem 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ color:item.color }}>{item.icon}</span>
              <span style={{ fontSize:"0.85rem", color:C.muted }}>{item.label}</span>
              <span style={{ marginLeft:"auto", color:C.green, fontSize:"0.8rem" }}>✓</span>
            </div>
          ))}
        </div>

        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.05rem", fontStyle:"italic", color:C.muted, marginBottom:"2rem" }}>
          "{quote}"
        </p>

        <button onClick={() => navigate("/dashboard")}
          style={{ padding:"0.8rem 2.5rem", fontSize:"0.82rem", background:"transparent", color:C.gold, border:`1px solid ${C.gold}`, borderRadius:"6px", cursor:"pointer", letterSpacing:"0.1em", textTransform:"uppercase" }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
