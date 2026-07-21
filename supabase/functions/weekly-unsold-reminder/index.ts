import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const REMINDER_TITLE = "Has your vehicle been sold?";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body is OK
    }

    const firebaseDbUrl = body.firebaseDbUrl || Deno.env.get("VITE_FIREBASE_DATABASE_URL") || "";

    if (!firebaseDbUrl) {
      return new Response(
        JSON.stringify({ error: "Firebase database URL not provided. Pass firebaseDbUrl in the request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dbBase = firebaseDbUrl.replace(/\/$/, "");

    const vehiclesRes = await fetch(`${dbBase}/vehicles.json`);
    if (!vehiclesRes.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch vehicles: ${vehiclesRes.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vehiclesData = await vehiclesRes.json() as Record<string, any> | null;
    if (!vehiclesData) {
      return new Response(
        JSON.stringify({ success: true, message: "No vehicles found", remindersSent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = Date.now();
    let remindersSent = 0;
    const reminders: { vehicleId: string; sellerPhone: string }[] = [];

    for (const [vehicleId, v] of Object.entries(vehiclesData)) {
      if (v.status !== "active") continue;

      const createdAt = v.created_at ? new Date(v.created_at).getTime() : 0;
      const lastReminderAt = v.last_reminder_at ? new Date(v.last_reminder_at).getTime() : 0;

      if (createdAt && (now - createdAt) < SEVEN_DAYS_MS) continue;
      if (lastReminderAt > 0 && (now - lastReminderAt) < SEVEN_DAYS_MS) continue;

      const sellerPhone = v.sellerPhone || v.sellerId || v.phone;
      if (!sellerPhone) continue;

      const vehicleModel = `${v.brand || ""} ${v.model || ""}`.trim() || "vehicle";
      const reminderBody = `Has your ${vehicleModel} been sold? Update your listing status on Grand Auto Luxe to keep your profile updated!`;

      const notifRes = await fetch(`${dbBase}/users/${sellerPhone}/notifications.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: REMINDER_TITLE,
          body: reminderBody,
          read: false,
          kind: "reminder",
          vehicleId,
          actionLabel: "Mark as Sold",
          actionUrl: `/vehicle/${vehicleId}`,
          created_at: new Date().toISOString(),
        }),
      });

      if (notifRes.ok) {
        await fetch(`${dbBase}/vehicles/${vehicleId}.json`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ last_reminder_at: new Date().toISOString() }),
        });
        remindersSent++;
        reminders.push({ vehicleId, sellerPhone });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent,
        reminders,
        message: `Sent ${remindersSent} reminder(s) for unsold listings`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Weekly reminder error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
