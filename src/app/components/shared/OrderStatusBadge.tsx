import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: boolean;
  className?: string;
}

export default function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps) {
  const statusStyles = {
    Pending: "bg-muted text-muted-foreground border-gray-300",
    Completed: "bg-blue-100 text-blue-700 border-blue-300",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize transition-colors duration-300",
        statusStyles[status ? "Pending" : "Completed"] ||
          "bg-gray-100 text-gray-700 border-gray-300", // Fallback
        className
      )}
    >
      {status ? "Pending" : "Completed"}
    </Badge>
  );
}
