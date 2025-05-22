
'use client';

import { useState, useEffect } from 'react';
import type { Tab, Guest, Order } from '@/lib/types';
import GuestList from '@/app/components/tabs/GuestList';
import OrderListForTab from '@/app/components/tabs/OrderListForTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from an API based on tabId
const MOCK_TABS: Tab[] = [
  { id: '1', name: 'Table 101', createdAt: new Date('2024-07-20T10:00:00Z').getTime() },
  { id: '2', name: 'Bar Area', createdAt: new Date('2024-07-20T10:05:00Z').getTime() },
  { id: '3', name: 'VIP Lounge', createdAt: new Date('2024-07-20T10:10:00Z').getTime() },
];

const MOCK_GUESTS: Guest[] = [
  { id: 'g1', name: 'Alice Wonderland', tabId: '1' },
  { id: 'g2', name: 'Bob The Builder', tabId: '1' },
  { id: 'g3', name: 'Charlie Chaplin', tabId: '2' },
];

const MOCK_ORDERS: Order[] = [
  { 
    id: 'o1', tabId: '1', tabName: 'Table 101', guestId: 'g1', guestName: 'Alice Wonderland', 
    items: [{ id: 'oi1', itemId:'beer-lager', name: 'Lager Beer', quantity: 2 }, {id: 'oi2', itemId:'food-fries', name: 'Fries', quantity: 1}], 
    status: 'Pending', createdAt: Date.now() - 100000, updatedAt: Date.now() - 100000 
  },
  { 
    id: 'o2', tabId: '1', tabName: 'Table 101', guestId: 'g2', guestName: 'Bob The Builder', 
    items: [{ id: 'oi3', itemId:'wine-red- Merlot', name: 'Merlot', quantity: 1 }], 
    status: 'Pending', createdAt: Date.now() - 50000, updatedAt: Date.now() - 50000
  },
  { 
    id: 'o3', tabId: '2', tabName: 'Bar Area', guestName: 'Charlie Chaplin', guestId: 'g3',
    items: [{ id: 'oi4', itemId:'spirit-gin', name: 'Gin & Tonic', quantity: 1, notes: "Double" }], 
    status: 'Completed', createdAt: Date.now() - 20000, updatedAt: Date.now() - 10000 // Example of a completed order
  },
];

interface TabDetailsClientPageProps {
  tabId: string;
}

export default function TabDetailsClientPage({ tabId }: TabDetailsClientPageProps) {
  const [tab, setTab] = useState<Tab | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      const foundTab = MOCK_TABS.find(t => t.id === tabId);
      if (foundTab) {
        setTab(foundTab);
        setGuests(MOCK_GUESTS.filter(g => g.tabId === tabId));
        setOrders(MOCK_ORDERS.filter(o => o.tabId === tabId));
      }
      setIsLoading(false);
    }, 500);
  }, [tabId]);

  const handleAddGuest = (newGuest: Guest) => {
    setGuests(prev => [...prev, newGuest]);
  };

  const handleCreateOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    // With simplified statuses, this will likely always be setting to 'Completed'
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status, updatedAt: Date.now() } : order
      )
    );
    toast({
      title: "Order Updated",
      description: `Order status changed to ${status}.`
    });
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
        {/* Future actions like Edit/Delete Tab can go here */}
        {/* 
        <div className="flex gap-2">
          <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
          <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
        </div> 
        */}
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">{tab.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Created on: {new Date(tab.createdAt).toLocaleString()}
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <GuestList tabId={tab.id} guests={guests} onAddGuest={handleAddGuest} />
        </div>
        <div className="lg:col-span-2">
          <OrderListForTab 
            tabId={tab.id} 
            tabName={tab.name}
            orders={orders} 
            guests={guests} 
            onCreateOrder={handleCreateOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </div>
      </div>
    </div>
  );
}
