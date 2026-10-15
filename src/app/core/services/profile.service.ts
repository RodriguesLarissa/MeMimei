import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  get(): Observable<Profile> {
    return this.http.get<Profile>('/api/profile');
  }

  update(input: Profile): Observable<Profile> {
    return this.http.put<Profile>('/api/profile', input);
  }
}
