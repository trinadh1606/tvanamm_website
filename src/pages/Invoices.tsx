import { InvoiceList } from "@/components/invoice/InvoiceList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Invoices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBackToDashboard = () => {
    // Navigate based on user role
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={handleBackToDashboard}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      <InvoiceList />
    </div>
  );
};

export default Invoices;