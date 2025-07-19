import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Search, Phone, ShoppingCart } from "lucide-react";

interface BuyNumberDialogProps {
  onClose: () => void;
}

interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
}

export default function BuyNumberDialog({ onClose }: BuyNumberDialogProps) {
  const [areaCode, setAreaCode] = useState("");
  const [purchasingNumber, setPurchasingNumber] = useState("");
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Fetch available numbers
  const { data: availableNumbers = [], refetch: refetchNumbers } = useQuery({
    queryKey: ["available-numbers", areaCode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (areaCode) params.append("areaCode", areaCode);

      const response = await fetch(`/api/phone-numbers/available?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch available numbers");
      return response.json() as Promise<AvailableNumber[]>;
    },
    enabled: !!token,
  });

  const handleSearch = () => {
    refetchNumbers();
  };

  const handlePurchase = async (phoneNumber: string, friendlyName: string) => {
    setPurchasingNumber(phoneNumber);
    try {
      const response = await fetch("/api/phone-numbers/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber,
          friendlyName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to purchase number");
      }

      // Refresh phone numbers list
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });

      toast({
        title: "Number purchased",
        description: `Successfully purchased ${friendlyName}`,
      });

      onClose();
    } catch (error) {
      console.error("Error purchasing number:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to purchase number",
        variant: "destructive",
      });
    } finally {
      setPurchasingNumber("");
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Buy Phone Number</DialogTitle>
        <DialogDescription>
          Purchase a new phone number to send and receive SMS messages.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="area-code">Area Code (Optional)</Label>
            <Input
              id="area-code"
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value)}
              placeholder="e.g., 415"
              maxLength={3}
            />
          </div>
          <Button onClick={handleSearch} className="mt-6">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Available Numbers */}
        <div className="space-y-2">
          <Label>Available Numbers</Label>
          <ScrollArea className="h-64 border rounded-md p-2">
            {availableNumbers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Phone className="h-12 w-12 mx-auto mb-2" />
                <p>No numbers available</p>
                <p className="text-sm">
                  Try searching with a different area code
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableNumbers.map((number) => (
                  <div
                    key={number.phoneNumber}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{number.friendlyName}</div>
                      <div className="text-sm text-muted-foreground">
                        {number.phoneNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">$1.00/month</Badge>
                      <Button
                        size="sm"
                        onClick={() =>
                          handlePurchase(
                            number.phoneNumber,
                            number.friendlyName,
                          )
                        }
                        disabled={purchasingNumber === number.phoneNumber}
                      >
                        {purchasingNumber === number.phoneNumber ? (
                          "Purchasing..."
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Buy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
