import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ViewModeProvider } from "@/hooks/useViewMode";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import FarmerProfile from "./pages/FarmerProfile";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmDashboard from "./pages/FarmDashboard";
import InventoryManagement from "./pages/InventoryManagement";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ViewModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/farmer/:farmId" element={<FarmerProfile />} />
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/farm/:farmId" element={<FarmDashboard />} />
            <Route path="/farm/:farmId/inventory" element={<InventoryManagement />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ViewModeProvider>
  </QueryClientProvider>
);

export default App;
