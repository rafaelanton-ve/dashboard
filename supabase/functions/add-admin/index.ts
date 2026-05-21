import "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const token = authHeader.replace("Bearer ", "")
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Token inválido" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { data: requester, error: requesterError } = await supabaseAdmin
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single()

  if (requesterError || !requester || requester.role !== "superadmin") {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { email, name, role } = await req.json()

  if (!email || !name) {
    return new Response(JSON.stringify({ error: "Email y nombre son requeridos" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name },
  })

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { data: admin, error: insertError } = await supabaseAdmin
    .from("admins")
    .insert({
      user_id: newUser.id,
      email,
      name,
      role: role || "admin",
      is_active: true,
    })
    .select()
    .single()

  if (insertError) {
    await supabaseAdmin.auth.admin.deleteUser(newUser.id)
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify(admin), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
})
