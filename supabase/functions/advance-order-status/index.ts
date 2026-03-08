import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const statusFlow = ["confirmed", "preparing", "out-for-delivery", "delivered"];

Deno.serve(async () => {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Get all non-delivered orders older than 5 minutes since last status change
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status")
    .neq("status", "delivered");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let updated = 0;
  for (const order of orders || []) {
    const currentIdx = statusFlow.indexOf(order.status);
    if (currentIdx >= 0 && currentIdx < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIdx + 1];
      await supabase
        .from("orders")
        .update({ status: nextStatus })
        .eq("id", order.id);
      updated++;
    }
  }

  return new Response(JSON.stringify({ updated }), {
    headers: { "Content-Type": "application/json" },
  });
});
