import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SeoHead } from '../components/SeoHead';

export function ContactPage() {
  const { settings } = useStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send message');
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFF7E5]/35 min-h-screen">
      <SeoHead
        title="Contact Us – DON TRADERS"
        description="Reach DON TRADERS for retail tea enquiries, order follow-ups, domestic delivery questions, or business correspondence."
      />
      <div className="bg-[#FFF7E5] border-b border-[#29251F]/10 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
            Get In Touch
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mt-1">
            Contact Don Traders
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-5 h-fit">
          <h2 className="font-display text-xl font-bold text-[#29251F]">
            Business Contact Details
          </h2>
          <div className="space-y-4 text-sm text-[#29251F]/80">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#B82025] shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-[#29251F]">Email</p>
                <p>
                  {settings?.contactEmail ||
                    'Not yet configured — set in Admin Store Settings'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#B82025] shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-[#29251F]">Phone / WhatsApp</p>
                <p>
                  {settings?.contactPhone ||
                    'Not yet configured — set in Admin Store Settings'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#B82025] shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-[#29251F]">Registered Address</p>
                <p>
                  {settings?.businessAddress ||
                    'Not yet configured — set in Admin Store Settings'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-lg border border-[#29251F]/10">
          {sent ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#B82025] mx-auto" />
              <h2 className="font-display text-2xl font-bold text-[#29251F]">
                Message Received
              </h2>
              <p className="text-sm text-[#29251F]/75">
                Thank you for writing to Don Traders. Your message is recorded for administrator review.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#B82025] rounded"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-[#29251F]">
                Send a Message
              </h2>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Name *</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Subject *</label>
                  <input
                    required
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] rounded transition-colors disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function PolicyPage({
  type,
}: {
  type: 'shipping' | 'returns' | 'privacy' | 'terms';
}) {
  const { settings } = useStore();
  const policies = settings?.cmsContent?.policies;

  const map = {
    shipping: {
      title: 'Shipping Policy',
      body: policies?.shippingPolicy || '',
    },
    returns: {
      title: 'Returns & Refunds Policy',
      body: policies?.returnsPolicy || '',
    },
    privacy: {
      title: 'Privacy Policy',
      body: policies?.privacyPolicy || '',
    },
    terms: {
      title: 'Terms & Conditions',
      body: policies?.termsConditions || '',
    },
  }[type];

  return (
    <div className="bg-white min-h-screen py-14">
      <SeoHead
        title={`${map.title} – DON TRADERS`}
        description={`Read the ${map.title} for DON TRADERS tea orders, domestic deliveries, and international enquiries.`}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
          DON TRADERS Policies
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F]">
          {map.title}
        </h1>
        <div className="text-base text-[#29251F]/85 leading-relaxed whitespace-pre-line">
          {map.body}
        </div>

        <div className="mt-8 p-5 rounded-lg bg-[#FFF7E5] border border-[#29251F]/10 text-xs text-[#29251F]/80 space-y-1.5">
          <p className="font-semibold text-[#29251F]">
            Statutory &amp; Regulatory Launch Notice
          </p>
          <p>
            Applicable FSSAI food registration, nutritional/allergen labelling, packer &amp; manufacturer declarations, batch/date coding, IEC export registration, Tea Board requirements, and destination customs compliance must be reviewed and inserted by the business owner before commercial launch.
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqsPage() {
  const { settings } = useStore();
  const faqs = settings?.cmsContent?.faqs || [];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="bg-white min-h-screen py-14">
      <SeoHead
        title="Frequently Asked Questions – DON TRADERS"
        description="Common questions about DON TRADERS tea sourcing, WhatsApp ordering, UPI verification, and wholesale enquiries."
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
          Help Centre
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mt-1 mb-8">
          Frequently Asked Questions
        </h1>

        <div className="divide-y divide-[#29251F]/10 border-y border-[#29251F]/10">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left font-display text-lg font-semibold text-[#29251F]"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#B82025]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm text-[#29251F]/80 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
