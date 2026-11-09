'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  Users,
  IndianRupee,
  PlusCircle,
  Search,
  Filter,
  FileSpreadsheet,
  ArrowRight,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  ChevronRight,
  X
} from 'lucide-react';
import { Site } from '@/lib/types';
import { formatCurrency, formatDateIndian } from '@/lib/utils';
import { AddSiteModal } from '@/components/AddSiteModal';

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/sites');
      const data = await res.json();
      if (data.success) {
        setSites(data.sites);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const activeSitesCount = sites.filter((s) => s.status === 'ACTIVE').length;
  const completedSitesCount = sites.filter((s) => s.status === 'COMPLETED').length;

  const filteredSites = sites.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.location && s.location.toLowerCase().includes(search.toLowerCase())) ||
      (s.ownerName && s.ownerName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header (Compact, Classic & Human-Designed) */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
              <Building2 className="w-5 h-5 text-amber-800" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              साइट्स रजिस्टर
            </h1>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              {sites.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeSitesCount} चालू साइट्स • हाजिरी, खर्चा व ठेकेदार हिसाब
          </p>
        </div>

        <button
          onClick={() => setIsSiteModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm shadow-sm active:scale-95 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>+ नई साइट</span>
        </button>
      </div>

      {/* Search Bar & Clean Segmented Status Tabs */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="साइट, जगह या मालिक के नाम से खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs text-slate-900"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 3-Tab Clean Segmented Filter */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-950 font-black shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            सभी ({sites.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              statusFilter === 'ACTIVE'
                ? 'bg-white text-amber-950 font-black shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            चालू ({activeSitesCount})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              statusFilter === 'COMPLETED'
                ? 'bg-white text-emerald-950 font-black shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            पूर्ण ({completedSitesCount})
          </button>
        </div>
      </div>

      {/* Sites Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="h-44 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="h-44 bg-slate-200 animate-pulse rounded-2xl" />
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <p className="text-xs sm:text-sm text-slate-500 font-bold">
            {search ? 'इस खोज से कोई साइट नहीं मिली' : 'अभी कोई साइट दर्ज नहीं है'}
          </p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('ALL');
              setIsSiteModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> नई साइट बनाएं
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredSites.map((site) => {
            const isActive = site.status === 'ACTIVE';

            return (
              <div
                key={site.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Upper Area: Clickable Link to Site Hub */}
                <Link
                  href={`/sites/${site.id}`}
                  className="p-4 sm:p-5 block hover:bg-slate-50/50 transition-colors group"
                >
                  {/* Status & Contract Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isActive ? '● चालू काम' : '✓ काम पूरा'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        शुरू: <strong>{formatDateIndian(site.startDate)}</strong>
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">
                        तय ठेका
                      </span>
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        {formatCurrency(site.contractAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Site Name and Location */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                        {site.name}
                      </h3>
                      {site.location ? (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{site.location}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-0.5">साइट विवरण देखें</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 mt-0.5" />
                  </div>

                  {/* Client & Worker Strip */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800 truncate">
                        {site.ownerName || 'मालिक का नाम नहीं'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {site.ownerPhone && (
                        <a
                          href={`tel:${site.ownerPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors"
                          title="मालिक को कॉल करें"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{site.ownerPhone}</span>
                        </a>
                      )}
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {site._count?.siteWorkers ?? 0} मजदूर
                      </span>
                    </div>
                  </div>
                </Link>

                {/* 4 Clean Quick-Action Pills */}
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-1 grid grid-cols-4 gap-1.5 border-t border-slate-100 bg-slate-50/40">
                  <Link
                    href={`/sites/${site.id}/attendance`}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-900 border border-emerald-200 text-center transition-all flex flex-col items-center justify-center"
                    title="दैनिक हाजिरी लगाएं"
                  >
                    <Calendar className="w-4 h-4 text-emerald-700 mb-0.5" />
                    <span className="text-[10px] font-black">हाजिरी</span>
                  </Link>

                  <Link
                    href={`/sites/${site.id}/owner`}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-950 border border-amber-200 text-center transition-all flex flex-col items-center justify-center"
                    title="मालिक से मिला पैसा"
                  >
                    <IndianRupee className="w-4 h-4 text-amber-700 mb-0.5" />
                    <span className="text-[10px] font-black">मालिक</span>
                  </Link>

                  <Link
                    href={`/sites/${site.id}/expenses`}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-950 border border-rose-200 text-center transition-all flex flex-col items-center justify-center"
                    title="साइट के खर्चे (सामग्री / भाड़ा)"
                  >
                    <ShoppingBag className="w-4 h-4 text-rose-700 mb-0.5" />
                    <span className="text-[10px] font-black">खर्चे</span>
                  </Link>

                  <Link
                    href={`/sites/${site.id}/calculate`}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-center transition-all flex flex-col items-center justify-center shadow-xs"
                    title="कुल हिसाब व पर्ची निकालें"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-400 mb-0.5" />
                    <span className="text-[10px] font-black text-amber-400">हिसाब</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Site Modal */}
      <AddSiteModal
        isOpen={isSiteModalOpen}
        onClose={() => setIsSiteModalOpen(false)}
        onSiteCreated={() => {
          setIsSiteModalOpen(false);
          fetchSites();
        }}
      />
    </div>
  );
}

