import { Component, output } from '@angular/core';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { Gift } from '../../../core/models/gift.model';

const FREE_CONTRIBUTION_GIFT: Gift = {
  id: 'free-contribution',
  name: 'Contribuição livre',
  description: 'Ajude com o valor que preferir — todo carinho conta.',
  imageUrl: '',
  suggestedAmount: null,
  category: 'livre',
  isPublished: true,
  allowsFreeContribution: true,
};

@Component({
  selector: 'app-free-contribution-card',
  imports: [UiCard, UiButton],
  templateUrl: './free-contribution-card.html',
  styleUrl: './free-contribution-card.scss',
})
export class FreeContributionCard {
  contribute = output<Gift>();

  choose(): void {
    this.contribute.emit(FREE_CONTRIBUTION_GIFT);
  }
}
