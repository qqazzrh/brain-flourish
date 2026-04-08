import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Facilitator, ParticipantRecord, ParticipantType, FormId, PassageForm, DistractionTask } from '@/lib/types';
import { DistractionOptionSet } from '@/lib/distraction-options';
import { getPassageForForm, getDistractionTask, getDistractionOptions, getFormDomain } from '@/lib/content-service';
import { PASSAGE_FORMS, DISTRACTION_TASKS, FORM_DOMAINS } from '@/lib/content-library';
import { DISTRACTION_OPTIONS } from '@/lib/distraction-options';

const SESSION_STORAGE_KEY = 'bfs-active-session';

interface PersistedSessionState {
  facilitator: Facilitator | null;
  location: string;
  participant: ParticipantRecord | null;
  participantType: ParticipantType;
  assignedForm: FormId;
  isPractice: boolean;
  sessionStartTime: string | null;
  currentSessionNumber: number;
}

const DEFAULT_SESSION_STATE: PersistedSessionState = {
  facilitator: null,
  location: '',
  participant: null,
  participantType: 'new',
  assignedForm: 'A',
  isPractice: false,
  sessionStartTime: null,
  currentSessionNumber: 1,
};

function readStoredSession(): PersistedSessionState {
  if (typeof window === 'undefined') return DEFAULT_SESSION_STATE;

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return DEFAULT_SESSION_STATE;

    const parsed = JSON.parse(raw) as Partial<PersistedSessionState>;

    return {
      facilitator: parsed.facilitator ?? null,
      location: typeof parsed.location === 'string' ? parsed.location : '',
      participant: parsed.participant ?? null,
      participantType: parsed.participantType === 'returning' ? 'returning' : 'new',
      assignedForm: typeof parsed.assignedForm === 'string' && parsed.assignedForm ? parsed.assignedForm : 'A',
      isPractice: Boolean(parsed.isPractice),
      sessionStartTime: typeof parsed.sessionStartTime === 'string' ? parsed.sessionStartTime : null,
      currentSessionNumber: typeof parsed.currentSessionNumber === 'number' && parsed.currentSessionNumber > 0 ? parsed.currentSessionNumber : 1,
    };
  } catch {
    return DEFAULT_SESSION_STATE;
  }
}

interface SessionContextType {
  facilitator: Facilitator | null;
  location: string;
  participant: ParticipantRecord | null;
  participantType: ParticipantType;
  assignedForm: FormId;
  isPractice: boolean;
  sessionStartTime: string | null;
  currentSessionNumber: number;
  // Loaded content from DB
  passage: PassageForm | null;
  distractionTask: DistractionTask | null;
  distractionOptionSet: DistractionOptionSet | null;
  formDomain: string;
  contentLoading: boolean;
  setFacilitator: (f: Facilitator, location: string) => void;
  setParticipant: (p: ParticipantRecord, type: ParticipantType, form: FormId, sessionNumber: number) => void;
  setPractice: (v: boolean) => void;
  clearParticipant: () => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const persisted = useMemo(() => readStoredSession(), []);
  const [facilitator, setFac] = useState<Facilitator | null>(persisted.facilitator);
  const [location, setLoc] = useState(persisted.location);
  const [participant, setPart] = useState<ParticipantRecord | null>(persisted.participant);
  const [participantType, setPartType] = useState<ParticipantType>(persisted.participantType);
  const [assignedForm, setForm] = useState<FormId>(persisted.assignedForm);
  const [isPractice, setIsPractice] = useState(persisted.isPractice);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(persisted.sessionStartTime);
  const [currentSessionNumber, setCurrentSessionNumber] = useState(persisted.currentSessionNumber);

  // Loaded content
  const [passage, setPassage] = useState<PassageForm | null>(null);
  const [distractionTask, setDistractionTask] = useState<DistractionTask | null>(null);
  const [distractionOptionSet, setDistractionOptionSet] = useState<DistractionOptionSet | null>(null);
  const [formDomain, setFormDomain] = useState<string>('');
  const [contentLoading, setContentLoading] = useState(false);

  // Load content when assignedForm changes
  useEffect(() => {
    let cancelled = false;
    async function loadContent() {
      setContentLoading(true);
      try {
        const [p, dt, dopts, domain] = await Promise.all([
          getPassageForForm(assignedForm),
          getDistractionTask(assignedForm),
          getDistractionOptions(assignedForm),
          getFormDomain(assignedForm),
        ]);
        if (!cancelled) {
          setPassage(p);
          setDistractionTask(dt);
          setDistractionOptionSet(dopts);
          setFormDomain(domain);
        }
      } catch (err) {
        console.error('Failed to load content from DB, using fallback:', err);
        if (!cancelled) {
          // Fallback to hardcoded
          const key = assignedForm as 'A' | 'B' | 'C' | 'D';
          setPassage(PASSAGE_FORMS[key] || PASSAGE_FORMS.A);
          setDistractionTask(DISTRACTION_TASKS[key] || DISTRACTION_TASKS.A);
          setDistractionOptionSet(DISTRACTION_OPTIONS[key] || DISTRACTION_OPTIONS.A);
          setFormDomain(FORM_DOMAINS[key] || 'Unknown');
        }
      } finally {
        if (!cancelled) setContentLoading(false);
      }
    }
    loadContent();
    return () => { cancelled = true; };
  }, [assignedForm]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasSessionState = Boolean(facilitator || participant || location || isPractice || sessionStartTime);
    if (!hasSessionState) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      facilitator,
      location,
      participant,
      participantType,
      assignedForm,
      isPractice,
      sessionStartTime,
      currentSessionNumber,
    } satisfies PersistedSessionState));
  }, [facilitator, location, participant, participantType, assignedForm, isPractice, sessionStartTime, currentSessionNumber]);

  const setFacilitator = useCallback((f: Facilitator, loc: string) => {
    setFac(f);
    setLoc(loc);
  }, []);

  const setParticipant = useCallback((p: ParticipantRecord, type: ParticipantType, form: FormId, sessionNumber: number) => {
    setPart(p);
    setPartType(type);
    setForm(form);
    setCurrentSessionNumber(sessionNumber);
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
    setCurrentSessionNumber(1);
  }, []);

  const logout = useCallback(() => {
    setFac(null);
    setLoc('');
    setPart(null);
    setPartType('new');
    setForm('A');
    setIsPractice(false);
    setSessionStartTime(null);
    setCurrentSessionNumber(1);
  }, []);

  const value = useMemo(() => ({
    facilitator, location, participant, participantType, assignedForm,
    isPractice, sessionStartTime, currentSessionNumber,
    passage, distractionTask, distractionOptionSet, formDomain, contentLoading,
    setFacilitator, setParticipant, setPractice, clearParticipant, logout,
  }), [facilitator, location, participant, participantType, assignedForm,
    isPractice, sessionStartTime, currentSessionNumber,
    passage, distractionTask, distractionOptionSet, formDomain, contentLoading,
    setFacilitator, setParticipant, setPractice, clearParticipant, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
