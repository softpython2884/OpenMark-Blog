'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Download, Settings, FileText, Palette, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PDFGeneratorProps {
  content: string;
  title: string;
  author?: string;
  imageUrl?: string;
}

interface PDFOptions {
  template: 'le-monde' | 'le-figaro' | 'liberation' | 'simple';
  format: 'A4' | 'A3' | 'letter';
  orientation: 'portrait' | 'landscape';
  quality: 'draft' | 'normal' | 'high';
  includeImages: boolean;
  includeExcerpt: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export function PDFGenerator({ content, title, author, imageUrl }: PDFGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<PDFOptions>({
    template: 'le-monde',
    format: 'A4',
    orientation: 'portrait',
    quality: 'normal',
    includeImages: true,
    includeExcerpt: true,
    fontSize: 'medium'
  });

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Créer le HTML avec le template sélectionné
      const html = await createPDFHTML(content, title, author, imageUrl, options);
      
      // Envoyer à l'API de génération PDF
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html,
          options: {
            format: options.format,
            landscape: options.orientation === 'landscape',
          }
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsOpen(false);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const createPDFHTML = async (content: string, title: string, author: string, imageUrl: string, opts: PDFOptions): Promise<string> => {
    // Extraire un extrait intelligent
    const excerpt = extractExcerpt(content);
    
    // Charger le template approprié
    const template = await loadTemplate(opts.template);
    
    // Remplacer les variables dans le template
    return template
      .replace('{{TITLE}}', title)
      .replace('{{AUTHOR}}', author || 'OpenMark Blog')
      .replace('{{DATE}}', new Date().toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }))
      .replace('{{EXCERPT}}', excerpt)
      .replace('{{CONTENT}}', content)
      .replace('{{IMAGE_URL}}', imageUrl || '')
      .replace('{{TEMPLATE_CSS}}', getTemplateCSS(opts.template, opts.fontSize))
      .replace('{{FONT_SIZE}}', getFontSizeClass(opts.fontSize));
  };

  const extractExcerpt = (text: string): string => {
    // Nettoyer le HTML
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    
    // Extraire les 3-4 premières phrases
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) return '';
    
    return sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '.');
  };

  const loadTemplate = async (template: string): Promise<string> => {
    // Templates simplifiés pour l'instant
    const templates = {
      'le-monde': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page { margin: 2cm; }
            body { 
              font-family: 'Georgia', serif; 
              line-height: 1.6; 
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 0;
            }
            .header { 
              border-bottom: 3px solid #1a365d; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
              text-align: center;
            }
            .title { 
              font-size: 28px; 
              font-weight: bold; 
              margin-bottom: 10px;
              color: #1a365d;
            }
            .meta { 
              font-size: 14px; 
              color: #666; 
              margin-bottom: 20px;
            }
            .excerpt { 
              font-style: italic; 
              background: #f5f5f5; 
              padding: 15px; 
              border-left: 4px solid #1a365d;
              margin-bottom: 30px;
              font-size: 16px;
            }
            .content { 
              column-count: 3; 
              column-gap: 30px; 
              text-align: justify;
              font-size: 14px;
            }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #ddd; 
              text-align: center; 
              font-size: 12px; 
              color: #888;
            }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">{{TITLE}}</div>
            <div class="meta">Par {{AUTHOR}} • {{DATE}}</div>
          </div>
          
          {{EXCERPT_TAG}}
          
          <div class="content">
            {{CONTENT}}
          </div>
          
          <div class="footer">
            Généré par OpenMark Blog • {{DATE}}
          </div>
        </body>
        </html>
      `,
      'le-figaro': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page { margin: 2.5cm; }
            body { 
              font-family: 'Georgia', serif; 
              line-height: 1.7; 
              color: #2c2c2c;
              background: #fefefe;
              max-width: 750px;
              margin: 0 auto;
              padding: 50px 0;
            }
            .header { 
              background: #722f37; 
              color: white; 
              padding: 30px; 
              margin-bottom: 30px;
              text-align: center;
            }
            .title { 
              font-size: 32px; 
              font-weight: bold; 
              margin-bottom: 10px;
              letter-spacing: -1px;
            }
            .meta { 
              font-size: 14px; 
              opacity: 0.9; 
              margin-bottom: 25px;
            }
            .excerpt { 
              background: white; 
              padding: 20px; 
              border-left: 5px solid #722f37;
              margin: 0 0 30px 0;
              font-style: italic;
              font-size: 16px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .content { 
              column-count: 2; 
              column-gap: 35px; 
              text-align: justify;
              font-size: 14px;
              line-height: 1.8;
            }
            .footer { 
              margin-top: 50px; 
              padding-top: 25px; 
              border-top: 2px solid #722f37; 
              text-align: center; 
              font-size: 11px; 
              color: #666;
              font-weight: bold;
            }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">{{TITLE}}</div>
            <div class="meta">{{AUTHOR}} • {{DATE}}</div>
          </div>
          
          {{EXCERPT_TAG}}
          
          <div class="content">
            {{CONTENT}}
          </div>
          
          <div class="footer">
            LE FIGARO • ÉDITION DU {{DATE}}
          </div>
        </body>
        </html>
      `,
      'liberation': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page { margin: 1.5cm; }
            body { 
              font-family: 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.5; 
              color: #000;
              background: white;
              max-width: 820px;
              margin: 0 auto;
              padding: 30px 0;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px;
              border-bottom: 4px double #000;
              padding-bottom: 20px;
            }
            .title { 
              font-size: 36px; 
              font-weight: 900; 
              margin-bottom: 8px;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            .meta { 
              font-size: 12px; 
              color: #666; 
              margin-bottom: 30px;
              font-weight: bold;
            }
            .content { 
              font-size: 14px; 
              line-height: 1.7;
              text-align: left;
            }
            .footer { 
              margin-top: 60px; 
              padding-top: 30px; 
              border-top: 1px solid #000; 
              text-align: center; 
              font-size: 10px; 
              color: #333;
              font-weight: bold;
            }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">{{TITLE}}</div>
            <div class="meta">{{AUTHOR}} • {{DATE}}</div>
          </div>
          
          <div class="content">
            {{CONTENT}}
          </div>
          
          <div class="footer">
            LIBÉRATION • {{DATE}}
          </div>
        </body>
        </html>
      `,
      'simple': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page { margin: 2cm; }
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            .title { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .content { 
              font-size: 14px; 
              line-height: 1.6;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              font-size: 12px; 
              color: #666;
            }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class="title">{{TITLE}}</div>
          <div class="content">
            {{CONTENT}}
          </div>
          <div class="footer">
            Généré le {{DATE}} par OpenMark Blog
          </div>
        </body>
        </html>
      `
    };

    return templates[template] || templates['simple'];
  };

  const getTemplateCSS = (template: string, fontSize: string): string => {
    // Retourner les CSS spécifiques au template
    return '';
  };

  const getFontSizeClass = (fontSize: string): string => {
    const sizes = {
      small: '12px',
      medium: '14px', 
      large: '16px'
    };
    return sizes[fontSize] || sizes['medium'];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Imprimer en PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Générateur PDF de Qualité Presse
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Options de Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Style du Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Template Presse</Label>
                <Select value={options.template} onValueChange={(value) => setOptions({...options, template: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="le-monde">📰 Le Monde - Élégant Moderne</SelectItem>
                    <SelectItem value="le-figaro">📰 Le Figaro - Tradition Premium</SelectItem>
                    <SelectItem value="liberation">📰 Libération - Progressiste</SelectItem>
                    <SelectItem value="simple">📄 Simple - Minimaliste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Format</Label>
                  <Select value={options.format} onValueChange={(value) => setOptions({...options, format: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Orientation</Label>
                  <Select value={options.orientation} onValueChange={(value) => setOptions({...options, orientation: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Paysage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Inclure les images</Label>
                  <Switch 
                    checked={options.includeImages}
                    onCheckedChange={(checked) => setOptions({...options, includeImages: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Générer un extrait</Label>
                  <Switch 
                    checked={options.includeExcerpt}
                    onCheckedChange={(checked) => setOptions({...options, includeExcerpt: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aperçu et Options Avancées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Qualité</Label>
                <Select value={options.quality} onValueChange={(value) => setOptions({...options, quality: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Taille du texte</Label>
                <Select value={options.fontSize} onValueChange={(value) => setOptions({...options, fontSize: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Petit</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="large">Grand</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Aperçu du template :</strong></p>
                <div className="border rounded p-3 bg-gray-50 max-h-40 overflow-y-auto">
                  {options.template === 'le-monde' && (
                    <div>
                      <p style={{fontFamily: 'Georgia, serif', color: '#1a365d', fontSize: '18px', fontWeight: 'bold'}}>
                        {title}
                      </p>
                      <p style={{fontFamily: 'Georgia, serif', color: '#666', fontSize: '12px', marginTop: '10px'}}>
                        Par {author || 'OpenMark Blog'} • {new Date().toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                  {options.template === 'le-figaro' && (
                    <div style={{backgroundColor: '#722f37', color: 'white', padding: '20px', textAlign: 'center'}}>
                      <p style={{fontSize: '24px', fontWeight: 'bold', margin: '0', letterSpacing: '-1px'}}>
                        {title}
                      </p>
                      <p style={{fontSize: '12px', opacity: '0.9', marginTop: '10px'}}>
                        {author || 'OpenMark Blog'} • {new Date().toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                  {options.template === 'liberation' && (
                    <div style={{textAlign: 'center', borderBottom: '4px double #000', paddingBottom: '20px'}}>
                      <p style={{fontSize: '28px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', margin: '0'}}>
                        {title}
                      </p>
                      <p style={{fontSize: '10px', color: '#666', fontWeight: 'bold', marginTop: '20px'}}>
                        {author || 'OpenMark Blog'} • {new Date().toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                  {options.template === 'simple' && (
                    <div>
                      <p style={{fontSize: '18px', fontWeight: 'bold', borderBottom: '2px solid #333', paddingBottom: '10px'}}>
                        {title}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={generatePDF} 
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? 'Génération...' : 'Générer le PDF'}
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
