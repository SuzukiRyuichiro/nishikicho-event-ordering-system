import Link from 'next/link';
import type { Tab } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ShoppingBag, ArrowRight, CalendarDays } from 'lucide-react';

interface TabCardProps {
  tab: Tab;
  guestCount: number;
  orderCount: number;
}

export default function TabCard({ tab, guestCount, orderCount }: TabCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-primary text-xl">{tab.name}</CardTitle>
        <div className="text-xs text-muted-foreground flex items-center">
          <CalendarDays className="h-3 w-3 mr-1" />
          Created: {new Date(tab.createdAt).toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2 text-accent" />
            <span>{guestCount} Guest{guestCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <ShoppingBag className="h-4 w-4 mr-2 text-accent" />
            <span>{orderCount} Order{orderCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full group">
          <Link href={`/tabs/${tab.id}`}>
            View Tab
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
