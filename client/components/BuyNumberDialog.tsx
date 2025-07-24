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
import { Phone, ShoppingCart, Globe } from "lucide-react";

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
  {
    code: "US",
    name: "United States",
    priceRange: "$2.50 - $3.50",
    smsPrice: "$0.01",
    cities: [
      { name: "New York, NY", code: "212" },
      { name: "New York, NY", code: "646" },
      { name: "New York, NY", code: "718" },
      { name: "Los Angeles, CA", code: "213" },
      { name: "Los Angeles, CA", code: "323" },
      { name: "Los Angeles, CA", code: "424" },
      { name: "Chicago, IL", code: "312" },
      { name: "Chicago, IL", code: "773" },
      { name: "Houston, TX", code: "713" },
      { name: "Houston, TX", code: "281" },
      { name: "Phoenix, AZ", code: "602" },
      { name: "Phoenix, AZ", code: "623" },
      { name: "Philadelphia, PA", code: "215" },
      { name: "Philadelphia, PA", code: "267" },
      { name: "San Antonio, TX", code: "210" },
      { name: "San Diego, CA", code: "619" },
      { name: "San Diego, CA", code: "858" },
      { name: "Dallas, TX", code: "214" },
      { name: "Dallas, TX", code: "469" },
      { name: "San Jose, CA", code: "408" },
      { name: "Austin, TX", code: "512" },
      { name: "Jacksonville, FL", code: "904" },
      { name: "San Francisco, CA", code: "415" },
      { name: "Columbus, OH", code: "614" },
      { name: "Charlotte, NC", code: "704" },
      { name: "Fort Worth, TX", code: "817" },
      { name: "Indianapolis, IN", code: "317" },
      { name: "Seattle, WA", code: "206" },
      { name: "Denver, CO", code: "303" },
      { name: "Denver, CO", code: "720" },
      { name: "Washington, DC", code: "202" },
      { name: "Boston, MA", code: "617" },
      { name: "Boston, MA", code: "857" },
      { name: "El Paso, TX", code: "915" },
      { name: "Detroit, MI", code: "313" },
      { name: "Nashville, TN", code: "615" },
      { name: "Portland, OR", code: "503" },
      { name: "Memphis, TN", code: "901" },
      { name: "Oklahoma City, OK", code: "405" },
      { name: "Las Vegas, NV", code: "702" },
      { name: "Louisville, KY", code: "502" },
      { name: "Baltimore, MD", code: "410" },
      { name: "Milwaukee, WI", code: "414" },
      { name: "Albuquerque, NM", code: "505" },
      { name: "Tucson, AZ", code: "520" },
      { name: "Fresno, CA", code: "559" },
      { name: "Sacramento, CA", code: "916" },
      { name: "Mesa, AZ", code: "480" },
      { name: "Kansas City, MO", code: "816" },
      { name: "Atlanta, GA", code: "404" },
      { name: "Atlanta, GA", code: "678" },
      { name: "Long Beach, CA", code: "562" },
      { name: "Colorado Springs, CO", code: "719" },
      { name: "Raleigh, NC", code: "919" },
      { name: "Miami, FL", code: "305" },
      { name: "Miami, FL", code: "786" },
      { name: "Virginia Beach, VA", code: "757" },
      { name: "Omaha, NE", code: "402" },
      { name: "Oakland, CA", code: "510" },
      { name: "Minneapolis, MN", code: "612" },
      { name: "Tulsa, OK", code: "918" },
      { name: "Arlington, TX", code: "817" },
      { name: "Tampa, FL", code: "813" },
      { name: "New Orleans, LA", code: "504" },
      { name: "Wichita, KS", code: "316" },
      { name: "Cleveland, OH", code: "216" },
      { name: "Bakersfield, CA", code: "661" },
      { name: "Aurora, CO", code: "303" },
      { name: "Anaheim, CA", code: "714" },
      { name: "Honolulu, HI", code: "808" },
      { name: "Santa Ana, CA", code: "714" },
      { name: "Corpus Christi, TX", code: "361" },
      { name: "Riverside, CA", code: "951" },
      { name: "Lexington, KY", code: "859" },
      { name: "Stockton, CA", code: "209" },
      { name: "St. Louis, MO", code: "314" },
      { name: "St. Paul, MN", code: "651" },
      { name: "Cincinnati, OH", code: "513" },
      { name: "Anchorage, AK", code: "907" },
      { name: "Henderson, NV", code: "702" },
      { name: "Greensboro, NC", code: "336" },
      { name: "Plano, TX", code: "972" },
      { name: "Newark, NJ", code: "973" },
      { name: "Lincoln, NE", code: "402" },
      { name: "Buffalo, NY", code: "716" },
      { name: "Jersey City, NJ", code: "201" },
      { name: "Chula Vista, CA", code: "619" },
      { name: "Fort Wayne, IN", code: "260" },
      { name: "Orlando, FL", code: "407" },
      { name: "St. Petersburg, FL", code: "727" },
      { name: "Chandler, AZ", code: "480" },
      { name: "Laredo, TX", code: "956" },
      { name: "Norfolk, VA", code: "757" },
      { name: "Durham, NC", code: "919" },
      { name: "Madison, WI", code: "608" },
      { name: "Lubbock, TX", code: "806" },
      { name: "Irvine, CA", code: "949" },
      { name: "Winston-Salem, NC", code: "336" },
      { name: "Glendale, AZ", code: "623" },
      { name: "Garland, TX", code: "972" },
      { name: "Hialeah, FL", code: "305" },
      { name: "Reno, NV", code: "775" },
      { name: "Chesapeake, VA", code: "757" },
      { name: "Gilbert, AZ", code: "480" },
      { name: "Baton Rouge, LA", code: "225" },
      { name: "Irving, TX", code: "972" },
      { name: "Scottsdale, AZ", code: "480" },
      { name: "North Las Vegas, NV", code: "702" },
      { name: "Fremont, CA", code: "510" },
      { name: "Boise, ID", code: "208" },
      { name: "Richmond, VA", code: "804" },
      { name: "San Bernardino, CA", code: "909" },
      { name: "Birmingham, AL", code: "205" },
      { name: "Spokane, WA", code: "509" },
      { name: "Rochester, NY", code: "585" },
      { name: "Des Moines, IA", code: "515" },
      { name: "Modesto, CA", code: "209" },
      { name: "Fayetteville, NC", code: "910" },
      { name: "Tacoma, WA", code: "253" },
      { name: "Oxnard, CA", code: "805" },
      { name: "Fontana, CA", code: "909" },
      { name: "Columbus, GA", code: "706" },
      { name: "Montgomery, AL", code: "334" },
      { name: "Moreno Valley, CA", code: "951" },
      { name: "Shreveport, LA", code: "318" },
      { name: "Aurora, IL", code: "630" },
      { name: "Yonkers, NY", code: "914" },
      { name: "Akron, OH", code: "330" },
      { name: "Huntington Beach, CA", code: "714" },
      { name: "Little Rock, AR", code: "501" },
      { name: "Augusta, GA", code: "706" },
      { name: "Amarillo, TX", code: "806" },
      { name: "Glendale, CA", code: "818" },
      { name: "Mobile, AL", code: "251" },
      { name: "Grand Rapids, MI", code: "616" },
      { name: "Salt Lake City, UT", code: "801" },
      { name: "Tallahassee, FL", code: "850" },
      { name: "Huntsville, AL", code: "256" },
      { name: "Grand Prairie, TX", code: "972" },
      { name: "Knoxville, TN", code: "865" },
      { name: "Worcester, MA", code: "508" },
      { name: "Newport News, VA", code: "757" },
      { name: "Brownsville, TX", code: "956" },
      { name: "Overland Park, KS", code: "913" },
      { name: "Santa Clarita, CA", code: "661" },
      { name: "Providence, RI", code: "401" },
      { name: "Garden Grove, CA", code: "714" },
      { name: "Chattanooga, TN", code: "423" },
      { name: "Oceanside, CA", code: "760" },
      { name: "Jackson, MS", code: "601" },
      { name: "Fort Lauderdale, FL", code: "954" },
      { name: "Santa Rosa, CA", code: "707" },
      { name: "Rancho Cucamonga, CA", code: "909" },
      { name: "Port St. Lucie, FL", code: "772" },
      { name: "Tempe, AZ", code: "480" },
      { name: "Ontario, CA", code: "909" },
      { name: "Vancouver, WA", code: "360" },
      { name: "Cape Coral, FL", code: "239" },
      { name: "Sioux Falls, SD", code: "605" },
      { name: "Springfield, MO", code: "417" },
      { name: "Peoria, AZ", code: "623" },
      { name: "Pembroke Pines, FL", code: "954" },
      { name: "Elk Grove, CA", code: "916" },
      { name: "Salem, OR", code: "503" },
      { name: "Lancaster, CA", code: "661" },
      { name: "Corona, CA", code: "951" },
      { name: "Eugene, OR", code: "541" },
      { name: "Palmdale, CA", code: "661" },
      { name: "Salinas, CA", code: "831" },
      { name: "Springfield, IL", code: "217" },
      { name: "Pasadena, CA", code: "626" },
      { name: "Fort Collins, CO", code: "970" },
      { name: "Hayward, CA", code: "510" },
      { name: "Pomona, CA", code: "909" },
      { name: "Cary, NC", code: "919" },
      { name: "Rockford, IL", code: "815" },
      { name: "Alexandria, VA", code: "703" },
      { name: "Escondido, CA", code: "760" },
      { name: "McKinney, TX", code: "972" },
      { name: "Kansas City, KS", code: "913" },
      { name: "Joliet, IL", code: "815" },
      { name: "Sunnyvale, CA", code: "408" },
      { name: "Torrance, CA", code: "310" },
      { name: "Bridgeport, CT", code: "203" },
      { name: "Lakewood, CO", code: "303" },
      { name: "Hollywood, FL", code: "954" },
      { name: "Paterson, NJ", code: "973" },
      { name: "Naperville, IL", code: "630" },
      { name: "Syracuse, NY", code: "315" },
      { name: "Mesquite, TX", code: "972" },
      { name: "Dayton, OH", code: "937" },
      { name: "Savannah, GA", code: "912" },
      { name: "Clarksville, TN", code: "931" },
      { name: "Orange, CA", code: "714" },
      { name: "Pasadena, TX", code: "713" },
      { name: "Fullerton, CA", code: "714" },
      { name: "Killeen, TX", code: "254" },
      { name: "Frisco, TX", code: "972" },
      { name: "Hampton, VA", code: "757" },
      { name: "McAllen, TX", code: "956" },
      { name: "Warren, MI", code: "586" },
      { name: "Bellevue, WA", code: "425" },
      { name: "West Valley City, UT", code: "801" },
      { name: "Columbia, SC", code: "803" },
      { name: "Olathe, KS", code: "913" },
      { name: "Sterling Heights, MI", code: "586" },
      { name: "New Haven, CT", code: "203" },
      { name: "Miramar, FL", code: "954" },
      { name: "Waco, TX", code: "254" },
      { name: "Thousand Oaks, CA", code: "805" },
      { name: "Cedar Rapids, IA", code: "319" },
      { name: "Charleston, SC", code: "843" },
      { name: "Visalia, CA", code: "559" },
      { name: "Topeka, KS", code: "785" },
      { name: "Elizabeth, NJ", code: "908" },
      { name: "Gainesville, FL", code: "352" },
      { name: "Thornton, CO", code: "303" },
      { name: "Roseville, CA", code: "916" },
      { name: "Carrollton, TX", code: "972" },
      { name: "Coral Springs, FL", code: "954" },
      { name: "Stamford, CT", code: "203" },
      { name: "Simi Valley, CA", code: "805" },
      { name: "Concord, CA", code: "925" },
      { name: "Hartford, CT", code: "860" },
      { name: "Kent, WA", code: "253" },
      { name: "Lafayette, LA", code: "337" },
      { name: "Midland, TX", code: "432" },
      { name: "Surprise, AZ", code: "623" },
      { name: "Denton, TX", code: "940" },
      { name: "Victorville, CA", code: "760" },
      { name: "Evansville, IN", code: "812" },
      { name: "Santa Clara, CA", code: "408" },
      { name: "Abilene, TX", code: "325" },
      { name: "Athens, GA", code: "706" },
      { name: "Vallejo, CA", code: "707" },
      { name: "Allentown, PA", code: "610" },
      { name: "Norman, OK", code: "405" },
      { name: "Beaumont, TX", code: "409" },
      { name: "Independence, MO", code: "816" },
      { name: "Murfreesboro, TN", code: "615" },
      { name: "Ann Arbor, MI", code: "734" },
      { name: "Fargo, ND", code: "701" },
      { name: "Wilmington, NC", code: "910" },
      { name: "Golden, CO", code: "303" },
      { name: "Columbia, MO", code: "573" },
      { name: "Round Rock, TX", code: "512" },
      { name: "Ventura, CA", code: "805" },
      { name: "West Jordan, UT", code: "801" },
      { name: "Norwalk, CA", code: "562" },
      { name: "Charleston, WV", code: "304" },
      { name: "Odessa, TX", code: "432" },
      { name: "Manchester, NH", code: "603" },
      { name: "Green Bay, WI", code: "920" },
      { name: "West Palm Beach, FL", code: "561" },
      { name: "Clearwater, FL", code: "727" },
      { name: "Richmond, CA", code: "510" },
      { name: "Murrieta, CA", code: "951" },
      { name: "Pearland, TX", code: "713" },
      { name: "Santa Maria, CA", code: "805" },
      { name: "Las Cruces, NM", code: "575" },
      { name: "Danbury, CT", code: "203" },
      { name: "Tyler, TX", code: "903" },
      { name: "Rialto, CA", code: "909" },
      { name: "Davenport, IA", code: "563" },
      { name: "Lansing, MI", code: "517" },
      { name: "Provo, UT", code: "801" },
      { name: "Lewisville, TX", code: "972" },
      { name: "South Bend, IN", code: "574" },
      { name: "Greeley, CO", code: "970" },
      { name: "Missoula, MT", code: "406" },
      { name: "Billings, MT", code: "406" },
      { name: "Pueblo, CO", code: "719" },
      { name: "High Point, NC", code: "336" },
      { name: "Wayne, NJ", code: "973" },
      { name: "Pompano Beach, FL", code: "954" },
      { name: "Miami Gardens, FL", code: "305" },
      { name: "Temecula, CA", code: "951" },
      { name: "Antioch, CA", code: "925" },
      { name: "Everett, WA", code: "425" },
      { name: "Centennial, CO", code: "303" },
      { name: "Elgin, IL", code: "847" },
      { name: "Richardson, TX", code: "972" },
      { name: "Broken Arrow, OK", code: "918" },
      { name: "College Station, TX", code: "979" },
      { name: "Carlsbad, CA", code: "760" },
      { name: "Pearland, TX", code: "281" },
      { name: "Westminster, CO", code: "303" },
      { name: "North Charleston, SC", code: "843" },
      { name: "West Covina, CA", code: "626" },
      { name: "Arvada, CO", code: "303" },
      { name: "Clovis, CA", code: "559" },
      { name: "Wichita Falls, TX", code: "940" },
      { name: "Wilmington, DE", code: "302" },
      { name: "Lowell, MA", code: "978" },
      { name: "Edison, NJ", code: "732" },
      { name: "Burbank, CA", code: "818" },
      { name: "Woodbridge, NJ", code: "732" },
      { name: "Renton, WA", code: "425" },
      { name: "Fairfield, CA", code: "707" },
      { name: "West Valley City, UT", code: "385" },
      { name: "Palm Bay, FL", code: "321" },
      { name: "Columbia, SC", code: "803" },
      { name: "El Monte, CA", code: "626" },
      { name: "Jurupa Valley, CA", code: "951" },
      { name: "Las Vegas, NV", code: "725" },
      { name: "Inglewood, CA", code: "310" },
      { name: "Downey, CA", code: "562" },
      { name: "Menifee, CA", code: "951" },
      { name: "Brockton, MA", code: "508" },
      { name: "Westminster, CA", code: "714" },
      { name: "Elgin, IL", code: "224" },
      { name: "Waterbury, CT", code: "203" },
      { name: "Concord, NC", code: "704" },
      { name: "Costa Mesa, CA", code: "714" },
      { name: "Miami Beach, FL", code: "305" },
      { name: "Orem, UT", code: "801" },
      { name: "Boulder, CO", code: "303" },
      { name: "Temecula, CA", code: "951" },
      { name: "Surprise, AZ", code: "623" },
      { name: "Daly City, CA", code: "650" },
      { name: "Sandy Springs, GA", code: "770" },
      { name: "Hillsboro, OR", code: "503" },
      { name: "Pinellas Park, FL", code: "727" },
      { name: "Brooklyn Park, MN", code: "763" },
      { name: "Lewisville, TX", code: "469" },
      { name: "Lakewood, CA", code: "562" },
      { name: "Merced, CA", code: "209" },
      { name: "Duluth, MN", code: "218" },
      { name: "Macon, GA", code: "478" },
      { name: "Carmel, IN", code: "317" },
      { name: "Longmont, CO", code: "303" },
      { name: "Boca Raton, FL", code: "561" },
      { name: "San Mateo, CA", code: "650" },
      { name: "Kissimmee, FL", code: "407" },
      { name: "Albany, NY", code: "518" },
      { name: "Chico, CA", code: "530" },
      { name: "Quincy, MA", code: "617" },
      { name: "Champaign, IL", code: "217" },
      { name: "Tuscaloosa, AL", code: "205" },
      { name: "Vacaville, CA", code: "707" },
      { name: "Citrus Heights, CA", code: "916" },
      { name: "Livermore, CA", code: "925" },
      { name: "Redding, CA", code: "530" },
      { name: "Lake Forest, CA", code: "949" },
      { name: "Napa, CA", code: "707" },
      { name: "Buena Park, CA", code: "714" },
      { name: "Redwood City, CA", code: "650" },
      { name: "Spokane Valley, WA", code: "509" },
      { name: "Plymouth, MN", code: "763" },
      { name: "San Leandro, CA", code: "510" },
      { name: "League City, TX", code: "281" },
      { name: "Whittier, CA", code: "562" },
      { name: "Bartlett, TN", code: "901" },
      { name: "Kalamazoo, MI", code: "269" },
      { name: "Encinitas, CA", code: "760" },
      { name: "Alameda, CA", code: "510" },
      { name: "Folsom, CA", code: "916" },
      { name: "Southfield, MI", code: "248" },
      { name: "Rochester, MN", code: "507" },
      { name: "Toms River, NJ", code: "732" },
      { name: "Menifee, CA", code: "951" },
      { name: "Nashua, NH", code: "603" },
      { name: "Roswell, GA", code: "770" },
      { name: "Hawthorne, CA", code: "310" },
      { name: "Waukegan, IL", code: "847" },
      { name: "Apple Valley, CA", code: "760" },
      { name: "Clifton, NJ", code: "973" },
      { name: "Carson, CA", code: "310" },
      { name: "Longview, TX", code: "903" },
      { name: "Asheville, NC", code: "828" },
      { name: "Brookhaven, NY", code: "631" },
      { name: "Bellflower, CA", code: "562" },
      { name: "Euless, TX", code: "817" },
      { name: "Yorba Linda, CA", code: "714" },
      { name: "Albany, GA", code: "229" },
      { name: "Redlands, CA", code: "909" },
      { name: "Elk Grove, CA", code: "916" },
      { name: "Woodbury, MN", code: "651" },
      { name: "Scranton, PA", code: "570" },
      { name: "Decatur, IL", code: "217" },
      { name: "Fishers, IN", code: "317" },
      { name: "Hesperia, CA", code: "760" },
      { name: "Cheyenne, WY", code: "307" },
      { name: "Coon Rapids, MN", code: "763" },
      { name: "Santa Monica, CA", code: "310" },
      { name: "Deltona, FL", code: "386" },
      { name: "Kendall, FL", code: "305" },
      { name: "Utica, NY", code: "315" },
      { name: "Lodi, CA", code: "209" },
      { name: "Kirkland, WA", code: "425" },
      { name: "Yakima, WA", code: "509" },
      { name: "Des Plaines, IL", code: "847" },
      { name: "Mount Pleasant, SC", code: "843" },
      { name: "Tamarac, FL", code: "954" },
      { name: "Utica, NY", code: "315" },
      { name: "Bellingham, WA", code: "360" },
      { name: "Hemet, CA", code: "951" },
      { name: "Burnsville, MN", code: "952" },
      { name: "Concord, CA", code: "925" },
      { name: "Pueblo, CO", code: "719" },
      { name: "Huntington Park, CA", code: "323" },
      { name: "Yuma, AZ", code: "928" },
      { name: "Avondale, AZ", code: "623" },
      { name: "Fayetteville, AR", code: "479" },
      { name: "Broomfield, CO", code: "303" },
      { name: "Walnut Creek, CA", code: "925" },
      { name: "Turlock, CA", code: "209" },
      { name: "Alhambra, CA", code: "626" },
      { name: "Pico Rivera, CA", code: "562" },
      { name: "Burnsville, MN", code: "952" },
      { name: "Danville, CA", code: "925" },
      { name: "York, PA", code: "717" },
      { name: "Tustin, CA", code: "714" },
      { name: "Dublin, CA", code: "925" },
      { name: "Fremont, NE", code: "402" },
      { name: "Bloomington, MN", code: "952" },
      { name: "Bloomington, IL", code: "309" },
      { name: "Flagstaff, AZ", code: "928" },
      { name: "Edmond, OK", code: "405" },
      { name: "Bloomington, IN", code: "812" },
      { name: "Eagan, MN", code: "651" },
      { name: "Roseville, MN", code: "651" },
      { name: "Lakewood, WA", code: "253" },
      { name: "Meriden, CT", code: "203" },
      { name: "Maple Grove, MN", code: "763" },
      { name: "Palm Coast, FL", code: "386" },
      { name: "Paramount, CA", code: "562" },
      { name: "Huntington, WV", code: "304" },
      { name: "Shawnee, KS", code: "913" },
      { name: "Hillsboro, OR", code: "503" },
      { name: "Lynchburg, VA", code: "434" },
      { name: "Medford, OR", code: "541" },
      { name: "Coconut Creek, FL", code: "954" },
      { name: "Gaithersburg, MD", code: "301" },
      { name: "Wheat Ridge, CO", code: "303" },
      { name: "Lompoc, CA", code: "805" },
      { name: "Cedar Falls, IA", code: "319" },
      { name: "Harlingen, TX", code: "956" },
      { name: "Joplin, MO", code: "417" },
      { name: "Eastvale, CA", code: "951" },
      { name: "Kentwood, MI", code: "616" },
      { name: "Homestead, FL", code: "305" },
      { name: "Wylie, TX", code: "972" },
      { name: "Ames, IA", code: "515" },
      { name: "Minnetonka, MN", code: "952" },
      { name: "Glendale, WI", code: "414" },
      { name: "Hoover, AL", code: "205" },
      { name: "Redondo Beach, CA", code: "310" },
      { name: "Shoreline, WA", code: "206" },
      { name: "Lakeville, MN", code: "952" },
      { name: "Warwick, RI", code: "401" },
      { name: "Terre Haute, IN", code: "812" },
      { name: "Santee, CA", code: "619" },
      { name: "Northglenn, CO", code: "303" },
      { name: "Wilson, NC", code: "252" },
      { name: "Kettering, OH", code: "937" },
      { name: "Southaven, MS", code: "662" },
      { name: "St. Cloud, MN", code: "320" },
      { name: "Pensacola, FL", code: "850" },
      { name: "Goodyear, AZ", code: "623" },
      { name: "Andover, MN", code: "763" },
      { name: "Lake Elsinore, CA", code: "951" },
      { name: "Danville, VA", code: "434" },
      { name: "Jackson, TN", code: "731" },
      { name: "Alpharetta, GA", code: "770" },
      { name: "Dayton, OH", code: "937" },
      { name: "Lenexa, KS", code: "913" },
      { name: "Owensboro, KY", code: "270" },
      { name: "Cape Girardeau, MO", code: "573" },
      { name: "Findlay, OH", code: "419" },
      { name: "Titusville, FL", code: "321" },
      { name: "St. Charles, MO", code: "636" },
      { name: "Troy, MI", code: "248" },
      { name: "Summerville, SC", code: "843" },
      { name: "St. Peters, MO", code: "636" },
      { name: "Mansfield, TX", code: "817" },
      { name: "Rapid City, SD", code: "605" },
      { name: "Redmond, WA", code: "425" },
      { name: "Santa Barbara, CA", code: "805" },
      { name: "Bend, OR", code: "541" },
      { name: "Lakeland, FL", code: "863" },
      { name: "Gresham, OR", code: "503" },
      { name: "Davis, CA", code: "530" },
      { name: "Belleville, IL", code: "618" },
      { name: "Lawton, OK", code: "580" },
      { name: "Roanoke, VA", code: "540" },
      { name: "South Gate, CA", code: "323" },
      { name: "Rogers, AR", code: "479" },
      { name: "Milpitas, CA", code: "408" },
      { name: "Wakefield, MA", code: "781" },
      { name: "Beaverton, OR", code: "503" },
      { name: "Decatur, AL", code: "256" },
      { name: "Frederick, MD", code: "301" },
      { name: "Bismarck, ND", code: "701" },
      { name: "Pawtucket, RI", code: "401" },
      { name: "Dearborn, MI", code: "313" },
      { name: "San Rafael, CA", code: "415" },
      { name: "Yorba Linda, CA", code: "714" },
      { name: "De Moines, IA", code: "515" },
      { name: "Macomb, MI", code: "586" },
      { name: "Watsonville, CA", code: "831" },
      { name: "Compton, CA", code: "310" },
      { name: "Galveston, TX", code: "409" },
      { name: "Covington, KY", code: "859" },
      { name: "Asbury Park, NJ", code: "732" },
      { name: "North Miami, FL", code: "305" },
      { name: "Greenville, NC", code: "252" },
      { name: "Clearfield, UT", code: "801" },
      { name: "El Segundo, CA", code: "310" },
      { name: "Springdale, AR", code: "479" },
      { name: "Draper, UT", code: "801" },
      { name: "Blacksburg, VA", code: "540" },
      { name: "Riverview, FL", code: "813" },
      { name: "Champaign, IL", code: "217" },
      { name: "Lake Havasu City, AZ", code: "928" },
      { name: "Rockville, MD", code: "301" },
      { name: "Redwood City, CA", code: "650" },
      { name: "Pharr, TX", code: "956" },
      { name: "Evanston, IL", code: "847" },
      { name: "Madeira, OH", code: "513" },
      { name: "Germantown, TN", code: "901" },
      { name: "Delray Beach, FL", code: "561" },
      { name: "Moorhead, MN", code: "218" },
      { name: "Bethlehem, PA", code: "610" },
      { name: "Bonita Springs, FL", code: "239" },
      { name: "Bowling Green, KY", code: "270" },
      { name: "Carrollton, GA", code: "770" },
      { name: "Middletown, OH", code: "513" },
      { name: "Moline, IL", code: "309" },
      { name: "Camarillo, CA", code: "805" },
      { name: "Mentor, OH", code: "440" },
      { name: "Bowling Green, OH", code: "419" },
      { name: "Joplin, MO", code: "417" },
      { name: "Appleton, WI", code: "920" },
      { name: "Enid, OK", code: "580" },
      { name: "Brookfield, WI", code: "262" },
      { name: "Danbury, CT", code: "203" },
      { name: "Lompoc, CA", code: "805" },
      { name: "El Cajon, CA", code: "619" },
      { name: "Torrance, CA", code: "310" },
      { name: "Issaquah, WA", code: "425" },
      { name: "Cupertino, CA", code: "408" },
      { name: "Springfield, OH", code: "937" },
      { name: "Azusa, CA", code: "626" },
      { name: "Petaluma, CA", code: "707" },
      { name: "Huntsville, TX", code: "936" },
      { name: "Lakewood, OH", code: "216" },
      { name: "Burien, WA", code: "206" },
      { name: "Lancaster, OH", code: "740" },
      { name: "Ashland, OR", code: "541" },
      { name: "Kearny, NJ", code: "201" },
      { name: "Edina, MN", code: "952" },
      { name: "Urbana, IL", code: "217" },
      { name: "Mishawaka, IN", code: "574" },
      { name: "Torrington, CT", code: "860" },
      { name: "Pleasanton, CA", code: "925" },
      { name: "Rosemead, CA", code: "626" },
      { name: "San Bruno, CA", code: "650" },
      { name: "Marlborough, MA", code: "508" },
      { name: "Centennial, CO", code: "720" },
      { name: "Champaign, IL", code: "217" },
      { name: "Novi, MI", code: "248" },
      { name: "Minot, ND", code: "701" },
      { name: "Blacksburg, VA", code: "540" },
      { name: "Charlottesville, VA", code: "434" },
      { name: "Littleton, CO", code: "303" },
      { name: "Oceanside, NY", code: "516" },
      { name: "Palo Alto, CA", code: "650" },
      { name: "Encinitas, CA", code: "760" },
      { name: "Yorba Linda, CA", code: "714" },
      { name: "Great Falls, MT", code: "406" },
      { name: "Waterloo, IA", code: "319" },
      { name: "Owensboro, KY", code: "270" },
      { name: "St. Louis Park, MN", code: "952" },
      { name: "Waltham, MA", code: "781" },
      { name: "Bothell, WA", code: "425" },
      { name: "Farmington Hills, MI", code: "248" },
      { name: "Longmont, CO", code: "303" },
      { name: "Franklin, TN", code: "615" },
      { name: "Bossier City, LA", code: "318" },
      { name: "St. George, UT", code: "435" },
      { name: "Haltom City, TX", code: "817" },
      { name: "Pasco, WA", code: "509" },
      { name: "Glendora, CA", code: "626" },
      { name: "Buckeye, AZ", code: "623" },
      { name: "Casa Grande, AZ", code: "520" },
      { name: "Peoria, IL", code: "309" },
      { name: "Hanford, CA", code: "559" },
      { name: "Danville, CA", code: "925" },
      { name: "Maple Valley, WA", code: "425" },
      { name: "Marysville, WA", code: "360" },
      { name: "Madera, CA", code: "559" },
      { name: "Conroe, TX", code: "936" },
      { name: "Indio, CA", code: "760" },
      { name: "Moore, OK", code: "405" },
      { name: "Tuscaloosa, AL", code: "205" },
      { name: "Coeur d'Alene, ID", code: "208" },
      { name: "Dubuque, IA", code: "563" },
      { name: "Farragut, TN", code: "865" },
      { name: "Huntington Beach, CA", code: "714" },
      { name: "San Clemente, CA", code: "949" },
      { name: "Laguna Niguel, CA", code: "949" },
      { name: "Chino Hills, CA", code: "909" },
      { name: "Ceres, CA", code: "209" },
      { name: "Maricopa, AZ", code: "520" },
      { name: "Artesia, CA", code: "562" },
      { name: "Delafield, WI", code: "262" },
      { name: "Mukilteo, WA", code: "425" },
      { name: "Brea, CA", code: "714" },
      { name: "Dacula, GA", code: "770" },
      { name: "Blacksburg, VA", code: "540" },
      { name: "Placentia, CA", code: "714" },
      { name: "Yorba Linda, CA", code: "714" },
      { name: "Rancho Santa Margarita, CA", code: "949" },
      { name: "Aliso Viejo, CA", code: "949" },
      { name: "Chino, CA", code: "909" },
      { name: "Dewey-Humboldt, AZ", code: "928" },
      { name: "Fountain Valley, CA", code: "714" },
      { name: "Huntington Beach, CA", code: "714" },
      { name: "La Habra, CA", code: "562" },
      { name: "Lake Forest, CA", code: "949" },
      { name: "Los Alamitos, CA", code: "562" },
      { name: "Mission Viejo, CA", code: "949" },
      { name: "Newport Beach, CA", code: "949" },
      { name: "Placentia, CA", code: "714" },
      { name: "Rancho Santa Margarita, CA", code: "949" },
      { name: "San Juan Capistrano, CA", code: "949" },
      { name: "Santa Ana, CA", code: "714" },
      { name: "Seal Beach, CA", code: "562" },
      { name: "Stanton, CA", code: "714" },
      { name: "Tustin, CA", code: "714" },
      { name: "Villa Park, CA", code: "714" },
      { name: "Westminster, CA", code: "714" },
      { name: "Yorba Linda, CA", code: "714" }
    ],
  },
  {
    code: "CA",
    name: "Canada",
    priceRange: "$3.00 - $4.50",
    smsPrice: "$0.01",
    cities: [
      { name: "Toronto, ON", code: "416" },
      { name: "Toronto, ON", code: "647" },
      { name: "Toronto, ON", code: "437" },
      { name: "Montreal, QC", code: "514" },
      { name: "Montreal, QC", code: "438" },
      { name: "Vancouver, BC", code: "604" },
      { name: "Vancouver, BC", code: "778" },
      { name: "Calgary, AB", code: "403" },
      { name: "Calgary, AB", code: "587" },
      { name: "Edmonton, AB", code: "780" },
      { name: "Edmonton, AB", code: "587" },
      { name: "Ottawa, ON", code: "613" },
      { name: "Ottawa, ON", code: "343" },
      { name: "Mississauga, ON", code: "905" },
      { name: "Mississauga, ON", code: "289" },
      { name: "Winnipeg, MB", code: "204" },
      { name: "Quebec City, QC", code: "418" },
      { name: "Quebec City, QC", code: "581" },
      { name: "Hamilton, ON", code: "905" },
      { name: "Hamilton, ON", code: "289" },
      { name: "Brampton, ON", code: "905" },
      { name: "Brampton, ON", code: "289" },
      { name: "Surrey, BC", code: "604" },
      { name: "Surrey, BC", code: "778" },
      { name: "Laval, QC", code: "450" },
      { name: "Laval, QC", code: "579" },
      { name: "Halifax, NS", code: "902" },
      { name: "London, ON", code: "519" },
      { name: "London, ON", code: "226" },
      { name: "Markham, ON", code: "905" },
      { name: "Markham, ON", code: "289" },
      { name: "Vaughan, ON", code: "905" },
      { name: "Vaughan, ON", code: "289" },
      { name: "Gatineau, QC", code: "819" },
      { name: "Gatineau, QC", code: "873" },
      { name: "Saskatoon, SK", code: "306" },
      { name: "Longueuil, QC", code: "450" },
      { name: "Longueuil, QC", code: "579" },
      { name: "Burnaby, BC", code: "604" },
      { name: "Burnaby, BC", code: "778" },
      { name: "Regina, SK", code: "306" },
      { name: "Richmond, BC", code: "604" },
      { name: "Richmond, BC", code: "778" },
      { name: "Richmond Hill, ON", code: "905" },
      { name: "Richmond Hill, ON", code: "289" },
      { name: "Oakville, ON", code: "905" },
      { name: "Oakville, ON", code: "289" },
      { name: "Burlington, ON", code: "905" },
      { name: "Burlington, ON", code: "289" },
      { name: "Sherbrooke, QC", code: "819" },
      { name: "Sherbrooke, QC", code: "873" },
      { name: "Oshawa, ON", code: "905" },
      { name: "Oshawa, ON", code: "289" },
      { name: "Saguenay, QC", code: "418" },
      { name: "Saguenay, QC", code: "581" },
      { name: "Lévis, QC", code: "418" },
      { name: "Lévis, QC", code: "581" },
      { name: "Barrie, ON", code: "705" },
      { name: "Barrie, ON", code: "249" },
      { name: "Abbotsford, BC", code: "604" },
      { name: "Abbotsford, BC", code: "778" },
      { name: "Coquitlam, BC", code: "604" },
      { name: "Coquitlam, BC", code: "778" },
      { name: "St. Catharines, ON", code: "905" },
      { name: "St. Catharines, ON", code: "289" },
      { name: "Trois-Rivières, QC", code: "819" },
      { name: "Trois-Rivières, QC", code: "873" },
      { name: "Guelph, ON", code: "519" },
      { name: "Guelph, ON", code: "226" },
      { name: "Cambridge, ON", code: "519" },
      { name: "Cambridge, ON", code: "226" },
      { name: "Whitby, ON", code: "905" },
      { name: "Whitby, ON", code: "289" },
      { name: "Kelowna, BC", code: "250" },
      { name: "Kingston, ON", code: "613" },
      { name: "Kingston, ON", code: "343" },
      { name: "Ajax, ON", code: "905" },
      { name: "Ajax, ON", code: "289" },
      { name: "Langley, BC", code: "604" },
      { name: "Langley, BC", code: "778" },
      { name: "Saanich, BC", code: "250" },
      { name: "Milton, ON", code: "905" },
      { name: "Milton, ON", code: "289" },
      { name: "Nanaimo, BC", code: "250" },
      { name: "Moncton, NB", code: "506" },
      { name: "Windsor, ON", code: "519" },
      { name: "Windsor, ON", code: "226" },
      { name: "Sudbury, ON", code: "705" },
      { name: "Sudbury, ON", code: "249" },
      { name: "Victoria, BC", code: "250" },
      { name: "St. John's, NL", code: "709" },
      { name: "Waterloo, ON", code: "519" },
      { name: "Waterloo, ON", code: "226" },
      { name: "Delta, BC", code: "604" },
      { name: "Delta, BC", code: "778" },
      { name: "Chatham-Kent, ON", code: "519" },
      { name: "Chatham-Kent, ON", code: "226" },
      { name: "Red Deer, AB", code: "403" },
      { name: "Red Deer, AB", code: "587" },
      { name: "Kamloops, BC", code: "250" },
      { name: "Brantford, ON", code: "519" },
      { name: "Brantford, ON", code: "226" },
      { name: "Cape Breton, NS", code: "902" },
      { name: "Lethbridge, AB", code: "403" },
      { name: "Lethbridge, AB", code: "587" },
      { name: "Saint-Jean-sur-Richelieu, QC", code: "450" },
      { name: "Saint-Jean-sur-Richelieu, QC", code: "579" },
      { name: "Repentigny, QC", code: "450" },
      { name: "Repentigny, QC", code: "579" },
      { name: "Caledon, ON", code: "905" },
      { name: "Caledon, ON", code: "289" },
      { name: "St. Albert, AB", code: "780" },
      { name: "St. Albert, AB", code: "587" },
      { name: "Pickering, ON", code: "905" },
      { name: "Pickering, ON", code: "289" },
      { name: "Drummondville, QC", code: "819" },
      { name: "Drummondville, QC", code: "873" },
      { name: "Thunder Bay, ON", code: "807" },
      { name: "Granby, QC", code: "450" },
      { name: "Granby, QC", code: "579" },
      { name: "Saint-Hyacinthe, QC", code: "450" },
      { name: "Saint-Hyacinthe, QC", code: "579" },
      { name: "Grande Prairie, AB", code: "780" },
      { name: "Grande Prairie, AB", code: "587" },
      { name: "Bowmanville, ON", code: "905" },
      { name: "Bowmanville, ON", code: "289" },
      { name: "Sarnia, ON", code: "519" },
      { name: "Sarnia, ON", code: "226" },
      { name: "Shawinigan, QC", code: "819" },
      { name: "Shawinigan, QC", code: "873" },
      { name: "Medicine Hat, AB", code: "403" },
      { name: "Medicine Hat, AB", code: "587" },
      { name: "Fort McMurray, AB", code: "780" },
      { name: "Fort McMurray, AB", code: "587" },
      { name: "Fredericton, NB", code: "506" },
      { name: "Sherwood Park, AB", code: "780" },
      { name: "Sherwood Park, AB", code: "587" },
      { name: "Chilliwack, BC", code: "604" },
      { name: "Chilliwack, BC", code: "778" },
      { name: "Charlottetown, PE", code: "902" },
      { name: "Cornwall, ON", code: "613" },
      { name: "Cornwall, ON", code: "343" },
      { name: "Yellowknife, NT", code: "867" },
      { name: "North Vancouver, BC", code: "604" },
      { name: "North Vancouver, BC", code: "778" },
      { name: "Brossard, QC", code: "450" },
      { name: "Brossard, QC", code: "579" },
      { name: "Belleville, ON", code: "613" },
      { name: "Belleville, ON", code: "343" },
      { name: "Welland, ON", code: "905" },
      { name: "Welland, ON", code: "289" },
      { name: "North Bay, ON", code: "705" },
      { name: "North Bay, ON", code: "249" },
      { name: "Prince George, BC", code: "250" },
      { name: "Brandon, MB", code: "204" },
      { name: "Joliette, QC", code: "450" },
      { name: "Joliette, QC", code: "579" },
      { name: "Newmarket, ON", code: "905" },
      { name: "Newmarket, ON", code: "289" },
      { name: "Peterborough, ON", code: "705" },
      { name: "Peterborough, ON", code: "249" },
      { name: "Maple Ridge, BC", code: "604" },
      { name: "Maple Ridge, BC", code: "778" },
      { name: "Sault Ste. Marie, ON", code: "705" },
      { name: "Sault Ste. Marie, ON", code: "249" },
      { name: "Kawartha Lakes, ON", code: "705" },
      { name: "Kawartha Lakes, ON", code: "249" },
      { name: "Prince Albert, SK", code: "306" },
      { name: "Moose Jaw, SK", code: "306" },
      { name: "Lloydminster, AB/SK", code: "780" },
      { name: "Lloydminster, AB/SK", code: "587" },
      { name: "Saint John, NB", code: "506" },
      { name: "Dieppe, NB", code: "506" },
      { name: "Whitehorse, YT", code: "867" },
      { name: "Iqaluit, NU", code: "867" }
    ],
  },
];

export default function BuyNumberDialog({ onClose }: BuyNumberDialogProps) {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [purchasingNumber, setPurchasingNumber] = useState("");
  const { token } = useAuth();
  const queryClient = useQueryClient();



  // Fetch available numbers from Twilio API
  const { data: availableNumbers = [], refetch: refetchNumbers, isLoading } = useQuery({
    queryKey: ["available-numbers", selectedCountry, areaCode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (areaCode) params.append('areaCode', areaCode);
      if (selectedCountry) params.append('country', selectedCountry);
      
      const response = await fetch(`/api/phone-numbers/available?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available numbers');
      }
      
      const twilioNumbers = await response.json();
      
      // Transform Twilio response to match our interface
      return twilioNumbers.map((number: any) => ({
        phoneNumber: number.phoneNumber,
        friendlyName: number.friendlyName || number.phoneNumber,
        country: selectedCountry,
        price: selectedCountry === "US" ? 2.50 : 3.00, // Base pricing
      }));
    },
    enabled: !!token && !!selectedCountry,
  });

  const handleSearch = () => {
    if (selectedCountry) {
      refetchNumbers();
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

  const selectedCountryInfo = COUNTRIES.find((c) => c.code === selectedCountry);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Buy Phone Number
        </DialogTitle>
        <DialogDescription>
          Purchase a new phone number to send and receive SMS messages. SMS
          pricing: $0.01 per message.
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
              Price range: {selectedCountryInfo.priceRange} per month • SMS:{" "}
              {selectedCountryInfo.smsPrice} per message
            </div>
          )}
        </div>

        {/* City Selection */}
        {selectedCountry && selectedCountryInfo && (
          <div className="space-y-2">
            <Label>Select City (Optional)</Label>
            <Select value={areaCode} onValueChange={setAreaCode}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a city to get local numbers" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="">All Cities</SelectItem>
                {selectedCountryInfo.cities.map((city, index) => (
                  <SelectItem key={`${city.code}-${index}`} value={city.code}>
                    <div className="flex items-center justify-between w-full">
                      <span>{city.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({city.code})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {areaCode && (
              <div className="text-sm text-muted-foreground">
                Searching for numbers in area code: {areaCode}
              </div>
            )}
            <Button onClick={handleSearch} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Search Available Numbers
            </Button>
          </div>
        )}

        {/* Available Numbers */}
        {selectedCountry && (
          <div className="space-y-2">
            <Label>Available Numbers</Label>
            <ScrollArea className="h-64 border rounded-md p-2">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                  <p>Loading available numbers...</p>
                  <p className="text-sm">Fetching real numbers from Twilio</p>
                </div>
              ) : availableNumbers.length === 0 ? (
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
                          {
                            COUNTRIES.find((c) => c.code === number.country)
                              ?.name
                          }
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
                              number.price,
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





