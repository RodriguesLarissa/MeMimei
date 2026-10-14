import { Component } from '@angular/core';

interface Occasion {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-occasions-section',
  templateUrl: './occasions-section.html',
  styleUrl: './occasions-section.scss',
})
export class OccasionsSection {
  readonly occasions: Occasion[] = [
    { icon: '🏡', title: 'Chá de casa nova', description: 'Para deixar o novo lar ainda mais acolhedor.' },
    { icon: '💍', title: 'Casamento', description: 'Comece a vida a dois com quem você ama por perto.' },
    { icon: '🎂', title: 'Aniversário', description: 'Celebre mais um ano com contribuições especiais.' },
    { icon: '🍼', title: 'Chá de bebê', description: 'Prepare a chegada do bebê com muito carinho.' },
    { icon: '🎓', title: 'Formatura', description: 'Comemore essa conquista com quem torceu por você.' },
  ];
}
