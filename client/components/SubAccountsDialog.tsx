import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PhoneNumber, SubAccount } from "@shared/types";
import { Users, Plus, Trash2, User, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface SubAccountsDialogProps {
  phoneNumbers: PhoneNumber[];
  onClose: () => void;
}

export default function SubAccountsDialog({
  phoneNumbers,
  onClose,
}: SubAccountsDialogProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
    const [newAccountName, setNewAccountName] = useState("");
  const [newAccountEmail, setNewAccountEmail] = useState("");
  const [newAccountPassword, setNewAccountPassword] = useState("");
  const [selectedNumber, setSelectedNumber] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Fetch sub-accounts
  const { data: subAccounts = [], isLoading } = useQuery({
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

  const availableNumbers = phoneNumbers.filter(
    (num) => !subAccounts.some((acc) => acc.assignedNumber === num.phoneNumber),
  );

  const handleAddSubAccount = async () => {
    if (!newAccountName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/sub-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newAccountName.trim(),
          assignedNumber: selectedNumber || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create sub-account");
      }

      await queryClient.invalidateQueries({ queryKey: ["sub-accounts"] });
      setNewAccountName("");
      setSelectedNumber("");
      setIsAdding(false);
      toast({
        title: "Success",
        description: "Sub-account created successfully",
      });
    } catch (error) {
      console.error("Error creating sub-account:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create sub-account",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSubAccount = async (id: string) => {
    setIsDeletingId(id);
    try {
      const response = await fetch(`/api/sub-accounts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete sub-account");
      }

      await queryClient.invalidateQueries({ queryKey: ["sub-accounts"] });
      toast({
        title: "Success",
        description: "Sub-account deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting sub-account:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete sub-account",
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleAssignNumber = async (accountId: string, phoneNumber: string) => {
    try {
      const response = await fetch(`/api/sub-accounts/${accountId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignedNumber: phoneNumber || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update sub-account");
      }

      await queryClient.invalidateQueries({ queryKey: ["sub-accounts"] });
      toast({
        title: "Success",
        description: "Number assignment updated successfully",
      });
    } catch (error) {
      console.error("Error updating sub-account:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update sub-account",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Sub Accounts
        </DialogTitle>
        <DialogDescription>
          Manage sub-accounts and assign phone numbers to teams or
          representatives.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Add Sub Account */}
        {isAdding ? (
          <div className="p-4 border rounded-lg space-y-3">
            <Label>Add New Sub Account</Label>
            <Input
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              placeholder="Sub account name"
            />
            <Select value={selectedNumber} onValueChange={setSelectedNumber}>
              <SelectTrigger>
                <SelectValue placeholder="Assign phone number (optional)" />
              </SelectTrigger>
              <SelectContent>
                {availableNumbers.map((number) => (
                  <SelectItem key={number.id} value={number.phoneNumber}>
                    {number.friendlyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleAddSubAccount} disabled={isCreating}>
                {isCreating && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAdding(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full"
            variant="outline"
            disabled={subAccounts.length >= 3}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sub Account {subAccounts.length >= 3 && "(Limit: 3)"}
          </Button>
        )}

        {/* Sub Accounts List */}
        <div className="space-y-2">
          <Label>Sub Accounts ({subAccounts.length}/3)</Label>
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">
                    Loading sub accounts...
                  </p>
                </div>
              ) : subAccounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2" />
                  <p>No sub accounts</p>
                  <p className="text-sm">Create sub accounts to delegate SMS</p>
                </div>
              ) : (
                subAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{account.name}</div>
                        {account.assignedNumber ? (
                          <Badge variant="outline" className="text-xs">
                            {account.assignedNumber}
                          </Badge>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No number assigned
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={account.assignedNumber || ""}
                        onValueChange={(value) =>
                          handleAssignNumber(account.id, value)
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Assign" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassign</SelectItem>
                          {phoneNumbers.map((number) => (
                            <SelectItem
                              key={number.id}
                              value={number.phoneNumber}
                              disabled={subAccounts.some(
                                (acc) =>
                                  acc.id !== account.id &&
                                  acc.assignedNumber === number.phoneNumber,
                              )}
                            >
                              {number.friendlyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSubAccount(account.id)}
                        disabled={isDeletingId === account.id}
                      >
                        {isDeletingId === account.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </DialogContent>
  );
}
