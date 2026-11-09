'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HardHat,
  Building2,
  Users,
  IndianRupee,
  Calendar,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  MapPin,
  Phone,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Site, Worker } from '@/lib/types';
import { formatCurrency, formatDateIndian } from '@/lib/utils';
import { AddSiteModal } from '@/components/AddSiteModal';
import { AddWorkerModal } from '@/components/AddWorkerModal';

export default function DashboardPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [sitesRes, workersRes] = await Promise.all([
        fetch('/api/sites').then((r) => r.json()),
        fetch('/api/workers').then((r) => r.json()),
      ]);

      if (sitesRes.success) setSites(sitesRes.sites);
      if (workersRes.success) setWorkers(workersRes.workers);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeSites = sites.filter((s) => s.status === 'ACTIVE');
  const totalContract = activeSites.reduce((sum, s) => sum + (s.contractAmount || 0), 0);

  // Today's formatted date in Hindi
  const todayFormatted = new Date().toLocaleDateString('hi-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const firstActiveSite = activeSites.length > 0 ? activeSites[0] : null;

  return (
    <div className="space-y-6">
      {/* 1. CONTRACTOR PROFILE BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <HardHat className="w-4 h-4 text-amber-400" />
              <span>ठेकेदार डायरी • Thekedar Khata</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              नमस्ते ठेकेदार साहब
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              आज: <strong className="text-amber-300">{todayFormatted}</strong> • आपकी साइट्स, हाजिरी और हिसाब डायरी
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSiteModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              + नई साइट जोड़ें
            </button>
            <button
              onClick={() => setIsWorkerModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-700 active:scale-95 transition-all"
            >
              <Users className="w-4 h-4 text-amber-400" />
              + नया मजदूर
            </button>
          </div>
        </div>
      </div>

      {/* 2. DAILY CONTRACTOR ACTIONS (ROZANA KE 4 KAAM) */}
      {firstActiveSite && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>आज का काम ({firstActiveSite.name})</span>
            </span>
            <Link
              href={`/sites/${firstActiveSite.id}`}
              className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-0.5"
            >
              <span>साइट खोलें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Action 1: Daily Attendance */}
            <Link
              href={`/sites/${firstActiveSite.id}/attendance`}
              className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 transition-all active:scale-95 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-emerald-600 text-white font-black text-xs">
                  <Calendar className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  रोजाना
                </span>
              </div>
              <div>
                <div className="font-black text-xs sm:text-sm">दैनिक हाजिरी</div>
                <div className="text-[10px] text-emerald-700">P, HD, A व पेशगी ₹</div>
              </div>
            </Link>

            {/* Action 2: Malik Hisab */}
            <Link
              href={`/sites/${firstActiveSite.id}/owner`}
              className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 transition-all active:scale-95 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                  <IndianRupee className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  मालिक
                </span>
              </div>
              <div>
                <div className="font-black text-xs sm:text-sm">मालिक से पैसा</div>
                <div className="text-[10px] text-amber-700">किश्तें, ठेका व बकाया</div>
              </div>
            </Link>

            {/* Action 3: Other Expenses */}
            <Link
              href={`/sites/${firstActiveSite.id}/expenses`}
              className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-950 transition-all active:scale-95 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-rose-600 text-white font-black text-xs">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded-full">
                  खर्चा
                </span>
              </div>
              <div>
                <div className="font-black text-xs sm:text-sm">साइट के खर्चे</div>
                <div className="text-[10px] text-rose-700">रेत, सीमेंट, भाड़ा, चाय</div>
              </div>
            </Link>

            {/* Action 4: Master Calculate */}
            <Link
              href={`/sites/${firstActiveSite.id}/calculate`}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all active:scale-95 flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded-full">
                  हिसाब
                </span>
              </div>
              <div>
                <div className="font-black text-xs sm:text-sm text-amber-400">कुल हिसाब व पर्ची</div>
                <div className="text-[10px] text-slate-300">शुरू से आज तक</div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* 3. THREE CORE METRIC CARDS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs text-slate-500 font-bold block">चालू साइट्स</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
            {activeSites.length}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block">● काम चालू</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs text-slate-500 font-bold block">कुल मजदूर</span>
          <span className="text-xl sm:text-2xl font-black text-blue-700 mt-0.5 block">
            {workers.length}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold block">कारीगर/हेल्पर</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs text-slate-500 font-bold block">चालू ठेका रकम</span>
          <span className="text-base sm:text-xl font-black text-emerald-700 mt-0.5 block truncate">
            {formatCurrency(totalContract)}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold block">कुल तय बजट</span>
        </div>
      </div>

      {/* 4. ACTIVE SITES CARDS (CLEAN & PRACTICAL) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <span>चालू साइट्स का ब्योरा ({activeSites.length})</span>
          </h2>

          <Link
            href="/sites"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
          >
            <span>सभी साइट्स</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-44 bg-slate-200 animate-pulse rounded-2xl" />
            <div className="h-44 bg-slate-200 animate-pulse rounded-2xl" />
          </div>
        ) : activeSites.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <p className="text-sm text-slate-600 font-bold">अभी कोई चालू साइट दर्ज नहीं है</p>
            <button
              onClick={() => setIsSiteModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
            >
              <PlusCircle className="w-4 h-4" /> पहली साइट जोड़ें
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSites.map((site) => (
              <div
                key={site.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Site Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ● चालू साइट
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          शुरू: <strong>{formatDateIndian(site.startDate)}</strong>
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 hover:text-amber-700 transition-colors">
                        <Link href={`/sites/${site.id}`}>{site.name}</Link>
                      </h3>
                      {site.location && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{site.location}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">तय ठेका</span>
                      <span className="text-base font-black text-slate-900">
                        {formatCurrency(site.contractAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Owner info */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">मालिक (Client):</span>
                      <span className="font-bold text-slate-800">{site.ownerName || 'नाम दर्ज नहीं'}</span>
                    </div>

                    {site.ownerPhone ? (
                      <a
                        href={`tel:${site.ownerPhone}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{site.ownerPhone}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px]">फोन नंबर नहीं</span>
                    )}
                  </div>
                </div>

                {/* 4 Quick Action Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100">
                  <Link
                    href={`/sites/${site.id}/attendance`}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-center transition-all active:scale-95 flex flex-col items-center justify-center"
                    title="दैनिक हाजिरी लगाएं"
                  >
                    <Calendar className="w-4 h-4 text-emerald-700 mb-0.5" />
                    <span className="text-[10px] font-black">हाजिरी</span>
                  </Link>

                  <Link
                    href={`/sites/${site.id}/owner`}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-center transition-all active:scale-95 flex flex-col items-center justify-center"
                    title="मालिक से मिला पैसा"
                  >
                    <IndianRupee className="w-4 h-4 text-amber-700 mb-0.5" />
                    <span className="text-[10px] font-black">मालिक</span>
                  </Link>

                  <Link
                    href={`/sites/${site.id}/expenses`}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-200 text-center transition-all active:scale-95 flex flex-col items-center justify-center"
                    title="साइट के खर्चे"
                  >
                    <ShoppingBag className="w-4 h-4 text-rose-700 mb-0.5" />
                    <span className="text-[10px] font-black">खर्चे</span>
                  </Link>

                  <Link
                    href={`/sites/${site.id}/calculate`}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-center transition-all active:scale-95 flex flex-col items-center justify-center shadow-xs"
                    title="कुल हिसाब निकालें"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-400 mb-0.5" />
                    <span className="text-[10px] font-black text-amber-400">हिसाब</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. PRACTICAL CONTRACTOR DIARY TIPS */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">
            ठेकेदार डायरी का नियम:
          </p>
          <p className="text-slate-700">
            रोजाना काम खत्म होने पर <strong>"हाजिरी"</strong> बटन दबाकर सबको हाजिर (P) करें और जो मजदूर राशन या दवा के लिए खर्चा (पेशगी) ले जाए, उसे लिख लें। अंतिम दिन <strong>"हिसाब"</strong> दबाकर 1 क्लिक में तारीख-वार पर्ची और बचा हुआ पैसा निकालें।
          </p>
        </div>
      </div>

      {/* Modals */}
      <AddSiteModal
        isOpen={isSiteModalOpen}
        onClose={() => setIsSiteModalOpen(false)}
        onSiteCreated={() => {
          setIsSiteModalOpen(false);
          loadData();
        }}
      />
      <AddWorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        onWorkerAdded={() => {
          setIsWorkerModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
