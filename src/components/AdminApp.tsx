import { useCallback, useState } from "react";
import type { FormEvent } from "react";

import adminApi, { ADMIN_TOKEN_KEY } from "../api/adminApi";
import AdminPanel from "./AdminPanel";

function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      onLogin(await adminApi.login(username, password));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in as admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <main className="login-card">
        <div className="login-brand" aria-hidden="true">T</div>
        <p className="eyebrow">Administration</p>
        <h1>Sign in to Admin Console.</h1>
        <p className="login-copy">Use an administrator account to monitor and manage user tasks.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-username">Username</label>
          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : "Sign in"}
          </button>
        </form>
      </main>
    </div>
  );
}

function AdminApp() {
  const [token, setToken] = useState<string | null>(() =>
    window.sessionStorage.getItem(ADMIN_TOKEN_KEY),
  );

  const handleLogin = (newToken: string) => {
    window.sessionStorage.setItem(ADMIN_TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const handleLogout = useCallback(() => {
    window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
  }, []);

  if (!token) return <AdminLogin onLogin={handleLogin} />;

  return (
    <div className="authenticated-shell">
      <aside className="side-nav">
        <a className="brand" href="#/admin" aria-label="Task Tracker admin home">
          <span className="brand-mark">T</span>
          <span>Task Tracker</span>
        </a>
        <nav aria-label="Main navigation">
          <button className="nav-item active" type="button">
            <span aria-hidden="true">✓</span>
            All tasks
          </button>
        </nav>
        <div className="side-nav-footer">
          <span className="user-avatar">A</span>
          <div>
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>
          <button className="logout-button" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="page-area">
        <header className="top-bar">
          <span className="header-status">Admin console</span>
          <span className="top-bar-date">Task Tracker</span>
        </header>
        <AdminPanel token={token} onUnauthorized={handleLogout} />
      </div>
    </div>
  );
}

export default AdminApp;
