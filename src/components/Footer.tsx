import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function Footer() {
  const { settings, categories } = useStore();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatusMsg({ type: 'err', text: 'Please enter a valid email address.' });
      return;
    }
    if (!consent) {
      setStatusMsg({
        type: 'err',
        text: 'Please tick the consent box to receive tea updates.',
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), consentGiven: consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription failed');
      setStatusMsg({ type: 'ok', text: 'Subscribed to DoN Tea Traders updates.' });
      setEmail('');
      setConsent(false);
    } catch (err: unknown) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to subscribe',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const brandName = settings?.businessName || 'DoN Tea Traders India Private Limited';
  const copyrightText =
    settings?.cmsContent?.footer?.copyrightText ||
    '© DoN Tea Traders India Private Limited. All rights reserved.';

  const socialLinks = settings?.socialLinks || {};
  const hasAnySocial = Boolean(
    socialLinks.instagram || socialLinks.facebook || socialLinks.linkedin || socialLinks.youtube
  );

  return (
    <footer className="bg-[#29251F] text-[#FFF7E5] border-t-4 border-[#B82025]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={brandName}
                  className="h-9 w-auto object-contain bg-white rounded px-2 py-1"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="inline-flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded bg-[#B82025] text-[#F6C629] font-display font-bold text-base flex items-center justify-center shrink-0">
                    DT
                  </span>
                  <span className="font-display text-lg font-bold text-[#F6C629] leading-snug">
                    {brandName}
                  </span>
                </span>
              )}
            </div>
            <div className="space-y-1.5 text-sm text-[#FFF7E5]/85 leading-relaxed max-w-sm">
              <p className="font-semibold text-[#F6C629]">
                Naturally Valparai. Truly DoN.
              </p>
              <p className="font-medium text-white">
                Rooted in Valparai. Crafted by Nature.
              </p>
              <p className="text-xs text-[#FFF7E5]/80">
                100% Single-Origin Tea.
              </p>
              <p className="text-xs font-medium text-[#FFF7E5]">
                Dust | Granules | Leaf Tea
              </p>
              <p className="text-xs text-[#FFF7E5]/80">
                Retail &amp; Wholesale Supply.
              </p>
              <p className="text-xs font-semibold text-[#F6C629]">
                From 7th Heaven Valparai.
              </p>
            </div>
            <div className="space-y-2 pt-2 text-xs text-[#FFF7E5]/75">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#F6C629] shrink-0 mt-0.5" />
                <span>
                  {settings?.contactEmail
                    ? settings.contactEmail
                    : 'Business email configurable in Admin Settings'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#F6C629] shrink-0 mt-0.5" />
                <span>
                  {settings?.contactPhone
                    ? settings.contactPhone
                    : 'Business phone configurable in Admin Settings'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F6C629] shrink-0 mt-0.5" />
                <span>
                  {settings?.businessAddress
                    ? settings.businessAddress
                    : 'Registered business address configurable in Admin Settings'}
                </span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F6C629] mb-4">
              Our Collection
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FFF7E5]/80">
              <li>
                <Link to="/shop" className="hover:text-[#F6C629] transition-colors">
                  Shop All Teas
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-[#F6C629] transition-colors">
                  Tea Collection
                </Link>
              </li>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={`/shop?category=${cat.slug}`}
                      className="hover:text-[#F6C629] transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link
                      to="/shop?category=ctc-dust-tea"
                      className="hover:text-[#F6C629] transition-colors"
                    >
                      CTC Dust Tea
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop?category=granules-tea"
                      className="hover:text-[#F6C629] transition-colors"
                    >
                      Granules Tea
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop?category=leaf-tea"
                      className="hover:text-[#F6C629] transition-colors"
                    >
                      Leaf Tea
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/wholesale" className="hover:text-[#F6C629] transition-colors">
                  Wholesale Enquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Policies */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F6C629] mb-4">
              Company &amp; Policies
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 text-sm text-[#FFF7E5]/80">
              <li>
                <Link to="/our-story" className="hover:text-[#F6C629] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/our-sourcing" className="hover:text-[#F6C629] transition-colors">
                  Our Sourcing &amp; Quality
                </Link>
              </li>
              <li>
                <Link to="/tea-origins" className="hover:text-[#F6C629] transition-colors">
                  Tea Origins
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#F6C629] transition-colors">
                  Tea Knowledge Blog
                </Link>
              </li>
              <li>
                <Link to="/policies/shipping" className="hover:text-[#F6C629] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/returns" className="hover:text-[#F6C629] transition-colors">
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-[#F6C629] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="hover:text-[#F6C629] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-[#F6C629] transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F6C629]">
              Tea Updates &amp; Trade Notes
            </h3>
            <p className="text-xs text-[#FFF7E5]/75 leading-relaxed">
              Receive seasonal collection announcements, tea preparation notes, and trade availability updates.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address for newsletter"
                className="w-full px-3.5 py-2.5 text-sm bg-white/10 border border-[#FFF7E5]/20 rounded text-white placeholder:text-[#FFF7E5]/45 focus:outline-none focus:border-[#F6C629]"
              />
              <label className="flex items-start gap-2 text-xs text-[#FFF7E5]/75 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-[#F6C629]"
                />
                <span>
                  I consent to receive updates from Don Traders in accordance with the Privacy Policy.
                </span>
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#F6C629] text-[#29251F] hover:bg-[#F6C629]/90 rounded transition-colors disabled:opacity-50"
              >
                {submitting ? 'Subscribing...' : 'Subscribe'}
              </button>
              {statusMsg && (
                <p
                  className={`text-xs flex items-center gap-1.5 ${
                    statusMsg.type === 'ok' ? 'text-[#F6C629]' : 'text-red-300'
                  }`}
                >
                  {statusMsg.type === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  <span>{statusMsg.text}</span>
                </p>
              )}
            </form>

            {hasAnySocial && (
              <div className="pt-2 flex flex-wrap gap-3 text-xs">
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#FFF7E5]/80 hover:text-[#F6C629]"
                  >
                    Instagram
                  </a>
                )}
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#FFF7E5]/80 hover:text-[#F6C629]"
                  >
                    Facebook
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#FFF7E5]/80 hover:text-[#F6C629]"
                  >
                    LinkedIn
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#FFF7E5]/80 hover:text-[#F6C629]"
                  >
                    YouTube
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#FFF7E5]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFF7E5]/65">
          <p>{copyrightText}</p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="hover:text-[#F6C629]">
              Contact
            </Link>
            <Link to="/admin" className="hover:text-[#F6C629]">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
