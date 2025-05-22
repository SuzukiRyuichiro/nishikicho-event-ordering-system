
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
import { PlusCircle, Trash2, ShoppingCart, User } from 'lucide-react';
import type { Order, OrderItem, Guest } from '@/lib/types';
import { MENU_ITEMS } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CreateOrderDialogProps {
  tabId: string;
  tabName: string;
  guests: Guest[];
  onCreateOrder: (newOrder: Order) => void;
}

interface NewOrderItem extends Partial<OrderItem> {
  tempId: string; // For list key
  itemId?: string;
  quantity?: number;
  notes?: string;
}

export default function CreateOrderDialog({ tabId, tabName, guests, onCreateOrder }: CreateOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string | undefined>(undefined);
  const [orderItems, setOrderItems] = useState<NewOrderItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      setSelectedGuestId(undefined);
      setOrderItems([{ tempId: Date.now().toString(), quantity: 1 }]);
    }
  }, [isOpen]);

  const handleAddOrderItem = () => {
    setOrderItems([...orderItems, { tempId: Date.now().toString(), quantity: 1 }]);
  };

  const handleRemoveOrderItem = (tempId: string) => {
    setOrderItems(orderItems.filter(item => item.tempId !== tempId));
  };

  const handleOrderItemChange = (tempId: string, field: keyof OrderItem, value: any) => {
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

    const selectedGuest = guests.find(g => g.id === selectedGuestId);

    const newOrder: Order = {
      id: Date.now().toString(), // Mock ID
      tabId,
      tabName,
      guestId: selectedGuestId,
      guestName: selectedGuest?.name,
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
            Select items and assign to a guest (optional). Order will be 'Pending'.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4 py-4">
          <div>
            <Label htmlFor="guest" className="flex items-center mb-1">
              <User className="mr-2 h-4 w-4 text-muted-foreground" /> Assign to Guest (Optional)
            </Label>
            <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>
              <SelectTrigger id="guest">
                <SelectValue placeholder="Select a guest or leave for tab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="for_tab">For the Tab (General)</SelectItem>
                {guests.map(guest => (
                  <SelectItem key={guest.id} value={guest.id}>{guest.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
