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
import { messageApi, UserProfile, Listing } from "@/lib/api";
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
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.results || []);
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setIsFetchingUsers(false);
    }
  };

  // Fetch listings for related listing selection
  const fetchListings = async () => {
    try {
      setIsFetchingListings(true);
      const response = await fetch("/api/marketplace/listings/active");
      if (response.ok) {
        const data = await response.json();
        setListings(data.results || []);
      } else {
        throw new Error("Failed to fetch listings");
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      toast.error("Erreur lors du chargement des annonces");
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
        receiver: parseInt(recipientId),
        subject: subject.trim(),
        content: content.trim(),
        ...(listingId && listingId !== "none" ? { listing: parseInt(listingId) } : {})
      };
      
      await messageApi.createMessage(messageData);
      
      toast.success("Message envoyé avec succès");
      onSent();
      onOpenChange(false);
      
      // Clear form
      setSubject("");
      setContent("");
      setRecipientId("");
      setListingId("");
      
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
              placeholder="Sujet du message"
              disabled={isLoading}
              className="mt-1"
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
              placeholder="Écrivez votre message ici..."
              disabled={isLoading}
              className="mt-1 min-h-[100px]"
            />
          </motion.div>
        </motion.div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              'Envoyer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 