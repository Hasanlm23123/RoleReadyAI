const { parseBody, normalizeText } = require("./lib/role-ready-core");
const { recordMetricEvent, getMetricsSnapshot, buildBadgePayload } = require("./lib/metrics");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    try {
      const metric = normalizeText(req.query && req.query.metric).toLowerCase();
      const format = normalizeText(req.query && req.query.format).toLowerCase();
      const snapshot = await getMetricsSnapshot();

      if (format === "badge") {
        return res.status(200).json(buildBadgePayload(metric, snapshot));
      }

      return res.status(200).json(snapshot);
    } catch (error) {
      const message = error && error.message ? error.message : "Unable to load metrics.";
      return res.status(500).json({ error: message });
    }
  }

  if (req.method === "POST") {
    try {
      const parsed = parseBody(req.body);
      const eventName = normalizeText(parsed.event);
      await recordMetricEvent(eventName, parsed.payload || {});
      const snapshot = await getMetricsSnapshot();
      return res.status(200).json({ ok: true, snapshot });
    } catch (error) {
      const message = error && error.message ? error.message : "Unable to record the analytics event.";
      return res.status(500).json({ error: message });
    }
  }

  return res.status(405).json({ error: "Method not allowed." });
};
