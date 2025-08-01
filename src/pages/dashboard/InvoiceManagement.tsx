import { AdminInvoiceManagement } from "@/components/dashboard/AdminInvoiceManagement";

const InvoiceManagement = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Invoice Management</h1>
        <p className="text-muted-foreground mt-2">Manage and track all customer invoices</p>
      </div>
      <AdminInvoiceManagement />
    </div>
  );
};

export default InvoiceManagement;