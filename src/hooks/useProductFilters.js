import { useState, useMemo } from 'react';

const useProductFilters = (products) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem('favorites') || '[]')
  );

  // ✅ Busca em tempo real (debounced)
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      // Busca por texto
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro categoria
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      // Filtro preço
      const matchesPrice =
        product.price >= priceRange.min && product.price <= priceRange.max;

      // Filtro cor
      const matchesColor =
        selectedColors.length === 0 ||
        selectedColors.some(color => product.colors?.includes(color));

      return matchesSearch && matchesCategory && matchesPrice && matchesColor;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'popular':
          return (b.rating || 0) - (a.rating || 0);
        default: // relevance
          return 0;
      }
    });

    return result;
  }, [products, searchTerm, selectedCategory, priceRange, selectedColors, sortBy]);

  // ✅ Toggle favorito
  const toggleFavorite = (productId) => {
    const updated = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  // ✅ Obter sugestões em tempo real
  const getSuggestions = (term) => {
    return products
      .filter(p => p.name.toLowerCase().includes(term.toLowerCase()))
      .slice(0, 5)
      .map(p => p.name);
  };

  return {
    filteredProducts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    selectedColors,
    setSelectedColors,
    sortBy,
    setSortBy,
    favorites,
    toggleFavorite,
    getSuggestions,
    resultCount: filteredProducts.length
  };
};

export default useProductFilters;