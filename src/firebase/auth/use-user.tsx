'use client';
import { useContext } from 'react';
import {
  FirebaseContext,
  FirebaseContextState,
  UserHookResult,
} from '@/firebase/provider';

/**
 * Hook to access the user's authentication state.
 *
 * This hook provides a direct way to get the current user, loading state,
 * and any authentication errors without needing to call `useFirebase()` and
 * destructuring the result. It must be used within a `FirebaseProvider`.
 *
 * @returns {UserHookResult} An object containing the `user`, `isUserLoading`, and `userError`.
 */
export const useUser = (): UserHookResult => {
  const context = useContext<FirebaseContextState | undefined>(FirebaseContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }

  // Extracts and returns only the user-related state.
  const { user, isUserLoading, userError } = context;
  return { user, isUserLoading, userError };
};
