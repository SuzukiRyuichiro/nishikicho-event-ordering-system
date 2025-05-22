'use client';

import { useState } from 'react';
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
import { UserPlus } from 'lucide-react';
import type { Guest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AddGuestDialogProps {
  tabId: string;
  onAddGuest: (newGuest: Guest) => void;
}

export default function AddGuestDialog({ tabId, onAddGuest }: AddGuestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast({
        title: 'Error',
        description: 'Guest name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    const newGuest: Guest = {
      id: Date.now().toString(), // Simple ID generation for mock
      name: guestName.trim(),
      tabId: tabId,
    };
    onAddGuest(newGuest);
    toast({
      title: 'Success',
      description: `Guest "${newGuest.name}" added to the tab.`,
    });
    setGuestName('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" /> Add Guest
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
            <DialogDescription>
              Enter the name of the guest to add to this tab.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guestName" className="text-right">
                Guest Name
              </Label>
              <Input
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., John Doe"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Add Guest</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
