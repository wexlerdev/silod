import { Router, type Router as RouterType } from "express";
import pool from "./db.js";

const router: RouterType = Router();

router.get("/items", async (req, res) => {
  const filter = (req.query.filter as string) || "active";
  const q = req.query.q as string | undefined;

  let query = "SELECT id, content, starred, created_at, completed_at FROM items";
  const conditions: string[] = [];
  const params: string[] = [];

  switch (filter) {
    case "active":
      conditions.push("completed_at IS NULL");
      break;
    case "starred":
      conditions.push("starred = true AND completed_at IS NULL");
      break;
    case "completed":
      conditions.push("completed_at IS NOT NULL");
      break;
  }

  if (q) {
    params.push(`%${q}%`);
    conditions.push(`content ILIKE $${params.length}`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY starred DESC, created_at DESC";

  const result = await pool.query(query, params);
  res.json(result.rows);
});

router.patch("/items/:id/star", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "UPDATE items SET starred = NOT starred, updated_at = now() WHERE id = $1 RETURNING *",
    [id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(result.rows[0]);
});

router.patch("/items/:id/complete", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "UPDATE items SET completed_at = now(), updated_at = now() WHERE id = $1 RETURNING *",
    [id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(result.rows[0]);
});

export default router;
