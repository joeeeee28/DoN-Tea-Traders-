import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').default(''),
  role: text('role').notNull().default('customer'), // 'admin' | 'customer'
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull().default(''),
  imageUrl: text('image_url').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  isDemo: boolean('is_demo').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sku: text('sku').notNull().unique(),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  shortDescription: text('short_description').notNull().default(''),
  fullDescription: text('full_description').notNull().default(''),
  images: jsonb('images').$type<string[]>().notNull().default([]),
  ingredients: text('ingredients').notNull().default(''),
  teaType: text('tea_type').notNull().default(''),
  teaOrigin: text('tea_origin').notNull().default(''),
  supplierReference: text('supplier_reference').notNull().default(''),
  isFeatured: boolean('is_featured').notNull().default(false),
  availability: text('availability').notNull().default('In Stock'),
  status: text('status').notNull().default('active'), // 'active' | 'draft' | 'archived'
  isDemo: boolean('is_demo').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  sku: text('sku').notNull(),
  packSize: text('pack_size').notNull(),
  netWeightGrams: integer('net_weight_grams').notNull().default(250),
  shippingWeightGrams: integer('shipping_weight_grams').notNull().default(280),
  sellingPrice: numeric('selling_price', { precision: 10, scale: 2 }),
  currency: text('currency').notNull().default('INR'),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderReference: text('order_reference').notNull().unique(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  country: text('country').notNull(),
  stateRegion: text('state_region').notNull(),
  city: text('city').notNull(),
  postalCode: text('postal_code').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  additionalInstructions: text('additional_instructions').notNull().default(''),
  currency: text('currency').notNull().default('INR'),
  subtotalAmount: numeric('subtotal_amount', { precision: 10, scale: 2 })
    .notNull()
    .default('0.00'),
  shippingFee: numeric('shipping_fee', { precision: 10, scale: 2 })
    .notNull()
    .default('0.00'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 })
    .notNull()
    .default('0.00'),
  totalWeightGrams: integer('total_weight_grams').notNull().default(0),
  hasUnpricedItems: boolean('has_unpriced_items').notNull().default(false),
  orderChannel: text('order_channel').notNull().default('whatsapp'),
  orderStatus: text('order_status').notNull().default('New Enquiry'),
  paymentMethod: text('payment_method').notNull().default('upi_manual'),
  paymentStatus: text('payment_status').notNull().default('pending'),
  paymentReference: text('payment_reference').notNull().default(''),
  paymentGatewayProvider: text('payment_gateway_provider').notNull().default(''),
  paymentGatewayTxRef: text('payment_gateway_tx_ref').notNull().default(''),
  shippingType: text('shipping_type').notNull().default('domestic'),
  courierName: text('courier_name').notNull().default(''),
  trackingNumber: text('tracking_number').notNull().default(''),
  trackingUrl: text('tracking_url').notNull().default(''),
  dispatchDate: text('dispatch_date').notNull().default(''),
  deliveryStatus: text('delivery_status').notNull().default('Pending Confirmation'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  productId: integer('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  variantId: integer('variant_id').references(() => productVariants.id, {
    onDelete: 'set null',
  }),
  productName: text('product_name').notNull(),
  sku: text('sku').notNull(),
  packSize: text('pack_size').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }),
  lineTotal: numeric('line_total', { precision: 10, scale: 2 }),
  shippingWeightGrams: integer('shipping_weight_grams').notNull().default(0),
});

export const orderAuditLogs = pgTable('order_audit_logs', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  actorEmail: text('actor_email').notNull(),
  action: text('action').notNull(),
  previousValue: text('previous_value').notNull().default(''),
  newValue: text('new_value').notNull().default(''),
  notes: text('notes').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wholesaleEnquiries = pgTable('wholesale_enquiries', {
  id: serial('id').primaryKey(),
  referenceCode: text('reference_code').notNull().unique(),
  businessName: text('business_name').notNull(),
  contactPerson: text('contact_person').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  country: text('country').notNull(),
  businessType: text('business_type').notNull(),
  productInterest: text('product_interest').notNull(),
  requiredQuantity: text('required_quantity').notNull(),
  additionalMessage: text('additional_message').notNull().default(''),
  status: text('status').notNull().default('New'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url').notNull().default(''),
  readTimeMinutes: integer('read_time_minutes').notNull().default(4),
  isPublished: boolean('is_published').notNull().default(true),
  isDemo: boolean('is_demo').notNull().default(true),
  publishedAt: text('published_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  consentGiven: boolean('consent_given').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull().default(''),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('New'),
  createdAt: timestamp('created_at').defaultNow(),
});

export interface DomesticShippingConfig {
  enabled: boolean;
  serviceableRegions: string;
  flatFee: number;
  minOrderValue: number;
  estimatedDays: string;
  notes: string;
}

export interface InternationalCountryConfig {
  countryCode: string;
  countryName: string;
  active: boolean;
  courierName: string;
  baseFee: number;
  perKgFee: number;
  estimatedDays: string;
  complianceNotes: string;
}

export interface SocialLinksConfig {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
}

export interface CmsContentConfig {
  hero: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    imageUrl: string;
  };
  brandStory: {
    headline: string;
    shortIntro: string;
    fullStory: string;
    imageUrl: string;
  };
  sourcingSteps: Array<{
    step: number;
    title: string;
    description: string;
    imageUrl: string;
  }>;
  teaOrigins: Array<{
    id: string;
    name: string;
    region: string;
    description: string;
    flavorProfile: string;
    imageUrl: string;
    isDemo: boolean;
  }>;
  whyChooseUs: Array<{
    title: string;
    description: string;
  }>;
  wholesaleBanner: {
    headline: string;
    description: string;
    ctaLabel: string;
  };
  footer: {
    aboutText: string;
    copyrightText: string;
  };
  policies: {
    shippingPolicy: string;
    returnsPolicy: string;
    privacyPolicy: string;
    termsConditions: string;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const storeSettings = pgTable('store_settings', {
  id: integer('id').primaryKey().default(1),
  businessName: text('business_name').notNull().default('DON TRADERS'),
  tagline: text('tagline').notNull().default('Selected Indian Teas'),
  logoUrl: text('logo_url').notNull().default(''),
  whatsappNumber: text('whatsapp_number').notNull().default(''),
  upiId: text('upi_id').notNull().default(''),
  upiQrUrl: text('upi_qr_url').notNull().default(''),
  upiInstructions: text('upi_instructions')
    .notNull()
    .default(
      'UPI payment details will be shared after your order enquiry is reviewed. Payments are verified manually before dispatch.'
    ),
  contactEmail: text('contact_email').notNull().default(''),
  contactPhone: text('contact_phone').notNull().default(''),
  businessAddress: text('business_address').notNull().default(''),
  defaultCurrency: text('default_currency').notNull().default('INR'),
  supportedCurrencies: jsonb('supported_currencies')
    .$type<string[]>()
    .notNull()
    .default(['INR', 'USD', 'GBP', 'EUR', 'AED', 'SGD']),
  internationalPaymentActive: boolean('international_payment_active')
    .notNull()
    .default(false),
  internationalPaymentProvider: text('international_payment_provider')
    .notNull()
    .default(''),
  internationalPaymentNotice: text('international_payment_notice')
    .notNull()
    .default(
      'International card payments are inactive until an approved payment gateway is configured. Please submit an order enquiry for export confirmation.'
    ),
  announcements: jsonb('announcements').$type<string[]>().notNull().default([]),
  socialLinks: jsonb('social_links')
    .$type<SocialLinksConfig>()
    .notNull()
    .default({}),
  domesticShipping: jsonb('domestic_shipping')
    .$type<DomesticShippingConfig>()
    .notNull(),
  internationalShippingCountries: jsonb('international_shipping_countries')
    .$type<InternationalCountryConfig[]>()
    .notNull()
    .default([]),
  cmsContent: jsonb('cms_content').$type<CmsContentConfig>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  auditLogs: many(orderAuditLogs),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const orderAuditLogsRelations = relations(orderAuditLogs, ({ one }) => ({
  order: one(orders, {
    fields: [orderAuditLogs.orderId],
    references: [orders.id],
  }),
}));
