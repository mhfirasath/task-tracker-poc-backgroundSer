import type { Task } from "../types/Task";

interface Props {
  tasks: Task[];
}

function Dashboard({ tasks }: Props) {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const openTasks = tasks.length - completedTasks;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  return (
    <main className="dashboard-content">
      <section className="dashboard-welcome">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Good to see you, admin.</h1>
          <p className="intro-copy">Here is the current rhythm of your work.</p>
        </div>
        <div className="progress-ring" aria-label={`${completionRate}% of tasks complete`}>
          <strong>{completionRate}%</strong>
          <span>complete</span>
        </div>
      </section>

      <section className="metric-grid" aria-label="Task statistics">
        <article className="metric-card metric-card-teal">
          <span className="metric-label">Total tasks</span>
          <strong>{tasks.length}</strong>
          <span>Across your workspace</span>
        </article>
        <article className="metric-card metric-card-coral">
          <span className="metric-label">Open tasks</span>
          <strong>{openTasks}</strong>
          <span>Still moving forward</span>
        </article>
        <article className="metric-card metric-card-ink">
          <span className="metric-label">Completed</span>
          <strong>{completedTasks}</strong>
          <span>Progress made so far</span>
        </article>
      </section>

      <section className="dashboard-panel" aria-labelledby="recent-tasks-heading">
        <div className="panel-heading">
          <div>
            <h2 id="recent-tasks-heading">Recent tasks</h2>
            <p>A quick look at what is on your plate.</p>
          </div>
          <span className="task-count">{openTasks} open</span>
        </div>
        {tasks.length === 0 ? (
          <p className="dashboard-empty">Your task list is clear. Add a task from the Tasks page.</p>
        ) : (
          <ul className="recent-task-list">
            {tasks.slice(0, 5).map((task) => (
              <li key={task.id} className={task.completed ? "is-complete" : ""}>
                <span className="recent-task-status" aria-hidden="true" />
                <span>{task.title}</span>
                <span className={`status-badge ${task.completed ? "complete" : "open"}`}>
                  {task.completed ? "Complete" : "In progress"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
