import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createContext, useContext, useState, useEffect } from "react";
import supabase, { getUser } from "./lib/supabase.js";
import Landing   from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Session   from "./pages/Session.jsx";
import Complete  from "./pages/Complete.jsx";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [auth,  setAuth]  = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("getSession error:", error);
          if (mounted) setReady(true);
          return;
        }

        if (session?.user) {
          try {
            const dbUser = await getUser(session.user.id);
            if (mounted) setAuth({ session, dbUser });
          } catch (e) {
            console.error("getUser error:", e);
            // Auth session exists but no DB record — sign out and reset
            await supabase.auth.signOut();
            if (mounted) setAuth(null);
          }
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        if (mounted) setReady(true);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          if (mounted) setAuth(null);
          return;
        }
        if (session?.user) {
          try {
            const dbUser = await getUser(session.user.id);
            if (mounted) setAuth({ session, dbUser });
          } catch (e) {
            console.error("onAuthStateChange getUser error:", e);
            if (mounted) setAuth(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setAuth(null);
  };

  if (!ready) return (
    <div style={{ minHeight:"100vh", background:"#09090c", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1rem" }}>
      <div style={{ fontSize:"2rem", color:"#c9a84c" }}>♟</div>
      <span style={{ color:"#6b6760", fontFamily:"'DM Sans',sans-serif", fontSize:"0.85rem" }}>Loading GrandForge…</span>
    </div>
  );

  return (
    <AuthCtx.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

function Private({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<Landing />} />
          <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
          <Route path="/session"   element={<Private><Session /></Private>} />
          <Route path="/complete"  element={<Private><Complete /></Private>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
