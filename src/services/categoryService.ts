import { supabase } from "@/integrations/supabase/client";

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  sub_categories: SubCategory[];
}

/**
 * Fetches all categories with their subcategories from the database
 * @returns Promise with categories data or null if error occurs
 */
export const fetchCategories = async (): Promise<Category[] | null> => {
  try {
    const { data, error } = await (supabase as any)
      .from('categories')
      .select(`
        id,
        name,
        sub_categories:sub_categories_category_id_fkey (
          id,
          name
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return null;
    }

    console.log('Fetched categories:', data);
    return data as Category[];
  } catch (error) {
    console.error('Unexpected error fetching categories:', error);
    return null;
  }
};
