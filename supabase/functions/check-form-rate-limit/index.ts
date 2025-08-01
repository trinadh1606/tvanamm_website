import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FormRateLimitRequest {
  leadData: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
    source?: string;
    city?: string;
    [key: string]: any;
  };
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

    if (req.method === 'POST') {
      const { leadData }: FormRateLimitRequest = await req.json();

      console.log(`Form submission attempt from IP: ${clientIP}`);

      // Check rate limit first
      const { data: rateLimitResult, error: rateLimitError } = await supabaseClient.rpc('check_form_rate_limit', {
        p_ip_address: clientIP
      });

      if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError);
        return new Response(
          JSON.stringify({ error: 'Rate limit check failed' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('Rate limit result:', rateLimitResult);

      if (!rateLimitResult.allowed) {
        console.log('Rate limit exceeded for IP:', clientIP);
        return new Response(
          JSON.stringify({ 
            error: rateLimitResult.error || 'Too many form submissions. Please try again later.',
            rateLimitExceeded: true,
            resetTime: rateLimitResult.reset_time
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Clean and validate data
      const cleanData = {
        name: leadData.name?.trim(),
        email: leadData.email?.trim(),
        phone: leadData.phone?.trim() || null,
        message: leadData.message?.trim() || null,
        source: leadData.source || 'website',
        city: leadData.city?.trim() || null
      };

      console.log('Cleaned lead data:', cleanData);

      // Validate required fields
      if (!cleanData.name || !cleanData.email) {
        return new Response(
          JSON.stringify({ error: 'Name and email are required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Create the lead
      const { data: lead, error: leadError } = await supabaseClient
        .from('leads')
        .insert([cleanData])
        .select()
        .single();

      if (leadError) {
        console.error('Lead creation error:', leadError);
        return new Response(
          JSON.stringify({ error: leadError.message || 'Failed to submit lead' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('Lead created successfully:', lead);

      return new Response(
        JSON.stringify({ 
          success: true, 
          lead,
          submissionsRemaining: rateLimitResult.submissions_remaining 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // GET request - just check rate limit status
    const { data: rateLimitResult, error: rateLimitError } = await supabaseClient.rpc('check_form_rate_limit', {
      p_ip_address: clientIP
    });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      return new Response(
        JSON.stringify({ error: 'Rate limit check failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify(rateLimitResult),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in check-form-rate-limit function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});