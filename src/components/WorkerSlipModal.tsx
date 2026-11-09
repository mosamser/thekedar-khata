'use client';

import React from 'react';
import { X, ArrowLeft, Printer, Share2, Building2, Calendar, IndianRupee } from 'lucide-react';
import { WorkerHisabRow } from '@/lib/types';
import { formatCurrency, formatDateIndian, getRoleBadge } from '@/lib/utils';

interface WorkerSlipModalProps {
  isOpen: boolean;
  row: WorkerHisabRow | null;
  siteName: string;
  startDate: string;
  endDate: string;
  onClose: () => void;
}

export function WorkerSlipModal({
  isOpen,
  row,
  siteName,
  startDate,
  endDate,
  onClose,
}: WorkerSlipModalProps) {
  if (!isOpen || !row) return null;

  const roleInfo = getRoleBadge(row.role);

  // Generate date-wise breakdown for WhatsApp message
  const advancesBreakdownText = (row.advancesList && row.advancesList.length > 0)
    ? row.advancesList.map(a => `   • ${formatDateIndian(a.date)}: -${formatCurrency(a.amount)}${a.reason ? ` (${a.reason})` : ''}`).join('\n')
    : '   • कोई खर्चा नहीं लिया (₹0)';

  // Generate WhatsApp message text
  const shareText = `*ठेकेदार हिसाब पर्ची (Thekedar Khata)*\n` +
    `🏗️ साइट: ${siteName}\n` +
    `👷 मजदूर: ${row.workerName} (${roleInfo.hindi})\n` +
    `📅 अवधि: ${formatDateIndian(startDate)} से ${formatDateIndian(endDate)}\n` +
    `-----------------------------------\n` +
    `🔹 कुल हाजिरी: ${row.totalDays} दिन\n` +
    `🔹 दिहाड़ी दर: ${formatCurrency(row.dailyRate)}/दिन\n` +
    `🔹 कुल मजदूरी: ${formatCurrency(row.grossAmount)}\n` +
    `🔹 पहले लिया खर्चा: -${formatCurrency(row.totalAdvance)}\n` +
    `${advancesBreakdownText}\n` +
    `-----------------------------------\n` +
    `💰 *बाकी देना है: ${formatCurrency(row.netPayable)}*\n` +
    `-----------------------------------\n` +
    `हिसाब ठेकेदार द्वारा प्रमाणित।`;

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 sm:bg-slate-950/75 sm:flex sm:items-center sm:justify-center sm:p-4 overflow-y-auto">
      <div className="min-h-screen sm:min-h-0 bg-white sm:rounded-2xl shadow-2xl max-w-lg w-full flex flex-col sm:border border-slate-200">
        {/* App Bar (hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden text-slate-300 hover:text-white p-1 -ml-1 rounded-lg"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm sm:text-base">मजदूर हिसाब पर्ची (Wage Slip)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hidden sm:block text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slip Body (Printable Area) */}
        <div id="printable-slip" className="p-5 sm:p-6 bg-amber-50/20 text-slate-900 flex-1 overflow-y-auto">
          {/* Slip Header */}
          <div className="border-b-2 border-dashed border-slate-300 pb-4 text-center">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              ठेकेदार हिसाब पर्ची
            </h2>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              श्रम भुगतान व हाजिरी विवरण
            </p>
            <div className="mt-2.5 inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>{siteName}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
              अवधि: {formatDateIndian(startDate)} से {formatDateIndian(endDate)}
            </p>
          </div>

          {/* Worker Info */}
          <div className="py-3.5 border-b border-slate-200 flex justify-between items-center text-sm">
            <div>
              <p className="text-xs text-slate-500 font-medium">मजदूर का नाम:</p>
              <p className="font-black text-base text-slate-900 flex items-center gap-1.5">
                <span>{row.workerName}</span>
                {row.role === 'MISTRI' && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-300">
                    मिस्त्री
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {row.gender === 'FEMALE' ? 'महिला (Female)' : 'पुरुष (Male)'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-semibold">
                रेट: {formatCurrency(row.dailyRate)}/दिन
              </p>
            </div>
          </div>

          {/* Wage Calculations Table */}
          <div className="py-4 space-y-2.5 text-sm">
            <div className="flex justify-between items-center text-slate-700">
              <span>कुल हाजिरी दिन (Days Worked):</span>
              <span className="font-bold text-slate-900">{row.totalDays} दिन</span>
            </div>

            {row.overtimeHoursTotal > 0 && (
              <div className="flex justify-between items-center text-indigo-700">
                <span>अतिरिक्त ओवरटाइम (Overtime):</span>
                <span className="font-bold">+{row.overtimeHoursTotal} घंटे</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-700">
              <span>कुल बनी मजदूरी (Gross Pay):</span>
              <span className="font-bold text-emerald-700">{formatCurrency(row.grossAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-rose-700">
              <span>काम के दौरान लिया खर्चा (Advance):</span>
              <span className="font-bold">-{formatCurrency(row.totalAdvance)}</span>
            </div>

            {/* DATE-WISE ADVANCES BREAKDOWN TABLE (USER REQUESTED!) */}
            <div className="mt-3 pt-3 border-t border-dashed border-slate-300">
              <span className="text-xs font-black text-slate-800 block mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>किस-किस तारीख को पैसा लिया (खर्चा विवरण):</span>
              </span>

              {row.advancesList && row.advancesList.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs shadow-2xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <th className="py-1.5 px-2.5">तारीख</th>
                        <th className="py-1.5 px-2 text-right">रकम (₹)</th>
                        <th className="py-1.5 px-2 text-right">माध्यम / नोट</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {row.advancesList.map((adv, idx) => (
                        <tr key={adv.id || idx} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 font-bold text-slate-800">
                            {formatDateIndian(adv.date)}
                          </td>
                          <td className="py-2 px-2 text-right font-black text-rose-600">
                            -{formatCurrency(adv.amount)}
                          </td>
                          <td className="py-2 px-2 text-right text-slate-500 text-[11px]">
                            {adv.reason ? `${adv.reason} • ` : ''}
                            <span className="font-medium text-slate-600">
                              {adv.paymentMode === 'UPI' ? 'UPI' : 'नकद'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-rose-50 border-t border-rose-200 font-black text-rose-900 text-xs">
                        <td className="py-2 px-2.5">कुल खर्चा योग:</td>
                        <td className="py-2 px-2 text-right">-{formatCurrency(row.totalAdvance)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-medium">
                  <span>✓</span>
                  <span>इस अवधि में कोई पेशगी/खर्चा नहीं लिया गया (₹0)</span>
                </div>
              )}
            </div>

            {/* Net Amount Box */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex justify-between items-center shadow-xs">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-950 block">
                  कुल बाकी भुगतान (Net Balance Due):
                </span>
                <span className="text-[11px] text-slate-600 font-medium">ठेकेदार द्वारा देय अंतिम राशि</span>
              </div>
              <div className="text-2xl font-black text-amber-950">
                {formatCurrency(row.netPayable)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Sticky Bottom (no-print) */}
        <div className="no-print bg-slate-50 p-4 border-t border-slate-200 flex gap-2.5 sticky bottom-0">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp पर पर्ची भेजें
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 sm:py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            प्रिंट / PDF
          </button>
        </div>
      </div>
    </div>
  );
}
