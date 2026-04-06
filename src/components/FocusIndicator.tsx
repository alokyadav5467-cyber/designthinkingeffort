import type { FocusState } from '../types';

interface FocusIndicatorProps {
  state: FocusState;
  size?: 'sm' | 'md' | 'lg';
}

export function FocusIndicator({ state, size = 'md' }: FocusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const stateConfig = {
    focused: {
      color: 'bg-green-500',
      label: 'Focused',
      textColor: 'text-green-400',
    },
    distracted: {
      color: 'bg-yellow-500',
      label: 'Distracted',
      textColor: 'text-yellow-400',
    },
    idle: {
      color: 'bg-red-500',
      label: 'Idle',
      textColor: 'text-red-400',
    },
  };

  const config = stateConfig[state];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`${sizeClasses[size]} ${config.color} rounded-full`} />
        <div className={`absolute inset-0 ${config.color} rounded-full animate-ping opacity-75`} />
      </div>
      <span className={`font-medium ${config.textColor}`}>{config.label}</span>
    </div>
  );
}
