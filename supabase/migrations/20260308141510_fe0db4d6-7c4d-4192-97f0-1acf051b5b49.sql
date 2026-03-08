ALTER TABLE public.orders ADD COLUMN status_updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Set existing orders' status_updated_at to their created_at
UPDATE public.orders SET status_updated_at = created_at;