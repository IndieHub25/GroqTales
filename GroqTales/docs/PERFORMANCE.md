\# Performance \& Latency Budget



GroqTales defines Service Level Objectives (SLOs) for the AI story generation

pipeline to ensure a fast and responsive user experience.



This document outlines the expected latency targets across the full stack:

UI → API → Groq → Database → UI Render.



---



\## 🎯 End-to-End Latency Target



\*\*User Click → Story Fully Rendered\*\*



\- \*\*Target (p95): < 4000ms\*\*



This means 95% of users should see their complete story rendered within 4 seconds.



---



\## 🔎 Stage-Level Latency Targets



| Stage | Description | Target (p95) |

|--------|------------|--------------|

| API Request Handling | Next.js API route processing time | < 100ms |

| Groq API Call | Time taken for AI generation | < 2500ms |

| First Token Streaming | Time until first token appears in UI | < 1000ms |

| MongoDB Write | Time to persist story metadata | < 200ms |

| UI Render Completion | Time to render full story in browser | < 300ms |



---



\## 📊 Why p95?



We measure p95 (95th percentile) instead of average latency because

average values can hide slow user experiences.



p95 ensures that nearly all users experience acceptable performance,

while allowing small network variations.



---



\## 📌 Purpose



These SLOs will be used to:



\- Monitor system performance

\- Detect regressions

\- Identify bottlenecks

\- Power the internal Performance Dashboard





