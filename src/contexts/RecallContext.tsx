import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { RecallSessionState, FormId, Facilitator, ParticipantRecord, ParticipantType } from '@/lib/types';

interface RecallContextType {
  state: RecallSessionState;
  setFacilitator: (f: Facilitator, location: string) => void;
  setParticipant: (p: ParticipantRecord, type: ParticipantType, form: FormId) => void;
  goToScreen: (n: number) => void;
  setPractice: (v: boolean) => void;
  setDistractionCounts: (valid: number, invalid: number) => void;
  setDistractionTimerStart: (t: string) => void;
  toggleUnit: (unitId: number) => void;
  setRecallStartTime: (t: string) => void;
  setOneTimePromptUsed: () => void;
  setRecallTimerUsed: (v: boolean) => void;
  setScoreEdited: () => void;
  resetSession: () => void;
}

const initialState: RecallSessionState = {
  facilitator: null,
  location: '',
  participant: null,
  participantType: 'new',
  assignedForm: 'A',
  currentScreen: 0,
  sessionStartTime: null,
  isPractice: false,
  distractionValidCount: 0,
  distractionInvalidCount: 0,
  distractionTimerStart: null,
  recalledUnits: new Set(),
  recallOrderTimestamps: {},
  recallStartTime: null,
  oneTimePromptUsed: false,
  recallTimerUsed: false,
  scoreEdited: false,
};

const RecallContext = createContext<RecallContextType | null>(null);

export function RecallProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RecallSessionState>({ ...initialState, recalledUnits: new Set() });

  const setFacilitator = useCallback((f: Facilitator, location: string) => {
    setState(s => ({ ...s, facilitator: f, location }));
  }, []);

  const setParticipant = useCallback((p: ParticipantRecord, type: ParticipantType, form: FormId) => {
    setState(s => ({ ...s, participant: p, participantType: type, assignedForm: form, sessionStartTime: new Date().toISOString() }));
  }, []);

  const goToScreen = useCallback((n: number) => {
    setState(s => ({ ...s, currentScreen: n }));
  }, []);

  const setPractice = useCallback((v: boolean) => {
    setState(s => ({ ...s, isPractice: v }));
  }, []);

  const setDistractionCounts = useCallback((valid: number, invalid: number) => {
    setState(s => ({ ...s, distractionValidCount: valid, distractionInvalidCount: invalid }));
  }, []);

  const setDistractionTimerStart = useCallback((t: string) => {
    setState(s => ({ ...s, distractionTimerStart: t }));
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

  const resetSession = useCallback(() => {
    setState(s => ({
      ...initialState,
      recalledUnits: new Set(),
      facilitator: s.facilitator,
      location: s.location,
    }));
  }, []);

  const value = useMemo(() => ({
    state, setFacilitator, setParticipant, goToScreen, setPractice,
    setDistractionCounts, setDistractionTimerStart, toggleUnit,
    setRecallStartTime, setOneTimePromptUsed, setRecallTimerUsed,
    setScoreEdited, resetSession,
  }), [state, setFacilitator, setParticipant, goToScreen, setPractice,
    setDistractionCounts, setDistractionTimerStart, toggleUnit,
    setRecallStartTime, setOneTimePromptUsed, setRecallTimerUsed,
    setScoreEdited, resetSession]);

  return <RecallContext.Provider value={value}>{children}</RecallContext.Provider>;
}

export function useRecall() {
  const ctx = useContext(RecallContext);
  if (!ctx) throw new Error('useRecall must be used within RecallProvider');
  return ctx;
}
