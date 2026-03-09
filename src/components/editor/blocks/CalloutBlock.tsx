'use client';

import { Block } from './BlockTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { X, Info, Zap, AlertTriangle, Flame, HelpCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface CalloutBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

const CALLOUT_VARIANTS = [
  {
    value: 'note',
    label: 'Note',
    icon: Info,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600'
  },
  {
    value: 'tip',
    label: 'Astuce',
    icon: Zap,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600'
  },
  {
    value: 'warning',
    label: 'Attention',
    icon: AlertTriangle,
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  {
    value: 'danger',
    label: 'Danger',
    icon: Flame,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600'
  },
  {
    value: 'question',
    label: 'Question',
    icon: HelpCircle,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    iconColor: 'text-purple-600'
  },
  {
    value: 'success',
    label: 'Succès',
    icon: CheckCircle,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    iconColor: 'text-emerald-600'
  }
];

export function CalloutBlock({ block, onUpdate, onDelete }: CalloutBlockProps) {
  const [isEditing, setIsEditing] = useState(!block.content.variant);
  const [variant, setVariant] = useState(block.content.variant || 'note');
  const [content, setContent] = useState(block.content.content || '');

  const selectedVariant = CALLOUT_VARIANTS.find(v => v.value === variant) || CALLOUT_VARIANTS[0];
  const Icon = selectedVariant.icon;

  const handleSave = () => {
    onUpdate({
      ...block,
      content: {
        ...block.content,
        variant,
        content
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setVariant(block.content.variant || 'note');
    setContent(block.content.content || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Callout</h3>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="variant">Type de callout</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {CALLOUT_VARIANTS.map((v) => {
                    const VariantIcon = v.icon;
                    return (
                      <Button
                        key={v.value}
                        type="button"
                        variant={variant === v.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setVariant(v.value)}
                        className="justify-start"
                      >
                        <VariantIcon className="h-4 w-4 mr-2" />
                        {v.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="calloutContent">Contenu</Label>
                <Textarea
                  id="calloutContent"
                  placeholder="Votre message ici..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!content}>
                Insérer le callout
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
        <h3 className="text-sm font-medium text-gray-700">Callout</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Supprimer
          </Button>
        </div>
      </div>

      <div className={`border rounded-lg p-4 ${selectedVariant.bgColor} ${selectedVariant.borderColor}`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${selectedVariant.iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className={`flex-1 ${selectedVariant.textColor}`}>
            <div className="font-medium mb-1">{selectedVariant.label}</div>
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
