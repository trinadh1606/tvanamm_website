import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  Eye,
  Lock,
  Zap
} from 'lucide-react';

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
  ip_address?: string;
  user_id?: string;
  details: any;
  timestamp: string;
}

export default function SecurityAuditDashboard() {
  // Fetch security metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_security_metrics', { days_back: 7 });
      if (error) throw error;
      return data as unknown as SecurityMetrics;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch recent security events
  const { data: securityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as SecurityEvent[];
    },
    refetchInterval: 30000
  });

  // Fetch fraud detection records
  const { data: fraudAttempts, isLoading: fraudLoading } = useQuery({
    queryKey: ['fraud-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fraud_detection')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000
  });

  // Fetch blocked IPs
  const { data: blockedIPs, isLoading: ipsLoading } = useQuery({
    queryKey: ['blocked-ips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('ip_address, attempt_count, blocked_until, updated_at')
        .eq('is_blocked', true)
        .order('updated_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000
  });

  const getSecurityScore = () => {
    if (!metrics) return 0;
    let score = 100;
    
    // Deduct points for high failure rate
    if (metrics.failure_rate > 0.1) score -= 30;
    else if (metrics.failure_rate > 0.05) score -= 15;
    
    // Deduct points for fraud attempts
    if (metrics.fraud_attempts > 10) score -= 25;
    else if (metrics.fraud_attempts > 5) score -= 10;
    
    // Deduct points for blocked IPs
    if (metrics.blocked_ips > 20) score -= 20;
    else if (metrics.blocked_ips > 10) score -= 10;
    
    return Math.max(0, score);
  };

  const securityScore = getSecurityScore();
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    return <XCircle className="h-6 w-6 text-red-600" />;
  };

  if (metricsLoading || eventsLoading || fraudLoading || ipsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security Audit Dashboard</h1>
          <p className="text-muted-foreground">Monitor system security and threat detection</p>
        </div>
        <div className="flex items-center gap-2">
          {getScoreIcon(securityScore)}
          <span className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
            {securityScore}%
          </span>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_payments || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.failed_payments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics?.failure_rate || 0) * 100).toFixed(1)}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Attempts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics?.fraud_attempts || 0}</div>
            <p className="text-xs text-muted-foreground">Detected and blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Lock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics?.blocked_ips || 0}</div>
            <p className="text-xs text-muted-foreground">Currently blocked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityEvents?.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{event.event_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.ip_address && `IP: ${event.ip_address}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">Security</Badge>
                </div>
              ))}
              {(!securityEvents || securityEvents.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No recent security events</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fraud Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Fraud Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fraudAttempts?.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Risk Score: {attempt.risk_score}</p>
                    <p className="text-sm text-muted-foreground">
                      IP: {attempt.ip_address || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(attempt.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge 
                    variant={attempt.status === 'review_required' ? 'destructive' : 'secondary'}
                  >
                    {attempt.status}
                  </Badge>
                </div>
              ))}
              {(!fraudAttempts || fraudAttempts.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No fraud attempts detected</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blocked IPs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Currently Blocked IPs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {blockedIPs?.map((blocked, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                 <div>
                   <p className="font-medium">{String(blocked.ip_address)}</p>
                   <p className="text-sm text-muted-foreground">
                     {blocked.attempt_count} failed attempts
                   </p>
                   <p className="text-xs text-muted-foreground">
                     Blocked until: {blocked.blocked_until ? new Date(String(blocked.blocked_until)).toLocaleString() : 'Permanent'}
                   </p>
                 </div>
                <Badge variant="destructive">Blocked</Badge>
              </div>
            ))}
            {(!blockedIPs || blockedIPs.length === 0) && (
              <p className="text-center text-muted-foreground py-4">No currently blocked IPs</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}