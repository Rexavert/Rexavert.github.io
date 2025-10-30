'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Hunt, Pokemon } from '@/types';
import { getPokemonList } from '@/lib/pokemon-api';
import { getGenerationFromId } from '@/lib/utils';
import { Trophy, Target, Sigma, BarChart2, Star, Sparkles } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export default function StatsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const userId = user?.uid;

  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  useEffect(() => {
    getPokemonList().then(setAllPokemon);
  }, []);

  const huntsQuery = useMemoFirebase(
    () => (firestore && userId ? collection(firestore, 'users', userId, 'hunts') : null),
    [firestore, userId]
  );
  const { data: huntsData, isLoading } = useCollection<Omit<Hunt, 'pokemonId'>>(huntsQuery);

  const pokemonMap = useMemo(() => {
    return allPokemon.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<number, Pokemon>);
  }, [allPokemon]);

  const stats = useMemo(() => {
    if (!huntsData || !allPokemon.length) {
      return {
        totalEncounters: 0,
        totalHunts: 0,
        averageEncounters: 0,
        topHunts: [],
        luckiestHunt: null,
        encountersByGen: [],
        huntsByGen: [],
      };
    }

    const totalEncounters = huntsData.reduce((acc, hunt) => acc + hunt.encounters, 0);
    const totalHunts = huntsData.length;
    const averageEncounters = totalHunts > 0 ? Math.round(totalEncounters / totalHunts) : 0;
    
    const sortedHunts = [...huntsData]
      .filter(hunt => pokemonMap[parseInt(hunt.id)])
      .sort((a, b) => b.encounters - a.encounters);

    const topHunts = sortedHunts.slice(0, 5).map(hunt => ({
        pokemon: pokemonMap[parseInt(hunt.id)],
        encounters: hunt.encounters,
    }));
    
    const luckiestHuntData = sortedHunts.length > 0 ? sortedHunts[sortedHunts.length-1] : null;
    const luckiestHunt = luckiestHuntData && pokemonMap[parseInt(luckiestHuntData.id)] ? {
        pokemon: pokemonMap[parseInt(luckiestHuntData.id)],
        encounters: luckiestHuntData.encounters,
    } : null;

    const encountersByGen: { name: string; encounters: number }[] = Array(4).fill(0).map((_, i) => ({
        name: `Gen ${i + 1}`,
        encounters: 0,
    }));

    const huntsByGen: { name: string; hunts: number }[] = Array(4).fill(0).map((_, i) => ({
        name: `Gen ${i + 1}`,
        hunts: 0,
    }));

    huntsData.forEach(hunt => {
      const pokemonId = parseInt(hunt.id);
      const generation = getGenerationFromId(pokemonId);
      if (generation >= 1 && generation <= 4) {
        encountersByGen[generation - 1].encounters += hunt.encounters;
        huntsByGen[generation - 1].hunts += 1;
      }
    });

    return { totalEncounters, totalHunts, averageEncounters, topHunts, luckiestHunt, encountersByGen, huntsByGen };

  }, [huntsData, allPokemon, pokemonMap]);

  if (isLoading || allPokemon.length === 0) {
    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <p>Loading stats...</p>
        </div>
    )
  }

  const generations = Array.from({ length: 4 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="p-2 bg-card border-b border-border">
        <div className="container mx-auto flex flex-col items-center justify-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
            {generations.map((gen) => (
                <Button key={gen} asChild variant="ghost" size="sm">
                <Link href={`/generation/${gen}`}>Gen {gen}</Link>
                </Button>
            ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild variant="secondary" size="sm">
                <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
                <Link href="/generation/all">All</Link>
            </Button>
            <Button asChild variant="default" size="sm">
                <Link href="/stats">Stats</Link>
            </Button>
            </div>
        </div>
        </nav>
      <header className="py-8 md:py-12">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary-foreground tracking-tighter">
            Shiny<span className="text-accent text-shadow-accent">Stats</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-2 max-w-2xl mx-auto">
            An overview of your shiny hunting journey.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 pb-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Encounters</CardTitle>
              <Sigma className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEncounters.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all your hunts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Hunts</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHunts}</div>
              <p className="text-xs text-muted-foreground">Pokémon you are currently hunting</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Encounters</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageEncounters.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Per shiny hunt</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Luckiest Hunt</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {stats.luckiestHunt ? (
                    <>
                        <div className="text-2xl font-bold">{stats.luckiestHunt.pokemon.name}</div>
                        <p className="text-xs text-muted-foreground">{stats.luckiestHunt.encounters.toLocaleString()} encounters</p>
                    </>
                ) : (
                    <div className="text-2xl font-bold">-</div>
                )}
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-accent"/>Top 5 Most Hunted</CardTitle>
                </CardHeader>
                <CardContent>
                   {stats.topHunts.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Pokémon</TableHead>
                                <TableHead className="text-right">Encounters</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.topHunts.map(({ pokemon, encounters }, index) => (
                                <TableRow key={pokemon.id}>
                                    <TableCell className="font-medium">#{index + 1}</TableCell>
                                    <TableCell>{pokemon.name}</TableCell>
                                    <TableCell className="text-right font-code">{encounters.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                   ) : (
                     <p className="text-muted-foreground text-sm">No hunts started yet.</p>
                   )}
                </CardContent>
            </Card>
            <div className="lg:col-span-3 grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Encounters by Generation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={stats.encountersByGen}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        color: "hsl(var(--card-foreground))"
                                    }}
                                    cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                                />
                                <Bar dataKey="encounters" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Hunts by Generation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={stats.huntsByGen}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        color: "hsl(var(--card-foreground))"
                                    }}
                                    cursor={{ fill: 'hsl(var(--primary) / 0.2)' }}
                                />
                                <Bar dataKey="hunts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
