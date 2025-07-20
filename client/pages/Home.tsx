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
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="relative">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-2xl font-bold text-foreground">Connectlify</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              
              <Button variant="outline" onClick={logout} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Manage your SMS communications and phone numbers from your dashboard.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mainFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} to={feature.href}>
                <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform duration-200">
                      <span>Get started</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.href}>
                  <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                    <CardContent className="flex items-center p-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mr-4 group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{action.title}</h3>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Fast & Reliable</h3>
              <p className="text-sm text-muted-foreground">
                Send SMS messages instantly with 99.9% delivery rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Secure</h3>
              <p className="text-sm text-muted-foreground">
                End-to-end encryption and secure message handling
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Global Reach</h3>
              <p className="text-sm text-muted-foreground">
                Send messages worldwide with local numbers
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
