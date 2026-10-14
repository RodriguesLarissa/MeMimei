import { Component } from '@angular/core';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq-section',
  templateUrl: './faq-section.html',
  styleUrl: './faq-section.scss',
})
export class FaqSection {
  readonly items: FaqItem[] = [
    {
      question: 'O convidado compra e entrega o presente?',
      answer:
        'Não. Os presentes na lista são simbólicos: cada um representa um valor em dinheiro. O convidado contribui com esse valor e o anfitrião decide depois o que comprar.',
    },
    {
      question: 'Eu recebo o dinheiro direto na minha conta?',
      answer:
        'As contribuições são processadas por um provedor de pagamento com Pix. O valor fica disponível para você após a confirmação do pagamento.',
    },
    {
      question: 'Posso escolher o valor da contribuição?',
      answer:
        'Sim. Cada presente tem um valor sugerido, mas você pode contribuir com o valor que quiser, incluindo através da opção de contribuição livre.',
    },
    {
      question: 'Vários convidados podem contribuir para o mesmo presente?',
      answer:
        'Sim. Um presente não é "reservado" por uma única pessoa — várias pessoas podem contribuir juntas para o mesmo item.',
    },
    {
      question: 'É seguro compartilhar minha lista pelo WhatsApp?',
      answer:
        'Sim. A página pública do seu evento mostra apenas as informações necessárias para os convidados escolherem um presente, sem expor dados pessoais ou financeiros.',
    },
  ];
}
