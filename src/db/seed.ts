import { sql } from 'drizzle-orm';
import { db } from './index.ts';
import {
  blogPosts,
  categories,
  products,
  productVariants,
  storeSettings,
  type CmsContentConfig,
  type DomesticShippingConfig,
  type InternationalCountryConfig,
} from './schema.ts';

const defaultDomesticShipping: DomesticShippingConfig = {
  enabled: true,
  serviceableRegions:
    'Selected serviceable Indian PIN codes (delivery confirmation provided upon order enquiry)',
  flatFee: 60,
  minOrderValue: 1000,
  estimatedDays: '3–6 business days after dispatch confirmation',
  notes:
    'Don Traders coordinates domestic deliveries through its arranged delivery partners. Final availability and delivery timeline are confirmed against your PIN code.',
};

const defaultInternationalCountries: InternationalCountryConfig[] = [
  {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    active: false,
    courierName: 'To be confirmed',
    baseFee: 1800,
    perKgFee: 650,
    estimatedDays: '5–9 business days',
    complianceNotes:
      'Subject to destination food import clearance and export documentation confirmation.',
  },
  {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    active: false,
    courierName: 'To be confirmed',
    baseFee: 2400,
    perKgFee: 850,
    estimatedDays: '6–10 business days',
    complianceNotes:
      'Subject to UK food import rules, packaging declarations, and courier confirmation.',
  },
  {
    countryCode: 'US',
    countryName: 'United States',
    active: false,
    courierName: 'To be confirmed',
    baseFee: 2600,
    perKgFee: 950,
    estimatedDays: '7–12 business days',
    complianceNotes:
      'Subject to FDA prior notice and destination import regulations.',
  },
  {
    countryCode: 'SG',
    countryName: 'Singapore',
    active: false,
    courierName: 'To be confirmed',
    baseFee: 1600,
    perKgFee: 600,
    estimatedDays: '4–7 business days',
    complianceNotes:
      'Subject to Singapore food import compliance and courier confirmation.',
  },
  {
    countryCode: 'DE',
    countryName: 'Germany',
    active: false,
    courierName: 'To be confirmed',
    baseFee: 2500,
    perKgFee: 880,
    estimatedDays: '7–11 business days',
    complianceNotes:
      'Subject to EU food import regulations and customs clearance.',
  },
];

const defaultCmsContent: CmsContentConfig = {
  hero: {
    headline: 'Naturally Valparai. Truly DoN.',
    subheadline:
      'Discover the authentic character of Valparai tea — naturally strong, rich in colour and full of refreshing flavour.',
    primaryCta: 'Explore Our Tea Collection',
    secondaryCta: 'Order via WhatsApp',
    imageUrl: 'asset:hero',
  },
  brandStory: {
    headline: 'Rooted in Valparai. Crafted by Nature.',
    shortIntro:
      'Discover the authentic character of Valparai tea — naturally strong, rich in colour and full of refreshing flavour. At DoN Tea Traders, we bring you 100% single-origin, unblended Valparai tea. No Artificial Flavours. No Additives.',
    fullStory:
      'Rooted in Valparai. Crafted by Nature.\n\nDiscover the authentic character of Valparai tea — naturally strong, rich in colour and full of refreshing flavour.\n\nAt DoN Tea Traders India Private Limited, we bring you 100% single-origin, unblended Valparai tea from 7th Heaven Valparai. Every batch is selected without artificial flavours or additives so households, retail shelves, and trade buyers experience the true character of Valparai in every cup.\n\nFrom fine CTC Dust Tea and brisk Granules Tea to aromatic Leaf Tea, we support both direct retail orders and structured wholesale, bulk, and distributor enquiries.',
    imageUrl: 'asset:tasting',
  },
  sourcingSteps: [
    {
      step: 1,
      title: 'Manufacturer and Supplier Selection',
      description:
        'We evaluate and work with established tea manufacturers and wholesale suppliers who meet our commercial supply and hygiene expectations.',
      imageUrl: 'asset:plantation',
    },
    {
      step: 2,
      title: 'Tea Selection and Procurement',
      description:
        'Selected CTC Dust, Granules, and Leaf lots are sampled for colour, strength, aroma, and liquor consistency before procurement.',
      imageUrl: 'asset:tasting',
    },
    {
      step: 3,
      title: 'Quality and Specification Verification',
      description:
        'Each procured batch is reviewed against internal visual, granule-size, moisture, and cup-profile specifications prior to packing.',
      imageUrl: 'asset:ctc_dust',
    },
    {
      step: 4,
      title: 'Private-Label Packaging',
      description:
        'Selected teas are packed and labelled under the DoN Tea Traders brand in practical household and commercial pack sizes.',
      imageUrl: 'asset:assam_leaf',
    },
    {
      step: 5,
      title: 'Order Fulfilment and Delivery',
      description:
        'Orders are coordinated through confirmed domestic delivery arrangements or verified international courier channels.',
      imageUrl: 'asset:masala',
    },
  ],
  teaOrigins: [
    {
      id: 'valparai',
      name: 'Valparai — 7th Heaven',
      region: 'Anamalai Hills, Tamil Nadu (Western Ghats)',
      description:
        'Our core 100% single-origin, unblended tea region. Valparai tea delivers naturally strong liquor, deep rich colour, and refreshing flavour with no artificial flavours and no additives.',
      flavorProfile: 'Naturally strong, rich colour, refreshing flavour',
      imageUrl: 'asset:plantation',
      isDemo: false,
    },
    {
      id: 'ctc-dust-grade',
      name: 'Valparai CTC Dust Grade',
      region: '7th Heaven Valparai',
      description:
        'Finely graded single-origin Valparai CTC dust crafted for quick brewing, dense body, and rich cup colour.',
      flavorProfile: 'Brisk, dense decoction, strong colour',
      imageUrl: 'asset:ctc_dust',
      isDemo: false,
    },
    {
      id: 'granules-grade',
      name: 'Valparai Granules Grade',
      region: '7th Heaven Valparai',
      description:
        'Uniform single-origin Valparai CTC granules designed for balanced strength and vibrant everyday chai.',
      flavorProfile: 'Full-bodied, brisk, bright liquor',
      imageUrl: 'asset:tasting',
      isDemo: false,
    },
    {
      id: 'leaf-grade',
      name: 'Valparai Leaf Grade',
      region: '7th Heaven Valparai',
      description:
        'Carefully graded single-origin Valparai leaf tea offering clean aroma and refreshing natural tea character.',
      flavorProfile: 'Aromatic, smooth, refreshing finish',
      imageUrl: 'asset:assam_leaf',
      isDemo: false,
    },
  ],
  whyChooseUs: [
    {
      title: '100% Single Origin',
      description:
        'From 7th Heaven Valparai — authentically rooted in one region with consistent Valparai tea character.',
    },
    {
      title: 'Unblended Tea',
      description:
        'Pure single-origin Valparai tea kept unblended to preserve natural strength, rich colour, and refreshing flavour.',
    },
    {
      title: 'No Artificial Flavours',
      description:
        'Free from synthetic flavourings or artificial essences — only the natural taste of Valparai tea.',
    },
    {
      title: 'No Additives',
      description:
        'Clean, honest tea crafted by nature with zero unnecessary additives across Dust, Granules, and Leaf grades.',
    },
    {
      title: 'Retail & Wholesale Supply',
      description:
        'Supporting household retail orders alongside wholesale, bulk supply, and business & distributor enquiries.',
    },
    {
      title: 'Order via WhatsApp',
      description:
        'Seamless cart-to-WhatsApp ordering for India retail customers and direct trade coordination.',
    },
  ],
  wholesaleBanner: {
    headline: 'Retail & Wholesale Supply Available.',
    description:
      'Whether you are ordering for your home or sourcing in bulk, DoN Tea Traders India Private Limited supports retail orders, wholesale enquiries, bulk supply enquiries, and business & distributor enquiries.',
    ctaLabel: 'Enquire for Wholesale',
  },
  footer: {
    aboutText:
      'DoN Tea Traders India Private Limited — Naturally Valparai. Truly DoN. Rooted in Valparai. Crafted by Nature. 100% Single-Origin Tea. Dust | Granules | Leaf Tea. Retail & Wholesale Supply. From 7th Heaven Valparai.',
    copyrightText: '© DoN Tea Traders India Private Limited. All rights reserved.',
  },
  policies: {
    shippingPolicy:
      'Domestic Shipping (India): Orders placed through DON TRADERS are reviewed for PIN code serviceability and stock availability before dispatch confirmation. Estimated delivery timelines and applicable shipping charges are shared prior to payment.\n\nInternational Shipping: International orders are strictly subject to destination-country eligibility, applicable food export/import regulations, courier availability, and final shipping quotation confirmation. Only countries explicitly activated in our Store Settings are eligible for international dispatch.',
    returnsPolicy:
      'Because tea is a consumable food product, opened or tampered packages cannot be returned once delivered. If an order arrives damaged in transit or contains an incorrect pack size, please contact DON TRADERS within 48 hours of delivery with your order reference number and clear package photographs so our team can review and resolve the issue.',
    privacyPolicy:
      'DON TRADERS collects customer contact, shipping, and order enquiry details solely to process order enquiries, coordinate deliveries, respond to wholesale requests, and maintain statutory business records. We do not collect or store payment card numbers directly on this website. Newsletter subscriptions require explicit user consent and can be withdrawn upon request.',
    termsConditions:
      'Submitting an order through the DON TRADERS website creates a formal order enquiry reference. Orders are confirmed only after stock, shipping destination, and payment verification (manual UPI verification for domestic orders, or confirmed export terms for international orders) are completed. Product specifications, packaging labels, batch declarations, and statutory food/export compliance notices must be verified by the store administrator prior to commercial publication.',
  },
  faqs: [
    {
      question: 'How does DoN Tea Traders source its teas?',
      answer:
        'At DoN Tea Traders India Private Limited, we bring you 100% single-origin, unblended Valparai tea with no artificial flavours and no additives, curated for consistent strength, rich colour, and refreshing flavour.',
    },
    {
      question: 'How do I complete a retail order and payment in India?',
      answer:
        'Add your preferred tea pack sizes to the cart and submit the checkout form to generate an order enquiry reference. You can then open WhatsApp to share your pre-filled order summary with our team. Once confirmed, UPI details or QR code are shared for manual payment verification prior to dispatch.',
    },
    {
      question: 'Do you ship internationally?',
      answer:
        'International shipping is available only for destination countries that have been verified and activated in our shipping configuration, subject to applicable food export requirements, customs rules, and courier confirmation.',
    },
    {
      question: 'Can cafés, hotels, or distributors enquire for bulk quantities?',
      answer:
        'Yes. Retail & Wholesale Supply is available. Use our dedicated Wholesale & Bulk Enquiries page to submit retail, wholesale, bulk supply, or business & distributor enquiries.',
    },
  ],
};

let seedPromise: Promise<void> | null = null;

export async function ensureSeedData(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      const existingSettings = await db
        .select({ id: storeSettings.id })
        .from(storeSettings)
        .limit(1);

      if (existingSettings.length === 0) {
        await db
          .insert(storeSettings)
          .values({
            id: 1,
            businessName: 'DoN Tea Traders India Private Limited',
            tagline: 'Naturally Valparai. Truly DoN.',
            logoUrl: '',
            whatsappNumber: '', // Deliberately blank until configured by Admin
            upiId: '', // Deliberately blank until configured by Admin
            upiQrUrl: '',
            upiInstructions:
              'Once your order enquiry is reviewed, DoN Tea Traders will share verified UPI payment details. Payments are confirmed manually before dispatch.',
            contactEmail: '', // Deliberately blank until configured by Admin
            contactPhone: '',
            businessAddress: '',
            defaultCurrency: 'INR',
            supportedCurrencies: ['INR', 'USD', 'GBP', 'EUR', 'AED', 'SGD'],
            internationalPaymentActive: false,
            internationalPaymentProvider: '',
            internationalPaymentNotice:
              'International online card payments are inactive until an approved payment provider is configured. Please submit an order enquiry for export confirmation.',
            announcements: [
              'Naturally Valparai. Truly DoN.',
              'Single Origin. Unblended Pure Valparai Tea — No Artificial Flavours. No Additives.',
              'CTC Dust Tea | Granules Tea | Leaf Tea — Retail & Wholesale Supply Available.',
              'From 7th Heaven Valparai — Order via WhatsApp or Explore Our Collection.',
            ],
            socialLinks: {},
            domesticShipping: defaultDomesticShipping,
            internationalShippingCountries: defaultInternationalCountries,
            cmsContent: defaultCmsContent,
          })
          .onConflictDoNothing();
      }

      const catCountRows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(categories);
      if ((catCountRows[0]?.count ?? 0) === 0) {
        const insertedCats = await db
          .insert(categories)
          .values([
            {
              name: 'CTC Dust Tea',
              slug: 'ctc-dust-tea',
              description:
                'Fine-grade single-origin Valparai CTC dust tea delivering rapid decoction, deep amber colour, and naturally strong flavour.',
              imageUrl: 'asset:ctc_dust',
              sortOrder: 1,
              isActive: true,
              isDemo: true,
            },
            {
              name: 'Granules Tea',
              slug: 'granules-tea',
              description:
                'Full-bodied single-origin Valparai CTC tea granules crafted for rich colour, brisk strength, and refreshing everyday tea.',
              imageUrl: 'asset:ctc_dust',
              sortOrder: 2,
              isActive: true,
              isDemo: true,
            },
            {
              name: 'Leaf Tea',
              slug: 'leaf-tea',
              description:
                'Carefully selected single-origin Valparai leaf tea with natural aroma, clean taste, and zero artificial flavours or additives.',
              imageUrl: 'asset:assam_leaf',
              sortOrder: 3,
              isActive: true,
              isDemo: true,
            },
          ])
          .returning();

        const catMap = new Map(insertedCats.map((c) => [c.slug, c.id]));

        const demoProductsData = [
          {
            name: 'Don Traders Strong CTC Tea (Demo)',
            slug: 'don-traders-strong-ctc-tea',
            sku: 'DT-CTC-001',
            categoryId: catMap.get('granules-tea') ?? null,
            shortDescription:
              'Demo Sample: Rich granular CTC tea blend selected for strong colour, brisk aroma, and everyday milk chai.',
            fullDescription:
              'DEMO SAMPLE PRODUCT — Replace with verified commercial specifications before launch.\n\nSelected from partner Indian CTC tea manufacturers, this granular black tea blend is tailored for households and tea stalls seeking a dependable, thick-bodied morning cup with milk and sugar.',
            images: ['asset:ctc_dust', 'asset:hero'],
            ingredients: '100% Black Tea (CTC Grade) — Demo specification',
            teaType: 'CTC Granular',
            teaOrigin: 'Assam & Indian Blend (Demo)',
            supplierReference: 'PARTNER-SUP-DEMO-01',
            isFeatured: true,
            availability: 'In Stock',
            status: 'active',
            isDemo: true,
            variants: [
              {
                sku: 'DT-CTC-100G',
                packSize: '100g (Sample)',
                netWeightGrams: 100,
                shippingWeightGrams: 120,
                sellingPrice: '55.00',
                currency: 'INR',
                stockQuantity: 120,
              },
              {
                sku: 'DT-CTC-250G',
                packSize: '250g (Sample)',
                netWeightGrams: 250,
                shippingWeightGrams: 280,
                sellingPrice: '130.00',
                currency: 'INR',
                stockQuantity: 95,
              },
              {
                sku: 'DT-CTC-500G',
                packSize: '500g (Sample)',
                netWeightGrams: 500,
                shippingWeightGrams: 540,
                sellingPrice: '250.00',
                currency: 'INR',
                stockQuantity: 60,
              },
              {
                sku: 'DT-CTC-1KG',
                packSize: '1kg (Sample)',
                netWeightGrams: 1000,
                shippingWeightGrams: 1060,
                sellingPrice: '480.00',
                currency: 'INR',
                stockQuantity: 40,
              },
            ],
          },
          {
            name: 'Don Traders Gold Dust Tea (Demo)',
            slug: 'don-traders-gold-dust-tea',
            sku: 'DT-DST-002',
            categoryId: catMap.get('ctc-dust-tea') ?? null,
            shortDescription:
              'Demo Sample: Fine aromatic dust grade formulated for quick brewing and rich, dense chai decoction.',
            fullDescription:
              'DEMO SAMPLE PRODUCT — Replace with verified commercial specifications before launch.\n\nFine dust tea particles infuse rapidly, yielding a deep coppery liquor ideal for South Indian style kadak chai and high-volume café service.',
            images: ['asset:ctc_dust', 'asset:tasting'],
            ingredients: '100% Fine Dust Black Tea — Demo specification',
            teaType: 'Dust Tea',
            teaOrigin: 'Nilgiri & Assam Blend (Demo)',
            supplierReference: 'PARTNER-SUP-DEMO-02',
            isFeatured: true,
            availability: 'In Stock',
            status: 'active',
            isDemo: true,
            variants: [
              {
                sku: 'DT-DST-250G',
                packSize: '250g (Sample)',
                netWeightGrams: 250,
                shippingWeightGrams: 280,
                sellingPrice: '135.00',
                currency: 'INR',
                stockQuantity: 85,
              },
              {
                sku: 'DT-DST-500G',
                packSize: '500g (Sample)',
                netWeightGrams: 500,
                shippingWeightGrams: 540,
                sellingPrice: '260.00',
                currency: 'INR',
                stockQuantity: 50,
              },
              {
                sku: 'DT-DST-1KG',
                packSize: '1kg (Sample)',
                netWeightGrams: 1000,
                shippingWeightGrams: 1060,
                sellingPrice: '500.00',
                currency: 'INR',
                stockQuantity: 30,
              },
            ],
          },
          {
            name: 'Don Traders Assam Classic Reserve (Demo)',
            slug: 'don-traders-assam-classic-reserve',
            sku: 'DT-ASM-003',
            categoryId: catMap.get('assam-tea') ?? null,
            shortDescription:
              'Demo Sample: Malty Assam black tea selection with balanced briskness for morning tea rituals.',
            fullDescription:
              'DEMO SAMPLE PRODUCT — Replace with verified commercial specifications before launch.\n\nSourced from partner Assam tea suppliers, this selection highlights classic malty depth and bright amber clarity whether brewed black or with milk.',
            images: ['asset:assam_leaf', 'asset:plantation'],
            ingredients: 'Assam Black Tea — Demo specification',
            teaType: 'Assam CTC & Leaf Blend',
            teaOrigin: 'Assam (Demo)',
            supplierReference: 'PARTNER-SUP-DEMO-03',
            isFeatured: true,
            availability: 'In Stock',
            status: 'active',
            isDemo: true,
            variants: [
              {
                sku: 'DT-ASM-250G',
                packSize: '250g (Sample)',
                netWeightGrams: 250,
                shippingWeightGrams: 290,
                sellingPrice: '175.00',
                currency: 'INR',
                stockQuantity: 70,
              },
              {
                sku: 'DT-ASM-500G',
                packSize: '500g (Sample)',
                netWeightGrams: 500,
                shippingWeightGrams: 550,
                sellingPrice: '340.00',
                currency: 'INR',
                stockQuantity: 45,
              },
            ],
          },
          {
            name: 'Don Traders Aromatic Whole Leaf Tea (Demo)',
            slug: 'don-traders-aromatic-whole-leaf-tea',
            sku: 'DT-LF-004',
            categoryId: catMap.get('leaf-tea') ?? null,
            shortDescription:
              'Demo Sample: Carefully graded long-leaf black tea for smooth, fragrant black infusions.',
            fullDescription:
              'DEMO SAMPLE PRODUCT — Replace with verified commercial specifications before launch.\n\nCrafted for tea drinkers who appreciate whole-leaf appearance, clean aroma, and a smoother tannin structure without milk.',
            images: ['asset:assam_leaf', 'asset:tasting'],
            ingredients: 'Whole Leaf Black Tea — Demo specification',
            teaType: 'Orthodox Leaf Tea',
            teaOrigin: 'Darjeeling & Assam Blend (Demo)',
            supplierReference: 'PARTNER-SUP-DEMO-04',
            isFeatured: true,
            availability: 'In Stock',
            status: 'active',
            isDemo: true,
            variants: [
              {
                sku: 'DT-LF-100G',
                packSize: '100g (Sample)',
                netWeightGrams: 100,
                shippingWeightGrams: 140,
                sellingPrice: '160.00',
                currency: 'INR',
                stockQuantity: 55,
              },
              {
                sku: 'DT-LF-250G',
                packSize: '250g (Sample)',
                netWeightGrams: 250,
                shippingWeightGrams: 300,
                sellingPrice: '380.00',
                currency: 'INR',
                stockQuantity: 35,
              },
            ],
          },
          {
            name: 'Don Traders Royal Masala Chai (Demo)',
            slug: 'don-traders-royal-masala-chai',
            sku: 'DT-MSL-005',
            categoryId: catMap.get('masala-tea') ?? null,
            shortDescription:
              'Demo Sample: Strong CTC base blended with cardamom, ginger, cinnamon, and clove spice profile.',
            fullDescription:
              'DEMO SAMPLE PRODUCT — Replace with verified ingredient percentages and allergen/spice declarations before launch.\n\nA warm, fragrant spiced chai blend pairing brisk black tea granules with traditional Indian masala aromatics.',
            images: ['asset:masala', 'asset:hero'],
            ingredients:
              'Black Tea, Cardamom, Cinnamon, Clove, Ginger (Demo specification)',
            teaType: 'Spiced Masala Blend',
            teaOrigin: 'Indian Origin Blend (Demo)',
            supplierReference: 'PARTNER-SUP-DEMO-05',
            isFeatured: true,
            availability: 'In Stock',
            status: 'active',
            isDemo: true,
            variants: [
              {
                sku: 'DT-MSL-100G',
                packSize: '100g (Sample)',
                netWeightGrams: 100,
                shippingWeightGrams: 125,
                sellingPrice: '95.00',
                currency: 'INR',
                stockQuantity: 90,
              },
              {
                sku: 'DT-MSL-250G',
                packSize: '250g (Sample)',
                netWeightGrams: 250,
                shippingWeightGrams: 285,
                sellingPrice: '220.00',
                currency: 'INR',
                stockQuantity: 64,
              },
            ],
          },
          {
            name: 'Don Traders HoReCa Speciality Blend (Demo)',
            slug: 'don-traders-horeca-speciality-blend',
            sku: 'DT-SPC-006',
            categoryId: catMap.get('speciality-tea-blends') ?? null,
            shortDescription:
              'Demo Sample: Commercial hospitality blend — pricing configured upon business enquiry.',
            fullDescription:
              'DEMO SAMPLE PRODUCT — Demonstrates unconfigured price state ("Price on Enquiry") for B2B / HoReCa and custom private-label lots.\n\nAdministrators can set selling prices per pack size at any time from the Admin Dashboard.',
            images: ['asset:hero', 'asset:ctc_dust'],
            ingredients: 'Selected CTC & Dust Tea Blend — Demo specification',
            teaType: 'Speciality Commercial Blend',
            teaOrigin: 'Indian Origin Blend (Demo)',
            supplierReference: 'PARTNER-SUP-DEMO-06',
            isFeatured: true,
            availability: 'Enquiry Only',
            status: 'active',
            isDemo: true,
            variants: [
              {
                sku: 'DT-SPC-1KG',
                packSize: '1kg Bulk Pack (Sample)',
                netWeightGrams: 1000,
                shippingWeightGrams: 1080,
                sellingPrice: null, // Deliberately null until configured!
                currency: 'INR',
                stockQuantity: 200,
              },
              {
                sku: 'DT-SPC-5KG',
                packSize: '5kg Master Pack (Sample)',
                netWeightGrams: 5000,
                shippingWeightGrams: 5250,
                sellingPrice: null,
                currency: 'INR',
                stockQuantity: 80,
              },
            ],
          },
        ];

        for (const p of demoProductsData) {
          const { variants, ...prodRow } = p;
          const [insertedProd] = await db
            .insert(products)
            .values(prodRow)
            .returning();
          if (insertedProd && variants.length > 0) {
            await db.insert(productVariants).values(
              variants.map((v) => ({
                ...v,
                productId: insertedProd.id,
              }))
            );
          }
        }
      }

      const blogCountRows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(blogPosts);
      if ((blogCountRows[0]?.count ?? 0) === 0) {
        await db.insert(blogPosts).values([
          {
            title: 'Understanding CTC Tea: Why India Loves Strong Granules',
            slug: 'understanding-ctc-tea',
            category: 'Tea Basics',
            excerpt:
              'Sample Article: Learn what Crush-Tear-Curl processing means for colour, strength, and everyday Indian milk chai.',
            content:
              'SAMPLE EDITORIAL ARTICLE — Editable in Admin Dashboard.\n\nCTC stands for Crush, Tear, and Curl—a tea processing method where withered tea leaves are passed through cylindrical rollers with sharp teeth. This produces dense, uniform granules that release rich colour and robust flavour quickly in boiling water and milk.\n\nFor Indian households and hospitality kitchens, CTC tea provides consistency across every brew, delivering briskness that stands up naturally to cardamom, ginger, and sugar.',
            imageUrl: 'asset:ctc_dust',
            readTimeMinutes: 4,
            isPublished: true,
            isDemo: true,
            publishedAt: '2026-10-15',
          },
          {
            title: 'Dust Tea vs Leaf Tea: Choosing the Right Grade for Your Cup',
            slug: 'dust-tea-vs-leaf-tea',
            category: 'Brewing Guide',
            excerpt:
              'Sample Article: Compare particle size, infusion speed, liquor body, and aroma between dust and whole-leaf grades.',
            content:
              'SAMPLE EDITORIAL ARTICLE — Editable in Admin Dashboard.\n\nTea grades refer to leaf size rather than quality alone. Dust tea consists of the finest particles left after sorting, offering rapid extraction and a thick, dark liquor ideal for kadak chai. Leaf tea retains larger twisted leaves that steep more gently, highlighting floral and nuanced aromatics—especially when served black.',
            imageUrl: 'asset:tasting',
            readTimeMinutes: 5,
            isPublished: true,
            isDemo: true,
            publishedAt: '2026-10-20',
          },
          {
            title: 'How to Prepare a Strong Cup of Indian Tea',
            slug: 'how-to-prepare-strong-cup-indian-tea',
            category: 'Preparation',
            excerpt:
              'Sample Article: Water-to-milk ratios, simmering timing, and temperature tips for balanced chai at home.',
            content:
              'SAMPLE EDITORIAL ARTICLE — Editable in Admin Dashboard.\n\nStart with fresh cold water brought to a rolling boil before adding CTC or dust tea granules. Allow the tea leaves to simmer for 2–3 minutes so the liquor deepens without turning bitter, then add milk and sweetener to taste and bring to a brief gentle boil before straining.',
            imageUrl: 'asset:hero',
            readTimeMinutes: 3,
            isPublished: true,
            isDemo: true,
            publishedAt: '2026-10-28',
          },
          {
            title: 'Exploring Indian Tea Varieties: Assam, Darjeeling & Nilgiri',
            slug: 'exploring-indian-tea-varieties',
            category: 'Origins',
            excerpt:
              'Sample Article: An overview of India’s distinct tea-growing regions and how terroir shapes every brew.',
            content:
              'SAMPLE EDITORIAL ARTICLE — Editable in Admin Dashboard.\n\nFrom the humid river plains of Assam to the high Himalayan slopes of Darjeeling and the southern peaks of the Nilgiris, Indian tea encompasses remarkable diversity in body, brightness, and aroma.',
            imageUrl: 'asset:plantation',
            readTimeMinutes: 6,
            isPublished: true,
            isDemo: true,
            publishedAt: '2026-11-02',
          },
          {
            title: 'Tea Storage Tips to Preserve Aroma and Freshness',
            slug: 'tea-storage-tips',
            category: 'Care & Storage',
            excerpt:
              'Sample Article: Simple kitchen habits to protect tea powder and loose leaves from humidity, light, and strong odours.',
            content:
              'SAMPLE EDITORIAL ARTICLE — Editable in Admin Dashboard.\n\nTea leaves readily absorb moisture and surrounding kitchen aromas. Store your Don Traders tea powder in an opaque, airtight container away from direct stove steam, sunlight, and spice jars.',
            imageUrl: 'asset:assam_leaf',
            readTimeMinutes: 3,
            isPublished: true,
            isDemo: true,
            publishedAt: '2026-11-08',
          },
        ]);
      }
    } catch (error) {
      seedPromise = null;
      throw error;
    }
  })();

  return seedPromise;
}
