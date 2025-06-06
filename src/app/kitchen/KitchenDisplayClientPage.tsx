
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, collectionGroup, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/types';
import KitchenOrderCard from '@/app/components/kitchen/KitchenOrderCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CircleCheck } from 'lucide-react'

// Real-time orders are now fetched from Firestore

export default function KitchenDisplayClientPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date());

    // Set up real-time listener for all orders across all customers
    const unsubscribe = onSnapshot(
      collectionGroup(db, 'orders'),
      (snapshot) => {
        const ordersArr = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Order)
        );
        // Sort by creation time, newest first
        ordersArr.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(ordersArr);
        setLastUpdated(new Date());
      },
      (error) => {
        console.error("Error fetching orders:", error);
        toast({
          title: "エラー",
          description: "注文の取得に失敗しました。",
          variant: "destructive",
        });
      }
    );

    return () => unsubscribe();
  }, [toast]);


  const handleUpdateStatus = async (orderId: string, newStatus: string | undefined) => {
    if (newStatus === 'Completed') {
      try {
        // Find the order to get its customer reference
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const orderRef = doc(db, "customers", order.customerId, "orders", orderId);
          await updateDoc(orderRef, {
            done: true,
            status: 'Completed',
            updatedAt: Date.now(),
          });

          toast({
            title: "注文完了",
            description: `${order.customerName}の注文を完了にしました。`,
          });
        }
      } catch (error) {
        console.error("Error updating order status:", error);
        toast({
          title: "エラー",
          description: "注文ステータスの更新に失敗しました。",
          variant: "destructive",
        });
      }
    }
  };

  const handleDismissOrder = (orderId: string) => {
    // For kitchen display, we just hide completed orders locally
    // They remain in Firestore but are filtered out from view
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    toast({
      title: "注文を非表示",
      description: `完了した注文を画面から削除しました。`,
    });
  };

  const handleRefresh = () => {
    toast({ title: "注文を更新中...", description: "最新データを取得しています。" });
    setLastUpdated(new Date());
    // Real-time listener will automatically update the data
  };

  const pendingOrdersSorted = useMemo(() => {
    return orders
      .filter(order => !order.done)
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
