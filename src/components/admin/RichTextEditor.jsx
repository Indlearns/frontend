import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import BulletList from "@tiptap/extension-bullet-list";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiList,
  FiHash,
  FiType,
  FiSmile,
  FiRotateCcw,
} from "react-icons/fi";
import RichDescription from "../common/RichDescription";
import { isRichTextEmpty, toEditorHtml } from "../../utils/descriptionFormat";

const StyledBulletList = BulletList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: "disc",
        parseHTML: (element) =>
          element.getAttribute("data-list-style") ||
          element.style.listStyleType ||
          "disc",
        renderHTML: (attributes) => ({
          "data-list-style": attributes.listStyleType,
          style: `list-style-type: ${attributes.listStyleType}`,
        }),
      },
    };
  },
});

const EMOJIS = [
  "✅", "⭐", "🎯", "💡", "📚", "🚀", "💼", "🎓", "🏆", "📅",
  "⏰", "📍", "💰", "🔥", "👍", "❤️", "✨", "🛠️", "💻", "📈",
  "🤝", "👨‍💻", "👩‍💻", "📝", "🔔", "⚡", "🌟", "🎉", "📌", "🔗",
  "☑️", "❌", "⚠️", "ℹ️", "➡️", "⬅️", "▪️", "●", "○", "◆",
];

const ToolbarButton = ({ title, onClick, active, disabled, children }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`p-2 rounded-lg text-sm transition-colors disabled:opacity-40 ${
      active
        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`}
  >
    {children}
  </button>
);

const ToolbarDivider = () => (
  <span className="w-px h-6 bg-brand-200 dark:bg-brand-700 mx-0.5 self-center" />
);

/** Apply heading only to the line(s) touched by the selection — not the whole document */
const applyHeadingLevel = (editor, level) => {
  const { from, to, empty } = editor.state.selection;

  if (empty) {
    editor.chain().focus().toggleHeading({ level }).run();
    return;
  }

  const $from = editor.state.doc.resolve(from);
  const $to = editor.state.doc.resolve(to);
  const sameParagraph =
    $from.parent === $to.parent &&
    ($from.parent.type.name === "paragraph" || $from.parent.type.name === "heading");

  if (sameParagraph && (from > $from.start() || to < $from.end())) {
    editor
      .chain()
      .focus()
      .setTextSelection(to)
      .splitBlock()
      .setTextSelection(from)
      .splitBlock()
      .setHeading({ level })
      .run();
    return;
  }

  editor.chain().focus().setHeading({ level }).run();
};

const applyBodyText = (editor) => {
  const { empty } = editor.state.selection;
  if (empty) {
    editor.chain().focus().setParagraph().run();
    return;
  }
  editor.chain().focus().clearNodes().run();
};

const EditorToolbar = ({ editor, onEmojiOpen }) => {
  if (!editor) return null;

  const bulletStyle = editor.getAttributes("bulletList").listStyleType || "disc";

  const setBulletList = (style) => {
    if (editor.isActive("orderedList")) {
      editor.chain().focus().toggleOrderedList().run();
    }
    if (editor.isActive("bulletList")) {
      editor.chain().focus().updateAttributes("bulletList", { listStyleType: style }).run();
      return;
    }
    editor.chain().focus().toggleBulletList().updateAttributes("bulletList", { listStyleType: style }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-brand-100 dark:border-brand-800 bg-slate-50/80 dark:bg-slate-800/50">
      <ToolbarButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <FiBold size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <FiItalic size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <FiUnderline size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Heading — applies to the current line (click again to remove)"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => applyHeadingLevel(editor, 2)}
      >
        <FiHash size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Subheading — applies to the current line (click again to remove)"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => applyHeadingLevel(editor, 3)}
      >
        <FiType size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Normal text — turn heading back into regular paragraph"
        active={editor.isActive("paragraph") && !editor.isActive("heading")}
        onClick={() => applyBodyText(editor)}
      >
        <span className="text-[10px] font-semibold px-0.5 leading-none">Text</span>
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Bullet list (disc)"
        active={editor.isActive("bulletList") && bulletStyle === "disc"}
        onClick={() => setBulletList("disc")}
      >
        <FiList size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Bullet list (circle)"
        active={editor.isActive("bulletList") && bulletStyle === "circle"}
        onClick={() => setBulletList("circle")}
      >
        <span className="text-base leading-none">○</span>
      </ToolbarButton>
      <ToolbarButton
        title="Bullet list (square)"
        active={editor.isActive("bulletList") && bulletStyle === "square"}
        onClick={() => setBulletList("square")}
      >
        <span className="text-xs leading-none">■</span>
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <span className="text-xs font-bold">1.</span>
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Align left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <FiAlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Align center"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <FiAlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Align right"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <FiAlignRight size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Justify"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <FiAlignJustify size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton title="Insert emoji" onClick={onEmojiOpen}>
        <FiSmile size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Clear formatting"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      >
        <FiRotateCcw size={15} />
      </ToolbarButton>
    </div>
  );
};

const RichTextEditor = ({
  label = "Description",
  value,
  onChange,
  required = false,
  minHeight = "200px",
  placeholder = "Write your description here…",
  showPreview = true,
}) => {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef(null);
  const lastHtml = useRef(value || "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        heading: { levels: [2, 3] },
      }),
      StyledBulletList,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: toEditorHtml(value),
    editorProps: {
      attributes: {
        class: "tiptap-editor outline-none px-4 py-3 text-sm leading-relaxed min-h-[160px]",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastHtml.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const normalized = toEditorHtml(value);
    const current = editor.getHTML();
    if (value !== lastHtml.current && normalized !== current) {
      editor.commands.setContent(normalized || "<p></p>", false);
      lastHtml.current = value || "";
    }
  }, [value, editor]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const insertEmoji = (emoji) => {
    editor?.chain().focus().insertContent(emoji).run();
    setEmojiOpen(false);
  };

  const empty = isRichTextEmpty(value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div className="rounded-xl border border-brand-200 dark:border-brand-800 overflow-hidden bg-white dark:bg-slate-900 relative">
        <EditorToolbar editor={editor} onEmojiOpen={() => setEmojiOpen((o) => !o)} />
        <EditorContent editor={editor} style={{ minHeight }} />

        {emojiOpen && (
          <div
            ref={emojiRef}
            className="absolute z-20 right-2 top-12 w-64 max-h-48 overflow-y-auto p-2 rounded-xl border border-brand-200 dark:border-brand-700 bg-white dark:bg-slate-900 shadow-lg grid grid-cols-8 gap-0.5"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="text-lg p-1 rounded hover:bg-brand-50 dark:hover:bg-brand-950/40"
                onClick={() => insertEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Tip: press <strong>Enter</strong> to start a new line. Headings apply to the line where your
        cursor is, or only the text you selected. Use <strong>Text</strong> to remove a heading.
      </p>

      {required && empty && (
        <p className="text-xs text-amber-600">Description is required.</p>
      )}

      {showPreview && (
        <div className="rounded-xl border border-dashed border-brand-200 dark:border-brand-800 p-4 bg-brand-50/30 dark:bg-brand-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 mb-3">
            Website preview
          </p>
          {!empty ? (
            <RichDescription text={value} />
          ) : (
            <p className="text-sm text-slate-400 italic">Preview appears here as you type.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
