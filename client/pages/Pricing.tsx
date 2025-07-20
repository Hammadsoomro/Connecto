import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Check,
  Moon,
  Sun,
  LogOut,
  User,
  ArrowLeft,
  CreditCard
} from "lucide-react";

export default function Pricing() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for testing and small projects",
      features: [
        "1 Phone Number",
        "100 SMS/month",
        "Basic Support",
        "Dashboard Access"
      ],
      popular: false
    },
    {
      name: "Business",
      price: "$29",
      description: "Best for growing businesses",
      features: [
        "5 Phone Numbers",
        "5,000 SMS/month",
        "Priority Support",
        "Advanced Analytics",
        "Sub Accounts",
        "API Access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      description: "For large scale operations",
      features: [
        "Unlimited Phone Numbers",
        "50,000 SMS/month",
        "24/7 Support",
        "Custom Integration",
        "Dedicated Manager",
        "Custom Pricing for High Volume"
      ],
      popular: false
    }
  ];

    return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-purple-100 to-slate-50'}`}>
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
              <Link to="/">
                <Button variant="ghost" className="text-white hover:bg-white/10">
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in-delay">
            Choose the plan that's right for your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={plan.name} className={`relative bg-white/10 backdrop-blur-sm border text-white ${plan.popular ? 'border-purple-400 shadow-lg shadow-purple-500/20' : 'border-white/20'} hover:bg-white/15 transition-all duration-300`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.price !== "Free" && <span className="text-gray-300">/month</span>}
                </div>
                <CardDescription className="text-gray-300 mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full mt-6 ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-white/10 hover:bg-white/20'} text-white border-0`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {plan.price === "Free" ? "Get Started" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-300 mb-4">
            Need a custom plan? Contact our sales team for enterprise pricing.
          </p>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Contact Sales
          </Button>
        </div>
      </main>
    </div>
  );
}
