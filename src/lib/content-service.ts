import { supabase } from '@/integrations/supabase/client';
import { PassageForm, DistractionTask, ScoreableUnit } from './types';
import { PASSAGE_FORMS, DISTRACTION_TASKS, FORM_DOMAINS } from './content-library';
import { DISTRACTION_OPTIONS as HARDCODED_DISTRACTION_OPTIONS, DistractionOptionSet } from './distraction-options';
import { WordTrial, WORD_LIBRARY } from './word-library';

// ====== Recall Passages ======

export async function getPassageForForm(formId: string): Promise<PassageForm> {
  // Pull ALL passages from DB and pick one at random for this session.
  // The formId param is preserved for backward compat / fallback only —
  // randomization is the new behavior so participants don't see the same
  // passage every session.
  const { data } = await supabase.from('recall_passages').select('*');

  if (data && data.length > 0) {
    const pick = data[Math.floor(Math.random() * data.length)];
    const units = (typeof pick.scoreable_units === 'string'
      ? JSON.parse(pick.scoreable_units)
      : pick.scoreable_units) as ScoreableUnit[];
    return {
      form_id: pick.form_id,
      domain: pick.domain,
      word_count: pick.word_count,
      fk_grade: Number(pick.fk_grade),
      emotional_valence_mean: Number(pick.emotional_valence_mean),
      passage_text: pick.passage_text,
      scoreable_units: units,
    };
  }

  // Fallback to hardcoded
  if (formId in PASSAGE_FORMS) return PASSAGE_FORMS[formId as keyof typeof PASSAGE_FORMS];
  return PASSAGE_FORMS.A;
}

export async function getFormDomain(formId: string): Promise<string> {
  // Domain is descriptive only; not needed for scoring. Keep simple.
  if (formId in FORM_DOMAINS) return FORM_DOMAINS[formId as keyof typeof FORM_DOMAINS];
  return 'Mixed';
}

// ====== Distraction Tasks ======

// Cache one random distraction row per session so getDistractionTask and
// getDistractionOptions return the same item.
let _cachedDistractionRow: any = null;
let _cachedDistractionFor: string | null = null;
let _inflightDistractionPromise: Promise<any> | null = null;

async function pickRandomDistractionRow(formId: string) {
  if (_cachedDistractionFor === formId && _cachedDistractionRow) return _cachedDistractionRow;
  if (_inflightDistractionPromise) return _inflightDistractionPromise;
  _inflightDistractionPromise = (async () => {
    const { data } = await supabase.from('distraction_options').select('*');
    if (data && data.length > 0) {
      _cachedDistractionRow = data[Math.floor(Math.random() * data.length)];
      _cachedDistractionFor = formId;
      return _cachedDistractionRow;
    }
    return null;
  })();
  try {
    return await _inflightDistractionPromise;
  } finally {
    _inflightDistractionPromise = null;
  }
}

export function resetSessionContentCache() {
  _cachedDistractionRow = null;
  _cachedDistractionFor = null;
  _inflightDistractionPromise = null;
}

export async function getDistractionTask(formId: string): Promise<DistractionTask> {
  const row = await pickRandomDistractionRow(formId);
  if (row) {
    return {
      form_id: row.form_id,
      category: row.category,
      letter: row.letter,
      expected_valid_range: (typeof row.expected_valid_range === 'string'
        ? JSON.parse(row.expected_valid_range)
        : row.expected_valid_range) as [number, number],
      instruction_template: `Name as many {category} as you can think of that begin with the letter {letter}.`,
    };
  }
  if (formId in DISTRACTION_TASKS) return DISTRACTION_TASKS[formId as keyof typeof DISTRACTION_TASKS];
  return DISTRACTION_TASKS.A;
}

export async function getDistractionOptions(formId: string): Promise<DistractionOptionSet> {
  const row = await pickRandomDistractionRow(formId);
  if (row) {
    const validOptions = (typeof row.valid_options === 'string'
      ? JSON.parse(row.valid_options)
      : row.valid_options) as string[];
    return {
      form_id: row.form_id,
      category: row.category,
      instruction: row.instruction,
      validOptions,
    };
  }
  if (formId in HARDCODED_DISTRACTION_OPTIONS) return HARDCODED_DISTRACTION_OPTIONS[formId as keyof typeof HARDCODED_DISTRACTION_OPTIONS];
  return HARDCODED_DISTRACTION_OPTIONS.A;
}

// ====== Word Trials ======

export async function getWordTrials(count: number = 20, ruleType?: string): Promise<WordTrial[]> {
  let query = supabase.from('word_trials').select('*');
  if (ruleType) query = query.eq('rule_type', ruleType);
  const { data } = await query;

  if (data && data.length >= count) {
    const trials: WordTrial[] = data.map(d => ({
      word: d.word,
      syllables: d.syllables,
      rule_type: (d as any).rule_type || 'meaning',
      options: (typeof d.options === 'string' ? JSON.parse(d.options) : d.options) as [string, string, string],
      correct_answer: (d as any).correct_answer || '',
      answers: (typeof d.answers === 'string' ? JSON.parse(d.answers) : d.answers) as { meaning: string; letter: string; syllables: string },
    }));
    for (let i = trials.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [trials[i], trials[j]] = [trials[j], trials[i]];
    }
    return trials.slice(0, count);
  }

  const arr = [...WORD_LIBRARY].filter(w => !ruleType || w.rule_type === ruleType);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

// ====== Form Selection ======

export async function getAvailableFormIds(): Promise<string[]> {
  const { data } = await supabase
    .from('recall_passages')
    .select('form_id');

  const dbForms = (data || []).map(d => d.form_id);
  const hardcodedForms = ['A', 'B', 'C', 'D'];

  // Combine, deduplicate
  const all = new Set([...dbForms, ...hardcodedForms]);
  return Array.from(all).sort();
}

export async function getNextFormForParticipant(participantId: string): Promise<string> {
  const { data: sessions } = await supabase
    .from('sessions')
    .select('form_id')
    .eq('participant_id', participantId)
    .eq('practice', false)
    .order('session_number', { ascending: true });

  const pastSessions = sessions || [];
  const availableForms = await getAvailableFormIds();
  const totalForms = availableForms.length;

  if (totalForms === 0) return 'A';
  const idx = pastSessions.length % totalForms;
  return availableForms[idx];
}

// ====== Content Stats ======

export async function getContentStats(): Promise<{ passages: number; distractions: number; wordTrials: number }> {
  const [p, d, w] = await Promise.all([
    supabase.from('recall_passages').select('*', { count: 'exact', head: true }),
    supabase.from('distraction_options').select('*', { count: 'exact', head: true }),
    supabase.from('word_trials').select('*', { count: 'exact', head: true }),
  ]);

  return {
    passages: (p.count || 0) + 4, // +4 hardcoded
    distractions: (d.count || 0) + 4,
    wordTrials: (w.count || 0) + 65, // +65 hardcoded
  };
}
