'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Customer } from '@/lib/types';
import CustomerCard from '@/app/components/customers/CustomerCard';
import CreateCustomerDialog from '@/app/components/customers/CreateCustomerDialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function CustomersClientPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true); // Avoid hydration issues with localStorage or initial data
    // Listen to Firestore customers collection
    const unsubscribe = onSnapshot(collection(db, 'customers'), (snapshot: QuerySnapshot<DocumentData>) => {
      const customersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(customersData as Customer[]);
    });
    return () => unsubscribe();
  }, []);


  const handleCreateCustomer = (newCustomer: Customer) => {
    setCustomers((prevCustomers) => [newCustomer, ...prevCustomers]);
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return <div className="text-center py-10">伝票を読み込み中...</div>; // Or a skeleton loader
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">お客さん管理</h1>
        <CreateCustomerDialog onCreateCustomer={handleCreateCustomer} />
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

      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
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
