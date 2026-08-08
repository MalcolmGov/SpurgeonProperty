import { FAQ_ENTRIES, type FaqEntry } from "./faq-data";

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "i", "you", "your", "yours", "we", "our", "they", "it", "its",
  "do", "does", "did", "can", "could", "will", "would", "should",
  "to", "of", "in", "on", "at", "for", "with", "about", "as", "by",
  "and", "or", "but", "if", "so", "not", "no",
  "what", "when", "where", "who", "how", "which",
  "me", "my", "please", "hi", "hello", "hey", "thanks", "thank"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function entryTokenSet(entry: FaqEntry): Set<string> {
  const tokens = new Set<string>();
  for (const t of tokenize(entry.question)) tokens.add(t);
  for (const keyword of entry.keywords) {
    for (const t of tokenize(keyword)) tokens.add(t);
  }
  return tokens;
}

const ENTRY_TOKENS = new Map<string, Set<string>>(
  FAQ_ENTRIES.map((entry) => [entry.id, entryTokenSet(entry)])
);

// Also check raw keyword phrases as substrings, since some FAQ triggers
// ("book a viewing", "free valuation") are meaningful as a phrase and lose
// signal once split into individual tokens.
function phraseHit(message: string, entry: FaqEntry): boolean {
  const lower = message.toLowerCase();
  return entry.keywords.some((k) => k.length > 4 && lower.includes(k.toLowerCase()));
}

export interface FaqMatch {
  entry: FaqEntry;
  score: number;
}

const MIN_SCORE = 0.35;
const MIN_MATCHED_TOKENS = 2;

export function matchFAQ(message: string): FaqMatch | null {
  const queryTokens = tokenize(message);
  if (queryTokens.length === 0) return null;

  let best: FaqMatch | null = null;

  for (const entry of FAQ_ENTRIES) {
    const tokens = ENTRY_TOKENS.get(entry.id)!;
    const matched = queryTokens.filter((t) => tokens.has(t));
    const matchCount = new Set(matched).size;

    const queryCoverage = matchCount / queryTokens.length;
    const entryCoverage = matchCount / tokens.size;
    let score = (queryCoverage + entryCoverage) / 2;

    if (phraseHit(message, entry)) {
      score = Math.max(score, 0.6);
    }

    const passesThreshold =
      score >= MIN_SCORE && (matchCount >= MIN_MATCHED_TOKENS || phraseHit(message, entry));

    if (passesThreshold && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  return best;
}
