import DOMPurify from "dompurify";
import FormattedDescription from "./FormattedDescription";
import { isHtmlContent } from "../../utils/descriptionFormat";

const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "h2",
    "h3",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "ul",
    "ol",
    "li",
    "span",
    "a",
  ],
  ALLOWED_ATTR: ["style", "class", "data-list-style", "href", "target", "rel"],
  ALLOW_DATA_ATTR: true,
};

/**
 * Renders course/workshop/job descriptions on the public site.
 * HTML from the rich editor, or legacy plain/markdown via FormattedDescription.
 */
const RichDescription = ({ text, html, className = "" }) => {
  const content = html ?? text;
  if (!content?.trim()) return null;

  if (!isHtmlContent(content)) {
    return <FormattedDescription text={content} className={className} />;
  }

  const clean = DOMPurify.sanitize(content, SANITIZE_OPTIONS);

  return (
    <div
      className={`rich-description space-y-3 ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default RichDescription;
