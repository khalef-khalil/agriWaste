"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, Package } from "lucide-react";
import { Listing } from "@/lib/api";

// Helper function to safely get seller information
const getSellerDisplayName = (listing: Listing): string => {
  if (typeof listing.seller === 'object' && listing.seller) {
    return `${listing.seller.first_name || ''} ${listing.seller.last_name || ''}`.trim() || listing.seller.username;
  }
  return listing.seller_username || `Vendeur #${listing.seller}`;
};

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/marketplace/${listing.id}`} className="block h-full">
      <Card className="overflow-hidden h-full transition-all hover:shadow-md group">
        <div className="relative h-48 w-full overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0].image_url}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <Package size={40} className="text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {listing.price} {listing.currency}
            </span>
          </div>
          {!listing.is_active && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-medium">Non disponible</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{listing.title}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
            <MapPin size={14} />
            <span className="line-clamp-1">{listing.location}, {listing.country}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
        </CardContent>
        <CardFooter className="px-4 py-3 border-t flex justify-between">
          <div className="flex items-center gap-1 text-xs">
            <Package size={14} />
            <span>{listing.quantity} {listing.quantity_unit}</span>
          </div>
          <div className="text-xs bg-muted px-2 py-1 rounded-full">
            {listing.waste_type_name}
          </div>
          <div className="text-xs text-muted-foreground">
            {getSellerDisplayName(listing)}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 