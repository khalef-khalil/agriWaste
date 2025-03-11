import { motion } from "framer-motion";
import { useState } from "react";
import { Order } from "@/lib/api";
import { formatDate, getIdSafely } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { UpdateOrderStatus } from "@/components/orders/update-order-status";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Truck,
  CreditCard,
  Calendar,
  MapPin,
  User,
  Clock,
  MessageSquare,
  ArrowUpRight,
  Star,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import CreateReviewForm from "@/components/reviews/create-review-form";
import ReviewList from "@/components/reviews/review-list";
import MessageDialog from "@/components/messages/message-dialog";
import { toast } from "sonner";

interface OrderDetailProps {
  order: Order;
  isSeller: boolean;
  onOrderUpdate: (updatedOrder: Order) => void;
  onReload?: () => void;
}

// Helper function to normalize listing status
const normalizeListingStatus = (status: string | undefined): string => {
  if (!status) return 'Indisponible';
  
  // Handle uppercase status values
  const normalized = status.toLowerCase();
  
  // Map known status values
  switch (normalized) {
    case 'active':
      return 'Disponible';
    case 'inactive':
      return 'Indisponible';
    case 'pending':
      return 'En attente';
    case 'sold':
      return 'Vendu';
    default:
      return status;
  }
};

export function OrderDetail({ order, isSeller, onOrderUpdate, onReload }: OrderDetailProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  // Log the raw order object received
  console.log("Raw order object received:", order);

  // Extract order data with safe destructuring
  const id = order?.id;
  const listing = order?.listing;
  const listing_details = order?.listing_details;
  const buyer = order?.buyer;
  const buyer_details = order?.buyer_details;
  const seller = order?.seller;
  const seller_details = order?.seller_details;
  const quantity = order?.quantity;
  const total_price = order?.total_price;
  const status = order?.status;
  const notes = order?.notes;
  const shipping_address = order?.shipping_address;
  const shipping_method = order?.shipping_method;
  const payment_method = order?.payment_method;
  const created_at = order?.created_at;
  const updated_at = order?.updated_at;

  // Log the exact structure of the order for debugging
  console.log("Order structure:", {
    id,
    listingType: typeof listing,
    listingId: typeof listing === 'object' && listing ? listing.id : listing,
    seller,
    sellerDetailsEmpty: seller_details && Object.keys(seller_details).length === 0,
    listingHasSeller: typeof listing === 'object' && listing && 'seller' in listing,
    listingHasSellerUsername: typeof listing === 'object' && listing && 'seller_username' in listing,
    status,
    rawStatus: status,
    statusType: typeof status
  });

  // Add safety check for missing data with more detailed message
  if (!id) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-800">
          Données de commande invalides ou manquantes.
        </p>
        {onReload && (
          <Button 
            variant="outline" 
            onClick={onReload} 
            className="mt-4"
          >
            Recharger les données
          </Button>
        )}
      </div>
    );
  }

  // Log which details we have to help debugging
  console.log("OrderDetail rendering with:", {
    hasListingDetails: !!listing_details,
    hasBuyerDetails: !!buyer_details,
    hasSellerDetails: !!seller_details,
    listingType: typeof listing,
    buyerType: typeof buyer,
    sellerType: typeof seller
  });

  // Try to get seller from listing details if available
  const sellerFromListing = 
    (listing_details && typeof listing_details === 'object' && listing_details.seller) 
      ? listing_details.seller
      : (typeof listing === 'object' && listing && listing.seller) 
        ? listing.seller
        : null;
  
  // Also try to extract seller from seller_username in listing
  const sellerFromUsername = 
    (typeof listing === 'object' && listing && listing.seller_username)
      ? {
          id: 0, // We don't know the ID
          username: listing.seller_username,
          email: '',
          first_name: listing.seller_username,
          last_name: '',
          user_type: 'seller',
          profile_image: ''
        }
      : null;

  // Debug all possible seller sources
  console.log("Seller sources:", {
    seller,
    seller_details: seller_details ? JSON.stringify(seller_details) : null,
    sellerFromListing: sellerFromListing ? JSON.stringify(sellerFromListing) : null,
    sellerFromUsername: sellerFromUsername ? JSON.stringify(sellerFromUsername) : null,
    listing: typeof listing === 'object' ? JSON.stringify(listing) : listing
  });

  // Create fallback objects for missing details to avoid UI errors
  const listingDetailsWithFallback = listing_details || 
    (typeof listing === 'object' && listing ? listing : {
      id: getIdSafely(listing) || 0,
      title: 'Détails indisponibles',
      description: 'Description indisponible',
      price: total_price || 0,
      currency: 'EUR',
      unit: 'unité',
      waste_type_name: 'Type non spécifié',
      country: 'Pays non spécifié',
      location: 'Localisation non spécifiée'
    });

  const buyerDetailsWithFallback = buyer_details || 
    (typeof buyer === 'object' && buyer ? buyer : {
      id: getIdSafely(buyer) || 0,
      username: `Utilisateur #${getIdSafely(buyer) || 'inconnu'}`,
      first_name: 'Acheteur',
      last_name: '',
      user_type: 'buyer',
      email: '',
      profile_image: ''
    });

  // Create proper fallback for seller details - fixing the syntax error
  let sellerDetailsWithFallback;
  
  // First try seller_details if it has content
  if (seller_details && Object.keys(seller_details).length > 0) {
    sellerDetailsWithFallback = seller_details;
    console.log("Using seller_details for display");
  }
  // Then try seller from listing
  else if (sellerFromListing) {
    sellerDetailsWithFallback = sellerFromListing;
    console.log("Using sellerFromListing for display");
  }
  // Then try to create from seller_username
  else if (sellerFromUsername) {
    sellerDetailsWithFallback = sellerFromUsername;
    console.log("Using sellerFromUsername for display", sellerFromUsername);
  }
  // For the case where we have seller=1 and seller_username=admin
  else if (typeof seller === 'number' && 
    typeof listing === 'object' && 
    listing && 
    listing.seller_username) {
    sellerDetailsWithFallback = {
      id: seller,
      username: listing.seller_username,
      email: '',
      first_name: listing.seller_username,
      last_name: '',
      user_type: 'seller',
      profile_image: ''
    };
    console.log("Created seller details from listing.seller_username for a numeric seller ID", sellerDetailsWithFallback);
  }
  // Last resort use seller if it's an object
  else if (typeof seller === 'object' && seller) {
    sellerDetailsWithFallback = seller;
    console.log("Using seller object directly");
  }
  // Complete fallback
  else {
    sellerDetailsWithFallback = {
      id: getIdSafely(seller) || 0,
      username: `Utilisateur #${getIdSafely(seller) || 'inconnu'}`,
      first_name: 'Vendeur',
      last_name: '',
      user_type: 'seller',
      email: '',
      profile_image: ''
    };
    console.log("Using complete fallback seller data");
  }

  // Safe listing ID for the link - extract it safely
  const safeListingId = getIdSafely(listingDetailsWithFallback) || '';

  // Normalize the status value for consistent handling - handle both uppercase and null case
  const normalizedStatus = status ? 
    (typeof status === 'string' ? status.toLowerCase() : status) as OrderStatus : 
    'pending';
  
  // Log additional information about status
  console.log("Status in order:", {
    rawStatus: status,
    statusType: typeof status,
    normalizedStatus
  });

  // Debug seller ID
  console.log("Seller data:", {
    rawSeller: seller,
    sellerId: typeof seller === 'object' ? seller.id : seller,
    sellerDetails: seller_details
  });
  
  // Get a valid seller ID for messaging
  const getValidSellerId = () => {
    // First try seller_details which should be the most complete
    if (seller_details && typeof seller_details === 'object' && seller_details.id) {
      return seller_details.id;
    }
    
    // Next try seller if it's an object
    if (seller && typeof seller === 'object' && seller.id) {
      return seller.id;
    }
    
    // Finally use seller as a number if it exists
    if (seller && typeof seller === 'number') {
      return seller;
    }
    
    // If nothing else works, return undefined which will trigger validation
    return undefined;
  };

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Update button click handler
  const handleContactSellerClick = () => {
    const sellerId = getValidSellerId();
    
    // More detailed logging
    console.log("Contact Seller - Debug info:", {
      sellerId,
      sellerObject: seller,
      sellerDetails,
      sellerDetailsWithFallback,
      listing,
      listingId: typeof listing === 'object' ? listing.id : listing
    });
    
    if (!sellerId) {
      // Show error if we don't have a valid seller ID
      toast.error("Impossible de contacter le vendeur: ID du vendeur invalide");
      return;
    }
    
    setShowMessageDialog(true);
  };

  return (
    <motion.div
      variants={containerAnimation}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemAnimation} className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Commande #{id}
          </h1>
          <p className="text-gray-500">
            Créée le {formatDate(created_at)}
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Statut:</span>
            <OrderStatusBadge status={normalizedStatus} animate />
          </div>
          
          {isSeller && (
            <UpdateOrderStatus 
              order={order} 
              onUpdate={onOrderUpdate} 
            />
          )}
          
          {!isSeller && normalizedStatus === 'completed' && !hasReviewed && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setShowReviewForm(true)}
            >
              <Star className="h-4 w-4" />
              Laisser un avis
            </Button>
          )}

          {!isSeller && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleContactSellerClick}
            >
              <MessageCircle className="h-4 w-4" />
              Contacter le vendeur
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemAnimation}>
          <Card>
            <CardHeader className="bg-green-50 dark:bg-green-950">
              <CardTitle className="text-lg">Détails de l'annonce</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2 hover:text-emerald-700 transition-colors">
                  <Link href={`/marketplace/${String(safeListingId)}`} className="flex items-center gap-1">
                    {listingDetailsWithFallback.title || 'Détails indisponibles'}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </h3>
                
                <div className="text-sm text-gray-500 mb-4">
                  <p className="line-clamp-2">{listingDetailsWithFallback.description || 'Description indisponible'}</p>
                </div>
                
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                  <MapPin size={14} />
                  <span className="line-clamp-1">
                    {listingDetailsWithFallback.location || 'Localisation non spécifiée'}
                    {listingDetailsWithFallback.country ? `, ${listingDetailsWithFallback.country}` : ''}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant={listingDetailsWithFallback.status === 'ACTIVE' || listingDetailsWithFallback.status === 'active' ? 'success' : 'secondary'}>
                    {normalizeListingStatus(listingDetailsWithFallback.status)}
                  </Badge>
                  <Badge variant="outline">{listingDetailsWithFallback.waste_type_name || 'Type non spécifié'}</Badge>
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Quantité</p>
                    <p className="font-medium">
                      {quantity} {listingDetailsWithFallback.unit || listingDetailsWithFallback.quantity_unit || 'unité'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-medium">
                      {total_price} {listingDetailsWithFallback.currency || 'EUR'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnimation}>
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-950">
              <CardTitle className="text-lg">Informations d'expédition</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Adresse de livraison</p>
                  <p className="font-medium whitespace-pre-line">{shipping_address || 'Non spécifiée'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Truck className="h-4 w-4 mt-0.5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Méthode d'expédition</p>
                  <p className="font-medium">{shipping_method || 'Non spécifiée'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 mt-0.5 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Méthode de paiement</p>
                  <p className="font-medium">{payment_method || 'Non spécifiée'}</p>
                </div>
              </div>
              
              {notes && (
                <div className="flex items-start gap-2 border-t pt-4 mt-4">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="font-medium whitespace-pre-line">{notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnimation}>
          <Card>
            <CardHeader className="bg-amber-50 dark:bg-amber-950">
              <CardTitle className="text-lg">Acheteur</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={buyerDetailsWithFallback.profile_image} alt={buyerDetailsWithFallback.username} />
                  <AvatarFallback>
                    {(buyerDetailsWithFallback.first_name || '?').charAt(0)}
                    {(buyerDetailsWithFallback.last_name || '').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {buyerDetailsWithFallback.first_name || ''} {buyerDetailsWithFallback.last_name || ''}
                  </p>
                  <p className="text-sm text-gray-500">
                    {buyerDetailsWithFallback.organization_name || buyerDetailsWithFallback.user_type || 'Utilisateur'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnimation}>
          <Card>
            <CardHeader className="bg-purple-50 dark:bg-purple-950">
              <CardTitle className="text-lg">Vendeur</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={sellerDetailsWithFallback.profile_image} alt={sellerDetailsWithFallback.username} />
                  <AvatarFallback>
                    {(sellerDetailsWithFallback.first_name || '?').charAt(0)}
                    {(sellerDetailsWithFallback.last_name || '').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {sellerDetailsWithFallback.username || sellerDetailsWithFallback.first_name || 'Vendeur'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {sellerDetailsWithFallback.organization_name || sellerDetailsWithFallback.user_type || 'Utilisateur'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {normalizedStatus === 'completed' && !isSeller && (
          <motion.div variants={itemAnimation} className="lg:col-span-2">
            <ReviewList 
              userId={typeof sellerDetailsWithFallback === 'object' ? sellerDetailsWithFallback.id : null}
              title="Avis sur le vendeur"
              maxItems={3}
            />
          </motion.div>
        )}
      </div>
      
      <CreateReviewForm
        order={order}
        open={showReviewForm}
        onOpenChange={setShowReviewForm}
        onReviewSubmitted={() => {
          setHasReviewed(true);
          // Optionally reload the page or update the UI
          if (onReload) {
            onReload();
          }
        }}
      />

      <MessageDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        recipientId={getValidSellerId() || 0}
        listingId={typeof listing === 'object' ? listing.id : (listing || undefined)}
        userId={typeof buyer === 'object' ? buyer.id : (buyer || 0)}
        title={`Question sur commande #${id}`}
      />
    </motion.div>
  );
} 