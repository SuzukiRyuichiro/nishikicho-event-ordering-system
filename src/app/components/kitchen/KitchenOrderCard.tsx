import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OrderStatusBadge from '@/app/components/shared/OrderStatusBadge';
import OrderItemDisplay from '@/app/components/shared/OrderItemDisplay';
import OrderStatusSelector from '@/app/components/shared/OrderStatusSelector';
import { UserCircle, Clock, Hash, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KitchenOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
  onDismiss?: (orderId: string) => void; // For completed/cancelled orders
}

export default function KitchenOrderCard({ order, onUpdateStatus, onDismiss }: KitchenOrderCardProps) {
  const cardBorderColor = 
    order.status === 'Pending' ? 'border-gray-400' :
    order.status === 'Preparing' ? 'border-yellow-500' :
    order.status === 'Ready' ? 'border-teal-500' :
    order.status === 'Served' ? 'border-green-500' :
    order.status === 'Completed' ? 'border-blue-500 opacity-70' :
    order.status === 'Cancelled' ? 'border-red-500 opacity-60' :
    'border-border';

  return (
    <Card className={cn("shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.01]", cardBorderColor, {
      'bg-green-50 animate-pulse- একবার': order.status === 'Ready', // Subtle pulse for "Ready"
    })}>
      <style jsx>{`
        @keyframes pulse-once {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } /* teal-500 */
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .animate-pulse-once {
          animation: pulse-once 1.5s ease-out;
        }
      `}</style>
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
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-3">
        <OrderStatusSelector
          currentStatus={order.status}
          onStatusChange={(newStatus) => onUpdateStatus(order.id, newStatus)}
          disabled={order.status === 'Completed' || order.status === 'Cancelled'}
        />
        {(order.status === 'Completed' || order.status === 'Cancelled') && onDismiss && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDismiss(order.id)}
            className="text-xs"
          >
            Dismiss
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
