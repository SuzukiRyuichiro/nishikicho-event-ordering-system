'use client';

import { useState, useEffect } from 'react';
import type { Tab } from '@/lib/types';
import TabCard from '@/app/components/tabs/TabCard';
import CreateTabDialog from '@/app/components/tabs/CreateTabDialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Mock data - in a real app, this would come from an API
const initialTabs: Tab[] = [
  { id: '1', name: 'Table 101', createdAt: new Date('2024-07-20T10:00:00Z').getTime() },
  { id: '2', name: 'Bar Area', createdAt: new Date('2024-07-20T10:05:00Z').getTime() },
  { id: '3', name: 'VIP Lounge', createdAt: new Date('2024-07-20T10:10:00Z').getTime() },
];

export default function TabsClientPage() {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Avoid hydration issues with localStorage or initial data
  }, []);


  const handleCreateTab = (newTab: Tab) => {
    setTabs((prevTabs) => [newTab, ...prevTabs]);
  };

  const filteredTabs = tabs.filter((tab) =>
    tab.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (!mounted) {
    return <div className="text-center py-10">Loading tabs...</div>; // Or a skeleton loader
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Manage Tabs</h1>
        <CreateTabDialog onCreateTab={handleCreateTab} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tabs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full sm:w-72"
        />
      </div>

      {filteredTabs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTabs.map((tab) => (
            <TabCard
              key={tab.id}
              tab={tab}
              // Mock counts for guest and orders. In a real app, these would be fetched.
              guestCount={Math.floor(Math.random() * 5)} // Example
              orderCount={Math.floor(Math.random() * 10)} // Example
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-xl">No tabs found.</p>
          {searchTerm && <p>Try adjusting your search or create a new tab.</p>}
        </div>
      )}
    </div>
  );
}
