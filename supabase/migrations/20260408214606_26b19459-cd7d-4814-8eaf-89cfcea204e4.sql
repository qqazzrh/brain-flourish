
-- Table for generated recall passages
CREATE TABLE public.recall_passages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 120,
  fk_grade NUMERIC NOT NULL DEFAULT 12.5,
  emotional_valence_mean NUMERIC NOT NULL DEFAULT 0.3,
  passage_text TEXT NOT NULL,
  scoreable_units JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for distraction options per passage
CREATE TABLE public.distraction_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  letter TEXT NOT NULL DEFAULT '',
  instruction TEXT NOT NULL,
  valid_options JSONB NOT NULL,
  expected_valid_range JSONB NOT NULL DEFAULT '[6,16]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for word trials (category switching)
CREATE TABLE public.word_trials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  syllables INTEGER NOT NULL,
  options JSONB NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recall_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distraction_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_trials ENABLE ROW LEVEL SECURITY;

-- Public read access for all content tables
CREATE POLICY "Anyone can read recall_passages" ON public.recall_passages FOR SELECT USING (true);
CREATE POLICY "Anyone can read distraction_options" ON public.distraction_options FOR SELECT USING (true);
CREATE POLICY "Anyone can read word_trials" ON public.word_trials FOR SELECT USING (true);

-- Allow insert/update for edge functions (service role)
CREATE POLICY "Service role can manage recall_passages" ON public.recall_passages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage distraction_options" ON public.distraction_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage word_trials" ON public.word_trials FOR ALL USING (true) WITH CHECK (true);
