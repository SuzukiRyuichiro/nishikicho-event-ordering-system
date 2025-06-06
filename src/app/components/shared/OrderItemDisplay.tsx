import type { OrderItem } from "@/lib/types";

export default function OrderItemDisplay({ item }: { item: OrderItem }) {
  return (
    <div className="py-1 text-sm">
      <span className="font-medium">
        {item.quantity}x {item.name}
      </span>
    </div>
  );
}
