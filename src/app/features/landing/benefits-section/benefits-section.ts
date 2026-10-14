import { Component } from '@angular/core';

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-benefits-section',
  templateUrl: './benefits-section.html',
  styleUrl: './benefits-section.scss',
})
export class BenefitsSection {
  readonly benefits: Benefit[] = [
    {
      icon: '🎯',
      title: 'Você escolhe o que comprar',
      description: 'Receba as contribuições em dinheiro e decida com calma o que realmente faz sentido.',
    },
    {
      icon: '📱',
      title: 'Feito para o WhatsApp',
      description: 'Compartilhe o link da sua lista em um toque, direto nos grupos de família e amigos.',
    },
    {
      icon: '🔒',
      title: 'Pensado com cuidado',
      description: 'A confirmação de cada contribuição passa por verificações seguras antes de aparecer para você.',
    },
    {
      icon: '💌',
      title: 'Mensagens de carinho',
      description: 'Convidados podem deixar uma mensagem especial junto com a contribuição.',
    },
  ];
}
