
export type OrderStatus = 'Pending' | 'Completed';

// Guest interface is removed

export interface OrderItem {
  id: string;
  itemId: string; // e.g., 'beer-lager', 'wine-red-cab sauv'
  name: string; // e.g., "Lager Beer", "Cabernet Sauvignon"
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tabId: string;
  tabName: string; // Denormalized
  // guestId and guestName are removed
  items: OrderItem[];
  status: OrderStatus;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

export interface Tab {
  id:string;
  name: string; // Customer or Group Name
  guestCount?: number; // Optional number of guests
  createdAt: number; // Unix timestamp
}

// Example menu items for selection
export const MENU_ITEMS = [
  { id: 'beer-lager', name: 'Lager Beer', category: 'Beer' },
  { id: 'beer-ipa', name: 'IPA', category: 'Beer' },
  { id: 'wine-red-merlot', name: 'Merlot (Red)', category: 'Wine' }, // Corrected ID
  { id: 'wine-white-chardonnay', name: 'Chardonnay (White)', category: 'Wine' },
  { id: 'spirit-vodka', name: 'Vodka', category: 'Spirit' },
  { id: 'spirit-gin', name: 'Gin', category: 'Spirit' },
  { id: 'soft-coke', name: 'Coca-Cola', category: 'Soft Drink' },
  { id: 'soft-juice-apple', name: 'Apple Juice', category: 'Soft Drink' },
  { id: 'food-fries', name: 'French Fries', category: 'Food' },
  { id: 'food-burger', name: 'Classic Burger', category: 'Food' },
];
