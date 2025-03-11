"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { marketplaceApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: number;
  listingId?: number;
  userId: number;
  title?: string;
}

export default function MessageDialog({
  open,
  onOpenChange,
  recipientId,
  listingId,
  userId,
  title = ""
}: MessageDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const [subject, setSubject] = useState(title);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update subject when title prop changes
  useEffect(() => {
    setSubject(title);
  }, [title]);

  // Log props for debugging
  useEffect(() => {
    if (open) {
      console.log("MessageDialog opened with props:", {
        recipientId,
        listingId,
        userId,
        title,
        isAuthenticated,
        currentUser: user ? { id: user.id, username: user.username } : null
      });
    }
  }, [open, recipientId, listingId, userId, title, isAuthenticated, user]);

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Vous devez être connecté pour envoyer un message");
      return;
    }

    if (!subject.trim()) {
      toast.error("Veuillez ajouter un sujet");
      return;
    }

    if (!content.trim()) {
      toast.error("Veuillez ajouter un message");
      return;
    }

    if (!recipientId) {
      toast.error("Destinataire invalide");
      return;
    }

    try {
      setIsSubmitting(true);

      // Make sure we're sending valid data with exactly the field names the backend expects
      const messageData = {
        // The backend model uses 'receiver' (not recipient)
        receiver: recipientId,
        subject: subject.trim(),
        content: content.trim()
      };

      // Only add listing if it's provided and valid
      if (listingId && typeof listingId === 'number' && listingId > 0) {
        messageData.listing = listingId;
      }

      console.log("Sending message with data:", messageData);
      console.log("Current user:", user);
      
      await marketplaceApi.createMessage(messageData);

      toast.success("Message envoyé avec succès");
      onOpenChange(false);
      
      // Reset form
      setSubject(title);
      setContent("");
    } catch (error: any) {
      console.error("Failed to send message:", error);
      
      // Log full error details for debugging
      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      if (error.response?.data) {
        // Handle specific API error messages
        if (error.response.data.sender) {
          toast.error("Erreur d'authentification: " + error.response.data.sender.join(', '));
        } else if (error.response.data.receiver) {
          toast.error("Destinataire invalide: " + error.response.data.receiver.join(', '));
        } else if (error.response.data.non_field_errors) {
          toast.error(error.response.data.non_field_errors.join(', '));
        } else if (error.response.data.detail) {
          toast.error("Erreur: " + error.response.data.detail);
        } else {
          // Show the first error message we find
          const firstErrorKey = Object.keys(error.response.data)[0];
          if (firstErrorKey) {
            const errorMsg = error.response.data[firstErrorKey];
            toast.error(`${firstErrorKey}: ${Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg}`);
          } else {
            toast.error("Une erreur est survenue lors de l'envoi du message");
          }
        }
      } else {
        toast.error(`Erreur: ${error.message || "Une erreur est survenue lors de l'envoi du message"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        // Reset form when closing
        setSubject(title);
        setContent("");
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Envoyer un message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="subject" className="text-sm font-medium">
              Sujet
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sujet de votre message"
              className="mt-1"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="message" className="text-sm font-medium">
              Message
            </Label>
            <Textarea
              id="message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrivez votre message..."
              className="mt-1 min-h-[120px]"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!subject.trim() || !content.trim() || isSubmitting || !isAuthenticated}>
            {isSubmitting ? (
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