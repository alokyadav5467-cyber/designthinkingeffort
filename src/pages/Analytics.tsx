import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { supabase } from '../lib/supabase';
import type { Session } from '../types';

export function Analytics() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(30);

    if (data) {
      setSessions(data);
      generateInsights(data);
    }
  };

  const generateInsights = (sessionData: Session[]) => {
    const newInsights: string[] = [];

    if (sessionData.length === 0) return;

    const avgFocusTime = sessionData.reduce((sum, s) => sum + s.focus_time, 0) / sessionData.length / 60;
    const avgAvoidanceTime = sessionData.reduce((sum, s) => sum + s.avoidance_time, 0) / sessionData.length / 60;
    const avgTabSwitches = sessionData.reduce((sum, s) => sum + s.tab_switch_count, 0) / sessionData.length;

    if (avgFocusTime > 0) {
      newInsights.push(`You maintain focus for an average of ${avgFocusTime.toFixed(1)} minutes per session`);
    }

    if (avgAvoidanceTime > avgFocusTime * 0.5) {
      newInsights.push(`Your avoidance time is ${((avgAvoidanceTime / avgFocusTime) * 100).toFixed(0)}% of your focus time`);
    }

    if (avgTabSwitches > 5) {
      newInsights.push(`High tab switching detected: ${avgTabSwitches.toFixed(1)} switches per session on average`);
    }

    const recentSessions = sessionData.slice(0, 5);
    const olderSessions = sessionData.slice(5, 10);
    if (recentSessions.length > 0 && olderSessions.length > 0) {
      const recentAvg = recentSessions.reduce((sum, s) => sum + s.effort_accuracy, 0) / recentSessions.length;
      const olderAvg = olderSessions.reduce((sum, s) => sum + s.effort_accuracy, 0) / olderSessions.length;
      const change = recentAvg - olderAvg;
      if (Math.abs(change) > 5) {
        newInsights.push(
          `Your effort accuracy has ${change > 0 ? 'improved' : 'decreased'} by ${Math.abs(change).toFixed(1)}% recently`
        );
      }
    }

    setInsights(newInsights);
  };

  const effortVsAvoidanceData = sessions.slice(0, 7).reverse().map((session, idx) => ({
    name: `Session ${idx + 1}`,
    Focus: Math.round(session.focus_time / 60),
    Avoidance: Math.round(session.avoidance_time / 60),
    Idle: Math.round(session.idle_time / 60),
  }));

  const sessionBreakdownData = sessions.length > 0 ? [
    { name: 'Focus Time', value: sessions.reduce((sum, s) => sum + s.focus_time, 0), color: '#10b981' },
    { name: 'Avoidance Time', value: sessions.reduce((sum, s) => sum + s.avoidance_time, 0), color: '#f59e0b' },
    { name: 'Idle Time', value: sessions.reduce((sum, s) => sum + s.idle_time, 0), color: '#ef4444' },
  ] : [];

  const focusTrendData = sessions.slice(0, 14).reverse().map((session, idx) => ({
    name: `Day ${idx + 1}`,
    score: session.focus_score,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Deep insights into your focus patterns</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-lg">No data available yet</p>
          <p className="text-gray-500 mt-2">Complete some focus sessions to see analytics</p>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Effort vs Avoidance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={effortVsAvoidanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Bar dataKey="Focus" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Avoidance" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Idle" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Session Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sessionBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sessionBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Focus Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={focusTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} label={{ value: 'Score %', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Pattern Detection</h2>
            {insights.length > 0 ? (
              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <p className="text-gray-300">{insight}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Not enough data to generate insights yet</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
