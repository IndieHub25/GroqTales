# GroqTales Pipelines & Automations Guide

Welcome to the comprehensive guide for the automated pipelines, ML workflows, and backend automations that power GroqTales. This document explains the architecture and operational flow of the automated systems built inside the Cloudflare Edge Worker backend.

---

## 1. Machine Learning & SEO Automation Pipeline (Edge AI)

To ensure that writers get the best possible visibility for their stories without manual effort, GroqTales utilizes an automated, zero-latency SEO and ML rating pipeline running entirely on the edge via powerful LLM APIs.

### How It Works
When a user uploads a new story via the `POST /api/stories` endpoint:
1. **Interception**: The raw content of the story is intercepted before being stored in the database.
2. **AI Inference (Chairman Model)**: The text is passed to the **Google Gemini (gemini-1.5-flash)** model as the primary decision engine.
3. **AI Inference (Fallback)**: If Gemini is unavailable, the system automatically falls back to the **Groq Llama 3 (`llama3-8b-8192`)** model.
4. **Generation**: The AI model analyzes the narrative flow, character names, and themes to automatically generate:
   - A concise, 1-sentence **SEO Meta Description**.
   - An optimized JSON array of exactly 5 **SEO Keywords**.
   - An estimated **ML Quality Score** out of 10.0 based on narrative coherence.
5. **Persistence**: These generated properties are injected directly into the D1 relational row for the story alongside the content. The user never experiences any additional friction.

### Why This Matters
By running inference dynamically during the upload flow, the indexable meta-tags for Google and other search engines are universally optimized. This guarantees that all stories have a baseline of competitive SEO metadata without requiring technical knowledge from the author.

---

## 2. Admin Review & Gating Pipeline

To maintain quality control and avoid spam natively, the platform employs an automated gating pipeline that blocks public distribution until an admin explicitly verifies the content.

### Operational Flow
1. **Default State**: Every story that successfully passes through the ML pipeline and hits the D1 database is hardcoded with a `review_status` of `'under_review'`.
2. **Cloaking**: Both the Global Feed (`GET /api/stories/feed`) and the NFT Marketplace (`GET /api/marketplace/listings`) strictly filter out any row where the `review_status` is not explicitly `'verified'`. The story exists, but it is entirely invisible to the public.
3. **Admin Queue**: Authorized administrators (verified via the `role` column in the `profiles` table and a Bearer token in the `Authorization` header, e.g., `Authorization: Bearer <token>`) can call `GET /api/admin/pending`. This pulls a dashboard list of all pending stories, complete with their AI-generated ML Quality Score to help prioritize reviews.
4. **Verification**: When an admin calls `PUT /api/admin/approve/:id` (with the `Authorization: Bearer <token>` header), the story's status flips to `'verified'`, immediately injecting it into the live feeds and rendering it available for purchase or interaction.

---

## 3. Retrieval-Augmented Generation (RAG) Pipeline

GroqTales features a lightweight, edge-native RAG pipeline designed to answer user queries contextually based on the actual corpus of stories stored in the D1 database.

### The RAG Architecture
1. **Query Ingestion**: A user submits a query via `POST /api/rag/query` (e.g., "Find me stories about space travel").
2. **Edge Caching Layer (KV)**: The system first checks the Cloudflare KV cache. If this exact query has been asked recently, it returns the cached contextual answer in milliseconds, saving database reads and LLM compute.
3. **Context Retrieval**: If there is a cache miss, the system performs a Full-Text Search emulation across the D1 `stories` table. It retrieves the top 5 most relevant story titles and textual contents matching the query strings.
4. **Synthesis**: The relevant story contents are aggregated into a single contextual payload string.
5. **Caching**: This synthesized aggregate/answer is then stored back into the KV Namespace with a 1-hour expiration Time-to-Live (TTL) using `expirationTtl: 3600`. Subsequent identical queries will hit this cache.

*(Note: While currently utilizing SQL syntax for retrieval, this pipeline is structured to immediately swap to proper Vector Embeddings (`@cf/baai/bge-large-en-v1.5`) mapped into Vectorize when semantic search scales.)*

---

## 4. Feed Aggregation & Trending Pipeline

The global story feed uses a combination of D1 SQL relational mapping and KV edge caching to ensure the homepage loads instantly globally, regardless of database load.

### The Aggregation Flow
1. **Trigger**: A user visits the homepage, firing `GET /api/stories/feed`.
2. **KV Intercept**: The Worker intercepts the request and checks the `'global-feed'` key inside KV.
3. **Hydration (Cache Miss)**: If the cache is empty, the Worker performs a heavy SQL JOIN mapping `stories` securely linked with `profiles` to fetch authors, avatars, and verified stories.
4. **Cache Seeding**: The resulting payload is stored in KV for exactly 60 seconds (`expirationTtl: 60`).
5. **Invalidation**: Whenever a new story is verified, or an admin takes manual action, the `'global-feed'` KV cache is explicitly deleted (`await env.KV.delete('global-feed')`). This guarantees that new stories appear instantaneously, but handles viral load spikes gracefully since tens of thousands of users over the same minute will hit the identical KV cache result.
