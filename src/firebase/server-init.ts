// IMPORTANT: This file is for server-side use only.
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This is a server-only file. It uses firebase-admin, which cannot be used on the client.
// We check if the service account key is available as an environment variable.
// This is the secure way to use Firebase Admin SDK in environments like App Hosting.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

function getAdminApp(): App {
  // If the app is already initialized, return it.
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // If the service account is available (in a server environment), initialize with it.
  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    });
  }

  // Fallback for local development or environments without the service account env var.
  // This might not have the permissions to do everything, but is useful for some build-time tasks.
  return initializeApp({ projectId: firebaseConfig.projectId });
}

export function initializeFirebase() {
  const app = getAdminApp();
  return {
    firestore: getFirestore(app),
    // You can add other admin services here if needed, like getAuth(app)
  };
}
