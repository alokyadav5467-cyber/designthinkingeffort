import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '../types';

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'neutral' | 'tip';
  icon: string;
}

export function useInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(30);

    const { data: tabSwitches } = await supabase
      .from('tab_switch_details')
      .select('*')
      .eq('user_id', user.id)
      .order('switched_at', { ascending: false })
      .limit(100);

    const { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const newInsights: Insight[] = [];

    if (sessions && sessions.length > 0) {
      // Calculate averages
      const avgFocusScore = sessions.reduce((acc, s) => acc + s.focus_score, 0) / sessions.length;
      const avgEffortAccuracy = sessions.reduce((acc, s) => acc + s.effort_accuracy, 0) / sessions.length;
      const avgTabSwitches = sessions.reduce((acc, s) => acc + s.tab_switch_count, 0) / sessions.length;

      // Find best and worst performing hours
      const hourPerformance: Record<number, number[]> = {};
      sessions.forEach((s) => {
        const hour = new Date(s.started_at).getHours();
        if (!hourPerformance[hour]) hourPerformance[hour] = [];
        hourPerformance[hour].push(s.focus_score);
      });

      const hourAverages = Object.entries(hourPerformance).map(([hour, scores]) => ({
        hour: parseInt(hour),
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      }));

      if (hourAverages.length > 0) {
        hourAverages.sort((a, b) => b.avg - a.avg);
        const bestHour = hourAverages[0];
        const worstHour = hourAverages[hourAverages.length - 1];

        newInsights.push({
          id: 'best-hour',
          title: `Best Focus Time: ${bestHour.hour}:00`,
          description: `You achieve ${Math.round(bestHour.avg)}% focus between ${bestHour.hour}:00 and ${bestHour.hour + 1}:00. Schedule important tasks during this time.`,
          type: 'positive',
          icon: 'Zap',
        });

        if (worstHour.avg < 40) {
          newInsights.push({
            id: 'worst-hour',
            title: `Avoid ${worstHour.hour}:00 for Focus`,
            description: `Your focus drops to ${Math.round(worstHour.avg)}% between ${worstHour.hour}:00 and ${worstHour.hour + 1}:00. Consider lighter tasks during this time.`,
            type: 'warning',
            icon: 'AlertCircle',
          });
        }
      }

      // Focus score insights
      if (avgFocusScore >= 80) {
        newInsights.push({
          id: 'high-focus',
          title: 'Excellent Focus Consistency',
          description: `Your average focus score is ${Math.round(avgFocusScore)}%. You're maintaining strong concentration. Keep up the great work!`,
          type: 'positive',
          icon: 'Trophy',
        });
      } else if (avgFocusScore >= 60) {
        newInsights.push({
          id: 'good-focus',
          title: 'Good Focus Performance',
          description: `Your focus averages ${Math.round(avgFocusScore)}%. Try minimizing distractions to push above 80%.`,
          type: 'neutral',
          icon: 'TrendingUp',
        });
      } else if (avgFocusScore < 50) {
        newInsights.push({
          id: 'low-focus',
          title: 'Focus Needs Improvement',
          description: `Your focus is at ${Math.round(avgFocusScore)}%. Try shorter sessions, disable notifications, or use focus blockers.`,
          type: 'warning',
          icon: 'AlertCircle',
        });
      }

      // Tab switching insights
      if (avgTabSwitches > 5) {
        newInsights.push({
          id: 'high-switches',
          title: 'High Tab Switch Rate',
          description: `You switch tabs ${Math.round(avgTabSwitches)} times per session. This breaks focus. Try setting a rule: switch only after 25 minutes.`,
          type: 'warning',
          icon: 'AlertCircle',
        });
      } else if (avgTabSwitches < 2) {
        newInsights.push({
          id: 'low-switches',
          title: 'Great Focus Discipline',
          description: `You only switch tabs ${Math.round(avgTabSwitches)} times per session. This is excellent discipline.`,
          type: 'positive',
          icon: 'CheckCircle',
        });
      }

      // Effort accuracy insights
      if (avgEffortAccuracy > 100) {
        newInsights.push({
          id: 'overachiever',
          title: 'You Consistently Overdeliver',
          description: `Your effort accuracy is ${Math.round(avgEffortAccuracy)}%, meaning you focus more than you plan. Great dedication!`,
          type: 'positive',
          icon: 'Flame',
        });
      } else if (avgEffortAccuracy < 60) {
        newInsights.push({
          id: 'planning-gap',
          title: 'Plan More Realistically',
          description: `Your effort accuracy is ${Math.round(avgEffortAccuracy)}%. You're not hitting your planned focus time. Try reducing planned duration.`,
          type: 'tip',
          icon: 'Target',
        });
      }

      // Streak insights
      if (streak) {
        if (streak.current_streak >= 7) {
          newInsights.push({
            id: 'streak-milestone',
            title: `${streak.current_streak}-Day Streak!`,
            description: `You've maintained focus for ${streak.current_streak} days straight. Keep building that habit!`,
            type: 'positive',
            icon: 'Flame',
          });
        } else if (streak.current_streak === 0 && sessions.length > 0) {
          newInsights.push({
            id: 'restart-streak',
            title: 'Ready to Build a Streak',
            description: `Complete a session today to start your streak. Building consistency is key to productivity.`,
            type: 'tip',
            icon: 'Target',
          });
        }
      }

      // Tab switch reasons insights
      if (tabSwitches && tabSwitches.length > 0) {
        const reasonCounts: Record<string, number> = {};
        tabSwitches.forEach((ts) => {
          if (ts.reason) {
            reasonCounts[ts.reason] = (reasonCounts[ts.reason] || 0) + 1;
          }
        });

        const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
        if (topReason) {
          const percentage = Math.round((topReason[1] / tabSwitches.length) * 100);
          if (topReason[0].toLowerCase().includes('distraction')) {
            newInsights.push({
              id: 'distraction-pattern',
              title: `${percentage}% of Switches are Distractions`,
              description: `Your main distraction is "${topReason[0]}". Try removing triggers or blocking access to this during focus sessions.`,
              type: 'warning',
              icon: 'AlertCircle',
            });
          } else if (topReason[0].toLowerCase().includes('break')) {
            newInsights.push({
              id: 'break-pattern',
              title: `Frequent Break-Taking (${percentage}%)`,
              description: `You take breaks often. This is good for sustainability, but consider longer focus blocks (30-50 min) for deep work.`,
              type: 'neutral',
              icon: 'Clock',
            });
          }
        }
      }
    }

    setInsights(newInsights.slice(0, 8)); // Limit to 8 insights
    setLoading(false);
  };

  return { insights, loading };
}
