const {
  parseBody,
  validatePayload,
  sanitizeAnalysisPayload,
  prepareResumePayload,
  sanitizeComparisonJobs,
  validateComparisonJobs,
  runComparisonAnalyses
} = require("./lib/role-ready-core");

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
    const basePayload = sanitizeAnalysisPayload(parsed);
    const jobs = sanitizeComparisonJobs(parsed.jobs);

    const resumeValidation = validatePayload({ ...basePayload, jobDescription: jobs[0] ? jobs[0].jobDescription : basePayload.jobDescription });
    if (resumeValidation) {
      return res.status(400).json({ error: resumeValidation });
    }

    const jobsValidation = validateComparisonJobs(jobs);
    if (jobsValidation) {
      return res.status(400).json({ error: jobsValidation });
    }

    const prepared = await prepareResumePayload(basePayload);
    const result = await runComparisonAnalyses(prepared.payload, prepared.resumeSource, jobs);
    return res.status(200).json(result);
  } catch (error) {
    const message =
      error && error.message ? error.message : "Unexpected server error while comparing roles.";
    return res.status(500).json({ error: message });
  }
};
