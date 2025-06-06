"use client";

import { useState, useEffect } from "react";
import type { Customer, Order } from "@/lib/types";
import OrderListForCustomer from "@/app/components/customers/OrderListForCustomer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, onSnapshot, updateDoc } from "firebase/firestore";

interface CustomerDetailsClientPageProps {
  customerId: string;
}

export default function CustomerDetailsClientPage({
  customerId,
}: CustomerDetailsClientPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const fetchCustomer = async () => {
      try {
        const customerRef = doc(db, "customers", customerId);
        const customerSnap = await getDoc(customerRef);
        if (customerSnap.exists()) {
          const data = customerSnap.data();
          setCustomer({
            id: customerSnap.id,
            name: data.name,
            guestCount: data.guestCount,
            createdAt: data.createdAt,
          } as Customer);
        } else {
          setCustomer(null);
        }
      } catch (error) {
        setCustomer(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up real-time listener for orders
    const unsubscribeOrders = onSnapshot(
      collection(db, "customers", customerId, "orders"),
      (snapshot) => {
        const ordersArr = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Order)
        );
        // Sort by creation time, newest first
        ordersArr.sort((a, b) => b.createdAt - a.createdAt);
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

    fetchCustomer();

    // Cleanup listener on unmount
    return () => unsubscribeOrders();
  }, [customerId]);

  const handleCreateOrder = (newOrder: Order) => {
    // Order is already saved to Firestore in CreateOrderDialog
    // Real-time listener will automatically update the UI
    console.log("Order created:", newOrder);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "customers", customerId, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Date.now(),
      });

      toast({
        title: "注文ステータスを更新しました",
        description: newStatus === "Completed" ? "注文を完了にしました。" : `注文を${newStatus}にしました。`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "エラー",
        description: "注文ステータスの更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">読込中...</div>;
  }

  if (!customer) {
    return (
      <div className="text-center py-10">
        <p className="text-2xl font-semibold text-destructive">
          お客さん情報を見つけられませんでした
        </p>
        <p className="text-muted-foreground">
          "{customerId}"のお客さんは見つけられませんでした
        </p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button asChild variant="outline" size="sm">
          <Link href="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Link>
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            {customer.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground flex items-center gap-4">
            <span>来場時間: {new Date(customer.createdAt).toLocaleTimeString()}</span>
            {customer.guestCount && customer.guestCount > 0 && (
              <span className="flex items-center">
                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                {customer.guestCount}人
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-6">
        <OrderListForCustomer
          customerId={customer.id}
          customerName={customer.name}
          orders={orders}
          onCreateOrder={handleCreateOrder}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      </div>
    </div>
  );
}
