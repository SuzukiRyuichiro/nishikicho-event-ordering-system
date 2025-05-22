'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import KitchenOrderCard from '@/app/components/kitchen/KitchenOrderCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, ArrowDownUp, ListFilter, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from an API and potentially websockets for real-time updates
const MOCK_INITIAL_ORDERS: Order[] = [
   { 
    id: 'ko1', tabId: '1', tabName: 'Table 101', guestId: 'g1', guestName: 'Alice W.', 
    items: [{ id: 'koi1', itemId:'beer-lager', name: 'Lager', quantity: 2 }, {id: 'koi2', itemId:'food-fries', name: 'Fries', quantity: 1, notes: 'Extra crispy'}], 
    status: 'Pending', createdAt: Date.now() - 300000, updatedAt: Date.now() - 300000
  },
  { 
    id: 'ko2', tabId: '1', tabName: 'Table 101', guestId: 'g2', guestName: 'Bob B.', 
    items: [{ id: 'koi3', itemId:'wine-red-merlot', name: 'Merlot', quantity: 1 }, {id: 'koi4', itemId:'food-burger', name: 'Burger', quantity: 1, notes: 'Well done'}], 
    status: 'Preparing', createdAt: Date.now() - 180000, updatedAt: Date.now() - 60000 
  },
  { 
    id: 'ko3', tabId: '2', tabName: 'Bar Area', guestName: 'Charlie C.', guestId: 'g3',
    items: [{ id: 'koi5', itemId:'spirit-gin', name: 'Gin & Tonic', quantity: 1, notes: "Double lime" }], 
    status: 'Ready', createdAt: Date.now() - 120000, updatedAt: Date.now() - 10000
  },
   { 
    id: 'ko4', tabId: '3', tabName: 'VIP Lounge',
    items: [{ id: 'koi6', itemId:'soft-coke', name: 'Coke', quantity: 4}], 
    status: 'Pending', createdAt: Date.now() - 60000, updatedAt: Date.now() - 60000
  },
   { 
    id: 'ko5', tabId: '2', tabName: 'Bar Area',
    items: [{ id: 'koi7', itemId:'beer-ipa', name: 'IPA', quantity: 1}], 
    status: 'Served', createdAt: Date.now() - 90000, updatedAt: Date.now() - 5000
  },
   { 
    id: 'ko6', tabId: '1', tabName: 'Table 101', guestName: 'David D.', guestId: 'g4',
    items: [{ id: 'koi8', itemId:'food-burger', name: 'Burger', quantity: 2, notes: "No pickles"}, { id: 'koi9', itemId:'soft-juice-apple', name: 'Apple Juice', quantity: 1}], 
    status: 'Completed', createdAt: Date.now() - 600000, updatedAt: Date.now() - 300000 
  },
];

type SortOption = 'time_asc' | 'time_desc' | 'tab_name';
type FilterOption = 'all_active' | 'pending' | 'preparing' | 'ready' | 'served';

export default function KitchenDisplayClientPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_INITIAL_ORDERS);
  const [sortOption, setSortOption] = useState<SortOption>('time_asc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all_active');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLastUpdated(new Date());
    // Simulate fetching new orders periodically or via websocket
    const interval = setInterval(() => {
      // In a real app, fetch orders here
      // For mock, maybe add a new order or update status
      console.log("Simulating order refresh for kitchen display");
      setLastUpdated(new Date());
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus, updatedAt: Date.now() } : order
      )
    );
    toast({
      title: "Order Status Updated",
      description: `Order ${orderId.slice(-4)} changed to ${newStatus}.`,
    });
  };
  
  const handleDismissOrder = (orderId: string) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
     toast({
      title: "Order Dismissed",
      description: `Order ${orderId.slice(-4)} removed from view.`,
    });
  };

  const handleRefresh = () => {
    // Simulate fetching fresh data
    toast({ title: "Refreshing orders...", description: "Fetching latest data." });
    setLastUpdated(new Date());
    // In a real app: call API to get fresh orders
  }

  const filteredAndSortedOrders = useMemo(() => {
    let processedOrders = [...orders];

    // Filter
    if (filterOption !== 'all_active') {
      processedOrders = processedOrders.filter(order => order.status.toLowerCase() === filterOption);
    } else {
      // 'all_active' means not Completed or Cancelled
      processedOrders = processedOrders.filter(order => order.status !== 'Completed' && order.status !== 'Cancelled');
    }
    
    // Sort
    switch (sortOption) {
      case 'time_asc':
        processedOrders.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'time_desc':
        processedOrders.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'tab_name':
        processedOrders.sort((a, b) => a.tabName.localeCompare(b.tabName) || (a.createdAt - b.createdAt));
        break;
    }
    return processedOrders;
  }, [orders, sortOption, filterOption]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
        <h1 className="text-3xl font-bold text-primary">Kitchen Display</h1>
        <div className="flex flex-wrap items-center gap-2">
           <Select value={filterOption} onValueChange={(value) => setFilterOption(value as FilterOption)}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
              <ListFilter className="h-3 w-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_active" className="text-xs">All Active</SelectItem>
              <SelectItem value="pending" className="text-xs">Pending</SelectItem>
              <SelectItem value="preparing" className="text-xs">Preparing</SelectItem>
              <SelectItem value="ready" className="text-xs">Ready</SelectItem>
              <SelectItem value="served" className="text-xs">Served</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs">
              <ArrowDownUp className="h-3 w-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time_asc" className="text-xs">Oldest First</SelectItem>
              <SelectItem value="time_desc" className="text-xs">Newest First</SelectItem>
              <SelectItem value="tab_name" className="text-xs">By Tab Name</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="h-9 text-xs">
            <RefreshCw className="mr-2 h-3 w-3" /> Refresh
          </Button>
        </div>
      </div>
      {lastUpdated && <p className="text-xs text-muted-foreground text-right -mt-4">Last updated: {lastUpdated.toLocaleTimeString()}</p>}

      {filteredAndSortedOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedOrders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              onDismiss={handleDismissOrder}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 rounded-lg border border-dashed">
          <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">No orders match your current filters.</p>
          <p className="text-sm text-muted-foreground">
            {filterOption === 'all_active' ? "All active orders are clear!" : "Try a different filter or wait for new orders."}
          </p>
        </div>
      )}
    </div>
  );
}
