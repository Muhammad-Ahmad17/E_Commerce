
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

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

const App = () => {
  const [showDbAlert, setShowDbAlert] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              
              {/* Database Expiration Alert */}
              <AlertDialog open={showDbAlert} onOpenChange={setShowDbAlert}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold text-red-600">
                      ⚠️ Database Service Expired
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base space-y-3 pt-2">
                      <p className="font-semibold text-foreground">
                        The live demo is currently unavailable as the database service has expired.
                      </p>
                      <p>
                        Please refer to the <span className="font-semibold text-primary">documentation</span> to:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>View project architecture and features</li>
                        <li>Understand the database schema and design</li>
                        <li>Set up the project locally on your machine</li>
                        <li>Explore the codebase and implementation details</li>
                      </ul>
                      <p className="text-sm italic mt-4">
                        Check the README.md file in the project repository for complete setup instructions.
                      </p>
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Complete Documentation Available
                        </p>
                        <a
                          href="https://github.com/Muhammad-Ahmad17/E_Commerce/blob/main/docomentaion.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          📄 View Full Documentation PDF →
                        </a>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://github.com/Muhammad-Ahmad17/E_Commerce/blob/main/docomentaion.pdf', '_blank')}
                      className="w-full sm:w-auto"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Documentation
                    </Button>
                    <AlertDialogAction onClick={() => setShowDbAlert(false)} className="w-full sm:w-auto">
                      I Understand
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

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
};

export default App;
