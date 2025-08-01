import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, emailType = 'generated' } = await req.json();

    if (!invoiceId) {
      return new Response(JSON.stringify({ error: 'Invoice ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        orders!inner(order_number),
        profiles!inner(full_name, email)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate email content based on type
    const emailContent = generateEmailContent(invoice, emailType);

    // In a production environment, you would integrate with an email service
    // like SendGrid, AWS SES, or Resend to send the actual email
    console.log('Email would be sent to:', invoice.profiles.email);
    console.log('Email content:', emailContent);

    // Update invoice status if it was just generated
    if (emailType === 'generated') {
      await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoiceId);
    }

    // Create notification for the user
    await supabase
      .from('notifications')
      .insert({
        user_id: invoice.user_id,
        title: 'Invoice Email Sent',
        message: `Invoice ${invoice.invoice_number} has been sent to your email address.`,
        type: 'system',
        data: {
          invoice_id: invoiceId,
          invoice_number: invoice.invoice_number,
          email_type: emailType
        }
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Invoice email sent successfully',
      emailPreview: emailContent
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending invoice email:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEmailContent(invoice: any, emailType: string): string {
  const baseUrl = 'https://your-domain.com'; // Replace with actual domain
  
  const templates = {
    generated: {
      subject: `Invoice ${invoice.invoice_number} - T VANAMM`,
      body: `
        Dear ${invoice.profiles.full_name},

        Thank you for your order! Your invoice has been generated and is ready for download.

        Invoice Details:
        - Invoice Number: ${invoice.invoice_number}
        - Order Number: ${invoice.orders.order_number}
        - Amount: ₹${invoice.total_amount.toFixed(2)}
        - Due Date: ${new Date(invoice.due_date).toLocaleDateString()}

        You can download your invoice from your account dashboard or by clicking the link below:
        ${baseUrl}/invoices

        If you have any questions about this invoice, please don't hesitate to contact us.

        Best regards,
        T VANAMM Team
      `
    },
    reminder: {
      subject: `Payment Reminder - Invoice ${invoice.invoice_number}`,
      body: `
        Dear ${invoice.profiles.full_name},

        This is a friendly reminder that your invoice is due for payment.

        Invoice Details:
        - Invoice Number: ${invoice.invoice_number}
        - Amount Due: ₹${invoice.total_amount.toFixed(2)}
        - Due Date: ${new Date(invoice.due_date).toLocaleDateString()}

        Please process your payment at your earliest convenience to avoid any service interruptions.

        You can view and download your invoice from: ${baseUrl}/invoices

        Thank you for your business!

        Best regards,
        T VANAMM Team
      `
    },
    overdue: {
      subject: `Overdue Invoice - ${invoice.invoice_number} - Immediate Action Required`,
      body: `
        Dear ${invoice.profiles.full_name},

        We notice that the following invoice is now overdue:

        Invoice Details:
        - Invoice Number: ${invoice.invoice_number}
        - Amount Due: ₹${invoice.total_amount.toFixed(2)}
        - Due Date: ${new Date(invoice.due_date).toLocaleDateString()}

        Please settle this invoice immediately to avoid any potential service disruptions.

        If you have already made the payment, please disregard this notice.
        If you're experiencing any issues, please contact our support team.

        View Invoice: ${baseUrl}/invoices

        Best regards,
        T VANAMM Team
      `
    }
  };

  return templates[emailType as keyof typeof templates] || templates.generated;
}