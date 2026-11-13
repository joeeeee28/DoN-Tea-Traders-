import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Copy, ExternalLink, MessageCircle, QrCode } from 'lucide-react';
import type { OrderRecord } from '../types';
import { formatMoney } from '../lib/assets';
import { SeoHead } from '../components/SeoHead';

interface PaymentConfigPayload {
  upiId: string;
  upiQrUrl: string;
  upiInstructions: string;
  internationalPaymentActive: boolean;
  internationalPaymentNotice: string;
  contactEmail: string;
  contactPhone: string;
}

export function OrderConfirmationPage() {
  const { reference } = useParams<{ reference: string }>();
  const location = useLocation();
  const state = (location.state || {}) as {
    whatsappUrl?: string | null;
    whatsappMessage?: string;
    requestedChannel?: string;
  };

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfigPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${reference}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setOrder(data.order);
            setPaymentConfig(data.paymentConfig);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [reference]);

  const handleCopyMessage = async () => {
    if (!state.whatsappMessage) return;
    try {
      await navigator.clipboard.writeText(state.whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-72 bg-[#FFF7E5] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold text-[#29251F]">
          Order Reference Not Found
        </h1>
        <Link
          to="/shop"
          className="inline-flex px-5 py-2.5 text-sm font-semibold text-white bg-[#B82025] rounded"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF7E5]/40 min-h-screen py-12">
      <SeoHead
        title={`Order Enquiry ${order.orderReference} – DON TRADERS`}
        description="View your DON TRADERS order enquiry confirmation, WhatsApp dispatch instructions, and manual payment guidance."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#29251F]/10 space-y-5">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-10 h-10 text-[#B82025] shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#B82025]">
                Order Enquiry Saved
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#29251F] mt-0.5">
                Reference:{' '}
                <span className="font-mono text-[#B82025]">{order.orderReference}</span>
              </h1>
              <p className="text-sm text-[#29251F]/75 mt-2">
                Current Status: <strong>{order.orderStatus}</strong> · Delivery Type:{' '}
                <strong className="capitalize">{order.shippingType}</strong>
              </p>
            </div>
          </div>

          {/* WhatsApp Explicit Click-To-Chat Step */}
          {state.whatsappUrl && (
            <div className="p-5 rounded-lg bg-[#FFF7E5] border border-[#F6C629] space-y-3">
              <h2 className="font-display text-lg font-bold text-[#29251F] flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#B82025]" />
                <span>Next Step: Send Your Order on WhatsApp</span>
              </h2>
              <p className="text-xs text-[#29251F]/80 leading-relaxed">
                Your order enquiry has been saved in our system. Click the button below to open WhatsApp with your pre-filled order details, then press <strong>Send</strong> inside WhatsApp. Messages are never sent automatically.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={state.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] rounded transition-colors"
                >
                  <span>Open WhatsApp &amp; Send Enquiry</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                {state.whatsappMessage && (
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold text-[#29251F] bg-white border border-[#29251F]/20 rounded hover:bg-[#FFF7E5]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied Summary' : 'Copy Message Text'}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#29251F]/70">
                If WhatsApp does not open on your device, quote order reference{' '}
                <strong className="font-mono">{order.orderReference}</strong> via{' '}
                {paymentConfig?.contactEmail || 'our Contact page'}
                {paymentConfig?.contactPhone ? ` or ${paymentConfig.contactPhone}` : ''}.
              </p>
            </div>
          )}

          {/* Payment Instructions */}
          <div className="p-5 rounded-lg bg-[#FFF7E5]/45 border border-[#29251F]/10 space-y-3">
            <h2 className="font-display text-lg font-bold text-[#29251F] flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#B82025]" />
              <span>Payment Verification Guidance</span>
            </h2>
            {order.shippingType === 'domestic' ? (
              <div className="space-y-2 text-sm text-[#29251F]/85">
                <p>{paymentConfig?.upiInstructions}</p>
                {paymentConfig?.upiId ? (
                  <p className="font-mono text-xs bg-white px-3 py-2 rounded border border-[#29251F]/15 inline-block">
                    UPI ID: <strong>{paymentConfig.upiId}</strong>
                  </p>
                ) : (
                  <p className="text-xs text-[#29251F]/65">
                    UPI ID / QR will be provided by Don Traders after confirming your stock and PIN serviceability.
                  </p>
                )}
                {paymentConfig?.upiQrUrl && (
                  <div className="pt-2">
                    <img
                      src={paymentConfig.upiQrUrl}
                      alt="Don Traders UPI QR Code"
                      className="w-40 h-40 object-contain border border-[#29251F]/15 rounded bg-white p-2"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <p className="text-xs text-[#29251F]/65">
                  Note: Orders are never marked paid automatically. Our administrator verifies incoming bank transfers manually before moving your order to Payment Confirmed.
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#29251F]/80">
                {paymentConfig?.internationalPaymentNotice ||
                  'International orders are subject to destination eligibility, export documentation, and shipping confirmation before payment is arranged.'}
              </p>
            )}
          </div>

          {/* Itemized Summary */}
          <div className="border-t border-[#29251F]/10 pt-5 space-y-3">
            <h2 className="font-display text-lg font-bold text-[#29251F]">
              Items &amp; Delivery Summary
            </h2>
            <div className="divide-y divide-[#29251F]/10 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between gap-4">
                  <span>
                    {item.productName} ({item.packSize}) × {item.quantity}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {item.lineTotal
                      ? formatMoney(item.lineTotal, order.currency)
                      : 'Quote Pending'}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-[#29251F]/10 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums">
                  {formatMoney(order.subtotalAmount, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="tabular-nums">
                  {formatMoney(order.shippingFee, order.currency)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Estimated Total</span>
                <span className="tabular-nums">
                  {formatMoney(order.totalAmount, order.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
