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
  ChevronRight,
  BookOpen,
  Plus,
  Briefcase
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
    <div className="space-y-5 pb-16 max-w-5xl mx-auto">
      {/* 1. EXECUTIVE CONTRACTOR HEADER (CLASSIC & PROFESSIONAL) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider">
                <HardHat className="w-3.5 h-3.5 text-amber-600" />
                <span>ठेकेदार डायरी</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">•</span>
              <span className="text-xs text-slate-500 font-medium">Thekedar Khata</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              नमस्ते, ठेकेदार साहब
            </h1>

            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>आज: <strong className="text-slate-800 font-bold">{todayFormatted}</strong></span>
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSiteModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2 rounded-xl text-xs sm:text-sm shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>नई साइट जोड़ें</span>
            </button>
            <button
              onClick={() => setIsWorkerModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 shadow-2xs active:scale-95 transition-all"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>नया मजदूर</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CORE FINANCIAL & OPERATIONAL METRICS (3 TILES) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Active Sites */}
        <Link
          href="/sites"
          className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">
                चालू साइट्स
              </span>
              <Building2 className="w-4 h-4 text-amber-500 hidden sm:block" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {activeSites.length}
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>काम चालू</span>
          </span>
        </Link>

        {/* Total Workers */}
        <Link
          href="/workers"
          className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">
                कुल मजदूर
              </span>
              <Users className="w-4 h-4 text-blue-500 hidden sm:block" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {workers.length}
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1.5 block truncate">
            मिस्त्री व हेल्पर
          </span>
        </Link>

        {/* Active Contract Volume */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">
                कुल ठेका बजट
              </span>
              <IndianRupee className="w-4 h-4 text-emerald-600 hidden sm:block" />
            </div>
            <div className="text-base sm:text-xl font-black text-emerald-700 truncate">
              {formatCurrency(totalContract)}
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1.5 block truncate">
            सक्रिय साइट्स का
          </span>
        </div>
      </div>

      {/* 3. TODAY'S QUICK WORKFLOW BAR (FOR FIRST ACTIVE SITE) */}
      {firstActiveSite && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                आज का काम: <strong className="text-amber-800">{firstActiveSite.name}</strong>
              </span>
            </div>
            <Link
              href={`/sites/${firstActiveSite.id}`}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
            >
              <span>साइट खोलें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* 1. Daily Attendance */}
            <Link
              href={`/sites/${firstActiveSite.id}/attendance`}
              className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 text-slate-900 transition-all active:scale-95 group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-2xs">
                  <Calendar className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  दैनिक
                </span>
              </div>
              <div className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                हाजिरी लगाएं
              </div>
              <div className="text-[10px] text-slate-500">P, HD, A व पेशगी</div>
            </Link>

            {/* 2. Owner Payment */}
            <Link
              href={`/sites/${firstActiveSite.id}/owner`}
              className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 hover:border-amber-300 text-slate-900 transition-all active:scale-95 group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs shadow-2xs">
                  <IndianRupee className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded">
                  मालिक
                </span>
              </div>
              <div className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-amber-800 transition-colors">
                मालिक से हिसाब
              </div>
              <div className="text-[10px] text-slate-500">किश्तें व बकाया वसूली</div>
            </Link>

            {/* 3. Site Expenses */}
            <Link
              href={`/sites/${firstActiveSite.id}/expenses`}
              className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50/70 border border-slate-200/80 hover:border-rose-300 text-slate-900 transition-all active:scale-95 group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 rounded-lg bg-rose-600 text-white font-black text-xs shadow-2xs">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-bold text-rose-800 bg-rose-100/70 px-1.5 py-0.5 rounded">
                  खर्चे
                </span>
              </div>
              <div className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-rose-800 transition-colors">
                सामग्री व खर्चे
              </div>
              <div className="text-[10px] text-slate-500">रेत, सीमेंट, भाड़ा</div>
            </Link>

            {/* 4. Master Settlement */}
            <Link
              href={`/sites/${firstActiveSite.id}/calculate`}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all active:scale-95 group shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded">
                  हिसाब
                </span>
              </div>
              <div className="font-black text-xs sm:text-sm text-amber-300">
                कुल हिसाब व पर्ची
              </div>
              <div className="text-[10px] text-slate-400">तारीख-वार फाइनल शीट</div>
            </Link>
          </div>
        </div>
      )}

      {/* 4. ACTIVE SITES DIRECTORY (CLEAN CARDS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm sm:text-base font-black text-slate-900">
              चालू साइट्स ({activeSites.length})
            </h2>
          </div>

          <Link
            href="/sites"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <span>सभी साइट्स देखें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-36 bg-slate-200 animate-pulse rounded-2xl" />
            <div className="h-36 bg-slate-200 animate-pulse rounded-2xl" />
          </div>
        ) : activeSites.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <p className="text-xs sm:text-sm text-slate-600 font-bold">अभी कोई चालू साइट दर्ज नहीं है</p>
            <button
              onClick={() => setIsSiteModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-slate-900 text-white font-black px-4 py-2 rounded-xl text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> पहली साइट जोड़ें
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeSites.map((site) => (
              <div
                key={site.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top Site Title & Budget */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ● चालू
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          शुरू: {formatDateIndian(site.startDate)}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 truncate hover:text-amber-800 transition-colors">
                        <Link href={`/sites/${site.id}`}>{site.name}</Link>
                      </h3>
                      {site.location && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{site.location}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                        तय ठेका
                      </span>
                      <span className="text-base font-black text-slate-900">
                        {formatCurrency(site.contractAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Client Info Bar */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/70 p-2 rounded-xl">
                    <div className="truncate pr-2">
                      <span className="text-slate-400 text-[10px] font-bold block">मालिक:</span>
                      <span className="font-bold text-slate-800 truncate block">
                        {site.ownerName || 'नाम दर्ज नहीं'}
                      </span>
                    </div>

                    {site.ownerPhone ? (
                      <a
                        href={`tel:${site.ownerPhone}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0 shadow-2xs"
                      >
                        <Phone className="w-3 h-3 text-amber-600" />
                        <span>{site.ownerPhone}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px]">फोन नहीं</span>
                    )}
                  </div>
                </div>

                {/* 4 Action Pills */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100">
                  <Link
                    href={`/sites/${site.id}/attendance`}
                    className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-200 text-center transition-all active:scale-95 flex flex-col items-center justify-center"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
                    <span className="text-[10px] font-bold">हाजिरी</span>
                  </Link>

                  <Link
                    href={`/sites/${site.id}/owner`}
                    className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800 hover:text-amber-950 border border-slate-200 text-center transition-all active:scale-95 flex flex-col items-center justify-center"
                  >
                    <IndianRupee className="w-3.5 h-3.5 text-amber-600 mb-0.5" />
                    <span className="text-[10px] font-bold">मालिक</span>
                  </Link>

                  <Link
                    href={`/sites/${site.id}/expenses`}
                    className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-800 hover:text-rose-950 border border-slate-200 text-center transition-all active:scale-95 flex flex-col items-center justify-center"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-rose-600 mb-0.5" />
                    <span className="text-[10px] font-bold">खर्चे</span>
                  </Link>

                  <Link
                    href={`/sites/${site.id}/calculate`}
                    className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-center transition-all active:scale-95 flex flex-col items-center justify-center shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                    <span className="text-[10px] font-bold text-amber-300">हिसाब</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. PROFESSIONAL CONTRACTOR DIARY GUIDE CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-2xs text-xs text-slate-700">
        <div className="p-2 bg-slate-100 rounded-xl shrink-0 text-slate-700">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <p className="font-black text-slate-900">
            ठेकेदार डायरी का आसान नियम:
          </p>
          <p className="text-slate-600 leading-relaxed">
            शाम को काम खत्म होने पर <strong>"हाजिरी"</strong> पर 1-टैप करके सबको उपस्थित करें और किसी को दिया खर्चा दर्ज करें। जब भी भुगतान का दिन हो, <strong>"हिसाब"</strong> से तारीख-वार पर्ची और फाइनल देय राशि तुरंत निकालें।
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
