import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "taskflow-kanban-data";

const initialTasks = [
  {
    id: "task-1",
    title: "Design dashboard layout",
    description: "Create a clean and responsive dashboard design.",
    status: "todo",
    priority: "high",
    dueDate: "2025-12-20",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Create navigation bar",
    description: "Build responsive navigation for desktop and mobile.",
    status: "progress",
    priority: "medium",
    dueDate: "2025-12-22",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Build login screen",
    description: "Create the frontend login page.",
    status: "done",
    priority: "low",
    dueDate: "2025-12-18",
    createdAt: new Date().toISOString(),
  },
];

const columns = [
  { id: "todo", title: "To Do", color: "#64748b" },
  { id: "progress", title: "In Progress", color: "#f59e0b" },
  { id: "done", title: "Completed", color: "#10b981" },
];

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  } catch {
    return initialTasks;
  }
}

function createId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [toast, setToast] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function handleGlobalShortcut(event) {
      const isCommandKey = event.metaKey || event.ctrlKey;

      if (isCommandKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setCommandOpen(false);
        setActiveModal(null);
      }
    }

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, []);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return tasks.filter((task) => {
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.description.toLowerCase().includes(normalizedSearch);

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, priorityFilter]);

  function showToast(message) {
    setToast(message);
  }

  function openCreateModal() {
    setSelectedTask(null);
    setActiveModal("task");
  }

  function openEditModal(task) {
    setSelectedTask(task);
    setActiveModal("task");
  }

  function closeModal() {
    setActiveModal(null);
    setSelectedTask(null);
  }

  function saveTask(formData) {
    if (selectedTask?.id) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === selectedTask.id ? { ...task, ...formData } : task,
        ),
      );
      showToast("Task updated successfully.");
    } else {
      const newTask = {
        ...formData,
        id: createId(),
        createdAt: new Date().toISOString(),
      };
      setTasks((currentTasks) => [newTask, ...currentTasks]);
      showToast("New task created.");
    }
    closeModal();
  }

  function deleteTask(taskId) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const confirmed = window.confirm(`Delete "${task.title}"?`);
    if (!confirmed) return;

    setTasks((currentTasks) => currentTasks.filter((item) => item.id !== taskId));
    showToast("Task deleted.");
  }

  function moveTask(taskId, newStatus) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );
    showToast("Task moved successfully.");
  }

  function resetBoard() {
    const confirmed = window.confirm("Reset board to default tasks?");
    if (!confirmed) return;

    setTasks(initialTasks);
    showToast("Board reset successfully.");
  }

  function handleCommand(command) {
    setCommandOpen(false);

    if (command === "create") openCreateModal();
    if (command === "theme") setDarkMode((current) => !current);
    if (command === "reset") resetBoard();
  }

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">T</div>
          <div>
            <h1>TaskFlow</h1>
            <p>Simple project management</p>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            className="shortcut-button"
            onClick={() => setCommandOpen(true)}
            aria-label="Open command menu"
          >
            <span>⌘ K</span>
          </button>

          <button
            className="secondary-button"
            onClick={() => setDarkMode((current) => !current)}
          >
            {darkMode ? "☀ Light" : "☾ Dark"}
          </button>

          <button className="primary-button" onClick={openCreateModal}>
            + New Task
          </button>
        </div>
      </header>

      <main className="page-container">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">MY WORKSPACE</p>
            <h2>Good morning, welcome back.</h2>
            <p className="welcome-text">
              Organize your work and stay focused on what matters.
            </p>
          </div>

          <div className="summary-cards">
            <SummaryCard label="Total Tasks" value={tasks.length} icon="◈" />
            <SummaryCard
              label="In Progress"
              value={tasks.filter((task) => task.status === "progress").length}
              icon="◷"
            />
            <SummaryCard
              label="Completed"
              value={tasks.filter((task) => task.status === "done").length}
              icon="✓"
            />
          </div>
        </section>

        <section className="toolbar">
          <div className="search-wrapper">
            <span className="search-icon">⌕</span>
            <input
              type="search"
              placeholder="Search tasks..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search tasks"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            aria-label="Filter tasks by priority"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <button className="reset-button" onClick={resetBoard}>
            Reset Board
          </button>
        </section>

        <section className="board" aria-label="Task board">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={filteredTasks.filter((task) => task.status === column.id)}
              onMoveTask={moveTask}
              onEditTask={openEditModal}
              onDeleteTask={deleteTask}
            />
          ))}
        </section>
      </main>

      {activeModal === "task" && (
        <TaskModal task={selectedTask} onClose={closeModal} onSave={saveTask} />
      )}

      {commandOpen && (
        <CommandMenu
          onClose={() => setCommandOpen(false)}
          onCommand={handleCommand}
        />
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon }) {
  return (
    <div className="summary-card">
      <div className="summary-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Column({ column, tasks, onMoveTask, onEditTask, onDeleteTask }) {
  function handleDrop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    if (taskId) onMoveTask(taskId, column.id);
  }

  return (
    <section
      className="column"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      aria-labelledby={`column-${column.id}`}
    >
      <div className="column-header">
        <div className="column-title">
          <span className="status-dot" style={{ backgroundColor: column.color }} />
          <h3 id={`column-${column.id}`}>{column.title}</h3>
          <span className="task-count">{tasks.length}</span>
        </div>

        <button className="column-menu" aria-label={`${column.title} options`}>
          ⋯
        </button>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-column">
            <span>⌁</span>
            <p>No tasks here</p>
            <small>Drag a task into this column</small>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>

      <button
        className="add-task-button"
        onClick={() => {
          const newTask = {
            title: "",
            description: "",
            status: column.id,
            priority: "medium",
            dueDate: "",
          };
          onEditTask(newTask);
        }}
      >
        + Add task
      </button>
    </section>
  );
}

function TaskCard({ task, onEdit, onDelete }) {
  function handleDragStart(event) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("taskId", task.id);
  }

  return (
    <article className="task-card" draggable onDragStart={handleDragStart} tabIndex="0">
      <div className="task-card-top">
        <span className={`priority-badge ${task.priority}`}>{task.priority}</span>

        <div className="card-actions">
          <button
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            title="Edit task"
          >
            ✎
          </button>

          <button
            onClick={() => onDelete(task.id)}
            aria-label={`Delete ${task.title}`}
            title="Delete task"
          >
            ×
          </button>
        </div>
      </div>

      <h4>{task.title}</h4>

      <p className="task-description">
        {task.description || "No description added."}
      </p>

      <div className="task-card-footer">
        <span className="due-date">◷ {task.dueDate || "No due date"}</span>
        <div className="avatar">{task.title.charAt(0).toUpperCase() || "T"}</div>
      </div>
    </article>
  );
}

function TaskModal({ task, onClose, onSave }) {
  const isEditing = Boolean(task?.id);

  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    dueDate: task?.dueDate || "",
  });

  const titleInputRef = useRef(null);

  useEffect(() => {
    titleInputRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;

    onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    });
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">TASK DETAILS</p>
            <h2 id="task-modal-title">
              {isEditing ? "Edit task" : "Create new task"}
            </h2>
          </div>

          <button className="close-button" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Task title
            <input
              ref={titleInputRef}
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="e.g. Build landing page"
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              placeholder="Describe this task..."
              rows="4"
            />
          </label>

          <div className="form-row">
            <label>
              Status
              <select name="status" value={form.status} onChange={updateField}>
                <option value="todo">To Do</option>
                <option value="progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
            </label>

            <label>
              Priority
              <select name="priority" value={form.priority} onChange={updateField}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <label>
            Due date
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={updateField}
            />
          </label>

          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="primary-button">
              {isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CommandMenu({ onClose, onCommand }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    { id: "create", label: "Create a new task", description: "Add a task to your board", shortcut: "N" },
    { id: "theme", label: "Toggle dark mode", description: "Change the application theme", shortcut: "T" },
    { id: "reset", label: "Reset board", description: "Restore default tasks", shortcut: "R" },
  ];

  const filteredCommands = commands.filter((command) =>
    `${command.label} ${command.description}`.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, Math.max(filteredCommands.length - 1, 0)));
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const selected = filteredCommands[activeIndex];
        if (selected) onCommand(selected.id);
      }

      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, filteredCommands, onClose, onCommand]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <div
      className="modal-overlay command-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="command-menu" role="dialog" aria-modal="true" aria-label="Command menu">
        <div className="command-search">
          <span>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands..."
            aria-label="Search commands"
          />
          <kbd>ESC</kbd>
        </div>

        <div className="command-list">
          {filteredCommands.length === 0 ? (
            <p className="no-results">No commands found.</p>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                className={index === activeIndex ? "command-item active" : "command-item"}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => onCommand(command.id)}
              >
                <span className="command-icon">⌘</span>
                <span className="command-content">
                  <strong>{command.label}</strong>
                  <small>{command.description}</small>
                </span>
                <kbd>{command.shortcut}</kbd>
              </button>
            ))
          )}
        </div>

        <div className="command-footer">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}

export default App;
