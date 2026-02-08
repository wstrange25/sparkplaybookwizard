// App Types for Spark Playbook

export type AppRole = 'principal' | 'ea' | 'gm' | 'manager' | 'sales';

export type BusinessType = 'ultralift' | 'westberg' | 'spt' | 'se_digital';

export type ItemCategory = 'win' | 'pain_point' | 'discussion' | 'critical_path';

export type ItemStatus = 'open' | 'in_progress' | 'blocked' | 'resolved';

export type ActionStatus = 'new' | 'seen' | 'in_progress' | 'done';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ReminderType = 'one_off' | 'recurring';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Business {
  id: string;
  name: string;
  slug: BusinessType;
  description: string | null;
  color: string;
  created_at: string;
}

export interface BusinessMembership {
  id: string;
  user_id: string;
  business_id: string;
  is_primary: boolean;
  can_view_reports: boolean;
  created_at: string;
}

export interface FocusItem {
  id: string;
  target_user_id: string;
  set_by_user_id: string | null;
  title: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FocusItemResponse {
  id: string;
  focus_item_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Note {
  id: string;
  target_user_id: string;
  author_id: string | null;
  content: string;
  is_acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

export interface NoteReply {
  id: string;
  note_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface WorkItem {
  id: string;
  owner_id: string;
  business_id: string | null;
  title: string;
  description: string | null;
  category: ItemCategory;
  priority: PriorityLevel;
  status: ItemStatus;
  due_date: string | null;
  blocked_reason: string | null;
  is_sensitive: boolean;
  is_flagged_for_meeting: boolean;
  is_escalated: boolean;
  escalated_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkItemComment {
  id: string;
  work_item_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

export interface WorkItemAttachment {
  id: string;
  work_item_id: string;
  uploaded_by: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  is_google_drive_link: boolean;
  created_at: string;
}

export interface QuickAction {
  id: string;
  from_user_id: string | null;
  to_user_id: string;
  content: string;
  status: ActionStatus;
  priority: PriorityLevel | null;
  due_date: string | null;
  via_user_id: string | null;
  seen_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  created_by_id: string | null;
  work_item_id: string | null;
  title: string;
  description: string | null;
  reminder_type: ReminderType;
  due_date: string;
  recurrence_rule: string | null;
  is_completed: boolean;
  completed_at: string | null;
  last_fired_at: string | null;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  business_id: string | null;
  week_ending: string;
  submitted_at: string | null;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmissionEntry {
  id: string;
  submission_id: string;
  work_item_id: string | null;
  category: ItemCategory;
  content: string;
  created_at: string;
}

export interface PipelineSnapshot {
  id: string;
  submission_id: string;
  active_quotes: number;
  total_pipeline_value: number;
  quotes_sent_this_week: number;
  closed_this_week: number;
  closed_value: number;
  created_at: string;
}

export interface KeyDeal {
  id: string;
  user_id: string;
  business_id: string | null;
  client_name: string;
  estimated_value: number | null;
  stage: string;
  expected_close_date: string | null;
  notes: string | null;
  is_active: boolean;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WinLossEntry {
  id: string;
  user_id: string;
  business_id: string | null;
  client_name: string;
  deal_value: number | null;
  margin_percent: number | null;
  is_win: boolean;
  reason: string | null;
  closed_at: string;
  created_at: string;
}

export interface MeetingItem {
  id: string;
  work_item_id: string | null;
  meeting_date: string | null;
  display_order: number;
  context_notes: string | null;
  outcome: string | null;
  outcome_recorded_at: string | null;
  carry_forward_count: number;
  is_addressed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DelegatedTask {
  id: string;
  assigned_to_id: string;
  assigned_by_id: string | null;
  source_type: string | null;
  source_id: string | null;
  description: string;
  status: ActionStatus;
  due_date: string | null;
  acknowledged_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string | null;
  link: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Invite {
  id: string;
  email: string;
  role: AppRole;
  business_ids: string[];
  invited_by_id: string | null;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface SubmissionStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_submission_week: string | null;
  updated_at: string;
}

// Extended types with relationships
export interface ProfileWithRole extends Profile {
  user_roles: UserRole[];
  business_memberships: (BusinessMembership & { business: Business })[];
}

export interface WorkItemWithRelations extends WorkItem {
  owner?: Profile;
  business?: Business;
  tags?: Tag[];
  comments?: WorkItemComment[];
  attachments?: WorkItemAttachment[];
}

export interface QuickActionWithUsers extends QuickAction {
  from_user?: Profile;
  to_user?: Profile;
  via_user?: Profile;
}

export interface FocusItemWithResponses extends FocusItem {
  responses: (FocusItemResponse & { user: Profile })[];
  set_by_user?: Profile;
}

export interface NoteWithReplies extends Note {
  replies: (NoteReply & { user: Profile })[];
  author?: Profile;
}

// UI helper types
export interface BusinessColor {
  ultralift: string;
  westberg: string;
  spt: string;
  se_digital: string;
}

export const BUSINESS_COLORS: BusinessColor = {
  ultralift: '#2B7DE0',
  westberg: '#D45A35',
  spt: '#E8C547',
  se_digital: '#0EA5A0',
};

export const STATUS_COLORS = {
  open: '#3B82F6',
  in_progress: '#E8C547',
  blocked: '#EF4444',
  resolved: '#22C55E',
};

export const PRIORITY_COLORS = {
  low: '#A1A1AA',
  medium: '#E8C547',
  high: '#F97316',
  critical: '#EF4444',
};

export const CATEGORY_LABELS = {
  win: 'Win',
  pain_point: 'Pain Point',
  discussion: 'Discussion',
  critical_path: 'Critical Path',
};

export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  resolved: 'Resolved',
};

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const ACTION_STATUS_LABELS = {
  new: 'New',
  seen: 'Seen',
  in_progress: 'In Progress',
  done: 'Done',
};
