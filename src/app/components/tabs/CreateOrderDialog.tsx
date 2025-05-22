
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Trash2, XCircle } from 'lucide-react';
import type { Order, OrderItem, MenuItem } from '@/lib/types';
import { DEFAULT_MENU_ITEMS, LOCAL_STORAGE_BEVERAGES_KEY } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CreateOrderDialogProps {
  tabId: string;
  tabName: string;
  onCreateOrder: (newOrder: Order) => void;
}

const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export default function CreateOrderDialog({ tabId, tabName, onCreateOrder }: CreateOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [availableBeverages, setAvailableBeverages] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      setCurrentOrderItems([]);
      // Load beverages from localStorage or use defaults
      const storedBeverages = localStorage.getItem(LOCAL_STORAGE_BEVERAGES_KEY);
      if (storedBeverages) {
        try {
          const parsedBeverages: MenuItem[] = JSON.parse(storedBeverages);
          if (parsedBeverages.length > 0) {
            setAvailableBeverages(parsedBeverages);
          } else {
            setAvailableBeverages(DEFAULT_MENU_ITEMS); // Fallback if stored is empty array
          }
        } catch (error) {
          console.error('Failed to parse stored beverages for order dialog:', error);
          setAvailableBeverages(DEFAULT_MENU_ITEMS); // Fallback on error
        }
      } else {
        setAvailableBeverages(DEFAULT_MENU_ITEMS); // Fallback if nothing in local storage
      }
    }
  }, [isOpen]);

  const handleBeverageClick = (beverage: MenuItem) => {
    setCurrentOrderItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.itemId === beverage.id);
      if (existingItemIndex > -1) {
        // Increment quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { 
          id: Date.now().toString() + Math.random().toString(), // temp client-side id for list
          itemId: beverage.id, 
          name: beverage.name, 
          quantity: 1 
        }];
      }
    });
  };

  const handleRemoveItem = (itemIdToRemove: string) => {
    setCurrentOrderItems(prevItems => {
        const itemIndex = prevItems.findIndex(item => item.itemId === itemIdToRemove);
        if (itemIndex === -1) return prevItems;

        const updatedItems = [...prevItems];
        if (updatedItems[itemIndex].quantity > 1) {
            updatedItems[itemIndex].quantity -=1;
            return updatedItems;
        } else {
            return updatedItems.filter(item => item.itemId !== itemIdToRemove);
        }
    });
  };

  const handleClearOrder = () => {
    setCurrentOrderItems([]);
  };

  const handleSubmit = () => {
    if (currentOrderItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item to the order.',
        variant: 'destructive',
      });
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString(), // Mock ID
      tabId,
      tabName,
      items: currentOrderItems.map(item => ({ // Ensure no extra fields are passed
        id: item.id, // This is a temp client-side ID, server should generate real one
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
      })),
      status: 'Pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onCreateOrder(newOrder);
    toast({
      title: 'Success',
      description: `Order created for ${tabName}.`,
    });
    setIsOpen(false);
  };

  const totalItemsInOrder = useMemo(() => {
    return currentOrderItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [currentOrderItems]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <ShoppingCart className="mr-2 h-4 w-4" /> Create New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Order for Tab: {tabName}</DialogTitle>
          <DialogDescription>
            Click on beverages to add them to the order. Current status will be 'Pending'.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-4 flex-grow overflow-hidden py-4">
          {/* Beverage Grid */}
          <div className="md:w-2/3 flex-shrink-0">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Available Beverages</h3>
            <ScrollArea className="h-64 md:h-full pr-3 border rounded-md">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-2">
                {availableBeverages.map((beverage) => (
                  <Button
                    key={beverage.id}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center justify-center text-center break-words whitespace-normal shadow-sm hover:shadow-md"
                    onClick={() => handleBeverageClick(beverage)}
                  >
                    <span className="text-sm font-medium">{beverage.name}</span>
                    <span className="text-xs text-muted-foreground">{beverage.category}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Current Order Summary */}
          <div className="md:w-1/3 flex flex-col border rounded-md p-3 bg-muted/30 shadow-inner">
            <h3 className="text-sm font-medium mb-2 flex justify-between items-center text-muted-foreground">
              <span>Current Order</span>
              {totalItemsInOrder > 0 && <Badge variant="secondary">{totalItemsInOrder} item(s)</Badge>}
            </h3>
            <ScrollArea className="flex-grow h-48 md:h-auto">
              {currentOrderItems.length === 0 ? (
                <p className="text-xs text-center text-muted-foreground py-4">No items added yet.</p>
              ) : (
                <ul className="space-y-1 text-xs">
                  {currentOrderItems.map(item => (
                    <li key={item.itemId} className="flex justify-between items-center p-1.5 bg-background rounded">
                      <span>{item.name} x {item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveItem(item.itemId)}>
                        <XCircle className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
            {currentOrderItems.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearOrder} className="mt-3 w-full text-xs">
                <Trash2 className="mr-1 h-3 w-3" /> Clear All Items
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleSubmit} disabled={currentOrderItems.length === 0}>
            Create Order ({totalItemsInOrder})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
