import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Item } from "../types";
import { LABELS } from "../data/mock";
import { userByLogin } from "../state/store";
import {
  ChevronDownIcon,
  DraftIcon,
  IssueClosedIcon,
  IssueOpenIcon,
  MergeIcon,
  PullRequestIcon,
} from "./icons";
import "./ui.css";

/* ── Avatar ────────────────────────────────────────────── */

export function Avatar({
  login,
  size = 24,
}: {
  login: string;
  size?: number;
}) {
  const user = userByLogin(login);
  return (
    <span
      className="ui-avatar"
      title={user.name}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(135deg, hsl(${user.hue} 45% 26%), hsl(${user.hue} 55% 16%))`,
        color: `hsl(${user.hue} 70% 78%)`,
      }}
    >
      {user.login.slice(0, 2)}
    </span>
  );
}

/* ── Label chip ────────────────────────────────────────── */

export function LabelChip({ name }: { name: string }) {
  const label = LABELS.find((l) => l.name === name);
  const color = label?.color ?? "#93a5ba";
  return (
    <span
      className="ui-label"
      style={{
        color: `color-mix(in srgb, ${color} 80%, white)`,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
      }}
    >
      <span className="ui-label-dot" style={{ background: color }} />
      {name}
    </span>
  );
}

/* ── State icon + badge ────────────────────────────────── */

export function stateMeta(item: Item) {
  if (item.kind === "pr") {
    switch (item.state) {
      case "merged":
        return { color: "var(--merged)", soft: "var(--merged-soft)", word: "Merged", Icon: MergeIcon };
      case "closed":
        return { color: "var(--closed)", soft: "var(--closed-soft)", word: "Closed", Icon: PullRequestIcon };
      case "draft":
        return { color: "var(--draft)", soft: "var(--draft-soft)", word: "Draft", Icon: DraftIcon };
      default:
        return { color: "var(--open)", soft: "var(--open-soft)", word: "Open", Icon: PullRequestIcon };
    }
  }
  return item.state === "open"
    ? { color: "var(--open)", soft: "var(--open-soft)", word: "Open", Icon: IssueOpenIcon }
    : { color: "var(--closed)", soft: "var(--closed-soft)", word: "Closed", Icon: IssueClosedIcon };
}

export function StateIcon({ item, size = 16 }: { item: Item; size?: number }) {
  const { color, Icon } = stateMeta(item);
  return (
    <span style={{ color, display: "inline-flex" }}>
      <Icon size={size} />
    </span>
  );
}

export function StateBadge({ item }: { item: Item }) {
  const { color, soft, word, Icon } = stateMeta(item);
  return (
    <span className="ui-state-badge" style={{ color, background: soft }}>
      <Icon size={14} />
      {word}
    </span>
  );
}

/* ── Dropdown ──────────────────────────────────────────── */

type DropdownOption = { value: string; label: ReactNode };

export function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = value !== "all";
  const current = options.find((o) => o.value === value);

  return (
    <div className="ui-dropdown" ref={ref}>
      <button
        type="button"
        className={`ui-dropdown-trigger${active ? " is-active" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {active && current ? current.label : label}
        <ChevronDownIcon size={12} />
      </button>
      {open && (
        <div className="ui-dropdown-menu" role="listbox">
          <button
            type="button"
            className={`ui-dropdown-item${value === "all" ? " is-selected" : ""}`}
            onClick={() => {
              onChange("all");
              setOpen(false);
            }}
          >
            All {label.toLowerCase()}s
          </button>
          <div className="ui-dropdown-rule" />
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`ui-dropdown-item${value === o.value ? " is-selected" : ""}`}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Minimal markdown-ish renderer ─────────────────────── */

function inline(text: string, keyBase: string): ReactNode[] {
  // split on `code` and **bold**
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${keyBase}-${i}`} className="ui-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyBase}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function Markdownish({ text }: { text: string }) {
  const blocks = text.split(/```(?:\w*)\n?/);
  return (
    <div className="ui-md">
      {blocks.map((block, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="ui-code-block">
            <code>{block.replace(/\n$/, "")}</code>
          </pre>
        ) : (
          block
            .split(/\n{2,}/)
            .filter((p) => p.trim())
            .map((para, j) => (
              <p key={`${i}-${j}`}>
                {para.split("\n").map((line, k, arr) => (
                  <span key={k}>
                    {inline(line, `${i}-${j}-${k}`)}
                    {k < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))
        ),
      )}
    </div>
  );
}
