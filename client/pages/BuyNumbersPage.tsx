import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Phone,
  Moon,
  Sun,
  LogOut,
  User,
  ArrowLeft,
  ShoppingCart,
  Globe,
  Search,
  Loader2,
} from "lucide-react";

interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
  country: string;
  price: number;
}

const COUNTRIES = [
  {
    code: "US",
    name: "United States",
    priceRange: "$2.50 - $3.50",
    smsPrice: "$0.01",
    states: [
      { name: "Alabama", code: "AL", cities: [{ name: "Birmingham", areaCode: "205" }, { name: "Montgomery", areaCode: "334" }, { name: "Mobile", areaCode: "251" }] },
      { name: "Alaska", code: "AK", cities: [{ name: "Anchorage", areaCode: "907" }] },
      { name: "Arizona", code: "AZ", cities: [{ name: "Phoenix", areaCode: "602" }, { name: "Phoenix", areaCode: "623" }, { name: "Tucson", areaCode: "520" }, { name: "Mesa", areaCode: "480" }] },
      { name: "Arkansas", code: "AR", cities: [{ name: "Little Rock", areaCode: "501" }, { name: "Fayetteville", areaCode: "479" }] },
      { name: "California", code: "CA", cities: [
        { name: "Los Angeles", areaCode: "213" }, { name: "Los Angeles", areaCode: "323" }, { name: "Los Angeles", areaCode: "424" },
        { name: "San Francisco", areaCode: "415" }, { name: "San Diego", areaCode: "619" }, { name: "San Diego", areaCode: "858" },
        { name: "San Jose", areaCode: "408" }, { name: "Sacramento", areaCode: "916" }, { name: "Fresno", areaCode: "559" }
      ]},
      { name: "Colorado", code: "CO", cities: [{ name: "Denver", areaCode: "303" }, { name: "Denver", areaCode: "720" }, { name: "Colorado Springs", areaCode: "719" }] },
      { name: "Connecticut", code: "CT", cities: [{ name: "Bridgeport", areaCode: "203" }, { name: "Hartford", areaCode: "860" }] },
      { name: "Delaware", code: "DE", cities: [{ name: "Wilmington", areaCode: "302" }] },
      { name: "Florida", code: "FL", cities: [
        { name: "Miami", areaCode: "305" }, { name: "Miami", areaCode: "786" }, { name: "Tampa", areaCode: "813" },
        { name: "Orlando", areaCode: "407" }, { name: "Jacksonville", areaCode: "904" }, { name: "St. Petersburg", areaCode: "727" }
      ]},
      { name: "Georgia", code: "GA", cities: [{ name: "Atlanta", areaCode: "404" }, { name: "Atlanta", areaCode: "678" }, { name: "Augusta", areaCode: "706" }, { name: "Savannah", areaCode: "912" }] },
      { name: "Hawaii", code: "HI", cities: [{ name: "Honolulu", areaCode: "808" }] },
      { name: "Idaho", code: "ID", cities: [{ name: "Boise", areaCode: "208" }] },
      { name: "Illinois", code: "IL", cities: [{ name: "Chicago", areaCode: "312" }, { name: "Chicago", areaCode: "773" }, { name: "Springfield", areaCode: "217" }] },
      { name: "Indiana", code: "IN", cities: [{ name: "Indianapolis", areaCode: "317" }, { name: "Fort Wayne", areaCode: "260" }] },
      { name: "Iowa", code: "IA", cities: [{ name: "Des Moines", areaCode: "515" }, { name: "Cedar Rapids", areaCode: "319" }] },
      { name: "Kansas", code: "KS", cities: [{ name: "Wichita", areaCode: "316" }, { name: "Kansas City", areaCode: "913" }] },
      { name: "Kentucky", code: "KY", cities: [{ name: "Louisville", areaCode: "502" }, { name: "Lexington", areaCode: "859" }] },
      { name: "Louisiana", code: "LA", cities: [{ name: "New Orleans", areaCode: "504" }, { name: "Baton Rouge", areaCode: "225" }] },
      { name: "Maine", code: "ME", cities: [{ name: "Portland", areaCode: "207" }] },
      { name: "Maryland", code: "MD", cities: [{ name: "Baltimore", areaCode: "410" }, { name: "Gaithersburg", areaCode: "301" }] },
      { name: "Massachusetts", code: "MA", cities: [{ name: "Boston", areaCode: "617" }, { name: "Boston", areaCode: "857" }, { name: "Worcester", areaCode: "508" }] },
      { name: "Michigan", code: "MI", cities: [{ name: "Detroit", areaCode: "313" }, { name: "Grand Rapids", areaCode: "616" }] },
      { name: "Minnesota", code: "MN", cities: [{ name: "Minneapolis", areaCode: "612" }, { name: "St. Paul", areaCode: "651" }] },
      { name: "Mississippi", code: "MS", cities: [{ name: "Jackson", areaCode: "601" }] },
      { name: "Missouri", code: "MO", cities: [{ name: "Kansas City", areaCode: "816" }, { name: "St. Louis", areaCode: "314" }] },
      { name: "Montana", code: "MT", cities: [{ name: "Billings", areaCode: "406" }, { name: "Missoula", areaCode: "406" }] },
      { name: "Nebraska", code: "NE", cities: [{ name: "Omaha", areaCode: "402" }, { name: "Lincoln", areaCode: "402" }] },
      { name: "Nevada", code: "NV", cities: [{ name: "Las Vegas", areaCode: "702" }, { name: "Las Vegas", areaCode: "725" }, { name: "Reno", areaCode: "775" }] },
      { name: "New Hampshire", code: "NH", cities: [{ name: "Manchester", areaCode: "603" }] },
      { name: "New Jersey", code: "NJ", cities: [{ name: "Newark", areaCode: "973" }, { name: "Jersey City", areaCode: "201" }] },
      { name: "New Mexico", code: "NM", cities: [{ name: "Albuquerque", areaCode: "505" }, { name: "Las Cruces", areaCode: "575" }] },
      { name: "New York", code: "NY", cities: [
        { name: "New York City", areaCode: "212" }, { name: "New York City", areaCode: "646" }, { name: "New York City", areaCode: "718" },
        { name: "Buffalo", areaCode: "716" }, { name: "Rochester", areaCode: "585" }, { name: "Syracuse", areaCode: "315" }
      ]},
      { name: "North Carolina", code: "NC", cities: [{ name: "Charlotte", areaCode: "704" }, { name: "Raleigh", areaCode: "919" }, { name: "Greensboro", areaCode: "336" }] },
      { name: "North Dakota", code: "ND", cities: [{ name: "Fargo", areaCode: "701" }, { name: "Bismarck", areaCode: "701" }] },
      { name: "Ohio", code: "OH", cities: [{ name: "Columbus", areaCode: "614" }, { name: "Cleveland", areaCode: "216" }, { name: "Cincinnati", areaCode: "513" }] },
      { name: "Oklahoma", code: "OK", cities: [{ name: "Oklahoma City", areaCode: "405" }, { name: "Tulsa", areaCode: "918" }] },
      { name: "Oregon", code: "OR", cities: [{ name: "Portland", areaCode: "503" }, { name: "Eugene", areaCode: "541" }] },
      { name: "Pennsylvania", code: "PA", cities: [{ name: "Philadelphia", areaCode: "215" }, { name: "Philadelphia", areaCode: "267" }, { name: "Pittsburgh", areaCode: "412" }] },
      { name: "Rhode Island", code: "RI", cities: [{ name: "Providence", areaCode: "401" }] },
      { name: "South Carolina", code: "SC", cities: [{ name: "Columbia", areaCode: "803" }, { name: "Charleston", areaCode: "843" }] },
      { name: "South Dakota", code: "SD", cities: [{ name: "Sioux Falls", areaCode: "605" }] },
      { name: "Tennessee", code: "TN", cities: [{ name: "Nashville", areaCode: "615" }, { name: "Memphis", areaCode: "901" }, { name: "Knoxville", areaCode: "865" }] },
      { name: "Texas", code: "TX", cities: [
        { name: "Houston", areaCode: "713" }, { name: "Houston", areaCode: "281" }, { name: "Dallas", areaCode: "214" }, { name: "Dallas", areaCode: "469" },
        { name: "San Antonio", areaCode: "210" }, { name: "Austin", areaCode: "512" }, { name: "Fort Worth", areaCode: "817" }, { name: "El Paso", areaCode: "915" }
      ]},
      { name: "Utah", code: "UT", cities: [{ name: "Salt Lake City", areaCode: "801" }, { name: "West Valley City", areaCode: "801" }] },
      { name: "Vermont", code: "VT", cities: [{ name: "Burlington", areaCode: "802" }] },
      { name: "Virginia", code: "VA", cities: [{ name: "Virginia Beach", areaCode: "757" }, { name: "Norfolk", areaCode: "757" }, { name: "Richmond", areaCode: "804" }] },
      { name: "Washington", code: "WA", cities: [{ name: "Seattle", areaCode: "206" }, { name: "Spokane", areaCode: "509" }, { name: "Tacoma", areaCode: "253" }] },
      { name: "West Virginia", code: "WV", cities: [{ name: "Charleston", areaCode: "304" }] },
      { name: "Wisconsin", code: "WI", cities: [{ name: "Milwaukee", areaCode: "414" }, { name: "Madison", areaCode: "608" }] },
      { name: "Wyoming", code: "WY", cities: [{ name: "Cheyenne", areaCode: "307" }] }
    ],
  },
  {
    code: "CA",
    name: "Canada",
    priceRange: "$3.00 - $4.50",
    smsPrice: "$0.01",
    states: [
      { name: "Alberta", code: "AB", cities: [{ name: "Calgary", areaCode: "403" }, { name: "Calgary", areaCode: "587" }, { name: "Edmonton", areaCode: "780" }, { name: "Edmonton", areaCode: "587" }] },
      { name: "British Columbia", code: "BC", cities: [{ name: "Vancouver", areaCode: "604" }, { name: "Vancouver", areaCode: "778" }, { name: "Victoria", areaCode: "250" }] },
      { name: "Manitoba", code: "MB", cities: [{ name: "Winnipeg", areaCode: "204" }] },
      { name: "New Brunswick", code: "NB", cities: [{ name: "Moncton", areaCode: "506" }, { name: "Fredericton", areaCode: "506" }] },
      { name: "Newfoundland and Labrador", code: "NL", cities: [{ name: "St. John's", areaCode: "709" }] },
      { name: "Northwest Territories", code: "NT", cities: [{ name: "Yellowknife", areaCode: "867" }] },
      { name: "Nova Scotia", code: "NS", cities: [{ name: "Halifax", areaCode: "902" }] },
      { name: "Nunavut", code: "NU", cities: [{ name: "Iqaluit", areaCode: "867" }] },
      { name: "Ontario", code: "ON", cities: [
        { name: "Toronto", areaCode: "416" }, { name: "Toronto", areaCode: "647" }, { name: "Toronto", areaCode: "437" },
        { name: "Ottawa", areaCode: "613" }, { name: "Ottawa", areaCode: "343" }, { name: "Hamilton", areaCode: "905" }, { name: "Hamilton", areaCode: "289" }
      ]},
      { name: "Prince Edward Island", code: "PE", cities: [{ name: "Charlottetown", areaCode: "902" }] },
      { name: "Quebec", code: "QC", cities: [
        { name: "Montreal", areaCode: "514" }, { name: "Montreal", areaCode: "438" },
        { name: "Quebec City", areaCode: "418" }, { name: "Quebec City", areaCode: "581" }
      ]},
      { name: "Saskatchewan", code: "SK", cities: [{ name: "Saskatoon", areaCode: "306" }, { name: "Regina", areaCode: "306" }] },
      { name: "Yukon", code: "YT", cities: [{ name: "Whitehorse", areaCode: "867" }] }
    ],
  },
];

export default function BuyNumbersPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [purchasingNumber, setPurchasingNumber] = useState("");
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Reset state and city when country changes
  useEffect(() => {
    setSelectedState("");
    setSelectedCity("");
    setAreaCode("");
  }, [selectedCountry]);

  // Reset city when state changes
  useEffect(() => {
    setSelectedCity("");
    setAreaCode("");
  }, [selectedState]);

  // Set area code when city changes
  useEffect(() => {
    if (selectedCity) {
      const country = COUNTRIES.find(c => c.code === selectedCountry);
      const state = country?.states.find(s => s.code === selectedState);
      const city = state?.cities.find(c => c.name === selectedCity);
      if (city) {
        setAreaCode(city.areaCode);
      }
    }
  }, [selectedCity, selectedCountry, selectedState]);

  // Fetch available numbers from Twilio API
  const { data: availableNumbers = [], refetch: refetchNumbers, isLoading, error } = useQuery({
    queryKey: ["available-numbers", selectedCountry, areaCode],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (areaCode) params.append('areaCode', areaCode);
        if (selectedCountry) params.append('country', selectedCountry);
        
        const response = await fetch(`/api/phone-numbers/available?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch available numbers');
        }
        
        const twilioNumbers = await response.json();
        
        // Transform Twilio response to match our interface
        return twilioNumbers.map((number: any) => ({
          phoneNumber: number.phoneNumber,
          friendlyName: number.friendlyName || number.phoneNumber,
          country: selectedCountry,
          price: selectedCountry === "US" ? 2.50 : 3.00, // Base pricing
        }));
      } catch (error) {
        console.error('Error fetching numbers:', error);
        // Return mock data if API fails
        return generateMockNumbers();
      }
    },
    enabled: !!token && !!selectedCountry && !!areaCode,
  });

  // Generate mock numbers for demonstration
  const generateMockNumbers = () => {
    const mockNumbers = [];
    const baseNumber = areaCode ? `+1${areaCode}` : `+1${selectedCountry === 'US' ? '555' : '604'}`;
    
    for (let i = 0; i < 10; i++) {
      const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
      const phoneNumber = `${baseNumber}${randomSuffix}`;
      mockNumbers.push({
        phoneNumber,
        friendlyName: phoneNumber,
        country: selectedCountry,
        price: selectedCountry === "US" ? 2.50 : 3.00,
      });
    }
    return mockNumbers;
  };

  const handleSearch = () => {
    if (selectedCountry && areaCode) {
      refetchNumbers();
    } else {
      toast({
        title: "Selection Required",
        description: "Please select a country and city to search for numbers.",
        variant: "destructive",
      });
    }
  };

  const handlePurchase = async (
    phoneNumber: string,
    friendlyName: string,
    price: number,
  ) => {
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

      // Navigate back to the main buy numbers page or dashboard
      navigate("/buy-numbers");
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

  const selectedCountryInfo = COUNTRIES.find((c) => c.code === selectedCountry);
  const selectedStateInfo = selectedCountryInfo?.states.find((s) => s.code === selectedState);
  const availableCities = selectedStateInfo?.cities || [];

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
              <Link to="/buy-numbers">
                <Button
                  variant="ghost"
                  className={`${theme === "dark" ? "text-white hover:bg-white/10" : "text-white hover:bg-white/10"}`}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Buy Numbers
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
                className={`flex items-center space-x-2 ${theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-white/30 bg-transparent text-white hover:bg-white/10 border-2"}`}
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
            Select Your Phone Number
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in-delay">
            Choose your country, state, and city to find available phone numbers
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Globe className="h-6 w-6" />
                Number Selection
              </CardTitle>
              <CardDescription className="text-gray-300">
                Select your preferred location to browse available phone numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Country Selection */}
              <div className="space-y-2">
                <Label className="text-white">Select Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
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
                  <div className="text-sm text-gray-300">
                    Price range: {selectedCountryInfo.priceRange} per month • SMS:{" "}
                    {selectedCountryInfo.smsPrice} per message
                  </div>
                )}
              </div>

              {/* State/Province Selection */}
              {selectedCountry && selectedCountryInfo && (
                <div className="space-y-2">
                  <Label className="text-white">
                    Select {selectedCountry === "US" ? "State" : "Province"}
                  </Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder={`Choose a ${selectedCountry === "US" ? "state" : "province"}`} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {selectedCountryInfo.states.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* City Selection */}
              {selectedState && availableCities.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white">Select City</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Choose a city" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {availableCities.map((city, index) => (
                        <SelectItem key={`${city.name}-${city.areaCode}-${index}`} value={city.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{city.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({city.areaCode})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {areaCode && (
                    <div className="text-sm text-gray-300">
                      Area code: {areaCode}
                    </div>
                  )}
                </div>
              )}

              {/* Search Button */}
              {selectedCountry && selectedState && selectedCity && (
                <Button 
                  onClick={handleSearch} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 py-3"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Available Numbers
                </Button>
              )}

              {/* Available Numbers */}
              {(isLoading || availableNumbers.length > 0 || error) && (
                <div className="space-y-4">
                  <Label className="text-white text-lg">Available Numbers</Label>
                  <ScrollArea className="h-96 border border-white/20 rounded-md p-4 bg-white/5">
                    {isLoading ? (
                      <div className="text-center py-8 text-gray-300">
                        <Loader2 className="h-12 w-12 mx-auto mb-2 animate-spin" />
                        <p>Loading available numbers...</p>
                        <p className="text-sm">Searching for numbers in {selectedCity}, {selectedStateInfo?.name}</p>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-gray-300">
                        <Phone className="h-12 w-12 mx-auto mb-2" />
                        <p>Unable to fetch real numbers</p>
                        <p className="text-sm">Showing sample numbers for demonstration</p>
                        <div className="mt-4 space-y-2">
                          {generateMockNumbers().map((number) => (
                            <div
                              key={number.phoneNumber}
                              className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5"
                            >
                              <div>
                                <div className="font-medium text-white">{number.phoneNumber}</div>
                                <div className="text-sm text-gray-300">
                                  {selectedCity}, {selectedStateInfo?.name}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-green-400 border-green-400">
                                  ${number.price}/month
                                </Badge>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handlePurchase(
                                      number.phoneNumber,
                                      number.friendlyName,
                                      number.price,
                                    )
                                  }
                                  disabled={purchasingNumber === number.phoneNumber}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                >
                                  {purchasingNumber === number.phoneNumber ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      Purchasing...
                                    </>
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
                      </div>
                    ) : availableNumbers.length === 0 ? (
                      <div className="text-center py-8 text-gray-300">
                        <Phone className="h-12 w-12 mx-auto mb-2" />
                        <p>No numbers available</p>
                        <p className="text-sm">
                          Try searching with a different city or refresh
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableNumbers.map((number) => (
                          <div
                            key={number.phoneNumber}
                            className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5"
                          >
                            <div>
                              <div className="font-medium text-white">{number.phoneNumber}</div>
                              <div className="text-sm text-gray-300">
                                {selectedCity}, {selectedStateInfo?.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-green-400 border-green-400">
                                ${number.price}/month
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handlePurchase(
                                    number.phoneNumber,
                                    number.friendlyName,
                                    number.price,
                                  )
                                }
                                disabled={purchasingNumber === number.phoneNumber}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                              >
                                {purchasingNumber === number.phoneNumber ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Purchasing...
                                  </>
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}