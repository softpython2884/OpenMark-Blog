'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Block } from './BlockTypes';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Quote, Code, Link } from 'lucide-react';
import { useState } from 'react';

interface TextBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

export function TextBlock({ block, onUpdate, onDelete }: TextBlockProps) {
  const [isEditing, setIsEditing] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: block.content.html || '<p>Votre texte ici...</p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate({
        ...block,
        content: { ...block.content, html }
      });
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Texte</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Aperçu' : 'Éditer'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Supprimer
          </Button>
        </div>
      </div>

      {isEditing && (
        <div className="border-b pb-3 mb-3">
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('code') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="min-h-[100px]">
        <EditorContent 
          editor={editor} 
          className={!isEditing ? 'pointer-events-none opacity-90' : ''}
        />
      </div>
    </div>
  );
}
