import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, EventType, EventSubtype, FocusState } from '../types';

interface UseSessionProps {
  onSessionEnd?: (session: Session) => void;
}

export function useSession({ onSessionEnd }: UseSessionProps = {}) {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentEventStartRef = useRef<number>(Date.now());
  const currentEventTypeRef = useRef<EventType>('focus');

  const startSession = useCallback(async (taskName: string, plannedMinutes: number) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        task_name: taskName,
        planned_minutes: plannedMinutes,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting session:', error);
      return null;
    }

    setCurrentSession(data);
    setIsRunning(true);
    setElapsedTime(0);
    currentEventStartRef.current = Date.now();
    currentEventTypeRef.current = 'focus';

    await supabase.from('session_events').insert({
      session_id: data.id,
      event_type: 'focus',
      timestamp: new Date().toISOString(),
    });

    return data;
  }, []);

  const logEvent = useCallback(async (
    eventType: EventType,
    eventSubtype: EventSubtype = null,
    metadata: Record<string, unknown> = {}
  ) => {
    if (!currentSession) return;

    const now = Date.now();
    const duration = Math.floor((now - currentEventStartRef.current) / 1000);

    await supabase.from('session_events').insert({
      session_id: currentSession.id,
      event_type: eventType,
      event_subtype: eventSubtype,
      duration,
      metadata,
    });

    currentEventStartRef.current = now;
    currentEventTypeRef.current = eventType;
  }, [currentSession]);

  const updateSessionState = useCallback(async (focusState: FocusState) => {
    if (!currentSession || !isRunning) return;

    const eventTypeMap: Record<FocusState, EventType> = {
      focused: 'focus',
      distracted: 'distraction',
      idle: 'idle',
    };

    const newEventType = eventTypeMap[focusState];

    if (newEventType !== currentEventTypeRef.current) {
      await logEvent(newEventType);
    }
  }, [currentSession, isRunning, logEvent]);

  const endSession = useCallback(async () => {
    if (!currentSession) return;

    const now = new Date().toISOString();
    const totalSeconds = elapsedTime;

    const { data: events } = await supabase
      .from('session_events')
      .select('*')
      .eq('session_id', currentSession.id);

    let focusTime = 0;
    let avoidanceTime = 0;
    let idleTime = 0;
    let interruptionCount = 0;
    let tabSwitchCount = 0;

    events?.forEach((event) => {
      if (event.event_type === 'focus') {
        focusTime += event.duration;
      } else if (event.event_type === 'distraction') {
        avoidanceTime += event.duration;
      } else if (event.event_type === 'idle') {
        idleTime += event.duration;
      } else if (event.event_type === 'interruption') {
        interruptionCount++;
      } else if (event.event_type === 'tab_switch') {
        tabSwitchCount++;
      }
    });

    const focusScore = totalSeconds > 0 ? (focusTime / totalSeconds) * 100 : 0;
    const effortAccuracy = currentSession.planned_minutes > 0
      ? (focusTime / (currentSession.planned_minutes * 60)) * 100
      : 0;

    const { data: updatedSession } = await supabase
      .from('sessions')
      .update({
        ended_at: now,
        total_duration: totalSeconds,
        focus_time: focusTime,
        avoidance_time: avoidanceTime,
        idle_time: idleTime,
        interruption_count: interruptionCount,
        tab_switch_count: tabSwitchCount,
        focus_score: Number(focusScore.toFixed(2)),
        effort_accuracy: Number(effortAccuracy.toFixed(2)),
        status: 'completed',
      })
      .eq('id', currentSession.id)
      .select()
      .single();

    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (updatedSession) {
      onSessionEnd?.(updatedSession);
    }

    setCurrentSession(null);
    setElapsedTime(0);
  }, [currentSession, elapsedTime, onSessionEnd]);

  const pauseSession = useCallback(async () => {
    if (!currentSession) return;

    setIsRunning(false);
    await logEvent('interruption');

    await supabase
      .from('sessions')
      .update({ status: 'paused' })
      .eq('id', currentSession.id);
  }, [currentSession, logEvent]);

  const resumeSession = useCallback(async () => {
    if (!currentSession) return;

    setIsRunning(true);
    await logEvent('focus');

    await supabase
      .from('sessions')
      .update({ status: 'active' })
      .eq('id', currentSession.id);
  }, [currentSession, logEvent]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return {
    currentSession,
    isRunning,
    elapsedTime,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateSessionState,
    logEvent,
  };
}
