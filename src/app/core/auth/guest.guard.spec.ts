import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot } from '@angular/router';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
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

  it('allows access to the auth pages when there is no authenticated session', async () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/entrar' } as RouterStateSnapshot;

    const resultPromise = TestBed.runInInjectionContext(() => guestGuard(route, state));

    httpMock.expectOne('/api/auth/me').flush({ configured: true, user: null });

    const result = await resultPromise;

    expect(result).toBe(true);
  });
});
