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
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

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

    const fetchOrdersForCustomer = async () => {
      const querySnapshot = await getDocs(
        collection(db, "customers", customerId, "orders")
      );
      const ordersArr = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Order)
      );
      setOrders(ordersArr);
    };

    fetchCustomer();
    fetchOrdersForCustomer();
  }, [customerId]);

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
            <span>Created on: {new Date(customer.createdAt).toLocaleString()}</span>
            {customer.guestCount && customer.guestCount > 0 && (
              <span className="flex items-center">
                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                {customer.guestCount} Guest{customer.guestCount !== 1 ? "s" : ""}
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
