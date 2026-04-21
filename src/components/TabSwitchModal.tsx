import { useState } from 'react';
import { X, Clock, ExternalLink } from 'lucide-react';

interface TabSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    reason: string;
    plannedDuration: number;
    destinationUrl?: string;
  }) => void;
}

const predefinedReasons = [
  { id: 'quick_check', label: 'Quick check (email, messages)', duration: 2 },
  { id: 'research', label: 'Research for current task', duration: 5 },
  { id: 'break', label: 'Taking a break', duration: 10 },
  { id: 'reference', label: 'Looking up reference/documentation', duration: 3 },
  { id: 'distraction', label: 'Got distracted', duration: 5 },
  { id: 'other', label: 'Other reason', duration: 5 },
];

export function TabSwitchModal({ isOpen, onClose, onSubmit }: TabSwitchModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [plannedDuration, setPlannedDuration] = useState(5);
  const [destinationUrl, setDestinationUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    const reason = selectedReason === 'other'
      ? customReason
      : predefinedReasons.find(r => r.id === selectedReason)?.label || '';

    if (!reason.trim()) return;

    onSubmit({
      reason,
      plannedDuration,
      destinationUrl: destinationUrl.trim() || undefined,
    });

    setSelectedReason(null);
    setCustomReason('');
    setPlannedDuration(5);
    setDestinationUrl('');
    onClose();
  };

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
    const reason = predefinedReasons.find(r => r.id === reasonId);
    if (reason) {
      setPlannedDuration(reason.duration);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-lg w-full mx-4 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Tab Switch Detected</h2>
        <p className="text-gray-400 mb-6">Please tell us why you're switching tabs</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Why are you switching tabs?
            </label>
            <div className="space-y-2">
              {predefinedReasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => handleReasonSelect(reason.id)}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-all ${
                    selectedReason === reason.id
                      ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-blue-500/50'
                      : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="font-medium text-white">{reason.label}</p>
                </button>
              ))}
            </div>
          </div>

          {selectedReason === 'other' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Please specify
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="What's the reason?"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              How long do you plan to be away? (minutes)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 5, 10, 15, 20].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setPlannedDuration(mins)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    plannedDuration === mins
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white'
                  }`}
                >
                  {mins}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={plannedDuration}
              onChange={(e) => setPlannedDuration(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full mt-3 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              <ExternalLink className="w-4 h-4 inline mr-2" />
              Where are you going? (optional)
            </label>
            <input
              type="text"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="e.g., gmail.com, github.com"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
