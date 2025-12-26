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
import { Sparkles, Tags, Text, Info, Zap, AlertTriangle, Flame } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArticleRenderer } from './article-renderer';

const ArticleFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  summary: z.string().optional(),
  tags: z.string(),
  status: z.enum(['draft', 'published']),
});

type ArticleFormData = z.infer<typeof ArticleFormSchema>;

const CalloutToolbar = ({ onInsert }: { onInsert: (snippet: string) => void }) => {
  const callouts = [
    { variant: 'note', icon: Info, label: 'Note' },
    { variant: 'tip', icon: Zap, label: 'Tip' },
    { variant: 'warning', icon: AlertTriangle, label: 'Warning' },
    { variant: 'danger', icon: Flame, label: 'Danger' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-md bg-muted/50">
      <p className="text-sm font-medium self-center mr-2">Insert Callout:</p>
      {callouts.map(({ variant, icon: Icon, label }) => (
        <Button
          key={variant}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onInsert(`<div data-callout data-variant="${variant}" data-icon="${variant}"><p>${label}: Add your content here.</p></div>\n`)}
        >
          <Icon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      ))}
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
      const newText = text.substring(0, start) + snippet + text.substring(end);
      setValue('content', newText, { shouldValidate: true });
      // We need to delay setting focus and selection to allow React to re-render
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + snippet.length, start + snippet.length);
      }, 0);
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
        <Label htmlFor="content" className="text-lg">Content (HTML)</Label>
        <Tabs defaultValue="edit" className="w-full mt-1">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <CalloutToolbar onInsert={handleInsertSnippet} />
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
