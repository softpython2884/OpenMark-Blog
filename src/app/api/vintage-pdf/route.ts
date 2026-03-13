import { NextRequest, NextResponse } from 'next/server';
import { VintageProcessor } from '@/lib/vintage-processor';
import { getUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { html, template = 'blackwater-ledger' } = await request.json();
    
    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    // Créer le processeur vintage
    const processor = new VintageProcessor(template);
    
    // Traiter le contenu
    const processedContent = await processor.process(html);
    
    // Ajouter les styles du template
    const templateStyles = processor.getTemplateStyles();
    
    // Générer une date d'époque réaliste
    const currentDate = new Date();
    const epochDate = new Date(1899, 4, 10 + Math.floor(Math.random() * 20)); // Mai 1899 + aléatoire
    const formattedDate = epochDate.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Créer le HTML complet avec toutes les pages
    const finalHTML = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${processedContent.metadata.title} - Édition de 1899</title>
        <link href="https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,600;1,400&family=Rye&display=swap" rel="stylesheet">
        <style>
          ${templateStyles}
          @page { 
            margin: 2cm; 
            size: A4;
          }
          body { 
            margin: 0; 
            padding: 0;
            background: #1a1a1a;
          }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <div class="newspaper-page">
          <!-- En-tête du Journal -->
          <header>
            <div class="header-info">
              <span>Vol. XIV. — No. ${42 + Math.floor(Math.random() * 10)}</span>
              <span>Blackwater, West Elizabeth</span>
              <span>Prix : 2 Cents</span>
            </div>
            
            <h1 class="newspaper-title">The Blackwater Ledger</h1>
            
            <div class="date-bar">
              <span>Édition du Matin</span>
              <span>${formattedDate}</span>
              <span>Dieu Sauve le Peuple</span>
            </div>
          </header>

          <!-- Titres -->
          <div class="headline-container">
            <h2 class="main-headline">${processedContent.metadata.title}</h2>
            <h3 class="sub-headline">${processedContent.pages[0]?.content.paragraphs[0]?.substring(0, 150) || 'Une nouvelle extraordinaire secoue la région...'}</h3>
          </div>

          <!-- Corps du Journal -->
          <div class="content-layout">
            
            <!-- Article principal (gauche) -->
            <main class="main-article">
              ${processedContent.pages[0]?.content.paragraphs.map((p: string) => `<p>${p.replace(/"/g, '«').replace(/"/g, '»').replace(/'/g, "'").replace(/…/g, '...')}</p>`).join('') || ''}
              
              ${processedContent.pages[0]?.content.images.map((img: any) => `
                <figure class="article-image">
                  <img src="${img.src}" alt="${img.alt}" />
                  ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ''}
                </figure>
              `).join('') || ''}
              
              ${processedContent.pages[0]?.content.paragraphs.slice(1).map((p: string) => `<p>${p.replace(/"/g, '«').replace(/"/g, '»').replace(/'/g, "'").replace(/…/g, '...')}</p>`).join('') || ''}
            </main>

            <!-- Barre latérale (droite) -->
            <aside class="sidebar">
              
              <!-- Avis de Recherche -->
              <div class="wanted-poster">
                <div class="wanted-title">WANTED</div>
                <div style="font-family: 'Playfair Display', serif; font-weight: bold; letter-spacing: 2px;">DEAD OR ALIVE</div>
                <div class="wanted-name">${processedContent.metadata.author}</div>
                <p style="font-size: 0.9em; font-style: italic;">Pour publication d'articles exceptionnels et contributions remarquables.</p>
                <div class="wanted-price">$1,000 REWARD</div>
                <p style="font-size: 0.8em;">Approchez avec une extrême prudence. L'individu est lourdement talentueux, très créatif, et ne voyage jamais seul.</p>
              </div>
              
              <!-- Publicité d'époque -->
              <div class="ad-box">
                <h3>Miracle Tonic</h3>
                <p><strong>Élixir du Dr. Westdick</strong></p>
                <p style="font-size: 0.9em; margin-top: 10px;">Le seul remède approuvé pour soigner la toux, la mélancolie, le choléra et les morsures de serpent ! Redonne la vigueur d'antan.</p>
                <div style="font-size: 1.5em; margin: 10px 0; color: #555;">⚕️</div>
                <p><strong>Seulement 50¢ la bouteille</strong></p>
                <p style="font-size: 0.7em; margin-top: 5px;">Disponible chez le médecin de Valentine.</p>
              </div>

              <div class="ad-box" style="border-style: solid;">
                <h3 style="font-size: 1.1em;">Armurerie Lancaster</h3>
                <p style="font-size: 0.8em; margin-top: 5px;">Protégez votre famille. Fusils à répétition dernier cri et munitions pour revolver. Qualité garantie.</p>
              </div>

            </aside>
            
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(finalHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Vintage PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate vintage PDF' },
      { status: 500 }
    );
  }
}
