import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { SeoHead } from '../components/SeoHead';
import { ProductCard } from '../components/ProductCard';

export function ShopPage() {
  const { categories } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [teaOrigin, setTeaOrigin] = useState('all');
  const [sort, setSort] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCategorySlug(searchParams.get('category') || 'all');
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (categorySlug !== 'all') params.set('category', categorySlug);
        if (search.trim()) params.set('search', search.trim());
        if (teaOrigin !== 'all') params.set('teaOrigin', teaOrigin);
        if (sort !== 'featured') params.set('sort', sort);

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error('Unable to load tea catalogue.');
        const data = await res.json();
        if (active) setProducts(data);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Error loading products');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [categorySlug, search, teaOrigin, sort]);

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="bg-[#FFF7E5]/35 min-h-screen">
      <SeoHead
        title="Our Collection – DoN Tea Traders India Private Limited"
        description="Explore DoN Tea Traders India Private Limited single-origin Valparai tea: CTC Dust Tea, Granules Tea, and Leaf Tea."
      />

      <div className="bg-[#FFF7E5] border-b border-[#29251F]/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B82025]">
            DoN Tea Traders India Private Limited · From 7th Heaven Valparai
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#29251F] mt-1">
            Our Collection
          </h1>
          <p className="text-sm text-[#29251F]/75 mt-2 max-w-2xl">
            Pure Origin. Natural Strength. Authentic Taste. Filter by CTC Dust Tea, Granules Tea, Leaf Tea, or search keyword.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter & Sort Bar */}
        <div className="bg-white p-4 rounded-lg border border-[#29251F]/10 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#29251F]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search CTC, Dust, Assam, Masala..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-[#29251F]/15 rounded focus:outline-none focus:border-[#B82025]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-[#29251F]/70">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>
              <select
                value={teaOrigin}
                onChange={(e) => setTeaOrigin(e.target.value)}
                aria-label="Filter by tea origin"
                className="px-3 py-2 text-xs font-medium border border-[#29251F]/15 rounded bg-white text-[#29251F]"
              >
                <option value="all">All Origins</option>
                <option value="Assam (Demo)">Assam</option>
                <option value="Assam & Indian Blend (Demo)">Assam &amp; Indian Blend</option>
                <option value="Nilgiri & Assam Blend (Demo)">Nilgiri &amp; Assam</option>
                <option value="Darjeeling & Assam Blend (Demo)">Darjeeling &amp; Assam</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort products"
                className="px-3 py-2 text-xs font-medium border border-[#29251F]/15 rounded bg-white text-[#29251F]"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#29251F]/10">
            <button
              type="button"
              onClick={() => handleCategoryChange('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
                categorySlug === 'all'
                  ? 'bg-[#B82025] text-white'
                  : 'bg-[#FFF7E5] text-[#29251F] hover:bg-[#F6C629]/40'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
                  categorySlug === cat.slug
                    ? 'bg-[#B82025] text-white'
                    : 'bg-[#FFF7E5] text-[#29251F] hover:bg-[#F6C629]/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 bg-white rounded-lg border border-[#29251F]/10 animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-[#29251F]/10">
            <p className="font-display text-xl font-semibold text-[#29251F]">
              No teas match your current filters
            </p>
            <p className="text-sm text-[#29251F]/70 mt-2">
              Try clearing your search or selecting All Categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setTeaOrigin('all');
                handleCategoryChange('all');
              }}
              className="mt-5 px-5 py-2.5 text-xs font-semibold text-white bg-[#B82025] rounded"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
