import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export function useTrackVisit() {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    const trackVisit = async () => {
      const sessionId = getSessionId();
      const visitTracked = sessionStorage.getItem('visit_tracked');
      
      if (!visitTracked) {
        await supabase.from('analytics').insert({
          event_type: 'visit',
          session_id: sessionId,
          user_agent: navigator.userAgent
        });
        sessionStorage.setItem('visit_tracked', 'true');
      }
    };

    trackVisit();
  }, []);
}

export function useTrackSession() {
  const startTime = useRef(Date.now());
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    const handleBeforeUnload = async () => {
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      
      // Use sendBeacon for reliable tracking on page unload
      const data = JSON.stringify({
        event_type: 'session',
        session_id: sessionId.current,
        duration_seconds: duration,
        user_agent: navigator.userAgent
      });

      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/analytics`,
        new Blob([data], { type: 'application/json' })
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Also track periodically every 30 seconds
    const interval = setInterval(async () => {
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      await supabase.from('analytics').insert({
        event_type: 'session',
        session_id: sessionId.current,
        duration_seconds: duration,
        user_agent: navigator.userAgent
      });
    }, 30000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
    };
  }, []);
}

export async function trackDownloadClick() {
  const sessionId = getSessionId();
  await supabase.from('analytics').insert({
    event_type: 'download_click',
    session_id: sessionId,
    user_agent: navigator.userAgent
  });
}

export interface DownloadClickDetail {
  id: string;
  created_at: string;
  session_id: string | null;
  session_duration_minutes: number;
}

export async function getDownloadClicksDetails(): Promise<DownloadClickDetail[]> {
  // Get all download clicks
  const { data: clicks } = await supabase
    .from('analytics')
    .select('id, created_at, session_id')
    .eq('event_type', 'download_click')
    .order('created_at', { ascending: false })
    .limit(100);

  if (!clicks) return [];

  // Get session durations for each click
  const sessionIds = [...new Set(clicks.map(c => c.session_id).filter(Boolean))];
  
  const { data: sessions } = await supabase
    .from('analytics')
    .select('session_id, duration_seconds')
    .eq('event_type', 'session')
    .in('session_id', sessionIds);

  // Get max duration per session
  const sessionDurations: { [key: string]: number } = {};
  sessions?.forEach(s => {
    if (s.session_id && s.duration_seconds) {
      if (!sessionDurations[s.session_id] || sessionDurations[s.session_id] < s.duration_seconds) {
        sessionDurations[s.session_id] = s.duration_seconds;
      }
    }
  });

  return clicks.map(click => ({
    id: click.id,
    created_at: click.created_at,
    session_id: click.session_id,
    session_duration_minutes: click.session_id 
      ? Math.round((sessionDurations[click.session_id] || 0) / 60 * 10) / 10
      : 0
  }));
}

export async function getAnalyticsStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get total visits
  const { count: totalVisits } = await supabase
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'visit');

  // Get download clicks
  const { count: downloadClicks } = await supabase
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'download_click');

  // Get average session duration
  const { data: sessions } = await supabase
    .from('analytics')
    .select('session_id, duration_seconds')
    .eq('event_type', 'session')
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Calculate average duration (get max duration per session, then average)
  const sessionDurations: { [key: string]: number } = {};
  sessions?.forEach(s => {
    if (s.session_id && s.duration_seconds) {
      if (!sessionDurations[s.session_id] || sessionDurations[s.session_id] < s.duration_seconds) {
        sessionDurations[s.session_id] = s.duration_seconds;
      }
    }
  });

  const durations = Object.values(sessionDurations);
  const avgDurationSeconds = durations.length > 0 
    ? durations.reduce((a, b) => a + b, 0) / durations.length 
    : 0;
  const avgDurationMinutes = Math.round(avgDurationSeconds / 60 * 10) / 10;

  // Get today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: todayVisits } = await supabase
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'visit')
    .gte('created_at', today.toISOString());

  const { count: todayClicks } = await supabase
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'download_click')
    .gte('created_at', today.toISOString());

  return {
    totalVisits: totalVisits || 0,
    downloadClicks: downloadClicks || 0,
    avgDurationMinutes,
    todayVisits: todayVisits || 0,
    todayClicks: todayClicks || 0
  };
}
