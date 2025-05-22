
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { MenuItem } from '@/lib/types';
import { LOCAL_STORAGE_BEVERAGES_KEY, DEFAULT_MENU_ITEMS } from '@/lib/types';
import { Save, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export default function BeveragesClientPage() {
  const [beveragesText, setBeveragesText] = useState('');
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedBeverages = localStorage.getItem(LOCAL_STORAGE_BEVERAGES_KEY);
    if (storedBeverages) {
      try {
        const parsedBeverages: MenuItem[] = JSON.parse(storedBeverages);
        setBeveragesText(parsedBeverages.map(b => b.name).join('\n'));
      } catch (error) {
        console.error('Failed to parse stored beverages:', error);
        setBeveragesText(DEFAULT_MENU_ITEMS.map(b => b.name).join('\n'));
         toast({
          title: 'Warning',
          description: 'Could not load custom beverages, loaded defaults.',
          variant: 'destructive',
        });
      }
    } else {
      // If nothing in localStorage, load default menu item names
      setBeveragesText(DEFAULT_MENU_ITEMS.map(b => b.name).join('\n'));
    }
  }, []);

  const handleSaveBeverages = () => {
    const beverageNames = beveragesText
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (beverageNames.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one beverage name.',
        variant: 'destructive',
      });
      return;
    }

    const newBeverageList: MenuItem[] = beverageNames.map(name => ({
      id: slugify(name),
      name: name,
      category: 'Beverage', // Default category for dynamically added items
    }));

    localStorage.setItem(LOCAL_STORAGE_BEVERAGES_KEY, JSON.stringify(newBeverageList));
    toast({
      title: 'Success',
      description: 'Beverage list updated successfully!',
    });
  };
  
  if (!mounted) {
    return <div className="text-center py-10">Loading beverage settings...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Manage Event Beverages</CardTitle>
          <CardDescription>
            Enter each beverage name on a new line. This list will be used for creating new orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
              The beverage list you save here will be available in the order creation dialog.
              If this list is empty or not saved, a default list of items will be used.
              Each beverage name will automatically get an ID (e.g., "Red Wine" becomes "red-wine").
            </AlertDescription>
          </Alert>
          <div>
            <Label htmlFor="beveragesTextarea" className="text-sm font-medium">
              Beverage Names (one per line)
            </Label>
            <Textarea
              id="beveragesTextarea"
              value={beveragesText}
              onChange={(e) => setBeveragesText(e.target.value)}
              placeholder="e.g., Coke\nOrange Juice\nCraft Beer IPA..."
              rows={10}
              className="mt-1"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveBeverages} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" /> Save Beverage List
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
