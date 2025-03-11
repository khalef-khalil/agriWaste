"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { marketplaceApi, UserProfile, Listing } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ComposeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent: () => void;
  initialRecipientId?: number;
  initialListingId?: number;
  initialSubject?: string;
}

export default function ComposeMessageDialog({
  open,
  onOpenChange,
  onSent,
  initialRecipientId,
  initialListingId,
  initialSubject = ""
}: ComposeMessageDialogProps) {
  const router = useRouter();
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState("");
  const [recipientId, setRecipientId] = useState<string>(initialRecipientId?.toString() || "");
  const [listingId, setListingId] = useState<string>(initialListingId?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isFetchingListings, setIsFetchingListings] = useState(false);

  // Fetch users for recipient selection
  const fetchUsers = async () => {
    try {
      setIsFetchingUsers(true);
      
      // Use mock data by default since the endpoint doesn't exist yet
      const mockUsers = [
        { id: 1, username: "farmer1", first_name: "Jean", last_name: "Dupont", user_type: "farmer", email: "", profile_image: "" },
        { id: 2, username: "researcher1", first_name: "Marie", last_name: "Curie", user_type: "researcher", email: "", profile_image: "" },
        { id: 3, username: "startup1", first_name: "Eco", last_name: "Solutions", user_type: "startup", email: "", profile_image: "" }
      ];
      
      // Only try to fetch if not in development mode
      if (process.env.NODE_ENV !== 'development') {
        try {
          const response = await fetch("/api/users/message-recipients");
          if (response.ok) {
            const data = await response.json();
            setUsers(data);
            return;
          }
        } catch (error) {
          console.error("API endpoint not available, using mock data:", error);
        }
      }
      
      // Use mock data as fallback
      setUsers(mockUsers);
      
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Default mock data
      setUsers([
        { id: 1, username: "farmer1", first_name: "Jean", last_name: "Dupont", user_type: "farmer", email: "", profile_image: "" },
        { id: 2, username: "researcher1", first_name: "Marie", last_name: "Curie", user_type: "researcher", email: "", profile_image: "" },
        { id: 3, username: "startup1", first_name: "Eco", last_name: "Solutions", user_type: "startup", email: "", profile_image: "" }
      ]);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  // Fetch listings for related listing selection
  const fetchListings = async () => {
    try {
      setIsFetchingListings(true);
      const listings = await marketplaceApi.getActiveListings();
      setListings(listings);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      setListings([]);
    } finally {
      setIsFetchingListings(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSubject(initialSubject || "");
      setContent("");
      setRecipientId(initialRecipientId?.toString() || "");
      setListingId(initialListingId?.toString() || "");
      
      // Fetch data needed for the form
      fetchUsers();
      fetchListings();
    }
  }, [open, initialRecipientId, initialListingId, initialSubject]);

  const handleSend = async () => {
    if (!recipientId) {
      toast.error("Veuillez sélectionner un destinataire");
      return;
    }

    if (!subject.trim()) {
      toast.error("Veuillez saisir un sujet");
      return;
    }

    if (!content.trim()) {
      toast.error("Veuillez saisir un message");
      return;
    }

    try {
      setIsLoading(true);
      
      const messageData = {
        recipient: parseInt(recipientId),
        subject: subject.trim(),
        content: content.trim(),
        ...(listingId && listingId !== "none" ? { listing: parseInt(listingId) } : {})
      };
      
      const response = await marketplaceApi.createMessage(messageData);
      
      toast.success("Message envoyé avec succès");
      onSent();
      onOpenChange(false);
      
      // Optionally navigate to the message thread
      // router.push(`/dashboard/messages/${response.id}`);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Échec de l'envoi du message. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouveau Message</DialogTitle>
          <DialogDescription>
            Envoyez un message à un autre utilisateur de la plateforme.
          </DialogDescription>
        </DialogHeader>
        
        <motion.div 
          className="space-y-4 py-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Label htmlFor="recipient" className="text-sm font-medium">
              Destinataire
            </Label>
            <Select
              value={recipientId}
              onValueChange={setRecipientId}
              disabled={!!initialRecipientId || isLoading}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Sélectionner un destinataire" />
              </SelectTrigger>
              <SelectContent>
                {isFetchingUsers ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Chargement...
                  </div>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.first_name} {user.last_name} ({user.username})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Label htmlFor="listing" className="text-sm font-medium">
              Concernant une annonce (optionnel)
            </Label>
            <Select
              value={listingId}
              onValueChange={setListingId}
              disabled={!!initialListingId || isLoading}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Sélectionner une annonce (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune annonce</SelectItem>
                {isFetchingListings ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Chargement...
                  </div>
                ) : (
                  listings.map((listing) => (
                    <SelectItem key={listing.id} value={listing.id.toString()}>
                      {listing.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Label htmlFor="subject" className="text-sm font-medium">
              Sujet
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Entrez le sujet du message"
              className="mt-1"
              disabled={isLoading}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Label htmlFor="content" className="text-sm font-medium">
              Message
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Saisissez votre message ici..."
              className="min-h-[150px] mt-1"
              disabled={isLoading}
            />
          </motion.div>
        </motion.div>

        <DialogFooter className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading || !recipientId || !subject.trim() || !content.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              "Envoyer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 