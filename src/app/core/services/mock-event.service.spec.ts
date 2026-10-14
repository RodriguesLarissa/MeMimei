import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockEventService } from './mock-event.service';

describe('MockEventService', () => {
  let service: MockEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockEventService);
  });

  it('returns the demo event for a known slug', async () => {
    const event = await firstValueFrom(service.getEventBySlug('cha-de-casa-nova-da-dona-marly'));
    expect(event?.name).toBe('Chá de Casa Nova da Dona Marly');
  });

  it('returns undefined for an unknown slug', async () => {
    const event = await firstValueFrom(service.getEventBySlug('slug-que-nao-existe'));
    expect(event).toBeUndefined();
  });

  it('returns the gifts for a known event id', async () => {
    const gifts = await firstValueFrom(service.getGiftsByEventId('evt-001'));
    expect(gifts.length).toBeGreaterThan(0);
    expect(gifts.every((gift) => gift.isPublished)).toBe(true);
  });

  it('returns an empty list for an unknown event id', async () => {
    const gifts = await firstValueFrom(service.getGiftsByEventId('evt-999'));
    expect(gifts).toEqual([]);
  });
});
