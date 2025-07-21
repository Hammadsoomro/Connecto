import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PhoneNumber, SubAccount } from "@shared/types";
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
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Fetch phone numbers
  const { data: phoneNumbers = [] } = useQuery({
    queryKey: ["phone-numbers"],
    queryFn: async () => {
      const response = await fetch("/api/phone-numbers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch phone numbers");
      return response.json() as Promise<PhoneNumber[]>;
    },
    enabled: !!token,
  });

  // Fetch sub-accounts
  const { data: subAccounts = [] } = useQuery({
    queryKey: ["sub-accounts"],
    queryFn: async () => {
      const response = await fetch("/api/sub-accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch sub-accounts");
      return response.json() as Promise<SubAccount[]>;
    },
    enabled: !!token,
  });

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
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-500/20'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-500/20'} rounded-full blur-3xl animate-pulse delay-1000`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 ${theme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-500/20'} rounded-full blur-3xl animate-pulse delay-500`}></div>
      </div>

      {/* Navigation Bar */}
            <nav className={`relative z-10 border-b ${theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-white/10 bg-black/20'} backdrop-blur supports-[backdrop-filter]:${theme === 'dark' ? 'bg-black/30' : 'bg-black/30'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="relative">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Connectlify</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                                className={`h-9 w-9 ${theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-white hover:bg-white/10'}`}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
                            <div className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              
              <Button 
                variant="outline" 
                onClick={logout} 
                className={`flex items-center space-x-2 ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-white/30 bg-transparent text-white hover:bg-white/10 border-2'}`}
              >
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
                    <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-white'} mb-4 animate-fade-in`}>
            Welcome back, {user?.name}!
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'} text-lg animate-fade-in-delay`}>
            Manage your SMS communications and phone numbers from your dashboard.
          </p>
        </div>

        {/* Navigation Buttons - Same size as logout */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 animate-slide-up">
          {mainFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} to={feature.href}>
                <Button 
                  variant="outline" 
                  className={`flex items-center space-x-2 ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-white/30 bg-transparent text-white hover:bg-white/10 border-2'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{feature.title}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up-delay">
                    {/* Wallet Balance */}
          <Link to="/wallet">
            <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer`}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-green-400" />
                </div>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-white'} mb-2`}>Wallet Balance</h3>
                <p className="text-2xl font-bold text-green-400">$25.00</p>
              </CardContent>
            </Card>
          </Link>

          {/* SMS Sent */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} backdrop-blur-sm`}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-white'} mb-2`}>SMS Sent</h3>
              <p className="text-2xl font-bold text-blue-400">1,247</p>
            </CardContent>
          </Card>

                    {/* Phone Numbers */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} backdrop-blur-sm`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-purple-400">{phoneNumbers.length}</p>
              </div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-white'} mb-2`}>Phone Numbers</h3>
              <div className="space-y-1 text-sm">
                {phoneNumbers.slice(0, 3).map((number) => (
                  <div key={number.id} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                    {number.phoneNumber} {number.isPrimary && "⭐"}
                  </div>
                ))}
                {phoneNumbers.length > 3 && (
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} text-xs`}>
                    +{phoneNumbers.length - 3} more
                  </div>
                )}
                {phoneNumbers.length === 0 && (
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} text-xs`}>
                    No numbers purchased
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

                    {/* Sub Accounts */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} backdrop-blur-sm`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-orange-400">{subAccounts.length}</p>
              </div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-white'} mb-2`}>Sub Accounts</h3>
              <div className="space-y-1 text-sm">
                {subAccounts.slice(0, 2).map((account) => (
                  <div key={account.id} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-xs opacity-75">{account.email}</div>
                  </div>
                ))}
                {subAccounts.length > 2 && (
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} text-xs`}>
                    +{subAccounts.length - 2} more
                  </div>
                )}
                {subAccounts.length === 0 && (
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} text-xs`}>
                    No sub-accounts created
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Button Style */}
        <div className="mb-8 animate-slide-up-delay">
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-white'} mb-4 text-center`}>Quick Actions</h2>
          <div className="flex justify-center gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.href}>
                  <Button 
                    variant="outline"
                    className={`flex items-center space-x-2 ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-white/30 bg-transparent text-white hover:bg-white/10 border-2'}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{action.title}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-float max-w-4xl mx-auto">
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} backdrop-blur-sm`}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-white'} mb-2`}>Fast & Reliable</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                Send SMS messages instantly with 99.9% delivery rate
              </p>
            </CardContent>
          </Card>
          
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} backdrop-blur-sm animate-float-delay`}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-white'} mb-2`}>Secure</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                End-to-end encryption and secure message handling
              </p>
            </CardContent>
          </Card>
          
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} backdrop-blur-sm`}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-white'} mb-2`}>Global Reach</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                Send messages worldwide with local numbers
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
