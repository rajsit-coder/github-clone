import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api";
import { useAuth } from "../../useAuth";
import "./auth.css";

const GHIcon = () => (
  <svg height="48" viewBox="0 0 16 16" width="48" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.49c-2.22.48-2.69-.94-2.69-.94-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.22.82 1.22.82.71 1.21 1.87.86 2.33.66.07-.52.28-.86.51-1.06-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const { setCurrentUser }      = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) { alert("All fields are required"); return; }
    try {
      setLoading(true);
      const res = await API.post("/signup", { username, email, password });
      localStorage.setItem("token",  res.data.token);
      localStorage.setItem("userId", res.data.userId);
      setCurrentUser(res.data.userId);
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo"><GHIcon /></Link>
      <h2>Create your account</h2>

      <div className="auth-card">
        <form onSubmit={handleSignup}>
          <div className="auth-field">
            <label>Username</label>
            <input type="text" placeholder="Enter your username" value={username}
              onChange={e => setUsername(e.target.value)} disabled={loading} autoComplete="username" />
          </div>

          <div className="auth-field">
            <label>Email address</label>
            <input type="email" placeholder="Enter your email" value={email}
              onChange={e => setEmail(e.target.value)} disabled={loading} autoComplete="email" />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input type="password" placeholder="Create a password (8+ chars)" value={password}
              onChange={e => setPassword(e.target.value)} disabled={loading} autoComplete="new-password" />
            <p className="auth-hint">Use 8 or more characters with a mix of letters, numbers &amp; symbols.</p>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <><span className="auth-spinner" /> Creating account…</> : "Create account"}
          </button>
        </form>
      </div>

      <div className="auth-alt-card">
        Already have an account? <Link to="/auth">Sign in.</Link>
      </div>

      <footer className="auth-footer">
        <a href="#terms">Terms</a>
        <a href="#privacy">Privacy</a>
        <a href="#docs">Docs</a>
        <a href="#support">Support</a>
      </footer>
    </div>
  );
};

export default Signup;
