'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState } from 'react';
import ReactMarkdown from 'react-markdown';
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
import { Sparkles, Tags, Text, Eye, Code, Activity, AlarmClock, Album, Angry, Annoyed, Info, AlertTriangle, Zap, Flame } from 'lucide-react';
import { useState, useTransition } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const ArticleFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  summary: z.string().optional(),
  tags: z.string(),
  status: z.enum(['draft', 'published']),
});

type ArticleFormData = z.infer<typeof ArticleFormSchema>;

const admonitions = [
  { name: 'Note', icon: Info, variant: 'note' },
  { name: 'Tip', icon: Zap, variant: 'tip' },
  { name: 'Warning', icon: AlertTriangle, variant: 'warning' },
  { name: 'Danger', icon: Flame, variant: 'danger' },
  { name: 'Activity', icon: Activity, variant: 'note' },
  { name: 'Alarm', icon: AlarmClock, variant: 'note' },
  { name: 'Album', icon: Album, variant: 'note' },
  { name: 'Angry', icon: Angry, variant: 'warning' },
  { name: 'Annoyed', icon: Annoyed, variant: 'warning' },
];

export function EditorForm({ article }: { article: Article | null }) {
  const { toast } = useToast();
  const [initialState, formAction] = useActionState(saveArticle, null);
  const [isAiPending, startAiTransition] = useTransition();
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
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
  
  const insertAdmonition = (name: string, variant: string) => {
    const snippet = `\n<div data-callout="true" data-icon="${name.toLowerCase()}" data-variant="${variant}">\n\nYour content here...\n\n</div>\n`;
    setValue('content', watch('content') + snippet);
  };


  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" {...register('id')} />

      <div>
        <Label htmlFor="title" className="text-lg">Title</Label>
        <Input id="title" {...register('title')} className="mt-1 text-2xl h-12" />
        {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
      </div>
      
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">
            <Code className="mr-2 h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
            <Textarea 
                id="content" 
                {...register('content')} 
                className="mt-1 font-mono h-[500px] rounded-t-none" 
                placeholder="Write your article here. Use markdown for formatting."
            />
             {errors.content && <p className="text-destructive text-sm mt-1">{errors.content.message}</p>}
        </TabsContent>
        <TabsContent value="preview">
          <Card className="mt-1 h-[500px] overflow-auto rounded-t-none">
            <CardContent className="prose dark:prose-invert max-w-none p-4">
              <ReactMarkdown>{contentValue || "Start typing to see a preview..."}</ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
       <div>
        <Label className="text-lg">Admonitions</Label>
        <div className="flex flex-wrap items-center gap-2 mt-2">
         {admonitions.map(({name, icon: Icon, variant}) => (
          <Button key={name} type="button" variant="outline" size="sm" onClick={() => insertAdmonition(name, variant)}>
            <Icon className="mr-2 h-4 w-4" />
            {name}
          </Button>
        ))}
      </div>
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
