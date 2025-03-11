"use client";

import { useState } from "react";
import { marketplaceApi, Order } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, StarIcon } from "lucide-react";
import { motion } from "framer-motion";

interface CreateReviewFormProps {
  listingId: number;
  listingTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewSubmitted: () => void;
}

export default function CreateReviewForm({
  listingId,
  listingTitle,
  open,
  onOpenChange,
  onReviewSubmitted
}: CreateReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }

    if (!comment.trim()) {
      toast.error("Veuillez ajouter un commentaire");
      return;
    }

    try {
      setIsSubmitting(true);

      const reviewData = {
        listing_id: listingId,
        rating,
        comment: comment.trim()
      };
      
      console.log("Submitting review with data:", reviewData);

      await marketplaceApi.createReview(reviewData);

      toast.success("Votre avis a été soumis avec succès");
      onReviewSubmitted();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      
      // Handle specific error responses from the API
      if (error.response && error.response.data) {
        if (error.response.data.listing_id) {
          toast.error("Annonce invalide: " + error.response.data.listing_id.join(', '));
        } else if (error.response.data.non_field_errors) {
          toast.error(error.response.data.non_field_errors.join(', '));
        } else {
          // Show the first error message we find
          const firstErrorKey = Object.keys(error.response.data)[0];
          if (firstErrorKey) {
            const errorMsg = error.response.data[firstErrorKey];
            toast.error(`${firstErrorKey}: ${Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg}`);
          } else {
            toast.error("Une erreur est survenue lors de la soumission de votre avis");
          }
        }
      } else {
        toast.error("Une erreur est survenue lors de la soumission de votre avis");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const starVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2 },
    tap: { scale: 0.95 }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleReset();
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Laisser un avis</DialogTitle>
        </DialogHeader>

        <motion.div
          className="space-y-4 py-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Évaluez votre expérience avec cette annonce
            </p>
            <p className="font-medium mb-4">
              {listingTitle}
            </p>
            <div className="flex justify-center space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                  key={star}
                  variants={starVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <StarIcon
                    className={`h-8 w-8 
                      ${
                        (hoverRating ? star <= hoverRating : star <= rating)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      } 
                      transition-colors
                    `}
                  />
                </motion.div>
              ))}
            </div>
            <p className="text-sm mt-2">
              {rating === 1 && "Très insatisfait"}
              {rating === 2 && "Insatisfait"}
              {rating === 3 && "Neutre"}
              {rating === 4 && "Satisfait"}
              {rating === 5 && "Très satisfait"}
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Label htmlFor="comment" className="text-sm font-medium">
              Votre commentaire
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="mt-1 min-h-[120px]"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Votre avis aidera les autres utilisateurs de la plateforme.
            </p>
          </motion.div>
        </motion.div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || !comment.trim() || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Soumission...
              </>
            ) : (
              "Soumettre"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 