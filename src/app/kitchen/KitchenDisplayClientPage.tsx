
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import KitchenOrderCard from '@/app/components/kitchen/KitchenOrderCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data updated for simpler statuses
const MOCK_INITIAL_ORDERS: Order[] = [
   { 
    id: 'ko1', tabId: '1', tabName: 'Table 101', guestId: 'g1', guestName: 'Alice W.', 
    items: [{ id: 'koi1', itemId:'beer-lager', name: 'Lager', quantity: 2 }, {id: 'koi2', itemId:'food-fries', name: 'Fries', quantity: 1, notes: 'Extra crispy'}], 
    status: 'Pending', createdAt: Date.now() - 300000, updatedAt: Date.now() - 300000
  },
  { 
    id: 'ko2', tabId: '1', tabName: 'Table 101', guestId: 'g2', guestName: 'Bob B.', 
    items: [{ id: 'koi3', itemId:'wine-red-merlot', name: 'Merlot', quantity: 1 }, {id: 'koi4', itemId:'food-burger', name: 'Burger', quantity: 1, notes: 'Well done'}], 
    status: 'Pending', createdAt: Date.now() - 180000, updatedAt: Date.now() - 60000 
  },
  { 
    id: 'ko3', tabId: '2', tabName: 'Bar Area', guestName: 'Charlie C.', guestId: 'g3',
    items: [{ id: 'koi5', itemId:'spirit-gin', name: 'Gin & Tonic', quantity: 1, notes: "Double lime" }], 
    status: 'Pending', createdAt: Date.now() - 120000, updatedAt: Date.now() - 10000
  },
   { 
    id: 'ko4', tabId: '3', tabName: 'VIP Lounge',
    items: [{ id: 'koi6', itemId:'soft-coke', name: 'Coke', quantity: 4}], 
    status: 'Pending', createdAt: Date.now() - 60000, updatedAt: Date.now() - 60000
  },
   { 
    id: 'ko5', tabId: '2', tabName: 'Bar Area',
    items: [{ id: 'koi7', itemId:'beer-ipa', name: 'IPA', quantity: 1}], 
    status: 'Completed', createdAt: Date.now() - 90000, updatedAt: Date.now() - 5000 // This one is completed
  },
   { 
    id: 'ko6', tabId: '1', tabName: 'Table 101', guestName: 'David D.', guestId: 'g4',
    items: [{ id: 'koi8', itemId:'food-burger', name: 'Burger', quantity: 2, notes: "No pickles"}, { id: 'koi9', itemId:'soft-juice-apple', name: 'Apple Juice', quantity: 1}], 
    status: 'Completed', createdAt: Date.now() - 600000, updatedAt: Date.now() - 300000 
  },
];

export default function KitchenDisplayClientPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_INITIAL_ORDERS);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLastUpdated(new Date());
    // Simulate fetching new orders periodically or via websocket
    const interval = setInterval(() => {
      console.log("Simulating order refresh for kitchen display");
      setLastUpdated(new Date());
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'Completed') {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: 'Completed', updatedAt: Date.now() } : order
        )
      );
      toast({
        title: "Order Completed",
        description: `Order ${orderId.slice(-4)} marked as Completed.`,
      });
    }
  };
  
  const handleDismissOrder = (orderId: string) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
     toast({
      title: "Order Dismissed",
      description: `Order ${orderId.slice(-4)} removed from view.`,
    });
  };

  const handleRefresh = () => {
    toast({ title: "Refreshing orders...", description: "Fetching latest data." });
    setLastUpdated(new Date());
    // In a real app: call API to get fresh orders
    // For now, we can re-filter the existing mock orders to simulate a refresh
    // This is mostly for visual feedback of the lastUpdated time
  }

  const pendingOrdersSorted = useMemo(() => {
    return orders
      .filter(order => order.status === 'Pending')
      .sort((a, b) => a.createdAt - b.createdAt); // Oldest first
  }, [orders]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
        <h1 className="text-3xl font-bold text-primary">Kitchen Display (Pending Orders)</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="h-9 text-xs">
            <RefreshCw className="mr-2 h-3 w-3" /> Refresh
          </Button>
        </div>
      </div>
      {lastUpdated && <p className="text-xs text-muted-foreground text-right -mt-4">Last updated: {lastUpdated.toLocaleTimeString()}</p>}

      {pendingOrdersSorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pendingOrdersSorted.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              onDismiss={handleDismissOrder} // Pass dismiss for completed items handled by KitchenOrderCard
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 rounded-lg border border-dashed">
          <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">No pending orders.</p>
          <p className="text-sm text-muted-foreground">
            All caught up! Or, wait for new orders to come in.
          </p>
        </div>
      )}
    </div>
  );
}
