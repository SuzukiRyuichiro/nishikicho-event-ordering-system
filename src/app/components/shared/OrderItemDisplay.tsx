import type { Order } from "@/lib/types";

export default function OrderItemDisplay({ order }: { order: Order }) {
  return (
    <div className="py-1 text-sm">
      <span className="font-medium">
        {order.quantity}x {order.name}
      </span>
    </div>
  );
}
