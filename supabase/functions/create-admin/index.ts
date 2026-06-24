import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin user via admin API
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        email: "0781606765@grandauto.local",
        password: "Admin@2024!",
        email_confirm: true,
        user_metadata: {
          phone: "0781606765",
          first_name: "Admin",
          last_name: "Lokmane",
        },
        app_metadata: {
          phone: "0781606765",
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: result.message || "Failed to create user", details: result }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = result.id;

    // Create profile with admin privileges using service role
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        id: userId,
        first_name: "Admin",
        last_name: "Lokmane",
        phone: "0781606765",
        dob: "1990-01-01",
        place_of_birth: "Algeria",
        subscription_status: "active",
        subscription_until: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        plan_type: "showroom",
      }),
    });

    // Add admin role
    await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        user_id: userId,
        role: "admin",
      }),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin user created successfully",
        credentials: {
          phone: "0781606765",
          password: "Admin@2024!",
          note: "User ID: " + userId
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
