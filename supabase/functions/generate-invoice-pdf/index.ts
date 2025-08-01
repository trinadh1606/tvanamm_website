import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

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
    const { invoiceId, format } = await req.json();

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

    // Fetch invoice details with proper joins via user_id
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        orders!inner(
          order_number,
          delivery_fee,
          shipping_address,
          order_items(
            quantity,
            unit_price,
            total_price,
            gst_rate,
            products(name, description, gst_rate)
          )
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice fetch error:', invoiceError);
      return new Response(JSON.stringify({ error: 'Invoice not found', details: invoiceError?.message }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch loyalty transactions for this order to check for discounts
    const { data: loyaltyTransactions, error: loyaltyError } = await supabase
      .from('loyalty_transactions')
      .select('points, description')
      .eq('order_id', invoice.order_id)
      .eq('type', 'redeemed');

    if (loyaltyError) {
      console.warn('Loyalty transactions fetch warning:', loyaltyError);
    }

    // Calculate loyalty discount (negative points mean discount applied)
    const loyaltyDiscount = loyaltyTransactions?.reduce((total, transaction) => {
      return total + Math.abs(transaction.points);
    }, 0) || 0;


    // Fetch user profile separately to avoid relationship issues
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, phone, address')
      .eq('user_id', invoice.user_id)
      .maybeSingle();

    // Create fallback profile if not found
    const safeProfile = profile || {
      full_name: 'Customer Name Not Available',
      email: 'Email Not Available',
      phone: null,
      address: null
    };

    if (profileError) {
      console.warn('Profile fetch warning:', profileError);
    }

    // Combine invoice with profile data and loyalty discount
    const combinedInvoice = {
      ...invoice,
      profiles: safeProfile,
      loyaltyDiscount
    };

    // Always return HTML content for client-side PDF generation
    const htmlContent = generateInvoiceHTML(combinedInvoice);

    return new Response(htmlContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${invoice.invoice_number}.html"`
      },
    });

  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Generate a basic PDF with proper formatting
function generateBasicPDF(invoice: any): Uint8Array {
  // Calculate totals
  let subtotalWithoutGst = 0;
  let totalGst = 0;
  
  (invoice.orders?.order_items || []).forEach((item: any) => {
    const gstRate = item.gst_rate || item.products?.gst_rate || 18.00;
    const itemSubtotal = item.total_price / (1 + gstRate / 100);
    const gstAmount = item.total_price - itemSubtotal;
    
    subtotalWithoutGst += itemSubtotal;
    totalGst += gstAmount;
  });

  // Create basic PDF structure with proper TVANAMM branding
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
    /F2 6 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length ${getPDFContentLength(invoice, subtotalWithoutGst, totalGst)}
>>
stream
${generatePDFContent(invoice, subtotalWithoutGst, totalGst)}
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj

xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000248 00000 n 
0000000${String(350 + getPDFContentLength(invoice, subtotalWithoutGst, totalGst)).padStart(10, '0')} 00000 n 
0000000${String(410 + getPDFContentLength(invoice, subtotalWithoutGst, totalGst)).padStart(10, '0')} 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
${450 + getPDFContentLength(invoice, subtotalWithoutGst, totalGst)}
%%EOF`;

  return new TextEncoder().encode(pdfContent);
}

function getPDFContentLength(invoice: any, subtotal: number, gst: number): number {
  return generatePDFContent(invoice, subtotal, gst).length;
}

function generatePDFContent(invoice: any, subtotal: number, gst: number): string {
  const items = invoice.orders?.order_items || [];
  let yPos = 750;
  
  let content = `BT
/F2 20 Tf
50 ${yPos} Td
(T VANAMM - TAX INVOICE) Tj
0 -25 Td
/F1 10 Tf
(Premium Tea Collection) Tj
0 -30 Td
/F2 12 Tf
(Invoice: ${invoice.invoice_number}) Tj
0 -15 Td
/F1 10 Tf
(Date: ${new Date(invoice.invoice_date).toLocaleDateString('en-IN')}) Tj
0 -15 Td
(Order: ${invoice.orders?.order_number || 'N/A'}) Tj
0 -30 Td
/F2 11 Tf
(BILL TO:) Tj
0 -15 Td
/F1 10 Tf
(${invoice.profiles?.full_name || 'Customer Name Not Available'}) Tj
0 -12 Td
(${invoice.profiles?.email || 'Email Not Available'}) Tj`;

  // Add shipping address if available
  if (invoice.orders?.shipping_address) {
    const addr = invoice.orders.shipping_address;
    content += `
0 -12 Td
(${addr.address || 'Address not available'}) Tj
0 -12 Td
(${addr.city || 'City'}, ${addr.state || 'State'} - ${addr.pincode || 'PIN'}) Tj`;
  }

  // Add items header
  content += `
0 -30 Td
/F2 10 Tf
(PRODUCT DETAILS:) Tj
0 -15 Td
/F1 9 Tf`;

  // Add each item
  items.forEach((item: any, index: number) => {
    const gstRate = item.gst_rate || item.products?.gst_rate || 18.00;
    content += `
0 -12 Td
(${index + 1}. ${item.products?.name || 'Product'}) Tj
0 -10 Td
(   Qty: ${item.quantity} | Unit: Rs.${(item.unit_price || 0).toFixed(2)} | GST: ${gstRate}% | Total: Rs.${(item.total_price || 0).toFixed(2)}) Tj`;
  });

  // Add totals
  content += `
0 -25 Td
/F2 10 Tf
(PAYMENT SUMMARY:) Tj
0 -15 Td
/F1 9 Tf
(Subtotal (Excl. GST): Rs.${subtotal.toFixed(2)}) Tj
0 -12 Td
(Total GST: Rs.${gst.toFixed(2)}) Tj
0 -12 Td
/F2 11 Tf
(TOTAL AMOUNT: Rs.${invoice.total_amount.toFixed(2)}) Tj
0 -30 Td
/F1 8 Tf
(Generated by T VANAMM Invoice System) Tj
ET`;

  return content;
}

function generateInvoiceHTML(invoice: any): string {
  const currentDate = new Date().toLocaleDateString('en-IN');
  
  // Calculate GST breakdown - consolidate all GST into single amount
  let totalGstAmount = 0;
  let subtotalWithoutGst = 0;
  
  (invoice.orders?.order_items || []).forEach((item: any) => {
    const gstRate = item.products?.gst_rate || item.gst_rate || 18.00;
    const unitPriceExclGst = item.unit_price;
    const itemSubtotal = unitPriceExclGst * item.quantity;
    const gstAmount = itemSubtotal * (gstRate / 100);
    
    subtotalWithoutGst += itemSubtotal;
    totalGstAmount += gstAmount;
  });
  
  // Calculate loyalty discount amount from loyalty points (1 point = 1 rupee)
  const loyaltyDiscountAmount = invoice.loyaltyDiscount || 0;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
            * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
            }
            
            body { 
                font-family: Arial, Helvetica, sans-serif; 
                line-height: 1.4; 
                color: #000000; 
                background: #ffffff;
                font-size: 12px;
            }
            
            .page {
                width: 100%;
                min-height: 297mm;
                padding: 15mm;
                page-break-after: always;
                background: white;
            }
            
            .page:last-child {
                page-break-after: auto;
            }
            
            /* Company Header */
            .company-header {
                text-align: center;
                border-bottom: 3px solid #1a5d4d;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .company-name {
                font-size: 36px;
                font-weight: bold;
                color: #1a5d4d;
                letter-spacing: 4px;
                margin-bottom: 8px;
            }
            
            .company-tagline {
                font-size: 16px;
                color: #1a5d4d;
                font-weight: bold;
                margin-bottom: 4px;
            }
            
            .company-subtitle {
                font-size: 13px;
                color: #666666;
                font-weight: normal;
            }
            
            /* Invoice Title */
            .invoice-title {
                background: #1a5d4d;
                color: white;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                padding: 15px;
                margin: 25px 0;
                letter-spacing: 3px;
            }
            
            /* Two Column Layout */
            .two-column {
                width: 100%;
                margin-bottom: 25px;
            }
            
            .two-column table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .two-column td {
                width: 50%;
                vertical-align: top;
                padding: 15px;
            }
            
            .info-box {
                border: 2px solid #1a5d4d;
                padding: 15px;
                background: #f8fffe;
            }
            
            .info-title {
                font-size: 14px;
                font-weight: bold;
                color: #1a5d4d;
                text-transform: uppercase;
                margin-bottom: 10px;
                border-bottom: 1px solid #1a5d4d;
                padding-bottom: 5px;
            }
            
            .info-content {
                font-size: 12px;
                line-height: 1.6;
            }
            
            .info-row {
                margin-bottom: 8px;
                border-bottom: 1px dotted #cccccc;
                padding-bottom: 5px;
            }
            
            .info-label {
                font-weight: bold;
                color: #333333;
                display: inline-block;
                min-width: 80px;
            }
            
            .info-value {
                color: #000000;
            }
            
            /* Bill To Section */
            .bill-to {
                border: 2px solid #1a5d4d;
                padding: 20px;
                background: #f0faf8;
                margin-bottom: 20px;
            }
            
            .bill-to-title {
                font-size: 16px;
                font-weight: bold;
                color: #1a5d4d;
                text-transform: uppercase;
                margin-bottom: 15px;
            }
            
            .customer-details {
                font-size: 13px;
                line-height: 1.8;
            }
            
            .customer-name {
                font-weight: bold;
                font-size: 15px;
                color: #000000;
                margin-bottom: 5px;
            }
            
            /* Products Table */
            .products-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                border: 2px solid #1a5d4d;
            }
            
            .products-table th {
                background: #1a5d4d;
                color: white;
                padding: 12px 8px;
                text-align: left;
                font-weight: bold;
                font-size: 12px;
                text-transform: uppercase;
            }
            
            .products-table td {
                padding: 10px 8px;
                border-bottom: 1px solid #dddddd;
                vertical-align: top;
                font-size: 11px;
            }
            
            .products-table tbody tr:nth-child(even) {
                background: #f9f9f9;
            }
            
            .product-name {
                font-weight: bold;
                color: #000000;
                margin-bottom: 3px;
            }
            
            .product-description {
                color: #666666;
                font-size: 10px;
            }
            
            .text-right {
                text-align: right;
            }
            
            .text-center {
                text-align: center;
            }
            
            /* Totals Section */
            .totals-section {
                width: 100%;
                margin-top: 20px;
            }
            
            .totals-table {
                width: 50%;
                margin-left: auto;
                border-collapse: collapse;
                border: 2px solid #1a5d4d;
            }
            
            .totals-table td {
                padding: 8px 12px;
                border-bottom: 1px solid #dddddd;
                font-size: 12px;
            }
            
            .totals-table .total-label {
                font-weight: bold;
                background: #f8fffe;
                color: #1a5d4d;
            }
            
            .totals-table .total-value {
                text-align: right;
                font-weight: bold;
            }
            
            .final-total {
                background: #1a5d4d !important;
                color: white !important;
                font-size: 14px !important;
                font-weight: bold !important;
            }
            
            /* Notes Section */
            .notes-section {
                margin-top: 30px;
                padding: 20px;
                border: 2px solid #1a5d4d;
                background: #f8fffe;
            }
            
            .notes-title {
                font-size: 16px;
                font-weight: bold;
                color: #1a5d4d;
                margin-bottom: 15px;
                text-transform: uppercase;
            }
            
            .notes-content {
                font-size: 12px;
                line-height: 1.6;
                color: #333333;
            }
            
            /* Footer */
            .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 11px;
                color: #666666;
                border-top: 1px solid #dddddd;
                padding-top: 15px;
            }
            
            .footer-company {
                font-weight: bold;
                color: #1a5d4d;
                margin-bottom: 5px;
            }
            
            @media print {
                .page {
                    page-break-after: always;
                }
                .page:last-child {
                    page-break-after: auto;
                }
            }
        </style>
    </head>
    <body>
        <!-- Page 1: Header and Customer Details -->
        <div class="page">
            <div class="company-header">
                <div class="company-name">T VANAMM</div>
                <div class="company-tagline">PURITY OF TASTE</div>
                <div class="company-subtitle">A UNIT OF JKSH PVT LTD</div>
            </div>
            
            <div class="invoice-title">TAX INVOICE</div>
            
            <div class="two-column">
                <table>
                    <tr>
                        <td>
                            <div class="info-box">
                                <div class="info-title">Invoice Details</div>
                                <div class="info-content">
                                    <div class="info-row">
                                        <span class="info-label">Invoice No:</span>
                                        <span class="info-value">${invoice.invoice_number}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Date:</span>
                                        <span class="info-value">${new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Order No:</span>
                                        <span class="info-value">${invoice.orders?.order_number || 'N/A'}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Due Date:</span>
                                        <span class="info-value">${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : 'Immediate'}</span>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="info-box">
                                <div class="info-title">Company Details</div>
                                <div class="info-content">
                                    <div class="info-row">
                                        <span class="info-label">GSTIN:</span>
                                        <span class="info-value">36AGXXXXXXXXXZR</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Email:</span>
                                        <span class="info-value">tvanamm@gmail.com</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Phone:</span>
                                        <span class="info-value">+91 93906 58544</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Phone:</span>
                                        <span class="info-value">+91 90000 08479</span>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            
            <div class="bill-to">
                <div class="bill-to-title">Bill To</div>
                <div class="customer-details">
                    <div class="customer-name">${invoice.profiles?.full_name || 'Customer Name Not Available'}</div>
                    <div>${invoice.profiles?.email || 'Email Not Available'}</div>
                    ${invoice.profiles?.phone ? `<div>Phone: ${invoice.profiles.phone}</div>` : ''}
                    ${invoice.orders?.shipping_address ? `
                        <div style="margin-top: 10px;">
                            <strong>Shipping Address:</strong><br>
                            ${invoice.orders.shipping_address.address || 'Address not available'}<br>
                            ${invoice.orders.shipping_address.city || 'City'}, ${invoice.orders.shipping_address.state || 'State'} - ${invoice.orders.shipping_address.pincode || 'PIN'}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <!-- Page 2: Product Details and Totals -->
        <div class="page">
            <div class="company-header">
                <div class="company-name">T VANAMM</div>
                <div class="company-tagline">PURITY OF TASTE</div>
                <div class="company-subtitle">A UNIT OF JKSH PVT LTD</div>
            </div>
            
            <h2 style="color: #1a5d4d; text-align: center; font-size: 20px; margin-bottom: 20px; text-transform: uppercase;">Product Details - Invoice ${invoice.invoice_number}</h2>
            
            <table class="products-table">
                <thead>
                    <tr>
                        <th style="width: 5%;">S.No</th>
                        <th style="width: 35%;">Product Details</th>
                        <th style="width: 8%;">Qty</th>
                        <th style="width: 12%;">Unit Price (Excl. GST)</th>
                        <th style="width: 10%;">GST Rate</th>
                        <th style="width: 15%;">GST Amount</th>
                        <th style="width: 15%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${(invoice.orders?.order_items || []).map((item: any, index: number) => {
                        const gstRate = item.products?.gst_rate || item.gst_rate || 18.00;
                        const unitPriceExclGst = item.unit_price;
                        const gstAmount = unitPriceExclGst * item.quantity * (gstRate / 100);
                        
                        return `
                            <tr>
                                <td class="text-center">${index + 1}</td>
                                <td>
                                    <div class="product-name">${item.products?.name || 'Product Name Not Available'}</div>
                                    ${item.products?.description ? `<div class="product-description">${item.products.description}</div>` : ''}
                                </td>
                                <td class="text-center">${item.quantity}</td>
                                <td class="text-right">₹${(item.unit_price || 0).toFixed(2)}</td>
                                <td class="text-center">${gstRate}%</td>
                                <td class="text-right">₹${gstAmount.toFixed(2)}</td>
                                <td class="text-right">₹${(item.total_price || 0).toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <div class="totals-section">
                <table class="totals-table">
                    <tr>
                        <td class="total-label">Subtotal (Excl. GST)</td>
                        <td class="total-value">₹${subtotalWithoutGst.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="total-label">GST</td>
                        <td class="total-value">₹${totalGstAmount.toFixed(2)}</td>
                    </tr>
                    ${invoice.orders?.delivery_fee ? `
                        <tr>
                            <td class="total-label">Delivery Charges</td>
                            <td class="total-value">₹${invoice.orders.delivery_fee.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    ${loyaltyDiscountAmount > 0 ? `
                        <tr>
                            <td class="total-label">Loyalty Points Discount</td>
                            <td class="total-value">-₹${loyaltyDiscountAmount.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    <tr class="final-total">
                        <td>TOTAL AMOUNT</td>
                        <td class="text-right">₹${invoice.total_amount.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <!-- Page 3: Notes and Contact Information -->
        <div class="page">
            <div class="company-header">
                <div class="company-name">T VANAMM</div>
                <div class="company-tagline">PURITY OF TASTE</div>
                <div class="company-subtitle">A UNIT OF JKSH PVT LTD</div>
            </div>
            
            <div class="notes-section">
                <div class="notes-title">Important Notes & Terms</div>
                <div class="notes-content">
                    <p><strong>• Product Quality:</strong> All our tea products are sourced directly from premium tea gardens and undergo strict quality control measures.</p>
                    <br>
                    <p><strong>• Freshness Guarantee:</strong> Our teas are packed fresh to ensure maximum flavor and aroma retention.</p>
                    <br>
                    <p><strong>• Storage Instructions:</strong> Store in a cool, dry place away from direct sunlight. Keep containers tightly sealed to maintain freshness.</p>
                    <br>
                    <p><strong>• Customer Satisfaction:</strong> We are committed to providing the finest tea experience. For any queries or concerns, please contact our customer service.</p>
                    <br>
                    <p><strong>• Thank You:</strong> Thank you for choosing T VANAMM. We appreciate your business and trust in our premium tea collection.</p>
                </div>
            </div>
            
            <div class="notes-section" style="margin-top: 20px;">
                <div class="notes-title">Contact Information</div>
                <div class="notes-content">
                    <table style="width: 100%; font-size: 13px;">
                        <tr>
                            <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                                <p><strong>Customer Support:</strong></p>
                                <p>Phone: +91 93906 58544</p>
                                <p>Phone: +91 90000 08479</p>
                                <p>Email: tvanamm@gmail.com</p>
                            </td>
                            <td style="width: 50%; vertical-align: top;">
                                <p><strong>Business Hours:</strong></p>
                                <p>Monday - Saturday: 9:00 AM - 6:00 PM</p>
                                <p>Sunday: Closed</p>
                                <p>Emergency Support: Available 24/7</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-company">T VANAMM - A UNIT OF JKSH PVT LTD</div>
                <div>This is a computer-generated invoice and does not require a physical signature.</div>
                <div>GSTIN: 36AGXXXXXXXXXZR | Email: tvanamm@gmail.com</div>
            </div>
        </div>
    </body>
    </html>
  `;
}