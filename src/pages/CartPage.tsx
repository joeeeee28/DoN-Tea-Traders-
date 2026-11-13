import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../lib/assets';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';

export function CartPage() {
  const {
    cart,
    cartSubtotal,
    hasUnpricedCartItems,
    totalCartWeightGrams,
    updateCartQuantity,
    removeFromCart,
    settings,
  } = useStore();

  const currency = settings?.defaultCurrency || 'INR';
  const dom = settings?.domesticShipping;
  const estShipping =
    dom && dom.enabled
      ? cartSubtotal >= dom.minOrderValue && dom.minOrderValue > 0
        ? 0
        : dom.flatFee
      : 0;

  return (
    <div className="bg-[#FFF7E5]/35 min-h-screen py-12">
      <SeoHead
        title="Shopping Cart – DON TRADERS"
        description="Review your selected DON TRADERS tea packs, adjust quantities, and proceed to order enquiry checkout."
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mb-8">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-[#29251F]/10 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-[#B82025]/40 mx-auto" />
            <h2 className="font-display text-2xl font-bold text-[#29251F]">
              Your cart is currently empty
            </h2>
            <p className="text-sm text-[#29251F]/70 max-w-md mx-auto">
              Browse our Strong CTC, Premium Dust, Assam, Leaf, and Masala tea packs to start an order enquiry.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] rounded"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white rounded-lg border border-[#29251F]/10 divide-y divide-[#29251F]/10">
              {cart.map((item) => (
                <div key={item.variantId} className="p-5 flex flex-col sm:flex-row gap-5">
                  <div className="w-24 h-24 rounded bg-[#FFF7E5] overflow-hidden shrink-0">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          to={`/product/${item.productSlug}`}
                          className="font-display text-lg font-bold text-[#29251F] hover:text-[#B82025]"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-[#29251F]/65 mt-1">
                          Pack Size: {item.packSize} · SKU: {item.sku}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.variantId)}
                        aria-label={`Remove ${item.productName}`}
                        className="p-1.5 text-[#29251F]/50 hover:text-[#B82025]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="inline-flex items-center border border-[#29251F]/20 rounded">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="p-2 hover:bg-[#FFF7E5]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 text-sm font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="p-2 hover:bg-[#FFF7E5]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-bold text-[#29251F] tabular-nums">
                          {item.unitPrice !== null
                            ? formatMoney(item.unitPrice * item.quantity, item.currency)
                            : 'Price on Enquiry'}
                        </p>
                        {item.unitPrice !== null && (
                          <p className="text-xs text-[#29251F]/60 tabular-nums">
                            {formatMoney(item.unitPrice, item.currency)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-lg border border-[#29251F]/10 h-fit space-y-4">
              <h2 className="font-display text-xl font-bold text-[#29251F]">
                Order Summary
              </h2>
              <div className="space-y-2.5 text-sm border-b border-[#29251F]/10 pb-4">
                <div className="flex justify-between">
                  <span className="text-[#29251F]/75">Subtotal</span>
                  <span className="font-semibold tabular-nums">
                    {formatMoney(cartSubtotal, currency)}
                    {hasUnpricedCartItems ? ' (+ Quote)' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#29251F]/75">Est. Weight</span>
                  <span className="tabular-nums">
                    {(totalCartWeightGrams / 1000).toFixed(2)} kg
                  </span>
                </div>
                {dom?.enabled && (
                  <div className="flex justify-between">
                    <span className="text-[#29251F]/75">Est. Domestic Shipping</span>
                    <span className="tabular-nums">
                      {estShipping === 0 ? 'Waived' : formatMoney(estShipping, currency)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-base font-bold text-[#29251F]">
                <span>Estimated Total</span>
                <span className="tabular-nums">
                  {formatMoney(cartSubtotal + estShipping, currency)}
                </span>
              </div>
              <p className="text-xs text-[#29251F]/65 leading-relaxed">
                Final shipping fee is confirmed at checkout based on destination PIN code or international country eligibility.
              </p>

              <Link
                to="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] rounded transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop"
                className="w-full inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold text-[#29251F] bg-[#FFF7E5] hover:bg-[#F6C629]/30 rounded transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
