import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Receipt } from "lucide-react";
import { useInvoices, useDownloadInvoice, useGenerateInvoicePDF } from "@/hooks/useInvoices";
import { format } from "date-fns";
export const InvoiceList = () => {
  const {
    data: invoices,
    isLoading
  } = useInvoices();
  const downloadInvoice = useDownloadInvoice();
  const generatePDF = useGenerateInvoicePDF();
  const handleDownload = (invoiceId: string) => {
    downloadInvoice.mutate(invoiceId);
  };
  const handleGeneratePDF = (invoiceId: string) => {
    generatePDF.mutate(invoiceId);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'paid':
        return 'default';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  if (isLoading) {
    return <div className="space-y-4">
        {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>)}
      </div>;
  }
  if (!invoices || invoices.length === 0) {
    return <Card>
        <CardContent className="p-8 text-center">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
          <p className="text-muted-foreground">
            Your invoices will appear here once your orders are processed and paid.
          </p>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Invoices</h2>
        <Badge variant="secondary">
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {invoices.map(invoice => <Card key={invoice.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                {invoice.invoice_number}
              </CardTitle>
              <Badge variant={getStatusColor(invoice.status)}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order</p>
                <p className="font-medium">{invoice.orders?.order_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">₹{invoice.total_amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                
                
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm border-t pt-4">
              <div>
                <p className="text-muted-foreground">Subtotal</p>
                <p className="font-medium">₹{invoice.subtotal_amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tax (GST)</p>
                <p className="font-medium">₹{invoice.tax_amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Downloads</p>
                <p className="font-medium">{invoice.download_count}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => handleDownload(invoice.id)} disabled={downloadInvoice.isPending} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {downloadInvoice.isPending ? 'Downloading...' : 'Download PDF'}
              </Button>
            </div>
          </CardContent>
        </Card>)}
    </div>;
};