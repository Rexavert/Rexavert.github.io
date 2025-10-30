'use server';
/**
 * @fileOverview Explains how shiny hunting methods stack to affect shiny odds.
 *
 * - explainStackingShinyOdds - A function that explains how shiny hunting methods affect the odds.
 * - ExplainStackingShinyOddsInput - The input type for the explainStackingShinyOdds function.
 * - ExplainStackingShinyOddsOutput - The return type for the explainStackingShinyOdds function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainStackingShinyOddsInputSchema = z.object({
  methods: z
    .string()
    .describe("A comma separated list of shiny hunting methods the user is employing."),
});
export type ExplainStackingShinyOddsInput = z.infer<typeof ExplainStackingShinyOddsInputSchema>;

const ExplainStackingShinyOddsOutputSchema = z.object({
  explanation: z.string().describe('An explanation of how the selected methods stack.'),
});
export type ExplainStackingShinyOddsOutput = z.infer<typeof ExplainStackingShinyOddsOutputSchema>;

export async function explainStackingShinyOdds(
  input: ExplainStackingShinyOddsInput
): Promise<ExplainStackingShinyOddsOutput> {
  return explainStackingShinyOddsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainStackingShinyOddsPrompt',
  input: {schema: ExplainStackingShinyOddsInputSchema},
  output: {schema: ExplainStackingShinyOddsOutputSchema},
  prompt: `You are an expert Pokemon shiny hunter.

You will explain how the different shiny hunting methods stack and affect the odds of finding a shiny Pokemon.

Methods: {{{methods}}}`,
});

const explainStackingShinyOddsFlow = ai.defineFlow(
  {
    name: 'explainStackingShinyOddsFlow',
    inputSchema: ExplainStackingShinyOddsInputSchema,
    outputSchema: ExplainStackingShinyOddsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
