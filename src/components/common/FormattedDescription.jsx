import { useMemo } from "react";

/** Inline **bold** segments */
const formatInline = (text) => {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const isHeadingLine = (line) => {
  if (!line) return false;
  if (/^#{1,3}\s+/.test(line)) return true;
  if (line.length > 80) return false;
  if (line.endsWith(":") && !line.includes(". ")) return true;
  if (/^[A-Z0-9][A-Z0-9\s&/-]{2,}$/.test(line) && line.length < 60) return true;
  return false;
};

const headingLevel = (line) => {
  if (line.startsWith("### ")) return { level: 3, text: line.slice(4) };
  if (line.startsWith("## ")) return { level: 2, text: line.slice(3) };
  if (line.startsWith("# ")) return { level: 2, text: line.slice(2) };
  if (line.endsWith(":")) return { level: 3, text: line.slice(0, -1) };
  return { level: 3, text: line };
};

const parseDescription = (text) => {
  if (!text?.trim()) return [];

  const lines = text.split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "p", content: paragraph.join("\n") });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list?.items.length) blocks.push(list);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushList();
      flushParagraph();
      continue;
    }

    const bullet = line.match(/^[-*•▪▸]\s+(.+)$/) || line.match(/^[○●]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);

    if (bullet) {
      flushParagraph();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }

    if (numbered) {
      flushParagraph();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(numbered[1]);
      continue;
    }

    if (isHeadingLine(line)) {
      flushList();
      flushParagraph();
      const { level, text: headingText } = headingLevel(line);
      blocks.push({ type: `h${level}`, content: headingText });
      continue;
    }

    flushList();
    paragraph.push(raw.trimEnd());
  }

  flushList();
  flushParagraph();
  return blocks;
};

const headingClass = {
  h2: "text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-3 first:mt-0",
  h3: "text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-2 first:mt-0",
};

/**
 * Renders course/workshop descriptions with headings, lists, and paragraphs.
 * Supports: # headings, lines ending with :, ALL CAPS titles, - bullets, 1. numbered lists.
 */
const FormattedDescription = ({ text, className = "" }) => {
  const blocks = useMemo(() => parseDescription(text), [text]);

  if (!blocks.length) return null;

  return (
    <div className={`formatted-description space-y-3 ${className}`}>
      {blocks.map((block, i) => {
        if (block.type === "p") {
          return (
            <p
              key={i}
              className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap"
            >
              {formatInline(block.content)}
            </p>
          );
        }
        if (block.type === "h2" || block.type === "h3") {
          const Tag = block.type;
          return (
            <Tag key={i} className={headingClass[block.type]}>
              {formatInline(block.content)}
            </Tag>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
              {block.items.map((item, j) => (
                <li key={j} className="leading-relaxed">
                  {formatInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={i} className="list-decimal pl-5 space-y-2 text-slate-700 dark:text-slate-300">
              {block.items.map((item, j) => (
                <li key={j} className="leading-relaxed">
                  {formatInline(item)}
                </li>
              ))}
            </ol>
          );
        }
        return null;
      })}
    </div>
  );
};

export default FormattedDescription;
