import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  private readonly _client: SupabaseClient | null;

  constructor() {
    this._client =
      environment.supabaseUrl && environment.supabaseAnonKey
        ? createClient(environment.supabaseUrl, environment.supabaseAnonKey)
        : null;
  }

  isConfigured(): boolean {
    return this._client !== null;
  }

  get client(): SupabaseClient {
    if (!this._client) {
      throw new Error(
        'Supabase não está configurado. Preencha supabaseUrl e supabaseAnonKey em src/environments/environment.development.ts.',
      );
    }
    return this._client;
  }
}
