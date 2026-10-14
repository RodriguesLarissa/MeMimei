import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiBadge } from '../../../shared/ui/badge/badge';
import { UiButton } from '../../../shared/ui/button/button';

interface PreviewGift {
  name: string;
  imageUrl: string;
  suggestedAmount: number;
  categoryLabel: string;
}

@Component({
  selector: 'app-demo-preview-section',
  imports: [RouterLink, UiCard, UiBadge, UiButton],
  templateUrl: './demo-preview-section.html',
  styleUrl: './demo-preview-section.scss',
})
export class DemoPreviewSection {
  readonly previewGifts: PreviewGift[] = [
    {
      name: 'Jogo de panelas antiaderentes',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Pans_%28113563802%29.jpg',
      suggestedAmount: 420,
      categoryLabel: 'Cozinha',
    },
    {
      name: 'Sofá dois lugares',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/EFTA00000900_-_Modern_living_room_with_white_sofas_wooden_walls_framed_black-and-white_portraits_and_a_glass_coffee_table_filled_with_books_and_colorful_candy.jpg?width=360',
      suggestedAmount: 1800,
      categoryLabel: 'Móveis',
    },
    {
      name: 'Conjunto de plantas e vasos',
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Potted_plants_featuring_tropicals.jpg?width=360',
      suggestedAmount: 95,
      categoryLabel: 'Decoração',
    },
  ];
}
