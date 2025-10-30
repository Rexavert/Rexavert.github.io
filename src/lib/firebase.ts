import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import type { Hunt } from '@/types';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export const getHunts = async (db: Firestore, userId: string): Promise<Hunt[]> => {
  if (!userId) return [];
  try {
    const huntsSnapshot = await getDocs(collection(db, `users/${userId}/hunts`));
    if (huntsSnapshot.empty) {
      return [];
    }
    return huntsSnapshot.docs.map(
      (doc) => ({ pokemonId: parseInt(doc.id), userId, ...doc.data() } as Hunt)
    );
  } catch (error) {
    console.error(
      'Error getting hunts server-side. This might be a security rule issue.',
      error
    );
    return [];
  }
};

export const updateHunt = (
  firestore: Firestore,
  userId: string,
  pokemonId: number,
  data: Partial<Omit<Hunt, 'pokemonId' | 'userId'>>
) => {
  if (!userId) return;
  const docRef = doc(firestore, `users/${userId}/hunts`, pokemonId.toString());
  setDocumentNonBlocking(docRef, data, { merge: true });
};
