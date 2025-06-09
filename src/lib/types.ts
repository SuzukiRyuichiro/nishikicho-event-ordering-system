export interface OrderItem {
  id: string;
  itemId: string; // e.g., 'lager-beer', 'merlot-red-wine'
  name: string; // e.g., "Lager Beer", "Merlot (Red Wine)"
  quantity: number;
  // notes field removed
}

export interface Order {
  id: string;
  customerId: string; // Required reference to customer
  customerName: string; // Denormalized for easy display
  customerPaid?: boolean; // Denormalized payment status for kitchen filtering
  eventId: string; // Reference to the event this order belongs to
  items: OrderItem[];
  status: string; // Order status: "Pending", "Completed", "Cancelled", etc.
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

export interface Customer {
  id: string;
  name: string;
  eventId: string; // Reference to the event this customer belongs to
  guestCount?: number;
  orderCount: number;
  createdAt: number;
  orders: Order[];
  paid?: boolean;
  paidAt?: number;
}

export interface DrinkBreakdown {
  [itemId: string]: {
    itemName: string;
    quantity: number;
    totalRevenue: number;
  };
}

export interface Event {
  id: string;
  name: string;
  startDate: number; // Unix timestamp
  endDate?: number; // Unix timestamp, nullable for active events
  status: 'active' | 'completed';
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  drinkBreakdown: DrinkBreakdown;
  createdAt: number;
  completedAt?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number; // Price in JPY
  type: "alcoholic" | "non-alcoholic";
  archived: boolean; // Whether this item is no longer served
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

// Default menu items for initial migration to Firestore
// This will be replaced by Firestore data
export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: "lager-beer", name: "ラガービール", price: 500, type: "alcoholic", archived: false, createdAt: Date.now(), updatedAt: Date.now() },
  { id: "ipa-beer", name: "IPAビール", price: 500, type: "alcoholic", archived: false, createdAt: Date.now(), updatedAt: Date.now() },
  { id: "red-wine", name: "赤ワイン", price: 500, type: "alcoholic", archived: false, createdAt: Date.now(), updatedAt: Date.now() },
  { id: "white-wine", name: "白ワイン", price: 500, type: "alcoholic", archived: false, createdAt: Date.now(), updatedAt: Date.now() },
  { id: "vodka", name: "ウォッカ", price: 500, type: "alcoholic", archived: false, createdAt: Date.now(), updatedAt: Date.now() },
  { id: "gin", name: "ジン", price: 500, type: "alcoholic", archived: false, createdAt: Date.now(), updatedAt: Date.now() },
  { id: "coca-cola", name: "コーラ", price: 200, type: "non-alcoholic", archived: false, createdAt: Date.now(), updatedAt: Date.now() },
  { id: "apple-juice", name: "アップルジュース", price: 200, type: "non-alcoholic", archived: false, createdAt: Date.now(), updatedAt: Date.now() },
];

export const LOCAL_STORAGE_BEVERAGES_KEY = "eventBeverageList";
