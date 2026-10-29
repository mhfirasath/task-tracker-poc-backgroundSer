import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import adminApi from "../api/adminApi";
import type { Task } from "../types/Task";
import { defaultTaskFilters } from "../types/TaskFilters";
import type { TaskFilters } from "../types/TaskFilters";
import { matchesTaskFilters } from "../utils/taskFilters";
import TaskFilterBar from "./TaskFilterBar";

const SEARCH_DEBOUNCE_MS = 300;

interface UserSummary {
  userId: number;
  total: number;
  completed: number;
}

interface Props {
  token: string;
  onUnauthorized: () => void;
}

function AdminPanel({ token, onUnauthorized }: Props) {
  const [filters, setFilters] = useState<TaskFilters>(defaultTaskFilters);
  const [appliedFilters, setAppliedFilters] = useState<TaskFilters>(defaultTaskFilters);
  const [userId, setUserId] = useState("");
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [newUserId, setNewUserId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState("");
  const latestRequestId = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedFilters(filters), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [filters]);

  const selectedUserId = userId === "" ? undefined : Number(userId);

  useEffect(() => {
    const requestId = ++latestRequestId.current;

    // Per-user totals come from the unfiltered list so the user picker stays complete.
    Promise.all([
      adminApi.getTasks(token, appliedFilters, selectedUserId),
      adminApi.getTasks(token, defaultTaskFilters),
    ])
      .then(([filtered, everything]) => {
        if (requestId !== latestRequestId.current) return;
        setTasks(filtered);
        setAllTasks(everything);
        setError("");
      })
      .catch((err: { response?: { status?: number } }) => {
        if (requestId !== latestRequestId.current) return;
        if (err.response?.status === 401 || err.response?.status === 403) {
          onUnauthorized();
          return;
        }
        setError("Unable to load tasks. Check that your account has admin access.");
      })
      .finally(() => {
        if (requestId === latestRequestId.current) setHasLoaded(true);
      });
  }, [token, appliedFilters, selectedUserId, reloadKey, onUnauthorized]);

  const users = useMemo<UserSummary[]>(() => {
    const byUser = new Map<number, UserSummary>();
    for (const task of allTasks) {
      if (task.userId === undefined) continue;
      const entry = byUser.get(task.userId) ?? { userId: task.userId, total: 0, completed: 0 };
      entry.total += 1;
      if (task.completed) entry.completed += 1;
      byUser.set(task.userId, entry);
    }
    return [...byUser.values()].sort((a, b) => a.userId - b.userId);
  }, [allTasks]);

  const visibleTasks = tasks.filter(
    (task) =>
      matchesTaskFilters(task, appliedFilters) &&
      (selectedUserId === undefined || task.userId === selectedUserId),
  );

  const createTask = async (event: FormEvent) => {
    event.preventDefault();
    setCreateError("");

    try {
      await adminApi.createTask(token, {
        userId: Number(newUserId),
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      });
      setNewTitle("");
      setNewDescription("");
      setReloadKey((key) => key + 1);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Unable to create the task.");
    }
  };

  return (
    <main className="main-content">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Every user, every task.</h1>
          <p className="intro-copy">Monitor progress across all accounts and add tasks on behalf of any user.</p>
        </div>
        <div className="task-summary" aria-label={`${visibleTasks.length} tasks shown`}>
          <strong>{visibleTasks.length}</strong>
          <span>Tasks shown</span>
        </div>
      </section>

      <section className="task-panel" aria-labelledby="admin-tasks-heading">
        <div className="panel-heading">
          <div>
            <h2 id="admin-tasks-heading">All tasks</h2>
            <p>{users.length} users with tasks</p>
          </div>
          <select
            className="admin-user-select"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            aria-label="Filter by user"
          >
            <option value="">All users</option>
            {users.map((user) => (
              <option key={user.userId} value={user.userId}>
                User {user.userId} ({user.completed}/{user.total} done)
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error-message" role="alert">{error}</p>}

        <form className="task-form" onSubmit={createTask}>
          <input
            type="number"
            min="1"
            value={newUserId}
            onChange={(event) => setNewUserId(event.target.value)}
            placeholder="User ID"
            aria-label="User ID"
            required
          />
          <input
            type="text"
            maxLength={100}
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Task title"
            aria-label="Task title"
            required
          />
          <input
            type="text"
            maxLength={500}
            value={newDescription}
            onChange={(event) => setNewDescription(event.target.value)}
            placeholder="Description (optional)"
            aria-label="Task description"
          />
          <button type="submit">Add for user</button>
        </form>
        {createError && <p className="error-message" role="alert">{createError}</p>}

        <TaskFilterBar filters={filters} onChange={setFilters} />

        {visibleTasks.length > 0 && (
          <div className="table-wrap">
            <table className="task-table admin-table">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Task</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task) => (
                  <tr key={task.id} className={task.completed ? "is-complete" : ""}>
                    <td>User {task.userId ?? "-"}</td>
                    <td className="task-title-cell">
                      <strong>{task.title}</strong>
                      {task.description && <p className="task-description">{task.description}</p>}
                    </td>
                    <td>
                      <span className={`status-badge ${task.completed ? "complete" : "open"}`}>
                        {task.completed ? "Complete" : "In progress"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasLoaded && visibleTasks.length === 0 && !error && (
          <div className="empty-state">
            <span className="empty-icon">?</span>
            <strong>No tasks found</strong>
            <p>Try a different search, user or status.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminPanel;
