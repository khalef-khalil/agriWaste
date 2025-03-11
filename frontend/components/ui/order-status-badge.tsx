import { OrderStatus } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";

// Define status types with both lowercase and uppercase versions
type NormalizedStatus = OrderStatus | Uppercase<OrderStatus> | string;

const statusStyles = cva("", {
  variants: {
    status: {
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      accepted: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      rejected: "bg-red-100 text-red-800 hover:bg-red-100",
      shipped: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
      delivered: "bg-green-100 text-green-800 hover:bg-green-100",
      completed: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      cancelled: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      // Add uppercase variants too
      PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      ACCEPTED: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      REJECTED: "bg-red-100 text-red-800 hover:bg-red-100",
      SHIPPED: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
      DELIVERED: "bg-green-100 text-green-800 hover:bg-green-100",
      COMPLETED: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      CANCELLED: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    },
  },
  defaultVariants: {
    status: "pending",
  },
});

const statusLabels: Record<OrderStatus | Uppercase<OrderStatus>, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  rejected: "Refusée",
  shipped: "Expédiée",
  delivered: "Livrée",
  completed: "Terminée",
  cancelled: "Annulée",
  // Add uppercase variants
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée"
};

interface OrderStatusBadgeProps {
  status: NormalizedStatus;
  animate?: boolean;
}

// Create a motion version of Badge properly
const MotionBadge = motion(Badge);

// Helper to get a normalized status for consistent usage
const normalizeStatus = (status: NormalizedStatus): OrderStatus | Uppercase<OrderStatus> => {
  // Add debugging
  console.log("Normalizing status:", {
    inputStatus: status,
    inputType: typeof status
  });
  
  // Ensure we have a string
  if (!status) return "pending";
  
  // If it's already a valid status, return it
  if (status in statusLabels) {
    return status as OrderStatus | Uppercase<OrderStatus>;
  }
  
  // Try the lowercase version
  const lowercaseStatus = status.toString().toLowerCase() as OrderStatus;
  if (lowercaseStatus in statusLabels) {
    return lowercaseStatus;
  }
  
  // Default to pending if we can't match
  return "pending";
};

export function OrderStatusBadge({ status, animate = false }: OrderStatusBadgeProps) {
  // Normalize the status to handle both uppercase and lowercase
  const normalizedStatus = normalizeStatus(status);
  
  if (animate) {
    return (
      <MotionBadge 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={statusStyles({ status: normalizedStatus })}
        variant="outline"
      >
        {statusLabels[normalizedStatus] || status}
      </MotionBadge>
    );
  }
  
  return (
    <Badge 
      className={statusStyles({ status: normalizedStatus })}
      variant="outline"
    >
      {statusLabels[normalizedStatus] || status}
    </Badge>
  );
} 