# Project Plan — [Working Title TBD]

## The Problem

Your AI assistant is smart but forgetful. Every LLM — Claude, ChatGPT, whatever — either has no memory, or has memory that's a cluttered mess of stale facts you can't see, edit, or take with you. Switch providers and you start from zero. Stay too long and your memory becomes noise.

Meanwhile, your brain is juggling tasks, deadlines, people's birthdays, random facts, half-formed ideas — and none of it has a home. You use sticky notes, scattered apps, or just... hope you remember.

There's no universal, portable, structured place to offload your life that any AI can tap into.

## The Vision

A personal data layer that sits behind any LLM. You talk to your favorite AI like you'd talk to a great executive assistant — "remember this," "what's on my plate," "when's Jake's birthday" — and it just works. The AI does the thinking. We hold the memory.

Your data is yours. Structured, visible, portable. Switch LLMs and nothing is lost. The new model knows you instantly because it's reading from the same source of truth.

## Why Now

- **MCP (Model Context Protocol)** is becoming the universal standard for connecting AI models to external tools and data. Anthropic created it, OpenAI and Google are adopting it. Build one MCP server, and it works across all major LLMs.
- Every AI company is building memory *inside* their walled garden. Nobody is building the portable layer that works *across* them.
- People are accumulating AI relationships — context, preferences, personal info — that's locked in and disposable. That's a real problem that gets worse as AI becomes more central to daily life.

## MVP — v1

The first version is dead simple: **a brain dump tool**. Get thoughts out of your head and into a persistent store you can query through conversation.

### Core Interaction

You open Claude (or any MCP-compatible LLM) and just talk:

- *"I need to call the mechanic, file taxes before April, and finish the probability homework by Thursday."* → three items stored
- *"What's on my plate?"* → lists everything
- *"Star the taxes one."* → marked as important
- *"I finished the homework."* → removed

That's it. No categories, no structure, no UI to learn. You talk, it captures. You ask, it retrieves.

### MCP Server (the core product)

A remote MCP server that exposes a small set of tools:

- `add_item` — store a thought, task, or fact
- `list_items` — retrieve items, optionally filtered (starred, recent, etc.)
- `complete_item` — mark something done / remove it
- `star_item` — toggle importance
- `search_items` — find something by keyword

The server is hosted remotely (Railway, Cloudflare Workers, or similar) so it works from any device — laptop browser, desktop app, phone.

### Data Store

A simple Postgres database. One table to start:

- id, content, starred, created_at, completed_at

No schemas to learn. No folders. No tags. The LLM handles interpretation and the user never thinks about structure.

### Web Viewer

A minimal web page that shows your items. Not the primary interface — just a way to glance at your list, manually delete or star things. The real interaction happens through conversation with your LLM.

### Auth

OAuth 2.0 via Google for the MCP connection. Claude (and other clients) authenticate through Google sign-in so only you can access your data. Start authless during development, add Google OAuth before leaving it running.

## What Comes After v1

These features reveal themselves through daily usage, but the roadmap likely looks like:

**Typed entries** — the LLM classifies items automatically as tasks (perishable, completable), facts (persistent, updatable), notes (searchable, passive), or time-sensitive (has a date, gets louder as it approaches). The user never picks a type.

**People context** — "Sarah's birthday is March 12, she works at Stripe, she likes sushi." Later: "I'm seeing Sarah this weekend, anything I should know?" It pulls everything about Sarah. A personal CRM you never have to maintain.

**Life admin** — bills, lease dates, insurance policy numbers, doctor info. The boring stuff that slips through cracks because no single app holds it all.

**Smart surfacing** — instead of only answering when asked, the system can proactively note: "You've had 'call mechanic' sitting for two weeks" or "Your lease renewal is in 30 days."

**Multi-LLM support** — as more providers adopt MCP, the same server works everywhere. Your memory travels with you.

## Technical Architecture

```
You ←→ Any LLM (Claude, ChatGPT, etc.)
              ↕ (MCP protocol over HTTPS)
        Remote MCP Server
              ↕
          Postgres DB
              ↕
        Web Viewer (read + basic controls)
```

- **MCP Server**: Node.js or Python, deployed to Railway/Cloudflare
- **Database**: Postgres (Railway, Supabase, or Neon free tier)
- **Web Viewer**: Simple static page or lightweight framework, same deployment
- **Auth**: Google OAuth 2.0, with Claude's callback URL registered

## Why This Matters (Beyond Personal Use)

This is a real product gap. The "portable AI memory layer" doesn't exist yet. The positioning is:

- **For users**: Your AI finally remembers you — across every platform, forever.
- **For the market**: As MCP adoption grows, the demand for persistent personal context grows with it. Early mover advantage is real.
- **As a portfolio piece**: Demonstrates understanding of AI infrastructure, protocol design, OAuth, deployment, and product thinking. The kind of project that stands out to startups.

## v1 Goal

Be using this daily within 1-2 weeks. Dumping thoughts, querying tasks, and clearing mental clutter through natural conversation with Claude — from phone and laptop.
