import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Sign up with email + password + lichess username */
export async function signUp(email, password, lichessUsername) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // Create user record in our users table
  const { error: dbError } = await supabase.from("users").insert({
    id:       data.user.id,
    username: lichessUsername.trim().toLowerCase(),
    email:    email.trim().toLowerCase(),
  });
  if (dbError) throw dbError;

  return data.user;
}

/** Sign in with email + password */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

/** Sign out */
export async function signOut() {
  await supabase.auth.signOut();
}

/** Get current session (called on app load) */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUser(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertUser(id, username, email) {
  const { data, error } = await supabase
    .from("users")
    .upsert({ id, username, email }, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function getOrCreateSession(userId, weekNumber) {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("daily_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("session_date", today)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("daily_sessions")
    .insert({
      user_id:      userId,
      session_date: today,
      week_number:  weekNumber,
      current_stage: 0,
      puzzles_done:  0,
      completed:     false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSessionProgress(sessionId, updates) {
  const { error } = await supabase
    .from("daily_sessions")
    .update(updates)
    .eq("id", sessionId);
  if (error) throw error;
}

export async function completeSession(sessionId, userId) {
  const now   = new Date().toISOString();
  const today = now.split("T")[0];

  await supabase
    .from("daily_sessions")
    .update({ completed: true, completed_at: now })
    .eq("id", sessionId);

  const user      = await getUser(userId);
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const newStreak = user.last_session_date === yesterday ? (user.streak ?? 0) + 1 : 1;
  const newBest   = Math.max(newStreak, user.best_streak ?? 0);

  await supabase.from("users").update({
    streak:            newStreak,
    best_streak:       newBest,
    total_sessions:    (user.total_sessions ?? 0) + 1,
    total_puzzles:     (user.total_puzzles  ?? 0) + 50,
    last_session_date: today,
  }).eq("id", userId);

  return { newStreak, newBest };
}

export async function getRecentSessions(userId, limit = 7) {
  const { data, error } = await supabase
    .from("daily_sessions")
    .select("session_date, completed, current_stage, week_number")
    .eq("user_id", userId)
    .order("session_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
