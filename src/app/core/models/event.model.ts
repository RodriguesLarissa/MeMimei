export type OccasionType =
  | 'cha-de-casa-nova'
  | 'casamento'
  | 'aniversario'
  | 'cha-de-bebe'
  | 'formatura';

export interface OccasionTypeInfo {
  id: OccasionType;
  label: string;
  icon: string;
}

export const OCCASION_TYPES: OccasionTypeInfo[] = [
  { id: 'cha-de-casa-nova', label: 'Chá de casa nova', icon: '🏡' },
  { id: 'casamento', label: 'Casamento', icon: '💍' },
  { id: 'aniversario', label: 'Aniversário', icon: '🎂' },
  { id: 'cha-de-bebe', label: 'Chá de bebê', icon: '🍼' },
  { id: 'formatura', label: 'Formatura', icon: '🎓' },
];

export interface GiftEvent {
  id: string;
  slug: string;
  name: string;
  occasionType: OccasionType;
  hostNames: string;
  eventDate: string | null;
  welcomeMessage: string;
  coverImageUrl: string;
  galleryImageUrls: string[];
  themeColor: string;
  isPublished: boolean;
}
