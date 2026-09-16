import { useEffect, useState } from "react";
//test123

import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

import taskApi from "./api/taskApi";
import type { Task } from "./types/Task";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    const taskList = await taskApi.getTasks();
    setTasks(taskList);
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  const addTask = async (title: string) => {
    await taskApi.createTask({
      title,
      description: "",
    });

    await loadTasks();
  };

  const toggleTask = async (
    task: Task
  ) => {
    await taskApi.updateTask(task.id, {
      completed: !task.completed,
    });

    await loadTasks();
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

          {error && <p className="error-message" role="alert">{error}</p>}

          <TaskForm onAddTask={addTask} />
          <TaskList
            tasks={tasks}
            onToggle={toggleTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
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