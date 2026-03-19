const {
  parseBody,
  validatePayload,
  sanitizeAnalysisPayload,
  prepareResumePayload,
  streamSingleAnalysis,
  runStandardAnalysis,
  sendEvent
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
    const stream = Boolean(parsed.stream);
    const basePayload = sanitizeAnalysisPayload(parsed);

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

    const prepared = await prepareResumePayload(basePayload);
    const postParseValidation = validatePayload({ ...prepared.payload, resumeFile: null });
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
      return streamSingleAnalysis(prepared.payload, prepared.resumeSource, res);
    }

    const result = await runStandardAnalysis(prepared.payload, prepared.resumeSource);
    return res.status(200).json(result);
  } catch (error) {
    const parsed = parseBody(req.body);
    const message =
      error && error.message ? error.message : "Unexpected server error while generating the analysis.";

    if (parsed && parsed.stream) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      sendEvent(res, "error", { message });
      return res.end();
    }

    return res.status(500).json({ error: message });
  }
};
