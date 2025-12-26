// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Article summarization AI agent.
 *
 * - generateArticleSummary - A function that generates a summary of an article.
 * - ArticleSummaryInput - The input type for the generateArticleSummary function.
 * - ArticleSummaryOutput - The return type for the generateArticleSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArticleSummaryInputSchema = z.object({
  articleContent: z
    .string()
    .describe('The content of the article to be summarized.'),
});
export type ArticleSummaryInput = z.infer<typeof ArticleSummaryInputSchema>;

const ArticleSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the article.'),
});
export type ArticleSummaryOutput = z.infer<typeof ArticleSummaryOutputSchema>;

export async function generateArticleSummary(
  input: ArticleSummaryInput
): Promise<ArticleSummaryOutput> {
  return generateArticleSummaryFlow(input);
}

const articleSummaryPrompt = ai.definePrompt({
  name: 'articleSummaryPrompt',
  input: {schema: ArticleSummaryInputSchema},
  output: {schema: ArticleSummaryOutputSchema},
  prompt: `Summarize the following article in a concise and informative way.\n\nArticle: {{{articleContent}}}`,
});

const generateArticleSummaryFlow = ai.defineFlow(
  {
    name: 'generateArticleSummaryFlow',
    inputSchema: ArticleSummaryInputSchema,
    outputSchema: ArticleSummaryOutputSchema,
  },
  async input => {
    const {output} = await articleSummaryPrompt(input);
    return output!;
  }
);
