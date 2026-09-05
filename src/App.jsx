import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createContext, useContext, useState, useEffect } from "react";
import supabase, { getUser } from "./lib/supabase.js";
import Landing   from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Session   from "./pages/Session.jsx";
import Complete  from "./pages/Complete.jsx";

// ── Auth context ──────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [auth,  setAuth]  = useState(null);  // { session, dbUser }
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check for existing session on load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        try {
          const dbUser = await getUser(session.user.id);
          setAuth({ session, dbUser });
        } catch {
          setAuth(null);
        }
      }
      setReady(true);
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          try {
            const dbUser = await getUser(session.user.id);
            setAuth({ session, dbUser });
          } catch {
            setAuth(null);
          }
        } else {
          setAuth(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setAuth(null);
  };

  if (!ready) return (
    <div style={{ minHeight:"100vh", background:"#09090c", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ color:"#6b6760", fontFamily:"'DM Sans',sans-serif" }}>Loading…</span>
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
