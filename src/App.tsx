import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip"; // Removido temporariamente
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceOrderProvider } from "@/contexts/ServiceOrderContext"; // Import ServiceOrderProvider
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ServiceOrderPage from "./pages/ServiceOrderPage";
import NewServiceOrderPage from "./pages/NewServiceOrderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ServiceOrderProvider> {/* Envolvendo com ServiceOrderProvider */}
            {/* TooltipProvider removido temporariamente para depuração */}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/service-orders" element={<ServiceOrderPage />} />
              <Route path="/service-orders/new" element={<NewServiceOrderPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ServiceOrderProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  </QueryClientProvider>
);

export default App;