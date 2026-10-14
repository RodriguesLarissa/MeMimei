export type OccasionType =
  | 'cha-de-casa-nova'
  | 'casamento'
  | 'aniversario'
  | 'cha-de-bebe'
  | 'formatura';

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
