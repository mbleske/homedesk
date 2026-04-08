import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DIGEST_TO = Deno.env.get("DIGEST_TO")!; // comma-separated list of recipient emails

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*")
    .neq("status", "Done");

  if (error) return new Response("DB error: " + error.message, { status: 500 });

  const byDueDate = (a: Record<string, string>, b: Record<string, string>) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date < b.due_date ? -1 : 1;
  };

  const newTickets = tickets.filter(t => t.created_at >= yesterday).sort(byDueDate);
  const updatedTickets = tickets.filter(t => t.last_updated >= yesterday && t.created_at < yesterday).sort(byDueDate);
  const overdueTickets = tickets.filter(t => t.due_date && t.due_date < today).sort(byDueDate);
  const openTickets = tickets.filter(t => t.status === "Open" && t.created_at < yesterday).sort(byDueDate);
  const inProgressTickets = tickets.filter(t => t.status === "In Progress" && t.created_at < yesterday).sort(byDueDate);

  const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const ticketRow = (t: Record<string, string>) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0ede8;font-size:13px;color:#1a1a2e;">${t.title}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0ede8;font-size:12px;color:#64748b;">${t.assignee}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0ede8;font-size:12px;color:#64748b;">${t.priority}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0ede8;font-size:12px;color:${t.due_date && t.due_date < today ? "#ef5350" : "#64748b"};">${t.due_date ? fmt(t.due_date) : "—"}</td>
    </tr>`;

  const section = (title: string, color: string, rows: Record<string, string>[]) => rows.length === 0 ? "" : `
    <h3 style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${color};margin:24px 0 8px;">${title} (${rows.length})</h3>
    <table style="width:100%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <thead>
        <tr style="background:#f8f7f4;">
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#94a3b8;font-weight:600;">TITLE</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#94a3b8;font-weight:600;">ASSIGNEE</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#94a3b8;font-weight:600;">PRIORITY</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#94a3b8;font-weight:600;">DUE</th>
        </tr>
      </thead>
      <tbody>${rows.map(ticketRow).join("")}</tbody>
    </table>`;

  const hasContent = newTickets.length + updatedTickets.length + overdueTickets.length + openTickets.length + inProgressTickets.length > 0;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',sans-serif;background:#f8f7f4;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#1a1a2e;border-radius:12px 12px 0 0;padding:20px 24px;display:flex;align-items:center;gap:10px;">
      <span style="font-size:20px;">🏠</span>
      <span style="font-family:Georgia,serif;font-size:20px;color:white;font-weight:700;">HomeDesk</span>
      <span style="font-size:11px;color:#b5936b;font-weight:600;letter-spacing:1px;margin-left:4px;">DAILY DIGEST</span>
    </div>
    <div style="background:white;border-radius:0 0 12px 12px;padding:24px;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
      <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;">${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      ${!hasContent
        ? `<p style="color:#94a3b8;font-size:14px;">Nothing to report — all caught up! ✨</p>`
        : section("🆕 New (Last 24h)", "#b5936b", newTickets) +
          section("✏️ Updated Today", "#1d4ed8", updatedTickets) +
          section("⚠️ Overdue", "#ef5350", overdueTickets) +
          section("🔵 In Progress", "#1d4ed8", inProgressTickets) +
          section("⬜ Open", "#64748b", openTickets)
      }
    </div>
  </div>
</body>
</html>`;

  const recipients = DIGEST_TO.split(",").map(e => e.trim()).filter(Boolean);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "HomeDesk <support@bleske.com>",
      to: recipients,
      subject: `HomeDesk Digest — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return new Response("Resend error: " + err, { status: 500 });
  }

  return new Response("Digest sent to " + recipients.join(", "), { status: 200 });
});
