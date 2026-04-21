import { LayoutDashboard, Timer, BarChart3, Brain, Settings, LogOut, User } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user?: SupabaseUser | null;
  onSignOut?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'session', label: 'Session', icon: Timer },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'psychology', label: 'Psychology', icon: Brain },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Navigation({ currentPage, onNavigate, user, onSignOut }: NavigationProps) {
  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-black/40 backdrop-blur-md border-r border-white/10 p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Effort Mirror
        </h1>
        <p className="text-xs text-gray-500 mt-1">Behavioral Focus Tracker</p>
      </div>

      <div className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {user && (
        <div className="mb-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.email}
              </p>
              <p className="text-xs text-gray-400">Logged in</p>
            </div>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      )}

      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20">
        <p className="text-xs text-gray-400 italic leading-relaxed">
          "The problem was never lack of effort. It was invisible avoidance."
        </p>
      </div>
    </nav>
  );
}
