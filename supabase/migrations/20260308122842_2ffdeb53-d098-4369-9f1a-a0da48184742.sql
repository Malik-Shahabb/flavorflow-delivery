
ALTER TABLE public.restaurants ADD COLUMN is_approved boolean NOT NULL DEFAULT false;

-- Update existing restaurants to approved so they remain visible
UPDATE public.restaurants SET is_approved = true;
