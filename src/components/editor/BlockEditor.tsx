'use client';

import { useState, useCallback, useRef } from 'react';
import { Block, BlockType, createBlock } from './blocks/BlockTypes';
import { TextBlock } from './blocks/TextBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { SpoilerBlock } from './blocks/SpoilerBlock';
import { TimelineBlock } from './blocks/TimelineBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { CalloutBlock } from './blocks/CalloutBlock';
import { BlockPalette } from './sidebar/BlockPalette';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';

interface BlockEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

export function BlockEditor({ initialContent = '', onChange }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    // Si du contenu initial existe, essayer de le parser en blocks
    if (initialContent) {
      return [{
        id: 'initial-block',
        type: 'text',
        content: { html: initialContent }
      }];
    }
    return [];
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateContent = useCallback(() => {
    const html = blocks.map(block => {
      switch (block.type) {
        case 'text':
        case 'heading':
          return block.content.html || '';
        case 'image':
          return block.content.src 
            ? `<img src="${block.content.src}" alt="${block.content.alt || ''}" />${block.content.caption ? `<p><em>${block.content.caption}</em></p>` : ''}`
            : '';
        case 'spoiler':
          return block.content.title && block.content.content 
            ? `<details>
                <summary>${block.content.title}</summary>
                <div>${block.content.content.replace(/\n/g, '<br>')}</div>
              </details>`
            : '';
        case 'timeline':
          return block.content.items && block.content.items.length > 0
            ? `<div class="timeline">
                ${block.content.items.map((item: any) => `
                  <div class="timeline-item">
                    <div class="timeline-content">
                      <h4>${item.title}</h4>
                      <p>${item.content.replace(/\n/g, '<br>')}</p>
                    </div>
                  </div>
                `).join('')}
              </div>`
            : '';
        case 'video':
          return block.content.videoId
            ? `<iframe width="560" height="315" src="https://www.youtube.com/embed/${block.content.videoId}" title="${block.content.title || 'YouTube video player'}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
            : '';
        case 'callout':
          return block.content.content
            ? `<div data-callout data-variant="${block.content.variant || 'note'}">
                <div class="callout-content">
                  <strong>${block.content.variant === 'note' ? 'Note' : 
                             block.content.variant === 'tip' ? 'Astuce' :
                             block.content.variant === 'warning' ? 'Attention' :
                             block.content.variant === 'danger' ? 'Danger' :
                             block.content.variant === 'question' ? 'Question' :
                             block.content.variant === 'success' ? 'Succès' : 'Info'}:</strong>
                  <div>${block.content.content.replace(/\n/g, '<br>')}</div>
                </div>
              </div>`
            : '';
        default:
          return '';
      }
    }).join('\n');
    
    onChange(html);
  }, [blocks, onChange]);

  const updateBlock = useCallback((updatedBlock: Block) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === updatedBlock.id ? updatedBlock : block
      )
    );
    
    // Debounce pour éviter trop de mises à jour
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(updateContent, 500);
  }, [updateContent]);

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
    
    // Debounce pour éviter trop de mises à jour
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(updateContent, 500);
  }, [updateContent]);

  const addBlock = (blockType: BlockType) => {
    const newBlock = createBlock(blockType);
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
  };

  const renderBlock = (block: Block) => {
    const blockProps = {
      key: block.id,
      block,
      onUpdate: updateBlock,
      onDelete: () => deleteBlock(block.id),
    };

    switch (block.type) {
      case 'text':
        return <TextBlock {...blockProps} />;
      case 'heading':
        return <HeadingBlock {...blockProps} />;
      case 'image':
        return <ImageBlock {...blockProps} />;
      case 'spoiler':
        return <SpoilerBlock {...blockProps} />;
      case 'timeline':
        return <TimelineBlock {...blockProps} />;
      case 'video':
        return <VideoBlock {...blockProps} />;
      default:
        return (
          <Card key={block.id} className="border border-dashed">
            <CardContent className="p-4">
              <p className="text-gray-500">Block {block.type} non implémenté</p>
              <Button variant="ghost" size="sm" onClick={() => deleteBlock(block.id)}>
                Supprimer
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex gap-6">
      {/* Palette de blocks */}
      <div className="flex-shrink-0">
        <BlockPalette onAddBlock={addBlock} />
      </div>

      {/* Éditeur principal */}
      <div className="flex-1">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Contenu de l'article</h2>
          <p className="text-sm text-gray-600">
            Ajoutez des blocks pour construire votre article. Glissez-déposez les éléments pour les réorganiser.
          </p>
        </div>

        {blocks.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Commencez votre article
              </h3>
              <p className="text-gray-500 mb-4">
                Ajoutez votre premier block en choisissant un élément dans la palette à gauche
              </p>
              <Button onClick={() => addBlock('text')}>
                Ajouter un premier texte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div key={block.id}>
                {renderBlock(block)}
                {index < blocks.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
            
            {/* Bouton pour ajouter un block entre les éléments */}
            <div className="flex justify-center py-4">
              <Button 
                variant="outline" 
                onClick={() => addBlock('text')}
                className="border-2 border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un block
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
