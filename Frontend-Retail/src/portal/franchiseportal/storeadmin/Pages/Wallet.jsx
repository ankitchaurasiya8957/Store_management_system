import React, { useState, useEffect, useContext } from 'react';
import { useFranchise } from '../context/FranchiseContext';
import { AuthContext } from '../../../../context/AuthContext';
import { IndianRupee, ArrowUpRight, ArrowDownRight, History, RefreshCcw, Receipt } from 'lucide-react';
import { fetchWithAuth } from '../../../../utils/api.js';

export default function Wallet() {
  const { metrics, walletTransactions, refreshData } = useFranchise();
  const { user } = useContext(AuthContext) || {};
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'history'
  const [creditHistory, setCreditHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchCreditHistory = async () => {
    if (!user?.userId) return;
    setHistoryLoading(true);
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL || ''}/api/procurement/credit-transactions?userId=${user.userId}`);
      const data = await res.json();
      setCreditHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch credit history', err);
      setCreditHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchCreditHistory();
    }
  }, [user?.userId]);

  const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

  const getHistoryColor = (type) => {
    if (['Assigned', 'Increased', 'Refunded', 'Released'].includes(type)) return 'text-emerald-600';
    return 'text-red-600';
  };

  const getHistoryBadge = (type) => {
    if (['Assigned', 'Increased', 'Refunded', 'Released'].includes(type)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Credit Wallet</h1>
        <p className="text-slate-500">Manage your B2B prepaid balance for AK Solutions orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3 bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <p className="text-indigo-200 text-sm font-semibold tracking-wider uppercase mb-1">Available Balance</p>
                <h2 className="text-5xl font-black flex items-center">
                  <IndianRupee size={40} className="mr-1" />
                  {(metrics.walletBalance || 0).toLocaleString()}
                </h2>
              </div>
              <div className="bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-indigo-200 text-sm font-semibold tracking-wider uppercase mb-1">Total Credit Assigned</p>
                <p className="text-2xl font-bold flex items-center">
                  <IndianRupee size={20} className="mr-1" />
                  {(metrics.totalCredit || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-indigo-500/30">
              <div>
                <p className="text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-1 flex items-center gap-1">
                  <ArrowUpRight size={14} className="text-rose-400" />
                  Used Credit
                </p>
                <p className="text-xl font-bold flex items-center">
                  <IndianRupee size={16} className="mr-1" />
                  {(metrics.usedCredit || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 px-6">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ledger'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
          >
            <Receipt size={16} /> Transaction Ledger
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
          >
            <History size={16} /> Credit History
            {creditHistory.length > 0 && activeTab !== 'history' && (
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{creditHistory.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'ledger' ? (
          /* Transaction Ledger Tab */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Transaction ID</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {walletTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No wallet transactions yet.
                    </td>
                  </tr>
                ) : (
                  walletTransactions.map((txn, index) => (
                    <tr key={txn._id || txn.txnId || index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(txn.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-800">{txn.txnId || txn.id}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1 text-xs font-bold ${txn.type === 'Credit In' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {txn.type === 'Credit In' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">₹{txn.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">₹{txn.closingBalance.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Credit History Tab */
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">All credit limit changes, assignments, and deductions by AK Solutions Admin.</p>
              <button
                onClick={fetchCreditHistory}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCcw size={16} className={historyLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                <p className="text-sm text-slate-500">Loading credit history...</p>
              </div>
            ) : creditHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">No credit history yet</p>
                <p className="text-slate-400 text-sm mt-1">Your credit assignments and deductions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {creditHistory.map((tx) => (
                  <div key={tx._id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-xl shrink-0 border ${getHistoryBadge(tx.type)}`}>
                          {['Assigned', 'Increased', 'Refunded', 'Released'].includes(tx.type)
                            ? <ArrowDownRight size={16} className="text-emerald-600" />
                            : <ArrowUpRight size={16} className="text-red-600" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{tx.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${getHistoryBadge(tx.type)}`}>
                              {tx.type}
                            </span>
                            <span className="text-xs text-slate-400">{new Date(tx.date || tx.createdAt).toLocaleString()}</span>
                          </div>
                          {tx.referenceId && tx.referenceId !== 'ADMIN_UPDATE' && (
                            <p className="text-xs text-slate-400 mt-1">Ref: <span className="font-medium text-slate-600">{tx.referenceId}</span></p>
                          )}
                        </div>
                      </div>
                      <p className={`text-base font-bold shrink-0 ${getHistoryColor(tx.type)}`}>
                        {['Assigned', 'Increased', 'Refunded', 'Released'].includes(tx.type) ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
