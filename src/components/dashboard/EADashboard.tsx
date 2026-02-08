import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  LayoutDashboard,
  FileText,
  Zap,
  CalendarDays,
  Users,
  Eye,
  Plus,
  Check,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ActionStatus } from '@/lib/types';
import type { QuickAction, WorkItem, Profile, Business, DelegatedTask } from '@/lib/types';

// EA-specific Quick Actions with Will
function EAQuickActions() {
  const { profile } = useAuth();
  const [actions, setActions] = useState<(QuickAction & { from_user?: Profile; to_user?: Profile })[]>([]);
  const [newAction, setNewAction] = useState('');
  const [principalId, setPrincipalId] = useState<string | null>(null);

  useEffect(() => {
    // Get principal user ID
    const fetchPrincipal = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'principal')
        .single();
      
      if (data) {
        setPrincipalId(data.user_id);
      }
    };
    
    fetchPrincipal();
  }, []);

  useEffect(() => {
    if (!profile?.user_id || !principalId) return;

    const fetchActions = async () => {
      const { data } = await supabase
        .from('quick_actions')
        .select(`
          *,
          from_user:profiles!quick_actions_from_user_id_fkey(*),
          to_user:profiles!quick_actions_to_user_id_fkey(*)
        `)
        .or(`and(from_user_id.eq.${profile.user_id},to_user_id.eq.${principalId}),and(from_user_id.eq.${principalId},to_user_id.eq.${profile.user_id})`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setActions(data as unknown as (QuickAction & { from_user?: Profile; to_user?: Profile })[]);
      }
    };

    fetchActions();
  }, [profile?.user_id, principalId]);

  const handleSendAction = async () => {
    if (!newAction.trim() || !profile?.user_id || !principalId) return;

    const { error } = await supabase.from('quick_actions').insert({
      from_user_id: profile.user_id,
      to_user_id: principalId,
      content: newAction.trim(),
    });

    if (error) {
      toast.error('Failed to send action');
    } else {
      toast.success('Action sent to Will');
      setNewAction('');
      window.location.reload();
    }
  };

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-spark-gold" />
          Quick Actions with Will
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Send new action */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Send a quick action to Will..."
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendAction();
              }
            }}
          />
          <Button onClick={handleSendAction} disabled={!newAction.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions list */}
        <div className="space-y-2">
          {actions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No quick actions yet
            </p>
          ) : (
            actions.map((action) => (
              <div
                key={action.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  action.from_user_id === profile?.user_id
                    ? 'bg-muted/50 border-muted'
                    : 'bg-spark-gold/5 border-spark-gold/20'
                )}
              >
                <Badge className={cn('shrink-0', getStatusColor(action.status))}>
                  {action.status.replace('_', ' ')}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{action.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.from_user_id === profile?.user_id ? 'You → Will' : 'Will → You'}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(action.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// EA Task Board
function EATaskBoard() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<DelegatedTask[]>([]);

  useEffect(() => {
    if (!profile?.user_id) return;

    const fetchTasks = async () => {
      const { data } = await supabase
        .from('delegated_tasks')
        .select('*')
        .eq('assigned_to_id', profile.user_id)
        .neq('status', 'done')
        .order('created_at', { ascending: false });

      if (data) {
        setTasks(data as DelegatedTask[]);
      }
    };

    fetchTasks();
  }, [profile?.user_id]);

  const handleUpdateStatus = async (taskId: string, newStatus: ActionStatus) => {
    await supabase
      .from('delegated_tasks')
      .update({
        status: newStatus,
        ...(newStatus === 'done' && { completed_at: new Date().toISOString() }),
      })
      .eq('id', taskId);

    if (newStatus === 'done') {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    }
    toast.success('Task updated');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="flex-1">
                  <p className="text-sm font-medium">{task.description}</p>
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  {task.status === 'new' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                    >
                      Start
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdateStatus(task.id, 'done')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Read-only view indicator
function ReadOnlyBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border">
      <Eye className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        Read-only view of Will's dashboard
      </span>
    </div>
  );
}

// Portfolio Overview (simplified for EA)
function PortfolioOverview() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState<Record<string, { open: number; critical: number }>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: businessData } = await supabase.from('businesses').select('*');

      if (businessData) {
        setBusinesses(businessData as Business[]);

        const statsMap: Record<string, { open: number; critical: number }> = {};
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
          };
        }
        setStats(statsMap);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {businesses.map((business) => (
        <Card key={business.id} className="border-l-4" style={{ borderLeftColor: business.color }}>
          <CardContent className="p-4">
            <h3 className="font-medium text-sm" style={{ color: business.color }}>
              {business.name}
            </h3>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-2xl font-bold">{stats[business.id]?.open || 0}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {stats[business.id]?.critical || 0}
                </p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function EADashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {profile?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">Executive Assistant Dashboard</p>
        </div>
        <ReadOnlyBanner />
      </div>

      {/* Portfolio Overview */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Portfolio Overview</h2>
        </div>
        <PortfolioOverview />
      </section>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions with Will */}
        <EAQuickActions />

        {/* Task Board */}
        <EATaskBoard />
      </div>

      {/* Meeting Prep Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Meeting Prep</h2>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No upcoming meetings to prepare</p>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
