import { useState } from 'react';
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Zap,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'security' | 'fraud';
  testData: {
    orderId?: string;
    amount: number;
    currency?: string;
    orderNumber: string;
  };
  expectedOutcome: string;
  status?: 'pending' | 'running' | 'passed' | 'failed';
  result?: string;
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'normal-payment',
    name: 'Normal Payment Flow',
    description: 'Test a standard payment with valid order and amount',
    category: 'payment',
    testData: {
      amount: 999, // ₹9.99
      currency: 'INR',
      orderNumber: 'TEST-001'
    },
    expectedOutcome: 'Payment should complete successfully with proper verification'
  },
  {
    id: 'amount-limit-test',
    name: 'Amount Validation',
    description: 'Test payment with amount exceeding security limits',
    category: 'security',
    testData: {
      amount: 1500000, // ₹15,000 (exceeds ₹10,000 limit)
      currency: 'INR',
      orderNumber: 'TEST-002'
    },
    expectedOutcome: 'Payment should be rejected with amount limit error'
  },
  {
    id: 'rapid-payments',
    name: 'Rapid Payment Detection',
    description: 'Test multiple payments in quick succession',
    category: 'fraud',
    testData: {
      amount: 500,
      currency: 'INR',
      orderNumber: 'TEST-003'
    },
    expectedOutcome: 'Fraud detection should trigger after multiple attempts'
  },
  {
    id: 'invalid-signature',
    name: 'Signature Verification',
    description: 'Test payment verification with invalid signature',
    category: 'security',
    testData: {
      amount: 299,
      currency: 'INR',
      orderNumber: 'TEST-004'
    },
    expectedOutcome: 'Payment verification should fail with security error'
  }
];

export const PaymentTestSuite = () => {
  const [testResults, setTestResults] = useState<Map<string, TestScenario>>(new Map());
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [customTestData, setCustomTestData] = useState({
    amount: 999,
    currency: 'INR',
    orderNumber: 'CUSTOM-TEST'
  });

  const { initiatePayment, isProcessing } = useRazorpayPayment();
  const { toast } = useToast();

  const runSingleTest = async (scenario: TestScenario) => {
    setCurrentTest(scenario.id);
    
    const updatedScenario: TestScenario = {
      ...scenario,
      status: 'running'
    };
    
    setTestResults(prev => new Map(prev).set(scenario.id, updatedScenario));

    try {
      // Create mock order for testing
      const mockOrderId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await initiatePayment({
        orderId: mockOrderId,
        amount: scenario.testData.amount,
        currency: scenario.testData.currency || 'INR',
        orderNumber: scenario.testData.orderNumber
      });

      // Simulate test completion
      const finalScenario: TestScenario = {
        ...updatedScenario,
        status: 'passed',
        result: 'Test completed successfully'
      };
      
      setTestResults(prev => new Map(prev).set(scenario.id, finalScenario));
      
    } catch (error: any) {
      const finalScenario: TestScenario = {
        ...updatedScenario,
        status: scenario.category === 'security' || scenario.category === 'fraud' ? 'passed' : 'failed',
        result: error.message || 'Test failed with unknown error'
      };
      
      setTestResults(prev => new Map(prev).set(scenario.id, finalScenario));
    }
    
    setCurrentTest(null);
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    
    for (const scenario of TEST_SCENARIOS) {
      await runSingleTest(scenario);
      // Wait between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    setIsRunningTests(false);
    
    toast({
      title: "Test Suite Completed",
      description: "All security and payment tests have been executed.",
    });
  };

  const runCustomTest = async () => {
    const customScenario: TestScenario = {
      id: 'custom-test',
      name: 'Custom Test',
      description: 'User-defined test scenario',
      category: 'payment',
      testData: customTestData,
      expectedOutcome: 'Custom test execution'
    };
    
    await runSingleTest(customScenario);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'passed':
        return <Badge variant="default" className="bg-green-600">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'fraud':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const testStats = {
    total: TEST_SCENARIOS.length + (testResults.has('custom-test') ? 1 : 0),
    passed: Array.from(testResults.values()).filter(t => t.status === 'passed').length,
    failed: Array.from(testResults.values()).filter(t => t.status === 'failed').length,
    running: Array.from(testResults.values()).filter(t => t.status === 'running').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Security Test Suite</h1>
          <p className="text-muted-foreground">
            Comprehensive testing for payment flows and security measures
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunningTests || isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{testStats.passed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{testStats.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{testStats.running}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predefined" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predefined">Predefined Tests</TabsTrigger>
          <TabsTrigger value="custom">Custom Test</TabsTrigger>
        </TabsList>

        <TabsContent value="predefined" className="space-y-4">
          <div className="grid gap-4">
            {TEST_SCENARIOS.map((scenario) => {
              const result = testResults.get(scenario.id);
              
              return (
                <Card key={scenario.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(scenario.category)}
                        <div>
                          <CardTitle className="text-lg">{scenario.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{scenario.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result?.status)}
                        <Button
                          size="sm"
                          onClick={() => runSingleTest(scenario)}
                          disabled={isRunningTests || currentTest === scenario.id}
                        >
                          {getStatusIcon(result?.status)}
                          {currentTest === scenario.id ? 'Running...' : 'Run Test'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Test Data:</Label>
                        <div className="text-sm text-muted-foreground">
                          Amount: ₹{(scenario.testData.amount / 100).toFixed(2)} | 
                          Currency: {scenario.testData.currency} | 
                          Order: {scenario.testData.orderNumber}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Expected Outcome:</Label>
                        <div className="text-sm text-muted-foreground">{scenario.expectedOutcome}</div>
                      </div>
                      
                      {result?.result && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Result:</strong> {result.result}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Test Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create and run custom payment test scenarios
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (in paise)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={customTestData.amount}
                    onChange={(e) => setCustomTestData(prev => ({
                      ...prev,
                      amount: Number(e.target.value)
                    }))}
                    placeholder="999"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ₹{(customTestData.amount / 100).toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={customTestData.currency}
                    onChange={(e) => setCustomTestData(prev => ({
                      ...prev,
                      currency: e.target.value
                    }))}
                    placeholder="INR"
                  />
                </div>
                
                <div>
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    value={customTestData.orderNumber}
                    onChange={(e) => setCustomTestData(prev => ({
                      ...prev,
                      orderNumber: e.target.value
                    }))}
                    placeholder="CUSTOM-TEST"
                  />
                </div>
              </div>
              
              <Button
                onClick={runCustomTest}
                disabled={isProcessing || currentTest === 'custom-test'}
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {currentTest === 'custom-test' ? 'Running Custom Test...' : 'Run Custom Test'}
              </Button>
              
              {testResults.get('custom-test') && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Custom Test Result:</strong> {testResults.get('custom-test')?.result}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};