'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function HtmlEditor({ value, onChange, className }: HtmlEditorProps) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'blockquote', 'code-block'],
      ['clean']
    ],
  };

  return (
    <div className={cn("bg-card", className)}>
        <ReactQuill 
            theme="snow" 
            value={value} 
            onChange={onChange}
            modules={modules}
            className="h-full"
        />
    </div>
  );
}
