import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Order, OrderStatus, UpdateOrderStatusRequest, marketplaceApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

// Define status transition options for each current status (lowercase)
const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["accepted", "rejected", "cancelled"],
  accepted: ["shipped", "cancelled"],
  rejected: ["pending"],
  shipped: ["delivered", "cancelled"],
  delivered: ["completed"],
  completed: [],
  cancelled: ["pending"],
};

// Uppercase status transitions for API responses
const uppercaseStatusTransitions: Record<string, OrderStatus[]> = {
  PENDING: statusTransitions.pending,
  ACCEPTED: statusTransitions.accepted,
  REJECTED: statusTransitions.rejected,
  SHIPPED: statusTransitions.shipped,
  DELIVERED: statusTransitions.delivered,
  COMPLETED: statusTransitions.completed,
  CANCELLED: statusTransitions.cancelled,
};

const statusLabels: Record<OrderStatus | string, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  rejected: "Refusée",
  shipped: "Expédiée",
  delivered: "Livrée",
  completed: "Terminée",
  cancelled: "Annulée",
  // Uppercase variants
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée"
};

// Helper to normalize status for consistent handling
const normalizeStatus = (status: string | OrderStatus): OrderStatus => {
  if (typeof status !== 'string') return 'pending';
  
  // If it's a valid lowercase status, return it directly
  if (Object.keys(statusTransitions).includes(status)) {
    return status as OrderStatus;
  }
  
  // If it's uppercase, convert to lowercase
  const lowercaseStatus = status.toLowerCase() as OrderStatus;
  if (Object.keys(statusTransitions).includes(lowercaseStatus)) {
    return lowercaseStatus;
  }
  
  // Default to pending if unrecognized
  return 'pending';
};

// Define the form schema
const updateStatusSchema = z.object({
  status: z.string().refine((val) => Object.keys(statusLabels).includes(val), {
    message: "Statut invalide",
  }),
  notes: z.string().optional(),
});

type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;

interface UpdateOrderStatusProps {
  order: Order;
  onUpdate: (updatedOrder: Order) => void;
}

export function UpdateOrderStatus({ order, onUpdate }: UpdateOrderStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Log the raw status for debugging
  console.log("UpdateOrderStatus - Raw status:", order.status, typeof order.status);
  
  // Normalize the status and get available transitions
  const normalizedStatus = normalizeStatus(order.status);
  const availableStatuses = 
    statusTransitions[normalizedStatus] || 
    (typeof order.status === 'string' && uppercaseStatusTransitions[order.status]) || 
    [];
  
  console.log("Normalized status:", normalizedStatus, "Available transitions:", availableStatuses);
  
  const form = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: "",
      notes: "",
    },
  });

  const onSubmit = async (values: UpdateStatusFormValues) => {
    setIsSubmitting(true);
    
    try {
      const updateData: UpdateOrderStatusRequest = {
        status: values.status as OrderStatus,
        notes: values.notes,
      };
      
      const updatedOrder = await marketplaceApi.updateOrderStatus(order.id, updateData);
      
      toast.success(`Statut mis à jour: ${statusLabels[updatedOrder.status as OrderStatus]}`);
      onUpdate(updatedOrder);
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Erreur lors de la mise à jour du statut. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (availableStatuses.length === 0) {
    return null;
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full md:w-auto"
      >
        Mettre à jour le statut
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mettre à jour le statut de la commande</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Statut actuel:</span>
            <OrderStatusBadge status={order.status} />
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau statut</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un nouveau statut" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {statusLabels[status]}
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informations supplémentaires sur la mise à jour du statut" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
} 