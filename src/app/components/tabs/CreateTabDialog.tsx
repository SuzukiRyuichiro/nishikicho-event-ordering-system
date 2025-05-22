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
import { PlusCircle } from 'lucide-react';
import type { Tab } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CreateTabDialogProps {
  onCreateTab: (newTab: Tab) => void;
}

export default function CreateTabDialog({ onCreateTab }: CreateTabDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tabName, setTabName] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tabName.trim()) {
      toast({
        title: 'Error',
        description: 'Tab name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    const newTab: Tab = {
      id: Date.now().toString(), // Simple ID generation for mock
      name: tabName.trim(),
      createdAt: Date.now(),
    };
    onCreateTab(newTab);
    toast({
      title: 'Success',
      description: `Tab "${newTab.name}" created.`,
    });
    setTabName('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Tab
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Tab</DialogTitle>
            <DialogDescription>
              Enter a name for the new tab. You can add guests and orders later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tabName" className="text-right">
                Tab Name
              </Label>
              <Input
                id="tabName"
                value={tabName}
                onChange={(e) => setTabName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Table 1, VIP Section"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Create Tab</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
