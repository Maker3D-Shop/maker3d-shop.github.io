// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Accessible Luxury & Japandi Home Decor, Fidget Toys, Natal & Gears
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_SITE_SETTINGS = {
  brandName: 'Maker 3D',
  brandTagline: 'Minimalismo Orgânico & Luxo Acessível',
  primaryColor: '#8c6d53',
  accentOrange: '#b08d6e',
  promoBarActive: false,
  promoBarText: '',
  promoPill: 'MAKER 3D ATELIER',
  freeShippingThreshold: 120,
  heroBadge: 'COLEÇÃO JAPANDI • LUXO ACESSÍVEL & DESIGN ESCULTURAL',
  heroTitleHtml: 'Minimalismo orgânico em <em>impressão 3D</em>.',
  heroSubtitle: 'Peças decorativas autorais para casa, vasos esculturais Japandi, edição especial de Natal, Fidget Toys sensoriais e a linha exclusiva de pulseiras em parceria com a Gears.',
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
  gearsBranchActive: true,
  gearsBrandName: 'Gears × Maker 3D',
  gearsTagline: 'Linha Autoral de Pulseiras & Acessórios Esculturais',
  filamentPricesPerKg: {
    PLA: 150,
    PETG: 120,
    TPU: 200
  }
};

export const DEFAULT_COUPONS = [
  { code: 'JAPANDI10', discountPct: 10, minOrder: 0, active: true, desc: '10% OFF na Coleção Japandi & Casa' },
  { code: 'NATAL15', discountPct: 15, minOrder: 60, active: true, desc: '15% OFF Especial de Natal' },
  { code: 'GEARS10', discountPct: 10, minOrder: 40, active: true, desc: '10% OFF Linha Gears Pulseiras' },
  { code: 'MAKER10', discountPct: 10, minOrder: 0, active: true, desc: '10% OFF de boas-vindas' }
];

export const DEFAULT_FAQS = [
  {
    id: 'faq-1',
    q: 'O que define o conceito de Luxo Acessível e Coleção Japandi da Maker 3D?',
    a: 'Unimos o minimalismo japonês ao aconchego escandinavo (estilo Japandi) com manufatura aditiva de altíssima precisão. Nossas peças decorativas têm acabamento texturizado orgânico em tons de areia, linho, travertino e bronze, com valores acessíveis direto do nosso atelier.'
  },
  {
    id: 'faq-2',
    q: 'Como funciona a branch Gears × Maker 3D de pulseiras?',
    a: 'A Gears é nosso braço especializado em design vestível e acessórios contemporâneos. Na aba "Gears Pulseiras" você encontra pulseiras com elos orgânicos, tramas geométricas e acabamento acetinado desenvolvidas em conjunto com a Maker 3D.'
  },
  {
    id: 'faq-3',
    q: 'Vocês também fazem peças sob medida ou personalizações?',
    a: 'Sim! Na aba "Sob Medida" você pode personalizar dimensões, texturas, gravar iniciais ou enviar seu próprio modelo 3D (.STL) com cálculo transparente por material (PLA Matte/Silk R$ 150/kg, PETG R$ 120/kg e Flex/Trust R$ 200/kg).'
  },
  {
    id: 'faq-4',
    q: 'Quais as opções das Coleções de Natal e Fidget Toys?',
    a: 'Nossa Coleção de Natal traz adornos minimalistas em tons champanhe, off-white e dourado acetinado para mesas postas e árvores elegantes. Já nossa linha de Fidget Toys oferece peças táteis silenciosas e articuladas para foco e bem-estar.'
  },
  {
    id: 'faq-5',
    q: 'Como funciona minha Conta, Coleções Salvas e Sincronização?',
    a: 'Ao entrar com Google ou criar sua conta, todas as suas peças favoritas, coleções salvas, sacola de compras e histórico de encomendas ficam salvos automaticamente no banco de dados.'
  }
];

export const DEFAULT_GLOBAL_COLORS = [
  { name: 'Areia Japandi', hex: '#e6dec8', priceAdd: 0 },
  { name: 'Travertino Off-White', hex: '#f4f0e7', priceAdd: 0 },
  { name: 'Taupe Orgânico', hex: '#b08d6e', priceAdd: 0 },
  { name: 'Bronze Espresso', hex: '#5a4332', priceAdd: 0 },
  { name: 'Champagne Silk', hex: '#d8c3a5', priceAdd: 0 },
  { name: 'Terracota Suave', hex: '#c87d55', priceAdd: 0 },
  { name: 'Verde Sálvia', hex: '#7c8c76', priceAdd: 0 },
  { name: 'Dourado Natal', hex: '#c99b49', priceAdd: 3 },
  { name: 'Preto Ônix Matte', hex: '#282420', priceAdd: 0 }
];

export const FALLBACK_PRODUCTS = [
  // ─── COLEÇÃO JAPANDI (DECORAÇÃO DE CASA, VASOS & PORTA-TRECOS) ───
  {
    id: 'japandi-duo-vasos-organicos',
    name: 'Duo Vasos Esculturais Kanso — Coleção Japandi',
    emoji: '🏺',
    category: 'Coleção Japandi',
    desc: 'Par de vasos arquitetônicos com aletas verticais superiores e base orgânica texturizada em pedra travertino. Design minimalista perfeito para ambientes contemporâneos, aparadores e mesas de centro.',
    price: 68,
    badge: 'Coleção Japandi',
    discount: 0,
    rating: 5.0,
    reviewsCount: 46,
    downloadsCount: 1890,
    printsCount: 940,
    layerHeight: '0.12 mm Fuzzy Skin',
    infill: '20% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Matte Stone',
    weightGrams: 165,
    printTime: '4h 30m',
    model3d: 'assets/products/models/p1.glb',
    image: 'assets/brand/japandi-vases.jpg',
    gallery: [
      'assets/brand/japandi-vases.jpg',
      'assets/brand/japandi-campaign.jpg'
    ],
    colorSections: [
      {
        name: 'Tonalidade Mineral',
        colors: [
          { name: 'Travertino Off-White', hex: '#f4f0e7' },
          { name: 'Areia Japandi', hex: '#e6dec8' },
          { name: 'Taupe Orgânico', hex: '#b08d6e' },
          { name: 'Bronze Espresso', hex: '#5a4332' }
        ]
      }
    ],
    colors: [
      { name: 'Travertino Off-White', hex: '#f4f0e7' },
      { name: 'Areia Japandi', hex: '#e6dec8' },
      { name: 'Taupe Orgânico', hex: '#b08d6e' },
      { name: 'Bronze Espresso', hex: '#5a4332' }
    ]
  },
  {
    id: 'japandi-vaso-solitario-wabi',
    name: 'Vaso Canelado Wabi-Sabi Individual',
    emoji: '🌾',
    category: 'Coleção Japandi',
    desc: 'Vaso solitário com transição diagonal entre textura de cerâmica rústica e estrias arquitetônicas precisas. Ideal para arranjos secos, ramos de trigo e decoração minimalista.',
    price: 39,
    badge: 'Best-Seller Casa',
    discount: 0,
    rating: 5.0,
    reviewsCount: 38,
    downloadsCount: 1520,
    printsCount: 810,
    layerHeight: '0.12 mm',
    infill: '18% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Matte Areia',
    weightGrams: 92,
    printTime: '2h 50m',
    model3d: 'assets/products/models/p1.glb',
    image: 'assets/brand/japandi-campaign.jpg',
    gallery: [
      'assets/brand/japandi-campaign.jpg',
      'assets/brand/japandi-vases.jpg'
    ],
    colorSections: [
      {
        name: 'Acabamento Natural',
        colors: [
          { name: 'Areia Japandi', hex: '#e6dec8' },
          { name: 'Travertino Off-White', hex: '#f4f0e7' },
          { name: 'Terracota Suave', hex: '#c87d55' }
        ]
      }
    ],
    colors: [
      { name: 'Areia Japandi', hex: '#e6dec8' },
      { name: 'Travertino Off-White', hex: '#f4f0e7' },
      { name: 'Terracota Suave', hex: '#c87d55' }
    ]
  },
  {
    id: 'japandi-porta-treco-zen',
    name: 'Porta-Treco & Bandeja Organizadora Zen Japandi',
    emoji: '🕯️',
    category: 'Coleção Japandi',
    desc: 'Porta-treco e bandeja escultural com curvas orgânicas suaves para organizar joias, chaves, relógios, perfumes ou velas aromáticas com estética de luxo silencioso.',
    price: 32,
    badge: 'Decoração & Ordem',
    discount: 0,
    rating: 4.9,
    reviewsCount: 29,
    downloadsCount: 1140,
    printsCount: 670,
    layerHeight: '0.12 mm',
    infill: '20% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Matte Linho',
    weightGrams: 78,
    printTime: '2h 20m',
    model3d: 'assets/products/models/p8.glb',
    image: 'assets/products/images/P8/p1.png',
    gallery: [
      'assets/products/images/P8/p1.png',
      'assets/products/images/P8/p2.png',
      'assets/products/images/P8/p3.png'
    ],
    colorSections: [
      {
        name: 'Tonalidade Japandi',
        colors: [
          { name: 'Travertino Off-White', hex: '#f4f0e7' },
          { name: 'Areia Japandi', hex: '#e6dec8' },
          { name: 'Preto Ônix Matte', hex: '#282420' }
        ]
      }
    ],
    colors: [
      { name: 'Travertino Off-White', hex: '#f4f0e7' },
      { name: 'Areia Japandi', hex: '#e6dec8' },
      { name: 'Preto Ônix Matte', hex: '#282420' }
    ]
  },
  {
    id: 1783942729901,
    name: 'Suporte Escultural de Leitura Koto',
    emoji: '📖',
    category: 'Coleção Japandi',
    desc: 'Peça de design funcional para manter livros abertos com leveza e ergonomia. Acabamento acetinado que complementa mesas de cabeceira e bibliotecas residenciais.',
    price: 18,
    badge: 'Design Utilitário',
    discount: 0,
    rating: 5.0,
    reviewsCount: 33,
    downloadsCount: 1840,
    printsCount: 1120,
    layerHeight: '0.12 mm',
    infill: '25% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Matte',
    weightGrams: 22,
    printTime: '0h 50m',
    model3d: 'assets/products/models/book2.glb',
    image: 'assets/products/images/P7/p1.png',
    gallery: [
      'assets/products/images/P7/p1.png',
      'assets/products/images/P7/p2.png',
      'assets/products/images/P7/p3.png'
    ],
    colorSections: [
      {
        name: 'Acabamento',
        colors: [
          { name: 'Areia Japandi', hex: '#e6dec8' },
          { name: 'Taupe Orgânico', hex: '#b08d6e' },
          { name: 'Bronze Espresso', hex: '#5a4332' }
        ]
      }
    ],
    colors: [
      { name: 'Areia Japandi', hex: '#e6dec8' },
      { name: 'Taupe Orgânico', hex: '#b08d6e' },
      { name: 'Bronze Espresso', hex: '#5a4332' }
    ]
  },

  // ─── COLEÇÃO DE NATAL (DECORAÇÃO NATALINA MINIMALISTA & LUXO ACESSÍVEL) ───
  {
    id: 'natal-arvore-escultural-nordica',
    name: 'Pinheiro Escultural Plissado — Coleção de Natal',
    emoji: '🎄',
    category: 'Coleção de Natal',
    desc: 'Árvore de Natal minimalista com lâminas helicoidais orgânicas em estética nórdica. Perfeita para mesas postas de ceia, aparadores e composições natalinas sofisticadas.',
    price: 44,
    badge: 'Edição de Natal',
    discount: 10,
    rating: 5.0,
    reviewsCount: 27,
    downloadsCount: 980,
    printsCount: 540,
    layerHeight: '0.12 mm',
    infill: '15% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Silk Champagne / Matte',
    weightGrams: 88,
    printTime: '3h 10m',
    model3d: 'assets/products/models/p4.glb',
    image: 'assets/brand/japandi-vases.jpg',
    gallery: [
      'assets/brand/japandi-vases.jpg',
      'assets/brand/japandi-campaign.jpg'
    ],
    colorSections: [
      {
        name: 'Paleta Festiva Minimalista',
        colors: [
          { name: 'Champagne Silk', hex: '#d8c3a5' },
          { name: 'Travertino Off-White', hex: '#f4f0e7' },
          { name: 'Dourado Natal', hex: '#c99b49' },
          { name: 'Verde Sálvia', hex: '#7c8c76' }
        ]
      }
    ],
    colors: [
      { name: 'Champagne Silk', hex: '#d8c3a5' },
      { name: 'Travertino Off-White', hex: '#f4f0e7' },
      { name: 'Dourado Natal', hex: '#c99b49' },
      { name: 'Verde Sálvia', hex: '#7c8c76' }
    ]
  },
  {
    id: 'natal-kit-ornamentos-origami',
    name: 'Trio Esferas & Estrelas Facetadas — Natal Luxo',
    emoji: '✨',
    category: 'Coleção de Natal',
    desc: 'Conjunto com 3 adornos natalinos de geometria orgânica canelada com laço em camurça. Leves, inquebráveis e desenhados para árvores de Natal de alto padrão.',
    price: 36,
    badge: 'Natal 2026',
    discount: 0,
    rating: 4.9,
    reviewsCount: 21,
    downloadsCount: 790,
    printsCount: 460,
    layerHeight: '0.12 mm',
    infill: '15% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Silk Gold & Off-White',
    weightGrams: 64,
    printTime: '2h 30m',
    model3d: 'assets/products/models/p5.glb',
    image: 'https://makerworld.bblmw.com/makerworld/comment/20260503/91133529/4bf68873d57c671e.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/comment/20260503/91133529/4bf68873d57c671e.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
      'https://makerworld.bblmw.com/makerworld/comment/20260503/91133529/80cf929d1e30e1e5.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp'
    ],
    colorSections: [
      {
        name: 'Tonalidade do Trio',
        colors: [
          { name: 'Dourado Natal', hex: '#c99b49' },
          { name: 'Champagne Silk', hex: '#d8c3a5' },
          { name: 'Travertino Off-White', hex: '#f4f0e7' }
        ]
      }
    ],
    colors: [
      { name: 'Dourado Natal', hex: '#c99b49' },
      { name: 'Champagne Silk', hex: '#d8c3a5' },
      { name: 'Travertino Off-White', hex: '#f4f0e7' }
    ]
  },

  // ─── BRANCH GEARS × MAKER 3D (LINHA DE PULSEIRAS ESCULTURAIS) ───
  {
    id: 'gears-pulseira-aura-link',
    name: 'Pulseira Escultural Aura Link — Gears × Maker 3D',
    emoji: '⌚',
    category: 'Gears Pulseiras',
    desc: 'Desenvolvida em collab pela branch Gears × Maker 3D: pulseira com elos orgânicos articulados impressos em peça única e polímero flexível Trust/TPU ou PLA Silk acetinado.',
    price: 38,
    badge: 'Collab Gears',
    discount: 0,
    rating: 5.0,
    reviewsCount: 34,
    downloadsCount: 1320,
    printsCount: 780,
    layerHeight: '0.10 mm Alta Precisão',
    infill: '30% Gyroid Flex',
    nozzle: '0.4 mm',
    material: 'Trust Flex / PLA Silk',
    weightGrams: 26,
    printTime: '1h 20m',
    model3d: 'assets/products/models/p3.glb',
    image: 'https://makerworld.bblmw.com/makerworld/model/US23a8a1f23a9c84/design/8546f96ed132b6bf.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/model/US23a8a1f23a9c84/design/8546f96ed132b6bf.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
      'https://makerworld.bblmw.com/makerworld/model/US23a8a1f23a9c84/design/e9011f9744d8c675.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp'
    ],
    colorSections: [
      {
        name: 'Acabamento da Pulseira (Gears)',
        colors: [
          { name: 'Bronze Espresso', hex: '#5a4332' },
          { name: 'Champagne Silk', hex: '#d8c3a5' },
          { name: 'Preto Ônix Matte', hex: '#282420' },
          { name: 'Dourado Natal', hex: '#c99b49' }
        ]
      }
    ],
    colors: [
      { name: 'Bronze Espresso', hex: '#5a4332' },
      { name: 'Champagne Silk', hex: '#d8c3a5' },
      { name: 'Preto Ônix Matte', hex: '#282420' },
      { name: 'Dourado Natal', hex: '#c99b49' }
    ]
  },
  {
    id: 'gears-pulseira-kinetica-wave',
    name: 'Bracelete Orgânico Kinetic Wave — Linha Gears',
    emoji: '〰️',
    category: 'Gears Pulseiras',
    desc: 'Bracelete anatômico com nervuras fluidas inspirado na estética Japandi e engenharia cinética da marca parceira Gears. Toque aveludado e encaixe sob medida.',
    price: 42,
    badge: 'Branch Oficial Gears',
    discount: 0,
    rating: 4.9,
    reviewsCount: 19,
    downloadsCount: 860,
    printsCount: 490,
    layerHeight: '0.10 mm',
    infill: '25% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Silk / TPU Flex',
    weightGrams: 29,
    printTime: '1h 35m',
    model3d: 'assets/products/models/p5.glb',
    image: 'https://makerworld.bblmw.com/makerworld/model/US58e8e7fedc0451/design/2025-07-17_736615c4896bc.gif?x-oss-process=image/resize,w_1000/format,webp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/model/US58e8e7fedc0451/design/2025-07-17_736615c4896bc.gif?x-oss-process=image/resize,w_1000/format,webp'
    ],
    colorSections: [
      {
        name: 'Tonalidade Gears',
        colors: [
          { name: 'Champagne Silk', hex: '#d8c3a5' },
          { name: 'Taupe Orgânico', hex: '#b08d6e' },
          { name: 'Bronze Espresso', hex: '#5a4332' }
        ]
      }
    ],
    colors: [
      { name: 'Champagne Silk', hex: '#d8c3a5' },
      { name: 'Taupe Orgânico', hex: '#b08d6e' },
      { name: 'Bronze Espresso', hex: '#5a4332' }
    ]
  },

  // ─── FIDGET TOYS & ESCULTURAS CINÉTICAS DE MESA ───
  {
    id: 1779043350679,
    name: 'Escultura Cinética Pass-Through (Fidget de Mesa)',
    emoji: '🌀',
    category: 'Fidget Toys',
    desc: 'Fidget toy escultural de mesa com geometria helicoidal dupla de precisão (0.10 mm). Além de objeto de alívio sensorial e foco, funciona como peça decorativa em home offices.',
    price: 24,
    badge: 'Sensorial & Decor',
    discount: 0,
    rating: 4.9,
    reviewsCount: 47,
    downloadsCount: 3410,
    printsCount: 2180,
    layerHeight: '0.12 mm',
    infill: '18% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Silk / Matte',
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
          { name: 'Areia Japandi', hex: '#e6dec8' },
          { name: 'Taupe Orgânico', hex: '#b08d6e' },
          { name: 'Bronze Espresso', hex: '#5a4332' }
        ]
      },
      {
        name: 'Cor Interna',
        colors: [
          { name: 'Travertino Off-White', hex: '#f4f0e7' },
          { name: 'Champagne Silk', hex: '#d8c3a5' },
          { name: 'Preto Ônix Matte', hex: '#282420' }
        ]
      }
    ],
    colors: [
      { name: 'Areia Japandi', hex: '#e6dec8' },
      { name: 'Taupe Orgânico', hex: '#b08d6e' },
      { name: 'Bronze Espresso', hex: '#5a4332' }
    ]
  },
  {
    id: 1779036994512,
    name: 'Esfera Giroscópica Orbital Tátil',
    emoji: '🪐',
    category: 'Fidget Toys',
    desc: 'Anéis concêntricos de giro livre em 3 eixos com toque sedoso e movimento silencioso. Desenvolvida para relaxamento tátil durante reuniões e leitura.',
    price: 22,
    badge: 'Fidget Silencioso',
    discount: 0,
    rating: 4.8,
    reviewsCount: 19,
    downloadsCount: 980,
    printsCount: 610,
    layerHeight: '0.12 mm',
    infill: '20% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Matte',
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
        name: 'Tonalidade',
        colors: [
          { name: 'Areia Japandi', hex: '#e6dec8' },
          { name: 'Taupe Orgânico', hex: '#b08d6e' },
          { name: 'Preto Ônix Matte', hex: '#282420' }
        ]
      }
    ],
    colors: [
      { name: 'Areia Japandi', hex: '#e6dec8' },
      { name: 'Taupe Orgânico', hex: '#b08d6e' },
      { name: 'Preto Ônix Matte', hex: '#282420' }
    ]
  },
  {
    id: 1779036803058,
    name: 'Escultura Articulada Tátil — Série Orgânica',
    emoji: '🐙',
    category: 'Fidget Toys',
    desc: 'Peça multi-articulada impressa sem emendas com movimento fluido e acabamento acetinado em tons minerais.',
    price: 25,
    badge: 'Articulado',
    discount: 0,
    rating: 5.0,
    reviewsCount: 35,
    downloadsCount: 2150,
    printsCount: 1290,
    layerHeight: '0.12 mm',
    infill: '18% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Matte',
    weightGrams: 55,
    printTime: '2h 40m',
    model3d: 'assets/products/models/p1.glb',
    image: 'assets/products/images/P1/p1.png',
    gallery: [
      'assets/products/images/P1/p1.png',
      'assets/products/images/P1/p2.png',
      'assets/products/images/P1/p3.png'
    ],
    colorSections: [
      {
        name: 'Tonalidade',
        colors: [
          { name: 'Areia Japandi', hex: '#e6dec8' },
          { name: 'Taupe Orgânico', hex: '#b08d6e' },
          { name: 'Terracota Suave', hex: '#c87d55' }
        ]
      }
    ],
    colors: [
      { name: 'Areia Japandi', hex: '#e6dec8' },
      { name: 'Taupe Orgânico', hex: '#b08d6e' },
      { name: 'Terracota Suave', hex: '#c87d55' }
    ]
  },

  // ─── PROJETO PERSONALIZADO / ENCOMENDA EXCLUSIVA ───
  {
    id: 9,
    name: 'Peça Decorativa ou Projeto Sob Medida (Atelier 3D)',
    emoji: '📐',
    category: 'Sob Medida',
    desc: 'Personalize dimensões, texturas Japandi, cores do seu ambiente ou envie seu arquivo 3D. Produção exclusiva com tabela transparente (PLA R$ 150/kg • PETG R$ 120/kg • Trust/Flex R$ 200/kg).',
    price: null,
    badge: 'Atelier Sob Medida',
    discount: 0,
    rating: 5.0,
    reviewsCount: 42,
    downloadsCount: 310,
    printsCount: 198,
    layerHeight: '0.12 mm',
    infill: '20% Gyroid',
    nozzle: '0.4 mm',
    material: 'PLA Matte / Silk / PETG / Trust',
    model3d: 'assets/products/models/p1.glb',
    image: 'assets/brand/japandi-campaign.jpg',
    custom: true,
    gallery: [
      'assets/brand/japandi-campaign.jpg',
      'assets/brand/japandi-vases.jpg'
    ],
    colorSections: [
      {
        name: 'Tonalidade Principal',
        colors: [
          { name: 'Travertino Off-White', hex: '#f4f0e7' },
          { name: 'Areia Japandi', hex: '#e6dec8' },
          { name: 'Taupe Orgânico', hex: '#b08d6e' },
          { name: 'Bronze Espresso', hex: '#5a4332' }
        ]
      }
    ],
    colors: [
      { name: 'Travertino Off-White', hex: '#f4f0e7' },
      { name: 'Areia Japandi', hex: '#e6dec8' },
      { name: 'Taupe Orgânico', hex: '#b08d6e' },
      { name: 'Bronze Espresso', hex: '#5a4332' }
    ]
  }
];

class Store {
  constructor() {
    this.state = {
      settings: this.loadLocal('maker3d_settings_v3', DEFAULT_SITE_SETTINGS),
      products: this.loadLocal('maker3d_products_v3', FALLBACK_PRODUCTS),
      globalColors: this.loadLocal('maker3d_global_colors_v3', DEFAULT_GLOBAL_COLORS),
      coupons: this.loadLocal('maker3d_coupons_v3', DEFAULT_COUPONS),
      faqs: this.loadLocal('maker3d_faqs_v3', DEFAULT_FAQS),
      cart: this.loadLocal('maker3d_cart', []),
      wishlist: this.loadLocal('maker3d_wishlist', []),
      collections: this.loadLocal('maker3d_collections', [
        { id: 'col-japandi', name: 'Minha Seleção Japandi', items: [] }
      ]),
      orders: this.loadLocal('maker3d_orders', []),
      reviews: this.loadLocal('maker3d_reviews', {}),
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
