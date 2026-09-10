import { useState } from "react";

interface Props {
  onAddTask: (title: string) => void;
}

function TaskForm({ onAddTask }: Props) {
  const [title, setTitle] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;

    onAddTask(title);
    setTitle("");
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        aria-label="New task title"
        placeholder="What needs to get done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button type="submit">
        Add task
      </button>
    </form>
  );
}

export default TaskForm;