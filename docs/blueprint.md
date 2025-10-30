# **App Name**: ShinyHunt

## Core Features:

- Pokemon Data Fetch: Fetch data including name, dex number, and shiny sprite URLs from the Pokemon Home.
- Encounter Counter: Track and display the number of encounters for each Pokemon with increment/decrement functionality.
- Shiny Odds Calculator: Calculate and display the shiny odds based on the number of encounters and selected shiny hunting methods.
- Shiny Hunting Methods: Allow users to select and apply different shiny hunting methods (e.g., Masuda method) that will affect the shiny odds calculation. This tool also calculates whether it would be beneficial to the overall percentage rate if methods stack.
- National Dex List: A comprehensive list displaying all Pokemon with relevant tracking info, name, sprite and dex number
- Save Data: Persist the number of encounters for each Pokemon in Firestore. This allows to track multiple Pokemon on different hunts.

## Style Guidelines:

- Primary color: Deep purple (#6A459C), reminiscent of a dark night sky.
- Background color: Dark gray (#222222) for a dark theme.
- Accent color: Soft Lavender (#D0B8E3) for interactive elements and hints. Use neon purple (#BB86FC) for interactive elements, progress bars, and data visualizations.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text. Use a monospace font like 'Roboto Mono' for displaying numerical data and encounter counts.
- Use pixel-style icons to match the retro aesthetic of the Pokemon games. Icons should be simple and easily recognizable. Use sleek, minimalist icons with a futuristic, digital feel. Consider using icons that have a subtle glow effect.
- Use a grid layout to display Pokemon, with sortable columns for Dex number, name, and encounter count. Ensure responsiveness for different screen sizes. Implement a modular layout with clear separation of sections using subtle dividers and spacing. Incorporate data visualization elements (e.g., progress bars, charts) to display shiny odds and encounter progress.
- Implement smooth transitions when incrementing/decrementing encounter counts and when applying shiny hunting methods. Subtle animations enhance user experience. Use futuristic animations such as subtle particle effects or animated loading spinners. Animate data visualizations to provide real-time feedback.