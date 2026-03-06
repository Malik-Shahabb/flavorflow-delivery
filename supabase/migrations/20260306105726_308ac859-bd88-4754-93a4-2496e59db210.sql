
-- Drop restrictive SELECT policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can view restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;

CREATE POLICY "Anyone can view restaurants" ON public.restaurants
FOR SELECT USING (true);

CREATE POLICY "Anyone can view menu items" ON public.menu_items
FOR SELECT USING (true);
