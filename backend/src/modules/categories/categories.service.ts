import { query } from '../../config/db';
import { CategoryRow } from '../../types';

export const getAllActive = async () => {
  const categories = await query<(CategoryRow & { children?: CategoryRow[] })[]>(
    'SELECT * FROM categories WHERE is_active = 1 ORDER BY name ASC'
  );

  const tree: (CategoryRow & { children: CategoryRow[] })[] = [];
  const map = new Map<number, CategoryRow & { children: CategoryRow[] }>();

  for (const cat of categories) {
    const node = { ...cat, children: [] };
    map.set(cat.id, node);
  }

  for (const cat of categories) {
    if (cat.parent_id !== null && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children.push(map.get(cat.id)!);
    } else {
      tree.push(map.get(cat.id)!);
    }
  }

  return tree;
};
