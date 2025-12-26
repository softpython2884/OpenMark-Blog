'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Bold, Italic, Strikethrough, Code, Heading2, List, ListOrdered, Link as LinkIcon, Quote, AlertTriangle, Info, Zap, Flame } from 'lucide-react';
import { useCallback } from 'react';
import { CalloutExtension } from '@/lib/tiptap-callout-extension';

const TiptapToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="border border-input bg-transparent rounded-t-md p-1 flex flex-wrap items-center gap-1">
      <Button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="icon" title="Bold">
        <Bold className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="icon" title="Italic">
        <Italic className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} variant={editor.isActive('strike') ? 'secondary' : 'ghost'} size="icon" title="Strikethrough">
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={setLink} variant={editor.isActive('link') ? 'secondary' : 'ghost'} size="icon" title="Link">
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'} size="icon" title="Heading">
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" title="Bullet List">
        <List className="h-4 w-4" />
      </Button>
       <Button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" title="Ordered List">
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'} size="icon" title="Blockquote">
        <Quote className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'} size="icon" title="Code Block">
        <Code className="h-4 w-4" />
      </Button>
      <Separator />
      <Button type="button" onClick={() => editor.chain().focus().setCallout({ variant: 'note' }).run()} variant={editor.isActive('callout', { variant: 'note' }) ? 'secondary' : 'ghost'} size="icon" title="Note Callout">
        <Info className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().setCallout({ variant: 'tip' }).run()} variant={editor.isActive('callout', { variant: 'tip' }) ? 'secondary' : 'ghost'} size="icon" title="Tip Callout">
        <Zap className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().setCallout({ variant: 'warning' }).run()} variant={editor.isActive('callout', { variant: 'warning' }) ? 'secondary' : 'ghost'} size="icon" title="Warning Callout">
        <AlertTriangle className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().setCallout({ variant: 'danger' }).run()} variant={editor.isActive('callout', { variant: 'danger' }) ? 'secondary' : 'ghost'} size="icon" title="Danger Callout">
        <Flame className="h-4 w-4" />
      </Button>
    </div>
  );
};

const Separator = () => <div className="w-[1px] h-6 bg-border mx-2" />;


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
        Link.configure({
            openOnClick: false,
            autolink: true,
            HTMLAttributes: {
              class: 'text-primary underline',
            },
        }),
        CalloutExtension,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none p-4 min-h-[400px] border-x border-b border-input rounded-b-md',
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
