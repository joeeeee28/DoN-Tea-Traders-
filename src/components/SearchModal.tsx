import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types';
import { formatMoney } from '../lib/assets';
import { SafeImage } from './SafeImage';

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) return;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.slice(0, 6));
        }
      } catch {
        // Ignore transient search error
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [query, isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div
        className="fixed inset-0 bg-black/55"
        onClick={() => setIsSearchOpen(false)}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden border border-[#29251F]/10">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#29251F]/10">
          <Search className="w-5 h-5 text-[#B82025]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search CTC tea, dust tea, Assam, masala blends..."
            autoFocus
            className="flex-1 text-sm text-[#29251F] placeholder:text-[#29251F]/45 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
            className="p-1.5 rounded hover:bg-[#FFF7E5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <p className="text-sm text-[#29251F]/60 py-6 text-center">Searching teas...</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-[#29251F]/60 py-6 text-center">
              No matching teas found. Try searching for CTC, Dust, Assam, or Masala.
            </p>
          ) : (
            results.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.slug}`}
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center gap-4 p-2.5 rounded hover:bg-[#FFF7E5] transition-colors"
              >
                <div className="w-14 h-14 rounded overflow-hidden bg-[#FFF7E5] shrink-0">
                  <SafeImage
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#29251F] truncate">{p.name}</p>
                  <p className="text-xs text-[#29251F]/65 truncate">
                    {p.categoryName} · {p.teaType}
                  </p>
                </div>
                <div className="text-sm font-semibold text-[#B82025] tabular-nums shrink-0">
                  {p.startingPrice !== null
                    ? formatMoney(p.startingPrice, p.currency)
                    : 'Enquiry'}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
