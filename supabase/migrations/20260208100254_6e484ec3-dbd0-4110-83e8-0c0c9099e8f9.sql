-- Fix permissive RLS policies for tags and notifications

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Create tags" ON public.tags;
DROP POLICY IF EXISTS "System creates notifications" ON public.notifications;

-- Tags: Only authenticated users can create, but with proper check
CREATE POLICY "Authenticated users create tags" ON public.tags
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Any authenticated user can create tags (this is intentional per spec)
    -- Tags are shared across the system
    auth.uid() IS NOT NULL
  );

-- Notifications: Only system/service role should create notifications
-- In practice, this will be done via edge functions with service role
-- For now, allow only principal, EA, or the user themselves to create notifications for the user
CREATE POLICY "Create notifications for users" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Principal and EA can create notifications for anyone
    public.is_principal() OR
    public.is_ea() OR
    -- Users can only create notifications for themselves (for self-reminders etc)
    user_id = auth.uid()
  );