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
    Preparing: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Ready: 'bg-teal-100 text-teal-700 border-teal-300', // Using teal shades related to accent
    Served: 'bg-green-100 text-green-700 border-green-300',
    Completed: 'bg-blue-100 text-blue-700 border-blue-300',
    Cancelled: 'bg-red-100 text-red-700 border-red-300 line-through',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'capitalize transition-colors duration-300',
        statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-300',
        className
      )}
    >
      {status}
    </Badge>
  );
}
