'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState, useState, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { generateArticleSummary } from '@/ai/flows/article-summary-generation';
import { generateSuggestedTitles } from '@/ai/flows/ai-suggested-title';
import { suggestTags } from '@/ai/flows/ai-suggested-tags';
import { saveArticle } from '@/lib/actions';
import type { Article } from '@/lib/definitions';
import { Sparkles, Tags, Text, Info, Zap, AlertTriangle, Flame, Type, Heading1, Heading2, Heading3, Italic, Bold, Link, List, ListOrdered, Quote, Code, Minus, Image as ImageIcon, EyeOff, Milestone, HelpCircle, CheckCircle, Pilcrow, CaseUpper, CaseLower, Strikethrough, Code2, Superscript, Subscript, PictureInPicture } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArticleRenderer } from './article-renderer';

const ArticleFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  summary: z.string().optional(),
  imageUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  tags: z.string(),
  status: z.enum(['draft', 'published']),
});

type ArticleFormData = z.infer<typeof ArticleFormSchema>;

const SnippetButton = ({ onInsert, snippet, children, title }: { onInsert: (snippet: string) => void; snippet: string; children: React.ReactNode; title?: string }) => (
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={() => onInsert(snippet)}
    className="flex-shrink-0"
    title={title}
  >
    {children}
  </Button>
);

const SnippetToolbar = ({ onInsert }: { onInsert: (snippet: string) => void }) => {
  const callouts = [
    { variant: 'note', icon: Info, label: 'Note', snippet: `<div data-callout data-variant="note"><p>Note: Add your content here.</p></div>\n` },
    { variant: 'tip', icon: Zap, label: 'Tip', snippet: `<div data-callout data-variant="tip"><p>Tip: Add your content here.</p></div>\n` },
    { variant: 'success', icon: CheckCircle, label: 'Success', snippet: `<div data-callout data-variant="success"><p>Success: Add your content here.</p></div>\n` },
    { variant: 'warning', icon: AlertTriangle, label: 'Warning', snippet: `<div data-callout data-variant="warning"><p>Warning: Add your content here.</p></div>\n` },
    { variant: 'danger', icon: Flame, label: 'Danger', snippet: `<div data-callout data-variant="danger"><p>Danger: Add your content here.</p></div>\n` },
    { variant: 'question', icon: HelpCircle, label: 'Question', snippet: `<div data-callout data-variant="question"><p>Question: Add your content here.</p></div>\n` },
  ];

  const formatting = [
    { icon: Heading1, label: 'H1', snippet: '<h1>Heading 1</h1>' },
    { icon: Heading2, label: 'H2', snippet: '<h2>Heading 2</h2>' },
    { icon: Heading3, label: 'H3', snippet: '<h3>Heading 3</h3>' },
    { icon: Bold, label: 'Bold', snippet: '<strong>Bold Text</strong>' },
    { icon: Italic, label: 'Italic', snippet: '<em>Italic Text</em>' },
    { icon: Link, label: 'Link', snippet: '<a href="https://example.com">Link Text</a>' },
    { icon: Strikethrough, label: 'Strikethrough', title: 'Strikethrough', snippet: '<s>Strikethrough Text</s>' },
    { icon: Code2, label: 'Code', title: 'Inline Code', snippet: '<code class="font-code">Inline Code</code>' },
    { icon: Superscript, label: 'Superscript', title: 'Superscript', snippet: '<sup>Superscript</sup>' },
    { icon: Subscript, label: 'Subscript', title: 'Subscript', snippet: '<sub>Subscript</sub>' },
    { icon: Pilcrow, label: 'Overline', title: 'Overline', snippet: '<span class="overline">Overline Text</span>' },
  ];

  const elements = [
    { icon: List, label: 'List', snippet: '<ul>\n  <li>List item 1</li>\n  <li>List item 2</li>\n</ul>\n' },
    { icon: ListOrdered, label: 'Ordered List', snippet: '<ol>\n  <li>First item</li>\n  <li>Second item</li>\n</ol>\n' },
    { icon: Quote, label: 'Quote', snippet: '<blockquote>\n  <p>This is a blockquote.</p>\n</blockquote>\n' },
    { icon: Code, label: 'Code Block', snippet: '<pre><code class="font-code">// Your code here</code></pre>\n' },
    { icon: Minus, label: 'Separator', snippet: '<hr>\n' },
    { icon: ImageIcon, label: 'Image', snippet: '<img src="https://picsum.photos/seed/1/800/400" alt="Placeholder image" />\n' },
  ];
  
  const custom = [
    { icon: EyeOff, label: 'Spoiler', snippet: '<details>\n  <summary>Spoiler Title</summary>\n  <p>Hidden content revealed here.</p>\n</details>\n' },
    { icon: Milestone, label: 'Timeline', snippet: '<div data-timeline>\n  <div data-timeline-item>\n    <h4>Step 1</h4>\n    <p>Description for the first step.</p>\n  </div>\n  <div data-timeline-item>\n    <h4>Step 2</h4>\n    <p>Description for the second step.</p>\n  </div>\n</div>\n' },
  ];

  return (
    <div className="p-2 border rounded-md bg-muted/50 mb-2">
      <Tabs defaultValue="formatting">
        <TabsList className="grid w-full grid-cols-4 mb-2">
          <TabsTrigger value="formatting">Formatting</TabsTrigger>
          <TabsTrigger value="elements">Elements</TabsTrigger>
          <TabsTrigger value="callouts">Callouts</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        <TabsContent value="callouts" className="flex flex-wrap gap-2">
          {callouts.map(({ variant, icon: Icon, label, snippet }) => (
            <SnippetButton key={variant} onInsert={onInsert} snippet={snippet} title={label}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </SnippetButton>
          ))}
        </TabsContent>
        <TabsContent value="formatting" className="flex flex-wrap gap-2">
           {formatting.map(({ icon: Icon, label, snippet, title }) => (
            <SnippetButton key={label} onInsert={onInsert} snippet={snippet} title={title || label}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </SnippetButton>
          ))}
        </TabsContent>
        <TabsContent value="elements" className="flex flex-wrap gap-2">
            {elements.map(({ icon: Icon, label, snippet }) => (
            <SnippetButton key={label} onInsert={onInsert} snippet={snippet} title={label}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </SnippetButton>
          ))}
        </TabsContent>
         <TabsContent value="custom" className="flex flex-wrap gap-2">
            {custom.map(({ icon: Icon, label, snippet }) => (
            <SnippetButton key={label} onInsert={onInsert} snippet={snippet} title={label}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </SnippetButton>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};


export function EditorForm({ article }: { article: Article | null }) {
  const { toast } = useToast();
  const [initialState, formAction] = useActionState(saveArticle, null);
  const [isAiPending, startAiTransition] = useTransition();
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(ArticleFormSchema),
    defaultValues: {
      id: article?.id.toString(),
      title: article?.title || '',
      content: article?.content || '',
      summary: article?.summary || '',
      imageUrl: article?.imageUrl || '',
      tags: article?.tags.map(t => t.name).join(', ') || '',
      status: article?.status || 'draft',
    },
  });

  const contentValue = watch('content');
  const tagsValue = watch('tags');

  const handleGenerateSummary = () => {
    const content = watch('content');
    if (!content) return;
    startAiTransition(async () => {
      const result = await generateArticleSummary({ articleContent: content });
      setValue('summary', result.summary);
      toast({ title: 'AI Summary Generated!', description: 'The summary has been added to the summary field.' });
    });
  };

  const handleSuggestTitles = () => {
    const content = watch('content');
    if (!content) return;
    startAiTransition(async () => {
      const result = await generateSuggestedTitles({ articleContent: content });
      setSuggestedTitles(result.suggestedTitles);
    });
  };

  const handleSuggestTags = () => {
    const content = watch('content');
    if (!content) return;
    startAiTransition(async () => {
      const result = await suggestTags({ articleContent: content });
      const newTags = result.tags;
      const currentTags = watch('tags').split(',').map(t => t.trim()).filter(Boolean);
      const uniqueTags = [...new Set([...currentTags, ...newTags])];
      setValue('tags', uniqueTags.join(', '));
      toast({ title: 'AI Tags Suggested!', description: 'New tags have been added.' });
    });
  };

  const handleInsertSnippet = (snippet: string) => {
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      
      // Check if there is selected text
      if (start !== end) {
        const selectedText = text.substring(start, end);
        // Wrap selected text with the snippet, assuming the snippet is a simple tag like <strong>{selection}</strong>
        // This is a simplified implementation. For complex snippets, this logic needs to be smarter.
        const wrappedText = snippet.replace(/((?:<.*>))(.*?)((?:<\/.*>))/, `$1${selectedText}$3`);
        
        // A simple check if the replacement is valid for wrapping
        if (wrappedText !== snippet) {
             const newText = text.substring(0, start) + wrappedText + text.substring(end);
             setValue('content', newText, { shouldValidate: true });
             setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start, start + wrappedText.length);
             }, 0);
        } else {
             // Fallback for complex snippets or if wrapping fails: just insert
             const newText = text.substring(0, start) + snippet + text.substring(end);
            setValue('content', newText, { shouldValidate: true });
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + snippet.length, start + snippet.length);
            }, 0);
        }

      } else {
        // No text selected, just insert the snippet
        const newText = text.substring(0, start) + snippet + text.substring(end);
        setValue('content', newText, { shouldValidate: true });
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + snippet.length, start + snippet.length);
        }, 0);
      }
    }
  };

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" {...register('id')} />

      <div>
        <Label htmlFor="title" className="text-lg">Title</Label>
        <Input id="title" {...register('title')} className="mt-1 text-2xl h-12" />
        {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="imageUrl" className="text-lg">Image URL</Label>
        <div className="flex items-center gap-2 mt-1">
          <PictureInPicture className="h-5 w-5 text-muted-foreground" />
          <Input id="imageUrl" {...register('imageUrl')} placeholder="https://..." />
        </div>
        {errors.imageUrl && <p className="text-destructive text-sm mt-1">{errors.imageUrl.message}</p>}
      </div>
      
      <div>
        <Label htmlFor="content" className="text-lg">Content (HTML)</Label>
        <Tabs defaultValue="edit" className="w-full mt-1">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <SnippetToolbar onInsert={handleInsertSnippet} />
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  ref={contentTextareaRef}
                  placeholder="Write your article content here. You can use HTML tags."
                  className="min-h-[400px] font-mono text-sm"
                />
              )}
            />
          </TabsContent>
          <TabsContent value="preview" className="prose dark:prose-invert max-w-none p-4 border rounded-md min-h-[400px]">
            <ArticleRenderer content={contentValue} />
          </TabsContent>
        </Tabs>
        {errors.content && <p className="text-destructive text-sm mt-1">{errors.content.message}</p>}
      </div>

      <Separator />

      <div>
        <div className="flex justify-between items-center mb-2">
            <Label htmlFor="summary">AI-Generated Summary (TL;DR)</Label>
            <Button type="button" size="sm" variant="outline" onClick={handleGenerateSummary} disabled={isAiPending || !contentValue}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isAiPending ? 'Generating...' : 'Generate Summary'}
            </Button>
        </div>
        <Textarea id="summary" {...register('summary')} placeholder="A concise summary of your article..." />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
            <div className="flex justify-between items-center mb-2">
                <Label>AI-Suggested Titles</Label>
                <Button type="button" size="sm" variant="outline" onClick={handleSuggestTitles} disabled={isAiPending || !contentValue}>
                    <Text className="mr-2 h-4 w-4" />
                    {isAiPending ? 'Suggesting...' : 'Suggest Titles'}
                </Button>
            </div>
            {suggestedTitles.length > 0 && (
                <Card>
                    <CardContent className="p-4 space-y-2">
                        {suggestedTitles.map((title, index) => (
                            <div key={index} className="flex items-center justify-between gap-2">
                                <p className="text-sm">{title}</p>
                                <Button type="button" size="sm" variant="ghost" onClick={() => setValue('title', title)}>Use</Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>

        <div>
            <div className="flex justify-between items-center mb-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Button type="button" size="sm" variant="outline" onClick={handleSuggestTags} disabled={isAiPending || !contentValue}>
                    <Tags className="mr-2 h-4 w-4" />
                    {isAiPending ? 'Suggesting...' : 'Suggest Tags'}
                </Button>
            </div>
            <Input id="tags" {...register('tags')} />
            <div className="mt-2 flex flex-wrap gap-2">
                {tagsValue.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
            </div>
        </div>
      </div>

      <Separator />
      
      <div>
        <Label className="text-lg">Status</Label>
         <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex items-center gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="draft" id="draft" />
                <Label htmlFor="draft">Draft</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="published" id="published" />
                <Label htmlFor="published">Published</Label>
              </div>
            </RadioGroup>
          )}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting || isAiPending}>
            {isSubmitting ? 'Saving...' : 'Save Article'}
        </Button>
      </div>
      {initialState?.message && <p className="text-destructive">{initialState.message}</p>}
    </form>
  );
}

    
