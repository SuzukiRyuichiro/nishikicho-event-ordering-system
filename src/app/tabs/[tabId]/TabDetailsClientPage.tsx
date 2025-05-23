"use client";

import { useState, useEffect } from "react";
import type { Tab, Order } from "@/lib/types";
import OrderListForTab from "@/app/components/tabs/OrderListForTab";
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
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

interface TabDetailsClientPageProps {
  tabId: string;
}

export default function TabDetailsClientPage({
  tabId,
}: TabDetailsClientPageProps) {
  const [tab, setTab] = useState<Tab | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const fetchTab = async () => {
      try {
        const tabRef = doc(db, "tabs", tabId);
        const tabSnap = await getDoc(tabRef);
        if (tabSnap.exists()) {
          const data = tabSnap.data();
          setTab({
            id: tabSnap.id,
            name: data.name,
            guestCount: data.guestCount,
            createdAt: data.createdAt,
          } as Tab);
        } else {
          setTab(null);
        }
      } catch (error) {
        setTab(null);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchOrdersForTab = async () => {
      const querySnapshot = await getDocs(
        collection(db, "tabs", tabId, "orders")
      );
      const ordersArr = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Order)
      );
      setOrders(ordersArr);
    };

    fetchTab();
    fetchOrdersForTab();
  }, [tabId]);

  const handleCreateOrder = (newOrder: Order) => {};

  const handleUpdateOrderStatus = (orderId: string) => {
    toast({
      title: "Order Updated",
      description: `Order status changed to ${status}.`,
    });
    // Simulate updating this order in a shared state for KitchenDisplay
    const currentKitchenOrders: Order[] = JSON.parse(
      localStorage.getItem("MOCK_KITCHEN_ORDERS") || "[]"
    );
    const updatedKitchenOrders = currentKitchenOrders.map((o) =>
      o.id === orderId ? { ...o, status, updatedAt: Date.now() } : o
    );
  };

  if (isLoading) {
    return <div className="text-center py-10">読込中...</div>;
  }

  if (!tab) {
    return (
      <div className="text-center py-10">
        <p className="text-2xl font-semibold text-destructive">
          お客さん情報を見つけられませんでした
        </p>
        <p className="text-muted-foreground">
          "{tabId}"のお客さんは見つけられませんでした
        </p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/tabs">
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
          <Link href="/tabs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Link>
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            {tab.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground flex items-center gap-4">
            <span>Created on: {new Date(tab.createdAt).toLocaleString()}</span>
            {tab.guestCount && tab.guestCount > 0 && (
              <span className="flex items-center">
                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                {tab.guestCount} Guest{tab.guestCount !== 1 ? "s" : ""}
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
