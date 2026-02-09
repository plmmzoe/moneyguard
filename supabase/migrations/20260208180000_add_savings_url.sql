-- Add url column to savings table (e.g. link to product or goal reference)
ALTER TABLE public.savings
  ADD COLUMN IF NOT EXISTS url text;

COMMENT ON COLUMN public.savings.url IS 'Optional URL associated with the savings goal.';
