// Local fallback session used when Supabase auth is unreachable during signup.
// Persists a lightweight profile in localStorage so the user can continue browsing
// during the 72-hour free trial without a real auth session.

const STORAGE_KEY = "grand_auto_local_session_v1";

export type LocalUserSession = {
  user: {
    id: string;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
  };
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    trial_started_at: string;
    subscription_status: "trial";
    subscription_until: null;
  };
  createdAt: string;
  hoursLeft: number;
};

type StoredSession = Omit<LocalUserSession, "hoursLeft">;

function computeHoursLeft(createdAt: string): number {
  const ends = new Date(createdAt).getTime() + 72 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((ends - Date.now()) / (60 * 60 * 1000)));
}

export function getLocalUserSession(): LocalUserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.user?.id || !parsed?.createdAt) return null;
    return { ...parsed, hoursLeft: computeHoursLeft(parsed.createdAt) };
  } catch {
    return null;
  }
}

export function createLocalUserSession(input: {
  first_name: string;
  last_name: string;
  phone: string;
}): LocalUserSession {
  const id = `local-${crypto.randomUUID?.() ?? Date.now().toString(36)}`;
  const createdAt = new Date().toISOString();
  const stored: StoredSession = {
    user: {
      id,
      email: `${input.phone}@local.grandautoluxe`,
      phone: input.phone,
      first_name: input.first_name,
      last_name: input.last_name,
    },
    profile: {
      id,
      first_name: input.first_name,
      last_name: input.last_name,
      phone: input.phone,
      trial_started_at: createdAt,
      subscription_status: "trial",
      subscription_until: null,
    },
    createdAt,
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // ignore quota errors
    }
  }
  return { ...stored, hoursLeft: computeHoursLeft(createdAt) };
}

export function clearLocalUserSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
