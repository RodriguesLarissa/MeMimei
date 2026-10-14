import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeroSection } from './hero-section';

describe('HeroSection', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('shows the main call to action', () => {
    const fixture = TestBed.createComponent(HeroSection);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Crie sua lista');
  });
});
