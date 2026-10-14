import { Component, input } from '@angular/core';

@Component({
  selector: 'app-event-photo-gallery',
  templateUrl: './event-photo-gallery.html',
  styleUrl: './event-photo-gallery.scss',
})
export class EventPhotoGallery {
  imageUrls = input.required<string[]>();
}
