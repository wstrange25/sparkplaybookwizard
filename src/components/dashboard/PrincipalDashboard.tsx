import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Building2,
  Users,
  Zap,
  TrendingUp,
  FileText,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkItem, Profile, Business, QuickAction, Submission } from '@/lib/types';
import { PRIORITY_COLORS, STATUS_COLORS, BUSINESS_COLORS } from '@/lib/types';

// Component for critical items section
function CriticalItemsSection() {
  const [criticalItems, setCriticalItems] = useState<(WorkItem & { owner?: Profile; business?: Business })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCriticalItems = async () => {
      const { data, error } = await supabase
        .from('work_items')
        .select(`
          *,
          owner:profiles!work_items_owner_id_fkey(*),
          business:businesses(*)
        `)
        .or('priority.eq.critical,is_escalated.eq.true,status.eq.blocked')
        .neq('status', 'resolved')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCriticalItems(data as unknown as (WorkItem & { owner?: Profile; business?: Business })[]);
      }
      setLoading(false);
    };

    fetchCriticalItems();
  }, []);

  if (loading) {
    return <div className="animate-pulse h-32 bg-card rounded-lg" />;
  }

  if (criticalItems.length === 0) {
    return (
      <Card className="border-status-resolved/30 bg-status-resolved/5">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No critical items. Portfolio is healthy.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {criticalItems.map((item) => (
        <Card key={item.id} className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {item.business && (
                    <Badge
                      variant="outline"
                      style={{ borderColor: item.business.color, color: item.business.color }}
                    >
                      {item.business.name}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    style={{ borderColor: PRIORITY_COLORS[item.priority] }}
                    className="text-xs"
                  >
                    {item.priority.toUpperCase()}
                  </Badge>
                  {item.is_escalated && (
                    <Badge variant="destructive" className="text-xs">
                      ESCALATED
                    </Badge>
                  )}
                </div>
                <h4 className="font-medium text-foreground">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {item.description}
                  </p>
                )}
                {item.blocked_reason && (
                  <p className="text-sm text-destructive mt-1">
                    Blocked: {item.blocked_reason}
                  </p>
                )}
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">{item.owner?.full_name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Portfolio pulse component
function PortfolioPulse() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState<Record<string, {
    open: number;
    critical: number;
    awaiting: number;
    overdue: number;
  }>>({});

  useEffect(() => {
    const fetchData = async () => {
      // Fetch businesses
      const { data: businessData } = await supabase
        .from('businesses')
        .select('*');

      if (businessData) {
        setBusinesses(businessData as Business[]);

        // Fetch stats for each business
        const statsMap: typeof stats = {};
        
        for (const business of businessData) {
          const { count: openCount } = await supabase
            .from('work_items')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', business.id)
            .neq('status', 'resolved');

          const { count: criticalCount } = await supabase
            .from('work_items')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', business.id)
            .eq('priority', 'critical')
            .neq('status', 'resolved');

          statsMap[business.id] = {
            open: openCount || 0,
            critical: criticalCount || 0,
            awaiting: 0,
            overdue: 0,
          };
        }

        setStats(statsMap);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {businesses.map((business) => (
        <Card
          key={business.id}
          className="border-l-4"
          style={{ borderLeftColor: business.color }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" style={{ color: business.color }} />
              {business.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Open</p>
                <p className="text-xl font-semibold">{stats[business.id]?.open || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Critical</p>
                <p className="text-xl font-semibold text-destructive">
                  {stats[business.id]?.critical || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Quick actions stream
function QuickActionsStream() {
  const [actions, setActions] = useState<(QuickAction & { from_user?: Profile; to_user?: Profile })[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.user_id) return;

    const fetchActions = async () => {
      const { data } = await supabase
        .from('quick_actions')
        .select(`
          *,
          from_user:profiles!quick_actions_from_user_id_fkey(*),
          to_user:profiles!quick_actions_to_user_id_fkey(*)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setActions(data as unknown as (QuickAction & { from_user?: Profile; to_user?: Profile })[]);
      }
    };

    fetchActions();
  }, [profile?.user_id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-status-open text-white';
      case 'seen': return 'bg-muted text-muted-foreground';
      case 'in_progress': return 'bg-status-progress text-black';
      case 'done': return 'bg-status-resolved text-white';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-2">
      {actions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No quick actions yet</p>
      ) : (
        actions.map((action) => (
          <div
            key={action.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
          >
            <Badge className={cn('shrink-0', getStatusColor(action.status))}>
              {action.status.replace('_', ' ')}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{action.content}</p>
              <p className="text-xs text-muted-foreground">
                {action.from_user?.full_name} → {action.to_user?.full_name}
              </p>
            </div>
            <span className="text-xs text-muted-foreground font-mono shrink-0">
              {new Date(action.created_at).toLocaleDateString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// Team feed component
function TeamFeed() {
  const [submissions, setSubmissions] = useState<(Submission & { user?: Profile; business?: Business })[]>([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const { data } = await supabase
        .from('submissions')
        .select(`
          *,
          user:profiles!submissions_user_id_fkey(*),
          business:businesses(*)
        `)
        .eq('is_draft', false)
        .order('submitted_at', { ascending: false })
        .limit(20);

      if (data) {
        setSubmissions(data as unknown as (Submission & { user?: Profile; business?: Business })[]);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="space-y-3">
      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No submissions yet</p>
      ) : (
        submissions.map((submission) => (
          <Card key={submission.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: submission.business?.color || '#666' }}
                  >
                    {submission.user?.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{submission.user?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Week of {new Date(submission.week_ending).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {submission.business && (
                  <Badge
                    variant="outline"
                    style={{ borderColor: submission.business.color, color: submission.business.color }}
                  >
                    {submission.business.name}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export function PrincipalDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Portfolio Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back. Here's your command centre.
        </p>
      </div>

      {/* Critical Items */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="text-xl font-semibold">Critical Items</h2>
        </div>
        <CriticalItemsSection />
      </section>

      {/* Portfolio Pulse */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Portfolio Pulse</h2>
        </div>
        <PortfolioPulse />
      </section>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-spark-gold" />
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <Card>
            <CardContent className="p-4">
              <QuickActionsStream />
            </CardContent>
          </Card>
        </section>

        {/* Team Feed */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Team Feed</h2>
          </div>
          <Card>
            <CardContent className="p-4">
              <TeamFeed />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
