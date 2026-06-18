import { Link, useNavigate } from "react-router-dom";
import { useStore, userByLogin } from "../state/store";
import { ORG, REPOS } from "../data/mock";
import { Avatar } from "./ui";
import { BrandMark, HashIcon, SignOutIcon } from "./icons";

export function Sidebar({ activeRepo }: { activeRepo: string }) {
  const { items, viewer, logout } = useStore();
  const navigate = useNavigate();

  const openCount = (repo?: string) =>
    items.filter(
      (i) =>
        (!repo || i.repo === repo) &&
        (i.state === "open" || i.state === "draft"),
    ).length;

  return (
    <nav className="ws-sidebar">
      <Link to="/projects" className="ws-sidebar-brand" title="All projects">
        <BrandMark size={24} />
        <span>
          <span className="ws-sidebar-app">Parliament</span>
          <span className="ws-sidebar-org mono">{ORG.login}</span>
        </span>
      </Link>

      <div className="ws-sidebar-section">Views</div>
      <Link
        to="/p/all"
        className={`ws-sidebar-row${activeRepo === "all" ? " is-active" : ""}`}
      >
        <span className="ws-sidebar-eyes" aria-hidden="true">
          ◉◉
        </span>
        All threads
        <span className="ws-sidebar-count mono">{openCount()}</span>
      </Link>

      <div className="ws-sidebar-section">Repositories</div>
      <div className="ws-sidebar-repos">
        {REPOS.map((repo) => (
          <Link
            key={repo.name}
            to={`/p/${repo.name}`}
            className={`ws-sidebar-row${
              activeRepo === repo.name ? " is-active" : ""
            }`}
          >
            <HashIcon size={13} className="ws-sidebar-hash" />
            {repo.name}
            <span className="ws-sidebar-count mono">
              {openCount(repo.name)}
            </span>
          </Link>
        ))}
      </div>

      <div className="ws-sidebar-foot">
        <Avatar login={viewer} size={26} />
        <span className="ws-sidebar-me">
          <span className="ws-sidebar-me-name">{userByLogin(viewer).name}</span>
          <span className="ws-sidebar-me-login mono">@{viewer}</span>
        </span>
        <button
          type="button"
          className="ws-sidebar-signout"
          title="Sign out"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          <SignOutIcon size={15} />
        </button>
      </div>
    </nav>
  );
}
