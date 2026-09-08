import { useState } from "react";

interface Props {
  onAddTask: (title: string) => void;
}

function TaskForm({ onAddTask }: Props) {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;

    onAddTask(title);
    setTitle("");
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter task"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={handleSubmit}>
        Add Task
      </button>
    </div>
  );
}

export default TaskForm;