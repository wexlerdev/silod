const BASE = import.meta.env.VITE_API_URL || "";

export interface Item {
  id: number;
  content: string;
  starred: boolean;
  created_at: string;
  completed_at: string | null;
}

export type Filter = "all" | "active" | "starred" | "completed";

export async function fetchItems(filter: Filter, q?: string): Promise<Item[]> {
  const params = new URLSearchParams({ filter });
  if (q) params.set("q", q);
  const res = await fetch(`${BASE}/api/items?${params}`);
  return res.json();
}

export async function toggleStar(id: number): Promise<Item> {
  const res = await fetch(`${BASE}/api/items/${id}/star`, { method: "PATCH" });
  return res.json();
}

export async function completeItem(id: number): Promise<Item> {
  const res = await fetch(`${BASE}/api/items/${id}/complete`, { method: "PATCH" });
  return res.json();
}
