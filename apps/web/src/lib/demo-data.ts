import type { ProductData, CategoryData } from "@/providers/tenant-provider";

export type DemoTestimonial = {
  _id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
};

export type DemoBlog = {
  _id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  author: string;
  slug: string;
};

export type DemoCollection = {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  slug: string;
  productCount: number;
};

export const DEMO_PRODUCTS: ProductData[] = [
  {
    _id: "demo-prod-1", storeId: "", name: "Classic Leather Backpack", slug: "classic-leather-backpack",
    description: "Premium full-grain leather backpack with padded laptop compartment and brass hardware.",
    price: 129.99, comparePrice: 179.99,
    category: "Bags", stock: 45, status: "active",
    sku: "DEMO-001", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", galleryImageUrls: [], images: [], featured: true,
    categoryIds: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    _id: "demo-prod-2", storeId: "", name: "Wireless Noise-Cancelling Headphones", slug: "wireless-headphones",
    description: "Premium over-ear headphones with active noise cancellation, 30-hour battery life.",
    price: 249.99, comparePrice: 349.99,
    category: "Electronics", stock: 120, status: "active",
    sku: "DEMO-002", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", galleryImageUrls: [], images: [], featured: true,
    categoryIds: [], createdAt: "2025-01-02T00:00:00Z", updatedAt: "2025-01-02T00:00:00Z",
  },
  {
    _id: "demo-prod-3", storeId: "", name: "Minimalist Ceramic Watch", slug: "ceramic-watch",
    description: "Elegant minimalist watch with ceramic case, sapphire crystal, and Italian leather strap.",
    price: 189.99, comparePrice: 259.99,
    category: "Accessories", stock: 78, status: "active",
    sku: "DEMO-003", imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80", galleryImageUrls: [], images: [], featured: true,
    categoryIds: [], createdAt: "2025-01-03T00:00:00Z", updatedAt: "2025-01-03T00:00:00Z",
  },
  {
    _id: "demo-prod-4", storeId: "", name: "Organic Cotton Hoodie", slug: "organic-cotton-hoodie",
    description: "Sustainably sourced organic cotton hoodie with a relaxed fit and brushed fleece interior.",
    price: 79.99, comparePrice: undefined,
    category: "Clothing", stock: 200, status: "active",
    sku: "DEMO-004", imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80", galleryImageUrls: [], images: [], featured: false,
    categoryIds: [], createdAt: "2025-01-04T00:00:00Z", updatedAt: "2025-01-04T00:00:00Z",
  },
  {
    _id: "demo-prod-5", storeId: "", name: "Smart Fitness Tracker", slug: "smart-fitness-tracker",
    description: "Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and 7-day battery.",
    price: 99.99, comparePrice: 139.99,
    category: "Electronics", stock: 65, status: "active",
    sku: "DEMO-005", imageUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80", galleryImageUrls: [], images: [], featured: true,
    categoryIds: [], createdAt: "2025-01-05T00:00:00Z", updatedAt: "2025-01-05T00:00:00Z",
  },
  {
    _id: "demo-prod-6", storeId: "", name: "Handcrafted Leather Journal", slug: "leather-journal",
    description: "A5 dotted journal bound in genuine leather with 240 pages of 100gsm acid-free paper.",
    price: 34.99, comparePrice: undefined,
    category: "Stationery", stock: 150, status: "active",
    sku: "DEMO-006", imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80", galleryImageUrls: [], images: [], featured: false,
    categoryIds: [], createdAt: "2025-01-06T00:00:00Z", updatedAt: "2025-01-06T00:00:00Z",
  },
];

export const DEMO_CATEGORIES: CategoryData[] = [
  { _id: "demo-cat-1", storeId: "", name: "Electronics", slug: "electronics", imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80", description: "Latest gadgets and devices", parentId: null, active: true, featured: true, sortOrder: 1 },
  { _id: "demo-cat-2", storeId: "", name: "Clothing", slug: "clothing", imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80", description: "Trendy fashion and apparel", parentId: null, active: true, featured: true, sortOrder: 2 },
  { _id: "demo-cat-3", storeId: "", name: "Accessories", slug: "accessories", imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80", description: "Complete your look", parentId: null, active: true, featured: true, sortOrder: 3 },
  { _id: "demo-cat-4", storeId: "", name: "Home & Living", slug: "home-living", imageUrl: "https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?w=600&q=80", description: "Beautiful home essentials", parentId: null, active: true, featured: false, sortOrder: 4 },
  { _id: "demo-cat-5", storeId: "", name: "Sports & Outdoors", slug: "sports-outdoors", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80", description: "Gear for an active lifestyle", parentId: null, active: true, featured: false, sortOrder: 5 },
  { _id: "demo-cat-6", storeId: "", name: "Books & Media", slug: "books-media", imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80", description: "Curated reading and media", parentId: null, active: true, featured: false, sortOrder: 6 },
];

export const DEMO_TESTIMONIALS: DemoTestimonial[] = [
  { _id: "demo-test-1", name: "Sarah Johnson", role: "Verified Buyer", text: "Absolutely love my purchase! The quality exceeded my expectations and shipping was incredibly fast. Will definitely be ordering again.", rating: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { _id: "demo-test-2", name: "Michael Chen", role: "Verified Buyer", text: "Best online shopping experience I've had. The customer service team went above and beyond to help me choose the right product.", rating: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
  { _id: "demo-test-3", name: "Emily Rodriguez", role: "Verified Buyer", text: "The product arrived beautifully packaged and looks even better than the photos. Highly recommend this store!", rating: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" },
  { _id: "demo-test-4", name: "David Kim", role: "Verified Buyer", text: "Great value for money. I compared prices across multiple sites and this was the best deal by far. Quality is top-notch.", rating: 4, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
  { _id: "demo-test-5", name: "Lisa Thompson", role: "Verified Buyer", text: "I was hesitant to order online but the easy return policy gave me confidence. The product fits perfectly and I couldn't be happier.", rating: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa" },
  { _id: "demo-test-6", name: "James Wilson", role: "Verified Buyer", text: "Second time ordering from here and they never disappoint. Consistent quality, fast delivery, and excellent communication throughout.", rating: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James" },
];

export const DEMO_BLOGS: DemoBlog[] = [
  { _id: "demo-blog-1", title: "10 Essential Style Tips for This Season", excerpt: "Discover the latest fashion trends and learn how to elevate your wardrobe with these expert style tips that work for any occasion.", imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80", date: "2025-06-15", author: "Style Editor", slug: "essential-style-tips" },
  { _id: "demo-blog-2", title: "The Ultimate Guide to Sustainable Shopping", excerpt: "Learn how to make eco-conscious purchasing decisions without compromising on style or quality. Your guide to sustainable fashion.", imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb082b14?w=800&q=80", date: "2025-06-10", author: "Eco Team", slug: "sustainable-shopping-guide" },
  { _id: "demo-blog-3", title: "How to Choose the Perfect Gift for Any Occasion", excerpt: "Struggling with gift ideas? Our comprehensive guide will help you find thoughtful presents that everyone will love.", imageUrl: "https://images.unsplash.com/photo-1513207565459-5e5e3c3b1a8b?w=800&q=80", date: "2025-06-05", author: "Gift Expert", slug: "perfect-gift-guide" },
];

export const DEMO_COLLECTIONS: DemoCollection[] = [
  { _id: "demo-col-1", name: "Summer Essentials", description: "Everything you need for the perfect summer", imageUrl: "https://images.unsplash.com/photo-1473496169904-658ba7c44d3a?w=800&q=80", slug: "summer-essentials", productCount: 24 },
  { _id: "demo-col-2", name: "New Arrivals", description: "Fresh drops just landed", imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80", slug: "new-arrivals", productCount: 18 },
  { _id: "demo-col-3", name: "Best Sellers", description: "Our most popular products", imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80", slug: "best-sellers", productCount: 36 },
  { _id: "demo-col-4", name: "Clearance Sale", description: "Up to 70% off selected items", imageUrl: "https://images.unsplash.com/photo-1607083206968-2f0c0e27e68b?w=800&q=80", slug: "clearance-sale", productCount: 12 },
];
