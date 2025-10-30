
'use client';

import Image from 'next/image';
import { useCallback, useMemo, useEffect } from 'react';
import type { Pokemon, Hunt } from '@/types';
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

interface HuntViewProps {
  pokemon: Pokemon;
  hunt: Hunt | undefined;
  onHuntChange: (hunt: Hunt) => void;
  userId: string | undefined;
}

export function HuntView({ pokemon, hunt, onHuntChange, userId }: HuntViewProps) {
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

  const handleEncounterChange = useCallback((change: number) => {
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
  }, [userId, encounters, onHuntChange, hunt, pokemon.id, debouncedUpdateHunt]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent incrementing if an input or textarea is focused
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        handleEncounterChange(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleEncounterChange]);


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
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <div className="w-full md:w-1/3 flex flex-col items-center gap-4 p-4 bg-card-foreground/5 rounded-lg">
            <div className="bg-background/50 rounded-md p-2">
              <Image
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  width={160}
                  height={160}
                  unoptimized
                  className="aspect-square"
              />
            </div>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">#{pokemon.id.toString().padStart(4, '0')}</p>
                <p className="font-semibold text-foreground text-2xl">{pokemon.name}</p>
            </div>
            
            <p className="font-code text-6xl font-bold text-accent text-shadow-accent">{encounters}</p>
            
            <div className="flex items-center gap-2">
                <Button size="lg" variant="secondary" onClick={() => handleEncounterChange(-100)}>
                    -100
                </Button>
                <Button size="icon" variant="secondary" onClick={() => handleEncounterChange(-1)}>
                    <Minus className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" onClick={() => handleEncounterChange(1)}>
                    <Plus className="h-4 w-4" />
                </Button>
                  <Button size="lg" variant="secondary" onClick={() => handleEncounterChange(100)}>
                    +100
                </Button>
            </div>
             <p className="text-xs text-muted-foreground">Or press spacebar to add an encounter</p>
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
                    className="bg-background"
                />
            </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col gap-4">
            <ShinyHuntTools hunt={hunt} pokemonId={pokemon.id} onHuntChange={onHuntChange} userId={userId} />
            <div className="space-y-2 flex-grow flex flex-col">
                <Label htmlFor={`notes-${pokemon.id}`}>Hunt Notes</Label>
                <Textarea 
                    id={`notes-${pokemon.id}`}
                    placeholder="Log locations, strategies, or memorable moments..." 
                    value={notes}
                    onChange={handleNotesChange}
                    disabled={!userId}
                    className="bg-background flex-grow min-h-[200px]"
                />
            </div>
        </div>
      </div>
    </div>
  );
}
