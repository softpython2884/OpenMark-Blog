'use client';

import { Block } from './BlockTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface SpoilerBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

export function SpoilerBlock({ block, onUpdate, onDelete }: SpoilerBlockProps) {
  const [isEditing, setIsEditing] = useState(!block.content.title);
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState(block.content.title || 'Spoiler');
  const [content, setContent] = useState(block.content.content || '');

  const handleSave = () => {
    onUpdate({
      ...block,
      content: {
        ...block.content,
        title,
        content
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(block.content.title || 'Spoiler');
    setContent(block.content.content || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Spoiler</h3>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="spoilerTitle">Titre du spoiler</Label>
                <Input
                  id="spoilerTitle"
                  placeholder="Cliquez pour révéler..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="spoilerContent">Contenu caché</Label>
                <Textarea
                  id="spoilerContent"
                  placeholder="Le contenu qui sera révélé..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!title || !content}>
                Insérer le spoiler
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Spoiler</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Supprimer
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-white border-t">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Contenu révélé</span>
            </div>
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
