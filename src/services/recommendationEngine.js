/**
 * Motor de recomendações inteligente
 * Usa análise de similaridade e histórico do usuário
 */

class RecommendationEngine {
  constructor(products) {
    this.products = products;
    this.userHistory = JSON.parse(
      localStorage.getItem('userHistory') || '[]'
    );
  }

  // ✅ Recomenda produtos similares
  getRelatedProducts(productId, limit = 4) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return [];

    const related = this.products
      .filter(p => p.id !== productId)
      .map(p => ({
        ...p,
        similarity: this.calculateSimilarity(product, p)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return related;
  }

  // ✅ Calcula similaridade entre produtos
  calculateSimilarity(product1, product2) {
    let score = 0;

    // Mesma categoria (peso 40%)
    if (product1.category === product2.category) score += 0.4;

    // Preço similar (peso 30%) - ±20%
    const priceDiff = Math.abs(product1.price - product2.price) / product1.price;
    if (priceDiff < 0.2) score += 0.3 * (1 - priceDiff);

    // Mesma cor (peso 20%)
    if (product1.colors?.some(c => product2.colors?.includes(c))) score += 0.2;

    // Mesma tag/material (peso 10%)
    if (product1.material === product2.material) score += 0.1;

    return score;
  }

  // ✅ Recomenda baseado no histórico do usuário
  getPersonalizedRecommendations(limit = 6) {
    if (this.userHistory.length === 0) {
      // Produtos mais populares se sem histórico
      return this.products
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit);
    }

    const viewed = new Set(this.userHistory);
    const recommendations = new Map();

    // Para cada produto visto, busca similares
    this.userHistory.forEach(viewedId => {
      const similar = this.getRelatedProducts(viewedId, 10);
      similar.forEach(p => {
        if (!viewed.has(p.id)) {
          recommendations.set(
            p.id,
            (recommendations.get(p.id) || 0) + p.similarity
          );
        }
      });
    });

    // Retorna top recomendações
    return Array.from(recommendations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => this.products.find(p => p.id === id));
  }

  // ✅ Assistente IA - Sugere produtos baseado em palavras-chave
  chatAssistant(userMessage) {
    const keywords = userMessage.toLowerCase().split(/\s+/);
    
    // Palavras-chave mapeadas
    const keywordMap = {
      'pequeno': { maxPrice: 500, category: 'miniatures' },
      'grande': { maxPrice: 5000, category: 'large' },
      'barato': { maxPrice: 200 },
      'caro': { minPrice: 2000 },
      'resistente': { material: 'PLA', minRating: 4.5 },
      'flexível': { material: 'TPU' },
      'preto': { colors: ['black'] },
      'branco': { colors: ['white'] },
      'colorido': { multiColor: true },
      'rápido': { leadTime: '24h' },
      'protótipo': { category: 'prototypes' },
      'peça': { category: 'parts' },
      'decoração': { category: 'decoration' },
    };

    let filters = {};
    keywords.forEach(keyword => {
      if (keywordMap[keyword]) {
        filters = { ...filters, ...keywordMap[keyword] };
      }
    });

    // Filtra produtos baseado em palavras-chave
    const suggestions = this.products.filter(p => {
      if (filters.maxPrice && p.price > filters.maxPrice) return false;
      if (filters.minPrice && p.price < filters.minPrice) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.material && p.material !== filters.material) return false;
      if (filters.minRating && (p.rating || 0) < filters.minRating) return false;
      if (filters.colors && !filters.colors.some(c => p.colors?.includes(c))) return false;
      return true;
    });

    // Resposta inteligente
    let response = '';
    if (suggestions.length === 0) {
      response = '😅 Não encontrei produtos exatos. Tente outro termo!';
    } else if (suggestions.length <= 3) {
      response = `✨ Encontrei ${suggestions.length} produto(s) perfeito(s) para você!`;
    } else {
      response = `🎯 Encontrei ${suggestions.length} produtos que combinem com sua busca!`;
    }

    return {
      message: response,
      products: suggestions.slice(0, 4),
      confidence: Math.min(suggestions.length / 5, 1)
    };
  }

  // ✅ Registra visualização do usuário
  trackViewEvent(productId) {
    if (!this.userHistory.includes(productId)) {
      this.userHistory.unshift(productId);
      // Mantém apenas últimas 50 visualizações
      this.userHistory = this.userHistory.slice(0, 50);
      localStorage.setItem('userHistory', JSON.stringify(this.userHistory));
    }
  }
}

export default RecommendationEngine;