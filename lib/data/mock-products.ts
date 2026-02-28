import type { Product, ProductVariant, Size } from "@/types/catalog";

const buildVariants = (sizes: Size[]): ProductVariant[] =>
  sizes.map((size) => ({
    size,
    inStock: true,
    label: `${size} ready to ship`,
  }));

const sizes: Size[] = ["XS", "S", "M", "L", "XL"];
const buildImages = (seed: string) => [
  `https://placeholdpicsum.dev/photo/seed/${seed}-1/1200/1600.webp`,
  `https://placeholdpicsum.dev/photo/seed/${seed}-2/800/960.webp`,
  `https://placeholdpicsum.dev/photo/seed/${seed}-3/800/960.webp`,
];

const seedProducts: Product[] = [
  {
    id: "vel-001",
    slug: "noir-essence-balconette",
    name: "Noir Essence Balconette",
    tagline: "Architectural lift in satin and mesh.",
    categorySlug: "balconette",
    priceCents: 11200,
    sizesAvailable: ["XS", "S", "M", "L"],
    variants: buildVariants(["XS", "S", "M", "L"]),
    tags: ["signature", "mesh", "evening"],
    description:
      "A softly structured balconette with polished satin wings, sheer contour panels and a precise line that disappears beneath tailoring.",
    details: [
      "Underwire support with soft cup reinforcement.",
      "Adjustable straps and brushed hardware in soft gold.",
      "Lightweight power mesh back for shape retention.",
    ],
    images: buildImages("noir-essence-balconette"),
    palette: ["#1b1a1e", "#7e6843"],
    featured: true,
  },
  {
    id: "vel-002",
    slug: "velvet-trace-balconette",
    name: "Velvet Trace Balconette",
    tagline: "A clean demi profile with velvet-soft trim.",
    categorySlug: "balconette",
    priceCents: 11800,
    sizesAvailable: ["S", "M", "L", "XL"],
    variants: buildVariants(["S", "M", "L", "XL"]),
    tags: ["best-seller", "velvet trim", "daily luxury"],
    description:
      "Designed for everyday polish, this balconette balances contour support with plush edge finishing and a low, confident neckline.",
    details: [
      "Matte stretch satin with velvet binding.",
      "Wide side wings for a smoother frame.",
      "Engineered to layer under plunging silhouettes.",
    ],
    images: buildImages("velvet-trace-balconette"),
    palette: ["#2b2025", "#9b7d51"],
    featured: true,
  },
  {
    id: "vel-003",
    slug: "lune-ivory-balconette",
    name: "Lune Ivory Balconette",
    tagline: "Soft ivory for understated ceremony dressing.",
    categorySlug: "bridal",
    priceCents: 12400,
    sizesAvailable: ["XS", "S", "M", "L"],
    variants: buildVariants(["XS", "S", "M", "L"]),
    tags: ["bridal", "ivory", "ceremony"],
    description:
      "An ivory balconette with luminous stretch silk and restrained lace placement, created for bridal layering with modern restraint.",
    details: [
      "Low-profile cups that sit cleanly under satin gowns.",
      "Breathable sheer side panels for comfort.",
      "Discreet finish lines for a nearly invisible fit.",
    ],
    images: buildImages("lune-ivory-balconette"),
    palette: ["#f5ede2", "#c0a26b"],
    featured: true,
  },
  {
    id: "vel-004",
    slug: "champagne-glow-bodysuit",
    name: "Champagne Glow Bodysuit",
    tagline: "Fluid shimmer and sculpted vertical seams.",
    categorySlug: "bodysuits",
    priceCents: 16800,
    sizesAvailable: ["XS", "S", "M", "L"],
    variants: buildVariants(["XS", "S", "M", "L"]),
    tags: ["bridal", "bodysuit", "shimmer"],
    description:
      "A sleek bodysuit with a subtle champagne sheen, balancing light compression with elongating seam placement and a polished neckline.",
    details: [
      "Snap closure with smooth gusset finish.",
      "Moderate compression through the waist.",
      "Works as an underpinning or styled outer layer.",
    ],
    images: buildImages("champagne-glow-bodysuit"),
    palette: ["#dfd3c1", "#a98554"],
    featured: true,
  },
  {
    id: "vel-005",
    slug: "obsidian-line-bodysuit",
    name: "Obsidian Line Bodysuit",
    tagline: "Graphic transparency with a tailored base.",
    categorySlug: "bodysuits",
    priceCents: 17200,
    sizesAvailable: sizes,
    variants: buildVariants(sizes),
    tags: ["editorial", "sheer", "night-out"],
    description:
      "Panels of soft mesh intersect matte jersey to create a bodysuit that feels sharply cut, body-aware and unmistakably evening-ready.",
    details: [
      "Dual-layer front for support without bulk.",
      "Invisible elastic edges keep the line minimal.",
      "Ideal under blazers, shirting and open knits.",
    ],
    images: buildImages("obsidian-line-bodysuit"),
    palette: ["#111214", "#8c7042"],
    featured: false,
  },
  {
    id: "vel-006",
    slug: "silk-vow-slip-set",
    name: "Silk Vow Slip Set",
    tagline: "A bridal-ready pairing for slow mornings.",
    categorySlug: "bridal",
    priceCents: 19600,
    sizesAvailable: ["XS", "S", "M", "L", "XL"],
    variants: buildVariants(["XS", "S", "M", "L", "XL"]),
    tags: ["bridal", "giftable", "set"],
    description:
      "A softly draped slip-and-brief pairing with liquid handfeel and delicate trim, designed for bridal rituals and travel alike.",
    details: [
      "Includes matching brief in the same silk-touch finish.",
      "Bias-inspired shape that skims instead of clings.",
      "Packed with a soft storage pouch for gifting.",
    ],
    images: buildImages("silk-vow-slip-set"),
    palette: ["#f2e8d8", "#b99260"],
    featured: false,
  },
  {
    id: "vel-007",
    slug: "midnight-whisper-robe",
    name: "Midnight Whisper Robe",
    tagline: "Longline lounge with tonal sheen.",
    categorySlug: "lounge",
    priceCents: 15400,
    sizesAvailable: ["S", "M", "L", "XL"],
    variants: buildVariants(["S", "M", "L", "XL"]),
    tags: ["robe", "lounge", "soft sheen"],
    description:
      "A fluid robe with gentle volume, elevated by tonal piping and a long silhouette that brings ceremony to everyday unwinding.",
    details: [
      "Detachable belt with interior tie for secure wear.",
      "Wide sleeves cut for easy layering.",
      "Soft drape with a cool-touch finish.",
    ],
    images: buildImages("midnight-whisper-robe"),
    palette: ["#1d2028", "#867150"],
    featured: true,
  },
  {
    id: "vel-008",
    slug: "cashmere-hush-bralette",
    name: "Cashmere Hush Bralette",
    tagline: "Relaxed support for quiet indulgence.",
    categorySlug: "lounge",
    priceCents: 8600,
    sizesAvailable: ["XS", "S", "M", "L"],
    variants: buildVariants(["XS", "S", "M", "L"]),
    tags: ["bralette", "soft-touch", "travel"],
    description:
      "A lounge bralette with cloud-soft stretch, subtle support and a clean shape that slips into restful routines with ease.",
    details: [
      "Wire-free construction with removable pads.",
      "Wide underband for comfort through long wear.",
      "Pairs with lounge shorts or robe layers.",
    ],
    images: buildImages("cashmere-hush-bralette"),
    palette: ["#8f8076", "#c0a06d"],
    featured: false,
  },
  {
    id: "vel-009",
    slug: "moon-satin-tap-short",
    name: "Moon Satin Tap Short",
    tagline: "Lightweight lounge built for layering.",
    categorySlug: "lounge",
    priceCents: 6400,
    sizesAvailable: ["XS", "S", "M", "L", "XL"],
    variants: buildVariants(["XS", "S", "M", "L", "XL"]),
    tags: ["short", "set-ready", "satin"],
    description:
      "An easy satin tap short with a softly elasticated waist, curved hem and enough polish to feel styled even at rest.",
    details: [
      "Bias-cut inspired leg opening for movement.",
      "Smooth waistband with hidden elastic.",
      "Pairs naturally with lounge bras and robes.",
    ],
    images: buildImages("moon-satin-tap-short"),
    palette: ["#d7c7bb", "#9f7c4b"],
    featured: false,
  },
  {
    id: "vel-010",
    slug: "gilded-veil-teddy",
    name: "Gilded Veil Teddy",
    tagline: "A sheer bridal one-piece with luminous trim.",
    categorySlug: "bridal",
    priceCents: 14800,
    sizesAvailable: ["XS", "S", "M", "L"],
    variants: buildVariants(["XS", "S", "M", "L"]),
    tags: ["bridal", "teddy", "giftable"],
    description:
      "A soft tulle teddy framed with fine satin and warm metallic accents, built to feel delicate while maintaining shape and ease.",
    details: [
      "Sheer body with modestly lined bust.",
      "Soft leg curve with no harsh elastic marks.",
      "Designed to sit smoothly under robes and slips.",
    ],
    images: buildImages("gilded-veil-teddy"),
    palette: ["#f7f0e4", "#b08b57"],
    featured: false,
  },
  {
    id: "vel-011",
    slug: "atelier-shadow-corset",
    name: "Atelier Shadow Corset",
    tagline: "Modern contouring with softened structure.",
    categorySlug: "bodysuits",
    priceCents: 18200,
    sizesAvailable: ["XS", "S", "M", "L"],
    variants: buildVariants(["XS", "S", "M", "L"]),
    tags: ["corset", "structured", "occasion"],
    description:
      "This corset-led piece sharpens the waist through vertical boning channels and flexible support, keeping the look sculpted yet wearable.",
    details: [
      "Flexible boning for shape without stiffness.",
      "Front neckline cut to layer under jackets.",
      "Back paneling balances compression and comfort.",
    ],
    images: buildImages("atelier-shadow-corset"),
    palette: ["#16161a", "#6d5937"],
    featured: true,
  },
  {
    id: "vel-012",
    slug: "soft-flame-triangle-set",
    name: "Soft Flame Triangle Set",
    tagline: "Minimal coverage in a warm bronze wash.",
    categorySlug: "balconette",
    priceCents: 9800,
    sizesAvailable: ["XS", "S", "M", "L", "XL"],
    variants: buildVariants(["XS", "S", "M", "L", "XL"]),
    tags: ["set", "minimal", "bronze"],
    description:
      "A pared-back set that blends silky stretch, soft hardware and a warm bronze tint for an effortless, modern intimate layer.",
    details: [
      "Triangle cup with refined elastic finish.",
      "Matching brief included in the set price.",
      "Light support suited to all-day wear.",
    ],
    images: buildImages("soft-flame-triangle-set"),
    palette: ["#5f4a3d", "#b48a56"],
    featured: false,
  },
];

const generatedProductDescriptors = [
  "Sable Edit",
  "Velvet Atelier",
  "Lustre Line",
  "Nocturne Edition",
  "Rose Dust",
  "Quiet Gold",
  "Moonline",
  "Studio Cut",
  "Private Reserve",
  "Silk Script",
  "Afterglow",
  "Contour Series",
  "Ember Tone",
  "Gilded Shape",
  "Soft Focus",
  "Lumiere",
  "Night Bloom",
  "Satin Form",
  "Muse Layer",
  "Refined Curve",
  "Evening Veil",
  "Opaline",
  "Shadow Tailored",
  "Fine Mesh",
  "Pearl Edit",
  "Velour Room",
  "Ivory Studio",
  "Drape Line",
  "Golden Slip",
  "Cloud Touch",
  "Still Hour",
  "Obscura",
  "Muse Archive",
  "Silken Frame",
  "Signature Room",
  "Contour Glow",
  "Soft Bronze",
  "Atelier Light",
] as const;

function toSlugSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const generatedProducts: Product[] = generatedProductDescriptors.map((descriptor, index) => {
  const source = seedProducts[index % seedProducts.length];
  const variantNumber = seedProducts.length + index + 1;
  const slug = `${source.slug}-${toSlugSegment(descriptor)}`;
  const descriptorTag = toSlugSegment(descriptor);

  return {
    ...source,
    id: `vel-${String(variantNumber).padStart(3, "0")}`,
    slug,
    name: `${source.name} ${descriptor}`,
    tagline: `${source.tagline} ${descriptor}.`,
    priceCents: source.priceCents + ((index % 5) + 1) * 400,
    tags: Array.from(new Set([source.tags[0], source.tags[1], descriptorTag].filter(Boolean))),
    description: `${source.description} This variation extends the original silhouette with a limited-run styling direction curated for broader catalog depth.`,
    details: [
      ...source.details.slice(0, 2),
      `Edition finish: ${descriptor} with the same core fit architecture as the original style.`,
    ],
    images: buildImages(slug),
    featured: index % 4 === 0,
  };
});

export const mockProducts: Product[] = [...seedProducts, ...generatedProducts];

interface ProductFilters {
  categorySlug?: string;
  slug?: string;
}

export function getMockProducts(filters?: ProductFilters): Product[] {
  return mockProducts.filter((product) => {
    if (filters?.categorySlug && product.categorySlug !== filters.categorySlug) {
      return false;
    }

    if (filters?.slug && product.slug !== filters.slug) {
      return false;
    }

    return true;
  });
}

export function getMockProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((product) => product.slug === slug);
}
