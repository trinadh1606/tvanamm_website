import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitRequest {
  email: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client IP address with enhanced parsing for load balancers
    const getClientIP = (): string => {
      const xForwardedFor = req.headers.get('x-forwarded-for');
      if (xForwardedFor) {
        // Handle comma-separated IPs from load balancers - take the first (original client)
        const ips = xForwardedFor.split(',').map(ip => ip.trim());
        const clientIP = ips[0];
        // Validate IP format
        if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(clientIP) || 
            /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(clientIP)) {
          return clientIP;
        }
      }
      
      const xRealIP = req.headers.get('x-real-ip');
      if (xRealIP && (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(xRealIP) || 
                      /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(xRealIP))) {
        return xRealIP;
      }
      
      return '127.0.0.1'; // Fallback
    };
    
    const clientIP = getClientIP();

    // For login attempts, we get the email from the request
    let email = null;
    if (req.method === 'POST') {
      const body = await req.json() as RateLimitRequest;
      email = body.email;
    }

    console.log(`Checking rate limit for IP: ${clientIP}, Email: ${email}`);

    // Call the rate limiting function
    const { data, error } = await supabaseClient.rpc('check_rate_limit', {
      p_ip_address: clientIP,
      p_email: email
    });

    if (error) {
      console.error('Error checking rate limit:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to check rate limit' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Rate limit check result:', data);

    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in check-rate-limit function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});