import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductGridFinal from './ProductGridFinal';
import './styles.css';
import './tonton-outdoor-styles.css';

async function initializeApp() {
  try {
    // Charger le HTML du site exemple
    const response = await fetch('/EXEMPLESITE.html');
    const html = await response.text();
    
    // Créer un parser DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extraire les styles
    const styles = doc.querySelectorAll('style');
    styles.forEach(style => {
      document.head.appendChild(style.cloneNode(true));
    });
    
    // Extraire les liens CSS
    const links = doc.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      document.head.appendChild(link.cloneNode(true));
    });
    
    // Injecter le HTML du body
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = doc.body.innerHTML;
    
    // Attendre que le DOM soit chargé
    setTimeout(() => {
      const productsContainer = document.getElementById('products');
      
      if (productsContainer) {
        // Sauvegarder le HTML original
        const originalHTML = productsContainer.innerHTML;
        
        // Créer un nouveau container pour React
        const reactContainer = document.createElement('div');
        reactContainer.id = 'react-products';
        productsContainer.parentNode.replaceChild(reactContainer, productsContainer);
        
        // Restaurer le HTML original dans un container temporaire invisible
        const tempContainer = document.createElement('div');
        tempContainer.id = 'products';
        tempContainer.style.display = 'none';
        tempContainer.innerHTML = originalHTML;
        document.body.appendChild(tempContainer);
        
        // Monter React
        const root = ReactDOM.createRoot(reactContainer);
        root.render(<ProductGridFinal />);
      }
    }, 100);
    
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
  }
}

initializeApp();