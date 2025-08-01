import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  order_id: string;
  user_id: string;
  invoice_number: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  invoice_date: string;
  due_date: string;
  expires_at: string;
  download_count: number;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export const useInvoices = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['invoices', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          orders!fk_invoices_order_id(
            order_number,
            final_amount,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Invoice & { orders: any })[];
    },
    enabled: !!user
  });
};

export const useDownloadInvoice = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      try {
        // Import the PDF generator dynamically
        const { generateInvoicePDF } = await import('@/components/invoice/PDFGenerator');
        
        // Get invoice details for filename
        const { data: invoice } = await supabase
          .from('invoices')
          .select('invoice_number, user_id')
          .eq('id', invoiceId)
          .single();

        const invoiceNumber = invoice?.invoice_number || invoiceId;
        
        // Generate and download PDF using client-side generation
        await generateInvoicePDF(invoiceId, invoiceNumber);
        
      } catch (error) {
        console.error('PDF generation failed, trying fallback:', error);
        
        // Fallback to HTML print view
        try {
          const { data, error: invokeError } = await supabase.functions.invoke('generate-invoice-pdf', {
            body: { invoiceId }
          });

          if (invokeError) throw invokeError;

          // Open HTML in new window for printing
          const printWindow = window.open('', '_blank', 'width=800,height=600');
          if (printWindow) {
            printWindow.document.write(data);
            printWindow.document.close();
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print();
              }, 1000);
            };
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          throw new Error('Unable to generate invoice. Please try again.');
        }
      }

      // Update download count  
      try {
        const { data: currentInvoice } = await supabase
          .from('invoices')
          .select('download_count')
          .eq('id', invoiceId)
          .single();

        if (currentInvoice) {
          await supabase
            .from('invoices')
            .update({ 
              download_count: (currentInvoice.download_count || 0) + 1
            })
            .eq('id', invoiceId);
        }
      } catch (updateError) {
        console.warn('Failed to update download count:', updateError);
      }

      return 'success';
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', user?.id] });
      toast.success('Invoice PDF downloaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to download invoice');
      console.error('Error downloading invoice:', error);
    }
  });
};

export const useGenerateInvoicePDF = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoiceId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', user?.id] });
      toast.success('PDF generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate PDF');
      console.error('Error generating PDF:', error);
    }
  });
};

export const useSendInvoiceEmail = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ invoiceId, emailType }: { invoiceId: string; emailType?: string }) => {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoiceId, emailType }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success('Invoice email sent successfully');
    },
    onError: (error) => {
      toast.error('Failed to send invoice email');
      console.error('Error sending email:', error);
    }
  });
};

export const useAdminInvoices = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up real-time subscription for invoices
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('admin-invoices-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user]);

  return useQuery({
    queryKey: ['admin-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          orders!fk_invoices_order_id(
            order_number,
            final_amount,
            created_at
          ),
          profiles!fk_invoices_user_id(
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Invoice fetch error:', error);
        throw error;
      }
      
      return data as (Invoice & { orders: any; profiles: any })[];
    },
    enabled: !!user
  });
};