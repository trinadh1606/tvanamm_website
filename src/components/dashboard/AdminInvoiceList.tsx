import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInvoices } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Search, FileText, Download, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInvoiceList() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: invoices, isLoading } = useInvoices();
  const queryClient = useQueryClient();

  // Set up real-time subscription for invoices
  useEffect(() => {
    const channel = supabase
      .channel('admin-invoices-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        (payload) => {
          console.log('Real-time invoice update:', payload);
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success(`New invoice ${payload.new.invoice_number} generated`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filteredInvoices = invoices?.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.orders?.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'generated': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const handleDownload = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoice_id: invoiceId }
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([Uint8Array.from(atob(data.pdf), c => c.charCodeAt(0))], {
        type: 'application/pdf'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${data.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Invoice Management</h1>
        <p className="text-muted-foreground mt-2">Real-time invoice tracking and management</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number or order number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <div className="grid gap-4">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {invoice.invoice_number}
                    </CardTitle>
                    <CardDescription>
                      Order: {invoice.orders?.order_number} • 
                      Generated: {new Date(invoice.invoice_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Customer</h4>
                    <p className="text-sm text-muted-foreground">
                      {(invoice as any).profiles?.full_name || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(invoice as any).profiles?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Amount</h4>
                    <p className="text-lg font-semibold text-foreground">
                      ₹{invoice.total_amount?.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tax: ₹{invoice.tax_amount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Due Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownload(invoice.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No invoices found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}