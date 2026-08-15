import { createClient } from "npm:@supabase/supabase-js@2.108.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BASE_URL = "https://grand-auto-luxe-dz.vercel.app";
const PROMO_CODE = "START30";

type VehiclePayload = {
  vehicle_id: string;
  brand: string;
  model: string;
  year: number;
  wilaya: string;
  price_type: "fixed" | "auction";
  fixed_price: number | null;
  starting_price: number | null;
  fuel_type?: string;
  transmission?: string;
  mileage?: number;
  images?: string[];
  video_url?: string | null;
  language?: "darija" | "french" | "arabic";
};

function formatPrice(v: VehiclePayload): string {
  if (v.price_type === "auction") {
    return `${v.starting_price?.toLocaleString("fr-DZ") ?? "—"} DZD (Enchere)`;
  }
  return `${v.fixed_price?.toLocaleString("fr-DZ") ?? "—"} DZD`;
}

function buildHashtags(v: VehiclePayload): string[] {
  const tags = new Set<string>([
    "#GrandAutoLuxe",
    "#VoitureAlgerie",
    `#${v.brand.replace(/\s+/g, "")}`,
    `#${v.model.replace(/\s+/g, "")}`,
    `#${v.year}`,
    `#${v.wilaya.replace(/\s+/g, "")}`,
    "#AlgerieAuto",
    "#AutoDZ",
    "#OccasionAlgerie",
  ]);
  if (v.price_type === "auction") tags.add("#Enchere");
  return Array.from(tags);
}

function buildCaption(v: VehiclePayload, carLink: string, language: string): string {
  const price = formatPrice(v);
  const lines = [
    `🚗 ${v.brand} ${v.model} - ${v.year}`,
    `📍 ${v.wilaya}`,
    `💰 ${price}`,
    v.fuel_type ? `⛽ ${v.fuel_type}` : null,
    v.transmission ? `⚙️ ${v.transmission}` : null,
    v.mileage != null ? `📏 ${v.mileage.toLocaleString("fr-DZ")} km` : null,
    "",
    "🔥 Occasion premium chez Grand Auto Luxe!",
    `🎁 Utilisez le code ${PROMO_CODE} pour un tarif special`,
    `🔗 ${carLink}`,
  ].filter(Boolean);
  return lines.join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: VehiclePayload = await req.json();
    if (!body.vehicle_id || !body.brand || !body.model) {
      return new Response(JSON.stringify({ error: "Missing required vehicle fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if auto-publish is enabled
    const { data: settings } = await supabase
      .from("social_publish_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (!settings?.auto_publish_enabled) {
      return new Response(JSON.stringify({ message: "Auto-publish is disabled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const carLink = `${BASE_URL}/car/${body.vehicle_id}`;
    const language = body.language || settings?.default_language || "darija";
    const caption = buildCaption(body, carLink, language);
    const hashtags = buildHashtags(body);
    const images = body.images || [];
    const videoUrl = body.video_url || null;

    const logs: Array<{ id: string; status: string }> = [];

    // Generate feed post payload
    if (settings.publish_feed_posts && images.length > 0) {
      const { data: feedLog, error: feedErr } = await supabase
        .from("social_publish_log")
        .insert({
          vehicle_id: body.vehicle_id,
          vehicle_brand: body.brand,
          vehicle_model: body.model,
          vehicle_year: body.year,
          vehicle_price: body.price_type === "fixed" ? body.fixed_price : body.starting_price,
          vehicle_wilaya: body.wilaya,
          format_type: "feed",
          caption,
          hashtags,
          car_link: carLink,
          promo_code: PROMO_CODE,
          image_url: images[0],
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select("id, status")
        .single();

      if (feedErr) throw feedErr;
      if (feedLog) logs.push(feedLog);
    }

    // Generate reel/story payload
    if (settings.publish_reels && (videoUrl || images.length > 0)) {
      const { data: reelLog, error: reelErr } = await supabase
        .from("social_publish_log")
        .insert({
          vehicle_id: body.vehicle_id,
          vehicle_brand: body.brand,
          vehicle_model: body.model,
          vehicle_year: body.year,
          vehicle_price: body.price_type === "fixed" ? body.fixed_price : body.starting_price,
          vehicle_wilaya: body.wilaya,
          format_type: "reel",
          caption,
          hashtags,
          car_link: carLink,
          promo_code: PROMO_CODE,
          image_url: videoUrl || images[0] || null,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select("id, status")
        .single();

      if (reelErr) throw reelErr;
      if (reelLog) logs.push(reelLog);
    }

    return new Response(JSON.stringify({ success: true, published: logs }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
