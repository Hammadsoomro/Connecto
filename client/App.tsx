import "./global.css";

import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SocketProvider } from "@/contexts/SocketContext";
import ErrorBoundary from "@/components/ErrorBoundary";

import Index from "./pages/Index";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import BuyNumbers from "./pages/BuyNumbers";
import BuyNumbersPage from "./pages/BuyNumbersPage";
import Pricing from "./pages/Pricing";
import SubAccounts from "./pages/SubAccounts";
import SubAccountManagement from "./pages/SubAccountManagement";
import Wallet from "./pages/Wallet";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as any).status;
          if (status === 401 || status === 403) {
            return false;
          }
        }
        return failureCount < 2; // Reduced retry attempts
      },
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes
      refetchOnWindowFocus: false, // Prevent refetch on window focus
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
});

function AuthenticatedApp() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<
    "landing" | "login" | "register"
  >("landing");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    if (currentView === "login") {
      return (
        <div className="min-h-screen">
          <LoginPage onSwitchToRegister={() => setCurrentView("register")} />
        </div>
      );
    }

    if (currentView === "register") {
      return (
        <div className="min-h-screen">
          <RegisterPage onSwitchToLogin={() => setCurrentView("login")} />
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <LandingPage
          onLogin={() => setCurrentView("login")}
          onRegister={() => setCurrentView("register")}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/conversations" element={<Dashboard />} />
            <Route path="/buy-numbers" element={<BuyNumbers />} />
            <Route path="/buy-numbers/select" element={<BuyNumbersPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/sub-accounts" element={<SubAccounts />} />
            <Route path="/sub-accounts/:subAccountId" element={<SubAccountManagement />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile-settings" element={<Dashboard />} />
            <Route path="/account-settings" element={<Dashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </ErrorBoundary>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthenticatedApp />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById("root")!).render(<App />);
