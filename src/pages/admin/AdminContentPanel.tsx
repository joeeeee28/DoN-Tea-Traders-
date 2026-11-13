import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import type { BlogPost, StoreSettings } from '../../types';
import { AVAILABLE_STUDIO_ASSETS } from '../../lib/assets';

interface WholesaleRow {
  id: number;
  referenceCode: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  businessType: string;
  productInterest: string;
  requiredQuantity: string;
  status: string;
}

interface ContactRow {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
}

export function AdminContentPanel() {
  const { authFetch } = useAuth();
  const { refreshStorefront } = useStore();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [enquiries, setEnquiries] = useState<WholesaleRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [blogForm, setBlogForm] = useState({
    id: 0,
    title: '',
    category: 'Tea Basics',
    excerpt: '',
    content: '',
    imageUrl: 'asset:tasting',
    readTimeMinutes: 4,
    isPublished: true,
    isDemo: false,
  });

  const loadAll = async () => {
    const [sRes, bRes, eRes, cRes] = await Promise.all([
      authFetch('/api/admin/settings'),
      authFetch('/api/admin/blog'),
      authFetch('/api/admin/enquiries'),
      authFetch('/api/admin/contacts'),
    ]);
    if (sRes.ok) setSettings(await sRes.json());
    if (bRes.ok) setPosts(await bRes.json());
    if (eRes.ok) setEnquiries(await eRes.json());
    if (cRes.ok) setContacts(await cRes.json());
  };

  useEffect(() => {
    loadAll();
  }, []);

  const saveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const res = await authFetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      await refreshStorefront();
      setMsg('Website content and policies updated.');
    }
  };

  const saveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = blogForm.id ? `/api/admin/blog/${blogForm.id}` : '/api/admin/blog';
    const method = blogForm.id ? 'PUT' : 'POST';
    const res = await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blogForm),
    });
    if (res.ok) {
      setBlogForm({
        id: 0,
        title: '',
        category: 'Tea Basics',
        excerpt: '',
        content: '',
        imageUrl: 'asset:tasting',
        readTimeMinutes: 4,
        isPublished: true,
        isDemo: false,
      });
      await loadAll();
      await refreshStorefront();
      setMsg('Blog article saved.');
    }
  };

  const deleteBlog = async (id: number) => {
    const res = await authFetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadAll();
      await refreshStorefront();
    }
  };

  if (!settings) {
    return <p className="text-sm text-[#29251F]/65 py-6">Loading content manager...</p>;
  }

  const cms = settings.cmsContent;

  return (
    <div className="space-y-8">
      {msg && (
        <div className="p-3 bg-[#FFF7E5] border border-[#F6C629] text-xs font-semibold rounded">
          {msg}
        </div>
      )}

      {/* Homepage & Policies CMS */}
      <form
        onSubmit={saveCms}
        className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-5 text-xs"
      >
        <h2 className="font-display text-xl font-bold text-[#29251F]">
          Homepage Copy, Story &amp; Policy Pages
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Hero Headline</label>
            <input
              type="text"
              value={cms.hero.headline}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cmsContent: {
                    ...cms,
                    hero: { ...cms.hero, headline: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Hero Subheadline</label>
            <input
              type="text"
              value={cms.hero.subheadline}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cmsContent: {
                    ...cms,
                    hero: { ...cms.hero, subheadline: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">Brand Story (Full Text)</label>
            <textarea
              rows={4}
              value={cms.brandStory.fullStory}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cmsContent: {
                    ...cms,
                    brandStory: { ...cms.brandStory, fullStory: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Shipping Policy</label>
            <textarea
              rows={4}
              value={cms.policies.shippingPolicy}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cmsContent: {
                    ...cms,
                    policies: { ...cms.policies, shippingPolicy: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Returns &amp; Refunds Policy</label>
            <textarea
              rows={4}
              value={cms.policies.returnsPolicy}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cmsContent: {
                    ...cms,
                    policies: { ...cms.policies, returnsPolicy: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Privacy Policy</label>
            <textarea
              rows={4}
              value={cms.policies.privacyPolicy}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cmsContent: {
                    ...cms,
                    policies: { ...cms.policies, privacyPolicy: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Terms &amp; Conditions</label>
            <textarea
              rows={4}
              value={cms.policies.termsConditions}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cmsContent: {
                    ...cms,
                    policies: { ...cms.policies, termsConditions: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 font-semibold text-white bg-[#B82025] rounded"
        >
          Save Website Content &amp; Policies
        </button>
      </form>

      {/* Blog Articles Manager */}
      <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-5 text-xs">
        <h2 className="font-display text-xl font-bold text-[#29251F]">
          Blog &amp; Tea Knowledge Articles
        </h2>
        <div className="space-y-2">
          {posts.map((p) => (
            <div
              key={p.id}
              className="p-3 bg-[#FFF7E5]/40 rounded border border-[#29251F]/10 flex items-center justify-between gap-3"
            >
              <div>
                <span className="font-semibold text-sm text-[#29251F]">{p.title}</span>
                <span className="ml-2 text-[#29251F]/60">
                  ({p.category} · {p.isDemo ? 'Sample' : 'Custom'})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBlogForm(p)}
                  className="font-semibold text-[#B82025] hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteBlog(p.id)}
                  className="text-[#29251F]/60 hover:text-[#B82025]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={saveBlog} className="pt-4 border-t border-[#29251F]/10 space-y-3">
          <h3 className="font-semibold text-sm">
            {blogForm.id ? 'Edit Article' : 'Create New Article'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              required
              placeholder="Article Title"
              value={blogForm.title}
              onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              placeholder="Category"
              value={blogForm.category}
              onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <select
              value={blogForm.imageUrl}
              onChange={(e) => setBlogForm({ ...blogForm, imageUrl: e.target.value })}
              className="px-3 py-2 border rounded bg-white"
            >
              {AVAILABLE_STUDIO_ASSETS.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <input
            placeholder="Short Excerpt"
            value={blogForm.excerpt}
            onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
          <textarea
            rows={4}
            placeholder="Full Article Content"
            value={blogForm.content}
            onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="px-5 py-2.5 font-semibold text-white bg-[#29251F] rounded"
          >
            {blogForm.id ? 'Update Article' : 'Publish Article'}
          </button>
        </form>
      </div>

      {/* Wholesale & Contact Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-3">
          <h2 className="font-display text-xl font-bold text-[#29251F]">
            Wholesale Enquiries ({enquiries.length})
          </h2>
          {enquiries.length === 0 ? (
            <p className="text-[#29251F]/60">No wholesale enquiries submitted yet.</p>
          ) : (
            enquiries.map((e) => (
              <div key={e.id} className="p-3 bg-[#FFF7E5]/40 rounded border border-[#29251F]/10">
                <p className="font-semibold">
                  {e.referenceCode} · {e.businessName} ({e.country})
                </p>
                <p className="text-[#29251F]/70 mt-0.5">
                  {e.contactPerson} · {e.email} · {e.phone}
                </p>
                <p className="mt-1">
                  Interest: {e.productInterest} · Qty: {e.requiredQuantity}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-3">
          <h2 className="font-display text-xl font-bold text-[#29251F]">
            Contact Messages ({contacts.length})
          </h2>
          {contacts.length === 0 ? (
            <p className="text-[#29251F]/60">No contact messages yet.</p>
          ) : (
            contacts.map((c) => (
              <div key={c.id} className="p-3 bg-[#FFF7E5]/40 rounded border border-[#29251F]/10">
                <p className="font-semibold">
                  {c.subject} · {c.name}
                </p>
                <p className="text-[#29251F]/70">{c.email}</p>
                <p className="mt-1">{c.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
