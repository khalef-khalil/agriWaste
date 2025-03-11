import { Order } from "@/lib/api";
import { formatDate, getIdSafely } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { Eye, Package, User, Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface OrderCardProps {
  order: Order;
  index: number;
  isSeller?: boolean;
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

export function OrderCard({ order, index, isSeller = false }: OrderCardProps) {
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
  const created_at = order?.created_at;

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

  // Debug the seller information
  console.log(`Order #${id} seller information:`, {
    seller,
    seller_details: seller_details ? Object.keys(seller_details).length : null,
    sellerFromListing,
    sellerFromUsername,
    listing: typeof listing === 'object' ? (listing.seller_username || 'no username') : 'not object'
  });

  // Log the raw order object
  console.log(`Raw order #${id} object:`, order);

  // Create fallback objects for missing details
  const listingDetailsWithFallback = listing_details || 
    (typeof listing === 'object' && listing ? listing : {
      id: getIdSafely(listing) || 0,
      title: 'Détails indisponibles',
      description: 'Description indisponible',
      price: total_price || 0,
      currency: 'EUR',
      unit: 'unité',
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
      email: ''
    });

  // Create proper fallback for seller details
  let sellerDetailsWithFallback;
  
  // First try seller_details if it has content
  if (seller_details && Object.keys(seller_details).length > 0) {
    sellerDetailsWithFallback = seller_details;
  }
  // Then try seller from listing
  else if (sellerFromListing) {
    sellerDetailsWithFallback = sellerFromListing;
  }
  // Then try to create from seller_username
  else if (sellerFromUsername) {
    sellerDetailsWithFallback = sellerFromUsername;
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
  }
  // Last resort use seller if it's an object
  else if (typeof seller === 'object' && seller) {
    sellerDetailsWithFallback = seller;
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
  }

  // Normalize the status value for consistent handling - handle both uppercase and null case
  const normalizedStatus = status ? 
    (typeof status === 'string' ? status.toLowerCase() : status) as OrderStatus : 
    'pending';
  
  // Add more debugging for status
  console.log(`Order #${id} status:`, {
    rawStatus: status,
    statusType: typeof status,
    normalizedStatus
  });

  if (!id) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card className="overflow-hidden bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-800">
              Données de commande invalides ou manquantes.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg md:text-xl">
              Commande #{id}
            </CardTitle>
            <OrderStatusBadge status={normalizedStatus} animate />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-base md:text-lg truncate">
              {listingDetailsWithFallback.title}
            </h3>
            <div className="flex items-center space-x-1 text-gray-500">
              <Package className="h-4 w-4" />
              <span>{quantity} {listingDetailsWithFallback.unit || 'unité'}</span>
              <span className="mx-1">•</span>
              <span>{total_price} {listingDetailsWithFallback.currency || 'EUR'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-4">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-0.5 text-blue-500" />
              <div>
                <p className="text-gray-500 text-xs">
                  {isSeller ? "Acheteur" : "Vendeur"}
                </p>
                <p className="font-medium flex items-center gap-1">
                  {isSeller ? (
                    <Link href={`/profile/${buyerDetailsWithFallback.username || ''}`} className="hover:underline">
                      {buyerDetailsWithFallback.username || buyerDetailsWithFallback.first_name || 'Acheteur'}
                    </Link>
                  ) : (
                    <Link href={`/profile/${sellerDetailsWithFallback.username || ''}`} className="hover:underline">
                      {sellerDetailsWithFallback.username || sellerDetailsWithFallback.first_name || 'Vendeur'}
                    </Link>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-green-500" />
              <div>
                <p className="text-gray-500 text-xs">Date de commande</p>
                <p className="font-medium">{created_at ? formatDate(created_at) : 'Date inconnue'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 md:col-span-2">
              <MapPin className="h-4 w-4 mt-0.5 text-red-500" />
              <div>
                <p className="text-gray-500 text-xs">Localisation</p>
                <p className="font-medium">
                  {listingDetailsWithFallback.location || 'Non spécifiée'}
                  {listingDetailsWithFallback.country ? `, ${listingDetailsWithFallback.country}` : ''}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Badge variant="outline" className="ml-2">
              {listingDetailsWithFallback.waste_type_name || 'Type non spécifié'}
            </Badge>
            
            <Badge variant={listingDetailsWithFallback.status === 'ACTIVE' || listingDetailsWithFallback.status === 'active' ? 'success' : 'secondary'} className="ml-2">
              {normalizeListingStatus(listingDetailsWithFallback.status)}
            </Badge>
          </div>
        </CardContent>
        
        <CardFooter className="px-4 py-3 bg-gray-50 dark:bg-gray-900 flex justify-end">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/orders/${String(id)}`}>
              <Eye className="mr-2 h-4 w-4" />
              Voir les détails
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 