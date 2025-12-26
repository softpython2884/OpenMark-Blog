'use server';

/**
 * @fileOverview This file contains the Genkit flow for suggesting relevant tags for an article using AI.
 *
 * - `suggestTags`: A function that takes article content as input and returns a list of suggested tags.
 * - `SuggestTagsInput`: The input type for the `suggestTags` function, which includes the article content.
 * - `SuggestTagsOutput`: The output type for the `suggestTags` function, which is a list of suggested tags.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsInputSchema = z.object({
  articleContent: z
    .string()
    .describe('The content of the article for which tags are to be suggested.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestTagsOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('An array of suggested tags for the article content.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const suggestTagsPrompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {schema: SuggestTagsInputSchema},
  output: {schema: SuggestTagsOutputSchema},
  prompt: `You are an expert in SEO and content tagging. Given the following article content, suggest a list of relevant tags that would improve the article's SEO and discoverability.\n\nArticle Content: {{{articleContent}}}\n\nTags:`,
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async input => {
    const {output} = await suggestTagsPrompt(input);
    return output!;
  }
);
