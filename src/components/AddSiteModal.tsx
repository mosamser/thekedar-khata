'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Building2, Calendar, MapPin, User, Phone, IndianRupee, Users, Plus, Check } from 'lucide-react';
import { Worker, WorkerRole } from '@/lib/types';
import { getRoleBadge, sortWorkersByHierarchy } from '@/lib/utils';
import { AddWorkerModal } from './AddWorkerModal';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteCreated: (site: any) => void;
}

export function AddSiteModal({ isOpen, onClose, onSiteCreated }: AddSiteModalProps) {
  // Site Basic Info
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  
  // Owner Details (मालिक से हिसाब)
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [contractType, setContractType] = useState<'LUMP_SUM' | 'SQUARE_FEET' | 'DAILY'>('LUMP_SUM');
  const [contractAmount, setContractAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Worker Selection & Rates
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<Record<string, { selected: boolean; customRate: number }>>({});
  
  // Sub-modal for creating a new worker
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all existing registered workers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch('/api/workers')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.workers)) {
            setAvailableWorkers(data.workers);
            // By default, pre-fill map with their default rates
            const initialMap: Record<string, { selected: boolean; customRate: number }> = {};
            data.workers.forEach((w: Worker) => {
              initialMap[w.id] = { selected: false, customRate: w.defaultRate };
            });
            setSelectedWorkers(initialMap);
          }
        })
        .catch((err) => console.error('Failed to load workers:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleWorker = (workerId: string) => {
    setSelectedWorkers((prev) => {
      const current = prev[workerId] || { selected: false, customRate: 500 };
      return {
        ...prev,
        [workerId]: {
          ...current,
          selected: !current.selected,
        },
      };
    });
  };

  const handleRateChange = (workerId: string, rate: number) => {
    setSelectedWorkers((prev) => {
      const current = prev[workerId] || { selected: true, customRate: rate };
      return {
        ...prev,
        [workerId]: {
          ...current,
          customRate: rate,
        },
      };
    });
  };

  const handleSelectAllWorkers = () => {
    setSelectedWorkers((prev) => {
      const updated = { ...prev };
      availableWorkers.forEach((w) => {
        updated[w.id] = {
          selected: true,
          customRate: updated[w.id]?.customRate ?? w.defaultRate,
        };
      });
      return updated;
    });
  };

  const handleDeselectAllWorkers = () => {
    setSelectedWorkers((prev) => {
      const updated = { ...prev };
      availableWorkers.forEach((w) => {
        if (updated[w.id]) {
          updated[w.id].selected = false;
        }
      });
      return updated;
    });
  };

  const handleNewWorkerCreated = (newWorker: Worker) => {
    setAvailableWorkers((prev) => [newWorker, ...prev]);
    // Auto-select this newly created worker for the current site!
    setSelectedWorkers((prev) => ({
      ...prev,
      [newWorker.id]: {
        selected: true,
        customRate: newWorker.defaultRate,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('कृपया साइट का नाम भरें');
      return;
    }
    if (!startDate) {
      setError('कृपया शुरू होने की तारीख चुनें');
      return;
    }

    setLoading(true);
    setError('');

    // Prepare assigned workers list
    const assignedWorkerIds = Object.entries(selectedWorkers)
      .filter(([_, val]) => val.selected)
      .map(([workerId, val]) => ({
        workerId,
        customRate: Number(val.customRate),
      }));

    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          startDate,
          location: location.trim() || null,
          ownerName: ownerName.trim() || null,
          ownerPhone: ownerPhone.trim() || null,
          contractType,
          contractAmount: contractAmount ? Number(contractAmount) : 0,
          notes: notes.trim() || null,
          assignedWorkerIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create site');
      }

      onSiteCreated(data.site);
      onClose();
    } catch (err: any) {
      setError(err.message || 'त्रुटि हुई, कृपया पुनः प्रयास करें');
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = Object.values(selectedWorkers).filter((v) => v.selected).length;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-50 sm:bg-slate-950/75 sm:backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-4 overflow-y-auto animate-fade-in">
        <div className="min-h-screen sm:min-h-0 bg-white sm:rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border-0 sm:border sm:border-slate-200 flex flex-col justify-between">
          {/* Top Header App Bar */}
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
                <h3 className="font-bold text-sm sm:text-lg text-white">नई साइट जोड़ें (Add Site)</h3>
                <p className="text-[11px] text-slate-400">साइट का नाम, तारीख, मालिक का हिसाब और मजदूर जोड़ें</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hidden sm:block text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* SECTION 1: Site Basic Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                साइट की मुख्य जानकारी (Site Details)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    साइट का नाम * <span className="text-slate-400 font-normal">(Site Name)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="जैसे: शर्मा जी कोठी, गोयल प्लाजा"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    शुरू होने की तारीख * <span className="text-slate-400 font-normal">(Start Date)</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  साइट का पता / जगह <span className="text-slate-400 font-normal">(Location)</span>
                </label>
                <input
                  type="text"
                  placeholder="जैसे: प्लॉट 45, सेक्टर 62, या सदर बाजार"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* SECTION 2: Contractor to Owner Details (ठेकेदार का मालिक से हिसाब) */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  ठेकेदार का मालिक से हिसाब (Client / Owner Deal)
                </h4>
                <span className="text-[11px] font-semibold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                  मालिक का खाता
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    मालिक का नाम <span className="text-slate-400 font-normal">(Owner Name)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="जैसे: श्री राजेश शर्मा जी"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    मालिक का मोबाइल नंबर
                  </label>
                  <input
                    type="tel"
                    placeholder="10 अंकों का फोन नंबर"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ठेके का प्रकार <span className="text-slate-400 font-normal">(Contract Type)</span>
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="LUMP_SUM">एकमुश्त तय रकम (Lump Sum Contract)</option>
                    <option value="SQUARE_FEET">स्क्वेयर फीट दर (Sq. Ft Rate)</option>
                    <option value="DAILY">दैनिक दिहाड़ी दर (Daily Wages)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
                    कुल तय ठेका राशि ₹ <span className="text-slate-400 font-normal">(Total Amount)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      placeholder="जैसे: 350000"
                      value={contractAmount}
                      onChange={(e) => setContractAmount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Worker Selection & Inline New Worker Option */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    इस साइट पर काम करने वाले मजदूर चुनें ({selectedCount} चुने गए)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    पुराने मजदूरों को टिक करें या नीचे नए मजदूर को सीधे जोड़ें
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllWorkers}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
                  >
                    सबको चुनें
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllWorkers}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-200 px-2 py-1 rounded-lg"
                  >
                    हटाएं
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWorkerModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1.5 rounded-lg shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    + नया मजदूर बनाएं
                  </button>
                </div>
              </div>

              {/* Workers List with checkboxes & rate adjusters */}
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {availableWorkers.length === 0 ? (
                  <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-xs text-slate-500 mb-2">अभी कोई मजदूर सेव नहीं है।</p>
                    <button
                      type="button"
                      onClick={() => setIsWorkerModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      पहला मजदूर जोड़ें
                    </button>
                  </div>
                ) : (
                  sortWorkersByHierarchy(availableWorkers).map((worker) => {
                    const isSelected = selectedWorkers[worker.id]?.selected ?? false;
                    const customRate = selectedWorkers[worker.id]?.customRate ?? worker.defaultRate;
                    const roleInfo = getRoleBadge(worker.role);

                    return (
                      <div
                        key={worker.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-amber-50/70 border-amber-400 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Checkbox and Worker Name */}
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleWorker(worker.id)}
                            className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 accent-amber-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-slate-800">
                                {worker.name}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${roleInfo.color}`}
                              >
                                {roleInfo.hindi}
                              </span>
                            </div>
                          </div>
                        </label>

                        {/* Rate modifier for this site */}
                        <div className="flex items-center gap-1.5 ml-2">
                          <span className="text-[11px] text-slate-500 font-medium">रेट:</span>
                          <div className="relative w-20">
                            <span className="absolute left-2 top-1.5 text-slate-400 text-xs">₹</span>
                            <input
                              type="number"
                              disabled={!isSelected}
                              value={customRate}
                              onChange={(e) => handleRateChange(worker.id, Number(e.target.value))}
                              className="w-full pl-5 pr-1.5 py-1 text-xs font-bold border border-slate-300 rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 text-right"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400">/दिन</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Notes / Special details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                काम का अतिरिक्त विवरण / नोट <span className="text-slate-400 font-normal">(Notes)</span>
              </label>
              <textarea
                rows={2}
                placeholder="जैसे: सिर्फ लेबर ठेका है, सीमेंट-रेत मालिक लाएगा..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2.5 rounded-xl text-sm font-black shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                {loading ? 'साइट तैयार हो रही है...' : 'नई साइट सेव करें ✓'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sub-Modal for Creating Worker On-The-Fly */}
      <AddWorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        onWorkerAdded={handleNewWorkerCreated}
      />
    </>
  );
}

