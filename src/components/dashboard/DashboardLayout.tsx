import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Award, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut,
  Building2,
  FileText,
  Home,
  Gift,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['owner', 'franchise']
  },
  {
    name: 'Admin Dashboard',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
    roles: ['admin']
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: ['owner', 'admin']
  },
  {
    name: 'Order History',
    href: '/dashboard/order-history',
    icon: ShoppingCart,
    roles: ['owner', 'admin']
  },
  {
    name: 'Invoice Management',
    href: '/dashboard/invoices',
    icon: FileText,
    roles: ['owner', 'admin']
  },
  {
    name: 'User Management',
    href: '/dashboard/users',
    icon: Users,
    roles: ['owner', 'admin']
  },
  {
    name: 'Franchise Management',
    href: '/dashboard/franchise',
    icon: Building2,
    roles: ['owner', 'admin']
  },
  {
    name: 'Inventory',
    href: '/dashboard/inventory',
    icon: Package,
    roles: ['owner', 'admin']
  },
  {
    name: 'Products',
    href: '/dashboard/products',
    icon: Package,
    roles: ['franchise']
  },
  {
    name: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    roles: ['owner', 'admin']
  },
  {
    name: 'Loyalty',
    href: '/dashboard/loyalty',
    icon: Award,
    roles: ['franchise']
  },
  {
    name: 'Loyalty Management',
    href: '/dashboard/loyalty-management',
    icon: Award,
    roles: ['owner', 'admin']
  },
  {
    name: 'Blog Management',
    href: '/dashboard/blog',
    icon: FileText,
    roles: ['owner']
  },
  {
    name: 'Testimonials',
    href: '/dashboard/testimonials',
    icon: MessageSquare,
    roles: ['owner', 'admin']
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: ['owner']
  },
  {
    name: 'Statistics',
    href: '/dashboard/statistics',
    icon: BarChart3,
    roles: ['owner', 'admin']
      },
      {
        name: 'Inventory',
        href: '/dashboard/inventory',
        icon: Package,
        roles: ['owner']
      },
      {
        name: 'Security',
        href: '/dashboard/security',
        icon: Shield,
        roles: ['owner', 'admin']
      },
  {
    name: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
    roles: ['franchise', 'admin', 'owner']
  },
  {
    name: 'Forms',
    href: '/dashboard/forms',
    icon: FileText,
    roles: ['owner', 'admin']
  }
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();
  const userRole = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Role-specific navigation items
  let navigation = sidebarItems;
  
  if (userRole === 'franchise') {
    navigation = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['franchise']
      },
      {
        name: 'New Order',
        href: '/order',
        icon: ShoppingCart,
        roles: ['franchise']
      },
      {
        name: 'My Orders',
        href: '/orders',
        icon: Package,
        roles: ['franchise']
      },
      {
        name: 'Loyalty Rewards',
        href: '/dashboard/loyalty',
        icon: Gift,
        roles: ['franchise']
      },
      {
        name: 'Messages',
        href: '/dashboard/messages',
        icon: MessageSquare,
        roles: ['franchise']
      }
    ];
  } else if (userRole === 'admin') {
    // Admin gets access to key management features
    navigation = [
      {
        name: 'Admin Dashboard',
        href: '/dashboard/admin',
        icon: LayoutDashboard,
        roles: ['admin']
      },
      {
        name: 'Orders',
        href: '/dashboard/orders',
        icon: ShoppingCart,
        roles: ['admin']
      },
      {
        name: 'Order History',
        href: '/dashboard/order-history',
        icon: ShoppingCart,
        roles: ['admin']
      },
      {
        name: 'Invoice Management',
        href: '/dashboard/invoices',
        icon: FileText,
        roles: ['admin']
      },
      {
        name: 'Inventory',
        href: '/dashboard/inventory',
        icon: Package,
        roles: ['admin']
      },
      {
        name: 'User Management',
        href: '/dashboard/user-management',
        icon: Users,
        roles: ['admin']
      },
      {
        name: 'Loyalty Management',
        href: '/dashboard/loyalty-management',
        icon: Award,
        roles: ['admin']
      },
      {
        name: 'Messages',
        href: '/dashboard/messages',
        icon: MessageSquare,
        roles: ['admin']
      },
      {
        name: 'Security',
        href: '/dashboard/security',
        icon: Shield,
        roles: ['admin']
      }
    ];
  } else if (userRole === 'owner') {
    // Owner gets full access to all management features
    navigation = [
      {
        name: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['owner']
      },
      {
        name: 'Blog Management',
        href: '/dashboard/blog',
        icon: FileText,
        roles: ['owner']
      },
      {
        name: 'Forms',
        href: '/dashboard/forms',
        icon: FileText,
        roles: ['owner']
      },
      {
        name: 'Testimonials',
        href: '/dashboard/testimonials',
        icon: MessageSquare,
        roles: ['owner']
      },
      {
        name: 'Statistics',
        href: '/dashboard/statistics',
        icon: BarChart3,
        roles: ['owner']
      },
      {
        name: 'User Management',
        href: '/dashboard/users',
        icon: Users,
        roles: ['owner']
      },
      {
        name: 'Inventory',
        href: '/dashboard/inventory',
        icon: Package,
        roles: ['owner']
      },
      {
        name: 'Franchise Management',
        href: '/dashboard/franchise',
        icon: Building2,
        roles: ['owner']
      },
      {
        name: 'Orders',
        href: '/dashboard/orders',
        icon: ShoppingCart,
        roles: ['owner']
      },
      {
        name: 'Order History',
        href: '/dashboard/order-history',
        icon: ShoppingCart,
        roles: ['owner']
      },
      {
        name: 'Invoice Management',
        href: '/dashboard/invoices',
        icon: FileText,
        roles: ['owner']
      },
      {
        name: 'Loyalty Management',
        href: '/dashboard/loyalty-management',
        icon: Award,
        roles: ['owner']
      },
      {
        name: 'Messages',
        href: '/dashboard/messages',
        icon: MessageSquare,
        roles: ['owner']
      },
      {
        name: 'Security',
        href: '/dashboard/security',
        icon: Shield,
        roles: ['owner']
      }
    ];
  }

  const filteredSidebarItems = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full min-h-0">
      {/* Logo */}
      <div className="flex items-center space-x-3 p-6 border-b border-border flex-shrink-0">
        <img src="/Uploads/e4d9c660-8cfa-4a85-82a9-a92de0445a63.png" alt="T VANAMM Logo" className="w-8 h-8" />
        <div>
          <div className="font-bold text-foreground">T VANAMM</div>
          <div className="text-xs text-muted-foreground capitalize">{userRole} Portal</div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-0">
        {filteredSidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.href);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-smooth",
                isActive
                  ? "bg-primary text-primary-foreground shadow-brand"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Sign Out - Always visible at bottom */}
      <div className="p-4 border-t border-border flex-shrink-0 mt-auto">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              {user?.email}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {userRole}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-card lg:border-r lg:border-border lg:block">
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Desktop header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 shadow-sm">
          {/* Mobile menu button */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 text-sm font-semibold leading-6 text-foreground lg:hidden">
            Dashboard
          </div>

          {/* Home button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Site</span>
          </Button>
        </div>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
      </div>
    </div>
  );
};

export default DashboardLayout;