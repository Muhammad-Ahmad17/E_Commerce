
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// Layouts & Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import NotFound from "./pages/NotFound";

// Buyer Pages
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import ProductDetails from "./pages/buyer/ProductDetails";
import Cart from "./pages/buyer/Cart";
import OrderHistory from "./pages/buyer/OrderHistory";
import BuyerProfile from "./pages/buyer/Profile";

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import ProductManagement from "./pages/vendor/ProductManagement";
import OrderManagement from "./pages/vendor/OrderManagement";
import VendorProfile from "./pages/vendor/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/home" element={<NotFound />} />
                  {/* Buyer Routes */}
                  <Route element={<ProtectedRoute role="buyer" />}>
                    <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                    <Route path="/buyer/product/:id" element={<ProductDetails />} />
                    <Route path="/buyer/cart" element={<Cart />} />
                    <Route path="/buyer/orders" element={<OrderHistory />} />
                    <Route path="/buyer/profile" element={<BuyerProfile />} />
                  </Route>

                  {/* Vendor Routes */}
                  <Route element={<ProtectedRoute role="vendor" />}>
                    <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                    <Route path="/vendor/products" element={<ProductManagement />} />
                    <Route path="/vendor/orders" element={<OrderManagement />} />
                    <Route path="/vendor/profile" element={<VendorProfile />} />
                  </Route>

                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
