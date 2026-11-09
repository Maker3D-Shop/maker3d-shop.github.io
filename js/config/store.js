// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Reactive State Store & Default Data Configuration
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_SITE_SETTINGS = {
  brandName: 'Maker3D',
  brandTagline: 'Impressão 3D Especializada',
  primaryColor: '#ff9e1b',
  promoBarActive: true,
  promoBarText: '🔥 FRETE GRÁTIS em pedidos acima de R$ 120! Use o cupom MAKER10 para 10% OFF na 1ª compra',
  promoPill: 'NOVIDADE 3D',
  freeShippingThreshold: 120,
  heroBadge: '🔶 Especialistas em Impressão 3D',
  heroTitleHtml: 'Transformamos <em>Ideias</em> em Realidade 3D',
  heroSubtitle: 'Peças articuladas, colecionáveis, utilitários e protótipos sob medida com precisão de 0,1mm e acabamento artesanal.',
  whatsappNumber: '5531984566047',
  instagramHandle: '@maker3d.oficial',
  instagramUrl: 'https://www.instagram.com/maker3d.oficial',
  supportEmail: 'maker3d.suporte@gmail.com',
  adminEmails: ['maker3d.suporte@gmail.com', 'rossipereira2010@gmail.com'],
  adminPin: 'maker3d2026',
  githubOwner: 'Maker3D-Shop',
  githubRepo: 'maker3d-shop.github.io',
  githubBranch: 'main'
};

export const DEFAULT_COUPONS = [
  { code: 'MAKER10', discountPct: 10, minOrder: 0, active: true, desc: '10% OFF de boas-vindas' },
  { code: 'BEMVINDO15', discountPct: 15, minOrder: 60, active: true, desc: '15% OFF acima de R$ 60' },
  { code: 'VIP20', discountPct: 20, minOrder: 150, active: true, desc: '20% OFF em compras VIP' }
];

export const DEFAULT_FAQS = [
  {
    id: 'faq-1',
    q: 'Qual material vocês utilizam nas impressões 3D?',
    a: 'Trabalhamos principalmente com PLA Premium biodegradável de alta resistência e brilho (Silk/Matte), PETG para peças mecânicas ou expostas ao sol, e TPU para peças flexíveis.'
  },
  {
    id: 'faq-2',
    q: 'Posso enviar meu próprio arquivo 3D (.STL / .OBJ / .3MF)?',
    a: 'Sim! Use nosso Laboratório 3D na aba "Orçamento STL" para arrastar seu arquivo, visualizar em 3D na hora e receber uma estimativa automática de peso e preço.'
  },
  {
    id: 'faq-3',
    q: 'Qual o prazo de produção e envio?',
    a: 'Peças do catálogo são produzidas e embaladas em 24h a 48h úteis. Enviamos para todo o Brasil com código de rastreio e embalagem reforçada.'
  },
  {
    id: 'faq-4',
    q: 'Como escolho combinações de cores em peças articuladas?',
    a: 'Em cada produto você pode selecionar as cores por seção (ex: Cor do Corpo e Cor do Cristal). Se desejar uma cor especial, basta avisar ao finalizar o pedido.'
  },
  {
    id: 'faq-5',
    q: 'Como funciona o Login com Google e meus pedidos?',
    a: 'Ao entrar com sua conta Google, sua lista de favoritos, carrinho e histórico de pedidos ficam salvos na nuvem para você acompanhar o status em tempo real.'
  }
];

export const DEFAULT_GLOBAL_COLORS = [
  { name: 'Laranja Maker3D', hex: '#f07800', priceAdd: 0 },
  { name: 'Avelã', hex: '#bf540d', priceAdd: 0 },
  { name: 'Azul Cobalto', hex: '#0d54bf', priceAdd: 0 },
  { name: 'Preto', hex: '#1c1c1c', priceAdd: 0 },
  { name: 'Branco Polar', hex: '#ffffff', priceAdd: 0 },
  { name: 'Verde Esmeralda', hex: '#27ae60', priceAdd: 0 },
  { name: 'Dourado Silk', hex: '#f0a500', priceAdd: 3 },
  { name: 'Vermelho Rubi', hex: '#c0392b', priceAdd: 2 },
  { name: 'Roxo Galáxia', hex: '#7d3c98', priceAdd: 4 }
];

// Merge existing repository products (from data.json + assets/products.json)
export const FALLBACK_PRODUCTS = [
  {
    id: 9,
    name: '✨ Peça Customizada Sob Medida',
    emoji: '⚙️',
    category: 'Customizado',
    desc: 'Envie seu arquivo STL ou descreva sua ideia. Modelamos e imprimimos qualquer peça do zero com precisão milimétrica!',
    price: null,
    badge: 'Sob Medida',
    discount: 0,
    rating: 5.0,
    reviewsCount: 42,
    model3d: 'assets/products/models/p1.glb',
    image: '',
    custom: true,
    gallery: [],
    colorSections: [
      {
        name: 'Cor Principal',
        colors: [
          { name: 'Laranja Maker3D', hex: '#f07800' },
          { name: 'Preto', hex: '#1c1c1c' },
          { name: 'Branco Polar', hex: '#ffffff' }
        ]
      }
    ],
    colors: [
      { name: 'Laranja Maker3D', hex: '#f07800' },
      { name: 'Preto', hex: '#1c1c1c' },
      { name: 'Branco Polar', hex: '#ffffff' }
    ]
  },
  {
    id: 1779035132088,
    name: 'Mini Dragão de Cristal 🐉',
    emoji: '🐉',
    desc: 'Mini Dragão de Cristal articulado💎, impresso em 3D. Cheio de detalhes mágicos✨, cabe na palma da mão e é perfeito para decorar, colecionar ou presentear!🎁💖',
    category: 'Miniatura',
    price: 15,
    badge: 'Mágico ✨',
    discount: 0,
    rating: 4.9,
    reviewsCount: 28,
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
          { name: 'Preto', hex: '#000000' }
        ]
      },
      {
        name: 'Cor do Cristal',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto', hex: '#000000' }
        ]
      }
    ],
    colors: [
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Azul Cobalto', hex: '#0d54bf' },
      { name: 'Preto', hex: '#000000' }
    ]
  },
  {
    id: 1779036803058,
    name: 'Mini Polvo Articulado 🐙',
    emoji: '🐙',
    desc: 'Mini Polvo articulado impresso em 3D. Com tentáculos super flexíveis, é divertido de brincar, funciona como um ótimo brinquedo antiestresse e é perfeito para decorar ou presentear!',
    category: 'Articulado',
    price: 20,
    badge: 'Fidget Toy🌊',
    discount: 0,
    rating: 5.0,
    reviewsCount: 35,
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
        name: 'Superior',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto', hex: '#000000' }
        ]
      },
      {
        name: 'Inferior',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto', hex: '#000000' }
        ]
      }
    ],
    colors: [
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Azul Cobalto', hex: '#0d54bf' },
      { name: 'Preto', hex: '#000000' }
    ]
  },
  {
    id: 1779036994512,
    name: 'O Olho Giroscópio 👀',
    emoji: '👀',
    desc: 'Olho Giroscópio impresso em 3D. Com anéis giratórios super divertidos, é o fidget toy perfeito para aliviar o estresse, focar a mente ou usar como um chaveiro super criativo!',
    category: 'Fidget Toy',
    price: 15,
    badge: 'Antiestresse',
    discount: 0,
    rating: 4.8,
    reviewsCount: 19,
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
    name: 'Porta Batom Floral 🌸',
    emoji: '🌸',
    desc: 'Porta-batom chaveiro super fofo com textura de florzinhas em relevo! 🌸 Perfeito para proteger e levar seu hidratante labial ou batom favorito sempre com você.',
    category: 'Acessórios',
    price: 35,
    badge: 'Novo✨',
    discount: 0,
    rating: 4.9,
    reviewsCount: 14,
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
          { name: 'Preto', hex: '#000000' }
        ]
      }
    ],
    colors: [
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Azul Cobalto', hex: '#0d54bf' },
      { name: 'Preto', hex: '#000000' }
    ]
  },
  {
    id: 1779041587144,
    name: 'Tubarão Articulado 🦈',
    emoji: '🦈',
    desc: 'Tubarão articulado impresso em 3D, super divertido e relaxante para brincar! Com movimentos flexíveis e design incrível.',
    category: 'Articulado',
    price: 23,
    badge: 'Fidget Toy 🌀',
    discount: 0,
    rating: 4.9,
    reviewsCount: 22,
    model3d: 'assets/products/models/p3.glb',
    image: 'https://makerworld.bblmw.com/makerworld/model/USfcc6aeeb01981c/design/2024-05-14_51a2cb930b324.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/model/USfcc6aeeb01981c/design/2024-05-14_bd87f059d01fd.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
      'https://makerworld.bblmw.com/makerworld/model/USfcc6aeeb01981c/design/2024-05-14_b705f236b4828.jpg?x-oss-process=image/resize,w_1000/format,webp'
    ],
    colorSections: [
      {
        name: 'Cores disponíveis',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto', hex: '#000000' }
        ]
      }
    ],
    colors: [
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Azul Cobalto', hex: '#0d54bf' },
      { name: 'Preto', hex: '#000000' }
    ]
  },
  {
    id: 1779042797608,
    name: 'Mini Furão Flexível 🦦',
    emoji: '🦦',
    desc: 'Mini furão articulado impresso em 3D, super fofo e perfeito para brincar! Com seu design flexível, ele cabe na palma da mão.',
    category: 'Miniatura',
    price: 29,
    badge: 'Articulado 🤎',
    discount: 0,
    rating: 5.0,
    reviewsCount: 31,
    model3d: 'assets/products/models/p4.glb',
    image: 'https://makerworld.bblmw.com/makerworld/model/US506c273669d189/design/2025-12-10_be4379089642f8.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/model/US506c273669d189/design/2025-12-10_7e37fee09d00d8.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp',
      'https://makerworld.bblmw.com/makerworld/model/US506c273669d189/design/2025-12-10_9479d317242068.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp'
    ],
    colorSections: [
      {
        name: 'Cor do Corpo',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto', hex: '#000000' }
        ]
      },
      {
        name: 'Cor da Pelagem',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto', hex: '#000000' }
        ]
      }
    ],
    colors: [
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Azul Cobalto', hex: '#0d54bf' },
      { name: 'Preto', hex: '#000000' }
    ]
  },
  {
    id: 1779043350679,
    name: 'Cone Espiral Ilusão 🌀',
    emoji: '🌀',
    desc: 'Cone espiral mágico impresso em 3D, o fidget toy perfeito para relaxar e se encantar! Com um design de ilusão de ótica fascinante, as duas peças se encaixam e giram suavemente.',
    category: 'Fidget Toy',
    price: 10,
    badge: 'Best Seller 🔥',
    discount: 0,
    rating: 4.9,
    reviewsCount: 47,
    model3d: 'assets/products/models/p4.glb',
    image: 'https://makerworld.bblmw.com/makerworld/model/USa85d1c6d202941/design/2024-12-27_f7da9fca8a055.gif?x-oss-process=image/resize,w_1000/format,webp',
    gallery: [
      'https://makerworld.bblmw.com/makerworld/model/USa85d1c6d202941/design/2024-12-27_f7da9fca8a055.gif?x-oss-process=image/resize,w_1000/format,webp',
      'https://makerworld.bblmw.com/makerworld/model/USa85d1c6d202941/design/2024-12-27_3b37b731f5c7b.jpg?x-oss-process=image/resize,w_1000/format,webp'
    ],
    colorSections: [
      {
        name: 'Cor do Cone',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto', hex: '#000000' }
        ]
      },
      {
        name: 'Cor do Encaixe',
        colors: [
          { name: 'Avelã', hex: '#bf540d' },
          { name: 'Azul Cobalto', hex: '#0d54bf' },
          { name: 'Preto', hex: '#000000' }
        ]
      }
    ],
    colors: [
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Azul Cobalto', hex: '#0d54bf' },
      { name: 'Preto', hex: '#000000' }
    ]
  },
  {
    id: 1779047822545,
    name: 'Taça da Copa Escala Real 🏆',
    emoji: '🏆',
    desc: 'Réplica da Taça do Mundo em escala real impressa em 3D, o item definitivo para os apaixonados por futebol! Com brilho dourado incrível.',
    category: 'Decorativo',
    price: 60,
    badge: 'Edição Campeã 🥇',
    discount: 10,
    rating: 5.0,
    reviewsCount: 18,
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
    name: 'Estrela do Mar Flexível ⭐',
    emoji: '⭐',
    desc: 'Estrela do mar articulada super fofa com textura de escamas em relevo! Perfeita para se divertir com seus movimentos fluidos ou relaxar em qualquer lugar.',
    category: 'Articulado',
    price: 70,
    badge: 'Popular',
    discount: 20,
    rating: 4.9,
    reviewsCount: 25,
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
          { name: 'Preto', hex: '#2c2c2c' },
          { name: 'Verde', hex: '#27ae60' },
          { name: 'Dourado', hex: '#f0a500' }
        ]
      }
    ],
    colors: [
      { name: 'Preto', hex: '#2c2c2c' },
      { name: 'Verde', hex: '#27ae60' },
      { name: 'Dourado', hex: '#f0a500' }
    ]
  },
  {
    id: 1783942729901,
    name: 'Porta-Página de Livro 📖',
    emoji: '📖',
    desc: 'Suporte ergonômico de polegar para manter páginas de livros abertas com apenas uma mão. Leve, resistente e indispensável para leitores!',
    category: 'Utilitário',
    price: 14,
    badge: 'Leitura 📚',
    discount: 0,
    rating: 5.0,
    reviewsCount: 33,
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
          { name: 'Preto', hex: '#1c1c1c' }
        ]
      }
    ],
    colors: [
      { name: 'Laranja Maker3D', hex: '#f07800' },
      { name: 'Avelã', hex: '#bf540d' },
      { name: 'Preto', hex: '#1c1c1c' }
    ]
  },
  {
    id: 1783942729902,
    name: 'Travessa Morcego Decor 🦇',
    emoji: '🦇',
    desc: 'Pote decorativo e porta-doces em formato de morcego estilizado. Perfeito para festas temáticas, setups gamer ou organização criativa!',
    category: 'Decorativo',
    price: 26,
    badge: 'Geek 🦇',
    discount: 0,
    rating: 4.8,
    reviewsCount: 15,
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
          { name: 'Preto', hex: '#1c1c1c' },
          { name: 'Roxo Galáxia', hex: '#7d3c98' }
        ]
      }
    ],
    colors: [
      { name: 'Preto', hex: '#1c1c1c' },
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
      orders: this.loadLocal('maker3d_orders', []),
      reviews: this.loadLocal('maker3d_reviews', {}),
      users: this.loadLocal('maker3d_users', []),
      currentUser: this.loadLocal('maker3d_current_user', null),
      activeCoupon: null,
      theme: localStorage.getItem('maker3d_theme') || 'light'
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
