"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { marketplaceApi, Order } from "@/lib/api";
import { OrderCard } from "@/components/orders/order-card";
import { TabsContent } from "@/components/ui/tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, AlertCircle } from "lucide-react";

export default function MySalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      try {
        const response = await marketplaceApi.getMySales();
        setOrders(response.results);
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSales();
  }, []);

  // Filter orders based on status
  const getFilteredOrders = () => {
    if (activeTab === "all") {
      return orders;
    }
    return orders.filter(order => order.status === activeTab);
  };

  const filteredOrders = getFilteredOrders();

  if (isLoading) {
    return (
      <TabsContent value="my-sales" className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="my-sales" className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="mb-6 overflow-auto">
            <TabsList className="inline-flex">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="pending">En attente</TabsTrigger>
              <TabsTrigger value="accepted">Acceptées</TabsTrigger>
              <TabsTrigger value="shipped">Expédiées</TabsTrigger>
              <TabsTrigger value="delivered">Livrées</TabsTrigger>
              <TabsTrigger value="completed">Terminées</TabsTrigger>
              <TabsTrigger value="cancelled">Annulées</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {filteredOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredOrders.map((order, index) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    index={index} 
                    isSeller={true}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 dark:bg-gray-900 border rounded-lg p-8 text-center"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                    <Package className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold mt-2">Aucune vente trouvée</h3>
                  <p className="text-gray-500 max-w-md">
                    Vous n'avez pas encore reçu de commandes dans cette catégorie.
                  </p>
                </div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </TabsContent>
  );
} 