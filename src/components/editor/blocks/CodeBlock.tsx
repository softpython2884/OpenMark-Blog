'use client';

import { Block } from './BlockTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { X, Code, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 
  'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
  'scss', 'sass', 'sql', 'json', 'xml', 'yaml', 'markdown', 'bash',
  'powershell', 'dockerfile', 'nginx', 'apache', 'plaintext'
];

export function CodeBlock({ block, onUpdate, onDelete }: CodeBlockProps) {
  const [isEditing, setIsEditing] = useState(!block.content.code);
  const [code, setCode] = useState(block.content.code || '');
  const [language, setLanguage] = useState(block.content.language || 'javascript');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = () => {
    onUpdate({
      ...block,
      content: {
        ...block.content,
        code,
        language
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCode(block.content.code || '');
    setLanguage(block.content.language || 'javascript');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Code className="h-5 w-5" />
                Bloc de code
              </h3>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="language">Langage de programmation</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="codeContent">Code</Label>
                <Textarea
                  id="codeContent"
                  placeholder="// Votre code ici..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!code}>
                Insérer le code
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
          <Code className="h-4 w-4" />
          Bloc de code
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

      <div className="relative">
        <div className="flex items-center justify-between bg-gray-100 px-3 py-2 border-b">
          <span className="text-sm font-medium text-gray-700">
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <pre className="p-4 bg-gray-50 overflow-x-auto">
          <code className={`language-${language} text-sm`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
