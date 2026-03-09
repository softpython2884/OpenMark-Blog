'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import { Block } from './BlockTypes';
import { Button } from '@/components/ui/button';
import { Bold, Italic } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HeadingBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

export function HeadingBlock({ block, onUpdate, onDelete }: HeadingBlockProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [level, setLevel] = useState(block.content.level || 1);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
    ],
    content: block.content.html || `<h${level}>Votre titre ici...</h${level}>`,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate({
        ...block,
        content: { ...block.content, html, level }
      });
    },
    immediatelyRender: false,
  });

  const handleLevelChange = (newLevel: number) => {
    setLevel(newLevel);
    if (editor) {
      const currentContent = editor.getText();
      editor.chain().focus().setContent(`<h${newLevel}>${currentContent}</h${newLevel}>`).run();
    }
    onUpdate({
      ...block,
      content: { ...block.content, level: newLevel }
    });
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Titre</h3>
        <div className="flex items-center gap-2">
          <Select value={level.toString()} onValueChange={(value) => handleLevelChange(parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1</SelectItem>
              <SelectItem value="2">H2</SelectItem>
              <SelectItem value="3">H3</SelectItem>
              <SelectItem value="4">H4</SelectItem>
              <SelectItem value="5">H5</SelectItem>
              <SelectItem value="6">H6</SelectItem>
            </SelectContent>
          </Select>
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
          <div className="flex items-center gap-1">
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
          </div>
        </div>
      )}

      <div className="min-h-[60px]">
        <EditorContent 
          editor={editor} 
          className={!isEditing ? 'pointer-events-none opacity-90' : ''}
        />
      </div>
    </div>
  );
}
