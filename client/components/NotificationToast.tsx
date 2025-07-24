import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Message } from "@shared/types";
import { MessageSquare, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationToastProps {
  message: Message;
  contactName?: string;
  onClose: () => void;
  onView: () => void;
  autoClose?: number;
}

export default function NotificationToast({
  message,
  contactName,
  onClose,
  onView,
  autoClose = 5000,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Auto close
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleView = () => {
    onView();
    handleClose();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-[9999] transition-all duration-300 ease-in-out transform",
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0",
      )}
    >
      <Card className="w-80 shadow-lg border-l-4 border-l-purple-500 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {contactName || "Unknown Contact"}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    SMS
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(new Date(message.createdAt))}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleClose}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{message.fromNumber}</span>
              </div>

              <p className="text-sm line-clamp-2">{message.body}</p>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleView}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  View Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
