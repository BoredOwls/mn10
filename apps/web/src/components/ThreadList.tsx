import { Link } from "react-router-dom";
import type { Item } from "../types";
import { LABELS, USERS } from "../data/mock";
import { timeAgo } from "../lib/time";
import { Avatar, Dropdown, LabelChip, StateIcon } from "./ui";
import { CommentIcon, SearchIcon } from "./icons";

export type Filters = {
  tab: "open" | "closed" | "all";
  kind: "all" | "issue" | "pr";
  label: string;
  assignee: string;
  search: string;
};

export const DEFAULT_FILTERS: Filters = {
  tab: "open",
  kind: "all",
  label: "all",
  assignee: "all",
  search: "",
};

export function applyFilters(items: Item[], f: Filters): Item[] {
  return items
    .filter((i) => {
      if (f.tab === "open" && !(i.state === "open" || i.state === "draft"))
        return false;
      if (f.tab === "closed" && !(i.state === "closed" || i.state === "merged"))
        return false;
      if (f.kind !== "all" && i.kind !== f.kind) return false;
      if (f.label !== "all" && !i.labels.includes(f.label)) return false;
      if (f.assignee !== "all" && i.assignee !== f.assignee) return false;
      if (
        f.search &&
        !`${i.title} ${i.repo} #${i.number}`
          .toLowerCase()
          .includes(f.search.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => b.at - a.at);
}

export function ThreadList({
  repoId,
  items,
  filtered,
  filters,
  onFilters,
  selectedId,
}: {
  repoId: string;
  items: Item[];
  filtered: Item[];
  filters: Filters;
  onFilters: (f: Filters) => void;
  selectedId?: string;
}) {
  const openCount = items.filter(
    (i) => i.state === "open" || i.state === "draft",
  ).length;
  const closedCount = items.length - openCount;

  const set = (patch: Partial<Filters>) => onFilters({ ...filters, ...patch });

  return (
    <section className="ws-list">
      <header className="ws-list-head">
        <h2 className="ws-list-title">
          {repoId === "all" ? (
            <>
              <span className="ws-list-eyes">◉◉</span> All threads
            </>
          ) : (
            <>
              <span className="ws-list-hashmark">#</span>
              {repoId}
            </>
          )}
        </h2>
        <div className="ws-search">
          <SearchIcon size={13} />
          <input
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Search threads…"
            spellCheck={false}
          />
        </div>
      </header>

      <div className="ws-tabs">
        {(
          [
            ["open", `Open ${openCount}`],
            ["closed", `Closed ${closedCount}`],
            ["all", "All"],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            className={`ws-tab${filters.tab === tab ? " is-active" : ""}`}
            onClick={() => set({ tab })}
          >
            {label}
          </button>
        ))}

        <div className="ws-tabs-spacer" />

        <div className="ws-kind">
          {(
            [
              ["all", "All"],
              ["issue", "Issues"],
              ["pr", "PRs"],
            ] as const
          ).map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              className={`ws-kind-btn${filters.kind === kind ? " is-active" : ""}`}
              onClick={() => set({ kind })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="ws-filters">
        <Dropdown
          label="Label"
          value={filters.label}
          onChange={(label) => set({ label })}
          options={LABELS.map((l) => ({
            value: l.name,
            label: (
              <>
                <span className="ws-filter-dot" style={{ background: l.color }} />
                {l.name}
              </>
            ),
          }))}
        />
        <Dropdown
          label="Assignee"
          value={filters.assignee}
          onChange={(assignee) => set({ assignee })}
          options={USERS.map((u) => ({
            value: u.login,
            label: (
              <>
                <Avatar login={u.login} size={16} />
                {u.login}
              </>
            ),
          }))}
        />
        {(filters.label !== "all" ||
          filters.assignee !== "all" ||
          filters.kind !== "all" ||
          filters.search) && (
          <button
            type="button"
            className="ws-clear mono"
            onClick={() => onFilters({ ...DEFAULT_FILTERS, tab: filters.tab })}
          >
            clear
          </button>
        )}
      </div>

      <div className="ws-rows">
        {filtered.length === 0 && (
          <div className="ws-empty">
            <span className="ws-empty-eyes">◉◉</span>
            <p>No threads match. The owls see nothing.</p>
          </div>
        )}
        {filtered.map((item) => (
          <Link
            key={item.id}
            to={`/p/${repoId}/${item.id}`}
            className={`ws-row${selectedId === item.id ? " is-selected" : ""}`}
          >
            <StateIcon item={item} size={15} />
            <span className="ws-row-main">
              <span className="ws-row-title">{item.title}</span>
              <span className="ws-row-meta mono">
                {item.repo}#{item.number} · {timeAgo(item.at)} by {item.author}
                {item.comments.length > 0 && (
                  <span className="ws-row-comments">
                    <CommentIcon size={11} /> {item.comments.length}
                  </span>
                )}
              </span>
              {item.labels.length > 0 && (
                <span className="ws-row-labels">
                  {item.labels.map((l) => (
                    <LabelChip key={l} name={l} />
                  ))}
                </span>
              )}
            </span>
            {item.assignee && <Avatar login={item.assignee} size={20} />}
          </Link>
        ))}
      </div>
    </section>
  );
}
