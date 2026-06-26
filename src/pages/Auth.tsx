import React, { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User, Lock, Mail, Phone, Users, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [inviteCode, setInviteCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') || '';
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tgLoading, setTgLoading] = useState(true);

  // Telegram Auto-Login Logic
  useEffect(() => {
    const checkTelegramAuth = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
          const tgUser = tg.initDataUnsafe.user;
          const tgEmail = `tg_${tgUser.id}@goaltubebd.local`;
          const tgPassword = `tg_pass_${tgUser.id}_secure`;

          // Try to sign in
          try {
            await signInWithEmailAndPassword(auth, tgEmail, tgPassword);
            // Success
            return;
          } catch (signInErr: any) {
            // If user doesn't exist, create it
            if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
              const userCredential = await createUserWithEmailAndPassword(auth, tgEmail, tgPassword);
              const user = userCredential.user;
              
              const displayName = tgUser.username || tgUser.first_name || 'TG_User';
              
              await updateProfile(user, {
                displayName: displayName
              });

              const userRef = doc(db, 'users', user.uid);
              await setDoc(userRef, {
                uid: user.uid,
                telegramId: tgUser.id.toString(),
                fullName: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim(),
                username: displayName,
                role: "user", 
                usdtBalance: 0,
                vaBalance: 0,
                currentLevel: 1,
                totalEarned: 0,
                referralCount: 0,
                createdAt: new Date().toISOString()
              });
            } else {
              throw signInErr;
            }
          }
        }
      } catch (err) {
        console.error("Telegram Auto-Login Error", err);
      } finally {
        setTgLoading(false);
      }
    };
    
    checkTelegramAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!fullName.trim() || !username.trim() || !phone.trim()) {
        setError("Please fill all required fields");
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, {
          displayName: username
        });

        // Initialize user in firestore
        const userRef = doc(db, 'users', user.uid);
        
        // Check for referral
        let referredBy = null;
        if (inviteCode) {
           // Basic logic: find user whose uid starts with the code, if format is R_XXXXXX
           // Since we use R_ + uid substring, we can try to query users, but this is a mock.
           // In production, we'd query users where referralCode === inviteCode.
           // We'll just store the code they used for now.
           referredBy = inviteCode;
        }

        await setDoc(userRef, {
          uid: user.uid,
          fullName,
          username,
          phone,
          email,
          referredBy,
          role: "user", 
          usdtBalance: 0,
          vaBalance: 0,
          currentLevel: 1,
          totalEarned: 0,
          referralCount: 0,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error(err);
      let errorMessage = err.message || 'Authentication failed';
      if (err.code === 'auth/email-already-in-use') {
         errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
         errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/weak-password') {
         errorMessage = 'Password should be at least 6 characters.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (tgLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-blue-600 font-bold space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <p>Connecting to secure network...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#F4F7FE] px-4 py-12 relative overflow-hidden font-sans">
      {/* 3D Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-[80px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full blur-[80px] opacity-30"></div>

      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-[0_15px_30px_rgba(0,0,0,0.1)] flex items-center justify-center mx-auto mb-4 border border-white rotate-3">
             <ShieldCheck className="w-10 h-10 text-blue-600 -rotate-3" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {isLogin ? 'Enter your credentials to access your dashboard' : 'Join the most secure earning platform'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-start space-x-2">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            {!isLogin && (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-11 pr-3 py-3.5 border border-gray-100 rounded-2xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
                    placeholder="Full Name"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-11 pr-3 py-3.5 border border-gray-100 rounded-2xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
                    placeholder="Username"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-11 pr-3 py-3.5 border border-gray-100 rounded-2xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
                    placeholder="Phone Number"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-3 py-3.5 border border-gray-100 rounded-2xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
                placeholder="Email Address"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-3 py-3.5 border border-gray-100 rounded-2xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
                placeholder="Password"
              />
            </div>

            {!isLogin && (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-3 py-3.5 border border-gray-100 rounded-2xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
                    placeholder="Confirm Password"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="block w-full pl-11 pr-3 py-3.5 border border-gray-100 rounded-2xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
                    placeholder="Invite Code (Optional)"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In Securely' : 'Create Account'}
            </button>
            
            <div className="text-center mt-6">
               <button 
                 type="button" 
                 onClick={() => {
                   setIsLogin(!isLogin);
                   setError('');
                 }}
                 className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors"
               >
                 {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
