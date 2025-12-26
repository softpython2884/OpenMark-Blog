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

const isValidYoutubeUrl = (url: string) => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname === 'www.youtube.com' && parsedUrl.pathname.startsWith('/embed/');
    } catch (e) {
        return false;
    }
};

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
        shouldProcessNode: (node: any) => node.name === 'iframe',
        processNode: (node: any, children: any, index: number) => {
            if (isValidYoutubeUrl(node.attribs.src)) {
                return (
                    <div key={index} className="aspect-video w-full my-6">
                        <iframe
                            {...node.attribs}
                            className="w-full h-full rounded-lg"
                        />
                    </div>
                )
            }
            return null; // Don't render invalid iframes
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
            ADD_TAGS: ['div', 'ul', 'ol', 'li', 'pre', 'code', 'blockquote', 'details', 'summary', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'a', 'hr', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'iframe'],
            ADD_ATTR: ['data-variant', 'data-icon', 'data-callout', 'data-timeline', 'data-timeline-item', 'href', 'src', 'alt', 'frameborder', 'allow', 'allowfullscreen', 'width', 'height'],
        });

        // Fix for hydration errors with tables by removing whitespace
        clean = clean.replace(/>\s+</g, '><');

        // We need to parse the HTML string and convert it to React components
        // to properly handle our custom Callout component and secure iframes.
        const reactElement = parser.parseWithInstructions(clean, () => true, processingInstructions);
        setRenderedContent(reactElement);

    }, [content]);

    // Using a div with a specific class to style the rendered content.
    return <div className="prose dark:prose-invert max-w-none">{renderedContent}</div>;
}
