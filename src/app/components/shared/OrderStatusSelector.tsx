
'use client';

// OrderStatus removed, using string literal types instead
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const SIMPLIFIED_STATUSES: string[] = ['Pending', 'Completed'];

interface OrderStatusSelectorProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function OrderStatusSelector({ currentStatus, onStatusChange, disabled, className }: OrderStatusSelectorProps) {
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'text-gray-500';
      case 'Completed': return 'text-blue-600';
      default: return 'text-gray-500';
    }
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => onStatusChange(value)}
      disabled={disabled || currentStatus === 'Completed'}
    >
      <SelectTrigger className={cn("w-full sm:w-[150px] text-xs h-8", getStatusColor(currentStatus), className)}>
        <SelectValue placeholder="Change status" />
      </SelectTrigger>
      <SelectContent>
        {SIMPLIFIED_STATUSES.map(status => (
          <SelectItem key={status} value={status} className={cn("text-xs", getStatusColor(status))}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
