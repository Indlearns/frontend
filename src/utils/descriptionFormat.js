/** Detect stored HTML vs legacy plain/markdown text */
export const isHtmlContent = (text) => /<[a-z][\s\S]*>/i.test(String(text || "").trim());

/** Strip markup for card previews */
export const stripDescriptionMarkup = (text) => {
  if (!text) return "";
  if (isHtmlContent(text)) {
    return text
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
  }
  return text
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^[-*•▪▸○●]\s+/gm, "")
    .replace(/^\d+[.)]\s+/gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const isRichTextEmpty = (html) => !stripDescriptionMarkup(html);

/** Convert legacy plain text to HTML for the editor */
export const toEditorHtml = (value) => {
  if (!value?.trim()) return "";
  if (isHtmlContent(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^#{1,3}\s+/.test(trimmed)) {
        const level = trimmed.match(/^(#+)/)[1].length;
        const text = trimmed.replace(/^#+\s+/, "");
        const tag = level <= 2 ? "h2" : "h3";
        return `<${tag}>${escapeHtml(text)}</${tag}>`;
      }
      return `<p>${escapeHtml(trimmed).replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("");
};

const escapeHtml = (text) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
