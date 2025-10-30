'use server';

/**
 * @fileOverview Suggests shiny hunting methods based on the game provided.
 *
 * - suggestShinyHuntingMethods - A function that suggests shiny hunting methods.
 * - SuggestShinyHuntingMethodsInput - The input type for the suggestShinyHuntingMethods function.
 * - SuggestShinyHuntingMethodsOutput - The return type for the suggestShinyHuntingMethods function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestShinyHuntingMethodsInputSchema = z.object({
  game: z.string().describe('The name of the Pokemon game.'),
});
export type SuggestShinyHuntingMethodsInput = z.infer<typeof SuggestShinyHuntingMethodsInputSchema>;

const SuggestShinyHuntingMethodsOutputSchema = z.object({
  methods: z.string().describe('A summary of shiny hunting methods in the provided game.'),
});
export type SuggestShinyHuntingMethodsOutput = z.infer<typeof SuggestShinyHuntingMethodsOutputSchema>;

export async function suggestShinyHuntingMethods(input: SuggestShinyHuntingMethodsInput): Promise<SuggestShinyHuntingMethodsOutput> {
  return suggestShinyHuntingMethodsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestShinyHuntingMethodsPrompt',
  input: {schema: SuggestShinyHuntingMethodsInputSchema},
  output: {schema: SuggestShinyHuntingMethodsOutputSchema},
  prompt: `You are an expert Pokemon shiny hunter. Provide a summary of shiny hunting methods in the following game: {{{game}}}.`,
});

const suggestShinyHuntingMethodsFlow = ai.defineFlow(
  {
    name: 'suggestShinyHuntingMethodsFlow',
    inputSchema: SuggestShinyHuntingMethodsInputSchema,
    outputSchema: SuggestShinyHuntingMethodsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
