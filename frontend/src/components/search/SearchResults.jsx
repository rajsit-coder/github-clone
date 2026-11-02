import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../Navbar";
import API from "../../api";
import "./search.css";

const RepoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
  </svg>
);

const TYPES = [
  { key: "all",          label: "All"          },
  { key: "repositories", label: "Repositories" },
  { key: "users",        label: "Users"        },
];

const SearchResults = () => {
  const [sp] = useSearchParams();
  const q    = sp.get("q") || "";

  const [type,    setType]    = useState("all");
  const [results, setResults] = useState({ repositories: [], users: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    (async () => {
      try {
        setLoading(true);
        const res = await API.get(`/search?q=${encodeURIComponent(q)}&type=${type}`);
        setResults(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [q, type]);

  const repoCount = results.repositories?.length || 0;
  const userCount = results.users?.length        || 0;
  const total     = repoCount + userCount;

  return (
    <>
      <Navbar />
      <div className="search-page">
        {/* Sidebar */}
        <aside className="search-sidebar">
          <h3 className="search-sidebar-heading">Filter results</h3>
          <div className="search-filter-group">
            {TYPES.map(t => (
              <button
                key={t.key}
                className={`search-filter-btn ${type === t.key ? "active" : ""}`}
                onClick={() => setType(t.key)}
              >
                {t.label}
                {t.key !== "all" && (
                  <span className="Counter">
                    {t.key === "repositories" ? repoCount : userCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="search-main">
          <div className="search-header">
            {loading ? (
              <p className="search-meta">Searching for &ldquo;{q}&rdquo;…</p>
            ) : (
              <p className="search-meta">
                {total === 0
                  ? <>No results for &ldquo;<strong>{q}</strong>&rdquo;</>
                  : <>{total.toLocaleString()} result{total !== 1 ? "s" : ""} for &ldquo;<strong>{q}</strong>&rdquo;</>}
              </p>
            )}
          </div>

          {loading && (
            <div className="search-loading"><span className="spinner" /></div>
          )}

          {/* Repositories */}
          {!loading && (type === "all" || type === "repositories") && results.repositories?.length > 0 && (
            <section className="search-section">
              {type === "all" && <h2 className="search-section-title">Repositories</h2>}
              {results.repositories.map(repo => (
                <div key={repo._id} className="search-result-card">
                  <div className="search-result-icon"><RepoIcon /></div>
                  <div className="search-result-body">
                    <Link to={`/repo/${repo._id}`} className="search-result-title">
                      {repo.owner?.username && (
                        <span className="search-result-owner">{repo.owner.username} / </span>
                      )}
                      {repo.name}
                    </Link>
                    {repo.description && (
                      <p className="search-result-desc">{repo.description}</p>
                    )}
                    <div className="search-result-meta">
                      <span className={`badge ${repo.visibility ? "badge-public" : "badge-private"}`} style={{ fontSize: "11px" }}>
                        {repo.visibility ? "Public" : "Private"}
                      </span>
                      <span>Updated {new Date(repo.updatedAt || repo.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Users */}
          {!loading && (type === "all" || type === "users") && results.users?.length > 0 && (
            <section className="search-section">
              {type === "all" && <h2 className="search-section-title">Users</h2>}
              {results.users.map(user => (
                <div key={user._id} className="search-result-card">
                  <div className="search-result-avatar">{user.username[0].toUpperCase()}</div>
                  <div className="search-result-body">
                    <Link to={`/profile/${user._id}`} className="search-result-title">
                      {user.username}
                    </Link>
                    <p className="search-result-desc">{user.email}</p>
                    {user.repositories?.length > 0 && (
                      <p className="search-result-meta">{user.repositories.length} repositor{user.repositories.length !== 1 ? "ies" : "y"}</p>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* No results */}
          {!loading && total === 0 && (
            <div className="search-empty">
              <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: .4 }}>
                <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
              </svg>
              <h3>No results matched your search</h3>
              <p>Try different keywords or check your spelling.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default SearchResults;
