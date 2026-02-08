import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              {/* Principal routes */}
              <Route path="/critical" element={<ComingSoon />} />
              <Route path="/team-feed" element={<ComingSoon />} />
              <Route path="/quick-actions" element={<ComingSoon />} />
              <Route path="/direction" element={<ComingSoon />} />
              <Route path="/reminders" element={<ComingSoon />} />
              <Route path="/meetings" element={<ComingSoon />} />
              {/* EA routes */}
              <Route path="/my-tasks" element={<ComingSoon />} />
              <Route path="/meeting-prep" element={<ComingSoon />} />
              {/* Manager/Sales routes */}
              <Route path="/notes" element={<ComingSoon />} />
              <Route path="/items" element={<ComingSoon />} />
              <Route path="/submission" element={<ComingSoon />} />
              <Route path="/history" element={<ComingSoon />} />
              {/* GM routes */}
              <Route path="/team-overview" element={<ComingSoon />} />
              <Route path="/sales-overview" element={<ComingSoon />} />
              {/* Sales routes */}
              <Route path="/pipeline" element={<ComingSoon />} />
              <Route path="/deals" element={<ComingSoon />} />
              {/* Settings */}
              <Route path="/settings" element={<ComingSoon />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
