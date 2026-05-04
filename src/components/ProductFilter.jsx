import React from 'react';
import useProductFilters from '@hooks/useProductFilters';
import './ProductFilter.css';

const ProductFilter = ({ products, onFilter }) => {
  const {
    filteredProducts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    getSuggestions,
  } = useProductFilters(products);

  React.useEffect(() => {
    onFilter(filteredProducts);
  }, [filteredProducts, onFilter]);

  return (
    <div className="filter-container">
      {/* BUSCA */}
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar produtos"
        />
        {searchTerm && (
          <div className="search-suggestions">
            {getSuggestions(searchTerm).map((suggestion) => (
              <div
                key={suggestion}
                onClick={() => setSearchTerm(suggestion)}
                className="suggestion"
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CATEGORIA */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        aria-label="Filtrar por categoria"
      >
        <option value="all">Todas Categorias</option>
        <option value="prototypes">Protótipos</option>
        <option value="parts">Peças</option>
        <option value="models">Modelos</option>
      </select>

      {/* PREÇO */}
      <div className="price-filter">
        <label>Preço: R$ {priceRange.min.toLocaleString('pt-BR')} - R$ {priceRange.max.toLocaleString('pt-BR')}</label>
        <input
          type="range"
          min="0"
          max="10000"
          value={priceRange.max}
          onChange={(e) =>
            setPriceRange({ ...priceRange, max: parseInt(e.target.value) })
          }
          aria-label="Filtrar por preço máximo"
        />
      </div>

      {/* ORDENAÇÃO */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        aria-label="Ordenar produtos"
      >
        <option value="relevance">Relevância</option>
        <option value="price-asc">Menor Preço</option>
        <option value="price-desc">Maior Preço</option>
        <option value="newest">Mais Novos</option>
        <option value="popular">Mais Populares</option>
      </select>

      <p className="result-count">📊 {filteredProducts.length} produtos encontrados</p>
    </div>
  );
};

export default ProductFilter;