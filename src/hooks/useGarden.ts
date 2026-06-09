import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { SavedScan } from '../types';

export function useGarden(user: any) {
  const [gardenScans, setGardenScans] = useState<SavedScan[]>([]);
  const [isGardenLoading, setIsGardenLoading] = useState(true);
  const [gardenLoadError, setGardenLoadError] = useState(false);

  useEffect(() => {
    if (!user) {
      setGardenScans([]);
      setIsGardenLoading(false);
      return;
    }

    const q = query(
      collection(db, 'scans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeScans = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snap) => {
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as SavedScan[];
        setGardenScans(data);
        setIsGardenLoading(false);
        setGardenLoadError(false);
      },
      (error: any) => {
        if (error.message?.includes('Quota') || error.message?.includes('quota') || error.code === 'resource-exhausted') {
          console.warn('Quota exceeded for garden scans. Using local cache if available.');
          setIsGardenLoading(false);
        } else {
          console.error('Error listening to garden scans:', error);
          setGardenLoadError(true);
          setIsGardenLoading(false);
        }
      }
    );

    return () => unsubscribeScans();
  }, [user]);

  return { gardenScans, isGardenLoading, gardenLoadError };
}
