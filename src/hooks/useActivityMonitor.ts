import { useState, useEffect, useCallback, useRef } from 'react';
import type { FocusState, ActivityState } from '../types';

interface UseActivityMonitorProps {
  onStateChange?: (state: FocusState) => void;
  onTabSwitch?: () => void;
  onIdle?: () => void;
  onActive?: () => void;
  idleThreshold?: number;
}

export function useActivityMonitor({
  onStateChange,
  onTabSwitch,
  onIdle,
  onActive,
  idleThreshold = 60000,
}: UseActivityMonitorProps = {}) {
  const [activityState, setActivityState] = useState<ActivityState>({
    focusState: 'focused',
    isVisible: true,
    isIdle: false,
    lastActivity: Date.now(),
    tabSwitchCount: 0,
    focusStartTime: Date.now(),
  });

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousVisibilityRef = useRef(true);

  const updateActivity = useCallback(() => {
    const now = Date.now();
    setActivityState((prev) => {
      if (prev.isIdle) {
        onActive?.();
      }
      return {
        ...prev,
        lastActivity: now,
        isIdle: false,
      };
    });

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      setActivityState((prev) => ({
        ...prev,
        isIdle: true,
        focusState: 'idle',
      }));
      onIdle?.();
      onStateChange?.('idle');
    }, idleThreshold);
  }, [idleThreshold, onActive, onIdle, onStateChange]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      const wasVisible = previousVisibilityRef.current;

      if (!isVisible && wasVisible) {
        onTabSwitch?.();
        setActivityState((prev) => ({
          ...prev,
          isVisible: false,
          tabSwitchCount: prev.tabSwitchCount + 1,
          focusState: 'distracted',
        }));
        onStateChange?.('distracted');
      } else if (isVisible && !wasVisible) {
        setActivityState((prev) => ({
          ...prev,
          isVisible: true,
        }));
      }

      previousVisibilityRef.current = isVisible;
    };

    const handleFocus = () => {
      updateActivity();
      setActivityState((prev) => ({
        ...prev,
        focusState: 'focused',
        focusStartTime: prev.focusStartTime || Date.now(),
      }));
      onStateChange?.('focused');
    };

    const handleBlur = () => {
      setActivityState((prev) => ({
        ...prev,
        focusState: 'distracted',
      }));
      onStateChange?.('distracted');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    updateActivity();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [updateActivity, onStateChange, onTabSwitch]);

  const resetTabSwitchCount = useCallback(() => {
    setActivityState((prev) => ({
      ...prev,
      tabSwitchCount: 0,
    }));
  }, []);

  return {
    activityState,
    resetTabSwitchCount,
  };
}
