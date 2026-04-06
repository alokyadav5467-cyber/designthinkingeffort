interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export function MetricCard({ title, value, subtitle, trend, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/20',
    green: 'from-green-500/10 to-green-600/10 border-green-500/20',
    yellow: 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/20',
    red: 'from-red-500/10 to-red-600/10 border-red-500/20',
    gray: 'from-gray-500/10 to-gray-600/10 border-gray-500/20',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses] || colorClasses.gray} backdrop-blur-sm border rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-xl`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {trend && (
          <span className="text-2xl opacity-50">
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </div>
  );
}
