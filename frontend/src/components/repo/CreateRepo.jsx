import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import Navbar from "../Navbar";
import "./repo.css";

const CreateRepo = () => {
  const [name, setName]             = useState("");
  const [desc, setDesc]             = useState("");
  const [pub, setPub]               = useState(true);
  const [loading, setLoading]       = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim().replace(/\s+/g, "-");
    if (!cleanName) { alert("Name is required"); return; }
    try {
      setLoading(true);
      const res = await API.post("/repo/create", { name: cleanName, description: desc, visibility: pub });
      navigate(`/repo/${res.data.repositoryID}`);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create repository");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="repo-page">
        <div className="create-repo-wrapper">
          <h2>Create a new repository</h2>
          <p className="create-repo-sub">
            A repository contains all project files, including the revision history.
          </p>

          <form onSubmit={onSubmit} className="create-repo-form">
            <div>
              <label className="label">Repository name *</label>
              <input className="input" placeholder="e.g. my-awesome-project"
                value={name} onChange={e => setName(e.target.value)} disabled={loading} autoFocus />
              <p className="field-hint">Spaces will be converted to hyphens.</p>
            </div>

            <div>
              <label className="label">Description <span style={{ fontWeight: 400, color: "var(--color-fg-muted)" }}>(optional)</span></label>
              <input className="input" placeholder="Short description of your repo"
                value={desc} onChange={e => setDesc(e.target.value)} disabled={loading} />
            </div>

            <div>
              <label className="label">Visibility</label>
              <div className="visibility-options">
                <label className={`radio-card ${pub ? "selected" : ""}`}>
                  <input type="radio" name="vis" checked={pub} onChange={() => setPub(true)} />
                  <div className="radio-card-body">
                    <span className="radio-card-title">Public</span>
                    <span className="radio-card-desc">Anyone on the internet can see this repository. You choose who can commit.</span>
                  </div>
                </label>
                <label className={`radio-card ${!pub ? "selected" : ""}`}>
                  <input type="radio" name="vis" checked={!pub} onChange={() => setPub(false)} />
                  <div className="radio-card-body">
                    <span className="radio-card-title">Private</span>
                    <span className="radio-card-desc">You choose who can see and commit to this repository.</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" /> Creating…</> : "Create repository"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateRepo;
