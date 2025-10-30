'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Pokemon, Hunt } from '@/types';
import { PokemonAccordionItem } from '@/components/pokemon-accordion-item';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPokemonList } from '@/lib/pokemon-api';
import { initializeFirebase } from '@/firebase/server-init';

// This function tells Next.js which dynamic pages to build at build time.
export async function generateStaticParams() {
  const generations = ['1', '2', '3', '4', 'all'];
  return generations.map((id) => ({
    id,
  }));
}

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
        console.log('Could not fetch hunts during static build (expected behavior for anonymous users).');
        return {};
    }
}

interface PokemonGridProps {
  initialPokemon: Pokemon[];
  initialHunts: Record<number, Hunt>;
}

function PokemonGrid({ initialPokemon, initialHunts }: PokemonGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('id-asc');
  
  const { user } = useUser();
  const userId = user?.uid;
  const firestore = useFirestore();

  const huntsQuery = useMemoFirebase(
    () => (firestore && userId ? collection(firestore, 'users', userId, 'hunts') : null),
    [firestore, userId]
  );
  
  const { data: huntsData } = useCollection<Omit<Hunt, 'pokemonId'>>(huntsQuery);

  const liveHunts = useMemo(() => {
    if (!huntsData) return {};
    return huntsData.reduce((acc, hunt) => {
      const pokemonId = parseInt(hunt.id, 10);
      if (!isNaN(pokemonId)) {
        acc[pokemonId] = { ...hunt, pokemonId };
      }
      return acc;
    }, {} as Record<number, Hunt>);
  }, [huntsData]);

  const [huntsState, setHuntsState] = useState<Record<number, Hunt>>(initialHunts);

  useEffect(() => {
    // When the user logs in and live hunts are loaded, merge them with the initial static data
    if(userId && huntsData) {
      setHuntsState(prev => ({...prev, ...liveHunts}));
    }
  }, [userId, huntsData, liveHunts]);


  const handleHuntChange = (updatedHunt: Hunt) => {
    setHuntsState(prev => ({ ...prev, [updatedHunt.pokemonId]: updatedHunt }));
  };

  const filteredAndSortedPokemon = useMemo(() => {
    const pokemonWithHunts = initialPokemon.map(p => ({
      ...p,
      encounters: huntsState[p.id]?.encounters || 0,
    }));
    
    let filtered = pokemonWithHunts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [key, direction] = sortOption.split('-');

    filtered.sort((a, b) => {
      let valA, valB;
      if (key === 'encounters') {
        valA = a.encounters;
        valB = b.encounters;
      } else if (key === 'name') {
        valA = a.name;
        valB = b.name;
      } else { // id
        valA = a.id;
        valB = b.id;
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchTerm, sortOption, initialPokemon, huntsState]);

  const GROUP_SIZE = 30;
  const pokemonGroups = useMemo(() => {
    if (searchTerm) {
        return [{
            title: 'Search Results',
            pokemon: filteredAndSortedPokemon
        }];
    }

    const groups = [];
    for (let i = 0; i < filteredAndSortedPokemon.length; i += GROUP_SIZE) {
      const group = filteredAndSortedPokemon.slice(i, i + GROUP_SIZE);
      const startId = group[0]?.id;
      const endId = group[group.length -1]?.id;
      groups.push({
        title: `Box #${groups.length + 1} (${startId}-${endId})`,
        pokemon: group
      });
    }
    return groups;
  }, [filteredAndSortedPokemon, searchTerm]);
  
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          type="text"
          placeholder="Search Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:max-w-xs bg-card"
        />
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-full md:w-[200px] bg-card">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id-asc">Dex # (Asc)</SelectItem>
            <SelectItem value="id-desc">Dex # (Desc)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="encounters-desc">Encounters (High-Low)</SelectItem>
            <SelectItem value="encounters-asc">Encounters (Low-High)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filteredAndSortedPokemon.length > 0 ? (
        <Accordion type="multiple" className="space-y-4" defaultValue={pokemonGroups.map(g => g.title)}>
          {pokemonGroups.map((group) => (
            <AccordionItem key={group.title} value={group.title} className="bg-card border-border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-6 py-4 text-lg font-headline hover:no-underline">
                  {group.title}
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                    <Accordion type="single" collapsible className="w-full flex flex-wrap gap-2 items-start">
                        {group.pokemon.map((pokemon) => (
                            <PokemonAccordionItem
                                key={pokemon.id}
                                pokemon={pokemon}
                                hunt={huntsState[pokemon.id]}
                                onHuntChange={handleHuntChange}
                                userId={userId}
                            />
                        ))}
                    </Accordion>
                </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No Pokémon found.</p>
            <p>Try adjusting your search term.</p>
        </div>
      )}
    </div>
  );
}


const generationNames: { [key: string]: string } = {
  '1': 'Generation I',
  '2': 'Generation II',
  '3': 'Generation III',
  '4': 'Generation IV',
  'all': 'All Pokémon',
};

// The page is a Server Component, which can be async.
export default async function GenerationPage({ params }: { params: { id: string } }) {
  const { id: generationId } = params;
  const isAllPokemon = generationId === 'all';
  const parsedId = parseInt(generationId, 10);
  
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
                <Link href={`/generation/${gen}`}>{`Gen ${gen}`}</Link>
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
