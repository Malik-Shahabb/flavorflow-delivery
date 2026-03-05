
-- Restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  delivery_time TEXT NOT NULL DEFAULT '30-45 min',
  delivery_fee NUMERIC(5,2) NOT NULL DEFAULT 2.99,
  min_order NUMERIC(5,2) NOT NULL DEFAULT 10,
  image TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
  address TEXT NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menu items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(8,2) NOT NULL,
  image TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
  category TEXT NOT NULL DEFAULT 'Mains',
  is_veg BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view restaurants
CREATE POLICY "Anyone can view restaurants" ON public.restaurants FOR SELECT USING (true);

-- Owners can insert their own restaurants
CREATE POLICY "Users can create restaurants" ON public.restaurants FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own restaurants
CREATE POLICY "Owners can update their restaurants" ON public.restaurants FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- Owners can delete their own restaurants
CREATE POLICY "Owners can delete their restaurants" ON public.restaurants FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Everyone can view menu items
CREATE POLICY "Anyone can view menu items" ON public.menu_items FOR SELECT USING (true);

-- Restaurant owners can manage menu items
CREATE POLICY "Owners can insert menu items" ON public.menu_items FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()));

CREATE POLICY "Owners can update menu items" ON public.menu_items FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()));

CREATE POLICY "Owners can delete menu items" ON public.menu_items FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()));
