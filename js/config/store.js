// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Reactive State Store & Default Data Configuration
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_SITE_SETTINGS = {
  brandName: 'Maker3D',
  brandTagline: 'Impressão 3D de Alta Precisão',
  primaryColor: '#ff9e1b',
  accentOrange: '#ffb84d',
  promoBarActive: false,
  promoBarText: '',
  promoPill: 'MAKER3D PRO',
  freeShippingThreshold: 120,
  heroBadge: 'MANUFATURA ADITIVA DE PRECISÃO • PERFIS CALIBRADOS',
  heroTitleHtml: 'Modelos 3D & <em>Peças Técnicas</em> Sob Demanda',
  heroSubtitle: 'Catálogo profissional de modelos impressos em alta definição (0.12 mm) com filamentos calibrados PLA (R$ 150/kg), PETG (R$ 120/kg) e TPU/Trust (R$ 200/kg).',
  whatsappNumber: '5531984566047',
  instagramHandle: '@maker3d.oficial',
  instagramUrl: 'https://www.instagram.com/maker3d.oficial',
  supportEmail: 'maker3d.suporte@gmail.com',
  googleClientId: '',
  adminEmails: ['maker3d.suporte@gmail.com', 'rossipereira2010@gmail.com'],
  adminPin: 'maker3d2026',
  githubOwner: 'Maker3D-Shop',
  githubRepo: 'maker3d-shop.github.io',
  githubBranch: 'main',
  filamentPricesPerKg: {
    PLA: 150,
    PETG: 120,
    TPU: 200
  }
};

export const DEFAULT_PARTNERS = [
  {
    id: 'partner-nossa-barbearia',
    name: 'Nossa Barbearia',
    location: 'Congonhas, MG',
    category: 'Barbearia & Lifestyle',
    piecesProduced: 350,
    materialUsed: 'PLA Premium & PETG Personalizado',
    status: 'Parceiro Oficial Verificado',
    summary: 'Produção em série de aproximadamente 350 brindes personalizados em 3D com a identidade visual da Nossa Barbearia (Congonhas), desenvolvidos com alta precisão dimensional e acabamento exclusivo para clientes.',
    highlights: [
      '~350 peças produzidas em lote seriado',
      'Personalização com identidade da barbearia',
      'Controle de qualidade individual peça a peça',
      'Parceria local em Congonhas — MG'
    ]
  }
];

export const DEFAULT_COUPONS = [
  { code: 'MAKER10', discountPct: 10, minOrder: 0, active: true, desc: '10% OFF de boas-vindas' },
  { code: 'BEMVINDO15', discountPct: 15, minOrder: 60, active: true, desc: '15% OFF acima de R$ 60' },
  { code: 'VIP20', discountPct: 20, minOrder: 150, active: true, desc: '20% OFF em compras VIP' }
];

export const DEFAULT_FAQS = [
  {
    id: 'faq-1',
    q: 'Quais materiais e tabelas de preço por quilo vocês utilizam?',
    a: 'Trabalhamos com filamentos industriais calibrados: PLA Premium (R$ 150,00/kg — ideal para detalhes visuais e peças articuladas), PETG (R$ 120,00/kg — alta resistência mecânica e térmica) e TPU / Trust (R$ 200,00/kg — polímero flexível e elástico de alta durabilidade).'
  },
  {
    id: 'faq-2',
    q: 'Posso enviar meu próprio arquivo 3D (.STL / .OBJ / .3MF)?',
    a: 'Sim! Acesse a aba "Laboratório STL" para enviar seu arquivo, visualizar a malha 3D no navegador e calcular automaticamente o peso em gramas, tempo de impressão e custo baseado no material escolhido.'
  },
  {
    id: 'faq-3',
    q: 'Qual o prazo de produção e envio?',
    a: 'Peças do catálogo são produzidas com perfis otimizados de alta velocidade em 24h a 48h úteis. Enviamos para todo o Brasil com código de rastreio e embalagem técnica.'
  },
  {
    id: 'faq-4',
    q: 'Como funciona o sistema de Contas, Coleções e Curtidas?',
    a: 'Ao registrar sua conta ou entrar com Google, todas as suas peças curtidas, coleções salvas, itens no carrinho e histórico de objetos comprados ficam vinculados ao seu perfil no banco de dados.'
  },
  {
    id: 'faq-5',
    q: 'Como escolho combinações de cores em peças multicoloridas (AMS)?',
    a: 'Ao clicar em qualquer produto, a página técnica dedicada mostra os perfis de impressão e permite selecionar a cor exata de cada seção da peça antes de adicionar ao carrinho.'
  }
];

export const DEFAULT_GLOBAL_COLORS = [
  { name: 'Laranja Maker3D', hex: '#f07800', priceAdd: 0 },
  { name: 'Avelã', hex: '#bf540d', priceAdd: 0 },
  { name: 'Azul Cobalto', hex: '#0d54bf', priceAdd: 0 },
  { name: 'Preto Matte', hex: '#1c1c1c', priceAdd: 0 },
  { name: 'Branco Polar', hex: '#ffffff', priceAdd: 0 },
  { name: 'Verde Bambu', hex: '#00ae42', priceAdd: 0 },
  { name: 'Dourado Silk', hex: '#f0a500', priceAdd: 3 },
  { name: 'Vermelho Rubi', hex: '#c0392b', priceAdd: 2 },
  { name: 'Roxo Galáxia', hex: '#7d3c98', priceAdd: 4 }
];

export const FALLBACK_PRODUCTS = [
  {
    id: 9,
    name: 'Projeto Sob Medida / Impressão STL',
    emoji: '📐',
    category: 'Customizado',
    desc: 'Envie seu arquivo STL/3MF ou link do MakerWorld. Fatiamento profissional com cálculo exato por grama (PLA R$ 150/kg • PETG R$ 120/kg • TPU/Trust R$ 200/kg).',
    price: null,
    badge: 'Sob Demanda',
    discount: 0,
    rating: 5.0,
    reviewsCount: 42,
    downloadsCount: 310,
    printsCount: 198,
    layerHeight: '0.12 mm',
    infill: '20% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA / PETG / TPU',
    model3d: 'assets/products/models/p1.glb',
    image: 'assets/products/images/P1/p1.png',
    custom: true,
    gallery: [
      'assets/products/images/P1/p1.png',
      'assets/products/images/P1/p2.png'
    ],
    colorSections: [
      {
        name: 'Cor Principal',
        colors: [
          { name: 'Laranja Maker3D', hex: '#f07800' },
          { name: 'Preto Matte', hex: '#1c1c1c' },
          { name: 'Branco Polar', hex: '#ffffff' }
        ]
      }
    ],
    colors: [
      { name: 'Laranja Maker3D', hex: '#f07800' },
      { name: 'Preto Matte', hex: '#1c1c1c' },
      { name: 'Branco Polar', hex: '#ffffff' }
    ]
  },
  {
    id: 1779035132088,
    name: 'Dragão de Cristal Articulado',
    emoji: '🐉',
    desc: 'Modelo articulado print-in-place de alta precisão com cristais facetados ao longo da coluna. Perfil calibrado sem suportes com articulação fluida.',
    category: 'Miniatura',
    price: 15,
    badge: 'Verificado',
    discount: 0,
    rating: 4.9,
    reviewsCount: 28,
    downloadsCount: 1420,
    printsCount: 860,
    layerHeight: '0.12 mm',
    infill: '15% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Silk',
    weightGrams: 42,
    printTime: '2h 15m',
    model3d: 'assets/products/models/p5.glb',
    image: 'https://makerworld.bblmw.com/makerworld/model/US62ded14bdbae8c/design/2025-03-03_38aeb2192ab8d8.png?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/model/US62ded14bdbae8c/design/2025-03-03_38aeb2192ab8d8.png?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
      'https://makerworld.bblmw.com/makerworld/model/US62ded14bdbae8c/design/2025-03-03_9345fab102962.png?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp'
    ],
    colorSections: [
      {
        name: 'Cor do Corpo',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto Matte', hex: '#000000' }
        ]
      },
      {
        name: 'Cor dos Cristais',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto Matte', hex: '#000000' }
        ]
      }
    ],
    colors: [
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Azul Cobalto', hex: '#0d54bf' },
      { name: 'Preto Matte', hex: '#000000' }
    ]
  },
  {
    id: 1779036803058,
    name: 'Polvo Articulado Print-in-Place',
    emoji: '🐙',
    desc: 'Modelo com 8 tentáculos multi-articulados impressos em uma única peça sem montagem. Excelente acabamento superficial e alta resistência mecânica.',
    category: 'Articulado',
    price: 20,
    badge: 'Destaque',
    discount: 0,
    rating: 5.0,
    reviewsCount: 35,
    downloadsCount: 2150,
    printsCount: 1290,
    layerHeight: '0.16 mm',
    infill: '18% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Premium',
    weightGrams: 55,
    printTime: '2h 40m',
    model3d: 'assets/products/models/p1.glb',
    image: 'assets/products/images/P1/p1.png',
    gallery: [
      'assets/products/images/P1/p1.png',
      'assets/products/images/P1/p2.png',
      'assets/products/images/P1/p3.png',
      'https://makerworld.bblmw.com/makerworld/model/US7275b0b14b2b1b/design/2023-08-16_68wwjqr9j9b0.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp'
    ],
    colorSections: [
      {
        name: 'Seção Superior',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto Matte', hex: '#000000' }
        ]
      },
      {
        name: 'Seção Inferior',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto Matte', hex: '#000000' }
        ]
      }
    ],
    colors: [
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Azul Cobalto', hex: '#0d54bf' },
      { name: 'Preto Matte', hex: '#000000' }
    ]
  },
  {
    id: 1779036994512,
    name: 'Olho Giroscópio Mecânico',
    emoji: '👀',
    desc: 'Mecanismo concêntrico de anéis giratórios com tolerância de 0.15 mm. Movimento livre em 3 eixos, ideal para demonstração de precisão dimensional.',
    category: 'Fidget Toy',
    price: 15,
    badge: 'Precisão',
    discount: 0,
    rating: 4.8,
    reviewsCount: 19,
    downloadsCount: 980,
    printsCount: 610,
    layerHeight: '0.12 mm',
    infill: '20% Grid',
    nozzle: '0.4 mm',
    material: 'PLA Dual',
    weightGrams: 34,
    printTime: '1h 45m',
    model3d: 'assets/products/models/p5.glb',
    image: 'https://makerworld.bblmw.com/makerworld/model/USe124efe0f13b10/design/2024-08-06_fd01d5858a26a.jpg?x-oss-process=image/resize,w_1000/format,webp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/model/USe124efe0f13b10/design/2024-08-06_fd01d5858a26a.jpg?x-oss-process=image/resize,w_1000/format,webp',
      'https://makerworld.bblmw.com/makerworld/model/USe124efe0f13b10/design/2024-08-06_3f95e2f0fe3ea.jpg?x-oss-process=image/resize,w_1000/format,webp'
    ],
    colorSections: [
      {
        name: 'Cores disponíveis',
        colors: [
          { name: 'Branco & Azul', hex: '#0d54bf' },
          { name: 'Preto & Laranja', hex: '#f07800' }
        ]
      }
    ],
    colors: [
      { name: 'Branco & Azul', hex: '#0d54bf' },
      { name: 'Preto & Laranja', hex: '#f07800' }
    ]
  },
  {
    id: 1779038443112,
    name: 'Case Texturizado Porta Batom',
    emoji: '🌸',
    desc: 'Suporte cilíndrico com relevo geométrico floral de alta definição e argola reforçada para chaveiro. Encaixe sob pressão calibrado.',
    category: 'Acessórios',
    price: 35,
    badge: 'Novo',
    discount: 0,
    rating: 4.9,
    reviewsCount: 14,
    downloadsCount: 540,
    printsCount: 320,
    layerHeight: '0.12 mm',
    infill: '25% Gyroid',
    nozzle: '0.4 mm',
    material: 'PETG / PLA',
    weightGrams: 48,
    printTime: '2h 10m',
    model3d: '',
    image: 'https://makerworld.bblmw.com/makerworld/model/US23a8a1f23a9c84/design/8546f96ed132b6bf.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/model/US23a8a1f23a9c84/design/8546f96ed132b6bf.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
      'https://makerworld.bblmw.com/makerworld/model/US23a8a1f23a9c84/design/e9011f9744d8c675.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp'
    ],
    colorSections: [
      {
        name: 'Cores disponíveis',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto Matte', hex: '#000000' }
        ]
      }
    ],
    colors: [
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Azul Cobalto', hex: '#0d54bf' },
      { name: 'Preto Matte', hex: '#000000' }
    ]
  },
  {
    id: 1779041587144,
    name: 'Tubarão Articulado Flex',
    emoji: '🦈',
    desc: 'Estrutura segmentada hidrodinâmica impressa em peça única. Articulações internas reforçadas para alta durabilidade.',
    category: 'Articulado',
    price: 23,
    badge: 'Tendência',
    discount: 0,
    rating: 4.9,
    reviewsCount: 22,
    downloadsCount: 1120,
    printsCount: 740,
    layerHeight: '0.16 mm',
    infill: '15% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Premium',
    weightGrams: 52,
    printTime: '2h 30m',
    model3d: 'assets/products/models/p3.glb',
    image: 'https://makerworld.bblmw.com/makerworld/model/USfcc6aeeb01981c/design/2024-05-14_51a2cb930b324.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/model/USfcc6aeeb01981c/design/2024-05-14_51a2cb930b324.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
      'https://makerworld.bblmw.com/makerworld/model/USfcc6aeeb01981c/design/2024-05-14_bd87f059d01fd.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
      'https://makerworld.bblmw.com/makerworld/model/USfcc6aeeb01981c/design/2024-05-14_b705f236b4828.jpg?x-oss-process=image/resize,w_1000/format,webp'
    ],
    colorSections: [
      {
        name: 'Cores disponíveis',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto Matte', hex: '#000000' }
        ]
      }
    ],
    colors: [
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Azul Cobalto', hex: '#0d54bf' },
      { name: 'Preto Matte', hex: '#000000' }
    ]
  },
  {
    id: 1779042797608,
    name: 'Furão Articulado Multicolor',
    emoji: '🦦',
    desc: 'Modelo longo articulado com pintura digital multicor via sistema AMS. Segmentos ergonômicos e acabamento acetinado.',
    category: 'Miniatura',
    price: 29,
    badge: 'AMS Multicor',
    discount: 0,
    rating: 5.0,
    reviewsCount: 31,
    downloadsCount: 1680,
    printsCount: 920,
    layerHeight: '0.12 mm',
    infill: '15% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Matte',
    weightGrams: 64,
    printTime: '3h 20m',
    model3d: 'assets/products/models/p4.glb',
    image: 'https://makerworld.bblmw.com/makerworld/model/US506c273669d189/design/2025-12-10_be4379089642f8.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/model/US506c273669d189/design/2025-12-10_be4379089642f8.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
      'https://makerworld.bblmw.com/makerworld/model/US506c273669d189/design/2025-12-10_7e37fee09d00d8.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
      'https://makerworld.bblmw.com/makerworld/model/US506c273669d189/design/2025-12-10_9479d317242068.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp'
    ],
    colorSections: [
      {
        name: 'Cor do Corpo',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto Matte', hex: '#000000' }
        ]
      },
      {
        name: 'Cor da Pelagem',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto Matte', hex: '#000000' }
        ]
      }
    ],
    colors: [
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Azul Cobalto', hex: '#0d54bf' },
      { name: 'Preto Matte', hex: '#000000' }
    ]
  },
  {
    id: 1779043350679,
    name: 'Cone Espiral Pass-Through',
    emoji: '🌀',
    desc: 'Geometria helicoidal dupla com ajuste de folga de 0.1 mm permitindo que uma peça atravesse a outra continuamente sem atrito.',
    category: 'Fidget Toy',
    price: 10,
    badge: 'Mais Baixado',
    discount: 0,
    rating: 4.9,
    reviewsCount: 47,
    downloadsCount: 3410,
    printsCount: 2180,
    layerHeight: '0.16 mm',
    infill: '15% Cubic',
    nozzle: '0.4 mm',
    material: 'PLA Silk',
    weightGrams: 38,
    printTime: '1h 50m',
    model3d: 'assets/products/models/p4.glb',
    image: 'https://makerworld.bblmw.com/makerworld/model/USa85d1c6d202941/design/2024-12-27_f7da9fca8a055.gif?x-oss-process=image/resize,w_1000/format,webp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/model/USa85d1c6d202941/design/2024-12-27_f7da9fca8a055.gif?x-oss-process=image/resize,w_1000/format,webp',
      'https://makerworld.bblmw.com/makerworld/model/USa85d1c6d202941/design/2024-12-27_3b37b731f5c7b.jpg?x-oss-process=image/resize,w_1000/format,webp'
    ],
    colorSections: [
      {
        name: 'Cor Externa',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto Matte', hex: '#000000' }
        ]
      },
      {
        name: 'Cor Interna',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto Matte', hex: '#000000' }
        ]
      }
    ],
    colors: [
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Azul Cobalto', hex: '#0d54bf' },
      { name: 'Preto Matte', hex: '#000000' }
    ]
  },
  {
    id: 1779047822545,
    name: 'Troféu Copa do Mundo Escala 1:1',
    emoji: '🏆',
    desc: 'Réplica em escala real impressa com filamento PLA Silk Dourado de alto brilho e preenchimento interno estrutural reforçado.',
    category: 'Decorativo',
    price: 60,
    badge: 'Edição Pro',
    discount: 10,
    rating: 5.0,
    reviewsCount: 18,
    downloadsCount: 890,
    printsCount: 410,
    layerHeight: '0.12 mm',
    infill: '25% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Silk Gold',
    weightGrams: 185,
    printTime: '6h 40m',
    model3d: '',
    image: 'https://makerworld.bblmw.com/makerworld/comment/20260503/91133529/4bf68873d57c671e.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/comment/20260503/91133529/4bf68873d57c671e.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
      'https://makerworld.bblmw.com/makerworld/comment/20260503/91133529/80cf929d1e30e1e5.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp'
    ],
    colorSections: [
      {
        name: 'Acabamento',
        colors: [{ name: 'Dourado Silk', hex: '#f0a500' }]
      }
    ],
    colors: [{ name: 'Dourado Silk', hex: '#f0a500' }]
  },
  {
    id: 1783942729445,
    name: 'Estrela do Mar Malha Flexível',
    emoji: '⭐',
    desc: 'Superfície orgânica com micro-escamas articuladas em malha contínua. Movimento fluido multidirecional.',
    category: 'Articulado',
    price: 70,
    badge: 'Popular',
    discount: 20,
    rating: 4.9,
    reviewsCount: 25,
    downloadsCount: 1230,
    printsCount: 680,
    layerHeight: '0.12 mm',
    infill: '15% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Silk',
    weightGrams: 110,
    printTime: '4h 15m',
    model3d: '',
    image: 'https://makerworld.bblmw.com/makerworld/model/US58e8e7fedc0451/design/2025-07-17_736615c4896bc.gif?x-oss-process=image/resize,w_1000/format,webp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/model/US58e8e7fedc0451/design/2025-07-17_736615c4896bc.gif?x-oss-process=image/resize,w_1000/format,webp',
      'https://makerworld.bblmw.com/makerworld/model/1615537/comment/be6fe350-ee30-11f0-a971-ff817b54094d.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp'
    ],
    colorSections: [
      {
        name: 'Cores disponíveis',
        colors: [
          { name: 'Preto Matte', hex: '#2c2c2c' },
          { name: 'Verde Bambu', hex: '#00ae42' },
          { name: 'Dourado Silk', hex: '#f0a500' }
        ]
      }
    ],
    colors: [
      { name: 'Preto Matte', hex: '#2c2c2c' },
      { name: 'Verde Bambu', hex: '#00ae42' },
      { name: 'Dourado Silk', hex: '#f0a500' }
    ]
  },
  {
    id: 1783942729901,
    name: 'Suporte Ergonômico de Leitura',
    emoji: '📖',
    desc: 'Acessório utilitário leve para manter páginas abertas com apenas o polegar. Geometria chanfrada confortável e resistente.',
    category: 'Utilitário',
    price: 14,
    badge: 'Utilitário',
    discount: 0,
    rating: 5.0,
    reviewsCount: 33,
    downloadsCount: 1840,
    printsCount: 1120,
    layerHeight: '0.16 mm',
    infill: '25% Grid',
    nozzle: '0.4 mm',
    material: 'PETG / PLA',
    weightGrams: 18,
    printTime: '0h 45m',
    model3d: 'assets/products/models/book2.glb',
    image: 'assets/products/images/P7/p1.png',
    gallery: [
      'assets/products/images/P7/p1.png',
      'assets/products/images/P7/p2.png',
      'assets/products/images/P7/p3.png'
    ],
    colorSections: [
      {
        name: 'Cores disponíveis',
        colors: [
          { name: 'Laranja Maker3D', hex: '#f07800' },
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Preto Matte', hex: '#1c1c1c' }
        ]
      }
    ],
    colors: [
      { name: 'Laranja Maker3D', hex: '#f07800' },
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Preto Matte', hex: '#1c1c1c' }
    ]
  },
  {
    id: 1783942729902,
    name: 'Bandeja Organizadora Bat-Wing',
    emoji: '🦇',
    desc: 'Recipiente de bancada com design geométrico de asas para organização de peças, chaves ou setups.',
    category: 'Decorativo',
    price: 26,
    badge: 'Setup Desk',
    discount: 0,
    rating: 4.8,
    reviewsCount: 15,
    downloadsCount: 730,
    printsCount: 420,
    layerHeight: '0.16 mm',
    infill: '20% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Matte',
    weightGrams: 76,
    printTime: '3h 10m',
    model3d: 'assets/products/models/p8.glb',
    image: 'assets/products/images/P8/p1.png',
    gallery: [
      'assets/products/images/P8/p1.png',
      'assets/products/images/P8/p2.png',
      'assets/products/images/P8/p3.png'
    ],
    colorSections: [
      {
        name: 'Cores disponíveis',
        colors: [
          { name: 'Preto Matte', hex: '#1c1c1c' },
          { name: 'Roxo Galáxia', hex: '#7d3c98' }
        ]
      }
    ],
    colors: [
      { name: 'Preto Matte', hex: '#1c1c1c' },
      { name: 'Roxo Galáxia', hex: '#7d3c98' }
    ]
  }
];

class Store {
  constructor() {
    this.state = {
      settings: this.loadLocal('maker3d_settings', DEFAULT_SITE_SETTINGS),
      products: this.loadLocal('maker3d_products', FALLBACK_PRODUCTS),
      globalColors: this.loadLocal('maker3d_global_colors', DEFAULT_GLOBAL_COLORS),
      coupons: this.loadLocal('maker3d_coupons', DEFAULT_COUPONS),
      faqs: this.loadLocal('maker3d_faqs', DEFAULT_FAQS),
      cart: this.loadLocal('maker3d_cart', []),
      wishlist: this.loadLocal('maker3d_wishlist', []),
      collections: this.loadLocal('maker3d_collections', [
        { id: 'col-default', name: 'Meus Modelos Salvos', items: [] }
      ]),
      orders: this.loadLocal('maker3d_orders', []),
      reviews: this.loadLocal('maker3d_reviews', {}),
      partners: this.loadLocal('maker3d_partners', DEFAULT_PARTNERS),
      users: this.loadLocal('maker3d_users', []),
      currentUser: this.loadLocal('maker3d_current_user', null),
      activeCoupon: null
    };
    this.listeners = new Set();
  }

  loadLocal(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error loading storage key:', key, e);
    }
    return fallback;
  }

  saveLocal(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Error saving storage key:', key, e);
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(changedKey) {
    this.listeners.forEach(fn => {
      try { fn(this.state, changedKey); } catch (e) { console.error(e); }
    });
  }

  update(key, value, persistKey = null) {
    this.state[key] = value;
    if (persistKey) {
      this.saveLocal(persistKey, value);
    }
    this.notify(key);
  }
}

export const store = new Store();
