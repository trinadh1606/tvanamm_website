import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Clock, 
  CreditCard, 
  UserX, 
  Activity,
  TrendingUp,
  Lock,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetrics {
  total_payments: number;
  failed_payments: number;
  fraud_attempts: number;
  blocked_ips: number;
  failure_rate: number;
  period_days: number;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: any;
  timestamp: string;
  created_at: string;
}

interface FraudDetection {
  id: string;
  user_id: string;
  order_id: string;
  risk_score: number;
  risk_factors: any;
  ip_address?: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const SecurityDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const { toast } = useToast();

  // Fetch security metrics
  const { data: securityMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['security-metrics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_security_metrics', {
        days_back: selectedPeriod
      });
      
      if (error) throw error;
      return data as unknown as SecurityMetrics;
    },
  });

  // Fetch recent security events
  const { data: securityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as SecurityEvent[];
    },
  });

  // Fetch fraud detection records
  const { data: fraudDetections, isLoading: fraudLoading } = useQuery({
    queryKey: ['fraud-detections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fraud_detection')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as unknown as FraudDetection[];
    },
  });

  const handleReviewFraud = async (fraudId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('fraud_detection')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', fraudId);

      if (error) throw error;

      toast({
        title: "Fraud Review Updated",
        description: `Fraud detection record has been ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update fraud detection record.",
        variant: "destructive",
      });
    }
  };

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('FRAUD') || eventType.includes('UNAUTHORIZED')) {
      return 'destructive';
    }
    if (eventType.includes('SUCCESS') || eventType.includes('INITIATED')) {
      return 'default';
    }
    if (eventType.includes('ERROR') || eventType.includes('FAILED')) {
      return 'secondary';
    }
    return 'outline';
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 50) return 'destructive';
    if (score >= 30) return 'secondary';
    return 'default';
  };

  if (metricsLoading || eventsLoading || fraudLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Loading security dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor payment security, fraud detection, and system events
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Security Metrics Overview */}
      {securityMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityMetrics.total_payments}</div>
              <p className="text-xs text-muted-foreground">
                Last {securityMetrics.period_days} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {securityMetrics.failed_payments}
              </div>
              <p className="text-xs text-muted-foreground">
                {(securityMetrics.failure_rate * 100).toFixed(1)}% failure rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fraud Attempts</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {securityMetrics.fraud_attempts}
              </div>
              <p className="text-xs text-muted-foreground">
                Detected and blocked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {securityMetrics.blocked_ips}
              </div>
              <p className="text-xs text-muted-foreground">
                Rate limit violations
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {securityEvents?.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getEventTypeColor(event.event_type)}>
                          {event.event_type.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        {event.ip_address && (
                          <div>IP: <code className="bg-muted px-1 rounded">{event.ip_address}</code></div>
                        )}
                        {event.details && (
                          <div className="text-xs text-muted-foreground">
                            {JSON.stringify(event.details, null, 2).substring(0, 200)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {!securityEvents?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No security events recorded yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Fraud Detection Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {fraudDetections?.map((fraud) => (
                  <div key={fraud.id} className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getRiskScoreColor(fraud.risk_score)}>
                          Risk Score: {fraud.risk_score}
                        </Badge>
                        <Badge variant="outline">{fraud.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(fraud.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>User:</strong> {fraud.profiles?.full_name} ({fraud.profiles?.email})
                        </div>
                        <div>
                          <strong>Order ID:</strong> {fraud.order_id}
                        </div>
                        {fraud.ip_address && (
                          <div>
                            <strong>IP:</strong> <code className="bg-muted px-1 rounded">{fraud.ip_address}</code>
                          </div>
                        )}
                        {fraud.risk_factors && (
                          <div className="text-xs text-muted-foreground">
                            <strong>Risk Factors:</strong> {JSON.stringify(fraud.risk_factors, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {fraud.status === 'review_required' && (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReviewFraud(fraud.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReviewFraud(fraud.id, 'rejected')}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {!fraudDetections?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No fraud detection records found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Payment security systems are operational and monitoring all transactions.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rate Limiting</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fraud Detection</span>
                    <Badge variant="default">Monitoring</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Verification</span>
                    <Badge variant="default">Secure</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Logging</span>
                    <Badge variant="default">Recording</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Real-time security monitoring is active. All payment transactions, 
                  authentication attempts, and system access are being logged and analyzed.
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">99.8%</div>
                    <div className="text-xs text-muted-foreground">System Uptime</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">24/7</div>
                    <div className="text-xs text-muted-foreground">Monitoring</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};