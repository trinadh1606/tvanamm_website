import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
}

interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseServiceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get Razorpay credentials from environment variables - SECURITY FIX
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    console.log("Razorpay credentials check:", { 
      hasKeyId: !!razorpayKeyId, 
      hasSecret: !!razorpaySecret,
      keyIdLength: razorpayKeyId?.length,
      secretLength: razorpaySecret?.length 
    });
    
    if (!razorpayKeyId || !razorpaySecret) {
      console.error("Missing Razorpay credentials:", { keyId: !!razorpayKeyId, secret: !!razorpaySecret });
      throw new Error("Razorpay credentials not configured properly");
    }

    const requestBody = await req.json();
    const action = requestBody.action;
    
    console.log("Payment request:", { action, userId: user.id });

    if (action === "create-order") {
      const { orderId, amount, currency = "INR" } = requestBody;

      // Verify order belongs to user and is in correct status
      const { data: order, error: orderError } = await supabaseServiceClient
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .eq("payment_status", "pending")
        .single();

      if (orderError || !order) {
        throw new Error("Order not found or not eligible for payment");
      }

      // Verify amount matches order total
      if (Math.round(amount * 100) !== Math.round(order.final_amount * 100)) {
        throw new Error("Amount mismatch");
      }

      // Create Razorpay order
      const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(razorpayKeyId + ":" + razorpaySecret)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to paise
          currency: currency,
          receipt: `order_${orderId}`,
          notes: {
            order_id: orderId,
            user_id: user.id,
          },
        }),
      });

      if (!razorpayResponse.ok) {
        const errorText = await razorpayResponse.text();
        console.error("Razorpay API error:", { 
          status: razorpayResponse.status, 
          statusText: razorpayResponse.statusText,
          error: errorText 
        });
        throw new Error(`Failed to create payment order: ${errorText}`);
      }

      const razorpayOrder = await razorpayResponse.json();

      // Update order with Razorpay order ID
      await supabaseServiceClient
        .from("orders")
        .update({
          payment_id: razorpayOrder.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({
          success: true,
          razorpayOrder: razorpayOrder,
          orderDetails: {
            id: order.id,
            order_number: order.order_number,
            amount: order.final_amount,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (action === "verify-payment") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = requestBody;

      // Verify signature
      const crypto = await import("https://deno.land/std@0.190.0/crypto/mod.ts");
      const encoder = new TextEncoder();
      const data = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
      const key = await crypto.crypto.subtle.importKey(
        "raw",
        encoder.encode(razorpaySecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.crypto.subtle.sign("HMAC", key, data);
      const expectedSignature = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (expectedSignature !== razorpay_signature) {
        throw new Error("Invalid payment signature");
      }

      // Update order payment status
      const { error: updateError } = await supabaseServiceClient
        .from("orders")
        .update({
          payment_status: "completed",
          payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating order:", updateError);
        throw new Error("Failed to update order status");
      }

      // Create notification for successful payment
      await supabaseServiceClient
        .from("notifications")
        .insert({
          user_id: user.id,
          type: "payment",
          title: "Payment Successful",
          message: `Your payment has been processed successfully for order.`,
          data: {
            order_id: orderId,
            payment_id: razorpay_payment_id,
            amount: razorpay_order_id,
          },
        });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment verified successfully",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    throw new Error("Invalid action");

  } catch (error) {
    console.error("Payment processing error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});