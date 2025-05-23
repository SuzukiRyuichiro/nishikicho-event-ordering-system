export interface OrderItem {
  id: string;
  itemId: string; // e.g., 'lager-beer', 'merlot-red-wine'
  name: string; // e.g., "Lager Beer", "Merlot (Red Wine)"
  quantity: number;
  // notes field removed
}

export interface Order {
  id: string;
  items: OrderItem[];
  done: boolean;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

export interface Tab {
  id: string;
  name: string;
  guestCount?: number;
  createdAt: number;
  orders: Order[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
}

// Default menu items if nothing is found in localStorage.
// IDs should be simple slugs.
export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: "lager-beer", name: "Lager Beer", category: "Beer" },
  { id: "ipa-beer", name: "IPA Beer", category: "Beer" }, // Changed ID and name for consistency
  { id: "merlot-red-wine", name: "Merlot (Red Wine)", category: "Wine" },
  {
    id: "chardonnay-white-wine",
    name: "Chardonnay (White Wine)",
    category: "Wine",
  },
  { id: "vodka", name: "Vodka", category: "Spirit" },
  { id: "gin", name: "Gin", category: "Spirit" },
  { id: "coca-cola", name: "Coca-Cola", category: "Soft Drink" },
  { id: "apple-juice", name: "Apple Juice", category: "Soft Drink" },
  { id: "french-fries", name: "French Fries", category: "Food" }, // Kept food for example, can be removed if only beverages
  { id: "classic-burger", name: "Classic Burger", category: "Food" }, // Kept food for example
];

export const LOCAL_STORAGE_BEVERAGES_KEY = "eventBeverageList";
