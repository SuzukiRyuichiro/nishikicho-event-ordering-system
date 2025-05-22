'use client';

import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import OrderStatusBadge from '@/app/components/shared/OrderStatusBadge';
import OrderItemDisplay from '@/app/components/shared/OrderItemDisplay';
import CreateOrderDialog from './CreateOrderDialog';
import type { Guest } from '@/lib/types';
import { ShoppingBag, UserCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderListForTabProps {
  tabId: string;
  tabName: string;
  orders: Order[];
  guests: Guest[];
  onCreateOrder: (newOrder: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export default function OrderListForTab({ tabId, tabName, orders, guests, onCreateOrder, onUpdateOrderStatus }: OrderListForTabProps) {
  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5 text-primary" /> Orders
          </CardTitle>
          <CardDescription>Manage orders for this tab.</CardDescription>
        </div>
        <CreateOrderDialog tabId={tabId} tabName={tabName} guests={guests} onCreateOrder={onCreateOrder} />
      </CardHeader>
      <CardContent>
        {sortedOrders.length > 0 ? (
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <Card key={order.id} className="bg-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      {order.guestName ? (
                        <div className="flex items-center text-sm font-medium">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback>{order.guestName.substring(0,1)}</AvatarFallback>
                          </Avatar>
                          Order for {order.guestName}
                        </div>
                      ) : (
                        <div className="flex items-center text-sm font-medium">
                          <UserCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                          Order for Tab
                        </div>
                      )}
                       <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-2">
                  <div className="pl-2 border-l-2 border-border ml-2">
                    {order.items.map(item => (
                      <OrderItemDisplay key={item.id} item={item} />
                    ))}
                  </div>
                </CardContent>
                { (order.status === 'Ready' || order.status === 'Served') &&
                  <CardFooter className="pt-0 pb-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onUpdateOrderStatus(order.id, 'Completed')}
                      disabled={order.status === 'Completed'}
                      className="text-xs"
                    >
                      Mark as Completed
                    </Button>
                  </CardFooter>
                }
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No orders placed for this tab yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
