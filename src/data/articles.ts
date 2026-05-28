export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  // 后续你可以加上 content 字段来存放文章正文（支持 Markdown 或 HTML）
  content?: string;
}

export const articles: Article[] = [
  {
    id: '1',
    title: 'The Art of Wabi-Sabi in Indoor Gardening',
    excerpt: 'Embracing imperfection, asymmetry, and the natural cycle of growth and decay in your living space. Why a yellowing leaf isn\'t always a failure, but a beautiful transition.',
    category: 'Philosophy',
    date: 'Oct 12, 2023',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1497250681554-ef193c23b5e5?auto=format&fit=crop&q=80&w=1200',
    content: `
# The Art of Wabi-Sabi in Indoor Gardening

Wabi-sabi (侘寂) is a world view centered on the acceptance of transience and imperfection. The aesthetic is sometimes described as one of appreciating beauty that is "imperfect, impermanent, and incomplete" in nature.

## Finding Beauty in the Flawed

When we bring plants indoors, we often expect them to look like the pristine, glossy specimens we see on Instagram. We prune away every brown tip, rotate them obsessively for perfect symmetry, and stress over every dropped leaf.

But nature is not a plastic mold. It is a living, breathing, and constantly changing entity.

### The Yellowing Leaf

A yellowing leaf is not always a sign of failure. Often, it is simply the plant reabsorbing nutrients from an old leaf to fuel new growth. It is a natural part of the plant's life cycle. Instead of immediately cutting it off, observe it. Watch how the color fades from vibrant green to a soft, buttery yellow, and finally to a crisp, papery brown. There is a quiet beauty in this decay.

> "Wabi-sabi nurtures all that is authentic by acknowledging three simple realities: nothing lasts, nothing is finished, and nothing is perfect." - Richard Powell

## Embrace the Asymmetry

Plants grow towards the light. They lean, they stretch, they twist. This phototropism creates unique, asymmetrical shapes that tell the story of the plant's environment. Instead of constantly rotating your plant to force it into a perfect sphere, let it lean. Let it express its character.

A Monstera that has grown sideways to reach a window is far more interesting than one that has been staked into rigid submission.

## The Patina of Time

Just as a well-loved leather jacket develops a beautiful patina, so too do our plants and their pots. Terracotta pots accumulate white mineral deposits and green algae over time. This is not dirt; it is the physical manifestation of the passage of time and the life that has been nurtured within it.

Do not scrub your pots clean. Let them age gracefully. Let them show their history.

In the end, indoor gardening is not about creating a perfect, static display. It is about cultivating a relationship with a living thing. It is about observing the subtle changes, the quiet growth, and the inevitable decay. It is about finding peace in the imperfect.
`
  },
  {
    id: '2',
    title: 'Understanding Soil Microbiomes',
    excerpt: 'Why sterile potting soil might be killing your houseplants, and how to cultivate a thriving underground ecosystem for robust roots.',
    category: 'Science',
    date: 'Sep 28, 2023',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1592424001807-1c4582165e98?auto=format&fit=crop&q=80&w=800',
    content: `
# Understanding Soil Microbiomes

For decades, the standard advice for indoor gardening has been to use sterile potting soil. The logic seemed sound: sterile soil means no pests, no diseases, and no weeds. But this approach ignores a fundamental truth of nature: plants do not grow in isolation.

## The Underground Ecosystem

In the wild, a plant's roots are intimately entwined with a vast, complex ecosystem of bacteria, fungi, protozoa, and nematodes. This is the soil microbiome.

These microorganisms are not just passive residents; they are active partners in the plant's survival. They break down organic matter into nutrients the plant can absorb. They produce hormones that stimulate root growth. They even protect the plant from pathogens by outcompeting them for resources or producing antibiotics.

### The Problem with Sterile Soil

When we plant our houseplants in sterile, peat-based potting mixes, we are essentially placing them in an intensive care unit. They are completely dependent on us for every nutrient they need, delivered via synthetic fertilizers.

This approach works, to an extent. But it creates fragile plants that are highly susceptible to stress and disease. Without a healthy microbiome to buffer them, a slight overwatering or a missed fertilization can be disastrous.

## Cultivating a Living Soil

So, how do we bring the benefits of the soil microbiome indoors?

1.  **Ditch the Peat:** Peat moss is sterile and devoid of life. Opt for mixes based on coco coir, compost, and worm castings.
2.  **Add Organic Matter:** Microbes need food. Incorporate organic fertilizers like kelp meal, alfalfa meal, or bone meal into your soil.
3.  **Inoculate:** You can jump-start your soil microbiome by adding mycorrhizal fungi or compost tea.
4.  **Water Wisely:** Microbes need moisture, but they also need oxygen. Overwatering drowns them; underwatering desiccates them. Aim for a consistent, moderate moisture level.

By shifting our focus from feeding the plant to feeding the soil, we can cultivate robust, resilient houseplants that thrive rather than just survive.
`
  },
  {
    id: '3',
    title: 'A Guide to Rare Aroids',
    excerpt: 'Navigating the complex and expensive world of variegated Monsteras, elusive Philodendrons, and how to care for them without losing your mind.',
    category: 'Collecting',
    date: 'Sep 15, 2023',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d40?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    title: 'Winter Dormancy Explained',
    excerpt: 'How to adjust your watering and fertilizing routines when the days get shorter and colder. Hint: Do less.',
    category: 'Care',
    date: 'Aug 30, 2023',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1545241047-6083a36ee15f?auto=format&fit=crop&q=80&w=800'
  }
];
