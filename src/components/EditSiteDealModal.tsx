'use client';

import React, { useState } from 'react';
import { ArrowLeft, X, IndianRupee, User, Phone, MapPin, FileText, Check } from 'lucide-react';
import { Site, ContractType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface EditSiteDealModalProps {
  isOpen: boolean;
  site: Site;
  onClose: () => void;
  onSiteUpdated: (updatedSite: Site) => void;
}

export function EditSiteDealModal({ isOpen, site, onClose, onSiteUpdated }: EditSiteDealModalProps) {
  const [contractAmount, setContractAmount] = useState<number | ''>(site.contractAmount || '');
  const [contractType, setContractType] = useState<ContractType>(site.contractType || 'LUMP_SUM');
  const [ownerName, setOwnerName] = useState(site.ownerName || '');
  const [ownerPhone, setOwnerPhone] = useState(site.ownerPhone || '');
  const [location, setLocation] = useState(site.location || '');
  const [notes, setNotes] = useState(site.notes || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractAmount: contractAmount ? Number(contractAmount) : 0,
          contractType,
          ownerName: ownerName.trim() || null,
          ownerPhone: ownerPhone.trim() || null,
          location: location.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'अपडेट करने में त्रुटि हुई');
      }

      onSiteUpdated(data.site);
      onClose();
    } catch (err: any) {
      setError(err.message || 'त्रुटि हुई, कृपया पुनः प्रयास करें');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 sm:bg-slate-950/75 sm:backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-4 overflow-y-auto animate-fade-in">
      <div className="min-h-screen sm:min-h-0 bg-white sm:rounded-2xl shadow-xl w-full sm:max-w-lg overflow-hidden border-0 sm:border sm:border-slate-200 flex flex-col justify-between">
        
        {/* Top App Bar Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="वापस जाएं"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">
                ठेका राशि व मालिक हिसाब एडिट करें
              </h3>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[240px]">
                {site.name}
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl font-bold">
              {error}
            </div>
          )}

          {/* SECTION 1: CONTRACT AMOUNT (कुल तय ठेका राशि) */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-300/80 space-y-2">
            <label className="block text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-amber-700" />
              कुल तय ठेका राशि (Total Contract Amount ₹) *
            </label>
            <p className="text-[11px] text-amber-800 font-medium">
              मालिक से इस साइट के लिए तय किया गया पूरा पैसा
            </p>

            <div className="relative pt-1">
              <span className="absolute left-3.5 top-3.5 text-slate-500 font-bold text-lg">
                ₹
              </span>
              <input
                type="number"
                min="0"
                placeholder="जैसे: 350000"
                value={contractAmount}
                onChange={(e) => setContractAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-8 pr-4 py-3 text-lg font-black bg-white border border-amber-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 shadow-2xs"
              />
            </div>

            {/* Quick Helper Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[100000, 250000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setContractAmount(amt)}
                  className="text-[11px] font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg transition-colors active:scale-95"
                >
                  ₹{(amt / 100000)} लाख
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: CONTRACT TYPE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ठेके का प्रकार (Contract Type)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'LUMP_SUM', label: 'एकमुश्त ठेका', sub: 'Lump Sum' },
                { id: 'SQUARE_FEET', label: 'वर्ग फुट दर', sub: 'Sq. Ft.' },
                { id: 'DAILY', label: 'दैनिक हाजिरी', sub: 'Daily Rate' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setContractType(t.id as ContractType)}
                  className={`py-2 px-1 text-center rounded-xl border text-xs transition-all active:scale-95 ${
                    contractType === t.id
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block">{t.label}</span>
                  <span className="text-[10px] opacity-75 font-normal block">{t.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: OWNER DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                मालिक का नाम (Owner Name)
              </label>
              <input
                type="text"
                placeholder="जैसे: गुप्ता जी, शर्मा जी..."
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                मालिक का मोबाइल नंबर
              </label>
              <input
                type="tel"
                placeholder="जैसे: 9876543210"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>
          </div>

          {/* SECTION 4: LOCATION */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              साइट की जगह / पता (Location)
            </label>
            <input
              type="text"
              placeholder="जैसे: सिविल लाइन्स, प्लॉट नं 45..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* SECTION 5: NOTES */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              ठेके की शर्तें / नोट (Notes)
            </label>
            <textarea
              rows={2}
              placeholder="जैसे: सीमेंट-रेत मालिक लाएगा, लेबर ठेकेदार की..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Bottom Sticky Action Bar */}
          <div className="pt-3 sticky bottom-0 bg-white border-t border-slate-100 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-slate-300 rounded-xl text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{loading ? 'अपडेट हो रहा है...' : '✓ ठेका राशि व विवरण सेव करें'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

