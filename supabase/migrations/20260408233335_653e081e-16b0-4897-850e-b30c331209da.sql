
-- Add rule_type and correct_answer columns
ALTER TABLE public.word_trials ADD COLUMN IF NOT EXISTS rule_type text NOT NULL DEFAULT 'meaning';
ALTER TABLE public.word_trials ADD COLUMN IF NOT EXISTS correct_answer text NOT NULL DEFAULT '';

-- Clear existing data (will be regenerated correctly)
DELETE FROM public.word_trials;
