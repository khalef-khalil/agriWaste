"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { marketplaceApi, Listing } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Package, DollarSign, ArrowLeft, MessageSquare, Info, Star, Mail, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { CreateOrderForm } from "@/components/orders/create-order-form";
import { toast } from "sonner";
import ReviewList from "@/components/reviews/review-list";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import CreateReviewForm from "@/components/reviews/create-review-form";
import MessageDialog from "@/components/messages/message-dialog";

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const listingData = await marketplaceApi.getListingById(parseInt(params.id));
        setListing(listingData);
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [params.id]);

  // Function to check if the current user is the seller
  const isCurrentUserSeller = () => {
    if (!user || !listing || !listing.seller) return false;
    
    const sellerId = typeof listing.seller === 'object' ? listing.seller.id : listing.seller;
    return user.id === sellerId;
  };

  // Function to handle contact seller
  const handleContactSeller = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=" + encodeURIComponent(`/marketplace/${params.id}`));
      return;
    }
    
    if (isCurrentUserSeller()) {
      toast.error("Vous ne pouvez pas vous contacter vous-même");
      return;
    }
    
    // Get seller ID, handling both object and number cases
    const sellerId = typeof listing.seller === 'object' 
      ? listing.seller.id 
      : listing.seller;
      
    // Redirect to messages page with pre-filled data
    router.push(`/dashboard/messages?recipient=${sellerId}&listing=${listing.id}&subject=Question sur ${listing.title.substring(0, 30)}${listing.title.length > 30 ? '...' : ''}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div>
              <div className="h-10 w-3/4 bg-gray-200 rounded mb-6"></div>
              <div className="h-6 w-1/4 bg-gray-200 rounded mb-6"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded mb-6"></div>
              <div className="h-10 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Annonce introuvable</h2>
        <p className="mb-6">L'annonce que vous recherchez n'existe pas ou a été supprimée.</p>
        <Button asChild>
          <Link href="/marketplace">Retour au marché</Link>
        </Button>
      </div>
    );
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Retour aux annonces
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[activeImageIndex].image_url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <Package size={64} className="text-muted-foreground" />
              </div>
            )}
          </div>

          {listing.images && listing.images.length > 1 && (
            <div className="flex gap-2 overflow-auto py-1">
              {listing.images.map((image, index) => (
                <button
                  key={image.id}
                  className={`relative h-16 w-16 cursor-pointer rounded-md border overflow-hidden ${
                    index === activeImageIndex ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img
                    src={image.image_url}
                    alt={`${listing.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin size={16} />
              <span>{listing.location}, {listing.country}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold">{listing.price} {listing.currency}</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Package size={16} />
                <span>{listing.quantity} {listing.quantity_unit}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Publié le {new Date(listing.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{listing.description}</p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Type de déchet</h2>
            <div className="inline-block bg-muted rounded-full px-3 py-1 text-sm">
              {listing.waste_type_name}
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>À propos du vendeur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={listing.seller.profile_image} />
                  <AvatarFallback>
                    {listing.seller.first_name?.[0] || listing.seller.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {listing.seller.first_name && listing.seller.last_name
                      ? `${listing.seller.first_name} ${listing.seller.last_name}`
                      : listing.seller.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">{listing.seller.user_type}</p>
                  {listing.seller.organization_name && (
                    <p className="text-sm">{listing.seller.organization_name}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col space-y-3 my-4">
            {!isCurrentUserSeller() && (
              <>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    if (!user) {
                      toast.error("Veuillez vous connecter pour contacter le vendeur");
                      router.push('/auth/signin');
                      return;
                    }
                    setShowMessageDialog(true);
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contacter le vendeur
                </Button>
                
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    if (!user) {
                      toast.error("Veuillez vous connecter pour passer une commande");
                      router.push('/auth/signin');
                      return;
                    }
                    setIsOrderFormOpen(true);
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Commander
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (!user) {
                      toast.error("Veuillez vous connecter pour laisser un avis");
                      router.push('/auth/signin');
                      return;
                    }
                    
                    toast.info("Vous pouvez laisser un avis uniquement après avoir complété une commande. Vous pourrez ajouter un avis depuis votre page de commandes.");
                    
                    router.push('/dashboard/orders');
                  }}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Laisser un avis
                </Button>
              </>
            )}
          </div>

          {isCurrentUserSeller() && (
            <div className="flex gap-4 mt-4">
              <Button className="flex-1" variant="outline" asChild>
                <Link href={`/dashboard/listings/${listing.id}/edit`}>
                  Modifier l'annonce
                </Link>
              </Button>
              <Button className="flex-1" variant="outline" asChild>
                <Link href={`/dashboard/listings/${listing.id}/images`}>
                  Gérer les images
                </Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <Button variant="outline" asChild>
          <Link href="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au marché
          </Link>
        </Button>
      </div>

      {listing && (
        <CreateOrderForm 
          listing={listing} 
          isOpen={isOrderFormOpen} 
          onClose={() => setIsOrderFormOpen(false)} 
        />
      )}

      <Separator className="my-12" />
      
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Avis sur le vendeur</h2>
        </div>
        
        <ReviewList 
          userId={typeof listing.seller === 'object' ? listing.seller.id : listing.seller}
          title=""
        />
      </div>

      <MessageDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        recipientId={typeof listing.seller === 'object' ? listing.seller.id : listing.seller}
        listingId={listing.id}
        userId={typeof listing.seller === 'object' ? listing.seller.id : listing.seller}
        title=""
      />
    </div>
  );
} 