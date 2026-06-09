import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Loader2, CloudUpload, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

interface ProfileModalProps {
  isProfileOpen: boolean;
  setIsProfileOpen: (show: boolean) => void;
  user: any;
  userProfile: any;
  logOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  onBuyPoints?: () => void;
}

export const ProfileModal = ({
  isProfileOpen,
  setIsProfileOpen,
  user,
  userProfile,
  logOut,
  signInWithGoogle,
  onBuyPoints
}: ProfileModalProps) => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [pointLedger, setPointLedger] = useState<any[]>([]);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPointLedger = async () => {
      if (!isProfileOpen || !user) {
        setPointLedger([]);
        return;
      }

      setIsLedgerLoading(true);
      try {
        const ledgerQuery = query(
          collection(db, 'point_ledger'),
          where('userId', '==', user.uid),
          limit(20)
        );
        const snapshot = await getDocs(ledgerQuery);
        if (isMounted) {
          const rows = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
            .slice(0, 5);
          setPointLedger(rows);
        }
      } catch (error) {
        console.warn('Could not load point ledger yet. Firestore rules/index may need deployment.', error);
        if (isMounted) setPointLedger([]);
      } finally {
        if (isMounted) setIsLedgerLoading(false);
      }
    };

    loadPointLedger();

    return () => {
      isMounted = false;
    };
  }, [isProfileOpen, user]);

  const formatLedgerDate = (value: any) => {
    if (!value) return 'Recent';
    const date = value.seconds ? new Date(value.seconds * 1000) : new Date(value);
    return Number.isNaN(date.getTime()) ? 'Recent' : date.toLocaleDateString();
  };

  const getLedgerLabel = (entry: any) => {
    if (entry.reason === 'paypal-purchase') return 'Points purchased';
    if (entry.reason === 'full-pro-diagnosis') return 'Full Pro diagnosis';
    if (entry.reason === 'pro-rescue-plan') return 'Rescue plan unlocked';
    if (entry.reason === 'model-error-refund') return 'Point refunded';
    return 'Point activity';
  };

  return (
    <AnimatePresence>
      {isProfileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-earth-sand/90 backdrop-blur-md p-4"
          onClick={() => setIsProfileOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative p-8 md:p-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center text-forest-deep transition-colors"
              aria-label="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              {user ? (
                <>
                  <div className="w-24 h-24 bg-stone-200 rounded-full mb-4 overflow-hidden border-4 border-white shadow-sm">
                    <img src={user.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.uid}&backgroundColor=e5e5e5`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-2xl font-light text-forest-deep mb-1">{user.displayName || 'Plant Parent'}</h2>
                  <p className="text-stone-muted text-sm mb-6">{user.email}</p>

                  <div className="w-full grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-yellow-50 p-4 sm:p-6 rounded-2xl border border-yellow-100 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="text-2xl sm:text-3xl font-light text-yellow-700 mb-1 flex items-center gap-1">
                        {userProfile?.scanPoints || 0}
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-yellow-700/70">Points</div>
                      <Crown className="w-16 h-16 text-yellow-400 opacity-20 absolute -bottom-4 -right-2" />
                    </div>
                    <div className="bg-stone-50 p-4 sm:p-6 rounded-2xl border border-stone-100 flex flex-col items-center justify-center">
                      <div className="text-2xl sm:text-3xl font-light text-forest-deep mb-1">{userProfile?.plantsScanned || 0}</div>
                      <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-muted">Scans</div>
                    </div>
                    <div className="bg-stone-50 p-4 sm:p-6 rounded-2xl border border-stone-100 flex flex-col items-center justify-center">
                      <div className="text-2xl sm:text-3xl font-light text-emerald-600 mb-1">{userProfile?.plantsSaved || 0}</div>
                      <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-muted">Saved</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onBuyPoints) {
                        setIsProfileOpen(false);
                        onBuyPoints();
                      }
                    }}
                    className="w-full py-4 mb-4 rounded-xl bg-yellow-100 text-yellow-800 font-bold uppercase tracking-widest text-sm hover:bg-yellow-200 transition-colors border border-yellow-200 shadow-sm flex items-center justify-center gap-2"
                  >
                    <Crown className="w-5 h-5" />
                    Buy Points
                  </button>

                  <div className="w-full mb-4 rounded-2xl border border-forest-deep/10 bg-stone-50/70 p-4 text-left">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-forest-deep/55">Point Activity</h3>
                      {isLedgerLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-forest-deep/40" />}
                    </div>
                    {pointLedger.length > 0 ? (
                      <div className="space-y-2">
                        {pointLedger.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between gap-4 rounded-xl bg-white px-3 py-2 text-xs">
                            <div>
                              <div className="font-semibold text-forest-deep">{getLedgerLabel(entry)}</div>
                              <div className="text-[10px] uppercase tracking-wider text-stone-muted">{formatLedgerDate(entry.createdAt)}</div>
                            </div>
                            <div className={`font-bold ${entry.pointsDelta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                              {entry.pointsDelta > 0 ? '+' : ''}{entry.pointsDelta}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed text-forest-deep/50">
                        No point activity yet. Purchases and Pro unlocks will appear here after the next deployment.
                      </p>
                    )}
                  </div>

                  {userProfile?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full py-4 mb-4 rounded-xl bg-forest-deep text-white font-medium hover:bg-forest-deep/90 transition-colors"
                    >
                      Admin Dashboard
                    </button>
                  )}

                  <button
                    onClick={async () => {
                      await logOut();
                      setIsProfileOpen(false);
                    }}
                    className="w-full py-4 rounded-xl border border-forest-deep/20 text-forest-deep font-medium hover:bg-stone-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-stone-200 rounded-full mb-4 overflow-hidden border-4 border-white shadow-sm flex items-center justify-center text-stone-400">
                    <User className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-light text-forest-deep mb-2">Welcome</h2>
                  <p className="text-stone-muted text-sm mb-8">Sign in to save your plant scans and access your personal jungle.</p>

                  <button
                    onClick={async () => {
                      setAuthError(null);
                      setIsSigningIn(true);
                      try {
                        await signInWithGoogle();
                      } catch (e) {
                        console.error(e);
                        setAuthError(e instanceof Error ? e.message : 'Google sign-in failed. Please try again.');
                      } finally {
                        setIsSigningIn(false);
                      }
                    }}
                    disabled={isSigningIn}
                    className="w-full py-4 rounded-xl bg-forest-deep text-white font-medium hover:bg-forest-deep/90 transition-colors disabled:cursor-wait disabled:opacity-75 flex items-center justify-center gap-2"
                  >
                    {isSigningIn && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSigningIn ? 'Connecting...' : 'Sign In with Google'}
                  </button>

                  {authError && (
                    <div className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-xs leading-relaxed text-red-900">
                      {authError}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
