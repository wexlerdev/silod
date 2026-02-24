import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import pool from "./db.js";

export const mcpServer = new McpServer({
  name: "silod",
  version: "0.1.0",
});

mcpServer.tool(
  "add_item",
  `Save something to the user's persistent memory. Use this liberally — any time the user mentions something worth remembering: tasks, ideas, thoughts, reminders, recommendations, decisions, goals, observations, bookmarks, quotes, names, plans, feelings, learnings, or anything they might want to recall later. When in doubt, save it. The user can always clean up later. You may also infer items to save from context — e.g. if the user says "I had a great meeting with Sarah about the rebrand", you could save that as a memory without being asked explicitly.`,
  { content: z.string().describe("The text to persist. Be descriptive but concise. Capture the full thought, not just keywords.") },
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
  `Retrieve items from the user's persistent memory. Use this when the user asks what they've saved, what's on their mind, what they need to do, what's important, what happened recently, or anything that involves recalling stored information. Also use proactively when context would help — e.g. if the user is talking about a topic, check if there are related saved items. Filters: "active" (default, not completed), "starred" (important/priority), "completed" (done), "recent" (last 24h), "all" (everything).`,
  {
    filter: z
      .enum(["all", "active", "starred", "completed", "recent"])
      .default("active")
      .describe("Which subset to retrieve. Use 'active' for general queries, 'starred' when asking about priorities/important items, 'recent' for what's new."),
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
  `Mark an item as done/completed. Use when the user says they finished something, did something, it's handled, crossed off, no longer needed, or otherwise resolved. The item stays in memory but moves to the "completed" filter.`,
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
  `Toggle star/priority on an item. Use when the user says something is important, urgent, a priority, or they want to highlight it. Also use to unstar when something is no longer a priority.`,
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
  `Search the user's memory by keyword. Use this when the user asks about a specific topic, person, project, or concept — or when you need to check if something was already saved before adding a duplicate. Also useful when the user says things like "did I save anything about...", "what did I say about...", "find that thing about...". Prefer this over list_items when the user has a specific subject in mind.`,
  { query: z.string().describe("Keyword or phrase to search for. Use the most distinctive word from the user's query.") },
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

// --- MCP Prompts ---

mcpServer.prompt(
  "brain_dump",
  "Quick capture mode — rapidly save multiple thoughts, tasks, or ideas in one go.",
  async () => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: "I want to do a brain dump. I'm going to list a bunch of thoughts, tasks, ideas, and things on my mind. Save each one as a separate item in silod. Don't ask me to confirm — just save them all as I go. Ready when I am.",
        },
      },
    ],
  })
);

mcpServer.prompt(
  "daily_review",
  "Review what's on your plate — starred items, recent additions, and what you've completed.",
  async () => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: "Give me a daily review. Show me: (1) my starred/priority items first, (2) anything added in the last 24 hours, (3) what I've completed recently. Summarize patterns or suggest what I should focus on today.",
        },
      },
    ],
  })
);

mcpServer.prompt(
  "weekly_cleanup",
  "Clean up your memory — review old items and decide what to complete, star, or keep.",
  async () => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: "Let's do a weekly cleanup. Pull up all my active items and walk me through them one by one. For each, I'll say keep, complete, or star. Let's triage everything.",
        },
      },
    ],
  })
);
