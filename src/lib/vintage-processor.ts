import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

export interface VintagePage {
  content: PageContent;
  pageNumber: number;
  totalPages: number;
  template: 'blackwater-ledger' | 'le-figaro' | 'le-monde' | 'liberation';
}

export interface PageContent {
  title?: string;
  paragraphs: string[];
  images: ImageInfo[];
  advertisements: string[];
}

export interface ImageInfo {
  src: string;
  alt: string;
  caption: string;
}

export interface ProcessedContent {
  pages: VintagePage[];
  metadata: {
    title: string;
    author: string;
    date: string;
    template: string;
  };
}

export class VintageProcessor {
  private template: string;
  private pageHeight: number = 1100; // mm (A4)
  private pageWidth: number = 800; // px
  private margin: number = 40; // px
  private columnGap: number = 30; // px
  private lineHeight: number = 1.6;

  constructor(template: string = 'blackwater-ledger') {
    this.template = template;
  }

  /**
   * Analyse le contenu et extrait les informations clés
   */
  private analyzeContent(html: string): {
    title: string;
    author: string;
    mainHeadline: string;
    subHeadlines: string[];
    paragraphs: string[];
    images: Array<{ src: string; alt: string; caption: string }>;
    advertisements: string[];
  } {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extraire le titre principal
    const titleElement = document.querySelector('h1, h2, h3');
    const title = titleElement ? titleElement.textContent?.trim() || 'Article Sans Titre' : 'Article Sans Titre';

    // Extraire les images
    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.getAttribute('src') || '',
      alt: img.getAttribute('alt') || '',
      caption: img.getAttribute('alt') || ''
    }));

    // Extraire les paragraphes principaux
    const paragraphs = Array.from(document.querySelectorAll('p')).map(p => 
      p.textContent?.trim() || ''
    ).filter(p => p.length > 0);

    // Détecter les titres secondaires
    const subHeadlines = Array.from(document.querySelectorAll('h2, h3, h4'))
      .map(h => h.textContent?.trim() || '')
      .filter(h => h.length > 0);

    // Détecter les publicités (annonces)
    const advertisements = Array.from(document.querySelectorAll('.ad-box, .advertisement'))
      .map(ad => ad.textContent?.trim() || '')
      .filter(ad => ad.length > 0);

    return {
      title,
      author: 'OpenMark Blog', // Sera remplacé par l'auteur réel
      mainHeadline: this.findMainHeadline(paragraphs, subHeadlines),
      subHeadlines: subHeadlines.slice(0, 3), // Maximum 3 sous-titres
      paragraphs: paragraphs.slice(0, 20), // Maximum 20 paragraphes par page
      images: images.slice(0, 3), // Maximum 3 images par page
      advertisements: advertisements.slice(0, 2) // Maximum 2 publicités par page
    };
  }

  /**
   * Trouve le titre principal d'un article
   */
  private findMainHeadline(paragraphs: string[], headlines: string[]): string {
    // Chercher le titre le plus long et le plus impactant
    const allTexts = [...paragraphs, ...headlines];
    
    // Prioriser les titres en majuscules ou avec mots forts
    const strongCandidates = allTexts.filter(text => 
      text.length > 20 && 
      (text === text.toUpperCase() || text.includes('!') || text.includes('?') || 
       text.includes('mort') || text.includes('catastrophe') || text.includes('révolution'))
    );

    if (strongCandidates.length > 0) {
      return strongCandidates.reduce((a, b) => a.length > b.length ? a : b);
    }

    // Sinon, prendre le premier paragraphe significatif
    const significantParagraphs = paragraphs.filter(p => p.length > 50);
    if (significantParagraphs.length > 0) {
      return significantParagraphs[0];
    }

    return allTexts[0] || 'Sans Titre Principal';
  }

  /**
   * Calcule la répartition du contenu sur plusieurs pages
   */
  private calculatePageDistribution(content: ReturnType<VintageProcessor['analyzeContent']>): Array<{
    pageNumber: number;
    content: {
      title?: string;
      paragraphs: string[];
      images: Array<{ src: string; alt: string; caption: string }>;
      advertisements: string[];
    };
  }> {
    const pages: Array<{
      pageNumber: number;
      content: {
        title?: string;
        paragraphs: string[];
        images: Array<{ src: string; alt: string; caption: string }>;
        advertisements: string[];
      };
    }> = [];

    let currentParagraphIndex = 0;
    let currentImageIndex = 0;
    let currentAdIndex = 0;
    let pageNumber = 1;

    // Page 1 : Titre principal, chapeau, début du contenu
    const page1 = {
      pageNumber,
      content: {
        title: content.title,
        paragraphs: content.paragraphs.slice(0, 6), // 6 paragraphes max
        images: content.images.slice(0, 1), // 1 image max
        advertisements: content.advertisements.slice(0, 1) // 1 pub max
      }
    };

    // Pages suivantes : continuation du contenu
    currentParagraphIndex = 6;
    currentImageIndex = 1;
    currentAdIndex = 1;

    while (currentParagraphIndex < content.paragraphs.length || currentImageIndex < content.images.length || currentAdIndex < content.advertisements.length) {
      pageNumber++;
      
      const pageContent = {
        paragraphs: content.paragraphs.slice(currentParagraphIndex, currentParagraphIndex + 8), // 8 paragraphes par page
        images: content.images.slice(currentImageIndex, currentImageIndex + 2), // 2 images par page
        advertisements: content.advertisements.slice(currentAdIndex, currentAdIndex + 1) // 1 pub par page
      };

      pages.push({
        pageNumber,
        content: pageContent
      });
      currentParagraphIndex += 8;
      currentImageIndex += 2;
      currentAdIndex += 1;
    }

    return [page1, ...pages];
  }

  /**
   * Génère le HTML pour une page spécifique
   */
  private generatePageHTML(page: PageContent): string {
    const templateStyles = this.getTemplateStyles();
    
    return `
      <div class="newspaper-page">
        <div class="header">
          ${page.title ? `
            <div class="page-title">${page.title}</div>
          ` : ''}
          <div class="date-bar">
            <span>Vol. XIV — No. 42</span>
            <span>Blackwater, West Elizabeth</span>
          </div>
        </div>
        
        ${page.paragraphs.length > 0 ? `
          <div class="content-layout">
            <main class="main-article">
              ${page.paragraphs.map((p: string) => `<p>${this.processText(p)}</p>`).join('')}
            </main>
          </div>
        ` : ''}
        
        ${page.images.length > 0 ? `
          <div class="content-layout">
            ${page.images.map((img: ImageInfo) => `
              <figure class="article-image">
                <img src="${img.src}" alt="${img.alt}" />
                ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ''}
              </figure>
            `).join('')}
          </div>
        ` : ''}
        
        ${page.advertisements.length > 0 ? `
          <div class="sidebar">
            ${page.advertisements.map((ad: string) => `
              <div class="ad-box">
                <h3>${ad}</h3>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="footer">
          Généré par OpenMark Blog • ${new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    `;
  }

  /**
   * Traite le texte pour le style vintage
   */
  private processText(text: string): string {
    // Remplacer les caractères spéciaux pour l'époque
    return text
      .replace(/"/g, '«')
      .replace(/"/g, '»')
      .replace(/'/g, "'")
      .replace(/…/g, '...');
  }

  /**
   * Retourne les styles CSS selon le template
   */
  public getTemplateStyles(): string {
    const styles = {
      'blackwater-ledger': `
        body { 
          background-color: #1a1a1a;
          font-family: 'Lora', serif;
          color: #2b2724;
        }
        .newspaper-page {
          background-color: #e6dac3;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        }
        .page-title {
          font-family: 'UnifrakturMaguntia', cursive;
          font-size: 5.5em;
          color: #1a365d;
        }
        .date-bar {
          border-color: #3a342e;
        }
        .main-article p:first-of-type::first-letter {
          font-family: 'Playfair Display', serif;
          color: #1a365d;
        }
      `,
      'le-figaro': `
        body { 
          background-color: #fefefe;
          font-family: 'Georgia', serif;
          color: #2c2c2c;
        }
        .newspaper-page {
          background-color: #fefefe;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        }
        .header {
          background-color: #722f37;
          color: white;
        }
        .page-title {
          font-size: 32px;
          letter-spacing: -1px;
        }
        .article-image {
          border-color: #722f37;
        }
        .footer {
          border-color: #722f37;
        }
      `,
      'le-monde': `
        body { 
          background-color: #f5f5f5;
          font-family: 'Georgia', serif;
          color: #22471f;
        }
        .newspaper-page {
          background-color: #f5f5f5;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        }
        .date-bar {
          border-color: #1a365d;
        }
        .page-title {
          color: #1a365d;
        }
        .main-article p:first-of-type::first-letter {
          color: #1a365d;
        }
      `,
      'liberation': `
        body { 
          background-color: white;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          color: #000;
        }
        .newspaper-page {
          background-color: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        }
        .header {
          text-align: center;
          border-bottom: 4px double #000;
        }
        .page-title {
          font-size: 36px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .ad-box {
          border: 2px solid #000;
        }
        .footer {
          border-color: #000;
        }
      `
    };

    return (styles as Record<string, string>)[this.template] || styles['blackwater-ledger'];
  }

  /**
   * Traite le contenu complet et génère les pages
   */
  async process(html: string): Promise<ProcessedContent> {
    const analyzedContent = this.analyzeContent(html);
    const pages = this.calculatePageDistribution(analyzedContent);

    // Générer le HTML pour chaque page
    const pageHTMLs = pages.map(page => this.generatePageHTML(page.content));

    return {
      pages: pages.map((page, index) => ({
        content: page.content,
        pageNumber: index + 1,
        totalPages: pages.length,
        template: this.template as 'blackwater-ledger' | 'le-figaro' | 'le-monde' | 'liberation'
      })),
      metadata: {
        title: analyzedContent.title,
        author: analyzedContent.author,
        date: new Date().toLocaleDateString('fr-FR'),
        template: this.template
      }
    };
  }
}
