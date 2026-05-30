import type { Article } from './articles';

export type JournalIconKey = 'book' | 'leaf' | 'droplets' | 'bug' | 'sprout' | 'sun';

export type JournalFilterDefinition = {
  id: string;
  label: string;
  icon: JournalIconKey;
  keywords: string[];
};

export type JournalBrowseGroup = {
  id: string;
  category: string;
  description: string;
  keywords: string[];
  categoryMatches?: string[];
};

const generatedPhotoCoverSlugs = new Set([
  'why-are-my-plant-leaves-turning-yellow',
  'monstera-leaves-not-splitting',
  'why-are-the-tips-of-my-plant-leaves-turning-brown',
  'why-are-my-plant-leaves-drooping-or-wilting',
  'how-to-get-rid-of-fungus-gnats',
  'white-spots-on-plant-leaves',
  'how-to-save-a-plant-from-root-rot',
  'overwatered-plant-signs-and-fixes',
  'underwatered-plant-signs-and-recovery',
  'how-often-should-i-water-houseplants',
  'why-is-my-plant-losing-leaves',
  'why-are-my-plant-leaves-curling',
  'black-spots-on-plant-leaves',
  'white-mold-on-houseplant-soil',
  'how-to-get-rid-of-spider-mites-on-houseplants',
  'why-is-my-plant-leggy',
  'why-are-my-pothos-leaves-turning-yellow',
  'why-is-my-peace-lily-drooping',
  'why-are-my-calathea-leaves-curling',
  'why-is-my-snake-plant-falling-over',
]);

export const journalFilterDefinitions: JournalFilterDefinition[] = [
  {
    id: 'all',
    label: 'All Guides',
    icon: 'book',
    keywords: [],
  },
  {
    id: 'leaf-problems',
    label: 'Leaf Problems',
    icon: 'leaf',
    keywords: ['leaf', 'leaves', 'yellow', 'brown', 'drooping', 'white spots', 'spots', 'curling'],
  },
  {
    id: 'watering',
    label: 'Watering',
    icon: 'droplets',
    keywords: ['water', 'watering', 'overwatering', 'underwatering', 'root rot', 'wilting', 'dry soil'],
  },
  {
    id: 'soil-roots',
    label: 'Soil & Roots',
    icon: 'sprout',
    keywords: ['soil', 'root', 'roots', 'mold', 'repotting', 'drainage'],
  },
  {
    id: 'pests',
    label: 'Pests',
    icon: 'bug',
    keywords: ['pest', 'gnats', 'mealybugs', 'mites', 'insects', 'fungus', 'mildew'],
  },
  {
    id: 'light-growth',
    label: 'Light & Growth',
    icon: 'sun',
    keywords: ['light', 'leggy', 'growth', 'stretching', 'sun', 'fenestration'],
  },
  {
    id: 'plant-specific',
    label: 'Plant Specific',
    icon: 'book',
    keywords: ['monstera', 'calathea', 'philodendron', 'pothos', 'peace lily', 'snake plant'],
  },
];

export const journalBrowseGroups: JournalBrowseGroup[] = [
  {
    id: 'leaf-problems',
    category: 'Leaf Problems',
    description: 'Yellow leaves, brown tips, spots, curling, dropping, and wilting signals.',
    categoryMatches: ['yellow leaves', 'brown spots', 'drooping', 'leaf problems'],
    keywords: ['leaf', 'leaves', 'yellow', 'brown', 'drooping', 'spots', 'curling'],
  },
  {
    id: 'watering',
    category: 'Watering',
    description: 'How much to water, when to stop, and how to recover dry soil.',
    categoryMatches: ['watering'],
    keywords: ['watering', 'overwatering', 'underwatering', 'dry soil', 'wet soil'],
  },
  {
    id: 'soil-roots',
    category: 'Soil & Roots',
    description: 'Root rot, soil mold, drainage, and below-the-surface plant problems.',
    categoryMatches: ['root rot', 'soil & roots'],
    keywords: ['root', 'roots', 'soil', 'mold', 'drainage', 'repotting'],
  },
  {
    id: 'pests-disease',
    category: 'Pests & Disease',
    description: 'Gnats, mites, mealybugs, mildew, and suspicious white fuzz.',
    categoryMatches: ['pest guidelines', 'other guides'],
    keywords: ['pest', 'gnats', 'mealybugs', 'mites', 'insects', 'fungus', 'mildew', 'disease'],
  },
  {
    id: 'light-growth',
    category: 'Light & Growth',
    description: 'Leggy stems, weak growth, leaf splits, and light-related plant behavior.',
    categoryMatches: ['light problems', 'monstera care'],
    keywords: ['light', 'leggy', 'growth', 'stretching', 'fenestration', 'monstera'],
  },
  {
    id: 'plant-specific',
    category: 'Plant-Specific Guides',
    description: 'Care notes for common houseplants and the problems they are famous for causing.',
    keywords: ['monstera', 'calathea', 'pothos', 'peace lily', 'snake plant'],
  },
];

export const getArticleSlug = (article: Article) => article.slug || article.id;

const getArticleHaystack = (article: Article) => [
  article.category,
  ...article.tags,
  ...(article.keywords || []),
  article.title,
  article.excerpt,
].join(' ').toLowerCase();

export const hasAnyJournalKeyword = (article: Article, keywords: string[]) => {
  if (keywords.length === 0) return true;
  const haystack = getArticleHaystack(article);
  return keywords.some(keyword => haystack.includes(keyword));
};

export const matchesJournalGroup = (article: Article, group: JournalBrowseGroup) => {
  const category = article.category.toLowerCase();
  const categoryMatches = group.categoryMatches || [];
  return categoryMatches.includes(category) || hasAnyJournalKeyword(article, group.keywords);
};

export const getArticleSearchText = (article: Article) => [
  article.title,
  article.metaTitle,
  article.metaDescription,
  article.excerpt,
  article.category,
  article.readTime,
  ...article.tags,
  ...(article.keywords || []),
  ...(article.faq || []).flatMap(item => [item.question, item.answer]),
].filter(Boolean).join(' ').toLowerCase();

export const sortArticlesByIntent = (items: Article[]) =>
  [...items].sort((a, b) => (a.seoPriority ?? 999) - (b.seoPriority ?? 999));

export const getArticleCover = (article: Article) => {
  const slug = getArticleSlug(article);
  if (generatedPhotoCoverSlugs.has(slug)) {
    return `/journal/covers/${slug}.jpg`;
  }

  if (article.imageUrl?.startsWith('/')) {
    return article.imageUrl;
  }

  return article.imageUrl || '/og-image.svg';
};

export const getArticleCoverAlt = (article: Article) => {
  const slug = getArticleSlug(article);
  if (!article.imageUrl?.startsWith('/') && generatedPhotoCoverSlugs.has(slug)) {
    return `Photorealistic plant care cover image for ${article.title}`;
  }

  return article.imageAlt || article.title;
};
