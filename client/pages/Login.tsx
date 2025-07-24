import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AlertCircle, MessageSquare, ArrowLeft, Moon, Sun, User, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export default function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subPassword, setSubPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("main");
  const { login, loginSubAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await loginSubAccount({ email: subEmail, password: subPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sub-account login failed");
    } finally {
      setIsLoading(false);
    }
  };

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
        <a
          href="/"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <MessageSquare className="h-8 w-8 text-purple-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>Connectlify</span>
        </a>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={`${theme === "dark" ? "text-white hover:bg-white/10" : "text-slate-800 hover:bg-slate-800/10"}`}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </nav>

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[80vh] p-4">
        <Card className={`w-full max-w-md backdrop-blur-sm border ${
          theme === "dark" 
            ? "bg-white/10 border-white/20 text-white" 
            : "bg-black/20 border-white/20 text-white"
        }`}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-300">
              Sign in to access your SMS dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10">
                <TabsTrigger value="main" className="flex items-center gap-2 data-[state=active]:bg-white/20">
                  <User className="h-4 w-4" />
                  Main Account
                </TabsTrigger>
                <TabsTrigger value="sub" className="flex items-center gap-2 data-[state=active]:bg-white/20">
                  <Users className="h-4 w-4" />
                  Sub Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="main" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                    />
                  </div>

                  {error && activeTab === "main" && (
                    <Alert
                      variant="destructive"
                      className="bg-red-500/20 border-red-500/50 text-red-200"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Button
                    variant="link"
                    onClick={onSwitchToRegister}
                    className="text-purple-300 hover:text-purple-200"
                  >
                    Don't have an account? Sign up
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="sub" className="space-y-4">
                <form onSubmit={handleSubAccountSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sub-email" className="text-white">
                      Sub-Account Email
                    </Label>
                    <Input
                      id="sub-email"
                      type="email"
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      required
                      placeholder="Enter your sub-account email"
                      className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-password" className="text-white">
                      Sub-Account Password
                    </Label>
                    <Input
                      id="sub-password"
                      type="password"
                      value={subPassword}
                      onChange={(e) => setSubPassword(e.target.value)}
                      required
                      placeholder="Enter your sub-account password"
                      className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                    />
                  </div>

                  {error && activeTab === "sub" && (
                    <Alert
                      variant="destructive"
                      className="bg-red-500/20 border-red-500/50 text-red-200"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Sub-Account"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Button
                    variant="link"
                    onClick={onSwitchToRegister}
                    className="text-blue-300 hover:text-blue-200"
                  >
                    Don't have an account? Sign up
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
