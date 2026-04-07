import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface RecallState {
  currentScreen: number;
  distractionValidCount: number;
  distractionInvalidCount: number;
  distractionTimerStart: string | null;
  distractionTappedOptions: string[];
  recalledUnits: Set<number>;
  recallOrderTimestamps: Record<string, string>;
  recallStartTime: string | null;
  oneTimePromptUsed: boolean;
  recallTimerUsed: boolean;
  scoreEdited: boolean;
}

interface RecallContextType {
  state: RecallState;
  goToScreen: (n: number) => void;
  setDistractionCounts: (valid: number, invalid: number) => void;
  setDistractionTimerStart: (t: string) => void;
  addDistractionTappedOption: (option: string) => void;
  toggleUnit: (unitId: number) => void;
  setRecallStartTime: (t: string) => void;
  setOneTimePromptUsed: () => void;
  setRecallTimerUsed: (v: boolean) => void;
  setScoreEdited: () => void;
  resetRecall: () => void;
}

const initialState: RecallState = {
  currentScreen: 0,
  distractionValidCount: 0,
  distractionInvalidCount: 0,
  distractionTimerStart: null,
  distractionTappedOptions: [],
  recalledUnits: new Set(),
  recallOrderTimestamps: {},
  recallStartTime: null,
  oneTimePromptUsed: false,
  recallTimerUsed: false,
  scoreEdited: false,
};

const RecallContext = createContext<RecallContextType | null>(null);

export function RecallProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RecallState>({ ...initialState, recalledUnits: new Set() });

  const goToScreen = useCallback((n: number) => {
    setState(s => ({ ...s, currentScreen: n }));
  }, []);

  const setDistractionCounts = useCallback((valid: number, invalid: number) => {
    setState(s => ({ ...s, distractionValidCount: valid, distractionInvalidCount: invalid }));
  }, []);

  const setDistractionTimerStart = useCallback((t: string) => {
    setState(s => ({ ...s, distractionTimerStart: t }));
  }, []);

  const addDistractionTappedOption = useCallback((option: string) => {
    setState(s => ({ ...s, distractionTappedOptions: [...s.distractionTappedOptions, option] }));
  }, []);

  const toggleUnit = useCallback((unitId: number) => {
    setState(s => {
      const newSet = new Set(s.recalledUnits);
      const newTimestamps = { ...s.recallOrderTimestamps };
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
        delete newTimestamps[String(unitId)];
      } else {
        newSet.add(unitId);
        newTimestamps[String(unitId)] = new Date().toISOString();
      }
      return { ...s, recalledUnits: newSet, recallOrderTimestamps: newTimestamps };
    });
  }, []);

  const setRecallStartTime = useCallback((t: string) => {
    setState(s => ({ ...s, recallStartTime: t }));
  }, []);

  const setOneTimePromptUsed = useCallback(() => {
    setState(s => ({ ...s, oneTimePromptUsed: true }));
  }, []);

  const setRecallTimerUsed = useCallback((v: boolean) => {
    setState(s => ({ ...s, recallTimerUsed: v }));
  }, []);

  const setScoreEdited = useCallback(() => {
    setState(s => ({ ...s, scoreEdited: true }));
  }, []);

  const resetRecall = useCallback(() => {
    setState({ ...initialState, recalledUnits: new Set() });
  }, []);

  const value = useMemo(() => ({
    state, goToScreen, setDistractionCounts, setDistractionTimerStart,
    addDistractionTappedOption, toggleUnit, setRecallStartTime,
    setOneTimePromptUsed, setRecallTimerUsed, setScoreEdited, resetRecall,
  }), [state, goToScreen, setDistractionCounts, setDistractionTimerStart,
    addDistractionTappedOption, toggleUnit, setRecallStartTime,
    setOneTimePromptUsed, setRecallTimerUsed, setScoreEdited, resetRecall]);

  return <RecallContext.Provider value={value}>{children}</RecallContext.Provider>;
}

export function useRecall() {
  const ctx = useContext(RecallContext);
  if (!ctx) throw new Error('useRecall must be used within RecallProvider');
  return ctx;
}
