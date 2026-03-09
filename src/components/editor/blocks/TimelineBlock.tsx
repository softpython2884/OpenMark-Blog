'use client';

import { Block } from './BlockTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Clock, CheckCircle, Circle } from 'lucide-react';
import { useState } from 'react';

interface TimelineItem {
  id: string;
  title: string;
  content: string;
  completed?: boolean;
}

interface TimelineBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

export function TimelineBlock({ block, onUpdate, onDelete }: TimelineBlockProps) {
  const [isEditing, setIsEditing] = useState(!block.content.items);
  const [items, setItems] = useState<TimelineItem[]>(block.content.items || [
    { id: '1', title: 'Étape 1', content: 'Description de la première étape', completed: false },
    { id: '2', title: 'Étape 2', content: 'Description de la deuxième étape', completed: false }
  ]);

  const addItem = () => {
    const newItem: TimelineItem = {
      id: Date.now().toString(),
      title: `Étape ${items.length + 1}`,
      content: '',
      completed: false
    };
    setItems([...items, newItem]);
  };

  const updateItem = (itemId: string, field: keyof TimelineItem, value: any) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleSave = () => {
    const validItems = items.filter(item => item.title && item.content);
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
    setItems(block.content.items || []);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Timeline</h3>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Étape {index + 1}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`title-${item.id}`}>Titre</Label>
                      <Input
                        id={`title-${item.id}`}
                        placeholder="Titre de l'étape"
                        value={item.title}
                        onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`content-${item.id}`}>Description</Label>
                      <Textarea
                        id={`content-${item.id}`}
                        placeholder="Description détaillée de l'étape"
                        value={item.content}
                        onChange={(e) => updateItem(item.id, 'content', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`completed-${item.id}`}
                        checked={item.completed || false}
                        onChange={(e) => updateItem(item.id, 'completed', e.target.checked)}
                      />
                      <Label htmlFor={`completed-${item.id}`} className="text-sm">
                        Étape complétée
                      </Label>
                    </div>
                  </div>
                </div>
              ))}

              <Button 
                variant="outline" 
                onClick={addItem}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une étape
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={items.some(item => !item.title || !item.content)}>
                Insérer la timeline
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
        <h3 className="text-sm font-medium text-gray-700">Timeline</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Supprimer
          </Button>
        </div>
      </div>

      <div className="relative">
        {/* Ligne centrale */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className="relative flex items-start gap-4">
              {/* Cercle de l'étape */}
              <div className="relative z-10 flex-shrink-0">
                {item.completed ? (
                  <div className="w-12 h-12 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                    <Circle className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Contenu de l'étape */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                  <div className="text-gray-700 whitespace-pre-wrap">{item.content}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
