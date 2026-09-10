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
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="Task Tracker home">
            <span className="brand-mark">T</span>
            <span>Task Tracker</span>
          </a>
          <span className="header-status">Personal workspace</span>
        </div>
      </header>

      <main className="main-content">
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

          <TaskForm onAddTask={addTask} />
          <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
        </section>
      </main>

      <footer className="site-footer">
        <span>Task Tracker</span>
        <span>Make progress visible.</span>
      </footer>
    </div>
  );
}

export default App;