import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import API from "../api";
import "./navbar.css";

const GitHubIcon = () => (
  <svg height="32" viewBox="0 0 16 16" width="32" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.49c-2.22.48-2.69-.94-2.69-.94-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.22.82 1.22.82.71 1.21 1.87.86 2.33.66.07-.52.28-.86.51-1.06-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

const Navbar = () => {
  const { logout, currentUser } = useAuth();
  const navigate   = useNavigate();
  const inputRef   = useRef(null);
  const dropdownRef = useRef(null);

  const [menuOpen,      setMenuOpen]      = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = no query yet
  const [searchLoading, setSearchLoading] = useState(false);

  // searchOpen is derived: show dropdown when there's a query and results have loaded
  const searchOpen = Boolean(searchQuery.trim() && searchResults !== null && !searchLoading);

  // current user profile for display
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    API.get(`/userProfile/${currentUser}`).then(r => setProfile(r.data)).catch(() => {});
  }, [currentUser]);

  // Global "/" keyboard shortcut to focus search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchResults(null);
        setSearchQuery("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await API.get(`/search?q=${encodeURIComponent(searchQuery)}&type=all`);
        setSearchResults(res.data);
      } catch {
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchResults(null);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  const goToResult = useCallback((path) => {
    setSearchResults(null);
    setSearchQuery("");
    navigate(path);
  }, [navigate]);

  const closeDropdowns = () => { setSearchResults(null); setSearchQuery(""); setMenuOpen(false); };

  const initial = profile?.username?.[0]?.toUpperCase() || "U";
  const username = profile?.username || "";

  const totalResults = (searchResults?.repositories?.length || 0) + (searchResults?.users?.length || 0);

  return (
    <header className="AppHeader">
      {/* Logo */}
      <Link to="/" className="AppHeader-logo" aria-label="GitHub home">
        <GitHubIcon />
      </Link>

      {/* ── Search ── */}
      <div className="AppHeader-search-wrapper">
        <form className="AppHeader-search-form" onSubmit={handleSearchSubmit}>
          <label className="AppHeader-search-label" htmlFor="gh-search">
            <svg className="AppHeader-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
            </svg>
          </label>
          <input
            ref={inputRef}
            id="gh-search"
            className="AppHeader-search-input"
            type="text"
            autoComplete="off"
            spellCheck="false"
            placeholder="Search or jump to…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => {/* dropdown is derived from state */}}          />
          <kbd className="AppHeader-search-kbd">/</kbd>
        </form>

        {/* Live suggestions dropdown */}
        {searchOpen && (
          <>
            <div className="AppHeader-search-backdrop" onClick={() => setSearchResults(null)} />
            <div className="AppHeader-search-dropdown" ref={dropdownRef}>
              {searchLoading ? (
                <div className="AppHeader-search-loading">
                  <span className="spinner" style={{ borderTopColor: "var(--color-accent-fg)" }} />
                  Searching…
                </div>
              ) : totalResults === 0 ? (
                <div className="AppHeader-search-empty">No results for &ldquo;{searchQuery}&rdquo;</div>
              ) : (
                <>
                  {searchResults?.repositories?.length > 0 && (
                    <div className="AppHeader-search-section">
                      <div className="AppHeader-search-section-title">Repositories</div>
                      {searchResults.repositories.slice(0, 5).map(repo => (
                        <button key={repo._id} className="AppHeader-search-item" onClick={() => goToResult(`/repo/${repo._id}`)}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="AppHeader-search-item-icon">
                            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
                          </svg>
                          <div className="AppHeader-search-item-body">
                            <span className="AppHeader-search-item-title">
                              {repo.owner?.username && <span className="AppHeader-search-item-muted">{repo.owner.username} / </span>}
                              {repo.name}
                            </span>
                            {repo.description && <span className="AppHeader-search-item-desc">{repo.description}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults?.users?.length > 0 && (
                    <div className="AppHeader-search-section">
                      <div className="AppHeader-search-section-title">Users</div>
                      {searchResults.users.slice(0, 5).map(user => (
                        <button key={user._id} className="AppHeader-search-item" onClick={() => goToResult(`/profile/${user._id}`)}>
                          <div className="AppHeader-search-item-avatar">{user.username[0].toUpperCase()}</div>
                          <div className="AppHeader-search-item-body">
                            <span className="AppHeader-search-item-title">{user.username}</span>
                            <span className="AppHeader-search-item-desc">{user.email}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="AppHeader-search-footer">
                    <button className="AppHeader-search-item AppHeader-search-all" onClick={handleSearchSubmit}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
                      </svg>
                      Search all of GitHub for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Nav links */}
      <nav className="AppHeader-nav" aria-label="Global">
        <Link to="/" className="AppHeader-nav-link" onClick={closeDropdowns}>Dashboard</Link>
        <Link to="/create" className="AppHeader-nav-link" onClick={closeDropdowns}>Create</Link>
      </nav>

      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div className="AppHeader-actions">
        {/* Notifications */}
        <Link to="/" className="AppHeader-icon-btn" aria-label="Notifications" title="Notifications">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 16a2 2 0 0 0 1.985-1.75c.017-.137-.097-.25-.235-.25h-3.5c-.138 0-.252.113-.235.25A2 2 0 0 0 8 16ZM3 5a5 5 0 0 1 10 0v2.947c0 .05.015.098.042.139l1.703 2.555A1.519 1.519 0 0 1 13.482 13H2.518a1.516 1.516 0 0 1-1.263-2.36l1.703-2.554A.255.255 0 0 0 3 7.947Z" />
          </svg>
        </Link>

        {/* Plus / Create */}
        <div className="AppHeader-create-wrapper">
          <Link to="/create" className="AppHeader-icon-btn AppHeader-create-btn" aria-label="Create new…" title="Create new…">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
            </svg>
            <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="m4.427 7.927 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7.5H4.604a.25.25 0 0 0-.177.427Z" />
            </svg>
          </Link>
        </div>

        {/* Avatar dropdown */}
        <div className="AppHeader-avatar-wrapper">
          <button
            className="AppHeader-avatar-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open user menu"
            aria-expanded={menuOpen}
          >
            <span className="AppHeader-avatar-circle">{initial}</span>
            <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="m4.427 7.927 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7.5H4.604a.25.25 0 0 0-.177.427Z" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="AppHeader-menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="AppHeader-menu" role="menu">
                {username && (
                  <div className="AppHeader-menu-header">
                    <span>Signed in as</span>
                    <strong>{username}</strong>
                  </div>
                )}
                <Link className="AppHeader-menu-item" to="/profile" onClick={() => setMenuOpen(false)} role="menuitem">
                  Your profile
                </Link>
                <Link className="AppHeader-menu-item" to="/" onClick={() => setMenuOpen(false)} role="menuitem">
                  Your repositories
                </Link>
                <Link className="AppHeader-menu-item" to="/create" onClick={() => setMenuOpen(false)} role="menuitem">
                  New repository
                </Link>
                <div className="AppHeader-menu-sep" />
                <button className="AppHeader-menu-item" onClick={() => { setMenuOpen(false); logout(); }} role="menuitem">
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
