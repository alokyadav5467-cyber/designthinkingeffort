import { useInsights } from '../hooks/useInsights';
import { useStreak } from '../hooks/useStreak';
import {
  AlertCircle,
  Zap,
  Trophy,
  TrendingUp,
  CheckCircle,
  Flame,
  Target,
  Clock,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  AlertCircle,
  Zap,
  Trophy,
  TrendingUp,
  CheckCircle,
  Flame,
  Target,
  Clock,
};

export function SmartInsights() {
  const { insights, loading } = useInsights();
  const { streak } = useStreak();

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30';
      case 'warning':
        return 'bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30';
      case 'neutral':
        return 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30';
      case 'tip':
        return 'bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border border-yellow-500/30';
      default:
        return 'bg-gradient-to-br from-gray-600/20 to-gray-700/20 border border-gray-500/30';
    }
  };

  const getTitleColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-400';
      case 'warning':
        return 'text-red-400';
      case 'neutral':
        return 'text-blue-400';
      case 'tip':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-500';
      case 'warning':
        return 'text-red-500';
      case 'neutral':
        return 'text-blue-500';
      case 'tip':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Analyzing your patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Smart Insights</h1>
        <p className="text-gray-400">Personalized recommendations based on your focus patterns</p>
      </div>

      {/* Streak Card */}
      {streak && (
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Current Streak</h2>
              <p className="text-6xl font-bold text-purple-400 mb-2">{streak.current_streak} days</p>
              <p className="text-gray-400">
                Longest streak: <span className="text-purple-300 font-semibold">{streak.longest_streak} days</span>
              </p>
            </div>
            <Flame className="w-24 h-24 text-purple-500/30" />
          </div>
        </div>
      )}

      {/* Insights Grid */}
      {insights.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-lg">
            Complete more focus sessions to get personalized insights and recommendations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight) => {
            const IconComponent = iconMap[insight.icon];
            return (
              <div
                key={insight.id}
                className={`rounded-2xl p-6 transition-all hover:shadow-lg ${getTypeStyles(insight.type)}`}
              >
                <div className="flex gap-4">
                  {IconComponent && (
                    <div className="flex-shrink-0">
                      <IconComponent className={`w-8 h-8 ${getIconColor(insight.type)} mt-1`} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${getTitleColor(insight.type)}`}>
                      {insight.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-white mb-4">How to Improve Your Focus</h2>
        <ul className="space-y-3 text-gray-300">
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Use the Pomodoro technique: 25 minutes focus + 5 minute breaks</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold">2.</span>
            <span>Turn off notifications during focus sessions</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold">3.</span>
            <span>Identify your peak focus hours and schedule deep work then</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold">4.</span>
            <span>Track why you switch tabs to identify and eliminate distractions</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold">5.</span>
            <span>Build streaks for consistency - even one session per day adds up</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
