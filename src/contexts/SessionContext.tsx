import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Facilitator, ParticipantRecord, ParticipantType, FormId } from '@/lib/types';

interface SessionContextType {
  facilitator: Facilitator | null;
  location: string;
  participant: ParticipantRecord | null;
  participantType: ParticipantType;
  assignedForm: FormId;
  isPractice: boolean;
  sessionStartTime: string | null;
  setFacilitator: (f: Facilitator, location: string) => void;
  setParticipant: (p: ParticipantRecord, type: ParticipantType, form: FormId) => void;
  setPractice: (v: boolean) => void;
  clearParticipant: () => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [facilitator, setFac] = useState<Facilitator | null>(null);
  const [location, setLoc] = useState('');
  const [participant, setPart] = useState<ParticipantRecord | null>(null);
  const [participantType, setPartType] = useState<ParticipantType>('new');
  const [assignedForm, setForm] = useState<FormId>('A');
  const [isPractice, setIsPractice] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  const setFacilitator = useCallback((f: Facilitator, loc: string) => {
    setFac(f);
    setLoc(loc);
  }, []);

  const setParticipant = useCallback((p: ParticipantRecord, type: ParticipantType, form: FormId) => {
    setPart(p);
    setPartType(type);
    setForm(form);
    setSessionStartTime(new Date().toISOString());
  }, []);

  const setPractice = useCallback((v: boolean) => {
    setIsPractice(v);
  }, []);

  const clearParticipant = useCallback(() => {
    setPart(null);
    setPartType('new');
    setForm('A');
    setSessionStartTime(null);
  }, []);

  const logout = useCallback(() => {
    setFac(null);
    setLoc('');
    setPart(null);
    setPartType('new');
    setForm('A');
    setIsPractice(false);
    setSessionStartTime(null);
  }, []);

  const value = useMemo(() => ({
    facilitator, location, participant, participantType, assignedForm,
    isPractice, sessionStartTime,
    setFacilitator, setParticipant, setPractice, clearParticipant, logout,
  }), [facilitator, location, participant, participantType, assignedForm,
    isPractice, sessionStartTime,
    setFacilitator, setParticipant, setPractice, clearParticipant, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
