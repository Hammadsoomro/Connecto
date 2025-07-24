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
  Wallet as WalletIcon,
  Moon,
  Sun,
  LogOut,
  User,
  ArrowLeft,
  Plus,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Wallet as WalletType, WalletTransaction } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function Wallet() {
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch wallet data
  const { data: wallet, refetch: refetchWallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const response = await fetch("/api/wallet", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch wallet");
      return response.json() as Promise<WalletType>;
    },
    enabled: !!token,
  });

  // Fetch wallet transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: async () => {
      const response = await fetch("/api/wallet/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json() as Promise<WalletTransaction[]>;
    },
    enabled: !!token,
  });

  const handleAddFunds = async () => {
    if (!amount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please enter amount and select payment method",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/wallet/add-funds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: numAmount,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add funds");
      }

      await refetchWallet();
      setAmount("");
      setPaymentMethod("");
      setIsAddFundsOpen(false);
      
      toast({
        title: "Success",
        description: `$${numAmount.toFixed(2)} added to your wallet`,
      });
    } catch (error) {
      console.error("Error adding funds:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add funds",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalSpent = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalAdded = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

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
            Wallet
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in-delay">
            Manage your account balance and transactions
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Balance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Balance */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Current Balance</h3>
                <p className="text-3xl font-bold text-green-400">
                  ${wallet?.balance?.toFixed(2) || "0.00"}
                </p>
              </CardContent>
            </Card>

            {/* Total Added */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Total Added</h3>
                <p className="text-3xl font-bold text-blue-400">
                  ${totalAdded.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            {/* Total Spent */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Total Spent</h3>
                <p className="text-3xl font-bold text-red-400">
                  ${totalSpent.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Add Funds Button */}
          <div className="text-center">
            <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Add Funds to Wallet
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddFunds}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? "Processing..." : "Add Funds"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddFundsOpen(false)}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Transaction History */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription className="text-gray-300">
                Recent wallet transactions and charges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <DollarSign className="h-12 w-12 mx-auto mb-2" />
                    <p>No transactions found</p>
                    <p className="text-sm">Add funds to see transaction history</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-white/10 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${transaction.type === "credit" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                            {transaction.type === "credit" ? (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </p>
                            {transaction.reference && (
                              <p className="text-xs text-gray-500">
                                Ref: {transaction.reference}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${transaction.type === "credit" ? "text-green-400" : "text-red-400"}`}>
                            {transaction.type === "credit" ? "+" : "-"}${transaction.amount.toFixed(2)}
                          </p>
                          <Badge variant={transaction.type === "credit" ? "default" : "destructive"}>
                            {transaction.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}