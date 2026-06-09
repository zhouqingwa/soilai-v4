import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logOut } from '../firebase';
import type { UserProfile } from '../types';
import { OperationType } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMsg = error instanceof Error ? error.message : String(error);

  if (errorMsg.includes('Quota') || errorMsg.includes('resource-exhausted')) {
    console.warn(`Firestore Quota Exceeded on ${operationType} ${path}`);
    return;
  }

  console.error('Firestore Error: ', JSON.stringify({ error: errorMsg, operationType, path }));
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        await import('firebase/firestore').then(({ getDocFromServer }) =>
          getDocFromServer(doc(db, 'test', 'connection'))
        );
      } catch {
        // Silently ignore offline errors during connection test
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setUserProfile(data);
          } else {
            const newProfile: any = {
              email: currentUser.email,
              role: 'user',
              plantsScanned: 0,
              plantsSaved: 0,
              dailyScans: 0,
              lastScanDate: new Date().toISOString().split('T')[0],
              createdAt: serverTimestamp(),
            };
            if (currentUser.displayName) newProfile.name = currentUser.displayName;
            if (currentUser.photoURL) newProfile.photoUrl = currentUser.photoURL;

            try {
              await setDoc(userRef, newProfile);
              setUserProfile(newProfile);
            } catch (error: any) {
              if (error.message?.includes('offline')) {
                console.warn('Firestore is offline, profile creation deferred.');
              } else if (error.message?.includes('Quota limit exceeded')) {
                console.warn('Quota exceeded, defaulting to local profile...');
                setUserProfile(newProfile);
              } else {
                handleFirestoreError(error, OperationType.CREATE, `users/${currentUser.uid}`);
              }
            }
          }
        } catch (error: any) {
          if (error.message?.includes('offline')) {
            console.warn('Firestore is offline, profile fetch deferred.');
          } else if (error.message?.includes('Quota limit exceeded')) {
            console.warn('Quota exceeded, defaulting to fallback profile...');
            setUserProfile({
              email: currentUser.email || '',
              role: 'user',
              plantsScanned: 0,
              plantsSaved: 0,
              dailyScans: 0,
              lastScanDate: new Date().toISOString().split('T')[0],
              scanPoints: 0,
            });
          } else {
            handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          }
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return {
    user,
    userProfile,
    setUserProfile,
    signInWithGoogle,
    logOut,
  };
}
