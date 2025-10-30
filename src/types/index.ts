export interface Pokemon {
  id: number;
  name: string;
  sprite: string;
}

export interface Hunt {
  pokemonId: number;
  encounters: number;
  methods: string[];
  notes?: string;
  location?: string;
}

export interface ShinyMethod {
  id: string;
  name: string;
  rolls: number;
  description: string;
}
