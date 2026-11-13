import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { db } from './index.ts';
import {
  blogPosts,
  categories,
  contactMessages,
  newsletterSubscribers,
  orderAuditLogs,
  orderItems,
  orders,
  products,
  productVariants,
  storeSettings,
  users,
  wholesaleEnquiries,
} from './schema.ts';
import { ensureSeedData } from './seed.ts';

export const ORDER_STATUSES = [
  'New Enquiry',
  'Awaiting Payment',
  'Payment Under Verification',
  'Payment Confirmed',
  'Processing',
  'Dispatched',
  'Delivered',
  'Cancelled',
  'Refunded',
] as const;

export async function getPublicStoreSettings() {
  try {
    await ensureSeedData();
    const rows = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.id, 1))
      .limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database query failed (getPublicStoreSettings):', error);
    throw new Error('Failed to load store configuration.', { cause: error });
  }
}

export async function updateStoreSettings(patch: Partial<typeof storeSettings.$inferInsert>) {
  try {
    await ensureSeedData();
    const updated = await db
      .update(storeSettings)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(storeSettings.id, 1))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed (updateStoreSettings):', error);
    throw new Error('Failed to update store settings.', { cause: error });
  }
}

export async function getCategories(includeInactive = false) {
  try {
    await ensureSeedData();
    const query = includeInactive
      ? db.select().from(categories).orderBy(categories.sortOrder, categories.id)
      : db
          .select()
          .from(categories)
          .where(eq(categories.isActive, true))
          .orderBy(categories.sortOrder, categories.id);
    return await query;
  } catch (error) {
    console.error('Database query failed (getCategories):', error);
    throw new Error('Failed to load categories.', { cause: error });
  }
}

export async function getProducts(options: {
  includeAdminFields?: boolean;
  includeInactive?: boolean;
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  teaType?: string;
  teaOrigin?: string;
  sort?: string;
}) {
  try {
    await ensureSeedData();
    const cats = await db.select().from(categories);
    const catById = new Map(cats.map((c) => [c.id, c]));

    const conditions = [];
    if (!options.includeInactive) {
      conditions.push(eq(products.status, 'active'));
    }
    if (options.featuredOnly) {
      conditions.push(eq(products.isFeatured, true));
    }
    if (options.categorySlug && options.categorySlug !== 'all') {
      const targetCat = cats.find((c) => c.slug === options.categorySlug);
      if (targetCat) {
        conditions.push(eq(products.categoryId, targetCat.id));
      } else {
        return [];
      }
    }
    if (options.teaType && options.teaType !== 'all') {
      conditions.push(eq(products.teaType, options.teaType));
    }
    if (options.teaOrigin && options.teaOrigin !== 'all') {
      conditions.push(eq(products.teaOrigin, options.teaOrigin));
    }
    if (options.search && options.search.trim()) {
      const term = `%${options.search.trim()}%`;
      conditions.push(
        or(
          ilike(products.name, term),
          ilike(products.shortDescription, term),
          ilike(products.teaType, term),
          ilike(products.teaOrigin, term)
        )
      );
    }

    const prodRows = await db
      .select()
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(products.isFeatured), products.id);

    if (prodRows.length === 0) return [];

    const prodIds = prodRows.map((p) => p.id);
    const variantRows = await db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.productId, prodIds))
      .orderBy(productVariants.netWeightGrams, productVariants.id);

    const variantsByProduct = new Map<number, typeof variantRows>();
    for (const v of variantRows) {
      if (!options.includeInactive && !v.isActive) continue;
      const arr = variantsByProduct.get(v.productId) ?? [];
      arr.push(v);
      variantsByProduct.set(v.productId, arr);
    }

    const mapped = prodRows.map((p) => {
      const cat = p.categoryId ? catById.get(p.categoryId) ?? null : null;
      const pVariants = variantsByProduct.get(p.id) ?? [];
      const priced = pVariants
        .map((v) => (v.sellingPrice !== null ? Number(v.sellingPrice) : null))
        .filter((n): n is number => n !== null && !Number.isNaN(n));
      const startingPrice = priced.length > 0 ? Math.min(...priced) : null;

      const base = {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        categoryId: p.categoryId,
        categoryName: cat?.name ?? 'Uncategorised',
        categorySlug: cat?.slug ?? '',
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        images: p.images,
        ingredients: p.ingredients,
        teaType: p.teaType,
        teaOrigin: p.teaOrigin,
        isFeatured: p.isFeatured,
        availability: p.availability,
        status: p.status,
        isDemo: p.isDemo,
        startingPrice,
        currency: pVariants[0]?.currency ?? 'INR',
        variants: pVariants,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };

      if (options.includeAdminFields) {
        return { ...base, supplierReference: p.supplierReference };
      }
      return base;
    });

    if (options.sort === 'price_asc') {
      mapped.sort((a, b) => (a.startingPrice ?? 9999999) - (b.startingPrice ?? 9999999));
    } else if (options.sort === 'price_desc') {
      mapped.sort((a, b) => (b.startingPrice ?? -1) - (a.startingPrice ?? -1));
    } else if (options.sort === 'name_asc') {
      mapped.sort((a, b) => a.name.localeCompare(b.name));
    }

    return mapped;
  } catch (error) {
    console.error('Database query failed (getProducts):', error);
    throw new Error('Failed to load products.', { cause: error });
  }
}

export async function getProductBySlug(slug: string, includeAdminFields = false) {
  try {
    await ensureSeedData();
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.status, 'active')))
      .limit(1);
    if (rows.length === 0) return null;

    const p = rows[0];
    const cats = p.categoryId
      ? await db.select().from(categories).where(eq(categories.id, p.categoryId)).limit(1)
      : [];
    const variants = await db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.productId, p.id), eq(productVariants.isActive, true)))
      .orderBy(productVariants.netWeightGrams, productVariants.id);

    const priced = variants
      .map((v) => (v.sellingPrice !== null ? Number(v.sellingPrice) : null))
      .filter((n): n is number => n !== null && !Number.isNaN(n));
    const startingPrice = priced.length > 0 ? Math.min(...priced) : null;

    const base = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      categoryId: p.categoryId,
      categoryName: cats[0]?.name ?? 'Uncategorised',
      categorySlug: cats[0]?.slug ?? '',
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      images: p.images,
      ingredients: p.ingredients,
      teaType: p.teaType,
      teaOrigin: p.teaOrigin,
      isFeatured: p.isFeatured,
      availability: p.availability,
      status: p.status,
      isDemo: p.isDemo,
      startingPrice,
      currency: variants[0]?.currency ?? 'INR',
      variants,
    };

    return includeAdminFields ? { ...base, supplierReference: p.supplierReference } : base;
  } catch (error) {
    console.error('Database query failed (getProductBySlug):', error);
    throw new Error('Failed to load product details.', { cause: error });
  }
}

export async function createOrderFromCheckout(input: {
  userId: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  country: string;
  stateRegion: string;
  city: string;
  postalCode: string;
  deliveryAddress: string;
  additionalInstructions: string;
  orderChannel: 'whatsapp' | 'international_pending' | 'direct_enquiry';
  items: Array<{ variantId: number; quantity: number }>;
}) {
  try {
    await ensureSeedData();
    const settings = await getPublicStoreSettings();
    if (!settings) {
      throw new Error('Store settings unavailable.');
    }

    const variantIds = input.items.map((i) => i.variantId);
    const variantRows = await db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.id, variantIds));

    if (variantRows.length === 0) {
      throw new Error('No valid product variants selected.');
    }

    const productIds = [...new Set(variantRows.map((v) => v.productId))];
    const productRows = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const variantMap = new Map(variantRows.map((v) => [v.id, v]));
    const productMap = new Map(productRows.map((p) => [p.id, p]));

    let subtotal = 0;
    let totalWeightGrams = 0;
    let hasUnpricedItems = false;
    const currency = settings.defaultCurrency || 'INR';

    const resolvedItems: Array<{
      productId: number;
      variantId: number;
      productName: string;
      sku: string;
      packSize: string;
      quantity: number;
      unitPrice: string | null;
      lineTotal: string | null;
      shippingWeightGrams: number;
    }> = [];

    for (const reqItem of input.items) {
      const variant = variantMap.get(reqItem.variantId);
      if (!variant) continue;
      const product = productMap.get(variant.productId);
      if (!product) continue;

      const qty = Math.max(1, Math.min(500, Math.floor(reqItem.quantity)));
      const weight = variant.shippingWeightGrams * qty;
      totalWeightGrams += weight;

      if (variant.sellingPrice === null) {
        hasUnpricedItems = true;
        resolvedItems.push({
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          sku: variant.sku,
          packSize: variant.packSize,
          quantity: qty,
          unitPrice: null,
          lineTotal: null,
          shippingWeightGrams: weight,
        });
      } else {
        const unit = Number(variant.sellingPrice);
        const line = unit * qty;
        subtotal += line;
        resolvedItems.push({
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          sku: variant.sku,
          packSize: variant.packSize,
          quantity: qty,
          unitPrice: unit.toFixed(2),
          lineTotal: line.toFixed(2),
          shippingWeightGrams: weight,
        });
      }
    }

    if (resolvedItems.length === 0) {
      throw new Error('Could not resolve any cart items.');
    }

    const isIndia = input.country.trim().toLowerCase() === 'india';
    let shippingFee = 0;
    let courierName = '';
    let deliveryStatus = 'Pending Confirmation';

    if (isIndia) {
      const dom = settings.domesticShipping;
      if (dom.enabled) {
        shippingFee = subtotal >= dom.minOrderValue && dom.minOrderValue > 0 ? 0 : dom.flatFee;
      }
      courierName = 'Don Traders Domestic Delivery';
    } else {
      const matchedCountry = settings.internationalShippingCountries.find(
        (c) =>
          c.countryName.toLowerCase() === input.country.trim().toLowerCase() ||
          c.countryCode.toLowerCase() === input.country.trim().toLowerCase()
      );
      if (matchedCountry && matchedCountry.active) {
        const weightKg = Math.max(0.5, totalWeightGrams / 1000);
        shippingFee = Math.round(matchedCountry.baseFee + matchedCountry.perKgFee * weightKg);
        courierName = matchedCountry.courierName;
      } else {
        deliveryStatus = 'Awaiting Destination & Export Confirmation';
      }
    }

    const total = subtotal + shippingFee;
    const nowPart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const orderReference = `DT-${nowPart}-${randPart}`;

    const [createdOrder] = await db
      .insert(orders)
      .values({
        orderReference,
        userId: input.userId,
        customerName: input.customerName.trim(),
        customerEmail: input.customerEmail.trim(),
        customerPhone: input.customerPhone.trim(),
        country: input.country.trim(),
        stateRegion: input.stateRegion.trim(),
        city: input.city.trim(),
        postalCode: input.postalCode.trim(),
        deliveryAddress: input.deliveryAddress.trim(),
        additionalInstructions: input.additionalInstructions.trim(),
        currency,
        subtotalAmount: subtotal.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        totalAmount: total.toFixed(2),
        totalWeightGrams,
        hasUnpricedItems,
        orderChannel: input.orderChannel,
        orderStatus: 'New Enquiry',
        paymentMethod: isIndia ? 'upi_manual' : 'international_card_inactive',
        paymentStatus: 'pending',
        shippingType: isIndia ? 'domestic' : 'international',
        courierName,
        deliveryStatus,
      })
      .returning();

    await db.insert(orderItems).values(
      resolvedItems.map((item) => ({
        orderId: createdOrder.id,
        ...item,
      }))
    );

    await db.insert(orderAuditLogs).values({
      orderId: createdOrder.id,
      actorEmail: input.customerEmail.trim(),
      action: 'Order Enquiry Created',
      previousValue: '',
      newValue: 'New Enquiry',
      notes: `Channel: ${input.orderChannel}. Shipping: ${isIndia ? 'Domestic' : 'International'}.`,
    });

    return {
      order: createdOrder,
      items: resolvedItems,
    };
  } catch (error) {
    console.error('Database query failed (createOrderFromCheckout):', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to save order enquiry.',
      { cause: error }
    );
  }
}

export async function getOrderByReference(reference: string) {
  try {
    await ensureSeedData();
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.orderReference, reference))
      .limit(1);
    if (rows.length === 0) return null;

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, rows[0].id));

    return { ...rows[0], items };
  } catch (error) {
    console.error('Database query failed (getOrderByReference):', error);
    throw new Error('Failed to load order details.', { cause: error });
  }
}

export async function getUserOrders(userId: number) {
  try {
    await ensureSeedData();
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    if (rows.length === 0) return [];
    const orderIds = rows.map((r) => r.id);
    const items = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const itemsByOrder = new Map<number, typeof items>();
    for (const item of items) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    return rows.map((o) => ({
      ...o,
      items: itemsByOrder.get(o.id) ?? [],
    }));
  } catch (error) {
    console.error('Database query failed (getUserOrders):', error);
    throw new Error('Failed to load your order enquiries.', { cause: error });
  }
}

export async function getAdminOrders(filters: {
  search?: string;
  country?: string;
  paymentStatus?: string;
  orderStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  try {
    await ensureSeedData();
    const conditions = [];
    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(orders.orderReference, term),
          ilike(orders.customerName, term),
          ilike(orders.customerEmail, term),
          ilike(orders.customerPhone, term)
        )
      );
    }
    if (filters.country && filters.country !== 'all') {
      conditions.push(eq(orders.country, filters.country));
    }
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
    }
    if (filters.orderStatus && filters.orderStatus !== 'all') {
      conditions.push(eq(orders.orderStatus, filters.orderStatus));
    }

    const orderRows = await db
      .select()
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt));

    const filteredByDate = orderRows.filter((o) => {
      if (!o.createdAt) return true;
      const isoDate = o.createdAt.toISOString().slice(0, 10);
      if (filters.dateFrom && isoDate < filters.dateFrom) return false;
      if (filters.dateTo && isoDate > filters.dateTo) return false;
      return true;
    });

    if (filteredByDate.length === 0) return [];
    const orderIds = filteredByDate.map((o) => o.id);
    const [items, logs] = await Promise.all([
      db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds)),
      db
        .select()
        .from(orderAuditLogs)
        .where(inArray(orderAuditLogs.orderId, orderIds))
        .orderBy(desc(orderAuditLogs.createdAt)),
    ]);

    const itemsByOrder = new Map<number, typeof items>();
    for (const item of items) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    const logsByOrder = new Map<number, typeof logs>();
    for (const log of logs) {
      const list = logsByOrder.get(log.orderId) ?? [];
      list.push(log);
      logsByOrder.set(log.orderId, list);
    }

    return filteredByDate.map((o) => ({
      ...o,
      items: itemsByOrder.get(o.id) ?? [],
      auditLogs: logsByOrder.get(o.id) ?? [],
    }));
  } catch (error) {
    console.error('Database query failed (getAdminOrders):', error);
    throw new Error('Failed to load orders.', { cause: error });
  }
}

export async function getAdminDashboardMetrics() {
  try {
    await ensureSeedData();
    const [allOrders, allProducts, allVariants, wholesaleCountRows, contactCountRows] =
      await Promise.all([
        db.select().from(orders),
        db.select().from(products),
        db.select().from(productVariants),
        db.select({ count: sql<number>`count(*)::int` }).from(wholesaleEnquiries),
        db.select({ count: sql<number>`count(*)::int` }).from(contactMessages),
      ]);

    const statusCounts: Record<string, number> = {};
    for (const status of ORDER_STATUSES) {
      statusCounts[status] = 0;
    }
    for (const o of allOrders) {
      statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] ?? 0) + 1;
    }

    const lowStockVariants = allVariants.filter((v) => v.isActive && v.stockQuantity <= 15);
    const lowStockProductIds = new Set(lowStockVariants.map((v) => v.productId));

    return {
      totalOrders: allOrders.length,
      newEnquiries: statusCounts['New Enquiry'] ?? 0,
      awaitingPayment: statusCounts['Awaiting Payment'] ?? 0,
      underVerification: statusCounts['Payment Under Verification'] ?? 0,
      confirmedPayments: statusCounts['Payment Confirmed'] ?? 0,
      processingOrders: statusCounts['Processing'] ?? 0,
      dispatchedOrders: statusCounts['Dispatched'] ?? 0,
      deliveredOrders: statusCounts['Delivered'] ?? 0,
      cancelledOrders: statusCounts['Cancelled'] ?? 0,
      refundedOrders: statusCounts['Refunded'] ?? 0,
      totalActiveProducts: allProducts.filter((p) => p.status === 'active').length,
      lowStockProducts: lowStockProductIds.size,
      wholesaleEnquiriesCount: wholesaleCountRows[0]?.count ?? 0,
      contactMessagesCount: contactCountRows[0]?.count ?? 0,
    };
  } catch (error) {
    console.error('Database query failed (getAdminDashboardMetrics):', error);
    throw new Error('Failed to load dashboard metrics.', { cause: error });
  }
}

export async function getBlogPosts(includeUnpublished = false) {
  try {
    await ensureSeedData();
    return includeUnpublished
      ? await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt), blogPosts.id)
      : await db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.isPublished, true))
          .orderBy(desc(blogPosts.publishedAt), blogPosts.id);
  } catch (error) {
    console.error('Database query failed (getBlogPosts):', error);
    throw new Error('Failed to load blog articles.', { cause: error });
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    await ensureSeedData();
    const rows = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)))
      .limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database query failed (getBlogPostBySlug):', error);
    throw new Error('Failed to load article.', { cause: error });
  }
}

export async function createWholesaleEnquiry(data: {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  businessType: string;
  productInterest: string;
  requiredQuantity: string;
  additionalMessage: string;
}) {
  try {
    await ensureSeedData();
    const referenceCode = `DT-B2B-${Math.floor(100000 + Math.random() * 900000)}`;
    const [inserted] = await db
      .insert(wholesaleEnquiries)
      .values({
        referenceCode,
        ...data,
      })
      .returning();
    return inserted;
  } catch (error) {
    console.error('Database query failed (createWholesaleEnquiry):', error);
    throw new Error('Failed to submit wholesale enquiry.', { cause: error });
  }
}

export async function createNewsletterSubscriber(email: string, consentGiven: boolean) {
  try {
    await ensureSeedData();
    const normalized = email.trim().toLowerCase();
    const [inserted] = await db
      .insert(newsletterSubscribers)
      .values({ email: normalized, consentGiven })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: { consentGiven },
      })
      .returning();
    return inserted;
  } catch (error) {
    console.error('Database query failed (createNewsletterSubscriber):', error);
    throw new Error('Failed to subscribe to newsletter.', { cause: error });
  }
}

export async function createContactMessage(data: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  try {
    await ensureSeedData();
    const [inserted] = await db.insert(contactMessages).values(data).returning();
    return inserted;
  } catch (error) {
    console.error('Database query failed (createContactMessage):', error);
    throw new Error('Failed to submit contact message.', { cause: error });
  }
}
