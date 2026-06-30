import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

interface User {
  uid: string;
  telegramId?: string;
  username: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  createdAt?: string;
  role: 'super_admin' | 'admin' | 'user';
  usdtBalance: number;
  vaBalance: number;
  currentLevel: number;
  totalEarned: number;
  referralCount: number;
  dailyAdsWatched?: number;
  currentAdCount?: number;
  adCountdownUntil?: number;
  isVip?: boolean;
  vipExpiry?: number;
  dailySpins?: number;
  lastSpinDate?: number;
  pushEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  initAuth: () => void;
  updateBalances: (usdt: number, va: number) => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((setStore, getStore) => ({
  user: null,
  isLoading: true,
  login: (user) => setStore({ user }),
  logout: () => setStore({ user: null }),
  initAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setStore({ user: snapshot.data() as User, isLoading: false });
          } else {
            // Document doesn't exist yet (or was deleted).
            // Auth.tsx handles creating the initial document during registration.
            // We just wait for the snapshot to trigger again once created.
            setStore({ isLoading: false });
          }
        }, (error) => {
          console.warn("User fetch error:", error);
          setStore({ user: null, isLoading: false });
        });
      } else {
        setStore({ user: null, isLoading: false });
      }
    });
  },
  updateBalances: (usdt, va) => setStore((state) => {
    if (state.user) {
      updateDoc(doc(db, 'users', state.user.uid), {
        usdtBalance: usdt,
        vaBalance: va
      }).catch(e => console.log("Silent error updating balance", e));
      return { user: { ...state.user, usdtBalance: usdt, vaBalance: va } };
    }
    return state;
  }),
  updateUser: (data) => setStore((state) => {
    if (state.user) {
      return { user: { ...state.user, ...data } };
    }
    return state;
  }),
}));

