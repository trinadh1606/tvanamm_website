import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info,x-my-custom-header",
  "Access-Control-Allow-Methods": "POST,OPTIONS,GET"
};

// Enhanced security configurations
const SECURITY_CONFIG = {
  MAX_VERIFICATION_TIME: 300000, // 5 minutes
  SIGNATURE_ALGO: 'SHA-256',
};

const logSecurityEvent = async (supabase: any, eventType: string, details: any, userId?: string) => {
  try {
    await supabase.from('security_audit_logs').insert({
      event_type: eventType,
      user_id: userId,
      details,
      ip_address: details.ip_address,
      user_agent: details.user_agent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

const validatePaymentTiming = (transactionCreatedAt: string): boolean => {
  const created = new Date(transactionCreatedAt);
  const now = new Date();
  const timeDiff = now.getTime() - created.getTime();
  
  return timeDiff <= SECURITY_CONFIG.MAX_VERIFICATION_TIME;
};

serve(async (req) => {
  const startTime = Date.now();
  
  // Enhanced security headers
  const securityHeaders = {
    ...corsHeaders,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };

  // Extract security context
  const userAgent = req.headers.get('User-Agent') || 'unknown';
  const ipAddress = req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || 'unknown';

  // 1) Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: securityHeaders });
  }
  
  // 2) Only allow POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: securityHeaders });
  }

  try {
    // 3) Initialize Supabase client with auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // 4) Authenticate user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user?.id) {
      await logSecurityEvent(supabaseClient, 'UNAUTHORIZED_VERIFICATION_ATTEMPT', {
        ip_address: ipAddress,
        user_agent: userAgent,
        error: userError?.message
      });

      console.error('Authentication failed:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5) Parse request body with validation
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = await req.json();

    // Enhanced input validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      await logSecurityEvent(supabaseClient, 'INVALID_VERIFICATION_REQUEST', {
        ip_address: ipAddress,
        user_agent: userAgent,
        missing_fields: {
          razorpay_order_id: !razorpay_order_id,
          razorpay_payment_id: !razorpay_payment_id,
          razorpay_signature: !razorpay_signature,
          orderId: !orderId
        }
      }, user.id);

      throw new Error("Missing required payment parameters");
    }

    // Validate format of IDs
    if (!/^order_[A-Za-z0-9]+$/.test(razorpay_order_id) || 
        !/^pay_[A-Za-z0-9]+$/.test(razorpay_payment_id)) {
      await logSecurityEvent(supabaseClient, 'INVALID_PAYMENT_ID_FORMAT', {
        ip_address: ipAddress,
        user_agent: userAgent,
        razorpay_order_id,
        razorpay_payment_id
      }, user.id);

      throw new Error("Invalid payment ID format");
    }

    console.log('🔍 Verifying payment:', { razorpay_order_id, razorpay_payment_id, orderId, userId: user.id });

    // 6) Get existing transaction with enhanced validation
    const { data: existingTransaction, error: txnError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id)
      .eq('order_id', orderId)
      .single();

    if (txnError || !existingTransaction) {
      await logSecurityEvent(supabaseClient, 'PAYMENT_TRANSACTION_NOT_FOUND', {
        ip_address: ipAddress,
        user_agent: userAgent,
        razorpay_order_id,
        order_id: orderId,
        error: txnError?.message
      }, user.id);

      throw new Error("Payment transaction not found or unauthorized");
    }

    // 7) Check if already verified
    if (existingTransaction.status === 'completed') {
      await logSecurityEvent(supabaseClient, 'DUPLICATE_VERIFICATION_ATTEMPT', {
        ip_address: ipAddress,
        user_agent: userAgent,
        razorpay_order_id,
        razorpay_payment_id,
        existing_payment_id: existingTransaction.razorpay_payment_id
      }, user.id);

      console.log('⚠️ Payment already verified');
      return new Response(
        JSON.stringify({ success: true, verified: true, message: 'Payment already verified' }),
        { status: 200, headers: { ...securityHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8) Validate timing - prevent replay attacks
    if (!validatePaymentTiming(existingTransaction.created_at)) {
      await logSecurityEvent(supabaseClient, 'PAYMENT_VERIFICATION_TIMEOUT', {
        ip_address: ipAddress,
        user_agent: userAgent,
        razorpay_order_id,
        created_at: existingTransaction.created_at,
        time_elapsed_ms: Date.now() - new Date(existingTransaction.created_at).getTime()
      }, user.id);

      throw new Error("Payment verification timeout - please initiate a new payment");
    }

    // 9) Enhanced signature verification using Web Crypto API
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpaySecret) {
      await logSecurityEvent(supabaseClient, 'PAYMENT_CONFIG_ERROR', {
        ip_address: ipAddress,
        user_agent: userAgent,
        error: 'Missing Razorpay secret'
      }, user.id);

      throw new Error("Payment verification service not configured");
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    // Double verification with timing-safe comparison
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(razorpaySecret),
      { name: "HMAC", hash: SECURITY_CONFIG.SIGNATURE_ALGO },
      false,
      ["sign"]
    );
    
    const sigBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );
    
    const expectedSignature = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Timing-safe comparison to prevent timing attacks
    let isValid = expectedSignature.length === razorpay_signature.length;
    for (let i = 0; i < Math.max(expectedSignature.length, razorpay_signature.length); i++) {
      isValid = isValid && (expectedSignature[i] === razorpay_signature[i]);
    }

    if (!isValid) {
      await logSecurityEvent(supabaseClient, 'PAYMENT_SIGNATURE_FRAUD', {
        ip_address: ipAddress,
        user_agent: userAgent,
        razorpay_order_id,
        razorpay_payment_id,
        expected_signature_length: expectedSignature.length,
        received_signature_length: razorpay_signature.length,
        payload_hash: Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload))))
          .map(b => b.toString(16).padStart(2, '0')).join('')
      }, user.id);

      console.error('❌ Payment signature verification failed');
      
      // Mark transaction as failed
      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'failed',
          failure_reason: 'signature_verification_failed',
          updated_at: new Date().toISOString()
        })
        .eq('razorpay_order_id', razorpay_order_id)
        .eq('user_id', user.id);

      throw new Error("Payment signature verification failed");
    }

    console.log('✅ Payment signature verified successfully');

    // 10) Begin transaction updates
    const updatePromises = [];

    // Update payment transaction
    updatePromises.push(
      supabaseClient
        .from('payment_transactions')
        .update({
          status: 'completed',
          razorpay_payment_id,
          razorpay_signature,
          verification_ip: ipAddress,
          verification_user_agent: userAgent.substring(0, 200),
          updated_at: new Date().toISOString()
        })
        .eq('razorpay_order_id', razorpay_order_id)
        .eq('user_id', user.id)
    );

    // Update order status
    updatePromises.push(
      supabaseClient
        .from('orders')
        .update({
          payment_status: 'completed',
          payment_method: 'razorpay',
          payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id)
    );

    const [transactionResult, orderResult] = await Promise.all(updatePromises);

    if (transactionResult.error) {
      await logSecurityEvent(supabaseClient, 'PAYMENT_UPDATE_ERROR', {
        ip_address: ipAddress,
        user_agent: userAgent,
        error: transactionResult.error.message,
        razorpay_order_id
      }, user.id);

      throw new Error('Failed to update payment transaction');
    }

    if (orderResult.error) {
      await logSecurityEvent(supabaseClient, 'ORDER_UPDATE_ERROR', {
        ip_address: ipAddress,
        user_agent: userAgent,
        error: orderResult.error.message,
        order_id: orderId
      }, user.id);

      throw new Error('Failed to update order status');
    }

    // 11) Create admin notifications asynchronously
    const adminUserIds = await supabaseClient.rpc('get_admin_owner_user_ids');
    if (adminUserIds.data && Array.isArray(adminUserIds.data)) {
      const notificationPromises = adminUserIds.data.map(adminId =>
        supabaseClient.from('notifications').insert({
          user_id: adminId,
          title: 'Payment Received',
          message: `Secure payment completed for Order #${orderId}`,
          type: 'payment_success',
          action_url: `/dashboard/orders?order=${orderId}`,
          data: {
            order_id: orderId,
            payment_id: razorpay_payment_id,
            razorpay_order_id,
            amount: existingTransaction.amount,
            verification_time: Date.now() - startTime
          }
        })
      );

      // Don't await these - fire and forget
      Promise.all(notificationPromises).catch(err => 
        console.warn('Failed to create some notifications:', err)
      );
    }

    // 12) Log successful payment verification
    await logSecurityEvent(supabaseClient, 'PAYMENT_VERIFIED_SUCCESS', {
      ip_address: ipAddress,
      user_agent: userAgent,
      order_id: orderId,
      razorpay_order_id,
      razorpay_payment_id,
      amount: existingTransaction.amount,
      verification_time_ms: Date.now() - startTime
    }, user.id);

    console.log('✅ Payment verification completed successfully for order:', orderId);

    // 13) Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        verified: true,
        message: 'Payment verified and processed successfully',
        processing_time: Date.now() - startTime
      }),
      { status: 200, headers: { ...securityHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    // 14) Enhanced error logging and response
    console.error('Error in payment verification:', err);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        verified: false, 
        error: err.message || 'Payment verification failed',
        processing_time: Date.now() - startTime
      }),
      { status: 400, headers: { ...securityHeaders, "Content-Type": "application/json" } }
    );
  }
});