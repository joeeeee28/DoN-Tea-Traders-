import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Globe2,
  MessageCircle,
  Package,
  SearchCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';
import { ProductCard } from '../components/ProductCard';

const PROCESS_ICONS = [Users, SearchCheck, ClipboardCheck, Package, Truck];

export function HomePage() {
  const { settings, categories, featuredProducts, blogPosts, cartCount, loading } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  const cms = settings?.cmsContent;
  const hero = cms?.hero || {
    headline: 'Naturally Valparai. Truly DoN.',
    subheadline:
      'Discover the authentic character of Valparai tea — naturally strong, rich in colour and full of refreshing flavour.',
    primaryCta: 'Explore Our Tea Collection',
    secondaryCta: 'Order via WhatsApp',
    imageUrl: 'asset:hero',
  };

  const rawWhatsappDigits = (settings?.whatsappNumber || '').replace(/[^0-9]/g, '');
  const whatsappConfigured = rawWhatsappDigits.length > 0;
  const directWhatsappUrl = whatsappConfigured
    ? `https://wa.me/${rawWhatsappDigits}?text=${encodeURIComponent(
        'Hello DoN Tea Traders India Private Limited, I would like to enquire about ordering pure Valparai tea.'
      )}`
    : null;

  const filteredProducts = featuredProducts
    .filter((p) =>
      selectedCategory === 'all' ? true : p.categorySlug === selectedCategory
    )
    .sort((a, b) => {
      if (sortBy === 'price_asc') {
        return (a.startingPrice ?? 999999) - (b.startingPrice ?? 999999);
      }
      if (sortBy === 'price_desc') {
        return (b.startingPrice ?? -1) - (a.startingPrice ?? -1);
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  const whyIcons = [CheckCircle2, Package, Award, ShieldCheck, Users, Globe2];
  const brandHighlights = [
    '100% Single Origin',
    'Unblended Tea',
    'No Artificial Flavours',
    'No Additives',
  ];

  return (
    <div>
      <SeoHead
        title="DoN Tea Traders India Private Limited – Naturally Valparai. Truly DoN."
        description="DoN Tea Traders India Private Limited brings you 100% single-origin, unblended Valparai tea from 7th Heaven Valparai — CTC Dust Tea, Granules Tea, and Leaf Tea."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: settings?.businessName || 'DoN Tea Traders India Private Limited',
          description:
            'Naturally Valparai. Truly DoN. 100% single-origin, unblended Valparai tea for retail and wholesale supply.',
          url: window.location.origin,
        }}
      />

      {/* Section 1: Hero Banner */}
      <section className="relative bg-[#FFF7E5] border-b border-[#29251F]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center py-2">
              <div className="space-y-1.5 mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
                  Single Origin. Unblended. · DoN Tea Traders India Private Limited
                </p>
                <p className="text-base sm:text-lg font-display font-bold text-[#29251F]">
                  Pure Valparai Tea 🌿
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#29251F]/80">
                  <span>No Artificial Flavours. No Additives.</span>
                  <span className="text-[#B82025]">❤️💛 From 7th Heaven Valparai</span>
                </div>
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-[#29251F] leading-[1.12] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                {hero.headline}
              </h1>
              <p className="mt-5 text-base sm:text-lg text-[#29251F]/80 leading-relaxed max-w-xl">
                {hero.subheadline}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] rounded transition-colors shadow-sm whitespace-nowrap shrink-0"
                >
                  <span>{hero.primaryCta || 'Explore Our Tea Collection'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {directWhatsappUrl ? (
                  <a
                    href={directWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#29251F] bg-[#F6C629] hover:bg-[#F6C629]/90 rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{hero.secondaryCta || 'Order via WhatsApp'}</span>
                  </a>
                ) : (
                  <a
                    href="#whatsapp-ordering"
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#29251F] bg-[#F6C629] hover:bg-[#F6C629]/90 rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{hero.secondaryCta || 'Order via WhatsApp'}</span>
                  </a>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-[#29251F]/10 grid grid-cols-3 gap-4 text-xs text-[#29251F]/75">
                <div>
                  <span className="block font-semibold text-[#29251F]">100% Single Origin</span>
                  <span>From 7th Heaven Valparai</span>
                </div>
                <div>
                  <span className="block font-semibold text-[#29251F]">Three Core Grades</span>
                  <span>Dust | Granules | Leaf</span>
                </div>
                <div>
                  <span className="block font-semibold text-[#29251F]">Direct Supply</span>
                  <span>Retail &amp; Wholesale</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-72 sm:h-96 lg:h-full min-h-[380px] rounded-xl overflow-hidden shadow-lg border border-[#29251F]/10 bg-[#29251F]">
                <SafeImage
                  src={hero.imageUrl}
                  alt="DoN Tea Traders pure Valparai tea cup and crimson-gold pouch"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#F6C629] font-semibold">
                      From 7th Heaven Valparai
                    </p>
                    <p className="font-display text-lg font-medium">
                      Naturally Valparai. Truly DoN.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Our Collection */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
                100% Single-Origin Valparai Tea
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mt-1">
                Our Collection
              </h2>
              <p className="text-sm text-[#29251F]/75 mt-2 max-w-2xl">
                Pure Origin. Natural Strength. Authentic Taste.
              </p>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B82025] hover:text-[#93161B] whitespace-nowrap shrink-0"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group bg-[#FFF7E5]/45 border border-[#29251F]/10 rounded-lg overflow-hidden flex flex-col hover:border-[#B82025]/40 transition-colors"
              >
                <div className="aspect-[4/3] bg-[#FFF7E5] overflow-hidden">
                  <SafeImage
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-semibold text-[#29251F] group-hover:text-[#B82025] transition-colors">
                      {idx + 1}. {cat.name}
                    </h3>
                    {cat.isDemo && (
                      <span className="text-[11px] text-[#29251F]/55">Demo Category</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-[#29251F]/75 leading-relaxed flex-1">
                    {cat.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B82025]">
                    <span>Explore {cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Featured Products */}
      <section className="py-16 bg-[#FFF7E5]/60 border-y border-[#29251F]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
                Online Storefront
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mt-1">
                Featured Tea Packs
              </h2>
              <p className="text-sm text-[#29251F]/70 mt-2">
                Items labelled &ldquo;Demo Sample&rdquo; are demonstration catalogue records editable in the Admin Dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-white border border-[#29251F]/15 rounded-md overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-[#B82025] text-white'
                      : 'text-[#29251F]/75 hover:text-[#29251F]'
                  }`}
                >
                  All Teas
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                      selectedCategory === c.slug
                        ? 'bg-[#B82025] text-white'
                        : 'text-[#29251F]/75 hover:text-[#29251F]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort featured products"
                className="px-3 py-2 text-xs font-medium bg-white border border-[#29251F]/15 rounded-md text-[#29251F] focus:outline-none focus:border-[#B82025]"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-96 bg-white/80 rounded-lg border border-[#29251F]/10 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-[#29251F] hover:bg-[#B82025] rounded transition-colors"
            >
              <span>Browse Complete Tea Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4: Brand Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6">
              <div className="h-80 lg:h-full min-h-[340px] rounded-xl overflow-hidden border border-[#29251F]/10">
                <SafeImage
                  src={cms?.brandStory?.imageUrl || 'asset:tasting'}
                  alt="DoN Tea Traders Valparai single-origin tea tasting table"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
                From 7th Heaven Valparai · DoN Tea Traders India Private Limited
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mt-2">
                {cms?.brandStory?.headline || 'Rooted in Valparai. Crafted by Nature.'}
              </h2>
              <div className="mt-4 space-y-3 text-base text-[#29251F]/80 leading-relaxed">
                <p>
                  Discover the authentic character of Valparai tea — naturally strong, rich in colour and full of refreshing flavour.
                </p>
                <p>
                  At DoN Tea Traders, we bring you 100% single-origin, unblended Valparai tea.
                </p>
                <p className="font-semibold text-[#B82025]">
                  No Artificial Flavours. No Additives.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-[#29251F]/10">
                {brandHighlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-center gap-2.5 p-3 rounded-md bg-[#FFF7E5]/60 border border-[#29251F]/10"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#B82025] shrink-0" />
                    <span className="text-sm font-semibold text-[#29251F]">{highlight}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to="/our-story"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] rounded transition-colors"
                >
                  <span>Discover Our Story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Our Sourcing and Quality Process */}
      <section className="py-16 bg-[#FFF7E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
              Our Sourcing &amp; Quality Process
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mt-1">
              Five Steps From Selection to Your Cup
            </h2>
            <p className="text-sm text-[#29251F]/75 mt-2">
              A disciplined workflow focused on 100% single-origin Valparai tea selection, grade verification, and dependable packing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {(cms?.sourcingSteps || []).map((step, idx) => {
              const Icon = PROCESS_ICONS[idx % PROCESS_ICONS.length];
              return (
                <div
                  key={step.step}
                  className="bg-white border border-[#29251F]/10 rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#FFF7E5] overflow-hidden relative">
                    <SafeImage
                      src={step.imageUrl}
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#B82025] mb-2">
                      <span>0{step.step}.</span>
                      <Icon className="w-4 h-4 text-[#29251F]/70" />
                    </div>
                    <h3 className="font-display text-base font-bold text-[#29251F] leading-snug">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#29251F]/75 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <Link
              to="/our-sourcing"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B82025] hover:text-[#93161B]"
            >
              <span>Read Full Sourcing Process</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 6: Tea Origin & Grades */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
                From 7th Heaven Valparai
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mt-1">
                100% Single-Origin Valparai Tea
              </h2>
              <p className="text-sm text-[#29251F]/70 mt-2 max-w-2xl">
                Unblended Valparai origin profiles across Dust, Granules, and Leaf grades — editable anytime in the Admin Dashboard.
              </p>
            </div>
            <Link
              to="/tea-origins"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B82025] hover:text-[#93161B]"
            >
              <span>Explore Valparai Origin</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(cms?.teaOrigins || []).map((origin) => (
              <div
                key={origin.id}
                className="border border-[#29251F]/10 rounded-lg overflow-hidden bg-white flex flex-col"
              >
                <div className="aspect-[4/3] bg-[#FFF7E5] overflow-hidden">
                  <SafeImage
                    src={origin.imageUrl}
                    alt={`${origin.name} tea region`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs text-[#B82025] font-medium">
                    {origin.region}
                  </p>
                  <h3 className="font-display text-xl font-bold text-[#29251F] mt-1">
                    {origin.name}
                  </h3>
                  <p className="mt-2 text-xs text-[#29251F]/75 leading-relaxed flex-1">
                    {origin.description}
                  </p>
                  <p className="mt-4 pt-3 border-t border-[#29251F]/10 text-xs font-medium text-[#29251F]">
                    Cup Profile: <span className="text-[#29251F]/75">{origin.flavorProfile}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Why Choose DoN Tea Traders? */}
      <section className="py-16 bg-[#FFF7E5]/55 border-t border-[#29251F]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
              Naturally Valparai. Truly DoN.
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mt-1">
              Why Choose DoN Tea Traders?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(cms?.whyChooseUs || []).map((item, i) => {
              const Icon = whyIcons[i % whyIcons.length];
              return (
                <div
                  key={item.title}
                  className="bg-white p-6 rounded-lg border border-[#29251F]/10"
                >
                  <div className="w-10 h-10 rounded bg-[#F6C629]/30 text-[#B82025] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#29251F]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#29251F]/75 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 8: Retail and Wholesale Supply */}
      <section className="bg-[#B82025] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F6C629]">
                Household, Commercial &amp; Trade Partnerships
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">
                {cms?.wholesaleBanner?.headline || 'Retail & Wholesale Supply Available.'}
              </h2>
              <p className="mt-3 text-base text-white/90 leading-relaxed">
                {cms?.wholesaleBanner?.description ||
                  'Whether you are ordering for your home or sourcing in bulk, DoN Tea Traders India Private Limited supports retail orders, wholesale enquiries, bulk supply enquiries, and business & distributor enquiries.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-4 text-sm font-bold text-white bg-[#29251F] hover:bg-[#29251F]/90 rounded transition-colors whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Place Retail Order</span>
              </Link>
              <Link
                to="/wholesale"
                className="inline-flex items-center gap-2 px-6 py-4 text-sm font-bold text-[#29251F] bg-[#F6C629] hover:bg-[#F6C629]/90 rounded transition-colors whitespace-nowrap shadow-sm"
              >
                <span>{cms?.wholesaleBanner?.ctaLabel || 'Enquire for Wholesale'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-white/20 text-sm">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-semibold text-[#F6C629]">Retail orders</p>
              <p className="text-xs text-white/85 mt-1">
                Direct household tea packs via online cart &amp; WhatsApp checkout.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-semibold text-[#F6C629]">Wholesale enquiries</p>
              <p className="text-xs text-white/85 mt-1">
                Structured trade pricing &amp; pack formats for stores and supermarkets.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-semibold text-[#F6C629]">Bulk supply enquiries</p>
              <p className="text-xs text-white/85 mt-1">
                Consistent Valparai Dust, Granules, and Leaf grades for HoReCa &amp; catering.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-semibold text-[#F6C629]">Business and distributor enquiries</p>
              <p className="text-xs text-white/85 mt-1">
                Regional distribution partnerships &amp; commercial supply coordination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Order via WhatsApp */}
      <section id="whatsapp-ordering" className="py-14 bg-[#FFF7E5] border-b border-[#29251F]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-[#29251F]/10 p-6 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
                <MessageCircle className="w-4 h-4" />
                <span>Direct Cart-to-WhatsApp Ordering</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F]">
                Order via WhatsApp
              </h2>
              <p className="text-sm sm:text-base text-[#29251F]/80 leading-relaxed">
                Select your preferred pack sizes from CTC Dust Tea, Granules Tea, or Leaf Tea, save your order enquiry at checkout, and send your pre-filled order summary directly to our configured business WhatsApp number.
              </p>
              {!whatsappConfigured && (
                <p className="text-xs text-[#B82025] font-medium">
                  Note: Direct WhatsApp click-to-chat activates automatically once the store administrator enters a verified business WhatsApp number in Admin Settings. Order enquiries can still be submitted anytime at checkout.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {directWhatsappUrl && (
                <a
                  href={directWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] rounded transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <Link
                to={cartCount > 0 ? '/checkout' : '/shop'}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#29251F] bg-[#F6C629] hover:bg-[#F6C629]/90 rounded transition-colors whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{cartCount > 0 ? 'Proceed to WhatsApp Checkout' : 'Select Teas to Order'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10: Blog and Tea Knowledge */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
                Tea Knowledge
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mt-1">
                From the DoN Tea Traders Journal
              </h2>
              <p className="text-sm text-[#29251F]/70 mt-2">
                Sample editorial tea guides that administrators can edit or replace at any time.
              </p>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B82025] hover:text-[#93161B]"
            >
              <span>Read All Articles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group border border-[#29251F]/10 rounded-lg overflow-hidden bg-white flex flex-col hover:border-[#B82025]/40 transition-colors"
              >
                <div className="aspect-[4/3] bg-[#FFF7E5] overflow-hidden">
                  <SafeImage
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-[#29251F]/60 mb-2">
                    <span className="font-medium text-[#B82025]">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTimeMinutes} min read</span>
                    {post.isDemo && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Sample Article</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#29251F] group-hover:text-[#B82025] transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#29251F]/75 line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
