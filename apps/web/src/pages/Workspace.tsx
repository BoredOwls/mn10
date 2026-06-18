import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useStore } from "../state/store";
import { REPOS } from "../data/mock";
import { Sidebar } from "../components/Sidebar";
import {
  applyFilters,
  DEFAULT_FILTERS,
  ThreadList,
  type Filters,
} from "../components/ThreadList";
import { ThreadDetail } from "../components/ThreadDetail";
import "./workspace.css";

export default function Workspace() {
  const { repoId = "all", itemId } = useParams();
  const { items } = useStore();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const validRepo = repoId === "all" || REPOS.some((r) => r.name === repoId);

  const repoItems = useMemo(
    () => (repoId === "all" ? items : items.filter((i) => i.repo === repoId)),
    [items, repoId],
  );
  const filtered = useMemo(
    () => applyFilters(repoItems, filters),
    [repoItems, filters],
  );

  if (!validRepo) return <Navigate to="/p/all" replace />;

  const selected = itemId ? items.find((i) => i.id === itemId) : undefined;

  return (
    <div className="ws">
      <Sidebar activeRepo={repoId} />
      <ThreadList
        repoId={repoId}
        items={repoItems}
        filtered={filtered}
        filters={filters}
        onFilters={setFilters}
        selectedId={selected?.id}
      />
      {selected ? (
        <ThreadDetail item={selected} />
      ) : (
        <section className="ws-detail ws-detail-empty">
          <span className="ws-empty-eyes-lg" aria-hidden="true">
            ◉◉
          </span>
          <p>Select a thread to read it here.</p>
          <p className="mono">issues · pull requests · comments · merges</p>
        </section>
      )}
    </div>
  );
}
