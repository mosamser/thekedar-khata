'use client';

import React, { useState } from 'react';
import { X, ArrowLeft, IndianRupee, Calendar, Layers, CreditCard, FileText } from 'lucide-react';

interface AddOwnerPaymentModalProps {
  isOpen: boolean;
  siteId: string;
  siteName: string;
  ownerName?: string | null;
  onClose: () => void;
  onPaymentAdded: () => void;
}

export function AddOwnerPaymentModal({
  isOpen,
  siteId,
  siteName,
  ownerName,
  onClose,
  onPaymentAdded,
}: AddOwnerPaymentModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [stage, setStage] = useState('छत / लेंटर ढलाई किश्त');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CHEQUE' | 'BANK_TRANSFER'>('CASH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('कृपया प्राप्त रकम (Amount ₹) सही भरें');
      return;
    }
    if (!date) {
      setError('कृपया तारीख चुनें');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/sites/${siteId}/owner-payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          amount: Number(amount),
          stage,
          paymentMode,
          notes,
          receivedBy: 'पापा (ठेकेदार)',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save owner payment');
      }

      onPaymentAdded();
      setAmount('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'त्रुटि हुई, कृपया पुनः प्रयास करें');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 sm:bg-slate-950/75 sm:flex sm:items-center sm:justify-center sm:p-4 overflow-y-auto">
      <div className="min-h-screen sm:min-h-0 bg-white sm:rounded-2xl shadow-2xl max-w-md w-full flex flex-col sm:border border-slate-200">
        {/* App Bar / Header */}
        <div className="bg-slate-900 text-white px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden text-slate-300 hover:text-white p-1 -ml-1 rounded-lg"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">मालिक से पैसा प्राप्त दर्ज करें</h3>
              <p className="text-xs text-slate-400">
                {ownerName ? `${ownerName} (${siteName})` : siteName}
              </p>
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Amount ₹ */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                प्राप्त रकम (Amount ₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-base">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-8 pr-3.5 py-2.5 text-lg font-black bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                प्राप्ति की तारीख * <span className="text-slate-400 font-normal">(Payment Date)</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Stage / Kisht */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                किस काम की किश्त / स्टेज <span className="text-slate-400 font-normal">(Work Stage)</span>
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="काम शुरू होने पर एडवांस">काम शुरू होने पर एडवांस (Initial Advance)</option>
                <option value="नींव / बुनियाद भराई किश्त">नींव / बुनियाद भराई किश्त (Foundation)</option>
                <option value="ग्राउंड फ्लोर दीवार किश्त">ग्राउंड फ्लोर दीवार किश्त (Ground Walls)</option>
                <option value="छत / लेंटर ढलाई किश्त">छत / लेंटर ढलाई किश्त (Slab / Lintel)</option>
                <option value="प्रथम तल निर्माण किश्त">प्रथम तल निर्माण किश्त (1st Floor)</option>
                <option value="प्लास्टर और टाइल किश्त">प्लास्टर और टाइल किश्त (Plaster / Tile)</option>
                <option value="रंग-रोगन / पेंट किश्त">रंग-रोगन / पेंट किश्त (Paint)</option>
                <option value="फाइनल हिसाब / अंतिम भुगतान">फाइनल हिसाब / अंतिम भुगतान (Final Settlement)</option>
                <option value="अन्य खर्च">अन्य खर्च (Other)</option>
              </select>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                भुगतान का माध्यम <span className="text-slate-400 font-normal">(Payment Mode)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'CASH', label: '💵 नकद (Cash)' },
                  { id: 'UPI', label: '📱 UPI (GPay/PhonePe)' },
                  { id: 'CHEQUE', label: '🧾 चेक (Cheque)' },
                  { id: 'BANK_TRANSFER', label: '🏦 बैंक ट्रांसफर (NEFT)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMode(m.id as any)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-left transition-all ${
                      paymentMode === m.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                विवरण / चेक नंबर / नोट
              </label>
              <input
                type="text"
                placeholder="जैसे: चेक नंबर 440212 या Google Pay से आया"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons: Sticky Bottom Bar on Mobile */}
          <div className="pt-4 border-t border-slate-100 flex gap-2.5 sticky bottom-0 bg-white pb-2 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 sm:py-2.5 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 sm:py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'दर्ज कर रहे हैं...' : 'पेमेंट सेव करें ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
