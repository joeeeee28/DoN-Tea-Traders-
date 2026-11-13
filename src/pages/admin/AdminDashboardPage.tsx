import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Settings,
  FileText,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SeoHead } from '../../components/SeoHead';
import { AdminProductsPanel } from './AdminProductsPanel';
import { AdminOrdersPanel } from './AdminOrdersPanel';
import { AdminSettingsPanel } from './AdminSettingsPanel';
import { AdminContentPanel } from './AdminContentPanel';

interface DashboardMetrics {
  totalOrders: number;
  newEnquiries: number;
  awaitingPayment: number;
  underVerification: number;
  confirmedPayments: number;
  processingOrders: number;
  dispatchedOrders: number;
  deliveredOrders: number;
  totalActiveProducts: number;
  lowStockProducts: number;
  wholesaleEnquiriesCount: number;
  contactMessagesCount: number;
}

type AdminTab = 'overview' | 'orders' | 'products' | 'settings' | 'content';

export function AdminDashboardPage() {
  const {
    firebaseUser,
    dbUser,
    loading,
    signingIn,
    authError,
    signInWithGoogle,
    logout,
    authFetch,
  } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const loadMetrics = async () => {
    const res = await authFetch('/api/admin/dashboard');
    if (res.ok) {
      const data = await res.json();
      setMetrics(data.metrics);
    }
  };

  useEffect(() => {
    if (dbUser?.role === 'admin') {
      loadMetrics();
    }
  }, [dbUser]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-sm text-[#29251F]/70">
        Verifying administrator session...
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="bg-[#FFF7E5]/40 min-h-screen py-20">
        <SeoHead
          title="Admin Sign In – DON TRADERS"
          description="Protected administrator portal for DON TRADERS."
        />
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-[#29251F]/10 text-center space-y-4">
          <h1 className="font-display text-3xl font-bold text-[#29251F]">
            Don Traders Admin Portal
          </h1>
          <p className="text-sm text-[#29251F]/75">
            Sign in with your administrator Google account to manage products, orders, UPI verification, shipping rules, and website content.
          </p>
          {authError && (
            <p className="text-xs text-[#B82025] bg-[#FFF7E5] border border-[#F6C629] p-3 rounded text-left">
              {authError}
            </p>
          )}
          <button
            type="button"
            disabled={signingIn}
            onClick={() => void signInWithGoogle()}
            className="w-full px-6 py-3 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] disabled:opacity-60 rounded transition-colors"
          >
            {signingIn ? 'Opening Google Sign-In...' : 'Sign In with Google'}
          </button>
        </div>
      </div>
    );
  }

  if (dbUser?.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-10 h-10 text-[#B82025] mx-auto" />
        <h1 className="font-display text-2xl font-bold text-[#29251F]">
          Administrator Role Required
        </h1>
        <p className="text-sm text-[#29251F]/75">
          Signed in as <strong>{firebaseUser.email}</strong>, which has customer access. Contact the store administrator to grant admin permissions.
        </p>
        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 text-xs font-semibold border border-[#29251F]/20 rounded"
        >
          Sign Out
        </button>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders & Payments', icon: ClipboardList },
    { id: 'products', label: 'Products & Categories', icon: Package },
    { id: 'settings', label: 'Store & Shipping', icon: Settings },
    { id: 'content', label: 'CMS, Blog & Inbox', icon: FileText },
  ];

  const complianceItems = [
    'Applicable FSSAI registration / licence number verified and printed on packaging (never invented).',
    'Food product labelling: ingredients, net weight, MRP/price, nutritional/allergen declarations where required.',
    'Manufacturer, packer, and brand owner (DON TRADERS) name and address declared on packs.',
    'Batch number, packing date, and best-before date coding configured in production workflow.',
    'Applicable IEC (Importer-Exporter Code) and Tea Board registrations verified before export.',
    'Destination-country food import regulations and customs clearance confirmed prior to activating countries.',
    'Privacy policy, consumer return terms, and WhatsApp/UPI details reviewed before launch.',
  ];

  return (
    <div className="bg-[#FFF7E5]/40 min-h-screen pb-16">
      <SeoHead
        title="Admin Dashboard – DON TRADERS"
        description="Manage DON TRADERS orders, products, UPI verification, shipping settings, and content."
      />

      <div className="bg-[#29251F] text-white border-b-4 border-[#B82025]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#F6C629] font-semibold">
              DON TRADERS Management Console
            </p>
            <h1 className="font-display text-2xl font-bold mt-0.5">
              Store &amp; Order Administration
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/80">{dbUser.email}</span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-[#F6C629] text-[#F6C629]'
                    : 'border-transparent text-white/75 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Orders', value: metrics?.totalOrders ?? 0 },
                { label: 'New Enquiries', value: metrics?.newEnquiries ?? 0 },
                { label: 'Awaiting Payment', value: metrics?.awaitingPayment ?? 0 },
                { label: 'Under Verification', value: metrics?.underVerification ?? 0 },
                { label: 'Confirmed Payments', value: metrics?.confirmedPayments ?? 0 },
                { label: 'Processing Orders', value: metrics?.processingOrders ?? 0 },
                { label: 'Dispatched Orders', value: metrics?.dispatchedOrders ?? 0 },
                { label: 'Delivered Orders', value: metrics?.deliveredOrders ?? 0 },
                { label: 'Active Products', value: metrics?.totalActiveProducts ?? 0 },
                { label: 'Low-Stock Products', value: metrics?.lowStockProducts ?? 0 },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-white p-4 rounded-lg border border-[#29251F]/10"
                >
                  <p className="text-xs text-[#29251F]/65">{kpi.label}</p>
                  <p className="text-2xl font-bold text-[#29251F] mt-1 tabular-nums">
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-3">
              <h2 className="font-display text-xl font-bold text-[#29251F]">
                Pre-Launch Compliance &amp; Regulatory Checklist
              </h2>
              <p className="text-xs text-[#29251F]/70">
                Complete and verify all statutory items below before commercial launch. Never publish placeholder or unverified registration numbers.
              </p>
              <ul className="space-y-2 text-xs text-[#29251F]/85 pt-2">
                {complianceItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono text-[#B82025] font-semibold">0{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'orders' && <AdminOrdersPanel onUpdated={loadMetrics} />}
        {tab === 'products' && <AdminProductsPanel />}
        {tab === 'settings' && <AdminSettingsPanel />}
        {tab === 'content' && <AdminContentPanel />}
      </div>
    </div>
  );
}
