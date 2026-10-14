import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RegisterPage } from './register-page';

describe('RegisterPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.match('/api/auth/me').forEach((req) => req.flush({ configured: false, user: null }));
  });

  it('marks the form invalid when the passwords do not match', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    const component = fixture.componentInstance;

    component.form.setValue({
      displayName: 'Marly',
      email: 'marly@email.com',
      password: 'senha123',
      confirmPassword: 'outraSenha',
    });

    expect(component.form.errors?.['passwordsMismatch']).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('is valid when the passwords match and all fields are filled', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    const component = fixture.componentInstance;

    component.form.setValue({
      displayName: 'Marly',
      email: 'marly@email.com',
      password: 'senha123',
      confirmPassword: 'senha123',
    });

    expect(component.form.valid).toBe(true);
  });
});
