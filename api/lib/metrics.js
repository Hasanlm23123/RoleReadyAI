const { normalizeText } = require("./role-ready-core");

const COUNTER_API_BASE = "https://countapi.mileshilliard.com/api/v1";
const COUNTER_PREFIX = normalizeText(process.env.COUNTER_PREFIX) || "rolereadyai-hasanlm23123";

const METRIC_KEYS = {
  pageViews: "page-views",
  analysesStarted: "analyses-started",
  analysesCompleted: "analyses-completed",
  exports: "exports",
  comparisons: "comparisons",
  bulletRewrites: "bullet-rewrites",
  fitScoreTotal: "fit-score-total",
  fitScoreCount: "fit-score-count",
  jobUrlImports: "job-url-imports",
  sectionSnapshot: "section-snapshot",
  sectionScoreBreakdown: "section-score-breakdown",
  sectionPositioning: "section-positioning",
  sectionGaps: "section-gaps",
  sectionRewrites: "section-rewrites",
  sectionQuestions: "section-questions",
  sectionPrep: "section-prep",
  sectionCompare: "section-compare"
};

const metricNameMap = {
  analyses: METRIC_KEYS.analysesCompleted,
  averageFit: METRIC_KEYS.fitScoreCount,
  exports: METRIC_KEYS.exports,
  bullets: METRIC_KEYS.bulletRewrites,
  comparisons: METRIC_KEYS.comparisons,
  views: METRIC_KEYS.pageViews
};

const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const counterKey = (metric) => `${COUNTER_PREFIX}-${metric}`;

const counterRequest = async (path) => {
  const response = await fetch(`${COUNTER_API_BASE}${path}`, { method: "GET", headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error("Counter API request failed.");
  }

  return response.json();
};

const getCounterValue = async (metric) => {
  try {
    const data = await counterRequest(`/get/${counterKey(metric)}`);
    return asNumber(data && data.value);
  } catch (error) {
    return 0;
  }
};

const setCounterValue = async (metric, value) => {
  try {
    await counterRequest(`/set/${counterKey(metric)}?value=${encodeURIComponent(String(Math.max(0, Math.round(value))))}`);
  } catch (error) {}
};

const incrementCounter = async (metric, amount = 1) => {
  if (amount === 1) {
    try {
      await counterRequest(`/hit/${counterKey(metric)}`);
      return;
    } catch (error) {}
  }

  const current = await getCounterValue(metric);
  await setCounterValue(metric, current + amount);
};

const recordMetricEvent = async (eventName, payload = {}) => {
  const event = normalizeText(eventName);
  if (!event) {
    return;
  }

  if (event === "page_view") {
    await incrementCounter(METRIC_KEYS.pageViews);
    return;
  }

  if (event === "analysis_started") {
    await incrementCounter(METRIC_KEYS.analysesStarted);
    return;
  }

  if (event === "analysis_completed") {
    const fitScore = asNumber(payload.fitScore);
    const rewritesGenerated = Math.max(0, asNumber(payload.rewritesGenerated) || 3);
    await Promise.all([
      incrementCounter(METRIC_KEYS.analysesCompleted),
      incrementCounter(METRIC_KEYS.fitScoreCount),
      incrementCounter(METRIC_KEYS.fitScoreTotal, fitScore),
      incrementCounter(METRIC_KEYS.bulletRewrites, rewritesGenerated)
    ]);
    return;
  }

  if (event === "compare_completed") {
    const comparedRoles = Math.max(0, asNumber(payload.comparedRoles));
    const rewritesGenerated = Math.max(0, asNumber(payload.rewritesGenerated));
    const fitScoreTotal = Math.max(0, asNumber(payload.fitScoreTotal));
    await Promise.all([
      incrementCounter(METRIC_KEYS.comparisons),
      incrementCounter(METRIC_KEYS.analysesCompleted, comparedRoles),
      incrementCounter(METRIC_KEYS.fitScoreCount, comparedRoles),
      incrementCounter(METRIC_KEYS.fitScoreTotal, fitScoreTotal),
      incrementCounter(METRIC_KEYS.bulletRewrites, rewritesGenerated)
    ]);
    return;
  }

  if (event === "export_pdf") {
    await incrementCounter(METRIC_KEYS.exports);
    return;
  }

  if (event === "job_url_imported") {
    await incrementCounter(METRIC_KEYS.jobUrlImports);
    return;
  }

  if (event === "section_view") {
    const section = normalizeText(payload.section).toLowerCase();
    const sectionMetric = {
      snapshot: METRIC_KEYS.sectionSnapshot,
      "score-breakdown": METRIC_KEYS.sectionScoreBreakdown,
      positioning: METRIC_KEYS.sectionPositioning,
      gaps: METRIC_KEYS.sectionGaps,
      rewrites: METRIC_KEYS.sectionRewrites,
      questions: METRIC_KEYS.sectionQuestions,
      prep: METRIC_KEYS.sectionPrep,
      compare: METRIC_KEYS.sectionCompare
    }[section];

    if (sectionMetric) {
      await incrementCounter(sectionMetric);
    }
  }
};

const getMetricsSnapshot = async () => {
  const [
    pageViews,
    analysesCompleted,
    analysesStarted,
    exportsCount,
    comparisons,
    bulletRewrites,
    fitScoreTotal,
    fitScoreCount,
    jobUrlImports,
    sectionSnapshot,
    sectionScoreBreakdown,
    sectionPositioning,
    sectionGaps,
    sectionRewrites,
    sectionQuestions,
    sectionPrep,
    sectionCompare
  ] = await Promise.all([
    getCounterValue(METRIC_KEYS.pageViews),
    getCounterValue(METRIC_KEYS.analysesCompleted),
    getCounterValue(METRIC_KEYS.analysesStarted),
    getCounterValue(METRIC_KEYS.exports),
    getCounterValue(METRIC_KEYS.comparisons),
    getCounterValue(METRIC_KEYS.bulletRewrites),
    getCounterValue(METRIC_KEYS.fitScoreTotal),
    getCounterValue(METRIC_KEYS.fitScoreCount),
    getCounterValue(METRIC_KEYS.jobUrlImports),
    getCounterValue(METRIC_KEYS.sectionSnapshot),
    getCounterValue(METRIC_KEYS.sectionScoreBreakdown),
    getCounterValue(METRIC_KEYS.sectionPositioning),
    getCounterValue(METRIC_KEYS.sectionGaps),
    getCounterValue(METRIC_KEYS.sectionRewrites),
    getCounterValue(METRIC_KEYS.sectionQuestions),
    getCounterValue(METRIC_KEYS.sectionPrep),
    getCounterValue(METRIC_KEYS.sectionCompare)
  ]);

  const averageFitScore = fitScoreCount ? Math.round(fitScoreTotal / fitScoreCount) : 0;
  const completionRate = pageViews ? Math.round((analysesCompleted / pageViews) * 100) : 0;

  return {
    pageViews,
    analysesStarted,
    analysesCompleted,
    exports: exportsCount,
    comparisons,
    bulletRewrites,
    averageFitScore,
    jobUrlImports,
    completionRate,
    sectionViews: {
      snapshot: sectionSnapshot,
      "score-breakdown": sectionScoreBreakdown,
      positioning: sectionPositioning,
      gaps: sectionGaps,
      rewrites: sectionRewrites,
      questions: sectionQuestions,
      prep: sectionPrep,
      compare: sectionCompare
    }
  };
};

const buildBadgePayload = (metric, snapshot) => {
  if (metric === "analyses") {
    return { schemaVersion: 1, label: "analyses", message: String(snapshot.analysesCompleted), color: "0f766e" };
  }

  if (metric === "average-fit") {
    return { schemaVersion: 1, label: "avg fit", message: `${snapshot.averageFitScore}%`, color: "1d4ed8" };
  }

  if (metric === "exports") {
    return { schemaVersion: 1, label: "exports", message: String(snapshot.exports), color: "d97706" };
  }

  if (metric === "comparisons") {
    return { schemaVersion: 1, label: "comparisons", message: String(snapshot.comparisons), color: "7c3aed" };
  }

  return { schemaVersion: 1, label: "views", message: String(snapshot.pageViews), color: "334155" };
};

module.exports = {
  METRIC_KEYS,
  metricNameMap,
  recordMetricEvent,
  getMetricsSnapshot,
  buildBadgePayload
};
