import { useEffect, useState } from "react";

import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

import api from "./api/taskApi";
import type { Task } from "./types/Task";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = async () => {
    const response = await api.get("/tasks");
    setTasks(response.data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (title: string) => {
    await api.post("/tasks", {
      title,
      description: "",
    });

    loadTasks();
  };

  const toggleTask = async (
    task: Task
  ) => {
    await api.patch(`/tasks/${task.id}`, {
      completed: !task.completed,
    });

    loadTasks();
  };

  const deleteTask = async (
    id: number
  ) => {
    await api.delete(`/tasks/${id}`);

    loadTasks();
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
      }}
    >
      <h1>Task Tracker</h1>

      <TaskForm
        onAddTask={addTask}
      />

      <TaskList
        tasks={tasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />
    </div>
  );
}

export default App;