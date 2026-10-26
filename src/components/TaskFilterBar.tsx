import type { TaskFilters, TaskStatusFilter } from "../types/TaskFilters";

interface Props {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

const statusOptions: { value: TaskStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "In progress" },
  { value: "complete", label: "Complete" },
];

function TaskFilterBar({ filters, onChange }: Props) {
  return (
    <div className="task-filter-bar" role="search">
      <input
        className="task-search-input"
        type="search"
        value={filters.q}
        onChange={(event) => onChange({ ...filters, q: event.target.value })}
        placeholder="Search tasks by title or description"
        aria-label="Search tasks"
      />
      <div className="status-filter" role="group" aria-label="Filter by status">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`status-filter-button ${filters.status === option.value ? "active" : ""}`}
            aria-pressed={filters.status === option.value}
            onClick={() => onChange({ ...filters, status: option.value })}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TaskFilterBar;
