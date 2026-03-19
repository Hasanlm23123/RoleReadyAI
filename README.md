# RoleReady AI

RoleReady AI is a deployed resume-to-interview analysis studio built to feel like a real candidate-support product, not a prompt wrapper.

## What It Does

- Uploads a PDF resume or accepts pasted resume text
- Imports a job description from pasted text or a public job URL
- Streams a recruiter-style analysis into the UI
- Scores resume-to-role fit with a visual gauge
- Surfaces matched keywords and ATS-style gaps
- Rewrites resume bullets in a side-by-side before/after view
- Generates categorized interview questions with answer frameworks
- Builds a 7-day prep plan
- Compares one resume across up to three roles
- Exports the final report as a PDF
- Tracks basic usage metrics for live product signals

## Stack

- Frontend: static HTML, CSS, and vanilla JavaScript
- Backend: Vercel serverless functions under `api/`
- LLM provider: Groq Chat Completions API
- Resume parsing: `pdf-parse`
- Export: `html2canvas` + `jsPDF`
- Lightweight product metrics: CountAPI-backed counters through `api/metrics`

## Feature Map

- Main analysis route: `api/role-ready.js`
- Multi-role comparison route: `api/compare.js`
- Job URL extraction route: `api/extract-job.js`
- Metrics route: `api/metrics.js`
- Shared backend logic: `api/lib/role-ready-core.js`

## Deployment

1. Import the repo into Vercel.
2. Add `GROQ_API_KEY` in Vercel environment variables.
3. Optionally add `COUNTER_PREFIX` if you want isolated metrics.
4. Deploy.

The frontend talks to `/api/role-ready`, `/api/compare`, `/api/extract-job`, and `/api/metrics`, so the full product experience works when the repo is hosted on Vercel. On static hosting, the UI falls back to the built-in demo scenario.

## Product Metrics Dashboard

Live badge endpoints are exposed through the deployed app:

- Analyses: `https://rolereadyai-hasanlm23123s-projects.vercel.app/api/metrics?format=badge&metric=analyses`
- Average fit: `https://rolereadyai-hasanlm23123s-projects.vercel.app/api/metrics?format=badge&metric=average-fit`
- Exports: `https://rolereadyai-hasanlm23123s-projects.vercel.app/api/metrics?format=badge&metric=exports`
- Comparisons: `https://rolereadyai-hasanlm23123s-projects.vercel.app/api/metrics?format=badge&metric=comparisons`

Example badge markup:

```md
![Analyses](https://rolereadyai-hasanlm23123s-projects.vercel.app/api/metrics?format=badge&metric=analyses)
![Average Fit](https://rolereadyai-hasanlm23123s-projects.vercel.app/api/metrics?format=badge&metric=average-fit)
```

## Notes

- The backend uses Groq's OpenAI-compatible API base URL.
- The prompt is tuned to avoid vague resume rewrites and generic gap advice.
- The PDF path supports both `PDFParse` class usage and legacy parser fallbacks.
- The metrics layer is lightweight by design so the deployed app can show product signals without extra infrastructure.
