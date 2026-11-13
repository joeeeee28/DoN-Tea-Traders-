import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Truck, Globe2 } from 'lucide-react';
import type { Product } from '../types';
import { formatMoney } from '../lib/assets';
import { useStore } from '../context/StoreContext';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';
import { ProductCard } from '../components/ProductCard';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, settings } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        if (active) {
          setProduct(data.product);
          setRelated(data.relatedProducts || []);
          setSelectedImageIdx(0);
          setSelectedVariantId(data.product?.variants?.[0]?.id ?? 0);
          setQuantity(1);
        }
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load product');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-96 bg-[#FFF7E5]/60 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-[#29251F]">Product Not Found</h1>
        <p className="text-sm text-[#29251F]/70 mt-2">{error}</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#B82025] rounded"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shop</span>
        </Link>
      </div>
    );
  }

  const activeVariants = product.variants.filter((v) => v.isActive);
  const selectedVariant =
    activeVariants.find((v) => v.id === selectedVariantId) ?? activeVariants[0];

  const isUnavailable =
    product.availability === 'Out of Stock' || product.availability === 'Coming Soon';

  const priceDisplay =
    selectedVariant?.sellingPrice !== null && selectedVariant?.sellingPrice !== undefined
      ? formatMoney(selectedVariant.sellingPrice, selectedVariant.currency || product.currency)
      : 'Price on Enquiry';

  // Only emit Product Schema.org structured data when product data is non-demo and priced
  const productJsonLd =
    !product.isDemo && selectedVariant?.sellingPrice
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          sku: selectedVariant.sku,
          description: product.shortDescription,
          brand: {
            '@type': 'Brand',
            name: settings?.businessName || 'DON TRADERS',
          },
          offers: {
            '@type': 'Offer',
            price: selectedVariant.sellingPrice,
            priceCurrency: selectedVariant.currency || product.currency,
            availability:
              product.availability === 'In Stock'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/PreOrder',
          },
        }
      : null;

  return (
    <div className="bg-white">
      <SeoHead
        title={`${product.name} – DON TRADERS`}
        description={product.shortDescription || product.name}
        jsonLd={productJsonLd}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-xs text-[#29251F]/65 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-[#B82025]">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#B82025]">
            Shop
          </Link>
          <span>/</span>
          <span className="text-[#29251F] font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#FFF7E5] border border-[#29251F]/10">
              <SafeImage
                src={product.images[selectedImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIdx(i)}
                    className={`aspect-[4/3] rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImageIdx === i ? 'border-[#B82025]' : 'border-transparent'
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contiguous Purchase Module */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2 text-xs text-[#29251F]/65 mb-2">
              <span className="font-semibold text-[#B82025]">{product.categoryName}</span>
              <span aria-hidden="true">·</span>
              <span>SKU: {selectedVariant?.sku || product.sku}</span>
              {product.isDemo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-[#29251F]">Demo Product</span>
                </>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] leading-tight">
              {product.name}
            </h1>

            <p className="mt-3 text-base text-[#29251F]/80 leading-relaxed">
              {product.shortDescription}
            </p>

            <div className="mt-6 pb-6 border-b border-[#29251F]/10 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-[#29251F] tabular-nums">
                {priceDisplay}
              </span>
              <span className="text-xs font-semibold text-[#B82025]">
                {product.availability}
              </span>
            </div>

            {/* Pack Size Selector */}
            {activeVariants.length > 0 && (
              <div className="mt-6">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#29251F]/70 mb-2.5">
                  Select Pack Size
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {activeVariants.map((variant) => {
                    const isSelected = variant.id === selectedVariant?.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`px-4 py-2.5 rounded border text-sm font-semibold transition-colors ${
                          isSelected
                            ? 'bg-[#29251F] text-white border-[#29251F]'
                            : 'bg-[#FFF7E5]/60 text-[#29251F] border-[#29251F]/20 hover:border-[#B82025]'
                        }`}
                      >
                        <span>{variant.packSize}</span>
                        {variant.sellingPrice !== null && (
                          <span className="ml-2 text-xs opacity-80 tabular-nums">
                            ({formatMoney(variant.sellingPrice, variant.currency)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedVariant && (
                  <p className="mt-2 text-xs text-[#29251F]/65 tabular-nums">
                    Net Weight: {selectedVariant.netWeightGrams}g · Shipping Weight:{' '}
                    {selectedVariant.shippingWeightGrams}g · Stock: {selectedVariant.stockQuantity} units
                  </p>
                )}
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center border border-[#29251F]/20 rounded">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-3 hover:bg-[#FFF7E5]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 text-sm font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="p-3 hover:bg-[#FFF7E5]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={!selectedVariant || isUnavailable}
                onClick={() => selectedVariant && addToCart(product, selectedVariant, quantity)}
                className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] disabled:opacity-45 rounded transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Product Details */}
            <div className="mt-8 space-y-5 pt-6 border-t border-[#29251F]/10">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#29251F]">
                  Description
                </h2>
                <p className="mt-2 text-sm text-[#29251F]/80 whitespace-pre-line leading-relaxed">
                  {product.fullDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FFF7E5]/60 p-4 rounded-lg border border-[#29251F]/10 text-xs">
                <div>
                  <span className="block text-[#29251F]/60">Tea Type</span>
                  <span className="font-semibold text-[#29251F]">
                    {product.teaType || 'Standard Blend'}
                  </span>
                </div>
                <div>
                  <span className="block text-[#29251F]/60">Tea Origin</span>
                  <span className="font-semibold text-[#29251F]">
                    {product.teaOrigin || 'Indian Origin'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[#29251F]/60">Ingredients</span>
                  <span className="font-semibold text-[#29251F]">
                    {product.ingredients || 'Tea Leaves'}
                  </span>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="space-y-2.5 text-xs text-[#29251F]/75">
                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-[#B82025] shrink-0 mt-0.5" />
                  <span>
                    <strong>Domestic Delivery (India):</strong>{' '}
                    {settings?.domesticShipping?.estimatedDays ||
                      'Arranged via Don Traders delivery partners.'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Globe2 className="w-4 h-4 text-[#B82025] shrink-0 mt-0.5" />
                  <span>
                    <strong>International Shipping:</strong> Subject to destination activation, export/import regulations, and courier confirmation.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#29251F]/10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#29251F] mb-8">
              Related Teas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
