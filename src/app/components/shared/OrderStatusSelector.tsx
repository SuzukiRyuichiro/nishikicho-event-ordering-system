'use client';

import type { OrderStatus } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled'];

interface OrderStatusSelectorProps {
  currentStatus: OrderStatus;
  onStatusChange: (newStatus: OrderStatus) => void;
  disabled?: boolean;
  className?: string;
}

export default function OrderStatusSelector({ currentStatus, onStatusChange, disabled, className }: OrderStatusSelectorProps) {
  
  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'Pending': return 'text-gray-500';
      case 'Preparing': return 'text-yellow-600';
      case 'Ready': return 'text-teal-600';
      case 'Served': return 'text-green-600';
      case 'Completed': return 'text-blue-600';
      case 'Cancelled': return 'text-red-500 line-through';
      default: return 'text-gray-500';
    }
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => onStatusChange(value as OrderStatus)}
      disabled={disabled || currentStatus === 'Completed' || currentStatus === 'Cancelled'}
    >
      <SelectTrigger className={cn("w-full sm:w-[150px] text-xs h-8", getStatusColor(currentStatus), className)}>
        <SelectValue placeholder="Change status" />
      </SelectTrigger>
      <SelectContent>
        {ALL_STATUSES.map(status => (
          <SelectItem key={status} value={status} className={cn("text-xs", getStatusColor(status))}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
