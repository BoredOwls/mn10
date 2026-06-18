import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../state/store";
import { ORG, REPOS } from "../data/mock";
import {
  BrandMark,
  DotIcon,
  IssueOpenIcon,
  PullRequestIcon,
  SignOutIcon,
} from "../components/icons";
import { Avatar } from "../components/ui";
import { timeAgo } from "../lib/time";
import "./projects.css";

export default function Projects() {
  const { items, viewer, logout } = useStore();
  const navigate = useNavigate();

  const openIssues = (repo: string) =>
    items.filter(
      (i) => i.repo === repo && i.kind === "issue" && i.state === "open",
    ).length;
  const openPrs = (repo: string) =>
    items.filter(
      (i) =>
        i.repo === repo &&
        i.kind === "pr" &&
        (i.state === "open" || i.state === "draft"),
    ).length;
  const lastActivity = (repo: string) => {
    const ts = items
      .filter((i) => i.repo === repo)
      .flatMap((i) => [i.at, ...i.comments.map((c) => c.at)]);
    return ts.length ? Math.max(...ts) : 0;
  };

  const totalOpen = items.filter(
    (i) => i.state === "open" || i.state === "draft",
  ).length;

  return (
    <div className="projects">
      <header className="projects-top">
        <div className="projects-brand">
          <BrandMark size={26} />
          <span className="projects-brand-name">Parliament</span>
        </div>
        <div className="projects-user">
          <Avatar login={viewer} size={26} />
          <button
            type="button"
            className="projects-signout"
            title="Sign out"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <SignOutIcon size={16} />
          </button>
        </div>
      </header>

      <main className="projects-main">
        <p className="projects-org mono">{ORG.login} / projects</p>
        <h1 className="projects-title">Pick a room.</h1>
        <p className="projects-sub">
          {REPOS.length} repositories · {totalOpen} open threads across the org
        </p>

        <Link to="/p/all" className="projects-all">
          <span className="projects-all-eyes" aria-hidden="true">
            ◉◉
          </span>
          <span>
            <span className="projects-all-title">All repositories</span>
            <span className="projects-all-desc">
              The unified view — every issue and pull request in one stream
            </span>
          </span>
          <span className="projects-all-count mono">{totalOpen} open →</span>
        </Link>

        <div className="projects-grid">
          {REPOS.map((repo, i) => (
            <Link
              key={repo.name}
              to={`/p/${repo.name}`}
              className="projects-card"
              style={{ animationDelay: `${90 + i * 55}ms` }}
            >
              <div className="projects-card-name mono">{repo.name}</div>
              <p className="projects-card-desc">{repo.description}</p>
              <div className="projects-card-meta mono">
                <span
                  className="projects-card-lang"
                  style={{ color: repo.langColor }}
                >
                  <DotIcon size={10} />
                  {repo.lang}
                </span>
                <span className="projects-card-stat">
                  <IssueOpenIcon size={12} />
                  {openIssues(repo.name)}
                </span>
                <span className="projects-card-stat">
                  <PullRequestIcon size={12} />
                  {openPrs(repo.name)}
                </span>
                <span className="projects-card-when">
                  {timeAgo(lastActivity(repo.name))}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
