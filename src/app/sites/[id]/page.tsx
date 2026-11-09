'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  Calendar,
  IndianRupee,
  Users,
  UserPlus,
  FileSpreadsheet,
  ArrowLeft,
  X,
  Phone,
  MapPin,
  Trash2,
  Plus,
  ShoppingBag,
  Edit3,
  ChevronRight
} from 'lucide-react';
import { Site, Worker } from '@/lib/types';
import { formatCurrency, formatDateIndian } from '@/lib/utils';
import { AddWorkerModal } from '@/components/AddWorkerModal';
import { EditWorkerModal } from '@/components/EditWorkerModal';

const ROLE_SORT_ORDER: Record<string, number> = {
  MISTRI: 1,
  HELPER: 2,
  VELDAR: 2,
  REJA: 3,
  LABOUR: 4,
};

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  const [site, setSite] = useState<Site | null>(null);
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal to add existing worker to site
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [customRate, setCustomRate] = useState<number | ''>('');
  const [isNewWorkerModalOpen, setIsNewWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  const fetchSiteData = async () => {
    try {
      const [siteRes, workersRes] = await Promise.all([
        fetch(`/api/sites/${siteId}`).then((r) => r.json()),
        fetch('/api/workers').then((r) => r.json()),
      ]);

      if (siteRes.success) setSite(siteRes.site);
      if (workersRes.success) setAllWorkers(workersRes.workers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteData();
  }, [siteId]);

  const handleAssignWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) return;

    try {
      const res = await fetch(`/api/sites/${siteId}/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: selectedWorkerId,
          customRate: customRate ? Number(customRate) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAssignModalOpen(false);
        setSelectedWorkerId('');
        setCustomRate('');
        fetchSiteData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveWorker = async (workerId: string) => {
    if (!confirm('क्या आप इस मजदूर को सिर्फ इस साइट से हटाना चाहते हैं?\n\n(नोट: दूसरी साइट्स और इस साइट का पुराना हिसाब व हाजिरी पूरी तरह सुरक्षित रहेगी)')) return;
    try {
      const res = await fetch(`/api/sites/${siteId}/workers?workerId=${workerId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchSiteData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReAddWorker = async (workerId: string) => {
    try {
      const res = await fetch(`/api/sites/${siteId}/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSiteData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async () => {
    if (!site) return;
    const newStatus = site.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
    const confirmMsg = newStatus === 'COMPLETED'
      ? 'क्या इस साइट का काम पूरा हो गया है? इसे पूरा हुआ (Completed) मार्क करें?'
      : 'क्या इस साइट को दोबारा चालू (Active) करना चाहते हैं?';
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSite(data.site);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-slate-200 animate-pulse rounded-2xl" />
        <div className="h-60 bg-slate-200 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="bg-white p-10 rounded-2xl border text-center space-y-3">
        <p className="text-slate-600 font-bold">साइट नहीं मिली</p>
        <Link href="/sites" className="text-amber-600 underline text-sm">
          साइट्स लिस्ट पर वापस जाएं
        </Link>
      </div>
    );
  }

  // Workers not yet assigned to this site, sorted Mistri -> Helper -> Reja -> Labour
  const assignedWorkerIds = new Set(site.siteWorkers?.map((sw) => sw.workerId) || []);
  const unassignedWorkers = allWorkers
    .filter((w) => !assignedWorkerIds.has(w.id))
    .sort((a, b) => {
      const orderA = ROLE_SORT_ORDER[a.role] || 99;
      const orderB = ROLE_SORT_ORDER[b.role] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });

  // Sort assigned workers: Mistri -> Helper -> Reja -> Labour
  const sortedSiteWorkers = [...(site.siteWorkers || [])].sort((a, b) => {
    const roleA = a.worker?.role || '';
    const roleB = b.worker?.role || '';
    const orderA = ROLE_SORT_ORDER[roleA] || 99;
    const orderB = ROLE_SORT_ORDER[roleB] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.worker?.name || '').localeCompare(b.worker?.name || '');
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Toggle */}
      <div className="flex items-center justify-between">
        <Link
          href="/sites"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>सभी साइट्स</span>
        </Link>

        <button
          onClick={handleToggleStatus}
          className={`text-xs font-black px-3.5 py-1.5 rounded-full transition-all active:scale-95 shadow-2xs flex items-center gap-1.5 ${
            site.status === 'ACTIVE'
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
          }`}
          title="साइट का स्टेटस बदलने के लिए क्लिक करें"
        >
          <span>{site.status === 'ACTIVE' ? '● चालू साइट (ACTIVE)' : '✓ काम पूरा (COMPLETED)'}</span>
          <span className="text-[10px] text-slate-500 font-normal underline">(बदलें)</span>
        </button>
      </div>

      {/* SITE HERO CARD (CLASSIC & PROFESSIONAL) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>प्रोजेक्ट खाता</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{site.name}</h1>
            {site.location && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{site.location}</span>
              </p>
            )}
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>काम शुरू तारीख: <strong className="text-slate-800">{formatDateIndian(site.startDate)}</strong></span>
            </p>
          </div>

          {/* Owner details card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 sm:p-4 min-w-0 sm:min-w-[260px] space-y-1 text-xs">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
              मालिक का विवरण (Client)
            </span>
            <div className="text-sm font-black text-slate-900 truncate">{site.ownerName || 'नाम दर्ज नहीं'}</div>
            {site.ownerPhone ? (
              <a
                href={`tel:${site.ownerPhone}`}
                className="text-slate-700 hover:text-slate-900 flex items-center gap-1 text-[11px] font-medium"
              >
                <Phone className="w-3 h-3 text-amber-600" />
                <span>{site.ownerPhone}</span>
              </a>
            ) : (
              <span className="text-slate-400 text-[11px]">फोन दर्ज नहीं</span>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">तय ठेका राशि:</span>
              <strong className="text-slate-900 text-sm font-black">{formatCurrency(site.contractAmount)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* POST-WORK SETTLEMENT BANNER (काम पूरा होने पर मजदूरों का भुगतान) */}
      <div className="bg-slate-900 text-white rounded-2xl p-3.5 sm:p-4 border border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
            <h3 className="font-black text-xs sm:text-sm text-white">
              {site.status === 'COMPLETED' ? 'काम पूरा हो चुका है • मजदूरों का अंतिम भुगतान करें' : 'काम खत्म होने के बाद मजदूरों का भुगतान'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-300">
            काम के बाद हर मजदूर का बाकी पैसा देखें और 1-क्लिक में फाइनल भुगतान दर्ज करें।
          </p>
        </div>

        <Link
          href={`/sites/${site.id}/calculate`}
          className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm shadow-xs active:scale-95 transition-all whitespace-nowrap shrink-0"
        >
          <span>फाइनल हिसाब व भुगतान</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </Link>
      </div>

      {/* 4 CORE WORKFLOW HUBS (2x2 Grid on Mobile, 4-Cols on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Hub 1: Attendance */}
        <Link
          href={`/sites/${site.id}/attendance`}
          className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between active:scale-95"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl font-bold border border-emerald-200/80 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4 text-emerald-700" />
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                दैनिक
              </span>
            </div>
            <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
              दैनिक हाजिरी
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
              P, HD, A व पेशगी खर्चा दर्ज करें
            </p>
          </div>
        </Link>

        {/* Hub 2: Owner Deal */}
        <Link
          href={`/sites/${site.id}/owner`}
          className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between active:scale-95"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-50 text-amber-900 p-2 rounded-xl font-bold border border-amber-200/80 group-hover:scale-105 transition-transform">
                <IndianRupee className="w-4 h-4 text-amber-700" />
              </div>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                मालिक
              </span>
            </div>
            <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-amber-800 transition-colors leading-snug">
              मालिक से हिसाब
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
              किश्तें, ठेका राशि व बकाया वसूली
            </p>
          </div>
        </Link>

        {/* Hub 3: Other Site Expenses */}
        <Link
          href={`/sites/${site.id}/expenses`}
          className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 hover:border-rose-300 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between active:scale-95"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-rose-50 text-rose-800 p-2 rounded-xl font-bold border border-rose-200/80 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                खर्चे
              </span>
            </div>
            <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-rose-800 transition-colors leading-snug">
              साइट के अन्य खर्चे
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
              रेत, सीमेंट, भाड़ा, मशीनरी किराया
            </p>
          </div>
        </Link>

        {/* Hub 4: Calculate Master Chart */}
        <Link
          href={`/sites/${site.id}/calculate`}
          className="bg-slate-900 hover:bg-slate-800 p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between active:scale-95 text-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-slate-800 text-amber-400 p-2 rounded-xl font-bold border border-slate-700 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                हिसाब
              </span>
            </div>
            <h3 className="font-black text-xs sm:text-sm text-amber-400 leading-snug">
              कुल हिसाब व पर्ची
            </h3>
            <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-2">
              हाजिरी सुधारें व कलरफुल प्रिंट
            </p>
          </div>
        </Link>
      </div>

      {/* ASSIGNED WORKERS ON THIS SITE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              इस साइट पर लगे मजदूर ({sortedSiteWorkers.length})
            </h3>
            <p className="text-xs text-slate-500">
              मिस्त्री सबसे ऊपर, फिर हेल्पर, रेजा और अन्य मजदूर
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-xl shadow-xs transition-all"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              + मजदूर को जोड़ें
            </button>
            <button
              onClick={() => setIsNewWorkerModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              नया मजदूर बनाएं
            </button>
          </div>
        </div>

        {/* Worker Table (Desktop) & Cards (Mobile) */}
        {sortedSiteWorkers.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-300 rounded-2xl space-y-2">
            <p className="text-xs text-slate-500">इस साइट पर अभी कोई मजदूर नहीं जुड़ा है।</p>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="text-xs font-bold text-amber-700 underline"
            >
              मजदूर जोड़ें
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View: Clean App Cards */}
            <div className="sm:hidden space-y-2">
              {sortedSiteWorkers.map((sw) => {
                const worker = sw.worker;
                if (!worker) return null;
                const isMistri = worker.role === 'MISTRI';
                const effectiveRate = sw.customRate ?? worker.defaultRate;
                const isFemale = worker.gender === 'FEMALE' || worker.role === 'REJA';

                return (
                  <div
                    key={sw.id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700 shrink-0 shadow-2xs">
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-sm text-slate-900 leading-tight flex items-center gap-1.5">
                          <span>{worker.name}</span>
                          {isMistri && (
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-300">
                              मिस्त्री
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {isFemale ? 'महिला' : 'पुरुष'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">साइट दर</span>
                        <span className="font-black text-sm text-slate-900">
                          {formatCurrency(effectiveRate)}
                        </span>
                        <span className="text-[9px] text-slate-400 block -mt-0.5">/दिन</span>
                      </div>
                      <button
                        onClick={() => setEditingWorker(worker)}
                        className="text-slate-400 hover:text-amber-600 p-2 rounded-xl hover:bg-white transition-colors"
                        title="मजदूर विवरण सुधारें / एडिट"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveWorker(worker.id)}
                        className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-white transition-colors"
                        title="साइट से हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Clean Table without Role Column */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="py-2.5 px-3">मजदूर का नाम</th>
                    <th className="py-2.5 px-2">लिंग (Gender)</th>
                    <th className="py-2.5 px-3 text-right">साइट दिहाड़ी दर</th>
                    <th className="py-2.5 px-2 text-center">सुधारें / हटाएं</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedSiteWorkers.map((sw) => {
                    const worker = sw.worker;
                    if (!worker) return null;
                    const isMistri = worker.role === 'MISTRI';
                    const effectiveRate = sw.customRate ?? worker.defaultRate;
                    const isFemale = worker.gender === 'FEMALE' || worker.role === 'REJA';

                    return (
                      <tr key={sw.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          <span>{worker.name}</span>
                          {isMistri && (
                            <span className="ml-2 bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-300">
                              मिस्त्री
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 font-medium text-slate-600">
                          {isFemale ? 'महिला' : 'पुरुष'}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">
                          {formatCurrency(effectiveRate)}
                          <span className="text-[10px] text-slate-400 font-normal"> /दिन</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingWorker(worker)}
                              className="text-slate-400 hover:text-amber-600 p-1 rounded transition-colors"
                              title="मजदूर विवरण सुधारें / एडिट"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveWorker(worker.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                              title="साइट से हटाएं"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Previous / Inactive Workers on this Site */}
        {site.pastSiteWorkers && site.pastSiteWorkers.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              पुराने मजदूर (जो पहले इस साइट पर काम कर चुके हैं):
            </span>
            <div className="flex flex-wrap gap-2">
              {site.pastSiteWorkers.map((psw) => (
                <div
                  key={psw.id}
                  className="bg-slate-100 hover:bg-slate-150 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs"
                >
                  <span className="font-bold text-slate-700">{psw.worker?.name || 'मजदूर'}</span>
                  <span className="text-[10px] text-slate-400">
                    ({formatCurrency(psw.customRate ?? psw.worker?.defaultRate ?? 500)}/दिन)
                  </span>
                  <button
                    onClick={() => handleReAddWorker(psw.workerId)}
                    className="text-[10px] font-black text-amber-800 bg-amber-200 hover:bg-amber-300 px-2 py-0.5 rounded-lg transition-colors shadow-2xs"
                    title="इस मजदूर को दोबारा इस साइट पर सक्रिय करें"
                  >
                    + पुनः जोड़ें
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              * इन मजदूरों का इस साइट का पुराना काम और हिसाब &apos;कुल हिसाब&apos; में सुरक्षित रहेगा।
            </p>
          </div>
        )}
      </div>

      {/* Modal: Assign Worker to Site (Mobile Full Page View) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50 sm:bg-slate-950/75 sm:flex sm:items-center sm:justify-center sm:p-4 overflow-y-auto">
          <div className="min-h-screen sm:min-h-0 bg-white sm:rounded-2xl shadow-2xl max-w-md w-full flex flex-col sm:border border-slate-200">
            {/* App Bar */}
            <div className="bg-slate-900 text-white px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="sm:hidden text-slate-300 hover:text-white p-1 -ml-1 rounded-lg"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-bold text-base">मजदूर को साइट पर जोड़ें</h3>
                  <p className="text-xs text-slate-400">{site.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="hidden sm:block text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignWorker} className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    मजदूर चुनें (Select Worker) *
                  </label>
                  {unassignedWorkers.length === 0 ? (
                    <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                      सभी मौजूदा मजदूर पहले से इस साइट पर जुड़े हुए हैं। अगर कोई नया मजदूर है, तो 'नया मजदूर बनाएं' पर क्लिक करें।
                    </p>
                  ) : (
                    <select
                      required
                      value={selectedWorkerId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedWorkerId(id);
                        const w = allWorkers.find((x) => x.id === id);
                        if (w) setCustomRate(w.defaultRate);
                      }}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium"
                    >
                      <option value="">-- मजदूर चुनें --</option>
                      {unassignedWorkers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} {w.role === 'MISTRI' ? '(मिस्त्री)' : ''} - दर: ₹{w.defaultRate}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    इस साइट के लिए दिहाड़ी दर (Daily Rate ₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-base">₹</span>
                    <input
                      type="number"
                      placeholder="500"
                      value={customRate}
                      onChange={(e) => setCustomRate(e.target.value ? Number(e.target.value) : '')}
                      className="w-full pl-8 pr-3.5 py-2.5 text-base font-black bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    अगर इस साइट पर मजदूर को अलग रेट देना हो तो यहां बदल सकते हैं।
                  </p>
                </div>
              </div>

              {/* Action Buttons: Sticky Bottom on Mobile */}
              <div className="pt-4 border-t border-slate-100 flex gap-2.5 sticky bottom-0 bg-white pb-2 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 px-4 py-3 sm:py-2.5 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={!selectedWorkerId}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-3 sm:py-2.5 rounded-xl text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  साइट पर जोड़ें ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Worker Modal */}
      <AddWorkerModal
        isOpen={isNewWorkerModalOpen}
        onClose={() => setIsNewWorkerModalOpen(false)}
        onWorkerAdded={(newWorker) => {
          setIsNewWorkerModalOpen(false);
          // Directly assign newly created worker to this site
          fetch(`/api/sites/${siteId}/workers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workerId: newWorker.id }),
          }).then(() => fetchSiteData());
        }}
      />

      {/* Edit Worker Modal */}
      <EditWorkerModal
        isOpen={!!editingWorker}
        worker={editingWorker}
        currentSiteId={siteId}
        currentSiteName={site.name}
        onRemoveFromSite={handleRemoveWorker}
        onClose={() => setEditingWorker(null)}
        onWorkerUpdated={() => {
          fetchSiteData();
        }}
      />
    </div>
  );
}
