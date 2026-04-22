import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import StreamPage from "./pages/StreamPage";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "@/store/use-auth-store";

const queryClient = new QueryClient();

const AppContent = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          {/* Global animated rose particle background */}
          <AnimatedBackground />

          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/"                   element={<Index />} />
              <Route path="/login"              element={<Login />} />
              <Route path="/signup"             element={<Signup />} />
              <Route path="/dashboard"          element={<Dashboard />} />
              <Route path="/stream/:username"   element={<StreamPage />} />
              <Route path="/profile/:username"  element={<Profile />} />
              <Route path="/reset-password"     element={<ResetPassword />} />
              <Route path="/auth/callback"      element={<AuthCallback />} />
              <Route path="*"                   element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

const App = () => <AppContent />;

export default App;
