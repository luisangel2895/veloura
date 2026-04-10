/**
 * Deterministic Medusa-shaped fixtures used by the mock server during E2E tests.
 *
 * The payloads intentionally mirror the subset of the Medusa Store API that
 * `lib/medusa/client.ts` consumes. Keeping them next to the mock server keeps
 * the test harness self-contained and decouples it from any real data source.
 */

export interface MedusaTag {
  id: string;
  value: string;
}

export interface MedusaImage {
  id: string;
  url: string;
}

export interface MedusaOptionValue {
  id: string;
  value: string;
}

export interface MedusaProductOption {
  id: string;
  title: string;
  values: MedusaOptionValue[];
}

export interface MedusaVariantPrice {
  amount: number;
  currency_code: string;
}

export interface MedusaCalculatedPrice {
  calculated_amount: number;
  currency_code: string;
}

export interface MedusaVariant {
  id: string;
  title: string;
  sku: string | null;
  options: Record<string, string>;
  calculated_price: MedusaCalculatedPrice;
  prices: MedusaVariantPrice[];
  manage_inventory: boolean;
  inventory_quantity: number;
}

export interface MedusaCategoryRef {
  id: string;
  handle: string;
  name: string;
}

export interface MedusaProductFixture {
  id: string;
  handle: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  status: "published";
  tags: MedusaTag[];
  images: MedusaImage[];
  options: MedusaProductOption[];
  variants: MedusaVariant[];
  categories: MedusaCategoryRef[];
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface MedusaCategoryFixture {
  id: string;
  handle: string;
  name: string;
  description: string;
  metadata: Record<string, unknown> | null;
  rank: number;
}

const FIXTURE_TIMESTAMP = "2026-01-01T00:00:00.000Z";
const SIZE_OPTIONS = ["XS", "S", "M", "L"] as const;

function buildImages(slug: string): MedusaImage[] {
  return [1, 2, 3].map((index) => ({
    id: `img_${slug}_${index}`,
    url: `https://picsum.photos/seed/${slug}-${index}/600/800`,
  }));
}

function buildSizeOption(productId: string): MedusaProductOption {
  return {
    id: `opt_${productId}_size`,
    title: "Size",
    values: SIZE_OPTIONS.map((size) => ({
      id: `optval_${productId}_${size}`,
      value: size,
    })),
  };
}

function buildVariants(productId: string, priceCents: number): MedusaVariant[] {
  return SIZE_OPTIONS.map((size, index) => ({
    id: `variant_${productId}_${size}`,
    title: `${size} / Default`,
    sku: `${productId.toUpperCase()}-${size}`,
    options: { Size: size },
    calculated_price: {
      calculated_amount: priceCents,
      currency_code: "usd",
    },
    prices: [
      {
        amount: priceCents,
        currency_code: "usd",
      },
    ],
    manage_inventory: true,
    inventory_quantity: 25 - index,
  }));
}

export const CATEGORIES_FIXTURE: MedusaCategoryFixture[] = [
  {
    id: "cat_balconette",
    handle: "balconette",
    name: "Balconette",
    description: "Architectural lift with soft finishing.",
    metadata: null,
    rank: 1,
  },
  {
    id: "cat_bodysuits",
    handle: "bodysuits",
    name: "Bodysuits",
    description: "Second-skin tailoring.",
    metadata: null,
    rank: 2,
  },
  {
    id: "cat_bridal",
    handle: "bridal",
    name: "Bridal",
    description: "Luminous edit for the ceremony.",
    metadata: null,
    rank: 3,
  },
  {
    id: "cat_lounge",
    handle: "lounge",
    name: "Lounge",
    description: "Quiet indulgence for restful layers.",
    metadata: null,
    rank: 4,
  },
];

function categoryRef(handle: string): MedusaCategoryRef {
  const category = CATEGORIES_FIXTURE.find((candidate) => candidate.handle === handle);
  if (!category) {
    throw new Error(`Unknown fixture category handle: ${handle}`);
  }
  return { id: category.id, handle: category.handle, name: category.name };
}

interface FixtureSeed {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  description: string;
  priceCents: number;
  tags: readonly string[];
  category: "balconette" | "bodysuits" | "bridal" | "lounge";
  featured: boolean;
  paletteDark: string;
  paletteLight: string;
}

const SEEDS: readonly FixtureSeed[] = [
  {
    id: "prod_noir_essence",
    handle: "noir-essence-balconette",
    title: "Noir Essence Balconette",
    subtitle: "Architectural lift in satin and mesh.",
    description:
      "A softly structured balconette with polished satin wings, sheer contour panels and a precise line that disappears beneath tailoring.",
    priceCents: 11200,
    tags: ["signature", "mesh", "evening"],
    category: "balconette",
    featured: true,
    paletteDark: "#1b1a1e",
    paletteLight: "#7e6843",
  },
  {
    id: "prod_velvet_trace",
    handle: "velvet-trace-balconette",
    title: "Velvet Trace Balconette",
    subtitle: "A clean demi profile with velvet-soft trim.",
    description:
      "Designed for everyday polish, this balconette balances contour support with plush edge finishing and a low, confident neckline.",
    priceCents: 11800,
    tags: ["best-seller", "velvet-trim"],
    category: "balconette",
    featured: true,
    paletteDark: "#2b2025",
    paletteLight: "#9b7d51",
  },
  {
    id: "prod_champagne_glow",
    handle: "champagne-glow-bodysuit",
    title: "Champagne Glow Bodysuit",
    subtitle: "Fluid shimmer and sculpted vertical seams.",
    description:
      "A sleek bodysuit with a subtle champagne sheen, balancing light compression with elongating seam placement and a polished neckline.",
    priceCents: 16800,
    tags: ["bodysuit", "shimmer"],
    category: "bodysuits",
    featured: true,
    paletteDark: "#dfd3c1",
    paletteLight: "#a98554",
  },
  {
    id: "prod_silk_vow",
    handle: "silk-vow-slip-set",
    title: "Silk Vow Slip Set",
    subtitle: "A bridal-ready pairing for slow mornings.",
    description:
      "A softly draped slip-and-brief pairing with liquid handfeel and delicate trim, designed for bridal rituals and travel alike.",
    priceCents: 19600,
    tags: ["bridal", "giftable", "set"],
    category: "bridal",
    featured: true,
    paletteDark: "#f2e8d8",
    paletteLight: "#b99260",
  },
  {
    id: "prod_cashmere_hush",
    handle: "cashmere-hush-bralette",
    title: "Cashmere Hush Bralette",
    subtitle: "Relaxed support for quiet indulgence.",
    description:
      "A lounge bralette with cloud-soft stretch, subtle support and a clean shape that slips into restful routines with ease.",
    priceCents: 8600,
    tags: ["bralette", "soft-touch", "travel"],
    category: "lounge",
    featured: false,
    paletteDark: "#8f8076",
    paletteLight: "#c0a06d",
  },
] as const;

export const PRODUCTS_FIXTURE: MedusaProductFixture[] = SEEDS.map((seed) => ({
  id: seed.id,
  handle: seed.handle,
  title: seed.title,
  subtitle: seed.subtitle,
  description: seed.description,
  status: "published",
  tags: seed.tags.map((value, index) => ({
    id: `tag_${seed.id}_${index}`,
    value,
  })),
  images: buildImages(seed.handle),
  options: [buildSizeOption(seed.id)],
  variants: buildVariants(seed.id, seed.priceCents),
  categories: [categoryRef(seed.category)],
  metadata: {
    featured: seed.featured,
    palette_primary: seed.paletteDark,
    palette_secondary: seed.paletteLight,
    details: JSON.stringify([
      "Underwire support with soft cup reinforcement.",
      "Breathable side panels for comfort through long wear.",
      "Finished with refined elastic edges for a minimal line.",
    ]),
  },
  created_at: FIXTURE_TIMESTAMP,
  updated_at: FIXTURE_TIMESTAMP,
}));

export const FIXTURE_PRODUCT_SLUGS = {
  noirEssenceBalconette: "noir-essence-balconette",
  velvetTraceBalconette: "velvet-trace-balconette",
  champagneGlowBodysuit: "champagne-glow-bodysuit",
  silkVowSlipSet: "silk-vow-slip-set",
  cashmereHushBralette: "cashmere-hush-bralette",
} as const;

export const FIXTURE_CATEGORY_SLUGS = {
  balconette: "balconette",
  bodysuits: "bodysuits",
  bridal: "bridal",
  lounge: "lounge",
} as const;
