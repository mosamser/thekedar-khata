'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Printer,
  FileSpreadsheet,
  IndianRupee,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Share2,
  Building2,
  ShoppingBag,
  PlusCircle,
  ArrowRight,
  Download,
  Edit3,
  X,
  Check
} from 'lucide-react';
import { SiteCalculationSummary, WorkerHisabRow, AttendanceStatus } from '@/lib/types';
import { formatCurrency, formatDateIndian, formatDateShort, getAttendanceBadge, getRoleBadge, sortWorkersByHierarchy, cleanWorkerName } from '@/lib/utils';
import { WorkerSlipModal } from './WorkerSlipModal';
import { AddExpenseModal } from './AddExpenseModal';
import { PayWorkerModal } from './PayWorkerModal';

interface CalculationChartProps {
  summary: SiteCalculationSummary;
}

export function CalculationChart({ summary }: CalculationChartProps) {
  const [selectedRowForSlip, setSelectedRowForSlip] = useState<WorkerHisabRow | null>(null);
  const [payingWorker, setPayingWorker] = useState<WorkerHisabRow | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [mobileMode, setMobileMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [editingAttendance, setEditingAttendance] = useState<{
    workerId: string;
    workerName: string;
    isMistri: boolean;
    date: string;
    status: AttendanceStatus;
    overtimeHours: number;
    advanceAmount: number;
    advanceReason: string;
  } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const {
    site,
    startDate,
    endDate,
    datesList,
    rows,
    totalLaborDays,
    totalGrossPayable,
    totalAdvancePaid,
    totalNetPayable,
    totalOtherExpenses = 0,
    expensesList = [],
    ownerTotalContract,
    ownerTotalPaid,
    ownerBalanceDue,
    papaNetProfit,
  } = summary;

  const totalOverallSiteCost = totalGrossPayable + totalOtherExpenses;

  const handlePrint = () => {
    window.print();
  };

  const handleShareSiteSummaryWhatsApp = () => {
    const text = `*📋 साइट हिसाब रिपोर्ट - ${site.name}*\n` +
      `📅 अवधि: ${formatDateIndian(startDate)} से ${formatDateIndian(endDate)} (${datesList.length} दिन)\n` +
      `-----------------------------------\n` +
      `👷 कुल मजदूर: ${rows.length}\n` +
      `⏱️ कुल हाजिरी: ${totalLaborDays} दिन\n` +
      `💵 कुल मजदूरी बनी: ${formatCurrency(totalGrossPayable)}\n` +
      `🔻 काम के दौरान दिया खर्चा: -${formatCurrency(totalAdvancePaid)}\n` +
      `💰 *मजदूरों को बाकी देना है: ${formatCurrency(totalNetPayable)}*\n` +
      (totalOtherExpenses > 0 ? `🧱 अन्य खर्चे (सामग्री/भाड़ा): ${formatCurrency(totalOtherExpenses)}\n` : '') +
      `-----------------------------------\n` +
      `🏠 *मालिक से हिसाब (${site.ownerName || 'मालिक'}):*\n` +
      `कुल तय ठेका: ${formatCurrency(ownerTotalContract)}\n` +
      `मालिक से अब तक मिला: ${formatCurrency(ownerTotalPaid)}\n` +
      `*मालिक से लेना बाकी: ${formatCurrency(ownerBalanceDue)}*\n` +
      `*पापा की शुद्ध बचत/मुनाफा: ${formatCurrency(papaNetProfit)}*\n` +
      `-----------------------------------\n` +
      `ठेकेदार डायरी द्वारा प्रमाणित हिसाब।`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDownloadCSV = () => {
    const sorted = sortWorkersByHierarchy(rows);
    const headers = [
      'मजदूर का नाम',
      'दर (₹/दिन)',
      ...datesList.map((d) => d),
      'कुल दिन',
      'कुल मजदूरी (₹)',
      'लिया खर्चा (₹)',
      'बाकी देना (₹)',
    ];

    const dataRows = sorted.map((r) => {
      const datesVals = datesList.map((d) => {
        const item = r.dates[d];
        if (!item || item.status === 'ABSENT') return 'A';
        if (item.status === 'HALF_DAY') return 'HD';
        if (item.status === 'OVERTIME') return `OT(${item.overtimeHours}h)`;
        return 'P';
      });

      const workerLabel = r.role === 'MISTRI' ? `${r.workerName} (मिस्त्री)` : r.workerName;

      return [
        `"${workerLabel.replace(/"/g, '""')}"`,
        r.dailyRate,
        ...datesVals,
        r.totalDays,
        r.grossAmount,
        r.totalAdvance,
        r.netPayable,
      ].join(',');
    });

    const totalRow = [
      '"कुल जोड़ (Grand Total)"',
      '""',
      ...datesList.map(() => '""'),
      totalLaborDays,
      totalGrossPayable,
      totalAdvancePaid,
      totalNetPayable,
    ].join(',');

    const meta = [
      `"साइट का नाम: ${site.name.replace(/"/g, '""')}"`,
      `"अवधि: ${startDate} से ${endDate}"`,
      `"मालिक: ${site.ownerName || '-'} (फोन: ${site.ownerPhone || '-'})"`,
      '',
    ].join('\n');

    const csvContent = '\uFEFF' + meta + headers.join(',') + '\n' + dataRows.join('\n') + '\n' + totalRow;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${site.name}_हिसाब_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAttendanceEdit = async () => {
    if (!editingAttendance) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/sites/${site.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editingAttendance.date,
          records: [{
            workerId: editingAttendance.workerId,
            status: editingAttendance.status,
            overtimeHours: editingAttendance.overtimeHours,
            advanceAmount: editingAttendance.advanceAmount,
            advanceReason: editingAttendance.advanceReason,
          }],
        }),
      });

      if (res.ok) {
        setEditingAttendance(null);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const todayPrintDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 🖨️ DEDICATED PRINT HEADER (COLORFUL & CLEAN)                   */}
      {/* Top Left: Site Name | Left: Start & End Date                   */}
      {/* ============================================================== */}
      <div className="print-only mb-4 pb-3 border-b-2 border-slate-900">
        <div className="flex justify-between items-start">
          {/* Top Left Corner */}
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {site.name}
            </h1>
            {site.location && (
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                📍 जगह / पता: {site.location}
              </p>
            )}
            {/* Start and End Date on the left */}
            <p className="text-sm font-black text-slate-900 mt-1">
              अवधि: <span className="text-amber-800">{formatDateIndian(startDate)}</span> से{' '}
              <span className="text-amber-800">{formatDateIndian(endDate)}</span> ({datesList.length} दिन)
            </p>
            {site.ownerName && (
              <p className="text-xs text-slate-800 font-semibold mt-0.5">
                मालिक: {site.ownerName} {site.ownerPhone ? `(${site.ownerPhone})` : ''}
              </p>
            )}
          </div>

          {/* Top Right Corner */}
          <div className="text-right">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
              मास्टर हाजिरी व हिसाब रजिस्टर
            </h2>
            <p className="text-xs text-amber-700 font-bold">
              ठेकेदार डायरी (Contractor Master Register)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              प्रिंट दिनांक: {todayPrintDate}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ON-SCREEN ACTION HEADER (Hidden in Print)                      */}
      {/* ============================================================== */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 p-1.5 rounded-lg font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              मास्टर हाजिरी व हिसाब रजिस्टर (Attendance & Wages Matrix)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            अवधि: <strong className="text-slate-800">{formatDateIndian(startDate)}</strong> से{' '}
            <strong className="text-slate-800">{formatDateIndian(endDate)}</strong> ({datesList.length} दिन)
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-xs active:scale-95 transition-all"
            title="Excel / Sheets में देखने के लिए CSV डाउनलोड करें"
          >
            <Download className="w-4 h-4 text-blue-600" />
            Excel / CSV
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-xs active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-rose-600" />
            + अन्य खर्चा
          </button>
          <button
            onClick={handleShareSiteSummaryWhatsApp}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-xs active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp रिपोर्ट
          </button>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-xs active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            प्रिंट / PDF सेव करें
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ON-SCREEN SUMMARY STAT CARDS (Hidden in Print)                 */}
      {/* ============================================================== */}
      <div className="no-print grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Labor Days */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>कुल हाजिरी दिन</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {totalLaborDays} <span className="text-xs text-slate-500 font-normal">दिन काम</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            कुल {rows.length} मजदूरों का कुल योग
          </p>
        </div>

        {/* Total Gross Wages */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>बनी कुल मजदूरी</span>
            <IndianRupee className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {formatCurrency(totalGrossPayable)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            दिहाड़ी दर के अनुसार कुल देय
          </p>
        </div>

        {/* Total Advance Taken */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>पहले दिया खर्चा</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            {formatCurrency(totalAdvancePaid)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            मजदूरों द्वारा लिया गया एडवांस
          </p>
        </div>

        {/* Net Remaining Payable */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 p-4 rounded-2xl shadow-sm border border-amber-400">
          <div className="flex items-center justify-between text-slate-950/80 text-xs font-black uppercase tracking-wider mb-1">
            <span>मजदूरों को बाकी देना है</span>
            <IndianRupee className="w-4 h-4 text-slate-950" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-950">
            {formatCurrency(totalNetPayable)}
          </div>
          <p className="text-[11px] text-slate-950/80 mt-1 font-semibold">
            (मजदूरी - पेशगी खर्चा)
          </p>
        </div>
      </div>

      {/* SECTION: ठेकेदार का मालिक से हिसाब और अन्य खर्चे */}
      <div className="no-print bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-amber-400 font-black">
              मालिक से हिसाब व साइट लागत
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{site.ownerName ? `मालिक: ${site.ownerName}` : 'मालिक का खाता'}</span>
              {site.ownerPhone && (
                <span className="text-xs text-slate-400 font-normal">({site.ownerPhone})</span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/sites/${site.id}/expenses`}
              className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 px-3 py-1 rounded-xl text-xs font-bold transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              अन्य खर्चे देखें ({formatCurrency(totalOtherExpenses)})
            </Link>
            <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-slate-300">
              ठेका: <strong className="text-amber-400">{site.contractType}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">कुल तय ठेका राशि:</span>
            <span className="text-base sm:text-lg font-black text-white">{formatCurrency(ownerTotalContract)}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">मालिक से प्राप्त:</span>
            <span className="text-base sm:text-lg font-black text-emerald-400">{formatCurrency(ownerTotalPaid)}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">मालिक से लेना बाकी:</span>
            <span className="text-base sm:text-lg font-black text-amber-400">{formatCurrency(ownerBalanceDue)}</span>
          </div>
          <div>
            <span className="text-[11px] text-rose-300 block font-medium">अन्य खर्चे (माल/भाड़ा):</span>
            <span className="text-base sm:text-lg font-black text-rose-400">{formatCurrency(totalOtherExpenses)}</span>
          </div>
          <div>
            <span className="text-[11px] text-cyan-300 block font-medium">पापा की शुद्ध बचत:</span>
            <span className={`text-base sm:text-lg font-black ${papaNetProfit >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
              {formatCurrency(papaNetProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 📊 COLORFUL MASTER ATTENDANCE & ADVANCES TABLE / CARDS         */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:border-slate-800 print:shadow-none">
        {/* Mobile View Switcher (Cards vs Matrix Table) */}
        <div className="no-print sm:hidden px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between gap-2 border-b border-slate-800">
          <span className="text-xs font-black text-amber-400">मोड:</span>
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setMobileMode('TABLE')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                mobileMode === 'TABLE' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300'
              }`}
            >
              📊 पूरी टेबल
            </button>
            <button
              onClick={() => setMobileMode('CARDS')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                mobileMode === 'CARDS' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300'
              }`}
            >
              📋 मजदूर कार्ड्स
            </button>
          </div>
        </div>

        {/* Mobile Cards Summary View (Fast at-a-glance settlement on phones) */}
        {mobileMode === 'CARDS' && (
          <div className="no-print sm:hidden p-3 space-y-3 bg-slate-50 print:!hidden">
            {sortWorkersByHierarchy(rows).map((row) => {
              const roleInfo = getRoleBadge(row.role);
              const isFemale = row.gender === 'FEMALE' || row.role === 'REJA';

              return (
                <div
                  key={row.workerId}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="font-black text-sm text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>{cleanWorkerName(row.workerName)}</span>
                        {row.role === 'MISTRI' && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                            मिस्त्री
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">दर: {formatCurrency(row.dailyRate)}/दिन</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg inline-block">
                        {row.totalDays} दिन काम
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">बनी कुल मजदूरी:</span>
                      <span className="font-black text-emerald-700 text-sm">
                        {formatCurrency(row.grossAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">काम दौरान लिया खर्चा:</span>
                      <span className="font-black text-rose-600 text-sm">
                        {row.totalAdvance > 0 ? `-${formatCurrency(row.totalAdvance)}` : '₹0'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">बाकी देना है:</span>
                      <span className="text-base font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded-xl border border-amber-300 inline-block">
                        {formatCurrency(row.netPayable)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <button
                        onClick={() => setPayingWorker(row)}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs"
                        title="काम के बाद भुगतान करें"
                      >
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>भुगतान</span>
                      </button>

                      <button
                        onClick={() => {
                          const lastDate = datesList[datesList.length - 1] || startDate;
                          const lastStatus = row.dates[lastDate]?.status || 'PRESENT';
                          const lastOT = row.dates[lastDate]?.overtimeHours || 0;
                          setEditingAttendance({
                            workerId: row.workerId,
                            workerName: row.workerName,
                            isMistri: row.role === 'MISTRI',
                            date: lastDate,
                            status: lastStatus,
                            overtimeHours: lastOT,
                            advanceAmount: 0,
                            advanceReason: '',
                          });
                        }}
                        className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-all"
                      >
                        <Edit3 className="w-3 h-3 text-amber-700" />
                        <span>हाजिरी</span>
                      </button>

                      <button
                        onClick={() => setSelectedRowForSlip(row)}
                        className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-amber-400 px-2.5 py-1.5 rounded-xl text-xs font-black shadow-xs active:scale-95 transition-all"
                      >
                        <FileText className="w-3 h-3 text-amber-400" />
                        <span>पर्ची</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Sabhi ka Grand Total Card on Mobile */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-850 text-white p-4 rounded-2xl shadow-md border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-black block">
                🏁 कुल जोड़ (Grand Total)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-slate-400 text-[10px] block">कुल मजदूर हाजिरी:</span>
                  <span className="text-sm font-black text-white">{totalLaborDays} दिन</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">कुल बनी मजदूरी:</span>
                  <span className="text-sm font-black text-emerald-400">{formatCurrency(totalGrossPayable)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">कुल दिया खर्चा:</span>
                  <span className="text-sm font-black text-rose-400">-{formatCurrency(totalAdvancePaid)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">अन्य खर्चे (माल/भाड़ा):</span>
                  <span className="text-sm font-black text-amber-300">{formatCurrency(totalOtherExpenses)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-200">मजदूरों को कुल बाकी देना:</span>
                <span className="text-lg font-black text-amber-400">{formatCurrency(totalNetPayable)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Master Table Container (Hidden on mobile if CARDS active, Always shown in print) */}
        <div className={`${mobileMode === 'CARDS' ? 'hidden sm:block' : 'block'} print:!block print-table-container`}>
          {/* Mobile Swipe Helper Banner */}
          <div className="no-print sm:hidden bg-amber-50 text-amber-900 border-b border-amber-200 px-3 py-1.5 text-[11px] font-black flex items-center justify-between">
            <span>👈 दायें-बायें स्वाइप करें</span>
            <span>पूरी हाजिरी तारीखें देखें 👉</span>
          </div>

          {/* Screen Legend (Hidden in Print) */}
          <div className="no-print px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-600">संकेत (Legend):</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
                  P
                </span>
                <span className="text-slate-600">उपस्थित (1.0)</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  HD
                </span>
                <span className="text-slate-600">आधा दिन (0.5)</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-md bg-rose-600 text-white font-black text-[10px] flex items-center justify-center">
                  A
                </span>
                <span className="text-slate-600">गैरहाजिर (0)</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                  OT
                </span>
                <span className="text-slate-600">ओवरटाइम</span>
              </span>
            </div>

            <span className="text-slate-400 text-[11px]">
              * टेबल को दायें-बायें स्क्रोल करें
            </span>
          </div>

          {/* COLORFUL PRINT & WEB TABLE */}
          <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left border-collapse text-xs print:text-[10pt]">
            <thead>
              <tr className="bg-slate-900 text-white print:bg-slate-900 print:text-white">
                <th className="py-1.5 px-2 font-black sticky left-0 z-20 bg-slate-900 text-white min-w-[105px] sm:min-w-[120px] print:min-w-0 print:w-auto border border-slate-800 text-xs print:text-[8pt]">
                  <span className="print:hidden">मजदूर का नाम</span>
                  <span className="hidden print:inline">नाम</span>
                </th>
                <th className="py-1.5 px-1 font-bold min-w-[48px] print:min-w-0 print:w-auto text-right border border-slate-800 text-[10px] print:text-[8pt]">
                  दर ₹
                </th>

                {/* Date Columns (Compact width to fit 25-30+ days!) */}
                {datesList.map((d) => {
                  const dayDate = new Date(d);
                  const dayName = dayDate.toLocaleDateString('en-IN', { weekday: 'narrow' });
                  const dateNum = dayDate.getDate();
                  const isSunday = dayDate.getDay() === 0;

                  return (
                    <th
                      key={d}
                      className={`py-1 px-0.5 text-center w-7 min-w-[24px] max-w-[28px] print:w-auto print:min-w-0 print:p-0.5 border border-slate-800 ${
                        isSunday ? 'bg-rose-950 text-rose-300' : 'bg-slate-900 text-white'
                      }`}
                    >
                      <div className="text-[8px] print:text-[6.5pt] uppercase font-semibold text-slate-400">{dayName}</div>
                      <div className="text-[10px] print:text-[7.5pt] font-black text-amber-400">{dateNum}</div>
                    </th>
                  );
                })}

                {/* Summary Columns */}
                <th className="py-1.5 px-1 font-black text-center min-w-[38px] print:min-w-0 print:w-auto bg-slate-800 text-white border border-slate-700 text-[10px] print:text-[8pt]">
                  दिन
                </th>
                <th className="py-1.5 px-1 font-black text-right min-w-[62px] print:min-w-0 print:w-auto bg-slate-800 text-emerald-300 border border-slate-700 text-[10px] print:text-[8pt]">
                  कुल ₹
                </th>
                <th className="py-1.5 px-1 font-black text-right min-w-[55px] print:min-w-0 print:w-auto bg-slate-800 text-rose-300 border border-slate-700 text-[10px] print:text-[8pt]">
                  खर्चा
                </th>
                <th className="py-1.5 px-1.5 font-black text-right min-w-[68px] print:min-w-0 print:w-auto bg-amber-500 text-slate-950 border border-amber-600 text-xs print:text-[8pt]">
                  बाकी ₹
                </th>
                <th className="no-print py-1.5 px-1 font-bold text-center min-w-[80px] bg-slate-850 text-[10px]">
                  भुगतान / पर्ची
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 print:divide-slate-300">
              {sortWorkersByHierarchy(rows).map((row) => {
                return (
                  <tr key={row.workerId} className="hover:bg-amber-50/40 transition-colors print:bg-white">
                    {/* Worker Name with Mistri badge only on screen, HIDDEN in print to save width */}
                    <td className="py-1.5 px-2 font-bold text-slate-900 sticky left-0 z-10 bg-white group-hover:bg-amber-50/40 border border-slate-300 print:border-slate-300 print:min-w-0 print:w-auto print:text-[8pt] print:p-1">
                      <div className="font-black flex items-center gap-1 flex-wrap text-xs print:text-[8pt]">
                        <span>{cleanWorkerName(row.workerName)}</span>
                        {row.role === 'MISTRI' && (
                          <span className="print:hidden text-[9px] font-black bg-blue-100 text-blue-900 border border-blue-300 px-1 py-0.2 rounded">
                            मिस्त्री
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Daily Rate */}
                    <td className="py-1.5 px-1 text-right font-semibold text-slate-700 print:text-slate-900 border border-slate-300 print:border-slate-300 text-[10px] print:text-[8pt] print:p-1">
                      {formatCurrency(row.dailyRate)}
                    </td>

                    {/* COLORFUL Date-wise Attendance Badges (Always visible in web & print) */}
                    {datesList.map((d) => {
                      const item = row.dates[d] || { status: 'ABSENT', overtimeHours: 0 };
                      const badge = getAttendanceBadge(item.status);
                      return (
                        <td key={d} className="py-1 px-0.5 print:p-0.5 text-center border border-slate-300 print:border-slate-300 w-7 min-w-[24px] max-w-[28px] print:w-auto print:min-w-0">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setEditingAttendance({
                                workerId: row.workerId,
                                workerName: row.workerName,
                                isMistri: row.role === 'MISTRI',
                                date: d,
                                status: item.status,
                                overtimeHours: item.overtimeHours || 0,
                                advanceAmount: 0,
                                advanceReason: '',
                              });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setEditingAttendance({
                                  workerId: row.workerId,
                                  workerName: row.workerName,
                                  isMistri: row.role === 'MISTRI',
                                  date: d,
                                  status: item.status,
                                  overtimeHours: item.overtimeHours || 0,
                                  advanceAmount: 0,
                                  advanceReason: '',
                                });
                              }
                            }}
                            title={`${row.workerName} (${d}): ${badge.hindi} - बदलने के लिए क्लिक करें`}
                            className={`attendance-badge attendance-badge-${badge.short} inline-flex items-center justify-center w-5 h-5 print:w-4 print:h-4 rounded text-[10px] print:text-[8pt] font-black shadow-2xs hover:scale-110 active:scale-90 transition-transform cursor-pointer select-none print:shadow-none print:scale-100 ${badge.badgeClass}`}
                          >
                            {badge.short}
                          </span>
                        </td>
                      );
                    })}

                    {/* Total Din (Days worked) */}
                    <td className="py-1.5 px-1 text-center font-black text-slate-900 bg-slate-50 print:bg-slate-50 border border-slate-300 print:border-slate-300 text-[10px] print:text-[8pt] print:p-1">
                      {row.totalDays}
                    </td>

                    {/* Total Paisa (Gross Amount in emerald green) */}
                    <td className="py-1.5 px-1 text-right font-black text-emerald-700 print:text-emerald-700 bg-emerald-50/40 print:bg-emerald-50/30 border border-slate-300 print:border-slate-300 text-[10px] print:text-[8pt] print:p-1">
                      {formatCurrency(row.grossAmount)}
                    </td>

                    {/* Total Paisa Liya (Advance Taken in red) */}
                    <td className="py-1.5 px-1 text-right font-black text-rose-600 print:text-rose-600 bg-rose-50/40 print:bg-rose-50/30 border border-slate-300 print:border-slate-300 text-[10px] print:text-[8pt] print:p-1">
                      {row.totalAdvance > 0 ? `-${formatCurrency(row.totalAdvance)}` : '₹0'}
                    </td>

                    {/* Total Remaining Bacha (Remaining Balance in amber) */}
                    <td className="py-1.5 px-1.5 text-right font-black text-xs print:text-[8pt] bg-amber-100/80 text-amber-950 print:bg-amber-100 print:text-amber-950 border border-slate-300 print:border-slate-300 print:p-1">
                      {formatCurrency(row.netPayable)}
                    </td>

                    {/* Slip / Pay Buttons (Hidden in Print) */}
                    <td className="no-print py-1.5 px-1 text-center bg-slate-50">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setPayingWorker(row)}
                          className="px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded transition-colors whitespace-nowrap active:scale-95"
                          title="काम पूरा होने पर भुगतान करें"
                        >
                          💰 भुगतान
                        </button>
                        <button
                          onClick={() => setSelectedRowForSlip(row)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title="हिसाब पर्ची देखें"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* ============================================================== */}
            {/* 🏁 SABHI KA TOTAL (GRAND TOTAL ROW AT BOTTOM - COLORFUL)        */}
            {/* ============================================================== */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800 print:bg-slate-900 print:text-white">
                <td className="py-2 px-2 sticky left-0 z-10 bg-slate-900 text-amber-400 font-black border border-slate-800 text-xs">
                  कुल जोड़ (Grand Total)
                </td>
                <td className="py-2 px-1 text-right text-slate-400 border border-slate-800 text-[10px]">-</td>

                {/* Empty cells for date columns */}
                {datesList.map((d) => (
                  <td key={d} className="py-1 px-0.5 text-center text-slate-500 border border-slate-800 text-[9px] w-7 min-w-[24px] max-w-[28px]">
                    -
                  </td>
                ))}

                {/* Total Din */}
                <td className="py-2 px-1 text-center font-black text-amber-400 border border-slate-800 bg-slate-850 text-[10px]">
                  {totalLaborDays}
                </td>

                {/* Total Paisa (Total Wages in green) */}
                <td className="py-2 px-1 text-right font-black text-emerald-400 border border-slate-800 bg-slate-850 text-[10px]">
                  {formatCurrency(totalGrossPayable)}
                </td>

                {/* Total Paisa Liya (Total Advance in red) */}
                <td className="py-2 px-1 text-right font-black text-rose-300 border border-slate-800 bg-slate-850 text-[10px]">
                  -{formatCurrency(totalAdvancePaid)}
                </td>

                {/* Total Net Payable (Grand remaining in amber) */}
                <td className="py-2 px-1.5 text-right font-black text-xs text-amber-400 border border-slate-800 bg-slate-850">
                  {formatCurrency(totalNetPayable)}
                </td>

                <td className="no-print py-2 px-1 text-center bg-slate-850 text-slate-500 text-[10px]">
                  -
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        </div>
      </div>

      {/* Individual Worker Slip Modal */}
      <WorkerSlipModal
        isOpen={Boolean(selectedRowForSlip)}
        row={selectedRowForSlip}
        siteName={site.name}
        startDate={startDate}
        endDate={endDate}
        onClose={() => setSelectedRowForSlip(null)}
      />

      {/* Pay Worker / Settle Wages Modal (काम के बाद भुगतान) */}
      <PayWorkerModal
        isOpen={Boolean(payingWorker)}
        siteId={site.id}
        siteName={site.name}
        worker={payingWorker}
        onClose={() => setPayingWorker(null)}
        onPaymentSuccess={() => {
          setPayingWorker(null);
          window.location.reload();
        }}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        siteId={site.id}
        siteName={site.name}
        onClose={() => setIsExpenseModalOpen(false)}
        onExpenseAdded={() => {
          setIsExpenseModalOpen(false);
          // Refreshes calculation to include newly added expense
          window.location.reload();
        }}
      />

      {/* EDIT ATTENDANCE FULL-PAGE / MODAL (गलत हाजिरी सुधारें) */}
      {editingAttendance && (
        <div className="fixed inset-0 z-50 bg-slate-50 sm:bg-slate-950/75 sm:backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-4 overflow-y-auto animate-fade-in">
          <div className="min-h-screen sm:min-h-0 bg-white sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden border-0 sm:border sm:border-slate-200 flex flex-col justify-between">
            {/* Top Header */}
            <div className="bg-slate-900 text-white px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingAttendance(null)}
                  className="p-1 -ml-1 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                    <span>हाजिरी सुधारें (Edit Attendance)</span>
                  </h3>
                  <p className="text-[11px] text-amber-400 font-bold truncate max-w-[240px]">
                    {editingAttendance.workerName} {editingAttendance.isMistri && '(मिस्त्री)'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingAttendance(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Editor Body */}
            <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto">
              {/* Date Box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">हाजिरी की तारीख:</span>
                  <strong className="text-slate-900 text-sm font-black">
                    {formatDateIndian(editingAttendance.date)}
                  </strong>
                </div>
                <input
                  type="date"
                  value={editingAttendance.date}
                  onChange={(e) =>
                    setEditingAttendance({ ...editingAttendance, date: e.target.value })
                  }
                  className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              {/* Attendance Status Selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  सही हाजिरी स्थिति चुनें (Attendance Status) *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {/* P */}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAttendance({ ...editingAttendance, status: 'PRESENT' })
                    }
                    className={`min-h-[50px] py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center active:scale-95 ${
                      editingAttendance.status === 'PRESENT'
                        ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600 ring-offset-1'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-sm">🟢 P</span>
                    <span className="text-[10px] font-semibold">पूरा दिन</span>
                  </button>

                  {/* HD */}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAttendance({ ...editingAttendance, status: 'HALF_DAY' })
                    }
                    className={`min-h-[50px] py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center active:scale-95 ${
                      editingAttendance.status === 'HALF_DAY'
                        ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-500 ring-offset-1'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-sm">🟡 HD</span>
                    <span className="text-[10px] font-semibold">आधा दिन</span>
                  </button>

                  {/* A */}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAttendance({ ...editingAttendance, status: 'ABSENT' })
                    }
                    className={`min-h-[50px] py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center active:scale-95 ${
                      editingAttendance.status === 'ABSENT'
                        ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-600 ring-offset-1'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-sm">🔴 A</span>
                    <span className="text-[10px] font-semibold">गैरहाजिर</span>
                  </button>

                  {/* OT */}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAttendance({ ...editingAttendance, status: 'OVERTIME' })
                    }
                    className={`min-h-[50px] py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center active:scale-95 ${
                      editingAttendance.status === 'OVERTIME'
                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-1'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-sm">🔵 OT</span>
                    <span className="text-[10px] font-semibold">ओवरटाइम</span>
                  </button>
                </div>

                {/* If OT */}
                {editingAttendance.status === 'OVERTIME' && (
                  <div className="mt-2.5 flex items-center justify-between bg-indigo-50 p-2.5 rounded-xl text-xs text-indigo-900 border border-indigo-200">
                    <span className="font-bold">अतिरिक्त घंटे (Overtime Hours):</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={editingAttendance.overtimeHours || 2}
                        onChange={(e) =>
                          setEditingAttendance({
                            ...editingAttendance,
                            overtimeHours: Number(e.target.value),
                          })
                        }
                        className="w-16 px-2 py-1 bg-white border border-indigo-300 rounded-lg text-center font-black"
                      />
                      <span>घंटे</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Advance / Daily Kharcha */}
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/90 space-y-2">
                <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
                  इस तारीख को दिया गया खर्चा (Advance ₹)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={editingAttendance.advanceAmount || ''}
                      onChange={(e) =>
                        setEditingAttendance({
                          ...editingAttendance,
                          advanceAmount: e.target.value ? Number(e.target.value) : 0,
                        })
                      }
                      className="w-full pl-7 pr-3 py-2 text-sm font-black bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAttendance({ ...editingAttendance, advanceAmount: 0 })
                    }
                    className="text-xs font-bold bg-white text-slate-600 border border-slate-300 px-2.5 py-2 rounded-xl"
                  >
                    हटाएं (₹0)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAttendance({ ...editingAttendance, advanceAmount: 200 })
                    }
                    className="text-xs font-bold bg-white text-amber-900 border border-amber-300 px-2.5 py-2 rounded-xl"
                  >
                    +₹200
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAttendance({ ...editingAttendance, advanceAmount: 500 })
                    }
                    className="text-xs font-bold bg-white text-amber-900 border border-amber-300 px-2.5 py-2 rounded-xl"
                  >
                    +₹500
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingAttendance(null)}
                className="px-4 py-3 border border-slate-300 rounded-xl text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors"
              >
                रद्द करें
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveAttendanceEdit}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{savingEdit ? 'अपडेट हो रहा है...' : '✓ हाजिरी व खर्चा अपडेट करें'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
