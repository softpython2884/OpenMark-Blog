'use client';

import { Block } from './BlockTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { useState } from 'react';

interface ImageBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

export function ImageBlock({ block, onUpdate, onDelete }: ImageBlockProps) {
  const [isEditing, setIsEditing] = useState(!block.content.src);
  const [imageUrl, setImageUrl] = useState(block.content.src || '');
  const [alt, setAlt] = useState(block.content.alt || '');
  const [caption, setCaption] = useState(block.content.caption || '');

  const handleSave = () => {
    onUpdate({
      ...block,
      content: {
        ...block.content,
        src: imageUrl,
        alt,
        caption
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setImageUrl(block.content.src || '');
    setAlt(block.content.alt || '');
    setCaption(block.content.caption || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Image</h3>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="imageUrl">URL de l'image</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="alt">Texte alternatif (accessibilité)</Label>
                <Input
                  id="alt"
                  placeholder="Description de l'image pour les lecteurs d'écran"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="caption">Légende (optionnel)</Label>
                <Textarea
                  id="caption"
                  placeholder="Légende sous l'image"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!imageUrl}>
                Insérer l'image
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
        <h3 className="text-sm font-medium text-gray-700">Image</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Supprimer
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={alt}
              className="w-full h-auto rounded-md border"
              onError={(e) => {
                e.currentTarget.src = '';
                setIsEditing(true);
              }}
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {caption && (
          <p className="text-sm text-gray-600 italic text-center">{caption}</p>
        )}
      </div>
    </div>
  );
}
