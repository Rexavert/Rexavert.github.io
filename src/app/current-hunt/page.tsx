'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getPokemonList } from '@/lib/pokemon-api';
import type { Pokemon, Hunt } from '@/types';
import { useUser, useCollection, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { collection } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { PokemonSearch } from '@/components/pokemon-search';
import { HuntView } from '@/components/hunt-view';
import { Button } from '@/components/ui/button';
import { RecentSearches } from '@/components/recent-searches';
import { Home } from 'lucide-react';

const RECENT_POKEMON_KEY = 'shinyhunt-recent-pokemon';

export default function CurrentHuntPage() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [recentSelections, setRecentSelections] = useState<Pokemon[]>([]);

  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // Load recent selections from localStorage on initial render
  useEffect(() => {
    try {
      const storedRecents = localStorage.getItem(RECENT_POKEMON_KEY);
      if (storedRecents) {
        setRecentSelections(JSON.parse(storedRecents));
      }
    } catch (error) {
      console.error('Failed to parse recent selections from localStorage', error);
    }
  }, []);

  // Save recent selections to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_POKEMON_KEY, JSON.stringify(recentSelections));
    } catch (error) {
      console.error('Failed to save recent selections to localStorage', error);
    }
  }, [recentSelections]);

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);
  
  useEffect(() => {
    getPokemonList().then(pokemon => {
      setAllPokemon(pokemon);
      setIsLoading(false);
    });
  }, []);

  const userId = user?.uid;

  const huntsQuery = useMemoFirebase(
    () => (firestore && userId ? collection(firestore, 'users', userId, 'hunts') : null),
    [firestore, userId]
  );
  
  const { data: huntsData, isLoading: huntsLoading } = useCollection<Omit<Hunt, 'pokemonId'>>(huntsQuery);

  const hunts = useMemo(() => {
    if (!huntsData) return {};
    return huntsData.reduce((acc, hunt) => {
      const pokemonId = parseInt(hunt.id, 10);
      if (!isNaN(pokemonId)) {
        acc[pokemonId] = { ...hunt, pokemonId };
      }
      return acc;
    }, {} as Record<number, Hunt>);
  }, [huntsData]);

  const [huntsState, setHuntsState] = useState<Record<number, Hunt>>(hunts);

   useEffect(() => {
    setHuntsState(hunts);
  }, [hunts]);

  const handleHuntChange = (updatedHunt: Hunt) => {
    setHuntsState(prev => ({ ...prev, [updatedHunt.pokemonId]: updatedHunt }));
  };

  const handleSelectPokemon = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setRecentSelections(prev => {
      const newRecents = [pokemon, ...prev.filter(p => p.id !== pokemon.id)];
      return newRecents.slice(0, 5);
    });
  };

  const clearSelection = () => {
    setSelectedPokemon(null);
  };

  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading Pokémon data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-8 md:py-12">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary-foreground tracking-tighter">
                Manage <span className="text-accent text-shadow-accent">Hunts</span>
              </h1>
              <Button asChild variant="outline" size="icon">
                <Link href="/">
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Home</span>
                </Link>
              </Button>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground mt-2 max-w-2xl">
              {selectedPokemon 
                ? `Viewing hunt for ${selectedPokemon.name}`
                : 'Search for any Pokémon to view or update a hunt.'
              }
            </p>
          </div>
          <div className="w-full md:w-auto">
            <RecentSearches
                pokemonList={recentSelections}
                onSelectPokemon={handleSelectPokemon}
            />
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 pb-8 space-y-8">
        <main>
          {selectedPokemon ? (
            <div>
              <Button onClick={clearSelection} variant="outline" className="mb-4">
                Search for another Pokémon
              </Button>
              <HuntView
                pokemon={selectedPokemon}
                hunt={huntsState[selectedPokemon.id]}
                onHuntChange={handleHuntChange}
                userId={userId}
              />
            </div>
          ) : (
            <PokemonSearch allPokemon={allPokemon} onSelectPokemon={handleSelectPokemon} />
          )}
        </main>
      </div>
    </div>
  );
}
