import { DEMO_EVENT_SLUG, getMockEventBySlug } from './mock-event';

describe('getMockEventBySlug', () => {
  it('returns the demo event for the known slug', () => {
    const result = getMockEventBySlug(DEMO_EVENT_SLUG);
    expect(result?.event.name).toBe('Chá de Casa Nova da Dona Marly');
  });

  it('returns undefined for an unknown slug', () => {
    expect(getMockEventBySlug('slug-que-nao-existe')).toBeUndefined();
  });

  it('only returns published gifts data for the demo event', () => {
    const result = getMockEventBySlug(DEMO_EVENT_SLUG);
    expect(result?.gifts.length).toBeGreaterThan(0);
    expect(result?.gifts.every((gift) => gift.isPublished)).toBe(true);
  });
});
