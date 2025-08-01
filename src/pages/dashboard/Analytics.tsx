import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalytics, useSalesTrend, useProductDistribution, useRecentActivities, useOrderStatusDistribution } from '@/hooks/useAnalytics';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatIndianCurrency } from '@/lib/utils';
import { TrendingUp, ShoppingCart, DollarSign, Package, UserPlus, Download, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30');
  const [isExporting, setIsExporting] = useState(false);

  // Real-time data hooks
  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics
  } = useAnalytics();
  const {
    data: salesData,
    isLoading: salesLoading
  } = useSalesTrend();
  const {
    data: productData,
    isLoading: productLoading
  } = useProductDistribution();
  const {
    data: orderStatusData,
    isLoading: orderStatusLoading
  } = useOrderStatusDistribution();
  const {
    data: recentActivities,
    isLoading: activitiesLoading
  } = useRecentActivities();
  const isLoading = analyticsLoading || salesLoading || productLoading || orderStatusLoading || activitiesLoading;
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Create CSV data
      const csvData = [['Metric', 'Value'], ['Total Revenue', formatIndianCurrency(analytics?.totalRevenue || 0)], ['Total Orders', analytics?.totalOrders || 0], ['Active Franchises', analytics?.activeFranchises || 0], [''], ['Sales Trend Data'], ['Month', 'Revenue'], ...(salesData?.map(item => [item.month, item.revenue]) || []), [''], ['Product Distribution'], ['Category', 'Quantity'], ...(productData?.map(item => [item.name, item.quantity]) || [])].map(row => row.join(',')).join('\n');

      // Download CSV
      const blob = new Blob([csvData], {
        type: 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Export Successful",
        description: "Analytics report has been downloaded."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analytics report.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Format analytics data for display
  const metrics = analytics ? [{
    title: 'Total Revenue',
    value: formatIndianCurrency(analytics.totalRevenue),
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600'
  }, {
    title: 'Total Orders',
    value: analytics.totalOrders.toString(),
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'text-blue-600'
  }, {
    title: 'Active Franchises',
    value: analytics.activeFranchises.toString(),
    change: '+2',
    trend: 'up',
    icon: UserPlus,
    color: 'text-orange-600'
  }] : [];

  // Format product data for pie chart with vibrant colors
  const formattedProductData = productData?.map((item, index) => ({
    ...item,
    color: ['hsl(220, 100%, 55%)', 'hsl(280, 100%, 65%)', 'hsl(120, 85%, 45%)', 'hsl(35, 90%, 55%)', 'hsl(340, 85%, 60%)'][index % 5]
  })) || [];

  // Format order status data for donut chart
  const formattedOrderStatusData = orderStatusData?.map((item, index) => ({
    ...item,
    color: ['hsl(220, 100%, 55%)', 'hsl(280, 100%, 65%)', 'hsl(120, 85%, 45%)', 'hsl(35, 90%, 55%)', 'hsl(340, 85%, 60%)'][index % 5]
  })) || [];
  if (isLoading) {
    return <div className="p-6 space-y-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>;
  }
  return <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time insights into your business performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetchAnalytics()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleExport} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  
                </div>
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Sales Trend - Curved Parabolic Design */}
        <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-100/50 dark:from-blue-950/20 dark:to-indigo-950/40 border-2 border-primary/20 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="w-5 h-5" />
              Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={salesData || []} margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5
            }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(220, 100%, 55%)" stopOpacity={0.9} />
                    <stop offset="25%" stopColor="hsl(250, 100%, 65%)" stopOpacity={0.7} />
                    <stop offset="75%" stopColor="hsl(280, 100%, 65%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(300, 100%, 70%)" stopOpacity={0.1} />
                  </linearGradient>
                  <filter id="salesGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge> 
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{
                fontSize: 12,
                fill: 'hsl(var(--muted-foreground))'
              }} axisLine={{
                stroke: 'hsl(var(--border))'
              }} />
                <YAxis tick={{
                fontSize: 12,
                fill: 'hsl(var(--muted-foreground))'
              }} axisLine={{
                stroke: 'hsl(var(--border))'
              }} tickFormatter={value => `₹${value / 1000}K`} />
                <Tooltip contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }} formatter={value => [`₹${value.toLocaleString()}`, 'Revenue']} labelStyle={{
                color: 'hsl(var(--foreground))'
              }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(220, 100%, 55%)" strokeWidth={4} fill="url(#salesGradient)" filter="url(#salesGlow)" connectNulls={true} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Distribution */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Product Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={formattedProductData} cx="50%" cy="50%" labelLine={false} label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="quantity">
                  {formattedProductData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Distribution */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Order Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={formattedOrderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="count">
                {formattedOrderStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities?.map((activity, index) => <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <p className="font-medium text-foreground">Activity #{activity.id}</p>
                  <p className="text-sm text-muted-foreground">Type: {activity.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={activity.status === 'pending' ? 'secondary' : activity.status === 'delivered' ? 'default' : 'outline'}>
                    {activity.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              </div>) || <div className="text-center text-muted-foreground py-8">
                No recent activities found
              </div>}
          </div>
        </CardContent>
      </Card>
    </div>;
}