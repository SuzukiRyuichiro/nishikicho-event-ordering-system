
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OrderStatusBadge from '@/app/components/shared/OrderStatusBadge';
import OrderItemDisplay from '@/app/components/shared/OrderItemDisplay';
import { UserCircle, Clock, Hash, CheckCircle, PackageCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KitchenOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
  onDismiss?: (orderId: string) => void;
}

export default function KitchenOrderCard({ order, onUpdateStatus, onDismiss }: KitchenOrderCardProps) {
  const cardBorderColor = order.status === 'Pending' ? 'border-gray-400' : 'border-blue-500 opacity-70';

  const renderActionButtons = () => {
    switch (order.status) {
      case 'Pending':
        return (
          <Button 
            size="sm" 
            onClick={() => onUpdateStatus(order.id, 'Completed')} 
            className="w-full text-xs bg-green-500 hover:bg-green-600 text-white"
          >
            <CheckCircle className="mr-1 h-3 w-3" /> Mark as Completed
          </Button>
        );
      case 'Completed':
        if (onDismiss) {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDismiss(order.id)}
              className="w-full text-xs"
            >
              <Trash2 className="mr-1 h-3 w-3" /> Dismiss
            </Button>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <Card className={cn("shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.01]", cardBorderColor)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg text-primary flex items-center">
              <Hash className="h-4 w-4 mr-1 text-muted-foreground" /> Tab: {order.tabName}
            </CardTitle>
            {order.guestName && (
              <CardDescription className="flex items-center text-sm">
                <UserCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                For: {order.guestName}
              </CardDescription>
            )}
          </div>
          <OrderStatusBadge status={order.status} className="text-xs whitespace-nowrap" />
        </div>
        <div className="text-xs text-muted-foreground flex items-center mt-1">
          <Clock className="h-3 w-3 mr-1" />
          Received: {new Date(order.createdAt).toLocaleTimeString()}
          {order.updatedAt !== order.createdAt && ` | Updated: ${new Date(order.updatedAt).toLocaleTimeString()}`}
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border-l-2 border-muted pl-2 ml-1">
          {order.items.map(item => (
            <OrderItemDisplay key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2 pt-3">
        {renderActionButtons()}
      </CardFooter>
    </Card>
  );
}
