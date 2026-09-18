import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getDatabase, type Database } from "firebase/database";

const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0,
);

let _app: FirebaseApp | null = null;

function getApp(): FirebaseApp {
  if (!hasFirebaseConfig) throw new Error("Firebase configuration is unavailable");
  if (_app) return _app;
  try {
    _app = initializeApp(firebaseConfig);
  } catch (e) {
    if (
      e instanceof Error &&
      /already exists|duplicate-app/i.test(e.message)
    ) {
      _app = initializeApp(firebaseConfig, "secondary");
    } else {
      throw e;
    }
  }
  return _app;
}

function safeInit<T>(fn: () => T): T | null {
  if (!isBrowser) return null;
  try {
    return fn();
  } catch (e) {
    console.warn("Firebase service init failed:", e);
    return null;
  }
}

export const auth = safeInit(() => getAuth(getApp()));
export const db = safeInit(() => getFirestore(getApp()));
export const realtimeDb = safeInit(() => getDatabase(getApp()));
export const storage = safeInit(() => getStorage(getApp()));

export const ADMIN_PHONES = ["0781606765", "781606765"];

export function normalizePhone(raw: unknown): string {
  if (!raw) return "";
  let digits = String(raw ?? "").replace(/\s|-/g, "");
  if (digits.startsWith("+213")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("213")) digits = "0" + digits.slice(3);
  else if (!digits.startsWith("0")) digits = "0" + digits;
  return digits;
}

export function phoneToEmail(phone: string): string {
  return `${normalizePhone(phone).replace(/[^0-9]/g, "")}@grandauto.dz`;
}
