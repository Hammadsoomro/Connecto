import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  CreditCard,
  Moon,
  Sun,
  LogOut,
  User,
  ArrowLeft,
  Plus,
  Minus,
  DollarSign,
  TrendingUp,
  TrendingDown
} from "lucide-react";

export default function Wallet() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Mock transaction data
  const transactions = [
    {
      id: "1",
      type: "credit",
      amount: 50.00,
      description: "Account top-up",
      date: "2024-01-15",
      balance: 75.00
    },
    {
      id: "2", 
      type: "debit",
      amount: 1.50,
      description: "SMS to +1 (555) 123-4567",
      date: "2024-01-14",
      balance: 25.00
    },
    {
      id: "3",
      type: "debit",
      amount: 2.99,
      description: "Phone number purchase - +1 (555) 987-6543",
      date: "2024-01-13",
      balance: 26.50
    },
    {
      id: "4",
      type: "credit",
      amount: 25.00,
      description: "Welcome bonus",
      date: "2024-01-12",
      balance: 29.49
    },
    {
      id: "5",
      type: "debit",
      amount: 0.15,
      description: "SMS to +1 (555) 456-7890",
      date: "2024-01-12",
      balance: 4.49
    },
    {
      id: "6",
      type: "debit",
      amount: 3.50,
      description: "Phone number purchase - +1 (555) 111-2222",
      date: "2024-01-11",
      balance: 4.64
    },
    {
      id: "7",
      type: "credit",
      amount: 100.00,
      description: "Initial deposit",
      date: "2024-01-10",
      balance: 8.14
    }
  ];

  const currentBalance = 25.00;
  const totalSpent = transactions
    .filter(t => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalAdded = transactions
    .filter(t => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
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
                className={`flex items-center space-x-2 ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-white/20 text-white hover:bg-white/10'}`}
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
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-white'} mb-4 animate-fade-in`}>
            Wallet
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'} text-lg animate-fade-in-delay`}>
            Manage your account balance and view transaction history
          </p>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-white'} backdrop-blur-sm`}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Current Balance</h3>
              <p className="text-3xl font-bold text-green-400">${currentBalance.toFixed(2)}</p>
            </CardContent>
          </Card>

          {/* Total Added */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-white'} backdrop-blur-sm`}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Total Added</h3>
              <p className="text-3xl font-bold text-blue-400">${totalAdded.toFixed(2)}</p>
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-white'} backdrop-blur-sm`}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Total Spent</h3>
              <p className="text-3xl font-bold text-red-400">${totalSpent.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Funds Button */}
        <div className="text-center mb-8">
          <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
            <Plus className="h-5 w-5 mr-2" />
            Add Funds
          </Button>
        </div>

        {/* Transaction History */}
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-white'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className="text-white">Transaction History</CardTitle>
            <CardDescription className="text-gray-300">
              Your recent account activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "credit" 
                        ? "bg-green-500/20" 
                        : "bg-red-500/20"
                    }`}>
                      {transaction.type === "credit" ? (
                        <Plus className="h-5 w-5 text-green-400" />
                      ) : (
                        <Minus className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">{transaction.description}</div>
                      <div className="text-sm text-gray-400">{transaction.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.type === "credit" 
                        ? "text-green-400" 
                        : "text-red-400"
                    }`}>
                      {transaction.type === "credit" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Balance: ${transaction.balance.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
