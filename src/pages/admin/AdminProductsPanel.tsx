import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Edit3, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import type { Category, Product, ProductVariant } from '../../types';
import { AVAILABLE_STUDIO_ASSETS, formatMoney } from '../../lib/assets';
import { SafeImage } from '../../components/SafeImage';

export function AdminProductsPanel() {
  const { authFetch } = useAuth();
  const { refreshStorefront } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // Category Form
  const [catForm, setCatForm] = useState({
    id: 0,
    name: '',
    description: '',
    imageUrl: 'asset:ctc_dust',
    sortOrder: 0,
    isActive: true,
    isDemo: false,
  });

  // Product Editor Modal/Panel
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [newVariant, setNewVariant] = useState({
    packSize: '250g',
    sku: '',
    netWeightGrams: 250,
    shippingWeightGrams: 280,
    sellingPrice: '',
    currency: 'INR',
    stockQuantity: 50,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        authFetch('/api/admin/products'),
        authFetch('/api/admin/categories'),
      ]);
      if (pRes.ok) setProducts(await pRes.json());
      if (cRes.ok) setCategories(await cRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadImage = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await authFetch('/api/admin/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      setMsg('Image upload failed.');
      return null;
    }
    const data = await res.json();
    return data.url;
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const url = catForm.id
      ? `/api/admin/categories/${catForm.id}`
      : '/api/admin/categories';
    const method = catForm.id ? 'PUT' : 'POST';
    const res = await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catForm),
    });
    if (res.ok) {
      setCatForm({
        id: 0,
        name: '',
        description: '',
        imageUrl: 'asset:ctc_dust',
        sortOrder: 0,
        isActive: true,
        isDemo: false,
      });
      await loadData();
      await refreshStorefront();
      setMsg('Category saved.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const res = await authFetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadData();
      await refreshStorefront();
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setMsg(null);
    const isNew = !editingProduct.id;
    const url = isNew
      ? '/api/admin/products'
      : `/api/admin/products/${editingProduct.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const payload = {
      ...editingProduct,
      variants: isNew
        ? [
            {
              ...newVariant,
              sku: newVariant.sku || `${editingProduct.sku || 'DT'}-${newVariant.packSize}`,
              sellingPrice: newVariant.sellingPrice === '' ? null : newVariant.sellingPrice,
            },
          ]
        : undefined,
    };

    const res = await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setEditingProduct(null);
      await loadData();
      await refreshStorefront();
      setMsg('Product saved.');
    } else {
      const err = await res.json();
      setMsg(err.error || 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const res = await authFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadData();
      await refreshStorefront();
    }
  };

  const handleUpdateVariant = async (v: ProductVariant, patch: Partial<ProductVariant>) => {
    const res = await authFetch(`/api/admin/variants/${v.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      await loadData();
      await refreshStorefront();
    }
  };

  const handleAddVariant = async (productId: number) => {
    if (!newVariant.packSize.trim() || !newVariant.sku.trim()) {
      setMsg('Enter variant pack size and SKU.');
      return;
    }
    const res = await authFetch(`/api/admin/products/${productId}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newVariant,
        sellingPrice: newVariant.sellingPrice === '' ? null : newVariant.sellingPrice,
      }),
    });
    if (res.ok) {
      const updatedListRes = await authFetch('/api/admin/products');
      if (updatedListRes.ok) {
        const list: Product[] = await updatedListRes.json();
        setProducts(list);
        const refreshed = list.find((p) => p.id === productId);
        if (refreshed) setEditingProduct(refreshed);
      }
      await refreshStorefront();
      setMsg('Variant added.');
    }
  };

  const handleDeleteVariant = async (productId: number, variantId: number) => {
    const res = await authFetch(`/api/admin/variants/${variantId}`, { method: 'DELETE' });
    if (res.ok) {
      const updatedListRes = await authFetch('/api/admin/products');
      if (updatedListRes.ok) {
        const list: Product[] = await updatedListRes.json();
        setProducts(list);
        const refreshed = list.find((p) => p.id === productId);
        if (refreshed) setEditingProduct(refreshed);
      }
      await refreshStorefront();
    }
  };

  if (loading) {
    return <p className="text-sm text-[#29251F]/70 py-6">Loading catalogue...</p>;
  }

  return (
    <div className="space-y-8">
      {msg && (
        <div className="p-3 bg-[#FFF7E5] border border-[#F6C629] text-xs font-medium rounded">
          {msg}
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-5">
        <h2 className="font-display text-xl font-bold text-[#29251F]">
          Tea Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="p-3.5 border border-[#29251F]/10 rounded flex items-start justify-between gap-3 bg-[#FFF7E5]/30"
            >
              <div>
                <p className="text-sm font-semibold text-[#29251F]">
                  {c.name} {!c.isActive && '(Inactive)'}
                </p>
                <p className="text-xs text-[#29251F]/65 line-clamp-2 mt-0.5">
                  {c.description}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setCatForm(c)}
                  className="p-1.5 text-[#29251F]/70 hover:text-[#B82025]"
                  aria-label="Edit category"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(c.id)}
                  className="p-1.5 text-[#29251F]/70 hover:text-[#B82025]"
                  aria-label="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSaveCategory}
          className="pt-4 border-t border-[#29251F]/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-semibold mb-1">
              {catForm.id ? 'Edit Category Name' : 'New Category Name'}
            </label>
            <input
              required
              type="text"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-[#29251F]/20 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <input
              type="text"
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-[#29251F]/20 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Image Asset</label>
            <select
              value={catForm.imageUrl}
              onChange={(e) => setCatForm({ ...catForm, imageUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-[#29251F]/20 rounded bg-white"
            >
              {AVAILABLE_STUDIO_ASSETS.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-[#B82025] rounded"
            >
              {catForm.id ? 'Update Category' : 'Add Category'}
            </button>
            {catForm.id > 0 && (
              <button
                type="button"
                onClick={() =>
                  setCatForm({
                    id: 0,
                    name: '',
                    description: '',
                    imageUrl: 'asset:ctc_dust',
                    sortOrder: 0,
                    isActive: true,
                    isDemo: false,
                  })
                }
                className="px-3 py-2 text-xs border border-[#29251F]/20 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products Section */}
      <div className="bg-white p-6 rounded-lg border border-[#29251F]/10 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-[#29251F]">
            Products &amp; Variants ({products.length})
          </h2>
          <button
            type="button"
            onClick={() =>
              setEditingProduct({
                name: '',
                sku: '',
                categoryId: categories[0]?.id ?? null,
                shortDescription: '',
                fullDescription: '',
                images: ['asset:ctc_dust'],
                ingredients: '100% Indian Black Tea',
                teaType: 'CTC Granular',
                teaOrigin: 'Assam',
                supplierReference: '',
                isFeatured: true,
                availability: 'In Stock',
                status: 'active',
                isDemo: false,
              })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#B82025] hover:bg-[#93161B] rounded"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#29251F]/15 text-[#29251F]/65">
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 pr-4">SKU / Supplier Ref</th>
                <th className="py-3 pr-4">Variants &amp; Stock</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29251F]/10">
              {products.map((p) => (
                <tr key={p.id} className="align-top">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded overflow-hidden bg-[#FFF7E5] shrink-0">
                        <SafeImage
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[#29251F]">{p.name}</p>
                        <p className="text-[#29251F]/60">
                          {p.categoryName} {p.isDemo ? '· Demo' : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 font-mono">
                    <div>{p.sku}</div>
                    <div className="text-[11px] text-[#B82025]">
                      {p.supplierReference || 'No supplier ref'}
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 space-y-1">
                    {p.variants.map((v) => (
                      <div key={v.id} className="flex items-center gap-2 tabular-nums">
                        <span className="font-medium">{v.packSize}:</span>
                        <span>
                          {v.sellingPrice !== null
                            ? formatMoney(v.sellingPrice, v.currency)
                            : 'Enquiry'}
                        </span>
                        <span className="text-[#29251F]/60">({v.stockQuantity} in stock)</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateVariant(v, { stockQuantity: v.stockQuantity + 10 })
                          }
                          className="text-[11px] text-[#B82025] underline"
                        >
                          +10 stock
                        </button>
                      </div>
                    ))}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="font-medium capitalize">{p.status}</span>
                    <div className="text-[#29251F]/60">{p.availability}</div>
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(p)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#29251F] bg-[#FFF7E5] rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#B82025] hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Editor Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#29251F]/10 pb-3">
              <h3 className="font-display text-2xl font-bold text-[#29251F]">
                {editingProduct.id ? `Edit ${editingProduct.name}` : 'Create New Tea Product'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded hover:bg-[#FFF7E5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Product Name *</label>
                  <input
                    required
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#29251F]/20 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Master SKU *</label>
                  <input
                    required
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#29251F]/20 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={editingProduct.categoryId || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#29251F]/20 rounded bg-white"
                  >
                    <option value="">Uncategorised</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Manufacturer / Supplier Reference (Admin-Only)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.supplierReference || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        supplierReference: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#29251F]/20 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Tea Type</label>
                  <input
                    type="text"
                    value={editingProduct.teaType || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, teaType: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#29251F]/20 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Tea Origin</label>
                  <input
                    type="text"
                    value={editingProduct.teaOrigin || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, teaOrigin: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#29251F]/20 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Availability</label>
                  <select
                    value={editingProduct.availability || 'In Stock'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        availability: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#29251F]/20 rounded bg-white"
                  >
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                    <option>Enquiry Only</option>
                    <option>Coming Soon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Status</label>
                  <select
                    value={editingProduct.status || 'active'}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, status: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#29251F]/20 rounded bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Ingredients</label>
                <input
                  type="text"
                  value={editingProduct.ingredients || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, ingredients: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#29251F]/20 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#29251F]/20 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.fullDescription || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      fullDescription: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#29251F]/20 rounded"
                />
              </div>

              {/* Image Upload */}
              <div className="p-3 bg-[#FFF7E5]/50 rounded border border-[#29251F]/10 space-y-2">
                <label className="block text-xs font-semibold">
                  Product Photographs ({editingProduct.images?.length || 0})
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#29251F]/20 rounded cursor-pointer hover:bg-[#FFF7E5]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const uploaded = await handleUploadImage(file);
                        if (uploaded) {
                          setEditingProduct({
                            ...editingProduct,
                            images: [...(editingProduct.images || []), uploaded],
                          });
                        }
                      }}
                    />
                  </label>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      setEditingProduct({
                        ...editingProduct,
                        images: [...(editingProduct.images || []), e.target.value],
                      });
                    }}
                    className="px-2.5 py-1.5 text-xs border border-[#29251F]/20 rounded bg-white"
                  >
                    <option value="">+ Add Studio Asset</option>
                    {AVAILABLE_STUDIO_ASSETS.map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isFeatured)}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        isFeatured: e.target.checked,
                      })
                    }
                  />
                  <span>Featured on Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isDemo)}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isDemo: e.target.checked })
                    }
                  />
                  <span>Mark as Demo Sample</span>
                </label>
              </div>

              {!editingProduct.id && (
                <div className="p-4 bg-[#FFF7E5]/40 rounded border border-[#29251F]/10 space-y-2">
                  <p className="text-xs font-semibold">Initial Pack Variant</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      placeholder="Pack size (e.g. 250g)"
                      value={newVariant.packSize}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, packSize: e.target.value })
                      }
                      className="px-2.5 py-1.5 text-xs border rounded"
                    />
                    <input
                      placeholder="Price (blank = Enquiry)"
                      value={newVariant.sellingPrice}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, sellingPrice: e.target.value })
                      }
                      className="px-2.5 py-1.5 text-xs border rounded"
                    />
                    <input
                      type="number"
                      placeholder="Net g"
                      value={newVariant.netWeightGrams}
                      onChange={(e) =>
                        setNewVariant({
                          ...newVariant,
                          netWeightGrams: Number(e.target.value),
                        })
                      }
                      className="px-2.5 py-1.5 text-xs border rounded"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={newVariant.stockQuantity}
                      onChange={(e) =>
                        setNewVariant({
                          ...newVariant,
                          stockQuantity: Number(e.target.value),
                        })
                      }
                      className="px-2.5 py-1.5 text-xs border rounded"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-xs font-semibold border border-[#29251F]/20 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#B82025] rounded"
                >
                  Save Product
                </button>
              </div>
            </form>

            {/* Manage Existing Variants */}
            {editingProduct.id && (
              <div className="pt-4 border-t border-[#29251F]/10 space-y-3">
                <h4 className="text-sm font-bold text-[#29251F]">Pack Size Variants</h4>
                <div className="space-y-2">
                  {(editingProduct.variants || []).map((v) => (
                    <div
                      key={v.id}
                      className="p-2.5 bg-[#FFF7E5]/50 rounded border border-[#29251F]/10 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <span>
                        <strong>{v.packSize}</strong> ({v.sku}) · {v.netWeightGrams}g net ·{' '}
                        {v.sellingPrice !== null ? `₹${v.sellingPrice}` : 'Enquiry'} · Stock:{' '}
                        {v.stockQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteVariant(editingProduct.id!, v.id)}
                        className="text-[#B82025] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                  <input
                    placeholder="Pack size (500g)"
                    value={newVariant.packSize}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, packSize: e.target.value })
                    }
                    className="px-2.5 py-1.5 text-xs border rounded"
                  />
                  <input
                    placeholder="Variant SKU"
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                    className="px-2.5 py-1.5 text-xs border rounded"
                  />
                  <input
                    placeholder="Price (or blank)"
                    value={newVariant.sellingPrice}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, sellingPrice: e.target.value })
                    }
                    className="px-2.5 py-1.5 text-xs border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={newVariant.stockQuantity}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        stockQuantity: Number(e.target.value),
                      })
                    }
                    className="px-2.5 py-1.5 text-xs border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddVariant(editingProduct.id!)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#29251F] rounded"
                  >
                    + Add Variant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
