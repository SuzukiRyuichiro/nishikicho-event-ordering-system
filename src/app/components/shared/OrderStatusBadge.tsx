import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export default function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    completed: "bg-green-100 text-green-700 border-green-300",
    cancelled: "bg-red-100 text-red-700 border-red-300",
  };

  const normalizedStatus = status.toLowerCase();
  const displayStatus = status || "unknown";

  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize transition-colors duration-300",
        statusStyles[normalizedStatus] ||
          "bg-gray-100 text-gray-700 border-gray-300", // Fallback
        className
      )}
    >
      {displayStatus}
    </Badge>
  );
}
