import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Soup, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Welcome to Nishikicho Event App</CardTitle>
          <CardDescription className="text-lg">
            Efficiently manage guest tabs and kitchen orders for your events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            This application helps streamline event operations by providing tools for tab management, order entry, and a kitchen display system.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureLink
              href="/tabs"
              icon={<Users className="h-8 w-8 text-accent" />}
              title="Manage Tabs"
              description="Create, view, and manage guest tabs. Add guests and place orders."
            />
            <FeatureLink
              href="/kitchen"
              icon={<Soup className="h-8 w-8 text-accent" />}
              title="Kitchen Display"
              description="View all active orders, track their status, and manage kitchen workflow."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>1. Navigate to <Link href="/tabs" className="text-accent hover:underline font-medium">Tabs</Link> to create your first tab.</p>
          <p>2. Add guests to your tab and start placing orders.</p>
          <p>3. Monitor incoming orders in the <Link href="/kitchen" className="text-accent hover:underline font-medium">Kitchen Display</Link>.</p>
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
            Go to {title} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
