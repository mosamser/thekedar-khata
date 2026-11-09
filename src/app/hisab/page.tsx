'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Building2,
  Calendar,
  Users,
  IndianRupee,
  ChevronRight,
  Calculator,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { Site } from '@/lib/types';
import { formatCurrency, formatDateIndian } from '@/lib/utils';

export default function HisabHubPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sites')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSites(data.sites);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const activeSites = sites.filter((s) => s.status === 'ACTIVE');

  return (
    <div className="space-y-5 pb-16 max-w-5xl mx-auto">
      {/* 1. EXECUTIVE HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5 text-amber-600" />
                <span>मास्टर सेटलमेंट हब</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">•</span>
              <span className="text-xs text-slate-500 font-medium">Master Settlement Register</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              साइट का कुल हिसाब व हाजिरी चार्ट
            </h1>

            <p className="text-xs text-slate-500 max-w-xl">
              जिस साइट का कुल हिसाब देखना हो या पर्ची निकालनी हो, उस साइट पर क्लिक करें। शुरू से आज तक का पूरा हाजिरी चार्ट, मजदूरी और बाकी पैसे अपने आप आ जाएंगे।
            </p>
          </div>
        </div>
      </div>

      {/* 2. SITES LIST FOR SETTLEMENT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-700" />
            <span>हिसाब निकालने के लिए साइट चुनें ({activeSites.length} चालू साइट्स)</span>
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
            <div className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-dashed border-slate-300 space-y-2">
            <p className="text-xs sm:text-sm text-slate-500 font-bold">अभी कोई साइट नहीं जोड़ी गई है।</p>
            <Link href="/" className="text-xs font-bold text-amber-700 underline">
              होम पेज पर जाकर नई साइट जोड़ें
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {sites.map((site) => {
              const isActive = site.status === 'ACTIVE';
              return (
                <div
                  key={site.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3.5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span
                          className={`inline-block text-[10px] font-black px-2 py-0.5 rounded mb-1.5 border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isActive ? '● चालू साइट' : '✓ पूरा हुआ'}
                        </span>
                        <h3 className="text-base font-black text-slate-900 truncate">{site.name}</h3>
                        {site.location && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{site.location}</span>
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                          तय ठेका
                        </span>
                        <span className="text-sm sm:text-base font-black text-slate-900">
                          {formatCurrency(site.contractAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>शुरू: <strong>{formatDateIndian(site.startDate)}</strong></span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span><strong>{site._count?.siteWorkers ?? 0} मजदूर</strong></span>
                      </span>
                    </div>
                  </div>

                  {/* 1-Tap Calculate Button */}
                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      href={`/sites/${site.id}/calculate`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-xs transition-all active:scale-95 group"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                      <span>कुल हिसाब व मास्टर चार्ट निकालें</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
