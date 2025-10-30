
import type { Pokemon } from '@/types';

interface PokeApiPokemon {
  name: string;
  url: string;
}

interface PokemonDetails {
  id: number;
  name:string;
  sprites: {
    other: {
      'official-artwork': {
        front_shiny: string;
      }
    }
  }
}

const generationOffsets: { [key: number]: { limit: number; offset: number } } = {
  1: { limit: 151, offset: 0 },
  2: { limit: 100, offset: 151 },
  3: { limit: 135, offset: 251 },
  4: { limit: 107, offset: 386 },
};

// This fetches all 493 pokemon from Gen 1-4
const ALL_POKEMON_LIMIT = 493;
const BATCH_SIZE = 50; // Process 50 requests at a time

export async function getPokemonList(generation?: number): Promise<Pokemon[]> {
  try {
    const { limit, offset } = generation ? generationOffsets[generation] : { limit: ALL_POKEMON_LIMIT, offset: 0 };
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Pokémon list');
    }
    const data: { results: PokeApiPokemon[] } = await response.json();

    const pokemonList: Pokemon[] = [];
    for (let i = 0; i < data.results.length; i += BATCH_SIZE) {
      const batch = data.results.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (p) => {
        try {
          const res = await fetch(p.url);
          if (!res.ok) {
            console.error(`Failed to fetch details for ${p.name}`);
            return null;
          }
          const details: PokemonDetails = await res.json();
          
          let spriteUrl = `https://img.pokemondb.net/sprites/diamond-pearl/shiny/${details.name}.png`;

          return {
            id: details.id,
            name: details.name.charAt(0).toUpperCase() + details.name.slice(1),
            sprite: spriteUrl,
          };
        } catch (e) {
          console.error(`Error processing ${p.name}`, e);
          return null;
        }
      });

      const processedBatch = await Promise.all(batchPromises);
      processedBatch.forEach(pokemon => {
        if (pokemon) {
          pokemonList.push(pokemon);
        }
      });
    }

    // sort by id
    pokemonList.sort((a, b) => a.id - b.id);

    return pokemonList;
  } catch (error) {
    console.error("Failed to fetch Pokemon data. The PokeAPI might be down.", error);
    return [];
  }
}

