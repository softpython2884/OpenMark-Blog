'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Download, Settings, FileText, Palette, Image as ImageIcon, Newspaper, Clock, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface VintagePDFGeneratorProps {
  content: string;
  title: string;
  author?: string;
  imageUrl?: string;
}

interface VintageOptions {
  template: 'blackwater-ledger' | 'le-figaro' | 'le-monde' | 'liberation';
  fontSize: 'small' | 'medium' | 'large';
  includeImages: boolean;
  includeExcerpt: boolean;
  quality: 'draft' | 'normal' | 'high';
  pageBreaks: 'auto' | 'smart' | 'manual';
}

export function VintagePDFGenerator({ content, title, author, imageUrl }: VintagePDFGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState<VintageOptions>({
    template: 'blackwater-ledger',
    fontSize: 'medium',
    includeImages: true,
    includeExcerpt: true,
    quality: 'normal',
    pageBreaks: 'smart'
  });

  const generateVintagePDF = async () => {
    setIsGenerating(true);
    setIsProcessing(true);
    
    try {
      // Envoyer à l'API de génération vintage
      const response = await fetch('/api/vintage-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: content,
          template: options.template
        }),
      });

      if (response.ok) {
        const htmlContent = await response.text();
        
        // Créer un blob et télécharger
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-vintage-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setIsOpen(false);
        useToast({
          title: "PDF Vintage Généré !",
          description: "Le fichier HTML a été généré avec succès.",
        });
      } else {
        throw new Error('Failed to generate vintage PDF');
      }
    } catch (error) {
      console.error('Vintage PDF generation error:', error);
      useToast({
        title: "Erreur de Génération",
        description: "Impossible de générer le PDF vintage.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setIsProcessing(false);
    }
  };

  const getTemplateDescription = (template: string): string => {
    const descriptions = {
      'blackwater-ledger': '📰 The Blackwater Ledger - Style journal 1899 avec papier vieilli',
      'le-figaro': '📰 Le Figaro - Élégance moderne avec bordures rouges',
      'le-monde': '🌍 Le Monde - Design sobre et professionnel',
      'liberation': '📰 Libération - Style progressiste audacieux'
    };
    return descriptions[template] || descriptions['blackwater-ledger'];
  };

  const getQualityDescription = (quality: string): string => {
    const descriptions = {
      'draft': 'Brouillon - Génération rapide',
      'normal': 'Normal - Qualité standard',
      'high': 'Haute - Qualité premium'
    };
    return descriptions[quality] || descriptions['normal'];
  };

  const getProcessingInfo = (): string => {
    return `
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-2 mb-2">
          <Newspaper className="h-5 w-5 text-blue-600" />
          <span class="text-blue-800 font-medium">Traitement en cours...</span>
        </div>
        <div class="text-sm text-blue-700 space-y-2">
          <p>📄 <strong>Analyse intelligente</strong> du contenu</p>
          <p>🎨 <strong>Détection automatique</strong> des éléments journalistiques</p>
          <p>📰 <strong>Mise en page multi-colonnes</strong> optimisée</p>
          <p>🔤 <strong>Génération des styles vintage</strong> authentiques</p>
          <p>✨ <strong>Création HTML</strong> avec effets spéciaux</p>
          <p>📊 <strong>Répartition intelligente</strong> du contenu</p>
        </div>
      </div>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="outline">
          <Newspaper className="h-4 w-4" />
          Générer PDF Vintage 1899
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Générateur PDF Vintage - Édition 1899
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Options de Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Style Journal d'Époque
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
                    <SelectItem value="blackwater-ledger">
                      <div className="flex items-center gap-2">
                        <Newspaper className="h-4 w-4" />
                        <div>
                          <div className="font-medium">The Blackwater Ledger</div>
                          <div className="text-sm text-gray-600">{getTemplateDescription('blackwater-ledger')}</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="le-figaro">
                      <div className="flex items-center gap-2">
                        <Newspaper className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Le Figaro</div>
                          <div className="text-sm text-gray-600">{getTemplateDescription('le-figaro')}</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="le-monde">
                      <div className="flex items-center gap-2">
                        <Newspaper className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Le Monde</div>
                          <div className="text-sm text-gray-600">{getTemplateDescription('le-monde')}</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="liberation">
                      <div className="flex items-center gap-2">
                        <Newspaper className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Libération</div>
                          <div className="text-sm text-gray-600">{getTemplateDescription('liberation')}</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Inclure les images</Label>
                  <Switch 
                    checked={options.includeImages}
                    onCheckedChange={(checked) => setOptions({...options, includeImages: checked})}
                  />
                </div>
                
                <div>
                  <Label>Générer un extrait</Label>
                  <Switch 
                    checked={options.includeExcerpt}
                    onCheckedChange={(checked) => setOptions({...options, includeExcerpt: checked})}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Qualité de génération</Label>
                <Select value={options.quality} onValueChange={(value) => setOptions({...options, quality: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">📄 Brouillon</SelectItem>
                    <SelectItem value="normal">📄 Normal</SelectItem>
                    <SelectItem value="high">📄 Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Aperçu et Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration & Aperçu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isProcessing && getProcessingInfo()}
              
              <div className="border rounded-lg p-4 bg-gray-50 max-h-40 overflow-y-auto">
                <h4 className="font-medium mb-2">Aperçu du Template</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Style sélectionné :</strong> {getTemplateDescription(options.template)}</p>
                  <p><strong>Qualité :</strong> {getQualityDescription(options.quality)}</p>
                  <p><strong>Options activées :</strong></p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>✅ Images : {options.includeImages ? 'Oui' : 'Non'}</li>
                    <li>✅ Extrait : {options.includeExcerpt ? 'Oui' : 'Non'}</li>
                    <li>✅ Qualité : {options.quality}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={generateVintagePDF} 
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span>Génération en cours...</span>
              </div>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Générer le PDF Vintage
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
