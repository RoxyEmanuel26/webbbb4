import catalog from "@/data/curated-video-catalog.json";
import { ALL_CATEGORIES } from "@/data/allCategories";

const videos = Array.isArray(catalog.videos) ? catalog.videos : [];
export const MIN_HUB_VIDEOS = 12;

const normalizeSignal = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const toSlug = (name = "") =>
  name.toLowerCase().replace(/\s+/g, "-");

// Mapping all valid category slugs
const categoryBySlug = new Map(
  ALL_CATEGORIES.map((cat) => [toSlug(cat.name), cat])
);

// Pre-index video signals
const signalsByVideoId = new Map(
  videos.map((video) => [
    video.id,
    new Set([video.category, ...(video.tags || [])].map(normalizeSignal)),
  ])
);

// Editorial descriptions for top hubs to provide genuine unique content
const EDITORIAL_INTROS = {
  amateur:
    "Explore our verified collection of authentic amateur videos, featuring real couples, candid bedroom moments, and unscripted passionate encounters. Each clip is curated for natural chemistry, spontaneous intimacy, and authentic adult entertainment without artificial studio setups.",
  blowjob:
    "Browse our hand-picked selection of top-tier oral sex scenes, featuring enthusiastic foreplay, intense deepthroat sessions, and sensual close-up techniques. From slow, teasing warmups to climactic finishes, find high-definition videos focused on passionate oral pleasure.",
  "big-ass":
    "Discover videos featuring voluptuous curves, prominent backsides, and sensual adult performances. This hub showcases top-rated scenes highlighting shapely silhouettes, rhythmically captivating angles, and stunning full-figured models in crisp high definition.",
  "big-tits":
    "Stream curated adult clips spotlighting naturally endowed and voluptuous performers. Enjoy stunning angles, sensual breast play, and passionate scenes featuring full busts and breathtaking cleavage captured in high resolution.",
  homemade:
    "Watch authentic homemade adult recordings created by real couples in intimate, private settings. These unfiltered videos focus on personal passion, candid camera angles, and genuine enthusiasm for couples who love sharing their intimate moments.",
  masturbation:
    "Enjoy an extensive library of solo pleasure, sensual touch, and intimate self-exploration. Featuring solo models enjoying their bodies with gentle caresses, teasing foreplay, and powerful climaxes in serene private environments.",
  blonde:
    "Browse our dedicated catalog of stunning blonde models and starlets. From golden-haired sirens to sun-kissed amateurs, this hub delivers diverse high-definition scenes focusing on beauty, charm, and electrifying performances.",
  webcam:
    "Catch live-recorded webcam sessions and interactive cam shows. Experience direct-to-camera interactions, spontaneous performances, and real-time private room requests preserved in high definition for intimate entertainment.",
  toys:
    "Discover stimulating scenes featuring modern adult toys, vibrators, and intimate pleasure devices. From solo enhancement to exciting couple play, see how creative accessories add thrilling dimensions to adult pleasure.",
  hardcore:
    "Dive into intense, high-energy adult action with uncompromising pacing and direct encounters. Our hardcore hub brings together energetic performances, powerful chemistry, and thrilling climactic finishes.",
  milf:
    "Appreciate experienced, confident, and mature women who command the screen with allure and expertise. These curated scenes celebrate feminine confidence, skilled passion, and irresistible adult charm.",
  asian:
    "Stream curated scenes featuring elegant Asian performers, starlets, and couples. Discover high-definition productions that balance sensual aesthetics, gentle teasing, and intense passion from premier creators.",
  anal:
    "Explore carefully paced and expertly performed anal encounters. From sensual foreplay and careful preparation to deep, rhythmic satisfaction, each video highlights mutual desire and exceptional technique in HD quality.",
  japanese:
    "Experience distinctive Japanese adult videos, JAV aesthetics, and authentic Asian tube performances. Featuring renowned Tokyo starlets, immersive roleplays, and uniquely captivating storylines.",
  latina:
    "Feel the vibrant energy and fiery passion of gorgeous Latina performers. Known for sensational curves, enthusiastic performances, and natural rhythm, this collection brings warm, captivating adult clips to your screen.",
  solo:
    "A dedicated showcase for individual performers celebrating their own sensuality. Enjoy quiet private moments, mindful caressing, and passionate solo orgasms captured with artistic lighting and clarity.",
  interracial:
    "Celebrate dynamic chemistry and passionate cross-cultural encounters. Our interracial hub features diverse pairings, magnetic attraction, and intense mutual satisfaction across a spectrum of adult scenes.",
  threesome:
    "Double the excitement with sensational three-way encounters. Whether exploring FFM harmony or intense MMF dynamics, these videos focus on balanced attention, shared pleasure, and thrilling group interplay.",
  creampie:
    "Browse intimate climaxes celebrating raw passion and natural conclusions. Featuring breathless finishes and deeply satisfying conclusions captured with crisp, detailed camera work.",
  handjob:
    "Focus on tactile stimulation, skilled grip techniques, and sensual manual pleasure. From gentle teasing to fast-paced finishes, discover videos highlighting the intimate art of hand relief.",
  lingerie:
    "Delight in the visual elegance of silky lace, delicate corsets, stockings, and provocative sleepwear. These clips showcase the art of seduction where anticipation and luxurious lingerie take center stage.",
  pov:
    "Immerse yourself directly in the action with first-person perspective (Point of View) cinematography. Feel like part of the intimate encounter with realistic angles and immersive eye contact.",
  redhead:
    "Admire the rare allure of gorgeous redheaded performers, pale skin, and fiery attitudes. From natural red hair to vibrant auburn curls, explore memorable and passionate adult performances.",
  striptease:
    "Savor the art of slow anticipation, sensual dancing, and gradual unveiling. These performances emphasize seductive rhythm, playful confidence, and the erotic power of teasing before the action begins.",
  "group-sex":
    "Experience multi-partner enthusiasm with passionate orgies and group gatherings. Enjoy scenes with multiple models enjoying collective pleasure, spontaneous pairings, and continuous adult action.",
  "small-tits":
    "Celebrate natural, petite frames and slender silhouettes. This hub highlights subtle elegance, delicate curves, and the distinct charm of small-busted performers in passionate scenes.",
  mature:
    "Discover the beauty of age, wisdom, and seasoned passion. Our mature collection spotlights poised older women and sophisticated performers who bring deep experience and warmth to every scene.",
  "adult-porn":
    "Explore our general library of premier adult cinema, featuring balanced productions, top performers, and varied themes designed for broad adult viewing enjoyment.",
  ebony:
    "Experience the stunning beauty and radiant allure of Black performers. This collection highlights rich skin tones, gorgeous curves, and magnetic on-screen energy in premier high definition.",
  petite:
    "Browse scenes featuring slender, compact, and delicate models. These clips emphasize graceful proportions, flexible encounters, and intense physical chemistry.",
  lesbians:
    "Immerse yourself in authentic female intimacy, gentle caresses, and passionate lesbian lovemaking. Featuring emotional connection, tender kisses, and mutual satisfaction between women.",
  vintage:
    "Take a nostalgic journey with classic adult films from past eras. Enjoy retro styling, natural looks, and the timeless appeal of vintage adult cinematography.",
  bbw:
    "Celebrate full-figured beauty, luscious curves, and confident big beautiful women. These videos showcase voluptuous models who embrace their bodies with uninhibited enthusiasm and sensuality.",
  indonesian:
    "Discover trending Indonesian and Southeast Asian regional clips. Featuring candid moments, intimate encounters, and local adult entertainment curated for regional audiences.",
  outdoor:
    "Enjoy the thrill of open-air intimacy, secluded beaches, deep forests, and balcony encounters. Experience the exciting edge of adult pleasure in picturesque natural landscapes.",
  squirt:
    "Witness intense female climaxes and exhilarating displays of pleasure. This hub features enthusiastic releases and breathless moments of peak physical ecstasy.",
  hotwife:
    "Explore open relationship dynamics, cuckold fantasies, and daring couples sharing intimacy with exciting partners. Highlighting psychological thrills and consensual partner sharing.",
  "double-penetration":
    "Witness ultimate multi-partner intensity with simultaneous dual penetration scenes. Featuring skilled coordination, enthusiastic performers, and unforgettable climaxes.",
  pawg:
    "Enjoy gorgeous, fair-skinned women with exceptional curves and prominent backsides. Celebrating the popular aesthetic of shapely figures and captivating performances.",
  stepmom:
    "Browse popular taboo-themed narratives and domestic fantasy roleplays. Featuring seductive storylines, forbidden tension, and passionate outcomes.",
  teen:
    "Watch young-adult performers of legal age (18+) exploring youthful energy and playful charm. All featured participants are verified legal adults in compliance with international standards.",
  indian:
    "Stream authentic Indian and South Asian adult videos, showcasing rich cultural beauty, passionate romance, and vibrant encounters.",
  lesbian:
    "Discover loving, sensual, and deeply satisfying encounters between women. Highlighting romantic foreplay, oral devotion, and reciprocal pleasure.",
  public:
    "Experience the exhilarating risk of semi-public encounters in cars, parks, and secluded urban spots where the fear of discovery adds thrilling tension.",
};

// Cache for category videos and stats
const categoryVideosCache = new Map();
const categoryStatsCache = new Map();

export function getCategoryVideos(slugOrName) {
  const slug = toSlug(String(slugOrName || ""));
  if (categoryVideosCache.has(slug)) {
    return categoryVideosCache.get(slug);
  }
  const categoryRecord = categoryBySlug.get(slug);
  const targetSignal = categoryRecord ? normalizeSignal(categoryRecord.name) : slug;
  const targetSlug = slug;

  const matches = videos.filter((video) => {
    if (video.availability !== "available") return false;
    const signals = signalsByVideoId.get(video.id);
    if (!signals) return false;
    return signals.has(targetSignal) || signals.has(targetSlug);
  });

  categoryVideosCache.set(slug, matches);
  return matches;
}

export function isCategoryIndexable(slugOrName) {
  const slug = toSlug(String(slugOrName || ""));
  const catVideos = getCategoryVideos(slug);
  return catVideos.length >= MIN_HUB_VIDEOS;
}

export function getCategoryStats(slugOrName) {
  const slug = toSlug(String(slugOrName || ""));
  if (categoryStatsCache.has(slug)) {
    return categoryStatsCache.get(slug);
  }
  const catVideos = getCategoryVideos(slug);
  const durations = catVideos
    .map((v) => Number(v.durationSeconds) || 0)
    .filter(Boolean)
    .sort((a, b) => a - b);
  const midpoint = Math.floor(durations.length / 2);
  const medianDurationSeconds = durations.length
    ? durations.length % 2
      ? durations[midpoint]
      : Math.round((durations[midpoint - 1] + durations[midpoint]) / 2)
    : 0;

  const hdSignals = catVideos.filter((v) => typeof v.isHd === "boolean");
  const hdShare = hdSignals.length
    ? Math.round(
        (hdSignals.filter((v) => v.isHd).length / hdSignals.length) * 100
      )
    : null;

  const tagCounts = new Map();
  catVideos.forEach((v) => {
    (v.tags || []).forEach((rawTag) => {
      const tag = normalizeSignal(rawTag);
      if (tag && tag !== slug) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    });
  });

  const latestSynced = catVideos.reduce(
    (latest, v) =>
      v.syncedAt && (!latest || v.syncedAt > latest) ? v.syncedAt : latest,
    catalog.generatedAt || new Date().toISOString()
  );

  const stats = {
    videoCount: catVideos.length,
    medianDurationSeconds,
    hdShare,
    latestSynced,
    relatedTags: [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([tag]) => tag),
  };

  categoryStatsCache.set(slug, stats);
  return stats;
}

export function getCategoryIntro(slugOrName) {
  const slug = toSlug(String(slugOrName || ""));
  if (EDITORIAL_INTROS[slug]) {
    return EDITORIAL_INTROS[slug];
  }
  const catRecord = categoryBySlug.get(slug);
  const displayName = catRecord ? catRecord.name : slug.replace(/-/g, " ");
  return `Browse our curated directory of high-definition ${displayName} videos. Each clip in this section is selected from verified content providers and indexed with accurate duration and tags to help you quickly discover top-rated entertainment.`;
}

export function getCategoryHubs() {
  const qualified = [];
  ALL_CATEGORIES.forEach((cat) => {
    const slug = toSlug(cat.name);
    const catVideos = getCategoryVideos(slug);
    if (catVideos.length >= MIN_HUB_VIDEOS) {
      qualified.push({
        slug,
        name: cat.name,
        count: catVideos.length,
        stats: getCategoryStats(slug),
        intro: getCategoryIntro(slug),
      });
    }
  });
  return qualified.sort((a, b) => b.count - a.count);
}
