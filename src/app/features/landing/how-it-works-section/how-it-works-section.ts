import { Component } from '@angular/core';

interface Step {
  number: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-how-it-works-section',
  templateUrl: './how-it-works-section.html',
  styleUrl: './how-it-works-section.scss',
})
export class HowItWorksSection {
  readonly steps: Step[] = [
    {
      number: '1',
      icon: '✍️',
      title: 'Crie sua lista',
      description: 'Monte sua página com os presentes que gostaria de receber e um valor sugerido para cada um.',
    },
    {
      number: '2',
      icon: '🔗',
      title: 'Compartilhe o link',
      description: 'Envie o link da sua página pelo WhatsApp para família e amigos.',
    },
    {
      number: '3',
      icon: '🎁',
      title: 'Convidados escolhem um presente',
      description: 'Cada convidado escolhe o presente que quer oferecer e contribui com o valor que desejar.',
    },
    {
      number: '4',
      icon: '💛',
      title: 'Você recebe e decide',
      description: 'As contribuições chegam até você, que decide com calma o que comprar para realizar seu sonho.',
    },
  ];
}
