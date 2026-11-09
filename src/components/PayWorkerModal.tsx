'use client';

import React, { useState } from 'react';
import { ArrowLeft, X, IndianRupee, Calendar, CreditCard, FileText, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDateIndian } from '@/lib/utils';

interface PayWorkerModalProps {
  isOpen: boolean;
  siteId: string;
  siteName: string;
  worker: {
    workerId: string;
    workerName: string;
    role: string;
    grossAmount: number;
    totalAdvance: number;
    netPayable: number;
  } | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export function PayWorkerModal({
  isOpen,
  siteId,
  siteName,
  worker,
  onClose,
  onPaymentSuccess,
}: PayWorkerModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI'>('CASH');
  const [reason, setReason] = useState('काम पूरा होने पर फाइनल भुगतान (Settlement)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When worker opens, default amount to remaining balance if > 0
  React.useEffect(() => {
    if (worker) {
      if (worker.netPayable > 0) {
        setAmount(worker.netPayable);
      } else {
        setAmount('');
      }
      setError('');
    }
  }, [worker]);

  if (!isOpen || !worker) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('कृपया सही भुगतान रकम (₹) भरें');
      return;
    }
    if (!date) {
      setError('कृपया तारीख चुनें');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/sites/${siteId}/advances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker.workerId,
          date,
          amount: Number(amount),
          reason: reason.trim(),
          paymentMode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save payment');
      }

      onPaymentSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'भुगतान दर्ज करने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 sm:bg-slate-950/75 sm:backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-4 overflow-y-auto animate-fade-in">
      <div className="min-h-screen sm:min-h-0 bg-white sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden border-0 sm:border sm:border-slate-200 flex flex-col justify-between">
        {/* App Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1 -ml-1 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors sm:hidden"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">मजदूर को भुगतान करें (Pay Wages)</h3>
              <p className="text-[11px] text-slate-400">{worker.workerName} • {siteName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="hidden sm:block text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Balance Summary Box */}
          <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-800">
            <div className="flex justify-between items-center text-slate-600">
              <span>कुल बनी मजदूरी:</span>
              <strong className="text-slate-900">{formatCurrency(worker.grossAmount)}</strong>
            </div>
            <div className="flex justify-between items-center text-rose-700">
              <span>पहले लिया खर्चा:</span>
              <strong>-{formatCurrency(worker.totalAdvance)}</strong>
            </div>
            <div className="pt-2 border-t border-amber-200 flex justify-between items-center text-sm font-black text-amber-950">
              <span>बाकी देना है (Balance Due):</span>
              <span className="text-base text-amber-900">{formatCurrency(worker.netPayable)}</span>
            </div>
          </div>

          {/* Amount Field + Quick 1-Tap Fill Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                भुगतान रकम (Amount ₹) *
              </label>

              {worker.netPayable > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(worker.netPayable)}
                  className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 transition-colors"
                >
                  पूरा बाकी भरें (₹{worker.netPayable})
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-base">₹</span>
              <input
                type="number"
                required
                min="1"
                placeholder="रकम लिखें"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-8 pr-3.5 py-2.5 text-lg font-black bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              भुगतान की तारीख *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              भुगतान माध्यम (Payment Mode)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('CASH')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  paymentMode === 'CASH'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                💵 नकद (Cash)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('UPI')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  paymentMode === 'UPI'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                📱 UPI (GPay / PhonePe)
              </button>
            </div>
          </div>

          {/* Payment Reason / Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              भुगतान का कारण / विवरण
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="जैसे: काम पूरा होने पर अंतिम भुगतान"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Sticky Bottom Action Buttons */}
          <div className="flex gap-2.5 pt-3 sticky bottom-0 bg-white border-t border-slate-100 pb-2 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-slate-300 rounded-xl text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'दर्ज कर रहे हैं...' : 'भुगतान दर्ज करें ✓'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

