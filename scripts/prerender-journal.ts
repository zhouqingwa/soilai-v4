import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { articles, type Article } from '../src/lib/articles';
import {
  getArticleCover,
  getArticleCoverAlt,
  sortArticlesByIntent,
} from '../src/lib/journalContent';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const DEFAULT_SITE_URL = 'https://www.soilai.app';
const DEFAULT_OG_IMAGE = '/og-image.svg';

const normalizeSiteUrl = (value?: string) => {
  if (!value || value.includes('MY_APP_URL')) return DEFAULT_SITE_URL;
  return value.replace(/\/$/, '').replace(/^https:\/\/soilai\.app$/i, DEFAULT_SITE_URL);
};

const SITE_URL = normalizeSiteUrl(process.env.APP_URL);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const absoluteUrl = (pathOrUrl?: string) => {
  if (!pathOrUrl) return `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl.replace(/^https:\/\/soilai\.app/i, SITE_URL);
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
};

const getArticlePath = (article: Article) => `/journal/${article.slug || article.id}`;

const getArticleDate = (article: Article, field: 'publishedAt' | 'updatedAt' = 'publishedAt') => {
  const value = article[field] || article.createdAt;
  if (typeof value === 'string') return new Date(value).toISOString();
  return new Date(value.seconds * 1000).toISOString();
};

const inlineMarkdown = (value: string) =>
  escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

const markdownToHtml = (markdown: string) => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let paragraph: string[] = [];
  let inList = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (!inList) return;
    html.push('</ul>');
    inList = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = Math.min(heading[1].length, 3);
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(listItem[1])}</li>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  return html.join('\n');
};

const upsertTag = (html: string, pattern: RegExp, tag: string) => {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `${tag}\n</head>`);
};

const stripGeneratedSeo = (html: string) =>
  html.replace(/\n?\s*<script type="application\/ld\+json" data-prerender="journal">[\s\S]*?<\/script>/g, '')
    .replace(/\n?\s*<style data-prerender="journal">[\s\S]*?<\/style>/g, '')
    .replace(/\n?\s*<link rel="preload" as="image" href="[^"]+" \/>/g, '');

const injectSeoTags = (
  baseHtml: string,
  tags: {
    title: string;
    description: string;
    keywords: string;
    image: string;
    imageAlt?: string;
    url: string;
    ogType: 'website' | 'article';
  },
  jsonLd: unknown[],
  bodyHtml: string,
) => {
  let html = stripGeneratedSeo(baseHtml);
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(tags.title)}</title>`);
  html = upsertTag(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(tags.description)}" />`);
  html = upsertTag(html, /<meta name="keywords" content="[^"]*" \/>/, `<meta name="keywords" content="${escapeHtml(tags.keywords)}" />`);
  html = upsertTag(html, /<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${tags.ogType}" />`);
  html = upsertTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(tags.title)}" />`);
  html = upsertTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(tags.description)}" />`);
  html = upsertTag(html, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${escapeHtml(tags.image)}" />`);
  html = upsertTag(html, /<meta property="og:image:alt" content="[^"]*" \/>/, `<meta property="og:image:alt" content="${escapeHtml(tags.imageAlt || tags.title)}" />`);
  html = upsertTag(html, /<meta property="twitter:card" content="[^"]*" \/>/, '<meta property="twitter:card" content="summary_large_image" />');
  html = upsertTag(html, /<meta property="twitter:title" content="[^"]*" \/>/, `<meta property="twitter:title" content="${escapeHtml(tags.title)}" />`);
  html = upsertTag(html, /<meta property="twitter:description" content="[^"]*" \/>/, `<meta property="twitter:description" content="${escapeHtml(tags.description)}" />`);
  html = upsertTag(html, /<meta property="twitter:image" content="[^"]*" \/>/, `<meta property="twitter:image" content="${escapeHtml(tags.image)}" />`);
  html = upsertTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${escapeHtml(tags.url)}" />`);

  const imagePath = tags.image.startsWith(SITE_URL) ? tags.image.slice(SITE_URL.length) : tags.image;
  const generatedHead = [
    imagePath.startsWith('/') ? `<link rel="preload" as="image" href="${escapeHtml(imagePath)}" />` : '',
    '<style data-prerender="journal">',
    '.prerender-journal{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:920px;margin:0 auto;padding:80px 24px;color:#24382d;background:#f3eee2;line-height:1.7}',
    '.prerender-journal__eyebrow{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#7d8f69;font-weight:700}',
    '.prerender-journal h1{font-size:clamp(40px,8vw,76px);line-height:1.05;font-weight:300;margin:18px 0 22px}',
    '.prerender-journal h2,.prerender-journal h3{font-weight:400;line-height:1.2;margin:42px 0 14px}',
    '.prerender-journal p,.prerender-journal li{font-size:18px;color:rgba(36,56,45,.78)}',
    '.prerender-journal img{width:100%;height:auto;border-radius:28px;margin:28px 0 18px;display:block}',
    '.prerender-journal__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;margin-top:34px}',
    '.prerender-journal__card{border:1px solid rgba(125,143,105,.22);border-radius:24px;background:rgba(255,255,255,.62);overflow:hidden;text-decoration:none;color:#24382d}',
    '.prerender-journal__card img{border-radius:0;margin:0;aspect-ratio:2/1;object-fit:cover}',
    '.prerender-journal__card div{padding:18px}',
    '</style>',
    ...jsonLd.filter(Boolean).map(data => `<script type="application/ld+json" data-prerender="journal">${JSON.stringify(data)}</script>`),
  ].filter(Boolean).join('\n');

  html = html.replace('</head>', `${generatedHead}\n</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
  return html;
};

const articleJsonLd = (article: Article) => {
  const url = `${SITE_URL}${getArticlePath(article)}`;
  const image = absoluteUrl(getArticleCover(article));
  const description = article.metaDescription || article.excerpt;
  const keywords = [...(article.keywords || []), ...(article.tags || [])].join(', ');
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description,
    image: [image],
    datePublished: getArticleDate(article, 'publishedAt'),
    dateModified: getArticleDate(article, 'updatedAt'),
    author: {
      '@type': 'Organization',
      name: 'Soil AI',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Soil AI',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/favicon.svg'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: article.category,
    keywords,
  };

  const faqSchema = article.faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } : null;

  return [articleSchema, faqSchema];
};

const renderJournalIndex = (orderedArticles: Article[]) => {
  const cards = orderedArticles.map(article => `
    <a class="prerender-journal__card" href="${getArticlePath(article)}">
      <img src="${getArticleCover(article)}" alt="${escapeHtml(getArticleCoverAlt(article))}" />
      <div>
        <p class="prerender-journal__eyebrow">${escapeHtml(article.category || 'Guide')}</p>
        <h2>${escapeHtml(article.title)}</h2>
        <p>${escapeHtml(article.excerpt)}</p>
      </div>
    </a>
  `).join('\n');

  return `
    <main class="prerender-journal">
      <p class="prerender-journal__eyebrow">${orderedArticles.length} curated guides</p>
      <h1>Plant Care Library</h1>
      <p>Practical plant care guides organized by symptom, plant type, and the questions real plant owners ask first.</p>
      <section class="prerender-journal__grid">${cards}</section>
    </main>
  `;
};

const renderArticle = (article: Article) => `
  <main class="prerender-journal">
    <p class="prerender-journal__eyebrow">${escapeHtml(article.category || 'Plant care guide')} · ${escapeHtml(article.readTime || '5 min read')}</p>
    <h1>${escapeHtml(article.title)}</h1>
    <p>${escapeHtml(article.excerpt)}</p>
    <img src="${getArticleCover(article)}" alt="${escapeHtml(getArticleCoverAlt(article))}" />
    <article>${markdownToHtml(article.content)}</article>
  </main>
`;

const writePage = async (routePath: string, html: string) => {
  const dir = path.join(DIST_DIR, routePath);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html, 'utf8');
};

const writeStaticSeoFiles = async (orderedArticles: Article[]) => {
  const sitemapUrls = [
    { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}/journal`, changefreq: 'daily', priority: '0.9' },
    ...orderedArticles.map(article => ({
      loc: `${SITE_URL}${getArticlePath(article)}`,
      lastmod: getArticleDate(article, 'updatedAt').slice(0, 10),
      changefreq: 'weekly',
    })),
  ];

  const sitemapEntries = sitemapUrls.map(item => [
    '  <url>',
    `    <loc>${item.loc}</loc>`,
    ...('lastmod' in item ? [`    <lastmod>${item.lastmod}</lastmod>`] : []),
    `    <changefreq>${item.changefreq}</changefreq>`,
    ...('priority' in item ? [`    <priority>${item.priority}</priority>`] : []),
    '  </url>',
  ].join('\n')).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

  await writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(path.join(DIST_DIR, 'robots.txt'), robots, 'utf8');
  await writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(path.join(PUBLIC_DIR, 'robots.txt'), robots, 'utf8');
};

const main = async () => {
  const baseHtml = await readFile(path.join(DIST_DIR, 'index.html'), 'utf8');
  const orderedArticles = sortArticlesByIntent(articles);

  const journalDescription = 'Browse Soil AI plant care guides by symptom, including yellow leaves, brown spots, drooping plants, pests, and beginner houseplant care.';
  const journalJsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Plant Care Journal',
    description: journalDescription,
    url: `${SITE_URL}/journal`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: orderedArticles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: `${SITE_URL}${getArticlePath(article)}`,
      })),
    },
  }];

  const journalHtml = injectSeoTags(baseHtml, {
    title: 'Plant Care Journal: Symptom Guides and Houseplant Fixes | Soil AI',
    description: journalDescription,
    keywords: 'plant care guides, houseplant symptoms, yellow leaves, brown spots, drooping plants, fungus gnats, Soil AI journal',
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    imageAlt: 'Soil AI plant care journal',
    url: `${SITE_URL}/journal`,
    ogType: 'website',
  }, journalJsonLd, renderJournalIndex(orderedArticles));
  await writePage('journal', journalHtml);

  for (const article of orderedArticles) {
    const image = absoluteUrl(getArticleCover(article));
    const html = injectSeoTags(baseHtml, {
      title: article.metaTitle || `${article.title} | Soil AI`,
      description: article.metaDescription || article.excerpt,
      keywords: [...(article.keywords || []), ...(article.tags || [])].join(', '),
      image,
      imageAlt: getArticleCoverAlt(article),
      url: `${SITE_URL}${getArticlePath(article)}`,
      ogType: 'article',
    }, articleJsonLd(article), renderArticle(article));
    await writePage(`journal/${article.slug || article.id}`, html);
  }

  await writeStaticSeoFiles(orderedArticles);
  console.log(`Prerendered journal index and ${orderedArticles.length} article pages.`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
