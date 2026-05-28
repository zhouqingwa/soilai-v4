import { useEffect, useMemo, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, X, BookOpen, Search, Leaf, Droplets, Bug, Sprout, RotateCcw, Sun, Grid3X3, ListFilter } from 'lucide-react';
import Markdown from 'react-markdown';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articles } from '../lib/articles';
import type { Article } from '../lib/articles';
import {
  getArticleCover,
  getArticleCoverAlt,
  getArticleSearchText,
  hasAnyJournalKeyword,
  journalFilterDefinitions,
  sortArticlesByIntent,
  type JournalIconKey,
} from '../lib/journalContent';

const SITE_NAME = 'Soil AI';
const DEFAULT_SITE_URL = 'https://www.soilai.app';
const DEFAULT_OG_IMAGE = '/og-image.svg';

const getSiteUrl = () => {
  if (typeof window === 'undefined') return DEFAULT_SITE_URL;
  return window.location.origin;
};

const absoluteUrl = (pathOrUrl: string | undefined, siteUrl = getSiteUrl()) => {
  if (!pathOrUrl) return `${siteUrl}${DEFAULT_OG_IMAGE}`;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
};

const getArticleUrl = (article: Article, siteUrl = getSiteUrl()) =>
  absoluteUrl(`/journal/${article.slug || article.id}`, siteUrl);

const getArticleDate = (article: Article, field: 'publishedAt' | 'updatedAt' = 'publishedAt') => {
  const value = article[field] || article.createdAt;
  if (typeof value === 'string') return new Date(value).toISOString();
  return new Date(value.seconds * 1000).toISOString();
};

const iconMap: Record<JournalIconKey, typeof BookOpen> = {
  book: BookOpen,
  leaf: Leaf,
  droplets: Droplets,
  bug: Bug,
  sprout: Sprout,
  sun: Sun,
};

const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = DEFAULT_OG_IMAGE;
};

const isPhotoCover = (article: Article) => /\.(png|jpe?g|webp|avif)$/i.test(getArticleCover(article));

const getVisualIconKey = (article: Article): JournalIconKey => {
  const haystack = [article.category, article.title, article.excerpt, ...article.tags, ...(article.keywords || [])]
    .join(' ')
    .toLowerCase();

  if (haystack.includes('water') || haystack.includes('root rot') || haystack.includes('droop') || haystack.includes('wilt')) return 'droplets';
  if (haystack.includes('gnat') || haystack.includes('mite') || haystack.includes('pest') || haystack.includes('mold')) return 'bug';
  if (haystack.includes('soil') || haystack.includes('root')) return 'sprout';
  if (haystack.includes('light') || haystack.includes('leggy') || haystack.includes('split')) return 'sun';
  return 'leaf';
};

const getPrimarySignal = (article: Article) => {
  const tag = article.tags.find(item => item.length <= 24) || article.category || 'Plant care';
  return tag.replace(/\b\w/g, char => char.toUpperCase());
};

const JournalVisual = ({ article, compact = false, mini = false, hero = false }: { article: Article; compact?: boolean; mini?: boolean; hero?: boolean }) => {
  const Icon = iconMap[getVisualIconKey(article)];
  const primarySignal = getPrimarySignal(article);
  const tags = article.tags.slice(0, mini ? 1 : 3);

  if (mini) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#f5f1e7]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(125,143,105,0.28),transparent_38%),radial-gradient(circle_at_80%_88%,rgba(45,58,45,0.16),transparent_42%)]" />
        <Icon className="relative h-9 w-9 text-[#2d3a2d]" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${
      hero
        ? 'h-full border-0'
        : compact
          ? 'aspect-[16/7] rounded-[1.2rem] mb-5 border border-[#7d8f69]/18'
          : 'aspect-[16/8] rounded-[1.5rem] mb-6 border border-[#7d8f69]/18'
    } bg-[#f7f2e8]`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(125,143,105,0.32),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(45,58,45,0.14),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.78),rgba(241,243,238,0.3))]" />
      <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border border-[#2d3a2d]/10 bg-white/32" />
      <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-[#7d8f69]/12" />
      <div className="absolute bottom-0 right-0 h-28 w-36 rounded-tl-[5rem] bg-[#2d3a2d]/8" />

      <div className={`relative flex h-full flex-col justify-between ${hero ? 'p-8 md:p-12' : compact ? 'p-5' : 'p-6'}`}>
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full border border-white/70 bg-white/82 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#2d3a2d] shadow-sm backdrop-blur-md">
            {article.category || 'Guide'}
          </span>
          <div className={`${hero ? 'h-16 w-16' : compact ? 'h-11 w-11' : 'h-14 w-14'} flex items-center justify-center rounded-full bg-[#2d3a2d] text-white shadow-[0_14px_34px_rgba(45,58,45,0.22)]`}>
            <Icon className={`${hero ? 'h-7 w-7' : compact ? 'h-5 w-5' : 'h-6 w-6'}`} strokeWidth={1.6} />
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#2d3a2d]/18" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7d8f69]">SoilAI Notes</span>
          </div>
          <p className={`${hero ? 'text-5xl md:text-7xl' : compact ? 'text-xl' : 'text-3xl'} font-serif leading-none text-[#2d3a2d]`}>
            {primarySignal}
          </p>
          {!compact && !hero && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="rounded-full bg-white/62 px-3 py-1 text-[11px] font-semibold text-[#2d3a2d]/70">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ArticleCover = ({ article, compact = false, mini = false, hero = false }: { article: Article; compact?: boolean; mini?: boolean; hero?: boolean }) => {
  const cover = getArticleCover(article);

  if (!isPhotoCover(article)) {
    return <JournalVisual article={article} compact={compact} mini={mini} hero={hero} />;
  }

  if (mini) {
    return (
      <img
        src={cover}
        alt={getArticleCoverAlt(article)}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
        onError={handleImageError}
      />
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${
      hero
        ? 'h-full'
        : compact
          ? 'aspect-[16/7] rounded-[1.2rem] mb-5'
          : 'aspect-[16/8] rounded-[1.5rem] mb-6'
    } bg-[#f1f3ee]`}>
      <img
        src={cover}
        alt={getArticleCoverAlt(article)}
        loading={hero ? 'eager' : 'lazy'}
        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
        onError={handleImageError}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#17261e]/45 via-transparent to-white/8" />
      {!hero && (
        <>
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#2d3a2d] shadow-sm backdrop-blur-md">
            {article.category || 'Guide'}
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <p className={`${compact ? 'text-lg' : 'text-2xl'} max-w-[70%] font-serif leading-none text-white drop-shadow-sm`}>
              {getPrimarySignal(article)}
            </p>
            <span className="rounded-full bg-white/88 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#2d3a2d] shadow-sm backdrop-blur-md">
              SoilAI
            </span>
          </div>
        </>
      )}
    </div>
  );
};

const ArticleCard = ({ article, index, compact = false }: { article: Article; index: number; compact?: boolean }) => (
  <Link
    key={article.id}
    to={article.slug ? `/journal/${article.slug}` : `/journal/${article.id}`}
    className="block group h-full"
  >
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 * Math.min(index + 1, 6), ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col rounded-[2rem] border border-[#7d8f69]/20 bg-white/70 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-[#7d8f69]/40 hover:bg-white hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]"
    >
      <ArticleCover article={article} compact={compact} />
      <div className="flex flex-col flex-1 px-2">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7d8f69]">
            {article.readTime || '5 min read'}
          </span>
          <span className="w-1 h-1 rounded-full bg-[#7d8f69]/30"></span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7d8f69]">
            {new Date(article.updatedAt || article.publishedAt).getFullYear()}
          </span>
        </div>
        <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-medium text-[#2d3a2d] leading-tight mb-3 group-hover:text-[#7d8f69] transition-colors`}>
          {article.title}
        </h3>
        <p className={`${compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-3'} text-[#2d3a2d]/70 leading-relaxed mb-6`}>
          {article.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
                {article.tags.slice(0, compact ? 1 : 2).map(tag => (
                <span key={tag} className="rounded-md bg-[#f1f3ee] px-2.5 py-1.5 text-[11px] font-medium text-[#7d8f69]">
                    {tag}
                </span>
                ))}
            </div>
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#f1f3ee] text-[#2d3a2d] group-hover:bg-[#2d3a2d] group-hover:text-white transition-colors duration-300">
                <ArrowRight className="w-4 h-4" />
            </div>
        </div>
      </div>
    </motion.article>
  </Link>
);

export default function JournalView() {
  const { slug, '*': starSlug } = useParams();
  const activeSlug = slug || starSlug;
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleGuideCount, setVisibleGuideCount] = useState(9);
  const siteUrl = getSiteUrl();
  const orderedArticles = useMemo(() => sortArticlesByIntent(articles), []);
  const normalizedQuery = query.trim().toLowerCase();
  const selectedArticle = activeSlug
    ? articles.find(a => a.slug === activeSlug || a.id === activeSlug) || null
    : null;
  const isLoading = false;

  useEffect(() => {
    if (activeSlug || typeof window === 'undefined' || !window.location.hash) return;

    const timer = window.setTimeout(() => {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    return () => window.clearTimeout(timer);
  }, [activeSlug]);

  useEffect(() => {
    // Intentionally empty to avoid iOS Safari scroll-to-top bug.
  }, [selectedArticle]);

  const closeArticle = () => {
    navigate('/journal');
  };

  const filterOptions = useMemo(() => journalFilterDefinitions.map(filter => ({
    ...filter,
    count: orderedArticles.filter(article => filter.id === 'all' || hasAnyJournalKeyword(article, filter.keywords)).length
  })), [orderedArticles]);
  const activeFilterDefinition = filterOptions.find(filter => filter.id === activeFilter) || filterOptions[0];
  const hasActiveBrowse = activeFilter !== 'all' || normalizedQuery.length > 0;
  const filteredArticles = useMemo(() => orderedArticles.filter(article => {
    const matchesFilter = activeFilterDefinition.id === 'all' || hasAnyJournalKeyword(article, activeFilterDefinition.keywords);
    const matchesQuery = !normalizedQuery || getArticleSearchText(article).includes(normalizedQuery);
    return matchesFilter && matchesQuery;
  }), [activeFilterDefinition, normalizedQuery, orderedArticles]);
  const featuredArticles = orderedArticles.slice(0, 4);
  const browseArticles = hasActiveBrowse ? filteredArticles : orderedArticles.filter(article => !featuredArticles.some(featured => featured.id === article.id));
  const visibleArticles = browseArticles.slice(0, visibleGuideCount);
  const hasMoreGuides = visibleGuideCount < browseArticles.length;

  useEffect(() => {
    setVisibleGuideCount(9);
  }, [activeFilter, normalizedQuery]);

  const resetBrowse = () => {
    setQuery('');
    setActiveFilter('all');
  };

  const journalTitle = 'Plant Care Journal: Symptom Guides and Houseplant Fixes | Soil AI';
  const journalDescription = 'Browse Soil AI plant care guides by symptom, including yellow leaves, brown spots, drooping plants, pests, and beginner houseplant care.';
  const journalKeywords = 'plant care guides, houseplant symptoms, yellow leaves, brown spots, drooping plants, fungus gnats, Soil AI journal';
  const journalSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Plant Care Journal',
    description: journalDescription,
    url: absoluteUrl('/journal', siteUrl),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: siteUrl
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: orderedArticles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: getArticleUrl(article, siteUrl)
      }))
    }
  };

  const articleTitle = selectedArticle?.metaTitle || (selectedArticle ? `${selectedArticle.title} | ${SITE_NAME}` : journalTitle);
  const articleDescription = selectedArticle?.metaDescription || selectedArticle?.excerpt || journalDescription;
  const articleImage = selectedArticle ? absoluteUrl(getArticleCover(selectedArticle), siteUrl) : absoluteUrl(DEFAULT_OG_IMAGE, siteUrl);
  const articleUrl = selectedArticle ? getArticleUrl(selectedArticle, siteUrl) : absoluteUrl('/journal', siteUrl);
  const articleKeywords = selectedArticle
    ? [...(selectedArticle.keywords || []), ...(selectedArticle.tags || [])].join(', ')
    : journalKeywords;
  const articleSchema = selectedArticle ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: selectedArticle.title,
    description: articleDescription,
    image: [articleImage],
    datePublished: getArticleDate(selectedArticle, 'publishedAt'),
    dateModified: getArticleDate(selectedArticle, 'updatedAt'),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: siteUrl
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/favicon.svg', siteUrl)
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    articleSection: selectedArticle.category,
    keywords: articleKeywords
  } : null;
  const faqSchema = selectedArticle?.faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: selectedArticle.faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  } : null;

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 md:py-20 animate-in fade-in duration-700">
      {!selectedArticle && (
        <Helmet>
          <title>{journalTitle}</title>
          <meta name="description" content={journalDescription} />
          <meta name="keywords" content={journalKeywords} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={journalTitle} />
          <meta property="og:description" content={journalDescription} />
          <meta property="og:url" content={absoluteUrl('/journal', siteUrl)} />
          <meta property="og:image" content={absoluteUrl(DEFAULT_OG_IMAGE, siteUrl)} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={journalTitle} />
          <meta name="twitter:description" content={journalDescription} />
          <meta name="twitter:image" content={absoluteUrl(DEFAULT_OG_IMAGE, siteUrl)} />
          <link rel="canonical" href={absoluteUrl('/journal', siteUrl)} />
          <script type="application/ld+json">{JSON.stringify(journalSchema)}</script>
        </Helmet>
      )}

      <div className="mb-14 md:mb-20 max-w-4xl">
        <div>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#7d8f69]/20 bg-white/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#2d3a2d] backdrop-blur-sm mb-6">
            <Grid3X3 className="h-4 w-4 text-[#7d8f69]" />
            {articles.length} Curated Guides
          </div>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-[#2d3a2d] mb-6 leading-[1.1]">
            Plant Care <span className="font-serif italic text-[#7d8f69]">Library.</span>
          </h1>
          <p className="text-[#2d3a2d]/60 max-w-2xl text-lg md:text-xl leading-relaxed">
            Practical plant care guides organized by symptom, plant type, and the questions real plant owners ask first.
          </p>
        </div>
      </div>

      <section className="mb-16 md:mb-24 border-y border-[#7d8f69]/15 py-8 md:py-10">
        <div className="flex flex-col gap-6 font-sans">
          <div className="relative max-w-2xl">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7d8f69]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Search yellow leaves, gnats, monstera..."
              aria-label="Search journal guides"
              className="h-16 w-full rounded-full border border-[#7d8f69]/20 bg-white/70 pl-14 pr-6 text-base text-[#2d3a2d] placeholder:text-[#7d8f69]/70 shadow-sm outline-none transition focus:border-[#7d8f69]/50 focus:bg-white focus:ring-4 focus:ring-[#7d8f69]/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {filterOptions.map(filter => {
              const Icon = iconMap[filter.icon];
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  aria-pressed={isActive}
                  className={`inline-flex h-11 items-center gap-2.5 rounded-full border px-5 text-[12px] font-bold uppercase tracking-[0.15em] transition hover:shadow-md ${
                    isActive
                      ? 'border-[#2d3a2d] bg-[#2d3a2d] text-white'
                      : 'border-[#7d8f69]/20 bg-white/60 text-[#2d3a2d] hover:border-[#7d8f69]/40 hover:bg-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#7d8f69]'}`} />
                  <span>{filter.label}</span>
                  <span className={isActive ? 'text-white/70' : 'text-[#7d8f69]'}>{filter.count}</span>
                </button>
              );
            })}
            {hasActiveBrowse && (
              <button
                type="button"
                onClick={resetBrowse}
                className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[12px] font-bold uppercase tracking-[0.15em] text-[#7d8f69] transition hover:text-[#2d3a2d] hover:bg-white/40"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 animate-pulse mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="h-64 w-full rounded-2xl mb-6 bg-stone-200"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-3 w-12 bg-stone-200 rounded"></div>
                <div className="h-3 w-20 bg-stone-200 rounded"></div>
              </div>
              <div className="h-6 w-3/4 bg-stone-200 rounded mb-3"></div>
              <div className="h-4 w-full bg-stone-200 rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-stone-200 rounded mb-4"></div>
              <div className="h-3 w-16 bg-stone-200 rounded mt-auto"></div>
            </div>
          ))}
         </div>
      ) : (
        <div className="space-y-16 md:space-y-24">
          {!hasActiveBrowse && (
            <section className="animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-5 mb-10 md:mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-[#2d3a2d]">Most Common Problems</h2>
                <div className="flex-1 h-px bg-[#7d8f69]/20"></div>
              </div>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                {featuredArticles[0] && (
                  <ArticleCard article={featuredArticles[0]} index={0} />
                )}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-1">
                  {featuredArticles.slice(1).map((article, index) => (
                    <ArticleCard key={article.id} article={article} index={index + 1} compact />
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="animate-in slide-in-from-bottom-8 duration-700">
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-[#2d3a2d]">
                  {hasActiveBrowse ? 'Matching Guides' : 'All Guides'}
                </h2>
                <p className="mt-3 text-base text-[#2d3a2d]/60">
                  {browseArticles.length === 0
                    ? 'No guides found'
                    : `Showing ${visibleArticles.length} of ${browseArticles.length} ${browseArticles.length === 1 ? 'guide' : 'guides'}`}
                </p>
              </div>
              <div className="hidden md:block h-px flex-1 bg-[#7d8f69]/20 md:ml-10 mb-3"></div>
            </div>

            {visibleArticles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {visibleArticles.map((article, index) => (
                    <ArticleCard key={article.id} article={article} index={index} />
                  ))}
                </div>

                {hasMoreGuides && (
                  <div className="mt-14 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleGuideCount(count => count + 9)}
                      className="inline-flex h-14 items-center gap-3 rounded-full border border-[#7d8f69]/20 bg-white/60 px-8 text-[12px] font-bold uppercase tracking-[0.2em] text-[#2d3a2d] transition hover:border-[#7d8f69]/50 hover:bg-white hover:shadow-md"
                    >
                      Show more guides
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="border border-dashed border-[#7d8f69]/30 bg-white/50 px-10 py-20 text-center rounded-3xl">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1f3ee]">
                  <Search className="h-7 w-7 text-[#7d8f69]" />
                </div>
                <h3 className="text-2xl font-medium text-[#2d3a2d] mb-3">No matching guide yet</h3>
                <p className="mx-auto max-w-sm text-base leading-relaxed text-[#2d3a2d]/60">
                  Try another symptom, plant name, or care topic.
                </p>
              </div>
            )}
          </section>

          {articles.length === 0 && (
            <div className="text-center py-24 bg-white/40 rounded-[2rem] border border-dashed border-forest-deep/10 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-stone-300" />
              </div>
              <h3 className="text-xl font-medium text-forest-deep mb-2">The archives are dusty</h3>
              <p className="text-forest-deep/50 italic max-w-sm">
                Our botanists are still out in the field gathering intel. Check back later for survival guides and horror stories.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-[#f1f3ee]/90 backdrop-blur-md p-4 md:p-8 overflow-y-auto"
            onClick={closeArticle}
          >
            <Helmet>
              <title>{articleTitle}</title>
              <meta name="description" content={articleDescription} />
              <meta name="keywords" content={articleKeywords} />
              <meta property="og:title" content={articleTitle} />
              <meta property="og:description" content={articleDescription} />
              <meta property="og:url" content={articleUrl} />
              <meta property="og:image" content={articleImage} />
              <meta property="og:image:alt" content={getArticleCoverAlt(selectedArticle)} />
              <meta property="og:type" content="article" />
              <meta property="article:published_time" content={getArticleDate(selectedArticle, 'publishedAt')} />
              <meta property="article:modified_time" content={getArticleDate(selectedArticle, 'updatedAt')} />
              <meta property="article:section" content={selectedArticle.category} />
              {selectedArticle.tags.map(tag => (
                <meta key={tag} property="article:tag" content={tag} />
              ))}
              <link rel="canonical" href={articleUrl} />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={articleTitle} />
              <meta name="twitter:description" content={articleDescription} />
              <meta name="twitter:image" content={articleImage} />
              <script type="application/ld+json">
                {JSON.stringify(articleSchema)}
              </script>
              {faqSchema && (
                <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
              )}
            </Helmet>
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-4xl min-h-[80vh] rounded-[2rem] shadow-2xl overflow-hidden relative my-auto border border-[#7d8f69]/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeArticle}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center text-[#2d3a2d] hover:bg-white hover:scale-105 hover:shadow-lg transition-all border border-white/20"
                aria-label="Close article"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="h-72 md:h-[28rem] w-full relative bg-[#f7f2e8] overflow-hidden">
                <ArticleCover article={selectedArticle} hero />
                <div className="absolute inset-0 bg-gradient-to-t from-white/78 via-white/12 to-transparent" />
              </div>

              <div className="p-8 md:p-16 max-w-3xl mx-auto -mt-24 relative bg-white rounded-t-[2.5rem] shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <span className="inline-flex items-center px-4 py-1.5 bg-[#f1f3ee] text-[#7d8f69] rounded-full text-[11px] font-bold uppercase tracking-[0.2em]">
                    {selectedArticle.category}
                  </span>
                  <span className="text-[11px] uppercase font-semibold tracking-widest text-[#7d8f69] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedArticle.readTime}
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-light text-[#2d3a2d] tracking-tight leading-[1.15] mb-8">
                  {selectedArticle.title}
                </h1>

                <div className="prose prose-stone prose-lg max-w-none prose-headings:font-light prose-headings:text-[#2d3a2d] prose-h2:text-3xl prose-h3:text-2xl prose-p:text-[#2d3a2d]/80 prose-p:leading-relaxed prose-a:text-[#7d8f69] prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-[#2d3a2d] prose-blockquote:border-l-[#7d8f69]/30 prose-blockquote:text-[#2d3a2d]/70 prose-blockquote:font-serif prose-blockquote:italic prose-img:rounded-2xl">
                  <p className="text-xl md:text-2xl font-light text-[#2d3a2d]/90 leading-relaxed mb-12 italic border-l-4 border-[#7d8f69]/20 pl-6">
                    {selectedArticle.excerpt}
                  </p>

                  {/* Placeholder Content */}
                  {selectedArticle.content ? (
                    <Markdown>{selectedArticle.content}</Markdown>
                  ) : (
                    <div className="py-16 text-center bg-[#f1f3ee]/50 rounded-3xl border border-[#7d8f69]/10">
                      <p className="text-[#2d3a2d]/60 italic font-medium">No detailed content available for this article.</p>
                    </div>
                  )}

                  {articles.filter(a => a.id !== selectedArticle.id && a.category === selectedArticle.category).length > 0 && (
                    <div className="mt-20 pt-16 border-t border-[#7d8f69]/20">
                      <h3 className="text-3xl font-light text-[#2d3a2d] mb-10">Related Guides</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {articles.filter(a => a.id !== selectedArticle.id && a.category === selectedArticle.category).slice(0, 2).map((article, idx) => (
                          <Link
                            key={article.id}
                            to={article.slug ? `/journal/${article.slug}` : `/journal/${article.id}`}
                            className="group block"
                          >
                            <div className="flex gap-5 items-center p-3 rounded-2xl transition duration-300 hover:bg-[#f1f3ee]">
                              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-stone-200">
                                <ArticleCover article={article} mini />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-medium text-[#2d3a2d] line-clamp-2 leading-tight group-hover:text-[#7d8f69] transition-colors mb-2">
                                  {article.title}
                               </h4>
                                <span className="text-[11px] uppercase font-bold tracking-widest text-[#7d8f69]">
                                  {article.readTime || '5 min read'}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-20 p-10 md:p-12 bg-gradient-to-br from-[#f1f3ee] to-white rounded-3xl border border-[#7d8f69]/20 text-center shadow-sm">
                    <h3 className="text-3xl font-light text-[#2d3a2d] mb-4">
                      Not sure what's wrong with your plant?
                    </h3>
                    <p className="text-[#2d3a2d]/70 text-lg mb-8 max-w-lg mx-auto">
                      Upload a photo for a free, instant Soil AI diagnosis and custom care plan.
                    </p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#4a5f4a] to-[#2d3a2d] text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:shadow-lg hover:scale-105 transition-all duration-300 ring-1 ring-black/10"
                    >
                      Diagnose My Plant <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
