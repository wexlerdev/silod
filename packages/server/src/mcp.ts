import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import pool from "./db.js";

export const mcpServer = new McpServer({
  name: "silod",
  version: "0.1.0",
});

mcpServer.tool(
  "add_item",
  "Add a new item to your brain dump. Use this whenever the user wants to remember, save, note, or capture something.",
  { content: z.string().describe("The text content to save") },
  async ({ content }) => {
    const result = await pool.query(
      "INSERT INTO items (content) VALUES ($1) RETURNING id, content, created_at",
      [content]
    );
    const item = result.rows[0];
    return {
      content: [
        {
          type: "text" as const,
          text: `Saved item #${item.id}: "${item.content}"`,
        },
      ],
    };
  }
);

mcpServer.tool(
  "list_items",
  "List items from the brain dump. Defaults to active (not completed) items.",
  {
    filter: z
      .enum(["all", "active", "starred", "completed", "recent"])
      .default("active")
      .describe("Filter: all, active (default), starred, completed, or recent (last 24h)"),
  },
  async ({ filter }) => {
    let query = "SELECT id, content, starred, created_at, completed_at FROM items";
    switch (filter) {
      case "active":
        query += " WHERE completed_at IS NULL";
        break;
      case "starred":
        query += " WHERE starred = true AND completed_at IS NULL";
        break;
      case "completed":
        query += " WHERE completed_at IS NOT NULL";
        break;
      case "recent":
        query += " WHERE created_at > now() - interval '24 hours'";
        break;
    }
    query += " ORDER BY starred DESC, created_at DESC";

    const result = await pool.query(query);
    if (result.rows.length === 0) {
      return { content: [{ type: "text" as const, text: "No items found." }] };
    }

    const lines = result.rows.map((r) => {
      const star = r.starred ? "★ " : "";
      const done = r.completed_at ? "✓ " : "";
      return `${done}${star}#${r.id}: ${r.content}`;
    });

    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
    };
  }
);

mcpServer.tool(
  "complete_item",
  "Mark an item as completed.",
  { id: z.number().describe("The item ID to complete") },
  async ({ id }) => {
    const result = await pool.query(
      "UPDATE items SET completed_at = now(), updated_at = now() WHERE id = $1 RETURNING id, content",
      [id]
    );
    if (result.rows.length === 0) {
      return { content: [{ type: "text" as const, text: `Item #${id} not found.` }] };
    }
    return {
      content: [
        { type: "text" as const, text: `Completed item #${id}: "${result.rows[0].content}"` },
      ],
    };
  }
);

mcpServer.tool(
  "star_item",
  "Toggle the star/priority on an item.",
  { id: z.number().describe("The item ID to star/unstar") },
  async ({ id }) => {
    const result = await pool.query(
      "UPDATE items SET starred = NOT starred, updated_at = now() WHERE id = $1 RETURNING id, content, starred",
      [id]
    );
    if (result.rows.length === 0) {
      return { content: [{ type: "text" as const, text: `Item #${id} not found.` }] };
    }
    const row = result.rows[0];
    const state = row.starred ? "starred" : "unstarred";
    return {
      content: [{ type: "text" as const, text: `${state} item #${id}: "${row.content}"` }],
    };
  }
);

mcpServer.tool(
  "search_items",
  "Search items by keyword.",
  { query: z.string().describe("Search keyword") },
  async ({ query }) => {
    const result = await pool.query(
      "SELECT id, content, starred, created_at, completed_at FROM items WHERE content ILIKE $1 ORDER BY starred DESC, created_at DESC",
      [`%${query}%`]
    );
    if (result.rows.length === 0) {
      return { content: [{ type: "text" as const, text: `No items matching "${query}".` }] };
    }

    const lines = result.rows.map((r) => {
      const star = r.starred ? "★ " : "";
      const done = r.completed_at ? "✓ " : "";
      return `${done}${star}#${r.id}: ${r.content}`;
    });

    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
    };
  }
);
