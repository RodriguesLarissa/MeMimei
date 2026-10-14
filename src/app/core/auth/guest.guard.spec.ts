import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot } from '@angular/router';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('allows access to the auth pages when there is no authenticated session', async () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/entrar' } as RouterStateSnapshot;

    const result = await TestBed.runInInjectionContext(() => guestGuard(route, state));

    expect(result).toBe(true);
  });
});
