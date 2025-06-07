"use client";

import { useState, useEffect } from "react";
import type { Customer, Order, MenuItem } from "@/lib/types";
import OrderListForCustomer from "@/app/components/customers/OrderListForCustomer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Users, JapaneseYen, CreditCard, CupSoda, Beer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, onSnapshot, updateDoc, writeBatch } from "firebase/firestore";

interface CustomerDetailsClientPageProps {
  customerId: string;
}

export default function CustomerDetailsClientPage({
  customerId,
}: CustomerDetailsClientPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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
            paid: data.paid || false,
            paidAt: data.paidAt,
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

    const fetchMenuItems = async () => {
      try {
        const menuSnapshot = await getDocs(collection(db, "menuItems"));
        const items = menuSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as MenuItem));
        console.log("Fetched menu items:", items.length, items);
        setMenuItems(items);

        if (items.length === 0) {
          console.warn("No menu items found. Visit the menu management page to initialize default items.");
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
        toast({
          title: "エラー",
          description: "メニューアイテムの取得に失敗しました。",
          variant: "destructive",
        });
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
    fetchMenuItems();

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

  const calculateTotalPrice = () => {
    if (!customer) return 0;

    // Event fee: 1000 yen per person
    const eventFee = (customer.guestCount || 1) * 1000;

    // If no menu items, still show event fee
    if (!menuItems.length) {
      console.warn("No menu items available for price calculation, showing event fee only");
      return eventFee;
    }

    // Drink prices from orders
    const drinkTotal = orders.reduce((total, order) => {
      if (order.status === "Cancelled") return total;

      return total + order.items.reduce((orderTotal, item) => {
        const menuItem = menuItems.find(m => m.id === item.itemId);
        const itemPrice = menuItem ? menuItem.price : 0;
        if (!menuItem) {
          console.warn(`Menu item not found for itemId: ${item.itemId}`);
        }
        return orderTotal + (itemPrice * item.quantity);
      }, 0);
    }, 0);

    console.log("Price calculation:", { eventFee, drinkTotal, total: eventFee + drinkTotal });
    return eventFee + drinkTotal;
  };

  const getPriceBreakdown = () => {
    if (!customer) return { eventFee: 0, alcoholicCount: 0, nonAlcoholicCount: 0, alcoholicTotal: 0, nonAlcoholicTotal: 0 };

    const eventFee = (customer.guestCount || 1) * 1000;
    let alcoholicCount = 0;
    let nonAlcoholicCount = 0;
    let alcoholicTotal = 0;
    let nonAlcoholicTotal = 0;

    orders.forEach(order => {
      if (order.status === "Cancelled") return;

      order.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.itemId);
        if (menuItem) {
          const itemTotal = menuItem.price * item.quantity;
          if (menuItem.type === "alcoholic") {
            alcoholicCount += item.quantity;
            alcoholicTotal += itemTotal;
          } else {
            nonAlcoholicCount += item.quantity;
            nonAlcoholicTotal += itemTotal;
          }
        }
      });
    });

    return { eventFee, alcoholicCount, nonAlcoholicCount, alcoholicTotal, nonAlcoholicTotal };
  };

  const handleMarkAsPaid = async () => {
    if (!customer) return;

    try {
      const batch = writeBatch(db);

      // Update customer payment status
      const customerRef = doc(db, "customers", customerId);
      batch.update(customerRef, {
        paid: true,
        paidAt: Date.now(),
      });

      // Update all orders to mark customer as paid
      const ordersRef = collection(db, "customers", customerId, "orders");
      const ordersSnapshot = await getDocs(ordersRef);
      ordersSnapshot.docs.forEach(orderDoc => {
        batch.update(orderDoc.ref, { customerPaid: true });
      });

      await batch.commit();

      setCustomer({
        ...customer,
        paid: true,
        paidAt: Date.now(),
      });

      toast({
        title: "支払い完了",
        description: `${customer.name}様の支払いを完了しました。`,
      });
    } catch (error) {
      console.error("Error marking customer as paid:", error);
      toast({
        title: "エラー",
        description: "支払い処理に失敗しました。",
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
          <div className="flex justify-between items-start">
            <div>
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
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary flex items-center justify-end">
                <JapaneseYen className="mr-1 h-6 w-6" />
                {calculateTotalPrice().toLocaleString()}円
              </div>
              <div className="text-sm text-muted-foreground mb-2">合計金額</div>

              {/* Price breakdown */}
              <div className="text-xs text-muted-foreground space-y-1 mb-2">
                {(() => {
                  const breakdown = getPriceBreakdown();
                  return (
                    <>
                      <div className="flex items-center justify-end gap-1">
                        <Users className="h-3 w-3" />
                        <span>{customer.guestCount || 1}人</span>
                        <span>×</span>
                        <span>¥1,000</span>
                        <span>=</span>
                        <span>¥{breakdown.eventFee.toLocaleString()}</span>
                      </div>
                      {breakdown.alcoholicCount > 0 && (
                        <div className="flex items-center justify-end gap-1">
                          <Beer className="h-3 w-3" />
                          <span>{breakdown.alcoholicCount}杯</span>
                          <span>=</span>
                          <span>¥{breakdown.alcoholicTotal.toLocaleString()}</span>
                        </div>
                      )}
                      {breakdown.nonAlcoholicCount > 0 && (
                        <div className="flex items-center justify-end gap-1">
                          <CupSoda className="h-3 w-3" />
                          <span>{breakdown.nonAlcoholicCount}杯</span>
                          <span>=</span>
                          <span>¥{breakdown.nonAlcoholicTotal.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {customer.paid ? (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  ✓ 支払い済み
                  {customer.paidAt && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(customer.paidAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleMarkAsPaid}
                  className="mt-2"
                  size="sm"
                  variant="default"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  支払い完了
                </Button>
              )}
            </div>
          </div>
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
