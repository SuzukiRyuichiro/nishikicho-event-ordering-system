
import type { OrderStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const statusStyles: Record<OrderStatus, string> = {
    Pending: 'bg-muted text-muted-foreground border-gray-300',
    Completed: 'bg-blue-100 text-blue-700 border-blue-300',
    // Cancelled status is removed, if it were to be re-added, its style would go here
    // Preparing, Ready, Served statuses are removed
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'capitalize transition-colors duration-300',
        statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-300', // Fallback
        className
      )}
    >
      {status}
    </Badge>
  );
}
