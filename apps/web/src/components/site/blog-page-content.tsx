"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  Clock,
  Flame,
  Search,
  Tag,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { SitePageHero } from "@/components/site/site-page-hero";
import { SiteCtaBanner } from "@/components/site/site-cta-banner";
import { SiteSection } from "@/components/site/site-section";
import {
  BLOG_AUTHORS,
  BLOG_CATEGORIES,
  BLOG_POSTS,
  BLOG_TRENDING_TOPICS,
  formatBlogDate,
  getAuthor,
  type BlogCategory,
  type BlogPost,
} from "@/components/site/blog-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { landingContainer } from "@/components/landing/landing-ui";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

function uniqueTags(posts: BlogPost[]): string[] {
  const set = new Set<string>();
  for (const post of posts) for (const tag of post.tags) set.add(tag);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function PostMeta({ post }: { post: BlogPost }) {
  const author = getAuthor(post.authorId);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <Avatar className="h-5 w-5 border-0">
          <AvatarFallback className="text-[9px]">{author.initials}</AvatarFallback>
        </Avatar>
        {author.name}
      </span>
      <span className="inline-flex items-center gap-1">
        <Calendar className="h-3 w-3" aria-hidden />
        {formatBlogDate(post.date)}
      </span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" aria-hidden />
        {post.readTime}
      </span>
    </div>
  );
}

function ArticleCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.2) }}
      className="h-full"
    >
      <Card className="flex h-full flex-col rounded-apple-xl border-border shadow-sm transition hover:border-primary/30 hover:shadow-md">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="rounded-pill">
              {post.category}
            </Badge>
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-pill">
                {tag}
              </Badge>
            ))}
          </div>
          <CardTitle className="text-lg leading-snug sm:text-xl">
            <Link
              href={`#${post.slug}`}
              className="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {post.title}
            </Link>
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">{post.excerpt}</CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto flex flex-col items-start gap-3 border-t border-border pt-4">
          <PostMeta post={post} />
          <Link
            href={`#${post.slug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Read article
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </CardFooter>
      </Card>
    </motion.article>
  );
}

export function BlogPageContent() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BlogCategory | "All">("All");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const featured = useMemo(
    () => BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0],
    [],
  );

  const popular = useMemo(
    () => BLOG_POSTS.filter((p) => p.popular).slice(0, 5),
    [],
  );

  const allTags = useMemo(() => uniqueTags(BLOG_POSTS), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOG_POSTS.filter((post) => {
      if (post.id === featured.id) return false;
      if (category !== "All" && post.category !== category) return false;
      if (activeTag && !post.tags.includes(activeTag)) return false;
      if (!q) return true;
      const haystack = [
        post.title,
        post.excerpt,
        post.category,
        ...post.tags,
        getAuthor(post.authorId).name,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [query, category, activeTag, featured.id]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function resetFilters() {
    setQuery("");
    setCategory("All");
    setActiveTag(null);
    setPage(1);
  }

  function onSubscribe(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Enter a valid email address to subscribe.");
      return;
    }
    setSubscribed(true);
    setEmail("");
    toast.success("You're subscribed to the BornoLand blog.");
  }

  return (
    <>
      <SitePageHero
        eyebrow="BornoLand Blog"
        title="Insights for Bangladesh ecommerce"
        description="Practical guides on payments, inventory, growth, and product updates — written for merchants and teams building on BornoLand."
        primaryCta={{ label: "Start selling", href: "/register" }}
        secondaryCta={{ label: "Read the docs", href: "/docs", variant: "outline" }}
      >
        <div className="relative mx-auto max-w-xl">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search articles…"
            aria-label="Search blog articles"
            className="border-border bg-card pl-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
          />
        </div>
      </SitePageHero>

      <section className="pb-4 pt-2 sm:pb-6">
        <div className={landingContainer}>
          <motion.article
            id={featured.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden rounded-apple-xl border-border bg-gradient-to-br from-primary/10 via-card to-card shadow-md">
              <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-10 lg:p-10">
                <div>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant="primary" className="rounded-pill">
                      Featured
                    </Badge>
                    <Badge variant="outline" className="rounded-pill">
                      {featured.category}
                    </Badge>
                  </div>
                  <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                    <Link href={`#${featured.slug}`} className="hover:text-primary">
                      {featured.title}
                    </Link>
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {featured.excerpt}
                  </p>
                  <div className="mt-5">
                    <PostMeta post={featured} />
                  </div>
                  <Link
                    href={`#${featured.slug}`}
                    className={cn(
                      "mt-6 inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover",
                    )}
                  >
                    Read featured article
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
                <div className="rounded-apple-lg border border-border bg-muted/40 p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    In this piece
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    {featured.tags.map((tag) => (
                      <li key={tag} className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-primary" aria-hidden />
                        {tag}
                      </li>
                    ))}
                    <li className="flex items-center gap-2">
                      <Bookmark className="h-3.5 w-3.5 text-primary" aria-hidden />
                      {featured.readTime} read · {formatBlogDate(featured.date)}
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.article>
        </div>
      </section>

      <SiteSection
        title="Latest articles"
        description="Filter by category or tag, then browse paginated posts tailored to Bangladesh ecommerce operations."
        align="left"
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              <Button
                type="button"
                size="sm"
                variant={category === "All" ? "default" : "outline"}
                className="rounded-pill"
                onClick={() => {
                  setCategory("All");
                  setPage(1);
                }}
              >
                All
              </Button>
              {BLOG_CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  size="sm"
                  variant={category === cat ? "default" : "outline"}
                  className="rounded-pill"
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setActiveTag((current) => (current === tag ? null : tag));
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-pill border px-3 py-1 text-xs font-medium transition",
                    activeTag === tag
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                  aria-pressed={activeTag === tag}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${category}-${activeTag}-${query}-${currentPage}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {pageItems.length === 0 ? (
                  <Card className="rounded-apple-xl border-border">
                    <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                      <p className="text-sm text-muted-foreground">
                        No articles matched your filters.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-pill"
                        onClick={resetFilters}
                      >
                        Reset filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {pageItems.map((post, index) => (
                      <ArticleCard key={post.id} post={post} index={index} />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {filtered.length > PAGE_SIZE ? (
              <nav
                className="mt-8 flex flex-wrap items-center justify-between gap-3"
                aria-label="Blog pagination"
              >
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} · {filtered.length} articles
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-pill"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-pill"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </nav>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
                {filtered.length} article{filtered.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="rounded-apple-xl border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
                  Popular posts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {popular.map((post, i) => (
                  <div key={post.id}>
                    {i > 0 ? <Separator className="mb-4" /> : null}
                    <Link
                      href={`#${post.slug}`}
                      className="group block space-y-1"
                    >
                      <p className="text-sm font-semibold text-foreground transition group-hover:text-primary">
                        {post.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBlogDate(post.date)} · {post.readTime}
                      </p>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-apple-xl border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Flame className="h-4 w-4 text-primary" aria-hidden />
                  Trending topics
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {BLOG_TRENDING_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      setQuery(topic);
                      setPage(1);
                    }}
                    className="rounded-pill border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    {topic}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-apple-xl border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Newsletter</CardTitle>
                <CardDescription>
                  Monthly ecommerce tips for Bangladesh sellers — no spam.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscribed ? (
                  <Alert variant="success">
                    <AlertTitle>Subscribed</AlertTitle>
                    <AlertDescription>
                      Thanks for joining. Watch your inbox for the next BornoLand digest.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={onSubscribe} className="space-y-3">
                    <label htmlFor="blog-newsletter-email" className="sr-only">
                      Email address
                    </label>
                    <Input
                      id="blog-newsletter-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.com"
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                      required
                    />
                    <Button type="submit" className="w-full rounded-pill font-semibold">
                      Subscribe
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </SiteSection>

      <SiteSection
        eyebrow="Authors"
        title="Meet the writers"
        description="Product, engineering, and merchant success voices behind the BornoLand blog."
        alt
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BLOG_AUTHORS.map((author, index) => (
            <motion.div
              key={author.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <Card className="h-full rounded-apple-xl border-border text-left shadow-sm">
                <CardContent className="flex flex-col gap-4 p-5">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-sm">{author.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{author.name}</p>
                    <p className="text-xs font-medium text-primary">{author.role}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {author.bio}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </SiteSection>

      <SiteCtaBanner
        title="Turn insights into a live store"
        description="Put these playbooks to work — launch on BornoLand with local payments, inventory tools, and a builder built for Bangladesh merchants."
        primaryLabel="Create your store"
        primaryHref="/register"
        secondaryLabel="Explore pricing"
        secondaryHref="/#pricing"
      />
    </>
  );
}
