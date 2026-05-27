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

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      console.warn("Popup blocked. Attempting redirect or opening in new tab...");
      if (window !== window.parent) {
         alert("因为在预览窗口（iframe）中运行，浏览器的弹窗拦截直接阻止了 Google 登录窗口。请点击预览区右上角的 ↗ 图标（在新标签页中打开），然后在新窗口中重试登录。");
      }
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr) {
        console.warn("Redirect sign-in also failed:", redirectErr);
      }
      return null;
    }
    if (error.code === 'auth/unauthorized-domain') {
       const currentDomain = window.location.hostname;
       alert(`Google 登录失败：当前域名 ${currentDomain} 未被授权。\n\n请前往 Firebase 控制台 (console.firebase.google.com) \n-> 左侧 Authentication \n-> 顶部 Settings \n-> 左侧 Authorized domains，点击 Add domain 将上述域名添加到白名单。`);
    }
    console.error("Error signing in with Google", error);
    alert(`登录出错啦：${error.message || error.code}`);
    throw error;
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
