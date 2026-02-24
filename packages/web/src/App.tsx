import { useCallback, useEffect, useState } from "react";
import { fetchItems, toggleStar, completeItem, type Filter, type Item } from "./api";
import FilterTabs from "./components/FilterTabs";
import SearchBar from "./components/SearchBar";
import ItemList from "./components/ItemList";

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<Filter>("active");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    fetchItems(filter, search || undefined).then(setItems);
  }, [filter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStar = async (id: number) => {
    await toggleStar(id);
    load();
  };

  const handleComplete = async (id: number) => {
    await completeItem(id);
    load();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo-wrapper">
          <h1 className="logo">
            <span className="logo-silo">silo</span><span className="logo-d">d</span>
          </h1>
          <div className="logo-glow"></div>
        </div>
        <p className="tagline">your brain, persisted</p>
      </header>
      <FilterTabs current={filter} onChange={setFilter} />
      <SearchBar onSearch={setSearch} />
      <ItemList items={items} onStar={handleStar} onComplete={handleComplete} />
    </div>
  );
}
