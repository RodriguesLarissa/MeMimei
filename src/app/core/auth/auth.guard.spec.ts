import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('redirects to /entrar when there is no authenticated session', async () => {
    const router = TestBed.inject(Router);
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/painel' } as RouterStateSnapshot;

    const result = await TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toContain('/entrar');
  });
});
