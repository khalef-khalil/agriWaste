"use client";

import { useEffect, useState } from "react";
import { marketplaceApi, Review, UserProfile } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ReviewListProps {
  userId?: number;
  listingId?: number;
  title?: string;
  maxItems?: number;
}

export default function ReviewList({ 
  userId, 
  listingId, 
  title = "Avis", 
  maxItems 
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        let fetchedReviews: Review[] = [];
        
        if (userId) {
          fetchedReviews = await marketplaceApi.getUserReviews(userId);
        } else if (listingId) {
          fetchedReviews = await marketplaceApi.getListingReviews(listingId);
        }
        
        // Sort by date (newest first)
        fetchedReviews.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Limit number of items if needed
        const limitedReviews = maxItems ? fetchedReviews.slice(0, maxItems) : fetchedReviews;
        
        setReviews(limitedReviews);
        
        // Calculate average rating
        if (fetchedReviews.length > 0) {
          const total = fetchedReviews.reduce((sum, review) => sum + review.rating, 0);
          setAvgRating(total / fetchedReviews.length);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, [userId, listingId, maxItems]);
  
  const getInitials = (user?: UserProfile | number) => {
    if (!user || typeof user === 'number') return '??';
    return `${(user.first_name?.[0] || '').toUpperCase()}${(user.last_name?.[0] || '').toUpperCase()}`;
  };
  
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };
  
  const reviewVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          {!isLoading && reviews.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span>{avgRating.toFixed(1)}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Aucun avis pour le moment</p>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div className="space-y-4">
              {reviews.map((review, index) => {
                const reviewer = typeof review.reviewer === 'object' 
                  ? review.reviewer 
                  : review.reviewer_details;
                  
                return (
                  <motion.div
                    key={review.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={reviewVariants}
                    className="p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={reviewer?.profile_image || ''}
                          alt={reviewer?.username || 'User'}
                        />
                        <AvatarFallback>{getInitials(reviewer)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 justify-between">
                          <div className="font-medium">
                            {reviewer?.first_name} {reviewer?.last_name}
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(review.created_at), {
                                addSuffix: true,
                                locale: fr
                              })}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{review.comment}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
} 