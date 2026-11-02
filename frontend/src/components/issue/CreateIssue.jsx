import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../api";
import Navbar from "../Navbar";
import "./issue.css";

const CreateIssue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle]   = useState("");
  const [body,  setBody]    = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { alert("Title and description are required"); return; }
    try {
      setSaving(true);
      await API.post(`/issue/create/${id}`, { title, description: body });
      navigate(`/repo/${id}`);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create issue");
    } finally { setSaving(false); }
  };

  return (
    <>
      <Navbar />
      <div className="new-issue-page">
        <div className="new-issue-breadcrumb">
          <Link to={`/repo/${id}`}>← Back to repository</Link>
        </div>

        <h2 className="new-issue-heading">New issue</h2>

        <div className="new-issue-layout">
          {/* Form */}
          <div className="new-issue-form-col">
            <form onSubmit={submit} className="new-issue-form">
              <div>
                <input
                  className="input new-issue-title"
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  disabled={saving}
                  autoFocus
                />
              </div>
              <div>
                <textarea
                  className="textarea new-issue-body"
                  placeholder="Leave a comment"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="new-issue-actions">
                <Link to={`/repo/${id}`} className="btn">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" /> Submitting…</> : "Submit new issue"}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar hints */}
          <aside className="new-issue-aside">
            <div className="new-issue-aside-section">
              <h4>Labels</h4>
              <p>None yet</p>
            </div>
            <div className="new-issue-aside-section">
              <h4>Assignees</h4>
              <p>No one assigned</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default CreateIssue;
