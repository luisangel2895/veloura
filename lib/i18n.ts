export type Locale = "es" | "en";

export function resolveLocale(input?: string | null): Locale {
  if (!input) {
    return "es";
  }

  const normalized = input.toLowerCase();

  if (normalized.includes("en")) {
    return "en";
  }

  return "es";
}

export const messages = {
  es: {
    languageLabel: "Idioma",
    languageSpanish: "ES",
    languageEnglish: "EN",
    themeToggle: "Cambiar tema",
    headerNavNewArrivals: "Novedades",
    headerNavBalconette: "Balconette",
    headerNavBridal: "Bridal",
    headerNavBodysuits: "Bodysuits",
    headerNavLounge: "Lounge",
    headerCart: "Abrir carrito",
    footerDescription:
      "Lenceria contemporanea con enfoque editorial, construida para escalar de front-end demo a un backend real sin rehacer la base.",
    footerHome: "Inicio",
    footerCart: "Carrito",
    footerCheckout: "Checkout",
    filterSize: "Talla",
    filterCategory: "Categoria",
    filterSort: "Orden",
    filterAll: "Todo",
    filterFeatured: "Destacados",
    filterPriceLow: "Precio menor",
    filterPriceHigh: "Precio mayor",
    filterAZ: "A-Z",
    filterClear: "Limpiar filtros",
    filterLockedCategoryHelp:
      "Esta coleccion mantiene la categoria fija por ruta mientras la talla y el orden siguen siendo persistentes.",
    noProductsTitle: "No hay productos para estos filtros.",
    noProductsDescription:
      "Prueba una talla mas amplia o reinicia los filtros para volver a ver el catalogo completo.",
    privateAtelier: "Atelier Privado",
    intimacyRefined: "Intimidad, refinada.",
    architectureCopy:
      "Construido con una API mock tipada, cache de consultas, filtros sincronizados con URL y stores listos para crecer hacia un backend real.",
    complimentaryPouch: "Bolsa textil de cortesia",
    editorialNotes: "Notas Editoriales",
    paginationPage: "Pagina",
    paginationOf: "de",
    paginationPrevious: "Anterior",
    paginationNext: "Siguiente",
    homeTitle: "Lenceria y loungewear de lujo con una mirada editorial sobria.",
    homeDescription:
      "Descubre una seleccion curada de siluetas balconette, capas para ceremonia y piezas lounge pensadas desde un minimalismo premium.",
    homePromoLabel: "Oferta privada",
    homePromoCopy:
      "Envio express de cortesia en pedidos mayores a $180 y empaques discretos en toda la coleccion mock.",
    cartTitle: "Carrito",
    cartEmptyTitle: "Tu carrito esta vacio.",
    cartEmptyDescription:
      "Empieza por la seleccion principal y agrega una pieza con talla elegida para ver el estado persistido en localStorage.",
    cartReturn: "Volver al atelier",
    cartSummary: "Resumen de pedido",
    cartSubtotal: "Subtotal",
    cartProceed: "Ir a checkout",
    cartRemove: "Eliminar",
    cartRestore: "Restaurando tu carrito guardado desde localStorage.",
    checkoutTitle: "Checkout",
    checkoutLoading:
      "Cargando el carrito mas reciente antes de entrar al flujo de checkout.",
    checkoutEmpty:
      "Agrega al menos un producto antes de entrar al flujo de checkout controlado por reducer.",
    checkoutBrowse: "Ver productos",
    checkoutStateMachine: "Maquina de estados con reducer",
    checkoutShipping: "shipping",
    checkoutPayment: "payment",
    checkoutReview: "review",
    checkoutComplete: "complete",
    checkoutBack: "Volver",
    checkoutContinue: "Continuar",
    checkoutConfirm: "Confirmar pedido",
    checkoutOrderConfirmed: "Pedido confirmado.",
    checkoutOrderSummary: "Resumen de pedido",
    productHome: "Inicio",
    productDetails: "Detalles del producto",
    productSizing: "Fit y tallas",
    productDelivery: "Envio y cuidado",
    productSelectSize: "Elegir talla",
    productAddToCart: "Agregar al carrito",
    productAddedToCart: "Agregado al carrito",
    productPrevImage: "Mostrar imagen anterior",
    productNextImage: "Mostrar imagen siguiente",
    productShowFrame: "Mostrar frame",
    productFrame: "Frame",
  },
  en: {
    languageLabel: "Language",
    languageSpanish: "ES",
    languageEnglish: "EN",
    themeToggle: "Toggle theme",
    headerNavNewArrivals: "New arrivals",
    headerNavBalconette: "Balconette",
    headerNavBridal: "Bridal",
    headerNavBodysuits: "Bodysuits",
    headerNavLounge: "Lounge",
    headerCart: "Open cart",
    footerDescription:
      "Contemporary lingerie with an editorial point of view, built to scale from a front-end demo into a real backend without reworking the foundation.",
    footerHome: "Home",
    footerCart: "Cart",
    footerCheckout: "Checkout",
    filterSize: "Size",
    filterCategory: "Category",
    filterSort: "Sort",
    filterAll: "All",
    filterFeatured: "Featured",
    filterPriceLow: "Price low",
    filterPriceHigh: "Price high",
    filterAZ: "A-Z",
    filterClear: "Clear filters",
    filterLockedCategoryHelp:
      "This collection keeps the route category fixed while size and sort stay persistent.",
    noProductsTitle: "No products match these filters.",
    noProductsDescription:
      "Try a broader size range or reset the filters to surface the full catalog again.",
    privateAtelier: "Private Atelier",
    intimacyRefined: "Intimacy, refined.",
    architectureCopy:
      "Built with a typed mock API, query caching, URL-synced filters and store slices that can graduate to a real commerce backend.",
    complimentaryPouch: "Complimentary garment pouch",
    editorialNotes: "Editorial Notes",
    paginationPage: "Page",
    paginationOf: "of",
    paginationPrevious: "Previous",
    paginationNext: "Next",
    homeTitle: "Luxury loungewear and lingerie with editorial restraint.",
    homeDescription:
      "Discover a tightly curated edit of balconette silhouettes, ceremony-ready layers and soft lounge staples designed with a luxury minimal point of view.",
    homePromoLabel: "Private client offer",
    homePromoCopy:
      "Complimentary express dispatch on orders over $180 and discreet packaging across the entire mock collection.",
    cartTitle: "Cart",
    cartEmptyTitle: "Your cart is empty.",
    cartEmptyDescription:
      "Start with the signature edit and add a size-selected piece to see the cart state persisted through local storage.",
    cartReturn: "Return to the atelier",
    cartSummary: "Order summary",
    cartSubtotal: "Subtotal",
    cartProceed: "Proceed to checkout",
    cartRemove: "Remove",
    cartRestore: "Restoring your saved cart from local storage.",
    checkoutTitle: "Checkout",
    checkoutLoading: "Loading the latest cart snapshot before entering checkout.",
    checkoutEmpty:
      "Add at least one item before entering the reducer-driven checkout flow.",
    checkoutBrowse: "Browse products",
    checkoutStateMachine: "Reducer state machine",
    checkoutShipping: "shipping",
    checkoutPayment: "payment",
    checkoutReview: "review",
    checkoutComplete: "complete",
    checkoutBack: "Back",
    checkoutContinue: "Continue",
    checkoutConfirm: "Confirm order",
    checkoutOrderConfirmed: "Order confirmed.",
    checkoutOrderSummary: "Order summary",
    productHome: "Home",
    productDetails: "Product details",
    productSizing: "Fit and sizing",
    productDelivery: "Delivery and care",
    productSelectSize: "Select size",
    productAddToCart: "Add to cart",
    productAddedToCart: "Added to cart",
    productPrevImage: "Show previous product image",
    productNextImage: "Show next product image",
    productShowFrame: "Show frame",
    productFrame: "Frame",
  },
} as const;
