import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { desc, eq } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  blogPosts,
  categories,
  contactMessages,
  orderAuditLogs,
  orders,
  products,
  productVariants,
  users,
  wholesaleEnquiries,
} from './src/db/schema.ts';
import {
  createContactMessage,
  createNewsletterSubscriber,
  createOrderFromCheckout,
  createWholesaleEnquiry,
  getAdminDashboardMetrics,
  getAdminOrders,
  getBlogPostBySlug,
  getBlogPosts,
  getCategories,
  getOrderByReference,
  getProductBySlug,
  getProducts,
  getPublicStoreSettings,
  getUserOrders,
  ORDER_STATUSES,
  updateStoreSettings,
} from './src/db/queries.ts';
import {
  optionalAuth,
  requireAdmin,
  requireAuth,
  type AuthRequest,
} from './src/middleware/auth.ts';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    cb(null, `${Date.now()}_${safeBase}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, or SVG images are allowed.'));
    }
  },
});

app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildWhatsAppMessage(
  order: {
    orderReference: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    country: string;
    stateRegion: string;
    city: string;
    postalCode: string;
    deliveryAddress: string;
    additionalInstructions: string;
    currency: string;
    subtotalAmount: string;
    shippingFee: string;
    totalAmount: string;
    hasUnpricedItems: boolean;
    shippingType: string;
  },
  items: Array<{
    productName: string;
    packSize: string;
    quantity: number;
    lineTotal: string | null;
  }>
) {
  const lines = [
    `Hello DON TRADERS, I would like to submit an order enquiry.`,
    ``,
    `Order Reference: ${order.orderReference}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Email: ${order.customerEmail}`,
    `Delivery Address: ${order.deliveryAddress}, ${order.city}, ${order.stateRegion} - ${order.postalCode}, ${order.country}`,
    ``,
    `Items Requested:`,
    ...items.map(
      (i) =>
        `- ${i.productName} (${i.packSize}) x ${i.quantity}` +
        (i.lineTotal ? ` = ${order.currency} ${i.lineTotal}` : ` (Price on Enquiry)`)
    ),
    ``,
    `Subtotal: ${order.currency} ${order.subtotalAmount}`,
    `Estimated Shipping (${order.shippingType}): ${order.currency} ${order.shippingFee}`,
    `Estimated Total: ${order.currency} ${order.totalAmount}` +
      (order.hasUnpricedItems ? ' (+ items awaiting quote)' : ''),
  ];
  if (order.additionalInstructions) {
    lines.push(``, `Notes: ${order.additionalInstructions}`);
  }
  return lines.join('\n');
}

// ---------- SEO ENDPOINTS ----------

app.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${baseUrl}/sitemap.xml\n`
  );
});

app.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(
      /\/$/,
      ''
    );
    const [activeProducts, publishedBlogs] = await Promise.all([
      getProducts({}),
      getBlogPosts(false),
    ]);

    const staticRoutes = [
      '/',
      '/shop',
      '/categories',
      '/our-story',
      '/our-sourcing',
      '/tea-origins',
      '/wholesale',
      '/blog',
      '/contact',
      '/faqs',
      '/policies/shipping',
      '/policies/returns',
      '/policies/privacy',
      '/policies/terms',
    ];

    const urls = [
      ...staticRoutes.map((r) => `${baseUrl}${r}`),
      ...activeProducts.map((p) => `${baseUrl}/product/${p.slug}`),
      ...publishedBlogs.map((b) => `${baseUrl}/blog/${b.slug}`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${u}</loc></url>`)
      .join('\n')}\n</urlset>`;

    res.type('application/xml').send(xml);
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    res.status(500).send('Unable to generate sitemap');
  }
});

// ---------- PUBLIC STOREFRONT ROUTES ----------

app.get('/api/storefront', async (_req: Request, res: Response) => {
  try {
    const [settings, activeCategories, featuredProducts, posts] = await Promise.all([
      getPublicStoreSettings(),
      getCategories(false),
      getProducts({ featuredOnly: true }),
      getBlogPosts(false),
    ]);
    res.json({
      settings,
      categories: activeCategories,
      featuredProducts,
      blogPosts: posts,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load storefront';
    res.status(500).json({ error: msg });
  }
});

app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const list = await getCategories(false);
    res.json(list);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load categories';
    res.status(500).json({ error: msg });
  }
});

app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const list = await getProducts({
      categorySlug: typeof req.query.category === 'string' ? req.query.category : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      teaType: typeof req.query.teaType === 'string' ? req.query.teaType : undefined,
      teaOrigin: typeof req.query.teaOrigin === 'string' ? req.query.teaOrigin : undefined,
      sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
    });
    res.json(list);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load products';
    res.status(500).json({ error: msg });
  }
});

app.get('/api/products/:slug', async (req: Request, res: Response) => {
  try {
    const product = await getProductBySlug(String(req.params.slug));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const related = await getProducts({
      categorySlug: product.categorySlug || undefined,
    });
    res.json({
      product,
      relatedProducts: related.filter((r) => r.id !== product.id).slice(0, 4),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load product';
    res.status(500).json({ error: msg });
  }
});

app.get('/api/blog', async (_req: Request, res: Response) => {
  try {
    const posts = await getBlogPosts(false);
    res.json(posts);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load blog posts';
    res.status(500).json({ error: msg });
  }
});

app.get('/api/blog/:slug', async (req: Request, res: Response) => {
  try {
    const post = await getBlogPostBySlug(String(req.params.slug));
    if (!post) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(post);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load article';
    res.status(500).json({ error: msg });
  }
});

app.post('/api/orders', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const requiredFields = [
      'customerName',
      'customerEmail',
      'customerPhone',
      'country',
      'stateRegion',
      'city',
      'postalCode',
      'deliveryAddress',
    ];
    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim().length === 0) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    const settings = await getPublicStoreSettings();
    const orderChannel =
      body.orderChannel === 'international_pending' || body.orderChannel === 'direct_enquiry'
        ? body.orderChannel
        : 'whatsapp';

    if (orderChannel === 'whatsapp' && (!settings || !settings.whatsappNumber.trim())) {
      return res.status(400).json({
        error:
          'WhatsApp ordering is not yet configured by the store administrator. Please use Direct Order Enquiry or configure the WhatsApp number in Admin Settings.',
      });
    }

    const { order, items } = await createOrderFromCheckout({
      userId: req.dbUser?.id ?? null,
      customerName: String(body.customerName),
      customerEmail: String(body.customerEmail),
      customerPhone: String(body.customerPhone),
      country: String(body.country),
      stateRegion: String(body.stateRegion),
      city: String(body.city),
      postalCode: String(body.postalCode),
      deliveryAddress: String(body.deliveryAddress),
      additionalInstructions: String(body.additionalInstructions || ''),
      orderChannel,
      items: body.items.map((i: { variantId: number; quantity: number }) => ({
        variantId: Number(i.variantId),
        quantity: Number(i.quantity),
      })),
    });

    const messageText = buildWhatsAppMessage(order, items);
    const cleanPhone = (settings?.whatsappNumber || '').replace(/[^0-9]/g, '');
    const whatsappUrl =
      cleanPhone.length > 0
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`
        : null;

    res.status(201).json({
      order,
      items,
      whatsappUrl,
      whatsappMessage: messageText,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create order enquiry';
    res.status(500).json({ error: msg });
  }
});

app.get('/api/orders/:reference', async (req: Request, res: Response) => {
  try {
    const order = await getOrderByReference(String(req.params.reference));
    if (!order) {
      return res.status(404).json({ error: 'Order reference not found' });
    }
    const settings = await getPublicStoreSettings();
    res.json({
      order,
      paymentConfig: {
        upiId: settings?.upiId || '',
        upiQrUrl: settings?.upiQrUrl || '',
        upiInstructions: settings?.upiInstructions || '',
        internationalPaymentActive: settings?.internationalPaymentActive ?? false,
        internationalPaymentNotice: settings?.internationalPaymentNotice || '',
        contactEmail: settings?.contactEmail || '',
        contactPhone: settings?.contactPhone || '',
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load order confirmation';
    res.status(500).json({ error: msg });
  }
});

app.post('/api/wholesale', async (req: Request, res: Response) => {
  try {
    const b = req.body;
    const reqFields = [
      'businessName',
      'contactPerson',
      'email',
      'phone',
      'country',
      'businessType',
      'productInterest',
      'requiredQuantity',
    ];
    for (const f of reqFields) {
      if (!b[f] || String(b[f]).trim().length === 0) {
        return res.status(400).json({ error: `Missing required field: ${f}` });
      }
    }
    const created = await createWholesaleEnquiry({
      businessName: String(b.businessName).trim(),
      contactPerson: String(b.contactPerson).trim(),
      email: String(b.email).trim(),
      phone: String(b.phone).trim(),
      country: String(b.country).trim(),
      businessType: String(b.businessType).trim(),
      productInterest: String(b.productInterest).trim(),
      requiredQuantity: String(b.requiredQuantity).trim(),
      additionalMessage: String(b.additionalMessage || '').trim(),
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to submit wholesale enquiry';
    res.status(500).json({ error: msg });
  }
});

app.post('/api/newsletter', async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email || '').trim();
    const consent = Boolean(req.body.consentGiven);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!consent) {
      return res.status(400).json({ error: 'Please confirm consent to receive email updates.' });
    }
    const sub = await createNewsletterSubscriber(email, consent);
    res.status(201).json(sub);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to subscribe';
    res.status(500).json({ error: msg });
  }
});

app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Please complete all required contact fields.' });
    }
    const created = await createContactMessage({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || '').trim(),
      subject: String(subject).trim(),
      message: String(message).trim(),
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to send message';
    res.status(500).json({ error: msg });
  }
});

// International Payment Webhook Architecture (Inactive until configured & approved)
app.post('/api/payments/international/webhook', async (_req: Request, res: Response) => {
  try {
    const settings = await getPublicStoreSettings();
    if (!settings?.internationalPaymentActive) {
      return res.status(503).json({
        error:
          'International payment gateway is inactive. Enable and configure an approved provider before accepting webhook events.',
      });
    }
    return res.status(501).json({
      error: 'Provider-specific signature verification must be configured prior to live activation.',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Webhook handling error';
    res.status(500).json({ error: msg });
  }
});

// ---------- AUTHENTICATED USER ROUTES ----------

app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.dbUser });
});

app.get('/api/my-orders', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const list = await getUserOrders(req.dbUser.id);
    res.json(list);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load orders';
    res.status(500).json({ error: msg });
  }
});

// ---------- ADMIN DASHBOARD ROUTES ----------

app.post(
  '/api/admin/upload',
  requireAdmin,
  upload.single('file'),
  (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }
    res.status(201).json({
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    });
  }
);

app.get('/api/admin/dashboard', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const [metrics, recentOrders, enquiries, contacts] = await Promise.all([
      getAdminDashboardMetrics(),
      getAdminOrders({}),
      db.select().from(wholesaleEnquiries).orderBy(desc(wholesaleEnquiries.createdAt)),
      db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)),
    ]);
    res.json({
      metrics,
      recentOrders: recentOrders.slice(0, 10),
      enquiriesCount: enquiries.length,
      contactsCount: contacts.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load admin dashboard';
    res.status(500).json({ error: msg });
  }
});

// Admin Products & Variants
app.get('/api/admin/products', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const list = await getProducts({ includeAdminFields: true, includeInactive: true });
    res.json(list);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load products';
    res.status(500).json({ error: msg });
  }
});

app.post('/api/admin/products', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body;
    if (!b.name?.trim() || !b.sku?.trim()) {
      return res.status(400).json({ error: 'Product name and SKU are required.' });
    }
    const prodSlug = b.slug?.trim() ? slugify(b.slug) : slugify(b.name);
    const [created] = await db
      .insert(products)
      .values({
        name: String(b.name).trim(),
        slug: prodSlug,
        sku: String(b.sku).trim(),
        categoryId: b.categoryId ? Number(b.categoryId) : null,
        shortDescription: String(b.shortDescription || '').trim(),
        fullDescription: String(b.fullDescription || '').trim(),
        images: Array.isArray(b.images) ? b.images : [],
        ingredients: String(b.ingredients || '').trim(),
        teaType: String(b.teaType || '').trim(),
        teaOrigin: String(b.teaOrigin || '').trim(),
        supplierReference: String(b.supplierReference || '').trim(),
        isFeatured: Boolean(b.isFeatured),
        availability: String(b.availability || 'In Stock'),
        status: String(b.status || 'active'),
        isDemo: Boolean(b.isDemo),
      })
      .returning();

    if (Array.isArray(b.variants) && b.variants.length > 0) {
      await db.insert(productVariants).values(
        b.variants.map(
          (v: {
            sku: string;
            packSize: string;
            netWeightGrams: number;
            shippingWeightGrams: number;
            sellingPrice: string | number | null;
            currency?: string;
            stockQuantity: number;
            isActive?: boolean;
          }) => ({
            productId: created.id,
            sku: String(v.sku || `${created.sku}-${slugify(v.packSize)}`).trim(),
            packSize: String(v.packSize).trim(),
            netWeightGrams: Number(v.netWeightGrams) || 250,
            shippingWeightGrams: Number(v.shippingWeightGrams) || 280,
            sellingPrice:
              v.sellingPrice === '' || v.sellingPrice === null || v.sellingPrice === undefined
                ? null
                : Number(v.sellingPrice).toFixed(2),
            currency: String(v.currency || 'INR'),
            stockQuantity: Number(v.stockQuantity) || 0,
            isActive: v.isActive !== false,
          })
        )
      );
    }

    res.status(201).json(created);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create product';
    res.status(500).json({ error: msg });
  }
});

app.put('/api/admin/products/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const b = req.body;
    const [updated] = await db
      .update(products)
      .set({
        name: b.name !== undefined ? String(b.name).trim() : undefined,
        slug: b.slug !== undefined ? slugify(String(b.slug)) : undefined,
        sku: b.sku !== undefined ? String(b.sku).trim() : undefined,
        categoryId: b.categoryId !== undefined ? (b.categoryId ? Number(b.categoryId) : null) : undefined,
        shortDescription:
          b.shortDescription !== undefined ? String(b.shortDescription).trim() : undefined,
        fullDescription:
          b.fullDescription !== undefined ? String(b.fullDescription).trim() : undefined,
        images: Array.isArray(b.images) ? b.images : undefined,
        ingredients: b.ingredients !== undefined ? String(b.ingredients).trim() : undefined,
        teaType: b.teaType !== undefined ? String(b.teaType).trim() : undefined,
        teaOrigin: b.teaOrigin !== undefined ? String(b.teaOrigin).trim() : undefined,
        supplierReference:
          b.supplierReference !== undefined ? String(b.supplierReference).trim() : undefined,
        isFeatured: b.isFeatured !== undefined ? Boolean(b.isFeatured) : undefined,
        availability: b.availability !== undefined ? String(b.availability) : undefined,
        status: b.status !== undefined ? String(b.status) : undefined,
        isDemo: b.isDemo !== undefined ? Boolean(b.isDemo) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update product';
    res.status(500).json({ error: msg });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await db.delete(products).where(eq(products.id, id));
    res.json({ deleted: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete product';
    res.status(500).json({ error: msg });
  }
});

app.post('/api/admin/products/:id/variants', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const productId = Number(req.params.id);
    const v = req.body;
    const [created] = await db
      .insert(productVariants)
      .values({
        productId,
        sku: String(v.sku).trim(),
        packSize: String(v.packSize).trim(),
        netWeightGrams: Number(v.netWeightGrams) || 250,
        shippingWeightGrams: Number(v.shippingWeightGrams) || 280,
        sellingPrice:
          v.sellingPrice === '' || v.sellingPrice === null || v.sellingPrice === undefined
            ? null
            : Number(v.sellingPrice).toFixed(2),
        currency: String(v.currency || 'INR'),
        stockQuantity: Number(v.stockQuantity) || 0,
        isActive: v.isActive !== false,
      })
      .returning();
    res.status(201).json(created);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create variant';
    res.status(500).json({ error: msg });
  }
});

app.put('/api/admin/variants/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const v = req.body;
    const [updated] = await db
      .update(productVariants)
      .set({
        sku: v.sku !== undefined ? String(v.sku).trim() : undefined,
        packSize: v.packSize !== undefined ? String(v.packSize).trim() : undefined,
        netWeightGrams: v.netWeightGrams !== undefined ? Number(v.netWeightGrams) : undefined,
        shippingWeightGrams:
          v.shippingWeightGrams !== undefined ? Number(v.shippingWeightGrams) : undefined,
        sellingPrice:
          v.sellingPrice === undefined
            ? undefined
            : v.sellingPrice === '' || v.sellingPrice === null
              ? null
              : Number(v.sellingPrice).toFixed(2),
        currency: v.currency !== undefined ? String(v.currency) : undefined,
        stockQuantity: v.stockQuantity !== undefined ? Number(v.stockQuantity) : undefined,
        isActive: v.isActive !== undefined ? Boolean(v.isActive) : undefined,
      })
      .where(eq(productVariants.id, id))
      .returning();
    res.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update variant';
    res.status(500).json({ error: msg });
  }
});

app.delete('/api/admin/variants/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await db.delete(productVariants).where(eq(productVariants.id, id));
    res.json({ deleted: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete variant';
    res.status(500).json({ error: msg });
  }
});

// Admin Categories
app.get('/api/admin/categories', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const list = await getCategories(true);
    res.json(list);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load categories';
    res.status(500).json({ error: msg });
  }
});

app.post('/api/admin/categories', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body;
    if (!b.name?.trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }
    const [created] = await db
      .insert(categories)
      .values({
        name: String(b.name).trim(),
        slug: b.slug?.trim() ? slugify(b.slug) : slugify(b.name),
        description: String(b.description || '').trim(),
        imageUrl: String(b.imageUrl || 'asset:ctc_dust'),
        sortOrder: Number(b.sortOrder) || 0,
        isActive: b.isActive !== false,
        isDemo: Boolean(b.isDemo),
      })
      .returning();
    res.status(201).json(created);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create category';
    res.status(500).json({ error: msg });
  }
});

app.put('/api/admin/categories/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const b = req.body;
    const [updated] = await db
      .update(categories)
      .set({
        name: b.name !== undefined ? String(b.name).trim() : undefined,
        slug: b.slug !== undefined ? slugify(String(b.slug)) : undefined,
        description: b.description !== undefined ? String(b.description).trim() : undefined,
        imageUrl: b.imageUrl !== undefined ? String(b.imageUrl) : undefined,
        sortOrder: b.sortOrder !== undefined ? Number(b.sortOrder) : undefined,
        isActive: b.isActive !== undefined ? Boolean(b.isActive) : undefined,
        isDemo: b.isDemo !== undefined ? Boolean(b.isDemo) : undefined,
      })
      .where(eq(categories.id, id))
      .returning();
    res.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update category';
    res.status(500).json({ error: msg });
  }
});

app.delete('/api/admin/categories/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await db.delete(categories).where(eq(categories.id, id));
    res.json({ deleted: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete category';
    res.status(500).json({ error: msg });
  }
});

// Admin Orders & Audit Trail
app.get('/api/admin/orders', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const list = await getAdminOrders({
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      country: typeof req.query.country === 'string' ? req.query.country : undefined,
      paymentStatus:
        typeof req.query.paymentStatus === 'string' ? req.query.paymentStatus : undefined,
      orderStatus: typeof req.query.orderStatus === 'string' ? req.query.orderStatus : undefined,
      dateFrom: typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined,
      dateTo: typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined,
    });
    res.json(list);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load orders';
    res.status(500).json({ error: msg });
  }
});

app.put('/api/admin/orders/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existingRows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const existing = existingRows[0];
    const b = req.body;

    if (b.orderStatus && !ORDER_STATUSES.includes(b.orderStatus)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    const [updated] = await db
      .update(orders)
      .set({
        orderStatus: b.orderStatus !== undefined ? String(b.orderStatus) : existing.orderStatus,
        paymentStatus:
          b.paymentStatus !== undefined ? String(b.paymentStatus) : existing.paymentStatus,
        paymentReference:
          b.paymentReference !== undefined ? String(b.paymentReference) : existing.paymentReference,
        courierName: b.courierName !== undefined ? String(b.courierName) : existing.courierName,
        trackingNumber:
          b.trackingNumber !== undefined ? String(b.trackingNumber) : existing.trackingNumber,
        trackingUrl: b.trackingUrl !== undefined ? String(b.trackingUrl) : existing.trackingUrl,
        dispatchDate: b.dispatchDate !== undefined ? String(b.dispatchDate) : existing.dispatchDate,
        deliveryStatus:
          b.deliveryStatus !== undefined ? String(b.deliveryStatus) : existing.deliveryStatus,
        shippingFee:
          b.shippingFee !== undefined ? Number(b.shippingFee).toFixed(2) : existing.shippingFee,
        totalAmount:
          b.shippingFee !== undefined
            ? (Number(existing.subtotalAmount) + Number(b.shippingFee)).toFixed(2)
            : existing.totalAmount,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    const actorEmail = req.dbUser?.email || 'admin';
    const logsToInsert: Array<typeof orderAuditLogs.$inferInsert> = [];

    if (b.orderStatus && b.orderStatus !== existing.orderStatus) {
      logsToInsert.push({
        orderId: id,
        actorEmail,
        action: 'Order Status Updated',
        previousValue: existing.orderStatus,
        newValue: String(b.orderStatus),
        notes: String(b.auditNote || ''),
      });
    }
    if (b.paymentStatus && b.paymentStatus !== existing.paymentStatus) {
      logsToInsert.push({
        orderId: id,
        actorEmail,
        action: 'Payment Status Updated',
        previousValue: existing.paymentStatus,
        newValue: String(b.paymentStatus),
        notes: b.paymentReference ? `Ref: ${b.paymentReference}` : String(b.auditNote || ''),
      });
    }
    if (b.trackingNumber && b.trackingNumber !== existing.trackingNumber) {
      logsToInsert.push({
        orderId: id,
        actorEmail,
        action: 'Tracking Updated',
        previousValue: existing.trackingNumber,
        newValue: String(b.trackingNumber),
        notes: b.courierName ? `Courier: ${b.courierName}` : '',
      });
    }

    if (logsToInsert.length > 0) {
      await db.insert(orderAuditLogs).values(logsToInsert);
    }

    res.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update order';
    res.status(500).json({ error: msg });
  }
});

// Admin Store & Content Settings
app.get('/api/admin/settings', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const settings = await getPublicStoreSettings();
    res.json(settings);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load settings';
    res.status(500).json({ error: msg });
  }
});

app.put('/api/admin/settings', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body;
    const updated = await updateStoreSettings({
      businessName: b.businessName,
      tagline: b.tagline,
      logoUrl: b.logoUrl,
      whatsappNumber: b.whatsappNumber,
      upiId: b.upiId,
      upiQrUrl: b.upiQrUrl,
      upiInstructions: b.upiInstructions,
      contactEmail: b.contactEmail,
      contactPhone: b.contactPhone,
      businessAddress: b.businessAddress,
      defaultCurrency: b.defaultCurrency,
      supportedCurrencies: b.supportedCurrencies,
      internationalPaymentActive: b.internationalPaymentActive,
      internationalPaymentProvider: b.internationalPaymentProvider,
      internationalPaymentNotice: b.internationalPaymentNotice,
      announcements: b.announcements,
      socialLinks: b.socialLinks,
      domesticShipping: b.domesticShipping,
      internationalShippingCountries: b.internationalShippingCountries,
      cmsContent: b.cmsContent,
    });
    res.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update settings';
    res.status(500).json({ error: msg });
  }
});

// Admin Blog Posts
app.get('/api/admin/blog', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const list = await getBlogPosts(true);
    res.json(list);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load blog posts';
    res.status(500).json({ error: msg });
  }
});

app.post('/api/admin/blog', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body;
    if (!b.title?.trim()) {
      return res.status(400).json({ error: 'Article title is required.' });
    }
    const [created] = await db
      .insert(blogPosts)
      .values({
        title: String(b.title).trim(),
        slug: b.slug?.trim() ? slugify(b.slug) : slugify(b.title),
        category: String(b.category || 'Tea Knowledge').trim(),
        excerpt: String(b.excerpt || '').trim(),
        content: String(b.content || '').trim(),
        imageUrl: String(b.imageUrl || 'asset:tasting'),
        readTimeMinutes: Number(b.readTimeMinutes) || 4,
        isPublished: b.isPublished !== false,
        isDemo: Boolean(b.isDemo),
        publishedAt: String(b.publishedAt || new Date().toISOString().slice(0, 10)),
      })
      .returning();
    res.status(201).json(created);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create article';
    res.status(500).json({ error: msg });
  }
});

app.put('/api/admin/blog/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const b = req.body;
    const [updated] = await db
      .update(blogPosts)
      .set({
        title: b.title !== undefined ? String(b.title).trim() : undefined,
        slug: b.slug !== undefined ? slugify(String(b.slug)) : undefined,
        category: b.category !== undefined ? String(b.category).trim() : undefined,
        excerpt: b.excerpt !== undefined ? String(b.excerpt).trim() : undefined,
        content: b.content !== undefined ? String(b.content).trim() : undefined,
        imageUrl: b.imageUrl !== undefined ? String(b.imageUrl) : undefined,
        readTimeMinutes: b.readTimeMinutes !== undefined ? Number(b.readTimeMinutes) : undefined,
        isPublished: b.isPublished !== undefined ? Boolean(b.isPublished) : undefined,
        isDemo: b.isDemo !== undefined ? Boolean(b.isDemo) : undefined,
        publishedAt: b.publishedAt !== undefined ? String(b.publishedAt) : undefined,
      })
      .where(eq(blogPosts.id, id))
      .returning();
    res.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update article';
    res.status(500).json({ error: msg });
  }
});

app.delete('/api/admin/blog/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    res.json({ deleted: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete article';
    res.status(500).json({ error: msg });
  }
});

// Admin Enquiries, Contacts, Users
app.get('/api/admin/enquiries', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const list = await db
      .select()
      .from(wholesaleEnquiries)
      .orderBy(desc(wholesaleEnquiries.createdAt));
    res.json(list);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load wholesale enquiries';
    res.status(500).json({ error: msg });
  }
});

app.put('/api/admin/enquiries/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db
      .update(wholesaleEnquiries)
      .set({ status: String(req.body.status || 'Reviewed') })
      .where(eq(wholesaleEnquiries.id, id))
      .returning();
    res.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update enquiry';
    res.status(500).json({ error: msg });
  }
});

app.get('/api/admin/contacts', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const list = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
    res.json(list);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load contact messages';
    res.status(500).json({ error: msg });
  }
});

app.put('/api/admin/contacts/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db
      .update(contactMessages)
      .set({ status: String(req.body.status || 'Reviewed') })
      .where(eq(contactMessages.id, id))
      .returning();
    res.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update contact message';
    res.status(500).json({ error: msg });
  }
});

app.get('/api/admin/users', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const list = await db.select().from(users).orderBy(users.id);
    res.json(list);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load users';
    res.status(500).json({ error: msg });
  }
});

app.put('/api/admin/users/:id/role', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const role = req.body.role === 'admin' ? 'admin' : 'customer';
    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    res.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update user role';
    res.status(500).json({ error: msg });
  }
});

// ---------- VITE / STATIC SPA SERVING ----------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DON TRADERS server listening on port ${PORT}`);
  });
}

startServer();
