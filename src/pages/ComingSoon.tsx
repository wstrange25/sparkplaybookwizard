import { useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function ComingSoon() {
  const location = useLocation();
  const pageName = location.pathname
    .replace('/', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'This Page';

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full bg-card border-border">
          <CardContent className="pt-6 text-center">
            <Construction className="h-12 w-12 text-spark-gold mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {pageName}
            </h1>
            <p className="text-muted-foreground">
              This page is coming soon. We're building something great!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
