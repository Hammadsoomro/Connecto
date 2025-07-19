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
import { Phone, Crown, Settings } from "lucide-react";

interface SettingsDialogProps {
  phoneNumbers: PhoneNumber[];
  onClose: () => void;
}

export default function SettingsDialog({
  phoneNumbers,
  onClose,
}: SettingsDialogProps) {
  const [primaryNumberId, setPrimaryNumberId] = useState(
    phoneNumbers.find((num) => num.isPrimary)?.id || "",
  );

  const handleSetPrimary = async (numberId: string) => {
    // In a real implementation, this would call the API
    setPrimaryNumberId(numberId);
    // toast success message
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Settings
        </DialogTitle>
        <DialogDescription>
          Manage your phone numbers and account settings.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Phone Numbers Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Phone Numbers</Label>
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
                    className="flex items-center justify-between p-3 border rounded-lg"
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
                        >
                          Set Primary
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Notifications Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Notifications</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Desktop Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Receive notifications for new messages
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  Notification.requestPermission();
                }}
              >
                {Notification.permission === "granted" ? "Enabled" : "Enable"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </DialogContent>
  );
}
