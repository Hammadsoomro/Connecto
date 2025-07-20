import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PhoneNumber } from "@shared/types";
import { 
  Phone, 
  Crown, 
  Settings, 
  CreditCard, 
  Globe, 
  Trash2,
  Plus,
  DollarSign
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AccountSettingsDialogProps {
  phoneNumbers: PhoneNumber[];
  onClose: () => void;
}

export default function AccountSettingsDialog({
  phoneNumbers,
  onClose,
}: AccountSettingsDialogProps) {
  const [primaryNumberId, setPrimaryNumberId] = useState(
    phoneNumbers.find((num) => num.isPrimary)?.id || "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSetPrimary = async (numberId: string) => {
    setIsLoading(true);
    try {
      // API call to set primary number would go here
      setPrimaryNumberId(numberId);
      setMessage("Primary number updated successfully!");
    } catch (error) {
      setMessage("Failed to update primary number.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNumber = async (numberId: string) => {
    if (!confirm("Are you sure you want to delete this phone number? This action cannot be undone.")) {
      return;
    }
    
    setIsLoading(true);
    try {
      // API call to delete number would go here
      setMessage("Phone number deleted successfully!");
    } catch (error) {
      setMessage("Failed to delete phone number.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Account Settings
        </DialogTitle>
        <DialogDescription>
          Manage your phone numbers, billing, and account configuration.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Phone Numbers Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Phone Numbers</Label>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buy New Number
            </Button>
          </div>
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {phoneNumbers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-2" />
                  <p>No phone numbers</p>
                  <p className="text-sm">Purchase a number to get started</p>
                </div>
              ) : (
                phoneNumbers.map((number) => (
                  <div
                    key={number.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{number.friendlyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {number.phoneNumber}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {number.isPrimary ? (
                        <Badge
                          variant="default"
                          className="flex items-center gap-1"
                        >
                          <Crown className="h-3 w-3" />
                          Primary
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetPrimary(number.id)}
                          disabled={isLoading}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteNumber(number.id)}
                        disabled={isLoading || number.isPrimary}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Billing Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Billing & Usage</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">Current Plan</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Pay-as-you-go</p>
              <Button size="sm" variant="outline">
                View Plans
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">Account Balance</span>
              </div>
              <p className="text-lg font-semibold mb-2">$24.50</p>
              <Button size="sm" variant="outline">
                Add Funds
              </Button>
            </div>
          </div>
        </div>

                {/* SMS Configuration */}
        <div className="space-y-3">
          <Label className="text-base font-medium">SMS Configuration</Label>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-3">
                <Settings className="h-4 w-4" />
                <div>
                  <div className="font-medium">Twilio Integration</div>
                  <div className="text-sm text-muted-foreground">
                    SMS service is configured and ready
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                ✅ Account SID: Configured<br />
                ✅ Auth Token: Configured<br />
                ✅ Messaging Service: Ready
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Account Actions</Label>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              Export Account Data
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </DialogContent>
  );
}
