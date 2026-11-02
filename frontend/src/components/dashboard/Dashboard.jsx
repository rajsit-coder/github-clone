import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import API from "../../api";
import "./dashboard.css";

/* ── Icons ──────────────────────────────────────── */
const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.063 0L7.196 13.66A2.25 2.25 0 0 0 5.605 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h4.105a3.75 3.75 0 0 1 1.646.574ZM8.5 13.574a3.75 3.75 0 0 1 1.646-.574H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25l.004 7.324Z" />
  </svg>
);
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
  </svg>
);

const Dashboard = () => {
  const [myRepos,   setMyRepos]   = useState([]);
  const [allRepos,  setAllRepos]  = useState([]);
  const [profile,   setProfile]   = useState(null);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const [myRes, allRes, profRes] = await Promise.all([
          API.get(`/repo/user/${userId}`),
          API.get(`/repo/all`),
          API.get(`/userProfile/${userId}`),
        ]);
        setMyRepos(myRes.data.repositories || []);
        setAllRepos(allRes.data            || []);
        setProfile(profRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const filtered = useMemo(() => {
    if (!search) return myRepos;
    const q = search.toLowerCase();
    return myRepos.filter(r =>
      r.name.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q)
    );
  }, [search, myRepos]);

  // Explore: other users' public repos, sorted newest first
  const explore = allRepos
    .filter(r => String(r.owner?._id || r.owner) !== String(userId) && r.visibility)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const username = profile?.username || "";

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        {/* ═══════ LEFT SIDEBAR ═══════ */}
        <aside className="dashboard-sidebar">
          {/* User card */}
          {profile && (
            <Link to="/profile" className="dashboard-user-card">
              <div className="dashboard-user-avatar">{username[0]?.toUpperCase()}</div>
              <div className="dashboard-user-info">
                <div className="dashboard-user-name">{username}</div>
                <div className="dashboard-user-email">{profile.email}</div>
              </div>
            </Link>
          )}

          {/* Quick nav */}
          <nav className="dashboard-sidenav">
            <Link to="/profile" className="dashboard-sidenav-item">
              <BookIcon />
              <span>Your repositories</span>
            </Link>
            <Link to="/profile?tab=starred" className="dashboard-sidenav-item">
              <StarIcon />
              <span>Your stars</span>
            </Link>
          </nav>

          {/* Recent repos */}
          <div className="dashboard-recent-heading">
            <span>Recent repositories</span>
            <Link to="/create">New</Link>
          </div>
          {myRepos.slice(0, 6).map(r => (
            <Link key={r._id} to={`/repo/${r._id}`} className="dashboard-recent-repo">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--color-fg-muted)", flexShrink: 0 }}>
                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
              </svg>
              <span className="truncate">{r.name}</span>
            </Link>
          ))}
        </aside>

        {/* ═══════ MAIN FEED ═══════ */}
        <main className="dashboard-main">
          {/* Repos header + search */}
          <div className="dashboard-feed-header">
            <h2 className="dashboard-feed-title">Your repositories</h2>
            <Link to="/create" className="btn btn-primary btn-sm">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
              </svg>
              New
            </Link>
          </div>

          <input
            className="input dashboard-search-input"
            type="text"
            placeholder="Find a repository…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Repo list */}
          <div className="dashboard-repo-list">
            {loading ? (
              <div className="page-loading"><span className="spinner spinner-lg" /></div>
            ) : filtered.length === 0 ? (
              <div className="blankslate">
                <div className="blankslate-icon">
                  <svg width="40" height="40" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
                  </svg>
                </div>
                <h3>{search ? "No repositories matched" : "Create your first repository"}</h3>
                {!search && (
                  <p>A repository contains all of your project&apos;s files, revision history, and more.</p>
                )}
                {!search && (
                  <Link to="/create" className="btn btn-primary btn-sm" style={{ marginTop: "8px" }}>New repository</Link>
                )}
              </div>
            ) : (
              filtered.map(repo => <RepoRow key={repo._id} repo={repo} />)
            )}
          </div>
        </main>

        {/* ═══════ RIGHT SIDEBAR ═══════ */}
        <aside className="dashboard-right-sidebar">
          <div className="explore-card">
            <h3 className="explore-heading">Explore repositories</h3>
            {explore.length === 0
              ? <p style={{ fontSize: "13px", color: "var(--color-fg-muted)", padding: "8px 0" }}>No public repositories yet.</p>
              : explore.map(repo => <ExploreRepo key={repo._id} repo={repo} />)
            }
            <Link to="/search?q=" className="explore-see-more">See more</Link>
          </div>
        </aside>
      </div>
    </>
  );
};

/* ── Subcomponents ─────────────────────────────── */
const RepoRow = ({ repo }) => {
  const langs = ["JavaScript", "TypeScript", "Python", "Go", "Rust"];
  const lang  = langs[Math.abs(repo.name.charCodeAt(0)) % langs.length];
  const langColors = { JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Go: "#00ADD8", Rust: "#dea584" };

  return (
    <div className="repo-feed-row">
      <div className="repo-feed-row-content">
        <div className="repo-feed-row-name-row">
          <Link to={`/repo/${repo._id}`} className="repo-feed-row-name">
            {repo.name}
          </Link>
          <span className={`badge ${repo.visibility ? "badge-public" : "badge-private"}`} style={{ fontSize: "11px" }}>
            {repo.visibility ? "Public" : "Private"}
          </span>
        </div>
        {repo.description && <p className="repo-feed-row-desc">{repo.description}</p>}
        <div className="repo-feed-row-meta">
          <span className="repo-feed-row-meta-item">
            <span className="lang-dot" style={{ background: langColors[lang] }} />
            {lang}
          </span>
          <span className="repo-feed-row-meta-item text-muted">
            Updated {new Date(repo.updatedAt || repo.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
};

const ExploreRepo = ({ repo }) => (
  <div className="explore-repo">
    <Link to={`/repo/${repo._id}`} className="explore-repo-name">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--color-fg-muted)", flexShrink: 0 }}>
        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
      </svg>
      <span>
        {repo.owner?.username && <span style={{ color: "var(--color-fg-muted)" }}>{repo.owner.username} / </span>}
        <strong>{repo.name}</strong>
      </span>
    </Link>
    {repo.description && <p className="explore-repo-desc">{repo.description}</p>}
  </div>
);

export default Dashboard;
