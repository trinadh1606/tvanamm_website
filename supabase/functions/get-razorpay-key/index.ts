import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info,x-my-custom-header",
  "Access-Control-Allow-Methods": "POST,OPTIONS,GET"
};

serve(async (req) => {
  // 1) CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 2) Actual handler
  try {
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    if (!razorpayKeyId) {
      console.error("RAZORPAY_KEY_ID not set");
      throw new Error("Razorpay key not configured");
    }

    console.log('✅ Returning Razorpay key successfully');

    return new Response(
      JSON.stringify({ key: razorpayKeyId, success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Error fetching Razorpay key:", err);
    return new Response(
      JSON.stringify({ error: err.message, success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});