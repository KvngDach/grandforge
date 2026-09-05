import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createContext, useContext, useState, useEffect } from "react";
import { loadAuth, clearAuth } from "./lib/lichess.js";
import Landing   from "./pages/Landing.jsx";
import Callback  from "./pages/Callback.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Session   from "./pages/Session.jsx";
import Complete  from "./pages/Complete.jsx";

// ── Auth context — shared across all pages ───────────────────────────────────
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);   // { token, user }
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadAuth();
    if (saved) setAuth(saved);
    setReady(true);
  }, []);

  const login  = (data) => setAuth(data);
  const logout = () => { clearAuth(); setAuth(null); };

  if (!ready) return null; // don't flash wrong page while loading
  return <AuthCtx.Provider value={{ auth, login, logout }}>{children}</AuthCtx.Provider>;
}

// ── Route guard: redirect to / if not logged in ───────────────────────────────
function Private({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/" replace />;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<Landing />} />
          <Route path="/callback"  element={<Callback />} />
          <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
          <Route path="/session"   element={<Private><Session /></Private>} />
          <Route path="/complete"  element={<Private><Complete /></Private>} />
          {/* Catch-all */}
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
