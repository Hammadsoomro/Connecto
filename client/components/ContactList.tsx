import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Contact, ContactWithUnread } from "@shared/types";
import { Plus, Search, User, X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import AddContactDialog from "./AddContactDialog";

interface ContactListProps {
  contacts: ContactWithUnread[];
  selectedContact: Contact | null;
  onContactSelect: (contact: Contact) => void;
  onClose?: () => void;
}

export default function ContactList({
  contacts,
  selectedContact,
  onContactSelect,
  onClose,
}: ContactListProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phoneNumber.includes(searchTerm),
  );

    return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-purple-900/20'} backdrop-blur-sm`}>
            {/* Header */}
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-white/20'}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-white'}`}>Contacts</h2>
          <div className="flex items-center gap-2">
            <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className={`${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-white/30 bg-transparent text-white hover:bg-white/10 border-2'}`}>
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <AddContactDialog onClose={() => setIsAddContactOpen(false)} />
            </Dialog>
            {onClose && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
                <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`} />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400' : 'bg-white/10 border-white/30 text-white placeholder:text-gray-300'}`}
          />
        </div>
      </div>

      {/* Contact List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {searchTerm ? "No contacts found" : "No contacts yet"}
              </p>
              {!searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsAddContactOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredContacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  isSelected={selectedContact?.id === contact.id}
                  onSelect={() => onContactSelect(contact)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ContactItemProps {
  contact: ContactWithUnread;
  isSelected: boolean;
  onSelect: () => void;
}

function ContactItem({ contact, isSelected, onSelect }: ContactItemProps) {
  const formatLastMessage = (message: string) => {
    return message.length > 30 ? message.substring(0, 30) + "..." : message;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-colors border",
        "hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground border-purple-300",
        !isSelected && "border-transparent hover:border-border",
        contact.unreadCount > 0 &&
          !isSelected &&
          "bg-purple-50 dark:bg-purple-950/30",
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold",
              contact.unreadCount > 0
                ? "bg-gradient-to-r from-purple-600 to-pink-600"
                : "bg-gray-500",
            )}
          >
            {contact.name.charAt(0).toUpperCase()}
          </div>
          {contact.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {contact.unreadCount > 9 ? "9+" : contact.unreadCount}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div
              className={cn(
                "font-medium truncate",
                contact.unreadCount > 0 && "font-semibold",
              )}
            >
              {contact.name}
            </div>
            {contact.lastMessageAt && (
              <div className="text-xs text-muted-foreground">
                {formatTime(new Date(contact.lastMessageAt))}
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground truncate">
            {contact.lastMessage ? (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3 flex-shrink-0" />
                <span
                  className={cn(
                    "truncate",
                    contact.unreadCount > 0 && "font-medium text-foreground",
                  )}
                >
                  {formatLastMessage(contact.lastMessage.body)}
                </span>
              </div>
            ) : (
              <span className="italic">No messages yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
