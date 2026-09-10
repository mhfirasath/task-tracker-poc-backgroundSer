import type { Task } from "../types/Task";

interface Props {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (id: number) => void;
}

function TaskList({
  tasks,
  onToggle,
  onDelete,
}: Props) {
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
              </td>
              <td>
                <span className={`status-badge ${task.completed ? "complete" : "open"}`}>
                  {task.completed ? "Complete" : "In progress"}
                </span>
              </td>
              <td className="action-cell">
                <button className="delete-button" type="button" onClick={() => onDelete(task.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TaskList;