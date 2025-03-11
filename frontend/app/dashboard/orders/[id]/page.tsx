"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { marketplaceApi, Order } from "@/lib/api";
import { OrderDetail } from "@/components/orders/order-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const fetchOrder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Attempting to fetch order ${params.id}...`);
      let orderData = await marketplaceApi.getOrderById(parseInt(params.id));
      console.log("Fetched order data:", orderData);
      
      // At this point, the API call should have already attempted to create the
      // necessary details objects, but let's make sure we have complete data
      
      // Helper function to safely get an ID from either a number or an object
      const getIdSafely = (value: any): number | null => {
        if (typeof value === 'number') return value;
        if (value && typeof value === 'object' && 'id' in value) return value.id;
        return null;
      };
      
      // Deep clone to avoid mutation issues
      const structuredOrder = JSON.parse(JSON.stringify(orderData));
      
      // Additional check for listing object
      if (structuredOrder.listing && typeof structuredOrder.listing === 'object' && !structuredOrder.listing_details) {
        structuredOrder.listing_details = structuredOrder.listing;
        console.log("Created listing_details from listing object in page component");
      }
      
      // Additional check for buyer object
      if (structuredOrder.buyer && typeof structuredOrder.buyer === 'object' && !structuredOrder.buyer_details) {
        structuredOrder.buyer_details = structuredOrder.buyer;
        console.log("Created buyer_details from buyer object in page component");
      }
      
      // Additional check for seller in listing
      if (structuredOrder.listing && 
          typeof structuredOrder.listing === 'object' && 
          structuredOrder.listing.seller && 
          !structuredOrder.seller_details) {
        structuredOrder.seller_details = structuredOrder.listing.seller;
        structuredOrder.seller = getIdSafely(structuredOrder.listing.seller);
        console.log("Created seller_details from listing.seller in page component");
      }
      
      // Log final structured data
      console.log("Final structured order data for UI:", structuredOrder);
      
      // If we still have missing details, try repair as a last resort
      if (!structuredOrder.listing_details || !structuredOrder.buyer_details || !structuredOrder.seller_details) {
        console.log("Still missing details, attempting repair...");
        try {
          const repairedOrder = await marketplaceApi.repairOrderData(structuredOrder);
          setOrder(repairedOrder);
        } catch (repairError) {
          console.error("Repair failed:", repairError);
          // Use the best data we have
          setOrder(structuredOrder);
        }
      } else {
        setOrder(structuredOrder);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Impossible de charger les détails de la commande");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrder(updatedOrder);
  };

  // Check if the current user is the seller
  const isCurrentUserSeller = () => {
    if (!user || !order) return false;
    return user.id === order.seller;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Erreur</h2>
        <p className="mb-6">{error || "Commande introuvable"}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.back()}>Retour</Button>
          <Button onClick={fetchOrder} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </motion.div>

      <OrderDetail 
        order={order} 
        isSeller={isCurrentUserSeller()} 
        onOrderUpdate={handleOrderUpdate}
        onReload={fetchOrder}
      />
    </div>
  );
} 