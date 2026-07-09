
CREATE TABLE public.capsules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  source_ai TEXT,
  raw_content TEXT NOT NULL,
  structured JSONB NOT NULL,
  markdown TEXT NOT NULL,
  tokens_original INTEGER NOT NULL DEFAULT 0,
  tokens_compressed INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.capsules TO authenticated;
GRANT SELECT ON public.capsules TO anon;
GRANT ALL ON public.capsules TO service_role;

ALTER TABLE public.capsules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own capsules"
  ON public.capsules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public capsules"
  ON public.capsules FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Users can create their own capsules"
  ON public.capsules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own capsules"
  ON public.capsules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own capsules"
  ON public.capsules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX capsules_user_id_created_at_idx ON public.capsules (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER capsules_set_updated_at
  BEFORE UPDATE ON public.capsules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
