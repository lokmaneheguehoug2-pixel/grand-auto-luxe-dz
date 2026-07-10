import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FIREBASE_DB_URL = Deno.env.get("VITE_FIREBASE_DATABASE_URL") || "";

const REMINDER_MESSAGE_TITLE = "Is your vehicle still available?";
const REMINDER_MESSAGE_BODY = "Please update your listing status or mark it as sold.";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!FIREBASE_DB_URL) {
      return new Response(
        JSON.stringify({ error: "VITE_FIREBASE_DATABASE_URL not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dbBase = FIREBASE_DB_URL.replace(/\/$/, "");

    // Fetch all vehicles from Firebase Realtime Database
    const vehiclesRes = await fetch(`${dbBase}/vehicles.json`);
    if (!vehiclesRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch vehicles from Firebase" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      // Only check unsold (active) listings
      if (v.status !== "active") continue;

      const createdAt = v.created_at ? new Date(v.created_at).getTime() : 0;
      const lastReminderAt = v.last_reminder_at ? new Date(v.last_reminder_at).getTime() : 0;

      // Check if listing is older than 7 days AND no reminder sent in last 7 days
      const listingAgeMs = now - createdAt;
      const timeSinceLastReminder = now - lastReminderAt;

      if (listingAgeMs < SEVEN_DAYS_MS) continue;
      if (lastReminderAt > 0 && timeSinceLastReminder < SEVEN_DAYS_MS) continue;

      const sellerPhone = v.sellerPhone || v.sellerId || v.phone;
      if (!sellerPhone) continue;

      // Send notification to the user's notifications node in Realtime DB
      const notifRef = `users/${sellerPhone}/notifications`;
      const notifRes = await fetch(`${dbBase}/${notifRef}.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: REMINDER_MESSAGE_TITLE,
          body: REMINDER_MESSAGE_BODY,
          read: false,
          kind: "reminder",
          vehicleId,
          created_at: new Date().toISOString(),
        }),
      });

      if (notifRes.ok) {
        // Update last_reminder_at on the vehicle
        await fetch(`${dbBase}/vehicles/${vehicleId}.json`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            last_reminder_at: new Date().toISOString(),
          }),
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
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
