import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateOrderRequest, Listing, marketplaceApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Truck, DollarSign, CreditCard, MapPin } from "lucide-react";

// Define the form schema
const orderFormSchema = z.object({
  quantity: z.coerce
    .number()
    .min(1, { message: "La quantité doit être supérieure à 0" }),
  notes: z.string().optional(),
  shipping_address: z.string().min(5, { 
    message: "L'adresse de livraison doit comporter au moins 5 caractères" 
  }),
  shipping_method: z.string().min(1, { 
    message: "Veuillez sélectionner une méthode d'expédition" 
  }),
  payment_method: z.string().min(1, { 
    message: "Veuillez sélectionner une méthode de paiement" 
  }),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const shippingMethods = [
  { value: "standard", label: "Livraison standard (3-5 jours)" },
  { value: "express", label: "Livraison express (1-2 jours)" },
  { value: "pickup", label: "Enlèvement sur place" },
];

const paymentMethods = [
  { value: "bank_transfer", label: "Virement bancaire" },
  { value: "credit_card", label: "Carte de crédit" },
  { value: "cash", label: "Paiement à la livraison" },
];

interface CreateOrderFormProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrderForm({ listing, isOpen, onClose }: CreateOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      quantity: 1,
      notes: "",
      shipping_address: "",
      shipping_method: "",
      payment_method: "",
    },
  });

  const onSubmit = async (values: OrderFormValues) => {
    setIsSubmitting(true);
    
    if (!user) {
      toast.error("Vous devez être connecté pour passer une commande.");
      setIsSubmitting(false);
      return;
    }
    
    if (!listing || !listing.seller || !listing.seller.id) {
      toast.error("Informations du vendeur manquantes. Impossible de créer la commande.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const quantity = values.quantity;
      const total = quantity * listing.price;
      
      const orderData: CreateOrderRequest = {
        listing: listing.id,
        quantity: values.quantity,
        buyer: user.id,                // Authenticated user as buyer
        seller: listing.seller.id,     // Listing owner as seller
        total_price: total,
        notes: values.notes || "",
        shipping_address: values.shipping_address,
        shipping_method: values.shipping_method,
        payment_method: values.payment_method,
      };
      
      console.log("Creating order with data:", orderData);
      
      const order = await marketplaceApi.createOrder(orderData);
      
      toast.success("Commande créée avec succès!");
      router.push(`/dashboard/orders/${order.id}`);
      onClose();
    } catch (error: any) {
      console.error("Error creating order:", error);
      
      // Log detailed error information
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        // Show more specific error message if available
        if (error.response.data && typeof error.response.data === 'object') {
          const errorMessages = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          toast.error(`Erreur: ${errorMessages}`);
        } else {
          toast.error(`Erreur lors de la création de la commande: ${error.response.status}`);
        }
      } else {
        toast.error("Erreur lors de la création de la commande. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total based on quantity
  const quantity = form.watch("quantity") || 1;
  const totalPrice = quantity * listing.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer une commande</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de commander "{listing.title}"
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Prix unitaire:</span>
                <span className="font-medium">
                  {listing.price} {listing.currency} / {listing.unit || listing.quantity_unit || 'unité'}
                </span>
              </div>
              
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Package className="h-4 w-4" /> Quantité
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <motion.div 
                className="flex items-center justify-between mt-4 font-semibold"
                key={totalPrice}
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <span>Total:</span>
                <span className="text-lg text-green-600 dark:text-green-400">
                  {totalPrice} {listing.currency}
                </span>
              </motion.div>
            </div>
            
            <FormField
              control={form.control}
              name="shipping_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Adresse de livraison
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Adresse complète pour la livraison" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shipping_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Truck className="h-4 w-4" /> Méthode de livraison
                    </FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" /> Méthode de paiement
                    </FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Notes (optionnel)
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Instructions spéciales ou informations supplémentaires" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Création en cours..." : "Confirmer la commande"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 