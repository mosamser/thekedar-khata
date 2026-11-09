'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Building2,
  Users,
  IndianRupee,
  Save,
  AlertCircle,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Edit2
} from 'lucide-react';
import { Site, Worker, AttendanceStatus } from '@/lib/types';
import { formatCurrency, formatDateIndian, getRoleBadge, sortWorkersByHierarchy } from '@/lib/utils';
import { WorkerGender } from '@/lib/types';

interface AttendanceEntry {
  workerId: string;
  workerName: string;
  gender: WorkerGender;
  role: string;
  rate: number;
  status: AttendanceStatus;
  overtimeHours: number;
  advanceAmount: number;
  advanceReason: string;
}

export default function DailyAttendancePage() {
  const params = useParams();
  const siteId = params.id as string;

  const [site, setSite] = useState<Site | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingAdvanceWorkerId, setEditingAdvanceWorkerId] = useState<string | null>(null);

  // Fetch site info and attendance records for selected date
  const loadData = async (selectedDate: string) => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const [siteRes, attRes] = await Promise.all([
        fetch(`/api/sites/${siteId}`).then((r) => r.json()),
        fetch(`/api/sites/${siteId}/attendance?date=${selectedDate}`).then((r) => r.json()),
      ]);

      if (siteRes.success && siteRes.site) {
        setSite(siteRes.site);
        const siteWorkers = siteRes.siteWorkers || siteRes.site.siteWorkers || [];
        const existingAtts = attRes.attendances || [];
        const existingAdvs = attRes.advances || [];

        // Build entries list sorted by hierarchy: Mistri -> Helper -> Reja -> Labour
        const initialEntries: AttendanceEntry[] = siteWorkers.map((sw: any) => {
          const w = sw.worker;
          const existing = existingAtts.find((a: any) => a.workerId === sw.workerId);
          const existingAdv = existingAdvs.find((adv: any) => adv.workerId === sw.workerId);

          return {
            workerId: sw.workerId,
            workerName: w?.name || 'मजदूर',
            gender: w?.gender || (w?.role === 'REJA' ? 'FEMALE' : 'MALE'),
            role: w?.role || 'LABOUR',
            rate: sw.customRate ?? w?.defaultRate ?? 500,
            status: existing ? existing.status : 'PRESENT',
            overtimeHours: existing ? existing.overtimeHours : 0,
            advanceAmount: existingAdv ? existingAdv.amount : 0,
            advanceReason: existingAdv ? existingAdv.reason : '',
          };
        });

        setEntries(sortWorkersByHierarchy(initialEntries));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('डेटा लोड करने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(date);
  }, [siteId, date]);

  // Bulk actions
  const markAllStatus = (newStatus: AttendanceStatus) => {
    setEntries((prev) =>
      prev.map((e) => ({
        ...e,
        status: newStatus,
      }))
    );
  };

  // Change individual status
  const handleStatusChange = (workerId: string, status: AttendanceStatus) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.workerId === workerId
          ? {
              ...e,
              status,
              overtimeHours: status === 'OVERTIME' && e.overtimeHours === 0 ? 2 : e.overtimeHours,
            }
          : e
      )
    );
  };

  const handleOvertimeChange = (workerId: string, hours: number) => {
    setEntries((prev) =>
      prev.map((e) => (e.workerId === workerId ? { ...e, overtimeHours: hours } : e))
    );
  };

  const handleAdvanceChange = (workerId: string, amount: number, reason?: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.workerId === workerId
          ? {
              ...e,
              advanceAmount: amount,
              advanceReason: reason !== undefined ? reason : e.advanceReason,
            }
          : e
      )
    );
  };

  // Shift date backward / forward like flipping diary pages
  const shiftDate = (days: number) => {
    const [y, m, d] = date.split('-').map(Number);
    const curr = new Date(y, m - 1, d);
    curr.setDate(curr.getDate() + days);
    const ny = curr.getFullYear();
    const nm = String(curr.getMonth() + 1).padStart(2, '0');
    const nd = String(curr.getDate()).padStart(2, '0');
    setDate(`${ny}-${nm}-${nd}`);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const records = entries.map((e) => ({
        workerId: e.workerId,
        status: e.status,
        overtimeHours: e.overtimeHours,
        advanceAmount: e.advanceAmount,
        advanceReason: e.advanceReason || 'दैनिक खर्चा',
      }));

      const res = await fetch(`/api/sites/${siteId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save attendance');
      }

      setSuccessMessage('✓ हाजिरी और खर्चा सफलतापूर्वक सेव हो गया!');
      setEditingAdvanceWorkerId(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'हाजिरी सेव करने में त्रुटि हुई');
    } finally {
      setSaving(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const presentCount = entries.filter((e) => e.status === 'PRESENT' || e.status === 'OVERTIME').length;
  const halfDayCount = entries.filter((e) => e.status === 'HALF_DAY').length;
  const absentCount = entries.filter((e) => e.status === 'ABSENT').length;
  const otCount = entries.filter((e) => e.status === 'OVERTIME').length;
  const totalAdvanceToday = entries.reduce((sum, e) => sum + (Number(e.advanceAmount) || 0), 0);
  const workersWithAdvanceCount = entries.filter((e) => (Number(e.advanceAmount) || 0) > 0).length;

  return (
    <div className="space-y-4 pb-28 md:pb-16 max-w-3xl mx-auto">
      {/* 1. TOP APP BAR & DATE FLIPPER (Clean Native App Header) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Navigation & Site Title */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <Link
            href={`/sites/${siteId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span className="truncate max-w-[200px]">{site?.name || 'साइट पर वापस'}</span>
          </Link>

          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            दैनिक हाजिरी डायरी
          </span>
        </div>

        {/* Date Selector Row with Previous / Next Day Flipping */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => shiftDate(-1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors active:scale-95"
              title="पिछला दिन"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                {date === todayStr ? 'आज की तारीख' : date === yesterdayStr ? 'कल की तारीख' : 'चुनी गई तारीख'}
              </span>
              <strong className="text-sm sm:text-base font-black text-slate-900 block leading-tight">
                {formatDateIndian(date)}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => shiftDate(1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors active:scale-95"
              title="अगला दिन"
              aria-label="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Date Pills: Yesterday / Today / Calendar Native Picker */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setDate(yesterdayStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                date === yesterdayStr
                  ? 'bg-slate-900 text-white font-black shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              कल
            </button>
            <button
              type="button"
              onClick={() => setDate(todayStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                date === todayStr
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              आज
            </button>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-9 h-8 opacity-0 absolute inset-0 cursor-pointer"
                title="कैलेंडर से तारीख चुनें"
              />
              <div className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 pointer-events-none flex items-center justify-center">
                <Calendar className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ROLL-CALL SUMMARY & ADVANCE STATS BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Metric Cards Grid: 4 columns on desktop/tablet, 2x2 grid on mobile */}
        <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-gradient-to-b from-slate-50/70 to-white">
          {/* Card 1: P - उपस्थित */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-2.5 sm:p-3 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center shrink-0 shadow-2xs">
                  P
                </span>
                <span className="text-[11px] font-black text-emerald-950 uppercase tracking-tight truncate">
                  उपस्थित
                </span>
              </div>
              <span className="text-[10px] text-emerald-700/90 font-bold block">
                पूरा दिन काम
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 shrink-0 pl-1.5">
              {presentCount}
            </div>
          </div>

          {/* Card 2: HD - आधा दिन */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-2.5 sm:p-3 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center shrink-0 shadow-2xs">
                  HD
                </span>
                <span className="text-[11px] font-black text-amber-950 uppercase tracking-tight truncate">
                  आधा दिन
                </span>
              </div>
              <span className="text-[10px] text-amber-700/90 font-bold block">
                0.5 हाजिरी
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 shrink-0 pl-1.5">
              {halfDayCount}
            </div>
          </div>

          {/* Card 3: A - गैरहाजिर */}
          <div className="bg-rose-50/80 border border-rose-200/90 rounded-xl p-2.5 sm:p-3 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shrink-0 shadow-2xs">
                  A
                </span>
                <span className="text-[11px] font-black text-rose-950 uppercase tracking-tight truncate">
                  गैरहाजिर
                </span>
              </div>
              <span className="text-[10px] text-rose-700/90 font-bold block">
                छुट्टी
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-700 shrink-0 pl-1.5">
              {absentCount}
            </div>
          </div>

          {/* Card 4: आज दिया कुल खर्चा (पेशगी) */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/15 to-amber-500/20 border border-amber-300 rounded-xl p-2.5 sm:p-3 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0 shadow-2xs">
                  ₹
                </span>
                <span className="text-[11px] font-black text-amber-950 uppercase tracking-tight truncate">
                  कुल खर्चा
                </span>
              </div>
              <span className="text-[10px] text-amber-800 font-bold block truncate">
                {workersWithAdvanceCount > 0 ? `${workersWithAdvanceCount} को पेशगी` : 'आज 0 खर्चा'}
              </span>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 shrink-0 pl-1 text-right">
              {formatCurrency(totalAdvanceToday)}
            </div>
          </div>
        </div>

        {/* Action Row: Roll call summary on left, quick bulk buttons on right */}
        <div className="px-3 sm:px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>कुल दर्ज: <strong className="text-slate-900">{entries.length}</strong> मजदूर</span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => markAllStatus('PRESENT')}
              className="inline-flex items-center gap-1 text-xs font-black bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all"
              title="1-टैप में सभी को हाजिर लगाएं"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>⚡ सब हाजिर लगाएं</span>
            </button>
            <button
              type="button"
              onClick={() => markAllStatus('ABSENT')}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-200 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-colors active:scale-95"
            >
              सब गैरहाजिर
            </button>
          </div>
        </div>
      </div>

      {/* Success / Error Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-2xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. WORKERS ATTENDANCE & ADVANCE LIST */}
      {loading ? (
        <div className="space-y-2.5">
          <div className="h-24 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="h-24 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="h-24 bg-slate-200 animate-pulse rounded-2xl" />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 font-bold">
            इस साइट पर अभी कोई मजदूर नहीं जुड़ा है।
          </p>
          <Link
            href={`/sites/${siteId}`}
            className="inline-flex items-center gap-1.5 text-xs font-black bg-amber-500 text-slate-950 px-4 py-2 rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>साइट पर मजदूर जोड़ें</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {entries.map((entry) => {
            const isEditingAdvance = editingAdvanceWorkerId === entry.workerId;
            const hasAdvance = entry.advanceAmount > 0;

            return (
              <div
                key={entry.workerId}
                className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3 transition-all"
              >
                {/* Worker Info Row: Name, Hierarchy Tag & Rate */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-800 font-black text-xs flex items-center justify-center border border-slate-200 shrink-0 shadow-2xs">
                      {entry.workerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-sm text-slate-900 truncate">
                          {entry.workerName}
                        </span>
                        {entry.role === 'MISTRI' && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                            मिस्त्री
                          </span>
                        )}
                        {entry.role === 'HELPER' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                            हेल्पर
                          </span>
                        )}
                        {entry.role === 'REJA' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-100 text-pink-900 border border-pink-200">
                            रेजा
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {entry.gender === 'FEMALE' ? 'महिला' : 'पुरुष'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">
                      दिहाड़ी
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(entry.rate)}
                    </span>
                    <span className="text-[9px] text-slate-400 block -mt-0.5">/दिन</span>
                  </div>
                </div>

                {/* 4-Segment Attendance Toggle (P, HD, A, OT) */}
                <div>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {/* P - Present */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(entry.workerId, 'PRESENT')}
                      className={`py-2 px-1 rounded-lg text-xs transition-all flex flex-col items-center justify-center active:scale-95 ${
                        entry.status === 'PRESENT'
                          ? 'bg-emerald-600 text-white font-black shadow-xs ring-1 ring-emerald-700'
                          : 'text-slate-700 hover:bg-slate-200/80 font-bold'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">P</span>
                      <span className="text-[9.5px] leading-tight opacity-90">पूरा दिन</span>
                    </button>

                    {/* HD - Half Day */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(entry.workerId, 'HALF_DAY')}
                      className={`py-2 px-1 rounded-lg text-xs transition-all flex flex-col items-center justify-center active:scale-95 ${
                        entry.status === 'HALF_DAY'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-1 ring-amber-600'
                          : 'text-slate-700 hover:bg-slate-200/80 font-bold'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">HD</span>
                      <span className="text-[9.5px] leading-tight opacity-90">आधा दिन</span>
                    </button>

                    {/* A - Absent */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(entry.workerId, 'ABSENT')}
                      className={`py-2 px-1 rounded-lg text-xs transition-all flex flex-col items-center justify-center active:scale-95 ${
                        entry.status === 'ABSENT'
                          ? 'bg-rose-600 text-white font-black shadow-xs ring-1 ring-rose-700'
                          : 'text-slate-700 hover:bg-slate-200/80 font-bold'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">A</span>
                      <span className="text-[9.5px] leading-tight opacity-90">छुट्टी</span>
                    </button>

                    {/* OT - Overtime */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(entry.workerId, 'OVERTIME')}
                      className={`py-2 px-1 rounded-lg text-xs transition-all flex flex-col items-center justify-center active:scale-95 ${
                        entry.status === 'OVERTIME'
                          ? 'bg-indigo-600 text-white font-black shadow-xs ring-1 ring-indigo-700'
                          : 'text-slate-700 hover:bg-slate-200/80 font-bold'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">OT</span>
                      <span className="text-[9.5px] leading-tight opacity-90">ओवरटाइम</span>
                    </button>
                  </div>

                  {/* Overtime Hours Quick Bar (Inline) */}
                  {entry.status === 'OVERTIME' && (
                    <div className="mt-2 bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span>ओवरटाइम घंटे:</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => handleOvertimeChange(entry.workerId, h)}
                            className={`px-2 py-1 rounded-lg text-xs font-black transition-all ${
                              entry.overtimeHours === h
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-white text-indigo-900 border border-indigo-200'
                            }`}
                          >
                            {h}h
                          </button>
                        ))}
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={entry.overtimeHours || 2}
                          onChange={(e) => handleOvertimeChange(entry.workerId, Number(e.target.value))}
                          className="w-12 px-1.5 py-1 text-center font-black bg-white border border-indigo-300 rounded-lg text-xs text-indigo-950"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Smart Kharcha / Advance Section (Compact & Clutter-Free) */}
                <div>
                  {hasAdvance && !isEditingAdvance ? (
                    <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded-md bg-amber-500 text-slate-950 font-black text-[10px]">
                          ₹
                        </span>
                        <div>
                          <span className="font-black text-amber-950">
                            पेशगी दी: {formatCurrency(entry.advanceAmount)}
                          </span>
                          {entry.advanceReason && (
                            <span className="text-slate-500 text-[11px] ml-1">({entry.advanceReason})</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingAdvanceWorkerId(entry.workerId)}
                          className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-lg transition-colors"
                        >
                          बदलें
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdvanceChange(entry.workerId, 0, '')}
                          className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 p-1 rounded-lg transition-colors"
                          title="पेशगी हटाएं"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : isEditingAdvance ? (
                    <div className="bg-amber-50/70 border border-amber-300 p-2.5 rounded-xl space-y-2 text-xs animate-fade-in">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
                          आज दी गई पेशगी / खर्चा (₹):
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditingAdvanceWorkerId(null)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          aria-label="Close Advance Input"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={entry.advanceAmount || ''}
                            onChange={(e) =>
                              handleAdvanceChange(
                                entry.workerId,
                                e.target.value ? Number(e.target.value) : 0
                              )
                            }
                            className="w-full pl-7 pr-3 py-1.5 text-sm font-black bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                            autoFocus
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAdvanceChange(entry.workerId, 200)}
                          className="text-xs font-black bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded-lg active:scale-95 shadow-2xs transition-all"
                        >
                          +₹200
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdvanceChange(entry.workerId, 500)}
                          className="text-xs font-black bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded-lg active:scale-95 shadow-2xs transition-all"
                        >
                          +₹500
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="वजह लिखें (जैसे: राशन, दवाई, भाड़ा...)"
                        value={entry.advanceReason || ''}
                        onChange={(e) =>
                          handleAdvanceChange(entry.workerId, entry.advanceAmount, e.target.value)
                        }
                        className="w-full px-2.5 py-1 text-xs bg-white border border-amber-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingAdvanceWorkerId(entry.workerId)}
                      className="w-full py-1.5 px-2.5 rounded-xl border border-dashed border-slate-200 hover:border-amber-400 text-slate-500 hover:text-amber-900 text-xs font-semibold flex items-center justify-between transition-colors bg-slate-50/50 active:scale-98"
                    >
                      <span className="flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                        <span>आज कोई खर्चा / पेशगी दिया?</span>
                      </span>
                      <span className="text-[10px] text-amber-800 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        + खर्चा जोड़ें
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. FLOATING STICKY SAVE BAR (Clean of Mobile Bottom Navbar) */}
      <div className="sticky bottom-20 md:bottom-6 z-30 pt-2 pb-1">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] p-2.5 sm:p-3 rounded-2xl flex items-center justify-between gap-3">
          <div className="pl-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">हाजिरी स्थिति</span>
            <span className="text-xs sm:text-sm font-black text-slate-900">
              {presentCount}/{entries.length} मजदूर हाजिर
            </span>
          </div>

          <button
            type="button"
            disabled={saving || entries.length === 0}
            onClick={handleSave}
            className="flex-1 max-w-xs bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{saving ? 'सेव हो रहा है...' : '✓ हाजिरी व खर्चा सेव करें'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

