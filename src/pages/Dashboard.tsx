import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MetricCard } from '../components/MetricCard';
import type { Session } from '../types';

export function Dashboard() {
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgFocusScore: 0,
    totalFocusTime: 0,
    avgEffortAccuracy: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10);

    if (sessions) {
      setRecentSessions(sessions);

      const totalSessions = sessions.length;
      const avgFocusScore = sessions.reduce((sum, s) => sum + s.focus_score, 0) / totalSessions || 0;
      const totalFocusTime = sessions.reduce((sum, s) => sum + s.focus_time, 0);
      const avgEffortAccuracy = sessions.reduce((sum, s) => sum + s.effort_accuracy, 0) / totalSessions || 0;

      setStats({
        totalSessions,
        avgFocusScore,
        totalFocusTime,
        avgEffortAccuracy,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your productivity metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sessions"
          value={stats.totalSessions}
          color="blue"
        />
        <MetricCard
          title="Average Focus Score"
          value={`${stats.avgFocusScore.toFixed(1)}%`}
          color="green"
        />
        <MetricCard
          title="Total Focus Time"
          value={formatTime(stats.totalFocusTime)}
          color="blue"
        />
        <MetricCard
          title="Effort Accuracy"
          value={`${stats.avgEffortAccuracy.toFixed(1)}%`}
          color={stats.avgEffortAccuracy >= 80 ? 'green' : stats.avgEffortAccuracy >= 50 ? 'yellow' : 'red'}
        />
      </div>

      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Sessions</h2>

        {recentSessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No sessions yet</p>
            <p className="text-sm text-gray-500">Start your first focus session to begin tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{session.task_name}</h3>
                  <span className="text-sm text-gray-400">
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Duration</p>
                    <p className="text-white font-medium">{formatTime(session.total_duration)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Focus Time</p>
                    <p className="text-green-400 font-medium">{formatTime(session.focus_time)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Focus Score</p>
                    <p className="text-blue-400 font-medium">{session.focus_score.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Effort Accuracy</p>
                    <p className="text-cyan-400 font-medium">{session.effort_accuracy.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-4">Cognitive Honesty Score</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {stats.avgEffortAccuracy.toFixed(0)}
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${Math.min(stats.avgEffortAccuracy, 100)}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          Your Cognitive Honesty Score measures how accurately you estimate your own effort.
          Higher scores indicate better self-awareness of actual focus time versus perceived effort.
        </p>
      </div>
    </div>
  );
}
