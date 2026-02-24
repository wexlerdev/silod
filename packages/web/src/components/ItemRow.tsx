import type { Item } from "../api";

interface Props {
  item: Item;
  onStar: (id: number) => void;
  onComplete: (id: number) => void;
}

export default function ItemRow({ item, onStar, onComplete }: Props) {
  const isDone = item.completed_at !== null;

  return (
    <div className={`item-row ${isDone ? "completed" : ""}`}>
      <button
        className={`star-btn ${item.starred ? "starred" : ""}`}
        onClick={() => onStar(item.id)}
        title={item.starred ? "Unstar" : "Star"}
      >
        {item.starred ? "★" : "☆"}
      </button>
      <span className="item-content">{item.content}</span>
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
