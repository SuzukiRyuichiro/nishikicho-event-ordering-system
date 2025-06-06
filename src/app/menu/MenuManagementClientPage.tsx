"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MenuItem } from "@/lib/types";
import { DEFAULT_MENU_ITEMS } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, Plus, Trash2, Upload, Archive } from "lucide-react";

export default function MenuManagementClientPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: "",
    price: 500,
    type: "alcoholic",
    archived: false,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "menuItems"),
      (snapshot) => {
        const items = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as MenuItem)
        );
        items.sort((a, b) => a.name.localeCompare(b.name));
        setMenuItems(items);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching menu items:", error);
        toast({
          title: "エラー",
          description: "メニューアイテムの取得に失敗しました。",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const migrateDefaultItems = async () => {
    try {
      for (const item of DEFAULT_MENU_ITEMS) {
        const { id, ...itemData } = item;
        await addDoc(collection(db, "menuItems"), itemData);
      }
      toast({
        title: "移行完了",
        description: "デフォルトメニューアイテムをFirestoreに移行しました。",
      });
    } catch (error) {
      console.error("Error migrating default items:", error);
      toast({
        title: "エラー",
        description: "デフォルトアイテムの移行に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.name || newItem.price === undefined) {
      toast({
        title: "エラー",
        description: "すべての必須フィールドを入力してください。",
        variant: "destructive",
      });
      return;
    }

    try {
      const itemData = {
        ...newItem,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await addDoc(collection(db, "menuItems"), itemData);
      setNewItem({
        name: "",
        price: 500,
        type: "alcoholic",
        archived: false,
      });
      setIsCreateDialogOpen(false);
      toast({
        title: "アイテム作成完了",
        description: "新しいメニューアイテムを作成しました。",
      });
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        title: "エラー",
        description: "アイテムの作成に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const itemRef = doc(db, "menuItems", editingItem.id);
      await updateDoc(itemRef, {
        ...editingItem,
        updatedAt: Date.now(),
      });
      setEditingItem(null);
      setIsEditDialogOpen(false);
      toast({
        title: "アイテム更新完了",
        description: "メニューアイテムを更新しました。",
      });
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "エラー",
        description: "アイテムの更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleToggleArchive = async (item: MenuItem) => {
    try {
      const itemRef = doc(db, "menuItems", item.id);
      await updateDoc(itemRef, {
        archived: !item.archived,
        updatedAt: Date.now(),
      });
      toast({
        title: item.archived ? "アイテム復活" : "アイテムアーカイブ",
        description: item.archived
          ? "アイテムを復活させました。"
          : "アイテムをアーカイブしました。",
      });
    } catch (error) {
      console.error("Error toggling archive:", error);
      toast({
        title: "エラー",
        description: "アイテムのアーカイブ状態の変更に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (
      !confirm(`"${item.name}"を完全に削除しますか？この操作は取り消せません。`)
    ) {
      return;
    }

    try {
      const itemRef = doc(db, "menuItems", item.id);
      await deleteDoc(itemRef);
      toast({
        title: "アイテム削除完了",
        description: "メニューアイテムを削除しました。",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "エラー",
        description: "アイテムの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const filteredItems = menuItems.filter(
    (item) => showArchived || !item.archived
  );

  if (isLoading) {
    return <div className="text-center py-10">メニュー管理を読込中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">メニュー管理</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-archived"
              checked={showArchived}
              onCheckedChange={setShowArchived}
            />
            <Label htmlFor="show-archived" className="text-sm">
              アーカイブ表示
            </Label>
          </div>
          {menuItems.length === 0 && (
            <Button onClick={migrateDefaultItems} variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" /> デフォルトデータ移行
            </Button>
          )}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> 新しいアイテム
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいメニューアイテムを作成</DialogTitle>
                <DialogDescription>
                  新しい飲み物やフードアイテムを追加します。
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-name">名前</Label>
                  <Input
                    id="new-name"
                    value={newItem.name || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    placeholder="アイテム名"
                  />
                </div>
                <div>
                  <Label htmlFor="new-price">価格 (円)</Label>
                  <Input
                    id="new-price"
                    type="number"
                    value={newItem.price || 500}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        price: parseInt(e.target.value) || 500,
                      })
                    }
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label htmlFor="new-type">種類</Label>
                  <Select
                    value={newItem.type || "alcoholic"}
                    onValueChange={(value: "alcoholic" | "non-alcoholic") =>
                      setNewItem({ 
                        ...newItem, 
                        type: value,
                        price: value === "alcoholic" ? 500 : 200
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alcoholic">アルコール</SelectItem>
                      <SelectItem value="non-alcoholic">
                        ノンアルコール
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button onClick={handleCreateItem}>作成</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground">
              メニューアイテムがありません。
              {menuItems.length === 0 &&
                "デフォルトデータを移行するか、新しいアイテムを作成してください。"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">メニューアイテム</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className={item.archived ? "opacity-60" : ""}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingItem(item);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleArchive(item)}
                        >
                          <Archive className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>¥{item.price}</p>
                      <div className="flex gap-1">
                        <Badge
                          variant={
                            item.type === "alcoholic" ? "default" : "secondary"
                          }
                        >
                          {item.type === "alcoholic"
                            ? "アルコール"
                            : "ノンアルコール"}
                        </Badge>
                        {item.archived && (
                          <Badge variant="outline">アーカイブ</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>メニューアイテムを編集</DialogTitle>
            <DialogDescription>アイテムの詳細を編集します。</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">名前</Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-price">価格 (円)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      price: parseInt(e.target.value) || 500,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-type">種類</Label>
                <Select
                  value={editingItem.type}
                  onValueChange={(value: "alcoholic" | "non-alcoholic") =>
                    setEditingItem({ 
                      ...editingItem, 
                      type: value,
                      price: value === "alcoholic" ? 500 : 200
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alcoholic">アルコール</SelectItem>
                    <SelectItem value="non-alcoholic">
                      ノンアルコール
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleUpdateItem}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
