import { useState } from "react";

import type { Task } from "../types/Task";

interface Props {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onUpdate: (task: Task, title: string) => Promise<void>;
  onDelete: (id: number) => void;
}

function TaskList({
  tasks,
  onToggle,
  onUpdate,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveTask = async (task: Task) => {
    const title = editTitle.trim();
    if (!title || savingId === task.id) return;

    setSavingId(task.id);

    try {
      await onUpdate(task, title);
      cancelEditing();
    } catch {
      // Keep the editor open so the user can retry after a failed request.
    } finally {
      setSavingId(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">+</span>
        <strong>Your task list is clear</strong>
        <p>Add your first task above to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th scope="col">Task</th>
            <th scope="col">Status</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className={task.completed ? "is-complete" : ""}>
              <td className="task-title-cell">
                {editingId === task.id ? (
                  <input
                    className="edit-task-input"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void saveTask(task);
                      if (event.key === "Escape") cancelEditing();
                    }}
                    aria-label={`Edit ${task.title}`}
                    autoFocus
                  />
                ) : (
                  <label className="task-check">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggle(task)}
                      aria-label={`Mark ${task.title} as ${task.completed ? "open" : "complete"}`}
                    />
                    <span className="checkmark" aria-hidden="true" />
                    <span>{task.title}</span>
                  </label>
                )}
              </td>
              <td>
                <span className={`status-badge ${task.completed ? "complete" : "open"}`}>
                  {task.completed ? "Complete" : "In progress"}
                </span>
              </td>
              <td className="action-cell">
                {editingId === task.id ? (
                  <div className="edit-actions">
                    <button
                      className="save-button"
                      type="button"
                      onClick={() => void saveTask(task)}
                      disabled={savingId === task.id}
                    >
                      {savingId === task.id ? "Saving..." : "Save"}
                    </button>
                    <button className="cancel-button" type="button" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="row-actions">
                    <button className="edit-button" type="button" onClick={() => startEditing(task)}>
                      Edit
                    </button>
                    <button className="delete-button" type="button" onClick={() => onDelete(task.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TaskList;