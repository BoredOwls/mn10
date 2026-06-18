import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../state/store";
import { BrandMark, GitHubIcon } from "../components/icons";
import { ORG } from "../data/mock";
import "./login.css";

export default function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [authorizing, setAuthorizing] = useState(false);

  const handleLogin = () => {
    setAuthorizing(true);
    // mock OAuth round-trip
    setTimeout(() => {
      login();
      navigate("/projects", { replace: true });
    }, 900);
  };

  return (
    <div className="login">
      <div className="login-grid" aria-hidden="true" />
      <div className="login-glow" aria-hidden="true" />

      <main className="login-card">
        <BrandMark size={44} />
        <h1 className="login-wordmark">Parliament</h1>
        <p className="login-tag">
          Every issue, every pull request, every repo of{" "}
          <strong>{ORG.login}</strong> — one quiet, dark room.
        </p>

        <button
          type="button"
          className="login-button"
          onClick={handleLogin}
          disabled={authorizing}
        >
          <GitHubIcon size={18} />
          {authorizing ? "Authorizing…" : "Continue with GitHub"}
        </button>

        <p className="login-fineprint mono">
          read-only scopes · repo, read:org · revoke anytime
        </p>
      </main>

      <footer className="login-footer mono">
        a parliament is a group of owls — {ORG.tagline.toLowerCase()}
      </footer>
    </div>
  );
}
