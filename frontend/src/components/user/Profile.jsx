import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../../api";
import Navbar from "../Navbar";
import "./profile.css";

const LangDot = () => <span style={{ display:"inline-block",width:12,height:12,borderRadius:"50%",background:"var(--color-accent-fg)" }} />;

const Profile = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const me       = localStorage.getItem("userId");
  const profileId = id || me;
  const isOwnProfile = String(profileId) === String(me);

  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState("repos");
  const [editing,     setEditing]     = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy,  setFollowBusy]  = useState(false);

  // Edit fields
  const [editEmail, setEditEmail] = useState("");
  const [editPass,  setEditPass]  = useState("");
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const r = await API.get(`/userProfile/${profileId}`);
        if (!live) return;
        setUser(r.data);
        setEditEmail(r.data?.email || "");

        if (!isOwnProfile && me) {
          const mine = await API.get(`/userProfile/${me}`);
          if (!live) return;
          setIsFollowing((mine.data?.followedUsers || []).some(u => String(u._id) === String(profileId)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [profileId, isOwnProfile, me]);

  const refetch = async () => {
    const r = await API.get(`/userProfile/${profileId}`);
    setUser(r.data); setEditEmail(r.data?.email || "");
  };

  const handleFollow = async () => {
    try {
      setFollowBusy(true);
      await API.patch(`/user/follow/${profileId}`);
      setIsFollowing(!isFollowing);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally { setFollowBusy(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const body = {};
    if (editEmail && editEmail !== user.email) body.email = editEmail;
    if (editPass) body.password = editPass;
    if (!Object.keys(body).length) { alert("No changes"); return; }
    try {
      setSaving(true);
      await API.patch(`/updateProfile/${profileId}`, body);
      setEditPass(""); setEditing(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Delete your account? This cannot be undone.")) return;
    try {
      await API.delete(`/deleteProfile/${profileId}`);
      localStorage.removeItem("token"); localStorage.removeItem("userId");
      navigate("/auth");
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return (<><Navbar /><div className="profile-loading"><span className="spinner" /></div></>);
  if (!user)   return (<><Navbar /><div style={{ padding: "40px 24px" }}>User not found.</div></>);

  const repos   = user.repositories  || [];
  const starred = user.starRepos     || [];
  const follows = user.followedUsers || [];

  return (
    <>
      <Navbar username={user.username} />
      <div className="profile-page">
        {/* ── Sidebar ── */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-lg">{user.username[0].toUpperCase()}</div>

          <div>
            <h1 className="profile-name">{user.username}</h1>
            <p className="profile-username">@{user.username}</p>
          </div>

          <p className="profile-bio">{user.email}</p>

          <div className="profile-stats">
            <a>{follows.length} <span style={{ fontWeight: 400, color: "var(--color-fg-muted)" }}>following</span></a>
            <a>{repos.length} <span style={{ fontWeight: 400, color: "var(--color-fg-muted)" }}>repos</span></a>
          </div>

          {isOwnProfile
            ? <button className="btn" style={{ width: "100%" }} onClick={() => setEditing(!editing)}>
                {editing ? "Cancel edit" : "Edit profile"}
              </button>
            : <button className={`btn ${isFollowing ? "" : "btn-primary"}`} style={{ width: "100%" }}
                onClick={handleFollow} disabled={followBusy}>
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
          }
        </aside>

        {/* ── Main ── */}
        <div className="profile-main">
          {/* Edit form */}
          {isOwnProfile && editing && (
            <div className="profile-edit-card">
              <h3>Edit profile</h3>
              <form onSubmit={handleUpdate} className="profile-edit-form">
                <div>
                  <label className="label">Username</label>
                  <input className="input" value={user.username} disabled />
                  <p className="field-hint">Username cannot be changed.</p>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={editEmail}
                    onChange={e => setEditEmail(e.target.value)} disabled={saving} />
                </div>
                <div>
                  <label className="label">New password</label>
                  <input className="input" type="password" placeholder="Leave blank to keep current"
                    value={editPass} onChange={e => setEditPass(e.target.value)} disabled={saving} />
                </div>
                <div className="profile-edit-actions">
                  <button type="button" className="btn" onClick={() => { setEditing(false); setEditPass(""); }} disabled={saving}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner" /> Saving…</> : "Save changes"}
                  </button>
                </div>
              </form>

              <div className="profile-danger-card" style={{ marginTop: "20px" }}>
                <h4>Danger Zone</h4>
                <div className="profile-danger-row">
                  <div>
                    <div className="title">Delete account</div>
                    <div className="desc">Once you delete your account, there is no going back.</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>Delete account</button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="profile-tabnav">
            <button className={`profile-tab ${tab === "repos"     ? "active" : ""}`} onClick={() => setTab("repos")}>
              Repositories <span className="Counter">{repos.length}</span>
            </button>
            <button className={`profile-tab ${tab === "starred"   ? "active" : ""}`} onClick={() => setTab("starred")}>
              Stars <span className="Counter">{starred.length}</span>
            </button>
            <button className={`profile-tab ${tab === "following" ? "active" : ""}`} onClick={() => setTab("following")}>
              Following <span className="Counter">{follows.length}</span>
            </button>
          </div>

          {/* ── Repos ── */}
          {tab === "repos" && (
            <div className="profile-content">
              {repos.length === 0
                ? <p style={{ color: "var(--color-fg-muted)", padding: "12px 0" }}>
                    {isOwnProfile ? <><Link to="/create">Create your first repo</Link> to get started.</> : "No public repositories."}
                  </p>
                : repos.map(r => (
                  <div key={r._id} className="profile-repo-card">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/repo/${r._id}`} className="profile-repo-name">
                        {r.name}
                        <span className={`badge ${r.visibility ? "badge-public" : "badge-private"}`} style={{ fontSize: "12px" }}>
                          {r.visibility ? "Public" : "Private"}
                        </span>
                      </Link>
                      {r.description && <p className="profile-repo-desc">{r.description}</p>}
                      <div className="profile-repo-meta">
                        <span className="profile-repo-meta-item"><LangDot /> JavaScript</span>
                        <span className="profile-repo-meta-item">
                          Updated {new Date(r.updatedAt || r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* ── Starred ── */}
          {tab === "starred" && (
            <div className="profile-content">
              {starred.length === 0
                ? <p style={{ color: "var(--color-fg-muted)", padding: "12px 0" }}>
                    {isOwnProfile ? "You haven't starred any repositories yet." : "No starred repositories."}
                  </p>
                : starred.map(r => (
                  <div key={r._id} className="profile-repo-card">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/repo/${r._id}`} className="profile-repo-name">
                        {r.name}
                        <span className={`badge ${r.visibility ? "badge-public" : "badge-private"}`} style={{ fontSize: "12px" }}>
                          {r.visibility ? "Public" : "Private"}
                        </span>
                      </Link>
                      {r.description && <p className="profile-repo-desc">{r.description}</p>}
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* ── Following ── */}
          {tab === "following" && (
            <div className="profile-content">
              {follows.length === 0
                ? <p style={{ color: "var(--color-fg-muted)", padding: "12px 0" }}>
                    {isOwnProfile ? "You're not following anyone yet." : "Not following anyone."}
                  </p>
                : (
                  <div className="following-grid">
                    {follows.map(u => (
                      <Link key={u._id} to={`/profile/${u._id}`} className="following-card">
                        <div className="avatar avatar-sm">{u.username?.[0].toUpperCase() || "?"}</div>
                        {u.username}
                      </Link>
                    ))}
                  </div>
                )
              }
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
