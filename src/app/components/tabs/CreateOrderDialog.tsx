
'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, ShoppingCart } from 'lucide-react'; // User icon removed
import type { Order, OrderItem } from '@/lib/types'; // Guest type import removed
import { MENU_ITEMS } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
// cn import removed as it's not used

interface CreateOrderDialogProps {
  tabId: string;
  tabName: string;
  // guests prop removed
  onCreateOrder: (newOrder: Order) => void;
}

interface NewOrderItem extends Partial<OrderItem> {
  tempId: string; // For list key
  itemId?: string;
  quantity?: number;
  notes?: string;
}

export default function CreateOrderDialog({ tabId, tabName, onCreateOrder }: CreateOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  // selectedGuestId state removed
  const [orderItems, setOrderItems] = useState<NewOrderItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      // setSelectedGuestId(undefined); // Removed
      setOrderItems([{ tempId: Date.now().toString(), quantity: 1 }]);
    }
  }, [isOpen]);

  const handleAddOrderItem = () => {
    setOrderItems([...orderItems, { tempId: Date.now().toString(), quantity: 1 }]);
  };

  const handleRemoveOrderItem = (tempId: string) => {
    setOrderItems(orderItems.filter(item => item.tempId !== tempId));
  };

  const handleOrderItemChange = (tempId: string, field: keyof Pick<OrderItem, 'quantity' | 'notes'>, value: any) => {
    setOrderItems(orderItems.map(item =>
      item.tempId === tempId ? { ...item, [field]: value } : item
    ));
  };
  
  const handleMenuItemSelect = (tempId: string, menuItemId: string) => {
    const selectedMenuItem = MENU_ITEMS.find(mi => mi.id === menuItemId);
    if (selectedMenuItem) {
      setOrderItems(orderItems.map(item =>
        item.tempId === tempId ? { ...item, itemId: menuItemId, name: selectedMenuItem.name } : item
      ));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalOrderItems = orderItems.filter(item => item.itemId && item.name && item.quantity && item.quantity > 0).map(item => ({
      id: Date.now().toString() + Math.random(), // Mock ID
      itemId: item.itemId!,
      name: item.name!,
      quantity: item.quantity!,
      notes: item.notes,
    }));

    if (finalOrderItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one valid item to the order.',
        variant: 'destructive',
      });
      return;
    }

    // const selectedGuest = guests.find(g => g.id === selectedGuestId); // Removed

    const newOrder: Order = {
      id: Date.now().toString(), // Mock ID
      tabId,
      tabName,
      // guestId and guestName removed
      items: finalOrderItems,
      status: 'Pending', // Default to Pending
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onCreateOrder(newOrder);
    toast({
      title: 'Success',
      description: `Order created successfully.`,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <ShoppingCart className="mr-2 h-4 w-4" /> Create New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Order for Tab: {tabName}</DialogTitle>
          <DialogDescription>
            Add items to the order. It will be marked as 'Pending'.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4 py-4">
          {/* Assign to Guest Select field removed */}

          <Label className="block text-sm font-medium">Order Items</Label>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {orderItems.map((item, index) => (
              <div key={item.tempId} className="p-3 border rounded-md bg-muted/30 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-muted-foreground">Item #{index + 1}</p>
                  {orderItems.length > 1 && (
                     <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveOrderItem(item.tempId)}>
                       <Trash2 className="h-4 w-4 text-destructive" />
                     </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`item-name-${item.tempId}`} className="text-xs">Item</Label>
                    <Select
                      value={item.itemId}
                      onValueChange={(value) => handleMenuItemSelect(item.tempId, value)}
                    >
                      <SelectTrigger id={`item-name-${item.tempId}`}>
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {MENU_ITEMS.map(menuItem => (
                          <SelectItem key={menuItem.id} value={menuItem.id}>{menuItem.name} ({menuItem.category})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`item-quantity-${item.tempId}`} className="text-xs">Quantity</Label>
                    <Input
                      id={`item-quantity-${item.tempId}`}
                      type="number"
                      min="1"
                      value={item.quantity ?? 1}
                      onChange={(e) => handleOrderItemChange(item.tempId, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`item-notes-${item.tempId}`} className="text-xs">Notes (Optional)</Label>
                  <Textarea
                    id={`item-notes-${item.tempId}`}
                    value={item.notes ?? ''}
                    onChange={(e) => handleOrderItemChange(item.tempId, 'notes', e.target.value)}
                    placeholder="e.g., No onions, extra ice"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAddOrderItem} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Another Item
          </Button>
        </form>
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" formNoValidate onClick={handleSubmit}>Create Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
