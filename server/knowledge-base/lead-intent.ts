// If a message signals the user wants to be contacted or book a viewing,
// it should reach the LLM (which can call submit_lead) rather than being
// intercepted by the FAQ matcher or the property-search heuristic - both
// of which key off broad words like "property" or "viewing" that overlap
// heavily with lead-intent phrasing.
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/;

const LEAD_INTENT_PHRASES = [
  "book a viewing", "book a visit", "schedule a viewing", "arrange a viewing",
  "set up a viewing", "organise a viewing", "organize a viewing",
  "contact me", "call me", "text me", "email me", "get in touch",
  "reach out", "have an agent", "have someone call", "speak to an agent",
  "speak with an agent", "talk to an agent",
];

export function hasLeadIntent(message: string): boolean {
  if (EMAIL_PATTERN.test(message)) return true;
  const lower = message.toLowerCase();
  return LEAD_INTENT_PHRASES.some((phrase) => lower.includes(phrase));
}
