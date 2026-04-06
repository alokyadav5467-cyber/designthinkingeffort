import { LayoutDashboard, Timer, BarChart3, Brain, Settings } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'session', label: 'Session', icon: Timer },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'psychology', label: 'Psychology', icon: Brain },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-black/40 backdrop-blur-md border-r border-white/10 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Effort Mirror
        </h1>
        <p className="text-xs text-gray-500 mt-1">Behavioral Focus Tracker</p>
      </div>

      <div className="space-y-2">
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

      <div className="absolute bottom-6 left-6 right-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20">
          <p className="text-xs text-gray-400 italic leading-relaxed">
            "The problem was never lack of effort. It was invisible avoidance."
          </p>
        </div>
      </div>
    </nav>
  );
}
