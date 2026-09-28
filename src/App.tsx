import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import Dashboard from "./components/Dashboard";

import authApi from "./api/authApi";
import taskApi from "./api/taskApi";
import type { AuthSession } from "./api/authApi";
import type { Task } from "./types/Task";

function LoginPage({ onLogin }: { onLogin: (session: AuthSession) => void }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await authApi.register(username, password);
      }

      const session = await authApi.login(username, password);
      onLogin(session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to authenticate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <main className="login-card">
        <div className="login-brand" aria-hidden="true">T</div>
        <p className="eyebrow">{isRegistering ? "Get started" : "Welcome back"}</p>
        <h1>{isRegistering ? "Create your Task Tracker account." : "Sign in to Task Tracker."}</h1>
        <p className="login-copy">
          {isRegistering
            ? "Create an account to keep your personal tasks separate and secure."
            : "Pick up where you left off and keep your priorities moving."}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegistering ? "Already have an account?" : "New to Task Tracker?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError("");
              setIsRegistering((current) => !current);
            }}
          >
            {isRegistering ? "Sign in" : "Create an account"}
          </button>
        </p>
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activePage, setActivePage] = useState<"dashboard" | "tasks">("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    const taskList = await taskApi.getTasks();
    setTasks(taskList);
  };

  useEffect(() => {
    if (!session) return;
    void loadTasks();
  }, [session]);

  if (!session) {
    return <LoginPage onLogin={setSession} />;
  }

  const addTask = async (title: string) => {
    await taskApi.createTask({
      title,
      description: "",
    });

    await loadTasks();
  };

  const toggleTask = async (task: Task) => {
    setError("");

    try {
      const updatedTask = await taskApi.updateTask(task.id, {
        completed: !task.completed,
      });

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask,
        ),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update task status.");
      return;
    }

    try {
      await loadTasks();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reload tasks.");
    }
  };

  const updateTask = async (task: Task, title: string) => {
    setError("");
    let updatedTask: Task;

    try {
      updatedTask = await taskApi.updateTask(task.id, {
        title,
        description: task.description ?? "",
        completed: task.completed,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update task.");
      throw requestError;
    }

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === updatedTask.id ? updatedTask : currentTask,
      ),
    );

    try {
      await loadTasks();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reload tasks.");
    }
  };

  const deleteTask = async (
    id: number
  ) => {
    await taskApi.deleteTask(id);

    await loadTasks();
  };

  const handleLogout = () => {
    window.sessionStorage.clear();
    setTasks([]);
    setError("");
    setActivePage("dashboard");
    setSession(null);
  };

  return (
    <div className="authenticated-shell">
      <aside className="side-nav">
        <a className="brand" href="/" aria-label="Task Tracker home">
          <span className="brand-mark">T</span>
          <span>Task Tracker</span>
        </a>
        <nav aria-label="Main navigation">
          <button
            className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
            type="button"
            onClick={() => setActivePage("dashboard")}
          >
            <span aria-hidden="true">▦</span>
            Dashboard
          </button>
          <button
            className={`nav-item ${activePage === "tasks" ? "active" : ""}`}
            type="button"
            onClick={() => setActivePage("tasks")}
          >
            <span aria-hidden="true">✓</span>
            Tasks
          </button>
        </nav>
        <div className="side-nav-footer">
          <span className="user-avatar">A</span>
          <div>
            <strong>{session.username}</strong>
            <span>Personal workspace</span>
          </div>
          <button className="logout-button" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="page-area">
        <header className="top-bar">
          <span className="header-status">Personal workspace</span>
          <span className="top-bar-date">Task Tracker</span>
        </header>

        {activePage === "dashboard" ? <Dashboard tasks={tasks} username={session.username} /> : <main className="main-content">
        <section className="page-intro">
          <div>
            <p className="eyebrow">Your productivity, organized</p>
            <h1>Keep every task moving.</h1>
            <p className="intro-copy">
              Capture what matters, then make steady progress one task at a time.
            </p>
          </div>
          <div className="task-summary" aria-label={`${tasks.length} total tasks`}>
            <strong>{tasks.length}</strong>
            <span>Total tasks</span>
          </div>
        </section>

        <section className="workspace-panel" aria-labelledby="task-list-heading">
          <div className="panel-heading">
            <div>
              <h2 id="task-list-heading">Task list</h2>
              <p>Stay on top of your priorities.</p>
            </div>
            <span className="task-count">{tasks.filter((task) => !task.completed).length} open</span>
          </div>

          {error && <p className="error-message" role="alert">{error}</p>}

          <TaskForm onAddTask={addTask} />
          <TaskList
            tasks={tasks}
            onToggle={toggleTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        </section>
      </main>}

      <footer className="site-footer">
        <span>Task Tracker</span>
        <span>Make progress visible.</span>
      </footer>
      </div>
    </div>
  );
}

export default App;