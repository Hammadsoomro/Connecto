import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Smartphone,
  Shield,
  Zap,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState(0);
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: MessageSquare,
      title: "Real-time Messaging",
      description:
        "Send and receive SMS messages instantly with live notifications",
    },
    {
      icon: Users,
      title: "Contact Management",
      description: "Organize your contacts and track conversation history",
    },
    {
      icon: Smartphone,
      title: "Multiple Numbers",
      description:
        "Buy and manage multiple phone numbers for different purposes",
    },
    {
      icon: Shield,
      title: "Sub-accounts",
      description:
        "Create up to 3 sub-accounts and assign numbers to team members",
    },
  ];

  return (
    <div className={`min-h-screen overflow-hidden relative ${
      theme === "dark" 
        ? "bg-gradient-to-br from-black via-gray-900 to-black" 
        : "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    }`}>
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

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:p-8">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <MessageSquare className="h-8 w-8 text-purple-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className="text-2xl font-bold text-white">Connectlify</span>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white hover:bg-white/10"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:text-purple-300 hover:bg-white/10"
            onClick={onLogin}
          >
            Login
          </Button>
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            onClick={onRegister}
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full backdrop-blur-sm border text-sm mb-8 animate-fade-in bg-white/10 border-white/20 text-purple-300">
            <Zap className="w-4 h-4 mr-2" />
            Powered by Twilio & Real-time Technology
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 animate-slide-up text-white">
            Connect{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Everyone
            </span>
            <br />
            <span className="text-4xl lg:text-6xl">Instantly</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl mb-12 max-w-3xl mx-auto animate-fade-in-delay text-gray-300">
            The most powerful SMS platform for businesses. Send, receive, and
            manage conversations with real-time messaging, multiple numbers, and
            team collaboration.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up-delay">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 text-lg px-8 py-6 rounded-xl group"
              onClick={onRegister}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-xl backdrop-blur-sm border-white/30 text-white hover:bg-white/10 bg-transparent"
              onClick={onLogin}
            >
              Sign In
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    "p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 cursor-pointer",
                    activeFeature === index
                      ? "bg-white/20 border-purple-400/50 scale-105"
                      : "bg-white/10 border-white/20 hover:bg-white/15",
                  )}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                      <Icon className="h-6 w-6 text-purple-300" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 right-20 animate-float">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
            <Globe className="h-8 w-8 text-purple-300" />
          </div>
        </div>

        <div className="absolute bottom-20 left-20 animate-float-delay">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-blue-300" />
          </div>
        </div>
      </div>

      {/* Bottom section with stats */}
      <div className="relative z-10 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">&lt; 100ms</div>
              <div className="text-gray-300">Response Time</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

