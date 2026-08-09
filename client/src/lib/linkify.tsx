import { Fragment } from "react";

// Minimal renderer for chat message text: supports `[label](url)` markdown
// links and auto-links bare http(s) URLs. Chat messages are plain strings
// from the server (FAQ answers, LLM output), so this is intentionally tiny -
// not a full markdown parser.
const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const BARE_URL = /(https?:\/\/[^\s]+)/g;

function linkifyBareUrls(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(BARE_URL);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={`${keyPrefix}-url-${i}`}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline break-all text-blue-600 dark:text-blue-400"
      >
        {part}
      </a>
    ) : (
      <Fragment key={`${keyPrefix}-text-${i}`}>{part}</Fragment>
    )
  );
}

export function linkifyText(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let matchIndex = 0;

  MARKDOWN_LINK.lastIndex = 0;
  while ((match = MARKDOWN_LINK.exec(text)) !== null) {
    const [full, label, url] = match;
    if (match.index > lastIndex) {
      nodes.push(...linkifyBareUrls(text.slice(lastIndex, match.index), `pre-${matchIndex}`));
    }
    nodes.push(
      <a
        key={`link-${matchIndex}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-1 font-medium underline text-blue-600 dark:text-blue-400"
      >
        {label}
      </a>
    );
    lastIndex = match.index + full.length;
    matchIndex += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(...linkifyBareUrls(text.slice(lastIndex), `post-${matchIndex}`));
  }

  return nodes;
}
