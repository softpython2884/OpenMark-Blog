import { NextRequest, NextResponse } from 'next/server';
import { VintageProcessor } from '@/lib/vintage-processor';
import { getUser } from '@/lib/auth';

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
    
    // Créer le HTML complet avec toutes les pages
    const pagesHTML = processedContent.pages.map((page, index) => `
      <div class="newspaper-page">
        <div class="header">
          ${page.content.title ? `
            <div class="page-title">${page.content.title}</div>
          ` : ''}
          <div class="date-bar">
            <span>Vol. XIV — No. ${42 + index}</span>
            <span>Blackwater, West Elizabeth</span>
            <span>${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        ${page.content.paragraphs.length > 0 ? `
          <div class="content-layout">
            <main class="main-article">
              ${page.content.paragraphs.map((p: string) => `<p>${p.replace(/"/g, '«').replace(/"/g, '»').replace(/'/g, "'").replace(/…/g, '...')}</p>`).join('')}
            </main>
          </div>
        ` : ''}
        
        ${page.content.images.length > 0 ? `
          <div class="content-layout">
            ${page.content.images.map((img: any) => `
              <figure class="article-image">
                <img src="${img.src}" alt="${img.alt}" style="filter: grayscale(100%) sepia(50%) contrast(150%) brightness(85%);" />
                ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ''}
              </figure>
            `).join('')}
          </div>
        ` : ''}
        
        ${page.content.advertisements.length > 0 ? `
          <div class="sidebar">
            ${page.content.advertisements.map((ad: string) => `
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
    `).join('');

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
        ${pagesHTML}
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
