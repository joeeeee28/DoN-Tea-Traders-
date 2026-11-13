import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../lib/assets';
import { SafeImage } from './SafeImage';

export function CartDrawer() {
  const {
    cart,
    cartSubtotal,
    hasUnpricedCartItems,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    settings,
  } = useStore();

  if (!isCartOpen) return null;

  const currency = settings?.defaultCurrency || 'INR';
  const dom = settings?.domesticShipping;
  const estShipping =
    dom && dom.enabled
      ? cartSubtotal >= dom.minOrderValue && dom.minOrderValue > 0
        ? 0
        : dom.flatFee
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      <aside
        aria-label="Shopping Cart"
        className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-[#29251F]/10 flex items-center justify-between bg-[#FFF7E5]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#B82025]" />
            <h2 className="font-display text-lg font-bold text-[#29251F]">
              Your Tea Basket
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            className="p-1.5 rounded-md text-[#29251F] hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-10 h-10 text-[#29251F]/30 mx-auto mb-3" />
              <p className="text-base font-medium text-[#29251F]">
                Your tea basket is empty
              </p>
              <p className="text-sm text-[#29251F]/65 mt-1 mb-6">
                Explore our selected Indian CTC, dust, leaf, and masala tea blends.
              </p>
              <Link
                to="/shop"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] rounded transition-colors"
              >
                Explore Tea Shop
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-4 pb-4 border-b border-[#29251F]/10"
              >
                <div className="w-20 h-20 rounded bg-[#FFF7E5] overflow-hidden shrink-0">
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.productSlug}`}
                    onClick={() => setIsCartOpen(false)}
                    className="text-sm font-semibold text-[#29251F] hover:text-[#B82025] line-clamp-1"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-xs text-[#29251F]/65 mt-0.5">
                    Pack: {item.packSize} · SKU: {item.sku}
                  </p>
                  <p className="text-sm font-semibold text-[#29251F] mt-1 tabular-nums">
                    {item.unitPrice !== null
                      ? formatMoney(item.unitPrice * item.quantity, item.currency)
                      : 'Price on Enquiry'}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="inline-flex items-center border border-[#29251F]/15 rounded">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="p-1.5 hover:bg-[#FFF7E5] text-[#29251F]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="p-1.5 hover:bg-[#FFF7E5] text-[#29251F]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.variantId)}
                      aria-label={`Remove ${item.productName}`}
                      className="p-1.5 text-[#29251F]/55 hover:text-[#B82025]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-[#29251F]/10 bg-[#FFF7E5]/50 space-y-3">
            <div className="flex justify-between text-sm text-[#29251F]/80">
              <span>Subtotal</span>
              <span className="font-semibold tabular-nums">
                {formatMoney(cartSubtotal, currency)}
                {hasUnpricedCartItems ? ' + Quote Items' : ''}
              </span>
            </div>
            {dom?.enabled && (
              <div className="flex justify-between text-xs text-[#29251F]/70">
                <span>Est. Domestic Shipping (India)</span>
                <span className="tabular-nums">
                  {estShipping === 0
                    ? 'Waived above threshold'
                    : formatMoney(estShipping, currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#29251F] pt-2 border-t border-[#29251F]/10">
              <span>Estimated Total</span>
              <span className="tabular-nums">
                {formatMoney(cartSubtotal + estShipping, currency)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/cart"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex items-center justify-center px-4 py-3 text-xs font-semibold text-[#29251F] bg-white border border-[#29251F]/20 rounded hover:bg-[#FFF7E5] transition-colors"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex items-center justify-center px-4 py-3 text-xs font-semibold text-white bg-[#B82025] hover:bg-[#93161B] rounded transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
