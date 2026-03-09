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
    
    // Générer le HTML complet avec toutes les pages
    const fullHTML = processedContent.pages.map(page => page.content).join('');
    
    // Ajouter les styles du template
    const templateStyles = processor.getTemplateStyles();
    const finalHTML = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${processedContent.metadata.title} - Édition de 1899</title>
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
          .newspaper {
            position: relative;
            background-color: #e6dac3;
            max-width: 1000px;
            width: 100%;
            padding: 40px;
            box-shadow: 
              0 10px 30px rgba(0, 0, 0, 0.8),
              inset 0 0 100px rgba(110, 80, 40, 0.4);
            overflow: hidden;
          }
          .newspaper::after {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.06'/%3E%3C/svg%3E");
            pointer-events: none;
            mix-blend-mode: multiply;
            z-index: 10;
          }
          header {
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
            border-bottom: 2px solid #3a342e;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          .newspaper-title {
            font-family: 'UnifrakturMaguntia', cursive;
            font-size: 5.5em;
            line-height: 1;
            margin-bottom: 10px;
            text-shadow: 1px 1px 0px rgba(0,0,0,0.2);
          }
          .date-bar {
            border-top: 4px solid #3a342e;
            border-bottom: 4px solid #3a342e;
            padding: 8px 0;
            font-family: 'Playfair Display', serif;
            font-size: 1.1em;
            font-style: italic;
            display: flex;
            justify-content: space-between;
          }
          .headline-container {
            text-align: center;
            margin: 30px 0;
          }
          .main-headline {
            font-family: 'Playfair Display', serif;
            font-weight: 900;
            font-size: 3.8em;
            text-transform: uppercase;
            line-height: 1.1;
            margin-bottom: 15px;
          }
          .sub-headline {
            font-family: 'Playfair Display', serif;
            font-size: 1.5em;
            font-weight: 700;
            font-style: italic;
            border-bottom: 1px dashed #3a342e;
            padding-bottom: 15px;
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
            border: 3px double #3a342e;
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
            border-top: 1px solid #3a342e;
            padding-top: 5px;
            font-family: 'Playfair Display', serif;
          }
          .sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
            border-left: 2px solid #3a342e;
            padding-left: 20px;
          }
          .wanted-poster {
            border: 4px solid #3a342e;
            padding: 15px;
            text-align: center;
            background-color: rgba(0,0,0,0.03);
            box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
          }
          .wanted-title {
            font-family: 'Rye', serif;
            font-size: 2.2em;
            margin-bottom: 5px;
            line-height: 1;
          }
          .wanted-name {
            font-family: 'Playfair Display', serif;
            font-weight: 900;
            font-size: 1.6em;
            text-transform: uppercase;
            margin: 10px 0;
            border-top: 2px solid #3a342e;
            border-bottom: 2px solid #3a342e;
            padding: 5px 0;
          }
          .wanted-price {
            font-size: 1.8em;
            font-weight: bold;
            margin: 10px 0;
            font-family: 'Rye', serif;
          }
          .ad-box {
            border: 2px dashed #3a342e;
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
            border-top: 1px solid #3a342e;
            text-align: center;
            font-size: 12px;
            color: #888;
          }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${fullHTML}
        
        <div class="footer">
          Généré par OpenMark Blog • ${new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
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
