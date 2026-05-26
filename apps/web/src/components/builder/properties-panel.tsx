"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { updateSectionProps, setSelectedSection } from "@/redux/slices/builder-slice";
import { X, Image, Palette, Type, Layers, AlignLeft, Eye, EyeOff, Square, ChevronDown, ChevronRight, Monitor, Smartphone, Tablet, Play, Wind, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";

type PropControl = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "color" | "image" | "number" | "toggle";
  options?: { value: string; label: string }[];
  placeholder?: string;
};

const DEVICES = [
  { key: "desktop", icon: Monitor, label: "Desktop" },
  { key: "tablet", icon: Tablet, label: "Tablet" },
  { key: "mobile", icon: Smartphone, label: "Mobile" },
];

const animationControls: PropControl[] = [
  { key: "anim_entrance", label: "Entrance Animation", type: "select", options: [
    { value: "none", label: "None" }, { value: "fade", label: "Fade In" },
    { value: "slide-up", label: "Slide Up" }, { value: "slide-down", label: "Slide Down" },
    { value: "slide-left", label: "Slide Left" }, { value: "slide-right", label: "Slide Right" },
    { value: "zoom-in", label: "Zoom In" }, { value: "zoom-out", label: "Zoom Out" },
    { value: "rotate", label: "Rotate" }, { value: "flip", label: "Flip" },
  ]},
  { key: "anim_duration", label: "Duration (s)", type: "select", options: [
    { value: "0.3", label: "0.3s Fast" }, { value: "0.5", label: "0.5s" },
    { value: "0.8", label: "0.8s" }, { value: "1", label: "1s" },
    { value: "1.5", label: "1.5s Slow" }, { value: "2", label: "2s Very Slow" },
  ]},
  { key: "anim_delay", label: "Delay (s)", type: "select", options: [
    { value: "0", label: "None" }, { value: "0.1", label: "0.1s" },
    { value: "0.2", label: "0.2s" }, { value: "0.3", label: "0.3s" },
    { value: "0.5", label: "0.5s" }, { value: "1", label: "1s" },
  ]},
  { key: "anim_ease", label: "Easing", type: "select", options: [
    { value: "ease-out", label: "Ease Out" }, { value: "ease-in", label: "Ease In" },
    { value: "ease-in-out", label: "Ease In Out" }, { value: "linear", label: "Linear" },
    { value: "bounce", label: "Bounce" },
  ]},
  { key: "anim_hover", label: "Hover Effect", type: "select", options: [
    { value: "none", label: "None" }, { value: "scale", label: "Scale" },
    { value: "lift", label: "Lift" }, { value: "glow", label: "Glow" },
    { value: "tilt", label: "Tilt" }, { value: "magnetic", label: "Magnetic" },
  ]},
  { key: "anim_parallax", label: "Parallax Speed", type: "select", options: [
    { value: "0", label: "None" }, { value: "0.1", label: "Slow" },
    { value: "0.2", label: "Medium" }, { value: "0.3", label: "Fast" },
    { value: "0.5", label: "Very Fast" },
  ]},
  { key: "anim_scrollReveal", label: "Scroll Reveal", type: "toggle" },
  { key: "anim_stagger", label: "Stagger Children", type: "toggle" },
];

const responsiveControls: PropControl[] = [
  { key: "resp_hideDesktop", label: "Hide on Desktop", type: "toggle" },
  { key: "resp_hideTablet", label: "Hide on Tablet", type: "toggle" },
  { key: "resp_hideMobile", label: "Hide on Mobile", type: "toggle" },
  { key: "resp_fontSizeDesktop", label: "Font Size (Desktop)", type: "select", options: [
    { value: "default", label: "Default" }, { value: "sm", label: "Small" },
    { value: "base", label: "Base" }, { value: "lg", label: "Large" },
    { value: "xl", label: "X-Large" }, { value: "2xl", label: "2X-Large" },
    { value: "3xl", label: "3X-Large" },
  ]},
  { key: "resp_fontSizeTablet", label: "Font Size (Tablet)", type: "select", options: [
    { value: "default", label: "Default" }, { value: "sm", label: "Small" },
    { value: "base", label: "Base" }, { value: "lg", label: "Large" },
    { value: "xl", label: "X-Large" }, { value: "2xl", label: "2X-Large" },
  ]},
  { key: "resp_fontSizeMobile", label: "Font Size (Mobile)", type: "select", options: [
    { value: "default", label: "Default" }, { value: "sm", label: "Small" },
    { value: "base", label: "Base" }, { value: "lg", label: "Large" },
    { value: "xl", label: "X-Large" },
  ]},
  { key: "resp_paddingDesktop", label: "Padding (Desktop)", type: "select", options: [
    { value: "0", label: "None" }, { value: "16", label: "Small" },
    { value: "32", label: "Medium" }, { value: "48", label: "Large" },
    { value: "64", label: "X-Large" }, { value: "96", label: "2X-Large" },
  ]},
  { key: "resp_paddingTablet", label: "Padding (Tablet)", type: "select", options: [
    { value: "0", label: "None" }, { value: "16", label: "Small" },
    { value: "32", label: "Medium" }, { value: "48", label: "Large" },
    { value: "64", label: "X-Large" },
  ]},
  { key: "resp_paddingMobile", label: "Padding (Mobile)", type: "select", options: [
    { value: "0", label: "None" }, { value: "8", label: "Small" },
    { value: "16", label: "Medium" }, { value: "24", label: "Large" },
    { value: "32", label: "X-Large" },
  ]},
  { key: "resp_widthDesktop", label: "Max Width (Desktop)", type: "select", options: [
    { value: "full", label: "Full" }, { value: "1200", label: "1200px" },
    { value: "1080", label: "1080px" }, { value: "960", label: "960px" },
    { value: "720", label: "720px" },
  ]},
  { key: "resp_textAlign", label: "Text Alignment", type: "select", options: [
    { value: "left", label: "Left" }, { value: "center", label: "Center" },
    { value: "right", label: "Right" },
  ]},
];

const advancedStyleControls: PropControl[] = [
  { key: "style_blur", label: "Backdrop Blur", type: "select", options: [
    { value: "0", label: "None" }, { value: "4", label: "4px" },
    { value: "8", label: "8px" }, { value: "12", label: "12px" },
    { value: "16", label: "16px" }, { value: "24", label: "24px" },
  ]},
  { key: "style_glassmorphism", label: "Glassmorphism", type: "toggle" },
  { key: "style_gradient", label: "Background Gradient", type: "select", options: [
    { value: "none", label: "None" }, { value: "to-r", label: "Left to Right" },
    { value: "to-b", label: "Top to Bottom" }, { value: "to-tr", label: "Bottom Left to Top Right" },
    { value: "to-bl", label: "Top Right to Bottom Left" },
    { value: "custom", label: "Custom CSS" },
  ]},
  { key: "style_gradientStart", label: "Gradient Start Color", type: "color" },
  { key: "style_gradientEnd", label: "Gradient End Color", type: "color" },
  { key: "style_borderWidth", label: "Border Width", type: "select", options: [
    { value: "0", label: "None" }, { value: "1", label: "1px" },
    { value: "2", label: "2px" }, { value: "3", label: "3px" },
    { value: "4", label: "4px" },
  ]},
  { key: "style_borderColor", label: "Border Color", type: "color" },
  { key: "style_borderStyle", label: "Border Style", type: "select", options: [
    { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" },
    { value: "dotted", label: "Dotted" }, { value: "double", label: "Double" },
  ]},
  { key: "style_opacity", label: "Opacity", type: "select", options: [
    { value: "100", label: "100%" }, { value: "80", label: "80%" },
    { value: "60", label: "60%" }, { value: "40", label: "40%" },
    { value: "20", label: "20%" }, { value: "0", label: "0%" },
  ]},
];

const styleControls: PropControl[] = [
  { key: "style_borderRadius", label: "Border Radius", type: "select", options: [
    { value: "0", label: "None" }, { value: "8", label: "Small" },
    { value: "12", label: "Medium" }, { value: "16", label: "Large" },
    { value: "24", label: "X-Large" }, { value: "9999", label: "Full" },
  ]},
  { key: "style_shadow", label: "Shadow", type: "select", options: [
    { value: "none", label: "None" }, { value: "sm", label: "Small" },
    { value: "md", label: "Medium" }, { value: "lg", label: "Large" },
    { value: "xl", label: "X-Large" }, { value: "2xl", label: "2X-Large" },
  ]},
  { key: "style_paddingTop", label: "Padding Top", type: "select", options: [
    { value: "0", label: "None" }, { value: "16", label: "Small" },
    { value: "32", label: "Medium" }, { value: "48", label: "Large" },
    { value: "64", label: "X-Large" }, { value: "96", label: "2X-Large" },
  ]},
  { key: "style_paddingBottom", label: "Padding Bottom", type: "select", options: [
    { value: "0", label: "None" }, { value: "16", label: "Small" },
    { value: "32", label: "Medium" }, { value: "48", label: "Large" },
    { value: "64", label: "X-Large" }, { value: "96", label: "2X-Large" },
  ]},
  { key: "style_paddingLeft", label: "Padding Left", type: "select", options: [
    { value: "0", label: "None" }, { value: "16", label: "Small" },
    { value: "32", label: "Medium" }, { value: "48", label: "Large" },
    { value: "64", label: "X-Large" },
  ]},
  { key: "style_paddingRight", label: "Padding Right", type: "select", options: [
    { value: "0", label: "None" }, { value: "16", label: "Small" },
    { value: "32", label: "Medium" }, { value: "48", label: "Large" },
    { value: "64", label: "X-Large" },
  ]},
  { key: "style_fontSize", label: "Font Size", type: "select", options: [
    { value: "default", label: "Default" }, { value: "sm", label: "Small" },
    { value: "lg", label: "Large" }, { value: "xl", label: "X-Large" },
    { value: "2xl", label: "2X-Large" }, { value: "3xl", label: "3X-Large" },
  ]},
  { key: "style_fontWeight", label: "Font Weight", type: "select", options: [
    { value: "default", label: "Default" }, { value: "normal", label: "Normal" },
    { value: "medium", label: "Medium" }, { value: "semibold", label: "Semibold" },
    { value: "bold", label: "Bold" },
  ]},
  { key: "style_textColor", label: "Text Color", type: "color" },
  { key: "style_bgColor", label: "Background Color", type: "color" },
  { key: "style_bgImage", label: "Background Image URL", type: "image" },
  { key: "style_marginTop", label: "Margin Top", type: "select", options: [
    { value: "0", label: "None" }, { value: "16", label: "16px" },
    { value: "32", label: "32px" }, { value: "48", label: "48px" },
    { value: "64", label: "64px" }, { value: "96", label: "96px" },
  ]},
  { key: "style_marginBottom", label: "Margin Bottom", type: "select", options: [
    { value: "0", label: "None" }, { value: "16", label: "16px" },
    { value: "32", label: "32px" }, { value: "48", label: "48px" },
    { value: "64", label: "64px" }, { value: "96", label: "96px" },
  ]},
];

const sectionControls: Record<string, PropControl[]> = {
  hero: [
    { key: "imageUrl", label: "Background Image URL", type: "image", placeholder: "https://...desktop.jpg" },
    { key: "mobileImageUrl", label: "Mobile Image URL", type: "image", placeholder: "https://...mobile.jpg" },
    { key: "videoUrl", label: "Video Background URL", type: "image", placeholder: "https://...mp4" },
    { key: "kicker", label: "Kicker / Badge", type: "text", placeholder: "Welcome to Store" },
    { key: "headline", label: "Headline", type: "text", placeholder: "Your main headline" },
    { key: "subheadline", label: "Subheadline", type: "textarea", placeholder: "Supporting text" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Shop Now" },
    { key: "buttonLink", label: "Button Link", type: "text", placeholder: "/shop" },
    { key: "secondaryButtonText", label: "Secondary Button Text", type: "text", placeholder: "Learn More" },
    { key: "secondaryButtonLink", label: "Secondary Button Link", type: "text", placeholder: "/about" },
    { key: "overlayColor", label: "Overlay Color", type: "color" },
    { key: "overlayOpacity", label: "Overlay Opacity", type: "number" },
    { key: "textAlignment", label: "Text Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
    { key: "heroHeight", label: "Hero Height", type: "select", options: [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "Full Screen" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "backgroundGradient", label: "Gradient (e.g. #000→#333)", type: "text", placeholder: "#000000,#333333" },
    { key: "sliderDelay", label: "Slider Delay (ms)", type: "number" },
    { key: "sliderInfinite", label: "Infinite Loop", type: "toggle" },
    { key: "countdownDate", label: "Countdown Date", type: "text", placeholder: "2026-12-31T23:59:59Z" },
    { key: "floatingBadge", label: "Floating Badge Text", type: "text", placeholder: "Free Shipping" },
    { key: "floatingBadgeIcon", label: "Floating Badge Icon URL", type: "image" },
  ],
  features: [
    { key: "title", label: "Section Title", type: "text", placeholder: "Shop by Category" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Browse our collections" },
    { key: "gridColumns", label: "Grid Columns", type: "select", options: [{ value: "2", label: "2 Columns" }, { value: "3", label: "3 Columns" }, { value: "4", label: "4 Columns" }] },
    { key: "cardStyle", label: "Card Style", type: "select", options: [{ value: "default", label: "Default" }, { value: "minimal", label: "Minimal" }, { value: "bordered", label: "Bordered" }, { value: "elevated", label: "Elevated" }, { value: "glass", label: "Glassmorphism" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
  ],
  products: [
    { key: "title", label: "Section Title", type: "text", placeholder: "Featured Products" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Our best sellers" },
    { key: "gridColumns", label: "Grid Columns", type: "select", options: [{ value: "2", label: "2 Columns" }, { value: "3", label: "3 Columns" }, { value: "4", label: "4 Columns" }, { value: "5", label: "5 Columns" }, { value: "6", label: "6 Columns" }] },
    { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel" }, { value: "masonry", label: "Masonry" }, { value: "list", label: "List" }] },
    { key: "showBadges", label: "Show Badges", type: "toggle" },
    { key: "showRatings", label: "Show Ratings", type: "toggle" },
    { key: "showSaleCountdown", label: "Sale Countdown", type: "toggle" },
    { key: "showLowStock", label: "Low Stock Warning", type: "toggle" },
    { key: "showQuickView", label: "Quick View Button", type: "toggle" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
  ],
  testimonials: [
    { key: "title", label: "Section Title", type: "text", placeholder: "What Customers Say" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Hear from our customers" },
    { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel / Slider" }, { value: "masonry", label: "Masonry" }] },
    { key: "cardStyle", label: "Card Style", type: "select", options: [{ value: "default", label: "Default" }, { value: "bordered", label: "Bordered" }, { value: "elevated", label: "Elevated" }, { value: "glass", label: "Glassmorphism" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "avatarStyle", label: "Avatar Style", type: "select", options: [{ value: "circle", label: "Circle" }, { value: "square", label: "Square" }, { value: "none", label: "None" }] },
    { key: "autoSlide", label: "Auto Slide", type: "toggle" },
    { key: "autoSlideDelay", label: "Auto Slide Delay (ms)", type: "number" },
  ],
  cta: [
    { key: "headline", label: "Headline", type: "text", placeholder: "Stay in the Loop" },
    { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Subscribe to our newsletter" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Subscribe" },
    { key: "buttonLink", label: "Button Link", type: "text", placeholder: "#" },
    { key: "inputPlaceholder", label: "Input Placeholder", type: "text", placeholder: "Enter your email" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "backgroundImage", label: "Background Image URL", type: "image" },
    { key: "showSocialProof", label: "Show Social Proof", type: "toggle" },
    { key: "socialProofText", label: "Social Proof Text", type: "text", placeholder: "Join 10,000+ subscribers" },
  ],
  footer: [
    { key: "copyright", label: "Copyright Text", type: "text", placeholder: "© 2026 Your Store" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "showSocialLinks", label: "Show Social Links", type: "toggle" },
    { key: "showPaymentIcons", label: "Show Payment Icons", type: "toggle" },
    { key: "showTrustBadges", label: "Show Trust Badges", type: "toggle" },
    { key: "contactEmail", label: "Contact Email", type: "text", placeholder: "hello@example.com" },
    { key: "contactPhone", label: "Contact Phone", type: "text", placeholder: "+1 (555) 123-4567" },
    { key: "contactAddress", label: "Contact Address", type: "text", placeholder: "123 Commerce St" },
    { key: "newsletterPlaceholder", label: "Newsletter Placeholder", type: "text", placeholder: "Enter your email" },
  ],
  announcement: [
    { key: "text", label: "Announcement Text", type: "text", placeholder: "Free shipping on orders over $50!" },
    { key: "link", label: "Link URL", type: "text", placeholder: "/shop" },
    { key: "linkText", label: "Link Text", type: "text", placeholder: "Shop Now" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "textColor", label: "Text Color", type: "color" },
    { key: "showClose", label: "Show Close Button", type: "toggle" },
    { key: "showEmoji", label: "Show Emoji", type: "toggle" },
  ],
  "image-banner": [
    { key: "imageUrl", label: "Banner Image URL", type: "image", placeholder: "https://..." },
    { key: "mobileImageUrl", label: "Mobile Image URL", type: "image", placeholder: "https://..." },
    { key: "headline", label: "Headline", type: "text", placeholder: "New Collection" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Discover our latest" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Explore" },
    { key: "buttonLink", label: "Button Link", type: "text", placeholder: "/shop" },
    { key: "overlayOpacity", label: "Overlay Opacity", type: "number" },
    { key: "textAlignment", label: "Text Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
    { key: "parallax", label: "Parallax Effect", type: "toggle" },
  ],
  "flash-sale": [
    { key: "title", label: "Title", type: "text", placeholder: "Flash Sale" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Limited time offers" },
    { key: "endDate", label: "End Date (ISO)", type: "text", placeholder: "2026-12-31T23:59:59Z" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "textColor", label: "Text Color", type: "color" },
    { key: "accentColor", label: "Accent Color", type: "color" },
    { key: "showProgress", label: "Show Progress Bar", type: "toggle" },
    { key: "progressPercent", label: "Progress Percentage", type: "number" },
  ],
  countdown: [
    { key: "title", label: "Title", type: "text", placeholder: "Big Sale Coming" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Get ready" },
    { key: "targetDate", label: "Target Date (ISO)", type: "text", placeholder: "2026-12-31T23:59:59Z" },
    { key: "message", label: "Message", type: "text", placeholder: "Sale ends in:" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Notify Me" },
    { key: "buttonLink", label: "Button Link", type: "text", placeholder: "#" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "textColor", label: "Text Color", type: "color" },
    { key: "accentColor", label: "Accent Color", type: "color" },
    { key: "showDays", label: "Show Days", type: "toggle" },
    { key: "showHours", label: "Show Hours", type: "toggle" },
    { key: "showMinutes", label: "Show Minutes", type: "toggle" },
    { key: "showSeconds", label: "Show Seconds", type: "toggle" },
  ],
  "multi-banner": [
    { key: "columns", label: "Columns", type: "select", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }] },
    { key: "gap", label: "Gap", type: "select", options: [{ value: "2", label: "Small" }, { value: "4", label: "Medium" }, { value: "6", label: "Large" }, { value: "8", label: "X-Large" }] },
    { key: "borderRadius", label: "Border Radius", type: "select", options: [{ value: "8", label: "Small" }, { value: "12", label: "Medium" }, { value: "16", label: "Large" }, { value: "24", label: "X-Large" }] },
    { key: "aspectRatio", label: "Aspect Ratio", type: "select", options: [{ value: "3/2", label: "3:2" }, { value: "1/1", label: "1:1" }, { value: "4/3", label: "4:3" }, { value: "16/9", label: "16:9" }, { value: "2/1", label: "2:1" }] },
  ],
  collection: [
    { key: "title", label: "Title", type: "text", placeholder: "Collection Spotlight" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Curated just for you" },
    { key: "imageUrl", label: "Banner Image URL", type: "image" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "View Collection" },
    { key: "buttonLink", label: "Button Link", type: "text", placeholder: "/shop" },
    { key: "layout", label: "Layout", type: "select", options: [{ value: "left", label: "Image Left" }, { value: "right", label: "Image Right" }, { value: "top", label: "Image Top" }, { value: "bottom", label: "Image Bottom" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "maxProducts", label: "Max Products", type: "number" },
  ],
  video: [
    { key: "videoUrl", label: "Video URL", type: "text", placeholder: "https://youtube.com/watch?v=..." },
    { key: "posterUrl", label: "Poster Image URL", type: "image" },
    { key: "title", label: "Title", type: "text", placeholder: "Featured Video" },
    { key: "caption", label: "Caption", type: "text", placeholder: "Learn more" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Learn More" },
    { key: "buttonLink", label: "Button Link", type: "text", placeholder: "#" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "autoplay", label: "Autoplay", type: "toggle" },
    { key: "controls", label: "Show Controls", type: "toggle" },
    { key: "loop", label: "Loop", type: "toggle" },
    { key: "muted", label: "Muted", type: "toggle" },
  ],
  faq: [
    { key: "title", label: "Title", type: "text", placeholder: "FAQ" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Everything you need" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "items", label: "FAQ Items (JSON)", type: "textarea", placeholder: '[{"q":"Question?","a":"Answer."}]' },
    { key: "layout", label: "Layout", type: "select", options: [{ value: "simple", label: "Simple" }, { value: "bordered", label: "Bordered" }, { value: "split", label: "Split Layout" }] },
  ],
  "feature-cards": [
    { key: "title", label: "Title", type: "text", placeholder: "Why Choose Us" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "We deliver quality" },
    { key: "columns", label: "Columns", type: "select", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "cardStyle", label: "Card Style", type: "select", options: [{ value: "default", label: "Default" }, { value: "minimal", label: "Minimal" }, { value: "bordered", label: "Bordered" }, { value: "elevated", label: "Elevated" }] },
    { key: "iconStyle", label: "Icon Style", type: "select", options: [{ value: "fill", label: "Filled" }, { value: "outline", label: "Outline" }, { value: "ghost", label: "Ghost" }] },
  ],
  stats: [
    { key: "title", label: "Title", type: "text", placeholder: "Our Numbers" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Trusted by thousands" },
    { key: "stat1label", label: "Stat 1 Label", type: "text", placeholder: "Products" },
    { key: "stat1value", label: "Stat 1 Value", type: "text", placeholder: "10K+" },
    { key: "stat2label", label: "Stat 2 Label", type: "text", placeholder: "Customers" },
    { key: "stat2value", label: "Stat 2 Value", type: "text", placeholder: "50K+" },
    { key: "stat3label", label: "Stat 3 Label", type: "text", placeholder: "Reviews" },
    { key: "stat3value", label: "Stat 3 Value", type: "text", placeholder: "25K+" },
    { key: "stat4label", label: "Stat 4 Label", type: "text", placeholder: "Countries" },
    { key: "stat4value", label: "Stat 4 Value", type: "text", placeholder: "30+" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "textColor", label: "Text Color", type: "color" },
    { key: "accentColor", label: "Accent Color", type: "color" },
    { key: "columns", label: "Columns", type: "select", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
    { key: "suffix", label: "Value Suffix", type: "text", placeholder: "+" },
  ],
  "brand-logos": [
    { key: "title", label: "Title", type: "text", placeholder: "Trusted By" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Brands that love us" },
    { key: "layout", label: "Layout", type: "select", options: [{ value: "carousel", label: "Carousel" }, { value: "grid", label: "Grid" }, { value: "marquee", label: "Marquee" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "grayscale", label: "Grayscale", type: "toggle" },
    { key: "opacity", label: "Logo Opacity", type: "select", options: [{ value: "100", label: "100%" }, { value: "60", label: "60%" }, { value: "40", label: "40%" }, { value: "20", label: "20%" }] },
  ],
  pricing: [
    { key: "title", label: "Title", type: "text", placeholder: "Pricing Plans" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Choose your plan" },
    { key: "columns", label: "Columns", type: "select", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "showAnnual", label: "Show Annual Toggle", type: "toggle" },
  ],
  team: [
    { key: "title", label: "Title", type: "text", placeholder: "Meet Our Team" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "People behind the brand" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "columns", label: "Columns", type: "select", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
  ],
  contact: [
    { key: "title", label: "Title", type: "text", placeholder: "Get in Touch" },
    { key: "subtitle", label: "Subtitle", type: "text", placeholder: "We'd love to hear from you" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "showMap", label: "Show Map", type: "toggle" },
    { key: "mapUrl", label: "Map Embed URL", type: "text" },
    { key: "email", label: "Contact Email", type: "text", placeholder: "hello@store.com" },
    { key: "phone", label: "Contact Phone", type: "text", placeholder: "+1 234 567 890" },
    { key: "address", label: "Address", type: "text", placeholder: "123 Main St" },
  ],
  "trust-badges": [
    { key: "title", label: "Title", type: "text", placeholder: "Trusted & Secure" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "showSSL", label: "SSL Secure Badge", type: "toggle" },
    { key: "showPayment", label: "Payment Badges", type: "toggle" },
    { key: "showGuarantee", label: "Money Back Guarantee", type: "toggle" },
    { key: "showShipping", label: "Free Shipping Badge", type: "toggle" },
    { key: "size", label: "Badge Size", type: "select", options: [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }] },
  ],
  popup: [
    { key: "title", label: "Popup Title", type: "text", placeholder: "Get 10% Off!" },
    { key: "subtitle", label: "Popup Text", type: "textarea", placeholder: "Subscribe and save" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Claim Offer" },
    { key: "imageUrl", label: "Popup Image URL", type: "image" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "textColor", label: "Text Color", type: "color" },
    { key: "showOnExit", label: "Show on Exit Intent", type: "toggle" },
    { key: "showOnScroll", label: "Show on Scroll %", type: "number" },
    { key: "delay", label: "Delay (seconds)", type: "number" },
    { key: "frequency", label: "Frequency", type: "select", options: [{ value: "once", label: "Once" }, { value: "session", label: "Per Session" }, { value: "always", label: "Every Visit" }] },
    { key: "couponCode", label: "Coupon Code", type: "text", placeholder: "WELCOME10" },
  ],
  "sticky-cta": [
    { key: "text", label: "Button Text", type: "text", placeholder: "Shop Now" },
    { key: "link", label: "Button Link", type: "text", placeholder: "/shop" },
    { key: "backgroundColor", label: "Background Color", type: "color" },
    { key: "textColor", label: "Text Color", type: "color" },
    { key: "position", label: "Position", type: "select", options: [{ value: "bottom", label: "Bottom" }, { value: "top", label: "Top" }, { value: "left", label: "Left Side" }, { value: "right", label: "Right Side" }] },
    { key: "showOnMobile", label: "Show on Mobile Only", type: "toggle" },
    { key: "icon", label: "Icon URL", type: "image" },
    { key: "discount", label: "Discount Text", type: "text", placeholder: "20% OFF" },
  ],
};

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border border-zinc-200 p-0.5" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="h-7 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
    </div>
  );
}

function ImageUrlInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-7 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        {value && (
          <button onClick={() => setPreview(!preview)}
            className="shrink-0 rounded p-0.5 text-zinc-400 hover:text-zinc-600">
            {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {preview && value && (
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <img src={value} alt="preview" className="h-20 w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      )}
    </div>
  );
}

type CollapsibleSectionProps = {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function CollapsibleSection({ label, icon, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 border-b border-zinc-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 hover:bg-zinc-50">
        {icon}
        {label}
        {open ? <ChevronDown className="ml-auto h-3 w-3" /> : <ChevronRight className="ml-auto h-3 w-3" />}
      </button>
      {open && <div className="divide-y divide-zinc-100">{children}</div>}
    </div>
  );
}

export function PropertiesPanel() {
  const dispatch = useDispatch();
  const selectedId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const section = useSelector((s: RootState) =>
    s.builder.sections.find((sec) => sec.id === selectedId)
  );
  const device = useSelector((s: RootState) => s.preview.device);

  if (!section) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xs text-zinc-400">Select a section to edit</p>
        </div>
      </div>
    );
  }

  const handlePropChange = (key: string, value: string) => {
    dispatch(updateSectionProps({ id: section.id, props: { ...section.props, [key]: value } }));
  };

  const controls = sectionControls[section.type] ?? [];

  const renderControl = (control: PropControl) => {
    const val = (section.props[control.key] as string) ?? "";

    if (control.type === "image") {
      return (
        <div key={control.key} className="px-4 py-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <Image className="h-3 w-3" /> {control.label}
          </label>
          <ImageUrlInput value={val} onChange={(v) => handlePropChange(control.key, v)} placeholder={control.placeholder} />
        </div>
      );
    }

    if (control.type === "color") {
      return (
        <div key={control.key} className="px-4 py-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <Palette className="h-3 w-3" /> {control.label}
          </label>
          <ColorInput value={val} onChange={(v) => handlePropChange(control.key, v)} />
        </div>
      );
    }

    if (control.type === "select") {
      return (
        <div key={control.key} className="px-4 py-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <AlignLeft className="h-3 w-3" /> {control.label}
          </label>
          <select value={val || (control.options?.[0]?.value ?? "")}
            onChange={(e) => handlePropChange(control.key, e.target.value)}
            className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none">
            {control.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }

    if (control.type === "toggle") {
      const isOn = val === "true";
      return (
        <div key={control.key} className="flex items-center justify-between px-4 py-3">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            {control.label}
          </label>
          <button onClick={() => handlePropChange(control.key, isOn ? "false" : "true")}
            className={`relative h-5 w-9 rounded-full transition-colors ${isOn ? "bg-zinc-900" : "bg-zinc-200"}`}>
            <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isOn ? "translate-x-4" : "translate-x-0"}`} />
          </button>
        </div>
      );
    }

    if (control.type === "number") {
      return (
        <div key={control.key} className="px-4 py-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <Type className="h-3 w-3" /> {control.label}
          </label>
          <input type="number" value={val} onChange={(e) => handlePropChange(control.key, e.target.value)}
            placeholder={control.placeholder}
            className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        </div>
      );
    }

    return (
      <div key={control.key} className="px-4 py-3">
        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
          {control.label}
        </label>
        {control.type === "textarea" ? (
          <textarea value={val} onChange={(e) => handlePropChange(control.key, e.target.value)}
            placeholder={control.placeholder} rows={3}
            className="h-auto min-h-[56px] w-full resize-none rounded-lg border border-zinc-200 bg-transparent px-2 py-1.5 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        ) : (
          <input type="text" value={val} onChange={(e) => handlePropChange(control.key, e.target.value)}
            placeholder={control.placeholder}
            className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        )}
      </div>
    );
  };

  const CurrentDeviceIcon = DEVICES.find((d) => d.key === device)?.icon ?? Monitor;

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100">
              <Layers className="h-3 w-3 text-zinc-500" />
            </div>
            <p className="text-xs font-semibold text-zinc-900">{section.label}</p>
          </div>
          <button onClick={() => dispatch(setSelectedSection(null))}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-zinc-100">
        {controls.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-xs text-zinc-400">No editable properties for this section</p>
          </div>
        )}
        {controls.map((control) => renderControl(control))}
      </div>

      <CollapsibleSection label="Animation" icon={<Play className="h-3 w-3" />} defaultOpen={false}>
        {animationControls.map((control) => renderControl(control))}
      </CollapsibleSection>

      <CollapsibleSection label="Responsive" icon={<CurrentDeviceIcon className="h-3 w-3" />} defaultOpen={false}>
        <div className="flex items-center gap-1 border-b border-zinc-100 px-4 py-2">
          {DEVICES.map(({ key, icon: Icon, label }) => (
            <span key={key}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium ${device === key ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"}`}>
              <Icon className="h-3 w-3" /> {label}
            </span>
          ))}
        </div>
        {responsiveControls.map((control) => renderControl(control))}
      </CollapsibleSection>

      <CollapsibleSection label="Style" icon={<Square className="h-3 w-3" />}>
        {styleControls.map((control) => renderControl(control))}
      </CollapsibleSection>

      <CollapsibleSection label="Advanced" icon={<Sparkles className="h-3 w-3" />} defaultOpen={false}>
        {advancedStyleControls.map((control) => renderControl(control))}
      </CollapsibleSection>
    </div>
  );
}
