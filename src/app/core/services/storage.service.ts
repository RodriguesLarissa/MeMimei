import { Injectable, inject } from '@angular/core';
import { Observable, from, map, throwError } from 'rxjs';
import { SupabaseClientService } from '../supabase/supabase-client.service';
import { AuthService } from '../auth/auth.service';

const BUCKET = 'event-images';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export class ImageUploadError extends Error {}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly supabase = inject(SupabaseClientService);
  private readonly authService = inject(AuthService);

  uploadImage(file: File): Observable<string> {
    if (!file.type.startsWith('image/')) {
      return throwError(() => new ImageUploadError('Escolha um arquivo de imagem (JPG, PNG, WEBP...).'));
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return throwError(() => new ImageUploadError('A imagem precisa ter no máximo 5MB.'));
    }

    const userId = this.authService.currentUser()?.id;
    if (!userId) {
      return throwError(() => new ImageUploadError('É preciso estar autenticado para enviar uma imagem.'));
    }

    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;

    const upload = this.supabase.client.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    return from(upload).pipe(
      map(({ error }) => {
        if (error) throw error;
        const { data } = this.supabase.client.storage.from(BUCKET).getPublicUrl(path);
        return data.publicUrl;
      }),
    );
  }

  deleteImage(url: string): void {
    const path = this.extractPath(url);
    if (!path) return;

    this.supabase.client.storage
      .from(BUCKET)
      .remove([path])
      .catch(() => {
        // best-effort: não bloqueia a experiência do usuário se a limpeza falhar.
      });
  }

  private extractPath(url: string): string | null {
    const marker = `/${BUCKET}/`;
    const index = url.indexOf(marker);
    return index === -1 ? null : url.slice(index + marker.length);
  }
}
