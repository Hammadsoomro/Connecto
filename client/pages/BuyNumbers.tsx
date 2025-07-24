import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  Phone,
  Moon,
  Sun,
  LogOut,
  User,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";

export default function BuyNumbers() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen overflow-hidden relative ${theme === "dark" ? "bg-gradient-to-br from-black via-gray-900 to-black" : "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"}`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 ${theme === "dark" ? "bg-purple-500/10" : "bg-purple-500/20"} rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${theme === "dark" ? "bg-blue-500/10" : "bg-blue-500/20"} rounded-full blur-3xl animate-pulse delay-1000`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 ${theme === "dark" ? "bg-pink-500/10" : "bg-pink-500/20"} rounded-full blur-3xl animate-pulse delay-500`}
        ></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur supports-[backdrop-filter]:bg-black/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <div className="relative">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Connectlify
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button
                  variant="ghost"
                  className={`${theme === "dark" ? "text-white hover:bg-white/10" : "text-white hover:bg-white/10"}`}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>

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

              <Button
                variant="outline"
                onClick={logout}
                className={`flex items-center space-x-2 ${theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-white/30 bg-transparent text-white hover:bg-white/10 border-2"}`}
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
            Buy Phone Numbers
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in-delay">
            Purchase new phone numbers for your SMS campaigns
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Get Started</CardTitle>
              <CardDescription className="text-gray-300">
                Choose and purchase a phone number for your business
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Phone className="h-8 w-8 text-white" />
              </div>

              <p className="text-gray-300">
                Select from thousands of available phone numbers across
                different countries
              </p>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2">
                    🇺🇸 United States
                  </h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>
                      Monthly:{" "}
                      <span className="text-green-400">$2.50 - $3.50</span>
                    </p>
                    <p>
                      SMS: <span className="text-green-400">$0.01</span> per
                      message
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2">🇨🇦 Canada</h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>
                      Monthly:{" "}
                      <span className="text-green-400">$3.00 - $4.50</span>
                    </p>
                    <p>
                      SMS: <span className="text-green-400">$0.01</span> per
                      message
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate("/buy-numbers/select")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 py-3"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Browse Available Numbers
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
