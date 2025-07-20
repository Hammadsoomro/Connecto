import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { PhoneNumber } from "@shared/types";
import {
  Menu,
  Settings,
  Moon,
  Sun,
  Phone,
  LogOut,
  ShoppingCart,
  Bell,
  Users,
  MessageSquare,
  ChevronDown,
  Check,
} from "lucide-react";
import BuyNumberDialog from "./BuyNumberDialog";
import SettingsDialog from "./SettingsDialog";
import SubAccountsDialog from "./SubAccountsDialog";
import NotificationCenter from "./NotificationCenter";

interface ChatNavbarProps {
  phoneNumbers: PhoneNumber[];
  unreadCount: number;
  selectedPhoneNumber?: PhoneNumber | null;
  onToggleContactList: () => void;
  onPhoneNumberSelect?: (phoneNumber: PhoneNumber) => void;
  onNotificationMessageClick?: (contactId: string) => void;
}

export default function ChatNavbar({
  phoneNumbers,
  unreadCount,
  selectedPhoneNumber,
  onToggleContactList,
  onPhoneNumberSelect,
  onNotificationMessageClick,
}: ChatNavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isBuyNumberOpen, setIsBuyNumberOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubAccountsOpen, setIsSubAccountsOpen] = useState(false);

  const primaryNumber = phoneNumbers.find((num) => num.isPrimary);
  const currentNumber = selectedPhoneNumber || primaryNumber;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleContactList}
          className="lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>

                <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative">
              <MessageSquare className="h-7 w-7 text-purple-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Connectlify
            </span>
          </Link>

          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="flex items-center gap-1 animate-pulse"
            >
              <Bell className="h-3 w-3" />
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Phone Number Selector */}
        {phoneNumbers.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="hidden sm:flex items-center gap-2 min-w-[140px]"
              >
                <Phone className="h-4 w-4 text-purple-600" />
                <span className="text-sm">
                  {currentNumber?.phoneNumber || "Select Number"}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {phoneNumbers.map((number) => (
                <DropdownMenuItem
                  key={number.id}
                  onClick={() => onPhoneNumberSelect?.(number)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <div>
                      <div className="text-sm font-medium">
                        {number.phoneNumber}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {number.friendlyName}
                      </div>
                    </div>
                  </div>
                  {currentNumber?.id === number.id && (
                    <Check className="h-4 w-4 text-purple-600" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Buy Number Button */}
        <Dialog open={isBuyNumberOpen} onOpenChange={setIsBuyNumberOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Buy Number
            </Button>
          </DialogTrigger>
          <BuyNumberDialog onClose={() => setIsBuyNumberOpen(false)} />
        </Dialog>

        {/* Notification Center */}
        <NotificationCenter onMessageClick={onNotificationMessageClick} />

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          className="hidden sm:flex"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {user?.email}
                </div>
              </div>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">{user?.name}</div>
              <div className="text-xs">{user?.email}</div>
            </div>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setIsSettingsOpen(true)}
              className="cursor-pointer"
            >
              <Settings className="h-4 w-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setIsSubAccountsOpen(true)}
              className="cursor-pointer"
            >
              <Users className="h-4 w-4 mr-2" />
              Sub Accounts
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setIsBuyNumberOpen(true)}
              className="cursor-pointer sm:hidden"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy Number
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SettingsDialog
          phoneNumbers={phoneNumbers}
          onClose={() => setIsSettingsOpen(false)}
        />
      </Dialog>

      {/* Sub Accounts Dialog */}
      <Dialog open={isSubAccountsOpen} onOpenChange={setIsSubAccountsOpen}>
        <SubAccountsDialog
          phoneNumbers={phoneNumbers}
          onClose={() => setIsSubAccountsOpen(false)}
        />
      </Dialog>
    </nav>
  );
}
