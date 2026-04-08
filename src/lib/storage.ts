import { supabase } from '@/integrations/supabase/client';
import { ParticipantRecord, FormId, Facilitator } from './types';
import { getAvailableFormIds } from './content-service';

// ====== Facilitators ======

export async function getFacilitators(): Promise<Facilitator[]> {
  const { data } = await supabase.from('facilitators').select('facilitator_id, name').order('facilitator_id');
  if (!data) return [];
  return data.map(d => ({ id: d.facilitator_id, name: d.name }));
}

export async function saveFacilitator(fac: Facilitator & { email?: string; pin?: string }) {
  const { data: existing } = await supabase
    .from('facilitators')
    .select('id')
    .eq('facilitator_id', fac.id)
    .maybeSingle();

  const row = { facilitator_id: fac.id, name: fac.name, email: fac.email || '', pin: fac.pin || '' };
  if (existing) {
    await supabase.from('facilitators').update(row).eq('facilitator_id', fac.id);
  } else {
    await supabase.from('facilitators').insert(row);
  }
}

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

// ====== Pillar Scores ======

export async function getPillarScores(participantId: string, sessionNumber?: number): Promise<PillarScores | null> {
  let query = supabase.from('pillar_scores').select('*').eq('participant_id', participantId);
  if (sessionNumber != null) {
    query = query.eq('session_number', sessionNumber);
  }
  const { data } = await query.maybeSingle();
  if (!data) return null;
  return {
    participant_id: data.participant_id,
    session_number: data.session_number,
    recall_raw: data.recall_raw,
    lockin_raw: data.lockin_raw,
    sharpness_raw: data.sharpness_raw,
    recall_fluency: data.recall_fluency,
    lockin_degradation_index: data.lockin_degradation_index,
    sharpness_simon_effect_ms: data.sharpness_simon_effect_ms,
    sharpness_rt_switch_cost_ms: data.sharpness_rt_switch_cost_ms,
    updated_at: data.updated_at || '',
  };
}

export async function getAllPillarScoresForParticipant(participantId: string): Promise<PillarScores[]> {
  const { data } = await supabase
    .from('pillar_scores')
    .select('*')
    .eq('participant_id', participantId)
    .order('session_number', { ascending: true });
  if (!data) return [];
  return data.map(d => ({
    participant_id: d.participant_id,
    session_number: d.session_number,
    recall_raw: d.recall_raw,
    lockin_raw: d.lockin_raw,
    sharpness_raw: d.sharpness_raw,
    recall_fluency: d.recall_fluency,
    lockin_degradation_index: d.lockin_degradation_index,
    sharpness_simon_effect_ms: d.sharpness_simon_effect_ms,
    sharpness_rt_switch_cost_ms: d.sharpness_rt_switch_cost_ms,
    updated_at: d.updated_at || '',
  }));
}

export async function savePillarScore(participantId: string, sessionNumber: number, updates: Partial<PillarScores>) {
  const { data: existing } = await supabase
    .from('pillar_scores')
    .select('id')
    .eq('participant_id', participantId)
    .eq('session_number', sessionNumber)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('pillar_scores')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('participant_id', participantId)
      .eq('session_number', sessionNumber);
    if (error) console.error('savePillarScore update error:', error);
  } else {
    const { error } = await supabase.from('pillar_scores').insert({
      participant_id: participantId,
      session_number: sessionNumber,
      recall_raw: null,
      lockin_raw: null,
      sharpness_raw: null,
      recall_fluency: null,
      lockin_degradation_index: null,
      sharpness_simon_effect_ms: null,
      sharpness_rt_switch_cost_ms: null,
      ...updates,
    });
    if (error) console.error('savePillarScore insert error:', error);
  }
}

export async function isSessionComplete(participantId: string, sessionNumber: number): Promise<boolean> {
  const scores = await getPillarScores(participantId, sessionNumber);
  if (!scores) return false;
  return scores.recall_raw != null && scores.lockin_raw != null && scores.sharpness_raw != null;
}

// ====== Participants ======

export async function getParticipants(): Promise<ParticipantRecord[]> {
  const { data } = await supabase.from('participants').select('*').order('created_at', { ascending: false });
  if (!data) return [];
  return data.map(dbToParticipant);
}

export async function saveParticipant(p: ParticipantRecord) {
  const { data: existing } = await supabase
    .from('participants')
    .select('id')
    .eq('participant_id', p.participant_id)
    .maybeSingle();

  const row = participantToDb(p);
  if (existing) {
    const { error } = await supabase.from('participants').update(row).eq('participant_id', p.participant_id);
    if (error) console.error('saveParticipant update error:', error);
  } else {
    const { error } = await supabase.from('participants').insert(row);
    if (error) console.error('saveParticipant insert error:', error);
  }
}

export async function findParticipant(id: string): Promise<ParticipantRecord | null> {
  const { data } = await supabase.from('participants').select('*').eq('participant_id', id).maybeSingle();
  if (!data) return null;
  return dbToParticipant(data);
}

export async function generateParticipantId(): Promise<string> {
  const year = new Date().getFullYear();

  // Atomic increment using select then update
  const { data } = await supabase.from('participant_id_counter').select('next_id').eq('id', 1).single();
  const nextId = data?.next_id || 1;
  await supabase.from('participant_id_counter').update({ next_id: nextId + 1 }).eq('id', 1);

  return `RYB-${year}-${String(nextId).padStart(4, '0')}`;
}

// ====== Sessions ======

export async function getSessions(): Promise<any[]> {
  const { data } = await supabase.from('sessions').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function getParticipantSessions(participantId: string): Promise<any[]> {
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('participant_id', participantId)
    .eq('practice', false)
    .order('session_number', { ascending: true });
  return data || [];
}

export async function saveSession(session: any) {
  const { data: existing } = await supabase
    .from('sessions')
    .select('id')
    .eq('session_id', session.session_id)
    .maybeSingle();

  const row: any = {
    session_id: session.session_id,
    participant_id: session.participant_id,
    session_number: session.session_number || 1,
    facilitator_id: session.facilitator_id || '',
    location: session.location || '',
    form_id: session.recall_test?.form_id || session.form_id || 'A',
    timestamp_start: session.timestamp_start,
    timestamp_end: session.timestamp_end,
    session_duration_seconds: session.session_duration_seconds,
    practice: session.practice || false,
  };

  // Only set flags that are explicitly provided (don't reset others)
  if (session.recall_done != null) row.recall_done = session.recall_done;
  if (session.recall_test != null) row.recall_test_data = session.recall_test;
  if (session.lockin_done != null) row.lockin_done = session.lockin_done;
  if (session.lockin_test_data != null) row.lockin_test_data = session.lockin_test_data;
  if (session.sharpness_done != null) row.sharpness_done = session.sharpness_done;
  if (session.sharpness_test_data != null) row.sharpness_test_data = session.sharpness_test_data;

  if (existing) {
    const { error } = await supabase.from('sessions').update(row).eq('session_id', session.session_id);
    if (error) console.error('saveSession update error:', error);
  } else {
    const { error } = await supabase.from('sessions').insert(row);
    if (error) console.error('saveSession insert error:', error);
  }
}

export async function generateSessionId(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase.from('sessions').select('*', { count: 'exact', head: true });
  const num = (count || 0) + 1;
  return `SES-${year}-${String(num).padStart(5, '0')}`;
}

export async function getNextFormForParticipant(participantId: string): Promise<FormId> {
  const sessions = await getParticipantSessions(participantId);
  const forms = await getAvailableFormIds();
  const totalForms = forms.length || 4;
  const idx = sessions.length % totalForms;
  return forms[idx] || 'A';
}

// ====== Helpers ======

function dbToParticipant(d: any): ParticipantRecord {
  return {
    participant_id: d.participant_id,
    created_at: d.created_at,
    created_by_facilitator: d.created_by_facilitator || '',
    created_at_location: d.created_at_location || '',
    demographics: d.name ? {
      name: d.name,
      age_band: d.age_band || '25-29',
      gender: d.gender || 'prefer-not-to-say',
      education_level: d.education_level || 'other',
      occupation_type: d.occupation_type || 'unemployed',
      seniority_level: d.seniority_level || 'not-applicable',
      demand_profile: d.demand_profile || 'LOWER',
    } : undefined,
    session_count: d.session_count || 0,
    last_session_date: d.last_session_date ? new Date(d.last_session_date).toISOString().split('T')[0] : null,
    last_recall_raw_score: null,
    sessions: [],
  };
}

function participantToDb(p: ParticipantRecord) {
  return {
    participant_id: p.participant_id,
    name: p.demographics?.name || '',
    age_band: p.demographics?.age_band || null,
    gender: p.demographics?.gender || null,
    education_level: p.demographics?.education_level || null,
    occupation_type: p.demographics?.occupation_type || null,
    seniority_level: p.demographics?.seniority_level || null,
    demand_profile: p.demographics?.demand_profile || null,
    created_by_facilitator: p.created_by_facilitator,
    created_at_location: p.created_at_location,
    session_count: p.session_count,
    last_session_date: p.last_session_date || null,
  };
}
