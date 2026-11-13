import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Globe2, MessageCircle, ShieldAlert } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatMoney } from '../lib/assets';
import { SeoHead } from '../components/SeoHead';

export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartSubtotal,
    hasUnpricedCartItems,
    totalCartWeightGrams,
    settings,
    clearCart,
  } = useStore();
  const { authFetch, dbUser } = useAuth();

  const [form, setForm] = useState({
    customerName: dbUser?.name || '',
    customerEmail: dbUser?.email || '',
    customerPhone: '',
    country: 'India',
    stateRegion: '',
    city: '',
    postalCode: '',
    deliveryAddress: '',
    additionalInstructions: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = settings?.defaultCurrency || 'INR';
  const whatsappConfigured = Boolean(settings?.whatsappNumber?.trim());
  const isIndia = form.country.trim().toLowerCase() === 'india';

  const dom = settings?.domesticShipping;
  const intlMatch = settings?.internationalShippingCountries?.find(
    (c) => c.countryName.toLowerCase() === form.country.trim().toLowerCase()
  );

  let estimatedShipping = 0;
  if (isIndia) {
    if (dom?.enabled) {
      estimatedShipping =
        cartSubtotal >= dom.minOrderValue && dom.minOrderValue > 0 ? 0 : dom.flatFee;
    }
  } else if (intlMatch && intlMatch.active) {
    const kg = Math.max(0.5, totalCartWeightGrams / 1000);
    estimatedShipping = Math.round(intlMatch.baseFee + intlMatch.perKgFee * kg);
  }

  const submitOrder = async (channel: 'whatsapp' | 'direct_enquiry' | 'international_pending') => {
    setError(null);
    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    const required = [
      'customerName',
      'customerEmail',
      'customerPhone',
      'country',
      'stateRegion',
      'city',
      'postalCode',
      'deliveryAddress',
    ] as const;
    for (const field of required) {
      if (!form[field].trim()) {
        setError('Please complete all required delivery details before submitting.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await authFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          orderChannel: channel,
          items: cart.map((c) => ({ variantId: c.variantId, quantity: c.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit order enquiry.');

      clearCart();
      navigate(`/order-confirmation/${data.order.orderReference}`, {
        state: {
          whatsappUrl: data.whatsappUrl,
          whatsappMessage: data.whatsappMessage,
          requestedChannel: channel,
        },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold text-[#29251F]">
          Your Cart is Empty
        </h1>
        <p className="text-sm text-[#29251F]/70">
          Add tea packs to your basket before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="inline-flex px-6 py-3 text-sm font-semibold text-white bg-[#B82025] rounded"
        >
          Browse Tea Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF7E5]/35 min-h-screen py-12">
      <SeoHead
        title="Checkout & Order Enquiry – DON TRADERS"
        description="Submit your DON TRADERS tea order enquiry for domestic WhatsApp/UPI coordination or international export confirmation."
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mb-8">
          Checkout &amp; Order Enquiry
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Customer Delivery Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitOrder(
                !isIndia
                  ? 'international_pending'
                  : whatsappConfigured
                    ? 'whatsapp'
                    : 'direct_enquiry'
              );
            }}
            className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-lg border border-[#29251F]/10 space-y-5"
          >
            <h2 className="font-display text-2xl font-bold text-[#29251F]">
              Customer &amp; Delivery Details
            </h2>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#29251F] mb-1">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#29251F] mb-1">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#29251F] mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  required
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#29251F] mb-1">
                  Country *
                </label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded bg-white focus:outline-none focus:border-[#B82025]"
                >
                  <option value="India">India (Domestic Delivery)</option>
                  {(settings?.internationalShippingCountries || []).map((c) => (
                    <option key={c.countryCode} value={c.countryName}>
                      {c.countryName}{' '}
                      {c.active ? '(Shipping Active)' : '(Confirmation Required)'}
                    </option>
                  ))}
                  <option value="Other International Destination">
                    Other International Destination (Enquiry)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#29251F] mb-1">
                  State / Region *
                </label>
                <input
                  required
                  type="text"
                  value={form.stateRegion}
                  onChange={(e) => setForm({ ...form, stateRegion: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#29251F] mb-1">
                  City *
                </label>
                <input
                  required
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#29251F] mb-1">
                  PIN / Postal Code *
                </label>
                <input
                  required
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#29251F] mb-1">
                  Complete Delivery Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.deliveryAddress}
                  onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#29251F] mb-1">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={form.additionalInstructions}
                  onChange={(e) =>
                    setForm({ ...form, additionalInstructions: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-[#29251F]/20 rounded focus:outline-none focus:border-[#B82025]"
                />
              </div>
            </div>

            {!isIndia && (
              <div className="p-4 rounded-md bg-[#FFF7E5] border border-[#F6C629] text-xs text-[#29251F] space-y-1.5">
                <div className="flex items-center gap-2 font-semibold">
                  <Globe2 className="w-4 h-4 text-[#B82025]" />
                  <span>International Order Confirmation Required</span>
                </div>
                <p className="leading-relaxed">
                  International orders are subject to destination and shipping confirmation. Countries are fulfilled only after verifying applicable food export requirements, import rules, courier availability, and payment arrangements.
                </p>
                {!settings?.internationalPaymentActive && (
                  <p className="text-[#B82025] font-medium">
                    {settings?.internationalPaymentNotice}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#29251F]/10 space-y-3">
              {!whatsappConfigured && (
                <div className="p-3.5 rounded bg-[#FFF7E5] border border-[#29251F]/15 text-xs text-[#29251F] flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-[#B82025] shrink-0 mt-0.5" />
                  <span>
                    WhatsApp ordering is disabled until the store administrator configures a verified WhatsApp business number in Admin Settings. You can still save an Order Enquiry below.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!whatsappConfigured || submitting}
                  onClick={() => submitOrder('whatsapp')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] disabled:opacity-45 disabled:cursor-not-allowed rounded transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {submitting ? 'Saving Enquiry...' : 'Create Order & Open WhatsApp'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    submitOrder(isIndia ? 'direct_enquiry' : 'international_pending')
                  }
                  className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-semibold text-[#29251F] bg-[#F6C629] hover:bg-[#F6C629]/90 disabled:opacity-50 rounded transition-colors"
                >
                  {isIndia ? 'Submit Direct Order Enquiry' : 'Submit International Enquiry'}
                </button>
              </div>
              <p className="text-[11px] text-[#29251F]/65">
                Orders are saved in our database with a unique reference first. No payment is collected automatically on this page; India UPI details are verified manually by our team.
              </p>
            </div>
          </form>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-4">
              <h2 className="font-display text-xl font-bold text-[#29251F]">
                Order Summary
              </h2>
              <div className="divide-y divide-[#29251F]/10">
                {cart.map((item) => (
                  <div key={item.variantId} className="py-3 flex justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-[#29251F]">{item.productName}</p>
                      <p className="text-xs text-[#29251F]/65">
                        {item.packSize} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold tabular-nums shrink-0">
                      {item.unitPrice !== null
                        ? formatMoney(item.unitPrice * item.quantity, item.currency)
                        : 'Enquiry'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#29251F]/10 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#29251F]/75">Subtotal</span>
                  <span className="font-semibold tabular-nums">
                    {formatMoney(cartSubtotal, currency)}
                    {hasUnpricedCartItems ? ' (+ Quote)' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#29251F]/75">
                    Estimated Shipping ({isIndia ? 'Domestic' : 'International'})
                  </span>
                  <span className="tabular-nums">
                    {!isIndia && (!intlMatch || !intlMatch.active)
                      ? 'To be confirmed'
                      : estimatedShipping === 0
                        ? 'Waived'
                        : formatMoney(estimatedShipping, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-[#29251F]/10">
                  <span>Estimated Total</span>
                  <span className="tabular-nums">
                    {formatMoney(cartSubtotal + estimatedShipping, currency)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#29251F]/10 text-xs text-[#29251F]/75 space-y-1.5">
                <p className="font-semibold text-[#29251F]">Payment Process:</p>
                {isIndia ? (
                  <p>
                    India Orders: Submit enquiry &rarr; Share via WhatsApp &rarr; Receive Don Traders UPI ID / QR &rarr; Manual bank verification before dispatch.
                  </p>
                ) : (
                  <p>
                    International Orders: Online card checkout remains inactive until an approved international gateway is configured. Our export team confirms courier &amp; payment eligibility manually.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
