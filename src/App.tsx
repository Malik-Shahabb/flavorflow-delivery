import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RecentOrdersSummary from "@/components/RecentOrdersSummary";
import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingTour from "@/components/OnboardingTour";
import Index from "./pages/Index";
import RestaurantsPage from "./pages/RestaurantsPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RegisterRestaurantPage from "./pages/RegisterRestaurantPage";
import ManageRestaurantPage from "./pages/ManageRestaurantPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import OwnerOrdersPage from "./pages/OwnerOrdersPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import RestaurantAnalyticsPage from "./pages/RestaurantAnalyticsPage";
import AboutPage from "./pages/AboutPage";
import DeliveryDashboardPage from "./pages/DeliveryDashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <OnboardingTour />
              <Navbar />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Protected routes */}
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/register-restaurant" element={<ProtectedRoute><RegisterRestaurantPage /></ProtectedRoute>} />
                <Route path="/manage-restaurant/:id" element={<ProtectedRoute><ManageRestaurantPage /></ProtectedRoute>} />
                <Route path="/owner-dashboard" element={<ProtectedRoute><OwnerDashboardPage /></ProtectedRoute>} />
                <Route path="/owner-orders/:id" element={<ProtectedRoute><OwnerOrdersPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
                <Route path="/analytics/:id" element={<ProtectedRoute><RestaurantAnalyticsPage /></ProtectedRoute>} />
                <Route path="/delivery-dashboard" element={<ProtectedRoute><DeliveryDashboardPage /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
              <RecentOrdersSummary />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
