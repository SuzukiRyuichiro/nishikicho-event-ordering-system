import type { OrderItem } from '@/lib/types';

interface OrderItemDisplayProps {
  item: OrderItem;
}

export default function OrderItemDisplay({ item }: OrderItemDisplayProps) {
  return (
    <div className="py-1 text-sm">
      <span className="font-medium">{item.quantity}x {item.name}</span>
      {item.notes && (
        <p className="text-xs text-muted-foreground pl-2">- {item.notes}</p>
      )}
    </div>
  );
}
