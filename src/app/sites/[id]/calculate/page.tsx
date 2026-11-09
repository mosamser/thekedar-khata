'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileSpreadsheet,
  Calendar,
  ArrowLeft,
  Calculator,
  Building2,
  Clock,
  Sparkles,
  Printer,
  CalendarRange,
  Info
} from 'lucide-react';
import { Site, SiteCalculationSummary } from '@/lib/types';
import { formatDateIndian } from '@/lib/utils';
import { CalculationChart } from '@/components/CalculationChart';

export default function SiteCalculatePage() {
  const params = useParams();
  const siteId = params.id as string;

  const [site, setSite] = useState<Site | null>(null);

  // Helper for today's local date YYYY-MM-DD
  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getTodayStr();

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [summary, setSummary] = useState<SiteCalculationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePreset, setActivePreset] = useState<'START_TO_TODAY' | 'TODAY_ONLY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('START_TO_TODAY');

  // Fetch site info
  useEffect(() => {
    fetch(`/api/sites/${siteId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.site) {
          const siteData = data.site;
          setSite(siteData);

          // User Requirement:
          // "aur agar site 9 nov se start hai aur agr maine kul hisab pe click kiya to only start date to jab maine click kiya us date tak hi aaye"
          // If site started on 9 Nov, default start date is 9 Nov and end date is today (when clicked)!
          let siteStart = siteData.startDate ? siteData.startDate.split('T')[0] : todayStr;
          
          // If start date is in future, fallback to today
          if (siteStart > todayStr) {
            siteStart = todayStr;
          }

          setStartDate(siteStart);
          setEndDate(todayStr);
          setActivePreset('START_TO_TODAY');
          runCalculation(siteStart, todayStr);
        }
      })
      .catch((err) => console.error(err));
  }, [siteId]);

  const runCalculation = async (from: string, to: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/sites/${siteId}/calculate?startDate=${from}&endDate=${to}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to calculate');
      }
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'हिसाब निकालने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('कृपया दोनों तारीखें चुनें');
      return;
    }
    if (startDate > endDate) {
      setError('शुरू की तारीख अंत की तारीख से पहले होनी चाहिए');
      return;
    }
    setActivePreset('CUSTOM');
    runCalculation(startDate, endDate);
  };

  // Preset Handlers
  const handleSiteStartToToday = () => {
    if (!site) return;
    const siteStart = site.startDate ? site.startDate.split('T')[0] : todayStr;
    const effectiveStart = siteStart <= todayStr ? siteStart : todayStr;
    setStartDate(effectiveStart);
    setEndDate(todayStr);
    setActivePreset('START_TO_TODAY');
    runCalculation(effectiveStart, todayStr);
  };

  const handleTodayOnly = () => {
    setStartDate(todayStr);
    setEndDate(todayStr);
    setActivePreset('TODAY_ONLY');
    runCalculation(todayStr, todayStr);
  };

  const handleQuickPastDays = (days: number) => {
    const end = todayStr;
    const now = new Date();
    now.setDate(now.getDate() - (days - 1));
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const start = `${y}-${m}-${d}`;

    setStartDate(start);
    setEndDate(end);
    setActivePreset('WEEK');
    runCalculation(start, end);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const start = `${y}-${m}-01`;

    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    const end = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

    setStartDate(start);
    setEndDate(end);
    setActivePreset('MONTH');
    runCalculation(start, end);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <Link
            href={`/sites/${siteId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{site?.name || 'साइट पर वापस जाएं'}</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-amber-500" />
            कुल हिसाब कैलकुलेटर (Settlement Engine)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            साइट शुरू होने की तारीख से लेकर आज तक का पूरा डेट-वाइज हाजिरी व मजदूरी चार्ट
          </p>
        </div>

        {site && (
          <div className="bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-700 block">साइट शुरू तारीख:</span>
              <strong className="text-slate-900 font-black">{formatDateIndian(site.startDate)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* DATE RANGE SELECTOR CARD */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Preset quick buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-amber-600" />
              अवधि चुनें (Select Period):
            </span>
            <span className="text-[11px] text-slate-400">
              * अपनी सुविधा अनुसार अवधि चुनें
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Recommended: Site Start to Today */}
            <button
              type="button"
              onClick={handleSiteStartToToday}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                activePreset === 'START_TO_TODAY'
                  ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-500 ring-offset-1'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              <span>⭐ साइट शुरू से आज तक</span>
              {site && (
                <span className="text-[10px] opacity-80">
                  ({formatDateIndian(site.startDate).split(' ')[0]} {formatDateIndian(site.startDate).split(' ')[1]} से)
                </span>
              )}
            </button>

            {/* Today Only */}
            <button
              type="button"
              onClick={handleTodayOnly}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreset === 'TODAY_ONLY'
                  ? 'bg-slate-900 text-white font-black'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              📅 सिर्फ आज का हिसाब (Today Only)
            </button>

            {/* Past 7 Days */}
            <button
              type="button"
              onClick={() => handleQuickPastDays(7)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreset === 'WEEK'
                  ? 'bg-slate-900 text-white font-black'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              📅 पिछले 7 दिन (Past 7 Days)
            </button>

            {/* Full Month */}
            <button
              type="button"
              onClick={handleThisMonth}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreset === 'MONTH'
                  ? 'bg-blue-600 text-white font-black'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
              }`}
            >
              📆 इस महीने का पूरा हिसाब (Full Month)
            </button>
          </div>
        </div>

        {/* Custom Date Form */}
        <form
          onSubmit={handleCalculateClick}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 pt-3 border-t border-slate-100 items-end"
        >
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>शुरू तारीख *</span>
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setActivePreset('CUSTOM');
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm font-black bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>अंतिम तारीख *</span>
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setActivePreset('CUSTOM');
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm font-black bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Calculator className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'कैलकुलेट हो रहा है...' : 'कुल हिसाब देखें (Calculate)'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2 rounded-xl font-medium">
            {error}
          </div>
        )}
      </div>

      {/* RENDER MASTER CHART */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            हाजिरी, दिहाड़ी और खर्चे का पूरा हिसाब जोड़ा जा रहा है...
          </p>
        </div>
      ) : summary ? (
        <CalculationChart summary={summary} />
      ) : null}
    </div>
  );
}
