import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, CreditCard, TrendingUp } from 'lucide-react';
import MockPaymentGateway from './MockPaymentGateway';

export default function WalletPage() {
  const { state, dispatch } = useApp();
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  const handleTopUpSuccess = async () => {
    try {
      const response = await api.topUpWallet(topUpAmount);
      if (response.user) {
        dispatch({ type: 'UPDATE_USER', payload: { walletBalance: response.user.walletBalance } });
      }
      if (response.transaction) {
        dispatch({ type: 'ADD_TRANSACTION', payload: response.transaction });
      }
      setShowPaymentGateway(false);
      setShowTopUp(false);
    } catch (err: any) {
      alert('Failed to process top-up: ' + err.message);
    }
  };

  const handleTopUpClick = () => {
    setShowPaymentGateway(true);
  };

  const totalSpent = state.transactions.filter(t => t.type === 'payment' && t.status === 'success').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-black mb-6 animate-slide-up">Wallet</h2>

      {/* Balance Card */}
      <div className="rounded-3xl gradient-green p-7 text-white mb-6 relative overflow-hidden animate-scale-in surface-floating">
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 blur-xl" />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4 blur-xl" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/60 mb-1"><Wallet className="w-4 h-4" /><span className="text-sm font-semibold">Available Balance</span></div>
          <div className="text-5xl font-black mb-6">{formatCurrency(state.user?.walletBalance || 0)}</div>
          <div className="flex gap-6">
            <div><div className="text-xs text-white/50 font-medium">Total Spent</div><div className="font-bold text-lg">{formatCurrency(totalSpent)}</div></div>
            <div><div className="text-xs text-white/50 font-medium">Transactions</div><div className="font-bold text-lg">{state.transactions.length}</div></div>
          </div>
        </div>
      </div>

      <button onClick={() => setShowTopUp(!showTopUp)}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl gradient-green text-white font-bold text-lg mb-6 shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all">
        <Plus className="w-5 h-5" />Top Up Wallet
      </button>

      {showTopUp && (
        <div className={`rounded-3xl border-2 p-5 mb-6 animate-scale-in surface-elevated ${state.darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Add Funds</h3>
            <button onClick={() => setShowTopUp(false)} className="text-sm font-semibold text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
          <div className="grid grid-cols-4 gap-2.5 mb-4">
            {[500, 1000, 2000, 5000].map(amt => (
              <button key={amt} onClick={() => setTopUpAmount(amt)}
                className={`py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${topUpAmount === amt ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' : state.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <input type="number" value={topUpAmount || ''} onChange={e => setTopUpAmount(Number(e.target.value))} placeholder="Enter custom amount"
            className={`w-full px-4 py-3.5 rounded-2xl border-2 mb-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-lg ${state.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
          <button onClick={() => setShowPaymentGateway(true)} disabled={!topUpAmount || topUpAmount <= 0}
            className="w-full py-4 rounded-2xl gradient-green text-white font-bold shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
            Proceed to Pay {formatCurrency(topUpAmount)}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-xl">Transactions</h3><TrendingUp className="w-5 h-5 text-gray-400" /></div>
      <div className="space-y-2.5 stagger">
        {state.transactions.map(txn => (
          <div key={txn.id} className={`flex items-center gap-3.5 p-4 rounded-2xl card-float ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${txn.type === 'top-up' ? 'bg-emerald-500/15 text-emerald-500' : txn.type === 'refund' ? 'bg-blue-500/15 text-blue-500' : 'bg-amber-500/15 text-amber-500'}`}>
              {txn.type === 'top-up' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{txn.description}</p>
              <p className={`text-xs font-medium ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{formatDate(txn.createdAt)}</p>
            </div>
            <span className={`font-black text-sm ${txn.type === 'top-up' || txn.type === 'refund' ? 'text-emerald-500' : 'text-red-500'}`}>
              {txn.type === 'top-up' || txn.type === 'refund' ? '+' : '-'}{formatCurrency(txn.amount)}
            </span>
          </div>
        ))}
        {state.transactions.length === 0 && (
          <div className="text-center py-16"><Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className={state.darkMode ? 'text-gray-500' : 'text-gray-400'}>No transactions yet</p></div>
        )}
      </div>

      {showPaymentGateway && (
        <MockPaymentGateway
          amount={topUpAmount}
          onSuccess={handleTopUpSuccess}
          onClose={() => setShowPaymentGateway(false)}
        />
      )}
    </div>
  );
}
