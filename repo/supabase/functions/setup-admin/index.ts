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

    const adminEmail = "0781606765@grandauto.local";
    const adminPassword = "!Admin2024";
    const adminPhone = "0781606765";

    // Check if admin already exists
    const checkResp = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(adminEmail)}`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
    });
    const existing = await checkResp.json();
    const existingUser = existing?.users?.find((u: any) => u.email === adminEmail);

    let userId: string;

    if (existingUser) {
      // Update password if user exists
      userId = existingUser.id;
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ password: adminPassword, email_confirm: true }),
      });
    } else {
      // Create new admin user
      const createResp = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: {
            phone: adminPhone,
            first_name: "Admin",
            last_name: "Lokmane",
            dob: "1990-01-01",
            place_of_birth: "Algeria",
          },
        }),
      });

      const created = await createResp.json();
      if (!createResp.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to create user", details: created }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = created.id;
    }

    // Ensure profile exists
    const profileResp = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
    });
    const profiles = await profileResp.json();

    if (!profiles || profiles.length === 0) {
      await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          id: userId,
          first_name: "Admin",
          last_name: "Lokmane",
          dob: "1990-01-01",
          place_of_birth: "Algeria",
          phone: adminPhone,
          subscription_status: "active",
          subscription_until: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          plan_type: "showroom",
        }),
      });
    } else {
      // Update existing profile to admin level
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          subscription_status: "active",
          subscription_until: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          plan_type: "showroom",
        }),
      });
    }

    // Grant admin + user roles
    for (const role of ["admin", "user"]) {
      await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
          "Prefer": "resolution=merge-duplicates",
        },
        body: JSON.stringify({ user_id: userId, role }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin account created/updated successfully",
        credentials: {
          phone: adminPhone,
          password: adminPassword,
        },
        user_id: userId,
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
