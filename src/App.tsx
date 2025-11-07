import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceOrderProvider } from "@/contexts/ServiceOrderContext";
import { TechnicianProvider } from "@/contexts/TechnicianContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ServiceOrderPage from "./pages/ServiceOrderPage";
import NewServiceOrderPage from "./pages/NewServiceOrderPage";
import ServiceOrderDetailPage from "./pages/ServiceOrderDetailPage";
import TechnicianDashboardPage from "./pages/TechnicianDashboardPage";
import TechnicianRegistrationPage from "./pages/TechnicianRegistrationPage";
import MainLayout from "./components/MainLayout"; // Importar o MainLayout

const queryClient = new QueryClient();

const App = () => {
  console.log('App component is rendering');
  return (
    <QueryClientProvider client={queryClient}>
      <>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <TechnicianProvider>
              <ServiceOrderProvider>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  {/* Rotas que usam o MainLayout */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/service-orders" element={<ServiceOrderPage />} />
                    <Route path="/service-orders/new" element={<NewServiceOrderPage />} />
                    <Route path="/service-orders/:id" element={<ServiceOrderDetailPage />} />
                    <Route path="/technician-dashboard" element={<TechnicianDashboardPage />} />
                    <Route path="/register-technician" element={<TechnicianRegistrationPage />} />
                  </Route>
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ServiceOrderProvider>
            </TechnicianProvider>
          </AuthProvider>
        </BrowserRouter>
      </>
    </QueryClientProvider>
  );
};

export default App;