import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('redirects to /entrar when there is no authenticated session', async () => {
    const router = TestBed.inject(Router);
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/painel' } as RouterStateSnapshot;

    const resultPromise = TestBed.runInInjectionContext(() => authGuard(route, state));

    httpMock.expectOne('/api/auth/me').flush({ configured: true, user: null });

    const result = await resultPromise;

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toContain('/entrar');
  });
});
