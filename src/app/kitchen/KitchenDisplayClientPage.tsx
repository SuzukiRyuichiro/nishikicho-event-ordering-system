
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, collectionGroup, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/types';
import KitchenOrderCard from '@/app/components/kitchen/KitchenOrderCard';
import { XCircle, CircleCheck, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// Real-time orders are now fetched from Firestore

export default function KitchenDisplayClientPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [previousOrderCount, setPreviousOrderCount] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showServedOrders, setShowServedOrders] = useState(false);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Function to play notification sound
  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800 Hz tone
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  };

  useEffect(() => {
    setMounted(true);

    // Set up real-time listener for all orders across all customers
    const unsubscribe = onSnapshot(
      collectionGroup(db, 'orders'),
      (snapshot) => {
        const ordersArr = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Order)
        );
        // Sort by creation time, newest first
        ordersArr.sort((a, b) => b.createdAt - a.createdAt);
        
        // Filter pending orders for notification check
        const currentPendingOrders = ordersArr.filter(order => 
          order.status !== "Completed" && !order.customerPaid
        );
        
        // Play sound if there are new pending orders (only after initial load and when user is already on this page)
        if (mounted && !isInitialLoad && currentPendingOrders.length > previousOrderCount) {
          playNotificationSound();
          toast({
            title: "新しい注文",
            description: "新しい注文が入りました！",
          });
        }
        
        // Set initial load to false after first data load
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
        
        setPreviousOrderCount(currentPendingOrders.length);
        setOrders(ordersArr);
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
  }, [toast, mounted, previousOrderCount, isInitialLoad]);


  const handleUpdateStatus = async (orderId: string, newStatus: string | undefined) => {
    if (newStatus === 'Completed') {
      try {
        // Find the order to get its customer reference
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const orderRef = doc(db, "customers", order.customerId, "orders", orderId);
          await updateDoc(orderRef, {
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


  const filteredOrdersSorted = useMemo(() => {
    let filteredOrders = orders;
    
    if (!showServedOrders) {
      // Show only pending orders (original behavior)
      filteredOrders = orders.filter(order => order.status !== "Completed" && !order.customerPaid);
    } else {
      // Show all orders including served ones
      filteredOrders = orders.filter(order => !order.customerPaid);
    }
    
    return filteredOrders.sort((a, b) => {
      // Sort by status first (pending orders first), then by creation time
      if (a.status === "Completed" && b.status !== "Completed") return 1;
      if (a.status !== "Completed" && b.status === "Completed") return -1;
      return a.createdAt - b.createdAt; // Oldest first
    });
  }, [orders, showServedOrders]);

  if (!mounted) {
    return <div className="text-center py-10">バー画面を読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
        <h1 className="text-3xl font-bold text-primary">バー</h1>
        <Button
          variant={showServedOrders ? "default" : "outline"}
          onClick={() => setShowServedOrders(!showServedOrders)}
          className="flex items-center gap-2"
        >
          {showServedOrders ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showServedOrders ? "完了済みを非表示" : "完了済みを表示"}
        </Button>
      </div>

      {filteredOrdersSorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrdersSorted.map((order) => (
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
