'use client';

import Image from 'next/image';
import { useCallback, useMemo } from 'react';
import type { Pokemon, Hunt } from '@/types';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Minus, Plus, BookOpen } from 'lucide-react';
import { ShinyHuntTools } from './shiny-hunt-tools';
import { updateHunt } from '@/lib/firebase';
import { debounce } from '@/lib/utils';
import { SHINY_METHODS, BASE_ODDS } from '@/lib/constants';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PokemonAccordionItemProps {
  pokemon: Pokemon;
  hunt: Hunt | undefined;
  onHuntChange: (hunt: Hunt) => void;
  userId: string | undefined;
}

export function PokemonAccordionItem({ pokemon, hunt, onHuntChange, userId }: PokemonAccordionItemProps) {
  const firestore = useFirestore();
  const encounters = hunt?.encounters ?? 0;
  const methods = hunt?.methods ?? [];
  const notes = hunt?.notes ?? '';
  const location = hunt?.location ?? '';

  const debouncedUpdateHunt = useCallback(
    debounce((data: Partial<Hunt>) => {
      if (!firestore || !userId) return;
      updateHunt(firestore, userId, pokemon.id, data);
    }, 1000),
    [pokemon.id, firestore, userId]
  );

  const handleEncounterChange = (change: number) => {
    if (!userId) return;
    const newEncounters = Math.max(0, encounters + change);
    onHuntChange({ 
      ...hunt,
      pokemonId: pokemon.id,
      encounters: newEncounters,
      methods: hunt?.methods || [],
      notes: hunt?.notes,
      location: hunt?.location
    });
    debouncedUpdateHunt({ encounters: newEncounters });
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!userId) return;
    const newNotes = e.target.value;
     onHuntChange({ 
      ...hunt,
      pokemonId: pokemon.id,
      encounters,
      methods,
      notes: newNotes,
      location,
    });
    debouncedUpdateHunt({ notes: newNotes });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) return;
    const newLocation = e.target.value;
    onHuntChange({
      ...hunt,
      pokemonId: pokemon.id,
      encounters,
      methods,
      notes,
      location: newLocation,
    });
    debouncedUpdateHunt({ location: newLocation });
  };

  const { probability } = useMemo(() => {
    const totalRolls = 1 + methods.reduce((acc, methodId) => {
      const method = SHINY_METHODS.find(m => m.id === methodId);
      return acc + (method?.rolls || 0);
    }, 0);
    const shinyRate = BASE_ODDS / totalRolls;
    const probability = 1 - Math.pow(1 - (1 / shinyRate), encounters);
    return { probability };
  }, [methods, encounters]);

  const serebiiUrl = `https://www.serebii.net/pokedex-dp/${pokemon.id.toString().padStart(3, '0')}.shtml`;
  
  return (
    <AccordionItem 
      value={`pokemon-${pokemon.id}`} 
      className="border-b-0 grow basis-full md:basis-[calc(20%-8px)] data-[state=open]:basis-full"
    >
        <AccordionTrigger className="hover:no-underline bg-card-foreground/5 p-2 rounded-md flex-col h-full justify-between gap-2 data-[state=open]:flex-row data-[state=open]:items-start">
            <div className="flex items-center gap-4 w-full">
                <div className="bg-background/50 rounded-md p-1 flex-shrink-0">
                    <Image
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        width={80}
                        height={80}
                        unoptimized
                        className="aspect-square"
                    />
                </div>
                <div className="flex-grow text-left">
                    <p className="text-xs text-muted-foreground">#{pokemon.id.toString().padStart(4, '0')}</p>
                    <p className="font-semibold text-foreground text-sm">{pokemon.name}</p>
                </div>
            </div>
             <div className="text-center pr-4 self-center data-[state=open]:hidden">
                <div className="flex items-baseline justify-center gap-1">
                    <p className="text-sm text-muted-foreground">Encounters:</p>
                    <p className="font-code text-lg font-bold text-accent text-shadow-accent">{encounters}</p>
                    <p className="font-code text-sm text-muted-foreground">({(probability * 100).toFixed(2)}%)</p>
                </div>
            </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-2 px-2">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3 flex flex-col items-center gap-4 p-4 bg-card-foreground/5 rounded-lg">
                    <p className="text-muted-foreground">Encounters</p>
                    <p className="font-code text-6xl font-bold text-accent text-shadow-accent">{encounters}</p>
                    <div className="flex items-center gap-2">
                        <Button size="icon" variant="secondary" onClick={() => handleEncounterChange(-100)}>
                            -100
                        </Button>
                        <Button size="icon" variant="secondary" onClick={() => handleEncounterChange(-1)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="secondary" onClick={() => handleEncounterChange(1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                         <Button size="icon" variant="secondary" onClick={() => handleEncounterChange(100)}>
                            +100
                        </Button>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                        <Link href={serebiiUrl} target="_blank">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Serebii
                        </Link>
                    </Button>
                    <div className="w-full space-y-2">
                        <Label htmlFor={`location-${pokemon.id}`}>Location:</Label>
                        <Input 
                            id={`location-${pokemon.id}`}
                            placeholder="Enter location"
                            value={location}
                            onChange={handleLocationChange}
                            disabled={!userId}
                            className="bg-background h-9"
                        />
                    </div>
                </div>
                <div className="w-full md:w-2/3 flex flex-col gap-4">
                    <ShinyHuntTools hunt={hunt} pokemonId={pokemon.id} onHuntChange={onHuntChange} userId={userId} />
                    <div className="space-y-2">
                        <Label htmlFor={`notes-${pokemon.id}`}>Hunt Notes</Label>
                        <Textarea 
                            id={`notes-${pokemon.id}`}
                            placeholder="Log locations, strategies, or memorable moments..." 
                            value={notes}
                            onChange={handleNotesChange}
                            disabled={!userId}
                            className="bg-background"
                        />
                    </div>
                </div>
            </div>
        </AccordionContent>
    </AccordionItem>
  );
}
