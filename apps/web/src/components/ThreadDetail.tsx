import { useEffect, useState } from "react";
import type { Item } from "../types";
import { useStore, userByLogin } from "../state/store";
import { timeAgo } from "../lib/time";
import { Avatar, LabelChip, Markdownish, StateBadge } from "./ui";
import { CheckIcon, DotIcon, MergeIcon, XIcon } from "./icons";

function ChecksLine({ item }: { item: Item }) {
  if (item.checks === "passing")
    return (
      <span className="ws-checks is-passing">
        <CheckIcon size={13} /> All checks passing
      </span>
    );
  if (item.checks === "failing")
    return (
      <span className="ws-checks is-failing">
        <XIcon size={13} /> Some checks failing
      </span>
    );
  return (
    <span className="ws-checks is-pending">
      <DotIcon size={13} /> Checks running
    </span>
  );
}

function MergeBox({ item }: { item: Item }) {
  const { setItemState } = useStore();
  const [confirming, setConfirming] = useState(false);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    setConfirming(false);
    setMerging(false);
  }, [item.id]);

  if (item.state === "merged")
    return (
      <div className="ws-mergebox is-merged">
        <MergeIcon size={16} />
        <span>
          Merged into <code className="mono">main</code>
        </span>
      </div>
    );

  if (item.state === "closed")
    return (
      <div className="ws-mergebox is-closed-box">
        <XIcon size={16} />
        <span>Closed without merging</span>
        <button
          type="button"
          className="ws-btn"
          onClick={() => setItemState(item.id, "open")}
        >
          Reopen
        </button>
      </div>
    );

  const merge = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setMerging(true);
    setTimeout(() => setItemState(item.id, "merged"), 650);
  };

  return (
    <div className="ws-mergebox">
      <div className="ws-mergebox-row">
        <ChecksLine item={item} />
        {item.branch && (
          <span className="ws-branch mono">
            {item.branch} → main · +{item.additions} −{item.deletions}
          </span>
        )}
      </div>
      <div className="ws-mergebox-row">
        <button
          type="button"
          className={`ws-merge-btn${confirming ? " is-confirming" : ""}`}
          disabled={merging || item.state === "draft"}
          onClick={merge}
          onBlur={() => setConfirming(false)}
        >
          <MergeIcon size={15} />
          {item.state === "draft"
            ? "Draft — not mergeable"
            : merging
              ? "Merging…"
              : confirming
                ? "Click again to confirm merge"
                : "Merge pull request"}
        </button>
        <button
          type="button"
          className="ws-btn is-danger"
          onClick={() => setItemState(item.id, "closed")}
        >
          Close
        </button>
      </div>
      {item.checks === "failing" && !confirming && (
        <p className="ws-mergebox-warn mono">
          merging with failing checks — you're the maintainer, your call
        </p>
      )}
    </div>
  );
}

export function ThreadDetail({ item }: { item: Item }) {
  const { viewer, addComment, setItemState } = useStore();
  const [draft, setDraft] = useState("");

  useEffect(() => setDraft(""), [item.id]);

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    addComment(item.id, body);
    setDraft("");
  };

  const author = userByLogin(item.author);

  return (
    <section className="ws-detail" key={item.id}>
      <header className="ws-detail-head">
        <div className="ws-detail-toprow">
          <StateBadge item={item} />
          <span className="ws-detail-ref mono">
            {item.repo}#{item.number}
          </span>
          {item.kind === "issue" && (
            <button
              type="button"
              className={`ws-btn ws-detail-toggle${item.state === "open" ? " is-danger" : ""}`}
              onClick={() =>
                setItemState(item.id, item.state === "open" ? "closed" : "open")
              }
            >
              {item.state === "open" ? "Close issue" : "Reopen issue"}
            </button>
          )}
        </div>
        <h1 className="ws-detail-title">{item.title}</h1>
        <div className="ws-detail-meta">
          {item.labels.map((l) => (
            <LabelChip key={l} name={l} />
          ))}
          {item.assignee && (
            <span className="ws-detail-assignee mono">
              <Avatar login={item.assignee} size={16} /> assigned to{" "}
              {item.assignee}
            </span>
          )}
        </div>
      </header>

      <div className="ws-thread">
        <article className="ws-msg">
          <Avatar login={item.author} size={32} />
          <div className="ws-msg-body">
            <div className="ws-msg-head">
              <span className="ws-msg-name">{author.name}</span>
              <span className="ws-msg-when mono">{timeAgo(item.at)}</span>
              <span className="ws-msg-op mono">OP</span>
            </div>
            <Markdownish text={item.body} />
          </div>
        </article>

        {item.comments.map((comment) => {
          const u = userByLogin(comment.author);
          return (
            <article className="ws-msg" key={comment.id}>
              <Avatar login={comment.author} size={32} />
              <div className="ws-msg-body">
                <div className="ws-msg-head">
                  <span className="ws-msg-name">{u.name}</span>
                  <span className="ws-msg-when mono">
                    {timeAgo(comment.at)}
                  </span>
                </div>
                <Markdownish text={comment.body} />
              </div>
            </article>
          );
        })}

        {item.kind === "pr" && <MergeBox item={item} />}
      </div>

      <footer className="ws-composer">
        <Avatar login={viewer} size={28} />
        <div className="ws-composer-box">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            placeholder={`Reply to ${item.repo}#${item.number}…`}
            rows={3}
          />
          <div className="ws-composer-foot">
            <span className="mono">⌘↵ to send</span>
            <button
              type="button"
              className="ws-btn is-primary"
              disabled={!draft.trim()}
              onClick={submit}
            >
              Comment
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}
