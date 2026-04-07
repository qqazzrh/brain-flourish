import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface DualTaskResponseEntry {
  channel: 'visual' | 'auditory';
  stimulus_index: number;
  stimulus_value: number | 'high' | 'low';
  is_target: boolean;
  stimulus_onset: string;
  response_time_ms: number | null;
  response_type: 'hit' | 'miss' | 'false_alarm' | 'correct_withhold';
}

export interface ChoiceRTResponseEntry {
  trial_index: number;
  stimulus_position: number; // 1-4
  rule: 'compatible' | 'incompatible';
  correct_response: number; // 1-4
  actual_response: number | null;
  stimulus_onset: string;
  response_time_ms: number | null;
  correct: boolean;
}

export interface CategorySwitchResponseEntry {
  trial_index: number;
  word: string;
  rule: 'meaning' | 'letter' | 'syllables';
  correct_option: string;
  selected_option: string | null;
  is_switch_trial: boolean;
  stimulus_onset: string;
  response_time_ms: number | null;
  correct: boolean;
}

interface SharpnessState {
  currentScreen: number;
  skipPractice: boolean;
  // Dual Task
  blockALog: DualTaskResponseEntry[];
  blockBLog: DualTaskResponseEntry[];
  blockCLog: DualTaskResponseEntry[];
  // Choice RT
  choiceRTLog: ChoiceRTResponseEntry[];
  // Category Switching
  categorySwitchLog: CategorySwitchResponseEntry[];
  // Timing
  testStartTime: string | null;
  testEndTime: string | null;
}

interface SharpnessContextType {
  state: SharpnessState;
  goToScreen: (n: number) => void;
  setSkipPractice: (v: boolean) => void;
  addBlockAResponse: (entry: DualTaskResponseEntry) => void;
  addBlockBResponse: (entry: DualTaskResponseEntry) => void;
  addBlockCResponse: (entry: DualTaskResponseEntry) => void;
  addChoiceRTResponse: (entry: ChoiceRTResponseEntry) => void;
  addCategorySwitchResponse: (entry: CategorySwitchResponseEntry) => void;
  setTestStartTime: (t: string) => void;
  setTestEndTime: (t: string) => void;
  resetSharpness: () => void;
}

const initialState: SharpnessState = {
  currentScreen: 0,
  skipPractice: false,
  blockALog: [],
  blockBLog: [],
  blockCLog: [],
  choiceRTLog: [],
  categorySwitchLog: [],
  testStartTime: null,
  testEndTime: null,
};

const SharpnessContext = createContext<SharpnessContextType | null>(null);

export function SharpnessProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SharpnessState>({ ...initialState });

  const goToScreen = useCallback((n: number) => setState(s => ({ ...s, currentScreen: n })), []);
  const setSkipPractice = useCallback((v: boolean) => setState(s => ({ ...s, skipPractice: v })), []);

  const addBlockAResponse = useCallback((entry: DualTaskResponseEntry) => {
    setState(s => ({ ...s, blockALog: [...s.blockALog, entry] }));
  }, []);
  const addBlockBResponse = useCallback((entry: DualTaskResponseEntry) => {
    setState(s => ({ ...s, blockBLog: [...s.blockBLog, entry] }));
  }, []);
  const addBlockCResponse = useCallback((entry: DualTaskResponseEntry) => {
    setState(s => ({ ...s, blockCLog: [...s.blockCLog, entry] }));
  }, []);
  const addChoiceRTResponse = useCallback((entry: ChoiceRTResponseEntry) => {
    setState(s => ({ ...s, choiceRTLog: [...s.choiceRTLog, entry] }));
  }, []);
  const addCategorySwitchResponse = useCallback((entry: CategorySwitchResponseEntry) => {
    setState(s => ({ ...s, categorySwitchLog: [...s.categorySwitchLog, entry] }));
  }, []);
  const setTestStartTime = useCallback((t: string) => setState(s => ({ ...s, testStartTime: t })), []);
  const setTestEndTime = useCallback((t: string) => setState(s => ({ ...s, testEndTime: t })), []);
  const resetSharpness = useCallback(() => setState({ ...initialState }), []);

  const value = useMemo(() => ({
    state, goToScreen, setSkipPractice, addBlockAResponse, addBlockBResponse, addBlockCResponse,
    addChoiceRTResponse, addCategorySwitchResponse, setTestStartTime, setTestEndTime, resetSharpness,
  }), [state, goToScreen, setSkipPractice, addBlockAResponse, addBlockBResponse, addBlockCResponse,
    addChoiceRTResponse, addCategorySwitchResponse, setTestStartTime, setTestEndTime, resetSharpness]);

  return <SharpnessContext.Provider value={value}>{children}</SharpnessContext.Provider>;
}

export function useSharpness() {
  const ctx = useContext(SharpnessContext);
  if (!ctx) throw new Error('useSharpness must be used within SharpnessProvider');
  return ctx;
}
