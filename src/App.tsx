import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardGuard from "@/components/dashboard/DashboardGuard";
import StickyPaymentReminder from "@/components/common/StickyPaymentReminder";
import Index from "./pages/Index";
import About from "./pages/About";
import Franchise from "./pages/Franchise";
import Order from "./pages/Order";
import Auth from "./pages/Auth";
import Overview from "./pages/dashboard/Overview";
import Analytics from "./pages/dashboard/Analytics";
import OrderHistory from "./pages/dashboard/OrderHistory";
import InventoryManagement from "./pages/dashboard/InventoryManagement";
import UserManagement from "./pages/dashboard/UserManagement";
import NewUserManagementPage from "./pages/dashboard/NewUserManagement";
import StatisticsManagementPage from "./pages/dashboard/StatisticsManagement";
import TestimonialsManagementPage from "./pages/dashboard/TestimonialsManagement";
import BlogManagement from "./pages/dashboard/BlogManagement";
import EnhancedOrderManagement from "./pages/dashboard/EnhancedOrderManagement";
import LoyaltyManagement from "./pages/dashboard/LoyaltyManagement";
import FranchiseLoyaltyPage from "./pages/dashboard/FranchiseLoyaltyPage";
import EnhancedMessages from "./pages/dashboard/EnhancedMessages";
import ProductCatalog from "./pages/dashboard/ProductCatalog";
import Forms from "./pages/dashboard/Forms";
import InvoiceManagement from "./pages/dashboard/InvoiceManagement";
import FranchiseManagement from "./pages/dashboard/FranchiseManagement";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import SecurityDashboard from "./pages/dashboard/SecurityDashboard";
import { injectSpeedInsights } from '@vercel/speed-insights';
injectSpeedInsights();
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Invoices from "./pages/Invoices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <StickyPaymentReminder />
          <Routes>
            {/* Public routes with navbar */}
            <Route path="/" element={
              <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <Index />
                <Footer />
              </div>
            } />
            <Route path="/about" element={
              <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <About />
                <Footer />
              </div>
            } />
            <Route path="/franchise" element={
              <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <Franchise />
                <Footer />
              </div>
            } />
            <Route path="/order" element={
              <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <Order />
                <Footer />
              </div>
            } />
            <Route path="/contact" element={
              <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <Contact />
                <Footer />
              </div>
            } />
            <Route path="/blog" element={
              <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <Blog />
                <Footer />
              </div>
            } />
            <Route path="/profile" element={
              <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <Profile />
                <Footer />
              </div>
            } />
            <Route path="/orders" element={
              <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <Orders />
                <Footer />
              </div>
            } />
            <Route path="/invoices" element={
              <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <Invoices />
                <Footer />
              </div>
            } />
            <Route path="/auth" element={
              <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <Auth />
                <Footer />
              </div>
            } />
            
            {/* Dashboard routes with DashboardGuard handling layout */}
            <Route path="/dashboard" element={<DashboardGuard />}>
              <Route index element={<Overview />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="order-history" element={<OrderHistory />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="products" element={<ProductCatalog />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="user-management" element={<NewUserManagementPage />} />
              <Route path="statistics" element={<StatisticsManagementPage />} />
              <Route path="testimonials" element={<TestimonialsManagementPage />} />
              <Route path="blog" element={<BlogManagement />} />
              <Route path="orders" element={<EnhancedOrderManagement />} />
              <Route path="loyalty" element={<FranchiseLoyaltyPage />} />
              <Route path="loyalty-management" element={<LoyaltyManagement />} />
              <Route path="messages" element={<EnhancedMessages />} />
              <Route path="forms" element={<Forms />} />
              <Route path="invoices" element={<InvoiceManagement />} />
              <Route path="franchise" element={<FranchiseManagement />} />
              <Route path="security" element={<SecurityDashboard />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;