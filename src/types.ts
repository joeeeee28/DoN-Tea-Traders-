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

export interface StoreSettings {
  id: number;
  businessName: string;
  tagline: string;
  logoUrl: string;
  whatsappNumber: string;
  upiId: string;
  upiQrUrl: string;
  upiInstructions: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  defaultCurrency: string;
  supportedCurrencies: string[];
  internationalPaymentActive: boolean;
  internationalPaymentProvider: string;
  internationalPaymentNotice: string;
  announcements: string[];
  socialLinks: SocialLinksConfig;
  domesticShipping: DomesticShippingConfig;
  internationalShippingCountries: InternationalCountryConfig[];
  cmsContent: CmsContentConfig;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  isDemo: boolean;
}

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  packSize: string;
  netWeightGrams: number;
  shippingWeightGrams: number;
  sellingPrice: string | null;
  currency: string;
  stockQuantity: number;
  isActive: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  categoryId: number | null;
  categoryName: string;
  categorySlug: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  ingredients: string;
  teaType: string;
  teaOrigin: string;
  supplierReference?: string;
  isFeatured: boolean;
  availability: string;
  status: string;
  isDemo: boolean;
  startingPrice: number | null;
  currency: string;
  variants: ProductVariant[];
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  readTimeMinutes: number;
  isPublished: boolean;
  isDemo: boolean;
  publishedAt: string;
}

export interface CartItem {
  productId: number;
  productSlug: string;
  productName: string;
  imageUrl: string;
  variantId: number;
  sku: string;
  packSize: string;
  unitPrice: number | null;
  currency: string;
  shippingWeightGrams: number;
  quantity: number;
  isDemo: boolean;
}

export interface OrderItemRecord {
  id: number;
  productName: string;
  sku: string;
  packSize: string;
  quantity: number;
  unitPrice: string | null;
  lineTotal: string | null;
  shippingWeightGrams: number;
}

export interface OrderAuditLogRecord {
  id: number;
  actorEmail: string;
  action: string;
  previousValue: string;
  newValue: string;
  notes: string;
  createdAt: string;
}

export interface OrderRecord {
  id: number;
  orderReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
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
  totalWeightGrams: number;
  hasUnpricedItems: boolean;
  orderChannel: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference: string;
  shippingType: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl: string;
  dispatchDate: string;
  deliveryStatus: string;
  createdAt: string;
  items: OrderItemRecord[];
  auditLogs?: OrderAuditLogRecord[];
}

export interface DbUser {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  role: 'admin' | 'customer';
}
