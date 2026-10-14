export type ContributionStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';

export interface Contribution {
  id: string;
  eventId: string;
  giftId: string | null;
  giftName: string | null;
  guestName: string | null;
  guestMessage: string | null;
  amount: number;
  status: ContributionStatus;
  createdAt: string;
}

export interface CreateContributionInput {
  eventId: string;
  giftId: string | null;
  amount: number;
  guestName: string | null;
  guestMessage: string | null;
}

export interface CreateContributionResult {
  contributionId: string;
  qrCodeBase64: string;
  qrCodeText: string;
}
