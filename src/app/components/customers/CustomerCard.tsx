
import Link from 'next/link';
import type { Customer, Order } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ShoppingBag, ArrowRight, CalendarDays, Plus } from 'lucide-react';
import CreateOrderDialog from './CreateOrderDialog';

interface CustomerCardProps {
  customer: Customer;
  orderCount: number; // Keep order count as it might be derived elsewhere or from actual orders
  onCreateOrder?: (newOrder: Order) => void;
}

export default function CustomerCard({ customer, orderCount, onCreateOrder }: CustomerCardProps) {
  const guestCount = customer.guestCount ?? 0;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-primary text-xl">{customer.name}</CardTitle>
        <div className="text-xs text-muted-foreground flex items-center">
          <CalendarDays className="h-3 w-3 mr-1" />
          来場: {new Date(customer.createdAt).toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2 text-accent" />
            <span>{guestCount}人</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <ShoppingBag className="h-4 w-4 mr-2 text-accent" />
            <span>注文数: {orderCount}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" className="flex-1 group">
          <Link href={`/customers/${customer.id}`}>
            詳細を見る
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
        {onCreateOrder && (
          <CreateOrderDialog
            customerId={customer.id}
            customerName={customer.name}
            onCreateOrder={onCreateOrder}
            variant="icon"
          />
        )}
      </CardFooter>
    </Card>
  );
}
