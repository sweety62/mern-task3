import { useEffect, useState } from "react";

const API = "http://localhost:9000";

export default function App() {
  const [tasks, setTasks]   = useState([]);
  const [text, setText]     = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState("all");

  
  const fetchTasks = async () => {
    try {
      const res  = await fetch(`${API}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const loadTasks = async () => {
    await fetchTasks();
  };

  loadTasks();
}, []);


  const addTask = async () => {
    if (!text.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res  = await fetch(`${API}/add`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTasks([data, ...tasks]);
      setText("");
    } catch (e) {
      setError(e.message || "Failed to add task.");
    } finally {
      setAdding(false);
    }
  };

  const toggleTask = async (id) => {
    try {
      const res     = await fetch(`${API}/tasks/${id}`, { method: "PATCH" });
      const updated = await res.json();
      setTasks(tasks.map((t) => (t._id === id ? updated : t)));
    } catch {
      setError("Failed to update task.");
    }
  };

  // PUT — edit task text
  const editTask = async (id, newText) => {
    try {
      const res     = await fetch(`${API}/update/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: newText }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error);
      setTasks(tasks.map((t) => (t._id === id ? updated : t)));
    } catch (e) {
      setError(e.message || "Failed to edit task.");
    }
  };

  // DELETE — new route /delete/:id
  const deleteTask = async (id) => {
    try {
      await fetch(`${API}/delete/${id}`, { method: "DELETE" });
      setTasks(tasks.filter((t) => t._id !== id));
    } catch {
      setError("Failed to delete task.");
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done")   return t.completed;
    return true;
  });

  const doneCount = tasks.filter((t) => t.completed).length;

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-16"
      style={{ animation: "fadeIn 0.4s ease forwards" }}
    >
      {/* ── Header ── */}
      <div className="w-full max-w-xl mb-10">
        <div className="flex items-center gap-3 mb-1">
          <span style={{ fontFamily: "'DM Mono',monospace", color: "#71717a", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            v2.0
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: "#27272a" }} />
        </div>
        <h1 style={{ fontFamily: "'DM Sans',sans-serif", color: "#fff", fontSize: "2.25rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Task Board
        </h1>
        <p style={{ fontFamily: "'DM Mono',monospace", color: "#71717a", fontSize: "13px", marginTop: "4px" }}>
          {doneCount}/{tasks.length} completed
        </p>
      </div>

      {/* ── Input ── */}
      <div className="w-full max-w-xl mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="What needs to be done?"
            className="flex-1 outline-none px-4 py-3 rounded-lg text-sm"
            style={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              color: "#fff",
              fontFamily: "'DM Sans',sans-serif",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#a1a1aa")}
            onBlur={(e)  => (e.target.style.borderColor = "#3f3f46")}
          />
          <button
            onClick={addTask}
            disabled={adding || !text.trim()}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: adding || !text.trim() ? "#27272a" : "#ffffff",
              color:           adding || !text.trim() ? "#52525b"  : "#000",
              cursor:          adding || !text.trim() ? "not-allowed" : "pointer",
              fontFamily:      "'DM Sans',sans-serif",
              transition:      "all 0.2s",
            }}
          >
            {adding ? <><Spinner /> Adding</> : "Add Task"}
          </button>
        </div>
        {error && (
          <p style={{ fontFamily: "'DM Mono',monospace", color: "#f87171", fontSize: "12px", marginTop: "8px", paddingLeft: "4px" }}>
            {error}
          </p>
        )}
      </div>

      {/* ── Filter Tabs ── */}
      <div
        className="w-full max-w-xl mb-4 flex gap-1 p-1 rounded-lg"
        style={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}
      >
        {["all", "active", "done"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex-1 py-2 rounded-md text-xs uppercase"
            style={{
              fontFamily:      "'DM Mono',monospace",
              letterSpacing:   "0.1em",
              backgroundColor: filter === f ? "#3f3f46" : "transparent",
              color:           filter === f ? "#fff"    : "#71717a",
              transition:      "all 0.2s",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Task List ── */}
      <div className="w-full max-w-xl flex flex-col gap-2">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" style={{ fontFamily: "'DM Mono',monospace", color: "#52525b", fontSize: "13px" }}>
            {filter === "done"   ? "Nothing completed yet."
            : filter === "active" ? "No active tasks."
            : "No tasks yet. Add one above."}
          </div>
        ) : (
          filtered.map((task, i) => (
            <TaskItem
              key={task._id}
              task={task}
              index={i}
              onToggle={toggleTask}
              onEdit={editTask}
              onDelete={deleteTask}
            />
          ))
        )}
      </div>

      {/* ── Footer ── */}
      {tasks.length > 0 && (
        <div
          className="w-full max-w-xl mt-8 pt-4 flex justify-between items-center"
          style={{ borderTop: "1px solid #27272a" }}
        >
          <span style={{ fontFamily: "'DM Mono',monospace", color: "#52525b", fontSize: "12px" }}>
            {tasks.filter((t) => !t.completed).length} remaining
          </span>
          <span style={{ fontFamily: "'DM Mono',monospace", color: "#3f3f46", fontSize: "12px" }}>
            MERN · Full CRUD
          </span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   TaskItem — with inline edit support
───────────────────────────────────────── */
function TaskItem({ task, index, onToggle, onEdit, onDelete }) {
  const [hovered,  setHovered]  = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!editText.trim() || editText.trim() === task.text) {
      setEditing(false);
      setEditText(task.text);
      return;
    }
    setSaving(true);
    await onEdit(task._id, editText.trim());
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(task._id);
  };

  const handleEditKey = (e) => {
    if (e.key === "Enter")  handleSave();
    if (e.key === "Escape") { setEditing(false); setEditText(task.text); }
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg"
      style={{
        backgroundColor: "#18181b",
        border:          `1px solid ${hovered ? "#3f3f46" : "#27272a"}`,
        animation:       "slideIn 0.25s ease forwards",
        animationDelay:  `${index * 40}ms`,
        opacity:         0,
        transition:      "border-color 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={() => !editing && onToggle(task._id)}
        className="shrink-0 flex items-center justify-center rounded"
        style={{
          width:           "20px",
          height:          "20px",
          border:          `2px solid ${task.completed ? "#a1a1aa" : "#52525b"}`,
          backgroundColor: task.completed ? "#a1a1aa" : "transparent",
          transition:      "all 0.2s",
          cursor:          editing ? "default" : "pointer",
        }}
      >
        {task.completed && (
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#000" strokeWidth={3.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Text / Edit Input */}
      {editing ? (
        <input
          autoFocus
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleEditKey}
          className="flex-1 outline-none px-2 py-1 rounded text-sm"
          style={{
            backgroundColor: "#27272a",
            border:          "1px solid #52525b",
            color:           "#fff",
            fontFamily:      "'DM Sans',sans-serif",
          }}
        />
      ) : (
        <span
          className="flex-1 text-sm"
          style={{
            fontFamily:      "'DM Sans',sans-serif",
            color:           task.completed ? "#52525b" : "#e4e4e7",
            textDecoration:  task.completed ? "line-through" : "none",
          }}
        >
          {task.text}
        </span>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-1" style={{ opacity: hovered || editing ? 1 : 0, transition: "opacity 0.2s" }}>
        {editing ? (
          <>
            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center p-1 rounded"
              style={{ color: "#4ade80" }}
              title="Save"
            >
              {saving ? <Spinner /> : (
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            {/* Cancel */}
            <button
              onClick={() => { setEditing(false); setEditText(task.text); }}
              className="flex items-center justify-center p-1 rounded"
              style={{ color: "#71717a" }}
              title="Cancel"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <>
            {/* Edit */}
            <button
              onClick={() => { setEditing(true); setEditText(task.text); }}
              className="flex items-center justify-center p-1 rounded"
              style={{ color: "#71717a", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
              title="Edit task"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center p-1 rounded"
              style={{ color: "#71717a", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
              title="Delete task"
            >
              {deleting ? <Spinner /> : (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Spinner ── */
function Spinner({ size = "sm" }) {
  const dim = size === "lg" ? 24 : 14;
  return (
    <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite", color: "#71717a" }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
      <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}