'use client';

import { useState, useMemo } from 'react';
import type { Pokemon } from '@/types';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface PokemonSearchProps {
  allPokemon: Pokemon[];
  onSelectPokemon: (pokemon: Pokemon) => void;
}

export function PokemonSearch({ allPokemon, onSelectPokemon }: PokemonSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return allPokemon
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 10); // Limit to 10 results for performance
  }, [searchTerm, allPokemon]);

  return (
    <div className="max-w-xl mx-auto">
      <Input
        type="text"
        placeholder="Search for a Pokémon..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-card text-lg p-6"
        autoFocus
      />
      {searchResults.length > 0 && (
        <div className="mt-2 bg-card border border-border rounded-lg shadow-lg">
          <ul className="divide-y divide-border">
            {searchResults.map(pokemon => (
              <li key={pokemon.id}>
                <button
                  onClick={() => onSelectPokemon(pokemon)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-card-foreground/5 transition-colors"
                >
                  <div className="bg-background/50 rounded-md p-1">
                    <Image
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      width={48}
                      height={48}
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-md">{pokemon.name}</p>
                    <p className="text-xs text-muted-foreground">#{pokemon.id.toString().padStart(4, '0')}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {searchTerm && searchResults.length === 0 && (
         <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No Pokémon found.</p>
            <p>Try adjusting your search term.</p>
        </div>
      )}
    </div>
  );
}
