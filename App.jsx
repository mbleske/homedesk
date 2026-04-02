import { useState, useEffect } from "react";

const CATEGORIES = ["Home Repair", "Yard & Outdoor", "Errands & Shopping", "Finances & Bills", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["Open", "In Progress", "Done"];
const ASSIGNEES = ["Alisa", "Mike"];

const PRIORITY_COLORS = {
  Low: { bg: "#e8f5e9", text: "#2e7d32", dot: "#66bb6a" },
  Medium: { bg: "#fff8e1", text: "#f57f17", dot: "#ffca28" },
  High: { bg: "#fff3e0", text: "#e65100", dot: "#ffa726" },
  Urgent: { bg: "#fce4ec", text: "#b71c1c", dot: "#ef5350" },
};

const STATUS_STYLES = {
  Open: { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" },
  "In Progress": { bg: "#eff6ff", text: "#1d4ed8", border: "#93c5fd" },
  Done: { bg: "#f0fdf4", text: "#15803d", border: "#86efac" },
};

const CAT_ICONS = {
  "Home Repair": "🔧",
  "Yard & Outdoor": "🌿",
  "Errands & Shopping": "🛍️",
  "Finances & Bills": "💳",
  Other: "📌",
};

function generateId() {
  return "HT-" + Math.floor(Math.random() * 9000 + 1000);
}

const SAMPLE_TICKETS = [
  {
    id: "HT-1001",
    title: "Fix leaking kitchen faucet",
    category: "Home Repair",
    priority: "High",
    status: "Open",
    assignee: "Mike",
    due: "2026-04-10",
    description: "The kitchen faucet has been dripping for a week. Need to replace the washer or call a plumber.",
    created: "2026-04-01",
  },
  {
    id: "HT-1002",
    title: "Mow front lawn",
    category: "Yard & Outdoor",
    priority: "Medium",
    status: "In Progress",
    assignee: "Mike",
    due: "2026-04-05",
    description: "Grass is getting long. Also trim along the fence line.",
    created: "2026-04-01",
  },
];

export default function HomeTickets() {
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem("hometickets_v1");
      return saved ? JSON.parse(saved) : SAMPLE_TICKETS;
    } catch { return SAMPLE_TICKETS; }
  });
  const [view, setView] = useState("board"); // board | list
  const [showForm, setShowForm] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterAssignee, setFilterAssignee] = useState("All");
  const [detailTicket, setDetailTicket] = useState(null);
  const [form, setForm] = useState({
    title: "", category: "Home Repair", priority: "Medium",
    status: "Open", assignee: "Mike", due: "", description: ""
  });

  useEffect(() => {
    try { localStorage.setItem("hometickets_v1", JSON.stringify(tickets)); } catch {}
  }, [tickets]);

  const openNew = () => {
    setForm({ title: "", category: "Home Repair", priority: "Medium", status: "Open", assignee: "Mike", due: "", description: "" });
    setEditTicket(null);
    setShowForm(true);
  };

  const openEdit = (t) => {
    setForm({ title: t.title, category: t.category, priority: t.priority, status: t.status, assignee: t.assignee, due: t.due, description: t.description });
    setEditTicket(t);
    setShowForm(true);
    setDetailTicket(null);
  };

  const saveTicket = () => {
    if (!form.title.trim()) return;
    if (editTicket) {
      setTickets(ts => ts.map(t => t.id === editTicket.id ? { ...t, ...form } : t));
    } else {
      setTickets(ts => [...ts, { ...form, id: generateId(), created: new Date().toISOString().slice(0, 10) }]);
    }
    setShowForm(false);
  };

  const deleteTicket = (id) => {
    setTickets(ts => ts.filter(t => t.id !== id));
    setDetailTicket(null);
  };

  const cycleStatus = (id) => {
    setTickets(ts => ts.map(t => {
      if (t.id !== id) return t;
      const idx = STATUSES.indexOf(t.status);
      return { ...t, status: STATUSES[(idx + 1) % STATUSES.length] };
    }));
  };

  const filtered = tickets.filter(t =>
    (filterStatus === "All" || t.status === filterStatus) &&
    (filterAssignee === "All" || t.assignee === filterAssignee)
  );

  const openCount = tickets.filter(t => t.status === "Open").length;
  const inProgressCount = tickets.filter(t => t.status === "In Progress").length;
  const doneCount = tickets.filter(t => t.status === "Done").length;
  const mikeCount = tickets.filter(t => t.assignee === "Mike" && t.status !== "Done").length;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#f8f7f4", color: "#1a1a2e" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f1f1f1; } ::-webkit-scrollbar-thumb { background: #c8c0b8; border-radius: 3px; }
        .btn { cursor: pointer; border: none; border-radius: 10px; font-family: inherit; font-weight: 600; transition: all 0.15s; }
        .btn:hover { transform: translateY(-1px); }
        .btn:active { transform: translateY(0); }
        .tag { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; }
        .card { background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: box-shadow 0.2s, transform 0.2s; }
        .card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .input { width: 100%; padding: 10px 14px; border: 1.5px solid #e5e2dc; border-radius: 10px; font-family: inherit; font-size: 14px; background: #fafaf8; outline: none; transition: border 0.15s; }
        .input:focus { border-color: #b5936b; background: white; }
        .overlay { position: fixed; inset: 0; background: rgba(26,26,46,0.4); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: white; border-radius: 20px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; padding: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .chip { padding: 6px 14px; border-radius: 99px; border: 1.5px solid #e5e2dc; background: white; font-family: inherit; font-size: 13px; cursor: pointer; font-weight: 500; transition: all 0.15s; }
        .chip.active { background: #1a1a2e; color: white; border-color: #1a1a2e; }
        .chip:hover:not(.active) { border-color: #b5936b; color: #b5936b; }
        .col-header { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .count-badge { background: #f1f5f9; color: #64748b; border-radius: 99px; padding: 2px 8px; font-size: 11px; font-weight: 700; }
        select.input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fadeIn { animation: fadeIn 0.25s ease; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#1a1a2e", padding: "0 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>🏠</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "white", fontWeight: 700 }}>HomeDesk</span>
            <span style={{ fontSize: 11, color: "#b5936b", fontWeight: 600, letterSpacing: 1, marginLeft: 4, marginTop: 2 }}>TICKETS</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="chip" onClick={() => setView(view === "board" ? "list" : "board")}
              style={{ fontSize: 12, padding: "5px 12px", color: "#94a3b8", borderColor: "#2d2d4a", background: "transparent" }}>
              {view === "board" ? "⊟ List" : "⊞ Board"}
            </button>
            <button className="btn" onClick={openNew}
              style={{ background: "#b5936b", color: "white", padding: "8px 18px", fontSize: 13 }}>
              + New Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: "white", borderBottom: "1px solid #f0ede8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px", display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "Open", val: openCount, color: "#64748b" },
            { label: "In Progress", val: inProgressCount, color: "#1d4ed8" },
            { label: "Done", val: doneCount, color: "#15803d" },
            { label: "Mike's Queue", val: mikeCount, color: "#b5936b" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</span>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, letterSpacing: 0.5, alignSelf: "center", marginRight: 4 }}>FILTER:</span>
        {["All", ...STATUSES].map(s => (
          <button key={s} className={`chip ${filterStatus === s ? "active" : ""}`} onClick={() => setFilterStatus(s)} style={{ fontSize: 12 }}>{s}</button>
        ))}
        <span style={{ width: 1, background: "#e5e2dc", margin: "0 4px" }} />
        {["All", ...ASSIGNEES].map(a => (
          <button key={a} className={`chip ${filterAssignee === a ? "active" : ""}`} onClick={() => setFilterAssignee(a)} style={{ fontSize: 12 }}>
            {a === "All" ? "👥 All" : a === "Mike" ? "👨 Mike" : "👩 Alisa"}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
            <div style={{ fontWeight: 600 }}>No tickets found</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Create a new ticket or adjust your filters</div>
          </div>
        )}

        {view === "board" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {STATUSES.map(status => {
              const cols = filtered.filter(t => t.status === status);
              return (
                <div key={status}>
                  <div className="col-header">
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_STYLES[status].border, display: "inline-block" }} />
                    {status} <span className="count-badge">{cols.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {cols.map(t => <TicketCard key={t.id} t={t} onDetail={() => setDetailTicket(t)} onCycle={() => cycleStatus(t.id)} />)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(t => <TicketRow key={t.id} t={t} onDetail={() => setDetailTicket(t)} onCycle={() => cycleStatus(t.id)} />)}
          </div>
        )}
      </div>

      {/* New/Edit form modal */}
      {showForm && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal fadeIn">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }}>{editTicket ? "Edit Ticket" : "New Ticket"}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: 0.5 }}>TITLE *</label>
                <input className="input" style={{ marginTop: 6 }} placeholder="Describe the issue..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: 0.5 }}>CATEGORY</label>
                  <select className="input" style={{ marginTop: 6 }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: 0.5 }}>PRIORITY</label>
                  <select className="input" style={{ marginTop: 6 }} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: 0.5 }}>ASSIGNED TO</label>
                  <select className="input" style={{ marginTop: 6 }} value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}>
                    {ASSIGNEES.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: 0.5 }}>STATUS</label>
                  <select className="input" style={{ marginTop: 6 }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: 0.5 }}>DUE DATE</label>
                <input className="input" type="date" style={{ marginTop: 6 }} value={form.due} onChange={e => setForm(f => ({ ...f, due: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: 0.5 }}>DESCRIPTION / NOTES</label>
                <textarea className="input" rows={3} style={{ marginTop: 6, resize: "vertical" }} placeholder="Any details, links, or context..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button className="btn" onClick={saveTicket} style={{ flex: 1, background: "#1a1a2e", color: "white", padding: "12px" }}>
                  {editTicket ? "Save Changes" : "Create Ticket"}
                </button>
                <button className="btn" onClick={() => setShowForm(false)} style={{ background: "#f1f5f9", color: "#64748b", padding: "12px 20px" }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detailTicket && (() => {
        const t = tickets.find(x => x.id === detailTicket.id) || detailTicket;
        const pc = PRIORITY_COLORS[t.priority];
        const ss = STATUS_STYLES[t.status];
        return (
          <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setDetailTicket(null); }}>
            <div className="modal fadeIn" style={{ maxWidth: 560 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>{t.id}</div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, lineHeight: 1.3 }}>{t.title}</h2>
                </div>
                <button onClick={() => setDetailTicket(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8", flexShrink: 0, marginLeft: 12 }}>×</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                <span className="tag" style={{ background: pc.bg, color: pc.text }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: pc.dot, display: "inline-block" }} />
                  {t.priority}
                </span>
                <span className="tag" style={{ background: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>{t.status}</span>
                <span className="tag" style={{ background: "#f8f7f4", color: "#64748b" }}>{CAT_ICONS[t.category]} {t.category}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                {[
                  { label: "Assigned to", val: t.assignee === "Mike" ? "👨 Mike" : "👩 Alisa" },
                  { label: "Due Date", val: t.due ? new Date(t.due + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
                  { label: "Created", val: t.created ? new Date(t.created + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—" },
                ].map(f => (
                  <div key={f.label} style={{ background: "#f8f7f4", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: "#94a3b8", marginBottom: 4 }}>{f.label.toUpperCase()}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{f.val}</div>
                  </div>
                ))}
              </div>
              {t.description && (
                <div style={{ background: "#f8f7f4", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: "#94a3b8", marginBottom: 8 }}>NOTES</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: "#475569" }}>{t.description}</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn" onClick={() => cycleStatus(t.id)}
                  style={{ flex: 1, background: "#eff6ff", color: "#1d4ed8", padding: "10px 14px", fontSize: 13 }}>
                  → Move to {STATUSES[(STATUSES.indexOf(t.status) + 1) % STATUSES.length]}
                </button>
                <button className="btn" onClick={() => openEdit(t)}
                  style={{ background: "#1a1a2e", color: "white", padding: "10px 16px", fontSize: 13 }}>✏️ Edit</button>
                <button className="btn" onClick={() => deleteTicket(t.id)}
                  style={{ background: "#fce4ec", color: "#b71c1c", padding: "10px 16px", fontSize: 13 }}>🗑️</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function TicketCard({ t, onDetail, onCycle }) {
  const pc = PRIORITY_COLORS[t.priority];
  const isOverdue = t.due && new Date(t.due) < new Date() && t.status !== "Done";
  return (
    <div className="card" style={{ padding: "14px 16px", cursor: "pointer", borderLeft: `3px solid ${pc.dot}` }} onClick={onDetail}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.8 }}>{t.id}</span>
        <span style={{ fontSize: 14 }}>{t.assignee === "Mike" ? "👨" : "👩"}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 10, color: "#1a1a2e" }}>{t.title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        <span className="tag" style={{ background: pc.bg, color: pc.text, fontSize: 10 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: pc.dot, display: "inline-block" }} />
          {t.priority}
        </span>
        <span className="tag" style={{ background: "#f8f7f4", color: "#64748b", fontSize: 10 }}>{CAT_ICONS[t.category]}</span>
      </div>
      {t.due && (
        <div style={{ fontSize: 11, color: isOverdue ? "#ef5350" : "#94a3b8", fontWeight: 500 }}>
          {isOverdue ? "⚠️ " : "📅 "}Due {new Date(t.due + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      )}
    </div>
  );
}

function TicketRow({ t, onDetail, onCycle }) {
  const pc = PRIORITY_COLORS[t.priority];
  const ss = STATUS_STYLES[t.status];
  const isOverdue = t.due && new Date(t.due) < new Date() && t.status !== "Done";
  return (
    <div className="card" style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }} onClick={onDetail}>
      <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.8, minWidth: 64 }}>{t.id}</span>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{t.title}</div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{CAT_ICONS[t.category]} {t.category}</div>
      </div>
      <span className="tag" style={{ background: pc.bg, color: pc.text, fontSize: 11 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: pc.dot, display: "inline-block" }} />
        {t.priority}
      </span>
      <span className="tag" style={{ background: ss.bg, color: ss.text, border: `1px solid ${ss.border}`, fontSize: 11 }}>{t.status}</span>
      <span style={{ fontSize: 13 }}>{t.assignee === "Mike" ? "👨 Mike" : "👩 Alisa"}</span>
      {t.due && <span style={{ fontSize: 11, color: isOverdue ? "#ef5350" : "#94a3b8" }}>{isOverdue ? "⚠️" : "📅"} {new Date(t.due + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
    </div>
  );
}
