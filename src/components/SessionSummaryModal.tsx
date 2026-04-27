import { useState, useEffect } from 'react';
import { X, Flame, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Session, TabSwitchDetail } from '../types';

interface SessionSummaryModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionSummaryModal({ session, isOpen, onClose }: SessionSummaryModalProps) {
  const [tabSwitches, setTabSwitches] = useState<TabSwitchDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && session) {
      fetchTabSwitches();
    }
  }, [isOpen, session]);

  const fetchTabSwitches = async () => {
    const { data } = await supabase
      .from('tab_switch_details')
      .select('*')
      .eq('session_id', session.id)
      .order('switched_at', { ascending: true });

    setTabSwitches(data || []);
    setLoading(false);
  };

  if (!isOpen || !session) return null;

  const focusPercentage = Math.round(session.focus_score);
  const avoidancePercentage = Math.round(session.avoidance_time / (session.total_duration || 1) * 100);
  const idlePercentage = Math.round(session.idle_time / (session.total_duration || 1) * 100);
  const planVsActual = Math.round(session.effort_accuracy);

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getRecommendations = () => {
    const recommendations = [];

    if (focusPercentage < 50) {
      recommendations.push({
        icon: AlertCircle,
        text: 'Focus was low. Try removing distractions or shorter sessions.',
        color: 'text-red-400',
      });
    } else if (focusPercentage >= 80) {
      recommendations.push({
        icon: CheckCircle,
        text: 'Excellent focus! You maintained high concentration.',
        color: 'text-green-400',
      });
    }

    if (session.tab_switch_count > 5) {
      recommendations.push({
        icon: AlertCircle,
        text: `${session.tab_switch_count} tab switches detected. Try to minimize distractions.`,
        color: 'text-yellow-400',
      });
    }

    if (planVsActual > 100) {
      recommendations.push({
        icon: TrendingUp,
        text: 'You focused longer than planned! Great effort.',
        color: 'text-blue-400',
      });
    }

    return recommendations;
  };

  const getMostCommonReason = () => {
    if (tabSwitches.length === 0) return null;
    const reasonCounts: Record<string, number> = {};
    tabSwitches.forEach(ts => {
      if (ts.reason) {
        reasonCounts[ts.reason] = (reasonCounts[ts.reason] || 0) + 1;
      }
    });
    const mostCommon = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
    return mostCommon ? { reason: mostCommon[0], count: mostCommon[1] } : null;
  };

  const recommendations = getRecommendations();
  const mostCommonReason = getMostCommonReason();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-8 h-8 text-orange-400" />
              <h2 className="text-3xl font-bold text-white">Session Complete!</h2>
            </div>
            <p className="text-gray-400">{session.task_name}</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Focus Score</p>
              <p className="text-3xl font-bold text-green-400">{focusPercentage}%</p>
              <p className="text-xs text-gray-500 mt-2">Focus time maintained</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Effort Accuracy</p>
              <p className="text-3xl font-bold text-blue-400">{planVsActual}%</p>
              <p className="text-xs text-gray-500 mt-2">Planned vs actual effort</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Tab Switches</p>
              <p className="text-3xl font-bold text-yellow-400">{session.tab_switch_count}</p>
              <p className="text-xs text-gray-500 mt-2">Times changed focus</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Interruptions</p>
              <p className="text-3xl font-bold text-purple-400">{session.interruption_count}</p>
              <p className="text-xs text-gray-500 mt-2">Times paused</p>
            </div>
          </div>

          {/* Time Breakdown */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Time Breakdown</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Focus Time</span>
                  <span className="text-green-400 font-medium">{focusPercentage}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${focusPercentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Avoidance/Distraction</span>
                  <span className="text-yellow-400 font-medium">{avoidancePercentage}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                    style={{ width: `${avoidancePercentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Idle Time</span>
                  <span className="text-blue-400 font-medium">{idlePercentage}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    style={{ width: `${idlePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Switches Insights */}
          {tabSwitches.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Tab Switch Insights</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {tabSwitches.map((ts, idx) => {
                  const switchedTime = new Date(ts.switched_at).toLocaleTimeString();
                  const duration = ts.actual_duration_seconds;
                  return (
                    <div key={ts.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-gray-400">Switch #{idx + 1}</span>
                        <span className="text-gray-500">{switchedTime}</span>
                      </div>
                      <p className="text-white font-medium mb-1">{ts.reason || 'No reason recorded'}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Planned: {ts.planned_duration_minutes}m</span>
                        <span>Actual: {formatSeconds(duration)}</span>
                        {ts.destination_url && <span>{ts.destination_url}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {mostCommonReason && (
                <div className="mt-4 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-400">
                    Most common reason: <span className="font-semibold">{mostCommonReason.reason}</span> ({mostCommonReason.count} times)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => {
                  const Icon = rec.icon;
                  return (
                    <div key={idx} className="flex gap-3 items-start p-3 bg-gray-800/50 rounded-lg">
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${rec.color}`} />
                      <p className="text-gray-300 text-sm">{rec.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
