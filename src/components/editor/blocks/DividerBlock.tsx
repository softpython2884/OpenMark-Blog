'use client';

import { Block } from './BlockTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Minus } from 'lucide-react';
import { useState } from 'react';

interface DividerBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

export function DividerBlock({ block, onUpdate, onDelete }: DividerBlockProps) {
  const [isEditing, setIsEditing] = useState(!block.content);

  const handleSave = () => {
    onUpdate({
      ...block,
      content: {}
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Minus className="h-5 w-5" />
                Séparateur
              </h3>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="text-center py-8">
                <div className="border-t-2 border-gray-300 w-full"></div>
                <p className="text-sm text-gray-600 mt-2">
                  Ligne de séparation horizontale
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                Insérer le séparateur
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
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Minus className="h-4 w-4" />
          Séparateur
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Supprimer
          </Button>
        </div>
      </div>

      <div className="py-4">
        <hr className="border-gray-300" />
      </div>
    </div>
  );
}
