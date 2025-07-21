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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Search, Phone, ShoppingCart, Globe } from "lucide-react";

interface BuyNumberDialogProps {
  onClose: () => void;
}

interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
  country: string;
  price: number;
}

const COUNTRIES = [
  { code: "US", name: "United States", priceRange: "$2.50 - $3.50", smsPrice: "$0.01" },
  { code: "CA", name: "Canada", priceRange: "$3.00 - $4.50", smsPrice: "$0.01" },
];

export default function BuyNumberDialog({ onClose }: BuyNumberDialogProps) {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [purchasingNumber, setPurchasingNumber] = useState("");
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Generate mock available numbers based on country
  const generateAvailableNumbers = (country: string, areaCode?: string): AvailableNumber[] => {
    if (!country) return [];
    
    const numbers: AvailableNumber[] = [];
    const baseAreaCode = areaCode || (country === "US" ? "415" : "416");
    
    for (let i = 0; i < 10; i++) {
      const randomNumber = Math.floor(1000000 + Math.random() * 9000000);
      const phoneNumber = country === "US" 
        ? `+1${baseAreaCode}${randomNumber.toString().substring(0, 7)}`
        : `+1${baseAreaCode}${randomNumber.toString().substring(0, 7)}`;
      
      const basePrice = country === "US" ? 2.5 : 3.0;
      const price = basePrice + Math.random() * (country === "US" ? 1.0 : 1.5);
      
      numbers.push({
        phoneNumber,
        friendlyName: `${country === "US" ? "US" : "CA"} Number - ${phoneNumber}`,
        country,
        price: Math.round(price * 100) / 100,
      });
    }
    
    return numbers;
  };

  // Fetch available numbers
  const { data: availableNumbers = [], refetch: refetchNumbers } = useQuery({
    queryKey: ["available-numbers", selectedCountry, areaCode],
    queryFn: async () => {
      // For demo purposes, we'll generate mock numbers
      // In production, this would call your Twilio API
      return generateAvailableNumbers(selectedCountry, areaCode);
    },
    enabled: !!token && !!selectedCountry,
  });

  const handleSearch = () => {
    if (selectedCountry) {
      refetchNumbers();
    }
  };

  const handlePurchase = async (phoneNumber: string, friendlyName: string, price: number) => {
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
          country: selectedCountry,
          price,
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
        description: `Successfully purchased ${friendlyName} for $${price}/month`,
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

  const selectedCountryInfo = COUNTRIES.find(c => c.code === selectedCountry);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Buy Phone Number
        </DialogTitle>
        <DialogDescription>
          Purchase a new phone number to send and receive SMS messages. SMS pricing: $0.01 per message.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Country Selection */}
        <div className="space-y-2">
          <Label>Select Country</Label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center justify-between w-full">
                    <span>{country.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {country.priceRange}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCountryInfo && (
            <div className="text-sm text-muted-foreground">
              Price range: {selectedCountryInfo.priceRange} per month • SMS: {selectedCountryInfo.smsPrice} per message
            </div>
          )}
        </div>

        {/* Area Code Search */}
        {selectedCountry && (
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="area-code">
                Area Code (Optional) {selectedCountry === "US" ? "- e.g., 415, 212, 718" : "- e.g., 416, 647, 905"}
              </Label>
              <Input
                id="area-code"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
                placeholder={selectedCountry === "US" ? "e.g., 415" : "e.g., 416"}
                maxLength={3}
              />
            </div>
            <Button onClick={handleSearch} className="mt-6">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        )}

        {/* Available Numbers */}
        {selectedCountry && (
          <div className="space-y-2">
            <Label>Available Numbers</Label>
            <ScrollArea className="h-64 border rounded-md p-2">
              {availableNumbers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-2" />
                  <p>No numbers available</p>
                  <p className="text-sm">
                    Try searching with a different area code or refresh
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
                        <div className="font-medium">{number.phoneNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {COUNTRIES.find(c => c.code === number.country)?.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">${number.price}/month</Badge>
                        <Button
                          size="sm"
                          onClick={() =>
                            handlePurchase(
                              number.phoneNumber,
                              number.friendlyName,
                              number.price
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
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
