import React, { useState, useEffect } from 'react';
import './tonton-outdoor-styles.css';

const ProductGridFinal = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorPalette, setColorPalette] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // Charger les produits depuis le JSON
  useEffect(() => {
    // Forcer le rechargement du JSON avec un timestamp pour éviter le cache
    fetch(`/products-final.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        console.log('Données chargées:', data.products.length, 'produits');
        console.log('Premier produit:', data.products[0]);
        setProducts(data.products || []);
        setFilteredProducts(data.products || []);
        
        // Extraire les couleurs si déjà analysées
        const colors = [...new Set(data.products
          .map(p => p.dominantColor)
          .filter(Boolean))];
        setColorPalette(colors);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement produits:', err);
        setLoading(false);
      });
  }, []);

  // Filtrer par couleur
  const handleColorFilter = (color) => {
    setSelectedColor(color);
    
    if (!color) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.dominantColor === color));
    }
  };

  // Analyser les couleurs avec l'API
  const analyzeColors = async () => {
    setAnalyzing(true);
    
    try {
      // Simuler l'analyse (remplacer par l'appel API réel)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Pour la démo, assigner des couleurs aléatoires
      const colors = ['#FF6B4F', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
      const updatedProducts = products.map(product => ({
        ...product,
        dominantColor: product.dominantColor || colors[Math.floor(Math.random() * colors.length)]
      }));
      
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      
      const uniqueColors = [...new Set(updatedProducts.map(p => p.dominantColor).filter(Boolean))];
      setColorPalette(uniqueColors);
    } catch (error) {
      console.error('Erreur analyse:', error);
    }
    
    setAnalyzing(false);
  };

  // Composant carte produit (structure HTML identique au site original)
  const ProductCard = ({ product }) => {
    const [currentImage, setCurrentImage] = useState(product.mainImage);
    
    // Debug
    console.log('Product:', product.name, 'MainImage:', product.mainImage?.url, 'Thumbnails:', product.thumbnails?.length);
    
    return (
    <article 
      className="TTO-product-card rounded-lg flex flex-col justify-between gap-0 overflow-hidden bg-white border border-alto"
      aria-label={product.title}
    >
      <div>
        {/* Indicateur couleur */}
        {product.dominantColor && (
          <div 
            className="TTO-color-indicator"
            style={{ backgroundColor: product.dominantColor }}
            title={`Couleur dominante: ${product.dominantColor}`}
          />
        )}
        
        {/* Badge promo */}
        {product.hasPromo && (
          <a href={product.link} className="TTO-promo-badge h-4 flex items-center justify-center uppercase text-white font-semibold text-3xs bg-persimmon">
            Promo
          </a>
        )}
        
        {/* Container image */}
        <div className="TTO-image-container relative flex flex-col gap-1 px-2">
          <a href={product.link} className="TTO-product-link flex items-center justify-center group/link">
            <picture className="block w-full aspect-square max-w-32 xl:max-w-44 2xl:max-w-[184px] overflow-hidden">
              <img 
                src={currentImage?.url || product.mainImage?.url || '/placeholder.jpg'} 
                alt={currentImage?.alt || product.mainImage?.alt || product.title}
                title={product.title}
                loading="lazy"
                className="TTO-product-image object-contain text-xs text-dove-gray similar-image-card transition-transform duration-500 group-hover/link:scale-110"
              />
            </picture>
          </a>
          
          {/* Miniatures */}
          {product.thumbnails && product.thumbnails.length > 0 && (
            <div className="TTO-thumbnails h-[37px] flex gap-1 mb-2">
              {product.thumbnails.slice(0, 4).map((thumb, idx) => (
                <picture 
                  key={idx} 
                  className={`TTO-thumbnail flex-none w-9 h-[37px] cursor-pointer ${
                    currentImage?.url === thumb.url ? 'active' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImage({
                      url: thumb.url, // Utiliser seulement thumbnail car large ne marche pas
                      alt: thumb.alt || product.title
                    });
                  }}
                >
                  <img 
                    className="similar-image-card" 
                    src={thumb.url} 
                    alt={thumb.alt || product.title}
                  />
                </picture>
              ))}
            </div>
          )}
          
          {/* Bouton favori */}
          <div className="absolute right-2 top-1 p-0.5">
            <button type="button" className="TTO-favorite-button flex items-center justify-center w-8 h-8 text-silver hover:text-persimmon">
              <svg className="TTO-favorite-icon fill-current w-4 h-4 transition" xmlns="http://www.w3.org/2000/svg" width="23.729" height="20.392" viewBox="0 0 23.729 20.392">
                <path d="M17.426 0a6.22 6.22 0 0 0-5.109 2.691 8.698 8.698 0 0 0-.452.672 8.51 8.51 0 0 0-.452-.672A6.22 6.22 0 0 0 6.3 0C2.538 0 0 3.024 0 6.732c0 4.839 4.6 7.885 11.271 13.446a.927.927 0 0 0 1.187 0c6.671-5.559 11.271-8.606 11.271-13.446 0-3.705-2.536-6.732-6.3-6.732m-5.564 18.261C5.721 13.178 1.854 10.484 1.854 6.732c0-2.424 1.528-4.878 4.449-4.878a4.365 4.365 0 0 1 3.59 1.9 7.272 7.272 0 0 1 1.081 2.066.927.927 0 0 0 1.781 0c.011-.04 1.182-3.964 4.671-3.964 2.921 0 4.449 2.454 4.449 4.878 0 3.756-3.887 6.462-10.011 11.529"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Infos block */}
        <a href={product.link} className="TTO-product-info flex flex-col gap-1 px-2">
          {/* Rating stars (vide pour l'instant) */}
          <div className="flex items-center gap-0.5 h-[9px]"></div>
          
          <h3>
            {/* Brand */}
            <span className="TTO-brand block h-4 line-clamp-1 uppercase text-xs font-bold">
              {product.brand}
            </span>
            {/* Name */}
            <span className="TTO-name block h-7 uppercase text-xs leading-[14px] line-clamp-2">
              {product.name}
            </span>
          </h3>
          
          {/* Stock message */}
          {product.stockStatus && (
            <div className="TTO-stock-container flex gap-1 items-center">
              <svg className="TTO-stock-dot fill-current fill-green" xmlns="http://www.w3.org/2000/svg" width="5" height="5" viewBox="0 0 5 5">
                <circle cx="2.5" cy="2.5" r="2.5"></circle>
              </svg>
              <p className="TTO-stock uppercase text-3xs italic leading-normal pt-0.5">
                {product.stockStatus}
              </p>
            </div>
          )}
        </a>
      </div>
      
      {/* Price block */}
      <a href={product.link} className="TTO-price-container block pb-2">
        <div className="TTO-price-wrapper flex items-end justify-between gap-2 mx-2.5 mt-1">
          <div className="flex justify-between items-end">
            <div className="flex flex-col w-full items-end">
              <span className="TTO-price leading-none mt-0.5 font-medium">
                {product.price}
              </span>
            </div>
          </div>
        </div>
      </a>
    </article>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Panneau de filtrage */}
      <div className="TTO-filter-panel mb-6 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Filtrer par couleur dominante</h3>
        
        <div className="mb-4 text-sm text-gray-600">
          {filteredProducts.length} produits affichés sur {products.length}
        </div>
        
        <div className="flex gap-3 mb-4">
          {colorPalette.length === 0 && (
            <button 
              onClick={analyzeColors}
              className="TTO-analyze-button px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              disabled={analyzing}
            >
              {analyzing ? 'Analyse en cours...' : 'Analyser les couleurs'}
            </button>
          )}
          
          {selectedColor && (
            <button 
              onClick={() => handleColorFilter(null)}
              className="TTO-reset-button px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Réinitialiser
            </button>
          )}
        </div>
        
        {colorPalette.length > 0 && (
          <div className="TTO-color-palette flex gap-2 flex-wrap items-center">
            <button
              onClick={() => handleColorFilter(null)}
              className={`TTO-all-colors px-3 py-1 rounded text-sm ${
                !selectedColor ? 'bg-gray-800 text-white' : 'bg-gray-200'
              }`}
            >
              Toutes les couleurs
            </button>
            
            {colorPalette.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorFilter(color)}
                className={`TTO-color-button w-10 h-10 rounded-full border-2 transition-all ${
                  selectedColor === color 
                    ? 'border-gray-800 scale-110 shadow-lg' 
                    : 'border-gray-300 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Grille de produits */}
      <div className="TTO-products-grid grid grid-cols-2 gap-y-4 gap-x-2.5 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 2xl:gap-y-5 2xl:gap-x-3.5">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Loading overlay */}
      {analyzing && (
        <div className="TTO-loading-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Analyse des couleurs en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGridFinal;