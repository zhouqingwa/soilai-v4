import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

setLogLevel('silent');

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const getAuthErrorMessage = (error: any) => {
  const code = error?.code;

  if (code === 'auth/unauthorized-domain') {
    return [
      'This domain is not authorized for Google sign-in.',
      'In Firebase Console > Authentication > Settings > Authorized domains, add: 127.0.0.1, localhost, soilai.app, www.soilai.app, login.soilai.app, and your Vercel domain.'
    ].join(' ');
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Google sign-in is not enabled. In Firebase Console > Authentication > Sign-in method, enable Google provider.';
  }

  if (code === 'auth/popup-blocked') {
    return 'The Google sign-in popup was blocked. Open this site directly in Chrome or Edge, then allow popups for 127.0.0.1.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'The Google sign-in window was closed before finishing. Try again and complete the Google account step.';
  }

  if (code === 'auth/cancelled-popup-request') {
    return 'Another Google sign-in window was already open. Close the extra window and try again.';
  }

  if (code === 'auth/invalid-api-key' || code === 'auth/configuration-not-found') {
    return 'Firebase sign-in configuration is invalid. Check the Firebase API key, auth domain, and project configuration.';
  }

  return error?.message || 'Google sign-in failed. Please try again.';
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      console.warn("Popup blocked. Attempting redirect sign-in...");
      if (window !== window.parent) {
        alert("Sign-in popup was blocked. If sign-in does not work in this preview, open the app directly in Chrome or Edge.");
      }
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr) {
        console.warn("Redirect sign-in also failed:", redirectErr);
        throw new Error(getAuthErrorMessage(redirectErr));
      }
      return null;
    }

    console.error("Error signing in with Google", error);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
