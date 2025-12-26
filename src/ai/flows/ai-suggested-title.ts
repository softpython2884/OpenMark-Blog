'use server';
/**
 * @fileOverview Generates suggested titles for a blog article using AI.
 *
 * - generateSuggestedTitles - A function that generates title suggestions for an article.
 * - GenerateSuggestedTitlesInput - The input type for the generateSuggestedTitles function.
 * - GenerateSuggestedTitlesOutput - The return type for the generateSuggestedTitles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSuggestedTitlesInputSchema = z.object({
  articleContent: z
    .string()
    .describe('The full content of the article for which to generate titles.'),
});
export type GenerateSuggestedTitlesInput = z.infer<typeof GenerateSuggestedTitlesInputSchema>;

const GenerateSuggestedTitlesOutputSchema = z.object({
  suggestedTitles: z
    .array(z.string())
    .describe('An array of suggested SEO-optimized titles for the article.'),
});
export type GenerateSuggestedTitlesOutput = z.infer<typeof GenerateSuggestedTitlesOutputSchema>;

export async function generateSuggestedTitles(
  input: GenerateSuggestedTitlesInput
): Promise<GenerateSuggestedTitlesOutput> {
  return generateSuggestedTitlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSuggestedTitlesPrompt',
  input: {schema: GenerateSuggestedTitlesInputSchema},
  output: {schema: GenerateSuggestedTitlesOutputSchema},
  prompt: `You are an expert in creating engaging and SEO-optimized titles for blog articles.

  Based on the article content provided, generate 5 different title suggestions that are likely to attract readers and improve search engine visibility.

  Article Content: {{{articleContent}}}

  Ensure the titles are:
  - Concise and clear
  - Relevant to the article's main topic
  - Optimized for search engines (include relevant keywords)
  - Engaging and attention-grabbing

  Return the titles as an array of strings.
  `,
});

const generateSuggestedTitlesFlow = ai.defineFlow(
  {
    name: 'generateSuggestedTitlesFlow',
    inputSchema: GenerateSuggestedTitlesInputSchema,
    outputSchema: GenerateSuggestedTitlesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
