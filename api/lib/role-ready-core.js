const MODEL = "llama-3.3-70b-versatile";
const MAX_FIELD_LENGTH = 14000;
const MAX_FILE_SIZE_BYTES = 2.5 * 1024 * 1024;

const COMMON_KEYWORDS = [
  "react",
  "typescript",
  "javascript",
  "node.js",
  "node",
  "sql",
  "postgresql",
  "mysql",
  "supabase",
  "docker",
  "aws",
  "ec2",
  "rest api",
  "api integrations",
  "api integration",
  "graphql",
  "analytics",
  "analytics surfaces",
  "dashboards",
  "patient onboarding",
  "onboarding",
  "release quality",
  "quality assurance",
  "qa",
  "automation",
  "testing",
  "regression testing",
  "product operations",
  "internal tools",
  "workflows",
  "debugging",
  "ci/cd",
  "linux",
  "postman",
  "figma",
  "agile",
  "product collaboration",
  "design collaboration",
  "communication",
  "accessibility",
  "responsive design",
  "html",
  "css",
  "python",
  "java",
  "c",
  "svelte",
  "vite",
  "serverless",
  "vercel",
  "security",
  "cyber security",
  "feature flags",
  "observability",
  "monitoring",
  "data modeling",
  "role-based access",
  "authentication",
  "authorization"
];

const STOPWORDS = new Set([
  "about",
  "after",
  "against",
  "along",
  "also",
  "among",
  "and",
  "any",
  "around",
  "because",
  "before",
  "being",
  "between",
  "build",
  "candidate",
  "company",
  "design",
  "details",
  "during",
  "each",
  "engineer",
  "engineering",
  "experience",
  "from",
  "have",
  "into",
  "jobs",
  "just",
  "more",
  "must",
  "need",
  "operations",
  "product",
  "role",
  "roles",
  "should",
  "show",
  "strong",
  "team",
  "teams",
  "that",
  "their",
  "them",
  "they",
  "this",
  "through",
  "tools",
  "used",
  "using",
  "well",
  "with",
  "within",
  "work",
  "working"
]);

const parseBody = (body) => {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch (error) {
      return {};
    }
  }

  return body;
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");
const normalizeLine = (value, fallback) => normalizeText(value) || fallback;

const clampScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(number)));
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const safeLower = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#./ -]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const uniqueStrings = (items) => {
  const seen = new Set();
  const output = [];

  items.forEach((item) => {
    const normalized = normalizeText(item);
    if (!normalized) {
      return;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    output.push(normalized);
  });

  return output;
};

const answerFrameworkForCategory = (category) => {
  const lower = normalizeText(category).toLowerCase();

  if (lower.includes("behavior")) {
    return "STAR: Situation, Task, Action, Result";
  }

  if (lower.includes("technical")) {
    return "Problem, approach, tradeoff, outcome";
  }

  if (lower.includes("culture")) {
    return "Value, example, decision, result";
  }

  return "Context, execution, collaboration, impact";
};

const normalizeStrengths = (items) =>
  asArray(items)
    .map((item) => ({
      title: normalizeLine(item && item.title, "Untitled strength"),
      detail: normalizeLine(item && (item.detail || item.description), "No detail provided.")
    }))
    .filter((item) => item.title && item.detail)
    .slice(0, 4);

const normalizeGaps = (items) =>
  asArray(items)
    .map((item) => ({
      title: normalizeLine(item && item.title, "Untitled gap"),
      detail: normalizeLine(item && (item.detail || item.description), "No detail provided."),
      fix: normalizeLine(item && item.fix, "No fix provided.")
    }))
    .filter((item) => item.title && item.detail && item.fix)
    .slice(0, 4);

const normalizeBullets = (items) =>
  asArray(items)
    .map((item) => ({
      original: normalizeLine(item && item.original, "No original bullet provided."),
      improved: normalizeLine(item && item.improved, "No improved bullet provided."),
      why_it_works: normalizeLine(item && item.why_it_works, "No explanation provided.")
    }))
    .filter((item) => item.original && item.improved && item.why_it_works)
    .slice(0, 3);

const normalizeQuestions = (items) =>
  asArray(items)
    .map((item) => ({
      category: normalizeLine(item && item.category, "Role-Specific"),
      framework: normalizeLine(item && item.framework, answerFrameworkForCategory(item && item.category)),
      question: normalizeLine(item && item.question, "Untitled interview question"),
      why_it_matters: normalizeLine(item && item.why_it_matters, "No context provided."),
      talking_points: asArray(item && item.talking_points)
        .map((point) => normalizeText(point))
        .filter(Boolean)
        .slice(0, 4)
    }))
    .filter((item) => item.question && item.why_it_matters)
    .slice(0, 4);

const normalizePrepPlan = (items) =>
  asArray(items)
    .map((item, index) => ({
      day: normalizeLine(item && item.day, `Day ${index + 1}`),
      focus: normalizeLine(item && item.focus, "Preparation focus"),
      action: normalizeLine(item && item.action, "No action provided.")
    }))
    .filter((item) => item.day && item.focus && item.action)
    .slice(0, 7);

const detectKeywordCandidates = (jobDescription, resumeText) => {
  const jobLower = safeLower(jobDescription);
  const resumeLower = safeLower(resumeText);
  const matched = [];
  const missing = [];

  COMMON_KEYWORDS.forEach((keyword) => {
    const key = safeLower(keyword);
    if (!key || !jobLower.includes(key)) {
      return;
    }

    if (resumeLower.includes(key)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  if (missing.length < 4) {
    const fallbackWords = uniqueStrings(
      jobLower
        .split(/[^a-z0-9+#./-]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 4 && !STOPWORDS.has(token) && !resumeLower.includes(token))
    );

    fallbackWords.forEach((token) => {
      if (missing.length < 8) {
        missing.push(token);
      }
    });
  }

  return {
    matched: uniqueStrings(matched).slice(0, 8),
    missing: uniqueStrings(missing).slice(0, 8)
  };
};

const mergeKeywordGaps = (modelKeywords, detectedKeywords) =>
  uniqueStrings([].concat(asArray(modelKeywords), asArray(detectedKeywords))).slice(0, 8);

const normalizeAnalysis = (analysis, payload, keywordSignals) => ({
  role_title: normalizeLine(analysis && analysis.role_title, payload.jobTitle || "Target role"),
  company_name: normalizeLine(analysis && analysis.company_name, payload.companyName || "Target company"),
  fit_score: clampScore(analysis && analysis.fit_score),
  decision: normalizeLine(
    analysis && analysis.decision,
    "Analysis generated successfully, but the provider returned a partial decision summary."
  ),
  summary: normalizeLine(
    analysis && analysis.summary,
    "The provider returned a partial analysis. Try running it again for a fuller recruiter-style summary."
  ),
  candidate_pitch: normalizeLine(
    analysis && analysis.candidate_pitch,
    "The provider returned a partial analysis. Try running it again to generate a candidate pitch."
  ),
  recruiter_take: normalizeLine(
    analysis && analysis.recruiter_take,
    "The provider returned a partial analysis. Try running it again to generate the recruiter takeaway."
  ),
  missing_keywords: mergeKeywordGaps(analysis && analysis.missing_keywords, keywordSignals && keywordSignals.missing),
  matched_keywords: uniqueStrings([].concat(asArray(analysis && analysis.matched_keywords), asArray(keywordSignals && keywordSignals.matched))).slice(0, 8),
  strengths: normalizeStrengths(analysis && analysis.strengths),
  gaps: normalizeGaps(analysis && analysis.gaps),
  rewritten_bullets: normalizeBullets(analysis && analysis.rewritten_bullets),
  interview_questions: normalizeQuestions(analysis && analysis.interview_questions),
  prep_plan: normalizePrepPlan(analysis && analysis.prep_plan)
});

const validatePayload = ({ resumeText, resumeFile, jobDescription }) => {
  if (!jobDescription) {
    return "jobDescription is required.";
  }

  if (!resumeText && !resumeFile) {
    return "Provide either resumeText or a supported resume file.";
  }

  if (!resumeFile && resumeText.length < 80) {
    return "resumeText is too short for a meaningful analysis.";
  }

  if (jobDescription.length < 80) {
    return "jobDescription is too short for a meaningful analysis.";
  }

  if (resumeText.length > MAX_FIELD_LENGTH || jobDescription.length > MAX_FIELD_LENGTH) {
    return `Inputs must stay under ${MAX_FIELD_LENGTH} characters each.`;
  }

  if (resumeFile && resumeFile.size > MAX_FILE_SIZE_BYTES) {
    return "Uploaded files must stay under 2.5 MB.";
  }

  return "";
};

const extractResumeBulletCandidates = (resumeText) =>
  resumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*•]/.test(line))
    .map((line) => line.replace(/^[-*•]\s*/, ""))
    .filter(Boolean)
    .slice(0, 8);

const buildMessages = ({ jobTitle, companyName, focusMode, candidateLevel, resumeText, jobDescription, keywordSignals }) => {
  const safeJobTitle = jobTitle || "Target role not provided";
  const safeCompanyName = companyName || "Target company not provided";
  const bulletCandidates = extractResumeBulletCandidates(resumeText);
  const highlightedKeywords = keywordSignals && keywordSignals.missing && keywordSignals.missing.length
    ? keywordSignals.missing.map((item) => `- ${item}`).join("\n")
    : "- No obvious missing keywords were detected locally.";

  return [
    {
      role: "system",
      content:
        "You are RoleReady AI, a precise recruiting and career analysis assistant. Ground every conclusion in the supplied resume and job description. Do not invent experience, metrics, dates, scope, or technologies. Prefer concrete recruiting language over hype. Return only valid JSON and include every required key."
    },
    {
      role: "user",
      content: `Analyze this candidate for the role below.

Focus mode: ${focusMode}
Candidate level: ${candidateLevel}
Job title: ${safeJobTitle}
Company: ${safeCompanyName}

Resume:
${resumeText}

Job description:
${jobDescription}

Locally detected missing keywords from the job description:
${highlightedKeywords}

Resume bullet candidates to improve:
${bulletCandidates.length ? bulletCandidates.map((item) => `- ${item}`).join("\n") : "- No obvious bullet list was detected. Use the strongest concrete lines from the resume."}

Instructions:
- Give a fit score from 0 to 100.
- Make strengths, gaps, and fixes specific to the evidence in the inputs.
- missing_keywords must list 4 to 8 concrete skills, tools, or domain terms from the job description that are weak or absent in the resume.
- matched_keywords must list 3 to 6 relevant skills or tools that already align well.
- Rewrite exactly 3 resume bullets or profile bullets. Every rewrite must be genuinely better than the original.
- For rewritten bullets:
  - preserve the original facts and technologies
  - do not invent metrics
  - if the original is already strong, keep the structure close and only tighten the wording
  - do not use filler words like "successfully", "exceptional", "dynamic", "results-driven", or vague praise
  - start with a strong action verb
  - keep each improved bullet under 26 words
  - stay concise enough to read like a real resume bullet, not a paragraph
  - improve clarity, scope, tools, ownership, and recruiter readability
- For gaps:
  - explain the gap in concrete terms
  - fix must be specific and actionable
  - fix must reference a real project, bullet, technology, workflow, or interview prep action from the supplied inputs
  - never suggest generic courses, workshops, or vague "learn more" advice
- Generate exactly 4 likely interview questions and label them Behavioral, Technical, Role-Specific, and Culture Fit.
- Each interview question must include a framework field.
- Behavioral questions should use STAR.
- Technical questions should use Problem, Approach, Tradeoff, Outcome.
- Role-Specific questions should use Context, Execution, Impact.
- Culture Fit questions should use Value, Example, Result.
- Generate exactly 7 prep plan steps, one for each day.
- Return a single JSON object with exactly these top-level keys:
  role_title, company_name, fit_score, decision, summary, candidate_pitch, recruiter_take, missing_keywords, matched_keywords, strengths, gaps, rewritten_bullets, interview_questions, prep_plan
- strengths: array of 4 objects with title and detail
- gaps: array of 3 objects with title, detail, and fix
- rewritten_bullets: array of 3 objects with original, improved, and why_it_works
- interview_questions: array of 4 objects with category, framework, question, why_it_matters, and talking_points
- talking_points: array of 3 short strings
- prep_plan: array of 7 objects with day, focus, and action
- fit_score must be an integer from 0 to 100
- the JSON must be valid on the first try and every required array must be present even if the content is brief`
    }
  ];
};

const decodeUploadedFile = (resumeFile) => {
  if (!resumeFile || typeof resumeFile !== "object") {
    return null;
  }

  const data = normalizeText(resumeFile.data);
  if (!data) {
    return null;
  }

  try {
    return Buffer.from(data, "base64");
  } catch (error) {
    return null;
  }
};

const createPdfParser = () => {
  let workerModule = null;
  try {
    workerModule = require("pdf-parse/worker");
  } catch (error) {}

  let parserModule = null;
  try {
    parserModule = require("pdf-parse");
  } catch (error) {
    parserModule = require("pdf-parse/node");
  }

  const PDFParse =
    (parserModule && parserModule.PDFParse) ||
    (parserModule && parserModule.default && parserModule.default.PDFParse) ||
    null;
  const legacyParse =
    (typeof parserModule === "function" && parserModule) ||
    (parserModule && typeof parserModule.default === "function" && parserModule.default) ||
    null;

  if (typeof PDFParse !== "function" && typeof legacyParse !== "function") {
    throw new Error("PDF parser could not be initialized.");
  }

  if (workerModule && PDFParse && typeof PDFParse.setWorker === "function") {
    try {
      if (typeof workerModule.getData === "function") {
        PDFParse.setWorker(workerModule.getData());
      } else if (typeof workerModule.getPath === "function") {
        PDFParse.setWorker(workerModule.getPath());
      }
    } catch (error) {}
  }

  return {
    PDFParse,
    legacyParse,
    CanvasFactory: workerModule && workerModule.CanvasFactory ? workerModule.CanvasFactory : undefined
  };
};

const parseUploadedResume = async (resumeFile) => {
  if (!resumeFile) {
    return { resumeText: "", resumeSource: "Pasted resume text" };
  }

  const fileName = normalizeLine(resumeFile.name, "Uploaded resume");
  const fileType = normalizeText(resumeFile.type).toLowerCase();
  const buffer = decodeUploadedFile(resumeFile);
  if (!buffer) {
    throw new Error("The uploaded file could not be decoded.");
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("Uploaded files must stay under 2.5 MB.");
  }

  if (fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    const { PDFParse, legacyParse, CanvasFactory } = createPdfParser();

    if (typeof PDFParse === "function") {
      const parser = new PDFParse(CanvasFactory ? { data: buffer, CanvasFactory } : { data: buffer });

      try {
        const result = await parser.getText();
        const extracted = normalizeText(result && result.text);
        if (!extracted) {
          throw new Error("The uploaded PDF did not contain readable text.");
        }

        return { resumeText: extracted, resumeSource: fileName };
      } finally {
        if (typeof parser.destroy === "function") {
          await parser.destroy().catch(() => {});
        }
      }
    }

    const legacyResult = await legacyParse(buffer);
    const extracted = normalizeText(
      legacyResult && typeof legacyResult === "object" ? legacyResult.text || legacyResult.content : legacyResult
    );
    if (!extracted) {
      throw new Error("The uploaded PDF did not contain readable text.");
    }

    return { resumeText: extracted, resumeSource: fileName };
  }

  const extracted = normalizeText(buffer.toString("utf8"));
  if (!extracted) {
    throw new Error("The uploaded file did not contain readable text.");
  }

  return { resumeText: extracted, resumeSource: fileName };
};

const extractJsonObject = (content) => {
  if (!content) {
    throw new Error("The API response did not include structured output text.");
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(content.slice(start, end + 1));
    }

    throw new Error("The API returned output text, but it was not valid JSON.");
  }
};

const buildGroqBody = (payload, keywordSignals, stream) => ({
  model: MODEL,
  max_completion_tokens: 2400,
  temperature: 0.2,
  stream,
  messages: buildMessages({ ...payload, keywordSignals }),
  response_format: {
    type: "json_object"
  }
});

const sendEvent = (res, eventName, payload) => {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const parseUpstreamEvent = (rawEvent) => {
  const dataLines = rawEvent
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart());

  if (!dataLines.length) {
    return null;
  }

  return dataLines.join("");
};

const runStandardAnalysis = async (payload, resumeSource) => {
  const keywordSignals = detectKeywordCandidates(payload.jobDescription, payload.resumeText);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify(buildGroqBody(payload, keywordSignals, false))
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage =
      data && data.error && data.error.message
        ? data.error.message
        : "Groq did not return a successful response for the analysis request.";
    throw new Error(errorMessage);
  }

  const content = data && data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : "";
  const analysis = extractJsonObject(content);

  return {
    analysis: normalizeAnalysis(analysis, payload, keywordSignals),
    meta: {
      model: MODEL,
      generatedAt: new Date().toISOString(),
      live: true,
      resumeSource
    }
  };
};

const streamSingleAnalysis = async (payload, resumeSource, res) => {
  const keywordSignals = detectKeywordCandidates(payload.jobDescription, payload.resumeText);

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders && res.flushHeaders();

  sendEvent(res, "progress", { percent: 12, label: "Validating request" });
  sendEvent(res, "progress", { percent: 24, label: "Preparing recruiter context" });

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify(buildGroqBody(payload, keywordSignals, true))
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = "Groq did not return a successful response for the analysis request.";
    try {
      const parsed = JSON.parse(errorText);
      message = parsed && parsed.error && parsed.error.message ? parsed.error.message : message;
    } catch (error) {}

    sendEvent(res, "error", { message });
    res.end();
    return;
  }

  if (!response.body || typeof response.body.getReader !== "function") {
    const fallback = await response.json();
    const content = fallback && fallback.choices && fallback.choices[0] && fallback.choices[0].message
      ? fallback.choices[0].message.content
      : "";
    const analysis = extractJsonObject(content);
    sendEvent(res, "final", {
      analysis: normalizeAnalysis(analysis, payload, keywordSignals),
      meta: {
        model: MODEL,
        generatedAt: new Date().toISOString(),
        live: true,
        resumeSource
      }
    });
    res.end();
    return;
  }

  sendEvent(res, "progress", { percent: 36, label: "Streaming model output" });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let upstreamBuffer = "";
  let accumulated = "";
  let doneStreaming = false;
  let lastPercent = 36;

  while (!doneStreaming) {
    const { done, value } = await reader.read();
    upstreamBuffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    const events = upstreamBuffer.split("\n\n");
    upstreamBuffer = events.pop() || "";

    for (const rawEvent of events) {
      const data = parseUpstreamEvent(rawEvent);
      if (!data) {
        continue;
      }

      if (data === "[DONE]") {
        doneStreaming = true;
        break;
      }

      let parsedChunk;
      try {
        parsedChunk = JSON.parse(data);
      } catch (error) {
        continue;
      }

      const token = parsedChunk && parsedChunk.choices && parsedChunk.choices[0] && parsedChunk.choices[0].delta
        ? parsedChunk.choices[0].delta.content || ""
        : "";

      if (!token) {
        continue;
      }

      accumulated += token;
      sendEvent(res, "token", { text: token });

      const nextPercent = Math.min(92, 36 + Math.round(accumulated.length / 28));
      if (nextPercent > lastPercent) {
        lastPercent = nextPercent;
        sendEvent(res, "progress", { percent: lastPercent, label: "Building the analysis board" });
      }
    }

    if (done) {
      doneStreaming = true;
    }
  }

  sendEvent(res, "progress", { percent: 96, label: "Finalizing structured output" });

  try {
    const analysis = extractJsonObject(accumulated);
    sendEvent(res, "final", {
      analysis: normalizeAnalysis(analysis, payload, keywordSignals),
      meta: {
        model: MODEL,
        generatedAt: new Date().toISOString(),
        live: true,
        resumeSource
      }
    });
  } catch (error) {
    sendEvent(res, "error", {
      message: error && error.message ? error.message : "The streamed response could not be finalized."
    });
  }

  res.end();
};

const sanitizeResumeFile = (resumeFile) =>
  resumeFile && typeof resumeFile === "object"
    ? {
        name: normalizeText(resumeFile.name),
        type: normalizeText(resumeFile.type),
        data: normalizeText(resumeFile.data),
        size: Number(resumeFile.size) || 0
      }
    : null;

const sanitizeAnalysisPayload = (parsed) => {
  const resumeFile = sanitizeResumeFile(parsed.resumeFile);

  return {
    jobTitle: normalizeText(parsed.jobTitle),
    companyName: normalizeText(parsed.companyName),
    focusMode: normalizeText(parsed.focusMode) || "recruiter",
    candidateLevel: normalizeText(parsed.candidateLevel) || "internship",
    resumeText: normalizeText(parsed.resumeText),
    jobDescription: normalizeText(parsed.jobDescription),
    resumeFile
  };
};

const prepareResumePayload = async (basePayload) => {
  const parsedResume = basePayload.resumeFile ? await parseUploadedResume(basePayload.resumeFile) : null;

  const payload = {
    jobTitle: basePayload.jobTitle,
    companyName: basePayload.companyName,
    focusMode: basePayload.focusMode,
    candidateLevel: basePayload.candidateLevel,
    resumeText: normalizeText(parsedResume ? parsedResume.resumeText : basePayload.resumeText),
    jobDescription: basePayload.jobDescription
  };

  return {
    payload,
    resumeSource: parsedResume ? parsedResume.resumeSource : "Pasted resume text"
  };
};

const sanitizeComparisonJobs = (parsedJobs) =>
  asArray(parsedJobs)
    .map((job, index) => ({
      id: normalizeLine(job && job.id, `role-${index + 1}`),
      label: normalizeLine(job && job.label, `Role ${index + 1}`),
      jobTitle: normalizeText(job && job.jobTitle),
      companyName: normalizeText(job && job.companyName),
      jobDescription: normalizeText(job && job.jobDescription),
      jobUrl: normalizeText(job && job.jobUrl)
    }))
    .filter((job) => job.jobDescription || job.jobUrl)
    .slice(0, 3);

const validateComparisonJobs = (jobs) => {
  if (jobs.length < 2) {
    return "Provide at least two job descriptions to compare.";
  }

  const missing = jobs.find((job) => !job.jobDescription);
  if (missing) {
    return `${missing.label} is missing a job description.`;
  }

  const tooShort = jobs.find((job) => job.jobDescription && job.jobDescription.length < 80);
  if (tooShort) {
    return `${tooShort.label} is too short for a meaningful analysis.`;
  }

  return "";
};

const runComparisonAnalyses = async (basePayload, resumeSource, jobs) => {
  const results = [];

  for (let index = 0; index < jobs.length; index += 1) {
    const job = jobs[index];
    const result = await runStandardAnalysis(
      {
        jobTitle: job.jobTitle || basePayload.jobTitle,
        companyName: job.companyName || basePayload.companyName,
        focusMode: basePayload.focusMode,
        candidateLevel: basePayload.candidateLevel,
        resumeText: basePayload.resumeText,
        jobDescription: job.jobDescription
      },
      resumeSource
    );

    results.push({
      id: job.id,
      label: job.label,
      analysis: result.analysis,
      meta: result.meta
    });
  }

  const ranking = results
    .map((item) => ({
      id: item.id,
      label: item.label,
      role_title: item.analysis.role_title,
      company_name: item.analysis.company_name,
      fit_score: item.analysis.fit_score,
      decision: item.analysis.decision,
      recruiter_take: item.analysis.recruiter_take
    }))
    .sort((left, right) => right.fit_score - left.fit_score);

  return {
    ranking,
    results,
    meta: {
      model: MODEL,
      generatedAt: new Date().toISOString(),
      live: true,
      resumeSource,
      comparedRoles: jobs.length
    }
  };
};

module.exports = {
  MODEL,
  MAX_FIELD_LENGTH,
  MAX_FILE_SIZE_BYTES,
  parseBody,
  normalizeText,
  normalizeLine,
  validatePayload,
  sanitizeAnalysisPayload,
  sanitizeComparisonJobs,
  validateComparisonJobs,
  prepareResumePayload,
  runStandardAnalysis,
  streamSingleAnalysis,
  runComparisonAnalyses,
  sendEvent,
  detectKeywordCandidates
};
