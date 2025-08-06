import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const userRole = useUserRole();
  const navigate = useNavigate();
  const { data: notifications } = useNotifications();
  const { cartCount } = useCart();

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Define role-based navigation and features
  const showCart = userRole === 'franchise'; // Only franchise can order

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Franchise', href: '/franchise' },
    { name: 'Order', href: '/order' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-card sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/Uploads/e4d9c660-8cfa-4a85-82a9-a92de0445a63.png" alt="T VANAMM Logo" className="w-10 h-10" />
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-primary">T VANAMM</span>
              <p className="text-xs text-muted-foreground">A unit of JKSH United Pvt Ltd</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary transition-smooth font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Messages/Notifications - Unified Interface */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => navigate('/dashboard/messages')}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>

                {/* Cart - Only show for franchise */}
                {showCart && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative"
                    onClick={() => navigate('/order')}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary">
                        {cartCount > 99 ? '99+' : cartCount}
                      </Badge>
                    )}
                  </Button>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span className="hidden lg:block">Profile</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="font-medium"
                >
                  Sign In
                </Button>
                <Button
                  variant="brand"
                  onClick={() => navigate('/auth?mode=signup')}
                  className="font-medium"
                >
                  Join T VANAMM
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-md border-t border-border">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-smooth"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <div className="pt-4 pb-3 border-t border-border">
                  <div className="flex items-center px-3 mb-3">
                    <div className="flex-shrink-0">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 text-base font-medium"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-border space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/auth');
                      setIsOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="brand"
                    className="w-full"
                    onClick={() => {
                      navigate('/auth?mode=signup');
                      setIsOpen(false);
                    }}
                  >
                    Join T VANAMM
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;