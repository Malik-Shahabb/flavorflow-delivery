import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const statusFlow = ["confirmed", "preparing", "out-for-delivery", "delivered"];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Only get non-delivered orders where status hasn't changed in the last 30 seconds
  const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status")
    .neq("status", "delivered")
    .lt("status_updated_at", thirtySecondsAgo);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let updated = 0;
  for (const order of orders || []) {
    const currentIdx = statusFlow.indexOf(order.status);
    if (currentIdx >= 0 && currentIdx < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIdx + 1];
      await supabase
        .from("orders")
        .update({ status: nextStatus, status_updated_at: new Date().toISOString() })
        .eq("id", order.id);
      updated++;
    }
  }

  return new Response(JSON.stringify({ updated }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
