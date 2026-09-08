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
  return (
    <>
      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px",
            border: "1px solid #ddd",
            marginTop: "10px",
          }}
        >
          <div>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task)}
            />

            <span
              style={{
                marginLeft: "10px",
                textDecoration: task.completed
                  ? "line-through"
                  : "none",
              }}
            >
              {task.title}
            </span>
          </div>

          <button
            onClick={() => onDelete(task.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </>
  );
}

export default TaskList;