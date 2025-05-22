'use client';

import type { Guest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Users } from 'lucide-react';
import AddGuestDialog from './AddGuestDialog';

interface GuestListProps {
  tabId: string;
  guests: Guest[];
  onAddGuest: (newGuest: Guest) => void;
}

export default function GuestList({ tabId, guests, onAddGuest }: GuestListProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" /> Guests
          </CardTitle>
          <CardDescription>Manage guests for this tab.</CardDescription>
        </div>
        <AddGuestDialog tabId={tabId} onAddGuest={onAddGuest} />
      </CardHeader>
      <CardContent>
        {guests.length > 0 ? (
          <ul className="space-y-3">
            {guests.map((guest) => (
              <li key={guest.id} className="flex items-center p-3 bg-muted/50 rounded-md">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback>
                    {guest.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{guest.name}</span>
                {/* Add actions like remove guest if needed */}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No guests added to this tab yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
