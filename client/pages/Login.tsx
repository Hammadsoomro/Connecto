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
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, MessageSquare, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export default function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
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
      </nav>

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[80vh] p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border border-white/20 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-300">
              Sign in to access your SMS dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  placeholder="demo@example.com"
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
                  placeholder="password123"
                  className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                />
              </div>

              {error && (
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

            <div className="mt-6 p-4 bg-purple-500/20 rounded-lg border border-purple-400/30">
              <p className="text-sm text-purple-200 text-center">
                <strong>Demo Account:</strong>
                <br />
                Email: demo@example.com
                <br />
                Password: password123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
