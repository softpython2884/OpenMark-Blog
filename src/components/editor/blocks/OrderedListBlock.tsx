'use client';

import { Block } from './BlockTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, GripVertical, ListOrdered } from 'lucide-react';
import { useState } from 'react';

interface OrderedListBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

export function OrderedListBlock({ block, onUpdate, onDelete }: OrderedListBlockProps) {
  const [isEditing, setIsEditing] = useState(!block.content.items);
  const [items, setItems] = useState<string[]>(block.content.items || ['Premier élément', 'Deuxième élément']);

  const addItem = () => {
    setItems([...items, '']);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    const validItems = items.filter(item => item.trim());
    onUpdate({
      ...block,
      content: {
        ...block.content,
        items: validItems
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setItems(block.content.items || ['Premier élément', 'Deuxième élément']);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <ListOrdered className="h-5 w-5" />
                Liste numérotée
              </h3>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-6 text-center text-gray-500 font-medium">
                    {index + 1}.
                  </div>
                  <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <Input
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder={`Élément ${index + 1}`}
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button 
                variant="outline" 
                onClick={addItem}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un élément
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={items.every(item => !item.trim())}>
                Insérer la liste
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
          <ListOrdered className="h-4 w-4" />
          Liste numérotée
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

      <ol className="list-decimal list-inside space-y-2">
        {items.filter(item => item.trim()).map((item, index) => (
          <li key={index} className="text-gray-700">{item}</li>
        ))}
      </ol>
    </div>
  );
}
