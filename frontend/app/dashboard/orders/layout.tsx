import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Package, ShoppingCart } from "lucide-react";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Commandes</h1>
        <p className="text-gray-500">
          Gérez vos commandes d'achat et de vente
        </p>
      </div>

      <Tabs defaultValue="my-orders" className="w-full">
        <TabsList className="mb-8">
          <Link href="/dashboard/orders/my-orders" passHref legacyBehavior>
            <TabsTrigger value="my-orders" asChild>
              <a className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Mes achats</span>
              </a>
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/orders/my-sales" passHref legacyBehavior>
            <TabsTrigger value="my-sales" asChild>
              <a className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Mes ventes</span>
              </a>
            </TabsTrigger>
          </Link>
        </TabsList>

        {children}
      </Tabs>
    </div>
  );
} 