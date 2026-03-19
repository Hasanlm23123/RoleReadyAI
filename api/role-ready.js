const MODEL = "llama-3.3-70b-versatile";
const MAX_FIELD_LENGTH = 14000;

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
      question: normalizeLine(item && item.question, "Untitled interview question"),
      why_it_matters: normalizeLine(item && item.why_it_matters, "No context provided."),
      talking_points: asArray(item && item.talking_points)
        .map((point) => normalizeText(point))
        .filter(Boolean)
        .slice(0, 4)
    }))
    .filter((item) => item.question && item.why_it_matters)
    .slice(0, 3);

const normalizePrepPlan = (items) =>
  asArray(items)
    .map((item, index) => ({
      day: normalizeLine(item && item.day, `Day ${index + 1}`),
      focus: normalizeLine(item && item.focus, "Preparation focus"),
      action: normalizeLine(item && item.action, "No action provided.")
    }))
    .filter((item) => item.day && item.focus && item.action)
    .slice(0, 7);

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
  strengths: normalizeStrengths(analysis && analysis.strengths),
  gaps: normalizeGaps(analysis && analysis.gaps),
  rewritten_bullets: normalizeBullets(analysis && analysis.rewritten_bullets),
  interview_questions: normalizeQuestions(analysis && analysis.interview_questions),
  prep_plan: normalizePrepPlan(analysis && analysis.prep_plan)
});

const validatePayload = ({ resumeText, jobDescription }) => {
  if (!resumeText || !jobDescription) {
    return "Both resumeText and jobDescription are required.";
  }

  if (resumeText.length < 80) {
    return "resumeText is too short for a meaningful analysis.";
  }

  if (jobDescription.length < 80) {
    return "jobDescription is too short for a meaningful analysis.";
  }

  if (resumeText.length > MAX_FIELD_LENGTH || jobDescription.length > MAX_FIELD_LENGTH) {
    return `Inputs must stay under ${MAX_FIELD_LENGTH} characters each.`;
  }

  return "";
};

const buildMessages = ({ jobTitle, companyName, focusMode, candidateLevel, resumeText, jobDescription }) => {
  const safeJobTitle = jobTitle || "Target role not provided";
  const safeCompanyName = companyName || "Target company not provided";

  return [
    {
      role: "system",
      content:
        "You are RoleReady AI, a precise recruiting and career analysis assistant. Ground every conclusion in the supplied resume and job description. Do not invent experience, metrics, or technologies. Prefer direct, useful recruiting language over hype. Make the rewritten bullets stronger, but do not fabricate facts. Return only valid JSON. Do not use markdown. Do not wrap the JSON in code fences. Always include every required key even if you need to provide a brief best-effort answer."
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

Instructions:
- Give a fit score from 0 to 100.
- Make strengths and gaps specific to the evidence in the inputs.
- Rewrite exactly 3 resume bullets or profile bullets in a stronger, recruiter-friendly way.
- Generate exactly 3 likely interview questions with concise talking points.
- Generate exactly 7 prep plan steps, one for each day.
- If company information is missing, still analyze the role and note that the company field was not provided.
- Return a single JSON object with exactly these top-level keys:
  role_title, company_name, fit_score, decision, summary, candidate_pitch, recruiter_take, strengths, gaps, rewritten_bullets, interview_questions, prep_plan
- strengths: array of 4 objects with title and detail
- gaps: array of 3 objects with title, detail, and fix
- rewritten_bullets: array of 3 objects with original, improved, and why_it_works
- interview_questions: array of 3 objects with question, why_it_matters, and talking_points
- talking_points: array of 3 short strings
- prep_plan: array of 7 objects with day, focus, and action
- fit_score must be an integer from 0 to 100`
    }
  ];
};

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY in the deployment environment." });
  }

  const parsed = parseBody(req.body);
  const payload = {
    jobTitle: normalizeText(parsed.jobTitle),
    companyName: normalizeText(parsed.companyName),
    focusMode: normalizeText(parsed.focusMode) || "recruiter",
    candidateLevel: normalizeText(parsed.candidateLevel) || "internship",
    resumeText: normalizeText(parsed.resumeText),
    jobDescription: normalizeText(parsed.jobDescription)
  };

  const validationError = validatePayload(payload);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        max_completion_tokens: 1800,
        temperature: 0.2,
        messages: buildMessages(payload),
        response_format: {
          type: "json_object"
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMessage =
        data && data.error && data.error.message
          ? data.error.message
          : "Groq did not return a successful response for the analysis request.";
      return res.status(response.status).json({ error: errorMessage });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: "The API response did not include structured output text." });
    }

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      return res.status(502).json({
        error: "The API returned output text, but it was not valid JSON."
      });
    }

    return res.status(200).json({
      analysis: normalizeAnalysis(analysis, payload),
      meta: {
        model: MODEL,
        generatedAt: new Date().toISOString(),
        live: true
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error && error.message ? error.message : "Unexpected server error while generating the analysis."
    });
  }
};
