'use client';

import { Block } from './BlockTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, X, ChevronDown, ChevronUp, Bold, Italic, Link, Strikethrough, Code, Superscript, Subscript } from 'lucide-react';
import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

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

  const contentEditor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const titleEditor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: `<p>${title}</p>`,
    onUpdate: ({ editor }) => {
      setTitle(editor.getText());
    },
    immediatelyRender: false,
  });

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
                <div className="border rounded-md p-2 bg-white">
                  <EditorContent 
                    editor={titleEditor}
                    placeholder="Cliquez pour révéler..."
                    className="min-h-[40px] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="spoilerContent">Contenu caché</Label>
                <div className="border-b pb-3 mb-3">
                  <div className="flex items-center gap-1 flex-wrap">
                    <Button
                      variant={contentEditor?.isActive('bold') ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => contentEditor?.chain().focus().toggleBold().run()}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={contentEditor?.isActive('italic') ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => contentEditor?.chain().focus().toggleItalic().run()}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={contentEditor?.isActive('strike') ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => contentEditor?.chain().focus().toggleStrike().run()}
                    >
                      <Strikethrough className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={contentEditor?.isActive('code') ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => contentEditor?.chain().focus().toggleCode().run()}
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={contentEditor?.isActive('superscript') ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => contentEditor?.chain().focus().toggleSuperscript().run()}
                      disabled={true}
                    >
                      <Superscript className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={contentEditor?.isActive('subscript') ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => contentEditor?.chain().focus().toggleSubscript().run()}
                      disabled={true}
                    >
                      <Subscript className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="border rounded-md p-3 bg-white min-h-[150px]">
                  <EditorContent 
                    editor={contentEditor}
                    placeholder="Le contenu qui sera révélé..."
                    className="focus:outline-none"
                  />
                </div>
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
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
