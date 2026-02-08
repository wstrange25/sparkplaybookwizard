import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Target,
  MessageSquare,
  Zap,
  FileText,
  Bell,
  History,
  Plus,
  Check,
  Send,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type {
  FocusItem,
  FocusItemResponse,
  ActionStatus,
  Note,
  NoteReply,
  WorkItem,
  QuickAction,
  Reminder,
  Profile,
  SubmissionStreak,
  Business,
} from '@/lib/types';
import { PRIORITY_COLORS, STATUS_COLORS, CATEGORY_LABELS } from '@/lib/types';

// Focus Items Section
function FocusSection() {
  const { profile } = useAuth();
  const [focusItems, setFocusItems] = useState<(FocusItem & { responses: (FocusItemResponse & { user: Profile })[] })[]>([]);
  const [newResponse, setNewResponse] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.user_id) return;

    const fetchFocusItems = async () => {
      const { data, error } = await supabase
        .from('focus_items')
        .select(`
          *,
          responses:focus_item_responses(
            *,
            user:profiles(*)
          )
        `)
        .eq('target_user_id', profile.user_id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setFocusItems(data as unknown as (FocusItem & { responses: (FocusItemResponse & { user: Profile })[] })[]);
      }
      setLoading(false);
    };

    fetchFocusItems();
  }, [profile?.user_id]);

  const handleAddResponse = async (focusItemId: string) => {
    const content = newResponse[focusItemId]?.trim();
    if (!content || !profile?.user_id) return;

    const { error } = await supabase.from('focus_item_responses').insert({
      focus_item_id: focusItemId,
      user_id: profile.user_id,
      content,
    });

    if (error) {
      toast.error('Failed to add response');
    } else {
      toast.success('Response added');
      setNewResponse((prev) => ({ ...prev, [focusItemId]: '' }));
      // Refresh
      window.location.reload();
    }
  };

  if (loading) {
    return <div className="animate-pulse h-48 bg-card rounded-lg" />;
  }

  if (focusItems.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No focus items set for this week</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {focusItems.map((item, index) => (
        <Card key={item.id} className="border-l-4 border-l-spark-gold">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-spark-gold/20 flex items-center justify-center text-spark-gold font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">{item.title}</h3>
                {item.description && (
                  <p className="text-muted-foreground mt-1">{item.description}</p>
                )}

                {/* Responses */}
                {item.responses.length > 0 && (
                  <div className="mt-4 space-y-2 pl-4 border-l-2 border-muted">
                    {item.responses.map((response) => (
                      <div key={response.id} className="text-sm">
                        <p className="text-foreground">{response.content}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {response.user?.full_name} • {new Date(response.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add response */}
                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder="Add a note or update..."
                    value={newResponse[item.id] || ''}
                    onChange={(e) =>
                      setNewResponse((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddResponse(item.id);
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={() => handleAddResponse(item.id)}
                    disabled={!newResponse[item.id]?.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Notes from Will Section
function NotesSection() {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<(Note & { replies: (NoteReply & { user: Profile })[] })[]>([]);
  const [newReply, setNewReply] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.user_id) return;

    const fetchNotes = async () => {
      const { data } = await supabase
        .from('notes')
        .select(`
          *,
          replies:note_replies(
            *,
            user:profiles(*)
          )
        `)
        .eq('target_user_id', profile.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setNotes(data as unknown as (Note & { replies: (NoteReply & { user: Profile })[] })[]);
      }
      setLoading(false);
    };

    fetchNotes();
  }, [profile?.user_id]);

  const handleAcknowledge = async (noteId: string) => {
    await supabase
      .from('notes')
      .update({ is_acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq('id', noteId);

    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, is_acknowledged: true, acknowledged_at: new Date().toISOString() } : n
      )
    );
    toast.success('Note acknowledged');
  };

  const handleReply = async (noteId: string) => {
    const content = newReply[noteId]?.trim();
    if (!content || !profile?.user_id) return;

    await supabase.from('note_replies').insert({
      note_id: noteId,
      user_id: profile.user_id,
      content,
    });

    setNewReply((prev) => ({ ...prev, [noteId]: '' }));
    toast.success('Reply sent');
    window.location.reload();
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-card rounded-lg" />;
  }

  if (notes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No notes yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Card key={note.id} className={cn(!note.is_acknowledged && 'border-spark-gold/50')}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-foreground">{note.content}</p>
                <p className="text-xs text-muted-foreground font-mono mt-2">
                  {new Date(note.created_at).toLocaleString()}
                </p>

                {/* Replies */}
                {note.replies.length > 0 && (
                  <div className="mt-3 space-y-2 pl-4 border-l-2 border-muted">
                    {note.replies.map((reply) => (
                      <div key={reply.id} className="text-sm">
                        <p className="text-foreground">{reply.content}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {reply.user?.full_name} • {new Date(reply.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Reply..."
                    value={newReply[note.id] || ''}
                    onChange={(e) => setNewReply((prev) => ({ ...prev, [note.id]: e.target.value }))}
                    className="text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={() => handleReply(note.id)}>
                    Reply
                  </Button>
                </div>
              </div>
              {!note.is_acknowledged && (
                <Button size="sm" variant="ghost" onClick={() => handleAcknowledge(note.id)}>
                  <Check className="h-4 w-4 mr-1" />
                  Got it
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Quick Actions Section
function QuickActionsSection() {
  const { profile } = useAuth();
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [newAction, setNewAction] = useState('');

  useEffect(() => {
    if (!profile?.user_id) return;

    const fetchActions = async () => {
      const { data } = await supabase
        .from('quick_actions')
        .select('*')
        .or(`to_user_id.eq.${profile.user_id},from_user_id.eq.${profile.user_id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setActions(data as QuickAction[]);
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

  const handleUpdateStatus = async (actionId: string, newStatus: ActionStatus) => {
    await supabase
      .from('quick_actions')
      .update({
        status: newStatus,
        ...(newStatus === 'seen' && { seen_at: new Date().toISOString() }),
        ...(newStatus === 'done' && { completed_at: new Date().toISOString() }),
      })
      .eq('id', actionId);

    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: newStatus } : a))
    );
  };

  return (
    <div className="space-y-3">
      {actions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No quick actions</p>
          </CardContent>
        </Card>
      ) : (
        actions.map((action) => (
          <Card key={action.id}>
            <CardContent className="p-3 flex items-center gap-3">
              <Badge className={cn('shrink-0', getStatusColor(action.status))}>
                {action.status.replace('_', ' ')}
              </Badge>
              <p className="flex-1 text-sm">{action.content}</p>
              {action.to_user_id === profile?.user_id && action.status !== 'done' && (
                <div className="flex gap-1">
                  {action.status === 'new' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateStatus(action.id, 'seen')}
                    >
                      Mark Seen
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdateStatus(action.id, 'done')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// Active Items Section
function ActiveItemsSection() {
  const { profile } = useAuth();
  const [items, setItems] = useState<(WorkItem & { business?: Business })[]>([]);

  useEffect(() => {
    if (!profile?.user_id) return;

    const fetchItems = async () => {
      const { data } = await supabase
        .from('work_items')
        .select(`
          *,
          business:businesses(*)
        `)
        .eq('owner_id', profile.user_id)
        .neq('status', 'resolved')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (data) {
        setItems(data as unknown as (WorkItem & { business?: Business })[]);
      }
    };

    fetchItems();
  }, [profile?.user_id]);

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No active items</p>
          <Button className="mt-4" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 5).map((item) => (
        <Card key={item.id}>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: PRIORITY_COLORS[item.priority] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {CATEGORY_LABELS[item.category]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: STATUS_COLORS[item.status] }}
                  >
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              {item.business && (
                <div
                  className="h-6 w-1 rounded-full"
                  style={{ backgroundColor: item.business.color }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {items.length > 5 && (
        <Button variant="ghost" className="w-full text-sm">
          View all {items.length} items
        </Button>
      )}
    </div>
  );
}

// Reminders Section
function RemindersSection() {
  const { profile } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (!profile?.user_id) return;

    const fetchReminders = async () => {
      const { data } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', profile.user_id)
        .eq('is_completed', false)
        .order('due_date', { ascending: true })
        .limit(5);

      if (data) {
        setReminders(data as Reminder[]);
      }
    };

    fetchReminders();
  }, [profile?.user_id]);

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  if (reminders.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No upcoming reminders</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className={cn(isOverdue(reminder.due_date) && 'border-destructive/50')}>
          <CardContent className="p-3 flex items-center gap-3">
            <Bell className={cn('h-4 w-4', isOverdue(reminder.due_date) ? 'text-destructive' : 'text-muted-foreground')} />
            <div className="flex-1">
              <p className="text-sm font-medium">{reminder.title}</p>
              <p className={cn('text-xs font-mono', isOverdue(reminder.due_date) ? 'text-destructive' : 'text-muted-foreground')}>
                {new Date(reminder.due_date).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Submission Streak
function StreakBadge() {
  const { profile } = useAuth();
  const [streak, setStreak] = useState<SubmissionStreak | null>(null);

  useEffect(() => {
    if (!profile?.user_id) return;

    const fetchStreak = async () => {
      const { data } = await supabase
        .from('submission_streaks')
        .select('*')
        .eq('user_id', profile.user_id)
        .single();

      if (data) {
        setStreak(data as SubmissionStreak);
      }
    };

    fetchStreak();
  }, [profile?.user_id]);

  if (!streak || streak.current_streak === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-spark-gold/10 border border-spark-gold/30">
      <Flame className="h-5 w-5 text-spark-gold" />
      <span className="text-sm font-medium text-spark-gold">
        {streak.current_streak} week streak
      </span>
    </div>
  );
}

export function ManagerHome() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {profile?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your personal briefing for the week
          </p>
        </div>
        <StreakBadge />
      </div>

      {/* Focus This Week - Most Prominent */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-spark-gold" />
          <h2 className="text-xl font-semibold">Focus This Week</h2>
        </div>
        <FocusSection />
      </section>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* Notes from Will */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Notes from Will</h2>
            </div>
            <NotesSection />
          </section>

          {/* Quick Actions */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-spark-gold" />
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </div>
            <QuickActionsSection />
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Active Items */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">My Active Items</h2>
            </div>
            <ActiveItemsSection />
          </section>

          {/* Reminders */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Upcoming Reminders</h2>
            </div>
            <RemindersSection />
          </section>
        </div>
      </div>
    </div>
  );
}
