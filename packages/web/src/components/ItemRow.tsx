import type { Item } from "../api";

interface Props {
  item: Item;
  onStar: (id: number) => void;
  onComplete: (id: number) => void;
}

function getDueStatus(due_date: string | null): "overdue" | "today" | "future" | null {
  if (!due_date) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(due_date + "T00:00:00");
  if (due < today) return "overdue";
  if (due.getTime() === today.getTime()) return "today";
  return "future";
}

function formatDueDate(due_date: string): string {
  const d = new Date(due_date + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ItemRow({ item, onStar, onComplete }: Props) {
  const isDone = item.completed_at !== null;
  const dueStatus = getDueStatus(item.due_date);
  const label = item.title || item.content;
  const hasMeta = (item.tags && item.tags.length > 0) || item.due_date;

  return (
    <div className={`item-row ${isDone ? "completed" : ""} ${hasMeta ? "has-meta" : ""}`}>
      <button
        className={`star-btn ${item.starred ? "starred" : ""}`}
        onClick={() => onStar(item.id)}
        title={item.starred ? "Unstar" : "Star"}
      >
        {item.starred ? "★" : "☆"}
      </button>
      <div className="item-body">
        <span className={`item-title ${!item.title ? "no-title" : ""}`}>{label}</span>
        {hasMeta && (
          <div className="item-detail">
            {item.tags && item.tags.map((tag) => (
              <span key={tag} className="tag-chip">{tag}</span>
            ))}
            {item.due_date && (
              <span className={`due-badge ${dueStatus}`}>
                {formatDueDate(item.due_date)}
              </span>
            )}
          </div>
        )}
      </div>
      {!isDone && (
        <button
          className="complete-btn"
          onClick={() => onComplete(item.id)}
          title="Mark complete"
        >
          ✓
        </button>
      )}
    </div>
  );
}
