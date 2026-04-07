import { ParticipantRecord, SessionRecord, FormId } from './types';

const PARTICIPANTS_KEY = 'bfs_participants';
const SESSIONS_KEY = 'bfs_sessions';
const NEXT_ID_KEY = 'bfs_next_id';
const PILLAR_SCORES_KEY = 'bfs_pillar_scores';

export interface PillarScores {
  participant_id: string;
  recall_raw: number | null;
  lockin_raw: number | null;
  sharpness_raw: number | null;
  recall_fluency: number | null;
  lockin_degradation_index: number | null;
  sharpness_simon_effect_ms: number | null;
  sharpness_rt_switch_cost_ms: number | null;
  updated_at: string;
}

export function getPillarScores(participantId: string): PillarScores | null {
  const all = JSON.parse(localStorage.getItem(PILLAR_SCORES_KEY) || '{}');
  return all[participantId] || null;
}

export function savePillarScore(participantId: string, updates: Partial<PillarScores>) {
  const all = JSON.parse(localStorage.getItem(PILLAR_SCORES_KEY) || '{}');
  const existing = all[participantId] || {
    participant_id: participantId,
    recall_raw: null, lockin_raw: null, sharpness_raw: null,
    recall_fluency: null, lockin_degradation_index: null,
    sharpness_simon_effect_ms: null, sharpness_rt_switch_cost_ms: null,
    updated_at: '',
  };
  all[participantId] = { ...existing, ...updates, updated_at: new Date().toISOString() };
  localStorage.setItem(PILLAR_SCORES_KEY, JSON.stringify(all));
}

export function getParticipants(): ParticipantRecord[] {
  const data = localStorage.getItem(PARTICIPANTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveParticipant(p: ParticipantRecord) {
  const all = getParticipants();
  const idx = all.findIndex(x => x.participant_id === p.participant_id);
  if (idx >= 0) all[idx] = p;
  else all.push(p);
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(all));
}

export function findParticipant(id: string): ParticipantRecord | null {
  return getParticipants().find(p => p.participant_id === id) || null;
}

export function generateParticipantId(): string {
  const year = new Date().getFullYear();
  const nextId = parseInt(localStorage.getItem(NEXT_ID_KEY) || '1');
  localStorage.setItem(NEXT_ID_KEY, String(nextId + 1));
  return `RYB-${year}-${String(nextId).padStart(4, '0')}`;
}

export function getSessions(): SessionRecord[] {
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getParticipantSessions(participantId: string): SessionRecord[] {
  return getSessions().filter(s => s.participant_id === participantId && !s.practice);
}

export function saveSession(session: SessionRecord) {
  const all = getSessions();
  const idx = all.findIndex(s => s.session_id === session.session_id);
  if (idx >= 0) all[idx] = session;
  else all.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
}

export function generateSessionId(): string {
  const year = new Date().getFullYear();
  const all = getSessions();
  const num = all.length + 1;
  return `SES-${year}-${String(num).padStart(5, '0')}`;
}

export function getNextFormForParticipant(participantId: string): FormId {
  const sessions = getParticipantSessions(participantId);
  const forms: FormId[] = ['A', 'B', 'C', 'D'];
  const idx = sessions.length % 4;
  return forms[idx];
}
