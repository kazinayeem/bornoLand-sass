export type SectionCategory =
  | "hero" | "products" | "category" | "promotions" | "trust"
  | "content" | "media" | "social" | "marketing" | "advanced"
  | "layout" | "header" | "footer";

export type PropType =
  | "text" | "textarea" | "select" | "color" | "image" | "number"
  | "toggle" | "range" | "align" | "url" | "video" | "grid-columns"
  | "spacing" | "shadow" | "font" | "icon" | "section-divider";

export type SectionPropDef = {
  label: string;
  type: PropType;
  default: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  group?: "content" | "layout" | "background" | "typography" | "spacing" | "advanced";
  responsive?: boolean;
};

export type SectionDef = {
  type: string;
  label: string;
  category: SectionCategory;
  icon: string;
  description: string;
  props: Record<string, SectionPropDef>;
};

const sectionTypeAliases: Record<string, string> = {
  hero: "hero-banner",
  features: "category-grid",
  products: "featured-products",
  cta: "newsletter",
  footer: "simple-footer",
};

// ─── Shared prop groups ──────────────────────────────────────────

const G = {
  text: (k: string, l: string, d: string, g: SectionPropDef["group"] = "content"): SectionPropDef =>
    ({ label: l, type: "text", default: d, group: g }),
  textarea: (k: string, l: string, d: string, g: SectionPropDef["group"] = "content"): SectionPropDef =>
    ({ label: l, type: "textarea", default: d, group: g }),
  select: (k: string, l: string, d: string, opts: { value: string; label: string }[], g: SectionPropDef["group"] = "content"): SectionPropDef =>
    ({ label: l, type: "select", default: d, options: opts, group: g }),
  color: (k: string, l: string, d: string, g: SectionPropDef["group"] = "background"): SectionPropDef =>
    ({ label: l, type: "color", default: d, group: g }),
  image: (k: string, l: string, g: SectionPropDef["group"] = "background"): SectionPropDef =>
    ({ label: l, type: "image", default: "", group: g }),
  toggle: (k: string, l: string, d: string, g: SectionPropDef["group"] = "content"): SectionPropDef =>
    ({ label: l, type: "toggle", default: d, group: g }),
  range: (k: string, l: string, d: string, min: number, max: number, step = 1, g: SectionPropDef["group"] = "layout"): SectionPropDef =>
    ({ label: l, type: "range", default: d, min, max, step, group: g }),
  align: (): SectionPropDef => ({ label: "Text Alignment", type: "align", default: "center", group: "typography" }),
  video: (k: string, l: string): SectionPropDef => ({ label: l, type: "video", default: "", group: "content" }),
  number: (k: string, l: string, d: string, g: SectionPropDef["group"] = "content"): SectionPropDef =>
    ({ label: l, type: "number", default: d, group: g }),
  gridCols: (): SectionPropDef => ({
    label: "Grid Columns", type: "grid-columns", default: "4",
    options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }, { value: "6", label: "6" }], group: "layout",
  }),
};

// ─── Common prop sets ────────────────────────────────────────────

const layout = {
  maxWidth: G.select("maxWidth", "Max Width", "1200px", [
    { value: "100%", label: "Full Width" }, { value: "800px", label: "Narrow" },
    { value: "1200px", label: "Default" }, { value: "1400px", label: "Wide" },
  ], "layout"),
  shadow: G.select("shadow", "Shadow", "none", [
    { value: "none", label: "None" }, { value: "sm", label: "Small" },
    { value: "md", label: "Medium" }, { value: "lg", label: "Large" },
  ], "layout"),
  borderRadius: G.range("borderRadius", "Border Radius", "12", 0, 48, 4, "layout"),
  borderWidth: G.range("borderWidth", "Border Width", "0", 0, 8, 1, "layout"),
  borderColor: G.color("borderColor", "Border Color", "", "layout"),
  visibility: G.select("visibility", "Visibility", "all", [
    { value: "all", label: "All Devices" }, { value: "desktop-only", label: "Desktop Only" },
    { value: "tablet-only", label: "Tablet Only" }, { value: "mobile-only", label: "Mobile Only" },
  ], "advanced"),
  animation: G.select("animation", "Animation", "none", [
    { value: "none", label: "None" }, { value: "fadeIn", label: "Fade In" },
    { value: "slideUp", label: "Slide Up" }, { value: "slideInLeft", label: "Slide In Left" },
    { value: "slideInRight", label: "Slide In Right" }, { value: "zoomIn", label: "Zoom In" },
  ], "advanced"),
  paddingY: G.range("paddingY", "Padding Y", "48", 0, 120, 8, "spacing"),
  paddingX: G.range("paddingX", "Padding X", "16", 0, 64, 8, "spacing"),
  marginTop: G.range("marginTop", "Margin Top", "0", 0, 120, 8, "spacing"),
  marginBottom: G.range("marginBottom", "Margin Bottom", "0", 0, 120, 8, "spacing"),
};

const bg = {
  bgColor: G.color("bgColor", "Background Color", ""),
  bgGradient: G.text("bgGradient", "Gradient", "", "background"),
  bgImage: G.image("bgImage", "Background Image"),
  bgOverlayColor: G.color("bgOverlayColor", "Overlay Color", ""),
  bgOverlayOpacity: G.range("bgOverlayOpacity", "Overlay Opacity", "40", 0, 100, 5, "background"),
};

const typography = {
  textColor: G.color("textColor", "Text Color", "", "typography"),
  fontSize: G.select("fontSize", "Font Size", "lg", [
    { value: "sm", label: "Small" }, { value: "md", label: "Medium" },
    { value: "lg", label: "Large" }, { value: "xl", label: "Extra Large" },
  ], "typography"),
  textAlignment: G.align(),
};

function merge(...sources: Record<string, SectionPropDef>[]): Record<string, SectionPropDef> {
  return Object.assign({}, ...sources);
}

// ─── REGISTRY ─────────────────────────────────────────────────────

export const sectionRegistry: SectionDef[] = [
  // ════════ HERO ════════
  {
    type: "image-carousel", label: "Image Carousel", category: "media", icon: "GalleryHorizontal", description: "Image carousel, slider, gallery slider, banner slider, and product slider with unlimited slides",
    props: merge(
      {
        title: G.text("title", "Section Title", "Featured Gallery"),
        subtitle: G.text("subtitle", "Subtitle", "Swipe through featured visuals"),
        autoplay: G.toggle("autoplay", "Autoplay", "true"),
        autoplaySpeed: G.number("autoplaySpeed", "Autoplay Speed (ms)", "5000"),
        infiniteLoop: G.toggle("infiniteLoop", "Infinite Loop", "true"),
        pauseOnHover: G.toggle("pauseOnHover", "Pause on Hover", "true"),
        touchSwipe: G.toggle("touchSwipe", "Touch Swipe", "true"),
        mouseDrag: G.toggle("mouseDrag", "Mouse Drag", "true"),
        keyboardNavigation: G.toggle("keyboardNavigation", "Keyboard Navigation", "true"),
        arrowNavigation: G.toggle("arrowNavigation", "Arrow Navigation", "true"),
        dotNavigation: G.toggle("dotNavigation", "Dot Navigation", "true"),
        transition: G.select("transition", "Transition", "slide", [{ value: "slide", label: "Slide" }, { value: "fade", label: "Fade" }], "layout"),
        sliderHeight: G.select("sliderHeight", "Slider Height", "lg", [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "Extra Large" }, { value: "full", label: "Full Screen" }], "layout"),
        desktopHeight: G.text("desktopHeight", "Desktop Height", "560px", "layout"),
        tabletHeight: G.text("tabletHeight", "Tablet Height", "420px", "layout"),
        mobileHeight: G.text("mobileHeight", "Mobile Height", "320px", "layout"),
        contentWidth: G.select("contentWidth", "Content Width", "boxed", [{ value: "full", label: "Full Width" }, { value: "boxed", label: "Boxed" }], "layout"),
      },
      layout, bg, typography,
    ),
  },
  {
    type: "hero-banner", label: "Hero Banner", category: "hero", icon: "Layout", description: "Full-width banner with headline, CTA, and background image",
    props: merge(
      { kicker: G.text("kicker", "Kicker / Badge", "Welcome"), headline: G.text("headline", "Headline", "Welcome to Our Store"), subheadline: G.textarea("subheadline", "Subheadline", "Discover amazing products curated just for you"), buttonText: G.text("buttonText", "Button Text", "Shop Now"), buttonLink: G.text("buttonLink", "Button Link", "/shop"), secondaryButtonText: G.text("secondaryButtonText", "Secondary Button Text", "Learn More"), secondaryButtonLink: G.text("secondaryButtonLink", "Secondary Button Link", "/about"), heroHeight: G.select("heroHeight", "Height", "md", [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "full", label: "Full Screen" }], "layout"), imageUrl: G.image("imageUrl", "Image"), mobileImageUrl: G.image("mobileImageUrl", "Mobile Image"), overlayColor: G.color("overlayColor", "Overlay Color", "rgba(15,23,42,0.45)"), overlayOpacity: G.range("overlayOpacity", "Overlay Opacity", "45", 0, 100, 5), showVideoModal: G.toggle("showVideoModal", "Show Video Modal", "false"), videoUrl: G.text("videoUrl", "Video URL", ""), videoButtonText: G.text("videoButtonText", "Video Button Text", "Watch Video") },
      layout, bg, typography,
    ),
  },
  {
    type: "split-hero", label: "Split Hero", category: "hero", icon: "Columns2", description: "Hero with image and text side by side",
    props: merge(
      { headline: G.text("headline", "Headline", "Your Store Title"), subheadline: G.textarea("subheadline", "Subheadline", "Description text here"), buttonText: G.text("buttonText", "Button Text", "Get Started"), buttonLink: G.text("buttonLink", "Button Link", "/shop"), imageUrl: G.image("imageUrl", "Image"), imagePosition: G.select("imagePosition", "Image Position", "right", [{ value: "left", label: "Left" }, { value: "right", label: "Right" }], "layout"), contentWidth: G.select("contentWidth", "Content Width", "50", [{ value: "40", label: "40%" }, { value: "50", label: "50%" }, { value: "60", label: "60%" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "video-hero", label: "Video Hero", category: "hero", icon: "Video", description: "Hero with background video and overlay content",
    props: merge(
      { videoUrl: G.video("videoUrl", "Video URL (MP4/YouTube)"), posterImage: G.image("posterImage", "Poster Image"), headline: G.text("headline", "Headline", "Welcome"), subheadline: G.textarea("subheadline", "Subheadline", "Description"), buttonText: G.text("buttonText", "Button Text", "Explore"), buttonLink: G.text("buttonLink", "Button Link", "/shop"), heroHeight: G.select("heroHeight", "Height", "lg", [{ value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "full", label: "Full Screen" }], "layout"), muted: G.toggle("muted", "Muted", "true"), loop: G.toggle("loop", "Loop", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "slider-hero", label: "Slider Hero", category: "hero", icon: "GalleryHorizontal", description: "Auto-rotating hero slider with multiple slides",
    props: merge(
      { slideCount: G.number("slideCount", "Number of Slides", "3"), autoplaySpeed: G.number("autoplaySpeed", "Autoplay Speed (ms)", "5000"), showArrows: G.toggle("showArrows", "Show Arrows", "true"), showDots: G.toggle("showDots", "Show Dots", "true"), slide1Image: G.image("slide1Image", "Slide 1 Image"), slide1Title: G.text("slide1Title", "Slide 1 Title", "Slide 1"), slide1ButtonText: G.text("slide1ButtonText", "Slide 1 Button Text", "Shop"), slide2Image: G.image("slide2Image", "Slide 2 Image"), slide2Title: G.text("slide2Title", "Slide 2 Title", "Slide 2"), slide2ButtonText: G.text("slide2ButtonText", "Slide 2 Button Text", "Shop"), slide3Image: G.image("slide3Image", "Slide 3 Image"), slide3Title: G.text("slide3Title", "Slide 3 Title", "Slide 3"), slide3ButtonText: G.text("slide3ButtonText", "Slide 3 Button Text", "Shop") },
      layout, bg, typography,
    ),
  },
  {
    type: "image-hero", label: "Image Hero", category: "hero", icon: "Image", description: "Clean hero with a single striking image",
    props: merge(
      { imageUrl: G.image("imageUrl", "Image"), overlay: G.toggle("overlay", "Show Overlay", "true"), headline: G.text("headline", "Headline", "Hero Title"), subheadline: G.textarea("subheadline", "Subheadline", ""), buttonText: G.text("buttonText", "Button Text", "Shop Now"), buttonLink: G.text("buttonLink", "Button Link", "/shop") },
      layout, bg, typography,
    ),
  },
  {
    type: "fullscreen-hero", label: "Fullscreen Hero", category: "hero", icon: "Maximize", description: "Full viewport height hero for maximum impact",
    props: merge(
      { imageUrl: G.image("imageUrl", "Background Image"), headline: G.text("headline", "Headline", "Bold Statement"), subheadline: G.textarea("subheadline", "Subheadline", "Supporting text"), buttonText: G.text("buttonText", "Button Text", "Get Started"), buttonLink: G.text("buttonLink", "Button Link", "/shop"), secondaryButtonText: G.text("secondaryButtonText", "Secondary Text", "Learn More"), secondaryButtonLink: G.text("secondaryButtonLink", "Secondary Link", "/about"), showScrollIndicator: G.toggle("showScrollIndicator", "Show Scroll Indicator", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "countdown-hero", label: "Countdown Hero", category: "hero", icon: "Timer", description: "Hero with countdown timer to build urgency",
    props: merge(
      { imageUrl: G.image("imageUrl", "Background Image"), headline: G.text("headline", "Headline", "Big Sale Coming"), subheadline: G.textarea("subheadline", "Subheadline", "Ends in..."), buttonText: G.text("buttonText", "Button Text", "Shop Now"), buttonLink: G.text("buttonLink", "Button Link", "/shop"), targetDate: G.text("targetDate", "Target Date", "2026-12-31"), targetTime: G.text("targetTime", "Target Time", "23:59") },
      layout, bg, typography,
    ),
  },
  {
    type: "flash-sale-hero", label: "Flash Sale Hero", category: "hero", icon: "Zap", description: "Urgency-driven hero for flash sales",
    props: merge(
      { imageUrl: G.image("imageUrl", "Background Image"), headline: G.text("headline", "Headline", "Flash Sale!"), subheadline: G.textarea("subheadline", "Subheadline", "Limited time offer"), buttonText: G.text("buttonText", "Button Text", "Shop Sale"), buttonLink: G.text("buttonLink", "Button Link", "/sale"), discountLabel: G.text("discountLabel", "Discount Label", "50% OFF"), endDate: G.text("endDate", "End Date", "2026-12-31"), showTimer: G.toggle("showTimer", "Show Countdown", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-hero", label: "Product Hero", category: "hero", icon: "ShoppingBag", description: "Hero featuring a specific product",
    props: merge(
      { productImage: G.image("productImage", "Product Image"), productName: G.text("productName", "Product Name", "Featured Product"), productPrice: G.text("productPrice", "Product Price", "$49.99"), originalPrice: G.text("originalPrice", "Original Price", "$79.99"), description: G.textarea("description", "Description", "Product description"), buttonText: G.text("buttonText", "Button Text", "Buy Now"), buttonLink: G.text("buttonLink", "Button Link", "/product/featured"), badge: G.text("badge", "Badge Text", "New Arrival") },
      layout, bg, typography,
    ),
  },

  // ════════ PRODUCTS ════════
  {
    type: "featured-products", label: "Featured Products", category: "products", icon: "Star", description: "Display featured/picked products",
    props: merge(
      { title: G.text("title", "Section Title", "Featured Products"), subtitle: G.text("subtitle", "Subtitle", "Handpicked favorites"), gridColumns: G.gridCols(), productCount: G.number("productCount", "Max Products", "8"), showBadges: G.toggle("showBadges", "Show Badges", "true"), showRatings: G.toggle("showRatings", "Show Ratings", "true"), showViewAll: G.toggle("showViewAll", "Show View All Link", "true"), viewAllLink: G.text("viewAllLink", "View All Link", "/shop") },
      layout, bg, typography,
    ),
  },
  {
    type: "new-arrivals", label: "New Arrivals", category: "products", icon: "PackagePlus", description: "Showcase newest products",
    props: merge(
      { title: G.text("title", "Section Title", "New Arrivals"), subtitle: G.text("subtitle", "Subtitle", "Fresh from the collection"), gridColumns: G.gridCols(), productCount: G.number("productCount", "Max Products", "8"), showBadge: G.toggle("showBadge", "Show 'New' Badge", "true"), daysNew: G.number("daysNew", "Days considered New", "30") },
      layout, bg, typography,
    ),
  },
  {
    type: "best-sellers", label: "Best Sellers", category: "products", icon: "TrendingUp", description: "Show best-selling products",
    props: merge(
      { title: G.text("title", "Section Title", "Best Sellers"), subtitle: G.text("subtitle", "Subtitle", "Most popular products"), gridColumns: G.gridCols(), productCount: G.number("productCount", "Max Products", "8") },
      layout, bg, typography,
    ),
  },
  {
    type: "trending-products", label: "Trending Products", category: "products", icon: "Flame", description: "Display trending/hot products",
    props: merge(
      { title: G.text("title", "Section Title", "Trending Now"), subtitle: G.text("subtitle", "Subtitle", "What everyone's buying"), gridColumns: G.gridCols(), productCount: G.number("productCount", "Max Products", "8") },
      layout, bg, typography,
    ),
  },
  {
    type: "flash-sale", label: "Flash Sale Products", category: "products", icon: "Zap", description: "Flash sale with countdown and discounted products",
    props: merge(
      { title: G.text("title", "Section Title", "Flash Sale"), subtitle: G.text("subtitle", "Subtitle", "Limited time offers"), gridColumns: G.gridCols(), productCount: G.number("productCount", "Max Products", "4"), endDate: G.text("endDate", "Sale End Date", "2026-12-31"), showTimer: G.toggle("showTimer", "Show Timer", "true"), timerLabel: G.text("timerLabel", "Timer Label", "Sale Ends In:") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-grid", label: "Product Grid", category: "products", icon: "Grid3x3", description: "Customizable product grid layout",
    props: merge(
      { title: G.text("title", "Section Title", "Our Products"), subtitle: G.text("subtitle", "Subtitle", ""), gridColumns: G.gridCols(), productCount: G.number("productCount", "Products Per Page", "12"), showFilters: G.toggle("showFilters", "Show Category Filters", "false"), showSort: G.toggle("showSort", "Show Sort Options", "false") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-carousel", label: "Product Carousel", category: "products", icon: "GalleryHorizontalEnd", description: "Horizontal scrolling product carousel",
    props: merge(
      { title: G.text("title", "Section Title", "Products"), subtitle: G.text("subtitle", "Subtitle", ""), productCount: G.number("productCount", "Max Products", "12"), autoplay: G.toggle("autoplay", "Auto Play", "true"), autoplaySpeed: G.number("autoplaySpeed", "Speed (ms)", "3000"), showArrows: G.toggle("showArrows", "Show Arrows", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-slider", label: "Product Slider", category: "products", icon: "SlidersHorizontal", description: "Swipeable product slider",
    props: merge(
      { title: G.text("title", "Section Title", "Products"), productCount: G.number("productCount", "Max Products", "6"), slidesPerView: G.select("slidesPerView", "Slides Per View", "3", [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-tabs", label: "Product Tabs", category: "products", icon: "Tabs", description: "Tabbed product sections (Featured/New/Best Sellers)",
    props: merge(
      { title: G.text("title", "Section Title", "Products"), tab1Label: G.text("tab1Label", "Tab 1 Label", "Featured"), tab2Label: G.text("tab2Label", "Tab 2 Label", "New Arrivals"), tab3Label: G.text("tab3Label", "Tab 3 Label", "Best Sellers"), productCount: G.number("productCount", "Products Per Tab", "4") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-collection", label: "Product Collection", category: "products", icon: "Layers", description: "Display a specific product collection",
    props: merge(
      { title: G.text("title", "Section Title", "Collection"), subtitle: G.text("subtitle", "Subtitle", ""), collectionName: G.text("collectionName", "Collection Name", "Summer Collection"), gridColumns: G.gridCols(), productCount: G.number("productCount", "Max Products", "8") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-by-category", label: "Products By Category", category: "products", icon: "Tags", description: "Show products grouped by category",
    props: merge(
      { title: G.text("title", "Section Title", "Shop by Category"), gridColumns: G.gridCols(), categoriesPerRow: G.select("categoriesPerRow", "Categories Per Row", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), productsPerCategory: G.number("productsPerCategory", "Products Per Category", "4") },
      layout, bg, typography,
    ),
  },
  {
    type: "recently-viewed", label: "Recently Viewed", category: "products", icon: "Clock", description: "Recently viewed products for returning customers",
    props: merge(
      { title: G.text("title", "Section Title", "Recently Viewed"), productCount: G.number("productCount", "Max Products", "6"), gridColumns: G.gridCols() },
      layout, bg, typography,
    ),
  },
  {
    type: "recommended-products", label: "Recommended Products", category: "products", icon: "ThumbsUp", description: "AI/related recommended products",
    props: merge(
      { title: G.text("title", "Section Title", "Recommended For You"), productCount: G.number("productCount", "Max Products", "6"), gridColumns: G.gridCols() },
      layout, bg, typography,
    ),
  },
  {
    type: "related-products", label: "Related Products", category: "products", icon: "Link", description: "Products related to current product",
    props: merge(
      { title: G.text("title", "Section Title", "Related Products"), productCount: G.number("productCount", "Max Products", "4"), gridColumns: G.gridCols() },
      layout, bg, typography,
    ),
  },
  {
    type: "bundle-products", label: "Bundle Products", category: "products", icon: "Layers3", description: "Show product bundles with pricing",
    props: merge(
      { title: G.text("title", "Section Title", "Bundle & Save"), subtitle: G.text("subtitle", "Subtitle", "Save more with bundles"), gridColumns: G.gridCols(), showSavings: G.toggle("showSavings", "Show Savings", "true") },
      layout, bg, typography,
    ),
  },

  // ════════ CATEGORY ════════
  {
    type: "category-grid", label: "Category Grid", category: "category", icon: "Grid3x3", description: "Grid layout for categories",
    props: merge(
      { title: G.text("title", "Section Title", "Shop by Category"), subtitle: G.text("subtitle", "Subtitle", "Browse our collections"), gridColumns: G.gridCols(), cardStyle: G.select("cardStyle", "Card Style", "default", [{ value: "default", label: "Default" }, { value: "minimal", label: "Minimal" }, { value: "bordered", label: "Bordered" }, { value: "elevated", label: "Elevated" }], "layout"), showProductCount: G.toggle("showProductCount", "Show Product Count", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "category-slider", label: "Category Slider", category: "category", icon: "GalleryHorizontal", description: "Horizontal scrolling category cards",
    props: merge(
      { title: G.text("title", "Section Title", "Categories"), subtitle: G.text("subtitle", "Subtitle", ""), autoplay: G.toggle("autoplay", "Auto Play", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "category-masonry", label: "Category Masonry", category: "category", icon: "Columns3", description: "Masonry/pinterest-style category layout",
    props: merge(
      { title: G.text("title", "Section Title", "Categories"), subtitle: G.text("subtitle", "Subtitle", ""), columns: G.select("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "featured-categories", label: "Featured Categories", category: "category", icon: "Star", description: "Highlighted/featured category cards",
    props: merge(
      { title: G.text("title", "Section Title", "Featured Categories"), subtitle: G.text("subtitle", "Subtitle", "Top categories"), gridColumns: G.gridCols(), cardStyle: G.select("cardStyle", "Card Style", "elevated", [{ value: "default", label: "Default" }, { value: "elevated", label: "Elevated" }, { value: "overlay", label: "Overlay" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "category-banner", label: "Category Banner", category: "category", icon: "Image", description: "Single large category promotion banner",
    props: merge(
      { imageUrl: G.image("imageUrl", "Banner Image"), categoryName: G.text("categoryName", "Category Name", "New Collection"), description: G.textarea("description", "Description", "Explore our latest"), buttonText: G.text("buttonText", "Button Text", "Shop Now"), buttonLink: G.text("buttonLink", "Button Link", "/category/new") },
      layout, bg, typography,
    ),
  },
  {
    type: "mega-category-grid", label: "Mega Category Grid", category: "category", icon: "Grid2x2", description: "Large grid with multiple category cards",
    props: merge(
      { title: G.text("title", "Section Title", "Categories"), columns: G.select("columns", "Columns", "4", [{ value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }, { value: "6", label: "6" }], "layout"), showImages: G.toggle("showImages", "Show Category Images", "true"), showDescriptions: G.toggle("showDescriptions", "Show Descriptions", "false") },
      layout, bg, typography,
    ),
  },

  // ════════ PROMOTIONS ════════
  {
    type: "discount-banner", label: "Discount Banner", category: "promotions", icon: "Percent", description: "Percentage-off promotion banner",
    props: merge(
      { headline: G.text("headline", "Headline", "Big Savings!"), discountText: G.text("discountText", "Discount Text", "UP TO 40% OFF"), subheadline: G.textarea("subheadline", "Subheadline", "Limited time offer"), buttonText: G.text("buttonText", "Button Text", "Shop Sale"), buttonLink: G.text("buttonLink", "Button Link", "/sale"), bgColor: G.color("bgColor", "Background", "#ef4444"), textColor: G.color("textColor", "Text Color", "#ffffff", "typography") },
      layout, bg, typography,
    ),
  },
  {
    type: "offer-banner", label: "Offer Banner", category: "promotions", icon: "Tag", description: "Special offer announcement banner",
    props: merge(
      { headline: G.text("headline", "Headline", "Special Offer"), offerText: G.text("offerText", "Offer Details", "Buy 2 Get 1 Free"), subheadline: G.textarea("subheadline", "Subheadline", "Terms apply"), buttonText: G.text("buttonText", "Button Text", "Claim Offer"), buttonLink: G.text("buttonLink", "Button Link", "/offers"), bgImage: G.image("bgImage", "Background Image") },
      layout, bg, typography,
    ),
  },
  {
    type: "coupon-section", label: "Coupon Section", category: "promotions", icon: "Ticket", description: "Display coupon code for customers",
    props: merge(
      { headline: G.text("headline", "Headline", "Your Coupon"), couponCode: G.text("couponCode", "Coupon Code", "SAVE20"), discountValue: G.text("discountValue", "Discount Value", "20% OFF"), description: G.textarea("description", "Description", "Use code at checkout"), expiryDate: G.text("expiryDate", "Expiry Date", "2026-12-31"), bgColor: G.color("bgColor", "Background", "#f59e0b") },
      layout, typography,
    ),
  },
  {
    type: "deal-of-day", label: "Deal Of The Day", category: "promotions", icon: "Sun", description: "Daily deal with countdown timer",
    props: merge(
      { title: G.text("title", "Title", "Deal of the Day"), productName: G.text("productName", "Product Name", "Product Name"), productImage: G.image("productImage", "Product Image"), price: G.text("price", "Sale Price", "$29.99"), originalPrice: G.text("originalPrice", "Original Price", "$59.99"), buttonText: G.text("buttonText", "Button Text", "Get This Deal"), buttonLink: G.text("buttonLink", "Button Link", "/product/deal"), endDate: G.text("endDate", "End Date", "2026-12-31") },
      layout, bg, typography,
    ),
  },
  {
    type: "limited-time-offer", label: "Limited Time Offer", category: "promotions", icon: "AlarmClock", description: "Urgency-based limited time promotion",
    props: merge(
      { headline: G.text("headline", "Headline", "Limited Time Offer"), subheadline: G.textarea("subheadline", "Subheadline", "Hurry! Offer ends soon"), buttonText: G.text("buttonText", "Button Text", "Shop Now"), buttonLink: G.text("buttonLink", "Button Link", "/sale"), endDate: G.text("endDate", "End Date", "2026-12-31"), endTime: G.text("endTime", "End Time", "23:59"), bgColor: G.color("bgColor", "Background", "#dc2626"), textColor: G.color("textColor", "Text Color", "#ffffff", "typography") },
      layout, bg, typography,
    ),
  },
  {
    type: "bogo", label: "Buy One Get One", category: "promotions", icon: "Gift", description: "BOGO promotion section",
    props: merge(
      { headline: G.text("headline", "Headline", "Buy One Get One Free"), subheadline: G.textarea("subheadline", "Subheadline", "Select items only"), buttonText: G.text("buttonText", "Button Text", "Shop BOGO"), buttonLink: G.text("buttonLink", "Button Link", "/bogo"), productImage: G.image("productImage", "Product Image"), endDate: G.text("endDate", "End Date", "2026-12-31") },
      layout, bg, typography,
    ),
  },
  {
    type: "seasonal-sale", label: "Seasonal Sale", category: "promotions", icon: "Calendar", description: "Seasonal/clearance sale promotion",
    props: merge(
      { headline: G.text("headline", "Headline", "Season Sale"), subheadline: G.textarea("subheadline", "Subheadline", "Seasonal styles"), buttonText: G.text("buttonText", "Button Text", "Shop Seasonal Sale"), buttonLink: G.text("buttonLink", "Button Link", "/seasonal"), imageUrl: G.image("imageUrl", "Background Image"), seasonLabel: G.text("seasonLabel", "Season Label", "Summer 2026"), discountAmount: G.text("discountAmount", "Discount", "Up to 50% Off") },
      layout, bg, typography,
    ),
  },
  {
    type: "black-friday-banner", label: "Black Friday Banner", category: "promotions", icon: "ShoppingBag", description: "Black Friday/Cyber Monday promotion",
    props: merge(
      { headline: G.text("headline", "Headline", "BLACK FRIDAY"), subheadline: G.textarea("subheadline", "Subheadline", "Biggest Sale of the Year"), discountText: G.text("discountText", "Discount Text", "UP TO 70% OFF"), buttonText: G.text("buttonText", "Button Text", "Shop Deals"), buttonLink: G.text("buttonLink", "Button Link", "/black-friday"), imageUrl: G.image("imageUrl", "Background Image"), bgColor: G.color("bgColor", "Background", "#000000"), textColor: G.color("textColor", "Text Color", "#ffffff", "typography") },
      layout, bg, typography,
    ),
  },

  // ════════ TRUST ════════
  {
    type: "testimonials", label: "Testimonials", category: "trust", icon: "MessageSquareQuote", description: "Customer testimonials and reviews",
    props: merge(
      { title: G.text("title", "Section Title", "What Our Customers Say"), subtitle: G.text("subtitle", "Subtitle", "Real reviews from real customers"), layout: G.select("layout", "Layout", "grid", [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel" }], "layout"), cardStyle: G.select("cardStyle", "Card Style", "default", [{ value: "default", label: "Default" }, { value: "bordered", label: "Bordered" }, { value: "elevated", label: "Elevated" }], "layout"), avatarStyle: G.select("avatarStyle", "Avatar Style", "circle", [{ value: "circle", label: "Circle" }, { value: "square", label: "Square" }, { value: "none", label: "None" }], "layout"), testimonialsCount: G.number("testimonialsCount", "Number of Testimonials", "6") },
      layout, bg, typography,
    ),
  },
  {
    type: "video-testimonials", label: "Video Testimonials", category: "trust", icon: "Video", description: "Customer testimonial videos",
    props: merge(
      { title: G.text("title", "Section Title", "Video Testimonials"), subtitle: G.text("subtitle", "Subtitle", "Hear from our customers"), layout: G.select("layout", "Layout", "grid", [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "customer-reviews", label: "Customer Reviews", category: "trust", icon: "Star", description: "Aggregated customer review scores",
    props: merge(
      { title: G.text("title", "Section Title", "Customer Reviews"), averageRating: G.text("averageRating", "Average Rating", "4.8"), totalReviews: G.text("totalReviews", "Total Reviews", "1,234"), showStars: G.toggle("showStars", "Show Stars", "true"), showProgress: G.toggle("showProgress", "Show Rating Breakdown", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "star-ratings", label: "Star Ratings", category: "trust", icon: "Stars", description: "Visual star rating display",
    props: merge(
      { rating: G.text("rating", "Rating", "4.5"), maxRating: G.text("maxRating", "Max Rating", "5"), reviewCount: G.text("reviewCount", "Review Count", "500+"), text: G.text("text", "Text", "Rated by our customers") },
      layout, bg, typography,
    ),
  },
  {
    type: "trust-badges", label: "Trust Badges", category: "trust", icon: "ShieldCheck", description: "Security and trust assurance badges",
    props: merge(
      { title: G.text("title", "Section Title", "Why Shop With Us"), showPayment: G.toggle("showPayment", "Show Payment Badges", "true"), showShipping: G.toggle("showShipping", "Show Shipping Badge", "true"), showSecurity: G.toggle("showSecurity", "Show Security Badge", "true"), showGuarantee: G.toggle("showGuarantee", "Show Guarantee Badge", "true"), showSupport: G.toggle("showSupport", "Show Support Badge", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "guarantee-section", label: "Guarantee Section", category: "trust", icon: "Shield", description: "Money-back guarantee promise",
    props: merge(
      { headline: G.text("headline", "Headline", "100% Satisfaction Guaranteed"), description: G.textarea("description", "Description", "Love it or get your money back"), guaranteeDays: G.text("guaranteeDays", "Guarantee Days", "30"), icon: G.select("icon", "Icon", "shield", [{ value: "shield", label: "Shield" }, { value: "star", label: "Star" }, { value: "heart", label: "Heart" }], "layout"), bgColor: G.color("bgColor", "Background", "#f0fdf4") },
      layout, typography,
    ),
  },
  {
    type: "why-choose-us", label: "Why Choose Us", category: "trust", icon: "Heart", description: "Reasons to choose your store",
    props: merge(
      { title: G.text("title", "Section Title", "Why Choose Us"), subtitle: G.text("subtitle", "Subtitle", "What sets us apart"), columns: G.select("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), feature1Icon: G.text("feature1Icon", "Feature 1 Icon", "Truck"), feature1Text: G.text("feature1Text", "Feature 1 Text", "Free Shipping"), feature2Icon: G.text("feature2Icon", "Feature 2 Icon", "Shield"), feature2Text: G.text("feature2Text", "Feature 2 Text", "Secure Payment"), feature3Icon: G.text("feature3Icon", "Feature 3 Icon", "Headphones"), feature3Text: G.text("feature3Text", "Feature 3 Text", "24/7 Support") },
      layout, bg, typography,
    ),
  },
  {
    type: "success-stories", label: "Success Stories", category: "trust", icon: "Award", description: "Customer success stories and case studies",
    props: merge(
      { title: G.text("title", "Section Title", "Success Stories"), subtitle: G.text("subtitle", "Subtitle", "Real results from real customers"), layout: G.select("layout", "Layout", "grid", [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel" }], "layout") },
      layout, bg, typography,
    ),
  },

  // ════════ CONTENT ════════
  {
    type: "rich-text", label: "Rich Text", category: "content", icon: "FileText", description: "Rich formatted text and HTML content",
    props: merge(
      { title: G.text("title", "Title", ""), content: G.textarea("content", "Content", "Your content here"), showTitle: G.toggle("showTitle", "Show Title", "true"), columns: G.select("columns", "Text Columns", "1", [{ value: "1", label: "Single" }, { value: "2", label: "Two" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "faq", label: "FAQ", category: "content", icon: "HelpCircle", description: "Frequently asked questions accordion",
    props: merge(
      { title: G.text("title", "Section Title", "Frequently Asked Questions"), subtitle: G.text("subtitle", "Subtitle", "Got questions? We've got answers"), faqCount: G.number("faqCount", "Number of FAQs", "5"), layout: G.select("layout", "Layout", "accordion", [{ value: "accordion", label: "Accordion" }, { value: "list", label: "List" }], "layout"), showSearch: G.toggle("showSearch", "Show Search", "false") },
      layout, bg, typography,
    ),
  },
  {
    type: "accordion", label: "Accordion", category: "content", icon: "ChevronsUpDown", description: "Expandable accordion content blocks",
    props: merge(
      { title: G.text("title", "Section Title", "Details"), items: G.number("items", "Number of Items", "4"), openFirst: G.toggle("openFirst", "Open First by Default", "true"), multiOpen: G.toggle("multiOpen", "Allow Multiple Open", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "feature-list", label: "Feature List", category: "content", icon: "ListChecks", description: "Bulleted feature lists with icons",
    props: merge(
      { title: G.text("title", "Section Title", "Features"), subtitle: G.text("subtitle", "Subtitle", "Everything you need"), columns: G.select("columns", "Columns", "2", [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }], "layout"), showIcons: G.toggle("showIcons", "Show Icons", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "benefits-section", label: "Benefits Section", category: "content", icon: "Zap", description: "Benefits and value propositions",
    props: merge(
      { title: G.text("title", "Section Title", "Benefits"), subtitle: G.text("subtitle", "Subtitle", "Why customers love us"), columns: G.select("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), cardStyle: G.select("cardStyle", "Card Style", "icon-top", [{ value: "icon-top", label: "Icon on Top" }, { value: "icon-left", label: "Icon on Left" }, { value: "minimal", label: "Minimal" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "timeline", label: "Timeline", category: "content", icon: "Timeline", description: "Vertical timeline for milestones",
    props: merge(
      { title: G.text("title", "Section Title", "Our Journey"), subtitle: G.text("subtitle", "Subtitle", "Milestones"), items: G.number("items", "Timeline Items", "4"), orientation: G.select("orientation", "Orientation", "vertical", [{ value: "vertical", label: "Vertical" }, { value: "horizontal", label: "Horizontal" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "company-story", label: "Company Story", category: "content", icon: "BookOpen", description: "Brand story and history section",
    props: merge(
      { title: G.text("title", "Section Title", "Our Story"), content: G.textarea("content", "Story Content", "Share your brand story here..."), imageUrl: G.image("imageUrl", "Story Image"), imagePosition: G.select("imagePosition", "Image Position", "right", [{ value: "left", label: "Left" }, { value: "right", label: "Right" }], "layout"), showSignature: G.toggle("showSignature", "Show Signature", "false") },
      layout, bg, typography,
    ),
  },
  {
    type: "about-section", label: "About Section", category: "content", icon: "Info", description: "About us section for the page",
    props: merge(
      { title: G.text("title", "Section Title", "About Us"), content: G.textarea("content", "Content", "Learn about our brand..."), imageUrl: G.image("imageUrl", "Image"), imagePosition: G.select("imagePosition", "Image Position", "left", [{ value: "left", label: "Left" }, { value: "right", label: "Right" }], "layout"), layout: G.select("layout", "Layout", "side-by-side", [{ value: "side-by-side", label: "Side by Side" }, { value: "full", label: "Full Width" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "team-members", label: "Team Members", category: "content", icon: "Users", description: "Display team member profiles",
    props: merge(
      { title: G.text("title", "Section Title", "Our Team"), subtitle: G.text("subtitle", "Subtitle", "Meet the people behind the brand"), columns: G.select("columns", "Columns", "4", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), showSocial: G.toggle("showSocial", "Show Social Links", "true"), memberCount: G.number("memberCount", "Team Members", "4") },
      layout, bg, typography,
    ),
  },
  {
    type: "mission-section", label: "Mission Section", category: "content", icon: "Target", description: "Mission, vision, and values",
    props: merge(
      { title: G.text("title", "Section Title", "Our Mission"), mission: G.textarea("mission", "Mission Statement", "Our mission is..."), vision: G.textarea("vision", "Vision", "Our vision is..."), values: G.textarea("values", "Core Values", "Value 1, Value 2, Value 3"), layout: G.select("layout", "Layout", "three-column", [{ value: "single", label: "Single" }, { value: "three-column", label: "Three Column" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "contact-section", label: "Contact", category: "content", icon: "Mail", description: "Business contact details with map",
    props: merge(
      {
        title: G.text("title", "Section Title", "Contact"),
        businessName: G.text("businessName", "Business Name", ""),
        phone: G.text("phone", "Phone", ""),
        email: G.text("email", "Email", ""),
        address: G.textarea("address", "Address", ""),
        businessHours: G.textarea("businessHours", "Working Hours", ""),
        mapEmbed: G.textarea("mapEmbed", "Google Maps Embed URL", ""),
        latitude: G.text("latitude", "Latitude", ""),
        longitude: G.text("longitude", "Longitude", ""),
        facebook: G.text("facebook", "Facebook", ""),
        instagram: G.text("instagram", "Instagram", ""),
        x: G.text("x", "X / Twitter", ""),
      },
      layout, bg, typography,
    ),
  },
  {
    type: "google-map", label: "Google Map", category: "content", icon: "Map", description: "Embedded Google Map",
    props: merge(
      {
        title: G.text("title", "Section Title", "Find us"),
        address: G.textarea("address", "Business Address", ""),
        mapEmbed: G.textarea("mapEmbed", "Google Maps Embed URL", ""),
        latitude: G.text("latitude", "Latitude", ""),
        longitude: G.text("longitude", "Longitude", ""),
      },
      layout, bg,
    ),
  },

  // ════════ MEDIA ════════
  {
    type: "image-banner", label: "Image Banner", category: "media", icon: "Image", description: "Full-width image banner with optional text",
    props: merge(
      { imageUrl: G.image("imageUrl", "Banner Image"), mobileImageUrl: G.image("mobileImageUrl", "Mobile Image"), link: G.text("link", "Link URL", ""), alt: G.text("alt", "Alt Text", "Banner"), overlay: G.toggle("overlay", "Show Overlay", "false"), caption: G.text("caption", "Caption Text", ""), bannerHeight: G.select("bannerHeight", "Height", "md", [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }], "layout") },
      layout, bg,
    ),
  },
  {
    type: "image-grid", label: "Image Grid", category: "media", icon: "Grid2x2", description: "Grid of images with links",
    props: merge(
      { title: G.text("title", "Section Title", ""), columns: G.select("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), gap: G.select("gap", "Gap", "16", [{ value: "4", label: "Small" }, { value: "8", label: "Medium" }, { value: "16", label: "Large" }], "layout"), aspectRatio: G.select("aspectRatio", "Aspect Ratio", "1:1", [{ value: "1:1", label: "Square" }, { value: "4:3", label: "Landscape" }, { value: "3:4", label: "Portrait" }, { value: "16:9", label: "Wide" }], "layout") },
      layout, bg,
    ),
  },
  {
    type: "gallery", label: "Gallery", category: "media", icon: "Images", description: "Image gallery with lightbox",
    props: merge(
      { title: G.text("title", "Section Title", "Gallery"), subtitle: G.text("subtitle", "Subtitle", ""), columns: G.select("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), showLightbox: G.toggle("showLightbox", "Enable Lightbox", "true"), imageCount: G.number("imageCount", "Number of Images", "6") },
      layout, bg, typography,
    ),
  },
  {
    type: "masonry-gallery", label: "Masonry Gallery", category: "media", icon: "Columns3", description: "Pinterest-style masonry gallery",
    props: merge(
      { title: G.text("title", "Section Title", "Gallery"), columns: G.select("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), imageCount: G.number("imageCount", "Number of Images", "6") },
      layout, bg, typography,
    ),
  },
  {
    type: "before-after", label: "Before / After", category: "media", icon: "SplitSquareHorizontal", description: "Before and after comparison slider",
    props: merge(
      {
        title: G.text("title", "Section Title", "Transformation"),
        caption: G.textarea("caption", "Caption", ""),
        beforeImage: G.image("beforeImage", "Before Image", "content"),
        afterImage: G.image("afterImage", "After Image", "content"),
        beforeLabel: G.text("beforeLabel", "Before Label", "Before"),
        afterLabel: G.text("afterLabel", "After Label", "After"),
        showLabels: G.toggle("showLabels", "Show Labels", "true"),
        altText: G.text("altText", "Alt Text", ""),
        beforeAlt: G.text("beforeAlt", "Before Alt", ""),
        afterAlt: G.text("afterAlt", "After Alt", ""),
        orientation: G.select("orientation", "Orientation", "horizontal", [{ value: "horizontal", label: "Horizontal" }], "layout"),
        sliderPosition: G.range("sliderPosition", "Default Slider Position", "50", 0, 100, 1, "layout"),
        delimiterColor: G.color("delimiterColor", "Delimiter Color", "#ffffff", "layout"),
        comparisonWidth: G.text("comparisonWidth", "Width", "100%", "layout"),
        comparisonHeight: G.select("comparisonHeight", "Height", "md", [
          { value: "sm", label: "Small" }, { value: "md", label: "Medium" },
          { value: "lg", label: "Large" }, { value: "xl", label: "Extra Large" },
        ], "layout"),
        comparisonRadius: G.range("comparisonRadius", "Image Border Radius", "16", 0, 48, 4, "layout"),
        showOverlay: G.toggle("showOverlay", "Overlay", "false", "background"),
        overlayColor: G.color("overlayColor", "Overlay Color", "rgba(0,0,0,0.15)"),
      },
      layout, bg, typography,
    ),
  },
  {
    type: "video-section", label: "Video Section", category: "media", icon: "Video", description: "Embedded video with description",
    props: merge(
      { title: G.text("title", "Section Title", "Watch"), description: G.textarea("description", "Description", ""), videoUrl: G.video("videoUrl", "Video URL"), posterImage: G.image("posterImage", "Poster Image"), autoplay: G.toggle("autoplay", "Auto Play", "false"), controls: G.toggle("controls", "Show Controls", "true"), aspectRatio: G.select("aspectRatio", "Aspect Ratio", "16:9", [{ value: "4:3", label: "4:3" }, { value: "16:9", label: "16:9" }, { value: "1:1", label: "Square" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "youtube-embed", label: "YouTube Embed", category: "media", icon: "YouTube", description: "Embedded YouTube video",
    props: merge(
      { title: G.text("title", "Title", ""), videoId: G.text("videoId", "YouTube Video ID", "dQw4w9WgXcQ"), autoplay: G.toggle("autoplay", "Auto Play", "false"), showControls: G.toggle("showControls", "Show Controls", "true"), loop: G.toggle("loop", "Loop", "false"), aspectRatio: G.select("aspectRatio", "Aspect Ratio", "16:9", [{ value: "4:3", label: "4:3" }, { value: "16:9", label: "16:9" }, { value: "1:1", label: "Square" }], "layout") },
      layout, bg,
    ),
  },
  {
    type: "vimeo-embed", label: "Vimeo Embed", category: "media", icon: "Video", description: "Embedded Vimeo video",
    props: merge(
      { title: G.text("title", "Title", ""), videoId: G.text("videoId", "Vimeo Video ID", ""), autoplay: G.toggle("autoplay", "Auto Play", "false"), aspectRatio: G.select("aspectRatio", "Aspect Ratio", "16:9", [{ value: "4:3", label: "4:3" }, { value: "16:9", label: "16:9" }], "layout") },
      layout, bg,
    ),
  },
  {
    type: "tiktok-embed", label: "TikTok Embed", category: "media", icon: "Music", description: "Embedded TikTok video",
    props: merge(
      { title: G.text("title", "Title", ""), videoUrl: G.text("videoUrl", "TikTok Video URL", ""), aspectRatio: G.select("aspectRatio", "Aspect Ratio", "9:16", [{ value: "1:1", label: "Square" }, { value: "9:16", label: "Portrait" }, { value: "16:9", label: "Landscape" }], "layout") },
      layout, bg,
    ),
  },

  // ════════ SOCIAL ════════
  {
    type: "instagram-feed", label: "Instagram Feed", category: "social", icon: "Instagram", description: "Display Instagram posts feed",
    props: merge(
      { title: G.text("title", "Section Title", "Follow Us on Instagram"), subtitle: G.text("subtitle", "Subtitle", "@yourstore"), handle: G.text("handle", "Instagram Handle", "@yourstore"), postCount: G.number("postCount", "Number of Posts", "6"), columns: G.select("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }], "layout"), showLikes: G.toggle("showLikes", "Show Likes", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "facebook-feed", label: "Facebook Feed", category: "social", icon: "Facebook", description: "Display Facebook page feed",
    props: merge(
      { title: G.text("title", "Section Title", "Facebook"), pageUrl: G.text("pageUrl", "Facebook Page URL", ""), postCount: G.number("postCount", "Number of Posts", "4") },
      layout, bg, typography,
    ),
  },
  {
    type: "tiktok-feed", label: "TikTok Feed", category: "social", icon: "Music", description: "Display TikTok video feed",
    props: merge(
      { title: G.text("title", "Section Title", "TikTok"), handle: G.text("handle", "TikTok Handle", "@yourstore"), postCount: G.number("postCount", "Number of Videos", "4") },
      layout, bg, typography,
    ),
  },
  {
    type: "social-proof", label: "Social Proof", category: "social", icon: "Users", description: "Live social proof notifications",
    props: merge(
      { title: G.text("title", "Section Title", "Join Our Community"), userCount: G.text("userCount", "User Count", "10,000+"), joinText: G.text("joinText", "Join Text", "Happy customers"), showAvatars: G.toggle("showAvatars", "Show Avatar Group", "true"), avatarImage: G.image("avatarImage", "Avatar Image") },
      layout, bg, typography,
    ),
  },
  {
    type: "ugc", label: "User Generated Content", category: "social", icon: "ImageUp", description: "Display customer photos and UGC",
    props: merge(
      { title: G.text("title", "Section Title", "As Seen On You"), subtitle: G.text("subtitle", "Subtitle", "Tag us for a chance to be featured"), columns: G.select("columns", "Columns", "4", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }], "layout"), postCount: G.number("postCount", "Number of Posts", "8"), hashtag: G.text("hashtag", "Hashtag", "#yourstore") },
      layout, bg, typography,
    ),
  },

  // ════════ MARKETING ════════
  {
    type: "newsletter", label: "Newsletter", category: "marketing", icon: "Mail", description: "Email newsletter signup form",
    props: merge(
      { headline: G.text("headline", "Headline", "Stay in the Loop"), subheadline: G.textarea("subheadline", "Subheadline", "Subscribe for exclusive deals"), buttonText: G.text("buttonText", "Button Text", "Subscribe"), buttonLink: G.text("buttonLink", "Button Link", "#"), placeholderText: G.text("placeholderText", "Input Placeholder", "Enter your email"), showName: G.toggle("showName", "Show Name Field", "false"), bgImage: G.image("bgImage", "Background Image") },
      layout, bg, typography,
    ),
  },
  {
    type: "email-capture", label: "Email Capture", category: "marketing", icon: "AtSign", description: "Simple email capture form",
    props: merge(
      { headline: G.text("headline", "Headline", "Get 10% Off"), subheadline: G.textarea("subheadline", "Subheadline", "Join our newsletter"), buttonText: G.text("buttonText", "Button Text", "Get Discount"), placeholderText: G.text("placeholderText", "Placeholder", "your@email.com"), incentiveText: G.text("incentiveText", "Incentive Text", "No spam. Unsubscribe anytime.") },
      layout, bg, typography,
    ),
  },
  {
    type: "popup-form", label: "Popup Form", category: "marketing", icon: "SquareMousePointer", description: "Subscription popup form",
    props: merge(
      { headline: G.text("headline", "Headline", "Don't Miss Out!"), subheadline: G.textarea("subheadline", "Subheadline", "Get exclusive offers"), buttonText: G.text("buttonText", "Button Text", "Subscribe"), imageUrl: G.image("imageUrl", "Popup Image"), delay: G.number("delay", "Delay (seconds)", "5"), showOnExit: G.toggle("showOnExit", "Show on Exit Intent", "false") },
      layout, bg, typography,
    ),
  },
  {
    type: "announcement-bar", label: "Announcement Bar", category: "marketing", icon: "Megaphone", description: "Top announcement bar for promotions",
    props: merge(
      { text: G.text("text", "Announcement Text", "Free shipping on orders over $50!"), link: G.text("link", "Link URL", "/shop"), linkText: G.text("linkText", "Link Text", "Shop Now"), bgColor: G.color("bgColor", "Background", "#18181b"), textColor: G.color("textColor", "Text Color", "#ffffff", "typography"), dismissible: G.toggle("dismissible", "Dismissible", "true"), showEmoji: G.toggle("showEmoji", "Show Emoji", "true") },
      layout, typography,
    ),
  },
  {
    type: "floating-promotion", label: "Floating Promotion", category: "marketing", icon: "Gift", description: "Floating/sticky promotion bar",
    props: merge(
      { text: G.text("text", "Promotion Text", "Summer Sale - 50% Off!"), buttonText: G.text("buttonText", "Button Text", "Shop Now"), buttonLink: G.text("buttonLink", "Button Link", "/sale"), position: G.select("position", "Position", "bottom", [{ value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }], "layout"), bgColor: G.color("bgColor", "Background", "#ef4444"), textColor: G.color("textColor", "Text Color", "#ffffff", "typography") },
      typography,
    ),
  },

  // ════════ ADVANCED ════════
  {
    type: "countdown-timer", label: "Countdown Timer", category: "advanced", icon: "Timer", description: "Standalone countdown timer",
    props: merge(
      { title: G.text("title", "Section Title", "Hurry! Offer Ends In"), targetDate: G.text("targetDate", "Target Date", "2026-12-31"), targetTime: G.text("targetTime", "Target Time", "23:59"), style: G.select("style", "Style", "large", [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }], "layout"), showLabels: G.toggle("showLabels", "Show Labels", "true"), bgColor: G.color("bgColor", "Background", "") },
      layout, bg, typography,
    ),
  },
  {
    type: "stock-counter", label: "Stock Counter", category: "advanced", icon: "Package", description: "Low stock count indicator",
    props: merge(
      { text: G.text("text", "Text", "Only {count} left in stock"), showWhen: G.select("showWhen", "Show When", "<10", [{ value: "<5", label: "Less than 5" }, { value: "<10", label: "Less than 10" }, { value: "<20", label: "Less than 20" }], "advanced"), bgColor: G.color("bgColor", "Background", "#fef2f2") },
      layout, bg, typography,
    ),
  },
  {
    type: "visitor-counter", label: "Visitor Counter", category: "advanced", icon: "Eye", description: "Live visitor count",
    props: merge(
      { text: G.text("text", "Display Text", "{count} people are viewing this"), startCount: G.text("startCount", "Starting Count", "50"), bgColor: G.color("bgColor", "Background", "#f0f9ff"), showIcon: G.toggle("showIcon", "Show Icon", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "sales-popup", label: "Sales Popup", category: "advanced", icon: "Bell", description: "Recent purchase notification popups",
    props: merge(
      { title: G.text("title", "Section Title", "Recent Purchases"), showProductImage: G.toggle("showProductImage", "Show Product Image", "true"), showTimer: G.toggle("showTimer", "Show Time Ago", "true"), interval: G.number("interval", "Interval (seconds)", "5"), maxItems: G.number("maxItems", "Max Items", "5") },
      layout, bg, typography,
    ),
  },
  {
    type: "recently-purchased-popup", label: "Recently Purchased Popup", category: "advanced", icon: "ShoppingCart", description: "Floating recently purchased notification",
    props: merge(
      { text: G.text("text", "Text", "{name} just purchased {product}"), displayDuration: G.number("displayDuration", "Display Duration (s)", "6"), imageUrl: G.image("imageUrl", "Product Image"), customerName: G.text("customerName", "Customer Name", "Sarah"), productName: G.text("productName", "Product Name", "Product"), location: G.text("location", "Location", "New York, USA") },
      layout, bg, typography,
    ),
  },
  {
    type: "live-visitors", label: "Live Visitors", category: "advanced", icon: "Users", description: "Live visitor count badge",
    props: merge(
      { text: G.text("text", "Display Text", "{count} visitors online"), showDot: G.toggle("showDot", "Show Green Dot", "true"), bgColor: G.color("bgColor", "Background", "#f0fdf4") },
      layout, bg, typography,
    ),
  },
  {
    type: "progress-bar", label: "Progress Bar", category: "advanced", icon: "ChartNoAxesColumn", description: "Goal/campaign progress bar",
    props: merge(
      { title: G.text("title", "Title", "Our Goal"), currentAmount: G.text("currentAmount", "Current Amount", "75000"), targetAmount: G.text("targetAmount", "Target Amount", "100000"), suffix: G.text("suffix", "Suffix", "raised"), barColor: G.color("barColor", "Bar Color", "#22c55e"), bgColor: G.color("bgColor", "Background", "#f0fdf4") },
      layout, bg, typography,
    ),
  },
  {
    type: "order-counter", label: "Order Counter", category: "advanced", icon: "ShoppingBag", description: "Total orders served counter",
    props: merge(
      { title: G.text("title", "Title", "Orders Served"), count: G.text("count", "Count", "50,000+"), suffix: G.text("suffix", "Suffix", "orders and counting"), showIcon: G.toggle("showIcon", "Show Icon", "true"), bgColor: G.color("bgColor", "Background", "#f0fdf4") },
      layout, bg, typography,
    ),
  },

  // ════════ LAYOUT ════════
  {
    type: "one-column", label: "1 Column", category: "layout", icon: "Columns1", description: "Single column content section",
    props: merge(
      { content: G.textarea("content", "Content", "Your content here"), maxWidth: G.select("maxWidth", "Max Width", "800px", [{ value: "600px", label: "Narrow" }, { value: "800px", label: "Medium" }, { value: "1200px", label: "Wide" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "two-column", label: "2 Column", category: "layout", icon: "Columns2", description: "Two column content section",
    props: merge(
      { leftContent: G.textarea("leftContent", "Left Content", "Left column"), rightContent: G.textarea("rightContent", "Right Content", "Right column"), ratio: G.select("ratio", "Column Ratio", "1:1", [{ value: "1:1", label: "Equal" }, { value: "2:1", label: "2:1" }, { value: "3:1", label: "3:1" }], "layout"), gap: G.select("gap", "Gap", "24", [{ value: "16", label: "Small" }, { value: "24", label: "Medium" }, { value: "32", label: "Large" }], "layout"), stackOnMobile: G.toggle("stackOnMobile", "Stack on Mobile", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "three-column", label: "3 Column", category: "layout", icon: "Columns3", description: "Three column content section",
    props: merge(
      { col1: G.textarea("col1", "Column 1", "Content 1"), col2: G.textarea("col2", "Column 2", "Content 2"), col3: G.textarea("col3", "Column 3", "Content 3"), gap: G.select("gap", "Gap", "24", [{ value: "16", label: "Small" }, { value: "24", label: "Medium" }, { value: "32", label: "Large" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "four-column", label: "4 Column", category: "layout", icon: "Grid2x2", description: "Four column content or grid section",
    props: merge(
      { columns: G.number("columns", "Active Columns", "4"), gap: G.select("gap", "Gap", "16", [{ value: "8", label: "Small" }, { value: "16", label: "Medium" }, { value: "24", label: "Large" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "container", label: "Container", category: "layout", icon: "SquareSquare", description: "Container box with custom width",
    props: merge(
      { content: G.textarea("content", "Content", "Container content"), maxWidth: G.select("maxWidth", "Max Width", "1200px", [{ value: "800px", label: "Narrow" }, { value: "1200px", label: "Default" }, { value: "1400px", label: "Wide" }, { value: "100%", label: "Full" }], "layout"), minHeight: G.number("minHeight", "Min Height (px)", "200") },
      layout, bg, typography,
    ),
  },
  {
    type: "full-width", label: "Full Width", category: "layout", icon: "Maximize", description: "Full-width content section",
    props: merge(
      { content: G.textarea("content", "Content", "Full width content"), innerMaxWidth: G.select("innerMaxWidth", "Inner Max Width", "1200px", [{ value: "100%", label: "Full" }, { value: "1200px", label: "Default" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "grid-layout", label: "Grid Layout", category: "layout", icon: "Grid3x3", description: "Customizable responsive grid",
    props: merge(
      { desktopColumns: G.select("desktopColumns", "Desktop Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }, { value: "6", label: "6" }], "layout"), tabletColumns: G.select("tabletColumns", "Tablet Columns", "2", [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), mobileColumns: G.select("mobileColumns", "Mobile Columns", "1", [{ value: "1", label: "1" }, { value: "2", label: "2" }], "layout"), gap: G.select("gap", "Gap", "16", [{ value: "4", label: "Small" }, { value: "8", label: "Medium" }, { value: "16", label: "Large" }], "layout") },
      layout, bg,
    ),
  },
  {
    type: "masonry-layout", label: "Masonry Layout", category: "layout", icon: "Columns3", description: "Masonry/pinterest grid layout",
    props: merge(
      { columns: G.select("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), gap: G.number("gap", "Gap (px)", "16") },
      layout, bg,
    ),
  },
  {
    type: "tabs-layout", label: "Tabs Layout", category: "layout", icon: "Tabs", description: "Tabbed content section",
    props: merge(
      { tab1Label: G.text("tab1Label", "Tab 1 Label", "Tab 1"), tab1Content: G.textarea("tab1Content", "Tab 1 Content", "Content 1"), tab2Label: G.text("tab2Label", "Tab 2 Label", "Tab 2"), tab2Content: G.textarea("tab2Content", "Tab 2 Content", "Content 2"), tab3Label: G.text("tab3Label", "Tab 3 Label", "Tab 3"), tab3Content: G.textarea("tab3Content", "Tab 3 Content", "Content 3"), tabStyle: G.select("tabStyle", "Tab Style", "underline", [{ value: "underline", label: "Underline" }, { value: "pills", label: "Pills" }, { value: "buttons", label: "Buttons" }], "layout") },
      layout, bg, typography,
    ),
  },

  // ════════ HEADER ════════
  {
    type: "header-logo", label: "Logo", category: "header", icon: "Image", description: "Store logo and name",
    props: merge(
      { logoUrl: G.image("logoUrl", "Logo Image"), storeName: G.text("storeName", "Store Name", "My Store"), logoHeight: G.select("logoHeight", "Logo Height", "32", [{ value: "24", label: "24px" }, { value: "28", label: "28px" }, { value: "32", label: "32px" }, { value: "36", label: "36px" }, { value: "40", label: "40px" }], "layout"), showName: G.toggle("showName", "Show Store Name", "true") },
      layout,
    ),
  },
  {
    type: "header-nav", label: "Navigation", category: "header", icon: "Menu", description: "Navigation menu links",
    props: merge(
      { link1Text: G.text("link1Text", "Link 1 Text", "Home"), link1Url: G.text("link1Url", "Link 1 URL", "/"), link2Text: G.text("link2Text", "Link 2 Text", "Shop"), link2Url: G.text("link2Url", "Link 2 URL", "/shop"), link3Text: G.text("link3Text", "Link 3 Text", "About"), link3Url: G.text("link3Url", "Link 3 URL", "/about"), link4Text: G.text("link4Text", "Link 4 Text", "Contact"), link4Url: G.text("link4Url", "Link 4 URL", "/contact"), link5Text: G.text("link5Text", "Link 5 Text", ""), link5Url: G.text("link5Url", "Link 5 URL", ""), menuStyle: G.select("menuStyle", "Menu Style", "horizontal", [{ value: "horizontal", label: "Horizontal" }, { value: "centered", label: "Centered" }], "layout"), gap: G.select("gap", "Link Gap", "24", [{ value: "16", label: "Small" }, { value: "24", label: "Medium" }, { value: "32", label: "Large" }], "layout") },
      layout, typography,
    ),
  },
  {
    type: "header-icons", label: "Header Icons", category: "header", icon: "Heart", description: "Search, wishlist, cart, and account icons",
    props: merge(
      { showSearch: G.toggle("showSearch", "Show Search", "true"), showWishlist: G.toggle("showWishlist", "Show Wishlist", "true"), showCart: G.toggle("showCart", "Show Cart", "true"), showAccount: G.toggle("showAccount", "Show Account", "true"), iconSize: G.select("iconSize", "Icon Size", "20", [{ value: "16", label: "16px" }, { value: "18", label: "18px" }, { value: "20", label: "20px" }, { value: "24", label: "24px" }], "layout"), iconColor: G.color("iconColor", "Icon Color", "#71717a", "typography") },
      layout,
    ),
  },
  {
    type: "header-bar", label: "Header Bar", category: "header", icon: "Layout", description: "Complete header bar with logo, nav, and icons",
    props: merge(
      { logoUrl: G.image("logoUrl", "Logo Image"), storeName: G.text("storeName", "Store Name", "My Store"), showName: G.toggle("showName", "Show Store Name", "true"), layout: G.select("layout", "Header Layout", "logo-nav-icons", [{ value: "logo-nav-icons", label: "Logo | Nav | Icons" }, { value: "logo-icons-nav", label: "Logo | Icons | Nav" }, { value: "nav-logo-icons", label: "Nav | Logo | Icons" }], "layout"), navPosition: G.select("navPosition", "Nav Position", "center", [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }], "layout"), showSearch: G.toggle("showSearch", "Search Icon", "true"), showWishlist: G.toggle("showWishlist", "Wishlist Icon", "true"), showCart: G.toggle("showCart", "Cart Icon", "true"), showAccount: G.toggle("showAccount", "Account Icon", "true"), sticky: G.toggle("sticky", "Sticky Header", "true"), transparent: G.toggle("transparent", "Transparent", "false"), headerBg: G.color("headerBg", "Background", "#ffffff", "background"), headerHeight: G.select("headerHeight", "Height", "64", [{ value: "48", label: "48px" }, { value: "56", label: "56px" }, { value: "64", label: "64px" }, { value: "72", label: "72px" }, { value: "80", label: "80px" }], "layout") },
      layout, typography,
    ),
  },

  // ════════ FOOTER ════════
  {
    type: "simple-footer", label: "Simple Footer", category: "footer", icon: "Minimize", description: "Minimal footer with copyright",
    props: merge(
      { copyright: G.text("copyright", "Copyright Text", "© 2026 Your Store. All rights reserved."), showSocial: G.toggle("showSocial", "Show Social Icons", "true"), bgColor: G.color("bgColor", "Background", "#09090b"), textColor: G.color("textColor", "Text Color", "#fafafa", "typography"), layout: G.select("layout", "Layout", "centered", [{ value: "centered", label: "Centered" }, { value: "split", label: "Split" }], "layout") },
      layout, typography,
    ),
  },
  {
    type: "ecommerce-footer", label: "Ecommerce Footer", category: "footer", icon: "ShoppingBag", description: "Full ecommerce footer with links",
    props: merge(
      { copyright: G.text("copyright", "Copyright Text", "© 2026 Your Store. All rights reserved."), showSocial: G.toggle("showSocial", "Show Social", "true"), showNewsletter: G.toggle("showNewsletter", "Show Newsletter", "true"), showPaymentIcons: G.toggle("showPaymentIcons", "Show Payment Icons", "true"), contactEmail: G.text("contactEmail", "Contact Email", "hello@example.com"), contactPhone: G.text("contactPhone", "Contact Phone", "+1 (555) 123-4567"), contactAddress: G.text("contactAddress", "Address", "123 Commerce St, NY"), bgColor: G.color("bgColor", "Background", "#09090b"), textColor: G.color("textColor", "Text Color", "#fafafa", "typography"), columns: G.select("columns", "Columns", "4", [{ value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }], "layout") },
      layout, typography,
    ),
  },
  {
    type: "mega-footer", label: "Mega Footer", category: "footer", icon: "Layout", description: "Large footer with many columns and sections",
    props: merge(
      { copyright: G.text("copyright", "Copyright", "© 2026"), showBrand: G.toggle("showBrand", "Show Brand Info", "true"), showLinks: G.toggle("showLinks", "Show Link Columns", "true"), showSocial: G.toggle("showSocial", "Show Social", "true"), showNewsletter: G.toggle("showNewsletter", "Show Newsletter", "true"), showPayment: G.toggle("showPayment", "Show Payment Icons", "true"), showBadges: G.toggle("showBadges", "Show Trust Badges", "true"), bgColor: G.color("bgColor", "Background", "#09090b"), textColor: G.color("textColor", "Text Color", "#fafafa", "typography") },
      layout, typography,
    ),
  },
  {
    type: "multi-column-footer", label: "Multi Column Footer", category: "footer", icon: "Columns2", description: "Multi-column footer with link groups",
    props: merge(
      { copyright: G.text("copyright", "Copyright", "© 2026"), columnCount: G.select("columnCount", "Column Count", "4", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), showSocial: G.toggle("showSocial", "Show Social", "true"), bgColor: G.color("bgColor", "Background", "#09090b"), textColor: G.color("textColor", "Text Color", "#fafafa", "typography") },
      layout, typography,
    ),
  },
  {
    type: "footer-links", label: "Footer Links", category: "footer", icon: "Link", description: "Multi-column link list for footer",
    props: merge(
      { title: G.text("title", "Section Title", "Quick Links"), columns: G.select("columns", "Columns", "3", [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), link1Text: G.text("link1Text", "Link 1 Text", "Home"), link1Url: G.text("link1Url", "Link 1 URL", "/"), link2Text: G.text("link2Text", "Link 2 Text", "Shop"), link2Url: G.text("link2Url", "Link 2 URL", "/shop"), link3Text: G.text("link3Text", "Link 3 Text", "About"), link3Url: G.text("link3Url", "Link 3 URL", "/about"), link4Text: G.text("link4Text", "Link 4 Text", "Contact"), link4Url: G.text("link4Url", "Link 4 URL", "/contact"), link5Text: G.text("link5Text", "Link 5 Text", "FAQ"), link5Url: G.text("link5Url", "Link 5 URL", "/faq"), link6Text: G.text("link6Text", "Link 6 Text", "Privacy"), link6Url: G.text("link6Url", "Link 6 URL", "/privacy"), link7Text: G.text("link7Text", "Link 7 Text", "Terms"), link7Url: G.text("link7Url", "Link 7 URL", "/terms"), link8Text: G.text("link8Text", "Link 8 Text", "Shipping"), link8Url: G.text("link8Url", "Link 8 URL", "/shipping"), link9Text: G.text("link9Text", "Link 9 Text", "Returns"), link9Url: G.text("link9Url", "Link 9 URL", "/returns"), linkColor: G.color("linkColor", "Link Color", "#71717a", "typography"), headingColor: G.color("headingColor", "Heading Color", "#18181b", "typography") },
      layout, typography,
    ),
  },
  {
    type: "footer-social", label: "Footer Social", category: "footer", icon: "Share2", description: "Social media icon links for footer",
    props: merge(
      { label: G.text("label", "Section Label", "Follow Us"), showFacebook: G.toggle("showFacebook", "Show Facebook", "true"), showTwitter: G.toggle("showTwitter", "Show Twitter", "true"), showInstagram: G.toggle("showInstagram", "Show Instagram", "true"), showYoutube: G.toggle("showYoutube", "Show Youtube", "true"), iconColor: G.color("iconColor", "Icon Color", "#71717a", "typography"), hoverColor: G.color("hoverColor", "Hover Color", "#2563eb", "typography"), iconSize: G.number("iconSize", "Icon Size", "18", "layout"), headingColor: G.color("headingColor", "Heading Color", "#18181b", "typography") },
      layout, typography,
    ),
  },
  {
    type: "footer-copyright", label: "Footer Copyright", category: "footer", icon: "Copyright", description: "Copyright notice for footer bottom bar",
    props: merge(
      { text: G.text("text", "Copyright Text", "© 2026 All rights reserved."), textColor: G.color("textColor", "Text Color", "#a1a1aa", "typography"), fontSize: G.number("fontSize", "Font Size", "12", "typography"), alignment: G.select("alignment", "Alignment", "center", [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }], "layout") },
      layout, typography,
    ),
  },
];

// ─── BUILD MAP ────────────────────────────────────────────────────

export const sectionRegistryMap: Record<string, SectionDef> = {};
for (const def of sectionRegistry) {
  sectionRegistryMap[def.type] = def;
}

/** Allow library presets to register render aliases without circular imports. */
export function registerSectionTypeAlias(from: string, to: string) {
  sectionTypeAliases[from] = to;
}

export function registerSectionDef(def: SectionDef) {
  sectionRegistryMap[def.type] = def;
}

export const sectionCategories: { id: SectionCategory; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "products", label: "Products" },
  { id: "category", label: "Categories" },
  { id: "promotions", label: "Promotions" },
  { id: "trust", label: "Trust & Social Proof" },
  { id: "content", label: "Content" },
  { id: "media", label: "Media" },
  { id: "social", label: "Social Media" },
  { id: "marketing", label: "Marketing" },
  { id: "advanced", label: "Advanced" },
  { id: "layout", label: "Layout" },
  { id: "header", label: "Header" },
  { id: "footer", label: "Footer" },
];

export function getDefaultProps(type: string): Record<string, string> {
  const def = getSectionDef(type);
  if (!def) return {};
  const props: Record<string, string> = {};
  for (const [key, propDef] of Object.entries(def.props)) {
    props[key] = propDef.default;
  }
  return props;
}

export function getSectionLabel(type: string): string {
  return getSectionDef(type)?.label ?? type;
}

export function getSectionsByCategory(category: SectionCategory): SectionDef[] {
  return sectionRegistry.filter((s) => s.category === category);
}

export function normalizeSectionType(type: string): string {
  return sectionTypeAliases[type] ?? type;
}

export function getSectionDef(type: string): SectionDef | undefined {
  // Prefer an exact def (library presets) before falling back to render aliases.
  return sectionRegistryMap[type] ?? sectionRegistryMap[normalizeSectionType(type)];
}
