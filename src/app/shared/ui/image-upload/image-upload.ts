import { Component, inject, input, output, signal } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.scss',
})
export class ImageUpload {
  private readonly storageService = inject(StorageService);

  label = input('Foto');
  imageUrl = input<string>('');
  imageUrlChange = output<string>();

  readonly uploading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.errorMessage.set(null);
    this.uploading.set(true);
    const previousUrl = this.imageUrl();

    this.storageService.uploadImage(file).subscribe({
      next: (url) => {
        this.uploading.set(false);
        if (previousUrl) {
          this.storageService.deleteImage(previousUrl);
        }
        this.imageUrlChange.emit(url);
      },
      error: (error: Error) => {
        this.uploading.set(false);
        this.errorMessage.set(error.message || 'Não foi possível enviar a imagem. Tente novamente.');
      },
    });
  }

  remove(): void {
    const previousUrl = this.imageUrl();
    if (previousUrl) {
      this.storageService.deleteImage(previousUrl);
    }
    this.imageUrlChange.emit('');
  }
}
