'use client';

import React, { useState } from 'react';
import { X, ArrowLeft, IndianRupee, Calendar, ShoppingBag, FileText, Tag } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  siteId: string;
  siteName: string;
  onClose: () => void;
  onExpenseAdded: () => void;
}

export function AddExpenseModal({
  isOpen,
  siteId,
  siteName,
  onClose,
  onExpenseAdded,
}: AddExpenseModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<'MATERIAL' | 'TRANSPORT' | 'TOOLS' | 'TEA_SNACKS' | 'OTHER'>('MATERIAL');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('कृपया खर्चे की रकम (Amount ₹) सही भरें');
      return;
    }
    if (!date) {
      setError('कृपया तारीख चुनें');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/sites/${siteId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          category,
          amount: Number(amount),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save expense');
      }

      onExpenseAdded();
      setAmount('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'खर्चा सेव करने में त्रुटि हुई');
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
            <div className="bg-rose-500 text-white p-2 rounded-xl font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">साइट का अन्य खर्चा लिखें</h3>
              <p className="text-xs text-slate-400">{siteName}</p>
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
                <IndianRupee className="w-3.5 h-3.5 text-rose-600" />
                खर्चे की रकम (Amount ₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-base">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="2500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-8 pr-3.5 py-2.5 text-lg font-black bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                खर्चे की तारीख * <span className="text-slate-400 font-normal">(Expense Date)</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                खर्चे की श्रेणी (Expense Category) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
              >
                <option value="MATERIAL">सामग्री / माल (रेत, सीमेंट, गिट्टी, ईंट, सरिया, पानी टैंकर)</option>
                <option value="TRANSPORT">भाड़ा / किराया (ट्रैक्टर, टेम्पो, ढुलाई भाड़ा)</option>
                <option value="TOOLS">मशीनरी / औजार किराया (मिक्सर मशीन, वाइब्रेटर, तगाड़ी)</option>
                <option value="TEA_SNACKS">चाय-नाश्ता (मजदूरों का चाय-नाश्ता खर्च)</option>
                <option value="OTHER">अन्य फुटकर खर्च (बिजली, डीजल, प्लास्टिक, आदि)</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                विवरण / नोट (किस चीज पर खर्च हुआ)
              </label>
              <input
                type="text"
                placeholder="जैसे: 1 ट्रॉली लाल रेत, 10 कट्टे सीमेंट, या टेम्पो भाड़ा"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
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
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 sm:py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'सेव हो रहा है...' : 'खर्चा सेव करें ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
