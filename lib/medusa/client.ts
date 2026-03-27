import type { Category, Product, ProductVariant, Size } from "@/types/catalog";

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const MEDUSA_API_KEY = process.env.MEDUSA_PUBLISHABLE_KEY || "";

interface MedusaRequestOptions {
  path: string;
  params?: Record<string, string>;
  next?: NextFetchRequestConfig;
}

async function medusaFetch<T>(options: MedusaRequestOptions): Promise<T> {
  const url = new URL(options.path, MEDUSA_BACKEND_URL);

  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...(MEDUSA_API_KEY ? { "x-publishable-api-key": MEDUSA_API_KEY } : {}),
    },
    next: options.next ?? {
      revalidate: process.env.NODE_ENV === "development" ? 5 : 300,
    },
  });

  if (!res.ok) {
    throw new Error(`Medusa API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ── Type mapping from Medusa → Veloura ──────────────────────────

interface MedusaProduct {
  id: string;
  handle: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  status: string;
  tags: Array<{ id: string; value: string }>;
  images: Array<{ id: string; url: string }>;
  options: Array<{ id: string; title: string; values: Array<{ id: string; value: string }> }>;
  variants: Array<{
    id: string;
    title: string;
    sku: string | null;
    options:
      | Array<{ id: string; value: string; option?: { title: string } }>
      | Record<string, string>;
    calculated_price?: {
      calculated_amount: number;
      currency_code: string;
    };
    prices?: Array<{ amount: number; currency_code: string }>;
    manage_inventory: boolean;
    inventory_quantity?: number;
  }>;
  categories: Array<{ id: string; handle: string; name: string }>;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface MedusaCategory {
  id: string;
  handle: string;
  name: string;
  description: string;
  metadata: Record<string, unknown> | null;
  rank: number;
}

function normalizeImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "placeholdpicsum.dev") {
      const seed = parsed.searchParams.get("seed") || "default";
      return `https://picsum.photos/seed/${seed}/600/800`;
    }
    return url;
  } catch {
    return url;
  }
}

function mapMedusaProduct(p: MedusaProduct): Product {
  const meta = p.metadata ?? {};
  const sizes = extractSizes(p);
  const firstVariantPrice = extractPrice(p);

  return {
    id: p.id,
    slug: p.handle,
    name: p.title,
    tagline: p.subtitle || "",
    categorySlug: p.categories?.[0]?.handle || "",
    priceCents: firstVariantPrice,
    sizesAvailable: sizes,
    variants: sizes.map(
      (size): ProductVariant => ({
        size,
        inStock: true,
        label: `${size} ready to ship`,
      }),
    ),
    tags: p.tags?.map((t) => t.value) || [],
    description: p.description || "",
    details: parseDetails(meta.details),
    images: p.images?.map((img) => normalizeImageUrl(img.url)) || [],
    palette: parsePalette(meta.palette_primary, meta.palette_secondary),
    featured: meta.featured === true || meta.featured === "true",
  };
}

function extractSizes(p: MedusaProduct): Size[] {
  const sizeOption = p.options?.find((o) => o.title.toLowerCase() === "size");

  if (sizeOption?.values) {
    return sizeOption.values
      .map((v) => v.value as Size)
      .filter((s): s is Size => ["XS", "S", "M", "L", "XL"].includes(s));
  }

  return [];
}

function extractPrice(p: MedusaProduct): number {
  const variant = p.variants?.[0];
  if (!variant) return 0;

  if (variant.calculated_price) {
    return variant.calculated_price.calculated_amount;
  }

  const usdPrice = variant.prices?.find((pr) => pr.currency_code === "usd");
  return usdPrice?.amount ?? variant.prices?.[0]?.amount ?? 0;
}

function parseDetails(raw: unknown): string[] {
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw.map(String);
  return [];
}

function parsePalette(primary: unknown, secondary: unknown): [string, string] {
  return [
    typeof primary === "string" ? primary : "#1b1a1e",
    typeof secondary === "string" ? secondary : "#7e6843",
  ];
}

// ── SEO copy for categories (stored here since Medusa categories
//    don't have a seoCopy field — we keep this in the frontend) ───

const CATEGORY_SEO: Record<string, { seoCopy: string; heroEyebrow: string }> = {
  balconette: {
    seoCopy:
      "La categoria balconette de Veloura fue pensada para clientas que buscan estructura impecable sin perder ligereza visual. Cada silueta eleva el busto con una linea limpia, copas suaves y tirantes refinados que equilibran soporte con una presencia silenciosa. Trabajamos satines mates, microtules y encajes contenidos para que la prenda se sienta lujosa desde el primer contacto, pero tambien funcional en la rutina diaria. El resultado es una seleccion que acompana camisas abiertas, vestidos con escote y estilismos de noche sin sentirse excesiva. En esta familia de producto el ajuste importa, por eso las tallas fueron curadas para mantener forma, suavidad y confort durante todo el dia. Si buscas una base elegante para un guardarropa intimo moderno, esta coleccion ofrece piezas con caracter, acabados delicados y una sensualidad precisa, sobria y claramente premium.",
    heroEyebrow: "Sculpted lift",
  },
  bodysuits: {
    seoCopy:
      "Los bodysuits de Veloura convierten la lenceria en una pieza de estilo con vocacion de guardarropa completo. Son prendas construidas para verse tan bien debajo de un blazer como dentro de una rutina intima cuidada. La arquitectura visual parte de cortes largos, compresion moderada y paneles transparentes que definen la figura sin rigidez. En esta categoria el lujo no depende del exceso, sino de la precision: costuras discretas, tacto sedoso, brillo controlado y una silueta que estiliza con naturalidad. Cada modelo fue desarrollado para acompanar movimiento real, por eso el ajuste abraza sin presionar y mantiene estabilidad durante horas. El resultado es una propuesta sobria, editorial y versatil que responde a quien quiere una prenda sensual, funcional y muy pulida. Si tu armario pide piezas que cruzan el limite entre interiorismo y moda, este es el punto de partida mas consistente de la coleccion.",
    heroEyebrow: "Second-skin tailoring",
  },
  bridal: {
    seoCopy:
      "La linea bridal de Veloura traduce el ritual previo a una celebracion en una experiencia mas calma, mas elegante y mejor resuelta. Aqui se encuentran tonos suaves, brillos discretos y texturas que evocan ceremonia sin caer en lo obvio. Esta categoria fue diseniada para acompanarte desde la prueba del vestido hasta la ultima capa del look final, con piezas que respetan la delicadeza de la ocasion y a la vez ofrecen soporte confiable. Las transparencias estan medidas, los acabados son limpios y el tacto prioriza comodidad para que cada prenda se sienta especial durante muchas horas. Pensamos esta seleccion para novias, eventos de compromiso, lunas de miel y cualquier momento donde el detalle importa tanto como la presencia general. El resultado es una curaduria de lenceria luminosa, moderna y refinada que mantiene la identidad minimalista de Veloura mientras introduce un lenguaje mas ceremonial.",
    heroEyebrow: "Ceremony edit",
  },
  lounge: {
    seoCopy:
      "La categoria lounge parte de una idea simple: el confort tambien puede sentirse profundamente lujoso. Veloura propone aqui piezas suaves, serenas y visualmente limpias para quienes valoran la intimidad cotidiana tanto como la estetica. Los tejidos fueron elegidos por su caida amable, su tacto envolvente y su capacidad de acompanar horas largas en casa, viajes o capas ligeras de descanso. No se trata de ropa de estar sin intencion, sino de una extension del mismo criterio que define toda la marca: proporciones equilibradas, detalles sutiles y una sensualidad tranquila. Esta coleccion favorece combinaciones faciles, capas livianas y una silueta relajada que nunca pierde pulso editorial. Si buscas prendas que te permitan bajar el ritmo sin renunciar a una presencia cuidada, esta familia concentra el lado mas sereno de Veloura con acabados premium, tonos profundos y un enfoque claro en bienestar sofisticado.",
    heroEyebrow: "Quiet indulgence",
  },
};

function mapMedusaCategory(c: MedusaCategory): Category {
  const seo = CATEGORY_SEO[c.handle] ?? { seoCopy: "", heroEyebrow: "" };

  return {
    id: c.id,
    slug: c.handle,
    name: c.name,
    description: c.description || "",
    seoCopy: seo.seoCopy,
    heroEyebrow: seo.heroEyebrow,
  };
}

// ── Public API ───────────────────────────────────────────────────

export async function getProducts(filters?: {
  categorySlug?: string;
  slug?: string;
}): Promise<Product[]> {
  const params: Record<string, string> = {
    fields:
      "id,handle,title,subtitle,description,status,created_at,updated_at,metadata,*variants,*variants.prices,*images,*tags,*categories,*options,*options.values",
    limit: "100",
  };

  if (filters?.slug) {
    params.handle = filters.slug;
  }

  if (filters?.categorySlug) {
    params["category_id"] = await getCategoryIdByHandle(filters.categorySlug);
  }

  const data = await medusaFetch<{ products: MedusaProduct[]; count: number }>({
    path: "/store/products",
    params,
  });

  return data.products.map(mapMedusaProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts({ slug });
  return products[0];
}

export async function getCategories(): Promise<Category[]> {
  const data = await medusaFetch<{ product_categories: MedusaCategory[]; count: number }>({
    path: "/store/product-categories",
    params: { limit: "50" },
  });

  return data.product_categories.map(mapMedusaCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const data = await medusaFetch<{ product_categories: MedusaCategory[]; count: number }>({
    path: "/store/product-categories",
    params: { handle: slug, limit: "1" },
  });

  const cat = data.product_categories[0];
  return cat ? mapMedusaCategory(cat) : undefined;
}

export async function getProductPriceById(productId: string): Promise<number> {
  const data = await medusaFetch<{ product: MedusaProduct }>({
    path: `/store/products/${productId}`,
    params: {
      fields: "*variants,*variants.prices",
    },
  });

  return extractPrice(data.product);
}

// ── Internal helpers ─────────────────────────────────────────────

let categoryCache: Map<string, string> | null = null;

async function getCategoryIdByHandle(handle: string): Promise<string> {
  if (!categoryCache) {
    const cats = await medusaFetch<{ product_categories: MedusaCategory[] }>({
      path: "/store/product-categories",
      params: { limit: "50" },
    });
    categoryCache = new Map(cats.product_categories.map((c) => [c.handle, c.id]));
  }

  return categoryCache.get(handle) || "";
}
