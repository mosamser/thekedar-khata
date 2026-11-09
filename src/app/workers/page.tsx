'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  IndianRupee,
  Briefcase,
  Search,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { Worker, WorkerRole } from '@/lib/types';
import { formatCurrency, formatDateIndian, getRoleBadge, sortWorkersByHierarchy } from '@/lib/utils';
import { AddWorkerModal } from '@/components/AddWorkerModal';
import { EditWorkerModal } from '@/components/EditWorkerModal';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/workers');
      const data = await res.json();
      if (data.success) {
        setWorkers(data.workers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const sortedWorkers = sortWorkersByHierarchy(workers);

  const filteredWorkers = sortedWorkers.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || w.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            मजदूर व कारीगर मास्टर रजिस्टर (Workers Directory)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            मिस्त्री, हेल्पर, रेजा और सामान्य मजदूरों की सूची (पदानुक्रम अनुसार)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          + नया मजदूर जोड़ें
        </button>
      </div>

      {/* Search and Role Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="मजदूर के नाम से खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'ALL', label: 'सभी' },
            { id: 'MISTRI', label: '1. मिस्त्री' },
            { id: 'HELPER', label: '2. हेल्पर' },
            { id: 'REJA', label: '3. रेजा' },
            { id: 'LABOUR', label: '4. मजदूर' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all active:scale-95 ${
                roleFilter === r.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="h-36 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="h-36 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="h-36 bg-slate-200 animate-pulse rounded-2xl" />
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <p className="text-slate-500 text-sm">कोई मजदूर नहीं मिला</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
          >
            <UserPlus className="w-4 h-4" /> पहला मजदूर जोड़ें
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => {
            const roleInfo = getRoleBadge(worker.role);
            const isFemale = worker.gender === 'FEMALE' || worker.role === 'REJA';
            const isMistri = worker.role === 'MISTRI';

            return (
              <div
                key={worker.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 font-black text-sm flex items-center justify-center border border-slate-300 shrink-0">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>{worker.name}</span>
                        {isMistri && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-300">
                            मिस्त्री
                          </span>
                        )}
                      </h3>
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 ${roleInfo.color}`}
                      >
                        {roleInfo.hindi}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {isFemale ? 'महिला' : 'पुरुष'}
                  </span>
                </div>

                {/* Edit Button and Daily Rate Bar */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingWorker(worker)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-900 bg-slate-100 hover:bg-amber-100 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-amber-300 transition-all active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>विवरण सुधारें</span>
                  </button>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">डिफ़ॉल्ट दर</span>
                    <span className="font-black text-slate-900 text-sm">
                      {formatCurrency(worker.defaultRate)}
                      <span className="text-[10px] text-slate-400 font-normal"> /दिन</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Worker Modal */}
      <AddWorkerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onWorkerAdded={() => {
          setIsAddModalOpen(false);
          fetchWorkers();
        }}
      />

      {/* Edit Worker Modal */}
      <EditWorkerModal
        isOpen={!!editingWorker}
        worker={editingWorker}
        onClose={() => setEditingWorker(null)}
        onWorkerUpdated={() => {
          fetchWorkers();
        }}
      />
    </div>
  );
}
