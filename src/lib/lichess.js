// ─── Lichess OAuth 2.0 with PKCE ─────────────────────────────────────────────
// No client secret needed — PKCE is fully client-side safe.

const CLIENT_ID   = import.meta.env.VITE_LICHESS_CLIENT_ID || "grandforge";
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const LICHESS_HOST = "https://lichess.org";

// ── PKCE helpers ─────────────────────────────────────────────────────────────
function generateVerifier() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function generateChallenge(verifier) {
  const data   = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// ── Start login flow ─────────────────────────────────────────────────────────
export async function startOAuth() {
  const verifier   = generateVerifier();
  const challenge  = await generateChallenge(verifier);

  // Persist verifier so the callback page can use it
  sessionStorage.setItem("pkce_verifier", verifier);

  const params = new URLSearchParams({
    response_type:         "code",
    client_id:             CLIENT_ID,
    redirect_uri:          REDIRECT_URI,
    scope:                 "preference:read",
    code_challenge_method: "S256",
    code_challenge:        challenge,
  });

  window.location.href = `${LICHESS_HOST}/oauth?${params}`;
}

// ── Handle callback — exchange code for token ────────────────────────────────
export async function handleCallback(code) {
  const verifier = sessionStorage.getItem("pkce_verifier");
  if (!verifier) throw new Error("Missing PKCE verifier. Please try logging in again.");

  const res = await fetch(`${LICHESS_HOST}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "authorization_code",
      code,
      code_verifier: verifier,
      redirect_uri:  REDIRECT_URI,
      client_id:     CLIENT_ID,
    }),
  });

  if (!res.ok) throw new Error("Failed to exchange code for token.");
  const { access_token } = await res.json();
  sessionStorage.removeItem("pkce_verifier");
  return access_token;
}

// ── Fetch account info ────────────────────────────────────────────────────────
export async function getLichessAccount(token) {
  const res = await fetch(`${LICHESS_HOST}/api/account`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Lichess account.");
  return res.json(); // { id, username, perfs: { rapid: { rating } } }
}

// ── Auth state helpers (localStorage) ────────────────────────────────────────
export function saveAuth(token, user) {
  localStorage.setItem("gf_token", token);
  localStorage.setItem("gf_user", JSON.stringify(user));
}

export function loadAuth() {
  const token = localStorage.getItem("gf_token");
  const raw   = localStorage.getItem("gf_user");
  if (!token || !raw) return null;
  try { return { token, user: JSON.parse(raw) }; }
  catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem("gf_token");
  localStorage.removeItem("gf_user");
}
