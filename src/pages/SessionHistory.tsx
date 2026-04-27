import { useState, useEffect } from 'react';
import { ChevronDown, Clock, Target, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Session, TabSwitchDetail } from '../types';

interface ExpandedSession {
  session: Session;
  tabSwitches: TabSwitchDetail[];
}

export function SessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<ExpandedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    // Apply date filter
    const now = new Date();
    if (filter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      query = query.gte('created_at', today);
    } else if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', monthAgo);
    }

    const { data } = await query.limit(50);
    setSessions(data || []);
    setLoading(false);
  };

  const handleExpandSession = async (sessionId: string) => {
    if (expandedId === sessionId) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }

    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const { data: tabSwitches } = await supabase
      .from('tab_switch_details')
      .select('*')
      .eq('session_id', sessionId)
      .order('switched_at', { ascending: true });

    setExpandedId(sessionId);
    setExpandedData({
      session,
      tabSwitches: tabSwitches || [],
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const formatTimeOfDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Loading session history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Session History</h1>
        <p className="text-gray-400">View detailed breakdowns of all your focus sessions</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {(['all', 'today', 'week', 'month'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700 rounded-2xl p-12 text-center">
          <p className="text-gray-400">No sessions found for this period.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id}>
              <button
                onClick={() => handleExpandSession(session.id)}
                className="w-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700 hover:border-gray-600 rounded-xl p-4 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{session.task_name}</h3>
                      <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full">
                        {formatDate(session.created_at)}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Time</p>
                        <p className="text-sm text-gray-300 font-medium">
                          {formatTimeOfDay(session.started_at)} - {formatTimeOfDay(session.ended_at || '')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="text-sm text-gray-300 font-medium">
                          {formatTime(session.total_duration)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Focus Score</p>
                        <p className={`text-sm font-semibold ${
                          session.focus_score >= 80
                            ? 'text-green-400'
                            : session.focus_score >= 60
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}>
                          {Math.round(session.focus_score)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tab Switches</p>
                        <p className="text-sm text-gray-300 font-medium">{session.tab_switch_count}</p>
                      </div>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === session.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === session.id && expandedData && (
                <div className="bg-gray-900/50 border border-gray-700 border-t-0 rounded-b-xl p-6 space-y-6">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Total Duration</p>
                      <p className="text-lg font-bold text-blue-400">
                        {formatTime(session.total_duration)}
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Focus Time</p>
                      <p className="text-lg font-bold text-green-400">
                        {formatTime(session.focus_time)}
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Avoidance Time</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {formatTime(session.avoidance_time)}
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Idle Time</p>
                      <p className="text-lg font-bold text-gray-400">
                        {formatTime(session.idle_time)}
                      </p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Focus Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">Focus</span>
                          <span className="text-green-400 font-semibold">
                            {Math.round((session.focus_time / session.total_duration) * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{
                              width: `${(session.focus_time / session.total_duration) * 100}%`,
                            }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs mt-3">
                          <span className="text-gray-400">Avoidance</span>
                          <span className="text-yellow-400 font-semibold">
                            {Math.round((session.avoidance_time / session.total_duration) * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500"
                            style={{
                              width: `${(session.avoidance_time / session.total_duration) * 100}%`,
                            }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs mt-3">
                          <span className="text-gray-400">Idle</span>
                          <span className="text-gray-400 font-semibold">
                            {Math.round((session.idle_time / session.total_duration) * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-500"
                            style={{
                              width: `${(session.idle_time / session.total_duration) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-4">Key Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Focus Score</span>
                          <span className="text-green-400 font-semibold">
                            {Math.round(session.focus_score)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Effort Accuracy</span>
                          <span className="text-blue-400 font-semibold">
                            {Math.round(session.effort_accuracy)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tab Switches</span>
                          <span className="text-yellow-400 font-semibold">
                            {session.tab_switch_count}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Interruptions</span>
                          <span className="text-orange-400 font-semibold">
                            {session.interruption_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tab Switches Details */}
                  {expandedData.tabSwitches.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">
                        Tab Switches ({expandedData.tabSwitches.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {expandedData.tabSwitches.map((ts, idx) => (
                          <div
                            key={ts.id}
                            className="bg-gray-800/30 rounded-lg p-3 text-xs space-y-1"
                          >
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Switch #{idx + 1} at {formatTimeOfDay(ts.switched_at)}
                              </span>
                              <span className="text-gray-500">
                                Duration: {Math.round(ts.actual_duration_seconds / 60)}m{' '}
                                {ts.actual_duration_seconds % 60}s
                              </span>
                            </div>
                            <div className="text-gray-300">
                              <span className="font-medium">Reason:</span> {ts.reason || 'Not specified'}
                            </div>
                            {ts.destination_url && (
                              <div className="text-gray-400">
                                <span className="font-medium">Destination:</span> {ts.destination_url}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
