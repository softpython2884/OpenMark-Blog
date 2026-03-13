import { marked } from 'marked';
import DOMPurify from 'dompurify';

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
    // Nettoyer le HTML
    const cleanHtml = DOMPurify.sanitize(html);
    
    // Extraire le titre principal avec regex
    const titleMatch = cleanHtml.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : 'Article Sans Titre';

    // Extraire les images avec regex
    const imageMatches = cleanHtml.match(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi);
    const images = imageMatches ? imageMatches.map(match => {
      const srcMatch = match.match(/src=["']([^"']*)["']/i);
      const altMatch = match.match(/alt=["']([^"']*)["']/i);
      return {
        src: srcMatch ? srcMatch[1] : '',
        alt: altMatch ? altMatch[1] : '',
        caption: altMatch ? altMatch[1] : ''
      };
    }) : [];

    // Extraire les paragraphes principaux avec regex
    const paragraphMatches = cleanHtml.match(/<p[^>]*>(.*?)<\/p>/gi);
    const paragraphs = paragraphMatches ? paragraphMatches.map(p => 
      p.replace(/<[^>]*>/g, '').trim()
    ).filter(p => p.length > 0) : [];

    // Détecter les titres secondaires avec regex
    const subHeadlineMatches = cleanHtml.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi);
    const subHeadlines = subHeadlineMatches ? subHeadlineMatches.map(h => 
      h.replace(/<[^>]*>/g, '').trim()
    ).filter(h => h.length > 0) : [];

    // Détecter les publicités avec regex
    const adMatches = cleanHtml.match(/<(div|section)[^>]*class=["'][^"']*(ad-box|advertisement)[^"']*["'][^>]*>(.*?)<\/\1>/gi);
    const advertisements = adMatches ? adMatches.map(ad => 
      ad.replace(/<[^>]*>/g, '').trim()
    ).filter(ad => ad.length > 0) : [];

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
    return `
      :root {
        --ink-color: #2b2724;
        --paper-bg: #e6dac3;
        --line-color: #3a342e;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        background-color: #1a1a1a;
        display: flex;
        justify-content: center;
        padding: 20px;
        font-family: 'Lora', serif;
        color: var(--ink-color);
      }

      .newspaper-page {
        position: relative;
        background-color: var(--paper-bg);
        max-width: 1000px;
        width: 100%;
        padding: 40px;
        box-shadow: 
          0 10px 30px rgba(0, 0, 0, 0.8),
          inset 0 0 100px rgba(110, 80, 40, 0.4);
        overflow: hidden;
      }

      .newspaper-page::after {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
        pointer-events: none;
        mix-blend-mode: multiply;
        z-index: 10;
      }

      .header {
        text-align: center;
        margin-bottom: 20px;
      }

      .header-info {
        display: flex;
        justify-content: space-between;
        text-transform: uppercase;
        font-size: 0.85em;
        font-weight: bold;
        letter-spacing: 1px;
        border-bottom: 2px solid var(--line-color);
        padding-bottom: 5px;
        margin-bottom: 15px;
      }

      .page-title {
        font-family: 'UnifrakturMaguntia', cursive;
        font-size: 5.5em;
        line-height: 1;
        margin-bottom: 10px;
        text-shadow: 1px 1px 0px rgba(0,0,0,0.2);
      }

      .date-bar {
        border-top: 4px solid var(--line-color);
        border-bottom: 4px solid var(--line-color);
        padding: 8px 0;
        font-family: 'Playfair Display', serif;
        font-size: 1.1em;
        font-style: italic;
        display: flex;
        justify-content: space-between;
      }

      .content-layout {
        display: grid;
        grid-template-columns: 2.5fr 1fr;
        gap: 30px;
      }

      .main-article {
        column-count: 2;
        column-gap: 30px;
        text-align: justify;
        text-justify: inter-word;
        line-height: 1.6;
      }

      .main-article p {
        margin-bottom: 15px;
        text-indent: 20px;
      }

      .main-article p:first-of-type::first-letter {
        float: left;
        font-family: 'Playfair Display', serif;
        font-size: 5em;
        font-weight: 900;
        line-height: 0.8;
        margin-right: 8px;
        margin-top: 5px;
      }

      .main-article p:first-of-type::first-line {
        font-weight: bold;
        font-variant: small-caps;
        font-size: 1.1em;
      }

      .article-image {
        width: 100%;
        margin: 15px 0 25px 0;
        border: 3px double var(--line-color);
        padding: 4px;
        break-inside: avoid;
      }

      .article-image img {
        width: 100%;
        display: block;
        filter: grayscale(100%) sepia(50%) contrast(150%) brightness(85%);
        mix-blend-mode: multiply;
      }

      .article-image figcaption {
        font-size: 0.85em;
        text-align: center;
        font-style: italic;
        margin-top: 8px;
        border-top: 1px solid var(--line-color);
        padding-top: 5px;
        font-family: 'Playfair Display', serif;
      }

      .sidebar {
        display: flex;
        flex-direction: column;
        gap: 20px;
        border-left: 2px solid var(--line-color);
        padding-left: 20px;
      }

      .ad-box {
        border: 2px dashed var(--line-color);
        padding: 15px;
        text-align: center;
      }

      .ad-box h3 {
        font-family: 'Playfair Display', serif;
        font-size: 1.4em;
        text-transform: uppercase;
        margin-bottom: 10px;
      }

      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid var(--line-color);
        text-align: center;
        font-size: 12px;
        color: #888;
      }

      @media (max-width: 800px) {
        .content-layout {
          grid-template-columns: 1fr;
        }
        .sidebar {
          border-left: none;
          border-top: 2px solid var(--line-color);
          padding-left: 0;
          padding-top: 20px;
        }
        .main-article {
          column-count: 1;
        }
        .page-title {
          font-size: 3.5em;
        }
      }
    `;
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
