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

const t = (k: string, l: string, d: string, g: SectionPropDef["group"] = "content"): SectionPropDef =>
  ({ label: l, type: "text", default: d, group: g });
const ta = (k: string, l: string, d: string, g: SectionPropDef["group"] = "content"): SectionPropDef =>
  ({ label: l, type: "textarea", default: d, group: g });
const s = (k: string, l: string, d: string, opts: { value: string; label: string }[], g: SectionPropDef["group"] = "content"): SectionPropDef =>
  ({ label: l, type: "select", default: d, options: opts, group: g });
const c_ = (k: string, l: string, d: string, g: SectionPropDef["group"] = "background"): SectionPropDef =>
  ({ label: l, type: "color", default: d, group: g });
const img = (k: string, l: string, g: SectionPropDef["group"] = "background"): SectionPropDef =>
  ({ label: l, type: "image", default: "", group: g });
const tog = (k: string, l: string, d: string, g: SectionPropDef["group"] = "content"): SectionPropDef =>
  ({ label: l, type: "toggle", default: d, group: g });
const r = (k: string, l: string, d: string, min: number, max: number, step = 1, g: SectionPropDef["group"] = "layout"): SectionPropDef =>
  ({ label: l, type: "range", default: d, min, max, step, group: g });
const al = (): SectionPropDef => ({ label: "Text Alignment", type: "align", default: "center", group: "typography" });
const vid = (k: string, l: string): SectionPropDef => ({ label: l, type: "video", default: "", group: "content" });
const n = (k: string, l: string, d: string, g: SectionPropDef["group"] = "content"): SectionPropDef =>
  ({ label: l, type: "number", default: d, group: g });
const gc = (): SectionPropDef => ({
  label: "Grid Columns", type: "grid-columns", default: "4",
  options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }, { value: "6", label: "6" }], group: "layout",
});

const layout = {
  maxWidth: s("maxWidth", "Max Width", "1200px", [
    { value: "100%", label: "Full Width" }, { value: "800px", label: "Narrow" },
    { value: "1200px", label: "Default" }, { value: "1400px", label: "Wide" },
  ], "layout"),
  shadow: s("shadow", "Shadow", "none", [
    { value: "none", label: "None" }, { value: "sm", label: "Small" },
    { value: "md", label: "Medium" }, { value: "lg", label: "Large" },
  ], "layout"),
  borderRadius: r("borderRadius", "Border Radius", "12", 0, 48, 4, "layout"),
  borderWidth: r("borderWidth", "Border Width", "0", 0, 8, 1, "layout"),
  borderColor: c_("borderColor", "Border Color", "", "layout"),
  visibility: s("visibility", "Visibility", "all", [
    { value: "all", label: "All Devices" }, { value: "desktop-only", label: "Desktop Only" },
    { value: "tablet-only", label: "Tablet Only" }, { value: "mobile-only", label: "Mobile Only" },
  ], "advanced"),
  animation: s("animation", "Animation", "none", [
    { value: "none", label: "None" }, { value: "fadeIn", label: "Fade In" },
    { value: "slideUp", label: "Slide Up" }, { value: "slideInLeft", label: "Slide In Left" },
    { value: "slideInRight", label: "Slide In Right" }, { value: "zoomIn", label: "Zoom In" },
  ], "advanced"),
  paddingY: r("paddingY", "Padding Y", "48", 0, 120, 8, "spacing"),
  paddingX: r("paddingX", "Padding X", "16", 0, 64, 8, "spacing"),
  marginTop: r("marginTop", "Margin Top", "0", 0, 120, 8, "spacing"),
  marginBottom: r("marginBottom", "Margin Bottom", "0", 0, 120, 8, "spacing"),
};

const bg = {
  bgColor: c_("bgColor", "Background Color", ""),
  bgGradient: t("bgGradient", "Gradient", "", "background"),
  bgImage: img("bgImage", "Background Image"),
  bgOverlayColor: c_("bgOverlayColor", "Overlay Color", ""),
  bgOverlayOpacity: r("bgOverlayOpacity", "Overlay Opacity", "40", 0, 100, 5, "background"),
};

const typography = {
  textColor: c_("textColor", "Text Color", "", "typography"),
  fontSize: s("fontSize", "Font Size", "lg", [
    { value: "sm", label: "Small" }, { value: "md", label: "Medium" },
    { value: "lg", label: "Large" }, { value: "xl", label: "Extra Large" },
  ], "typography"),
  textAlignment: al(),
};

function merge(...sources: Record<string, SectionPropDef>[]): Record<string, SectionPropDef> {
  return Object.assign({}, ...sources);
}

export const sectionRegistry: SectionDef[] = [
  // ════════ HERO ════════
  {
    type: "image-carousel", label: "Image Carousel", category: "media", icon: "images-outline", description: "Image carousel, slider, gallery slider, banner slider, and product slider with unlimited slides",
    props: merge(
      {
        title: t("title", "Section Title", "Featured Gallery"),
        subtitle: t("subtitle", "Subtitle", "Swipe through featured visuals"),
        autoplay: tog("autoplay", "Autoplay", "true"),
        autoplaySpeed: n("autoplaySpeed", "Autoplay Speed (ms)", "5000"),
        infiniteLoop: tog("infiniteLoop", "Infinite Loop", "true"),
        pauseOnHover: tog("pauseOnHover", "Pause on Hover", "true"),
        touchSwipe: tog("touchSwipe", "Touch Swipe", "true"),
        mouseDrag: tog("mouseDrag", "Mouse Drag", "true"),
        keyboardNavigation: tog("keyboardNavigation", "Keyboard Navigation", "true"),
        arrowNavigation: tog("arrowNavigation", "Arrow Navigation", "true"),
        dotNavigation: tog("dotNavigation", "Dot Navigation", "true"),
        transition: s("transition", "Transition", "slide", [{ value: "slide", label: "Slide" }, { value: "fade", label: "Fade" }], "layout"),
        sliderHeight: s("sliderHeight", "Slider Height", "lg", [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "Extra Large" }, { value: "full", label: "Full Screen" }], "layout"),
        desktopHeight: t("desktopHeight", "Desktop Height", "560px", "layout"),
        tabletHeight: t("tabletHeight", "Tablet Height", "420px", "layout"),
        mobileHeight: t("mobileHeight", "Mobile Height", "320px", "layout"),
        contentWidth: s("contentWidth", "Content Width", "boxed", [{ value: "full", label: "Full Width" }, { value: "boxed", label: "Boxed" }], "layout"),
      },
      layout, bg, typography,
    ),
  },
  {
    type: "hero-banner", label: "Hero Banner", category: "hero", icon: "grid-outline", description: "Full-width banner with headline, CTA, and background image",
    props: merge(
      { kicker: t("kicker", "Kicker / Badge", "Welcome"), headline: t("headline", "Headline", "Welcome to Our Store"), subheadline: ta("subheadline", "Subheadline", "Discover amazing products curated just for you"), buttonText: t("buttonText", "Button Text", "Shop Now"), buttonLink: t("buttonLink", "Button Link", "/shop"), secondaryButtonText: t("secondaryButtonText", "Secondary Button Text", "Learn More"), secondaryButtonLink: t("secondaryButtonLink", "Secondary Button Link", "/about"), heroHeight: s("heroHeight", "Height", "md", [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "full", label: "Full Screen" }], "layout"), imageUrl: img("imageUrl", "Image"), mobileImageUrl: img("mobileImageUrl", "Mobile Image"), overlayColor: c_("overlayColor", "Overlay Color", "rgba(15,23,42,0.45)"), overlayOpacity: r("overlayOpacity", "Overlay Opacity", "45", 0, 100, 5), showVideoModal: tog("showVideoModal", "Show Video Modal", "false"), videoUrl: t("videoUrl", "Video URL", ""), videoButtonText: t("videoButtonText", "Video Button Text", "Watch Video") },
      layout, bg, typography,
    ),
  },
  {
    type: "split-hero", label: "Split Hero", category: "hero", icon: "copy-outline", description: "Hero with image and text side by side",
    props: merge(
      { headline: t("headline", "Headline", "Your Store Title"), subheadline: ta("subheadline", "Subheadline", "Description text here"), buttonText: t("buttonText", "Button Text", "Get Started"), buttonLink: t("buttonLink", "Button Link", "/shop"), imageUrl: img("imageUrl", "Image"), imagePosition: s("imagePosition", "Image Position", "right", [{ value: "left", label: "Left" }, { value: "right", label: "Right" }], "layout"), contentWidth: s("contentWidth", "Content Width", "50", [{ value: "40", label: "40%" }, { value: "50", label: "50%" }, { value: "60", label: "60%" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "video-hero", label: "Video Hero", category: "hero", icon: "videocam-outline", description: "Hero with background video and overlay content",
    props: merge(
      { videoUrl: vid("videoUrl", "Video URL (MP4/YouTube)"), posterImage: img("posterImage", "Poster Image"), headline: t("headline", "Headline", "Welcome"), subheadline: ta("subheadline", "Subheadline", "Description"), buttonText: t("buttonText", "Button Text", "Explore"), buttonLink: t("buttonLink", "Button Link", "/shop"), heroHeight: s("heroHeight", "Height", "lg", [{ value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "full", label: "Full Screen" }], "layout"), muted: tog("muted", "Muted", "true"), loop: tog("loop", "Loop", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "slider-hero", label: "Slider Hero", category: "hero", icon: "images-outline", description: "Auto-rotating hero slider with multiple slides",
    props: merge(
      { slideCount: n("slideCount", "Number of Slides", "3"), autoplaySpeed: n("autoplaySpeed", "Autoplay Speed (ms)", "5000"), showArrows: tog("showArrows", "Show Arrows", "true"), showDots: tog("showDots", "Show Dots", "true"), slide1Image: img("slide1Image", "Slide 1 Image"), slide1Title: t("slide1Title", "Slide 1 Title", "Slide 1"), slide1ButtonText: t("slide1ButtonText", "Slide 1 Button Text", "Shop"), slide2Image: img("slide2Image", "Slide 2 Image"), slide2Title: t("slide2Title", "Slide 2 Title", "Slide 2"), slide2ButtonText: t("slide2ButtonText", "Slide 2 Button Text", "Shop"), slide3Image: img("slide3Image", "Slide 3 Image"), slide3Title: t("slide3Title", "Slide 3 Title", "Slide 3"), slide3ButtonText: t("slide3ButtonText", "Slide 3 Button Text", "Shop") },
      layout, bg, typography,
    ),
  },
  {
    type: "image-hero", label: "Image Hero", category: "hero", icon: "image-outline", description: "Clean hero with a single striking image",
    props: merge(
      { imageUrl: img("imageUrl", "Image"), overlay: tog("overlay", "Show Overlay", "true"), headline: t("headline", "Headline", "Hero Title"), subheadline: ta("subheadline", "Subheadline", ""), buttonText: t("buttonText", "Button Text", "Shop Now"), buttonLink: t("buttonLink", "Button Link", "/shop") },
      layout, bg, typography,
    ),
  },
  {
    type: "fullscreen-hero", label: "Fullscreen Hero", category: "hero", icon: "expand-outline", description: "Full viewport height hero for maximum impact",
    props: merge(
      { imageUrl: img("imageUrl", "Background Image"), headline: t("headline", "Headline", "Bold Statement"), subheadline: ta("subheadline", "Subheadline", "Supporting text"), buttonText: t("buttonText", "Button Text", "Get Started"), buttonLink: t("buttonLink", "Button Link", "/shop"), secondaryButtonText: t("secondaryButtonText", "Secondary Text", "Learn More"), secondaryButtonLink: t("secondaryButtonLink", "Secondary Link", "/about"), showScrollIndicator: tog("showScrollIndicator", "Show Scroll Indicator", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "countdown-hero", label: "Countdown Hero", category: "hero", icon: "timer-outline", description: "Hero with countdown timer to build urgency",
    props: merge(
      { imageUrl: img("imageUrl", "Background Image"), headline: t("headline", "Headline", "Big Sale Coming"), subheadline: ta("subheadline", "Subheadline", "Ends in..."), buttonText: t("buttonText", "Button Text", "Shop Now"), buttonLink: t("buttonLink", "Button Link", "/shop"), targetDate: t("targetDate", "Target Date", "2026-12-31"), targetTime: t("targetTime", "Target Time", "23:59") },
      layout, bg, typography,
    ),
  },
  {
    type: "flash-sale-hero", label: "Flash Sale Hero", category: "hero", icon: "flash-outline", description: "Urgency-driven hero for flash sales",
    props: merge(
      { imageUrl: img("imageUrl", "Background Image"), headline: t("headline", "Headline", "Flash Sale!"), subheadline: ta("subheadline", "Subheadline", "Limited time offer"), buttonText: t("buttonText", "Button Text", "Shop Sale"), buttonLink: t("buttonLink", "Button Link", "/sale"), discountLabel: t("discountLabel", "Discount Label", "50% OFF"), endDate: t("endDate", "End Date", "2026-12-31"), showTimer: tog("showTimer", "Show Countdown", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-hero", label: "Product Hero", category: "hero", icon: "bag-outline", description: "Hero featuring a specific product",
    props: merge(
      { productImage: img("productImage", "Product Image"), productName: t("productName", "Product Name", "Featured Product"), productPrice: t("productPrice", "Product Price", "$49.99"), originalPrice: t("originalPrice", "Original Price", "$79.99"), description: ta("description", "Description", "Product description"), buttonText: t("buttonText", "Button Text", "Buy Now"), buttonLink: t("buttonLink", "Button Link", "/product/featured"), badge: t("badge", "Badge Text", "New Arrival") },
      layout, bg, typography,
    ),
  },

  // ════════ PRODUCTS ════════
  {
    type: "featured-products", label: "Featured Products", category: "products", icon: "star-outline", description: "Display featured/picked products",
    props: merge(
      { title: t("title", "Section Title", "Featured Products"), subtitle: t("subtitle", "Subtitle", "Handpicked favorites"), gridColumns: gc(), productCount: n("productCount", "Max Products", "8"), showBadges: tog("showBadges", "Show Badges", "true"), showRatings: tog("showRatings", "Show Ratings", "true"), showViewAll: tog("showViewAll", "Show View All Link", "true"), viewAllLink: t("viewAllLink", "View All Link", "/shop") },
      layout, bg, typography,
    ),
  },
  {
    type: "new-arrivals", label: "New Arrivals", category: "products", icon: "add-circle-outline", description: "Showcase newest products",
    props: merge(
      { title: t("title", "Section Title", "New Arrivals"), subtitle: t("subtitle", "Subtitle", "Fresh from the collection"), gridColumns: gc(), productCount: n("productCount", "Max Products", "8"), showBadge: tog("showBadge", "Show 'New' Badge", "true"), daysNew: n("daysNew", "Days considered New", "30") },
      layout, bg, typography,
    ),
  },
  {
    type: "best-sellers", label: "Best Sellers", category: "products", icon: "trending-up-outline", description: "Show best-selling products",
    props: merge(
      { title: t("title", "Section Title", "Best Sellers"), subtitle: t("subtitle", "Subtitle", "Most popular products"), gridColumns: gc(), productCount: n("productCount", "Max Products", "8") },
      layout, bg, typography,
    ),
  },
  {
    type: "trending-products", label: "Trending Products", category: "products", icon: "flame-outline", description: "Display trending/hot products",
    props: merge(
      { title: t("title", "Section Title", "Trending Now"), subtitle: t("subtitle", "Subtitle", "What everyone's buying"), gridColumns: gc(), productCount: n("productCount", "Max Products", "8") },
      layout, bg, typography,
    ),
  },
  {
    type: "flash-sale", label: "Flash Sale Products", category: "products", icon: "flash-outline", description: "Flash sale with countdown and discounted products",
    props: merge(
      { title: t("title", "Section Title", "Flash Sale"), subtitle: t("subtitle", "Subtitle", "Limited time offers"), gridColumns: gc(), productCount: n("productCount", "Max Products", "4"), endDate: t("endDate", "Sale End Date", "2026-12-31"), showTimer: tog("showTimer", "Show Timer", "true"), timerLabel: t("timerLabel", "Timer Label", "Sale Ends In:") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-grid", label: "Product Grid", category: "products", icon: "grid-outline", description: "Customizable product grid layout",
    props: merge(
      { title: t("title", "Section Title", "Our Products"), subtitle: t("subtitle", "Subtitle", ""), gridColumns: gc(), productCount: n("productCount", "Products Per Page", "12"), showFilters: tog("showFilters", "Show Category Filters", "false"), showSort: tog("showSort", "Show Sort Options", "false") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-carousel", label: "Product Carousel", category: "products", icon: "images-outline", description: "Horizontal scrolling product carousel",
    props: merge(
      { title: t("title", "Section Title", "Products"), subtitle: t("subtitle", "Subtitle", ""), productCount: n("productCount", "Max Products", "12"), autoplay: tog("autoplay", "Auto Play", "true"), autoplaySpeed: n("autoplaySpeed", "Speed (ms)", "3000"), showArrows: tog("showArrows", "Show Arrows", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-slider", label: "Product Slider", category: "products", icon: "options-outline", description: "Swipeable product slider",
    props: merge(
      { title: t("title", "Section Title", "Products"), productCount: n("productCount", "Max Products", "6"), slidesPerView: s("slidesPerView", "Slides Per View", "3", [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-tabs", label: "Product Tabs", category: "products", icon: "document-text-outline", description: "Tabbed product sections (Featured/New/Best Sellers)",
    props: merge(
      { title: t("title", "Section Title", "Products"), tab1Label: t("tab1Label", "Tab 1 Label", "Featured"), tab2Label: t("tab2Label", "Tab 2 Label", "New Arrivals"), tab3Label: t("tab3Label", "Tab 3 Label", "Best Sellers"), productCount: n("productCount", "Products Per Tab", "4") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-collection", label: "Product Collection", category: "products", icon: "layers-outline", description: "Display a specific product collection",
    props: merge(
      { title: t("title", "Section Title", "Collection"), subtitle: t("subtitle", "Subtitle", ""), collectionName: t("collectionName", "Collection Name", "Summer Collection"), gridColumns: gc(), productCount: n("productCount", "Max Products", "8") },
      layout, bg, typography,
    ),
  },
  {
    type: "product-by-category", label: "Products By Category", category: "products", icon: "pricetags-outline", description: "Show products grouped by category",
    props: merge(
      { title: t("title", "Section Title", "Shop by Category"), gridColumns: gc(), categoriesPerRow: s("categoriesPerRow", "Categories Per Row", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), productsPerCategory: n("productsPerCategory", "Products Per Category", "4") },
      layout, bg, typography,
    ),
  },
  {
    type: "recently-viewed", label: "Recently Viewed", category: "products", icon: "time-outline", description: "Recently viewed products for returning customers",
    props: merge(
      { title: t("title", "Section Title", "Recently Viewed"), productCount: n("productCount", "Max Products", "6"), gridColumns: gc() },
      layout, bg, typography,
    ),
  },
  {
    type: "recommended-products", label: "Recommended Products", category: "products", icon: "thumbs-up-outline", description: "AI/related recommended products",
    props: merge(
      { title: t("title", "Section Title", "Recommended For You"), productCount: n("productCount", "Max Products", "6"), gridColumns: gc() },
      layout, bg, typography,
    ),
  },
  {
    type: "related-products", label: "Related Products", category: "products", icon: "link-outline", description: "Products related to current product",
    props: merge(
      { title: t("title", "Section Title", "Related Products"), productCount: n("productCount", "Max Products", "4"), gridColumns: gc() },
      layout, bg, typography,
    ),
  },
  {
    type: "bundle-products", label: "Bundle Products", category: "products", icon: "layers-outline", description: "Show product bundles with pricing",
    props: merge(
      { title: t("title", "Section Title", "Bundle & Save"), subtitle: t("subtitle", "Subtitle", "Save more with bundles"), gridColumns: gc(), showSavings: tog("showSavings", "Show Savings", "true") },
      layout, bg, typography,
    ),
  },

  // ════════ CATEGORY ════════
  {
    type: "category-grid", label: "Category Grid", category: "category", icon: "grid-outline", description: "Grid layout for categories",
    props: merge(
      { title: t("title", "Section Title", "Shop by Category"), subtitle: t("subtitle", "Subtitle", "Browse our collections"), gridColumns: gc(), cardStyle: s("cardStyle", "Card Style", "default", [{ value: "default", label: "Default" }, { value: "minimal", label: "Minimal" }, { value: "bordered", label: "Bordered" }, { value: "elevated", label: "Elevated" }], "layout"), showProductCount: tog("showProductCount", "Show Product Count", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "category-slider", label: "Category Slider", category: "category", icon: "images-outline", description: "Horizontal scrolling category cards",
    props: merge(
      { title: t("title", "Section Title", "Categories"), subtitle: t("subtitle", "Subtitle", ""), autoplay: tog("autoplay", "Auto Play", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "category-masonry", label: "Category Masonry", category: "category", icon: "copy-outline", description: "Masonry/pinterest-style category layout",
    props: merge(
      { title: t("title", "Section Title", "Categories"), subtitle: t("subtitle", "Subtitle", ""), columns: s("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "featured-categories", label: "Featured Categories", category: "category", icon: "star-outline", description: "Highlighted/featured category cards",
    props: merge(
      { title: t("title", "Section Title", "Featured Categories"), subtitle: t("subtitle", "Subtitle", "Top categories"), gridColumns: gc(), cardStyle: s("cardStyle", "Card Style", "elevated", [{ value: "default", label: "Default" }, { value: "elevated", label: "Elevated" }, { value: "overlay", label: "Overlay" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "category-banner", label: "Category Banner", category: "category", icon: "image-outline", description: "Single large category promotion banner",
    props: merge(
      { imageUrl: img("imageUrl", "Banner Image"), categoryName: t("categoryName", "Category Name", "New Collection"), description: ta("description", "Description", "Explore our latest"), buttonText: t("buttonText", "Button Text", "Shop Now"), buttonLink: t("buttonLink", "Button Link", "/category/new") },
      layout, bg, typography,
    ),
  },
  {
    type: "mega-category-grid", label: "Mega Category Grid", category: "category", icon: "grid-outline", description: "Large grid with multiple category cards",
    props: merge(
      { title: t("title", "Section Title", "Categories"), columns: s("columns", "Columns", "4", [{ value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }, { value: "6", label: "6" }], "layout"), showImages: tog("showImages", "Show Category Images", "true"), showDescriptions: tog("showDescriptions", "Show Descriptions", "false") },
      layout, bg, typography,
    ),
  },

  // ════════ PROMOTIONS ════════
  {
    type: "discount-banner", label: "Discount Banner", category: "promotions", icon: "percent-outline", description: "Percentage-off promotion banner",
    props: merge(
      { headline: t("headline", "Headline", "Big Savings!"), discountText: t("discountText", "Discount Text", "UP TO 40% OFF"), subheadline: ta("subheadline", "Subheadline", "Limited time offer"), buttonText: t("buttonText", "Button Text", "Shop Sale"), buttonLink: t("buttonLink", "Button Link", "/sale"), bgColor: c_("bgColor", "Background", "#ef4444"), textColor: c_("textColor", "Text Color", "#ffffff", "typography") },
      layout, bg, typography,
    ),
  },
  {
    type: "offer-banner", label: "Offer Banner", category: "promotions", icon: "pricetag-outline", description: "Special offer announcement banner",
    props: merge(
      { headline: t("headline", "Headline", "Special Offer"), offerText: t("offerText", "Offer Details", "Buy 2 Get 1 Free"), subheadline: ta("subheadline", "Subheadline", "Terms apply"), buttonText: t("buttonText", "Button Text", "Claim Offer"), buttonLink: t("buttonLink", "Button Link", "/offers"), bgImage: img("bgImage", "Background Image") },
      layout, bg, typography,
    ),
  },
  {
    type: "coupon-section", label: "Coupon Section", category: "promotions", icon: "ticket-outline", description: "Display coupon code for customers",
    props: merge(
      { headline: t("headline", "Headline", "Your Coupon"), couponCode: t("couponCode", "Coupon Code", "SAVE20"), discountValue: t("discountValue", "Discount Value", "20% OFF"), description: ta("description", "Description", "Use code at checkout"), expiryDate: t("expiryDate", "Expiry Date", "2026-12-31"), bgColor: c_("bgColor", "Background", "#f59e0b") },
      layout, typography,
    ),
  },
  {
    type: "deal-of-day", label: "Deal Of The Day", category: "promotions", icon: "sunny-outline", description: "Daily deal with countdown timer",
    props: merge(
      { title: t("title", "Title", "Deal of the Day"), productName: t("productName", "Product Name", "Product Name"), productImage: img("productImage", "Product Image"), price: t("price", "Sale Price", "$29.99"), originalPrice: t("originalPrice", "Original Price", "$59.99"), buttonText: t("buttonText", "Button Text", "Get This Deal"), buttonLink: t("buttonLink", "Button Link", "/product/deal"), endDate: t("endDate", "End Date", "2026-12-31") },
      layout, bg, typography,
    ),
  },
  {
    type: "limited-time-offer", label: "Limited Time Offer", category: "promotions", icon: "alarm-outline", description: "Urgency-based limited time promotion",
    props: merge(
      { headline: t("headline", "Headline", "Limited Time Offer"), subheadline: ta("subheadline", "Subheadline", "Hurry! Offer ends soon"), buttonText: t("buttonText", "Button Text", "Shop Now"), buttonLink: t("buttonLink", "Button Link", "/sale"), endDate: t("endDate", "End Date", "2026-12-31"), endTime: t("endTime", "End Time", "23:59"), bgColor: c_("bgColor", "Background", "#dc2626"), textColor: c_("textColor", "Text Color", "#ffffff", "typography") },
      layout, bg, typography,
    ),
  },
  {
    type: "bogo", label: "Buy One Get One", category: "promotions", icon: "gift-outline", description: "BOGO promotion section",
    props: merge(
      { headline: t("headline", "Headline", "Buy One Get One Free"), subheadline: ta("subheadline", "Subheadline", "Select items only"), buttonText: t("buttonText", "Button Text", "Shop BOGO"), buttonLink: t("buttonLink", "Button Link", "/bogo"), productImage: img("productImage", "Product Image"), endDate: t("endDate", "End Date", "2026-12-31") },
      layout, bg, typography,
    ),
  },
  {
    type: "seasonal-sale", label: "Seasonal Sale", category: "promotions", icon: "calendar-outline", description: "Seasonal/clearance sale promotion",
    props: merge(
      { headline: t("headline", "Headline", "Season Sale"), subheadline: ta("subheadline", "Subheadline", "Seasonal styles"), buttonText: t("buttonText", "Button Text", "Shop Seasonal Sale"), buttonLink: t("buttonLink", "Button Link", "/seasonal"), imageUrl: img("imageUrl", "Background Image"), seasonLabel: t("seasonLabel", "Season Label", "Summer 2026"), discountAmount: t("discountAmount", "Discount", "Up to 50% Off") },
      layout, bg, typography,
    ),
  },
  {
    type: "black-friday-banner", label: "Black Friday Banner", category: "promotions", icon: "bag-outline", description: "Black Friday/Cyber Monday promotion",
    props: merge(
      { headline: t("headline", "Headline", "BLACK FRIDAY"), subheadline: ta("subheadline", "Subheadline", "Biggest Sale of the Year"), discountText: t("discountText", "Discount Text", "UP TO 70% OFF"), buttonText: t("buttonText", "Button Text", "Shop Deals"), buttonLink: t("buttonLink", "Button Link", "/black-friday"), imageUrl: img("imageUrl", "Background Image"), bgColor: c_("bgColor", "Background", "#000000"), textColor: c_("textColor", "Text Color", "#ffffff", "typography") },
      layout, bg, typography,
    ),
  },

  // ════════ TRUST ════════
  {
    type: "testimonials", label: "Testimonials", category: "trust", icon: "chatbubbles-outline", description: "Customer testimonials and reviews",
    props: merge(
      { title: t("title", "Section Title", "What Our Customers Say"), subtitle: t("subtitle", "Subtitle", "Real reviews from real customers"), layout: s("layout", "Layout", "grid", [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel" }], "layout"), cardStyle: s("cardStyle", "Card Style", "default", [{ value: "default", label: "Default" }, { value: "bordered", label: "Bordered" }, { value: "elevated", label: "Elevated" }], "layout"), avatarStyle: s("avatarStyle", "Avatar Style", "circle", [{ value: "circle", label: "Circle" }, { value: "square", label: "Square" }, { value: "none", label: "None" }], "layout"), testimonialsCount: n("testimonialsCount", "Number of Testimonials", "6") },
      layout, bg, typography,
    ),
  },
  {
    type: "video-testimonials", label: "Video Testimonials", category: "trust", icon: "videocam-outline", description: "Customer testimonial videos",
    props: merge(
      { title: t("title", "Section Title", "Video Testimonials"), subtitle: t("subtitle", "Subtitle", "Hear from our customers"), layout: s("layout", "Layout", "grid", [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "customer-reviews", label: "Customer Reviews", category: "trust", icon: "star-outline", description: "Aggregated customer review scores",
    props: merge(
      { title: t("title", "Section Title", "Customer Reviews"), averageRating: t("averageRating", "Average Rating", "4.8"), totalReviews: t("totalReviews", "Total Reviews", "1,234"), showStars: tog("showStars", "Show Stars", "true"), showProgress: tog("showProgress", "Show Rating Breakdown", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "star-ratings", label: "Star Ratings", category: "trust", icon: "star-half-outline", description: "Visual star rating display",
    props: merge(
      { rating: t("rating", "Rating", "4.5"), maxRating: t("maxRating", "Max Rating", "5"), reviewCount: t("reviewCount", "Review Count", "500+"), text: t("text", "Text", "Rated by our customers") },
      layout, bg, typography,
    ),
  },
  {
    type: "trust-badges", label: "Trust Badges", category: "trust", icon: "shield-checkmark-outline", description: "Security and trust assurance badges",
    props: merge(
      { title: t("title", "Section Title", "Why Shop With Us"), showPayment: tog("showPayment", "Show Payment Badges", "true"), showShipping: tog("showShipping", "Show Shipping Badge", "true"), showSecurity: tog("showSecurity", "Show Security Badge", "true"), showGuarantee: tog("showGuarantee", "Show Guarantee Badge", "true"), showSupport: tog("showSupport", "Show Support Badge", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "guarantee-section", label: "Guarantee Section", category: "trust", icon: "shield-outline", description: "Money-back guarantee promise",
    props: merge(
      { headline: t("headline", "Headline", "100% Satisfaction Guaranteed"), description: ta("description", "Description", "Love it or get your money back"), guaranteeDays: t("guaranteeDays", "Guarantee Days", "30"), icon: s("icon", "Icon", "shield", [{ value: "shield", label: "Shield" }, { value: "star", label: "Star" }, { value: "heart", label: "Heart" }], "layout"), bgColor: c_("bgColor", "Background", "#f0fdf4") },
      layout, typography,
    ),
  },
  {
    type: "why-choose-us", label: "Why Choose Us", category: "trust", icon: "heart-outline", description: "Reasons to choose your store",
    props: merge(
      { title: t("title", "Section Title", "Why Choose Us"), subtitle: t("subtitle", "Subtitle", "What sets us apart"), columns: s("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), feature1Icon: t("feature1Icon", "Feature 1 Icon", "Truck"), feature1Text: t("feature1Text", "Feature 1 Text", "Free Shipping"), feature2Icon: t("feature2Icon", "Feature 2 Icon", "Shield"), feature2Text: t("feature2Text", "Feature 2 Text", "Secure Payment"), feature3Icon: t("feature3Icon", "Feature 3 Icon", "Headphones"), feature3Text: t("feature3Text", "Feature 3 Text", "24/7 Support") },
      layout, bg, typography,
    ),
  },
  {
    type: "success-stories", label: "Success Stories", category: "trust", icon: "trophy-outline", description: "Customer success stories and case studies",
    props: merge(
      { title: t("title", "Section Title", "Success Stories"), subtitle: t("subtitle", "Subtitle", "Real results from real customers"), layout: s("layout", "Layout", "grid", [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel" }], "layout") },
      layout, bg, typography,
    ),
  },

  // ════════ CONTENT ════════
  {
    type: "rich-text", label: "Rich Text", category: "content", icon: "document-text-outline", description: "Rich formatted text and HTML content",
    props: merge(
      { title: t("title", "Title", ""), content: ta("content", "Content", "Your content here"), showTitle: tog("showTitle", "Show Title", "true"), columns: s("columns", "Text Columns", "1", [{ value: "1", label: "Single" }, { value: "2", label: "Two" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "faq", label: "FAQ", category: "content", icon: "help-circle-outline", description: "Frequently asked questions accordion",
    props: merge(
      { title: t("title", "Section Title", "Frequently Asked Questions"), subtitle: t("subtitle", "Subtitle", "Got questions? We've got answers"), faqCount: n("faqCount", "Number of FAQs", "5"), layout: s("layout", "Layout", "accordion", [{ value: "accordion", label: "Accordion" }, { value: "list", label: "List" }], "layout"), showSearch: tog("showSearch", "Show Search", "false") },
      layout, bg, typography,
    ),
  },
  {
    type: "accordion", label: "Accordion", category: "content", icon: "chevron-expand-outline", description: "Expandable accordion content blocks",
    props: merge(
      { title: t("title", "Section Title", "Details"), items: n("items", "Number of Items", "4"), openFirst: tog("openFirst", "Open First by Default", "true"), multiOpen: tog("multiOpen", "Allow Multiple Open", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "feature-list", label: "Feature List", category: "content", icon: "checklist-outline", description: "Bulleted feature lists with icons",
    props: merge(
      { title: t("title", "Section Title", "Features"), subtitle: t("subtitle", "Subtitle", "Everything you need"), columns: s("columns", "Columns", "2", [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }], "layout"), showIcons: tog("showIcons", "Show Icons", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "benefits-section", label: "Benefits Section", category: "content", icon: "flash-outline", description: "Benefits and value propositions",
    props: merge(
      { title: t("title", "Section Title", "Benefits"), subtitle: t("subtitle", "Subtitle", "Why customers love us"), columns: s("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), cardStyle: s("cardStyle", "Card Style", "icon-top", [{ value: "icon-top", label: "Icon on Top" }, { value: "icon-left", label: "Icon on Left" }, { value: "minimal", label: "Minimal" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "timeline", label: "Timeline", category: "content", icon: "time-outline", description: "Vertical timeline for milestones",
    props: merge(
      { title: t("title", "Section Title", "Our Journey"), subtitle: t("subtitle", "Subtitle", "Milestones"), items: n("items", "Timeline Items", "4"), orientation: s("orientation", "Orientation", "vertical", [{ value: "vertical", label: "Vertical" }, { value: "horizontal", label: "Horizontal" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "company-story", label: "Company Story", category: "content", icon: "book-outline", description: "Brand story and history section",
    props: merge(
      { title: t("title", "Section Title", "Our Story"), content: ta("content", "Story Content", "Share your brand story here..."), imageUrl: img("imageUrl", "Story Image"), imagePosition: s("imagePosition", "Image Position", "right", [{ value: "left", label: "Left" }, { value: "right", label: "Right" }], "layout"), showSignature: tog("showSignature", "Show Signature", "false") },
      layout, bg, typography,
    ),
  },
  {
    type: "about-section", label: "About Section", category: "content", icon: "information-circle-outline", description: "About us section for the page",
    props: merge(
      { title: t("title", "Section Title", "About Us"), content: ta("content", "Content", "Learn about our brand..."), imageUrl: img("imageUrl", "Image"), imagePosition: s("imagePosition", "Image Position", "left", [{ value: "left", label: "Left" }, { value: "right", label: "Right" }], "layout"), layout: s("layout", "Layout", "side-by-side", [{ value: "side-by-side", label: "Side by Side" }, { value: "full", label: "Full Width" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "team-members", label: "Team Members", category: "content", icon: "people-outline", description: "Display team member profiles",
    props: merge(
      { title: t("title", "Section Title", "Our Team"), subtitle: t("subtitle", "Subtitle", "Meet the people behind the brand"), columns: s("columns", "Columns", "4", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), showSocial: tog("showSocial", "Show Social Links", "true"), memberCount: n("memberCount", "Team Members", "4") },
      layout, bg, typography,
    ),
  },
  {
    type: "mission-section", label: "Mission Section", category: "content", icon: "locate-outline", description: "Mission, vision, and values",
    props: merge(
      { title: t("title", "Section Title", "Our Mission"), mission: ta("mission", "Mission Statement", "Our mission is..."), vision: ta("vision", "Vision", "Our vision is..."), values: ta("values", "Core Values", "Value 1, Value 2, Value 3"), layout: s("layout", "Layout", "three-column", [{ value: "single", label: "Single" }, { value: "three-column", label: "Three Column" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "contact-section", label: "Contact", category: "content", icon: "mail-outline", description: "Business contact details with map",
    props: merge(
      {
        title: t("title", "Section Title", "Contact"),
        businessName: t("businessName", "Business Name", ""),
        phone: t("phone", "Phone", ""),
        email: t("email", "Email", ""),
        address: ta("address", "Address", ""),
        businessHours: ta("businessHours", "Working Hours", ""),
        mapEmbed: ta("mapEmbed", "Google Maps Embed URL", ""),
        latitude: t("latitude", "Latitude", ""),
        longitude: t("longitude", "Longitude", ""),
        facebook: t("facebook", "Facebook", ""),
        instagram: t("instagram", "Instagram", ""),
        x: t("x", "X / Twitter", ""),
      },
      layout, bg, typography,
    ),
  },
  {
    type: "google-map", label: "Google Map", category: "content", icon: "map-outline", description: "Embedded Google Map",
    props: merge(
      {
        title: t("title", "Section Title", "Find us"),
        address: ta("address", "Business Address", ""),
        mapEmbed: ta("mapEmbed", "Google Maps Embed URL", ""),
        latitude: t("latitude", "Latitude", ""),
        longitude: t("longitude", "Longitude", ""),
      },
      layout, bg,
    ),
  },

  // ════════ MEDIA ════════
  {
    type: "image-banner", label: "Image Banner", category: "media", icon: "image-outline", description: "Full-width image banner with optional text",
    props: merge(
      { imageUrl: img("imageUrl", "Banner Image"), mobileImageUrl: img("mobileImageUrl", "Mobile Image"), link: t("link", "Link URL", ""), alt: t("alt", "Alt Text", "Banner"), overlay: tog("overlay", "Show Overlay", "false"), caption: t("caption", "Caption Text", ""), bannerHeight: s("bannerHeight", "Height", "md", [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }], "layout") },
      layout, bg,
    ),
  },
  {
    type: "image-grid", label: "Image Grid", category: "media", icon: "grid-outline", description: "Grid of images with links",
    props: merge(
      { title: t("title", "Section Title", ""), columns: s("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), gap: s("gap", "Gap", "16", [{ value: "4", label: "Small" }, { value: "8", label: "Medium" }, { value: "16", label: "Large" }], "layout"), aspectRatio: s("aspectRatio", "Aspect Ratio", "1:1", [{ value: "1:1", label: "Square" }, { value: "4:3", label: "Landscape" }, { value: "3:4", label: "Portrait" }, { value: "16:9", label: "Wide" }], "layout") },
      layout, bg,
    ),
  },
  {
    type: "gallery", label: "Gallery", category: "media", icon: "images-outline", description: "Image gallery with lightbox",
    props: merge(
      { title: t("title", "Section Title", "Gallery"), subtitle: t("subtitle", "Subtitle", ""), columns: s("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), showLightbox: tog("showLightbox", "Enable Lightbox", "true"), imageCount: n("imageCount", "Number of Images", "6") },
      layout, bg, typography,
    ),
  },
  {
    type: "masonry-gallery", label: "Masonry Gallery", category: "media", icon: "copy-outline", description: "Pinterest-style masonry gallery",
    props: merge(
      { title: t("title", "Section Title", "Gallery"), columns: s("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), imageCount: n("imageCount", "Number of Images", "6") },
      layout, bg, typography,
    ),
  },
  {
    type: "before-after", label: "Before / After", category: "media", icon: "resize-outline", description: "Before and after comparison slider",
    props: merge(
      {
        title: t("title", "Section Title", "Transformation"),
        caption: ta("caption", "Caption", ""),
        beforeImage: img("beforeImage", "Before Image", "content"),
        afterImage: img("afterImage", "After Image", "content"),
        beforeLabel: t("beforeLabel", "Before Label", "Before"),
        afterLabel: t("afterLabel", "After Label", "After"),
        showLabels: tog("showLabels", "Show Labels", "true"),
        altText: t("altText", "Alt Text", ""),
        beforeAlt: t("beforeAlt", "Before Alt", ""),
        afterAlt: t("afterAlt", "After Alt", ""),
        orientation: s("orientation", "Orientation", "horizontal", [{ value: "horizontal", label: "Horizontal" }], "layout"),
        sliderPosition: r("sliderPosition", "Default Slider Position", "50", 0, 100, 1, "layout"),
        delimiterColor: c_("delimiterColor", "Delimiter Color", "#ffffff", "layout"),
        comparisonWidth: t("comparisonWidth", "Width", "100%", "layout"),
        comparisonHeight: s("comparisonHeight", "Height", "md", [
          { value: "sm", label: "Small" }, { value: "md", label: "Medium" },
          { value: "lg", label: "Large" }, { value: "xl", label: "Extra Large" },
        ], "layout"),
        comparisonRadius: r("comparisonRadius", "Image Border Radius", "16", 0, 48, 4, "layout"),
        showOverlay: tog("showOverlay", "Overlay", "false", "background"),
        overlayColor: c_("overlayColor", "Overlay Color", "rgba(0,0,0,0.15)"),
      },
      layout, bg, typography,
    ),
  },
  {
    type: "video-section", label: "Video Section", category: "media", icon: "videocam-outline", description: "Embedded video with description",
    props: merge(
      { title: t("title", "Section Title", "Watch"), description: ta("description", "Description", ""), videoUrl: vid("videoUrl", "Video URL"), posterImage: img("posterImage", "Poster Image"), autoplay: tog("autoplay", "Auto Play", "false"), controls: tog("controls", "Show Controls", "true"), aspectRatio: s("aspectRatio", "Aspect Ratio", "16:9", [{ value: "4:3", label: "4:3" }, { value: "16:9", label: "16:9" }, { value: "1:1", label: "Square" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "youtube-embed", label: "YouTube Embed", category: "media", icon: "logo-youtube", description: "Embedded YouTube video",
    props: merge(
      { title: t("title", "Title", ""), videoId: t("videoId", "YouTube Video ID", "dQw4w9WgXcQ"), autoplay: tog("autoplay", "Auto Play", "false"), showControls: tog("showControls", "Show Controls", "true"), loop: tog("loop", "Loop", "false"), aspectRatio: s("aspectRatio", "Aspect Ratio", "16:9", [{ value: "4:3", label: "4:3" }, { value: "16:9", label: "16:9" }, { value: "1:1", label: "Square" }], "layout") },
      layout, bg,
    ),
  },
  {
    type: "vimeo-embed", label: "Vimeo Embed", category: "media", icon: "videocam-outline", description: "Embedded Vimeo video",
    props: merge(
      { title: t("title", "Title", ""), videoId: t("videoId", "Vimeo Video ID", ""), autoplay: tog("autoplay", "Auto Play", "false"), aspectRatio: s("aspectRatio", "Aspect Ratio", "16:9", [{ value: "4:3", label: "4:3" }, { value: "16:9", label: "16:9" }], "layout") },
      layout, bg,
    ),
  },
  {
    type: "tiktok-embed", label: "TikTok Embed", category: "media", icon: "musical-notes-outline", description: "Embedded TikTok video",
    props: merge(
      { title: t("title", "Title", ""), videoUrl: t("videoUrl", "TikTok Video URL", ""), aspectRatio: s("aspectRatio", "Aspect Ratio", "9:16", [{ value: "1:1", label: "Square" }, { value: "9:16", label: "Portrait" }, { value: "16:9", label: "Landscape" }], "layout") },
      layout, bg,
    ),
  },

  // ════════ SOCIAL ════════
  {
    type: "instagram-feed", label: "Instagram Feed", category: "social", icon: "logo-instagram", description: "Display Instagram posts feed",
    props: merge(
      { title: t("title", "Section Title", "Follow Us on Instagram"), subtitle: t("subtitle", "Subtitle", "@yourstore"), handle: t("handle", "Instagram Handle", "@yourstore"), postCount: n("postCount", "Number of Posts", "6"), columns: s("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }], "layout"), showLikes: tog("showLikes", "Show Likes", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "facebook-feed", label: "Facebook Feed", category: "social", icon: "logo-facebook", description: "Display Facebook page feed",
    props: merge(
      { title: t("title", "Section Title", "Facebook"), pageUrl: t("pageUrl", "Facebook Page URL", ""), postCount: n("postCount", "Number of Posts", "4") },
      layout, bg, typography,
    ),
  },
  {
    type: "tiktok-feed", label: "TikTok Feed", category: "social", icon: "musical-notes-outline", description: "Display TikTok video feed",
    props: merge(
      { title: t("title", "Section Title", "TikTok"), handle: t("handle", "TikTok Handle", "@yourstore"), postCount: n("postCount", "Number of Videos", "4") },
      layout, bg, typography,
    ),
  },
  {
    type: "social-proof", label: "Social Proof", category: "social", icon: "people-outline", description: "Live social proof notifications",
    props: merge(
      { title: t("title", "Section Title", "Join Our Community"), userCount: t("userCount", "User Count", "10,000+"), joinText: t("joinText", "Join Text", "Happy customers"), showAvatars: tog("showAvatars", "Show Avatar Group", "true"), avatarImage: img("avatarImage", "Avatar Image") },
      layout, bg, typography,
    ),
  },
  {
    type: "ugc", label: "User Generated Content", category: "social", icon: "image-outline", description: "Display customer photos and UGC",
    props: merge(
      { title: t("title", "Section Title", "As Seen On You"), subtitle: t("subtitle", "Subtitle", "Tag us for a chance to be featured"), columns: s("columns", "Columns", "4", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }], "layout"), postCount: n("postCount", "Number of Posts", "8"), hashtag: t("hashtag", "Hashtag", "#yourstore") },
      layout, bg, typography,
    ),
  },

  // ════════ MARKETING ════════
  {
    type: "newsletter", label: "Newsletter", category: "marketing", icon: "mail-outline", description: "Email newsletter signup form",
    props: merge(
      { headline: t("headline", "Headline", "Stay in the Loop"), subheadline: ta("subheadline", "Subheadline", "Subscribe for exclusive deals"), buttonText: t("buttonText", "Button Text", "Subscribe"), buttonLink: t("buttonLink", "Button Link", "#"), placeholderText: t("placeholderText", "Input Placeholder", "Enter your email"), showName: tog("showName", "Show Name Field", "false"), bgImage: img("bgImage", "Background Image") },
      layout, bg, typography,
    ),
  },
  {
    type: "email-capture", label: "Email Capture", category: "marketing", icon: "at-outline", description: "Simple email capture form",
    props: merge(
      { headline: t("headline", "Headline", "Get 10% Off"), subheadline: ta("subheadline", "Subheadline", "Join our newsletter"), buttonText: t("buttonText", "Button Text", "Get Discount"), placeholderText: t("placeholderText", "Placeholder", "your@email.com"), incentiveText: t("incentiveText", "Incentive Text", "No spam. Unsubscribe anytime.") },
      layout, bg, typography,
    ),
  },
  {
    type: "popup-form", label: "Popup Form", category: "marketing", icon: "hand-left-outline", description: "Subscription popup form",
    props: merge(
      { headline: t("headline", "Headline", "Don't Miss Out!"), subheadline: ta("subheadline", "Subheadline", "Get exclusive offers"), buttonText: t("buttonText", "Button Text", "Subscribe"), imageUrl: img("imageUrl", "Popup Image"), delay: n("delay", "Delay (seconds)", "5"), showOnExit: tog("showOnExit", "Show on Exit Intent", "false") },
      layout, bg, typography,
    ),
  },
  {
    type: "announcement-bar", label: "Announcement Bar", category: "marketing", icon: "megaphone-outline", description: "Top announcement bar for promotions",
    props: merge(
      { text: t("text", "Announcement Text", "Free shipping on orders over $50!"), link: t("link", "Link URL", "/shop"), linkText: t("linkText", "Link Text", "Shop Now"), bgColor: c_("bgColor", "Background", "#18181b"), textColor: c_("textColor", "Text Color", "#ffffff", "typography"), dismissible: tog("dismissible", "Dismissible", "true"), showEmoji: tog("showEmoji", "Show Emoji", "true") },
      layout, typography,
    ),
  },
  {
    type: "floating-promotion", label: "Floating Promotion", category: "marketing", icon: "gift-outline", description: "Floating/sticky promotion bar",
    props: merge(
      { text: t("text", "Promotion Text", "Summer Sale - 50% Off!"), buttonText: t("buttonText", "Button Text", "Shop Now"), buttonLink: t("buttonLink", "Button Link", "/sale"), position: s("position", "Position", "bottom", [{ value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }], "layout"), bgColor: c_("bgColor", "Background", "#ef4444"), textColor: c_("textColor", "Text Color", "#ffffff", "typography") },
      typography,
    ),
  },

  // ════════ ADVANCED ════════
  {
    type: "countdown-timer", label: "Countdown Timer", category: "advanced", icon: "timer-outline", description: "Standalone countdown timer",
    props: merge(
      { title: t("title", "Section Title", "Hurry! Offer Ends In"), targetDate: t("targetDate", "Target Date", "2026-12-31"), targetTime: t("targetTime", "Target Time", "23:59"), style: s("style", "Style", "large", [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }], "layout"), showLabels: tog("showLabels", "Show Labels", "true"), bgColor: c_("bgColor", "Background", "") },
      layout, bg, typography,
    ),
  },
  {
    type: "stock-counter", label: "Stock Counter", category: "advanced", icon: "cube-outline", description: "Low stock count indicator",
    props: merge(
      { text: t("text", "Text", "Only {count} left in stock"), showWhen: s("showWhen", "Show When", "<10", [{ value: "<5", label: "Less than 5" }, { value: "<10", label: "Less than 10" }, { value: "<20", label: "Less than 20" }], "advanced"), bgColor: c_("bgColor", "Background", "#fef2f2") },
      layout, bg, typography,
    ),
  },
  {
    type: "visitor-counter", label: "Visitor Counter", category: "advanced", icon: "eye-outline", description: "Live visitor count",
    props: merge(
      { text: t("text", "Display Text", "{count} people are viewing this"), startCount: t("startCount", "Starting Count", "50"), bgColor: c_("bgColor", "Background", "#f0f9ff"), showIcon: tog("showIcon", "Show Icon", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "sales-popup", label: "Sales Popup", category: "advanced", icon: "notifications-outline", description: "Recent purchase notification popups",
    props: merge(
      { title: t("title", "Section Title", "Recent Purchases"), showProductImage: tog("showProductImage", "Show Product Image", "true"), showTimer: tog("showTimer", "Show Time Ago", "true"), interval: n("interval", "Interval (seconds)", "5"), maxItems: n("maxItems", "Max Items", "5") },
      layout, bg, typography,
    ),
  },
  {
    type: "recently-purchased-popup", label: "Recently Purchased Popup", category: "advanced", icon: "cart-outline", description: "Floating recently purchased notification",
    props: merge(
      { text: t("text", "Text", "{name} just purchased {product}"), displayDuration: n("displayDuration", "Display Duration (s)", "6"), imageUrl: img("imageUrl", "Product Image"), customerName: t("customerName", "Customer Name", "Sarah"), productName: t("productName", "Product Name", "Product"), location: t("location", "Location", "New York, USA") },
      layout, bg, typography,
    ),
  },
  {
    type: "live-visitors", label: "Live Visitors", category: "advanced", icon: "people-outline", description: "Live visitor count badge",
    props: merge(
      { text: t("text", "Display Text", "{count} visitors online"), showDot: tog("showDot", "Show Green Dot", "true"), bgColor: c_("bgColor", "Background", "#f0fdf4") },
      layout, bg, typography,
    ),
  },
  {
    type: "progress-bar", label: "Progress Bar", category: "advanced", icon: "bar-chart-outline", description: "Goal/campaign progress bar",
    props: merge(
      { title: t("title", "Title", "Our Goal"), currentAmount: t("currentAmount", "Current Amount", "75000"), targetAmount: t("targetAmount", "Target Amount", "100000"), suffix: t("suffix", "Suffix", "raised"), barColor: c_("barColor", "Bar Color", "#22c55e"), bgColor: c_("bgColor", "Background", "#f0fdf4") },
      layout, bg, typography,
    ),
  },
  {
    type: "order-counter", label: "Order Counter", category: "advanced", icon: "bag-outline", description: "Total orders served counter",
    props: merge(
      { title: t("title", "Title", "Orders Served"), count: t("count", "Count", "50,000+"), suffix: t("suffix", "Suffix", "orders and counting"), showIcon: tog("showIcon", "Show Icon", "true"), bgColor: c_("bgColor", "Background", "#f0fdf4") },
      layout, bg, typography,
    ),
  },

  // ════════ LAYOUT ════════
  {
    type: "one-column", label: "1 Column", category: "layout", icon: "remove-outline", description: "Single column content section",
    props: merge(
      { content: ta("content", "Content", "Your content here"), maxWidth: s("maxWidth", "Max Width", "800px", [{ value: "600px", label: "Narrow" }, { value: "800px", label: "Medium" }, { value: "1200px", label: "Wide" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "two-column", label: "2 Column", category: "layout", icon: "copy-outline", description: "Two column content section",
    props: merge(
      { leftContent: ta("leftContent", "Left Content", "Left column"), rightContent: ta("rightContent", "Right Content", "Right column"), ratio: s("ratio", "Column Ratio", "1:1", [{ value: "1:1", label: "Equal" }, { value: "2:1", label: "2:1" }, { value: "3:1", label: "3:1" }], "layout"), gap: s("gap", "Gap", "24", [{ value: "16", label: "Small" }, { value: "24", label: "Medium" }, { value: "32", label: "Large" }], "layout"), stackOnMobile: tog("stackOnMobile", "Stack on Mobile", "true") },
      layout, bg, typography,
    ),
  },
  {
    type: "three-column", label: "3 Column", category: "layout", icon: "copy-outline", description: "Three column content section",
    props: merge(
      { col1: ta("col1", "Column 1", "Content 1"), col2: ta("col2", "Column 2", "Content 2"), col3: ta("col3", "Column 3", "Content 3"), gap: s("gap", "Gap", "24", [{ value: "16", label: "Small" }, { value: "24", label: "Medium" }, { value: "32", label: "Large" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "four-column", label: "4 Column", category: "layout", icon: "grid-outline", description: "Four column content or grid section",
    props: merge(
      { columns: n("columns", "Active Columns", "4"), gap: s("gap", "Gap", "16", [{ value: "8", label: "Small" }, { value: "16", label: "Medium" }, { value: "24", label: "Large" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "container", label: "Container", category: "layout", icon: "square-outline", description: "Container box with custom width",
    props: merge(
      { content: ta("content", "Content", "Container content"), maxWidth: s("maxWidth", "Max Width", "1200px", [{ value: "800px", label: "Narrow" }, { value: "1200px", label: "Default" }, { value: "1400px", label: "Wide" }, { value: "100%", label: "Full" }], "layout"), minHeight: n("minHeight", "Min Height (px)", "200") },
      layout, bg, typography,
    ),
  },
  {
    type: "full-width", label: "Full Width", category: "layout", icon: "expand-outline", description: "Full-width content section",
    props: merge(
      { content: ta("content", "Content", "Full width content"), innerMaxWidth: s("innerMaxWidth", "Inner Max Width", "1200px", [{ value: "100%", label: "Full" }, { value: "1200px", label: "Default" }], "layout") },
      layout, bg, typography,
    ),
  },
  {
    type: "grid-layout", label: "Grid Layout", category: "layout", icon: "grid-outline", description: "Customizable responsive grid",
    props: merge(
      { desktopColumns: s("desktopColumns", "Desktop Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }, { value: "6", label: "6" }], "layout"), tabletColumns: s("tabletColumns", "Tablet Columns", "2", [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), mobileColumns: s("mobileColumns", "Mobile Columns", "1", [{ value: "1", label: "1" }, { value: "2", label: "2" }], "layout"), gap: s("gap", "Gap", "16", [{ value: "4", label: "Small" }, { value: "8", label: "Medium" }, { value: "16", label: "Large" }], "layout") },
      layout, bg,
    ),
  },
  {
    type: "masonry-layout", label: "Masonry Layout", category: "layout", icon: "copy-outline", description: "Masonry/pinterest grid layout",
    props: merge(
      { columns: s("columns", "Columns", "3", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), gap: n("gap", "Gap (px)", "16") },
      layout, bg,
    ),
  },
  {
    type: "tabs-layout", label: "Tabs Layout", category: "layout", icon: "document-text-outline", description: "Tabbed content section",
    props: merge(
      { tab1Label: t("tab1Label", "Tab 1 Label", "Tab 1"), tab1Content: ta("tab1Content", "Tab 1 Content", "Content 1"), tab2Label: t("tab2Label", "Tab 2 Label", "Tab 2"), tab2Content: ta("tab2Content", "Tab 2 Content", "Content 2"), tab3Label: t("tab3Label", "Tab 3 Label", "Tab 3"), tab3Content: ta("tab3Content", "Tab 3 Content", "Content 3"), tabStyle: s("tabStyle", "Tab Style", "underline", [{ value: "underline", label: "Underline" }, { value: "pills", label: "Pills" }, { value: "buttons", label: "Buttons" }], "layout") },
      layout, bg, typography,
    ),
  },

  // ════════ HEADER ════════
  {
    type: "header-logo", label: "Logo", category: "header", icon: "image-outline", description: "Store logo and name",
    props: merge(
      { logoUrl: img("logoUrl", "Logo Image"), storeName: t("storeName", "Store Name", "My Store"), logoHeight: s("logoHeight", "Logo Height", "32", [{ value: "24", label: "24px" }, { value: "28", label: "28px" }, { value: "32", label: "32px" }, { value: "36", label: "36px" }, { value: "40", label: "40px" }], "layout"), showName: tog("showName", "Show Store Name", "true") },
      layout,
    ),
  },
  {
    type: "header-nav", label: "Navigation", category: "header", icon: "menu-outline", description: "Navigation menu links",
    props: merge(
      { link1Text: t("link1Text", "Link 1 Text", "Home"), link1Url: t("link1Url", "Link 1 URL", "/"), link2Text: t("link2Text", "Link 2 Text", "Shop"), link2Url: t("link2Url", "Link 2 URL", "/shop"), link3Text: t("link3Text", "Link 3 Text", "About"), link3Url: t("link3Url", "Link 3 URL", "/about"), link4Text: t("link4Text", "Link 4 Text", "Contact"), link4Url: t("link4Url", "Link 4 URL", "/contact"), link5Text: t("link5Text", "Link 5 Text", ""), link5Url: t("link5Url", "Link 5 URL", ""), menuStyle: s("menuStyle", "Menu Style", "horizontal", [{ value: "horizontal", label: "Horizontal" }, { value: "centered", label: "Centered" }], "layout"), gap: s("gap", "Link Gap", "24", [{ value: "16", label: "Small" }, { value: "24", label: "Medium" }, { value: "32", label: "Large" }], "layout") },
      layout, typography,
    ),
  },
  {
    type: "header-icons", label: "Header Icons", category: "header", icon: "heart-outline", description: "Search, wishlist, cart, and account icons",
    props: merge(
      { showSearch: tog("showSearch", "Show Search", "true"), showWishlist: tog("showWishlist", "Show Wishlist", "true"), showCart: tog("showCart", "Show Cart", "true"), showAccount: tog("showAccount", "Show Account", "true"), iconSize: s("iconSize", "Icon Size", "20", [{ value: "16", label: "16px" }, { value: "18", label: "18px" }, { value: "20", label: "20px" }, { value: "24", label: "24px" }], "layout"), iconColor: c_("iconColor", "Icon Color", "#71717a", "typography") },
      layout,
    ),
  },
  {
    type: "header-bar", label: "Header Bar", category: "header", icon: "grid-outline", description: "Complete header bar with logo, nav, and icons",
    props: merge(
      { logoUrl: img("logoUrl", "Logo Image"), storeName: t("storeName", "Store Name", "My Store"), showName: tog("showName", "Show Store Name", "true"), layout: s("layout", "Header Layout", "logo-nav-icons", [{ value: "logo-nav-icons", label: "Logo | Nav | Icons" }, { value: "logo-icons-nav", label: "Logo | Icons | Nav" }, { value: "nav-logo-icons", label: "Nav | Logo | Icons" }], "layout"), navPosition: s("navPosition", "Nav Position", "center", [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }], "layout"), showSearch: tog("showSearch", "Search Icon", "true"), showWishlist: tog("showWishlist", "Wishlist Icon", "true"), showCart: tog("showCart", "Cart Icon", "true"), showAccount: tog("showAccount", "Account Icon", "true"), sticky: tog("sticky", "Sticky Header", "true"), transparent: tog("transparent", "Transparent", "false"), headerBg: c_("headerBg", "Background", "#ffffff", "background"), headerHeight: s("headerHeight", "Height", "64", [{ value: "48", label: "48px" }, { value: "56", label: "56px" }, { value: "64", label: "64px" }, { value: "72", label: "72px" }, { value: "80", label: "80px" }], "layout") },
      layout, typography,
    ),
  },

  // ════════ FOOTER ════════
  {
    type: "simple-footer", label: "Simple Footer", category: "footer", icon: "contract-outline", description: "Minimal footer with copyright",
    props: merge(
      { copyright: t("copyright", "Copyright Text", "© 2026 Your Store. All rights reserved."), showSocial: tog("showSocial", "Show Social Icons", "true"), bgColor: c_("bgColor", "Background", "#09090b"), textColor: c_("textColor", "Text Color", "#fafafa", "typography"), layout: s("layout", "Layout", "centered", [{ value: "centered", label: "Centered" }, { value: "split", label: "Split" }], "layout") },
      layout, typography,
    ),
  },
  {
    type: "ecommerce-footer", label: "Ecommerce Footer", category: "footer", icon: "bag-outline", description: "Full ecommerce footer with links",
    props: merge(
      { copyright: t("copyright", "Copyright Text", "© 2026 Your Store. All rights reserved."), showSocial: tog("showSocial", "Show Social", "true"), showNewsletter: tog("showNewsletter", "Show Newsletter", "true"), showPaymentIcons: tog("showPaymentIcons", "Show Payment Icons", "true"), contactEmail: t("contactEmail", "Contact Email", "hello@example.com"), contactPhone: t("contactPhone", "Contact Phone", "+1 (555) 123-4567"), contactAddress: t("contactAddress", "Address", "123 Commerce St, NY"), bgColor: c_("bgColor", "Background", "#09090b"), textColor: c_("textColor", "Text Color", "#fafafa", "typography"), columns: s("columns", "Columns", "4", [{ value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }], "layout") },
      layout, typography,
    ),
  },
  {
    type: "mega-footer", label: "Mega Footer", category: "footer", icon: "grid-outline", description: "Large footer with many columns and sections",
    props: merge(
      { copyright: t("copyright", "Copyright", "© 2026"), showBrand: tog("showBrand", "Show Brand Info", "true"), showLinks: tog("showLinks", "Show Link Columns", "true"), showSocial: tog("showSocial", "Show Social", "true"), showNewsletter: tog("showNewsletter", "Show Newsletter", "true"), showPayment: tog("showPayment", "Show Payment Icons", "true"), showBadges: tog("showBadges", "Show Trust Badges", "true"), bgColor: c_("bgColor", "Background", "#09090b"), textColor: c_("textColor", "Text Color", "#fafafa", "typography") },
      layout, typography,
    ),
  },
  {
    type: "multi-column-footer", label: "Multi Column Footer", category: "footer", icon: "copy-outline", description: "Multi-column footer with link groups",
    props: merge(
      { copyright: t("copyright", "Copyright", "© 2026"), columnCount: s("columnCount", "Column Count", "4", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), showSocial: tog("showSocial", "Show Social", "true"), bgColor: c_("bgColor", "Background", "#09090b"), textColor: c_("textColor", "Text Color", "#fafafa", "typography") },
      layout, typography,
    ),
  },
  {
    type: "footer-links", label: "Footer Links", category: "footer", icon: "link-outline", description: "Multi-column link list for footer",
    props: merge(
      { title: t("title", "Section Title", "Quick Links"), columns: s("columns", "Columns", "3", [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], "layout"), link1Text: t("link1Text", "Link 1 Text", "Home"), link1Url: t("link1Url", "Link 1 URL", "/"), link2Text: t("link2Text", "Link 2 Text", "Shop"), link2Url: t("link2Url", "Link 2 URL", "/shop"), link3Text: t("link3Text", "Link 3 Text", "About"), link3Url: t("link3Url", "Link 3 URL", "/about"), link4Text: t("link4Text", "Link 4 Text", "Contact"), link4Url: t("link4Url", "Link 4 URL", "/contact"), link5Text: t("link5Text", "Link 5 Text", "FAQ"), link5Url: t("link5Url", "Link 5 URL", "/faq"), link6Text: t("link6Text", "Link 6 Text", "Privacy"), link6Url: t("link6Url", "Link 6 URL", "/privacy"), link7Text: t("link7Text", "Link 7 Text", "Terms"), link7Url: t("link7Url", "Link 7 URL", "/terms"), link8Text: t("link8Text", "Link 8 Text", "Shipping"), link8Url: t("link8Url", "Link 8 URL", "/shipping"), link9Text: t("link9Text", "Link 9 Text", "Returns"), link9Url: t("link9Url", "Link 9 URL", "/returns"), linkColor: c_("linkColor", "Link Color", "#71717a", "typography"), headingColor: c_("headingColor", "Heading Color", "#18181b", "typography") },
      layout, typography,
    ),
  },
  {
    type: "footer-social", label: "Footer Social", category: "footer", icon: "share-outline", description: "Social media icon links for footer",
    props: merge(
      { label: t("label", "Section Label", "Follow Us"), showFacebook: tog("showFacebook", "Show Facebook", "true"), showTwitter: tog("showTwitter", "Show Twitter", "true"), showInstagram: tog("showInstagram", "Show Instagram", "true"), showYoutube: tog("showYoutube", "Show Youtube", "true"), iconColor: c_("iconColor", "Icon Color", "#71717a", "typography"), hoverColor: c_("hoverColor", "Hover Color", "#2563eb", "typography"), iconSize: n("iconSize", "Icon Size", "18", "layout"), headingColor: c_("headingColor", "Heading Color", "#18181b", "typography") },
      layout, typography,
    ),
  },
  {
    type: "footer-copyright", label: "Footer Copyright", category: "footer", icon: "document-outline", description: "Copyright notice for footer bottom bar",
    props: merge(
      { text: t("text", "Copyright Text", "© 2026 All rights reserved."), textColor: c_("textColor", "Text Color", "#a1a1aa", "typography"), fontSize: n("fontSize", "Font Size", "12", "typography"), alignment: s("alignment", "Alignment", "center", [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }], "layout") },
      layout, typography,
    ),
  },
];

export const sectionRegistryMap: Record<string, SectionDef> = {};
for (const def of sectionRegistry) {
  sectionRegistryMap[def.type] = def;
}

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
  return sectionRegistryMap[type] ?? sectionRegistryMap[normalizeSectionType(type)];
}
