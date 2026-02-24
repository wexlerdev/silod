import type { Filter } from "../api";

interface Props {
  current: Filter;
  onChange: (f: Filter) => void;
}

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "starred", label: "Starred" },
  { value: "completed", label: "Completed" },
];

export default function FilterTabs({ current, onChange }: Props) {
  return (
    <div className="filter-tabs">
      {filters.map((f) => (
        <button
          key={f.value}
          className={`filter-tab ${current === f.value ? "active" : ""}`}
          onClick={() => onChange(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
