import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info,x-my-custom-header,x-idempotency-key",
  "Access-Control-Allow-Methods": "POST,OPTIONS,GET"
};

// Enhanced security configurations
const SECURITY_CONFIG = {
  MAX_AMOUNT: 1000000, // ₹10,000 in paise
  MIN_AMOUNT: 100,     // ₹1 in paise
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
};

// Request validation schema
interface CreateOrderRequest {
  orderId: string;
  amount: number;
  currency?: string;
  orderNumber: string;
  idempotencyKey?: string;
}

const validateRequest = (data: any): CreateOrderRequest => {
  if (!data.orderId || typeof data.orderId !== 'string') {
    throw new Error('Invalid orderId: must be a non-empty string');
  }
  
  if (!data.amount || typeof data.amount !== 'number' || data.amount < SECURITY_CONFIG.MIN_AMOUNT) {
    throw new Error(`Invalid amount: must be at least ₹${SECURITY_CONFIG.MIN_AMOUNT / 100}`);
  }
  
  if (data.amount > SECURITY_CONFIG.MAX_AMOUNT) {
    throw new Error(`Invalid amount: exceeds maximum limit of ₹${SECURITY_CONFIG.MAX_AMOUNT / 100}`);
  }
  
  if (!data.orderNumber || typeof data.orderNumber !== 'string') {
    throw new Error('Invalid orderNumber: must be a non-empty string');
  }

  if (data.currency && !['INR', 'USD'].includes(data.currency)) {
    throw new Error('Invalid currency: only INR and USD are supported');
  }

  return {
    orderId: data.orderId,
    amount: data.amount,
    currency: data.currency || 'INR',
    orderNumber: data.orderNumber,
    idempotencyKey: data.idempotencyKey,
  };
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

serve(async (req) => {
  const startTime = Date.now();
  
  // Security headers
  const securityHeaders = {
    ...corsHeaders,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };

  // 1) Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: securityHeaders });
  }

  // 2) Only accept POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: securityHeaders,
    });
  }

  // Extract security context
  const userAgent = req.headers.get('User-Agent') || 'unknown';
  const ipAddress = req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || 'unknown';
  const idempotencyKey = req.headers.get('X-Idempotency-Key');

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
      await logSecurityEvent(supabaseClient, 'UNAUTHORIZED_PAYMENT_ATTEMPT', {
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

    console.log('✅ User authenticated:', user.id);

    // 5) Parse and validate request
    const requestData = await req.json();
    const validatedData = validateRequest(requestData);

    console.log('📦 Payment request:', { 
      orderId: validatedData.orderId, 
      amount: validatedData.amount, 
      currency: validatedData.currency, 
      userId: user.id,
      idempotencyKey 
    });

    // 6) Check for idempotency
    if (idempotencyKey) {
      const { data: existingOrder } = await supabaseClient
        .from('payment_transactions')
        .select('razorpay_order_id, status, created_at')
        .eq('user_id', user.id)
        .eq('notes->idempotency_key', idempotencyKey)
        .single();

      if (existingOrder) {
        console.log('🔄 Returning idempotent response for key:', idempotencyKey);
        
        if (existingOrder.status === 'created' || existingOrder.status === 'completed') {
          // Return the existing order if it was successful
          return new Response(
            JSON.stringify({ 
              success: true, 
              razorpayOrder: { id: existingOrder.razorpay_order_id },
              idempotent: true 
            }),
            { status: 200, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // 7) Verify order exists and belongs to user
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id, user_id, final_amount, status, payment_status')
      .eq('id', validatedData.orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      await logSecurityEvent(supabaseClient, 'INVALID_ORDER_ACCESS', {
        ip_address: ipAddress,
        user_agent: userAgent,
        order_id: validatedData.orderId,
        user_id: user.id,
        error: orderError?.message
      }, user.id);

      console.error('Order validation failed:', orderError);
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found or unauthorized' }),
        { status: 404, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8) Fraud detection checks
    if (order.payment_status === 'completed') {
      await logSecurityEvent(supabaseClient, 'DUPLICATE_PAYMENT_ATTEMPT', {
        ip_address: ipAddress,
        user_agent: userAgent,
        order_id: validatedData.orderId,
        user_id: user.id
      }, user.id);

      return new Response(
        JSON.stringify({ success: false, error: 'Order already paid' }),
        { status: 400, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 9) Verify amount matches order
    const expectedAmount = Math.round(order.final_amount * 100); // Convert to paise
    if (validatedData.amount !== expectedAmount) {
      await logSecurityEvent(supabaseClient, 'AMOUNT_MANIPULATION_ATTEMPT', {
        ip_address: ipAddress,
        user_agent: userAgent,
        order_id: validatedData.orderId,
        expected_amount: expectedAmount,
        received_amount: validatedData.amount,
        user_id: user.id
      }, user.id);

      console.error('Amount mismatch:', { expected: expectedAmount, received: validatedData.amount });
      return new Response(
        JSON.stringify({ success: false, error: 'Amount mismatch detected' }),
        { status: 400, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 10) Load Razorpay credentials
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) {
      await logSecurityEvent(supabaseClient, 'PAYMENT_CONFIG_ERROR', {
        ip_address: ipAddress,
        user_agent: userAgent,
        error: 'Missing Razorpay credentials'
      }, user.id);

      throw new Error("Payment service configuration error");
    }

    // 11) Prepare enhanced payload
    const orderData = {
      amount: validatedData.amount,
      currency: validatedData.currency,
      receipt: validatedData.orderNumber,
      notes: { 
        order_id: validatedData.orderId, 
        user_id: user.id,
        idempotency_key: idempotencyKey || `auto_${Date.now()}`,
        security_context: {
          ip_address: ipAddress,
          user_agent: userAgent.substring(0, 200), // Limit length
          timestamp: new Date().toISOString()
        }
      },
      payment_capture: 1,
    };

    // 12) Call Razorpay with timeout
    const auth = btoa(`${keyId}:${keySecret}`);
    
    console.log('🚀 Creating Razorpay order with enhanced security');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SECURITY_CONFIG.REQUEST_TIMEOUT);

    try {
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        await logSecurityEvent(supabaseClient, 'RAZORPAY_API_ERROR', {
          ip_address: ipAddress,
          user_agent: userAgent,
          status: res.status,
          error: errorText,
          order_id: validatedData.orderId
        }, user.id);

        throw new Error(`Razorpay API error (${res.status}): ${errorText}`);
      }

      const razorpayOrder = await res.json();
      console.log('✅ Razorpay order created:', razorpayOrder.id);

      // 13) Record enhanced payment transaction
      const { error: txnError } = await supabaseClient
        .from('payment_transactions')
        .insert({
          order_id: validatedData.orderId,
          user_id: user.id,
          amount: validatedData.amount,
          currency: validatedData.currency,
          status: 'created',
          payment_method: 'razorpay',
          razorpay_order_id: razorpayOrder.id,
          notes: orderData.notes,
          created_at: new Date().toISOString()
        });

      if (txnError) {
        await logSecurityEvent(supabaseClient, 'PAYMENT_TRACKING_ERROR', {
          ip_address: ipAddress,
          user_agent: userAgent,
          error: txnError.message,
          razorpay_order_id: razorpayOrder.id
        }, user.id);

        console.error('Failed to record transaction:', txnError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to track payment' }),
          { status: 500, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 14) Log successful payment initiation
      await logSecurityEvent(supabaseClient, 'PAYMENT_INITIATED', {
        ip_address: ipAddress,
        user_agent: userAgent,
        order_id: validatedData.orderId,
        razorpay_order_id: razorpayOrder.id,
        amount: validatedData.amount,
        processing_time_ms: Date.now() - startTime
      }, user.id);

      // 15) Success response
      return new Response(JSON.stringify({ 
        success: true, 
        razorpayOrder,
        processing_time: Date.now() - startTime 
      }), {
        status: 200,
        headers: { ...securityHeaders, "Content-Type": "application/json" },
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        await logSecurityEvent(supabaseClient, 'PAYMENT_TIMEOUT', {
          ip_address: ipAddress,
          user_agent: userAgent,
          order_id: validatedData.orderId,
          timeout_ms: SECURITY_CONFIG.REQUEST_TIMEOUT
        }, user.id);

        throw new Error('Payment request timed out');
      }
      
      throw fetchError;
    }

  } catch (err: any) {
    // 16) Enhanced error logging
    console.error("Error creating Razorpay order:", err);
    
    return new Response(JSON.stringify({ 
      error: err.message || 'Internal server error', 
      success: false,
      processing_time: Date.now() - startTime 
    }), {
      status: 500,
      headers: { ...securityHeaders, "Content-Type": "application/json" },
    });
  }
});