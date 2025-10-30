
import { PokemonGrid } from '@/components/pokemon-grid';
import { getPokemonList } from '@/lib/pokemon-api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  const generations = ['1', '2', '3', '4', 'all'];
  return generations.map((id) => ({
    id,
  }));
}

const generationNames: { [key: string]: string } = {
  '1': 'Generation I',
  '2': 'Generation II',
  '3': 'Generation III',
  '4': 'Generation IV',
  'all': 'All Pokémon',
};

export default async function GenerationPage({ params }: { params: { id: string } }) {
  const { id: generationId } = params;
  const isAllPokemon = generationId === 'all';
  const parsedId = parseInt(generationId, 10);

  if (!isAllPokemon && (isNaN(parsedId) || parsedId < 1 || parsedId > 4)) {
    notFound();
  }
  
  const pokemonList = await (isAllPokemon ? getPokemonList() : getPokemonList(parsedId));

  const generationName = generationNames[generationId];
  const generations = Array.from({ length: 4 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="p-2 bg-card border-b border-border">
        <div className="container mx-auto flex flex-col items-center justify-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {generations.map((gen) => (
              <Button
                key={gen}
                asChild
                variant={!isAllPokemon && gen === parsedId ? 'default' : 'ghost'}
                size="sm"
              >
                <Link href={`/generation/${gen}`}>Gen {gen}</Link>
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant={isAllPokemon ? 'default' : 'ghost'} size="sm">
              <Link href="/generation/all">All</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/stats">Stats</Link>
            </Button>
          </div>
        </div>
      </nav>
      <main>
        <header className="py-8 md:py-12">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary-foreground tracking-tighter">
              Shiny<span className="text-accent text-shadow-accent">Hunt</span>: {generationName}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-2 max-w-2xl mx-auto">
              Track encounters, calculate odds, and find your shiny in {generationName}.
            </p>
          </div>
        </header>
        <div className="container mx-auto px-4 pb-8">
          <PokemonGrid initialPokemon={pokemonList} />
        </div>
      </main>
    </div>
  );
}
