import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface StimulusLogEntry {
  stimulus_index: number;
  digit: number;
  is_target_sequence: boolean;
  stimulus_onset: string;
  response_time_ms: number | null;
  response_type: 'hit' | 'miss' | 'false_alarm' | 'correct_withhold';
}

export interface SegmentData {
  range_stimuli: [number, number];
  range_seconds: [number, number];
  hits: number;
  misses: number;
  false_alarms: number;
  accuracy: number;
  mean_rt_ms: number;
}

interface LockInState {
  currentScreen: number;
  sequenceSeed: string;
  sequence: number[];
  targetIndices: Set<number>;
  responseLog: StimulusLogEntry[];
  practiceCompleted: boolean;
  interruptionFlags: string[];
  testStartTime: string | null;
  testEndTime: string | null;
}

interface LockInContextType {
  state: LockInState;
  goToScreen: (n: number) => void;
  setSequence: (seed: string, seq: number[], targets: Set<number>) => void;
  addResponse: (entry: StimulusLogEntry) => void;
  setPracticeCompleted: () => void;
  addInterruptionFlag: () => void;
  setTestStartTime: (t: string) => void;
  setTestEndTime: (t: string) => void;
  resetLockIn: () => void;
}

const initialState: LockInState = {
  currentScreen: 0,
  sequenceSeed: '',
  sequence: [],
  targetIndices: new Set(),
  responseLog: [],
  practiceCompleted: false,
  interruptionFlags: [],
  testStartTime: null,
  testEndTime: null,
};

const LockInContext = createContext<LockInContextType | null>(null);

export function LockInProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LockInState>({ ...initialState, targetIndices: new Set() });

  const goToScreen = useCallback((n: number) => {
    setState(s => ({ ...s, currentScreen: n }));
  }, []);

  const setSequence = useCallback((seed: string, seq: number[], targets: Set<number>) => {
    setState(s => ({ ...s, sequenceSeed: seed, sequence: seq, targetIndices: targets }));
  }, []);

  const addResponse = useCallback((entry: StimulusLogEntry) => {
    setState(s => ({ ...s, responseLog: [...s.responseLog, entry] }));
  }, []);

  const setPracticeCompleted = useCallback(() => {
    setState(s => ({ ...s, practiceCompleted: true }));
  }, []);

  const addInterruptionFlag = useCallback(() => {
    setState(s => ({ ...s, interruptionFlags: [...s.interruptionFlags, new Date().toISOString()] }));
  }, []);

  const setTestStartTime = useCallback((t: string) => {
    setState(s => ({ ...s, testStartTime: t }));
  }, []);

  const setTestEndTime = useCallback((t: string) => {
    setState(s => ({ ...s, testEndTime: t }));
  }, []);

  const resetLockIn = useCallback(() => {
    setState({ ...initialState, targetIndices: new Set() });
  }, []);

  const value = useMemo(() => ({
    state, goToScreen, setSequence, addResponse, setPracticeCompleted,
    addInterruptionFlag, setTestStartTime, setTestEndTime, resetLockIn,
  }), [state, goToScreen, setSequence, addResponse, setPracticeCompleted,
    addInterruptionFlag, setTestStartTime, setTestEndTime, resetLockIn]);

  return <LockInContext.Provider value={value}>{children}</LockInContext.Provider>;
}

export function useLockIn() {
  const ctx = useContext(LockInContext);
  if (!ctx) throw new Error('useLockIn must be used within LockInProvider');
  return ctx;
}
