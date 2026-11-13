import React, { useEffect, useState } from 'react';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import type { StoreSettings } from '../../types';

export function AdminSettingsPanel() {
  const { authFetch } = useAuth();
  const { refreshStorefront } = useStore();
  const [form, setForm] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await authFetch('/api/admin/settings');
      if (res.ok) setForm(await res.json());
    };
    load();
  }, [authFetch]);

  const handleUpload = async (file: File, field: 'logoUrl' | 'upiQrUrl') => {
    if (!form) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await authFetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      setForm({ ...form, [field]: data.url });
      setMsg('Image uploaded. Click Save Settings to apply.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await authFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await refreshStorefront();
        setMsg('Store, payment, and shipping settings saved.');
      } else {
        setMsg('Failed to save settings.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return <p className="text-sm text-[#29251F]/65 py-6">Loading store settings...</p>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {msg && (
        <div className="p-3 bg-[#FFF7E5] border border-[#F6C629] text-xs font-semibold rounded">
          {msg}
        </div>
      )}

      {/* Business & Contact Details */}
      <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-4">
        <h2 className="font-display text-xl font-bold text-[#29251F]">
          Business Identity &amp; Contact Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Business Name</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Contact Email</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="orders@yourdomain.com"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Contact Phone</label>
            <input
              type="text"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Default Currency</label>
            <select
              value={form.defaultCurrency}
              onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-white"
            >
              {form.supportedCurrencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">Business Address</label>
            <textarea
              rows={2}
              value={form.businessAddress}
              onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">Logo Upload (Optional)</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 border rounded cursor-pointer bg-[#FFF7E5]/50">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'logoUrl')}
                />
              </label>
              {form.logoUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logoUrl: '' })}
                  className="text-[#B82025] underline"
                >
                  Clear Logo (Use Wordmark)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp & India UPI Payment */}
      <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-4">
        <h2 className="font-display text-xl font-bold text-[#29251F]">
          WhatsApp Ordering &amp; India UPI Configuration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">
              WhatsApp Business Number (with country code, e.g. 9198XXXXXXXX)
            </label>
            <input
              type="text"
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              placeholder="Leave blank to keep WhatsApp checkout disabled"
              className="w-full px-3 py-2 border rounded font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">India UPI ID</label>
            <input
              type="text"
              value={form.upiId}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
              placeholder="e.g. business@bank"
              className="w-full px-3 py-2 border rounded font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">UPI Payment Instructions</label>
            <textarea
              rows={2}
              value={form.upiInstructions}
              onChange={(e) => setForm({ ...form, upiInstructions: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">UPI QR Code Image</label>
            <label className="inline-flex items-center gap-1.5 px-3 py-2 border rounded cursor-pointer bg-[#FFF7E5]/50">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload UPI QR Code</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleUpload(e.target.files[0], 'upiQrUrl')
                }
              />
            </label>
          </div>
        </div>
      </div>

      {/* International Payment Readiness */}
      <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-4">
        <h2 className="font-display text-xl font-bold text-[#29251F]">
          International Payment Architecture (Inactive Until Approved)
        </h2>
        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.internationalPaymentActive}
              onChange={(e) =>
                setForm({ ...form, internationalPaymentActive: e.target.checked })
              }
            />
            <span>
              Gateway Approved &amp; Configured (keep unchecked until real provider keys &amp; webhook verification are enabled)
            </span>
          </label>
          <div>
            <label className="block font-semibold mb-1">Provider Name</label>
            <input
              type="text"
              value={form.internationalPaymentProvider}
              onChange={(e) =>
                setForm({ ...form, internationalPaymentProvider: e.target.value })
              }
              placeholder="e.g. Stripe / Razorpay International (Inactive)"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Customer Notice</label>
            <textarea
              rows={2}
              value={form.internationalPaymentNotice}
              onChange={(e) =>
                setForm({ ...form, internationalPaymentNotice: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Domestic & International Shipping */}
      <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-5">
        <h2 className="font-display text-xl font-bold text-[#29251F]">
          Domestic &amp; International Shipping Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-b border-[#29251F]/10 pb-5">
          <div>
            <label className="block font-semibold mb-1">Domestic Flat Fee (INR)</label>
            <input
              type="number"
              value={form.domesticShipping.flatFee}
              onChange={(e) =>
                setForm({
                  ...form,
                  domesticShipping: {
                    ...form.domesticShipping,
                    flatFee: Number(e.target.value),
                  },
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Domestic Free-Delivery Min Order
            </label>
            <input
              type="number"
              value={form.domesticShipping.minOrderValue}
              onChange={(e) =>
                setForm({
                  ...form,
                  domesticShipping: {
                    ...form.domesticShipping,
                    minOrderValue: Number(e.target.value),
                  },
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Estimated Delivery Days</label>
            <input
              type="text"
              value={form.domesticShipping.estimatedDays}
              onChange={(e) =>
                setForm({
                  ...form,
                  domesticShipping: {
                    ...form.domesticShipping,
                    estimatedDays: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block font-semibold mb-1">
              Serviceable PIN Codes / Regions
            </label>
            <input
              type="text"
              value={form.domesticShipping.serviceableRegions}
              onChange={(e) =>
                setForm({
                  ...form,
                  domesticShipping: {
                    ...form.domesticShipping,
                    serviceableRegions: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              International Destination Countries (Activate only after confirming export/import compliance)
            </h3>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  internationalShippingCountries: [
                    ...form.internationalShippingCountries,
                    {
                      countryCode: 'CA',
                      countryName: 'Canada',
                      active: false,
                      courierName: 'To be confirmed',
                      baseFee: 2500,
                      perKgFee: 900,
                      estimatedDays: '7–12 business days',
                      complianceNotes: 'Subject to export compliance confirmation.',
                    },
                  ],
                })
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFF7E5] border rounded font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Country</span>
            </button>
          </div>

          {form.internationalShippingCountries.map((c, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#FFF7E5]/40 rounded border border-[#29251F]/10 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center"
            >
              <input
                value={c.countryName}
                onChange={(e) => {
                  const next = [...form.internationalShippingCountries];
                  next[idx] = { ...c, countryName: e.target.value };
                  setForm({ ...form, internationalShippingCountries: next });
                }}
                className="px-2.5 py-1.5 border rounded"
              />
              <input
                value={c.courierName}
                onChange={(e) => {
                  const next = [...form.internationalShippingCountries];
                  next[idx] = { ...c, courierName: e.target.value };
                  setForm({ ...form, internationalShippingCountries: next });
                }}
                placeholder="Courier"
                className="px-2.5 py-1.5 border rounded"
              />
              <input
                type="number"
                value={c.baseFee}
                onChange={(e) => {
                  const next = [...form.internationalShippingCountries];
                  next[idx] = { ...c, baseFee: Number(e.target.value) };
                  setForm({ ...form, internationalShippingCountries: next });
                }}
                placeholder="Base Fee"
                className="px-2.5 py-1.5 border rounded"
              />
              <input
                type="number"
                value={c.perKgFee}
                onChange={(e) => {
                  const next = [...form.internationalShippingCountries];
                  next[idx] = { ...c, perKgFee: Number(e.target.value) };
                  setForm({ ...form, internationalShippingCountries: next });
                }}
                placeholder="Per Kg"
                className="px-2.5 py-1.5 border rounded"
              />
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={c.active}
                  onChange={(e) => {
                    const next = [...form.internationalShippingCountries];
                    next[idx] = { ...c, active: e.target.checked };
                    setForm({ ...form, internationalShippingCountries: next });
                  }}
                />
                <span>Active</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const next = form.internationalShippingCountries.filter((_, i) => i !== idx);
                  setForm({ ...form, internationalShippingCountries: next });
                }}
                className="p-1.5 text-[#B82025] justify-self-end"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements & Social */}
      <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-4 text-xs">
        <h2 className="font-display text-xl font-bold text-[#29251F]">
          Top Bar Announcements &amp; Social Links
        </h2>
        <div>
          <label className="block font-semibold mb-1">
            Announcements (one per line)
          </label>
          <textarea
            rows={4}
            value={form.announcements.join('\n')}
            onChange={(e) =>
              setForm({
                ...form,
                announcements: e.target.value.split('\n').filter((l) => l.trim()),
              })
            }
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="Instagram URL"
            value={form.socialLinks.instagram || ''}
            onChange={(e) =>
              setForm({
                ...form,
                socialLinks: { ...form.socialLinks, instagram: e.target.value },
              })
            }
            className="px-3 py-2 border rounded"
          />
          <input
            placeholder="LinkedIn URL"
            value={form.socialLinks.linkedin || ''}
            onChange={(e) =>
              setForm({
                ...form,
                socialLinks: { ...form.socialLinks, linkedin: e.target.value },
              })
            }
            className="px-3 py-2 border rounded"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 text-sm font-semibold text-white bg-[#B82025] hover:bg-[#93161B] rounded disabled:opacity-50"
        >
          {saving ? 'Saving Settings...' : 'Save All Store Settings'}
        </button>
      </div>
    </form>
  );
}
