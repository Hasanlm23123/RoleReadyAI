const MODEL = "llama-3.3-70b-versatile";
const MAX_FIELD_LENGTH = 14000;
const MAX_FILE_SIZE_BYTES = 2.5 * 1024 * 1024;

const parseBody = (body) => {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
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

const normalizeKeywordGaps = (items) =>
  asArray(items)
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .slice(0, 8);

const normalizeAnalysis = (analysis, payload) => ({
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
  missing_keywords: normalizeKeywordGaps(analysis && analysis.missing_keywords),
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

const buildMessages = ({ jobTitle, companyName, focusMode, candidateLevel, resumeText, jobDescription }) => {
  const safeJobTitle = jobTitle || "Target role not provided";
  const safeCompanyName = companyName || "Target company not provided";
  const bulletCandidates = extractResumeBulletCandidates(resumeText);

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

Resume bullet candidates to improve:
${bulletCandidates.length ? bulletCandidates.map((item) => `- ${item}`).join("\n") : "- No obvious bullet list was detected. Use the strongest concrete lines from the resume."}

Instructions:
- Give a fit score from 0 to 100.
- Make strengths, gaps, and fixes specific to the evidence in the inputs.
- missing_keywords must list 4 to 8 concrete skills, tools, or domain terms from the job description that are weak or absent in the resume.
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
- Generate exactly 4 likely interview questions and label each as Behavioral, Technical, Role-Specific, or Collaboration.
- Generate exactly 7 prep plan steps, one for each day.
- Return a single JSON object with exactly these top-level keys:
  role_title, company_name, fit_score, decision, summary, candidate_pitch, recruiter_take, missing_keywords, strengths, gaps, rewritten_bullets, interview_questions, prep_plan
- strengths: array of 4 objects with title and detail
- gaps: array of 3 objects with title, detail, and fix
- rewritten_bullets: array of 3 objects with original, improved, and why_it_works
- interview_questions: array of 4 objects with category, question, why_it_matters, and talking_points
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
  } catch {
    return null;
  }
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
    let PDFParse;
    try {
      ({ PDFParse } = require("pdf-parse/node"));
    } catch {
      ({ PDFParse } = require("pdf-parse"));
    }

    const parser = new PDFParse({ data: buffer });
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
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(content.slice(start, end + 1));
    }

    throw new Error("The API returned output text, but it was not valid JSON.");
  }
};

const buildGroqBody = (payload, stream) => ({
  model: MODEL,
  max_completion_tokens: 2200,
  temperature: 0.2,
  stream,
  messages: buildMessages(payload),
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
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify(buildGroqBody(payload, false))
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage =
      data && data.error && data.error.message
        ? data.error.message
        : "Groq did not return a successful response for the analysis request.";
    throw new Error(errorMessage);
  }

  const content = data?.choices?.[0]?.message?.content;
  const analysis = extractJsonObject(content);

  return {
    analysis: normalizeAnalysis(analysis, payload),
    meta: {
      model: MODEL,
      generatedAt: new Date().toISOString(),
      live: true,
      resumeSource
    }
  };
};

const streamAnalysis = async (payload, resumeSource, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  sendEvent(res, "progress", { percent: 12, label: "Validating request" });
  sendEvent(res, "progress", { percent: 24, label: "Preparing recruiter context" });

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify(buildGroqBody(payload, true))
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = "Groq did not return a successful response for the analysis request.";
    try {
      const parsed = JSON.parse(errorText);
      message = parsed && parsed.error && parsed.error.message ? parsed.error.message : message;
    } catch {}

    sendEvent(res, "error", { message });
    res.end();
    return;
  }

  if (!response.body || typeof response.body.getReader !== "function") {
    const fallback = await response.json();
    const content = fallback?.choices?.[0]?.message?.content;
    const analysis = extractJsonObject(content);
    sendEvent(res, "final", {
      analysis: normalizeAnalysis(analysis, payload),
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
      } catch {
        continue;
      }

      const token = parsedChunk?.choices?.[0]?.delta?.content || "";
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
      analysis: normalizeAnalysis(analysis, payload),
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

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY in the deployment environment." });
  }

  try {
    const parsed = parseBody(req.body);
    const stream = Boolean(parsed.stream);
    const resumeFile =
      parsed.resumeFile && typeof parsed.resumeFile === "object"
        ? {
            name: normalizeText(parsed.resumeFile.name),
            type: normalizeText(parsed.resumeFile.type),
            data: normalizeText(parsed.resumeFile.data),
            size: Number(parsed.resumeFile.size) || 0
          }
        : null;

    const basePayload = {
      jobTitle: normalizeText(parsed.jobTitle),
      companyName: normalizeText(parsed.companyName),
      focusMode: normalizeText(parsed.focusMode) || "recruiter",
      candidateLevel: normalizeText(parsed.candidateLevel) || "internship",
      resumeText: normalizeText(parsed.resumeText),
      jobDescription: normalizeText(parsed.jobDescription),
      resumeFile
    };

    const validationError = validatePayload(basePayload);
    if (validationError) {
      if (stream) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        sendEvent(res, "error", { message: validationError });
        return res.end();
      }

      return res.status(400).json({ error: validationError });
    }

    const parsedResume = resumeFile ? await parseUploadedResume(resumeFile) : null;
    const payload = {
      jobTitle: basePayload.jobTitle,
      companyName: basePayload.companyName,
      focusMode: basePayload.focusMode,
      candidateLevel: basePayload.candidateLevel,
      resumeText: normalizeText(parsedResume ? parsedResume.resumeText : basePayload.resumeText),
      jobDescription: basePayload.jobDescription
    };

    const resumeSource = parsedResume ? parsedResume.resumeSource : "Pasted resume text";
    const postParseValidation = validatePayload({ ...payload, resumeFile: null });
    if (postParseValidation) {
      if (stream) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        sendEvent(res, "error", { message: postParseValidation });
        return res.end();
      }

      return res.status(400).json({ error: postParseValidation });
    }

    if (stream) {
      return streamAnalysis(payload, resumeSource, res);
    }

    const result = await runStandardAnalysis(payload, resumeSource);
    return res.status(200).json(result);
  } catch (error) {
    const message =
      error && error.message ? error.message : "Unexpected server error while generating the analysis.";

    if (parseBody(req.body).stream) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      sendEvent(res, "error", { message });
      return res.end();
    }

    return res.status(500).json({ error: message });
  }
};
