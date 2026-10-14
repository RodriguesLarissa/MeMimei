import { GiftEvent } from '../app/core/models/event.model';
import { Gift } from '../app/core/models/gift.model';

interface MockEventData {
  event: GiftEvent;
  gifts: Gift[];
}

/** Slug fixo do exemplo exibido na tela inicial — sempre fictício, nunca lido do Supabase. */
export const DEMO_EVENT_SLUG = 'cha-de-casa-nova-da-dona-marly';

const CHA_DE_CASA_NOVA_DONA_MARLY: MockEventData = {
  event: {
    id: 'evt-001',
    slug: DEMO_EVENT_SLUG,
    name: 'Chá de Casa Nova da Dona Marly',
    occasionType: 'cha-de-casa-nova',
    hostNames: 'Dona Marly',
    eventDate: '2026-11-22',
    welcomeMessage:
      'Depois de muito sonhar, a casa nova finalmente saiu do papel! Com muito carinho, preparei esta lista para quem quiser me ajudar a deixar esse cantinho ainda mais acolhedor. Cada contribuição, de qualquer tamanho, vai direto para realizar esse sonho. Obrigada por fazer parte disso comigo!',
    coverImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Nordisches_Einfamilienhaus.jpg',
    galleryImageUrls: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Interior_of_living_room_01.JPG?width=700',
      'https://commons.wikimedia.org/wiki/Special:FilePath/EFTA00001535_-_Bright_white_kitchen_with_sleek_cabinets_granite_island_and_modern_pendant_lights_under_vaulted_ceiling.jpg?width=700',
      'https://upload.wikimedia.org/wikipedia/commons/6/6d/Orkide_i_finstua_mot_vest.jpg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/EFTA00001556_-_Cozy_living_room_with_high_wooden_beams_white_armchairs_a_rustic_coffee_table_and_shelves_displaying_decorative_items_A_blue_ladder_stands_nearby_suggesting_ongoing_work_or_renovation.jpg?width=700',
    ],
    themeColor: '#C96A4B',
    isPublished: true,
  },
  gifts: [
    {
      id: 'gift-001',
      name: 'Jogo de panelas antiaderentes',
      description: 'Um conjunto completo para deixar a cozinha nova pronta para os primeiros almoços de domingo.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Pans_%28113563802%29.jpg',
      suggestedAmount: 420,
      category: 'cozinha',
      isPublished: true,
      allowsFreeContribution: true,
      purchaseUrl: null,
    },
    {
      id: 'gift-002',
      name: 'Jogo de taças de vidro',
      description: 'Para os brindes e jantares especiais na nova casa.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Twisted_stem_glass.JPG',
      suggestedAmount: 150,
      category: 'cozinha',
      isPublished: true,
      allowsFreeContribution: true,
      purchaseUrl: null,
    },
    {
      id: 'gift-003',
      name: 'Liquidificador',
      description: 'Essencial para os sucos e vitaminas de todo dia.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Vitamix_Blender.jpg',
      suggestedAmount: 220,
      category: 'eletrodomesticos',
      isPublished: true,
      allowsFreeContribution: true,
      purchaseUrl: null,
    },
    {
      id: 'gift-004',
      name: 'Micro-ondas',
      description: 'Para esquentar aquele cafezinho e praticidade no dia a dia.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Panasonic_NN-SD69LS_20220410.jpg',
      suggestedAmount: 650,
      category: 'eletrodomesticos',
      isPublished: true,
      allowsFreeContribution: true,
      purchaseUrl: null,
    },
    {
      id: 'gift-005',
      name: 'Sofá dois lugares',
      description: 'O cantinho perfeito para relaxar depois de um dia cheio.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/EFTA00000900_-_Modern_living_room_with_white_sofas_wooden_walls_framed_black-and-white_portraits_and_a_glass_coffee_table_filled_with_books_and_colorful_candy.jpg?width=480',
      suggestedAmount: 1800,
      category: 'moveis',
      isPublished: true,
      allowsFreeContribution: true,
      purchaseUrl: null,
    },
    {
      id: 'gift-006',
      name: 'Mesa de centro',
      description: 'Para decorar a sala com charme e funcionalidade.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/EFTA00002057_-_Cozy_living_room_with_stone_walls_a_fireplace_and_modern_furniture_featuring_a_wooden_coffee_table_and_plush_armchairs.jpg?width=480',
      suggestedAmount: 380,
      category: 'moveis',
      isPublished: true,
      allowsFreeContribution: true,
      purchaseUrl: null,
    },
    {
      id: 'gift-007',
      name: 'Conjunto de plantas e vasos',
      description: 'Um verde a mais para deixar a casa viva e aconchegante.',
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Potted_plants_featuring_tropicals.jpg?width=480',
      suggestedAmount: 95,
      category: 'decoracao',
      isPublished: true,
      allowsFreeContribution: true,
      purchaseUrl: null,
    },
    {
      id: 'gift-008',
      name: 'Quadros decorativos',
      description: 'Para dar personalidade às paredes da sala e do corredor.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Carved_frame_01_%2827133614537%29.jpg',
      suggestedAmount: 180,
      category: 'decoracao',
      isPublished: true,
      allowsFreeContribution: true,
      purchaseUrl: null,
    },
    {
      id: 'gift-009',
      name: 'Jogo de cama casal',
      description: 'Noites de sono ainda mais gostosas no quarto novo.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Prze%C5%9Bcierad%C5%82o.jpg',
      suggestedAmount: 240,
      category: 'decoracao',
      isPublished: true,
      allowsFreeContribution: true,
      purchaseUrl: null,
    },
    {
      id: 'gift-010',
      name: 'Contribuição livre',
      description: 'Quer ajudar, mas prefere escolher o valor? Essa é para você — todo carinho vai para a casa nova.',
      imageUrl: '',
      suggestedAmount: null,
      category: 'livre',
      isPublished: true,
      allowsFreeContribution: true,
      purchaseUrl: null,
    },
  ],
};

export function getMockEventBySlug(slug: string): MockEventData | undefined {
  return slug === DEMO_EVENT_SLUG ? CHA_DE_CASA_NOVA_DONA_MARLY : undefined;
}
