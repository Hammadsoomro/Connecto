import { useState } from "react";
import { Link } from "react-router-dom";
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
  Users,
  Moon,
  Sun,
  LogOut,
  User,
  ArrowLeft,
  Plus,
  Settings,
  Phone,
  Mail,
  Activity,
} from "lucide-react";
import SubAccountsDialog from "@/components/SubAccountsDialog";
import { Dialog } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { PhoneNumber, SubAccount } from "@shared/types";
import { Badge } from "@/components/ui/badge";

export default function SubAccounts() {
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSubAccountsOpen, setIsSubAccountsOpen] = useState(false);

  // Fetch phone numbers for sub account dialog
  const { data: phoneNumbers = [] } = useQuery({
    queryKey: ["phoneNumbers"],
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
                  className="text-white hover:bg-white/10"
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
                className="flex items-center space-x-2 border-white/20 text-white hover:bg-white/10"
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
            Sub Accounts
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in-delay">
            Manage team members and organize your SMS operations
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Create Sub Account Card */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">
                Team Management
              </CardTitle>
              <CardDescription className="text-gray-300">
                Create and manage sub-accounts for your team members
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>

              <div className="space-y-4">
                <p className="text-gray-300">
                  Organize your SMS campaigns by creating sub-accounts for
                  different team members or projects.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="font-medium text-white mb-2">
                      Team Collaboration
                    </h4>
                    <p className="text-gray-400">
                      Assign phone numbers to team members
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="font-medium text-white mb-2">
                      Organized Workflow
                    </h4>
                    <p className="text-gray-400">
                      Separate campaigns and projects
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsSubAccountsOpen(true)}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Sub Account
              </Button>
            </CardContent>
          </Card>

          {/* Sub Accounts List */}
          {subAccounts.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Your Sub Accounts ({subAccounts.length}/3)
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Manage and monitor your team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subAccounts.map((subAccount) => (
                    <Card key={subAccount.id} className="bg-white/5 border border-white/10 text-white">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <Badge variant={subAccount.status === "active" ? "default" : "secondary"}>
                            {subAccount.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <h3 className="font-semibold text-white">{subAccount.name}</h3>
                          <div className="flex items-center text-sm text-gray-400">
                            <Mail className="h-3 w-3 mr-1" />
                            {subAccount.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Phone className="h-3 w-3 mr-1" />
                            {subAccount.assignedNumber || "No number assigned"}
                          </div>
                        </div>

                        <Link to={`/sub-accounts/${subAccount.id}`}>
                          <Button 
                            size="sm" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Sub Accounts Dialog */}
      <Dialog open={isSubAccountsOpen} onOpenChange={setIsSubAccountsOpen}>
        <SubAccountsDialog
          phoneNumbers={phoneNumbers}
          onClose={() => setIsSubAccountsOpen(false)}
        />
      </Dialog>
    </div>
  );
}
