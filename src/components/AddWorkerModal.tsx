'use client';

import React, { useState } from 'react';
import { ArrowLeft, X, UserPlus, IndianRupee, Briefcase, Check } from 'lucide-react';
import { WorkerRole, WorkerGender } from '@/lib/types';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkerAdded: (newWorker: any) => void;
}

export function AddWorkerModal({ isOpen, onClose, onWorkerAdded }: AddWorkerModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<WorkerGender>('MALE');
  const [role, setRole] = useState<WorkerRole>('MISTRI');
  const [defaultRate, setDefaultRate] = useState<number | ''>(850);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenderChange = (newGender: WorkerGender) => {
    setGender(newGender);
    if (newGender === 'FEMALE') {
      setRole('REJA');
      setDefaultRate(500);
    } else {
      setRole('MISTRI');
      setDefaultRate(850);
    }
  };

  const handleRoleChange = (newRole: WorkerRole) => {
    setRole(newRole);
    if (newRole === 'MISTRI') setDefaultRate(850);
    else if (newRole === 'VELDAR') setDefaultRate(550);
    else if (newRole === 'REJA') setDefaultRate(500);
    else if (newRole === 'LABOUR') setDefaultRate(500);
    else if (newRole === 'CARPENTER') setDefaultRate(900);
    else if (newRole === 'PAINTER') setDefaultRate(750);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('कृपया मजदूर का नाम दर्ज करें');
      return;
    }
    if (!defaultRate || Number(defaultRate) <= 0) {
      setError('कृपया दिहाड़ी दर (Daily Rate) सही दर्ज करें');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          gender,
          role,
          defaultRate: Number(defaultRate),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add worker');
      }

      onWorkerAdded(data.worker);
      setName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'त्रुटि हुई, कृपया पुनः प्रयास करें');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 sm:bg-slate-950/75 sm:backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-4 overflow-y-auto animate-fade-in">
      <div className="min-h-screen sm:min-h-0 bg-white sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden border-0 sm:border sm:border-slate-200 flex flex-col justify-between">
        
        {/* Top App Bar Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1 -ml-1 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="वापस जाएं"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">नया मजदूर जोड़ें (Add Worker)</h3>
              <p className="text-[11px] text-slate-400">नाम, लिंग और दिहाड़ी दर दर्ज करें</p>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Worker Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              मजदूर का नाम * <span className="text-slate-400 font-normal">(Worker Name)</span>
            </label>
            <input
              type="text"
              required
              placeholder="जैसे: रामू, सलीम, शांति देवी..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Gender Selector (पुरुष / महिला) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              लिंग चुनें * <span className="text-slate-400 font-normal">(Gender: Male / Female)</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleGenderChange('MALE')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  gender === 'MALE'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">👨</span>
                <span>पुरुष (Male)</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenderChange('FEMALE')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  gender === 'FEMALE'
                    ? 'bg-pink-50 border-pink-500 text-pink-900 ring-2 ring-pink-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">👩</span>
                <span>महिला (Female)</span>
              </button>
            </div>
          </div>

          {/* Role / Kaam ka prakar (Mistri, Helper, Reja, Labour) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              काम का प्रकार (Role) *
            </label>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as WorkerRole)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
            >
              {gender === 'FEMALE' ? (
                <>
                  <option value="REJA">👩 रेजा (Reja - महिला मजदूर)</option>
                  <option value="LABOUR">👷 सामान्य लेबर (Labour)</option>
                </>
              ) : (
                <>
                  <option value="MISTRI">🏗️ मिस्त्री (Mistri - कारीगर)</option>
                  <option value="VELDAR">🔨 हेल्पर (Helper - पुरुष हेल्पर)</option>
                  <option value="LABOUR">👷 मजदूर / लेबर (Labour)</option>
                  <option value="CARPENTER">🪚 बढ़ई (Carpenter)</option>
                  <option value="PAINTER">🎨 पेंटर (Painter)</option>
                  <option value="OTHER">अन्य (Other)</option>
                </>
              )}
            </select>
          </div>

          {/* Daily Rate (दिहाड़ी) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
              दिहाड़ी दर प्रति दिन (Daily Rate ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                required
                min="100"
                step="50"
                placeholder="500"
                value={defaultRate}
                onChange={(e) => setDefaultRate(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              (मिस्त्री: ₹850, हेल्पर: ₹550, रेजा: ₹500, मजदूर: ₹500)
            </p>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-2.5 pt-3 sticky bottom-0 bg-white border-t border-slate-100">
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
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{loading ? 'जोड़ रहे हैं...' : '✓ नया मजदूर सेव करें'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
