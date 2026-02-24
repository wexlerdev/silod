import pool from "./db.js";

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id           SERIAL PRIMARY KEY,
      content      TEXT NOT NULL,
      starred      BOOLEAN NOT NULL DEFAULT false,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      completed_at TIMESTAMPTZ
    );
  `);
  console.log("Migration complete: items table ready");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
