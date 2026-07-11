import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const firebaseDbUrl = Deno.env.get("VITE_FIREBASE_DATABASE_URL") || "";

    if (!firebaseDbUrl) {
      return new Response(
        JSON.stringify({ error: "Firebase database URL not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dbBase = firebaseDbUrl.replace(/\/$/, "");
    const storiesRes = await fetch(`${dbBase}/stories.json`);
    if (!storiesRes.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch stories: ${storiesRes.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const storiesData = await storiesRes.json() as Record<string, any> | null;
    if (!storiesData) {
      return new Response(
        JSON.stringify({ success: true, deleted: 0, message: "No stories found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = Date.now();
    const expiredIds: string[] = [];

    for (const [storyId, s] of Object.entries(storiesData)) {
      const createdAt = s.createdAt ? new Date(s.createdAt).getTime() : 0;
      if (createdAt && (now - createdAt) >= TWENTY_FOUR_HOURS_MS) {
        expiredIds.push(storyId);
      }
    }

    let deleted = 0;
    for (const id of expiredIds) {
      const delRes = await fetch(`${dbBase}/stories/${id}.json`, { method: "DELETE" });
      if (delRes.ok) deleted++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        deleted,
        message: `Deleted ${deleted} expired stories`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Stories cleanup error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
