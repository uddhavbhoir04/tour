import { Link } from "react-router-dom";

// Tiny, safe markdown → React renderer for assistant replies (no HTML injection).
// Supports: **bold**, *italic*, [text](url), `code`, "- " / "* " / "1. " lists, ### headings, --- rules.

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|`[^`]+`|\*[^*\s][^*]*\*)/g;

const renderInline = (text, onNavigate, keyBase) =>
  text.split(INLINE).filter(Boolean).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={key}>{renderInline(part.slice(2, -2), onNavigate, key)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={key} className="px-1 rounded bg-slate-200 text-[0.85em]">{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith("/")) {
        return (
          <Link key={key} to={href} onClick={onNavigate} className="font-semibold text-emerald-700 underline underline-offset-2">
            {label}
          </Link>
        );
      }
      if (/^https?:\/\//.test(href)) {
        return (
          <a key={key} href={href} target="_blank" rel="noreferrer noopener" className="font-semibold text-emerald-700 underline underline-offset-2">
            {label}
          </a>
        );
      }
      return label;
    }
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) return <em key={key}>{part.slice(1, -1)}</em>;
    return part;
  });

export const MiniMarkdown = ({ text = "", onNavigate }) => {
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks = [];
  let list = null;

  const flush = () => {
    if (list) blocks.push(list);
    list = null;
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^(\s*)([-*•]|\d+\.)\s+(.*)$/);
    if (bullet) {
      const ordered = /\d+\./.test(bullet[2]);
      const nested = bullet[1].length >= 2;
      if (!list || list.ordered !== ordered) {
        flush();
        list = { type: "list", ordered, items: [] };
      }
      list.items.push({ nested, content: renderInline(bullet[3], onNavigate, `l${i}`) });
      return;
    }
    flush();
    if (!line.trim()) return;
    if (/^-{3,}$/.test(line.trim())) return blocks.push({ type: "hr" });
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) return blocks.push({ type: "h", content: renderInline(heading[1], onNavigate, `h${i}`) });
    blocks.push({ type: "p", content: renderInline(line, onNavigate, `p${i}`) });
  });
  flush();

  return (
    <div className="space-y-2">
      {blocks.map((b, i) => {
        if (b.type === "hr") return <hr key={i} className="border-slate-200" />;
        if (b.type === "h") return <p key={i} className="font-bold text-slate-900">{b.content}</p>;
        if (b.type === "p") return <p key={i}>{b.content}</p>;
        const Tag = b.ordered ? "ol" : "ul";
        return (
          <Tag key={i} className={`${b.ordered ? "list-decimal" : "list-disc"} pl-5 space-y-1`}>
            {b.items.map((it, j) => (
              <li key={j} className={it.nested ? "ml-4 list-[circle]" : ""}>
                {it.content}
              </li>
            ))}
          </Tag>
        );
      })}
    </div>
  );
};
