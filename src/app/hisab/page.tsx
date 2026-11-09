'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Building2,
  Calendar,
  Users,
  IndianRupee,
  ArrowRight,
  Sparkles,
  Calculator
} from 'lucide-react';
import { Site } from '@/lib/types';
import { formatCurrency, formatDateIndian } from '@/lib/utils';

export default function HisabHubPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-800">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="bg-amber-500 text-slate-950 p-2 rounded-xl font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
            मास्टर हिसाब हब • Master Settlement Register
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          साइट का कुल हिसाब व हाजिरी चार्ट
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          जिस साइट का कुल हिसाब देखना हो या पर्ची निकालनी हो, उस साइट पर क्लिक करें। शुरू से आज तक का पूरा हाजिरी चार्ट और बाकी पैसे अपने आप आ जाएंगे।
        </p>
      </div>

      {/* Sites List */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-500" />
          <span>हिसाब निकालने के लिए साइट चुनें ({activeSites.length} चालू साइट्स)</span>
        </h2>

        {loading ? (
          <div className="space-y-3">
            <div className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
            <div className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-dashed border-slate-300 space-y-2">
            <p className="text-sm text-slate-500">अभी कोई साइट नहीं जोड़ी गई है।</p>
            <Link href="/" className="text-xs font-bold text-amber-600 underline">
              होम पेज पर जाकर नई साइट जोड़ें
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map((site) => {
              const isActive = site.status === 'ACTIVE';
              return (
                <div
                  key={site.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full mb-1 ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isActive ? '● चालू साइट' : '✓ पूरा हुआ'}
                        </span>
                        <h3 className="text-lg font-black text-slate-900">{site.name}</h3>
                        {site.location && (
                          <p className="text-xs text-slate-500">{site.location}</p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block">ठेका राशि</span>
                        <span className="text-sm font-black text-slate-900">
                          {formatCurrency(site.contractAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        शुरू: <strong>{formatDateIndian(site.startDate)}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{site._count?.siteWorkers ?? 0} मजदूर</strong>
                      </span>
                    </div>
                  </div>

                  {/* 1-Tap Calculate Button */}
                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <Link
                      href={`/sites/${site.id}/calculate`}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm shadow-sm transition-all active:scale-95"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                      <span>📊 कुल हिसाब व मास्टर चार्ट निकालें</span>
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

