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
  // Game 1 (single rule: 7→3)
  sequenceSeed: string;
  sequence: number[];
  targetIndices: Set<number>;
  responseLog: StimulusLogEntry[];
  // Game 2 (dual rule: 7→3 + 6→5)
  sequenceSeed2: string;
  sequence2: number[];
  targetIndices2: Set<number>;
  responseLog2: StimulusLogEntry[];
  // General
  practiceCompleted: boolean;
  interruptionFlags: string[];
  testStartTime: string | null;
  testEndTime: string | null;
  testStartTime2: string | null;
  testEndTime2: string | null;
}

interface LockInContextType {
  state: LockInState;
  goToScreen: (n: number) => void;
  setSequence: (seed: string, seq: number[], targets: Set<number>) => void;
  addResponse: (entry: StimulusLogEntry) => void;
  setSequence2: (seed: string, seq: number[], targets: Set<number>) => void;
  addResponse2: (entry: StimulusLogEntry) => void;
  setPracticeCompleted: () => void;
  addInterruptionFlag: () => void;
  setTestStartTime: (t: string) => void;
  setTestEndTime: (t: string) => void;
  setTestStartTime2: (t: string) => void;
  setTestEndTime2: (t: string) => void;
  resetLockIn: () => void;
}

const initialState: LockInState = {
  currentScreen: 0,
  sequenceSeed: '',
  sequence: [],
  targetIndices: new Set(),
  responseLog: [],
  sequenceSeed2: '',
  sequence2: [],
  targetIndices2: new Set(),
  responseLog2: [],
  practiceCompleted: false,
  interruptionFlags: [],
  testStartTime: null,
  testEndTime: null,
  testStartTime2: null,
  testEndTime2: null,
};

const LockInContext = createContext<LockInContextType | null>(null);

export function LockInProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LockInState>({ ...initialState, targetIndices: new Set(), targetIndices2: new Set() });

  const goToScreen = useCallback((n: number) => {
    setState(s => ({ ...s, currentScreen: n }));
  }, []);

  const setSequence = useCallback((seed: string, seq: number[], targets: Set<number>) => {
    setState(s => ({ ...s, sequenceSeed: seed, sequence: seq, targetIndices: targets }));
  }, []);

  const addResponse = useCallback((entry: StimulusLogEntry) => {
    setState(s => ({ ...s, responseLog: [...s.responseLog, entry] }));
  }, []);

  const setSequence2 = useCallback((seed: string, seq: number[], targets: Set<number>) => {
    setState(s => ({ ...s, sequenceSeed2: seed, sequence2: seq, targetIndices2: targets }));
  }, []);

  const addResponse2 = useCallback((entry: StimulusLogEntry) => {
    setState(s => ({ ...s, responseLog2: [...s.responseLog2, entry] }));
  }, []);

  const setPracticeCompleted = useCallback(() => {
    setState(s => ({ ...s, practiceCompleted: true }));
  }, []);

  const addInterruptionFlag = useCallback(() => {
    setState(s => ({ ...s, interruptionFlags: [...s.interruptionFlags, new Date().toISOString()] }));
  }, []);

  const setTestStartTime = useCallback((t: string) => setState(s => ({ ...s, testStartTime: t })), []);
  const setTestEndTime = useCallback((t: string) => setState(s => ({ ...s, testEndTime: t })), []);
  const setTestStartTime2 = useCallback((t: string) => setState(s => ({ ...s, testStartTime2: t })), []);
  const setTestEndTime2 = useCallback((t: string) => setState(s => ({ ...s, testEndTime2: t })), []);

  const resetLockIn = useCallback(() => {
    setState({ ...initialState, targetIndices: new Set(), targetIndices2: new Set() });
  }, []);

  const value = useMemo(() => ({
    state, goToScreen, setSequence, addResponse, setSequence2, addResponse2,
    setPracticeCompleted, addInterruptionFlag,
    setTestStartTime, setTestEndTime, setTestStartTime2, setTestEndTime2, resetLockIn,
  }), [state, goToScreen, setSequence, addResponse, setSequence2, addResponse2,
    setPracticeCompleted, addInterruptionFlag,
    setTestStartTime, setTestEndTime, setTestStartTime2, setTestEndTime2, resetLockIn]);

  return <LockInContext.Provider value={value}>{children}</LockInContext.Provider>;
}

export function useLockIn() {
  const ctx = useContext(LockInContext);
  if (!ctx) throw new Error('useLockIn must be used within LockInProvider');
  return ctx;
}
