import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getDatabase, type Database } from "firebase/database";

const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

export const FIREBASE_DATABASE_URL = "https://grand-auto-luxe-default-rtdb.firebaseio.com";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "grand-auto-luxe.firebaseapp.com",
  databaseURL: "https://grand-auto-luxe-default-rtdb.firebaseio.com",
  projectId: "grand-auto-luxe",
  storageBucket: "grand-auto-luxe.firebasestorage.app",
  messagingSenderId: "813559742956",
  appId: "1:813559742956:web:28eb6494110409491200c9",
};

const requiredFirebaseKeys = ["apiKey", "projectId", "appId", "databaseURL"] as const;
const hasFirebaseConfig = requiredFirebaseKeys.every(
  (key) => typeof firebaseConfig[key] === "string" && firebaseConfig[key].length > 0,
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

let anonymousSignIn: Promise<string> | null = null;
export async function getFirebaseActorId(): Promise<string> {
  if (!auth) throw new Error("Firebase Authentication is unavailable");
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  anonymousSignIn ??= signInAnonymously(auth)
    .then((credential) => credential.user.uid)
    .catch((error) => {
      anonymousSignIn = null;
      throw error;
    });
  return anonymousSignIn;
}

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
