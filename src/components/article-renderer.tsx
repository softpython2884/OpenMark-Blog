'use client';

import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { Article } from '@/lib/definitions';
import { Callout } from './ui/callout';
import { Parser, ProcessNodeDefinitions } from 'html-to-react';
import React from 'react';

// We need a separate component to render the content to avoid hydration issues
// with the editor and the rendered output. This component will sanitize the HTML
// and render it safely.

const processNodeDefinitions = new ProcessNodeDefinitions(React);
const parser = new Parser();

const processingInstructions = [
    {
        shouldProcessNode: (node: any) => {
            return node.attribs && (node.attribs['data-callout'] !== undefined);
        },
        processNode: (node: any, children: any, index: number) => {
            const variant = node.attribs['data-variant'];
            const icon = node.attribs['data-icon'];
            return (
                 <Callout key={index} variant={variant} icon={icon}>
                    {children}
                </Callout>
            )
        }
    },
    {
        // Default processing
        shouldProcessNode: () => true,
        processNode: processNodeDefinitions.processDefaultNode
    }
];


export function ArticleRenderer({ content }: { content: Article['content']}) {
    const [renderedContent, setRenderedContent] = useState<React.ReactNode>(null);

    useEffect(() => {
        // Sanitize the HTML on the client-side to prevent XSS attacks.
        let clean = DOMPurify.sanitize(content, {
            ADD_TAGS: ['div', 'ul', 'ol', 'li', 'pre', 'code', 'blockquote', 'details', 'summary', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'a', 'hr', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
            ADD_ATTR: ['data-variant', 'data-icon', 'data-callout', 'data-timeline', 'data-timeline-item', 'href', 'src', 'alt'],
        });

        // Fix for hydration errors with tables by removing whitespace
        clean = clean.replace(/>\s+</g, '><');

        // We need to parse the HTML string and convert it to React components
        // to properly handle our custom Callout component.
        const reactElement = parser.parseWithInstructions(clean, () => true, processingInstructions);
        setRenderedContent(reactElement);

    }, [content]);

    // Using a div with a specific class to style the rendered content.
    return <div className="prose dark:prose-invert max-w-none">{renderedContent}</div>;
}
