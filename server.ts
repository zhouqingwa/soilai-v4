import "dotenv/config";
import express from "express";
import type { Request } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { articles } from "./src/lib/articles";
import type { Article } from "./src/lib/articles";
import { getArticleCover, sortArticlesByIntent } from "./src/lib/journalContent";
import rateLimit from "express-rate-limit";
import {
  handleAnalyzePlant,
  handleCapturePayPalOrder,
  handleCreatePayPalOrder,
  handleGenerateCareGuide,
  handleGenerateIllustration,
  handleTrackEvent,
} from "./server/api-handlers.js";
import { toPublicError } from "./server/http.js";

const DEFAULT_SITE_URL = "https://www.soilai.app";
const DEFAULT_OG_IMAGE = "/og-image.svg";

const normalizeBaseUrl = (value?: string | null) => {
  if (!value || value.includes("MY_APP_URL")) return "";
  return value.replace(/\/$/, "");
};

const getBaseUrl = (req: Request) => {
  const configuredUrl = normalizeBaseUrl(process.env.APP_URL);
  if (configuredUrl) return configuredUrl;
  return `${req.protocol}://${req.get("host") || DEFAULT_SITE_URL.replace(/^https?:\/\//, "")}`;
};

const absoluteUrl = (pathOrUrl: string | undefined, baseUrl: string) => {
  if (!pathOrUrl) return `${baseUrl}${DEFAULT_OG_IMAGE}`;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${baseUrl}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const ASSET_REQUEST_PATTERN = /\.(?:js|css|png|jpe?g|webp|avif|svg|ico|xml|txt|json|webmanifest|map|woff2?|ttf|otf)$/i;

const getArticleDate = (article: Article, field: "publishedAt" | "updatedAt" = "publishedAt") => {
  const value = article[field] || article.createdAt;
  if (typeof value === "string") return new Date(value).toISOString();
  return new Date(value.seconds * 1000).toISOString();
};

const upsertTag = (html: string, pattern: RegExp, tag: string) => {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `${tag}\n</head>`);
};

const injectSeoTags = (html: string, tags: Record<string, string>, jsonLd: unknown[]) => {
  let next = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(tags.title)}</title>`);
  next = upsertTag(next, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(tags.description)}" />`);
  next = upsertTag(next, /<meta name="keywords" content="[^"]*" \/>/, `<meta name="keywords" content="${escapeHtml(tags.keywords)}" />`);
  next = upsertTag(next, /<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${escapeHtml(tags.ogType)}" />`);
  next = upsertTag(next, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(tags.title)}" />`);
  next = upsertTag(next, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(tags.description)}" />`);
  next = upsertTag(next, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${escapeHtml(tags.image)}" />`);
  next = upsertTag(next, /<meta property="twitter:card" content="[^"]*" \/>/, `<meta property="twitter:card" content="summary_large_image" />`);
  next = upsertTag(next, /<meta property="twitter:title" content="[^"]*" \/>/, `<meta property="twitter:title" content="${escapeHtml(tags.title)}" />`);
  next = upsertTag(next, /<meta property="twitter:description" content="[^"]*" \/>/, `<meta property="twitter:description" content="${escapeHtml(tags.description)}" />`);
  next = upsertTag(next, /<meta property="twitter:image" content="[^"]*" \/>/, `<meta property="twitter:image" content="${escapeHtml(tags.image)}" />`);
  next = upsertTag(next, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${escapeHtml(tags.url)}" />`);

  const structuredData = jsonLd
    .filter(Boolean)
    .map(data => `<script type="application/ld+json">${JSON.stringify(data)}</script>`)
    .join("\n");
  return next.replace("</head>", `${structuredData}\n</head>`);
};

const buildJournalSeo = (baseUrl: string) => {
  const description = "Browse Soil AI plant care guides by symptom, including yellow leaves, brown spots, drooping plants, pests, and beginner houseplant care.";
  const orderedArticles = sortArticlesByIntent(articles);
  return {
    tags: {
      title: "Plant Care Journal: Symptom Guides and Houseplant Fixes | Soil AI",
      description,
      keywords: "plant care guides, houseplant symptoms, yellow leaves, brown spots, drooping plants, fungus gnats, Soil AI journal",
      image: absoluteUrl(DEFAULT_OG_IMAGE, baseUrl),
      url: `${baseUrl}/journal`,
      ogType: "website"
    },
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Plant Care Journal",
      description,
      url: `${baseUrl}/journal`,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: orderedArticles.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: article.title,
          url: `${baseUrl}/journal/${article.slug || article.id}`
        }))
      }
    }]
  };
};

const buildArticleSeo = (article: Article, baseUrl: string) => {
  const url = `${baseUrl}/journal/${article.slug || article.id}`;
  const image = absoluteUrl(getArticleCover(article), baseUrl);
  const description = article.metaDescription || article.excerpt;
  const keywords = [...(article.keywords || []), ...(article.tags || [])].join(", ");
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description,
    image: [image],
    datePublished: getArticleDate(article, "publishedAt"),
    dateModified: getArticleDate(article, "updatedAt"),
    author: {
      "@type": "Organization",
      name: "Soil AI",
      url: baseUrl
    },
    publisher: {
      "@type": "Organization",
      name: "Soil AI",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/favicon.svg", baseUrl)
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    },
    articleSection: article.category,
    keywords
  };
  const faqSchema = article.faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  } : null;

  return {
    tags: {
      title: article.metaTitle || `${article.title} | Soil AI`,
      description,
      keywords,
      image,
      url,
      ogType: "article"
    },
    jsonLd: [articleSchema, faqSchema]
  };
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Trust proxy is required when running behind a reverse proxy (e.g. Cloud Run, Vercel)
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  // Rate Limiting to prevent abuse of the expensive Gemini API
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too many requests from this IP, please try again after 15 minutes."
  });

  app.use(express.json({ limit: '12mb' }));
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err?.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Invalid JSON body.', code: 'invalid_json' });
      return;
    }
    if (err?.type === 'entity.too.large') {
      res.status(413).json({ error: 'Request body is too large.', code: 'payload_too_large' });
      return;
    }
    next(err);
  });
  app.use("/api/", apiLimiter);

  app.post("/api/analyze-plant", async (req, res) => {
    try {
      const result = await handleAnalyzePlant(req.body, { headers: req.headers, ip: req.ip });
      res.json(result);
    } catch (e) {
      console.error('analyze-plant failed:', e);
      const publicError = toPublicError(e);
      res.status(publicError.statusCode).json(publicError.body);
    }
  });

  app.post("/api/generate-illustration", async (req, res) => {
    try {
      const result = await handleGenerateIllustration(req.body, { headers: req.headers, ip: req.ip });
      res.json(result);
    } catch (e) {
      console.error('generate-illustration failed:', e);
      const publicError = toPublicError(e);
      res.status(publicError.statusCode).json(publicError.body);
    }
  });

  app.post("/api/generate-care-guide", async (req, res) => {
    try {
      const result = await handleGenerateCareGuide(req.body, { headers: req.headers, ip: req.ip });
      res.json(result);
    } catch (e) {
      console.error('generate-care-guide failed:', e);
      const publicError = toPublicError(e);
      res.status(publicError.statusCode).json(publicError.body);
    }
  });

  app.post("/api/track-event", async (req, res) => {
    try {
      const result = await handleTrackEvent(req.body, { headers: req.headers, ip: req.ip });
      res.json(result);
    } catch (e) {
      console.error('track-event failed:', e);
      const publicError = toPublicError(e);
      res.status(publicError.statusCode).json(publicError.body);
    }
  });

  app.post("/api/paypal/create-order", async (req, res) => {
    try {
      const result = await handleCreatePayPalOrder(req.body, { headers: req.headers, ip: req.ip });
      res.json(result);
    } catch (e) {
      console.error('paypal create-order failed:', e);
      const publicError = toPublicError(e);
      res.status(publicError.statusCode).json(publicError.body);
    }
  });

  app.post("/api/paypal/capture-order", async (req, res) => {
    try {
      const result = await handleCapturePayPalOrder(req.body, { headers: req.headers, ip: req.ip });
      res.json(result);
    } catch (e) {
      console.error('paypal capture-order failed:', e);
      const publicError = toPublicError(e);
      res.status(publicError.statusCode).json(publicError.body);
    }
  });

  // Let's create an endpoint to generate sitemap.xml dynamically
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = getBaseUrl(req);
      let articleUrls = "";

      // Add local articles in search-intent order rather than publish-date order.
      sortArticlesByIntent(articles).forEach((article) => {
        let lastmod = new Date().toISOString();
        if (article.updatedAt) {
          lastmod = new Date(article.updatedAt).toISOString();
        } else if (article.createdAt && article.createdAt.seconds) {
          lastmod = new Date(article.createdAt.seconds * 1000).toISOString();
        }
        articleUrls += `\n  <url>\n    <loc>${baseUrl}/journal/${article.slug || article.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>`;
      });

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/journal</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>${articleUrls}
</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch(err) {
      res.status(500).end();
    }
  });

  app.get("/robots.txt", (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml`);
  });

  // Inject meta tags for SEO when a crawler visits /journal/:slug
  // We can do this by intercepting requests to /journal/* in production

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, we need to handle SSR of index.html for bots
    const distPath = path.join(process.cwd(), 'dist');
    const fs = await import("fs/promises");

    // Serve static files (except index.html)
    app.use(express.static(distPath, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          return;
        }

        if (/\.(?:png|jpe?g|webp|avif|svg|ico|woff2?|ttf|otf)$/i.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }));

    // Fallback all routes to index.html
    const indexHtmlPath = path.join(distPath, 'index.html');

    // Express 5 routing handles wildcard with * or just catch-all.
    app.get('*', async (req, res) => {
      try {
        if (ASSET_REQUEST_PATTERN.test(req.path)) {
          res.status(404).send("Not Found");
          return;
        }

        if (req.path === '/journal' || req.path === '/journal/' || req.path.startsWith('/journal/')) {
          const journalPath = req.path.replace(/^\/+|\/+$/g, '') || 'journal';
          if (/^journal(?:\/[A-Za-z0-9_-]+)?$/.test(journalPath)) {
            const prerenderedPath = path.join(distPath, journalPath, 'index.html');
            try {
              const prerenderedHtml = await fs.readFile(prerenderedPath, 'utf8');
              res.send(prerenderedHtml);
              return;
            } catch {
              // Fall through to runtime SEO injection when no prerendered page exists.
            }
          }
        }

        let html = await fs.readFile(indexHtmlPath, 'utf8');

        const baseUrl = getBaseUrl(req);
        if (req.path === '/journal' || req.path === '/journal/') {
          const seo = buildJournalSeo(baseUrl);
          html = injectSeoTags(html, seo.tags, seo.jsonLd);
        } else if (req.path.startsWith('/journal/') && req.path.length > 9) {
          const slug = req.path.substring(9).replace(/\/$/, '');
          const article = articles.find(a => a.slug === slug || a.id === slug);
          if (article) {
            const seo = buildArticleSeo(article, baseUrl);
            html = injectSeoTags(html, seo.tags, seo.jsonLd);
          }
        }

        res.send(html);
      } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
