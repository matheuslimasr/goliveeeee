-- Create table for analytics
CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'visit', 'download_click', 'session'
  session_id TEXT,
  duration_seconds INTEGER, -- for session events
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics (anonymous tracking)
CREATE POLICY "Anyone can insert analytics"
ON public.analytics
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can read analytics
CREATE POLICY "Authenticated users can read analytics"
ON public.analytics
FOR SELECT
TO authenticated
USING (true);

-- Create index for faster queries
CREATE INDEX idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX idx_analytics_created_at ON public.analytics(created_at DESC);