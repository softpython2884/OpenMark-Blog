'use client';

import { BLOCK_DEFINITIONS, BlockType, createBlock } from '../blocks/BlockTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Type, Heading1, Image, List, ListOrdered, Quote, Code, Minus, EyeOff, Clock } from 'lucide-react';

interface BlockPaletteProps {
  onAddBlock: (blockType: BlockType) => void;
}

const ICON_MAP = {
  Type,
  Heading1,
  Image,
  List,
  ListOrdered,
  Quote,
  Code,
  EyeOff,
  Clock,
  Minus,
};

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  return (
    <Card className="w-64 h-fit">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Ajouter un block</h3>
        <div className="space-y-2">
          {BLOCK_DEFINITIONS.map((definition) => {
            const Icon = ICON_MAP[definition.icon as keyof typeof ICON_MAP];
            return (
              <Button
                key={definition.type}
                variant="ghost"
                className="w-full justify-start h-auto p-3"
                onClick={() => onAddBlock(definition.type)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0">
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{definition.label}</div>
                    <div className="text-xs text-gray-500">{definition.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
