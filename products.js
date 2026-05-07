/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              MAKER3D — ARQUIVO DE PRODUTOS                  ║
 * ║  Edite este arquivo para gerenciar todo o catálogo.         ║
 * ║  Coloque imagens em: ./assets/images/                       ║
 * ║  Coloque modelos 3D em: ./assets/models/  (formato .glb)    ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * COMO ADICIONAR UM PRODUTO:
 *  1. Copie o bloco de um produto existente
 *  2. Altere o id (deve ser único)
 *  3. Preencha os campos
 *  4. Salve o arquivo — o site atualiza automaticamente
 *
 * CAMPOS DISPONÍVEIS:
 *  id          → número único do produto
 *  name        → nome exibido no site
 *  emoji       → emoji fallback caso não haja imagem
 *  category    → "decorativo" | "funcional" | "miniatura" | "customizado"
 *  desc        → descrição curta (aparece no card)
 *  descFull    → descrição completa (aparece no modal)
 *  price       → preço em reais (null = "Sob Consulta")
 *  badge       → etiqueta sobre o card (ex: "Novo", "Popular") ou ""
 *  custom      → true = produto customizado (visual especial)
 *  featured    → true = aparece no carrossel da página inicial
 *
 *  colors      → array de objetos { hex: "#cor", name: "Nome da Cor" }
 *
 *  images      → array de caminhos para imagens do produto
 *                Ex: ["./assets/images/vaso-geo-1.jpg", "./assets/images/vaso-geo-2.jpg"]
 *                Primeira imagem = capa do card
 *                Deixe [] para usar o emoji como fallback
 *
 *  model3d     → caminho para o modelo 3D (.glb) ou null para não mostrar
 *                Ex: "./assets/models/vaso-geometrico.glb"
 *                Requer three.js (já incluído no index.html via CDN)
 *
 *  specs       → objeto com especificações técnicas (aparece no modal)
 *  tags        → array de palavras-chave para busca
 */

const MAKER3D_PRODUCTS = [

  // ─────────────────────────────────────────────
  //  DECORATIVOS
  // ─────────────────────────────────────────────
  {
    id: 1,
    name: "Vaso Geométrico",
    emoji: "🏺",
    category: "decorativo",
    featured: true,
    badge: "Popular",
    price: 45,
    desc: "Vaso com design geométrico inspirado em origami. Perfeito para decoração minimalista.",
    descFull: "Vaso decorativo com estrutura geométrica inspirada no origami japonês. Impresso em PLA de alta qualidade, possui paredes resistentes e acabamento liso. Disponível em diversas cores e pode ser usado com plantas artificiais ou como peça decorativa pura.",
    colors: [
      { hex: "#f07800", name: "Laranja Maker" },
      { hex: "#2c2c2c", name: "Preto Fosco" },
      { hex: "#ffffff", name: "Branco Neve" },
      { hex: "#4a9e6f", name: "Verde Sage" }
    ],
    images: [
      // "./assets/images/vaso-geo-1.jpg",
      // "./assets/images/vaso-geo-2.jpg",
      // "./assets/images/vaso-geo-3.jpg"
    ],
    model3d: null,
    // model3d: "./assets/models/vaso-geometrico.glb",
    specs: {
      "Material": "PLA Premium",
      "Altura": "18 cm",
      "Diâmetro": "10 cm",
      "Peso": "120g",
      "Acabamento": "Liso"
    },
    tags: ["vaso", "decoração", "origami", "geométrico", "minimalista"]
  },

  {
    id: 7,
    name: "Porta-Retratos 3D",
    emoji: "🖼️",
    category: "decorativo",
    featured: false,
    badge: "",
    price: 42,
    desc: "Porta-retratos com efeito de profundidade. Design único que valoriza suas fotos.",
    descFull: "Porta-retratos modular com estrutura tridimensional que cria um efeito de profundidade ao redor da foto. Fica lindo em prateleiras e mesas. Compatível com fotos 10x15cm.",
    colors: [
      { hex: "#f07800", name: "Laranja Maker" },
      { hex: "#ffffff", name: "Branco Neve" },
      { hex: "#8e6b3e", name: "Madeira" }
    ],
    images: [],
    model3d: null,
    specs: {
      "Material": "PLA Premium",
      "Tamanho da foto": "10x15 cm",
      "Profundidade": "2 cm",
      "Acabamento": "Liso"
    },
    tags: ["foto", "porta-retratos", "decoração", "presente"]
  },

  // ─────────────────────────────────────────────
  //  FUNCIONAIS
  // ─────────────────────────────────────────────
  {
    id: 2,
    name: "Suporte de Fone",
    emoji: "🎧",
    category: "funcional",
    featured: true,
    badge: "",
    price: 38,
    desc: "Suporte de mesa ergonômico para headphones. Elegante e resistente.",
    descFull: "Suporte lateral de mesa para headphones. Design minimalista com base antiderrapante. Impresso em PETG para maior resistência mecânica. Suporta headphones de até 500g.",
    colors: [
      { hex: "#f07800", name: "Laranja Maker" },
      { hex: "#1a1a2e", name: "Azul Noite" },
      { hex: "#e8e8e8", name: "Cinza Claro" }
    ],
    images: [],
    model3d: null,
    specs: {
      "Material": "PETG",
      "Altura": "22 cm",
      "Base": "12x8 cm",
      "Carga máx.": "500g",
      "Acabamento": "Fosco"
    },
    tags: ["fone", "headphone", "suporte", "mesa", "gamer", "escritório"]
  },

  {
    id: 4,
    name: "Organizador de Mesa",
    emoji: "🗂️",
    category: "funcional",
    featured: true,
    badge: "",
    price: 52,
    desc: "Organize canetas, cartões e cabos com estilo. Modular e expansível.",
    descFull: "Organizador de mesa modular com compartimentos para canetas, cartões, post-its e pequenos objetos. Os módulos se encaixam entre si permitindo configurações personalizadas. Impresso em PETG resistente.",
    colors: [
      { hex: "#f07800", name: "Laranja Maker" },
      { hex: "#ffffff", name: "Branco Neve" },
      { hex: "#3d3d3d", name: "Grafite" }
    ],
    images: [],
    model3d: null,
    specs: {
      "Material": "PETG",
      "Módulos inclusos": "3",
      "Compatível": "Expansível",
      "Acabamento": "Liso"
    },
    tags: ["organizador", "mesa", "escritório", "papelaria", "modular"]
  },

  {
    id: 8,
    name: "Suporte Celular",
    emoji: "📱",
    category: "funcional",
    featured: false,
    badge: "",
    price: 29,
    desc: "Suporte ajustável de mesa para qualquer smartphone. Ângulo perfeito sempre.",
    descFull: "Suporte de mesa com ângulo ajustável para smartphones de qualquer tamanho. Base robusta com slot para cabo de carregamento. Ideal para videoconferências e leitura.",
    colors: [
      { hex: "#2c2c2c", name: "Preto Fosco" },
      { hex: "#f07800", name: "Laranja Maker" },
      { hex: "#ffffff", name: "Branco Neve" }
    ],
    images: [],
    model3d: null,
    specs: {
      "Material": "PETG",
      "Compatível": "Todos smartphones",
      "Ângulo": "Ajustável 30–70°",
      "Slot carregador": "Sim"
    },
    tags: ["celular", "suporte", "smartphone", "mesa", "trabalho"]
  },

  // ─────────────────────────────────────────────
  //  MINIATURAS
  // ─────────────────────────────────────────────
  {
    id: 3,
    name: "Miniatura Dragão",
    emoji: "🐉",
    category: "miniatura",
    featured: true,
    badge: "Destaque",
    price: 89,
    desc: "Dragão articulado impresso em múltiplas partes. Escama por escama, um trabalho de arte.",
    descFull: "Dragão articulado com mais de 40 peças impressas separadamente e montadas à mão. Cada escama é detalhada individualmente. Articulações funcionais nas asas e cauda. Um item colecionável de alto nível.",
    colors: [
      { hex: "#c0392b", name: "Vermelho Fogo" },
      { hex: "#2c2c2c", name: "Preto Abissal" },
      { hex: "#f0a500", name: "Dourado" }
    ],
    images: [],
    model3d: null,
    specs: {
      "Material": "PLA Premium",
      "Peças": "40+",
      "Comprimento": "30 cm",
      "Articulado": "Sim",
      "Acabamento": "Detalhado"
    },
    tags: ["dragão", "miniatura", "colecionável", "fantasia", "articulado"]
  },

  {
    id: 6,
    name: "Miniatura RPG",
    emoji: "⚔️",
    category: "miniatura",
    featured: true,
    badge: "Novo",
    price: 65,
    desc: "Miniaturas para RPG de mesa — guerreiros, magos e criaturas. Acabamento detalhado.",
    descFull: "Coleção de miniaturas para RPG de mesa em escala 28mm. Inclui guerreiros, magos, arqueiros e criaturas. Impressas em resina para máximo detalhe. Perfeitas para pintar ou usar direto na mesa.",
    colors: [
      { hex: "#7f8c8d", name: "Prata" },
      { hex: "#c0392b", name: "Vermelho" },
      { hex: "#2c2c2c", name: "Preto" }
    ],
    images: [],
    model3d: null,
    specs: {
      "Material": "Resina",
      "Escala": "28mm",
      "Itens por kit": "5",
      "Pintável": "Sim"
    },
    tags: ["rpg", "miniatura", "mesa", "fantasia", "guerreiro", "mago"]
  },

  // ─────────────────────────────────────────────
  //  CUSTOMIZADOS
  // ─────────────────────────────────────────────
  {
    id: 5,
    name: "Chaveiro Personalizado",
    emoji: "🔑",
    category: "customizado",
    featured: false,
    badge: "",
    price: 18,
    desc: "Chaveiro com nome, inicial ou símbolo de sua escolha. Presente perfeito.",
    descFull: "Chaveiro personalizado impresso em PLA com nome, inicial, símbolo ou pequeno desenho vetorial à sua escolha. Acabamento liso e resistente. Ótima opção de presente.",
    colors: [
      { hex: "#f07800", name: "Laranja Maker" },
      { hex: "#e8c840", name: "Amarelo Ouro" },
      { hex: "#c0392b", name: "Vermelho" },
      { hex: "#3498db", name: "Azul" }
    ],
    images: [],
    model3d: null,
    specs: {
      "Material": "PLA",
      "Tamanho": "~5 cm",
      "Personalização": "Nome/símbolo",
      "Prazo": "3–5 dias úteis"
    },
    tags: ["chaveiro", "personalizado", "presente", "nome", "brinde"]
  },

  {
    id: 9,
    name: "✨ Peça Customizada",
    emoji: "⚙️",
    category: "customizado",
    featured: false,
    badge: "Sob Medida",
    price: null,
    custom: true,
    desc: "Traga seu arquivo STL ou descreva sua ideia. Criamos qualquer coisa do zero!",
    descFull: "Nosso serviço de peça totalmente customizada. Você pode enviar um arquivo STL pronto, uma referência de imagem, ou apenas descrever a ideia. Nossa equipe avalia, faz o orçamento e imprime com a mesma qualidade de todos os nossos produtos. Não há limites para o que podemos criar.",
    colors: [
      { hex: "#f07800", name: "Laranja Maker" },
      { hex: "#c85a00", name: "Laranja Escuro" },
      { hex: "#ffb347", name: "Âmbar" },
      { hex: "#3498db", name: "Azul" },
      { hex: "#2ecc71", name: "Verde" },
      { hex: "#9b59b6", name: "Roxo" },
      { hex: "#e74c3c", name: "Vermelho" },
      { hex: "#2c2c2c", name: "Preto" },
      { hex: "#ffffff", name: "Branco" }
    ],
    images: [],
    model3d: null,
    specs: {
      "Material": "PLA / PETG / Resina",
      "Arquivo aceito": "STL, OBJ, 3MF",
      "Prazo": "A combinar",
      "Orçamento": "Gratuito"
    },
    tags: ["customizado", "personalizado", "sob medida", "stl", "projeto"]
  }

  // ─────────────────────────────────────────────
  //  ADICIONE NOVOS PRODUTOS ABAIXO:
  // ─────────────────────────────────────────────
  /*
  ,{
    id: 10,
    name: "Meu Novo Produto",
    emoji: "🎁",
    category: "decorativo",   // decorativo | funcional | miniatura | customizado
    featured: false,
    badge: "Novo",
    price: 00,
    desc: "Descrição curta aqui.",
    descFull: "Descrição completa aqui.",
    colors: [
      { hex: "#f07800", name: "Laranja Maker" }
    ],
    images: [
      "./assets/images/meu-produto-1.jpg",
      "./assets/images/meu-produto-2.jpg"
    ],
    model3d: "./assets/models/meu-produto.glb",
    specs: {
      "Material": "PLA",
      "Tamanho": "10 cm"
    },
    tags: ["palavra1", "palavra2"]
  }
  */
];

// Exporta para uso no index.html
if (typeof window !== 'undefined') {
  window.MAKER3D_PRODUCTS = MAKER3D_PRODUCTS;
}
