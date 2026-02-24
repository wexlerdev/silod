import type { Item } from "../api";
import ItemRow from "./ItemRow";

interface Props {
  items: Item[];
  onStar: (id: number) => void;
  onComplete: (id: number) => void;
}

export default function ItemList({ items, onStar, onComplete }: Props) {
  if (items.length === 0) {
    return <div className="empty-state">No items yet. Start a conversation to add some.</div>;
  }

  return (
    <div className="item-list">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} onStar={onStar} onComplete={onComplete} />
      ))}
    </div>
  );
}
