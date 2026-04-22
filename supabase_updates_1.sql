-- Stage 1: Database Updates

-- Add following_count to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count int DEFAULT 0;

-- Table: notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_username text,
  sender_avatar text,
  type text NOT NULL, -- 'follow', 'live', 'viewer_milestone'
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update is_read on their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
