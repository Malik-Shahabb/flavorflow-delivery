-- Prevent duplicate reviews per order per user
CREATE UNIQUE INDEX IF NOT EXISTS reviews_user_order_unique ON public.reviews (user_id, order_id);

-- Allow users to cancel their own confirmed orders
CREATE POLICY "Users can cancel their confirmed orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'confirmed')
WITH CHECK (auth.uid() = user_id AND status = 'cancelled');