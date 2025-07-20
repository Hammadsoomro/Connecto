import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Phone,
  CreditCard,
  Users,
  Settings,
  Moon,
  Sun,
  LogOut,
  User,
  ChevronRight,
  Zap,
  Shield,
  Globe
} from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const mainFeatures = [
    {
      icon: MessageSquare,
      title: "Conversations",
      description: "Manage SMS conversations with your contacts",
      href: "/conversations",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Phone,
      title: "Buy New Numbers",
      description: "Purchase new phone numbers for your business",
      href: "/buy-numbers",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: CreditCard,
      title: "Pricing",
      description: "View pricing and manage your billing",
      href: "/pricing",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Sub Accounts",
      description: "Manage team members and sub-accounts",
      href: "/sub-accounts",
      color: "from-orange-500 to-red-500"
    }
  ];

  const quickActions = [
    {
      icon: Settings,
      title: "Profile Settings",
      href: "/profile-settings"
    },
    {
      icon: Users,
      title: "Account Settings",
      href: "/account-settings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur supports-[backdrop-filter]:bg-black/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="relative">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Connectlify</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 text-white hover:bg-white/10"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              <div className="flex items-center space-x-2 text-white">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              
              <Button variant="outline" onClick={logout} className="flex items-center space-x-2 border-white/20 text-white hover:bg-white/10">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in-delay">
            Manage your SMS communications and phone numbers from your dashboard.
          </p>
        </div>

        {/* Main Features Grid - Button Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
          {mainFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} to={feature.href}>
                <Button 
                  className={`w-full h-auto p-6 bg-gradient-to-r ${feature.color} hover:opacity-90 text-white border-0 flex flex-col items-center space-y-3 transition-all duration-200 hover:scale-105`}
                >
                  <Icon className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold text-base">{feature.title}</div>
                    <div className="text-xs opacity-90 mt-1">{feature.description}</div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions - Button Style */}
        <div className="mb-8 animate-slide-up-delay">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.href}>
                  <Button 
                    className="w-full h-auto p-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center space-x-3 transition-all duration-200 hover:scale-105"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{action.title}</span>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-float max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 text-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Fast & Reliable</h3>
              <p className="text-sm text-gray-300">
                Send SMS messages instantly with 99.9% delivery rate
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 text-white animate-float-delay">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Secure</h3>
              <p className="text-sm text-gray-300">
                End-to-end encryption and secure message handling
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 text-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Global Reach</h3>
              <p className="text-sm text-gray-300">
                Send messages worldwide with local numbers
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
