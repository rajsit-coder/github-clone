import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../api";
import Navbar from "../Navbar";
import "./repo.css";

const RepoSettings = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [repo, setRepo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentUser] = useState(() => localStorage.getItem("userId"));

    useEffect(() => {
        (async () => {
            try {
                const res = await API.get(`/repo/${id}`);
                setRepo(res.data);
            } catch (err) {
                console.error("Error fetching repo:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const refetchRepo = async () => {
        const res = await API.get(`/repo/${id}`);
        setRepo(res.data);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await API.get("/allUsers");
            const results = res.data.filter((u) =>
                u.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
                String(u._id) !== String(currentUser)
            );
            setSearchResults(results.slice(0, 10));
        } catch {
            alert("Failed to search users");
        }
    };

    const handleAddCollaborator = async (userId) => {
        try {
            await API.post(`/repo/${id}/collaborator`, { userId });
            refetchRepo();
            setSearchResults([]);
            setSearchQuery("");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add collaborator");
        }
    };

    const handleRemoveCollaborator = async (userId) => {
        try {
            await API.delete(`/repo/${id}/collaborator/${userId}`);
            refetchRepo();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to remove collaborator");
        }
    };

    const handleToggleVisibility = async () => {
        try {
            await API.patch(`/repo/toggle/${id}`);
            refetchRepo();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to toggle visibility");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this repository? This cannot be undone.")) return;
        try {
            await API.delete(`/repo/delete/${id}`);
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete repository");
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="repo-loading"><span className="spinner"></span></div>
            </>
        );
    }

    if (!repo) {
        return (
            <>
                <Navbar />
                <div className="repo-page"><p className="empty-text">Repository not found.</p></div>
            </>
        );
    }

    const isOwner = String(repo.owner?._id || repo.owner) === String(currentUser);

    if (!isOwner) {
        return (
            <>
                <Navbar />
                <div className="repo-page">
                    <p className="empty-text">You do not have permission to access settings.</p>
                    <Link to={`/repo/${id}`} className="btn">Back to repository</Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="settings-page">
                <Link to={`/repo/${id}`} className="text-muted" style={{ fontSize: "13px", marginBottom: "16px", display: "block" }}>
                    ← Back to {repo.name}
                </Link>
                <h2 style={{ fontSize: "20px", fontWeight: "400", marginBottom: "24px" }}>Repository Settings</h2>

                {/* Collaborators */}
                <div className="settings-section">
                    <h3>Collaborators</h3>
                    <p className="text-muted" style={{ marginBottom: "16px", fontSize: "13px" }}>
                        Collaborators can read, write, and manage files and issues in this repository.
                    </p>
                    {repo.collaborators && repo.collaborators.length > 0 ? (
                        repo.collaborators.map((c) => {
                            const collabId = typeof c === "object" ? c._id : c;
                            const collabUsername = typeof c === "object" ? c.username : "Unknown";
                            const collabEmail = typeof c === "object" ? c.email : "";
                            return (
                                <div key={collabId} className="settings-row">
                                    <div className="collab-user-info">
                                        <div className="avatar avatar-sm">{collabUsername.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <div className="username">{collabUsername}</div>
                                            <div className="email">{collabEmail}</div>
                                        </div>
                                    </div>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleRemoveCollaborator(collabId)}>Remove</button>
                                </div>
                            );
                        })
                    ) : (
                        <p className="empty-text">No collaborators yet.</p>
                    )}
                </div>

                {/* Add Collaborator */}
                <div className="settings-section">
                    <h3>Add Collaborator</h3>
                    <p className="text-muted" style={{ marginBottom: "16px", fontSize: "13px" }}>
                        Search for a user by username to add them as a collaborator.
                    </p>
                    <div className="collab-search-row">
                        <input
                            type="text"
                            className="input"
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
                        />
                        <button className="btn btn-primary btn-sm" onClick={handleSearch}>Search</button>
                    </div>
                    <div className="collab-search-results">
                        {searchResults.map((u) => (
                            <div key={u._id} className="collab-search-item">
                                <div className="collab-user-info">
                                    <div className="avatar avatar-sm">{u.username.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <div className="username">{u.username}</div>
                                        <div className="email">{u.email}</div>
                                    </div>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => handleAddCollaborator(u._id)}>Add</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="settings-section" style={{ borderColor: "rgba(248, 81, 73, 0.4)" }}>
                    <h3 style={{ color: "var(--danger-fg)" }}>Danger Zone</h3>
                    <div className="settings-row">
                        <div>
                            <div className="fwb" style={{ fontSize: "14px" }}>Change visibility</div>
                            <div className="text-muted" style={{ fontSize: "13px" }}>Make this repository {repo.visibility ? "private" : "public"}.</div>
                        </div>
                        <button className="btn btn-sm" onClick={handleToggleVisibility}>
                            {repo.visibility ? "Make Private" : "Make Public"}
                        </button>
                    </div>
                    <div className="settings-row">
                        <div>
                            <div className="fwb" style={{ fontSize: "14px", color: "var(--danger-fg)" }}>Delete this repository</div>
                            <div className="text-muted" style={{ fontSize: "13px" }}>Once you delete a repository, there is no going back.</div>
                        </div>
                        <button className="btn btn-sm btn-danger" onClick={handleDelete}>Delete</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RepoSettings;
