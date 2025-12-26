'use client';

import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CalloutExtension } from '@/lib/tiptap-callout-extension';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { Article } from '@/lib/definitions';

// We need a separate component to render the content to avoid hydration issues
// with the editor and the rendered output. This component will sanitize the HTML
// and render it safely.
export function ArticleRenderer({ content }: { content: Article['content']}) {
    const [sanitizedContent, setSanitizedContent] = useState('');

    useEffect(() => {
        // Sanitize the HTML on the client-side to prevent XSS attacks.
        // We allow data-* attributes to support our custom callouts.
        const clean = DOMPurify.sanitize(content, {
            ADD_ATTR: ['data-variant', 'data-icon'],
            ADD_TAGS: ['div'],
        });
        setSanitizedContent(clean);
    }, [content]);

    const editor = useEditor({
        editable: false,
        content: sanitizedContent,
        extensions: [
            StarterKit,
            CalloutExtension,
        ],
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none',
            },
        },
    });

    if (!editor) {
        return null;
    }

    // Using dangerouslySetInnerHTML is generally risky, but here it's safe
    // because we have sanitized the HTML with DOMPurify.
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}
