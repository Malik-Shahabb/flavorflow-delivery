-- Allow restaurant owners to update orders for their restaurants (e.g. status changes)
CREATE POLICY "Owners can update orders for their restaurants"
ON public.orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = orders.restaurant_id
    AND restaurants.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = orders.restaurant_id
    AND restaurants.owner_id = auth.uid()
  )
);