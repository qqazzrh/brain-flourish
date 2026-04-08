
-- Participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  age_band TEXT,
  gender TEXT,
  education_level TEXT,
  occupation_type TEXT,
  seniority_level TEXT,
  demand_profile TEXT,
  created_by_facilitator TEXT NOT NULL DEFAULT '',
  created_at_location TEXT NOT NULL DEFAULT '',
  session_count INTEGER NOT NULL DEFAULT 0,
  last_session_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to participants" ON public.participants FOR ALL USING (true) WITH CHECK (true);

-- Sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  participant_id TEXT NOT NULL REFERENCES public.participants(participant_id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL DEFAULT 1,
  facilitator_id TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  form_id TEXT NOT NULL DEFAULT 'A',
  timestamp_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  timestamp_end TIMESTAMPTZ,
  session_duration_seconds INTEGER,
  practice BOOLEAN NOT NULL DEFAULT false,
  recall_done BOOLEAN NOT NULL DEFAULT false,
  lockin_done BOOLEAN NOT NULL DEFAULT false,
  sharpness_done BOOLEAN NOT NULL DEFAULT false,
  recall_test_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);

-- Pillar scores table
CREATE TABLE public.pillar_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id TEXT NOT NULL REFERENCES public.participants(participant_id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL DEFAULT 1,
  recall_raw NUMERIC,
  lockin_raw NUMERIC,
  sharpness_raw NUMERIC,
  recall_fluency NUMERIC,
  lockin_degradation_index NUMERIC,
  sharpness_simon_effect_ms NUMERIC,
  sharpness_rt_switch_cost_ms NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(participant_id, session_number)
);

ALTER TABLE public.pillar_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to pillar_scores" ON public.pillar_scores FOR ALL USING (true) WITH CHECK (true);

-- ID counter table
CREATE TABLE public.participant_id_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  next_id INTEGER NOT NULL DEFAULT 1,
  CHECK (id = 1)
);

ALTER TABLE public.participant_id_counter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to participant_id_counter" ON public.participant_id_counter FOR ALL USING (true) WITH CHECK (true);

-- Seed the counter
INSERT INTO public.participant_id_counter (id, next_id) VALUES (1, 1);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON public.participants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pillar_scores_updated_at BEFORE UPDATE ON public.pillar_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_sessions_participant ON public.sessions(participant_id);
CREATE INDEX idx_pillar_scores_participant ON public.pillar_scores(participant_id);
