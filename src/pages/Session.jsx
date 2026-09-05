import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import { updateSessionProgress, completeSession } from "../lib/supabase.js";
import { C, STAGES, CURRICULUM } from "../constants/data.js";

const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

// ── Stage components ──────────────────────────────────────────────────────────

function TacticsStage({ puzzles, onAdd, unlocked, week }) {
  const pct = (puzzles / 50) * 100;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
        <div>
          <span style={{ fontSize:"2.4rem", fontWeight:400, color:C.gold }}>{puzzles}</span>
          <span style={{ color:C.muted, fontSize:"1rem" }}> / 50 puzzles</span>
        </div>
        <span style={{ padding:"0.3rem 0.8rem", borderRadius:"20px", background:puzzles>=50?`${C.green}20`:C.surface, color:puzzles>=50?C.green:C.muted, border:`1px solid ${puzzles>=50?C.green:C.dim}`, fontSize:"0.78rem" }}>
          {puzzles >= 50 ? "✓ Complete" : `${50 - puzzles} remaining`}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height:"5px", background:C.dim, borderRadius:"3px", marginBottom:"1.5rem" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.gold},#e8c96a)`, borderRadius:"3px", transition:"width 0.25s" }} />
      </div>

      {/* Instructions box */}
      <div style={{ background:C.surface, border:`1px dashed ${C.border}`, borderRadius:"10px", padding:"1.75rem", textAlign:"center", marginBottom:"1.25rem" }}>
        <div style={{ fontSize:"2rem", marginBottom:"0.75rem" }}>⚡</div>
        <p style={{ color:C.text, margin:"0 0 0.5rem", fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem" }}>
          Open Lichess and solve 50 puzzles
        </p>
        <p style={{ color:C.muted, fontSize:"0.8rem", margin:"0 0 1.25rem" }}>
          Each time you solve a puzzle on Lichess, come back here and tap <strong style={{ color:C.text }}>Mark +1</strong>. Do this 50 times.
        </p>
        <div style={{ display:"flex", gap:"0.75rem", justifyContent:"center", flexWrap:"wrap" }}>
          <a href="https://lichess.org/training" target="_blank" rel="noopener noreferrer"
            style={{ padding:"0.7rem 1.5rem", borderRadius:"8px", textDecoration:"none", background:`${C.gold}20`, color:C.gold, border:`1px solid ${C.gold}50`, fontSize:"0.82rem" }}>
            Open Lichess Puzzles ↗
          </a>
          <button onClick={onAdd} disabled={puzzles >= 50}
            style={{ padding:"0.7rem 1.5rem", borderRadius:"8px", border:`1px solid ${puzzles>=50?C.dim:C.border}`, background:C.card, color:puzzles>=50?C.dim:C.text, cursor:puzzles>=50?"not-allowed":"pointer", fontSize:"0.82rem" }}>
            {puzzles >= 50 ? "✓ All done" : "Mark +1 Puzzle"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TimerStage({ stage, timeLeft, week }) {
  const done = timeLeft === 0;
  const isEndgame  = stage.id === "endgame";
  const isAnalyse  = stage.id === "analyse";
  const isStudy    = stage.id === "study";

  const href = isAnalyse
    ? "https://lichess.org/analysis"
    : isEndgame
    ? week.endgameUrl ?? "https://lichess.org/study"
    : week.openingUrl ?? "https://lichess.org/study";

  const label = isEndgame
    ? `Week ${week.week}: ${week.endgame}`
    : isAnalyse
    ? "Open your last game on Lichess analysis board"
    : `Week ${week.week}: ${week.opening}`;

  return (
    <div style={{ textAlign:"center" }}>
      {/* Countdown circle */}
      <div style={{ width:"130px", height:"130px", borderRadius:"50%", margin:"0 auto 1.75rem", border:`4px solid ${done?stage.color:C.dim}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:C.surface, boxShadow:done?`0 0 28px ${stage.color}50`:"none", transition:"all 0.5s" }}>
        <div style={{ fontSize:"1.9rem", fontWeight:300, color:done?stage.color:C.text, letterSpacing:"-0.02em" }}>{fmt(timeLeft ?? stage.duration)}</div>
        <div style={{ fontSize:"0.6rem", color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em" }}>{done?"Done ✓":"remaining"}</div>
      </div>

      <div style={{ background:C.surface, border:`1px dashed ${C.border}`, borderRadius:"10px", padding:"2.25rem 1.5rem", marginBottom:"1.25rem" }}>
        <div style={{ fontSize:"1.6rem", color:stage.color, marginBottom:"0.6rem" }}>{stage.icon}</div>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", color:C.text, margin:"0 0 0.4rem" }}>{label}</p>
        <p style={{ color:C.muted, fontSize:"0.8rem", margin:"0 0 1.25rem" }}>
          {done ? "Time is up — you may continue when ready." : `Timer is running. Stay focused for ${fmt(timeLeft ?? stage.duration)} more.`}
        </p>
        <a href={href} target="_blank" rel="noopener noreferrer"
          style={{ padding:"0.55rem 1.25rem", borderRadius:"6px", border:`1px solid ${stage.color}`, color:stage.color, textDecoration:"none", fontSize:"0.78rem" }}>
          Open on Lichess ↗
        </a>
      </div>
    </div>
  );
}

function PlayStage({ unlocked, onDone }) {
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ background:C.surface, border:`1px dashed ${C.border}`, borderRadius:"10px", padding:"2.5rem 1.5rem", marginBottom:"1.25rem" }}>
        <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>⚔</div>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.15rem", color:C.text, margin:"0 0 0.4rem" }}>
          Play a 10+0 Rapid Game on Lichess
        </p>
        <p style={{ color:C.muted, fontSize:"0.82rem", margin:"0 0 1.5rem" }}>
          Apply everything you have trained today. Think on every single move. No blundering on instinct.
        </p>
        <a href="https://lichess.org/?speed=rapid" target="_blank" rel="noopener noreferrer"
          style={{ display:"inline-block", padding:"0.75rem 2rem", borderRadius:"8px", background:`linear-gradient(135deg,${C.red},#b83030)`, color:"#fff", textDecoration:"none", fontSize:"0.85rem", fontWeight:500 }}>
          Play on Lichess ↗
        </a>
      </div>
      <button onClick={onDone} disabled={unlocked}
        style={{ padding:"0.7rem 2rem", borderRadius:"8px", cursor:unlocked?"default":"pointer", background:`${unlocked?C.green:C.red}20`, color:unlocked?C.green:C.red, border:`1px solid ${unlocked?C.green:C.red}`, fontSize:"0.82rem" }}>
        {unlocked ? "✓ Game recorded" : "I've finished my game"}
      </button>
    </div>
  );
}

// ── Main Session page ─────────────────────────────────────────────────────────
export default function Session() {
  const { auth }  = useAuth();
  const navigate   = useNavigate();
  const timerRef   = useRef(null);

  // Restore session from localStorage
  const raw = localStorage.getItem("gf_session");
  const saved = raw ? JSON.parse(raw) : null;

  const [stageIdx, setStageIdx] = useState(saved?.current_stage ?? 0);
  const [done,     setDone]     = useState(
    Array.from({ length: saved?.current_stage ?? 0 }, (_, i) => i)
  );
  const [puzzles,  setPuzzles]  = useState(saved?.puzzles_done ?? 0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [unlocked, setUnlocked] = useState(false);

  const weekNum = saved?.week_number ?? 1;
  const week    = CURRICULUM[(weekNum - 1) % 12];
  const stage   = STAGES[stageIdx];
  const sessionId = saved?.id;
  const userId    = auth?.user?.id;

  // Block accidental tab close during session
  useEffect(() => {
    const warn = e => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  // Init timer when stage changes
  useEffect(() => {
    clearInterval(timerRef.current);
    setUnlocked(false);
    if (stage.type === "timer") {
      setTimeLeft(stage.duration);
      timerRef.current = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) { clearInterval(timerRef.current); setUnlocked(true); return 0; }
          return p - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(null);
    }
    return () => clearInterval(timerRef.current);
  }, [stageIdx]);

  // Save progress to Supabase whenever stage changes
  useEffect(() => {
    if (!sessionId) return;
    updateSessionProgress(sessionId, { current_stage: stageIdx, puzzles_done: puzzles }).catch(console.error);
  }, [stageIdx]);

  const handleAddPuzzle = () => {
    const n = puzzles + 1;
    setPuzzles(n);
    if (n >= 50) setUnlocked(true);
    // Persist puzzle count
    if (sessionId) updateSessionProgress(sessionId, { puzzles_done: n }).catch(console.error);
  };

  const handleAdvance = async () => {
    const next = stageIdx + 1;
    setDone(d => [...d, stageIdx]);

    if (next >= STAGES.length) {
      // Session complete!
      try { await completeSession(sessionId, userId); } catch(e) { console.error(e); }
      navigate("/complete", { replace: true });
    } else {
      setStageIdx(next);
      // Update local storage so resume works
      if (saved) {
        saved.current_stage = next;
        localStorage.setItem("gf_session", JSON.stringify(saved));
      }
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>
      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"1.5rem 1rem 3rem" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.75rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <span style={{ color:C.gold }}>♟</span>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", color:C.gold, letterSpacing:"0.12em" }}>GRANDFORGE</span>
          </div>
          <div style={{ fontSize:"0.7rem", color:C.muted, letterSpacing:"0.12em", textTransform:"uppercase" }}>
            🔒 Session in Progress
          </div>
        </div>

        {/* Progress stepper */}
        <div style={{ display:"flex", alignItems:"center", background:C.surface, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"0.9rem 1rem", marginBottom:"2rem" }}>
          {STAGES.flatMap((s, i) => {
            const isDone   = done.includes(i);
            const isActive = i === stageIdx;
            const els = [(
              <div key={s.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.3rem" }}>
                <div style={{ width:"34px", height:"34px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.88rem", background:isDone?s.color:isActive?`${s.color}25`:C.card, border:`2px solid ${isDone?s.color:isActive?s.color:C.dim}`, color:isDone?"#0a0800":isActive?s.color:C.dim, boxShadow:isActive?`0 0 12px ${s.color}50`:"none", transition:"all 0.3s" }}>
                  {isDone ? "✓" : s.icon}
                </div>
                <span style={{ fontSize:"0.62rem", color:isActive?C.text:C.dim }}>{s.label}</span>
              </div>
            )];
            if (i < STAGES.length - 1) {
              els.push(<div key={`l${i}`} style={{ flex:1, height:"2px", background:isDone?s.color:C.dim, marginBottom:"20px", transition:"background-color 0.4s" }} />);
            }
            return els;
          })}
        </div>

        {/* Stage card */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"14px", overflow:"hidden", marginBottom:"1.25rem" }}>
          {/* Stage header */}
          <div style={{ padding:"1.5rem 1.75rem", borderBottom:`1px solid ${C.border}`, background:`linear-gradient(135deg,${stage.color}18,transparent)` }}>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
              <div style={{ width:"48px", height:"48px", borderRadius:"10px", background:`${stage.color}20`, border:`1px solid ${stage.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", color:stage.color, flexShrink:0 }}>
                {stage.icon}
              </div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:"0.65rem", flexWrap:"wrap" }}>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.7rem", fontWeight:600, margin:0 }}>{stage.label}</h2>
                  <span style={{ fontSize:"0.68rem", padding:"0.18rem 0.6rem", borderRadius:"20px", background:`${stage.color}20`, color:stage.color, border:`1px solid ${stage.color}40` }}>{stage.sub}</span>
                </div>
                <p style={{ color:C.muted, margin:"0.2rem 0 0", fontSize:"0.82rem" }}>{stage.desc}</p>
              </div>
            </div>
          </div>

          {/* Stage body */}
          <div style={{ padding:"1.75rem" }}>
            {stage.id === "tactics" && <TacticsStage puzzles={puzzles} onAdd={handleAddPuzzle} unlocked={unlocked} week={week} />}
            {stage.type === "timer"  && <TimerStage stage={stage} timeLeft={timeLeft} week={week} />}
            {stage.id === "game"     && <PlayStage unlocked={unlocked} onDone={() => setUnlocked(true)} />}

            {/* Tip */}
            <div style={{ marginTop:"1.25rem", padding:"0.75rem 1rem", borderRadius:"8px", background:C.surface, border:`1px solid ${C.border}`, display:"flex", gap:"0.5rem", alignItems:"flex-start" }}>
              <span style={{ color:C.gold, flexShrink:0 }}>◆</span>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.95rem", color:C.muted, fontStyle:"italic" }}>{stage.tip}</span>
            </div>
          </div>
        </div>

        {/* Continue button */}
        <button onClick={handleAdvance} disabled={!unlocked}
          style={{ width:"100%", padding:"1rem", borderRadius:"8px", cursor:unlocked?"pointer":"not-allowed", background:unlocked?`linear-gradient(135deg,${stage.color},${stage.color}bb)`:C.surface, color:unlocked?"#0a0800":C.dim, fontWeight:unlocked?600:400, border:`1px solid ${unlocked?stage.color:C.border}`, fontSize:"0.85rem", letterSpacing:"0.1em", textTransform:"uppercase", boxShadow:unlocked?`0 4px 20px ${stage.color}30`:"none", transition:"all 0.3s" }}>
          {!unlocked
            ? `🔒 ${stage.type === "count" ? "Solve all 50 puzzles first" : stage.type === "timer" ? `Locked — ${fmt(timeLeft ?? stage.duration)} remaining` : "Mark your game as done first"}`
            : stageIdx < STAGES.length - 1
            ? `Continue to ${STAGES[stageIdx + 1].label} →`
            : "Complete Today's Session ✓"}
        </button>
      </div>
    </div>
  );
}
