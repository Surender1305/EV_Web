import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building, CheckCircle, ShieldCheck, ChevronRight, Lock, RefreshCw, Zap } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useApp } from '../context/AppContext';

interface MockPaymentGatewayProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

type PaymentMethod = 'card' | 'upi' | 'netbanking';
type PaymentState = 'method_selection' | 'details_input' | 'processing' | 'otp' | 'success' | 'failed';

export default function MockPaymentGateway({ amount, onSuccess, onClose }: MockPaymentGatewayProps) {
  const { state } = useApp();
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [paymentState, setPaymentState] = useState<PaymentState>('method_selection');
  
  // Card Details State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(state.user?.name || '');
  const [isFlipped, setIsFlipped] = useState(false);

  // OTP State
  const [otp, setOtp] = useState('');
  const mockOtp = '123456';

  // Format Card Number (adds spaces)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length > 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setCardExpiry(val);
  };

  const handlePayClick = () => {
    if (method === 'card') {
      if (cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3 || !cardHolder) {
        alert('Please fill all card details correctly.');
        return;
      }
    }
    setPaymentState('processing');
    
    // Simulate initial processing then go to OTP or UPI approval
    setTimeout(() => {
      if (method === 'card' || method === 'netbanking') {
        setPaymentState('otp');
      } else {
        // For UPI, simulate success directly after some time
        simulateSuccess();
      }
    }, 2000);
  };

  const verifyOtp = () => {
    if (otp !== mockOtp && otp !== '000000') {
      alert('Invalid OTP. Use 123456 for testing.');
      return;
    }
    setPaymentState('processing');
    setTimeout(() => {
      simulateSuccess();
    }, 1500);
  };

  const simulateSuccess = () => {
    setPaymentState('success');
    setTimeout(() => {
      onSuccess();
    }, 2500);
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 text-sm font-medium
    ${state.darkMode 
      ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20' 
      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500/20'}`;

  const renderCard3D = () => (
    <div className="relative w-full max-w-sm mx-auto h-48 mb-8 perspective-1000" style={{ perspective: '1000px' }}>
      <div 
        className="w-full h-full relative transition-transform duration-700" 
        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front of Card */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden"
          style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
        >
          {/* Card visual elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-8 bg-yellow-400/80 rounded-md shadow-sm"></div>
            <Zap className="w-6 h-6 text-emerald-400 opacity-80" />
          </div>
          
          <div className="relative z-10">
            <div className="font-mono text-xl tracking-widest mb-2 shadow-sm">
              {cardNumber || '•••• •••• •••• ••••'}
            </div>
            <div className="flex justify-between text-xs text-gray-300 font-medium uppercase tracking-wider">
              <span>{cardHolder || 'CARDHOLDER NAME'}</span>
              <span>{cardExpiry || 'MM/YY'}</span>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl text-white shadow-2xl flex flex-col justify-center overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
        >
          <div className="w-full h-10 bg-black/80 mb-4"></div>
          <div className="px-6 flex flex-col items-end">
            <div className="text-[10px] text-gray-400 mb-1 font-bold">CVV</div>
            <div className="bg-white text-gray-900 px-3 py-1.5 rounded text-sm w-full text-right font-mono tracking-widest h-8 flex items-center justify-end">
              {cardCvv || '•••'}
            </div>
            <div className="text-[8px] text-gray-500 mt-4 text-right max-w-[80%] opacity-60">
              This card is for demonstration purposes. Do not enter real card details.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={() => paymentState === 'method_selection' || paymentState === 'details_input' ? onClose() : null}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 ${state.darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
        
        {/* Header */}
        <div className={`px-6 py-5 border-b flex justify-between items-center ${state.darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className={`font-black text-lg ${state.darkMode ? 'text-white' : 'text-gray-900'}`}>Secure Checkout</h3>
              <p className={`text-xs font-semibold ${state.darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Test Environment</p>
            </div>
          </div>
          {paymentState !== 'processing' && paymentState !== 'success' && (
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 relative">
          
          {/* STATE: SUCCESS */}
          {paymentState === 'success' && (
            <div className="py-8 text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className={`text-2xl font-black mb-2 ${state.darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Successful!</h2>
              <p className={`text-sm mb-6 ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>₹{amount} has been added to your wallet.</p>
              <div className={`p-4 rounded-2xl text-sm font-mono ${state.darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                Txn ID: MOCK_{Date.now().toString().slice(-8)}
              </div>
            </div>
          )}

          {/* STATE: FAILED */}
          {paymentState === 'failed' && (
            <div className="py-8 text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"></div>
                <X className="w-12 h-12 text-red-500" />
              </div>
              <h2 className={`text-2xl font-black mb-2 ${state.darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Failed</h2>
              <p className={`text-sm mb-6 ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Transaction was declined by the bank.</p>
              <div className={`p-4 rounded-2xl text-sm font-mono ${state.darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                Reason: INSUFFICIENT_FUNDS
              </div>
              <button onClick={onClose} className="mt-6 w-full py-4 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                Return to Wallet
              </button>
            </div>
          )}

          {/* STATE: PROCESSING */}
          {paymentState === 'processing' && (
            <div className="py-12 text-center animate-in fade-in duration-300">
              <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-6" />
              <h2 className={`text-xl font-bold mb-2 ${state.darkMode ? 'text-white' : 'text-gray-900'}`}>Processing securely...</h2>
              <p className={`text-sm ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Please do not close this window or press back.</p>
            </div>
          )}

          {/* STATE: OTP */}
          {paymentState === 'otp' && (
            <div className="py-4 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-6">
                <h2 className={`text-xl font-bold mb-2 ${state.darkMode ? 'text-white' : 'text-gray-900'}`}>Bank Verification</h2>
                <p className={`text-sm ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  We've sent a mock OTP to your registered number.<br/>
                  <span className="text-emerald-500 font-semibold text-xs bg-emerald-500/10 px-2 py-1 rounded-full mt-2 inline-block">Hint: Use {mockOtp}</span>
                </p>
              </div>
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className={`text-center tracking-[0.5em] text-2xl font-mono ${inputClass} py-4 mb-6`}
              />
              <button onClick={verifyOtp} className="w-full py-4 rounded-xl gradient-green text-white font-bold shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-95">
                Verify & Authorize
              </button>
            </div>
          )}

          {/* STATE: DETAILS INPUT */}
          {paymentState === 'details_input' && (
            <div className="animate-in slide-in-from-right duration-300">
              
              {method === 'card' && (
                <>
                  {renderCard3D()}
                  <div className="space-y-4 mb-6">
                    <div>
                      <input type="text" placeholder="Card Number" value={cardNumber} onChange={handleCardNumberChange} onFocus={() => setIsFlipped(false)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={handleExpiryChange} onFocus={() => setIsFlipped(false)} className={inputClass} />
                      <input type="password" placeholder="CVV" maxLength={3} value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))} onFocus={() => setIsFlipped(true)} onBlur={() => setIsFlipped(false)} className={inputClass} />
                    </div>
                    <div>
                      <input type="text" placeholder="Cardholder Name" value={cardHolder} onChange={(e) => setCardHolder(e.target.value.toUpperCase())} onFocus={() => setIsFlipped(false)} className={inputClass} />
                    </div>
                  </div>
                </>
              )}

              {method === 'upi' && (
                <div className="py-6 text-center">
                  <div className="bg-white p-4 rounded-xl inline-block mb-6 relative">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=test@upi&pn=EV+Link&am=${amount}&cu=INR`} alt="Mock QR" className="w-full h-full object-contain opacity-80 mix-blend-multiply" />
                  </div>
                  <h3 className={`font-bold mb-2 ${state.darkMode ? 'text-white' : 'text-gray-900'}`}>Scan to Pay ₹{amount}</h3>
                  <p className={`text-sm mb-6 ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Scan with GPay, PhonePe, or Paytm</p>
                  
                  <div className="relative flex py-4 items-center mb-6">
                    <div className="flex-grow border-t border-gray-300/30"></div>
                    <span className={`flex-shrink-0 mx-4 text-xs font-semibold ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>OR ENTER UPI ID</span>
                    <div className="flex-grow border-t border-gray-300/30"></div>
                  </div>
                  
                  <input type="text" placeholder="username@bank" className={`${inputClass} mb-6`} />
                </div>
              )}

              {method === 'netbanking' && (
                <div className="py-4">
                  <p className={`text-sm font-semibold mb-4 ${state.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select your bank:</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(bank => (
                      <button key={bank} className={`p-3 rounded-xl border flex items-center justify-center font-bold text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 active:scale-95 ${state.darkMode ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setPaymentState('method_selection')} className={`px-4 py-3.5 rounded-xl font-bold transition-colors ${state.darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Back
                </button>
                <button onClick={handlePayClick} className="flex-1 py-3.5 rounded-xl gradient-green text-white font-bold shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95">
                  <Lock className="w-4 h-4" /> Pay ₹{amount}
                </button>
              </div>
            </div>
          )}

          {/* STATE: METHOD SELECTION */}
          {paymentState === 'method_selection' && (
            <div className="animate-in fade-in duration-300">
              <div className={`p-5 rounded-2xl mb-6 flex justify-between items-center ${state.darkMode ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${state.darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Amount to Pay</p>
                  <p className={`text-3xl font-black ${state.darkMode ? 'text-white' : 'text-gray-900'}`}>₹{amount}</p>
                </div>
              </div>

              <p className={`text-xs font-bold uppercase tracking-wider mb-3 ml-1 ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Select Payment Method</p>
              
              <div className="space-y-3 mb-6">
                <button onClick={() => { setMethod('card'); setPaymentState('details_input'); }} className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between group transition-all ${state.darkMode ? 'border-gray-800 bg-gray-800/50 hover:border-emerald-500' : 'border-gray-100 bg-white hover:border-emerald-500 shadow-sm hover:shadow-md'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className={`font-bold text-sm ${state.darkMode ? 'text-white' : 'text-gray-900'}`}>Credit / Debit Card</p>
                      <p className={`text-xs font-medium ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Visa, Mastercard, RuPay</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${state.darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                </button>

                <button onClick={() => { setMethod('upi'); setPaymentState('details_input'); }} className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between group transition-all ${state.darkMode ? 'border-gray-800 bg-gray-800/50 hover:border-emerald-500' : 'border-gray-100 bg-white hover:border-emerald-500 shadow-sm hover:shadow-md'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-left">
                      <p className={`font-bold text-sm ${state.darkMode ? 'text-white' : 'text-gray-900'}`}>UPI Apps</p>
                      <p className={`text-xs font-medium ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>GPay, PhonePe, Paytm</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${state.darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                </button>

                <button onClick={() => { setMethod('netbanking'); setPaymentState('details_input'); }} className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between group transition-all ${state.darkMode ? 'border-gray-800 bg-gray-800/50 hover:border-emerald-500' : 'border-gray-100 bg-white hover:border-emerald-500 shadow-sm hover:shadow-md'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Building className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="text-left">
                      <p className={`font-bold text-sm ${state.darkMode ? 'text-white' : 'text-gray-900'}`}>Net Banking</p>
                      <p className={`text-xs font-medium ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>All major Indian banks</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${state.darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
