import { Component, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-gallery-upload',
  templateUrl: './gallery-upload.html',
  styleUrl: './gallery-upload.scss',
})
export class GalleryUpload {
  private readonly storageService = inject(StorageService);

  label = input('Galeria de fotos');
  imageUrls = input<string[]>([]);
  imageUrlsChange = output<string[]>();

  readonly uploading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;

    this.errorMessage.set(null);
    this.uploading.set(true);

    try {
      const uploadedUrls = await Promise.all(
        files.map((file) => firstValueFrom(this.storageService.uploadImage(file))),
      );
      this.imageUrlsChange.emit([...this.imageUrls(), ...uploadedUrls]);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Não foi possível enviar uma das imagens. Tente novamente.',
      );
    } finally {
      this.uploading.set(false);
    }
  }

  remove(index: number): void {
    const current = this.imageUrls();
    const removedUrl = current[index];
    if (removedUrl) {
      this.storageService.deleteImage(removedUrl);
    }
    this.imageUrlsChange.emit(current.filter((_, i) => i !== index));
  }
}
