export type GiftCategory =
  | 'cozinha'
  | 'moveis'
  | 'decoracao'
  | 'eletrodomesticos'
  | 'livre';

export interface GiftCategoryInfo {
  id: GiftCategory;
  label: string;
  icon: string;
}

export const GIFT_CATEGORIES: GiftCategoryInfo[] = [
  { id: 'cozinha', label: 'Cozinha', icon: '🍲' },
  { id: 'moveis', label: 'Móveis', icon: '🛋️' },
  { id: 'decoracao', label: 'Decoração', icon: '🪴' },
  { id: 'eletrodomesticos', label: 'Eletrodomésticos', icon: '🔌' },
  { id: 'livre', label: 'Presentes livres', icon: '🎁' },
];
