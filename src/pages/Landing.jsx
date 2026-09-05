import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import { signIn, signUp, getUser } from "../lib/supabase.js";
import { C, STAGES } from "../constants/data.js";

export default function Landing() {
  const { auth, setAuth } = useAuth();
  const navigate           = useNavigate();

  const [mode,     setMode]     = useState("login");   // "login" | "signup"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");        // Lichess username (signup only)
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => { if (auth) navigate("/dashboard"); }, [auth]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!username.trim()) throw new Error("Please enter your Lichess username.");
        const user   = await signUp(email, password, username);
        const dbUser = await getUser(user.id);
        setAuth({ session: { user }, dbUser });
      } else {
        const user   = await signIn(email, password);
        const dbUser = await getUser(user.id);
        setAuth({ session: { user }, dbUser });
      }
      navigate("/dashboard");
    } catch (e) {
      setError(e.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "0.75rem 1rem",
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: "6px", color: C.text, fontSize: "0.88rem",
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block", fontSize: "0.72rem", color: C.muted,
    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem",
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans',sans-serif", fontWeight:300, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", padding:"2rem" }}>

      {/* Checkerboard background */}
      <div style={{ position:"absolute", inset:0, opacity:0.03, backgroundImage:"repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)", backgroundSize:"64px 64px", pointerEvents:"none" }} />

      <div style={{ zIndex:1, width:"100%", maxWidth:"420px" }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.3rem" }}>♟</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.8rem", fontWeight:700, color:C.gold, margin:"0 0 0.2rem", letterSpacing:"0.12em", lineHeight:1 }}>GRANDFORGE</h1>
          <p style={{ color:C.muted, fontSize:"0.72rem", letterSpacing:"0.25em", textTransform:"uppercase", margin:0 }}>Your Daily Chess Ritual</p>
        </div>

        {/* Stage pills */}
        <div style={{ display:"flex", gap:"0.5rem", justifyContent:"center", marginBottom:"2rem", flexWrap:"wrap" }}>
          {STAGES.map(s => (
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:"0.35rem", padding:"0.4rem 0.7rem", borderRadius:"6px", border:`1px solid ${C.border}`, background:C.surface, fontSize:"0.7rem", color:C.muted }}>
              <span style={{ color:s.color }}>{s.icon}</span> {s.label}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"14px", padding:"1.75rem" }}>

          {/* Tab switcher */}
          <div style={{ display:"flex", background:C.surface, borderRadius:"8px", padding:"3px", marginBottom:"1.5rem" }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); }}
                style={{ flex:1, padding:"0.55rem", borderRadius:"6px", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:"0.82rem", fontWeight: mode===m ? 500 : 300, background: mode===m ? C.gold : "transparent", color: mode===m ? "#0a0800" : C.muted, transition:"all 0.2s" }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem", marginBottom:"1.25rem" }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" style={inputStyle}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" style={inputStyle}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>

            {mode === "signup" && (
              <div>
                <label style={labelStyle}>Lichess Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. Chesswithdach_Yt" style={inputStyle}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                <p style={{ fontSize:"0.7rem", color:C.muted, margin:"0.4rem 0 0" }}>
                  Your Lichess username so we can link your games and rating.
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding:"0.7rem 1rem", borderRadius:"6px", background:`${C.red}15`, border:`1px solid ${C.red}40`, color:C.red, fontSize:"0.8rem", marginBottom:"1rem" }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            style={{ width:"100%", padding:"0.85rem", background:`linear-gradient(135deg,${C.gold},#a8882c)`, color:"#0a0800", fontWeight:600, fontSize:"0.85rem", border:"none", borderRadius:"6px", cursor:loading?"not-allowed":"pointer", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", opacity:loading?0.7:1 }}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </div>

        <p style={{ textAlign:"center", color:C.dim, fontSize:"0.7rem", marginTop:"1.25rem" }}>
          Free forever · No subscription · No ads
        </p>
      </div>
    </div>
  );
}
