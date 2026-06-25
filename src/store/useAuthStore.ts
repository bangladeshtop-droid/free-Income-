import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

interface User {
  uid: string;
  telegramId?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'super_admin' | 'admin' | 'user';
  usdtBalance: number;
  vaBalance: number;
  currentLevel: number;
  totalEarned: number;
  referralCount: number;
  dailyAdsWatched?: number;
  currentAdCount?: number;
  adCountdownUntil?: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  initAuth: () => void;
  updateBalances: (usdt: number, va: number) => void;
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
            const newUser: User = {
              uid: firebaseUser.uid,
              username: "User_" + firebaseUser.uid.substring(0, 5),
              role: "super_admin",
              usdtBalance: 0,
              vaBalance: 0,
              currentLevel: 1,
              totalEarned: 0,
              referralCount: 0
            };
            setDoc(userRef, newUser).then(() => {
                setStore({ user: newUser, isLoading: false });
            }).catch((err) => {
                console.warn("Could not write user profile:", err);
                setStore({ user: newUser, isLoading: false });
            });
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
}));

