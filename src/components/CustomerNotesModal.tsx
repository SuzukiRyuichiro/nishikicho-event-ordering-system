'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StickyNote, Plus, Trash2 } from 'lucide-react';
import type { Customer, CustomerNote } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CustomerNotesModalProps {
  customer: Customer;
  onCustomerUpdate?: (updatedCustomer: Customer) => void;
}

export default function CustomerNotesModal({ customer, onCustomerUpdate }: CustomerNotesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState<string | null>(null);
  const { toast } = useToast();

  const notes = customer.notes || [];

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast({
        title: "エラー",
        description: "メモ内容を入力してください。",
        variant: "destructive",
      });
      return;
    }

    setIsAddingNote(true);

    try {
      const note: CustomerNote = {
        id: `note_${Date.now()}`,
        content: newNote.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const customerRef = doc(db, 'customers', customer.id);
      await updateDoc(customerRef, {
        notes: arrayUnion(note),
        updatedAt: Date.now(),
      });

      const updatedCustomer = {
        ...customer,
        notes: [...notes, note],
      };

      if (onCustomerUpdate) {
        onCustomerUpdate(updatedCustomer);
      }

      setNewNote('');

      toast({
        title: "メモを追加しました",
        description: "新しいメモが正常に保存されました。",
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "エラー",
        description: "メモの追加に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteToDelete: CustomerNote) => {
    setIsDeletingNote(noteToDelete.id);

    try {
      const customerRef = doc(db, 'customers', customer.id);
      await updateDoc(customerRef, {
        notes: arrayRemove(noteToDelete),
        updatedAt: Date.now(),
      });

      const updatedCustomer = {
        ...customer,
        notes: notes.filter(note => note.id !== noteToDelete.id),
      };

      if (onCustomerUpdate) {
        onCustomerUpdate(updatedCustomer);
      }

      toast({
        title: "メモを削除しました",
        description: "メモが正常に削除されました。",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "エラー",
        description: "メモの削除に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsDeletingNote(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <StickyNote className="h-4 w-4 mr-2" />
          メモ {notes.length > 0 && `(${notes.length})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            {customer.name}のメモ
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {/* Add new note section */}
          <div className="space-y-2">
            <label htmlFor="new-note" className="text-sm font-medium">
              新しいメモを追加
            </label>
            <Textarea
              id="new-note"
              placeholder="メモ内容を入力してください（例：グループの代表者、特別なリクエスト等）"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleAddNote} 
              disabled={isAddingNote || !newNote.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAddingNote ? "追加中..." : "メモを追加"}
            </Button>
          </div>

          <Separator />

          {/* Existing notes section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              既存のメモ {notes.length > 0 && `(${notes.length}件)`}
            </h4>
            
            {notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>まだメモがありません</p>
                <p className="text-xs">上のフォームから最初のメモを追加してください</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-3">
                  {notes
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((note) => (
                      <div key={note.id} className="p-3 border rounded-lg bg-background">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {formatDate(note.createdAt)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note)}
                            disabled={isDeletingNote === note.id}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {note.content}
                        </p>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}