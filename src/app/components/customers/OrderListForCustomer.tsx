"use client";

import type { Order } from "@/lib/types"; // Guest type import removed
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
// Avatar and UserCircle imports might be removed if no longer used for guest display
import OrderStatusBadge from "@/app/components/shared/OrderStatusBadge";
import OrderItemDisplay from "@/app/components/shared/OrderItemDisplay";
import CreateOrderDialog from "./CreateOrderDialog";
import { ShoppingBag, Clock, CheckCircle, UserCircle } from "lucide-react"; // UserCircle kept for "Order for Tab"
import { Button } from "@/components/ui/button";

interface OrderListForCustomerProps {
  customerId: string;
  customerName: string;
  orders: Order[];
  // guests prop removed
  onCreateOrder: (newOrder: Order) => void;
  onUpdateOrderStatus: (orderId: string, done: boolean) => void;
}

export default function OrderListForCustomer({
  customerId,
  customerName,
  orders,
  onCreateOrder,
  onUpdateOrderStatus,
}: OrderListForCustomerProps) {
  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5 text-primary" /> Orders
          </CardTitle>
          <CardDescription>Manage orders for this customer.</CardDescription>
        </div>
        <CreateOrderDialog
          customerId={customerId}
          customerName={customerName}
          onCreateOrder={onCreateOrder}
        />
      </CardHeader>
      <CardContent>
        {sortedOrders.length > 0 ? (
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <Card key={order.id} className="bg-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <OrderStatusBadge status={order.done} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-2">
                  <div className="pl-2 border-l-2 border-border ml-2">
                    {order.items.map((item) => (
                      <OrderItemDisplay key={item.id} item={item} />
                    ))}
                  </div>
                </CardContent>
                {!order.done && (
                  <CardFooter className="pt-0 pb-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateOrderStatus(order.id, true)}
                      className="text-xs"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" /> 完了にする
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No orders placed for this customer yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
