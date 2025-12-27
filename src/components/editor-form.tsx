'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState, useState, useTransition, useRef, useCallback, useEffect } from 'react';
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
import { Sparkles, Tags, Text, Info, Zap, AlertTriangle, Flame, Type, Heading1, Heading2, Heading3, Italic, Bold, Link as LinkIcon, List, ListOrdered, Quote, Code, Minus, Image as ImageIcon, EyeOff, Milestone, HelpCircle, CheckCircle, Pilcrow, CaseUpper, CaseLower, Strikethrough, Code2, Superscript, Subscript, PictureInPicture, Import, Youtube, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArticleRenderer } from './article-renderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Switch } from './ui/switch';

const ArticleFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  summary: z.string().optional(),
  imageUrl: z.string()
    .url('Please enter a valid URL.')
    .optional()
    .or(z.literal(''))
    .refine(url => !url || !url.includes('imgur.com') || url.includes('i.imgur.com'), {
        message: "Invalid Imgur link. Please use the direct image link (starting with i.imgur.com). Right-click the image on Imgur and select 'Copy Image Address'.",
    }),
  tags: z.string(),
  isPrivate: z.boolean().default(false),
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
    { icon: LinkIcon, label: 'Link', snippet: '<a href="https://example.com">Link Text</a>' },
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
    { icon: ImageIcon, label: 'Image', snippet: '<img src="https://i.imgur.com/your-image-id.png" alt="Description" />\n' },
    { icon: Youtube, label: 'YouTube', snippet: '<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n' },
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

function ImportDialog({ onImport, closeDialog }: { onImport: (content: string) => void, closeDialog: () => void }) {
    const [rawContent, setRawContent] = useState('');
    const { toast } = useToast();
    const [wasPastedAsRichText, setWasPastedAsRichText] = useState(false);

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        const clipboardData = event.clipboardData;
        const html = clipboardData.getData('text/html');
        const text = clipboardData.getData('text/plain');

        if (html) {
            toast({ title: 'Rich content detected!', description: 'Pasted HTML has been sanitized and loaded.' });
            const sanitizedHtml = DOMPurify.sanitize(html, {
                USE_PROFILES: { html: true },
                ADD_ATTR: ['data-variant', 'data-icon', 'data-callout', 'data-timeline', 'data-timeline-item', 'href', 'src', 'alt'],
                FORBID_ATTR: ['style', 'class'],
            });
            setRawContent(sanitizedHtml);
            setWasPastedAsRichText(true);
        } else {
            setRawContent(text);
            setWasPastedAsRichText(false);
        }
    };

    const handleConvert = () => {
        let processedContent = rawContent;

        // Always process custom callouts
        processedContent = processedContent.replace(/\[(NOTE|TIP|SUCCESS|WARNING|DANGER|QUESTION):([\s\S]*?)\]/gi, (match, variant, text) => {
            const lowerVariant = variant.toLowerCase();
            const innerHtml = marked.parse(text.trim());
            return `<div data-callout data-variant="${lowerVariant}">${innerHtml}</div>`;
        });
        
        // Convert from Markdown only if it wasn't rich text and doesn't look like HTML
        if (!wasPastedAsRichText && !rawContent.match(/<[a-z][\s\S]*>/i)) {
             processedContent = marked.parse(processedContent, { breaks: true, gfm: true });
        }

        onImport(processedContent);
        toast({ title: 'Content Imported!', description: 'The content has been converted to HTML.' });
        closeDialog();
    };

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Import from Clipboard or Text</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <p className="text-sm text-muted-foreground">
                    Paste your content below. You can paste rich text (from Google Docs, Word, etc.) or plain Markdown. The importer will automatically sanitize and convert it.
                </p>
                <Textarea
                    placeholder="Paste your content here..."
                    value={rawContent}
                    onPaste={handlePaste}
                    onChange={(e) => {
                        setRawContent(e.target.value);
                        setWasPastedAsRichText(false);
                    }}
                    className="min-h-[300px] font-mono"
                />
                <div className="text-sm p-4 bg-muted/80 rounded-md">
                    <h4 className="font-semibold mb-2">Tip: Use Custom Callout Syntax</h4>
                    <p>For plain text, you can create callouts using the format <code className="font-semibold">[VARIANT:Your text here]</code>.</p>
                    <p className="mt-1">Supported variants: <code className="font-semibold">NOTE, TIP, SUCCESS, WARNING, DANGER, QUESTION</code>.</p>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="button" onClick={handleConvert}>Convert and Import</Button>
            </DialogFooter>
        </DialogContent>
    );
}


export function EditorForm({ article }: { article: Article | null }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(saveArticle, null);
  const [isAiPending, startAiTransition] = useTransition();
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(ArticleFormSchema),
    defaultValues: {
      id: article?.id.toString(),
      title: article?.title || '',
      content: article?.content || '',
      summary: article?.summary || '',
      imageUrl: article?.imageUrl || '',
      tags: article?.tags.map(t => t.name).join(', ') || '',
      isPrivate: article?.visibility === 'private',
    },
  });

  const contentValue = watch('content');
  const tagsValue = watch('tags');

  useEffect(() => {
    // Log the state for debugging purposes.
    if (state) {
        console.log("Form state updated:", state);
    }
    if (state?.message) {
        toast({
            variant: state.errors ? 'destructive' : 'default',
            title: state.errors ? 'Error Saving Article' : 'Success!',
            description: state.message
        });
    }
  }, [state, toast]);

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
  
  const handleImport = useCallback((newContent: string) => {
    setValue('content', newContent, { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  const handleInsertSnippet = (snippet: string) => {
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      
      if (start !== end) {
        const selectedText = text.substring(start, end);
        const wrappedText = snippet.replace(/((?:<.*>))(.*?)((?:<\/.*>))/, `$1${selectedText}$3`);
        
        if (wrappedText !== snippet) {
             const newText = text.substring(0, start) + wrappedText + text.substring(end);
             setValue('content', newText, { shouldValidate: true });
             setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start, start + wrappedText.length);
             }, 0);
        } else {
             const newText = text.substring(0, start) + snippet + text.substring(end);
            setValue('content', newText, { shouldValidate: true });
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + snippet.length, start + snippet.length);
            }, 0);
        }

      } else {
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
        <p className="text-xs text-muted-foreground mt-1">
          Tip: For Imgur links, right-click the image and 'Copy Image Address' to get a direct link (starting with i.imgur.com).
        </p>
        {errors.imageUrl && <p className="text-destructive text-sm mt-1">{errors.imageUrl.message}</p>}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-1">
            <Label htmlFor="content" className="text-lg">Content (HTML)</Label>
            <Dialog open={isImportDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Import className="mr-2 h-4 w-4" />
                        Import Content
                    </Button>
                </DialogTrigger>
                <ImportDialog onImport={handleImport} closeDialog={() => setImportDialogOpen(false)} />
            </Dialog>
        </div>
        <Tabs defaultValue="edit" className="w-full">
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
                  placeholder="Write your article content here.&#10;This field supports full HTML. For best results with AI, ask for the output directly in HTML.&#10;You can also use custom callouts with the syntax [VARIANT:Your text here] when importing."
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
      
       <Controller
        control={control}
        name="isPrivate"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isPrivate" className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Private Article
              </Label>
              <p className="text-sm text-muted-foreground">
                If checked, this article will only be visible to you.
              </p>
            </div>
            <Switch
              id="isPrivate"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </div>
        )}
      />

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting || isAiPending}>
            {isSubmitting ? 'Saving...' : 'Save Article'}
        </Button>
      </div>
      {state?.message && !state.errors && <p className="text-green-600">{state.message}</p>}
    </form>
  );
}
    