'use client';

import type { Pokemon } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { History } from 'lucide-react';

interface RecentSearchesProps {
  pokemonList: Pokemon[];
  onSelectPokemon: (pokemon: Pokemon) => void;
}

export function RecentSearches({ pokemonList, onSelectPokemon }: RecentSearchesProps) {
  if (pokemonList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <History className="mr-2 h-5 w-5" />
            Recently Viewed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a Pokémon to start your session.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <History className="mr-2 h-5 w-5" />
          Recently Viewed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          {pokemonList.map(pokemon => (
            <button
              key={pokemon.id}
              onClick={() => onSelectPokemon(pokemon)}
              className="group relative flex-shrink-0"
            >
              <div className="bg-background/50 rounded-md p-2 border border-transparent group-hover:border-accent transition-colors">
                <Image
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  width={64}
                  height={64}
                  unoptimized
                  className="aspect-square"
                />
              </div>
              <div className="absolute bottom-0 w-full bg-black/50 text-white text-xs text-center p-0.5 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity">
                {pokemon.name}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
