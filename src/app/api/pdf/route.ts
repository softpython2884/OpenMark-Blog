import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { getUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { html, options } = await request.json();
    
    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    // Options par défaut
    const pdfOptions = {
      format: options?.format || 'A4',
      landscape: options?.orientation === 'landscape',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      ...options
    };

    // Lancer Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Définir le contenu HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Générer le PDF
    const pdfBuffer = await page.pdf(pdfOptions);
    
    await browser.close();

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="article-${Date.now()}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
