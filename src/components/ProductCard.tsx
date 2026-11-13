import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import type { Product } from '../types';
import { formatMoney } from '../lib/assets';
import { useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useStore();
  const activeVariants = product.variants.filter((v) => v.isActive);
  const [selectedVariantId, setSelectedVariantId] = useState<number>(
    activeVariants[0]?.id ?? 0
  );

  const selectedVariant =
    activeVariants.find((v) => v.id === selectedVariantId) ?? activeVariants[0];

  const displayPrice =
    selectedVariant?.sellingPrice !== null && selectedVariant?.sellingPrice !== undefined
      ? formatMoney(selectedVariant.sellingPrice, selectedVariant.currency || product.currency)
      : product.startingPrice !== null
        ? `From ${formatMoney(product.startingPrice, product.currency)}`
        : 'Price on Enquiry';

  const isUnavailable =
    product.availability === 'Out of Stock' || product.availability === 'Coming Soon';

  return (
    <article className="group bg-white border border-[#29251F]/10 rounded-lg overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/product/${product.slug}`} className="block relative aspect-[4/3] bg-[#FFF7E5] overflow-hidden">
        <SafeImage
          src={product.images[0]}
          alt={product.name}
          fallbackTitle={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-[#29251F]/65 mb-2">
          <span className="font-medium text-[#B82025]">{product.categoryName}</span>
          {product.teaOrigin && (
            <>
              <span aria-hidden="true">·</span>
              <span>{product.teaOrigin}</span>
            </>
          )}
          {product.isDemo && (
            <>
              <span aria-hidden="true">·</span>
              <span>Demo Sample</span>
            </>
          )}
        </div>

        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-display text-lg font-semibold text-[#29251F] leading-snug group-hover:text-[#B82025] transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-[#29251F]/75 line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>

        {activeVariants.length > 0 && (
          <div className="mt-4">
            <span className="block text-[11px] uppercase tracking-wider text-[#29251F]/55 mb-1.5">
              Pack Sizes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeVariants.map((variant) => {
                const isSelected = variant.id === selectedVariant?.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#29251F] text-white border-[#29251F]'
                        : 'bg-[#FFF7E5]/60 text-[#29251F] border-[#29251F]/15 hover:border-[#B82025]'
                    }`}
                  >
                    {variant.packSize}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-auto pt-5 flex items-baseline justify-between gap-2 border-t border-[#29251F]/10">
          <div>
            <p className="text-base font-semibold text-[#29251F] tabular-nums">
              {displayPrice}
            </p>
            <p className="text-xs text-[#29251F]/65 mt-0.5">{product.availability}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Link
            to={`/product/${product.slug}`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-[#29251F] bg-[#FFF7E5] hover:bg-[#F6C629]/30 border border-[#29251F]/15 rounded transition-colors whitespace-nowrap shrink-0"
          >
            <span>View Product</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            disabled={!selectedVariant || isUnavailable}
            onClick={() => selectedVariant && addToCart(product, selectedVariant, 1)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-white bg-[#B82025] hover:bg-[#93161B] disabled:opacity-45 disabled:cursor-not-allowed rounded transition-colors whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </article>
  );
}
