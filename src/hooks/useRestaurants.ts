import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  is_veg: boolean;
  is_popular: boolean;
}

export interface DbRestaurant {
  id: string;
  owner_id: string;
  name: string;
  cuisine: string;
  rating: number;
  review_count: number;
  delivery_time: string;
  delivery_fee: number;
  min_order: number;
  image: string;
  address: string;
  is_open: boolean;
  tags: string[];
  menu: DbMenuItem[];
}

export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: async (): Promise<DbRestaurant[]> => {
      const { data: restaurants, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: menuItems, error: mError } = await supabase
        .from("menu_items")
        .select("*");

      if (mError) throw mError;

      return (restaurants || []).map((r: any) => ({
        ...r,
        menu: (menuItems || []).filter((m: any) => m.restaurant_id === r.id),
      }));
    },
  });
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: async (): Promise<DbRestaurant | null> => {
      if (!id) return null;

      const { data: restaurant, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!restaurant) return null;

      const { data: menuItems, error: mError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", id);

      if (mError) throw mError;

      return { ...restaurant, menu: menuItems || [] } as DbRestaurant;
    },
    enabled: !!id,
  });
}
