
'use client';

import { useState, useEffect } from 'react';
import type { Tab, Order } from '@/lib/types';
import OrderListForTab from '@/app/components/tabs/OrderListForTab';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from an API based on tabId
const MOCK_TABS: Tab[] = [
  { id: '1', name: 'John Doe', guestCount: 2, createdAt: new Date('2024-07-20T10:00:00Z').getTime() },
  { id: '2', name: 'Yasuda LLC', guestCount: 5, createdAt: new Date('2024-07-20T10:05:00Z').getTime() },
  { id: '3', name: 'VIP Guest', guestCount: 1, createdAt: new Date('2024-07-20T10:10:00Z').getTime() },
];

const MOCK_ORDERS: Order[] = [
  { 
    id: 'o1', tabId: '1', tabName: 'John Doe', 
    items: [{ id: 'oi1', itemId:'lager-beer', name: 'Lager Beer', quantity: 2 }, {id: 'oi2', itemId:'french-fries', name: 'French Fries', quantity: 1}], 
    status: 'Pending', createdAt: Date.now() - 100000, updatedAt: Date.now() - 100000 
  },
  { 
    id: 'o2', tabId: '1', tabName: 'John Doe', 
    items: [{ id: 'oi3', itemId:'merlot-red-wine', name: 'Merlot (Red Wine)', quantity: 1 }], 
    status: 'Pending', createdAt: Date.now() - 50000, updatedAt: Date.now() - 50000
  },
  { 
    id: 'o3', tabId: '2', tabName: 'Yasuda LLC',
    items: [{ id: 'oi4', itemId:'gin', name: 'Gin', quantity: 1 }], 
    status: 'Completed', createdAt: Date.now() - 20000, updatedAt: Date.now() - 10000
  },
];

interface TabDetailsClientPageProps {
  tabId: string;
}

export default function TabDetailsClientPage({ tabId }: TabDetailsClientPageProps) {
  const [tab, setTab] = useState<Tab | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const foundTab = MOCK_TABS.find(t => t.id === tabId);
      if (foundTab) {
        setTab(foundTab);
        setOrders(MOCK_ORDERS.filter(o => o.tabId === tabId));
      }
      setIsLoading(false);
    }, 300); // Reduced timeout for faster loading feel
  }, [tabId]);

  const handleCreateOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    // Simulate pushing this new order to a shared state or backend for KitchenDisplay
     const currentKitchenOrders = JSON.parse(localStorage.getItem('MOCK_KITCHEN_ORDERS') || '[]');
     localStorage.setItem('MOCK_KITCHEN_ORDERS', JSON.stringify([newOrder, ...currentKitchenOrders]));
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status, updatedAt: Date.now() } : order
      )
    );
    toast({
      title: "Order Updated",
      description: `Order status changed to ${status}.`
    });
    // Simulate updating this order in a shared state for KitchenDisplay
    const currentKitchenOrders: Order[] = JSON.parse(localStorage.getItem('MOCK_KITCHEN_ORDERS') || '[]');
    const updatedKitchenOrders = currentKitchenOrders.map(o => o.id === orderId ? {...o, status, updatedAt: Date.now()} : o);
    localStorage.setItem('MOCK_KITCHEN_ORDERS', JSON.stringify(updatedKitchenOrders));
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading tab details...</div>;
  }

  if (!tab) {
    return (
      <div className="text-center py-10">
        <p className="text-2xl font-semibold text-destructive">Tab Not Found</p>
        <p className="text-muted-foreground">The tab with ID "{tabId}" could not be found.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/tabs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tabs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button asChild variant="outline" size="sm">
          <Link href="/tabs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Tabs
          </Link>
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">{tab.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground flex items-center gap-4">
            <span>Created on: {new Date(tab.createdAt).toLocaleString()}</span>
            {tab.guestCount && tab.guestCount > 0 && (
              <span className="flex items-center">
                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                {tab.guestCount} Guest{tab.guestCount !== 1 ? 's' : ''}
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="mt-6">
        <OrderListForTab 
          tabId={tab.id} 
          tabName={tab.name}
          orders={orders} 
          onCreateOrder={handleCreateOrder}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      </div>
    </div>
  );
}

