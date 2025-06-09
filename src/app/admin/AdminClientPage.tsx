'use client';

import { useState, useEffect } from 'react';
import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, limit, where, collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Event, Customer, Order, DrinkBreakdown, MenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Users, Wine, DollarSign, Clock, CheckCircle, Plus, RotateCcw } from 'lucide-react';

export default function AdminClientPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [activeEventStats, setActiveEventStats] = useState({
    totalCustomers: 0,
    totalDrinks: 0,
    alcoholicDrinks: 0,
    nonAlcoholicDrinks: 0,
    participantRevenue: 0,
    drinkRevenue: 0,
    totalRevenue: 0,
    drinkBreakdown: {} as DrinkBreakdown,
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newEventName, setNewEventName] = useState('');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isCompletingEvent, setIsCompletingEvent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);

    // Listen to menu items
    const unsubscribeMenuItems = onSnapshot(
      collection(db, 'menuItems'),
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MenuItem));
        setMenuItems(items);
      },
      (error) => {
        console.error("Error fetching menu items:", error);
      }
    );

    // Listen to events
    const unsubscribeEvents = onSnapshot(
      query(collection(db, 'events'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const eventsArr = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Event));

        setEvents(eventsArr);

        // Find active event
        const active = eventsArr.find(event => event.status === 'active');
        setActiveEvent(active || null);
      },
      (error) => {
        console.error("Error fetching events:", error);
        toast({
          title: "エラー",
          description: "イベント情報の取得に失敗しました。",
          variant: "destructive",
        });
      }
    );

    return () => {
      unsubscribeEvents();
      unsubscribeMenuItems();
    };
  }, [toast]);

  // Real-time calculation for active event statistics
  useEffect(() => {
    if (!activeEvent) {
      setActiveEventStats({
        totalCustomers: 0,
        totalDrinks: 0,
        alcoholicDrinks: 0,
        nonAlcoholicDrinks: 0,
        participantRevenue: 0,
        drinkRevenue: 0,
        totalRevenue: 0,
        drinkBreakdown: {},
      });
      return;
    }

    // Listen to customers for this event
    const unsubscribeCustomers = onSnapshot(
      query(
        collection(db, 'customers'),
        where('eventId', '==', activeEvent.id)
      ),
      async (customersSnapshot) => {
        let totalCustomers = 0;
        let totalDrinks = 0;
        let alcoholicDrinks = 0;
        let nonAlcoholicDrinks = 0;
        let drinkRevenue = 0;
        const drinkBreakdown: DrinkBreakdown = {};

        // Calculate total customers (sum of guest counts)
        customersSnapshot.docs.forEach(customerDoc => {
          const customer = customerDoc.data() as Customer;
          totalCustomers += customer.guestCount || 1;
        });

        // Calculate participant revenue (1000 yen per person)
        const participantRevenue = totalCustomers * 1000;

        // Get all orders for this event by iterating through customers
        for (const customerDoc of customersSnapshot.docs) {
          const ordersQuery = query(
            collection(db, 'customers', customerDoc.id, 'orders'),
            where('eventId', '==', activeEvent.id)
          );
          const ordersSnapshot = await getDocs(ordersQuery);

          ordersSnapshot.docs.forEach(orderDoc => {
            const order = orderDoc.data() as Order;

            // Calculate drink breakdown and revenue
            order.items.forEach(item => {
              const menuItem = menuItems.find(m => m.id === item.itemId);
              const price = menuItem?.price || 500; // Fallback price
              const itemRevenue = item.quantity * price;

              // Count total drinks
              totalDrinks += item.quantity;

              // Count alcoholic vs non-alcoholic
              if (menuItem?.type === 'alcoholic') {
                alcoholicDrinks += item.quantity;
              } else {
                nonAlcoholicDrinks += item.quantity;
              }

              drinkRevenue += itemRevenue;

              if (drinkBreakdown[item.itemId]) {
                drinkBreakdown[item.itemId].quantity += item.quantity;
                drinkBreakdown[item.itemId].totalRevenue += itemRevenue;
              } else {
                drinkBreakdown[item.itemId] = {
                  itemName: item.name,
                  quantity: item.quantity,
                  totalRevenue: itemRevenue,
                };
              }
            });
          });
        }

        // Calculate total revenue (participants + drinks)
        const totalRevenue = participantRevenue + drinkRevenue;

        setActiveEventStats({
          totalCustomers,
          totalDrinks,
          alcoholicDrinks,
          nonAlcoholicDrinks,
          participantRevenue,
          drinkRevenue,
          totalRevenue,
          drinkBreakdown,
        });
      },
      (error) => {
        console.error("Error calculating real-time stats:", error);
      }
    );

    return () => unsubscribeCustomers();
  }, [activeEvent, menuItems]);

  const createNewEvent = async () => {
    if (!newEventName.trim()) {
      toast({
        title: "エラー",
        description: "イベント名を入力してください。",
        variant: "destructive",
      });
      return;
    }

    // Check if there's already an active event
    if (activeEvent) {
      toast({
        title: "エラー",
        description: "既にアクティブなイベントがあります。先に現在のイベントを完了してください。",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingEvent(true);

    try {
      await addDoc(collection(db, 'events'), {
        name: newEventName.trim(),
        startDate: Date.now(),
        status: 'active',
        totalCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        drinkBreakdown: {},
        createdAt: Date.now(),
      });

      setNewEventName('');
      toast({
        title: "成功",
        description: `新しいイベント「${newEventName.trim()}」を作成しました。`,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "エラー",
        description: "イベントの作成に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const completeActiveEvent = async () => {
    if (!activeEvent) {
      toast({
        title: "エラー",
        description: "完了するアクティブなイベントがありません。",
        variant: "destructive",
      });
      return;
    }

    setIsCompletingEvent(true);

    try {
      // Update event status with current real-time statistics
      await updateDoc(doc(db, 'events', activeEvent.id), {
        status: 'completed',
        endDate: Date.now(),
        completedAt: Date.now(),
        totalCustomers: activeEventStats.totalCustomers,
        totalOrders: activeEventStats.totalDrinks, // Use totalDrinks for backward compatibility
        totalRevenue: activeEventStats.totalRevenue,
        drinkBreakdown: activeEventStats.drinkBreakdown,
      });

      toast({
        title: "完了",
        description: `イベント「${activeEvent.name}」を完了しました。`,
      });
    } catch (error) {
      console.error("Error completing event:", error);
      toast({
        title: "エラー",
        description: "イベントの完了に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsCompletingEvent(false);
    }
  };


  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  if (!mounted) {
    return <div className="text-center py-10">管理画面を読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
        <h1 className="text-3xl font-bold text-primary">イベント管理</h1>
      </div>

      {/* Active Event Section */}
      {activeEvent ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              現在のイベント
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{activeEvent.name}</h3>
                <p className="text-muted-foreground">
                  開始: {formatDate(activeEvent.startDate)}
                </p>
              </div>
              <Badge variant="default">アクティブ</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{activeEventStats.totalCustomers}</div>
                <div className="text-sm text-muted-foreground">参加者数</div>
              </div>
              <div className="text-center">
                <Wine className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{activeEventStats.totalDrinks}</div>
                <div className="text-sm text-muted-foreground">
                  総ドリンク数
                  <div className="text-xs">
                    <span className="text-red-600">酒: {activeEventStats.alcoholicDrinks}</span> |
                    <span className="text-blue-600"> ノンアル: {activeEventStats.nonAlcoholicDrinks}</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{formatCurrency(activeEventStats.totalRevenue)}</div>
                <div className="text-sm text-muted-foreground">
                  総売上
                  <div className="text-xs">
                    参加費: {formatCurrency(activeEventStats.participantRevenue)}
                  </div>
                  <div className="text-xs">
                    ドリンク: {formatCurrency(activeEventStats.drinkRevenue)}
                  </div>
                </div>
              </div>
            </div>

            {/* Drink Breakdown */}
            {Object.keys(activeEventStats.drinkBreakdown).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">飲み物別売上</h4>
                <div className="grid gap-2">
                  {Object.entries(activeEventStats.drinkBreakdown).map(([itemId, breakdown]) => (
                    <div key={itemId} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{breakdown.itemName}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">{breakdown.quantity}杯</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(breakdown.totalRevenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={completeActiveEvent}
              disabled={isCompletingEvent}
              className="w-full"
              variant="destructive"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isCompletingEvent ? "完了中..." : "イベントを完了"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              新しいイベントを作成
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="イベント名 (例: 2025年2月 西錦町イベント)"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createNewEvent()}
            />
            <Button
              onClick={createNewEvent}
              disabled={isCreatingEvent || !newEventName.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCreatingEvent ? "作成中..." : "イベント作成"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Historical Events */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <RotateCcw className="h-6 w-6" />
          過去のイベント
        </h2>

        {events.filter(event => event.status === 'completed').length > 0 ? (
          <div className="grid gap-4">
            {events
              .filter(event => event.status === 'completed')
              .map((event) => (
                <Card key={event.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{event.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.startDate)} - {event.endDate && formatDate(event.endDate)}
                        </p>
                      </div>
                      <Badge variant="secondary">完了</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold">{event.totalCustomers}</div>
                        <div className="text-xs text-muted-foreground">参加者</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">{event.totalOrders}</div>
                        <div className="text-xs text-muted-foreground">ドリンク数</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">{formatCurrency(event.totalRevenue)}</div>
                        <div className="text-xs text-muted-foreground">総売上</div>
                      </div>
                    </div>

                    {/* Historical Event Drink Breakdown */}
                    {event.drinkBreakdown && Object.keys(event.drinkBreakdown).length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h5 className="text-sm font-semibold">飲み物別売上</h5>
                        <div className="grid gap-1">
                          {Object.entries(event.drinkBreakdown).map(([itemId, breakdown]) => (
                            <div key={itemId} className="flex justify-between items-center text-xs bg-background p-2 rounded">
                              <span>{breakdown.itemName}</span>
                              <div className="text-right">
                                <div className="font-bold">{breakdown.quantity}杯</div>
                                <div className="text-muted-foreground">
                                  {formatCurrency(breakdown.totalRevenue)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">過去のイベントはありません</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
