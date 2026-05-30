export interface ArticleFaq {
  question: string;
  answer: string;
}

export interface Article {
  id: string;
  title: string;
  metaTitle?: string;
  slug: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  imageAlt: string;
  category: string;
  tags: string[];
  keywords?: string[];
  faq?: ArticleFaq[];
  seoPriority?: number;
  readTime: string;
  createdAt: { seconds: number };
  publishedAt: string;
  updatedAt: string;
  status: "published";
}

export const articles: Article[] = [
  {
    id: "fallback-1",
    title: "Why Are My Plant Leaves Turning Yellow? Causes and Fixes",
    slug: "why-are-my-plant-leaves-turning-yellow",
    metaTitle: "Why Are My Plant Leaves Turning Yellow? Causes and Fixes | Soil AI",
    metaDescription: "Learn why your plant leaves are turning yellow and how to fix common issues like overwatering, underwatering, and poor light.",
    excerpt: "The most common question in plant care. Yellow leaves mean your plant is stressed, but is it too much water, or too little? Here is how to diagnose the issue.",
    content: `Yellow leaves are the houseplant version of a warning light. Annoying, vague, and usually showing up right when you thought everything was fine. The good news: a yellow leaf does not automatically mean your plant is dying. The bad news: it does mean something in the care routine needs attention.

## Quick Answer

Plant leaves usually turn yellow because the roots are stressed. The most common causes are overwatering, underwatering, low light, nutrient deficiency, natural aging, or shock from a recent move. Start by checking the soil moisture, where the yellow leaves are appearing, and whether the leaf is soft, limp, crispy, or spotted.

## First, Look at the Pattern

Before you start changing everything at once, observe the plant like a detective with a watering can.

- **Lower leaves turning yellow first:** Often overwatering, natural aging, or nitrogen deficiency.
- **Yellow leaves plus wet soil:** Strong sign of overwatering or early root rot.
- **Yellow leaves plus dry, compact soil:** Underwatering or hydrophobic soil.
- **Yellow leaves with brown crispy edges:** Usually inconsistent watering, low humidity, or mineral buildup.
- **Yellow patches between green veins:** Often a nutrient or pH issue.
- **One old yellow leaf only:** Probably normal aging. Let the plant have its dramatic retirement moment.

## Cause 1: Overwatering

Overwatering is the most common reason houseplant leaves turn yellow. The issue is not that the plant has too much water in its leaves. The issue is that soggy soil blocks oxygen from reaching the roots. When roots cannot breathe, they cannot absorb water properly, even though the soil is wet.

Signs of overwatering include yellow lower leaves, soft stems, slow growth, fungus gnats, and soil that stays damp for many days. If the pot has no drainage hole, that plant is basically living in a swamp with better lighting.

### What to do

Let the soil dry before watering again. Check that the pot has drainage. If the plant smells sour, the roots are mushy, or leaves are yellowing quickly, remove the plant from the pot and inspect the roots. Healthy roots are firm and light colored. Rotten roots are brown, black, soft, or slimy. Trim the rotten roots and repot into fresh, airy mix.

If the plant is also drooping, read the guide on [drooping or wilting plant leaves](/journal/why-are-my-plant-leaves-drooping-or-wilting).

## Cause 2: Underwatering

Underwatering can also cause yellow leaves, especially if the soil pulls away from the sides of the pot or becomes so dry that water runs straight through. In this case, the plant sacrifices older leaves to conserve moisture for new growth.

Signs of underwatering include crispy yellow leaves, dry soil, curling edges, lightweight pots, and stems that perk up after a deep drink.

### What to do

Give the plant a slow, thorough watering until water drains from the bottom. If the soil is hydrophobic, bottom-water the plant for 20 to 30 minutes so the root ball can rehydrate evenly. Then return to a flexible watering routine based on soil moisture, not a calendar.

## Cause 3: Not Enough Light

Low light makes plants use energy slowly. The soil stays wet longer, growth becomes weak, and older leaves may turn yellow because the plant cannot support them. This is common in winter or in rooms where the plant is technically near a window but spiritually living in a cave.

Move the plant closer to bright, indirect light. Avoid harsh midday sun for sensitive tropical plants, but do not confuse "indirect light" with "three rooms away from a window."

## Cause 4: Nutrient Deficiency

If older leaves turn evenly yellow while new leaves are smaller than usual, the plant may need nutrients. Nitrogen deficiency often shows up in older leaves first. Iron or magnesium issues can create yellowing between green veins.

Use a balanced houseplant fertilizer during the growing season. Do not fertilize a severely stressed or root-rotted plant first. Fix the roots and watering routine before feeding.

## Cause 5: Natural Aging

Sometimes a yellow leaf is just an old leaf. Plants retire leaves the way people unsubscribe from emails - quietly, one at a time, and usually for a reason. If the plant is still producing healthy new growth and only one lower leaf yellows occasionally, this is normal.

## A Simple Yellow Leaf Recovery Plan

1. Check soil moisture with your finger or a moisture meter.
2. Make sure the pot drains freely.
3. Move the plant into better bright, indirect light.
4. Remove fully yellow leaves once they are no longer green.
5. Adjust watering based on soil dryness, not a fixed schedule.
6. Watch new growth for improvement over the next two to four weeks.

## When Yellow Leaves Are Serious

Yellow leaves become urgent when they spread quickly, appear with mushy stems, come with a rotten smell, or show up alongside black spots. That combination points toward root rot or disease rather than normal leaf aging.

If the issue is mainly crispy brown edges, see [why plant leaf tips turn brown](/journal/why-are-the-tips-of-my-plant-leaves-turning-brown). If pests are involved, start with [white spots on plant leaves](/journal/white-spots-on-plant-leaves) or [fungus gnats in houseplants](/journal/how-to-get-rid-of-fungus-gnats).

## Bottom Line

Yellow leaves are not a diagnosis by themselves. They are a clue. Check the soil, light, roots, and pattern before doing anything heroic. Most plants recover once their watering and light conditions make sense again.`,
    imageUrl: "/journal/covers/why-are-my-plant-leaves-turning-yellow.jpg",
    imageAlt: "Close-up of a yellowing leaf on a green houseplant",
    category: "Yellow Leaves",
    tags: ["yellow leaves", "overwatering", "underwatering", "plant care"],
    keywords: ["yellow plant leaves", "why are my plant leaves turning yellow", "overwatered plant", "underwatered plant", "houseplant care"],
    seoPriority: 1,
    readTime: "7 min read",
    createdAt: { seconds: 1716033418 },
    publishedAt: "2024-05-18",
    updatedAt: "2024-05-18",
    faq: [
      {
        question: "What is the most common reason plant leaves turn yellow?",
        answer: "Overwatering is the most common cause. Wet soil can suffocate roots, which prevents the plant from taking up oxygen and nutrients."
      },
      {
        question: "Should I cut yellow leaves off my plant?",
        answer: "Remove fully yellow leaves if they are no longer helping the plant, but diagnose the watering, light, or nutrient issue first."
      }
    ],
    status: "published"
  },
  {
    id: "monstera-leaves-not-splitting",
    title: "Why Are My Monstera Leaves Not Splitting? Causes and Fixes",
    slug: "monstera-leaves-not-splitting",
    metaTitle: "Why Are My Monstera Leaves Not Splitting? | Soil AI",
    metaDescription: "Learn why your Monstera leaves are not splitting, why your plant has no holes, and how to encourage healthy fenestration with better light, support, and care.",
    excerpt: "If your Monstera leaves have no holes or splits, the most common reasons are young growth, low light, or the plant not being mature enough yet.",
    content: `A Monstera without splits can feel like false advertising. You bought the iconic holey leaf plant, and now it is producing polite little solid leaves like it is trying to pass as a pothos. Do not panic. Most Monsteras need age, light, and support before they produce dramatic fenestrations.

## Quick Answer

Monstera leaves usually do not split because the plant is too young, not getting enough bright indirect light, lacking climbing support, or growing under inconsistent care. New leaves can also emerge solid before the plant is mature enough to produce holes and deep cuts.

## What Fenestration Means

The splits and holes in Monstera leaves are called fenestrations. In mature plants, fenestration helps the leaf handle wind, shed heavy rain, and allow light to pass through to lower leaves. Indoors, fenestration is mostly a sign that the plant has enough energy and maturity to grow like an adult.

In other words, holes are not decoration. They are a receipt for good conditions.

## Reason 1: Your Monstera Is Too Young

Young Monsteras often grow heart-shaped leaves with no holes at all. This is normal. A baby plant does not have the root system, stem thickness, or stored energy to produce large split leaves yet.

If your Monstera is small, recently propagated, or still producing leaves under 6 inches wide, patience may be the entire care plan. Keep it healthy and let it size up.

## Reason 2: It Needs More Bright Indirect Light

Low light is the most common fixable reason for Monstera leaves not splitting. Fenestrated leaves cost energy. If the plant is sitting in dim light, it will focus on survival instead of making dramatic jungle architecture.

Place the plant near a bright window with filtered light. East-facing windows are often gentle and useful. South or west windows can work if the light is softened with a sheer curtain or the plant is pulled back from direct afternoon sun.

Signs your Monstera needs more light include long gaps between leaves, small new growth, leaning toward the window, and slow growth during the growing season.

## Reason 3: The Plant Needs Something to Climb

Monsteras are climbing aroids. In nature, they attach to trees and grow upward. Indoors, a plant allowed to sprawl sideways may stay in a juvenile growth pattern longer.

Use a moss pole, cedar plank, trellis, or sturdy stake. Tie the main stem gently, not the leaf stems. As the plant climbs, it often produces larger leaves with better fenestration.

## Reason 4: New Leaves May Look Solid at First

Fresh Monstera leaves unfurl soft, pale, and sometimes smaller than expected. The splits that are present will be visible as the leaf opens, but the leaf still needs time to harden off and darken. Do not judge a new leaf on day one. It just woke up.

## Reason 5: Inconsistent Watering or Weak Roots

A Monstera with stressed roots will not prioritize big split leaves. Overwatering, underwatering, compacted soil, and pots without drainage can all slow growth.

Use a chunky aroid mix with bark, perlite, coco coir, and a little compost or potting mix. Water when the top few inches are dry. The goal is moist roots with air around them, not mud.

If the plant is yellowing too, read [why plant leaves turn yellow](/journal/why-are-my-plant-leaves-turning-yellow). If the plant is limp, read [why plant leaves droop or wilt](/journal/why-are-my-plant-leaves-drooping-or-wilting).

## How to Encourage Split Monstera Leaves

1. Move the plant into brighter indirect light.
2. Add a moss pole or vertical support.
3. Keep watering consistent and avoid soggy soil.
4. Feed lightly during spring and summer.
5. Let the plant grow larger before expecting mature leaves.
6. Avoid chopping it repeatedly if your goal is size.

## When to Worry

No splits alone is not a crisis. Worry if the plant also has yellow leaves, black spots, mushy stems, pests, or no new growth for months during the growing season. Those signs point to a health problem, not just immaturity.

## Bottom Line

If your Monstera has no holes, it probably needs more time, more light, or more support. Give it a bright spot, a climbing structure, and steady care. The plant will not become a fenestrated masterpiece overnight, but it can get there without you staring at it judgmentally every morning.`,
    imageUrl: "/journal/covers/monstera-leaves-not-splitting.jpg",
    imageAlt: "Close-up of a variegated Monstera leaf with split fenestrations",
    category: "Monstera Care",
    tags: ["monstera", "fenestration", "no holes"],
    keywords: ["monstera leaves not splitting", "monstera no holes", "monstera fenestration", "split leaf monstera care"],
    seoPriority: 5,
    readTime: "7 min read",
    createdAt: { seconds: 1716033418 },
    publishedAt: "2024-05-18",
    updatedAt: "2024-05-18",
    faq: [
      {
        question: "Why does my Monstera have no holes?",
        answer: "The most common reasons are young growth, low light, or a plant that has not matured enough to produce fenestrated leaves."
      },
      {
        question: "How do I encourage Monstera leaves to split?",
        answer: "Give the plant bright indirect light, consistent care, and a moss pole or support so it can climb and mature."
      }
    ],
    status: "published"
  },
  {
    id: "fallback-3",
    title: "Why Are The Tips Of My Plant Leaves Turning Brown? Causes and Fixes",
    slug: "why-are-the-tips-of-my-plant-leaves-turning-brown",
    metaTitle: "Why Are My Plant Leaf Tips Turning Brown? | Soil AI",
    metaDescription: "Discover why the tips of your plant leaves are turning brown and crispy, and learn how to fix humidity, watering, and tap water issues.",
    excerpt: "Brown, crispy leaf tips usually mean your plant is begging for moisture. Let's fix your humidity and watering issues before it's too late.",
    content: `Brown leaf tips are one of the most common houseplant complaints. They are also one of the most emotionally rude problems, because the rest of the plant can look fine while every leaf edge quietly crisps like it has given up on you personally.

## Quick Answer

Plant leaf tips turn brown because the leaf edges are drying out or getting damaged faster than the plant can replace tissue. The most common causes are low humidity, inconsistent watering, mineral buildup from tap water, fertilizer burn, heat stress, or old damage that will not turn green again.

## Are Brown Tips a Big Problem?

Sometimes, no. A few brown tips on older leaves are cosmetic. The plant may be healthy overall. But if brown tips are spreading, appearing on new growth, or paired with yellow leaves, drooping, or spots, the plant is telling you the care routine needs adjustment.

Brown tissue is dead tissue. It will not heal back to green. The goal is to stop the problem from showing up on new growth.

## Cause 1: Low Humidity

Many popular houseplants come from humid tropical environments. Indoors, especially with heating or air conditioning, humidity can drop far below what plants like. Thin-leaved plants such as Calathea, Maranta, ferns, peace lilies, and some Anthuriums show this quickly as brown crispy tips.

### What to do

Use a humidifier if humidity is consistently below 40 percent. Grouping plants can help a little. Pebble trays help less than the internet wants you to believe. Misting is mostly theater; it makes you feel involved, then evaporates in minutes.

## Cause 2: Inconsistent Watering

Letting soil go bone dry, then soaking it, then forgetting again creates stress at the roots. Leaves often respond with dry brown edges or tips. This is especially common in plants that prefer evenly moist soil.

### What to do

Check the soil before watering. For many houseplants, water when the top 1 to 2 inches are dry. For succulents, wait longer. For ferns and Calatheas, avoid letting the entire root ball become desert-dry.

If the plant is also wilting, see [why plant leaves droop or wilt](/journal/why-are-my-plant-leaves-drooping-or-wilting).

## Cause 3: Tap Water Minerals

Some plants are sensitive to chlorine, fluoride, salts, or mineral buildup in tap water. Over time, these minerals collect in the soil and can burn root tips. The damage often appears at the leaf tips first.

### What to do

Flush the soil occasionally by watering deeply and letting extra water drain out. Use filtered, distilled, or rain water for sensitive plants if your tap water is hard. Avoid letting pots sit in runoff water.

## Cause 4: Too Much Fertilizer

Fertilizer is useful in the right amount and obnoxious in excess. Too much fertilizer creates salt buildup that damages roots and causes brown tips or edges.

### What to do

Stop fertilizing for a few weeks. Flush the soil. When growth resumes, feed at half strength during the growing season. Never fertilize a plant that is severely dehydrated or actively dealing with root rot.

## Cause 5: Heat, Sun, or Draft Stress

Direct afternoon sun can scorch leaves. Hot radiators, cold drafts, and air vents can dry leaf edges. If brown patches appear on the side facing a window or heat source, location may be the problem.

Move the plant away from direct blasts of air and harsh heat. Give bright, indirect light unless the plant specifically wants full sun.

## Should You Cut Off Brown Tips?

Yes, if they bother you. Use clean scissors and trim along the natural shape of the leaf, leaving a tiny border of brown tissue so you do not cut into healthy green tissue. This is cosmetic, not a cure. If the cause remains, new tips will brown too.

## Brown Tips vs Brown Spots

Brown tips usually start at the very end or edge of the leaf and feel dry. Brown spots can be fungal, bacterial, pest-related, or sunburn. If you see white fuzzy patches, sticky residue, or moving pests, check [white spots on plant leaves](/journal/white-spots-on-plant-leaves).

## Bottom Line

Brown tips usually mean the plant is experiencing water stress, air stress, or mineral stress. Improve humidity, stabilize watering, flush the soil, and protect the plant from harsh drafts or heat. The old brown parts will not recover, but the new growth should look better.`,
    imageUrl: "/journal/covers/why-are-the-tips-of-my-plant-leaves-turning-brown.jpg",
    imageAlt: "A houseplant leaf with dry brown edges and crispy tips",
    category: "Brown Spots",
    tags: ["brown tips", "crispy leaves", "humidity", "watering"],
    keywords: ["brown leaf tips", "crispy plant leaves", "brown tips on houseplants", "low humidity plants", "tap water leaf burn"],
    seoPriority: 2,
    readTime: "7 min read",
    createdAt: { seconds: 1716033418 },
    publishedAt: "2024-05-18",
    updatedAt: "2024-05-18",
    faq: [
      {
        question: "Why are the tips of my plant leaves brown and crispy?",
        answer: "Low humidity, inconsistent watering, and mineral buildup from tap water are common causes of brown, crispy leaf tips."
      },
      {
        question: "Can brown leaf tips turn green again?",
        answer: "No. Brown tissue will not recover, but fixing the cause can keep new growth healthy."
      }
    ],
    status: "published"
  },
  {
    id: "why-are-my-plant-leaves-drooping-or-wilting",
    title: "Why Are My Plant Leaves Drooping or Wilting? Causes and Fixes",
    slug: "why-are-my-plant-leaves-drooping-or-wilting",
    metaTitle: "Why Are My Plant Leaves Drooping or Wilting? | Soil AI",
    metaDescription: "Learn why your plant leaves are drooping or wilting and how to diagnose the issue. Discover whether your plant needs water, has root rot, or is stressed by temperature changes.",
    excerpt: "Drooping leaves are a classic sign of plant stress. The most common culprit is underwatering, but surprisingly, overwatering can cause the exact same symptom.",
    content: `Drooping leaves look simple, but they are sneaky. A thirsty plant droops. An overwatered plant can also droop. A plant with root rot droops. A plant near a cold window droops. Very helpful, plant. Thank you for the one symptom with twelve possible meanings.

## Quick Answer

Plant leaves droop when the plant loses turgor pressure, which is the internal water pressure that keeps leaves and stems firm. The most common causes are underwatering, overwatering, root rot, temperature shock, transplant shock, or heat stress. Always check the soil before watering a drooping plant.

## Step 1: Check the Soil

This is the fork in the road.

- **Dry soil plus drooping leaves:** The plant probably needs water.
- **Wet soil plus drooping leaves:** The roots may be suffocating or rotting.
- **Slightly moist soil plus sudden droop:** Look for heat, cold, pests, or transplant shock.

Do not water automatically. If the soil is already wet, adding more water is not care. It is escalation.

## Cause 1: Underwatering

When soil gets too dry, roots cannot supply enough water to the leaves. The leaves lose pressure and hang down. They may feel thin, soft, papery, or slightly curled. The pot may feel unusually light.

### What to do

Water slowly until water drains from the bottom. If the soil has become hydrophobic and water runs straight through, bottom-water the pot for 20 to 30 minutes. After that, let excess water drain completely.

Most underwatered plants perk up within a few hours. If they do not, the roots may be damaged or the soil may not have absorbed water evenly.

## Cause 2: Overwatering

Overwatering can create the same drooping symptom as underwatering, which feels like a design flaw. When soil stays saturated, roots lose oxygen. Damaged roots cannot absorb water, so the plant wilts even while sitting in wet soil.

Signs include yellow lower leaves, heavy wet potting mix, a sour smell, fungus gnats, and soft stems. If yellowing is part of the problem, read [why plant leaves turn yellow](/journal/why-are-my-plant-leaves-turning-yellow).

### What to do

Let the soil dry. Check drainage. If the plant is declining quickly, remove it from the pot and inspect the roots. Trim black or mushy roots and repot into fresh, airy soil.

## Cause 3: Root Rot

Root rot is advanced overwatering with consequences. Healthy roots are firm. Rotten roots are dark, soft, slimy, and may smell bad. Once roots rot, the plant cannot hydrate itself properly, even if the soil is wet.

### What to do

Take the plant out of the pot, rinse or shake away old soil, remove rotten roots with sterile scissors, and repot in fresh mix. Use a pot with drainage. Water lightly after repotting and keep the plant in bright indirect light while it recovers.

## Cause 4: Temperature Shock

Plants can droop after sudden exposure to cold drafts, hot radiators, air conditioning, or direct intense sun. Tropical houseplants especially dislike abrupt temperature swings.

Move the plant away from vents, doors, heaters, and cold glass. Recovery can take a day or several days depending on damage.

## Cause 5: Transplant Shock

If your plant drooped right after repotting, the roots were disturbed. This is common. The plant is not being dramatic for no reason; it is being dramatic because you rearranged its entire underground life.

Keep the soil lightly moist, avoid fertilizer for a few weeks, and give bright indirect light. Do not keep repotting to fix repotting shock.

## Recovery Checklist

1. Check soil moisture.
2. Water only if the soil is actually dry.
3. If soil is wet, improve drainage and inspect roots if needed.
4. Move the plant away from heat, cold, and direct harsh sun.
5. Avoid fertilizer until the plant is stable.
6. Watch new growth, not just damaged old leaves.

## Bottom Line

Drooping leaves are a symptom, not a command to water. Dry soil means water. Wet soil means stop, inspect, and think. Once you identify which side of the moisture problem you are on, recovery becomes much easier.`,
    imageUrl: "/journal/covers/why-are-my-plant-leaves-drooping-or-wilting.jpg",
    imageAlt: "A wilting houseplant with drooping leaves on a windowsill",
    category: "Drooping",
    tags: ["drooping", "wilting", "underwatering", "overwatering"],
    keywords: ["drooping plant leaves", "wilting houseplant", "plant leaves drooping", "underwatered plant", "root rot symptoms"],
    seoPriority: 3,
    readTime: "7 min read",
    createdAt: { seconds: 1716033418 },
    publishedAt: "2024-05-18",
    updatedAt: "2024-05-18",
    faq: [
      {
        question: "Do drooping leaves always mean a plant needs water?",
        answer: "No. Both underwatering and overwatering can cause drooping leaves, so check soil moisture before watering again."
      },
      {
        question: "How fast can a drooping plant recover?",
        answer: "A thirsty plant may perk up within hours after watering, but root rot or temperature shock can take longer to recover."
      }
    ],
    status: "published"
  },
  {
    id: "how-to-get-rid-of-fungus-gnats",
    title: "How to Get Rid of Fungus Gnats in Houseplants: A Complete Care Guide",
    slug: "how-to-get-rid-of-fungus-gnats",
    metaTitle: "How to Get Rid of Fungus Gnats in Houseplants | Soil AI",
    metaDescription: "Fungus gnats flying around your plants? Learn effective ways to eradicate fungus gnats, their larvae, and prevent future infestations in your houseplants.",
    excerpt: "Those tiny black flies buzzing around your face when you water your plants are fungus gnats. They are annoying, but their larvae are the real danger to your plant's roots.",
    content: `Fungus gnats are the tiny black flies that appear around houseplants and make your home feel like a badly managed produce aisle. The adults are annoying, but the larvae in moist soil are the real problem. They feed on fungus, organic matter, and sometimes tender roots.

## Quick Answer

To get rid of fungus gnats, let the top 1 to 2 inches of soil dry out, use yellow sticky traps for adult gnats, and treat the soil larvae with BTI mosquito bits or another larval control. The key is treating adults and larvae at the same time.

## How to Identify Fungus Gnats

Fungus gnats are small, dark flies, usually about 1/8 inch long. They look like tiny mosquitoes but are weaker fliers. You will often see them crawl on the soil surface, fly up when you water, or hover near windows.

They are different from fruit flies. Fruit flies usually gather around fruit, drains, or food waste. Fungus gnats stay close to damp potting soil because that is where they lay eggs.

## Why Fungus Gnats Show Up

Fungus gnats love consistently moist soil. If you water often, use dense potting mix, keep plants in pots without drainage, or have decaying organic matter on the soil surface, you are basically running a small gnat resort.

They are also a clue that your watering routine may be too wet. If the plant has yellow leaves too, check [why plant leaves turn yellow](/journal/why-are-my-plant-leaves-turning-yellow).

## Step 1: Let the Top Soil Dry

The simplest control is dryness. Fungus gnat larvae need moisture near the soil surface. Let the top 1 to 2 inches dry before watering again. For plants that can tolerate it, extend the dry period a little longer.

Do not dry out moisture-loving plants completely. The goal is to make the egg-laying zone less comfortable, not punish the roots.

## Step 2: Use Yellow Sticky Traps

Yellow sticky traps catch adult gnats before they lay more eggs. Place them close to the soil surface, not across the room like decorative modern art. Replace them when they are covered or dusty.

Traps alone will not solve the problem because they do not kill larvae. They are a monitoring tool and an adult-control tool.

## Step 3: Treat Larvae with BTI

BTI, commonly sold as mosquito bits or mosquito dunks, targets larvae and is widely used for fungus gnat control. Soak the bits in water according to the product directions, then water the affected plants with the treated water.

Repeat weekly for several weeks. Fungus gnats have a life cycle, so one treatment may not catch every generation.

## Step 4: Improve Drainage

Dense, soggy soil keeps the problem alive. If the potting mix stays wet for a week or more, consider adding perlite, bark, or pumice. Make sure the pot has drainage holes and never let the plant sit in standing water.

Bottom watering can help because it keeps the top layer drier while still hydrating roots from below.

## Step 5: Clean the Soil Surface

Remove dead leaves, fallen petals, and decaying debris from the pot. Fungus gnats feed on organic decay, so do not give them a buffet.

If the infestation is heavy, replace the top inch of potting mix with fresh, dry mix after treatment.

## What Not to Do

Do not spray random insecticide into the air and call it plant care. Do not keep watering daily. Do not ignore the larvae. Do not cover every plant with sand unless the plant can tolerate the change in soil airflow and moisture behavior.

## How Long Does It Take?

Most fungus gnat infestations improve within two to four weeks if you treat both adults and larvae. If they keep returning, the soil is staying too wet or untreated plants nearby are acting as a backup population.

## Bottom Line

Fungus gnats are not a sign that you are cursed. They are usually a sign of wet soil. Dry the top layer, trap adults, treat larvae, and improve drainage. Do all four at once and the population should collapse.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sciara_hemerobioides_-_Flickr_-_gailhampshire.jpg/960px-Sciara_hemerobioides_-_Flickr_-_gailhampshire.jpg",
    imageAlt: "A houseplant pot with yellow sticky traps used to catch fungus gnats",
    category: "Pest Guidelines",
    tags: ["fungus gnats", "pests", "soil", "insects"],
    keywords: ["fungus gnats", "get rid of fungus gnats", "yellow sticky traps", "houseplant pests", "fungus gnat larvae"],
    seoPriority: 4,
    readTime: "8 min read",
    createdAt: { seconds: 1716033418 },
    publishedAt: "2024-05-18",
    updatedAt: "2024-05-18",
    faq: [
      {
        question: "What is the fastest way to reduce fungus gnats?",
        answer: "Let the top layer of soil dry out and use yellow sticky traps to catch adults while treating larvae in the soil."
      },
      {
        question: "Do fungus gnats harm houseplants?",
        answer: "Adult gnats are mostly annoying, but larvae can damage young roots when infestations are heavy."
      }
    ],
    status: "published"
  },
  {
    id: "white-spots-on-plant-leaves",
    title: "White Spots on Plant Leaves: Powdery Mildew or Mealybugs?",
    slug: "white-spots-on-plant-leaves",
    metaTitle: "White Spots on Plant Leaves: Powdery Mildew or Mealybugs? | Soil AI",
    metaDescription: "Find out what those fuzzy white spots on your plant leaves are. Learn how to identify, treat, and prevent powdery mildew and mealybug infestations.",
    excerpt: "Noticed white, powdery, or fuzzy spots on your plant's leaves? You're likely dealing with one of two common houseplant problems: powdery mildew or a mealybug infestation.",
    content: `White spots on plant leaves can mean very different things. Sometimes it is powdery mildew, a fungal disease that looks like dust. Sometimes it is mealybugs, a pest that looks like tiny bits of cotton. Sometimes it is mineral residue from water. The treatment depends on identifying the culprit correctly.

## Quick Answer

If white spots look flat, dusty, and spread across the leaf surface, suspect powdery mildew. If they look fuzzy, cottony, or clustered around stems and leaf joints, suspect mealybugs. If the marks wipe away cleanly and appear after misting or watering, they may be mineral residue.

## First Test: Does It Wipe Off?

Use a damp cloth or cotton swab on a small area.

- **Dusty coating that smears:** likely powdery mildew.
- **Cottony clumps in crevices:** likely mealybugs.
- **Hard pale spots that do not move:** possible mineral marks, edema, or physical damage.
- **Sticky residue nearby:** often pests.

Do this gently. The goal is diagnosis, not leaf exfoliation.

## Suspect 1: Powdery Mildew

Powdery mildew looks like a fine white or gray powder on leaves and stems. It often starts as small circular patches and spreads when air circulation is poor.

### Why it happens

Powdery mildew likes crowded plants, stagnant air, and moderate humidity. It can appear when foliage stays damp or when plants are packed together with little airflow.

### How to treat it

1. Isolate the plant.
2. Remove badly affected leaves.
3. Improve airflow around the plant.
4. Avoid wetting the leaves when watering.
5. Use a houseplant-safe fungicide or neem-based treatment according to label directions.

Do not compost infected leaves indoors. Throw them away.

## Suspect 2: Mealybugs

Mealybugs look like tiny white cottony insects. They hide along stems, leaf joints, undersides of leaves, and new growth. They feed on plant sap and can cause yellowing, weak growth, leaf drop, and sticky honeydew.

### How to treat mealybugs

1. Isolate the plant immediately.
2. Dip a cotton swab in 70 percent isopropyl alcohol and touch visible mealybugs.
3. Wipe stems and leaf joints carefully.
4. Spray with insecticidal soap or neem oil if the plant tolerates it.
5. Repeat every few days until no new bugs appear.

Mealybugs are persistent. One treatment is usually not enough. They are the unpaid interns of plant pests: small, numerous, and somehow everywhere.

## Suspect 3: Mineral Residue

If white marks appear after misting or overhead watering, they may be mineral deposits from hard water. These spots usually sit on top of the leaf and wipe away with a damp cloth.

### What to do

Stop misting with hard tap water. Wipe leaves gently. Use filtered or distilled water for sensitive plants if residue keeps returning.

## When White Spots Are a Bigger Warning

White spots become more serious if the plant also has yellow leaves, webbing, sticky residue, leaf distortion, or insects you can see moving. Yellowing can point to root stress too, so check [why plant leaves turn yellow](/journal/why-are-my-plant-leaves-turning-yellow) if multiple symptoms appear.

If you see tiny flying insects around the soil instead of white leaf patches, read [how to get rid of fungus gnats](/journal/how-to-get-rid-of-fungus-gnats).

## Prevention

Keep leaves clean, avoid crowding plants, inspect new plants before placing them near your collection, and quarantine suspicious plants for a couple of weeks. Good airflow and early inspection prevent most white-spot disasters from becoming full-houseplant drama.

## Bottom Line

White spots are not one diagnosis. Powdery mildew is dusty and flat. Mealybugs are fuzzy and hide in crevices. Mineral residue wipes away. Identify the texture and location first, then treat the correct problem.`,
    imageUrl: "/journal/covers/white-spots-on-plant-leaves.jpg",
    imageAlt: "Close-up of a white mealybug pest on a green plant leaf",
    category: "Other Guides",
    tags: ["white spots", "mealybugs", "powdery mildew", "pests", "disease"],
    keywords: ["white spots on plant leaves", "mealybugs on plants", "powdery mildew houseplants", "plant leaf disease", "houseplant pests"],
    seoPriority: 6,
    readTime: "7 min read",
    createdAt: { seconds: 1716033418 },
    publishedAt: "2024-05-18",
    updatedAt: "2024-05-18",
    faq: [
      {
        question: "How can I tell mealybugs from powdery mildew?",
        answer: "Powdery mildew looks flat and dusty on the leaf surface. Mealybugs look cottony and usually hide in leaf joints, stems, and undersides."
      },
      {
        question: "Should I isolate a plant with white spots?",
        answer: "Yes. Isolate the plant until you know whether the issue is a pest or fungal disease, because both can spread."
      }
    ],
    status: "published"
  },
  {
    id: "how-to-save-a-plant-from-root-rot",
    title: "How to Save a Plant from Root Rot: Signs, Treatment, and Recovery",
    slug: "how-to-save-a-plant-from-root-rot",
    metaTitle: "How to Save a Plant from Root Rot | Soil AI",
    metaDescription: "Learn how to identify root rot, trim rotten roots, repot safely, and help an overwatered houseplant recover.",
    excerpt: "Root rot is what happens when good intentions and too much water team up against your plant. Here is how to spot it early and rescue the roots.",
    content: `Root rot is one of the most serious houseplant problems because it attacks the part of the plant you cannot see. By the time leaves turn yellow, stems soften, or the plant droops, the roots may already be struggling underground.

## Quick Answer

To save a plant from root rot, remove it from the pot, trim black or mushy roots, discard soggy soil, repot in fresh airy mix, and water carefully while it recovers. The earlier you act, the better the chances.

## Signs of Root Rot

Root rot often starts with symptoms that look like other problems. Watch for yellow lower leaves, drooping even when soil is wet, black spots, mushy stems, slow growth, fungus gnats, and a sour smell from the pot.

Healthy roots are firm and usually white, tan, or light brown. Rotten roots are soft, dark, slimy, hollow, or smelly. If the roots look like wet noodles with regrets, that is your answer.

## Why Root Rot Happens

Root rot usually comes from soil staying wet too long. Common causes include overwatering, dense potting mix, pots without drainage holes, oversized pots, and low light that slows water use.

## How to Treat Root Rot

1. Remove the plant from its pot.
2. Brush away wet soil from the roots.
3. Cut off soft, black, or smelly roots with clean scissors.
4. Remove badly damaged leaves so the plant has less to support.
5. Repot in fresh, chunky potting mix.
6. Use a pot with drainage.
7. Water lightly and place in bright indirect light.

Do not fertilize immediately. A recovering root system needs oxygen and stability before food.

## Recovery Timeline

Mild cases may stabilize in two to four weeks. Severe cases can take months. Judge recovery by new growth, firmer stems, and soil drying normally between waterings.

## How to Prevent It

Water only when the plant actually needs it. Improve light. Use airy soil with perlite, bark, or pumice. Empty saucers after watering. If you are unsure whether to water, wait another day.

For related symptoms, see [yellow leaves](/journal/why-are-my-plant-leaves-turning-yellow) and [drooping plant leaves](/journal/why-are-my-plant-leaves-drooping-or-wilting).`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Prei_papiervlekkenziekte_Phytophthora_porri_on_Allium_porrum.jpg/960px-Prei_papiervlekkenziekte_Phytophthora_porri_on_Allium_porrum.jpg",
    imageAlt: "A stressed potted houseplant that may be suffering from root rot",
    category: "Root Rot",
    tags: ["root rot", "overwatering", "roots", "repotting"],
    keywords: ["how to save a plant from root rot", "root rot houseplant", "rotten roots", "overwatered plant roots"],
    seoPriority: 7,
    readTime: "6 min read",
    createdAt: { seconds: 1716120000 },
    publishedAt: "2024-05-19",
    updatedAt: "2024-05-19",
    faq: [
      {
        question: "Can a plant recover from root rot?",
        answer: "Yes, if enough healthy roots remain. Remove rotten roots, repot in fresh soil, and keep watering light while the plant recovers."
      },
      {
        question: "Should I water after repotting a plant with root rot?",
        answer: "Water lightly only if the fresh mix is dry. Avoid soaking the plant again immediately after trimming rotten roots."
      }
    ],
    status: "published"
  },
  {
    id: "overwatered-plant-signs-and-fixes",
    title: "Overwatered Plant: Signs, Fixes, and What to Do Next",
    slug: "overwatered-plant-signs-and-fixes",
    metaTitle: "Overwatered Plant Signs and Fixes | Soil AI",
    metaDescription: "Learn the signs of an overwatered plant and how to dry, repot, and recover a houseplant before root rot takes over.",
    excerpt: "Overwatering does not look like too much water in the leaves. It looks like roots running out of oxygen. Here is how to catch it early.",
    content: `An overwatered plant is not a plant that received love. It is a plant whose roots are sitting in soil that stays wet too long. Roots need oxygen. When the potting mix turns into a swamp, the plant starts declining even though you technically watered it.

## Quick Answer

Signs of an overwatered plant include yellow lower leaves, wet soil, drooping, soft stems, fungus gnats, slow growth, and a sour smell. Stop watering, improve drainage, increase light, and inspect the roots if the plant is getting worse.

## Common Signs

- Soil stays wet for many days
- Leaves turn yellow from the bottom
- Leaves droop even though soil is damp
- Stems feel soft or mushy
- New growth is weak
- Fungus gnats appear
- The pot smells sour

If the plant is yellowing, read [why plant leaves turn yellow](/journal/why-are-my-plant-leaves-turning-yellow). If it is drooping, read [drooping and wilting leaves](/journal/why-are-my-plant-leaves-drooping-or-wilting).

## What to Do First

Stop watering. Move the plant to brighter indirect light. Make sure the pot has drainage holes. Empty any water sitting in the saucer or decorative cachepot.

If the soil is only slightly too wet, time and better airflow may be enough.

## When to Repot

Repot if the soil smells bad, stems are mushy, leaves are yellowing quickly, or the plant keeps drooping in wet soil. Remove old wet mix, trim rotten roots, and repot into fresh airy soil.

## Prevention

Water based on soil dryness, not a schedule. Use a pot that fits the root ball. Oversized pots hold extra moisture and make overwatering easier. Dense soil also dries slowly, so add perlite, bark, or pumice for airflow.

## Bottom Line

Overwatering is really an oxygen problem. Give roots air, drainage, and time. Your plant does not need more water right now. It needs you to put the watering can down.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/AlbinoPopcorn.jpg/960px-AlbinoPopcorn.jpg",
    imageAlt: "A yellowing houseplant leaf showing stress from possible overwatering",
    category: "Watering",
    tags: ["overwatering", "yellow leaves", "root rot", "watering"],
    keywords: ["overwatered plant", "signs of overwatering", "how to fix overwatered plant", "wet soil houseplant"],
    seoPriority: 8,
    readTime: "5 min read",
    createdAt: { seconds: 1716206400 },
    publishedAt: "2024-05-20",
    updatedAt: "2024-05-20",
    faq: [
      {
        question: "How long does it take an overwatered plant to recover?",
        answer: "Mild overwatering may improve in one to three weeks. Root rot cases can take longer and may require repotting."
      },
      {
        question: "Should I put an overwatered plant in the sun?",
        answer: "Use bright indirect light, not harsh direct sun. Strong sun can stress a weakened plant even more."
      }
    ],
    status: "published"
  },
  {
    id: "underwatered-plant-signs-and-recovery",
    title: "Underwatered Plant: Signs, Recovery, and How to Rehydrate Soil",
    slug: "underwatered-plant-signs-and-recovery",
    metaTitle: "Underwatered Plant Signs and Recovery | Soil AI",
    metaDescription: "Find out how to identify an underwatered plant, rehydrate dry soil, and prevent crispy leaves from coming back.",
    excerpt: "Dry soil, crispy leaves, and dramatic drooping usually mean your plant is thirsty. But rehydrating it correctly matters.",
    content: `An underwatered plant is usually easier to rescue than an overwatered one, but it still needs care. Dumping water through bone-dry soil can fail because dry potting mix sometimes repels water.

## Quick Answer

Signs of underwatering include dry soil, lightweight pots, crispy leaf edges, curling leaves, drooping that improves after watering, and soil pulling away from the pot. Rehydrate slowly and water thoroughly.

## Signs Your Plant Is Too Dry

The pot feels light. The soil is dusty or compact. Leaves may curl, droop, crisp at the tips, or turn yellow and brown. Some plants recover quickly after watering; others lose older leaves.

## How to Rehydrate Dry Soil

Water slowly until moisture starts absorbing instead of running down the sides. If water rushes through instantly, bottom-water the plant for 20 to 30 minutes. Let the pot drain after soaking.

Do not leave the plant sitting in water all day. The goal is rehydration, not a new overwatering problem.

## Why Soil Becomes Hydrophobic

Peat-based mixes can repel water when completely dry. Once that happens, a normal watering may not reach the roots. This is why a plant can look thirsty even after you watered it.

## Prevention

Check soil moisture regularly. Plants in bright light, small pots, terracotta pots, or warm rooms dry faster. Adjust by season. Summer watering and winter watering are not the same job.

If crispy tips are the main symptom, see [brown leaf tips](/journal/why-are-the-tips-of-my-plant-leaves-turning-brown).

## Bottom Line

An underwatered plant needs a full, even drink. Rehydrate the soil, let excess water drain, and then build a watering rhythm based on the plant's actual drying speed.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Orkide_i_finstua_mot_vest.jpg/960px-Orkide_i_finstua_mot_vest.jpg",
    imageAlt: "A dry houseplant leaf with brown crispy edges",
    category: "Watering",
    tags: ["underwatering", "crispy leaves", "watering", "dry soil"],
    keywords: ["underwatered plant", "how to revive dry plant", "dry soil houseplant", "crispy leaves underwatering"],
    seoPriority: 9,
    readTime: "5 min read",
    createdAt: { seconds: 1716292800 },
    publishedAt: "2024-05-21",
    updatedAt: "2024-05-21",
    faq: [
      {
        question: "Can an underwatered plant recover?",
        answer: "Yes, if stems and roots are still alive. Rehydrate the soil slowly and trim fully dead leaves."
      },
      {
        question: "Why does water run straight through my plant soil?",
        answer: "Very dry soil can become hydrophobic, meaning it repels water. Bottom-watering can help the root ball absorb moisture again."
      }
    ],
    status: "published"
  },
  {
    id: "how-often-should-i-water-houseplants",
    title: "How Often Should I Water Houseplants? A No-Nonsense Guide",
    slug: "how-often-should-i-water-houseplants",
    metaTitle: "How Often Should I Water Houseplants? | Soil AI",
    metaDescription: "Learn how often to water houseplants based on soil, light, pot size, season, and plant type instead of a rigid schedule.",
    excerpt: "The honest answer is: not every Saturday. Here is how to water based on what the plant and soil are actually doing.",
    content: `The worst watering advice is also the most common: water once a week. Some plants need water twice a week. Some need water every three weeks. The calendar does not know your pot size, light level, soil mix, or season.

## Quick Answer

Water houseplants when the soil dryness matches the plant's needs. Most common tropical plants prefer the top 1 to 2 inches of soil to dry before watering. Succulents and snake plants need more drying time. Ferns and Calatheas prefer more consistent moisture.

## What Changes Watering Frequency

Bright light makes plants use water faster. Low light keeps soil wet longer. Small pots dry faster than large pots. Terracotta dries faster than plastic. Chunky soil dries faster than dense soil. Winter growth is slower, so plants usually need less water.

## A Better Watering Method

Touch the soil. Lift the pot. Look at leaf texture. Use a moisture meter if it helps, but do not let a cheap meter overrule obvious wet soil.

When you water, water thoroughly until excess drains out. Shallow sips create weak roots and uneven moisture.

## General Starting Points

- Tropical foliage plants: water when the top 1 to 2 inches dry.
- Snake plants and succulents: let most of the soil dry.
- Ferns: keep lightly moist, not soggy.
- Calatheas: avoid bone-dry soil but never leave them sitting in water.

## Signs You Are Watering Too Often

Yellow leaves, fungus gnats, wet soil, drooping in damp soil, and sour smells.

## Signs You Are Waiting Too Long

Crispy tips, curling leaves, very light pots, dry soil pulling from the pot, and drooping that improves after watering.

## Bottom Line

Watering is not a weekly ritual. It is a response to soil, light, roots, and season. Your plant does not care what day it is. It cares whether its roots can drink and breathe.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/07/Aglaonema_commutatum2.jpg",
    imageAlt: "A houseplant leaf used to illustrate watering stress",
    category: "Watering",
    tags: ["watering", "houseplant care", "overwatering", "underwatering"],
    keywords: ["how often should I water houseplants", "houseplant watering schedule", "when to water plants", "watering indoor plants"],
    seoPriority: 10,
    readTime: "6 min read",
    createdAt: { seconds: 1716379200 },
    publishedAt: "2024-05-22",
    updatedAt: "2024-05-22",
    faq: [
      {
        question: "Is watering once a week good for houseplants?",
        answer: "It can work for some plants, but it is not reliable. Soil dryness, light, pot size, and season matter more than the calendar."
      },
      {
        question: "Should I water from the top or bottom?",
        answer: "Top watering is fine for most plants. Bottom watering helps when soil is very dry or when you want to keep the soil surface drier."
      }
    ],
    status: "published"
  },
  {
    id: "why-is-my-plant-losing-leaves",
    title: "Why Is My Plant Losing Leaves? Common Causes and Fixes",
    slug: "why-is-my-plant-losing-leaves",
    metaTitle: "Why Is My Plant Losing Leaves? | Soil AI",
    metaDescription: "Learn why houseplants drop leaves from watering stress, low light, shock, pests, temperature changes, and natural aging.",
    excerpt: "Leaf drop can be normal, but sudden leaf loss means your plant is reacting to stress. Here is how to tell the difference.",
    content: `A plant dropping one old leaf is normal. A plant dropping leaves like it just heard bad news is not. Leaf loss is a general stress signal, so the pattern matters.

## Quick Answer

Plants lose leaves because of watering stress, low light, temperature shock, transplant shock, pests, or natural aging. Sudden leaf drop usually means a recent change upset the plant.

## Normal Leaf Drop

Older lower leaves naturally die as plants grow. If the plant is producing healthy new growth and only drops an old leaf occasionally, do not start a rescue mission.

## Watering Stress

Both overwatering and underwatering can cause leaf drop. Wet soil plus yellowing points toward overwatering. Dry soil plus crispy leaves points toward underwatering.

## Low Light

In low light, plants cannot support as much foliage. They may drop older leaves to conserve energy. Move the plant closer to a bright window, but avoid sudden harsh direct sun.

## Shock

Repotting, moving homes, cold drafts, heat blasts, or a new location can trigger leaf drop. Keep conditions stable and give the plant time.

## Pests

Sticky residue, white fuzz, webbing, or speckled leaves can signal pests. Check stems, leaf undersides, and new growth.

## What to Do

Check soil moisture, inspect leaves and stems, review recent changes, and improve light if needed. Avoid changing five things at once. Plants appreciate care, not chaos.

## Bottom Line

Leaf drop is a clue. Match the timing and pattern to watering, light, shock, or pests before deciding what to fix.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Myris_fragr_Fr_080112-3294_ltn.jpg/960px-Myris_fragr_Fr_080112-3294_ltn.jpg",
    imageAlt: "A stressed houseplant leaf showing dry damaged tissue",
    category: "Leaf Problems",
    tags: ["leaf drop", "leaves falling off", "plant stress", "houseplant care"],
    keywords: ["why is my plant losing leaves", "plant leaves falling off", "houseplant dropping leaves", "leaf drop causes"],
    seoPriority: 11,
    readTime: "5 min read",
    createdAt: { seconds: 1716465600 },
    publishedAt: "2024-05-23",
    updatedAt: "2024-05-23",
    faq: [
      {
        question: "Is it normal for houseplants to lose leaves?",
        answer: "Occasional old leaf drop is normal. Sudden or heavy leaf loss usually means stress."
      },
      {
        question: "Can leaves grow back after falling off?",
        answer: "Individual fallen leaves do not reattach, but healthy plants can grow new leaves when conditions improve."
      }
    ],
    status: "published"
  },
  {
    id: "why-are-my-plant-leaves-curling",
    title: "Why Are My Plant Leaves Curling? Causes and Fixes",
    slug: "why-are-my-plant-leaves-curling",
    metaTitle: "Why Are My Plant Leaves Curling? | Soil AI",
    metaDescription: "Find out why plant leaves curl from underwatering, heat, pests, low humidity, overwatering, or light stress.",
    excerpt: "Curling leaves are your plant trying to reduce stress. The trick is figuring out which stress it picked today.",
    content: `Curling leaves are a plant's way of saying something is off. Leaves may curl inward, cup upward, roll under, or twist. Each pattern gives clues, but the usual suspects are water, heat, pests, and humidity.

## Quick Answer

Plant leaves curl because of underwatering, heat stress, low humidity, pests, overwatering, or too much direct sun. Check soil moisture first, then inspect leaf undersides for pests.

## Dry Soil and Curling

When soil is too dry, leaves curl to reduce water loss. They may feel thin, crispy, or limp. Water thoroughly and check whether the plant improves within a day.

## Heat or Sun Stress

Leaves can curl in strong direct light or near heat sources. Move the plant into bright indirect light and away from vents or radiators.

## Low Humidity

Calatheas, ferns, and other thin-leaved tropical plants often curl in dry air. Increase humidity with a humidifier and keep watering consistent.

## Pests

Spider mites, thrips, and aphids can cause curling or distorted new growth. Look under leaves and along stems. Fine webbing or speckled leaves often means mites.

## Overwatering

Wet soil can damage roots, which makes leaves curl, yellow, or droop because the plant cannot absorb water properly.

## Bottom Line

Curling leaves are not random. Start with soil moisture, then check heat, humidity, and pests. The leaf shape is the clue; the roots and environment are usually the cause.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/R-3VAR1.JPG",
    imageAlt: "A houseplant leaf curling and yellowing from stress",
    category: "Leaf Problems",
    tags: ["curling leaves", "underwatering", "humidity", "pests"],
    keywords: ["why are my plant leaves curling", "curling houseplant leaves", "leaves curling inward", "plant leaf curl"],
    seoPriority: 12,
    readTime: "5 min read",
    createdAt: { seconds: 1716552000 },
    publishedAt: "2024-05-24",
    updatedAt: "2024-05-24",
    faq: [
      {
        question: "Do curling leaves mean underwatering?",
        answer: "Often, but not always. Curling can also come from heat, low humidity, pests, or root stress."
      },
      {
        question: "Will curled leaves uncurl?",
        answer: "Mild curling may improve. Damaged or hardened leaves may stay curled, but new growth should look better."
      }
    ],
    status: "published"
  },
  {
    id: "black-spots-on-plant-leaves",
    title: "Black Spots on Plant Leaves: Disease, Overwatering, or Sunburn?",
    slug: "black-spots-on-plant-leaves",
    metaTitle: "Black Spots on Plant Leaves: Causes and Fixes | Soil AI",
    metaDescription: "Learn what black spots on plant leaves mean and how to tell fungal disease, bacterial spots, overwatering, and sun damage apart.",
    excerpt: "Black spots are not a vibe. They usually mean moisture, disease, or damaged tissue. Here is how to narrow it down.",
    content: `Black spots on leaves can come from fungal disease, bacterial infection, overwatering, cold damage, or sunburn. The location and texture of the spots matter.

## Quick Answer

Black spots on plant leaves often mean leaf disease or water-related stress. Isolate the plant, remove badly affected leaves, avoid wetting foliage, improve airflow, and check roots if the soil is staying wet.

## Fungal or Bacterial Spots

Disease spots often spread, develop yellow halos, or appear after leaves stay wet. Remove affected leaves and keep the foliage dry. Increase airflow around the plant.

## Overwatering

Wet roots can cause leaf tissue to die, especially if the plant is already stressed. If black spots appear with yellow leaves or drooping, inspect watering and roots.

## Sunburn or Cold Damage

Black patches that appear after direct sun or cold exposure may be environmental damage. Move the plant to stable bright indirect light.

## What to Do

Isolate the plant. Cut off severely affected leaves. Clean scissors between cuts. Keep water off the leaves. Check for pests and root problems.

## Bottom Line

Black spots need quick attention because they can spread. Treat the plant like a small investigation: leaves, roots, water, airflow, and recent changes.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Ficus_elastica_leaves_02.JPG/960px-Ficus_elastica_leaves_02.JPG",
    imageAlt: "A close-up plant leaf image used to illustrate leaf disease and spots",
    category: "Leaf Problems",
    tags: ["black spots", "leaf spots", "disease", "overwatering"],
    keywords: ["black spots on plant leaves", "plant leaf disease", "fungal leaf spots", "black leaf spots houseplant"],
    seoPriority: 13,
    readTime: "5 min read",
    createdAt: { seconds: 1716638400 },
    publishedAt: "2024-05-25",
    updatedAt: "2024-05-25",
    faq: [
      {
        question: "Should I cut off leaves with black spots?",
        answer: "Remove badly affected leaves, especially if spots are spreading or look diseased."
      },
      {
        question: "Are black spots contagious to other plants?",
        answer: "Some fungal and bacterial leaf spots can spread, so isolate the plant until the issue is controlled."
      }
    ],
    status: "published"
  },
  {
    id: "white-mold-on-houseplant-soil",
    title: "White Mold on Houseplant Soil: Is It Dangerous and How Do You Fix It?",
    slug: "white-mold-on-houseplant-soil",
    metaTitle: "White Mold on Houseplant Soil: Causes and Fixes | Soil AI",
    metaDescription: "Learn why white mold appears on houseplant soil, when it is harmless, and how to improve watering and airflow to remove it.",
    excerpt: "White fuzz on soil looks alarming, but it is usually a moisture and airflow problem. Still, your pot is asking for better management.",
    content: `White mold on houseplant soil is usually saprophytic fungus feeding on organic matter in damp potting mix. It is often harmless to the plant, but it is a sign the soil surface is staying too wet.

## Quick Answer

Remove white mold from soil by scraping off the top layer, improving airflow, letting the soil surface dry, reducing watering, and removing dead leaves from the pot.

## Why It Appears

Mold likes moisture, still air, low light, and decaying organic matter. Overwatering and dense soil make it worse.

## Is It Dangerous?

Most white surface mold is not directly dangerous to healthy plants. But the conditions that create it can lead to fungus gnats, root stress, and overwatering problems.

## How to Fix It

Scrape off the moldy top layer. Let the top inch of soil dry before watering. Move the plant into better light if appropriate. Increase airflow and remove fallen leaves from the pot.

If gnats are also present, read [how to get rid of fungus gnats](/journal/how-to-get-rid-of-fungus-gnats).

## Bottom Line

White soil mold is usually a warning, not a catastrophe. Dry the surface, clean the pot, and adjust watering before the problem invites pests.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Aloe_vera_flower_inset.png/960px-Aloe_vera_flower_inset.png",
    imageAlt: "A potted plant illustration showing soil surface problems and pest prevention",
    category: "Soil & Roots",
    tags: ["mold", "soil", "fungus gnats", "overwatering"],
    keywords: ["white mold on houseplant soil", "mold on plant soil", "fuzzy soil mold", "houseplant soil fungus"],
    seoPriority: 14,
    readTime: "4 min read",
    createdAt: { seconds: 1716724800 },
    publishedAt: "2024-05-26",
    updatedAt: "2024-05-26",
    faq: [
      {
        question: "Is white mold on soil bad for plants?",
        answer: "It is usually not directly harmful, but it indicates damp conditions that can cause other problems."
      },
      {
        question: "Should I repot a plant with moldy soil?",
        answer: "Not always. Try removing the top layer and improving watering first. Repot if the soil smells bad or stays wet too long."
      }
    ],
    status: "published"
  },
  {
    id: "how-to-get-rid-of-spider-mites-on-houseplants",
    title: "How to Get Rid of Spider Mites on Houseplants",
    slug: "how-to-get-rid-of-spider-mites-on-houseplants",
    metaTitle: "How to Get Rid of Spider Mites on Houseplants | Soil AI",
    metaDescription: "Learn how to spot spider mites, remove webbing, wash leaves, and treat houseplants before mites spread.",
    excerpt: "Spider mites are tiny, fast-spreading pests that leave speckled leaves and fine webbing. Catch them early or they will treat your plant shelf like a buffet.",
    content: `Spider mites are tiny pests that suck sap from leaves. They are hard to see until the damage builds up, which is rude but on brand for plant pests.

## Quick Answer

To get rid of spider mites, isolate the plant, rinse leaves thoroughly, wipe undersides, prune heavily infested growth, and repeat treatment with insecticidal soap or horticultural oil every few days.

## Signs of Spider Mites

Look for fine webbing, tiny moving dots, speckled leaves, faded color, curling, and dry leaf edges. Mites often hide on leaf undersides.

## First Steps

Isolate the plant. Rinse it in the sink or shower. Focus on undersides of leaves and stem joints. Wipe leaves with a damp cloth.

## Treatment

Use insecticidal soap or horticultural oil according to the label. Repeat every three to seven days because eggs can hatch after the first treatment.

## Prevention

Spider mites love dry, dusty conditions. Keep leaves clean, inspect new plants, and increase humidity for plants that tolerate it.

## Bottom Line

Spider mite control is repetition. One spray is optimism. Several careful treatments are a plan.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Tetranychus_urticae_with_silk_threads.jpg/960px-Tetranychus_urticae_with_silk_threads.jpg",
    imageAlt: "A close-up of a plant leaf used to illustrate small houseplant pests",
    category: "Pest Guidelines",
    tags: ["spider mites", "pests", "webbing", "leaf damage"],
    keywords: ["spider mites on houseplants", "how to get rid of spider mites", "fine webbing on plants", "houseplant pest treatment"],
    seoPriority: 15,
    readTime: "5 min read",
    createdAt: { seconds: 1716811200 },
    publishedAt: "2024-05-27",
    updatedAt: "2024-05-27",
    faq: [
      {
        question: "What do spider mites look like?",
        answer: "They look like tiny moving dots and often leave fine webbing on leaves and stems."
      },
      {
        question: "Can spider mites spread to other plants?",
        answer: "Yes. Isolate affected plants quickly and inspect nearby plants."
      }
    ],
    status: "published"
  },
  {
    id: "why-is-my-plant-leggy",
    title: "Why Is My Plant Leggy? Low Light, Pruning, and How to Fix It",
    slug: "why-is-my-plant-leggy",
    metaTitle: "Why Is My Plant Leggy? | Soil AI",
    metaDescription: "Learn why houseplants grow leggy stems, how low light causes stretching, and how to prune and move plants for fuller growth.",
    excerpt: "A leggy plant is usually reaching for light. It is not trying to be elegant; it is trying to survive.",
    content: `Leggy growth means long stems, wide gaps between leaves, and a plant that looks stretched instead of full. This usually happens when the plant is not getting enough light.

## Quick Answer

Plants become leggy because they are reaching for more light. Move the plant closer to bright indirect light, rotate it regularly, and prune stretched growth to encourage fuller new stems.

## Signs of Low-Light Stretching

Look for long spaces between leaves, leaning toward a window, smaller new leaves, pale growth, and weak stems.

## How to Fix It

Move the plant closer to light gradually. Prune long bare stems above a node. Propagate healthy cuttings if the plant allows it. Rotate the pot every week or two.

## What Not to Expect

Old stretched stems will not magically shrink. The goal is better new growth. Pruning helps reset the shape.

## Bottom Line

A leggy plant is a light problem wearing a stem costume. Improve light and prune strategically for fuller growth.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Monstera_deliciosa2.jpg/960px-Monstera_deliciosa2.jpg",
    imageAlt: "A houseplant leaf image used to illustrate light and growth habits",
    category: "Light Problems",
    tags: ["leggy plant", "low light", "pruning", "growth"],
    keywords: ["why is my plant leggy", "leggy houseplant", "plant stretching for light", "low light plant symptoms"],
    seoPriority: 16,
    readTime: "4 min read",
    createdAt: { seconds: 1716897600 },
    publishedAt: "2024-05-28",
    updatedAt: "2024-05-28",
    faq: [
      {
        question: "Can a leggy plant become full again?",
        answer: "Yes, but usually through better light and pruning. Old stretched stems will not shorten on their own."
      },
      {
        question: "Should I prune a leggy plant?",
        answer: "Often yes. Pruning above nodes can encourage branching and fuller new growth."
      }
    ],
    status: "published"
  },
  {
    id: "why-are-my-pothos-leaves-turning-yellow",
    title: "Why Are My Pothos Leaves Turning Yellow? Causes and Fixes",
    slug: "why-are-my-pothos-leaves-turning-yellow",
    metaTitle: "Why Are My Pothos Leaves Turning Yellow? | Soil AI",
    metaDescription: "Learn why pothos leaves turn yellow from overwatering, low light, old growth, nutrient issues, or root stress.",
    excerpt: "Pothos are forgiving, which is not the same as indestructible. Yellow leaves mean it is time to check water, light, and roots.",
    content: `Pothos leaves turn yellow for several reasons, but overwatering is the usual suspect. Pothos can tolerate a lot, but wet roots in low light will still cause trouble.

## Quick Answer

Pothos leaves turn yellow because of overwatering, underwatering, low light, natural aging, nutrient deficiency, or root rot. Check soil moisture first.

## Overwatering

If yellow leaves are soft and the soil is wet, let the plant dry and check drainage. Pothos do not like sitting in soggy soil.

## Low Light

Pothos tolerate lower light, but they grow better in bright indirect light. Very low light slows water use and can lead to yellowing.

## Natural Aging

One yellow older leaf is normal. Many yellow leaves at once is a care issue.

## What to Do

Move the plant to brighter indirect light, water only when the top few inches dry, and check roots if the plant keeps declining.

## Bottom Line

Yellow pothos leaves are usually fixable. Start with watering and light before blaming the plant for being dramatic.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Money_Plant_%28Epipremnum_aureum%29_4.jpg/960px-Money_Plant_%28Epipremnum_aureum%29_4.jpg",
    imageAlt: "A yellowing leaf used to illustrate pothos leaf stress",
    category: "Pothos Care",
    tags: ["pothos", "yellow leaves", "overwatering", "low light"],
    keywords: ["pothos leaves turning yellow", "yellow pothos leaves", "pothos overwatering", "pothos care"],
    seoPriority: 17,
    readTime: "5 min read",
    createdAt: { seconds: 1716984000 },
    publishedAt: "2024-05-29",
    updatedAt: "2024-05-29",
    faq: [
      {
        question: "Should I remove yellow pothos leaves?",
        answer: "Yes, once they are fully yellow. They will not turn green again."
      },
      {
        question: "How often should I water pothos?",
        answer: "Water when the top few inches of soil are dry, adjusting for light, pot size, and season."
      }
    ],
    status: "published"
  },
  {
    id: "why-is-my-peace-lily-drooping",
    title: "Why Is My Peace Lily Drooping? Water, Light, and Root Causes",
    slug: "why-is-my-peace-lily-drooping",
    metaTitle: "Why Is My Peace Lily Drooping? | Soil AI",
    metaDescription: "Learn why peace lilies droop from underwatering, overwatering, low humidity, heat, or root stress and how to revive them.",
    excerpt: "Peace lilies are famous for dramatic drooping. Sometimes they are thirsty. Sometimes they are overwatered. The soil tells the truth.",
    content: `Peace lilies droop dramatically, which makes them useful and slightly theatrical. The leaves can collapse when the plant is thirsty, but wet soil can cause drooping too.

## Quick Answer

A peace lily droops because of underwatering, overwatering, heat, low humidity, or root stress. Check the soil before watering.

## Dry Soil

If soil is dry and the plant droops, water thoroughly. Peace lilies often perk up within hours.

## Wet Soil

If soil is wet and the plant droops, roots may be stressed. Stop watering and check drainage. Repot if roots are rotten.

## Light and Heat

Peace lilies prefer bright indirect light. Direct hot sun or heat vents can make leaves wilt.

## Bottom Line

Peace lily droop is easy to misread. Dry soil means water. Wet soil means pause and inspect.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Spathiphyllum_cochlearispathum_RTBG.jpg/960px-Spathiphyllum_cochlearispathum_RTBG.jpg",
    imageAlt: "A drooping houseplant used to illustrate peace lily wilting",
    category: "Peace Lily Care",
    tags: ["peace lily", "drooping", "wilting", "watering"],
    keywords: ["why is my peace lily drooping", "peace lily wilting", "drooping peace lily", "peace lily watering"],
    seoPriority: 18,
    readTime: "4 min read",
    createdAt: { seconds: 1717070400 },
    publishedAt: "2024-05-30",
    updatedAt: "2024-05-30",
    faq: [
      {
        question: "Will a peace lily perk up after watering?",
        answer: "If underwatering is the cause, it often perks up within a few hours."
      },
      {
        question: "Can overwatering make a peace lily droop?",
        answer: "Yes. Wet soil can damage roots, causing drooping even though the plant has plenty of water."
      }
    ],
    status: "published"
  },
  {
    id: "why-are-my-calathea-leaves-curling",
    title: "Why Are My Calathea Leaves Curling? Humidity, Water, and Light Fixes",
    slug: "why-are-my-calathea-leaves-curling",
    metaTitle: "Why Are My Calathea Leaves Curling? | Soil AI",
    metaDescription: "Learn why Calathea leaves curl from dry soil, low humidity, tap water sensitivity, heat, or too much light.",
    excerpt: "Calatheas curl when they are thirsty, dry, stressed, or simply being Calatheas. Here is how to narrow it down.",
    content: `Calatheas are beautiful, sensitive, and extremely committed to giving feedback. Curling leaves are one of their favorite complaints.

## Quick Answer

Calathea leaves curl because of underwatering, low humidity, heat, direct sun, tap water sensitivity, or root stress. Check soil moisture and humidity first.

## Dry Soil

Calatheas dislike going completely dry. Water when the top layer begins to dry, but avoid soggy soil.

## Low Humidity

Dry air causes curling and crispy edges. A humidifier is more effective than misting.

## Light Stress

Bright indirect light is best. Direct sun can fade, curl, or scorch leaves.

## Water Quality

Some Calatheas react to hard tap water. Filtered or distilled water can help if tips keep browning.

## Bottom Line

Calathea curling is usually a moisture balance problem. Keep soil lightly moist, air humid, and light gentle.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Adenium_Obesum_Flower_Side_Macro_Mar22_D72_23052-58_ZS_P.jpg/960px-Adenium_Obesum_Flower_Side_Macro_Mar22_D72_23052-58_ZS_P.jpg",
    imageAlt: "A damaged houseplant leaf used to illustrate Calathea curling and crispy edges",
    category: "Calathea Care",
    tags: ["calathea", "curling leaves", "humidity", "tap water"],
    keywords: ["calathea leaves curling", "why are my calathea leaves curling", "calathea humidity", "calathea crispy edges"],
    seoPriority: 19,
    readTime: "5 min read",
    createdAt: { seconds: 1717156800 },
    publishedAt: "2024-05-31",
    updatedAt: "2024-05-31",
    faq: [
      {
        question: "Do Calathea leaves uncurl after watering?",
        answer: "They may uncurl if dryness was the cause, but damaged leaves may not fully recover."
      },
      {
        question: "Do Calatheas need high humidity?",
        answer: "They prefer higher humidity than many homes provide, especially in winter or air-conditioned rooms."
      }
    ],
    status: "published"
  },
  {
    id: "why-is-my-snake-plant-falling-over",
    title: "Why Is My Snake Plant Falling Over? Causes and Fixes",
    slug: "why-is-my-snake-plant-falling-over",
    metaTitle: "Why Is My Snake Plant Falling Over? | Soil AI",
    metaDescription: "Learn why snake plant leaves fall over from overwatering, weak roots, low light, pot size, or physical damage.",
    excerpt: "Snake plants are tough, but floppy leaves usually mean root trouble, low light, or a potting setup that is not helping.",
    content: `Snake plants are famous for surviving neglect, which is why it feels insulting when one starts falling over. The cause is usually root or light related.

## Quick Answer

Snake plant leaves fall over because of overwatering, root rot, low light, a loose root system, physical damage, or a pot that is too large or unstable.

## Overwatering

Snake plants store water in their leaves and need soil to dry well. Wet soil can rot roots and soften leaf bases.

## Low Light

Snake plants tolerate low light, but very low light weakens growth. Brighter indirect light helps leaves stay stronger.

## Pot and Roots

A newly divided or loosely rooted snake plant may lean until roots anchor. Use a snug pot with gritty, fast-draining soil.

## What to Do

Check the leaf base and roots. Remove mushy leaves. Repot if soil is dense or wet. Stake healthy leaves temporarily if needed.

## Bottom Line

A falling snake plant is usually not thirsty. It is often too wet, too loose, or too dim. Fix the roots and light before adding water.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg/960px-Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg",
    imageAlt: "A potted houseplant used to illustrate weak or falling leaves",
    category: "Snake Plant Care",
    tags: ["snake plant", "falling over", "overwatering", "root rot"],
    keywords: ["snake plant falling over", "snake plant leaves drooping", "snake plant root rot", "floppy snake plant"],
    seoPriority: 20,
    readTime: "5 min read",
    createdAt: { seconds: 1717243200 },
    publishedAt: "2024-06-01",
    updatedAt: "2024-06-01",
    faq: [
      {
        question: "Should I cut off snake plant leaves that fall over?",
        answer: "Cut leaves that are mushy, damaged, or rotting. Healthy leaning leaves can sometimes be staked or propagated."
      },
      {
        question: "How often should I water a snake plant?",
        answer: "Water only after the soil has dried thoroughly. Snake plants are much more likely to suffer from too much water than too little."
      }
    ],
    status: "published"
  }
];
