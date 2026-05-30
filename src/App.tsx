/// <reference types="vite/client" />
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Camera, Flower, Image as ImageIcon, User, Loader2, Copy, Check, Menu, X, ArrowUpRight, Search, Book, ShoppingBag, ChevronDown, Droplets, Sun, Thermometer, Sprout, Skull, Share2, Crown, Leaf, ArrowLeft, MoreHorizontal, Zap, AlertTriangle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './components/Loader';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { DefaultPlantBackdrop } from './components/DefaultPlantBackdrop';
import { DiagnosisTitle } from './components/DiagnosisTitle';
import { RiskBadge } from './components/RiskBadge';
import { auth, db, signInWithGoogle, logOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, getDocs, query, orderBy, getDocFromServer, limit, onSnapshot, where } from 'firebase/firestore';

const LazyMarkdownResult = lazy(() => import('./components/MarkdownResult').then(module => ({ default: module.MarkdownResult })));
const JournalView = lazy(() => import('./components/JournalView'));
const HistoryView = lazy(() => import('./components/HistoryView'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const CareGuide = lazy(() => import('./components/CareGuide'));
const LimitModal = lazy(() => import('./components/modals/LimitModal').then(module => ({ default: module.LimitModal })));
const ProfileModal = lazy(() => import('./components/modals/ProfileModal').then(module => ({ default: module.ProfileModal })));
const PricingModal = lazy(() => import('./components/modals/PricingModal').then(module => ({ default: module.PricingModal })));
const PaywallModal = lazy(() => import('./components/modals/PaywallModal').then(module => ({ default: module.PaywallModal })));
const ShareModal = lazy(() => import('./components/modals/ShareModal').then(module => ({ default: module.ShareModal })));

const APP_SITE_URL = 'https://www.soilai.app';

const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Loader />
  </div>
);

const MarkdownResult = ({ content }: { content?: string }) => (
  <Suspense fallback={<span>{content || ''}</span>}>
    <LazyMarkdownResult content={content || ''} />
  </Suspense>
);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMsg = error instanceof Error ? error.message : String(error);

  if (errorMsg.includes('Quota') || errorMsg.includes('resource-exhausted')) {
    console.warn(`Firestore Quota Exceeded on ${operationType} ${path}`);
    return; // Swallow quota errors so they don't flood the UI or logs
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const LeafCluster = ({ transform, scale = 1 }: { transform: string, scale?: number }) => (
  <g transform={`${transform} scale(${scale})`}>
    <path d="M0,0 Q-15,-20 0,-40 Q15,-20 0,0 Z" fill="currentColor"/>
    <path d="M0,-10 Q-20,-15 -30,-30 Q-10,-35 0,-10 Z" fill="currentColor"/>
    <path d="M0,-5 Q20,-10 30,-25 Q10,-30 0,-5 Z" fill="currentColor"/>
    <path d="M-10,-20 Q-25,-30 -20,-45 Q-5,-40 -10,-20 Z" fill="currentColor"/>
    <path d="M10,-15 Q25,-25 20,-40 Q5,-35 10,-15 Z" fill="currentColor"/>
  </g>
);

import { compressImage, compressFile } from './utils/image';

// Replace this with your actual Amazon Associates Store ID (e.g., 'mywebsite-20')
const AMAZON_AFFILIATE_TAG = import.meta.env.VITE_AMAZON_AFFILIATE_TAG || 'YOUR_AMAZON_AFFILIATE_TAG';
const FREE_BASIC_DAILY_LIMIT = 1;

type AnalyzeMode = 'free-basic' | 'full-pro';

const postJson = async <T,>(url: string, body: unknown): Promise<T> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = await auth.currentUser?.getIdToken().catch(() => null);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error || `Request failed with status ${response.status}`);
    (error as any).status = response.status;
    (error as any).code = data?.code;
    throw error;
  }

  return data as T;
};

const getAnalysisErrorMessage = (error: unknown) => {
  const code = (error as any)?.code;
  if (code === 'ai_unavailable') {
    return 'The AI service is not reachable right now. Check the Gemini API relay settings, then try again.';
  }
  if (code === 'ai_config_missing' || code === 'ai_config_invalid') {
    return 'The AI service is not configured correctly yet. Add the Gemini API settings, restart the server, then try again.';
  }

  const rawMessage = error instanceof Error ? error.message : String(error || '');
  const message = rawMessage
    .replace(/\s+/g, ' ')
    .replace(/\.\.+/g, '.')
    .trim();

  if (!message) return 'The analysis could not be completed. Please try again.';
  return /please try again\.?$/i.test(message) ? message : `${message} Please try again.`;
};

import { trackEvent } from './lib/analytics';

export default function App() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState<any>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const previousPathnameRef = useRef(location.pathname);

  useEffect(() => {
    const isJournalInternalChange =
      location.pathname.startsWith('/journal') &&
      previousPathnameRef.current.startsWith('/journal');

    previousPathnameRef.current = location.pathname;

    // Scroll to top on route change, unless navigating within journal
    if (!isJournalInternalChange) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const [imageData, setImageData] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Putting on reading glasses...');
  const [isDragging, setIsDragging] = useState(false);
  const [navDragProgress, setNavDragProgress] = useState<number | null>(null);
  const [isNavTouching, setIsNavTouching] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const analyzeButtonRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const activeRequestRef = useRef<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [gardenScans, setGardenScans] = useState<any[]>([]);
  const [isGardenLoading, setIsGardenLoading] = useState(true);
  const [gardenLoadError, setGardenLoadError] = useState(false);
  const [pendingScan, setPendingScan] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isUnlockingPro, setIsUnlockingPro] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedScanId, setSavedScanId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [freeScansUsed, setFreeScansUsed] = useState(() => {
    const saved = localStorage.getItem('freeScansUsed');
    const lastScanDate = localStorage.getItem('lastScanDate');
    const today = new Date().toISOString().split('T')[0];
    if (lastScanDate !== today) {
      return 0;
    }
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPaidScanModal, setShowPaidScanModal] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        // Silently ignore offline errors during connection test
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    if (!user) {
      setGardenScans([]);
      setIsGardenLoading(false);
      return;
    }

    // Set up a real-time listener for the user's garden scans
    const q = query(
      collection(db, 'scans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeScans = onSnapshot(q, { includeMetadataChanges: true }, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGardenScans(data);
      setIsGardenLoading(false);
      setGardenLoadError(false);
    }, (error: any) => {
      if (error.message?.includes('Quota') || error.message?.includes('quota') || error.code === 'resource-exhausted') {
        console.warn("Quota exceeded for garden scans. Using local cache if available.");
        // Don't set fatal error right away for quota, let the local cache serve
        setIsGardenLoading(false);
        setGardenLoadError(prev => prev); // Leave as is, hopefully cache loaded
      } else {
        console.error("Error listening to garden scans:", error);
        setGardenLoadError(true);
        setIsGardenLoading(false);
      }
    });

    return () => unsubscribeScans();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserProfile(data);
          } else {
            const newProfile: any = {
              email: currentUser.email,
              role: 'user',
              plantsScanned: 0,
              plantsSaved: 0,
              dailyScans: 0,
              lastScanDate: new Date().toISOString().split('T')[0],
              createdAt: serverTimestamp()
            };
            if (currentUser.displayName) newProfile.name = currentUser.displayName;
            if (currentUser.photoURL) newProfile.photoUrl = currentUser.photoURL;

            try {
              await setDoc(userRef, newProfile);
              setUserProfile(newProfile);
            } catch (error: any) {
              if (error.message?.includes('offline')) {
                console.warn("Firestore is offline, profile creation deferred.");
              } else if (error.message?.includes('Quota limit exceeded')) {
                console.warn("Quota exceeded, defaulting to local profile...");
                setUserProfile(newProfile);
              } else {
                try {
                  handleFirestoreError(error, OperationType.CREATE, `users/${currentUser.uid}`);
                } catch(e) { console.error(e) }
              }
            }
          }
        } catch (error: any) {
          if (error.message?.includes('offline')) {
            console.warn("Firestore is offline, profile fetch deferred.");
          } else if (error.message?.includes('Quota limit exceeded')) {
             console.warn("Quota exceeded, defaulting to fallback profile...");
             setUserProfile({
               email: currentUser.email,
               role: 'user',
               plantsScanned: 0,
               plantsSaved: 0,
               dailyScans: 0,
               lastScanDate: new Date().toISOString().split('T')[0]
             });
          } else {
            try {
              handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
            } catch(e) { console.error(e) }
          }
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isProfileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isProfileOpen]);

  useEffect(() => {
    if (!isLoading) return;

    const messages = [
      "Putting on reading glasses...",
      "Evaluating your plant killer level...",
      "Consulting the plant obituary column...",
      "Judging your watering habits...",
      "Trying to find a pulse...",
      "Sighing heavily at this tragedy...",
      "Preparing a harsh reality check..."
    ];

    let currentIndex = Math.floor(Math.random() * messages.length);
    setLoadingMessage(messages[currentIndex]);

    const interval = setInterval(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * messages.length);
      } while (nextIndex === currentIndex);
      currentIndex = nextIndex;
      setLoadingMessage(messages[currentIndex]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if ((pendingScan || analysisError) && !isLoading && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [pendingScan, analysisError, isLoading]);

  const handleCopy = async () => {
    if (pendingScan) {
      let copyText = `Species: ${pendingScan.basic?.species || pendingScan.species || 'Unknown'}\nRisk Level: ${pendingScan.basic?.risk || pendingScan.risk || 'Unknown'}\n\n`;

      const summary = pendingScan.basic?.summary || pendingScan.summary;
      if (summary) copyText += `${summary}\n\n`;

      const mainIssue = pendingScan.basic?.mainIssue;
      if (mainIssue) copyText += `Main Issue: \n${mainIssue}\n\n`;

      const actionPlan = pendingScan.pro?.stepByStepPlan || pendingScan.basic?.actionPlan || pendingScan.actionPlan;
      if (actionPlan && actionPlan.length > 0) {
        copyText += `Action Plan:\n${actionPlan.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}\n\n`;
      }

      if (pendingScan.pro) {
        if (pendingScan.pro.deepDive) {
          copyText += `Botanical Deep Dive:\n${pendingScan.pro.deepDive}\n\n`;
        }
        if (pendingScan.pro.environmentalAdjustments) {
          copyText += `Environmental Adjustments:\n`;
          for (const [k, v] of Object.entries(pendingScan.pro.environmentalAdjustments)) {
            copyText += `- ${k}: ${v}\n`;
          }
          copyText += `\n`;
        }
      }

      const cleanText = copyText
        .replace(/\*\*/g, '') // Remove bold
        .replace(/\*/g, '')   // Remove italic
        .replace(/### /g, '') // Remove headers
        .replace(/## /g, '')
        .replace(/# /g, '');
      await navigator.clipboard.writeText(cleanText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const analyzeImage = async (base64Data: string, mimeType: string, mode: AnalyzeMode = 'free-basic') => {
    const today = new Date().toISOString().split('T')[0];
    const isFullProScan = mode === 'full-pro';

    if (isFullProScan) {
      if (!user) {
        setIsProfileOpen(true);
        return;
      }
      if ((userProfile?.scanPoints || 0) < 1) {
        setIsPaywallOpen(true);
        return;
      }
    } else if (user) {
      const currentDailyScans = userProfile?.lastScanDate === today ? (userProfile?.dailyScans || 0) : 0;
      const hasUnlimitedScans = userProfile?.role === 'admin' || userProfile?.role === 'premium';
      if (!hasUnlimitedScans && currentDailyScans >= FREE_BASIC_DAILY_LIMIT) {
        if ((userProfile?.scanPoints || 0) > 0) {
          setShowPaidScanModal(true);
        } else {
          setIsPaywallOpen(true);
        }
        return;
      }
    }

    if (!user && !isFullProScan) {
      const lastScanDate = localStorage.getItem('lastScanDate');
      if (lastScanDate === today && freeScansUsed >= FREE_BASIC_DAILY_LIMIT) {
        setShowLimitModal(true);
        return;
      }
      if (lastScanDate !== today) {
        setFreeScansUsed(0);
        localStorage.setItem('freeScansUsed', '0');
        localStorage.setItem('lastScanDate', today);
      }
    }

    const requestId = Date.now();
    activeRequestRef.current = requestId;

    setPendingScan(null);
    setAnalysisError(null);
    setIsLoading(true);
    try {
      trackEvent(isFullProScan ? 'paid_scan_attempt' : 'scan_attempt');
      const parsedResponse = await postJson('/api/analyze-plant', {
        base64Data,
        mimeType,
        userQuestion,
        ...(isFullProScan ? { mode: 'full-pro' } : {}),
      }) as any;

      if (activeRequestRef.current !== requestId) {
        console.log('Analysis cancelled by user');
        return;
      }

      setPendingScan(parsedResponse);
      setAnalysisError(null);
      setIsSaved(false);
      setSavedScanId(null);

      trackEvent(isFullProScan ? 'paid_scan_success' : 'scan_success', {
        species: parsedResponse.basic?.species || parsedResponse.species,
        problem: parsedResponse.basic?.mainIssue,
      });

      if (user) {
        setUserProfile((prev: any) => {
          if (!prev) return null;
          if (isFullProScan) {
            return {
              ...prev,
              scanPoints: Math.max(0, (prev.scanPoints || 0) - 1),
              plantsScanned: (prev.plantsScanned || 0) + 1,
            };
          }

          const currentDailyScans = prev.lastScanDate === today ? (prev.dailyScans || 0) : 0;
          return {
            ...prev,
            dailyScans: currentDailyScans + 1,
            lastScanDate: today,
            plantsScanned: (prev.plantsScanned || 0) + 1,
          };
        });
      } else {
        const newCount = freeScansUsed + 1;
        setFreeScansUsed(newCount);
        localStorage.setItem('freeScansUsed', newCount.toString());
        localStorage.setItem('lastScanDate', today);
      }
    } catch (error) {
      if (activeRequestRef.current !== requestId) return;
      console.error('Error analyzing plant:', error);
      if ((error as any)?.status === 429 && !user) {
        setShowLimitModal(true);
        return;
      }
      if ((error as any)?.status === 429 && user) {
        if ((userProfile?.scanPoints || 0) > 0) {
          setShowPaidScanModal(true);
        } else {
          setIsPaywallOpen(true);
        }
        return;
      }
      if ((error as any)?.status === 402) {
        setIsPaywallOpen(true);
        return;
      }
      if ((error as any)?.status === 401) {
        setIsProfileOpen(true);
        return;
      }
      setAnalysisError(getAnalysisErrorMessage(error));
    } finally {
      if (activeRequestRef.current === requestId) {
        setIsLoading(false);
        activeRequestRef.current = 0;
      }
    }
  };

  const handleUnlockPro = async () => {
    trackEvent('unlock_click');
    if (!imageData || !imageType || !pendingScan) return;
    if (pendingScan.pro) return;

    if (!user) {
      setIsProfileOpen(true);
      return;
    }

    if ((userProfile?.scanPoints || 0) < 1) {
      setIsPaywallOpen(true);
      return;
    }

    setIsUnlockingPro(true);
    try {
      const parsedResponse = await postJson('/api/analyze-plant', {
        base64Data: imageData,
        mimeType: imageType,
        userQuestion,
        mode: 'pro',
        basicSummary: pendingScan?.basic?.summary || pendingScan?.summary,
        resultId: savedScanId || undefined
      }) as any;

      setPendingScan({
        ...pendingScan,
        pro: parsedResponse.pro
      });

      // The server writes Pro content back to saved scans after point deduction.

      if (!parsedResponse?.billing?.alreadyUnlocked) {
        setUserProfile((prev: any) => prev ? { ...prev, scanPoints: Math.max(0, (prev.scanPoints || 0) - 1) } : null);
      }
    } catch (error) {
      console.error('Error unlocking pro plan:', error);
      if ((error as any)?.status === 402) {
        setIsPaywallOpen(true);
      } else if ((error as any)?.status === 401) {
        setIsProfileOpen(true);
      } else {
        alert('Failed to unlock Pro Plan. Please try again.');
      }
    } finally {
      setIsUnlockingPro(false);
    }
  };

  const cancelAnalysis = () => {
    activeRequestRef.current = 0;
    setIsLoading(false);
    setPendingScan(null);
    setAnalysisError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    e.target.value = '';
  };

  const openPhotoPicker = () => {
    if (isLoading) return;
    uploadInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    setAnalysisError(null);
    setPendingScan(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const compressedData = await compressFile(file, 1024, 1024, 0.85, 'image/jpeg');
      setImageData(compressedData);
      setImageType('image/jpeg');
    } catch (error) {
      console.error("Failed to compress image before analysis", error);
      // Fallback to reading the file directly if compression fails
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setImageData(base64Data);
      setImageType(file.type);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        await processFile(file);
      }
    }
  };

  const handleClearImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setImageData(null);
    setImageType(null);
    setPendingScan(null);
    setAnalysisError(null);
  };

  const handleSampleImageClick = async (imageUrl: string) => {
    setAnalysisError(null);
    setPendingScan(null);
    setPreviewUrl(imageUrl);
    setIsLoading(true);

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      try {
        const compressedData = await compressFile(blob, 1024, 1024, 0.85, 'image/jpeg');
        setImageData(compressedData);
        setImageType('image/jpeg');
      } catch (error) {
        console.error("Failed to compress sample image", error);
        // Fallback to reading the blob directly
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        setImageData(base64Data);
        setImageType(blob.type || 'image/jpeg');
      }
    } catch (error) {
      console.error('Error fetching sample image:', error);
      alert('Failed to load sample image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeClick = async () => {
    if (imageData && imageType) {
      await analyzeImage(imageData, imageType, 'free-basic');
    }
  };

  const handleConfirmPaidScan = async () => {
    setShowPaidScanModal(false);
    if (imageData && imageType) {
      await analyzeImage(imageData, imageType, 'full-pro');
    }
  };

  const getPrimaryAnalyzeLabel = () => {
    if (!previewUrl) return 'Waiting for photo...';
    if (!user) return 'Analyze Plant';

    const today = new Date().toISOString().split('T')[0];
    const currentDailyScans = userProfile?.lastScanDate === today ? (userProfile?.dailyScans || 0) : 0;
    const hasUnlimitedScans = userProfile?.role === 'admin' || userProfile?.role === 'premium';
    if (!hasUnlimitedScans && currentDailyScans >= FREE_BASIC_DAILY_LIMIT) {
      return (userProfile?.scanPoints || 0) > 0 ? 'Use 1 Scan Point' : 'Get Scan Points';
    }

    return 'Analyze Plant';
  };

  const handleSaveToGarden = async () => {
    trackEvent('save_to_garden');
    if (!user) {
      alert('Please log in to save to your garden.');
      return;
    }
    if (!pendingScan || isSaved || isSaving) return;

    setIsSaving(true);
    try {
      let finalImageData = imageData;
      let finalImageType = imageType;

      if (pendingScan.pro) {
        try {
          const illustration = await postJson('/api/generate-illustration', {
            species: (pendingScan.basic?.species || pendingScan.species) || 'a plant',
          }) as { imageData?: string | null; imageType?: string | null };

          if (illustration.imageData) {
            finalImageData = illustration.imageData;
            finalImageType = illustration.imageType || 'image/png';
          }
        } catch (imgError) {
          console.error("Failed to generate illustration, falling back to original image", imgError);
        }
      }

      const scanRef = doc(collection(db, 'scans'));
      const scanId = scanRef.id;

      let imageUrl = null;
      let originalImageUrl = null;
      let particleImageUrl = null;

      // Skip Cloud Storage and use base64 directly to avoid hangs/billing issues
      // We prioritize the AI illustration quality, but must compress to stay under Firestore's 1MB limit
      // Illustration: High quality (1024px, 0.8 quality) - usually ~150KB
      const compressedMain = finalImageData ? await compressImage(finalImageData, finalImageType || 'image/jpeg', 1024, 1024, 0.8, 'image/jpeg') : null;
      // Original Photo: Low quality to save space (600px, 0.3 quality) - usually ~40KB
      const compressedOriginal = imageData ? await compressImage(imageData, imageType || 'image/jpeg', 600, 600, 0.3, 'image/jpeg') : null;

      try {
        await setDoc(scanRef, {
          userId: user.uid,
          species: (pendingScan.basic?.species || pendingScan.species) || 'Unknown',
          coreName: (pendingScan.basic?.coreName || pendingScan.coreName) || null,
          risk: (pendingScan.basic?.risk || pendingScan.risk) || 'Unknown',
          summary: (pendingScan.basic?.summary || pendingScan.summary) || 'No summary provided.',
          killerTitle: (pendingScan.proPreview?.killerTitle || pendingScan.killerTitle) || null,

          // Store raw structural data for full history reproduction
          basic: pendingScan.basic || null,
          proPreview: pendingScan.proPreview || null,
          pro: pendingScan.pro || null,
          actionPlan: pendingScan.actionPlan || null, // legacy
          recommendedProducts: pendingScan.recommendedProducts || null, // legacy

          imageUrl: null,
          originalImageUrl: null,
          particleImageUrl: null,
          imageData: compressedMain,
          imageType: finalImageType || 'image/jpeg',
          originalImageData: compressedOriginal,
          originalImageType: 'image/jpeg',
          createdAt: serverTimestamp()
        });

        setSavedScanId(scanRef.id);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `scans/${scanRef.id}`);
      }

      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, {
          plantsSaved: increment(1)
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }

      setUserProfile((prev: any) => prev ? { ...prev, plantsSaved: (prev.plantsSaved || 0) + 1 } : null);
      setIsSaved(true);
    } catch (e) {
      console.error("Failed to save scan to Firebase", e);
      alert('Failed to save to your garden. Please try again. ' + (e instanceof Error ? e.message : ''));
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewInCareGuide = async () => {
    if (!(pendingScan?.basic?.species || pendingScan?.species)) return;

    setIsLoading(true);
    setLoadingMessage('Checking the archives...');

    try {
      const cleanName = (pendingScan.basic?.species || pendingScan.species).split('(')[0].trim();

      // Use query instead of fetching all plants
      const plantsQuery = query(collection(db, 'plants'), limit(100));
      const plantsSnap = await getDocs(plantsQuery);
      const plantsData = plantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

      const existingPlant = plantsData.find(p => p.name.toLowerCase() === cleanName.toLowerCase());

      if (existingPlant) {
        setIsLoading(false);
        navigate('/guide', { state: { targetPlantName: cleanName } });
        return;
      }

      if (userProfile?.role !== 'admin') {
        setIsLoading(false);
        alert('This plant is not in the care guide yet.');
        return;
      }

      // Plant doesn't exist, generate it
      setLoadingMessage('Writing new care guide...');

      // 1. Fetch image from Wikipedia
      let imageUrl = 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=800'; // Fallback
      try {
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cleanName)}&prop=pageimages&format=json&pithumbsize=800&origin=*`);
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].thumbnail) {
            imageUrl = pages[pageId].thumbnail.source;
          }
        }
      } catch (e) {
        console.error("Failed to fetch Wikipedia image", e);
      }

      // 2. Generate care details with Gemini
      const generatedData = await postJson('/api/generate-care-guide', {
        plantName: cleanName,
      }) as any;

      // 3. Save to Firestore
      const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      await setDoc(doc(collection(db, 'plants')), {
        name: cleanName,
        slug,
        difficulty: generatedData.difficulty || 'Medium',
        desc: generatedData.desc || 'A beautiful plant that requires attention.',
        bgColor: generatedData.bgColor || '#E8F3E8',
        textColor: generatedData.textColor || '#2D4A22',
        image: imageUrl,
        order: plantsData.length,
        createdAt: serverTimestamp()
      });

      setIsLoading(false);
      navigate('/guide', { state: { targetPlantName: cleanName } });

    } catch (error) {
      console.error("Error in handleViewInCareGuide", error);
      setIsLoading(false);
      alert("Failed to load or generate care guide. Please try again.");
    }
  };

  const renderCommonProblems = (extraClasses = '') => (
    <div className={`w-full max-w-2xl mx-auto mb-12 mt-12 ${extraClasses}`}>
      <h3 className="text-forest-deep font-bold text-[10px] uppercase tracking-[0.2em] mb-5 text-center">Common Problems</h3>
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { label: 'Yellowing leaves', route: '/journal#yellow-leaves' },
          { label: 'Brown spots', route: '/journal#brown-spots' },
          { label: 'Wilting', route: '/journal#drooping' },
          { label: 'Other', route: '/journal' }
        ].map((problem, i) => (
          <button
            key={i}
            onClick={() => {
              if (problem.route.includes('#')) {
                navigate('/journal');
                setTimeout(() => window.location.hash = problem.route.split('#')[1], 50);
              } else {
                navigate(problem.route);
              }
            }}
            className="flex items-center gap-2 px-6 py-2 rounded-full border border-forest-deep/15 text-forest-deep/90 text-sm hover:bg-white hover:border-forest-deep/30 hover:text-forest-deep transition-all cursor-pointer group bg-transparent"
          >
            {problem.label}
            <ArrowUpRight className="w-3.5 h-3.5 text-forest-deep/40 group-hover:text-forest-deep/80 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-earth-sand text-forest-deep font-sans antialiased flex flex-col">
      <Header
        user={user}
        userProfile={userProfile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setIsProfileOpen={setIsProfileOpen}
      />

      <MobileNav
        isOpen={isMobileMenuOpen}
        navRef={navRef}
        isNavTouching={isNavTouching}
        setIsNavTouching={setIsNavTouching}
        navDragProgress={navDragProgress}
        setNavDragProgress={setNavDragProgress}
        onNavigate={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.split('/')[1] || '/'}>
          <Route path="/" element={
            <motion.main
              key="analyze"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-1 flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto w-full py-12 pb-32"
            >
              <Helmet>
                <title>Soil AI - Plant Roast & Care</title>
                <meta name="description" content="Soil AI: Your AI-powered plant diagnosis & care guide. Identify sick plants, diagnose soil issues, and stop killing your plants with a side of brutal honesty." />
                <link rel="canonical" href={APP_SITE_URL} />
              </Helmet>
        <div className="mb-14 mt-4">
          <h1 className="text-forest-deep tracking-tight text-5xl md:text-6xl lg:text-[5.5rem] font-serif font-normal leading-tight mb-5">
            Stop guessing. <br />
            <span className="font-serif italic text-forest-deep text-5xl md:text-6xl lg:text-[6rem] tracking-tight block mt-1">Start diagnosing.</span>
          </h1>
          <p className="text-stone-muted/80 text-sm md:text-base font-normal tracking-wide max-w-sm mx-auto leading-relaxed">
            Expert diagnostics with a side of brutal honesty.
          </p>
        </div>

        {/* Central Visual */}
        <div className="relative w-full max-w-sm sm:max-w-md aspect-[9/19] md:aspect-[9/17] mb-12 group mx-auto mt-8">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-white/40 rounded-xl blur-3xl scale-95 opacity-50 group-hover:opacity-80 transition-opacity"></div>

          {/* Image Container */}
          <div onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={isLoading ? -1 : 0}
            onClick={openPhotoPicker}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openPhotoPicker();
              }
            }}
            className={`relative block w-full h-full bg-white/40 rounded-2xl overflow-hidden border border-forest-deep/10 shadow-sm cursor-pointer group transition-all duration-300 ${isLoading ? 'pointer-events-none' : 'hover:border-forest-deep/20'} ${isDragging ? 'ring-1 ring-forest-deep scale-[1.01]' : ''}`}
          >
            <input
              ref={uploadInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />

            {previewUrl && !isLoading && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleClearImage(e);
                }}
                className="absolute top-4 right-4 z-[60] w-8 h-8 bg-white/90 hover:bg-white text-forest-deep rounded-full flex items-center justify-center shadow-md transition-colors border border-forest-deep/10"
                aria-label="Clear image"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Uploaded plant"
                className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'scale-110 blur-md opacity-40' : 'group-hover:scale-105 opacity-95 group-hover:opacity-90'}`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`w-full h-full relative overflow-hidden bg-forest-deep/5 transition-all duration-700 pointer-events-none flex flex-col ${isLoading ? 'scale-110 blur-md opacity-40' : 'group-hover:scale-[1.02]'}`}>
                <DefaultPlantBackdrop />
              </div>
            )}

            {/* Upload Overlay */}
            {!previewUrl && !isLoading && (
              <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-300 px-6 pb-24 ${isDragging ? 'bg-forest-deep/20 backdrop-blur-sm' : 'bg-transparent opacity-100 group-hover:bg-forest-deep/5'}`}>
                <div className="w-16 h-16 rounded-full bg-white/95 border border-forest-deep/10 flex items-center justify-center mb-4 shadow-xl transform transition-transform duration-300 group-hover:scale-[1.05]">
                  <Camera className="w-7 h-7 text-forest-deep" strokeWidth={1.5} />
                </div>
                <span className="text-white font-bold tracking-[0.15em] text-xs uppercase drop-shadow-md px-6 text-center">
                  {isDragging ? 'Drop Image Here' : 'Photograph your victim'}
                </span>
                <span className="text-white/80 text-[10px] mt-2.5 font-medium tracking-widest uppercase hidden md:block drop-shadow-md">
                  or drag and drop here
                </span>
              </div>
            )}

            {/* Change Photo Overlay (when image is uploaded) */}
            {previewUrl && !isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-forest-deep/30 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 backdrop-blur-xs px-6">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-md transform transition-transform duration-300 scale-95 group-hover:scale-100">
                  <Camera className="w-5 h-5 text-forest-deep" strokeWidth={1.8} />
                </div>
                <span className="text-white font-bold tracking-[0.1em] text-xs uppercase drop-shadow-md">
                  Change Photo
                </span>
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pb-8 bg-white/80 backdrop-blur-md rounded-2xl">
                <Loader />
                <motion.p
                   key={loadingMessage}
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -5 }}
                   className="mt-4 text-forest-deep font-medium text-xs tracking-widest uppercase text-center px-4"
                >
                  {loadingMessage}
                </motion.p>
              </div>
            )}
          </div>
        </div>

        {/* Helper Text */}
        <p className="max-w-lg mx-auto mb-6 px-4 text-center text-[11px] leading-relaxed tracking-wide text-forest-deep/55 sm:text-xs">
          Camera black screen? Allow Camera in Settings &gt; Browser, then try again.
        </p>

        {/* User Question Input */}
        <div className="w-full max-w-lg mx-auto mb-8 relative z-20 group">
          <textarea
            className="w-full bg-white/60 border border-forest-deep/10 shadow-inner rounded-3xl p-5 pr-12 text-forest-deep placeholder:text-stone-muted/50 focus:outline-none focus:ring-1 focus:ring-forest-deep/20 focus:border-forest-deep/20 transition-all resize-none font-sans text-sm leading-relaxed backdrop-blur-sm"
            placeholder="Describe any symptoms... (optional)"
            rows={3}
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
          />
          <AnimatePresence>
            {userQuestion && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setUserQuestion('')}
                className="absolute top-3 right-3 p-1.5 bg-black/5 hover:bg-black/10 rounded-full text-forest-deep/60 hover:text-forest-deep transition-colors"
                aria-label="Clear symptoms"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Primary Action Button - Organic Glass Pill */}
        <motion.div
          layout
          className={`flex justify-center isolate z-50 w-full mb-10 ${
            imageData && !isLoading && !pendingScan
              ? 'sticky bottom-28 px-4 pointer-events-none sm:relative sm:bottom-auto sm:px-0 sm:pointer-events-auto'
              : 'relative'
          }`}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          ref={analyzeButtonRef}
        >
          <motion.div
            layout
            className={`transition-all duration-700 ease-[0.16, 1, 0.3, 1] ${
              imageData && !isLoading && !pendingScan
                ? 'pointer-events-auto'
                : ''
            }`}
          >
            <button
              onClick={handleAnalyzeClick}
              disabled={!imageData || isLoading}
              className={`relative w-[320px] h-[54px] flex items-center justify-center transition-all duration-500 active:duration-75 ease-[0.16, 1, 0.3, 1] rounded-full overflow-hidden group
                ${(!imageData || isLoading)
                  ? 'border border-forest-deep/15 text-forest-deep/40 bg-transparent cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#f1f3ee] via-[#dce2d1] to-[#9caf88] text-[#2d3a2d] cursor-pointer active:scale-[0.98] active:translate-y-[1px] hover:shadow-[0_15px_30px_-8px_rgba(45,58,45,0.2),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[#7d8f69]/40 ring-1 ring-[#f1f3ee]/40 ring-inset'
                }
              `}
            >
              {/* Subtle Edge Glow Overlay */}
              {!isLoading && imageData && (
                <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}

              {/* Glossy Overlay */}
              {!isLoading && imageData && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}

              {isLoading ? (
                <div className="flex items-center justify-center w-full h-full relative z-20">
                <div className="relative w-10 h-10 mr-3">
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    {/* Swaying Container */}
                    <g style={{ transformOrigin: '40px 95px', animation: 'plant-sway 2s ease-in-out infinite alternate' }}>
                      {/* Dead, withered base branch */}
                      <path d="M40 95 C 40 70, 30 50, 15 35" fill="none" stroke="#78716c" strokeWidth="3" strokeLinecap="round" />
                      <path d="M40 80 C 55 70, 70 75, 85 65" fill="none" stroke="#78716c" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M50 75 C 45 60, 50 45, 45 25" fill="none" stroke="#78716c" strokeWidth="2" strokeLinecap="round" />

                      {/* Drooping dead leaves that fall off */}
                      <g style={{ transformOrigin: '15px 35px', animation: 'leaf-drop 1s ease-in forwards 0.2s' }}>
                        <path d="M15 35 C 5 45, 20 55, 15 35 Z" fill="#78716c" />
                      </g>
                      <g style={{ transformOrigin: '85px 65px', animation: 'leaf-drop-right 1s ease-in forwards 0.4s' }}>
                        <path d="M85 65 C 95 75, 80 85, 85 65 Z" fill="#78716c" />
                      </g>

                      {/* --- Revival Animation --- */}

                      {/* New Green Stem growing up */}
                      <path
                        d="M40 95 C 45 70, 55 50, 65 20"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeDasharray="100"
                        strokeDashoffset="100"
                        style={{ animation: 'draw-line 2.4s ease-out forwards' }}
                      />
                      <path
                        d="M50 60 C 35 50, 25 40, 15 20"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="100"
                        strokeDashoffset="100"
                        style={{ animation: 'draw-line 2.4s ease-out 0.8s forwards' }}
                      />

                      {/* Sprouting Leaves (Detailed) */}
                      <g style={{ transformOrigin: '55px 50px', animation: 'leaf-grow 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s forwards', opacity: 0 }}>
                        <path d="M55 50 C 65 35, 85 40, 85 55 C 80 70, 60 65, 55 50 Z" fill="#34d399" />
                        <path d="M55 50 C 65 45, 75 50, 85 55" fill="none" stroke="#059669" strokeWidth="1.5" />
                      </g>
                      <g style={{ transformOrigin: '45px 70px', animation: 'leaf-grow 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 1.6s forwards', opacity: 0 }}>
                        <path d="M45 70 C 25 60, 15 75, 15 90 C 30 95, 40 85, 45 70 Z" fill="#10b981" />
                        <path d="M45 70 C 35 75, 25 80, 15 90" fill="none" stroke="#047857" strokeWidth="1.5" />
                      </g>
                      <g style={{ transformOrigin: '65px 20px', animation: 'leaf-grow 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 2.0s forwards', opacity: 0 }}>
                        <path d="M65 20 C 70 0, 90 -5, 100 10 C 90 25, 70 30, 65 20 Z" fill="#059669" />
                        <path d="M65 20 C 75 15, 85 15, 100 10" fill="none" stroke="#022c22" strokeWidth="1.5" />
                      </g>
                      <g style={{ transformOrigin: '25px 40px', animation: 'leaf-grow 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 2.4s forwards', opacity: 0 }}>
                        <path d="M25 40 C 10 25, -10 35, -10 50 C 5 65, 20 55, 25 40 Z" fill="#34d399" />
                        <path d="M25 40 C 15 40, 5 45, -10 50" fill="none" stroke="#059669" strokeWidth="1.5" />
                      </g>

                      {/* Blooming Flower */}
                      <g style={{ transformOrigin: '15px 20px', animation: 'flower-bloom 1.6s cubic-bezier(0.34, 1.56, 0.64, 1) 3.2s forwards', opacity: 0 }}>
                        {/* Petals */}
                        <path d="M15 15 C 5 5, 25 5, 15 15 Z" fill="#f43f5e" />
                        <path d="M15 25 C 5 35, 25 35, 15 25 Z" fill="#f43f5e" />
                        <path d="M10 20 C 0 10, 0 30, 10 20 Z" fill="#f43f5e" />
                        <path d="M20 20 C 30 10, 30 30, 20 20 Z" fill="#f43f5e" />
                        {/* Center */}
                        <circle cx="15" cy="20" r="4" fill="#fbbf24" />
                        {/* Sparkles */}
                        <circle cx="5" cy="10" r="1.5" fill="#fde047" style={{ animation: 'light-flicker 1s infinite' }} />
                        <circle cx="25" cy="12" r="1" fill="#fde047" style={{ animation: 'light-flicker 1.2s infinite 0.2s' }} />
                        <circle cx="20" cy="30" r="1.5" fill="#fde047" style={{ animation: 'light-flicker 0.9s infinite 0.4s' }} />
                      </g>
                    </g>
                  </svg>
                </div>
                <span className="text-emerald-700 font-semibold tracking-widest text-xs uppercase animate-pulse">
                  Analyzing...
                </span>
              </div>
              ) : (
              <>
                {/* High-end Dappled Shadow Hover Effect - Realistic Leaf Shadow */}
                {previewUrl && (
                  <div
                    className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl mix-blend-multiply"
                    style={{
                      WebkitMaskImage: 'radial-gradient(ellipse 65% 80% at 50% 50%, transparent 25%, black 75%)',
                      maskImage: 'radial-gradient(ellipse 65% 80% at 50% 50%, transparent 25%, black 75%)'
                    }}
                  >
                    {/* Layer 1: Deep Background (Furthest, slowest, most blurred) */}
                    <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] opacity-0 group-hover:opacity-100 transition-all duration-[4s] ease-out -translate-x-[55%] -translate-y-[45%] group-hover:-translate-x-[5%]">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-forest-deep/10 blur-[8px] origin-center" style={{ animation: 'plant-sway 6s ease-in-out infinite alternate-reverse' }}>
                        <g transform="rotate(25 50 50) translate(20, 20)">
                          <LeafCluster transform="translate(20, 80) rotate(-15)" scale={1.5} />
                          <LeafCluster transform="translate(50, 60) rotate(5)" scale={1.8} />
                          <LeafCluster transform="translate(80, 30) rotate(20)" scale={1.4} />
                          <LeafCluster transform="translate(35, 70) rotate(-5)" scale={1.2} />
                          <LeafCluster transform="translate(65, 45) rotate(10)" scale={1.3} />
                        </g>
                      </svg>
                    </div>

                    {/* Layer 2: Midground */}
                    <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] opacity-0 group-hover:opacity-100 transition-all duration-[2.5s] ease-out -translate-x-[65%] -translate-y-[35%] group-hover:-translate-x-[15%]">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-forest-deep/15 blur-[4px] origin-center" style={{ animation: 'plant-sway 4.5s ease-in-out infinite alternate' }}>
                        <g transform="rotate(40 50 50) translate(15, 10)">
                          <LeafCluster transform="translate(25, 75) rotate(-10)" scale={1.2} />
                          <LeafCluster transform="translate(55, 50) rotate(10)" scale={1.5} />
                          <LeafCluster transform="translate(85, 20) rotate(25)" scale={1.1} />
                          <LeafCluster transform="translate(40, 65) rotate(0)" scale={1.0} />
                          <LeafCluster transform="translate(70, 35) rotate(15)" scale={1.0} />
                        </g>
                      </svg>
                    </div>

                    {/* Layer 3: Foreground (Closest, fastest, sharpest) */}
                    <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] opacity-0 group-hover:opacity-100 transition-all duration-[1.5s] ease-out -translate-x-[75%] -translate-y-[25%] group-hover:-translate-x-[25%]">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-forest-deep/20 blur-[2px] origin-center" style={{ animation: 'plant-sway 3s ease-in-out infinite alternate-reverse' }}>
                        <g transform="rotate(55 50 50) translate(10, 0)">
                          <LeafCluster transform="translate(30, 70) rotate(-5)" scale={0.9} />
                          <LeafCluster transform="translate(60, 40) rotate(15)" scale={1.2} />
                          <LeafCluster transform="translate(90, 10) rotate(30)" scale={0.8} />
                          <LeafCluster transform="translate(45, 55) rotate(5)" scale={0.8} />
                          <LeafCluster transform="translate(75, 25) rotate(20)" scale={0.8} />
                        </g>
                      </svg>
                    </div>
                  </div>
                )}

                <div className="z-10 relative flex items-center justify-center">
                  {previewUrl && (
                    <div className="relative mr-3">
                      <Camera className="w-4 h-4 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-[10deg] opacity-90 text-forest-deep" />
                      <div className="absolute inset-0 blur-[4px] bg-forest-deep/10 -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  <span className={`uppercase font-semibold text-xs transition-all duration-500 ${
                    (!imageData || isLoading) ? 'text-forest-deep/40 tracking-[0.12em]' : 'text-[#2d3a2d] tracking-[0.14em] group-hover:tracking-[0.18em]'
                  }`}>
                    {getPrimaryAnalyzeLabel()}
                  </span>
                </div>
              </>
            )}
          </button>

          {/* Cancel Button */}
          <AnimatePresence>
            {isLoading && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={cancelAnalysis}
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-widest flex items-center gap-1.5"
              >
                <X className="w-3 h-3" /> Cancel Analysis
              </motion.button>
            )}
          </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Common Problems Gallery (Before Diagnosis) */}
        {((!pendingScan && !analysisError) || isLoading) && renderCommonProblems('animate-in fade-in duration-500')}

        <AnimatePresence>
          {analysisError && !isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              ref={resultRef}
              className="w-full max-w-2xl mx-auto mt-12 rounded-3xl border border-red-900/15 bg-[#FFF8F6] shadow-xl overflow-hidden text-left"
            >
              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-900/50 mb-2">Analysis paused</p>
                    <h3 className="text-2xl sm:text-3xl font-serif text-forest-deep mb-3">The professor could not reach the lab</h3>
                    <p className="text-sm sm:text-base leading-relaxed text-forest-deep/70">{analysisError}</p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleAnalyzeClick}
                        disabled={!imageData}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-forest-deep px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#1C2E24] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                      </button>
                      <button
                        onClick={() => setAnalysisError(null)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-forest-deep/15 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-widest text-forest-deep transition-colors hover:bg-[#FAF8F5]"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Response Inline Card */}
        <AnimatePresence>
          {pendingScan && !isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              ref={resultRef}
              className="w-full max-w-2xl mx-auto mt-12 bg-[#FAF8F5] rounded-3xl shadow-xl border border-forest-deep/10 overflow-hidden text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-forest-deep/5 bg-[#FAF8F5]">
                <h3 className="text-forest-deep font-semibold uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2">
                  <div className="w-1 h-4 bg-forest-deep rounded-sm"></div>
                  Diagnosis Result
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-forest-deep/60 hover:text-forest-deep px-4 py-2 rounded-lg hover:bg-forest-deep/5 transition-colors text-xs font-semibold uppercase tracking-widest cursor-pointer"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? <span className="text-emerald-600">Copied</span> : 'Copy'}
                </button>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {/* Tier 1: Essence */}
                <div className="mb-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-8 sm:gap-6 border-b border-forest-deep/10 pb-8 sm:pb-10">
                  <div className="flex flex-col items-center sm:items-start z-10 text-center sm:text-left flex-1 pt-2">
                    <div className="text-forest-deep/40 uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold mb-4 flex items-center gap-3">
                      <div className="w-10 h-[1px] bg-forest-deep/20 hidden sm:block"></div>
                      Botanical Profile
                      <div className="w-8 h-[1px] bg-forest-deep/20 sm:hidden"></div>
                    </div>
                    {(pendingScan.basic?.killerTitle || pendingScan.killerTitle || pendingScan.proPreview?.killerTitle) && (
                      <h3 className="text-2xl sm:text-3xl font-serif text-forest-deep mb-3 leading-tight italic">
                        "{pendingScan.basic?.killerTitle || pendingScan.killerTitle || pendingScan.proPreview?.killerTitle}"
                      </h3>
                    )}
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-forest-deep mb-2 leading-[1.1] tracking-tight">
                      <DiagnosisTitle species={pendingScan?.basic?.species || pendingScan?.species} hasScan={Boolean(pendingScan)} />
                    </h2>
                  </div>

                  <RiskBadge risk={pendingScan?.basic?.risk || pendingScan?.risk} />
                </div>

                {/* Diagnosis Summary */}
                <div className="mb-8 space-y-6">
                  {/* Detailed Summary (Sarcastic Critique) */}
                  {(pendingScan?.basic?.summary || pendingScan?.summary) && (
                    <div className="markdown-body prose prose-stone max-w-none prose-p:text-forest-deep text-base sm:text-lg leading-relaxed">
                      <MarkdownResult content={pendingScan.basic?.summary || pendingScan.summary} />
                    </div>
                  )}

                  {/* Main Issue */}
                  {pendingScan?.basic?.mainIssue && (
                    <div className="mt-6 mb-6">
                      <div className="text-forest-deep font-semibold text-[16px] leading-relaxed">
                        <MarkdownResult content={pendingScan.basic.mainIssue} />
                      </div>
                    </div>
                  )}

                  {/* Basic Care Rule (Replaced Action Plan in Basic) */}
                  {pendingScan?.basic?.basicCareRule && (
                    <div className="bg-[#F4F9F4] rounded-2xl p-6 border border-emerald-900/10 flex gap-4 items-start shadow-xs">
                      <div className="w-8 h-8 rounded-full bg-emerald-900/10 flex items-center justify-center text-emerald-900 shrink-0 mt-0.5">
                        <Flower className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <div>
                        <h4 className="text-emerald-900 font-semibold text-xs mb-1.5 uppercase tracking-widest">Immediate Care Rule</h4>
                        <div className="text-emerald-800 text-sm leading-relaxed"><MarkdownResult content={pendingScan.basic.basicCareRule} /></div>
                      </div>
                    </div>
                  )}

                {/* Pro Content vs Pro Preview Card */}
                {pendingScan?.pro ? (
                  <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Deep Dive */}
                    {pendingScan.pro.deepDive && (
                      <div className="markdown-body prose prose-stone max-w-none prose-headings:text-forest-deep prose-p:text-forest-deep/90 prose-a:text-forest-deep text-base leading-relaxed">
                        <MarkdownResult content={pendingScan.pro.deepDive} />
                      </div>
                    )}

                    {/* Action Plan / Rescue Plan */}
                    {(pendingScan.pro.stepByStepPlan || pendingScan?.basic?.actionPlan || pendingScan?.actionPlan) && (
                      <div className="bg-white rounded-2xl p-6 border border-forest-deep/10 shadow-sm">
                        <h4 className="text-forest-deep font-semibold uppercase tracking-widest text-xs mb-5 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          Professor's Action Plan
                        </h4>
                        <ul className="space-y-4">
                          {(pendingScan.pro.stepByStepPlan || pendingScan.basic?.actionPlan || pendingScan.actionPlan).map((step: string, idx: number) => (
                            <li key={idx} className="flex gap-4 items-start">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FAF8F5] border border-forest-deep/10 text-forest-deep flex items-center justify-center text-[11px] font-semibold mt-0.5 shadow-sm">
                                {idx + 1}
                              </div>
                              <div className="text-forest-deep/80 text-sm sm:text-base leading-relaxed pt-0.5">
                                <MarkdownResult content={step} />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Environmental Adjustments */}
                    {pendingScan.pro.environmentalAdjustments && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(pendingScan.pro.environmentalAdjustments).map(([key, value]) => (
                          <div key={key} className="bg-white rounded-2xl p-5 border border-forest-deep/10 shadow-sm">
                            <h4 className="text-forest-deep/65 font-semibold uppercase tracking-widest text-[9px] mb-2">{key}</h4>
                            <div className="text-forest-deep/80 text-sm leading-relaxed">
                              <MarkdownResult content={value as string} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                      {/* Recovery Schedule */}
                      {pendingScan.pro.recoverySchedule && pendingScan.pro.recoverySchedule.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 border border-forest-deep/10 shadow-sm">
                          <h4 className="text-forest-deep font-semibold uppercase tracking-widest text-xs mb-5">7-Day Recovery Schedule</h4>
                          <div className="space-y-4">
                            {pendingScan.pro.recoverySchedule.map((schedule: any, idx: number) => (
                              <div key={idx} className="flex gap-4 border-l-2 border-emerald-500/30 pl-4 pb-4 relative last:pb-0">
                                <div className="absolute w-2 h-2 rounded-full bg-emerald-500 -left-[5px] top-1"></div>
                                <div>
                                  <div className="text-xs font-semibold text-emerald-800 uppercase tracking-widest mb-1.5">{schedule.day}</div>
                                  <div className="text-forest-deep text-sm mb-1 leading-relaxed">
                                    <MarkdownResult content={schedule.action} />
                                  </div>
                                  <p className="text-forest-deep/55 text-xs italic">Watch for: {schedule.whatToWatch}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mistakes to Avoid */}
                      {pendingScan.pro.mistakesToAvoid && pendingScan.pro.mistakesToAvoid.length > 0 && (
                        <div className="bg-red-50/40 rounded-2xl p-6 border border-red-900/10">
                          <h4 className="text-red-900/70 font-semibold uppercase tracking-widest text-xs mb-4">Mistakes to Avoid</h4>
                          <ul className="list-disc pl-5 space-y-2.5 text-sm text-red-800/90 leading-relaxed">
                            {pendingScan.pro.mistakesToAvoid.map((mistake: string, idx: number) => (
                              <li key={idx}>
                                <MarkdownResult content={mistake} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommended Products */}
                      {(pendingScan.pro?.recommendedProducts || pendingScan?.basic?.recommendedProducts || pendingScan?.recommendedProducts) && (pendingScan.pro?.recommendedProducts || pendingScan.basic?.recommendedProducts || pendingScan.recommendedProducts).length > 0 && (
                        <div className="mt-8 pt-6 border-t border-forest-deep/10">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-forest-deep font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                              <ShoppingBag className="w-3.5 h-3.5" />
                              Professor's Prescriptions
                            </h4>
                            <span className="text-[9px] text-forest-deep/40 uppercase tracking-widest">*Affiliate Links</span>
                          </div>

                          <div className="flex overflow-x-auto gap-3 pb-4 custom-scrollbar-horizontal -mx-6 px-6 sm:mx-0 sm:px-0">
                            {(pendingScan.pro?.recommendedProducts || pendingScan.basic?.recommendedProducts || pendingScan.recommendedProducts).map((product: any, idx: number) => (
                              <a
                                key={idx}
                                href={`https://www.amazon.com/s?k=${encodeURIComponent(product.searchKeyword || product.name)}&tag=${AMAZON_AFFILIATE_TAG}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex-none w-[240px] p-3 rounded-xl border border-forest-deep/10 bg-white hover:border-forest-deep/30 hover:shadow-sm transition-all relative overflow-hidden flex flex-col"
                              >
                                <div className="flex justify-between items-start mb-1.5">
                                  <h5 className="font-bold text-forest-deep text-xs group-hover:text-emerald-700 transition-colors pr-2 line-clamp-1">{product.name}</h5>
                                  <ArrowUpRight className="w-3 h-3 text-forest-deep/40 group-hover:text-emerald-700 transition-colors shrink-0" />
                                </div>
                                <div className="text-[10px] text-forest-deep/60 italic leading-relaxed line-clamp-2">
                                  "{product.reason}"
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : pendingScan?.proPreview ? (
                    <div className="mt-12 relative rounded-[2rem] bg-forest-deep text-stone-50 p-8 sm:p-10 overflow-hidden group shadow-2xl">
                      {/* Decorative abstract shapes */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-110"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -ml-10 -mb-10 transition-transform duration-700 group-hover:scale-110"></div>

                      {/* Decorative icon */}
                      <div className="absolute top-8 right-8 text-yellow-500/10 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 pointer-events-none">
                        <Crown className="w-32 h-32" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border border-yellow-500/30 flex items-center gap-1.5 shadow-sm backdrop-blur-md">
                            <Crown className="w-3 h-3" />
                            Premium Analysis
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1">
                            <span>Costs 1 Scan Point</span>
                          </div>
                        </div>

                        <h3 className="text-2xl font-serif text-white mb-4 leading-tight">The Professor has more to say...</h3>
                        <div className="text-stone-300 text-sm leading-relaxed max-w-md">
                          <MarkdownResult content={pendingScan.proPreview.teaserSummary} />
                        </div>
                        <p className="text-emerald-400/90 text-sm mb-8 font-medium italic mt-2">
                          Your basic diagnosis tells you what's wrong. The full plan tells you exactly what to do next.
                        </p>

                        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10 backdrop-blur-md">
                          <h4 className="text-[10px] uppercase tracking-widest text-stone-400 mb-5 font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                            Unlock the Full Rescue Plan
                          </h4>
                          <ul className="space-y-4">
                            {pendingScan.proPreview.lockedSections.map((section: string, idx: number) => (
                              <li key={idx} className="flex gap-4 items-center text-sm text-stone-200 font-medium group/item">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover/item:bg-emerald-500/20 group-hover/item:text-emerald-400 transition-colors">
                                  <Check className="w-3 h-3" />
                                </div>
                                <span className="group-hover/item:text-white transition-colors">{section}</span>
                              </li>
                            ))}
                            <li className="flex gap-4 items-center text-sm text-stone-200 font-medium group/item pt-2 border-t border-white/5">
                              <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 text-yellow-400">
                                <Share2 className="w-3 h-3" />
                              </div>
                              <span className="text-yellow-400">Premium Share Card</span>
                            </li>
                          </ul>
                        </div>

                        <button
                          onClick={handleUnlockPro}
                          disabled={isUnlockingPro}
                          className="w-full bg-white hover:bg-stone-100 text-forest-deep py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
                        >
                          {isUnlockingPro ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin text-forest-deep" />
                              <span className="opacity-90">Professor is writing your plan...</span>
                            </>
                          ) : (
                            <>
                              Unlock the Full Rescue Plan
                              <Crown className="w-5 h-5 opacity-80" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-forest-deep/10 flex flex-row gap-3">
                  <button
                    onClick={async () => {
                      if (!user) {
                        try {
                          await signInWithGoogle();
                        } catch (e) {
                          console.error('Sign-in failed:', e);
                        }
                      } else if (isSaved) {
                        navigate('/history');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        handleSaveToGarden();
                      }
                    }}
                    disabled={isSaving || (pendingScan?.basic?.isPlantOrAnimal ?? pendingScan?.isPlantOrAnimal) === false}
                    className={`flex-[2] px-4 py-3.5 rounded-full text-[11px] font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      (pendingScan?.basic?.isPlantOrAnimal ?? pendingScan?.isPlantOrAnimal) === false
                        ? 'border border-forest-deep/10 text-forest-deep/40 cursor-not-allowed bg-[#FAF8F5]'
                        : isSaved
                          ? 'bg-[#F4F9F4] text-emerald-900 border border-emerald-900/20 hover:bg-[#EBF5EB]'
                          : isSaving
                            ? 'bg-forest-deep/80 text-white cursor-wait'
                            : 'bg-forest-deep text-white hover:bg-[#1C2E24] shadow-xs cursor-pointer'
                    }`}
                  >
                    {(pendingScan?.basic?.isPlantOrAnimal ?? pendingScan?.isPlantOrAnimal) === false ? (
                      <><X className="w-4 h-4" /> Not a Plant</>
                    ) : isSaving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : isSaved ? (
                      <><ArrowUpRight className="w-4 h-4" /> View in Garden</>
                    ) : (
                      <><Flower className="w-4 h-4" /> Save to Garden</>
                    )}
                  </button>
                  <button
                    onClick={() => { trackEvent('share_click'); setIsShareOpen(true); }}
                    className="flex-1 px-4 py-3.5 bg-white text-forest-deep border border-forest-deep/15 rounded-full text-[11px] font-semibold uppercase tracking-widest hover:bg-[#FAF8F5] hover:border-forest-deep/25 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
                {!user && (
                  <p className="text-center text-[10px] text-forest-deep/50 mt-3 uppercase tracking-wider">
                    Log in to save this tragedy to your garden
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Common Problems Gallery (After Diagnosis) */}
        {pendingScan && !isLoading && renderCommonProblems('animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both')}
      </motion.main>
          } />

          {/* Journal View */}
          <Route path="/journal/*" element={
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full"
            >
              <Suspense fallback={<RouteFallback />}>
                <JournalView />
              </Suspense>
            </motion.div>
          } />

          {/* Care Guide View */}
          <Route path="/guide" element={
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full px-4 py-10"
            >
              <Suspense fallback={<RouteFallback />}>
                <CareGuide />
              </Suspense>
            </motion.div>
          } />

          {/* History View */}
          <Route path="/history" element={
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full"
            >
              <Suspense fallback={<RouteFallback />}>
                <HistoryView
                  user={user}
                  scans={gardenScans}
                  isLoading={isGardenLoading}
                  loadError={gardenLoadError}
                  onShare={(data) => {
                    setPendingScan(data);
                    setImageData(data.imageData);
                    setImageType(data.imageType);
                    setIsShareOpen(true);
                  }}
                />
              </Suspense>
            </motion.div>
          } />

          {/* Admin View */}
          <Route path="/admin" element={
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full"
            >
              <Suspense fallback={<RouteFallback />}>
                <AdminDashboard user={user} userProfile={userProfile} />
              </Suspense>
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>

      <Footer />

      <AnimatePresence>
        {showPaidScanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-earth-sand/90 backdrop-blur-md p-4"
            onClick={() => setShowPaidScanModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPaidScanModal(false)}
                className="absolute top-5 right-5 w-10 h-10 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center text-forest-deep transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-forest-deep/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-forest-deep/10">
                <Zap className="w-8 h-8 text-forest-deep" />
              </div>

              <h3 className="text-2xl font-bold text-forest-deep mb-3 font-heading">
                You've used today's free plant check.
              </h3>

              <p className="text-forest-deep/70 mb-6 leading-relaxed">
                Use 1 Scan Point to run a full Pro Diagnosis now, including the Basic result and Professor's Rescue Plan.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-7 text-left">
                <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-forest-deep/45 font-bold mb-1">Free Basic</p>
                  <p className="text-sm font-semibold text-forest-deep">Used today</p>
                </div>
                <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-forest-deep/45 font-bold mb-1">Scan Points</p>
                  <p className="text-sm font-semibold text-forest-deep">{userProfile?.scanPoints || 0} available</p>
                </div>
              </div>

              <button
                onClick={handleConfirmPaidScan}
                disabled={isLoading}
                className="w-full py-4 bg-forest-deep text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-forest-deep/90 transition-colors shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running Pro Diagnosis
                  </>
                ) : (
                  <>
                    Use 1 Scan Point
                    <Crown className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => setShowPaidScanModal(false)}
                className="mt-4 text-xs uppercase tracking-widest text-forest-deep/45 hover:text-forest-deep transition-colors font-semibold"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        {showLimitModal && (
          <LimitModal
            showLimitModal={showLimitModal}
            setShowLimitModal={setShowLimitModal}
            setIsProfileOpen={setIsProfileOpen}
          />
        )}

        {isProfileOpen && (
          <ProfileModal
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
            user={user}
            userProfile={userProfile}
            logOut={logOut}
            signInWithGoogle={signInWithGoogle}
            onBuyPoints={() => setIsPricingModalOpen(true)}
          />
        )}

        {isPricingModalOpen && (
          <PricingModal
            isOpen={isPricingModalOpen}
            onClose={() => setIsPricingModalOpen(false)}
            user={user}
            onPointsAdded={(points) => {
              setUserProfile((prev: any) => prev ? { ...prev, scanPoints: (prev.scanPoints || 0) + points } : prev);
            }}
          />
        )}

        {isPaywallOpen && (
          <PaywallModal
            isOpen={isPaywallOpen}
            onClose={() => setIsPaywallOpen(false)}
            onBuyPoints={() => {
              setIsPaywallOpen(false);
              setIsPricingModalOpen(true);
            }}
          />
        )}

        {isShareOpen && (
          <ShareModal
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            plantData={pendingScan ? {
              ...pendingScan,
              species: (pendingScan.basic?.species || pendingScan.species) || 'Unknown Plant',
              risk: (pendingScan.basic?.risk || pendingScan.risk) || 'Unknown',
              summary: (pendingScan.basic?.mainIssue || pendingScan.summary) || '',
              imageData: pendingScan.imageData || imageData || '',
              imageType: pendingScan.imageType || imageType || 'image/jpeg',
              originalImageData: pendingScan.originalImageData || imageData || '',
              originalImageType: pendingScan.originalImageType || imageType || 'image/jpeg',
              killerTitle: (pendingScan.proPreview?.killerTitle || pendingScan.killerTitle) || 'UNKNOWN ASSASSIN'
            } : null}
          />
        )}
      </Suspense>
    </div>
  );
}
