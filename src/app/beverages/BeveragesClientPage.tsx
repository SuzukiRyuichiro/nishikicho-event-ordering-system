'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { MenuItem } from '@/lib/types';
import { LOCAL_STORAGE_BEVERAGES_KEY, DEFAULT_MENU_ITEMS } from '@/lib/types';
import { Save, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export default function BeveragesClientPage() {
  const [beveragesText, setBeveragesText] = useState('');
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedBeverages = localStorage.getItem(LOCAL_STORAGE_BEVERAGES_KEY);
    if (storedBeverages) {
      try {
        const parsedBeverages: MenuItem[] = JSON.parse(storedBeverages);
        setBeveragesText(parsedBeverages.map(b => b.name).join('\n'));
      } catch (error) {
        console.error('Failed to parse stored beverages:', error);
        setBeveragesText(DEFAULT_MENU_ITEMS.map(b => b.name).join('\n'));
        toast({
          title: '警告',
          description: 'カスタムドリンクの読み込みに失敗したため、デフォルトを読み込みました。',
          variant: 'destructive',
        });
      }
    } else {
      // If nothing in localStorage, load default menu item names
      setBeveragesText(DEFAULT_MENU_ITEMS.map(b => b.name).join('\n'));
    }
  }, []);

  const handleSaveBeverages = () => {
    const beverageNames = beveragesText
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (beverageNames.length === 0) {
      toast({
        title: 'エラー',
        description: '少なくとも1つのドリンク名を入力してください。',
        variant: 'destructive',
      });
      return;
    }

    const newBeverageList: MenuItem[] = beverageNames.map(name => ({
      id: slugify(name),
      name: name,
      price: 500, // Default price
      type: 'non-alcoholic' as const, // Default to non-alcoholic
      archived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    localStorage.setItem(LOCAL_STORAGE_BEVERAGES_KEY, JSON.stringify(newBeverageList));
    toast({
      title: '成功',
      description: 'ドリンクリストが正常に更新されました！',
    });
  };

  if (!mounted) {
    return <div className="text-center py-10">ドリンク設定を読み込み中...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">ドリンクメニューの管理</CardTitle>
          <CardDescription>
            各ドリンク名を1行ずつ入力してください。このリストは新しい注文を作成する際に使用されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>使い方</AlertTitle>
            <AlertDescription>
              ここで保存したドリンクリストは、注文作成ダイアログで利用できます。
              このリストが空、または保存されていない場合は、デフォルトのリストが使用されます。
            </AlertDescription>
          </Alert>
          <div>
            <Label htmlFor="beveragesTextarea" className="text-sm font-medium">
              ドリンク名（1行につき1つ）
            </Label>
            <Textarea
              id="beveragesTextarea"
              value={beveragesText}
              onChange={(e) => setBeveragesText(e.target.value)}
              placeholder={"例：コーラ\nオレンジジュース\nビール..."}
              rows={10}
              className="mt-1"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveBeverages} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" /> ドリンクメニューを保存
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
