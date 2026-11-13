import React, { useState } from 'react';
import { CheckCircle2, PackageCheck, Building2, Globe2 } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

export function WholesalePage() {
  const [form, setForm] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: 'India',
    businessType: 'Retailer / Supermarket',
    productInterest: 'CTC Dust Tea',
    requiredQuantity: '',
    additionalMessage: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmittedRef(data.referenceCode);
      setForm({
        businessName: '',
        contactPerson: '',
        email: '',
        phone: '',
        country: 'India',
        businessType: 'Retailer / Supermarket',
        productInterest: 'CTC Dust Tea',
        requiredQuantity: '',
        additionalMessage: '',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFF7E5]/40 min-h-screen">
      <SeoHead
        title="Retail & Wholesale Supply – DoN Tea Traders India Private Limited"
        description="Retail & Wholesale Supply Available. Connect with DoN Tea Traders India Private Limited for retail orders, wholesale enquiries, bulk supply enquiries, and business & distributor enquiries."
      />

      <div className="bg-[#B82025] text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F6C629]">
            DoN Tea Traders India Private Limited · Trade &amp; Bulk Supply
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold mt-2">
            Retail &amp; Wholesale Supply Available.
          </h1>
          <p className="mt-4 text-base text-white/90 max-w-2xl leading-relaxed">
            Connect with DoN Tea Traders for retail orders, wholesale enquiries, bulk supply enquiries, and business &amp; distributor enquiries for 100% single-origin Valparai tea.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-5">
            <h2 className="font-display text-2xl font-bold text-[#29251F]">
              Enquiry &amp; Supply Channels
            </h2>
            <div className="flex items-start gap-3">
              <PackageCheck className="w-5 h-5 text-[#B82025] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-[#29251F]">
                  Retail Orders
                </h3>
                <p className="text-xs text-[#29251F]/70 mt-1">
                  Household packs across CTC Dust Tea, Granules Tea, and Leaf Tea via Shop or WhatsApp checkout.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#B82025] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-[#29251F]">
                  Wholesale &amp; Bulk Supply Enquiries
                </h3>
                <p className="text-xs text-[#29251F]/70 mt-1">
                  Structured bulk supply of 100% single-origin Valparai tea for supermarkets, cafés, hotels, and catering.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe2 className="w-5 h-5 text-[#B82025] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-[#29251F]">
                  Business &amp; Distributor Enquiries
                </h3>
                <p className="text-xs text-[#29251F]/70 mt-1">
                  Regional distribution partnerships and verified international trade buyers subject to export compliance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-lg border border-[#29251F]/10">
          {submittedRef ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#B82025] mx-auto" />
              <h2 className="font-display text-2xl font-bold text-[#29251F]">
                Wholesale Enquiry Recorded
              </h2>
              <p className="text-sm text-[#29251F]/80">
                Your enquiry reference is{' '}
                <span className="font-mono font-semibold text-[#B82025]">
                  {submittedRef}
                </span>
                . Our trade team will review your requirements and follow up.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedRef(null)}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#B82025] rounded"
              >
                Submit Another Enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-[#29251F] mb-2">
                Submit a Bulk Enquiry
              </h2>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#29251F] mb-1">
                    Business Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#29251F] mb-1">
                    Contact Person *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#29251F] mb-1">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#29251F] mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#29251F] mb-1">
                    Country *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#29251F] mb-1">
                    Business Type *
                  </label>
                  <select
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded bg-white focus:outline-none focus:border-[#B82025]"
                  >
                    <option>Retailer / Supermarket</option>
                    <option>Distributor / Wholesaler</option>
                    <option>Hotel / Restaurant / Café (HoReCa)</option>
                    <option>Importer / Export Partner</option>
                    <option>Corporate / Institutional Buyer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#29251F] mb-1">
                    Product Interest *
                  </label>
                  <select
                    value={form.productInterest}
                    onChange={(e) => setForm({ ...form, productInterest: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded bg-white focus:outline-none focus:border-[#B82025]"
                  >
                    <option>CTC Dust Tea</option>
                    <option>Granules Tea</option>
                    <option>Leaf Tea</option>
                    <option>All Valparai Tea Grades (Dust, Granules &amp; Leaf)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#29251F] mb-1">
                    Required Quantity *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 100 kg / month"
                    value={form.requiredQuantity}
                    onChange={(e) => setForm({ ...form, requiredQuantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29251F] mb-1">
                  Additional Message
                </label>
                <textarea
                  rows={4}
                  value={form.additionalMessage}
                  onChange={(e) => setForm({ ...form, additionalMessage: e.target.value })}
                  placeholder="Share pack-size preferences, destination port/city, or delivery schedule..."
                  className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3.5 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] rounded transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting Enquiry...' : 'Submit Wholesale Enquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
