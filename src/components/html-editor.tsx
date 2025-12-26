'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Bold, Italic, Strikethrough, Code, Heading2, List, ListOrdered } from 'lucide-react';

const TiptapToolbar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input bg-transparent rounded-t-md p-1 flex flex-wrap items-center gap-1">
      <Button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        size="icon"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        size="icon"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
        size="icon"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
        size="icon"
      >
        <Code className="h-4 w-4" />
      </Button>
       <Button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
        size="icon"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
        size="icon"
      >
        <List className="h-4 w-4" />
      </Button>
       <Button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
        size="icon"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
};


export function HtmlEditor({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
        StarterKit.configure({
            codeBlock: {
                HTMLAttributes: {
                    class: 'bg-muted text-muted-foreground rounded-md p-4 text-sm'
                }
            },
            blockquote: {
                HTMLAttributes: {
                    class: 'border-l-4 pl-4 italic'
                }
            }
        }),
        Placeholder.configure({
            placeholder: placeholder || 'Start writing...',
        }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none p-4 min-h-[400px] border border-input rounded-b-md',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className={cn('bg-card', className)}>
      <TiptapToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
