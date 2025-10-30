import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const generations = [
    { id: 1, name: 'Generation I', range: '1-151' },
    { id: 2, name: 'Generation II', range: '152-251' },
    { id: 3, name: 'Generation III', range: '252-386' },
    { id: 4, name: 'Generation IV', range: '387-493' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-8 md:py-12">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary-foreground tracking-tighter">
            Shiny<span className="text-accent text-shadow-accent">Hunt</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-2 max-w-2xl mx-auto">
            Select a generation to begin your shiny hunting journey.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 pb-8">
        <div className="flex justify-center gap-4 mb-8">
          <Button asChild size="lg" variant="secondary">
            <Link href="/generation/all">All Pokémon</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/stats">Stats Page</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/current-hunt">Current Hunts</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          {generations.map((gen) => (
            <Link
              key={gen.id}
              href={`/generation/${gen.id}`}
              className="group block p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors duration-300"
            >
              <h2 className="text-2xl font-headline font-bold text-primary-foreground group-hover:text-accent">
                {gen.name}
              </h2>
              <p className="text-muted-foreground">Pokémon #{gen.range}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
