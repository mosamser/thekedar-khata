'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  IndianRupee,
  Calendar,
  Building2,
  User,
  Phone,
  ArrowLeft,
  PlusCircle,
  CreditCard,
  TrendingUp,
  FileText,
  Printer,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Edit2,
  MapPin
} from 'lucide-react';
import { Site, OwnerPayment } from '@/lib/types';
import { formatCurrency, formatDateIndian } from '@/lib/utils';
import { AddOwnerPaymentModal } from '@/components/AddOwnerPaymentModal';
import { EditSiteDealModal } from '@/components/EditSiteDealModal';

export default function OwnerHisabPage() {
  const params = useParams();
  const siteId = params.id as string;

  const [site, setSite] = useState<Site | null>(null);
  const [payments, setPayments] = useState<OwnerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditDealModalOpen, setIsEditDealModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [siteRes, payRes] = await Promise.all([
        fetch(`/api/sites/${siteId}`).then((r) => r.json()),
        fetch(`/api/sites/${siteId}/owner-payments`).then((r) => r.json()),
      ]);

      if (siteRes.success) setSite(siteRes.site);
      if (payRes.success) setPayments(payRes.payments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [siteId]);

  const handleDelete = async (paymentId: string) => {
    if (!confirm('क्या आप इस पेमेंट को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/sites/${siteId}/owner-payments?id=${paymentId}`, {
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

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppOwnerShare = () => {
    const text = `*नमस्ते ${site.ownerName || 'जी'},*\n` +
      `आपकी निर्माण साइट *"${site.name}"* का वर्तमान भुगतान हिसाब विवरण:\n` +
      `-----------------------------------\n` +
      `🔹 कुल तय ठेका राशि: ${formatCurrency(totalContract)}\n` +
      `🔹 अब तक प्राप्त कुल किश्तें: ${formatCurrency(totalReceived)} (${percentReceived}% भुगतान प्राप्त)\n` +
      `-----------------------------------\n` +
      `💰 *कुल बकाया देय राशि: ${formatCurrency(remainingFromOwner)}*\n` +
      `-----------------------------------\n` +
      `विवरण व रसीद ठेकेदार द्वारा प्रमाणित।\n` +
      `कृपया अगली किश्त जारी करने की कृपा करें। धन्यवाद!`;

    const encoded = encodeURIComponent(text);
    const url = site.ownerPhone
      ? `https://wa.me/91${site.ownerPhone.replace(/\D/g, '')}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
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

  const totalContract = site.contractAmount || 0;
  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingFromOwner = Math.max(0, totalContract - totalReceived);
  const percentReceived = totalContract > 0 ? Math.round((totalReceived / totalContract) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* PRINT-ONLY HEADER FOR OWNER ACCOUNTING */}
      <div className="print-only mb-5 pb-3 border-b-2 border-black">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">
              {site.name}
            </h1>
            {site.location && (
              <p className="text-xs text-black flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                <span>{site.location}</span>
              </p>
            )}
            <p className="text-xs font-bold text-black mt-1">
              मालिक का नाम: {site.ownerName || 'नाम दर्ज नहीं'} {site.ownerPhone ? `(${site.ownerPhone})` : ''}
            </p>
            <p className="text-xs text-gray-700">
              साइट शुरू तारीख: {formatDateIndian(site.startDate)}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black text-black uppercase">
              मालिक भुगतान रसीद व खाता
            </h2>
            <p className="text-xs text-gray-700 font-bold">ठेकेदार डायरी (Contractor Client Ledger)</p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              प्रिंट दिनांक: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Print Summary Line */}
        <div className="mt-3 pt-2 border-t border-black grid grid-cols-3 gap-2 text-xs font-bold text-black">
          <div>कुल तय ठेका: {formatCurrency(totalContract)}</div>
          <div>मालिक से प्राप्त कुल: {formatCurrency(totalReceived)}</div>
          <div className="text-right font-black">मालिक से लेना बाकी: {formatCurrency(remainingFromOwner)}</div>
        </div>
      </div>

      {/* Top Bar (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <Link
            href={`/sites/${siteId}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {site.name}
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-amber-600" />
            ठेकेदार का मालिक से हिसाब (Owner Accounting)
          </h1>
          <p className="text-xs text-slate-500">
            मालिक से तय कुल ठेका राशि, मिली हुई किश्तें और बकाया वसूली
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditDealModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-xs transition-all active:scale-95"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>ठेका राशि बदलें</span>
          </button>
          <button
            onClick={handleWhatsAppOwnerShare}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-xs active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp तगादा
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2 rounded-xl text-xs sm:text-sm shadow-xs transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            + किश्त दर्ज करें
          </button>
          <button
            onClick={handlePrint}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs transition-colors"
            title="प्रिंट निकालें"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OWNER SUMMARY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Contract Amount (with 1-click edit button) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
                कुल तय ठेका राशि
              </span>
              <button
                type="button"
                onClick={() => setIsEditDealModalOpen(true)}
                className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-lg active:scale-95 transition-all"
              >
                <Edit2 className="w-2.5 h-2.5" />
                <span>बदलें</span>
              </button>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {formatCurrency(totalContract)}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>ठेके का प्रकार: <strong>{site.contractType}</strong></span>
            <button
              type="button"
              onClick={() => setIsEditDealModalOpen(true)}
              className="text-amber-800 font-bold hover:underline"
            >
              एडिट करें
            </button>
          </p>
        </div>

        {/* Total Received */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">
            मालिक से अब तक मिला
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {formatCurrency(totalReceived)}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-bold">
            कुल {percentReceived}% पेमेंट प्राप्त
          </p>
        </div>

        {/* Balance Remaining from Owner */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 p-4 rounded-2xl shadow-sm border border-amber-400">
          <span className="text-slate-950/80 text-xs font-black uppercase tracking-wider block mb-1">
            मालिक से लेना बाकी है
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-950">
            {formatCurrency(remainingFromOwner)}
          </div>
          <p className="text-[11px] text-slate-950/80 mt-1 font-semibold">
            (तय ठेका - अब तक मिला भुगतान)
          </p>
        </div>

        {/* Owner Info Box */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xs border border-slate-800">
          <span className="text-amber-400 text-xs font-black uppercase tracking-wider block mb-1">
            मालिक का संपर्क (Owner)
          </span>
          <div className="text-base font-black text-white">{site.ownerName || 'नाम दर्ज नहीं'}</div>
          {site.ownerPhone ? (
            <a
              href={`tel:${site.ownerPhone}`}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 mt-1 font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" /> {site.ownerPhone}
            </a>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">फोन नंबर दर्ज नहीं है</p>
          )}
        </div>
      </div>

      {/* Progress Bar of Payment Received */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-700">मालिक का भुगतान रिकवरी स्टेटस:</span>
          <span className="text-amber-800">
            {formatCurrency(totalReceived)} / {formatCurrency(totalContract)} ({percentReceived}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, percentReceived)}%` }}
          />
        </div>
      </div>

      {/* PAYMENTS HISTORY LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            मालिक से प्राप्त भुगतानों का विवरण ({payments.length} किश्तें दर्ज हैं)
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="no-print text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
          >
            + नई किश्त जोड़ें
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl space-y-2">
            <p className="text-xs text-slate-500">अभी मालिक से कोई पेमेंट दर्ज नहीं है।</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" /> पहली किश्त दर्ज करें
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View: Transaction Ledger Cards */}
            <div className="no-print md:hidden space-y-2.5">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateIndian(p.date)}</span>
                      </div>
                      <div className="mt-1">
                        <span className="inline-block text-xs font-black bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-lg border border-amber-300">
                          {p.stage || 'किश्त'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">प्राप्त रकम</span>
                      <span className="text-base font-black text-emerald-700">
                        +{formatCurrency(p.amount)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold">
                      {p.paymentMode === 'CASH' && 'नकद (Cash)'}
                      {p.paymentMode === 'UPI' && 'UPI (GPay/PhonePe)'}
                      {p.paymentMode === 'CHEQUE' && 'चेक (Cheque)'}
                      {p.paymentMode === 'BANK_TRANSFER' && 'बैंक ट्रांसफर'}
                    </span>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {p.notes && (
                    <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100 italic">
                      नोट: {p.notes}
                    </p>
                  )}
                </div>
              ))}

              {/* Total Card on Mobile */}
              <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
                <span className="text-xs font-bold text-slate-300">कुल प्राप्त किश्तें:</span>
                <span className="text-base font-black text-emerald-400">
                  {formatCurrency(totalReceived)}
                </span>
              </div>
            </div>

            {/* Desktop & Print: Full Data Table */}
            <div className="hidden md:block print:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="py-2.5 px-3">तारीख (Date)</th>
                    <th className="py-2.5 px-3">काम की स्टेज / किश्त</th>
                    <th className="py-2.5 px-3">माध्यम (Mode)</th>
                    <th className="py-2.5 px-3">विवरण / नोट</th>
                    <th className="py-2.5 px-3 text-right">प्राप्त रकम (Amount ₹)</th>
                    <th className="no-print py-2.5 px-2 text-center">हटाएं</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {formatDateIndian(p.date)}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
                          {p.stage || 'किश्त'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {p.paymentMode === 'CASH' && 'नकद (Cash)'}
                        {p.paymentMode === 'UPI' && 'UPI (GPay/PhonePe)'}
                        {p.paymentMode === 'CHEQUE' && 'चेक (Cheque)'}
                        {p.paymentMode === 'BANK_TRANSFER' && 'बैंक ट्रांसफर'}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{p.notes || '-'}</td>
                      <td className="py-3 px-3 text-right font-black text-sm text-emerald-700">
                        +{formatCurrency(p.amount)}
                      </td>
                      <td className="no-print py-3 px-2 text-center">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                    <td className="py-3 px-3" colSpan={4}>
                      कुल प्राप्त भुगतान (Total Received from Owner)
                    </td>
                    <td className="py-3 px-3 text-right font-black text-base text-emerald-400">
                      {formatCurrency(totalReceived)}
                    </td>
                    <td className="no-print"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add Payment Modal */}
      <AddOwnerPaymentModal
        isOpen={isModalOpen}
        siteId={siteId}
        siteName={site.name}
        ownerName={site.ownerName}
        onClose={() => setIsModalOpen(false)}
        onPaymentAdded={loadData}
      />

      {/* Edit Site Deal Modal (Contract Amount & Owner Details) */}
      <EditSiteDealModal
        isOpen={isEditDealModalOpen}
        site={site}
        onClose={() => setIsEditDealModalOpen(false)}
        onSiteUpdated={(updatedSite) => {
          setSite(updatedSite);
          setIsEditDealModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}

