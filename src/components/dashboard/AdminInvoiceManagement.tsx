import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminInvoices, useDownloadInvoice, useSendInvoiceEmail } from "@/hooks/useInvoices";
import { format } from "date-fns";
import { Receipt, Search, Filter, Download, Mail, Eye } from "lucide-react";
import { useState } from "react";

export const AdminInvoiceManagement = () => {
  const { data: invoices, isLoading } = useAdminInvoices();
  const downloadInvoice = useDownloadInvoice();
  const sendEmail = useSendInvoiceEmail();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleDownloadPDF = (invoiceId: string) => {
    downloadInvoice.mutate(invoiceId);
  };

  const handleSendEmail = (invoiceId: string, emailType = 'generated') => {
    sendEmail.mutate({ invoiceId, emailType });
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

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orders?.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {filteredInvoices?.length || 0} invoice{filteredInvoices?.length !== 1 ? 's' : ''} found
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number, customer, or order..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      {filteredInvoices && filteredInvoices.length > 0 ? (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{invoice.profiles?.full_name || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{invoice.profiles?.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order</p>
                    <p className="font-medium">{invoice.orders?.order_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">₹{invoice.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Issue Date</p>
                    <p className="font-medium">{format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
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
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => handleDownloadPDF(invoice.id)}
                    disabled={downloadInvoice.isPending}
                  >
                    <Download className="h-4 w-4" />
                    {downloadInvoice.isPending ? 'Downloading...' : 'Download PDF'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => handleSendEmail(invoice.id)}
                    disabled={sendEmail.isPending}
                  >
                    <Mail className="h-4 w-4" />
                    {sendEmail.isPending ? 'Sending...' : 'Send Email'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No invoices have been generated yet. Invoices are created automatically when orders are paid.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};