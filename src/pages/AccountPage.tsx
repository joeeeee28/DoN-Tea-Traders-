import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, ShieldCheck, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { OrderRecord } from '../types';
import { formatMoney } from '../lib/assets';
import { SeoHead } from '../components/SeoHead';

export function AccountPage() {
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
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!firebaseUser) {
      setOrders([]);
      return;
    }
    let active = true;
    const load = async () => {
      setOrdersLoading(true);
      try {
        const res = await authFetch('/api/my-orders');
        if (res.ok && active) {
          setOrders(await res.json());
        }
      } finally {
        if (active) setOrdersLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [firebaseUser, authFetch]);

  return (
    <div className="bg-[#FFF7E5]/35 min-h-screen py-12">
      <SeoHead
        title="My Account – DON TRADERS"
        description="Sign in to view your DON TRADERS order enquiries or access the Admin Dashboard."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#29251F]/10">
          {loading ? (
            <p className="text-sm text-[#29251F]/70">Checking authentication...</p>
          ) : !firebaseUser ? (
            <div className="text-center py-8 space-y-4">
              <h1 className="font-display text-3xl font-bold text-[#29251F]">
                Sign In to DON TRADERS
              </h1>
              <p className="text-sm text-[#29251F]/75 max-w-md mx-auto">
                Sign in with your Google account to track your order enquiries or manage the storefront if you are an administrator.
              </p>
              {authError && (
                <p className="text-xs text-[#B82025] bg-[#FFF7E5] border border-[#F6C629] p-3 rounded max-w-md mx-auto">
                  {authError}
                </p>
              )}
              <button
                type="button"
                disabled={signingIn}
                onClick={() => void signInWithGoogle()}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] disabled:opacity-60 rounded transition-colors"
              >
                {signingIn ? 'Opening Google Sign-In...' : 'Continue with Google'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#B82025]">
                  Signed In Account
                </p>
                <h1 className="font-display text-2xl font-bold text-[#29251F] mt-0.5">
                  {dbUser?.name || firebaseUser.email}
                </h1>
                <p className="text-xs text-[#29251F]/70 mt-1">
                  {firebaseUser.email} · Role:{' '}
                  <strong className="capitalize">{dbUser?.role || 'customer'}</strong>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {dbUser?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#29251F] bg-[#F6C629] hover:bg-[#F6C629]/90 rounded"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open Admin Dashboard</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#29251F] border border-[#29251F]/20 rounded hover:bg-[#FFF7E5]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {firebaseUser && (
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#29251F]/10 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#29251F] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#B82025]" />
              <span>Your Order Enquiries</span>
            </h2>
            {ordersLoading ? (
              <p className="text-sm text-[#29251F]/65">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-[#29251F]/65">
                No order enquiries linked to this account yet.
              </p>
            ) : (
              <div className="divide-y divide-[#29251F]/10">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <Link
                        to={`/order-confirmation/${o.orderReference}`}
                        className="font-mono text-sm font-bold text-[#B82025] hover:underline"
                      >
                        {o.orderReference}
                      </Link>
                      <p className="text-xs text-[#29251F]/70 mt-0.5">
                        {o.orderStatus} · Payment: {o.paymentStatus} ·{' '}
                        {o.items.length} item(s)
                      </p>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {formatMoney(o.totalAmount, o.currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
