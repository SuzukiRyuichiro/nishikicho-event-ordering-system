import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Martini, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">メニュー</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            お客さん管理画面で、オーダーの登録、最後の会計などができます。バー画面では、入ってきたオーダーの一覧、オーダーの処理などの操作ができます
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureLink
              href="/customers"
              icon={<Users className="h-8 w-8 text-accent" />}
              title="お客さん管理"
              description="お客さんの伝票を作成、表示、管理します。お客さんを追加し、注文を登録できます。"
            />
            <FeatureLink
              href="/kitchen"
              icon={<Martini className="h-8 w-8 text-accent" />}
              title="バー"
              description="注文を表示し、ステータスを確認し、バーの作業を管理します。"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface FeatureLinkProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureLink({ href, icon, title, description }: FeatureLinkProps) {
  return (
    <Link href={href} className="block group">
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex flex-row items-center gap-4">
          {icon}
          <div>
            <CardTitle className="text-xl group-hover:text-primary transition-colors">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
          <Button variant="link" className="px-0 mt-2 text-accent group-hover:text-primary transition-colors">
             {title}画面に行く<ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
