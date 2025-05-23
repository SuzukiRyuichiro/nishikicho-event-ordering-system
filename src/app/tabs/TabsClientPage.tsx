'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Tab } from '@/lib/types';
import TabCard from '@/app/components/tabs/TabCard';
import CreateTabDialog from '@/app/components/tabs/CreateTabDialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function TabsClientPage() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true); // Avoid hydration issues with localStorage or initial data
    // Listen to Firestore tabs collection
    const unsubscribe = onSnapshot(collection(db, 'tabs'), (snapshot: QuerySnapshot<DocumentData>) => {
      const tabsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTabs(tabsData as Tab[]);
    });
    return () => unsubscribe();
  }, []);


  const handleCreateTab = (newTab: Tab) => {
    setTabs((prevTabs) => [newTab, ...prevTabs]);
  };

  const filteredTabs = tabs.filter((tab) =>
    tab.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return <div className="text-center py-10">伝票を読み込み中...</div>; // Or a skeleton loader
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">お客さん管理</h1>
        <CreateTabDialog onCreateTab={handleCreateTab} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="氏名・グループ名で検索..."
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
              // Mock order count for now.
              orderCount={Math.floor(Math.random() * 10)} // Example
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-xl">お客さんが見つかりません。</p>
          {searchTerm && <p>検索条件を変更するか、を作成してください。</p>}
        </div>
      )}
    </div>
  );
}
