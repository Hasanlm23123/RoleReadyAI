const { parseBody, normalizeText } = require("./lib/role-ready-core");
const { extractJobFromUrl } = require("./lib/job-extractor");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const parsed = parseBody(req.body);
    const url = normalizeText(parsed.url);

    if (!url) {
      return res.status(400).json({ error: "A job URL is required." });
    }

    let target;
    try {
      target = new URL(url);
    } catch (error) {
      return res.status(400).json({ error: "Enter a valid absolute URL." });
    }

    if (!/^https?:$/i.test(target.protocol)) {
      return res.status(400).json({ error: "Only http and https URLs are supported." });
    }

    const extracted = await extractJobFromUrl(target.toString());
    return res.status(200).json(extracted);
  } catch (error) {
    const message =
      error && error.message ? error.message : "Unable to extract the job description from that URL.";
    return res.status(500).json({ error: message });
  }
};
