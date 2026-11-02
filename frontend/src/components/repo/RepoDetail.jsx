import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../api";
import Navbar from "../Navbar";
import "./repo.css";

/* ── Icons ────────────────────────────────────────── */
const OpenIssueIcon  = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/></svg>;
const ClosedIssueIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z"/><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z"/></svg>;
const FileIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688Z"/></svg>;
const ForkIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>;
const StarIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>;
const SettingsIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.09 9.99.645 10.116 1.36l.101.683c.045.305.305.548.612.548.105 0 .21-.027.307-.078l.6-.302a1.65 1.65 0 0 1 2.092.585l.45.795a1.65 1.65 0 0 1-.348 2.095l-.54.43a.751.751 0 0 0 0 1.18l.54.43a1.65 1.65 0 0 1 .348 2.095l-.45.795a1.65 1.65 0 0 1-2.092.585l-.6-.302a.633.633 0 0 0-.307-.078.646.646 0 0 0-.612.548l-.101.683c-.126.716-.672 1.27-1.414 1.329A8.2 8.2 0 0 1 8 16a8.2 8.2 0 0 1-.701-.031c-.742-.059-1.288-.613-1.414-1.329l-.101-.683a.646.646 0 0 0-.612-.548.633.633 0 0 0-.307.078l-.6.302a1.65 1.65 0 0 1-2.092-.585l-.45-.795a1.65 1.65 0 0 1 .348-2.095l.54-.43a.751.751 0 0 0 0-1.18l-.54-.43a1.65 1.65 0 0 1-.348-2.095l.45-.795a1.65 1.65 0 0 1 2.092-.585l.6.302a.633.633 0 0 0 .307.078.646.646 0 0 0 .612-.548l.101-.683C6.012.645 6.558.09 7.299.031A8.2 8.2 0 0 1 8 0ZM7 1.5l-.001.006-.097.652A2.146 2.146 0 0 1 5.169 3.99l-.59-.296a.15.15 0 0 0-.19.053l-.45.795a.15.15 0 0 0 .032.19l.531.423A2.25 2.25 0 0 1 5.5 8a2.25 2.25 0 0 1-.998 1.845l-.531.423a.15.15 0 0 0-.032.19l.45.795a.15.15 0 0 0 .19.053l.59-.295a2.146 2.146 0 0 1 1.733 1.832l.097.651.001.006.001.02.007.065A6.7 6.7 0 0 0 8 14.5a6.7 6.7 0 0 0 .983-.065l.007-.065.001-.02.001-.006.097-.651A2.146 2.146 0 0 1 10.83 11.7l.59.295a.15.15 0 0 0 .19-.053l.45-.795a.15.15 0 0 0-.032-.19l-.531-.423A2.25 2.25 0 0 1 10.5 8a2.25 2.25 0 0 1 .997-1.845l.531-.423a.15.15 0 0 0 .032-.19l-.45-.795a.15.15 0 0 0-.19-.053l-.59.296a2.146 2.146 0 0 1-1.733-1.832l-.097-.652L9 1.5a6.7 6.7 0 0 0-.983-.065A6.7 6.7 0 0 0 7 1.5ZM8 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/></svg>;

/* ═══════════════════════════════════════════════════ */
const RepoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [me] = useState(() => localStorage.getItem("userId"));

  const [repo,    setRepo]    = useState(null);
  const [files,   setFiles]   = useState([]);
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("code");

  /* file states */
  const [viewFile,   setViewFile]   = useState(null);
  const [editMode,   setEditMode]   = useState(false);
  const [editBuf,    setEditBuf]    = useState("");
  const [addingFile, setAddingFile] = useState(false);
  const [newFName,   setNewFName]   = useState("");
  const [newFBody,   setNewFBody]   = useState("");
  const [fSaving,    setFSaving]    = useState(false);

  /* description inline edit */
  const [editDesc,    setEditDesc]    = useState(false);
  const [descBuf,     setDescBuf]     = useState("");

  /* issue states */
  const [selIssue,     setSelIssue]     = useState(null);
  const [comments,     setComments]     = useState([]);
  const [commentText,  setCommentText]  = useState("");
  const [postingCmt,   setPostingCmt]   = useState(false);
  const [issueFilter,  setIssueFilter]  = useState("open");   // "open" | "closed"

  /* settings: collab search */
  const [collabQuery,   setCollabQuery]   = useState("");
  const [collabResults, setCollabResults] = useState([]);

  /* ── load ─────────────────────────────────────── */
  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true);
      const [rr, fr, ir] = await Promise.all([
        API.get(`/repo/${id}`).catch(() => null),
        API.get(`/file/all/${id}`).catch(() => null),
        API.get(`/issue/all/${id}`).catch(() => null),
      ]);
      if (!live) return;
      if (rr) setRepo(rr.data);
      setFiles(fr?.data || []);
      setIssues(ir?.data || []);
      setLoading(false);
    })();
    return () => { live = false; };
  }, [id]);

  /* ── derived ──────────────────────────────────── */
  const isOwner  = repo && String(repo.owner?._id || repo.owner) === String(me);
  const isCollab = repo?.collaborators?.some(c => String(c._id || c) === String(me));
  const canWrite = isOwner || isCollab;
  const ownerName = typeof repo?.owner === "object" ? repo.owner.username : "Unknown";
  const ownerId   = typeof repo?.owner === "object" ? repo.owner._id     : "";

  const openIssues   = issues.filter(i => i.status === "open");
  const closedIssues = issues.filter(i => i.status === "closed");
  const shownIssues  = issueFilter === "open" ? openIssues : closedIssues;

  /* ── file handlers ────────────────────────────── */
  const refreshFiles = async () => {
    const r = await API.get(`/file/all/${id}`).catch(() => null);
    if (r) setFiles(r.data || []);
  };

  const openFile = async (fileId) => {
    const r = await API.get(`/file/${fileId}`).catch(() => null);
    if (r) { setViewFile(r.data); setEditMode(false); }
  };

  const saveFile = async () => {
    try {
      setFSaving(true);
      await API.put(`/file/update/${viewFile._id}`, { content: editBuf });
      setViewFile({ ...viewFile, content: editBuf });
      setEditMode(false);
      refreshFiles();
    } catch (err) {
      alert(err.response?.data?.error || "Save failed");
    } finally { setFSaving(false); }
  };

  const deleteFile = async (fid) => {
    if (!confirm("Delete this file?")) return;
    try {
      await API.delete(`/file/delete/${fid}`);
      setViewFile(null); setEditMode(false); refreshFiles();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const createFile = async (e) => {
    e.preventDefault();
    if (!newFName.trim()) { alert("Filename required"); return; }
    try {
      setFSaving(true);
      await API.post(`/file/create/${id}`, { filename: newFName.trim(), content: newFBody });
      setAddingFile(false); setNewFName(""); setNewFBody(""); refreshFiles();
    } catch (err) {
      alert(err.response?.data?.error || "Create failed");
    } finally { setFSaving(false); }
  };

  /* ── repo handlers ────────────────────────────── */
  const handleFork = async () => {
    try {
      const r = await API.post(`/repo/fork/${id}`);
      navigate(`/repo/${r.data.repositoryID}`);
    } catch (err) {
      alert(err.response?.data?.error || "Fork failed");
    }
  };

  const handleStar = async () => {
    try { await API.patch(`/user/star/${id}`); }
    catch (err) { alert(err.response?.data?.message || "Star failed"); }
  };

  const handleToggleVis = async () => {
    try {
      const r = await API.patch(`/repo/toggle/${id}`);
      setRepo(r.data.repository);
    } catch (err) { alert(err.response?.data?.error || "Failed"); }
  };

  const handleDeleteRepo = async () => {
    if (!confirm("Delete this repository permanently?")) return;
    try {
      await API.delete(`/repo/delete/${id}`);
      navigate("/");
    } catch (err) { alert(err.response?.data?.error || "Delete failed"); }
  };

  const saveDescription = async () => {
    try {
      const r = await API.put(`/repo/update/${id}`, { description: descBuf });
      setRepo(r.data.repository);
      setEditDesc(false);
    } catch (err) { alert(err.response?.data?.error || "Failed"); }
  };

  /* ── issue handlers ───────────────────────────── */
  const viewIssue = async (issue) => {
    setSelIssue(issue);
    const r = await API.get(`/comment/all/${issue._id}`).catch(() => null);
    setComments(r?.data || []);
    setCommentText("");
  };

  const toggleIssueStatus = async (issue) => {
    const ns = issue.status === "open" ? "closed" : "open";
    try {
      const r = await API.put(`/issue/update/${issue._id}`, { status: ns });
      setIssues(prev => prev.map(i => i._id === issue._id ? r.data : i));
      if (selIssue?._id === issue._id) setSelIssue(r.data);
    } catch (err) { alert(err.response?.data?.error || "Update failed"); }
  };

  const deleteIssue = async (issue) => {
    if (!confirm("Delete this issue?")) return;
    try {
      await API.delete(`/issue/delete/${issue._id}`);
      setIssues(prev => prev.filter(i => i._id !== issue._id));
      setSelIssue(null);
    } catch (err) { alert(err.response?.data?.error || "Delete failed"); }
  };

  const postComment = async () => {
    if (!commentText.trim()) return;
    try {
      setPostingCmt(true);
      const r = await API.post(`/comment/create/${selIssue._id}`, { content: commentText });
      setComments(prev => [...prev, r.data]);
      setCommentText("");
    } catch (err) { alert(err.response?.data?.error || "Comment failed"); }
    finally { setPostingCmt(false); }
  };

  const deleteComment = async (cid) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await API.delete(`/comment/delete/${cid}`);
      setComments(prev => prev.filter(c => c._id !== cid));
    } catch (err) { alert(err.response?.data?.error || "Delete failed"); }
  };

  /* ── collab search ────────────────────────────── */
  const searchCollabs = async () => {
    if (!collabQuery.trim()) return;
    try {
      const r = await API.get("/allUsers");
      setCollabResults(
        (r.data || []).filter(u =>
          u.username.toLowerCase().includes(collabQuery.toLowerCase()) &&
          String(u._id) !== String(me)
        ).slice(0, 10)
      );
    } catch { setCollabResults([]); }
  };

  const addCollab = async (uid) => {
    try {
      await API.post(`/repo/${id}/collaborator`, { userId: uid });
      const r = await API.get(`/repo/${id}`);
      setRepo(r.data);
      setCollabResults([]);
      setCollabQuery("");
    } catch (err) { alert(err.response?.data?.error || "Failed"); }
  };

  const removeCollab = async (uid) => {
    try {
      await API.delete(`/repo/${id}/collaborator/${uid}`);
      const r = await API.get(`/repo/${id}`);
      setRepo(r.data);
    } catch (err) { alert(err.response?.data?.error || "Failed"); }
  };

  /* ── render ───────────────────────────────────── */
  if (loading) return (<><Navbar /><div className="repo-loading"><span className="spinner" /></div></>);
  if (!repo)   return (<><Navbar /><div className="repo-page" style={{ padding: "40px 24px" }}><p>Repository not found. <Link to="/">Go home</Link></p></div></>);

  return (
    <>
      <Navbar />
      <div className="repo-page">
        {/* Fork source banner */}
        {repo.forkedFrom && (
          <p style={{ fontSize: "12px", color: "var(--color-fg-muted)", padding: "8px 0 0" }}>
            Forked from{" "}
            <Link to={`/repo/${repo.forkedFrom._id || repo.forkedFrom}`}>
              {repo.forkedFrom.name || "original repository"}
            </Link>
          </p>
        )}

        {/* Header bar */}
        <div className="repo-header-bar">
          <div className="repo-header-breadcrumb">
            <Link to={`/profile/${ownerId}`}>{ownerName}</Link>
            <span className="sep">&nbsp;/&nbsp;</span>
            <span className="name">{repo.name}</span>
            <span className="badge badge-public" style={{ fontSize: "12px", padding: "0 7px" }}>
              {repo.visibility ? "Public" : "Private"}
            </span>
          </div>

          <div className="repo-header-actions">
            {/* Star */}
            <button className="btn btn-sm" onClick={handleStar}>
              <StarIcon /> Star
            </button>

            {/* Fork */}
            <button className="btn btn-sm" onClick={handleFork}>
              <ForkIcon /> Fork
            </button>

            {/* Collaborators count chip */}
            {repo.collaborators?.length > 0 && (
              <span className="btn btn-sm btn-invisible" style={{ cursor: "default" }}>
                {repo.collaborators.length} collaborator{repo.collaborators.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Tab nav */}
        <div className="repo-tabnav">
          <button className={`repo-tab ${tab === "code" ? "active" : ""}`} onClick={() => setTab("code")}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 1.75A.75.75 0 0 1 .75 1h14.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 1.75Zm0 5A.75.75 0 0 1 .75 6h14.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 6.75Zm0 5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75Z"/>
            </svg>
            Code
          </button>

          <button className={`repo-tab ${tab === "issues" ? "active" : ""}`} onClick={() => setTab("issues")}>
            <OpenIssueIcon />
            Issues
            <span className="Counter">{openIssues.length}</span>
          </button>

          {isOwner && (
            <button className={`repo-tab ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>
              <SettingsIcon />
              Settings
            </button>
          )}
        </div>

        {/* ═══════════════ CODE TAB ════════════════ */}
        {tab === "code" && (
          <div className="code-pane">
            {/* About / description */}
            <div className="repo-about-box">
              <h3>About</h3>
              {editDesc ? (
                <div className="repo-about-edit-row">
                  <input className="input" value={descBuf} onChange={e => setDescBuf(e.target.value)} autoFocus />
                  <button className="btn btn-primary btn-sm" onClick={saveDescription}>Save</button>
                  <button className="btn btn-sm" onClick={() => setEditDesc(false)}>Cancel</button>
                </div>
              ) : (
                <div className="repo-about-edit">
                  <p className="repo-about-desc">{repo.description || "No description provided."}</p>
                  {isOwner && (
                    <button className="btn btn-invisible btn-sm" onClick={() => { setDescBuf(repo.description || ""); setEditDesc(true); }}>
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* File panel */}
            {addingFile ? (
              <div className="add-file-box">
                <div className="add-file-header">
                  <span>Create new file</span>
                  <button className="btn btn-sm" onClick={() => { setAddingFile(false); setNewFName(""); setNewFBody(""); }}>Cancel</button>
                </div>
                <form onSubmit={createFile} className="add-file-form">
                  <div>
                    <label className="label">Filename</label>
                    <input className="input" placeholder="e.g. README.md"
                      value={newFName} onChange={e => setNewFName(e.target.value)} autoFocus disabled={fSaving} />
                  </div>
                  <div>
                    <label className="label">Content</label>
                    <textarea className="textarea" style={{ minHeight: "240px", fontFamily: "monospace", fontSize: "12px" }}
                      value={newFBody} onChange={e => setNewFBody(e.target.value)} disabled={fSaving} />
                  </div>
                  <div className="add-file-actions">
                    <button type="submit" className="btn btn-primary" disabled={fSaving}>
                      {fSaving ? <><span className="spinner" /> Creating…</> : "Commit new file"}
                    </button>
                  </div>
                </form>
              </div>

            ) : viewFile ? (
              <div className="file-viewer-box">
                <div className="file-viewer-header">
                  <div className="file-viewer-title">
                    <FileIcon />
                    {viewFile.filename}
                  </div>
                  <div className="file-viewer-actions">
                    {!editMode && canWrite && (
                      <>
                        <button className="btn btn-sm" onClick={() => { setEditBuf(viewFile.content); setEditMode(true); }}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteFile(viewFile._id)}>Delete</button>
                      </>
                    )}
                    <button className="btn btn-invisible btn-sm" onClick={() => { setViewFile(null); setEditMode(false); }}>
                      ← Back
                    </button>
                  </div>
                </div>
                {editMode ? (
                  <div className="file-edit-area">
                    <textarea className="textarea" style={{ minHeight: "300px", fontFamily: "monospace", fontSize: "12px" }}
                      value={editBuf} onChange={e => setEditBuf(e.target.value)} disabled={fSaving} />
                    <div className="file-edit-actions">
                      <button className="btn btn-sm" onClick={() => setEditMode(false)} disabled={fSaving}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={saveFile} disabled={fSaving}>
                        {fSaving ? <><span className="spinner" /> Saving…</> : "Commit changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <pre className="file-code">{viewFile.content || "(empty file)"}</pre>
                )}
              </div>

            ) : (
              <div className="file-browser-box">
                <div className="file-browser-bar">
                  <h4>Files</h4>
                  {canWrite && (
                    <button className="btn btn-primary btn-sm" onClick={() => setAddingFile(true)}>
                      Add file
                    </button>
                  )}
                </div>
                {files.length === 0 ? (
                  <div className="empty-repo">
                    <h3>Get started</h3>
                    <p>This repository is empty — add your first file to get started.</p>
                    {canWrite && (
                      <button className="btn btn-primary" onClick={() => setAddingFile(true)}>
                        Add file
                      </button>
                    )}
                  </div>
                ) : (
                  <ul className="file-list">
                    {files.map(f => (
                      <li key={f._id} className="file-row" onClick={() => openFile(f._id)}>
                        <FileIcon />
                        <span className="file-row-name">{f.filename}</span>
                        <span className="file-row-date">
                          {f.updatedAt ? new Date(f.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════ ISSUES TAB ════════════════ */}
        {tab === "issues" && (
          <div className="issues-pane">
            {selIssue ? (
              /* Issue detail */
              <>
                <div className="issue-detail-header">
                  <div className="issue-detail-title-row">
                    <h2 className="issue-detail-title">
                      {selIssue.title}
                      <span style={{ color: "var(--color-fg-muted)", fontWeight: 300, marginLeft: "8px" }}>
                        #{issues.findIndex(i => i._id === selIssue._id) + 1}
                      </span>
                    </h2>
                    <div className="issue-detail-meta">
                      <span className={`badge ${selIssue.status === "open" ? "badge-open" : "badge-closed"}`}>
                        {selIssue.status === "open" ? <OpenIssueIcon /> : <ClosedIssueIcon />}
                        {selIssue.status === "open" ? " Open" : " Closed"}
                      </span>
                      <span>Created {new Date(selIssue.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button className="btn btn-sm" onClick={() => toggleIssueStatus(selIssue)}>
                      {selIssue.status === "open" ? "Close issue" : "Reopen issue"}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteIssue(selIssue)}>Delete</button>
                    <button className="btn btn-invisible btn-sm" onClick={() => setSelIssue(null)}>← Back</button>
                  </div>
                </div>

                {/* Original description as first "comment" */}
                <div className="comment-list">
                  <div className="comment-card">
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author-name">Original description</span>
                      </div>
                      <div className="comment-text">{selIssue.description}</div>
                    </div>
                  </div>

                  {/* Comments */}
                  {comments.map(c => (
                    <div key={c._id} className="comment-card">
                      <div className="comment-body">
                        <div className="comment-header">
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div className="avatar avatar-sm">{(c.author?.username || "?")[0].toUpperCase()}</div>
                            <span className="comment-author-name">{c.author?.username || "Unknown"}</span>
                            <span className="comment-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <button className="btn btn-invisible btn-sm" onClick={() => deleteComment(c._id)}>Delete</button>
                        </div>
                        <div className="comment-text">{c.content}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add comment */}
                <div className="add-comment-box">
                  <div className="avatar avatar-md">Y</div>
                  <div className="add-comment-form">
                    <textarea
                      className="textarea"
                      placeholder="Leave a comment"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      style={{ minHeight: "100px" }}
                    />
                    <div className="add-comment-actions">
                      <button className="btn btn-primary btn-sm" onClick={postComment}
                        disabled={postingCmt || !commentText.trim()}>
                        {postingCmt ? <><span className="spinner" /> Posting…</> : "Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Issue list */
              <>
                {/* Issues toolbar */}
                <div className="issues-bar">
                  <div className="issues-bar-tabs">
                    <button className={`issues-bar-tab ${issueFilter === "open" ? "active" : ""}`}
                      onClick={() => setIssueFilter("open")}>
                      <OpenIssueIcon /> {openIssues.length} Open
                    </button>
                    <button className={`issues-bar-tab ${issueFilter === "closed" ? "active" : ""}`}
                      onClick={() => setIssueFilter("closed")}>
                      <ClosedIssueIcon /> {closedIssues.length} Closed
                    </button>
                  </div>
                  <Link to={`/repo/${id}/issues/new`} className="btn btn-primary btn-sm">New issue</Link>
                </div>

                {shownIssues.length === 0 ? (
                  <div className="issue-empty">
                    <h3>No {issueFilter} issues</h3>
                    <p>{issueFilter === "open" ? "Everything is looking good! Ready to create a new issue?" : "No closed issues yet."}</p>
                    {issueFilter === "open" && <Link to={`/repo/${id}/issues/new`} className="btn btn-primary">New issue</Link>}
                  </div>
                ) : (
                  <div className="issue-list">
                    {shownIssues.map(issue => (
                      <div key={issue._id} className="issue-list-row" onClick={() => viewIssue(issue)}>
                        <div className="issue-status-icon" style={{ color: issue.status === "open" ? "var(--color-success-fg)" : "var(--color-done-fg)" }}>
                          {issue.status === "open" ? <OpenIssueIcon /> : <ClosedIssueIcon />}
                        </div>
                        <div className="issue-row-body">
                          <div className="issue-row-title">{issue.title}</div>
                          <div className="issue-row-meta">
                            Opened {new Date(issue.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="issue-row-actions" onClick={e => e.stopPropagation()}>
                          <button className="btn btn-sm" onClick={() => toggleIssueStatus(issue)}>
                            {issue.status === "open" ? "Close" : "Reopen"}
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteIssue(issue)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════ SETTINGS TAB (owner only) ═════ */}
        {tab === "settings" && isOwner && (
          <div className="settings-pane">
            {/* Collaborators list */}
            <div className="settings-box">
              <div className="settings-box-header">Collaborators</div>
              <div className="settings-content">
                {repo.collaborators?.length === 0
                  ? <p style={{ color: "var(--color-fg-muted)", fontSize: "14px" }}>No collaborators yet.</p>
                  : repo.collaborators.map(c => {
                    const cid  = c._id  || c;
                    const name = c.username || "Unknown";
                    const mail = c.email    || "";
                    return (
                      <div key={cid} className="collab-row">
                        <div className="collab-info">
                          <div className="avatar avatar-sm">{name[0].toUpperCase()}</div>
                          <div>
                            <div className="name">{name}</div>
                            <div className="email">{mail}</div>
                          </div>
                        </div>
                        <button className="btn btn-sm btn-danger" onClick={() => removeCollab(cid)}>Remove</button>
                      </div>
                    );
                  })
                }
              </div>
            </div>

            {/* Add collaborator */}
            <div className="settings-box">
              <div className="settings-box-header">Add collaborator</div>
              <div className="settings-content">
                <p style={{ fontSize: "13px", color: "var(--color-fg-muted)" }}>
                  Collaborators can read, write and manage files and issues in this repository.
                </p>
                <div className="collab-search-row">
                  <input
                    className="input"
                    placeholder="Search by username…"
                    value={collabQuery}
                    onChange={e => setCollabQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); searchCollabs(); } }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={searchCollabs}>Search</button>
                </div>
                {collabResults.length > 0 && (
                  <div className="collab-results">
                    {collabResults.map(u => (
                      <div key={u._id} className="collab-result-row">
                        <div className="collab-info">
                          <div className="avatar avatar-sm">{u.username[0].toUpperCase()}</div>
                          <div>
                            <div className="name">{u.username}</div>
                            <div className="email">{u.email}</div>
                          </div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => addCollab(u._id)}>Add</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Danger zone */}
            <div className="settings-box danger">
              <div className="settings-box-header">Danger Zone</div>
              <div className="settings-content">
                <div className="danger-row">
                  <div className="danger-row-text">
                    <div className="title">Change repository visibility</div>
                    <div className="desc">Make this repository {repo.visibility ? "private" : "public"}.</div>
                  </div>
                  <button className="btn btn-sm" onClick={handleToggleVis}>
                    {repo.visibility ? "Make private" : "Make public"}
                  </button>
                </div>
                <div className="danger-row">
                  <div className="danger-row-text">
                    <div className="title" style={{ color: "var(--color-danger-fg)" }}>Delete this repository</div>
                    <div className="desc">Once you delete a repository, there is no going back.</div>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={handleDeleteRepo}>Delete this repository</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RepoDetail;
