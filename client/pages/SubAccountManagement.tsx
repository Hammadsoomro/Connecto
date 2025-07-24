import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  Moon,
  Sun,
  LogOut,
  User,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MessageCircle,
  Activity,
  Edit,
  Trash2,
  Settings,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SubAccount, SubAccountStats, Message, WalletTransaction, PhoneNumber } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface SubAccountDetail {
  subAccount: SubAccount;
  stats: SubAccountStats;
  messages: Message[];
  transactions: WalletTransaction[];
}

export default function SubAccountManagement() {
  const { subAccountId } = useParams<{ subAccountId: string }>();
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    assignedNumber: "",
  });

  // Fetch sub-account details
  const { data: subAccountDetail, isLoading, refetch } = useQuery({
    queryKey: ["sub-account-detail", subAccountId],
    queryFn: async () => {
      const response = await fetch(`/api/sub-account-management/${subAccountId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch sub-account details");
      return response.json() as Promise<SubAccountDetail>;
    },
    enabled: !!token && !!subAccountId,
  });

  // Fetch phone numbers for assignment
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

  const handleEdit = () => {
    if (subAccountDetail) {
      setEditForm({
        name: subAccountDetail.subAccount.name,
        email: subAccountDetail.subAccount.email,
        assignedNumber: subAccountDetail.subAccount.assignedNumber || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/sub-accounts/${subAccountId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          assignedNumber: editForm.assignedNumber || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update sub-account");
      }

      await refetch();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Sub-account updated successfully",
      });
    } catch (error) {
      console.error("Error updating sub-account:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update sub-account",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this sub-account?")) return;

    try {
      const response = await fetch(`/api/sub-accounts/${subAccountId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete sub-account");
      }

      toast({
        title: "Success",
        description: "Sub-account deleted successfully",
      });

      // Redirect to sub-accounts page
      window.location.href = "/sub-accounts";
    } catch (error) {
      console.error("Error deleting sub-account:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete sub-account",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading sub-account details...</p>
        </div>
      </div>
    );
  }

  if (!subAccountDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sub-account not found</h1>
          <Link to="/sub-accounts">
            <Button>Back to Sub Accounts</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { subAccount, stats, messages, transactions } = subAccountDetail;

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
              <Link to="/sub-accounts">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sub Accounts
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {subAccount.name}
            </h1>
            <p className="text-gray-300 text-lg">Sub Account Management</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total SMS</p>
                  <p className="text-2xl font-bold">{stats.totalSmsCount}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Cost</p>
                  <p className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Status</p>
                  <Badge variant={subAccount.status === "active" ? "default" : "secondary"}>
                    {subAccount.status}
                  </Badge>
                </div>
                <Activity className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Assigned Number</p>
                  <p className="text-lg font-medium">
                    {subAccount.assignedNumber || "None"}
                  </p>
                </div>
                <Phone className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="details" className="text-white">Details</TabsTrigger>
            <TabsTrigger value="messages" className="text-white">Messages</TabsTrigger>
            <TabsTrigger value="transactions" className="text-white">Transactions</TabsTrigger>
            <TabsTrigger value="settings" className="text-white">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
              <CardHeader>
                <CardTitle>Sub Account Information</CardTitle>
                <CardDescription className="text-gray-300">
                  Basic information about this sub account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Name</Label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{subAccount.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Email</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{subAccount.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Assigned Number</Label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{subAccount.assignedNumber || "Not assigned"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Created</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(subAccount.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription className="text-gray-300">
                  SMS messages sent and received by this sub account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2" />
                      <p>No messages found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className="p-4 border border-white/10 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={message.direction === "outbound" ? "default" : "secondary"}>
                              {message.direction}
                            </Badge>
                            <span className="text-sm text-gray-400">
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-gray-400">From:</span> {message.fromNumber}
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-400">To:</span> {message.toNumber}
                            </p>
                            <p className="text-white">{message.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
              <CardHeader>
                <CardTitle>Cost Transactions</CardTitle>
                <CardDescription className="text-gray-300">
                  Charges related to this sub account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <DollarSign className="h-12 w-12 mx-auto mb-2" />
                      <p>No transactions found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="p-4 border border-white/10 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(transaction.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${transaction.type === "debit" ? "text-red-400" : "text-green-400"}`}>
                                {transaction.type === "debit" ? "-" : "+"}${transaction.amount.toFixed(2)}
                              </p>
                              <Badge variant={transaction.type === "debit" ? "destructive" : "default"}>
                                {transaction.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
              <CardHeader>
                <CardTitle>Sub Account Settings</CardTitle>
                <CardDescription className="text-gray-300">
                  Manage sub account configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Assigned Phone Number</Label>
                      <Select
                        value={editForm.assignedNumber}
                        onValueChange={(value) => setEditForm({ ...editForm, assignedNumber: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select a phone number" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No assignment</SelectItem>
                          {phoneNumbers.map((number) => (
                            <SelectItem key={number.id} value={number.phoneNumber}>
                              {number.friendlyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Use the Edit button to modify sub account settings.
                    </p>
                    <Button
                      onClick={handleEdit}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Settings
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}