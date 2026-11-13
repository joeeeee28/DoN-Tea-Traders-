import { useEffect, useState } from 'react';
import { Search, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { OrderRecord } from '../../types';
import { formatMoney } from '../../lib/assets';

const ORDER_STATUSES = [
  'New Enquiry',
  'Awaiting Payment',
  'Payment Under Verification',
  'Payment Confirmed',
  'Processing',
  'Dispatched',
  'Delivered',
  'Cancelled',
  'Refunded',
];

export function AdminOrdersPanel({ onUpdated }: { onUpdated: () => void }) {
  const { authFetch } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    orderStatus: '',
    paymentStatus: '',
    paymentReference: '',
    courierName: '',
    trackingNumber: '',
    trackingUrl: '',
    dispatchDate: '',
    deliveryStatus: '',
    shippingFee: '',
    auditNote: '',
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('orderStatus', statusFilter);
      if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
      if (countryFilter !== 'all') params.set('country', countryFilter);

      const res = await authFetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        setOrders(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter, countryFilter]);

  const openOrder = (o: OrderRecord) => {
    setSelectedOrder(o);
    setEditForm({
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      paymentReference: o.paymentReference || '',
      courierName: o.courierName || '',
      trackingNumber: o.trackingNumber || '',
      trackingUrl: o.trackingUrl || '',
      dispatchDate: o.dispatchDate || '',
      deliveryStatus: o.deliveryStatus || '',
      shippingFee: o.shippingFee || '0',
      auditNote: '',
    });
  };

  const saveOrderUpdate = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const res = await authFetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setSelectedOrder(null);
        await loadOrders();
        onUpdated();
      }
    } finally {
      setSaving(false);
    }
  };

  const uniqueCountries = [...new Set(orders.map((o) => o.country))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-[#29251F]/10 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#29251F]/45 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
            placeholder="Search reference (DT-...), customer, email..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#29251F]/20 rounded"
          />
        </div>
        <button
          type="button"
          onClick={loadOrders}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-[#29251F] rounded"
        >
          Search
        </button>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-[#29251F]/20 rounded bg-white"
        >
          <option value="all">All Order Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-[#29251F]/20 rounded bg-white"
        >
          <option value="all">All Payment Statuses</option>
          <option value="pending">Pending</option>
          <option value="awaiting_verification">Awaiting Verification</option>
          <option value="verified">Verified</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-[#29251F]/20 rounded bg-white"
        >
          <option value="all">All Countries</option>
          {uniqueCountries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#29251F]/10 overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-[#29251F]/65">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#29251F]/65">
            No orders match the selected filters.
          </p>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#29251F]/15 bg-[#FFF7E5]/60 text-[#29251F]/70">
                <th className="p-3.5">Order Ref</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Destination</th>
                <th className="p-3.5">Total</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29251F]/10">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#FFF7E5]/30">
                  <td className="p-3.5 font-mono font-semibold text-[#B82025]">
                    {o.orderReference}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-[#29251F]">{o.customerName}</div>
                    <div className="text-[#29251F]/60">{o.customerPhone}</div>
                  </td>
                  <td className="p-3.5">
                    <div>
                      {o.city}, {o.country}
                    </div>
                    <div className="text-[#29251F]/60 capitalize">{o.shippingType}</div>
                  </td>
                  <td className="p-3.5 font-semibold tabular-nums">
                    {formatMoney(o.totalAmount, o.currency)}
                  </td>
                  <td className="p-3.5 font-medium">{o.orderStatus}</td>
                  <td className="p-3.5 capitalize">{o.paymentStatus.replace('_', ' ')}</td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => openOrder(o)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#B82025] rounded"
                    >
                      Verify / Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail & Audit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-[#29251F]/10 pb-3">
              <div>
                <h3 className="font-display text-2xl font-bold text-[#29251F]">
                  Order <span className="font-mono text-[#B82025]">{selectedOrder.orderReference}</span>
                </h3>
                <p className="text-xs text-[#29251F]/70 mt-1">
                  {selectedOrder.customerName} · {selectedOrder.customerEmail} ·{' '}
                  {selectedOrder.customerPhone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-xs font-semibold px-3 py-1 border rounded"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#FFF7E5]/50 p-4 rounded border border-[#29251F]/10">
              <div>
                <p className="font-semibold mb-1">Delivery Address</p>
                <p>{selectedOrder.deliveryAddress}</p>
                <p>
                  {selectedOrder.city}, {selectedOrder.stateRegion} - {selectedOrder.postalCode}
                </p>
                <p>{selectedOrder.country}</p>
                {selectedOrder.additionalInstructions && (
                  <p className="mt-1 text-[#B82025]">
                    Note: {selectedOrder.additionalInstructions}
                  </p>
                )}
              </div>
              <div>
                <p className="font-semibold mb-1">Items ({selectedOrder.totalWeightGrams}g)</p>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-0.5 tabular-nums">
                    <span>
                      {item.productName} ({item.packSize}) × {item.quantity}
                    </span>
                    <span>
                      {item.lineTotal
                        ? formatMoney(item.lineTotal, selectedOrder.currency)
                        : 'Quote'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Order Lifecycle Status</label>
                <select
                  value={editForm.orderStatus}
                  onChange={(e) =>
                    setEditForm({ ...editForm, orderStatus: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded bg-white"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Manual Payment Verification Status
                </label>
                <select
                  value={editForm.paymentStatus}
                  onChange={(e) =>
                    setEditForm({ ...editForm, paymentStatus: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="awaiting_verification">Payment Under Verification</option>
                  <option value="verified">Verified (Paid in Bank)</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Bank / UPI / Gateway Reference
                </label>
                <input
                  type="text"
                  value={editForm.paymentReference}
                  onChange={(e) =>
                    setEditForm({ ...editForm, paymentReference: e.target.value })
                  }
                  placeholder="UTR / Transaction Ref"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Shipping Fee</label>
                <input
                  type="number"
                  value={editForm.shippingFee}
                  onChange={(e) =>
                    setEditForm({ ...editForm, shippingFee: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Courier / Delivery Partner</label>
                <input
                  type="text"
                  value={editForm.courierName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, courierName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={editForm.trackingNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, trackingNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tracking URL</label>
                <input
                  type="url"
                  value={editForm.trackingUrl}
                  onChange={(e) =>
                    setEditForm({ ...editForm, trackingUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Dispatch Date</label>
                <input
                  type="date"
                  value={editForm.dispatchDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dispatchDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Audit Note</label>
              <input
                type="text"
                value={editForm.auditNote}
                onChange={(e) => setEditForm({ ...editForm, auditNote: e.target.value })}
                placeholder="Reason for status or payment verification update..."
                className="w-full px-3 py-2 text-xs border rounded"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={saveOrderUpdate}
                disabled={saving}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#B82025] rounded disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Order & Audit Trail'}
              </button>
            </div>

            {/* Audit Trail */}
            <div className="pt-4 border-t border-[#29251F]/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#29251F] flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5 text-[#B82025]" />
                <span>Order Audit Trail</span>
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs">
                {(selectedOrder.auditLogs || []).map((log) => (
                  <div
                    key={log.id}
                    className="p-2 bg-[#FFF7E5]/40 rounded border border-[#29251F]/10"
                  >
                    <span className="font-semibold">{log.action}</span>:{' '}
                    {log.previousValue ? `${log.previousValue} → ` : ''}
                    <strong>{log.newValue}</strong> · by {log.actorEmail}
                    {log.notes ? ` (${log.notes})` : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
