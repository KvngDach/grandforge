import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;

// ── Users ─────────────────────────────────────────────────────────────────────

/** Create or update a user record after Lichess login */
export async function upsertUser(lichessUser) {
  const { data, error } = await supabase
    .from("users")
    .upsert({
      id:           lichessUser.id,
      username:     lichessUser.username,
      rating_rapid: lichessUser.perfs?.rapid?.rating ?? null,
    }, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Fetch a user's full profile including stats */
export async function getUser(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

// ── Daily Sessions ────────────────────────────────────────────────────────────

/** Get or create today's session for a user */
export async function getOrCreateSession(userId, weekNumber) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Try to get existing session for today
  const { data: existing } = await supabase
    .from("daily_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("session_date", today)
    .single();

  if (existing) return existing;

  // Create a new session
  const { data, error } = await supabase
    .from("daily_sessions")
    .insert({
      user_id:       userId,
      session_date:  today,
      week_number:   weekNumber,
      current_stage: 0,
      puzzles_done:  0,
      completed:     false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update stage progress within today's session */
export async function updateSessionProgress(sessionId, updates) {
  const { error } = await supabase
    .from("daily_sessions")
    .update(updates)
    .eq("id", sessionId);
  if (error) throw error;
}

/** Mark session as complete and update user streak */
export async function completeSession(sessionId, userId) {
  const now   = new Date().toISOString();
  const today = now.split("T")[0];

  // Mark session done
  await supabase
    .from("daily_sessions")
    .update({ completed: true, completed_at: now })
    .eq("id", sessionId);

  // Fetch current user stats to compute streak
  const user = await getUser(userId);
  const lastDate = user.last_session_date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const newStreak = lastDate === yesterday ? (user.streak ?? 0) + 1 : 1;
  const newBest   = Math.max(newStreak, user.best_streak ?? 0);

  await supabase
    .from("users")
    .update({
      streak:             newStreak,
      best_streak:        newBest,
      total_sessions:     (user.total_sessions ?? 0) + 1,
      total_puzzles:      (user.total_puzzles ?? 0) + 50,
      last_session_date:  today,
    })
    .eq("id", userId);

  return { newStreak, newBest };
}

/** Fetch the last N sessions for a user (for history display) */
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
