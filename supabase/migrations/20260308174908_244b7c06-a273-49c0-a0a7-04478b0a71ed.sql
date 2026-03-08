-- Add delivery_agent_id to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_agent_id uuid;

-- RLS: Delivery agents can view orders assigned to them or unassigned out-for-delivery orders
CREATE POLICY "Delivery agents can view assigned orders"
ON public.orders FOR SELECT TO authenticated
USING (
  delivery_agent_id = auth.uid() 
  OR (
    delivery_agent_id IS NULL 
    AND status IN ('confirmed', 'preparing', 'out-for-delivery')
    AND has_role(auth.uid(), 'delivery')
  )
);

-- RLS: Delivery agents can update assigned orders
CREATE POLICY "Delivery agents can update assigned orders"
ON public.orders FOR UPDATE TO authenticated
USING (
  delivery_agent_id = auth.uid() 
  AND has_role(auth.uid(), 'delivery')
)
WITH CHECK (
  delivery_agent_id = auth.uid() 
  AND has_role(auth.uid(), 'delivery')
);

-- Create delivery_profiles table for agent-specific info
CREATE TABLE IF NOT EXISTS public.delivery_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  vehicle_type text NOT NULL DEFAULT 'bike',
  vehicle_number text NOT NULL DEFAULT '',
  is_available boolean NOT NULL DEFAULT true,
  total_deliveries integer NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own delivery profile"
ON public.delivery_profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Agents can insert own delivery profile"
ON public.delivery_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Agents can update own delivery profile"
ON public.delivery_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all delivery profiles"
ON public.delivery_profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));