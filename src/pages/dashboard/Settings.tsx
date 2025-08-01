import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityDashboard } from '@/components/dashboard/SecurityDashboard';
import { PaymentTestSuite } from '@/components/dashboard/PaymentTestSuite';

const Settings = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="security">Security Dashboard</TabsTrigger>
          <TabsTrigger value="testing">Payment Testing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="security">
          <SecurityDashboard />
        </TabsContent>
        
        <TabsContent value="testing">
          <PaymentTestSuite />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;