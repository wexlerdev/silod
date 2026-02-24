import { useEffect, useRef, useState } from "react";

interface Props {
  onSearch: (q: string) => void;
}

export default function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(value), 250);
    return () => clearTimeout(timer.current);
  }, [value, onSearch]);

  return (
    <input
      className="search-bar"
      type="text"
      placeholder="Search items..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
