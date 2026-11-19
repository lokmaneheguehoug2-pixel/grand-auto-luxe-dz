import { get, off, onValue, push, ref, set } from "firebase/database";
import type { DataSnapshot } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

export type VehicleComment = {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
};

export type VehicleLikeState = { count: number; liked: boolean };

const pendingViewWrites = new Map<string, Promise<boolean>>();
const viewedInMemory = new Set<string>();

function requireDatabase() {
  if (!realtimeDb)
    throw new Error("Firebase Realtime Database is not configured");
  return realtimeDb;
}

function parseComments(value: unknown): VehicleComment[] {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([id, raw]) => {
      if (!raw || typeof raw !== "object") return [];
      const item = raw as Record<string, unknown>;
      const text = typeof item.text === "string" ? item.text.trim() : "";
      if (!text) return [];
      return [
        {
          id,
          text,
          authorId: typeof item.authorId === "string" ? item.authorId : "",
          createdAt: typeof item.createdAt === "string" ? item.createdAt : "",
        },
      ];
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function subscribeAllVehicleComments(
  onComments: (comments: Record<string, VehicleComment[]>) => void,
  onError: (error: Error) => void,
) {
  if (!realtimeDb) {
    onError(new Error("Firebase Realtime Database is not configured"));
    return () => undefined;
  }

  const commentsRef = ref(realtimeDb, "vehicle_comments");
  const listener = (snapshot: DataSnapshot) => {
    const raw = snapshot.val();
    const next: Record<string, VehicleComment[]> = {};
    if (raw && typeof raw === "object") {
      Object.entries(raw as Record<string, unknown>).forEach(
        ([vehicleId, value]) => {
          next[vehicleId] = parseComments(value);
        },
      );
    }
    onComments(next);
  };
  onValue(commentsRef, listener, onError);
  return () => off(commentsRef, "value", listener);
}

export function subscribeVehicleComments(
  vehicleId: string,
  onComments: (comments: VehicleComment[]) => void,
  onError: (error: Error) => void,
) {
  if (!realtimeDb) {
    onError(new Error("Firebase Realtime Database is not configured"));
    return () => undefined;
  }

  const commentsRef = ref(realtimeDb, `vehicle_comments/${vehicleId}`);
  const listener = (snapshot: DataSnapshot) => {
    onComments(parseComments(snapshot.val()));
  };
  onValue(commentsRef, listener, onError);
  return () => off(commentsRef, "value", listener);
}

export async function addVehicleComment(
  vehicleId: string,
  authorId: string,
  text: string,
) {
  const database = requireDatabase();
  const normalizedText = text.trim();
  if (!vehicleId || !authorId || !normalizedText)
    throw new Error("A vehicle, author, and comment are required");

  const commentRef = push(ref(database, `vehicle_comments/${vehicleId}`));
  if (!commentRef.key)
    throw new Error("Firebase could not allocate a comment ID");
  const comment: VehicleComment = {
    id: commentRef.key,
    text: normalizedText,
    authorId,
    createdAt: new Date().toISOString(),
  };
  await set(commentRef, {
    text: comment.text,
    authorId: comment.authorId,
    createdAt: comment.createdAt,
  });
  return comment;
}

export async function readVehicleLikeState(
  vehicleId: string,
  uid: string,
): Promise<VehicleLikeState> {
  const database = requireDatabase();
  const snapshot = await get(ref(database, `vehicleLikes/${vehicleId}`));
  const raw = snapshot.val();
  const users =
    raw && typeof raw === "object"
      ? Object.keys(raw as Record<string, unknown>)
      : [];
  return { count: users.length, liked: users.includes(uid) };
}

export async function readVehicleFavoriteState(vehicleId: string, uid: string) {
  const database = requireDatabase();
  const snapshot = await get(
    ref(database, `vehicleFavorites/${vehicleId}/${uid}`),
  );
  return snapshot.exists();
}

export async function recordVehicleViewOnce(
  vehicleId: string,
  viewerId: string,
) {
  const database = requireDatabase();
  const key = `${viewerId}:${vehicleId}`;
  const storageKey = `grand-auto-luxe-viewed:${key}`;
  const alreadyViewed = () => {
    if (viewedInMemory.has(key)) return true;
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  };

  if (alreadyViewed()) return false;
  const pending = pendingViewWrites.get(key);
  if (pending) {
    await pending;
    return false;
  }

  const write = (async () => {
    if (alreadyViewed()) return false;
    const viewRef = push(ref(database, "vehicle_views"));
    await set(viewRef, {
      vehicle_id: vehicleId,
      viewer_id: viewerId,
      created_at: new Date().toISOString(),
    });
    viewedInMemory.add(key);
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(storageKey, "1");
      } catch {
        // The in-memory guard still prevents duplicate writes for this page session.
      }
    }
    return true;
  })();

  pendingViewWrites.set(key, write);
  try {
    return await write;
  } finally {
    pendingViewWrites.delete(key);
  }
}
