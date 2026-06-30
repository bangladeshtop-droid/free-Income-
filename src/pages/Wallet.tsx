import { useState, useEffect } from "react";
import { Send, Wallet as WalletIcon, ArrowDownToLine, ChevronLeft, Copy, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import AnimatedCounter from "../components/AnimatedCounter";

export default function Wallet() {
  const [tab, setTab] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const user = useAuthStore((state) => state.user);
  
  // Dynamic Data
  const [depositMethods, setDepositMethods] = useState<any[]>([]);
  const [withdrawMethods, setWithdrawMethods] = useState<any[]>([]);
  const [coinRates, setCoinRates] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const methodsSnap = await getDoc(doc(db, 'settings', 'payment_methods'));
        if (methodsSnap.exists()) {
          const data = methodsSnap.data();
          setDepositMethods(data.deposit || []);
          setWithdrawMethods(data.withdraw || []);
        }

        const ratesSnap = await getDoc(doc(db, 'settings', 'coin_values'));
        if (ratesSnap.exists()) {
          setCoinRates(ratesSnap.data());
        }
      } catch (e) {
        console.error("Error fetching wallet config", e);
      }
    };
    fetchData();
  }, []);

  // P2P Transfer State
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [targetUid, setTargetUid] = useState('');

  // Deposit/Withdraw Forms
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [dwAmount, setDwAmount] = useState('');
  const [dwTxId, setDwTxId] = useState('');
  const [dwSender, setDwSender] = useState('');
  const [dwMemo, setDwMemo] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckName = async () => {
     if (!receiverId) return;
     setIsChecking(true);
     setReceiverName('');
     try {
       const usersRef = collection(db, 'users');
       const q = query(usersRef, where('username', '==', receiverId));
       const querySnapshot = await getDocs(q);
       if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setReceiverName(docSnap.data().username);
          setTargetUid(docSnap.id);
       } else {
          const uidRef = doc(db, 'users', receiverId);
          const uidSnap = await getDoc(uidRef);
          if (uidSnap.exists()) {
             setReceiverName(uidSnap.data().username);
             setTargetUid(receiverId);
          } else {
             alert('User not found!');
          }
       }
     } catch (e) {
       console.warn(e);
       alert('Error checking user');
     }
     setIsChecking(false);
  };

  const handleSend = async () => {
      if (!amount || !targetUid || !user?.uid) return;
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        showToast("Enter a valid amount.", 'error');
        return;
      }
      
      if ((user.vaBalance || 0) < numAmount) {
        showToast("Insufficient balance for transfer.", 'error');
        return;
      }

      setIsSending(true);
      try {
        // Deduct from sender
        const senderRef = doc(db, 'users', user.uid);
        await updateDoc(senderRef, {
          vaBalance: (user.vaBalance || 0) - numAmount
        });
        useAuthStore.getState().updateUser({ vaBalance: (user.vaBalance || 0) - numAmount });

        // Add to receiver
        const receiverRef = doc(db, 'users', targetUid);
        const receiverSnap = await getDoc(receiverRef);
        if (receiverSnap.exists()) {
          const receiverData = receiverSnap.data();
          await updateDoc(receiverRef, {
            vaBalance: (receiverData.vaBalance || 0) + numAmount
          });
        }

        // Record transaction for sender
        await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          username: user.username,
          type: 'transfer_out',
          method: 'P2P Transfer',
          amount: numAmount,
          currency: 'VA',
          status: 'completed',
          timestamp: new Date().toISOString(),
          receiverId: targetUid,
          receiverName: receiverName
        });
        
        // Notify sender
        await addDoc(collection(db, 'notifications'), {
          userId: user.uid,
          title: 'Transfer Sent',
          message: `You successfully sent ${numAmount} VA to ${receiverName}.`,
          type: 'wallet',
          read: false,
          createdAt: new Date().toISOString()
        });

        // Notify receiver
        await addDoc(collection(db, 'notifications'), {
          userId: targetUid,
          title: 'Transfer Received',
          message: `You received ${numAmount} VA from ${user.username}.`,
          type: 'wallet',
          read: false,
          createdAt: new Date().toISOString()
        });

        showToast(`Successfully transferred ${numAmount} VA to ${receiverName}`, 'success');
        setAmount('');
        setReceiverId('');
        setReceiverName('');
        setTargetUid('');
      } catch (error) {
        console.error(error);
        showToast("Error during transfer", 'error');
      }
      setIsSending(false);
  };

  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error') => {
    setToast({message, type});
    setTimeout(() => setToast(null), 3000);
  };

  const handleDWSubmit = async () => {
    if (!dwAmount || !user?.uid) return;
    const numAmount = parseFloat(dwAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (tab === 'withdraw' && (user.vaBalance || 0) < numAmount) {
      showToast("Insufficient balance for withdrawal.", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'withdraw') {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          vaBalance: (user.vaBalance || 0) - numAmount
        });
        useAuthStore.getState().updateUser({ vaBalance: (user.vaBalance || 0) - numAmount });
      }

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        username: user.username,
        type: tab,
        method: selectedMethod.name,
        amount: numAmount,
        currency: 'VA',
        fiatAmount: calculateValue(dwAmount, selectedMethod.id),
        status: 'pending',
        timestamp: new Date().toISOString(),
        txId: dwTxId || '',
        sender: dwSender || '',
        memo: dwMemo || ''
      });

      // Also create a notification for the user
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: `${tab === 'deposit' ? 'Deposit' : 'Withdrawal'} Request Sent`,
        message: `Your request for ${numAmount} VA via ${selectedMethod.name} has been submitted and is pending approval.`,
        type: 'wallet',
        read: false,
        createdAt: new Date().toISOString()
      });

      showToast(`${tab.toUpperCase()} request submitted successfully!`, 'success');
      setSelectedMethod(null);
      setDwAmount('');
      setDwTxId('');
      setDwSender('');
      setDwMemo('');
    } catch (e) {
      console.error(e);
      showToast("Error submitting request.", 'error');
    }
    setIsSubmitting(false);
  };

  const calculateValue = (coins: string, methodId: string) => {
    const num = parseFloat(coins);
    if (isNaN(num) || num <= 0) return '0.00';
    const rate = coinRates[methodId] || 1;
    return (num * rate).toFixed(2);
  };

  return (
    <div className="flex flex-col min-h-screen -mx-4 -my-6 px-4 py-8 bg-gradient-to-b from-slate-50 to-indigo-50 text-gray-900 overflow-hidden relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'} animate-in slide-in-from-top-4 flex items-center space-x-2`}>
           <CheckCircle2 className={`w-5 h-5 ${toast.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
           <span className="font-bold text-sm whitespace-nowrap">{toast.message}</span>
        </div>
      )}

      {/* Top Tabs */}
      {!selectedMethod && (
        <div className="bg-white rounded-[24px] p-2 xl:p-1.5 mb-6 flex items-center justify-between shadow-[0_4px_0_rgb(229,231,235)] border-2 border-gray-100">
           <button 
             onClick={() => setTab('deposit')}
             className={`flex-1 flex items-center justify-center space-x-1.5 py-3 rounded-[18px] transition-all ${tab === 'deposit' ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold shadow-[0_3px_0_rgb(30,58,138)] transform active:translate-y-[2px] active:shadow-[0_0px_0_rgb(30,58,138)]' : 'text-gray-500 font-semibold hover:text-gray-900 hover:bg-gray-50'}`}
           >
             <ArrowDownToLine className="w-4 h-4" />
             <span className="text-[11px] tracking-widest uppercase">DEPOSIT</span>
           </button>
           <button 
             onClick={() => setTab('withdraw')}
             className={`flex-1 flex items-center justify-center space-x-1.5 py-3 rounded-[18px] transition-all ${tab === 'withdraw' ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold shadow-[0_3px_0_rgb(30,58,138)] transform active:translate-y-[2px] active:shadow-[0_0px_0_rgb(30,58,138)]' : 'text-gray-500 font-semibold hover:text-gray-900 hover:bg-gray-50'}`}
           >
             <WalletIcon className="w-4 h-4" />
             <span className="text-[11px] tracking-widest uppercase">WITHDRAW</span>
           </button>
           <button 
             onClick={() => setTab('transfer')}
             className={`flex-1 flex items-center justify-center space-x-1.5 py-3 rounded-[18px] transition-all ${tab === 'transfer' ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold shadow-[0_3px_0_rgb(30,58,138)] transform active:translate-y-[2px] active:shadow-[0_0px_0_rgb(30,58,138)]' : 'text-gray-500 font-semibold hover:text-gray-900 hover:bg-gray-50'}`}
           >
             <Send className="w-4 h-4 -rotate-45 mb-1" />
             <span className="text-[11px] tracking-widest uppercase">TRANSFER</span>
           </button>
        </div>
      )}

      {selectedMethod ? (
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-gray-100 flex-1 relative animate-in fade-in slide-in-from-bottom-4">
          <button 
            onClick={() => setSelectedMethod(null)}
            className="absolute top-6 left-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex flex-col items-center mt-2 mb-6">
            {selectedMethod.photo ? (
               <img src={selectedMethod.photo} alt={selectedMethod.name} className="w-16 h-16 rounded-2xl mb-3 object-cover shadow-[0_8px_16px_rgba(0,0,0,0.15)] border-2 border-white transform -rotate-3 bg-gray-50" />
            ) : (
               <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black mb-3 shadow-[0_8px_16px_rgba(0,0,0,0.15)] border-2 border-white transform -rotate-3`}>
                 {selectedMethod.name?.charAt(0)}
               </div>
            )}
            <h2 className="text-xl font-black text-[#2C334A] tracking-tight">{tab === 'deposit' ? 'Deposit via' : 'Withdraw to'} {selectedMethod.name}</h2>
          </div>

          {tab === 'deposit' && (
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-6">
              <h3 className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-2">Instructions</h3>
              <p className="text-xs text-indigo-600/80 mb-4 font-medium leading-relaxed">
                Please send your payment to the number/address below, then submit the details to receive your coins.
              </p>
              
              <div className="bg-white p-3 rounded-xl border border-indigo-100 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Admin Account</p>
                  <p className="font-bold text-sm text-[#2C334A]">{selectedMethod.address || 'Not configured'}</p>
                </div>
                <button 
                  onClick={() => handleCopy(selectedMethod.address || '')}
                  className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Amount (Coins)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={dwAmount}
                  onChange={(e) => setDwAmount(e.target.value)}
                  placeholder="e.g. 1000" 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 font-bold focus:outline-none focus:border-blue-500 transition-colors"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">You Will {tab === 'deposit' ? 'Pay' : 'Receive'}</span>
                  <span className="text-sm font-black text-blue-600">{calculateValue(dwAmount, selectedMethod.id)} <span className="text-[10px]">{selectedMethod.name === 'Bkash' || selectedMethod.name === 'Nagad' || selectedMethod.name === 'Roket' ? 'BDT' : selectedMethod.name}</span></span>
                </div>
              </div>
            </div>

            {tab === 'deposit' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">{!selectedMethod.isCrypto ? 'Transaction ID' : 'Order ID / Hash'}</label>
                  <input 
                    type="text" 
                    value={dwTxId}
                    onChange={(e) => setDwTxId(e.target.value)}
                    placeholder="Enter ID" 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 font-bold focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Sender {!selectedMethod.isCrypto ? 'Number' : 'Address'}</label>
                  <input 
                    type="text" 
                    value={dwSender}
                    onChange={(e) => setDwSender(e.target.value)}
                    placeholder={`Your ${selectedMethod.name} ${!selectedMethod.isCrypto ? 'Number' : 'Address'}`} 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 font-bold focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </>
            )}

            {tab === 'withdraw' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Receive {!selectedMethod.isCrypto ? 'Number' : 'Address'}</label>
                  <input 
                    type="text" 
                    value={dwSender}
                    onChange={(e) => setDwSender(e.target.value)}
                    placeholder={`Your ${selectedMethod.name} ${!selectedMethod.isCrypto ? 'Number' : 'Address'}`} 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 font-bold focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Memo (Optional)</label>
                  <input 
                    type="text" 
                    value={dwMemo}
                    onChange={(e) => setDwMemo(e.target.value)}
                    placeholder="Optional memo/tag" 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 font-bold focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </>
            )}

            <button 
              onClick={handleDWSubmit}
              className="w-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 mt-4 rounded-xl font-black text-sm tracking-wide shadow-[0_4px_0_rgb(30,58,138)] flex items-center justify-center space-x-2 transition-transform active:translate-y-[4px] active:shadow-[0_0px_0_rgb(30,58,138)]"
            >
              <span>{tab === 'deposit' ? 'SUBMIT DEPOSIT REQUEST' : 'SUBMIT WITHDRAW REQUEST'}</span>
            </button>
          </div>
        </div>
      ) : tab === 'transfer' ? (
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-gray-100 flex-1 relative animate-in fade-in">
            <div className="text-center mb-6 relative z-10">
                <h2 className="text-[#2C334A] font-black text-lg tracking-tight mb-1 mt-2">P2P Coin Transfer</h2>
                <p className="text-gray-500 text-xs font-medium max-w-[280px] mx-auto">Push coins directly to other members instant free transfer.</p>
            </div>
            {/* Same transfer form as before, restyled */}
            <div className="space-y-5 relative z-10">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Receiver Username / ID {receiverName && <span className="text-green-600">({receiverName})</span>}</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={receiverId}
                            onChange={(e) => setReceiverId(e.target.value)}
                            placeholder="e.g. sayed_pro" 
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl pl-4 pr-[110px] py-3.5 text-gray-900 placeholder-gray-400 font-bold focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button onClick={handleCheckName} disabled={isChecking} className="absolute right-2 top-2 bottom-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-[10px] font-black px-4 rounded-lg transition-colors shadow-sm">
                            {isChecking ? '...' : 'CHECK'}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Amount</label>
                        <span className="text-orange-500 text-[10px] font-black">
                            Balance: <AnimatedCounter value={user?.vaBalance || 0} />
                        </span>
                    </div>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="100" 
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 font-bold focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <button onClick={handleSend} disabled={isSending || !targetUid} className="w-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 mt-2 rounded-xl font-black text-sm tracking-wide shadow-[0_4px_0_rgb(30,58,138)] flex items-center justify-center space-x-2 transition-transform active:translate-y-[4px] active:shadow-[0_0px_0_rgb(30,58,138)] disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_rgb(30,58,138)]">
                    <Send className="w-4 h-4 -rotate-45 mb-1" />
                    <span>{isSending ? 'SENDING...' : 'SEND COINS'}</span>
                </button>
            </div>
        </div>
      ) : (
        <div className="flex-1 animate-in fade-in">
          <div className="text-center mb-6">
              <h2 className="text-[#2C334A] font-black text-xl tracking-tight mb-1 uppercase tracking-wider">Select Method</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{tab === 'deposit' ? 'Choose deposit gateway' : 'Choose withdrawal gateway'}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 px-1">
            {(tab === 'deposit' ? depositMethods : withdrawMethods).map((method: any) => (
              <button 
                key={method.id || method.name}
                onClick={() => setSelectedMethod(method)}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border-2 border-gray-100 shadow-[0_6px_0_rgb(229,231,235)] active:shadow-[0_0px_0_rgb(229,231,235)] active:translate-y-[6px] transform transition-all duration-150 group"
              >
                {method.photo ? (
                  <img src={method.photo} alt={method.name} className="w-14 h-14 rounded-2xl mb-3 object-cover shadow-[0_4px_10px_rgba(0,0,0,0.1)] border-2 border-white group-hover:scale-110 transition-transform bg-gray-50" />
                ) : (
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black mb-3 shadow-[0_4px_10px_rgba(0,0,0,0.1)] border-2 border-white group-hover:scale-110 transition-transform`}>
                    <span className="drop-shadow-md">{method.name?.charAt(0)}</span>
                  </div>
                )}
                <span className="font-extrabold text-[11px] text-[#2C334A] text-center leading-tight">{method.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
