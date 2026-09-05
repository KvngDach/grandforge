import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import { getUser, getOrCreateSession, getRecentSessions } from "../lib/supabase.js";
import { C, CURRICULUM, STAGES, QUOTES } from "../constants/data.js";

const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

function weekForUser(joinedAt) {
  const ms      = Date.now() - new Date(joinedAt).getTime();
  const daysDiff = Math.floor(ms / 86400000);
  return (Math.floor(daysDiff / 7) % 12) + 1;
}

export default function Dashboard() {
  const { auth, logout } = useAuth();
  const navigate          = useNavigate();
  const [dbUser,  setDbUser]  = useState(null);
  const [session, setSession] = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = auth?.user?.id;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const user    = await getUser(userId);
        const weekNum = weekForUser(user.created_at);
        const sess    = await getOrCreateSession(userId, weekNum);
        const hist    = await getRecentSessions(userId);
        setDbUser(user);
        setSession(sess);
        setRecent(hist);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const weekNum = dbUser ? weekForUser(dbUser.created_at) : 1;
  const week    = CURRICULUM[(weekNum - 1) % 12];

  const handleBegin = () => {
    // Pass session id so Session page can update it in Supabase
    localStorage.setItem("gf_session", JSON.stringify(session));
    navigate("/session");
  };

  const alreadyDone = session?.completed;

  if (loading) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ color:C.muted, fontFamily:"'DM Sans',sans-serif" }}>Loading…</span>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>
      <div style={{ maxWidth:"680px", margin:"0 auto", padding:"1.75rem 1rem 3rem" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <span style={{ color:C.gold }}>♟</span>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", color:C.gold, letterSpacing:"0.12em" }}>GRANDFORGE</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:"0.8rem" }}>{auth.user.username}</div>
              <div style={{ fontSize:"0.7rem", color:C.muted }}>{auth.user.perfs?.rapid?.rating ?? "?"} rapid</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.3rem", padding:"0.4rem 0.8rem", borderRadius:"20px", background:C.card, border:`1px solid ${C.border}` }}>
              <span>🔥</span>
              <span style={{ fontWeight:500, color:C.gold }}>{dbUser?.streak ?? 0}</span>
              <span style={{ color:C.muted, fontSize:"0.72rem" }}>days</span>
            </div>
            <button onClick={logout} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:"0.75rem" }}>logout</button>
          </div>
        </div>

        {/* Today's session card */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"14px", padding:"1.75rem", marginBottom:"1.25rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.5rem" }}>
            <div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.9rem", fontWeight:600, margin:"0 0 0.2rem" }}>Today's Session</h2>
              <p style={{ color:C.muted, fontSize:"0.78rem", margin:0 }}>Week {weekNum} · {new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" })}</p>
            </div>
            <span style={{ padding:"0.25rem 0.7rem", borderRadius:"20px", background:alreadyDone?`${C.green}20`:C.goldFade, border:`1px solid ${alreadyDone?C.green:C.gold}44`, fontSize:"0.7rem", color:alreadyDone?C.green:C.gold }}>
              {alreadyDone ? "✓ Completed" : session?.current_stage > 0 ? `Stage ${session.current_stage + 1} of 5` : "Not started"}
            </span>
          </div>

          {/* Stage pills */}
          <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.75rem", flexWrap:"wrap" }}>
            {STAGES.map((s, i) => {
              const done = alreadyDone || i < (session?.current_stage ?? 0);
              const active = !alreadyDone && i === (session?.current_stage ?? 0);
              return (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:"0.4rem", padding:"0.45rem 0.8rem", borderRadius:"6px", background: done?`${s.color}20`:C.surface, border:`1px solid ${done?s.color:active?s.color:C.border}`, fontSize:"0.78rem", color:done?s.color:active?s.color:C.muted }}>
                  <span style={{ color:s.color }}>{done?"✓":s.icon}</span> {s.label}
                </div>
              );
            })}
          </div>

          <button
            onClick={alreadyDone ? undefined : handleBegin}
            disabled={alreadyDone}
            style={{ width:"100%", padding:"1rem", background:alreadyDone?C.surface:`linear-gradient(135deg,${C.gold},#a8882c)`, color:alreadyDone?C.dim:"#0a0800", fontWeight:alreadyDone?300:600, fontSize:"0.88rem", border:`1px solid ${alreadyDone?C.border:C.gold}`, borderRadius:"8px", cursor:alreadyDone?"default":"pointer", letterSpacing:"0.1em", textTransform:"uppercase", boxShadow:alreadyDone?"none":`0 4px 20px ${C.gold}30` }}
          >
            {alreadyDone ? "Session complete — see you tomorrow ✓" : session?.current_stage > 0 ? "Resume Session ▶" : "Begin Session ▶"}
          </button>
        </div>

        {/* Curriculum + stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.25rem" }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"1.25rem" }}>
            <div style={{ fontSize:"0.68rem", color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"0.75rem" }}>Week {weekNum} Curriculum</div>
            <div style={{ marginBottom:"0.6rem" }}>
              <div style={{ fontSize:"0.65rem", color:C.muted, marginBottom:"0.2rem" }}>Endgame</div>
              <div style={{ color:C.blue, fontSize:"0.85rem" }}>{week.endgame}</div>
            </div>
            <div>
              <div style={{ fontSize:"0.65rem", color:C.muted, marginBottom:"0.2rem" }}>Opening</div>
              <div style={{ color:C.green, fontSize:"0.85rem" }}>{week.opening}</div>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            {[
              { v: dbUser?.total_sessions ?? 0, l:"Sessions done", c:C.gold },
              { v: dbUser?.total_puzzles ?? 0,  l:"Puzzles solved", c:C.gold },
              { v: `${dbUser?.best_streak ?? 0} 🔥`, l:"Best streak", c:C.red },
            ].map(s => (
              <div key={s.l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"0.75rem 1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"0.75rem", color:C.muted }}>{s.l}</span>
                <span style={{ fontSize:"1rem", fontWeight:500, color:s.c }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day history */}
        {recent.length > 0 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"1.25rem", marginBottom:"1.25rem" }}>
            <div style={{ fontSize:"0.68rem", color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"0.75rem" }}>Last 7 Days</div>
            <div style={{ display:"flex", gap:"0.5rem" }}>
              {recent.slice(0,7).reverse().map((s, i) => (
                <div key={i} title={s.session_date} style={{ flex:1, height:"36px", borderRadius:"4px", background:s.completed?`${C.green}30`:s.current_stage>0?`${C.gold}20`:C.surface, border:`1px solid ${s.completed?C.green:s.current_stage>0?C.gold:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", color:s.completed?C.green:C.muted }}>
                  {s.completed?"✓":s.current_stage>0?"…":"·"}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quote */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"1.25rem", textAlign:"center" }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", fontStyle:"italic", color:C.muted, margin:0 }}>"{quote}"</p>
        </div>
      </div>
    </div>
  );
}
