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
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { User, Mail, Shield, Moon, Sun, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileSettingsDialogProps {
  onClose: () => void;
}

export default function ProfileSettingsDialog({
  onClose,
}: ProfileSettingsDialogProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // API call to update profile would go here
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // API call to change password would go here
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage("Failed to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </DialogTitle>
        <DialogDescription>
          Manage your personal information and account preferences.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Profile Information */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Profile Information</Label>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </div>

        {/* Theme Settings */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Appearance</Label>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <div>
                <div className="font-medium">Theme</div>
                <div className="text-sm text-muted-foreground">
                  Current: {theme === "dark" ? "Dark" : "Light"} mode
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleTheme}
              className="flex items-center gap-2"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" />
                  Light
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Dark
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Security</Label>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Notifications</Label>
          <div className="space-y-3">
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
                className={
                  Notification.permission === "granted"
                    ? "text-green-600 border-green-600"
                    : ""
                }
              >
                {Notification.permission === "granted" ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Enabled
                  </>
                ) : (
                  "Enable"
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Get notified via email for important updates
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4 mr-1" />
                Configure
              </Button>
            </div>
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
