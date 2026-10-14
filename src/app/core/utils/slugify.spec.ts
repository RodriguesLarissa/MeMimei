import { slugify } from './slugify';

describe('slugify', () => {
  it('converts accented, spaced text into a lowercase kebab slug', () => {
    expect(slugify('Chá de Casa Nova da Dona Marly')).toBe('cha-de-casa-nova-da-dona-marly');
  });

  it('collapses repeated separators and trims leading/trailing hyphens', () => {
    expect(slugify('  Múltiplos   espaços!!  ')).toBe('multiplos-espacos');
  });

  it('removes symbols that are not letters or numbers', () => {
    expect(slugify('Festa 30 anos @Casa!')).toBe('festa-30-anos-casa');
  });
});
