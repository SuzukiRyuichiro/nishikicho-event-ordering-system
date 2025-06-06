"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import type { Customer } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface CreateCustomerDialogProps {
  onCreateCustomer: (newCustomer: Customer) => void;
}

export default function CreateCustomerDialog({ onCreateCustomer }: CreateCustomerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [guestCount, setGuestCount] = useState<string>("1");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast({
        title: "Error",
        description: "Customer/Group Name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const count = parseInt(guestCount, 10);
    if (isNaN(count) || count < 0) {
      toast({
        title: "Error",
        description: "Number of guests must be a valid positive number.",
        variant: "destructive",
      });
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "customers"), {
        name: customerName.trim(),
        guestCount: count > 0 ? count : 1,
        orderCount: 0,
        createdAt: Date.now(),
        totalPrice: count * 1000,
      });
      // Do not call onCreateCustomer here; Firestore's onSnapshot will update the UI in real time
      toast({
        title: "Success",
        description: `Customer "${customerName.trim()}" created.`,
      });
      setCustomerName("");
      setGuestCount("1");
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> お客さん登録
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>お客さん登録</DialogTitle>
            <DialogDescription>
              お客さんの名前、もしくは団体の名前を入力して下さい。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customerName" className="text-right">
                名前
              </Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 鈴木龍一郎 / 安田不動産"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guestCount" className="text-right">
                人数
              </Label>
              <Input
                id="guestCount"
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 4 (optional)"
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">登録</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
