import { PokemonGrid } from '@/components/pokemon-grid';
import { getPokemonList } from '@/lib/pokemon-api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { initializeFirebase } from '@/firebase/server-init';
import type { Hunt } from '@/types';

// This function tells Next.js which dynamic pages to build at build time.
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

// This is the standard prop type for a dynamic page in the App Router.
interface GenerationPageProps {
  params: {
    id: string;
  };
}

// This is a server-only function to fetch data before rendering.
async function getHuntsForUser(userId: string) {
    if (!userId) return {};
    try {
        const { firestore } = initializeFirebase();
        const huntsSnapshot = await firestore.collection(`users/${userId}/hunts`).get();
        if (huntsSnapshot.empty) {
            return {};
        }
        const hunts: Record<number, Hunt> = {};
        huntsSnapshot.forEach(doc => {
            const pokemonId = parseInt(doc.id, 10);
            if (!isNaN(pokemonId)) {
                hunts[pokemonId] = { pokemonId, ...(doc.data() as Omit<Hunt, 'pokemonId'>) };
            }
        });
        return hunts;
    } catch (error) {
        // In a static build, we can't get user data, so we fail gracefully.
        // We log it for debugging during build, but return empty data.
        console.log('Could not fetch hunts during static build (expected behavior for anonymous users).');
        return {};
    }
}


// The page is now an async Server Component.
export default async function GenerationPage({ params }: GenerationPageProps) {
  const { id: generationId } = params;
  const isAllPokemon = generationId === 'all';
  const parsedId = parseInt(generationId, 10);

  // Validate the generation ID.
  if (!isAllPokemon && (isNaN(parsedId) || parsedId < 1 || parsedId > 4)) {
    notFound();
  }
  
  // Fetch all necessary data on the server during the build.
  // The anonymous user ID is a placeholder for the static build.
  const userId = 'anonymous_user_placeholder';
  const [pokemonList, hunts] = await Promise.all([
    isAllPokemon ? getPokemonList() : getPokemonList(parsedId),
    getHuntsForUser(userId)
  ]);


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
          <PokemonGrid 
            initialPokemon={pokemonList} 
            initialHunts={hunts} 
          />
        </div>
      </main>
    </div>
  );
}
