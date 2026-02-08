-- Spark Playbook Database Schema
-- Phase 1: Core tables, roles, and RLS policies

-- ============================================
-- 1. ENUMS
-- ============================================

-- User roles enum
CREATE TYPE public.app_role AS ENUM (
  'principal',  -- Will - sees everything
  'ea',         -- Madison - read-all + own tasks
  'gm',         -- General Managers (Ingrid, Myles)
  'manager',    -- Regular managers (Giles, Muhammad, Jake, Sam)
  'sales'       -- Sales roles (Jay, Dylan, Jarrod)
);

-- Business identifiers
CREATE TYPE public.business_type AS ENUM (
  'ultralift',
  'westberg',
  'spt',
  'se_digital'
);

-- Work item categories
CREATE TYPE public.item_category AS ENUM (
  'win',
  'pain_point',
  'discussion',
  'critical_path'
);

-- Item/Action status
CREATE TYPE public.item_status AS ENUM (
  'open',
  'in_progress',
  'blocked',
  'resolved'
);

-- Quick action status
CREATE TYPE public.action_status AS ENUM (
  'new',
  'seen',
  'in_progress',
  'done'
);

-- Priority levels
CREATE TYPE public.priority_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Reminder types
CREATE TYPE public.reminder_type AS ENUM (
  'one_off',
  'recurring'
);

-- ============================================
-- 2. CORE TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug business_type NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL, -- HEX color for UI
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Business memberships (which users belong to which businesses)
CREATE TABLE public.business_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT false, -- GMs can see their team's reports
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, business_id)
);

-- Focus items (set by Principal for each person)
CREATE TABLE public.focus_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  set_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Focus item responses (manager replies to focus items)
CREATE TABLE public.focus_item_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  focus_item_id UUID REFERENCES public.focus_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notes (private thread between Principal and each person)
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Note replies
CREATE TABLE public.note_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tags for work items
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT, -- Optional color override
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Work items (persistent tracking items)
CREATE TABLE public.work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category item_category NOT NULL DEFAULT 'discussion',
  priority priority_level NOT NULL DEFAULT 'medium',
  status item_status NOT NULL DEFAULT 'open',
  due_date DATE,
  blocked_reason TEXT,
  is_sensitive BOOLEAN DEFAULT false, -- Only visible to owner + Principal
  is_flagged_for_meeting BOOLEAN DEFAULT false,
  is_escalated BOOLEAN DEFAULT false,
  escalated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Work item tags junction
CREATE TABLE public.work_item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id UUID REFERENCES public.work_items(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (work_item_id, tag_id)
);

-- Work item comments/notes thread
CREATE TABLE public.work_item_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id UUID REFERENCES public.work_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Work item attachments
CREATE TABLE public.work_item_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id UUID REFERENCES public.work_items(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_google_drive_link BOOLEAN DEFAULT false, -- Will-only Google Drive links
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quick actions (fast task stream)
CREATE TABLE public.quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  status action_status NOT NULL DEFAULT 'new',
  priority priority_level DEFAULT 'medium',
  due_date DATE,
  via_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- "via Madison"
  seen_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reminders
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  work_item_id UUID REFERENCES public.work_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  reminder_type reminder_type NOT NULL DEFAULT 'one_off',
  due_date TIMESTAMPTZ NOT NULL,
  recurrence_rule TEXT, -- RRULE format for recurring
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_fired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Weekly submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  week_ending DATE NOT NULL, -- Sunday of the week
  submitted_at TIMESTAMPTZ,
  is_draft BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_ending)
);

-- Submission entries (individual items within a submission)
CREATE TABLE public.submission_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  work_item_id UUID REFERENCES public.work_items(id) ON DELETE SET NULL, -- Links to existing item
  category item_category NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales-specific: Pipeline snapshots
CREATE TABLE public.pipeline_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  active_quotes INTEGER DEFAULT 0,
  total_pipeline_value DECIMAL(12,2) DEFAULT 0,
  quotes_sent_this_week INTEGER DEFAULT 0,
  closed_this_week INTEGER DEFAULT 0,
  closed_value DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales-specific: Key deals
CREATE TABLE public.key_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  estimated_value DECIMAL(12,2),
  stage TEXT NOT NULL, -- Quoting, Negotiating, Verbal, Won, Lost
  expected_close_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales-specific: Win/Loss log
CREATE TABLE public.win_loss_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  deal_value DECIMAL(12,2),
  margin_percent DECIMAL(5,2),
  is_win BOOLEAN NOT NULL,
  reason TEXT,
  closed_at DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meeting agenda items
CREATE TABLE public.meeting_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id UUID REFERENCES public.work_items(id) ON DELETE CASCADE,
  meeting_date DATE,
  display_order INTEGER DEFAULT 0,
  context_notes TEXT,
  outcome TEXT,
  outcome_recorded_at TIMESTAMPTZ,
  carry_forward_count INTEGER DEFAULT 0,
  is_addressed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Delegated tasks
CREATE TABLE public.delegated_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source_type TEXT, -- 'meeting', 'note', 'quick_action'
  source_id UUID, -- ID of the source item
  description TEXT NOT NULL,
  status action_status NOT NULL DEFAULT 'new',
  due_date DATE,
  acknowledged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'focus_update', 'note', 'quick_action', 'reminder', etc.
  title TEXT NOT NULL,
  content TEXT,
  link TEXT, -- Deep link to the relevant item
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invite tokens for new users
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role app_role NOT NULL,
  business_ids UUID[] DEFAULT '{}',
  invited_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Submission streaks tracking
CREATE TABLE public.submission_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_submission_week DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. INDEXES
-- ============================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_business_memberships_user_id ON public.business_memberships(user_id);
CREATE INDEX idx_business_memberships_business_id ON public.business_memberships(business_id);
CREATE INDEX idx_focus_items_target_user ON public.focus_items(target_user_id);
CREATE INDEX idx_focus_items_active ON public.focus_items(target_user_id, is_active);
CREATE INDEX idx_notes_target_user ON public.notes(target_user_id);
CREATE INDEX idx_work_items_owner ON public.work_items(owner_id);
CREATE INDEX idx_work_items_status ON public.work_items(status);
CREATE INDEX idx_work_items_business ON public.work_items(business_id);
CREATE INDEX idx_work_items_priority ON public.work_items(priority);
CREATE INDEX idx_work_items_flagged ON public.work_items(is_flagged_for_meeting);
CREATE INDEX idx_quick_actions_to_user ON public.quick_actions(to_user_id);
CREATE INDEX idx_quick_actions_from_user ON public.quick_actions(from_user_id);
CREATE INDEX idx_quick_actions_status ON public.quick_actions(status);
CREATE INDEX idx_reminders_user ON public.reminders(user_id);
CREATE INDEX idx_reminders_due ON public.reminders(due_date, is_completed);
CREATE INDEX idx_submissions_user ON public.submissions(user_id);
CREATE INDEX idx_submissions_week ON public.submissions(week_ending);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_invites_token ON public.invites(token);
CREATE INDEX idx_invites_email ON public.invites(email);

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if current user is principal
CREATE OR REPLACE FUNCTION public.is_principal()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'principal')
$$;

-- Check if current user is EA
CREATE OR REPLACE FUNCTION public.is_ea()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'ea')
$$;

-- Check if current user is principal or EA
CREATE OR REPLACE FUNCTION public.is_principal_or_ea()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_principal() OR public.is_ea()
$$;

-- Check if current user is GM
CREATE OR REPLACE FUNCTION public.is_gm()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'gm')
$$;

-- Check if user is member of a business
CREATE OR REPLACE FUNCTION public.is_business_member(_user_id UUID, _business_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_memberships
    WHERE user_id = _user_id
      AND business_id = _business_id
  )
$$;

-- Get business slug for a business ID
CREATE OR REPLACE FUNCTION public.get_business_slug(_business_id UUID)
RETURNS business_type
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT slug FROM public.businesses WHERE id = _business_id
$$;

-- Check if user can view a business (based on membership or role)
CREATE OR REPLACE FUNCTION public.can_view_business(_user_id UUID, _business_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _slug business_type;
BEGIN
  -- Principal and EA can see all businesses
  IF public.is_principal() OR public.is_ea() THEN
    RETURN true;
  END IF;
  
  -- Get business slug
  SELECT slug INTO _slug FROM public.businesses WHERE id = _business_id;
  
  -- Check membership
  IF public.is_business_member(_user_id, _business_id) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- ============================================
-- 5. AUTO-UPDATE TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_focus_items_updated_at
  BEFORE UPDATE ON public.focus_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_items_updated_at
  BEFORE UPDATE ON public.work_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quick_actions_updated_at
  BEFORE UPDATE ON public.quick_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_key_deals_updated_at
  BEFORE UPDATE ON public.key_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meeting_items_updated_at
  BEFORE UPDATE ON public.meeting_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delegated_tasks_updated_at
  BEFORE UPDATE ON public.delegated_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. ENABLE RLS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_item_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_item_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_item_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.win_loss_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegated_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_streaks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS POLICIES
-- ============================================

-- PROFILES
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Principal can manage all profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_principal());

-- USER_ROLES (read-only except principal)
CREATE POLICY "Users can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Principal manages roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_principal());

-- BUSINESSES
CREATE POLICY "View businesses based on membership" ON public.businesses
  FOR SELECT TO authenticated
  USING (
    public.is_principal() OR
    public.is_ea() OR
    public.is_business_member(auth.uid(), id)
  );

CREATE POLICY "Principal manages businesses" ON public.businesses
  FOR ALL TO authenticated
  USING (public.is_principal());

-- BUSINESS_MEMBERSHIPS
CREATE POLICY "View memberships" ON public.business_memberships
  FOR SELECT TO authenticated
  USING (
    public.is_principal() OR
    public.is_ea() OR
    user_id = auth.uid() OR
    public.is_business_member(auth.uid(), business_id)
  );

CREATE POLICY "Principal manages memberships" ON public.business_memberships
  FOR ALL TO authenticated
  USING (public.is_principal());

-- FOCUS_ITEMS
CREATE POLICY "View focus items" ON public.focus_items
  FOR SELECT TO authenticated
  USING (
    public.is_principal() OR
    public.is_ea() OR
    target_user_id = auth.uid()
  );

CREATE POLICY "Principal creates/updates focus items" ON public.focus_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_principal() OR public.is_ea());

CREATE POLICY "Principal updates focus items" ON public.focus_items
  FOR UPDATE TO authenticated
  USING (public.is_principal());

CREATE POLICY "Principal deletes focus items" ON public.focus_items
  FOR DELETE TO authenticated
  USING (public.is_principal());

-- FOCUS_ITEM_RESPONSES
CREATE POLICY "View focus responses" ON public.focus_item_responses
  FOR SELECT TO authenticated
  USING (
    public.is_principal() OR
    public.is_ea() OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.focus_items WHERE id = focus_item_id AND target_user_id = auth.uid())
  );

CREATE POLICY "Users respond to their focus items" ON public.focus_item_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.focus_items WHERE id = focus_item_id AND target_user_id = auth.uid())
  );

-- NOTES
CREATE POLICY "View notes" ON public.notes
  FOR SELECT TO authenticated
  USING (
    public.is_principal() OR
    public.is_ea() OR
    target_user_id = auth.uid()
  );

CREATE POLICY "Principal creates notes" ON public.notes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_principal() OR (public.is_ea() AND author_id = auth.uid()));

CREATE POLICY "Principal manages notes" ON public.notes
  FOR UPDATE TO authenticated
  USING (public.is_principal());

CREATE POLICY "Principal deletes notes" ON public.notes
  FOR DELETE TO authenticated
  USING (public.is_principal());

-- NOTE_REPLIES
CREATE POLICY "View note replies" ON public.note_replies
  FOR SELECT TO authenticated
  USING (
    public.is_principal() OR
    public.is_ea() OR
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND target_user_id = auth.uid())
  );

CREATE POLICY "Reply to notes" ON public.note_replies
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND (
      public.is_principal() OR
      EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND target_user_id = auth.uid())
    )
  );

-- TAGS
CREATE POLICY "View tags" ON public.tags
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Create tags" ON public.tags
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- WORK_ITEMS (complex - handles sensitive items and business visibility)
CREATE POLICY "View work items" ON public.work_items
  FOR SELECT TO authenticated
  USING (
    -- Principal sees all
    public.is_principal() OR
    -- EA sees all non-sensitive
    (public.is_ea() AND NOT is_sensitive) OR
    -- Owner sees their own
    owner_id = auth.uid() OR
    -- Business members see non-sensitive items in their business
    (NOT is_sensitive AND public.can_view_business(auth.uid(), business_id))
  );

CREATE POLICY "Create work items" ON public.work_items
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.is_principal());

CREATE POLICY "Update own work items" ON public.work_items
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_principal());

CREATE POLICY "Delete own work items" ON public.work_items
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.is_principal());

-- WORK_ITEM_TAGS
CREATE POLICY "View work item tags" ON public.work_item_tags
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.work_items wi
      WHERE wi.id = work_item_id AND (
        public.is_principal() OR
        (public.is_ea() AND NOT wi.is_sensitive) OR
        wi.owner_id = auth.uid() OR
        (NOT wi.is_sensitive AND public.can_view_business(auth.uid(), wi.business_id))
      )
    )
  );

CREATE POLICY "Manage work item tags" ON public.work_item_tags
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.work_items wi
      WHERE wi.id = work_item_id AND (wi.owner_id = auth.uid() OR public.is_principal())
    )
  );

-- WORK_ITEM_COMMENTS
CREATE POLICY "View work item comments" ON public.work_item_comments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.work_items wi
      WHERE wi.id = work_item_id AND (
        public.is_principal() OR
        (public.is_ea() AND NOT wi.is_sensitive) OR
        wi.owner_id = auth.uid() OR
        (NOT wi.is_sensitive AND public.can_view_business(auth.uid(), wi.business_id))
      )
    )
  );

CREATE POLICY "Add work item comments" ON public.work_item_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.work_items wi
      WHERE wi.id = work_item_id AND (
        public.is_principal() OR
        wi.owner_id = auth.uid() OR
        public.can_view_business(auth.uid(), wi.business_id)
      )
    )
  );

-- WORK_ITEM_ATTACHMENTS
CREATE POLICY "View work item attachments" ON public.work_item_attachments
  FOR SELECT TO authenticated
  USING (
    -- Google Drive links only visible to principal
    (is_google_drive_link AND public.is_principal()) OR
    -- Regular attachments follow work item visibility
    (NOT is_google_drive_link AND EXISTS (
      SELECT 1 FROM public.work_items wi
      WHERE wi.id = work_item_id AND (
        public.is_principal() OR
        (public.is_ea() AND NOT wi.is_sensitive) OR
        wi.owner_id = auth.uid() OR
        (NOT wi.is_sensitive AND public.can_view_business(auth.uid(), wi.business_id))
      )
    ))
  );

CREATE POLICY "Add attachments" ON public.work_item_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.work_items wi
      WHERE wi.id = work_item_id AND (wi.owner_id = auth.uid() OR public.is_principal())
    )
  );

-- QUICK_ACTIONS
CREATE POLICY "View quick actions" ON public.quick_actions
  FOR SELECT TO authenticated
  USING (
    public.is_principal() OR
    public.is_ea() OR
    from_user_id = auth.uid() OR
    to_user_id = auth.uid()
  );

CREATE POLICY "Create quick actions" ON public.quick_actions
  FOR INSERT TO authenticated
  WITH CHECK (
    from_user_id = auth.uid() OR
    (public.is_ea() AND via_user_id = auth.uid())
  );

CREATE POLICY "Update quick actions" ON public.quick_actions
  FOR UPDATE TO authenticated
  USING (
    to_user_id = auth.uid() OR
    from_user_id = auth.uid() OR
    public.is_principal()
  );

-- REMINDERS
CREATE POLICY "View reminders" ON public.reminders
  FOR SELECT TO authenticated
  USING (
    public.is_principal() OR
    public.is_ea() OR
    user_id = auth.uid()
  );

CREATE POLICY "Create reminders" ON public.reminders
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    created_by_id = auth.uid() OR
    public.is_principal() OR
    public.is_ea()
  );

CREATE POLICY "Update reminders" ON public.reminders
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_principal());

CREATE POLICY "Delete reminders" ON public.reminders
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_principal());

-- SUBMISSIONS
CREATE POLICY "View submissions" ON public.submissions
  FOR SELECT TO authenticated
  USING (
    public.is_principal() OR
    public.is_ea() OR
    user_id = auth.uid() OR
    -- GMs can see submissions from their business members
    (public.is_gm() AND EXISTS (
      SELECT 1 FROM public.business_memberships bm1
      JOIN public.business_memberships bm2 ON bm1.business_id = bm2.business_id
      WHERE bm1.user_id = auth.uid() AND bm2.user_id = submissions.user_id
        AND bm1.can_view_reports = true
    ))
  );

CREATE POLICY "Create/update own submissions" ON public.submissions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update own submissions" ON public.submissions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- SUBMISSION_ENTRIES
CREATE POLICY "View submission entries" ON public.submission_entries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_id AND (
        public.is_principal() OR
        public.is_ea() OR
        s.user_id = auth.uid() OR
        (public.is_gm() AND EXISTS (
          SELECT 1 FROM public.business_memberships bm1
          JOIN public.business_memberships bm2 ON bm1.business_id = bm2.business_id
          WHERE bm1.user_id = auth.uid() AND bm2.user_id = s.user_id
            AND bm1.can_view_reports = true
        ))
      )
    )
  );

CREATE POLICY "Create submission entries" ON public.submission_entries
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_id AND s.user_id = auth.uid()
    )
  );

-- PIPELINE_SNAPSHOTS
CREATE POLICY "View pipeline snapshots" ON public.pipeline_snapshots
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_id AND (
        public.is_principal() OR
        public.is_ea() OR
        s.user_id = auth.uid() OR
        (public.is_gm() AND EXISTS (
          SELECT 1 FROM public.business_memberships bm1
          JOIN public.business_memberships bm2 ON bm1.business_id = bm2.business_id
          WHERE bm1.user_id = auth.uid() AND bm2.user_id = s.user_id
            AND bm1.can_view_reports = true
        ))
      )
    )
  );

CREATE POLICY "Create pipeline snapshots" ON public.pipeline_snapshots
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_id AND s.user_id = auth.uid()
    )
  );

-- KEY_DEALS
CREATE POLICY "View key deals" ON public.key_deals
  FOR SELECT TO authenticated
  USING (
    public.is_principal() OR
    public.is_ea() OR
    user_id = auth.uid() OR
    (public.is_gm() AND EXISTS (
      SELECT 1 FROM public.business_memberships bm1
      JOIN public.business_memberships bm2 ON bm1.business_id = bm2.business_id
      WHERE bm1.user_id = auth.uid() AND bm2.user_id = key_deals.user_id
        AND bm1.can_view_reports = true
    ))
  );

CREATE POLICY "Manage own key deals" ON public.key_deals
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- WIN_LOSS_LOG
CREATE POLICY "View win loss log" ON public.win_loss_log
  FOR SELECT TO authenticated
  USING (
    public.is_principal() OR
    public.is_ea() OR
    user_id = auth.uid() OR
    (public.is_gm() AND EXISTS (
      SELECT 1 FROM public.business_memberships bm1
      JOIN public.business_memberships bm2 ON bm1.business_id = bm2.business_id
      WHERE bm1.user_id = auth.uid() AND bm2.user_id = win_loss_log.user_id
        AND bm1.can_view_reports = true
    ))
  );

CREATE POLICY "Create win loss entries" ON public.win_loss_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- MEETING_ITEMS
CREATE POLICY "View meeting items" ON public.meeting_items
  FOR SELECT TO authenticated
  USING (public.is_principal() OR public.is_ea());

CREATE POLICY "Principal manages meeting items" ON public.meeting_items
  FOR ALL TO authenticated
  USING (public.is_principal() OR public.is_ea());

-- DELEGATED_TASKS
CREATE POLICY "View delegated tasks" ON public.delegated_tasks
  FOR SELECT TO authenticated
  USING (
    public.is_principal() OR
    public.is_ea() OR
    assigned_to_id = auth.uid()
  );

CREATE POLICY "Principal creates delegated tasks" ON public.delegated_tasks
  FOR INSERT TO authenticated
  WITH CHECK (public.is_principal() OR public.is_ea());

CREATE POLICY "Update delegated tasks" ON public.delegated_tasks
  FOR UPDATE TO authenticated
  USING (assigned_to_id = auth.uid() OR public.is_principal());

-- NOTIFICATIONS
CREATE POLICY "View own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Mark notifications read" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System creates notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- INVITES
CREATE POLICY "View invites" ON public.invites
  FOR SELECT TO authenticated
  USING (public.is_principal() OR public.is_ea());

CREATE POLICY "Principal creates invites" ON public.invites
  FOR INSERT TO authenticated
  WITH CHECK (public.is_principal() OR public.is_ea());

CREATE POLICY "Update invites" ON public.invites
  FOR UPDATE TO authenticated
  USING (public.is_principal() OR public.is_ea());

-- SUBMISSION_STREAKS
CREATE POLICY "View own streak" ON public.submission_streaks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_principal() OR public.is_ea());

CREATE POLICY "System manages streaks" ON public.submission_streaks
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 8. SEED DATA - BUSINESSES
-- ============================================

INSERT INTO public.businesses (name, slug, description, color) VALUES
  ('Ultralift', 'ultralift', 'Ultralift manufacturing and operations', '#2B7DE0'),
  ('Westberg', 'westberg', 'Westberg manufacturing and operations', '#D45A35'),
  ('SPT', 'spt', 'SPT business unit', '#E8C547'),
  ('SE Digital', 'se_digital', 'SE Digital services', '#0EA5A0');

-- Create default tags
INSERT INTO public.tags (name, color) VALUES
  ('BlueScope', '#3B82F6'),
  ('CNC', '#8B5CF6'),
  ('Hiring', '#22C55E'),
  ('HR', '#F97316'),
  ('Quoting', '#E8C547'),
  ('Safety', '#EF4444'),
  ('Urgent', '#EF4444');