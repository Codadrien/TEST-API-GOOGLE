import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parser avec correction des images et extraction des vignettes
function extractProductsFromHTML(htmlContent, fileSource) {
  const products = [];
  
  // Extraire tous les articles
  const articleRegex = /<article[^>]*aria-label="([^"]*)"[^>]*>([\s\S]*?)<\/article>/g;
  let match;
  let index = 0;
  
  while ((match = articleRegex.exec(htmlContent)) !== null) {
    try {
      const articleContent = match[0];
      const title = match[1] || '';
      
      // Extraire le lien
      const linkMatch = articleContent.match(/href="([^"]*)"/);
      const link = linkMatch ? linkMatch[1] : '';
      
      // Extraire l'image principale (URL haute qualité)
      let mainImageUrl = '';
      let mainImageAlt = '';
      
      // Toujours ignorer les images base64 et utiliser les vraies URLs
      // D'abord essayer de trouver une vignette pour reconstruire l'URL
      const firstThumbnailMatch = articleContent.match(/data-thumbnail="([^"]*)"/);
      if (firstThumbnailMatch && firstThumbnailMatch[1]) {
        // IMPORTANT: Utiliser directement l'URL thumbnail car les large ne marchent pas
        mainImageUrl = firstThumbnailMatch[1];
        mainImageAlt = title;
      } else {
        // Si pas de vignette, essayer de récupérer depuis l'image principale
        const imgMatch = articleContent.match(/<img[^>]*alt="([^"]*)"[^>]*>/);
        if (imgMatch) {
          mainImageAlt = imgMatch[1] || title;
          // On laisse mainImageUrl vide pour le moment, il sera rempli plus tard
        }
      }
      
      // Si toujours pas d'image principale valide, essayer d'autres méthodes
      if (!mainImageUrl || mainImageUrl.startsWith('data:image')) {
        // Chercher dans les attributs data-thumbnail et convertir
        const thumbnailMatch = articleContent.match(/data-thumbnail="([^"]*)"/);
        if (thumbnailMatch) {
          mainImageUrl = thumbnailMatch[1].replace('/app_shop_product_thumbnail/', '/app_shop_product_large/');
        }
      }
      
      // Extraire la marque (Brand)
      const brandMatch = articleContent.match(/<span[^>]*class="[^"]*block h-4 line-clamp-1 uppercase text-xs font-bold[^"]*"[^>]*>([^<]*)<\/span>/);
      const brand = brandMatch ? brandMatch[1].trim() : '';
      
      // Extraire le nom (Name)
      const nameMatch = articleContent.match(/<span[^>]*class="[^"]*block h-7 uppercase text-xs[^"]*"[^>]*>([^<]*)<\/span>/);
      const name = nameMatch ? nameMatch[1].trim() : '';
      
      // Extraire le prix
      const priceMatch = articleContent.match(/<span[^>]*class="[^"]*leading-none mt-0\.5 font-medium[^"]*"[^>]*>([^<]*)<\/span>/);
      let price = priceMatch ? priceMatch[1].trim() : '';
      price = price.replace(/&nbsp;/g, ' ').trim();
      
      // Extraire le statut de stock
      const stockMatch = articleContent.match(/<p[^>]*class="[^"]*uppercase text-3xs italic[^"]*"[^>]*>([^<]*)<\/p>/);
      const stockStatus = stockMatch ? stockMatch[1].trim() : '';
      
      // Vérifier si c'est une promo
      const hasPromo = articleContent.includes('bg-persimmon') || articleContent.includes('Promo');
      
      // Extraire TOUTES les vignettes depuis data-thumbnail
      const thumbnails = [];
      
      // Chercher d'abord dans la section data-simplebar qui contient les vignettes
      const simplebarMatch = htmlContent.match(new RegExp(`<article[^>]*aria-label="${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?</article>`, 'i'));
      
      if (simplebarMatch) {
        const fullArticleContent = simplebarMatch[0];
        const thumbRegex = /data-thumbnail=["']?([^"'\s>]+)["']?/g;
        let thumbMatch;
        const seenUrls = new Set();
        
        while ((thumbMatch = thumbRegex.exec(fullArticleContent)) !== null) {
          const thumbUrl = thumbMatch[1];
          if (!seenUrls.has(thumbUrl)) {
            seenUrls.add(thumbUrl);
            
            // Créer aussi l'URL de l'image en taille large pour chaque vignette
            const largeUrl = thumbUrl.replace('/app_shop_product_thumbnail/', '/app_shop_product_large/');
            
            thumbnails.push({
              url: thumbUrl,
              largeUrl: largeUrl,
              alt: title
            });
          }
        }
      }
      
      // Si pas de vignettes trouvées mais qu'on a une image principale, créer une vignette
      if (thumbnails.length === 0 && mainImageUrl && !mainImageUrl.startsWith('data:image')) {
        const thumbUrl = mainImageUrl.replace('/app_shop_product_large/', '/app_shop_product_thumbnail/');
        thumbnails.push({
          url: thumbUrl,
          largeUrl: mainImageUrl,
          alt: title
        });
      }
      
      // Si l'image principale est toujours floue et qu'on a des vignettes, utiliser la première vignette
      // IMPORTANT: Utiliser l'URL thumbnail car les large ne fonctionnent pas sur ce site
      if ((!mainImageUrl || mainImageUrl.startsWith('data:image')) && thumbnails.length > 0) {
        mainImageUrl = thumbnails[0].url; // Utiliser thumbnail, pas largeUrl !
        mainImageAlt = thumbnails[0].alt || title;
      }
      
      // Déterminer l'URL pour l'analyse de couleur (utiliser la miniature qui fait 260x260px)
      let colorAnalysisUrl = '';
      if (thumbnails.length > 0) {
        colorAnalysisUrl = thumbnails[0].url; // URL thumbnail (260x260px)
      } else if (mainImageUrl && !mainImageUrl.startsWith('data:image')) {
        // Créer l'URL thumbnail depuis l'image principale
        colorAnalysisUrl = mainImageUrl.replace('/app_shop_product_large/', '/app_shop_product_thumbnail/');
      }
      
      const productData = {
        id: `${fileSource}_product_${index + 1}`,
        title: title,
        brand: brand,
        name: name,
        price: price,
        link: link,
        stockStatus: stockStatus,
        hasPromo: hasPromo,
        mainImage: {
          url: mainImageUrl,
          alt: mainImageAlt
        },
        thumbnails: thumbnails,
        source: fileSource,
        // Pour l'API Google Vision
        colorAnalysisUrl: colorAnalysisUrl, // URL de l'image 260x260px pour l'analyse
        dominantColor: null,
        colorPalette: [],
        colorAnalysis: {
          analyzed: false,
          analyzedAt: null,
          error: null
        }
      };
      
      products.push(productData);
      index++;
    } catch (error) {
      console.error(`Erreur lors de l'extraction du produit ${index}:`, error.message);
    }
  }
  
  return products;
}

async function extractAllProducts() {
  try {
    console.log('🔄 Extraction avec correction des images...\n');
    
    let allProducts = [];
    let fileCount = 0;
    
    // 1. Fichier original
    console.log('📄 Traitement de EXEMPLESITE.html...');
    const originalHTML = fs.readFileSync(path.join(__dirname, 'EXEMPLESITE.html'), 'utf8');
    const originalProducts = extractProductsFromHTML(originalHTML, 'original');
    allProducts = allProducts.concat(originalProducts);
    console.log(`   ✅ ${originalProducts.length} produits extraits`);
    if (originalProducts.length > 0) {
      const firstProduct = originalProducts[0];
      console.log(`   📊 Exemple: ${firstProduct?.brand} - ${firstProduct?.name} - ${firstProduct?.price}`);
      console.log(`   🖼️  Vignettes: ${firstProduct?.thumbnails?.length || 0}`);
    }
    fileCount++;
    
    // 2. Nouveaux fichiers
    const newDataDir = path.join(__dirname, 'NEW DATA');
    if (fs.existsSync(newDataDir)) {
      const htmlFiles = fs.readdirSync(newDataDir).filter(file => file.endsWith('.html'));
      
      for (const file of htmlFiles) {
        console.log(`\n📄 Traitement de ${file}...`);
        const htmlContent = fs.readFileSync(path.join(newDataDir, file), 'utf8');
        const sourceId = `newdata_${fileCount}`;
        const products = extractProductsFromHTML(htmlContent, sourceId);
        allProducts = allProducts.concat(products);
        console.log(`   ✅ ${products.length} produits extraits`);
        if (products.length > 0) {
          const firstProduct = products[0];
          console.log(`   📊 Exemple: ${firstProduct?.brand} - ${firstProduct?.name} - ${firstProduct?.price}`);
          console.log(`   🖼️  Vignettes: ${firstProduct?.thumbnails?.length || 0}`);
        }
        fileCount++;
      }
    }
    
    // 3. Réattribuer des IDs
    allProducts = allProducts.map((product, index) => ({
      ...product,
      id: `product_${index + 1}`
    }));
    
    // 4. Sauvegarder
    const outputData = {
      extractionDate: new Date().toISOString(),
      totalProducts: allProducts.length,
      sources: {
        filesProcessed: fileCount,
        breakdown: {
          original: originalProducts.length,
          newData: allProducts.length - originalProducts.length
        }
      },
      products: allProducts
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'products-final.json'),
      JSON.stringify(outputData, null, 2)
    );
    
    console.log('\n✅ Extraction terminée !');
    console.log(`📄 Fichier créé : products-final.json`);
    
    // Stats détaillées
    const stats = {
      withImages: allProducts.filter(p => p.mainImage?.url && !p.mainImage.url.startsWith('data:image')).length,
      withBlurryImages: allProducts.filter(p => p.mainImage?.url?.startsWith('data:image')).length,
      withThumbnails: allProducts.filter(p => p.thumbnails && p.thumbnails.length > 0).length,
      avgThumbnails: allProducts.reduce((sum, p) => sum + (p.thumbnails?.length || 0), 0) / allProducts.length,
      withPrices: allProducts.filter(p => p.price).length,
      withBrands: allProducts.filter(p => p.brand).length,
      withNames: allProducts.filter(p => p.name).length,
      withStock: allProducts.filter(p => p.stockStatus).length
    };
    
    console.log(`\n📈 Statistiques :`);
    console.log(`   - Total: ${allProducts.length} produits`);
    console.log(`   - Avec marque: ${stats.withBrands}`);
    console.log(`   - Avec nom: ${stats.withNames}`);
    console.log(`   - Avec prix: ${stats.withPrices}`);
    console.log(`   - Avec image HD: ${stats.withImages}`);
    console.log(`   - Avec image floue: ${stats.withBlurryImages}`);
    console.log(`   - Avec vignettes: ${stats.withThumbnails}`);
    console.log(`   - Moyenne vignettes: ${stats.avgThumbnails.toFixed(1)}`);
    console.log(`   - Avec stock: ${stats.withStock}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

extractAllProducts();