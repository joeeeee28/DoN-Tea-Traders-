import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { settings, cartCount, setIsCartOpen, setIsSearchOpen } = useStore();
  const { dbUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const announcements =
    settings?.announcements && settings.announcements.length > 0
      ? settings.announcements
      : [
          'Naturally Valparai. Truly DoN.',
          'Single Origin. Unblended Pure Valparai Tea — No Artificial Flavours. No Additives.',
          'Retail & Wholesale Supply Available.',
          'From 7th Heaven Valparai — Order via WhatsApp.',
        ];

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: 'Our Story', to: '/our-story' },
    { label: 'Our Collection', to: '/categories' },
    { label: 'Our Sourcing', to: '/our-sourcing' },
    { label: 'Wholesale', to: '/wholesale' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/contact' },
  ];

  const brandName = settings?.businessName || 'DoN Tea Traders India Private Limited';
  const isOfficialLegalName = brandName === 'DoN Tea Traders India Private Limited';

  return (
    <div className="sticky top-0 z-40">
      {!bannerDismissed && (
        <div className="bg-[#F6C629] text-[#29251F] h-9 px-4 flex items-center justify-between text-xs font-medium">
          <div className="w-5" aria-hidden="true" />
          <p className="truncate text-center tracking-wide">
            {announcements[announcementIdx % announcements.length]}
          </p>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss announcement"
            className="p-1 rounded hover:bg-black/10 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <header className="bg-white/95 backdrop-blur-md border-b border-[#29251F]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 text-[#29251F] hover:text-[#B82025] rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              to="/"
              aria-label={brandName}
              className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B82025]"
            >
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={brandName}
                  className="h-9 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span className="w-8 h-8 rounded bg-[#B82025] text-[#F6C629] font-display font-bold text-base flex items-center justify-center tracking-tight shrink-0">
                    DT
                  </span>
                  {isOfficialLegalName ? (
                    <span className="flex flex-col leading-none">
                      <span className="font-display text-lg font-bold tracking-tight text-[#B82025]">
                        DoN Tea Traders
                      </span>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#29251F]/70 mt-0.5">
                        India Private Limited
                      </span>
                    </span>
                  ) : (
                    <span className="font-display text-xl font-bold tracking-tight text-[#B82025]">
                      {brandName}
                    </span>
                  )}
                </span>
              )}
            </Link>
          </div>

          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-5 xl:gap-7"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    isActive
                      ? 'text-[#B82025] border-[#B82025]'
                      : 'text-[#29251F]/80 border-transparent hover:text-[#B82025] hover:border-[#F6C629]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search teas"
              className="p-2 text-[#29251F] hover:text-[#B82025] hover:bg-[#FFF7E5] rounded-md transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              to={dbUser?.role === 'admin' ? '/admin' : '/account'}
              aria-label={dbUser?.role === 'admin' ? 'Admin Dashboard' : 'Customer Account'}
              className="p-2 text-[#29251F] hover:text-[#B82025] hover:bg-[#FFF7E5] rounded-md transition-colors inline-flex items-center gap-1.5"
            >
              {dbUser?.role === 'admin' ? (
                <ShieldCheck className="w-5 h-5 text-[#B82025]" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Shopping cart with ${cartCount} items`}
              className="relative p-2 text-[#29251F] hover:text-[#B82025] hover:bg-[#FFF7E5] rounded-md transition-colors inline-flex items-center gap-1.5"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="min-w-5 h-5 px-1 rounded-full bg-[#B82025] text-white text-[11px] font-semibold tabular-nums flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Accessible Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white h-full flex flex-col shadow-xl">
            <div className="px-5 py-4 bg-[#B82025] text-white flex items-center justify-between">
              <span className="font-display text-lg font-bold">{brandName}</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 rounded hover:bg-white/15"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#FFF7E5] text-[#B82025] font-semibold'
                        : 'text-[#29251F] hover:bg-[#FFF7E5]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="pt-4 mt-4 border-t border-[#29251F]/10 space-y-1">
                <Link
                  to="/tea-origins"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-sm text-[#29251F]/80 hover:bg-[#FFF7E5]"
                >
                  Tea Origins
                </Link>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-sm text-[#29251F]/80 hover:bg-[#FFF7E5]"
                >
                  Account &amp; My Enquiries
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-sm font-semibold text-[#B82025] hover:bg-[#FFF7E5]"
                >
                  Admin Dashboard
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
