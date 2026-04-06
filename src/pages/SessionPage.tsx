import { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { useActivityMonitor } from '../hooks/useActivityMonitor';
import { FocusIndicator } from '../components/FocusIndicator';
import { InterruptionModal } from '../components/InterruptionModal';
import type { EventSubtype } from '../types';

export function SessionPage() {
  const [taskName, setTaskName] = useState('');
  const [plannedMinutes, setPlannedMinutes] = useState(25);
  const [showModal, setShowModal] = useState(false);

  const {
    currentSession,
    isRunning,
    elapsedTime,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateSessionState,
    logEvent,
  } = useSession();

  const { activityState, resetTabSwitchCount } = useActivityMonitor({
    onStateChange: (state) => {
      updateSessionState(state);
    },
    onTabSwitch: () => {
      if (currentSession && isRunning) {
        logEvent('tab_switch');
      }
    },
    idleThreshold: 60000,
  });

  useEffect(() => {
    if (activityState.tabSwitchCount >= 4 && isRunning) {
      setShowModal(true);
      pauseSession();
    }
  }, [activityState.tabSwitchCount, isRunning, pauseSession]);

  const handleStart = async () => {
    if (!taskName.trim()) return;
    await startSession(taskName, plannedMinutes);
    resetTabSwitchCount();
  };

  const handlePause = async () => {
    await pauseSession();
    setShowModal(true);
  };

  const handleResume = async () => {
    await resumeSession();
    resetTabSwitchCount();
  };

  const handleStop = async () => {
    await endSession();
    setTaskName('');
    setPlannedMinutes(25);
  };

  const handleClassifyInterruption = async (subtype: EventSubtype) => {
    if (currentSession) {
      await logEvent('interruption', subtype);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Focus Session</h1>
        <p className="text-gray-400">Track your study session in real-time</p>
      </div>

      {!currentSession ? (
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Start New Session</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Task Name
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="What will you work on?"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Planned Time (minutes)
              </label>
              <input
                type="number"
                value={plannedMinutes}
                onChange={(e) => setPlannedMinutes(parseInt(e.target.value) || 0)}
                min="1"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              onClick={handleStart}
              disabled={!taskName.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Focus Session
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{currentSession.task_name}</h2>
              <FocusIndicator state={activityState.focusState} size="lg" />
            </div>

            <div className="text-center mb-8">
              <div className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-gray-400">
                Planned: {currentSession.planned_minutes} minutes
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Tab Switches</p>
                <p className="text-2xl font-bold text-yellow-400">{activityState.tabSwitchCount}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Window Focus</p>
                <p className="text-2xl font-bold text-green-400">
                  {activityState.isVisible ? 'Active' : 'Hidden'}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Activity</p>
                <p className="text-2xl font-bold text-blue-400">
                  {activityState.isIdle ? 'Idle' : 'Active'}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              {isRunning ? (
                <button
                  onClick={handlePause}
                  className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Resume
                </button>
              )}
              <button
                onClick={handleStop}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Square className="w-5 h-5" />
                End Session
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Focus Detection Active</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              The system is monitoring tab visibility, keyboard activity, mouse movement, and idle time
              to classify your focus patterns. Switching tabs more than 4 times in 3 minutes may trigger
              an interruption classification.
            </p>
          </div>
        </div>
      )}

      <InterruptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onClassify={handleClassifyInterruption}
      />
    </div>
  );
}
