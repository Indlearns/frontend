/** Plain-text snippet for cards (strip markup). */
export const stripDescriptionMarkup = (text) => {
  if (!text) return "";
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

export const applyTextareaUpdate = (textarea, newValue, cursor) => {
  const proto = Object.getPrototypeOf(textarea);
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
  descriptor.set.call(textarea, newValue);
  textarea.setSelectionRange(cursor, cursor);
  textarea.focus();
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
};

export const wrapSelection = (textarea, before, after = before, placeholder = "text") => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end) || placeholder;
  const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
  const cursor = start + before.length + selected.length + after.length;
  return { newValue, cursor };
};

export const insertAtCursor = (textarea, insertText) => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const newValue = value.slice(0, start) + insertText + value.slice(end);
  const cursor = start + insertText.length;
  return { newValue, cursor };
};

export const prefixSelectedLines = (textarea, prefix) => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEndRaw = value.indexOf("\n", end);
  const lineEnd = lineEndRaw === -1 ? value.length : lineEndRaw;
  const block = value.slice(lineStart, lineEnd);

  const lines = block.split("\n");
  const prefixed = lines
    .map((line, i) => {
      if (!line.trim() && lines.length > 1) return line;
      const numbered = prefix.match(/^(\d+\.)$/);
      if (numbered) {
        return `${i + 1}. ${line.replace(/^\d+[.)]\s*/, "")}`;
      }
      if (line.startsWith(prefix.trim())) return line;
      return `${prefix}${line.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, "")}`;
    })
    .join("\n");

  const newValue = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
  const cursor = lineStart + prefixed.length;
  return { newValue, cursor };
};

export const insertHeading = (textarea, level = 2) => {
  const marks = "#".repeat(level) + " ";
  const { newValue, cursor } = prefixSelectedLines(textarea, marks);
  return { newValue, cursor };
};
