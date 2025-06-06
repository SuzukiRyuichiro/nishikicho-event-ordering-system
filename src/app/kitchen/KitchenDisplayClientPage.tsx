
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Order } from '@/lib/types';
import KitchenOrderCard from '@/app/components/kitchen/KitchenOrderCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CircleCheck } from 'lucide-react'

// Mock data updated for simpler statuses and no notes on items
const MOCK_INITIAL_ORDERS: Order[] = [
   {
    id: 'ko1', customerId: '1', customerName: 'Table 101',
    items: [{ id: 'koi1', itemId:'lager-beer', name: 'Lager Beer', quantity: 2 }, {id: 'koi2', itemId:'french-fries', name: 'French Fries', quantity: 1}],
    done: false, status: 'Pending', createdAt: Date.now() - 300000, updatedAt: Date.now() - 300000
  },
  {
    id: 'ko2', customerId: '1', customerName: 'Table 101',
    items: [{ id: 'koi3', itemId:'merlot-red-wine', name: 'Merlot (Red Wine)', quantity: 1 }, {id: 'koi4', itemId:'classic-burger', name: 'Classic Burger', quantity: 1}],
    done: false, status: 'Pending', createdAt: Date.now() - 180000, updatedAt: Date.now() - 60000
  },
  {
    id: 'ko3', customerId: '2', customerName: 'Bar Area',
    items: [{ id: 'koi5', itemId:'gin', name: 'Gin', quantity: 1 }],
    done: false, status: 'Pending', createdAt: Date.now() - 120000, updatedAt: Date.now() - 10000
  },
   {
    id: 'ko4', customerId: '3', customerName: 'VIP Lounge',
    items: [{ id: 'koi6', itemId:'coca-cola', name: 'Coca-Cola', quantity: 4}],
    done: false, status: 'Pending', createdAt: Date.now() - 60000, updatedAt: Date.now() - 60000
  },
   {
    id: 'ko5', customerId: '2', customerName: 'Bar Area',
    items: [{ id: 'koi7', itemId:'ipa-beer', name: 'IPA Beer', quantity: 1}],
    done: true, status: 'Completed', createdAt: Date.now() - 90000, updatedAt: Date.now() - 5000
  },
   {
    id: 'ko6', customerId: '1', customerName: 'Table 101',
    items: [{ id: 'koi8', itemId:'classic-burger', name: 'Classic Burger', quantity: 2}, { id: 'koi9', itemId:'apple-juice', name: 'Apple Juice', quantity: 1}],
    done: true, status: 'Completed', createdAt: Date.now() - 600000, updatedAt: Date.now() - 300000
  },
];

export default function KitchenDisplayClientPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_INITIAL_ORDERS);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date());
    // Simulate adding a new pending order occasionally for testing
    const addOrderInterval = setInterval(() => {
        const shouldAddNewOrder = Math.random() < 0.1; // 10% chance to add a new order
        if (shouldAddNewOrder) {
            const newMockOrder: Order = {
                id: `ko_new_${Date.now()}`,
                customerId: `${Math.floor(Math.random() * 3) + 1}`,
                customerName: `Random Customer ${Math.floor(Math.random() * 5) + 100}`,
                items: [{ id: `koi_new_${Date.now()}`, itemId: 'coca-cola', name: 'Coca-Cola', quantity: Math.floor(Math.random() * 2) + 1 }],
                done: false,
                status: 'Pending',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            setOrders(prevOrders => [newMockOrder, ...prevOrders]);
            toast({ title: "New Order Received!", description: `Order for ${newMockOrder.customerName} added.` });
        }
        setLastUpdated(new Date());
    }, 30000); // Check every 30 seconds
    return () => clearInterval(addOrderInterval);
  }, [toast]);


  const handleUpdateStatus = (orderId: string, newStatus: string | undefined) => {
    if (newStatus === 'Completed') {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: 'Completed', updatedAt: Date.now() } : order
        )
      );
      toast({
        title: "注文完了",
        description: `注文 ${orderId.slice(-6)} を完了にしました。`,
      });
    }
  };

  const handleDismissOrder = (orderId: string) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
     toast({
      title: "注文を非表示",
      description: `注文 ${orderId.slice(-6)} を画面から削除しました。`,
    });
  };

  const handleRefresh = () => {
    toast({ title: "注文を更新中...", description: "最新データを取得しています。" });
    setLastUpdated(new Date());
    // 実際のアプリではAPIを呼び出して最新の注文を取得します
  }

  const pendingOrdersSorted = useMemo(() => {
    return orders
      .filter(order => order.status === 'Pending')
      .sort((a, b) => a.createdAt - b.createdAt); // Oldest pending first
  }, [orders]);

  if (!mounted) {
    return <div className="text-center py-10">バー画面を読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
        <h1 className="text-3xl font-bold text-primary">バー</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="h-9 text-xs">
            <RefreshCw className="mr-2 h-3 w-3" /> 更新
          </Button>
        </div>
      </div>
      {lastUpdated && <p className="text-xs text-muted-foreground text-right -mt-4">最終更新: {lastUpdated.toLocaleTimeString()}</p>}

      {pendingOrdersSorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pendingOrdersSorted.map((order) => (
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
          <CircleCheck className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">未処理の注文はありません。</p>
          <p className="text-sm text-muted-foreground">
            すべて対応済みです！または新しい注文が入るまでお待ちください。
          </p>
        </div>
      )}
    </div>
  );
}
