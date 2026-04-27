import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Zap } from 'lucide-react';

interface TabSwitchStats {
  reason: string;
  count: number;
  avgDuration: number;
  totalDuration: number;
}

export function TabSwitchAnalysis() {
  const [stats, setStats] = useState<TabSwitchStats[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSwitches, setTotalSwitches] = useState(0);
  const [avgDuration, setAvgDuration] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: switches } = await supabase
      .from('tab_switch_details')
      .select('*')
      .eq('user_id', user.id)
      .order('switched_at', { ascending: false })
      .limit(500);

    if (switches && switches.length > 0) {
      // Calculate reason statistics
      const reasonMap: Record<string, TabSwitchStats> = {};

      switches.forEach((sw) => {
        const reason = sw.reason || 'Unknown';
        if (!reasonMap[reason]) {
          reasonMap[reason] = {
            reason,
            count: 0,
            avgDuration: 0,
            totalDuration: 0,
          };
        }
        reasonMap[reason].count += 1;
        reasonMap[reason].totalDuration += sw.actual_duration_seconds || 0;
      });

      Object.keys(reasonMap).forEach((key) => {
        reasonMap[key].avgDuration = Math.round(reasonMap[key].totalDuration / reasonMap[key].count);
      });

      const sortedStats = Object.values(reasonMap).sort((a, b) => b.count - a.count);
      setStats(sortedStats);
      setTotalSwitches(switches.length);
      setAvgDuration(Math.round(switches.reduce((acc, sw) => acc + (sw.actual_duration_seconds || 0), 0) / switches.length));

      // Calculate daily switches for trend
      const dailyMap: Record<string, number> = {};
      switches.forEach((sw) => {
        const date = new Date(sw.switched_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        dailyMap[date] = (dailyMap[date] || 0) + 1;
      });

      const dailyTrend = Object.entries(dailyMap)
        .map(([date, count]) => ({ date, switches: count }))
        .reverse()
        .slice(-14);

      setDailyData(dailyTrend);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Loading tab switch data...</p>
        </div>
      </div>
    );
  }

  const colors = ['#3b82f6', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Tab Switch Analysis</h1>
        <p className="text-gray-400">Understand your distraction patterns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Tab Switches</p>
              <p className="text-4xl font-bold text-blue-400">{totalSwitches}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Average Duration</p>
              <p className="text-4xl font-bold text-cyan-400">{avgDuration}s</p>
            </div>
            <Clock className="w-12 h-12 text-cyan-500/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Top Reason</p>
              <p className="text-lg font-bold text-orange-400">{stats.length > 0 ? stats[0].reason : 'No data'}</p>
            </div>
            <Zap className="w-12 h-12 text-orange-500/30" />
          </div>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-lg">No tab switch data yet. Start a focus session to track your patterns.</p>
        </div>
      ) : (
        <>
          {/* Reasons Breakdown */}
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Reasons for Switching</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="reason" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats}
                    dataKey="count"
                    nameKey="reason"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">14-Day Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="switches"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Tab Switches"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Stats Table */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Detailed Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Reason</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Count</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Avg Duration</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Total Duration</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat, idx) => (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                      <td className="py-3 px-4 text-white">{stat.reason}</td>
                      <td className="text-center py-3 px-4 text-blue-400 font-semibold">{stat.count}</td>
                      <td className="text-center py-3 px-4 text-gray-400">{stat.avgDuration}s</td>
                      <td className="text-center py-3 px-4 text-gray-400">{Math.round(stat.totalDuration / 60)}m {stat.totalDuration % 60}s</td>
                      <td className="text-center py-3 px-4 text-gray-400">
                        {Math.round((stat.count / totalSwitches) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
