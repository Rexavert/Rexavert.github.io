'use client';

import { useState, useMemo } from 'react';
import type { Hunt } from '@/types';
import { SHINY_METHODS, BASE_ODDS } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { updateHunt } from '@/lib/firebase';
import { debounce } from '@/lib/utils';
import { Separator } from './ui/separator';
import { useFirestore } from '@/firebase';

interface ShinyHuntToolsProps {
  pokemonId: number;
  hunt: Hunt | undefined;
  onHuntChange: (hunt: Hunt) => void;
  userId: string | undefined;
}

export function ShinyHuntTools({ pokemonId, hunt, onHuntChange, userId }: ShinyHuntToolsProps) {
  const firestore = useFirestore();
  const encounters = hunt?.encounters ?? 0;
  const methods = hunt?.methods ?? [];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateHunt = useMemo(
    () => debounce((newMethods: string[]) => {
      if (!userId || !firestore) return;
      updateHunt(firestore, userId, pokemonId, { methods: newMethods });
    }, 1000),
    [pokemonId, firestore, userId]
  );

  const handleMethodChange = (methodId: string, checked: boolean) => {
    if (!userId) return;
    const newMethods = checked
      ? [...methods, methodId]
      : methods.filter((id) => id !== methodId);
    
    onHuntChange({ pokemonId, encounters, methods: newMethods });
    debouncedUpdateHunt(newMethods);
  };
  
  const totalRolls = useMemo(() => {
    return 1 + methods.reduce((acc, methodId) => {
      const method = SHINY_METHODS.find(m => m.id === methodId);
      return acc + (method?.rolls || 0);
    }, 0);
  }, [methods]);

  const shinyRate = BASE_ODDS / totalRolls;
  const probability = 1 - Math.pow(1 - (1 / shinyRate), encounters);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-headline mb-2 text-md">Shiny Hunting Methods</h4>
        <div className="space-y-2">
          {SHINY_METHODS.map(method => (
            <div key={method.id} className="flex items-center space-x-2">
              <Checkbox
                id={`${pokemonId}-${method.id}`}
                checked={methods.includes(method.id)}
                onCheckedChange={(checked) => handleMethodChange(method.id, !!checked)}
                disabled={!userId}
              />
              <Label htmlFor={`${pokemonId}-${method.id}`} className="cursor-pointer text-sm">
                {method.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />

      <div className="space-y-2">
        <h4 className="font-headline text-md">Current Odds</h4>
        <div className="flex justify-between items-baseline font-code text-sm">
          <span className="text-muted-foreground">Rate:</span>
          <span className="text-lg font-bold text-accent">1 / {Math.round(shinyRate)}</span>
        </div>
        <div className="space-y-2 pt-1">
            <div className="flex justify-between items-baseline font-code text-sm">
                <span className="text-muted-foreground">Chance so far:</span>
                <span className="font-bold">{(probability * 100).toFixed(2)}%</span>
            </div>
            <Progress value={probability * 100} className="h-2 [&>div]:bg-accent" />
        </div>
      </div>
    </div>
  );
}
