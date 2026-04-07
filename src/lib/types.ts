export type FormId = 'A' | 'B' | 'C' | 'D';
export type UnitCategory = 'WHO' | 'WHAT' | 'WHERE' | 'WHEN' | 'SPECIFIC';
export type SyncStatus = 'local_only' | 'pending' | 'synced' | 'conflict';
export type ParticipantType = 'new' | 'returning';
export type AgeBand = '18-24' | '25-29' | '30-34' | '35-44' | '45-54';
export type DemandProfile = 'HIGH' | 'MODERATE' | 'LOWER';
export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
export type EducationLevel = 'high-school' | 'some-college' | 'bachelors' | 'masters' | 'doctorate' | 'other';
export type OccupationType = 'creative' | 'student' | 'unemployed' | 'blue-collar' | 'knowledge-worker';
export type SeniorityLevel = 'entry' | 'mid' | 'senior' | 'executive' | 'not-applicable';

export interface ParticipantDemographics {
  name: string;
  age_band: AgeBand;
  gender: Gender;
  education_level: EducationLevel;
  occupation_type: OccupationType;
  seniority_level: SeniorityLevel;
  demand_profile: DemandProfile;
}

export interface ScoreableUnit {
  unit_id: number;
  category: UnitCategory;
  label: string;
  accepted_variants: string[];
}

export interface PassageForm {
  form_id: FormId;
  domain: string;
  word_count: number;
  fk_grade: number;
  emotional_valence_mean: number;
  passage_text: string;
  scoreable_units: ScoreableUnit[];
}

export interface DistractionTask {
  form_id: FormId;
  category: string;
  letter: string;
  expected_valid_range: [number, number];
  instruction_template: string;
}

export interface CategoryScore {
  recalled: number[];
  missed: number[];
  score: number;
  max: number;
}

export interface RecallTestData {
  form_id: FormId;
  passage_domain: string;
  distraction_category: string;
  distraction_letter: string;
  distraction_valid_count: number;
  distraction_invalid_count: number;
  distraction_duration_seconds: number;
  distraction_timer_start: string | null;
  one_time_prompt_used: boolean;
  recall_duration_seconds: number;
  recall_timer_used: boolean;
  units_recalled: number[];
  units_missed: number[];
  recall_order_timestamps: Record<string, string>;
  raw_score: number;
  pillar_score: number;
  fluency_score: number;
  category_scores: {
    who: CategoryScore;
    what: CategoryScore;
    where: CategoryScore;
    when: CategoryScore;
    specific_detail: CategoryScore;
  };
  score_edited_before_save: boolean;
  sync_status: SyncStatus;
}

export interface SessionRecord {
  session_id: string;
  participant_id: string;
  participant_type: ParticipantType;
  session_number: number;
  facilitator_id: string;
  location: string;
  timestamp_start: string;
  timestamp_end: string | null;
  session_duration_seconds: number | null;
  practice: boolean;
  recall_test: RecallTestData;
}

export interface ParticipantRecord {
  participant_id: string;
  created_at: string;
  created_by_facilitator: string;
  created_at_location: string;
  demographics?: ParticipantDemographics;
  session_count: number;
  last_session_date: string | null;
  last_recall_raw_score: number | null;
  sessions: string[];
}

export interface Facilitator {
  id: string;
  name: string;
}

export interface RecallSessionState {
  facilitator: Facilitator | null;
  location: string;
  participant: ParticipantRecord | null;
  participantType: ParticipantType;
  assignedForm: FormId;
  currentScreen: number;
  sessionStartTime: string | null;
  isPractice: boolean;
  // Distraction
  distractionValidCount: number;
  distractionInvalidCount: number;
  distractionTimerStart: string | null;
  // Recall
  recalledUnits: Set<number>;
  recallOrderTimestamps: Record<string, string>;
  recallStartTime: string | null;
  oneTimePromptUsed: boolean;
  recallTimerUsed: boolean;
  // Editing
  scoreEdited: boolean;
}
