import { X } from 'lucide-react';
import type { EventSubtype } from '../types';

interface InterruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassify: (subtype: EventSubtype) => void;
}

export function InterruptionModal({ isOpen, onClose, onClassify }: InterruptionModalProps) {
  if (!isOpen) return null;

  const handleClassify = (subtype: EventSubtype) => {
    onClassify(subtype);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Interruption Detected</h2>
        <p className="text-gray-400 mb-6">Why did you stop focusing?</p>

        <div className="space-y-3">
          <button
            onClick={() => handleClassify('needed_break')}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl text-left hover:scale-105 transition-transform"
          >
            <p className="font-semibold text-green-400">Needed Break</p>
            <p className="text-sm text-gray-400 mt-1">Intentional pause for rest</p>
          </button>

          <button
            onClick={() => handleClassify('distraction')}
            className="w-full px-6 py-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl text-left hover:scale-105 transition-transform"
          >
            <p className="font-semibold text-yellow-400">Distraction</p>
            <p className="text-sm text-gray-400 mt-1">Lost focus unintentionally</p>
          </button>

          <button
            onClick={() => handleClassify('finished_task')}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl text-left hover:scale-105 transition-transform"
          >
            <p className="font-semibold text-blue-400">Finished Task</p>
            <p className="text-sm text-gray-400 mt-1">Completed what I intended</p>
          </button>
        </div>
      </div>
    </div>
  );
}
