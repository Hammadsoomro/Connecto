import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Home,
  ArrowLeft,
} from "lucide-react";
import ProfileSettingsDialog from "./ProfileSettingsDialog";
import AccountSettingsDialog from "./AccountSettingsDialog";
import SubAccountsDialog from "./SubAccountsDialog";
import NotificationCenter from "./NotificationCenter";

interface ChatNavbarProps {
  phoneNumbers: PhoneNumber[];
  unreadCount: number;
  selectedPhoneNumber?: PhoneNumber | null;
  onPhoneNumberSelect?: (phoneNumber: PhoneNumber) => void;
  onNotificationMessageClick?: (contactId: string) => void;
}

export default function ChatNavbar({
  phoneNumbers,
  unreadCount,
  selectedPhoneNumber,
  onPhoneNumberSelect,
  onNotificationMessageClick,
}: ChatNavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isSubAccountsOpen, setIsSubAccountsOpen] = useState(false);

  const primaryNumber = phoneNumbers.find((num) => num.isPrimary);
  const currentNumber = selectedPhoneNumber || primaryNumber;

  return (
    <nav className={`border-b backdrop-blur px-4 py-3 flex items-center justify-between sticky top-0 z-50 ${
      theme === "dark" 
        ? "bg-black/95 border-white/10" 
        : "bg-black/20 border-white/10"
    }`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <MessageSquare className="h-7 w-7 text-purple-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Connectlify
            </span>
          </Link>

          {/* Back to Home Button */}
          <Link to="/">
            <Button
              variant="ghost" className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
              <Home className="h-4 w-4 sm:hidden" />
            </Button>
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
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex items-center gap-2"
          onClick={() => navigate("/buy-numbers/select")}
        >
          <ShoppingCart className="h-4 w-4" />
          Buy Number
        </Button>

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
          onClick={() => setIsAccountSettingsOpen(true)}
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
                <div 
                  className="text-sm font-medium hover:text-purple-400 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileSettingsOpen(true);
                  }}
                >
                  {user?.name}
                </div>
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
              onClick={() => setIsProfileSettingsOpen(true)}
              className="cursor-pointer"
            >
              <Settings className="h-4 w-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setIsAccountSettingsOpen(true)}
              className="cursor-pointer"
            >
              <Phone className="h-4 w-4 mr-2" />
              Account Settings
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setIsSubAccountsOpen(true)}
              className="cursor-pointer"
            >
              <Users className="h-4 w-4 mr-2" />
              Sub Accounts
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/buy-numbers/select")}
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

      {/* Profile Settings Dialog */}
      <Dialog
        open={isProfileSettingsOpen}
        onOpenChange={setIsProfileSettingsOpen}
      >
        <ProfileSettingsDialog
          onClose={() => setIsProfileSettingsOpen(false)}
        />
      </Dialog>

      {/* Account Settings Dialog */}
      <Dialog
        open={isAccountSettingsOpen}
        onOpenChange={setIsAccountSettingsOpen}
      >
        <AccountSettingsDialog
          phoneNumbers={phoneNumbers}
          onClose={() => setIsAccountSettingsOpen(false)}
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



