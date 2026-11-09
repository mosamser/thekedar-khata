'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  IndianRupee,
  Calendar,
  Building2,
  ShoppingBag,
  ArrowLeft,
  PlusCircle,
  Trash2,
  Truck,
  Wrench,
  Coffee,
  Zap,
  Printer
} from 'lucide-react';
import { Site, SiteExpense } from '@/lib/types';
import { formatCurrency, formatDateIndian } from '@/lib/utils';
import { AddExpenseModal } from '@/components/AddExpenseModal';

export default function SiteExpensesPage() {
  const params = useParams();
  const siteId = params.id as string;

  const [site, setSite] = useState<Site | null>(null);
  const [expenses, setExpenses] = useState<SiteExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [siteRes, expRes] = await Promise.all([
        fetch(`/api/sites/${siteId}`).then((r) => r.json()),
        fetch(`/api/sites/${siteId}/expenses`).then((r) => r.json()),
      ]);

      if (siteRes.success) setSite(siteRes.site);
      if (expRes.success) setExpenses(expRes.expenses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [siteId]);

  const handleDelete = async (expenseId: string) => {
    if (!confirm('क्या आप इस खर्चे को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/sites/${siteId}/expenses?id=${expenseId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryInfo = (cat: string) => {
    switch (cat) {
      case 'MATERIAL':
        return { label: 'सामग्री / माल (रेत, सीमेंट, ईंट)', icon: '🧱', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'TRANSPORT':
        return { label: 'भाड़ा / किराया (गाड़ी, ढुलाई)', icon: '🚚', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'TOOLS':
        return { label: 'मशीनरी / औजार किराया', icon: '⚙️', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'TEA_SNACKS':
        return { label: 'चाय-नाश्ता', icon: '☕', color: 'bg-orange-100 text-orange-900 border-orange-300' };
      default:
        return { label: 'अन्य खर्च', icon: '⚡', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
        <div className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
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

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <Link
            href={`/sites/${siteId}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {site.name}
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-rose-600" />
            साइट के अन्य खर्चे (Material, Freight & Tools)
          </h1>
          <p className="text-xs text-slate-500">
            रेत, सीमेंट, गिट्टी, ट्रैक्टर-टेम्पो भाड़ा, मिक्सर किराया और चाय-नाश्ते का हिसाब
          </p>
        </div>

        <div className="no-print flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            + नया खर्चा लिखें
          </button>
        </div>
      </div>

      {/* EXPENSE SUMMARY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-5 rounded-2xl shadow-sm border border-rose-400">
          <span className="text-rose-100 text-xs font-bold uppercase tracking-wider block mb-1">
            कुल अन्य खर्चा
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {formatCurrency(totalExpenseAmount)}
          </div>
          <p className="text-[11px] text-rose-100 mt-1">
            (सामग्री + भाड़ा + मशीनरी किराया आदि)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">
            कुल खर्चे की प्रविष्टियां
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {expenses.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            दर्ज की गई रसीदें / पर्चियां
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">
            प्रोजेक्ट का नाम
          </span>
          <div className="text-lg font-black text-slate-900 truncate">
            {site.name}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            शुरू: {formatDateIndian(site.startDate)}
          </p>
        </div>
      </div>

      {/* EXPENSES LIST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            खर्चों की पूरी सूची ({expenses.length})
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="no-print text-xs font-bold text-rose-600 hover:text-rose-700 underline"
          >
            + नया खर्चा जोड़ें
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl space-y-2">
            <p className="text-xs text-slate-500">इस साइट पर अभी कोई अन्य खर्चा दर्ज नहीं है।</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-600 text-white px-3.5 py-1.5 rounded-xl shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" /> पहला खर्चा दर्ज करें
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View: Expense Cards */}
            <div className="no-print md:hidden space-y-2.5">
              {expenses.map((exp) => {
                const catInfo = getCategoryInfo(exp.category);
                return (
                  <div
                    key={exp.id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDateIndian(exp.date)}</span>
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold ${catInfo.color}`}>
                            <span>{catInfo.icon}</span>
                            <span>{catInfo.label}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">रकम</span>
                        <span className="text-base font-black text-rose-600">
                          {formatCurrency(exp.amount)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600 italic truncate max-w-[220px]">
                        {exp.description || 'कोई नोट नहीं'}
                      </span>

                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Total Card on Mobile */}
              <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
                <span className="text-xs font-bold text-slate-300">कुल अन्य खर्चे:</span>
                <span className="text-base font-black text-rose-300">
                  {formatCurrency(totalExpenseAmount)}
                </span>
              </div>
            </div>

            {/* Desktop & Print: Full Data Table */}
            <div className="hidden md:block print:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="py-2.5 px-3">तारीख</th>
                    <th className="py-2.5 px-3">श्रेणी (Category)</th>
                    <th className="py-2.5 px-3">विवरण / नोट</th>
                    <th className="py-2.5 px-3 text-right">रकम (Amount ₹)</th>
                    <th className="no-print py-2.5 px-2 text-center">हटाएं</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => {
                    const catInfo = getCategoryInfo(exp.category);
                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {formatDateIndian(exp.date)}
                        </td>
                        <td className="py-3 px-3 font-bold">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] ${catInfo.color}`}>
                            <span>{catInfo.icon}</span>
                            <span>{catInfo.label}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {exp.description || '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-sm text-rose-600">
                          {formatCurrency(exp.amount)}
                        </td>
                        <td className="no-print py-3 px-2 text-center">
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                            title="हटाएं"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                    <td className="py-3 px-3" colSpan={3}>
                      कुल खर्चा (Total Site Expenses)
                    </td>
                    <td className="py-3 px-3 text-right font-black text-base text-rose-300">
                      {formatCurrency(totalExpenseAmount)}
                    </td>
                    <td className="no-print"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        siteId={siteId}
        siteName={site.name}
        onClose={() => setIsModalOpen(false)}
        onExpenseAdded={loadData}
      />
    </div>
  );
}

