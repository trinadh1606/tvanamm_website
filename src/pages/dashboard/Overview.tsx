import React from 'react';
import { Card } from '@/components/ui/card';
import { useUserRole } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useLoyaltyPoints } from '@/hooks/useLoyalty';
import { useFranchiseOverview, useFranchiseRecentActivity } from '@/hooks/useFranchiseOverview';
import { useOwnerRecentActivity } from '@/hooks/useOwnerRecentActivity';
import { formatIndianCurrency } from '@/lib/utils';
import { ShoppingCart, Package, Users, TrendingUp, Award, Building2, Star, Clock } from 'lucide-react';
const Overview = () => {
  const userRole = useUserRole();
  const {
    data: analytics,
    isLoading: analyticsLoading
  } = useAnalytics();
  const {
    data: loyaltyPoints,
    isLoading: loyaltyLoading
  } = useLoyaltyPoints();
  const {
    data: franchiseOverview,
    isLoading: franchiseOverviewLoading
  } = useFranchiseOverview();
  const {
    data: recentActivity,
    isLoading: activityLoading
  } = useFranchiseRecentActivity();
  const {
    data: ownerActivity,
    isLoading: ownerActivityLoading
  } = useOwnerRecentActivity();
  const getStatsForRole = () => {
    if (analyticsLoading || loyaltyLoading || franchiseOverviewLoading) return [];
    switch (userRole) {
      case 'owner':
      case 'admin':
        return analytics ? [{
          title: 'Total Orders',
          value: analytics.totalOrders.toString(),
          change: '+12%',
          icon: ShoppingCart,
          color: 'text-blue-600'
        }, {
          title: 'Revenue',
          value: formatIndianCurrency(analytics.totalRevenue),
          change: '+18%',
          icon: TrendingUp,
          color: 'text-green-600'
        }, {
          title: 'Active Franchises',
          value: analytics.activeFranchises.toString(),
          change: '+3',
          icon: Building2,
          color: 'text-purple-600'
        }] : [];
      case 'franchise':
        return [{
          title: 'Total Orders',
          value: franchiseOverview?.totalOrders?.toString() || '0',
          change: '+8%',
          icon: ShoppingCart,
          color: 'text-blue-600'
        }, {
          title: 'Loyalty Points',
          value: loyaltyPoints?.current_balance?.toString() || '0',
          change: '+125',
          icon: Award,
          color: 'text-purple-600'
        }, {
          title: 'Pending Orders',
          value: franchiseOverview?.pendingOrders?.toString() || '0',
          change: '-2',
          icon: Clock,
          color: 'text-orange-600'
        }];
      case 'customer':
        return [{
          title: 'Total Orders',
          value: '12',
          change: '+2',
          icon: ShoppingCart,
          color: 'text-blue-600'
        }, {
          title: 'Loyalty Points',
          value: loyaltyPoints?.current_balance?.toString() || '0',
          change: '+25',
          icon: Award,
          color: 'text-purple-600'
        }, {
          title: 'Favorite Products',
          value: '8',
          change: '+1',
          icon: Star,
          color: 'text-orange-600'
        }, {
          title: 'Pending Orders',
          value: '1',
          change: '0',
          icon: Clock,
          color: 'text-green-600'
        }];
      default:
        return [];
    }
  };
  const stats = getStatsForRole();
  const getWelcomeMessage = () => {
    switch (userRole) {
      case 'owner':
        return {
          title: 'Owner Dashboard',
          description: 'Complete overview of your T VANAMM business operations and performance.'
        };
      case 'admin':
        return {
          title: 'Admin Dashboard',
          description: 'Manage operations, orders, and franchise network efficiently.'
        };
      case 'franchise':
        return {
          title: 'Franchise Dashboard',
          description: 'Track your orders, performance, and grow your business with T VANAMM.'
        };
      case 'customer':
        return {
          title: 'My Account',
          description: 'Track your orders, loyalty points, and explore premium tea collections.'
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to T VANAMM portal.'
        };
    }
  };
  const welcome = getWelcomeMessage();
  if (analyticsLoading || loyaltyLoading || franchiseOverviewLoading || activityLoading || ownerActivityLoading) {
    return <div className="p-6 space-y-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>;
  }
  return <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-button rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{welcome.title}</h1>
        <p className="text-white/90">{welcome.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => <Card key={stat.title} className="p-6 gradient-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                
              </div>
              <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>)}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 gradient-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {userRole === 'owner' || userRole === 'admin' ? <>
                {ownerActivity?.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'order' ? 'bg-green-500' : 
                      activity.type === 'payment' ? 'bg-blue-500' : 
                      activity.type === 'user' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm text-muted-foreground">{activity.description}</span>
                  </div>
                )) || (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">No recent activity</span>
                  </div>
                )}
              </> : userRole === 'franchise' ? <>
                {recentActivity?.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'order' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="text-sm text-muted-foreground">{activity.description}</span>
                  </div>
                )) || (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">No recent activity</span>
                  </div>
                )}
              </> : <>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Order shipped: Premium Assam Tea</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Loyalty milestone reached!</span>
                </div>
              </>}
          </div>
        </Card>

        <Card className="p-6 gradient-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {userRole === 'owner' || userRole === 'admin' ? <>
                <button className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-center transition-smooth">
                  <Package className="w-5 h-5 text-primary mx-auto mb-1" />
                  <span className="text-xs text-foreground">Add Product</span>
                </button>
                <button className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-center transition-smooth">
                  <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                  <span className="text-xs text-foreground">Manage Users</span>
                </button>
                <button className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-center transition-smooth">
                  <Building2 className="w-5 h-5 text-primary mx-auto mb-1" />
                  <span className="text-xs text-foreground">Franchises</span>
                </button>
                <button className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-center transition-smooth">
                  <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                  <span className="text-xs text-foreground">Analytics</span>
                </button>
              </> : userRole === 'franchise' ? <>
                <button className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-center transition-smooth">
                  <ShoppingCart className="w-5 h-5 text-primary mx-auto mb-1" />
                  <span className="text-xs text-foreground">New Order</span>
                </button>
                <button className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-center transition-smooth">
                  <Award className="w-5 h-5 text-primary mx-auto mb-1" />
                  <span className="text-xs text-foreground">Loyalty</span>
                </button>
              </> : <>
                <button className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-center transition-smooth">
                  <ShoppingCart className="w-5 h-5 text-primary mx-auto mb-1" />
                  <span className="text-xs text-foreground">Order Tea</span>
                </button>
                <button className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-center transition-smooth">
                  <Award className="w-5 h-5 text-primary mx-auto mb-1" />
                  <span className="text-xs text-foreground">Rewards</span>
                </button>
              </>}
          </div>
        </Card>
      </div>
    </div>;
};
export default Overview;