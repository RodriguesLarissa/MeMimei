import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';

export class ImageUploadError extends Error {}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly http = inject(HttpClient);

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ url: string }>('/api/uploads', formData).pipe(
      map((response) => response.url),
      catchError((error: HttpErrorResponse) => {
        const message =
          typeof error.error?.error === 'string' ? error.error.error : 'Não foi possível enviar a imagem. Tente novamente.';
        return throwError(() => new ImageUploadError(message));
      }),
    );
  }

  deleteImage(url: string): void {
    this.http
      .delete('/api/uploads', { body: { url } })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }
}
