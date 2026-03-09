'use client';

import { Block } from './BlockTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Quote } from 'lucide-react';
import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface BlockquoteBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

export function BlockquoteBlock({ block, onUpdate, onDelete }: BlockquoteBlockProps) {
  const [isEditing, setIsEditing] = useState(!block.content.content);
  const [content, setContent] = useState(block.content.content || '');
  const [author, setAuthor] = useState(block.content.author || '');

  const contentEditor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const handleSave = () => {
    onUpdate({
      ...block,
      content: {
        ...block.content,
        content,
        author
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(block.content.content || '');
    setAuthor(block.content.author || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Quote className="h-5 w-5" />
                Citation
              </h3>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="quoteContent">Texte de la citation</Label>
                <div className="border rounded-md p-3 bg-white min-h-[120px]">
                  <EditorContent 
                    editor={contentEditor}
                    placeholder="Votre citation ici..."
                    className="focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="quoteAuthor">Auteur (optionnel)</Label>
                <Input
                  id="quoteAuthor"
                  placeholder="Nom de l'auteur"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!content}>
                Insérer la citation
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
          <Quote className="h-4 w-4" />
          Citation
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

      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700">
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
        {author && (
          <footer className="mt-2 text-sm text-gray-600 not-italic">
            — {author}
          </footer>
        )}
      </blockquote>
    </div>
  );
}
