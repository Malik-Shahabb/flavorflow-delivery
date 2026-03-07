
-- Orders table to persist orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  restaurant_name text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Customers can insert their own orders
CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Restaurant owners can view orders for their restaurants
CREATE POLICY "Owners can view orders for their restaurants" ON public.orders
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid()
  ));

-- Order notifications table
CREATE TABLE public.order_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  restaurant_name text NOT NULL,
  customer_name text NOT NULL DEFAULT 'Customer',
  total numeric NOT NULL DEFAULT 0,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;

-- Owners can view their notifications
CREATE POLICY "Owners can view their notifications" ON public.order_notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

-- Owners can update (mark as read) their notifications
CREATE POLICY "Owners can update their notifications" ON public.order_notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id);

-- Anyone authenticated can insert notifications (needed when placing orders)
CREATE POLICY "Authenticated users can create notifications" ON public.order_notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_notifications;
