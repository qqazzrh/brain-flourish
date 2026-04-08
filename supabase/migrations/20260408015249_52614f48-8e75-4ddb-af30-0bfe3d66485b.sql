
CREATE TABLE public.facilitators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facilitator_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  pin TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.facilitators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to facilitators"
  ON public.facilitators FOR ALL
  USING (true) WITH CHECK (true);

CREATE TRIGGER update_facilitators_updated_at
  BEFORE UPDATE ON public.facilitators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
