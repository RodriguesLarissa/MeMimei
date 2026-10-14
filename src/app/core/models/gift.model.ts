import { GiftCategory } from './gift-category';

export interface Gift {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  suggestedAmount: number | null;
  category: GiftCategory;
  isPublished: boolean;
  allowsFreeContribution: boolean;
}
