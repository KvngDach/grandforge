import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import { handleCallback, getLichessAccount, saveAuth } from "../lib/lichess.js";
import { upsertUser } from "../lib/supabase.js";
import { C } from "../constants/data.js";

export default function Callback() {
  const { login }  = useAuth();
  const navigate    = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get("code");
    const err    = params.get("error");

    if (err || !code) {
      setError("Lichess login was cancelled or failed. Please try again.");
      return;
    }

    (async () => {
      try {
        // 1. Exchange code for token
        const token = await handleCallback(code);

        // 2. Fetch Lichess account info
        const lichessUser = await getLichessAccount(token);

        // 3. Upsert user in Supabase
        await upsertUser(lichessUser);

        // 4. Save auth to localStorage
        saveAuth(token, lichessUser);

        // 5. Update context + navigate
        login({ token, user: lichessUser });
        navigate("/dashboard", { replace: true });
      } catch (e) {
        console.error(e);
        setError(e.message || "Something went wrong during login.");
      }
    })();
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1rem" }}>
      {error ? (
        <>
          <div style={{ fontSize:"1.5rem" }}>⚠</div>
          <p style={{ color:C.red, maxWidth:"360px", textAlign:"center" }}>{error}</p>
          <button onClick={() => navigate("/")} style={{ padding:"0.6rem 1.5rem", borderRadius:"6px", border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
            Back to home
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize:"2rem", animation:"spin 1s linear infinite" }}>♟</div>
          <p style={{ color:C.muted, fontSize:"0.85rem" }}>Signing you in…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </div>
  );
}
