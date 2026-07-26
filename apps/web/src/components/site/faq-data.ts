export type FaqCategory =
  | "General"
  | "Billing"
  | "Account"
  | "Security"
  | "API"
  | "Technical"
  | "Support";

export type FaqItem = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  "General",
  "Billing",
  "Account",
  "Security",
  "API",
  "Technical",
  "Support",
];

export const FAQ_ITEMS: FaqItem[] = [
  // General
  {
    id: "gen-1",
    category: "General",
    question: "What is BornoLand?",
    answer:
      "BornoLand is an ecommerce SaaS platform built for merchants in Bangladesh and beyond. You can launch a professional online store, manage products and inventory, accept local and international payments, and grow with analytics — all from one dashboard.",
  },
  {
    id: "gen-2",
    category: "General",
    question: "Who is BornoLand designed for?",
    answer:
      "BornoLand serves solo sellers, growing D2C brands, agencies managing client stores, and teams that need a reliable multi-store workspace. Whether you sell fashion, electronics, groceries, or digital goods, the platform scales with your catalog and order volume.",
  },
  {
    id: "gen-3",
    category: "General",
    question: "Do I need coding skills to launch a store?",
    answer:
      "No. Most merchants launch with the visual builder, ready-made templates, and drag-and-drop sections. Developers can go further with the API, webhooks, and SDK when custom integrations are required.",
  },
  {
    id: "gen-4",
    category: "General",
    question: "Can I use a custom domain?",
    answer:
      "Yes. Connect any custom domain from your registrar. Free SSL is included for both custom domains and BornoLand subdomains (for example, yourstore.bornoland.com).",
  },
  {
    id: "gen-5",
    category: "General",
    question: "Is BornoLand available outside Bangladesh?",
    answer:
      "Yes. BornoLand is built with Bangladesh-first payment and logistics workflows, but merchants and customers can operate internationally. Currency, shipping zones, and tax settings are configurable per store.",
  },
  {
    id: "gen-6",
    category: "General",
    question: "How long does it take to go live?",
    answer:
      "Many stores publish a first version the same day — create an account, pick a template, add products, connect payments, and publish. More complex catalogs or custom themes typically take a few days of setup.",
  },
  {
    id: "gen-7",
    category: "General",
    question: "Can I run more than one store?",
    answer:
      "Yes. Plans that include multi-store allow you to manage several storefronts from one BornoLand account, with separate domains, catalogs, and team permissions per store.",
  },
  {
    id: "gen-8",
    category: "General",
    question: "Does BornoLand support Bangla and English?",
    answer:
      "Yes. The merchant dashboard and storefront templates support English and Bangla. You can localize product content, checkout labels, and customer emails for your audience.",
  },

  // Billing
  {
    id: "bill-1",
    category: "Billing",
    question: "What payment methods can I use to pay for BornoLand?",
    answer:
      "You can pay your BornoLand subscription with major cards and supported local payment options. Invoice details and payment history are available under Billing in your workspace settings.",
  },
  {
    id: "bill-2",
    category: "Billing",
    question: "Are there transaction fees on customer orders?",
    answer:
      "BornoLand subscription plans do not add a platform cut on every order. Payment gateways (bKash, Nagad, SSLCommerz, Stripe, etc.) may charge their own processing fees according to their agreements with you.",
  },
  {
    id: "bill-3",
    category: "Billing",
    question: "Can I change plans at any time?",
    answer:
      "Yes. Upgrade or downgrade from Billing whenever your needs change. Upgrades take effect immediately; downgrades apply at the next billing cycle so you keep paid features through the period you already paid for.",
  },
  {
    id: "bill-4",
    category: "Billing",
    question: "Do you offer annual billing?",
    answer:
      "Yes. Annual plans are available at a discounted rate compared with monthly billing. You can switch to annual from the plan comparison screen in your workspace.",
  },
  {
    id: "bill-5",
    category: "Billing",
    question: "What happens if my subscription expires?",
    answer:
      "Your storefront may switch to a limited or unpublished state depending on plan rules. Products and orders remain in your account so you can renew and restore full access without rebuilding from scratch.",
  },
  {
    id: "bill-6",
    category: "Billing",
    question: "Can I get an invoice for accounting?",
    answer:
      "Yes. Download PDF invoices from Billing → Invoices. Company name, TIN/VAT, and billing address can be set in your workspace so each invoice reflects the correct legal details.",
  },
  {
    id: "bill-7",
    category: "Billing",
    question: "Is there a free trial?",
    answer:
      "New workspaces can start on a trial period with access to core store features. Trial length and included limits are shown during signup; no commitment is required to explore the builder and sample catalog.",
  },
  {
    id: "bill-8",
    category: "Billing",
    question: "How do refunds work for subscriptions?",
    answer:
      "Subscription refund eligibility depends on plan terms and timing. Contact support with your workspace ID and invoice number; approved refunds are returned to the original payment method.",
  },

  // Account
  {
    id: "acc-1",
    category: "Account",
    question: "How do I create a BornoLand account?",
    answer:
      "Visit the register page, enter your email and password, verify your email, then create your first store. You can invite teammates after the workspace is set up.",
  },
  {
    id: "acc-2",
    category: "Account",
    question: "Can I invite team members with different roles?",
    answer:
      "Yes. Invite staff with roles such as Owner, Admin, Manager, and Staff. Permissions control access to orders, products, themes, billing, and API keys so only the right people can make sensitive changes.",
  },
  {
    id: "acc-3",
    category: "Account",
    question: "How do I reset my password?",
    answer:
      "Use Forgot password on the login page. We email a time-limited reset link to your verified address. After resetting, sign in with the new password on all devices.",
  },
  {
    id: "acc-4",
    category: "Account",
    question: "Can I transfer store ownership?",
    answer:
      "Yes. An Owner can transfer ownership to another verified member of the same workspace. Billing responsibility moves with ownership; confirm the transfer carefully before completing it.",
  },
  {
    id: "acc-5",
    category: "Account",
    question: "How do I delete my account or a store?",
    answer:
      "Store deletion is available under Store settings for Owners. Full account deletion removes workspace access after confirmation. Export orders and products first if you need records for taxes or customer support.",
  },
  {
    id: "acc-6",
    category: "Account",
    question: "Why do I need to verify my email?",
    answer:
      "Email verification protects your store from unauthorized signups, enables password resets, and ensures order and security alerts reach a real inbox you control.",
  },
  {
    id: "acc-7",
    category: "Account",
    question: "Can one email manage multiple workspaces?",
    answer:
      "Yes. After signing in you can switch between workspaces you own or have been invited to. Each workspace keeps its own stores, billing, and team separately.",
  },

  // Security
  {
    id: "sec-1",
    category: "Security",
    question: "How does BornoLand protect customer data?",
    answer:
      "We use encrypted connections (TLS), access-controlled infrastructure, and least-privilege roles for merchant teams. Sensitive payment details are handled by certified payment providers — BornoLand does not store full card numbers.",
  },
  {
    id: "sec-2",
    category: "Security",
    question: "Is SSL included?",
    answer:
      "Yes. Free SSL certificates are provisioned for BornoLand subdomains and connected custom domains so checkout and customer accounts stay encrypted by default.",
  },
  {
    id: "sec-3",
    category: "Security",
    question: "Do you support two-factor authentication (2FA)?",
    answer:
      "Yes. Enable 2FA from Account security. We recommend turning it on for every Owner and Admin account, especially when API keys or billing access is available.",
  },
  {
    id: "sec-4",
    category: "Security",
    question: "Where should I store API keys?",
    answer:
      "Never commit API keys to public repositories or embed secret keys in storefront JavaScript. Use environment variables on your server, rotate keys regularly, and revoke any key you suspect was exposed.",
  },
  {
    id: "sec-5",
    category: "Security",
    question: "How do I revoke a compromised session or key?",
    answer:
      "From Account security you can sign out other sessions. From Developer settings you can revoke API keys instantly. After revocation, generate a new key and update your integrations.",
  },
  {
    id: "sec-6",
    category: "Security",
    question: "Are webhooks signed?",
    answer:
      "Yes. Webhook payloads include a signature header so your endpoint can verify the request came from BornoLand. Always validate signatures before processing order or inventory events.",
  },
  {
    id: "sec-7",
    category: "Security",
    question: "What should I do if I spot suspicious activity?",
    answer:
      "Change your password, enable 2FA, revoke API keys, and contact support@bornoland.com with timestamps and affected store IDs. We can help review access logs and secure the workspace.",
  },

  // API
  {
    id: "api-1",
    category: "API",
    question: "Does BornoLand provide a public API?",
    answer:
      "Yes. The REST API covers products, variants, inventory, orders, customers, and store settings. Authenticate with an API key scoped to your store, and follow rate limits published in the docs.",
  },
  {
    id: "api-2",
    category: "API",
    question: "How do I create an API key?",
    answer:
      "Open Developer → API keys in your store dashboard, create a key with the required scopes, and copy it once. Keys with write access should only be used from trusted backend services.",
  },
  {
    id: "api-3",
    category: "API",
    question: "What is the API base URL?",
    answer:
      "Production requests use https://api.bornoland.com/v1. Include your store identifier and Authorization bearer token as described in the Authentication section of the documentation.",
  },
  {
    id: "api-4",
    category: "API",
    question: "Are there rate limits?",
    answer:
      "Yes. Default limits protect platform stability. If you need higher throughput for sync jobs or marketplace imports, contact support with your use case and expected volume.",
  },
  {
    id: "api-5",
    category: "API",
    question: "Can I receive webhooks for new orders?",
    answer:
      "Yes. Subscribe to events such as order.created, order.paid, and inventory.updated. Configure your HTTPS endpoint and secret in Developer → Webhooks.",
  },
  {
    id: "api-6",
    category: "API",
    question: "Is there an official SDK?",
    answer:
      "Official SDKs and client helpers are documented under Docs → SDK. They wrap common product, order, and auth flows so you spend less time on boilerplate HTTP calls.",
  },
  {
    id: "api-7",
    category: "API",
    question: "Can agencies build apps for multiple merchants?",
    answer:
      "Yes. Use per-store API keys or partner integrations as outlined in the docs. Never reuse one merchant’s secret across another store — isolate credentials per tenant.",
  },
  {
    id: "api-8",
    category: "API",
    question: "How do I test integrations safely?",
    answer:
      "Use a staging store or sandbox credentials where available, create test products and orders, and verify webhook signatures before pointing production systems at live keys.",
  },

  // Technical
  {
    id: "tech-1",
    category: "Technical",
    question: "Which browsers are supported?",
    answer:
      "The dashboard and storefront support current versions of Chrome, Edge, Firefox, and Safari on desktop and mobile. Keep browsers updated for the best performance and security.",
  },
  {
    id: "tech-2",
    category: "Technical",
    question: "Can I migrate products from another platform?",
    answer:
      "Yes. Import via CSV for catalogs, or use the API for automated migrations. Map fields carefully (SKU, price, stock, images) and validate a sample batch before a full import.",
  },
  {
    id: "tech-3",
    category: "Technical",
    question: "How does inventory sync work?",
    answer:
      "Stock levels update when orders are placed, fulfilled, or manually adjusted. With API or webhook integrations, external warehouses and POS systems can stay in sync with BornoLand inventory.",
  },
  {
    id: "tech-4",
    category: "Technical",
    question: "Which payment gateways can I connect?",
    answer:
      "BornoLand supports popular Bangladesh gateways such as bKash, Nagad, and SSLCommerz, plus international options like Stripe where available. Enable gateways under Store → Payments.",
  },
  {
    id: "tech-5",
    category: "Technical",
    question: "Can I customize the checkout?",
    answer:
      "Yes. Configure required fields, shipping methods, COD options, and payment visibility. Theme-level styling keeps checkout aligned with your brand while preserving a reliable purchase flow.",
  },
  {
    id: "tech-6",
    category: "Technical",
    question: "Do you support cash on delivery (COD)?",
    answer:
      "Yes. Enable COD as a payment method, set rules by city or order value if needed, and track COD orders separately in the orders panel for courier handoff.",
  },
  {
    id: "tech-7",
    category: "Technical",
    question: "How are images and media stored?",
    answer:
      "Product and theme assets are uploaded to optimized media storage with CDN delivery. Use recommended image sizes from the docs for faster storefront loads on mobile networks.",
  },
  {
    id: "tech-8",
    category: "Technical",
    question: "Can I embed custom scripts or pixels?",
    answer:
      "On eligible plans you can add approved tracking scripts (for example Meta Pixel or Google Analytics) from Store settings. Avoid injecting untrusted scripts that could affect checkout security.",
  },
  {
    id: "tech-9",
    category: "Technical",
    question: "What if my storefront is slow?",
    answer:
      "Compress large images, limit unused theme sections, and review third-party scripts. Our CDN and caching help, but heavy media or excessive apps are common causes of slow mobile loads.",
  },

  // Support
  {
    id: "sup-1",
    category: "Support",
    question: "How do I contact BornoLand support?",
    answer:
      "Email support@bornoland.com or open a ticket from Help in the dashboard. Include your store subdomain, a short summary, and screenshots so we can resolve issues faster.",
  },
  {
    id: "sup-2",
    category: "Support",
    question: "What are support hours?",
    answer:
      "Core support operates during Bangladesh business hours with extended coverage for critical outages on paid plans. Response targets are listed on your plan’s support tier.",
  },
  {
    id: "sup-3",
    category: "Support",
    question: "Where can I find guides and tutorials?",
    answer:
      "Start with /docs for technical reference and /blog for practical guides on payments, inventory, and growth. The in-app Help center links to the most relevant articles for each screen.",
  },
  {
    id: "sup-4",
    category: "Support",
    question: "Do you offer onboarding help for new stores?",
    answer:
      "Yes. Higher-tier plans include onboarding sessions covering domain setup, payments, and first publish. Self-serve checklists are available to all new workspaces.",
  },
  {
    id: "sup-5",
    category: "Support",
    question: "Can agencies get partner support?",
    answer:
      "Agencies managing multiple client stores can apply for partner status for prioritized guidance, multi-store best practices, and roadmap input. Ask support for the partner intake form.",
  },
  {
    id: "sup-6",
    category: "Support",
    question: "How do I report a bug?",
    answer:
      "Send steps to reproduce, browser/device info, expected vs actual behavior, and any error IDs from the dashboard. Bug reports with clear reproduction paths are prioritized.",
  },
  {
    id: "sup-7",
    category: "Support",
    question: "Is there a status page for incidents?",
    answer:
      "Platform status and maintenance notices are shared via status updates and in-dashboard banners when relevant. Subscribe to status alerts if your operations depend on continuous uptime.",
  },
];
