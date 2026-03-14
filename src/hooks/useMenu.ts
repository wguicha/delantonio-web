import { useState, useEffect } from 'react';
import type { Category } from '../types';
import { menuService } from '../services/menuService';
import { staticMenuData } from '../data/menuData';

interface UseMenuResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  usingStaticData: boolean;
}

export function useMenu(): UseMenuResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingStaticData, setUsingStaticData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchMenu() {
      try {
        const data = await menuService.getCategories();
        if (!cancelled) {
          setCategories(data);
          setUsingStaticData(false);
        }
      } catch {
        if (!cancelled) {
          // Fall back to static data when API is unavailable
          setCategories(staticMenuData);
          setUsingStaticData(true);
          setError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMenu();
    return () => { cancelled = true; };
  }, []);

  return { categories, loading, error, usingStaticData };
}
