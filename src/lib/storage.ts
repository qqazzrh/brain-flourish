import { ParticipantRecord, SessionRecord, FormId } from './types';

const PARTICIPANTS_KEY = 'bfs_participants';
const SESSIONS_KEY = 'bfs_sessions';
const NEXT_ID_KEY = 'bfs_next_id';
const PILLAR_SCORES_KEY = 'bfs_pillar_scores';

export interface PillarScores {
  participant_id: string;
  session_number: number;
  recall_raw: number | null;
  lockin_raw: number | null;
  sharpness_raw: number | null;
  recall_fluency: number | null;
  lockin_degradation_index: number | null;
  sharpness_simon_effect_ms: number | null;
  sharpness_rt_switch_cost_ms: number | null;
  updated_at: string;
}

function pillarKey(participantId: string, sessionNumber: number): string {
  return `${participantId}:${sessionNumber}`;
}

export function getPillarScores(participantId: string, sessionNumber?: number): PillarScores | null {
  const all = JSON.parse(localStorage.getItem(PILLAR_SCORES_KEY) || '{}');
  if (sessionNumber != null) {
    return all[pillarKey(participantId, sessionNumber)] || null;
  }
  // Legacy fallback: try plain participant_id key
  return all[participantId] || null;
}

export function getAllPillarScoresForParticipant(participantId: string): PillarScores[] {
  const all = JSON.parse(localStorage.getItem(PILLAR_SCORES_KEY) || '{}');
  const results: PillarScores[] = [];
  for (const key of Object.keys(all)) {
    if (key.startsWith(`${participantId}:`)) {
      results.push(all[key]);
    }
  }
  // Also check legacy key (no session number)
  if (all[participantId]) {
    const legacy = all[participantId];
    if (!legacy.session_number) legacy.session_number = 1;
    // Only add if not already covered
    if (!results.some(r => r.session_number === legacy.session_number)) {
      results.push(legacy);
    }
  }
  results.sort((a, b) => a.session_number - b.session_number);
  return results;
}

export function savePillarScore(participantId: string, sessionNumber: number, updates: Partial<PillarScores>) {
  const all = JSON.parse(localStorage.getItem(PILLAR_SCORES_KEY) || '{}');
  const key = pillarKey(participantId, sessionNumber);
  const existing = all[key] || {
    participant_id: participantId,
    session_number: sessionNumber,
    recall_raw: null, lockin_raw: null, sharpness_raw: null,
    recall_fluency: null, lockin_degradation_index: null,
    sharpness_simon_effect_ms: null, sharpness_rt_switch_cost_ms: null,
    updated_at: '',
  };
  all[key] = { ...existing, ...updates, updated_at: new Date().toISOString() };
  localStorage.setItem(PILLAR_SCORES_KEY, JSON.stringify(all));
}

export function isSessionComplete(participantId: string, sessionNumber: number): boolean {
  const scores = getPillarScores(participantId, sessionNumber);
  if (!scores) return false;
  return scores.recall_raw != null && scores.lockin_raw != null && scores.sharpness_raw != null;
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
