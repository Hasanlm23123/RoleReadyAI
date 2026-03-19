const isGithubPages = window.location.hostname.endsWith("github.io");
const MAX_UPLOAD_BYTES = 2.5 * 1024 * 1024;
const HISTORY_KEY = "roleready-history-v2";

const form = document.getElementById("analysisForm");
const analyzeButton = document.getElementById("analyzeButton");
const compareButton = document.getElementById("compareButton");
const demoButton = document.getElementById("demoButton");
const heroDemoButton = document.getElementById("heroDemoButton");
const clearButton = document.getElementById("clearButton");
const previewBanner = document.getElementById("previewBanner");
const emptyState = document.getElementById("emptyState");
const resultsContent = document.getElementById("resultsContent");
const statusPill = document.getElementById("statusPill");
const scoreRing = document.getElementById("scoreRing");
const backToPortfolioLink = document.getElementById("backToPortfolioLink");
const exportPdfButton = document.getElementById("exportPdfButton");
const historyList = document.getElementById("historyList");
const comparisonList = document.getElementById("comparisonList");
const comparisonEmpty = document.getElementById("comparisonEmpty");
const comparisonBoard = document.querySelector(".comparison-board");

const uploadDropzone = document.getElementById("uploadDropzone");
const chooseFileButton = document.getElementById("chooseFileButton");
const resumeFileInput = document.getElementById("resumeFileInput");
const fileMeta = document.getElementById("fileMeta");
const fileNameLabel = document.getElementById("fileNameLabel");
const removeFileButton = document.getElementById("removeFileButton");

const analysisModal = document.getElementById("analysisModal");
const modalProgressRing = document.getElementById("modalProgressRing");
const modalProgressValue = document.getElementById("modalProgressValue");
const modalStageText = document.getElementById("modalStageText");
const streamPreview = document.getElementById("streamPreview");

const metricAnalysesValue = document.getElementById("metricAnalysesValue");
const metricAverageFitValue = document.getElementById("metricAverageFitValue");
const metricExportsValue = document.getElementById("metricExportsValue");
const metricBulletsValue = document.getElementById("metricBulletsValue");
const heroPreviewScore = document.getElementById("heroPreviewScore");
const heroPreviewRole = document.getElementById("heroPreviewRole");
const heroPreviewSummary = document.getElementById("heroPreviewSummary");
const heroPreviewKeywords = document.getElementById("heroPreviewKeywords");

const insightPageViews = document.getElementById("insightPageViews");
const insightCompletionRate = document.getElementById("insightCompletionRate");
const insightComparisons = document.getElementById("insightComparisons");
const insightImports = document.getElementById("insightImports");
const sectionViewList = document.getElementById("sectionViewList");

const fields = {
  jobTitle: document.getElementById("jobTitle"),
  companyName: document.getElementById("companyName"),
  focusMode: document.getElementById("focusMode"),
  candidateLevel: document.getElementById("candidateLevel"),
  jobUrl1: document.getElementById("jobUrl1"),
  resumeText: document.getElementById("resumeText"),
  jobDescription: document.getElementById("jobDescription"),
  jobTitle2: document.getElementById("jobTitle2"),
  companyName2: document.getElementById("companyName2"),
  jobUrl2: document.getElementById("jobUrl2"),
  jobDescription2: document.getElementById("jobDescription2"),
  jobTitle3: document.getElementById("jobTitle3"),
  companyName3: document.getElementById("companyName3"),
  jobUrl3: document.getElementById("jobUrl3"),
  jobDescription3: document.getElementById("jobDescription3")
};

const fetchButtons = {
  1: document.getElementById("fetchJob1"),
  2: document.getElementById("fetchJob2"),
  3: document.getElementById("fetchJob3")
};

const output = {
  fitScoreValue: document.getElementById("fitScoreValue"),
  roleMeta: document.getElementById("roleMeta"),
  companyMeta: document.getElementById("companyMeta"),
  decisionMeta: document.getElementById("decisionMeta"),
  resumeSourceMeta: document.getElementById("resumeSourceMeta"),
  summaryHeadline: document.getElementById("summaryHeadline"),
  summaryText: document.getElementById("summaryText"),
  generatedMeta: document.getElementById("generatedMeta"),
  candidatePitch: document.getElementById("candidatePitch"),
  recruiterTake: document.getElementById("recruiterTake"),
  keywordGapList: document.getElementById("keywordGapList"),
  matchedKeywordList: document.getElementById("matchedKeywordList"),
  strengthsList: document.getElementById("strengthsList"),
  gapsList: document.getElementById("gapsList"),
  rewritesList: document.getElementById("rewritesList"),
  questionsList: document.getElementById("questionsList"),
  prepPlanList: document.getElementById("prepPlanList")
};

const demoInputs = {
  main: {
    jobTitle: "Associate Product Engineer",
    companyName: "Northstar Health",
    focusMode: "recruiter",
    candidateLevel: "new-grad",
    jobUrl1: "",
    resumeText: `Maya Carter
University of Maryland Information Science student graduating in May 2026.

Experience
- Product Engineering Intern, Harbor Atlas, Summer 2025
  Built internal dashboards in React, shipped onboarding workflow updates, and partnered with design to reduce QA churn before release.
- Software QA Intern, Finch Systems, 2024
  Validated REST endpoints in Postman, wrote regression test cases, and documented release-blocking edge cases for the engineering team.
- Peer Tech Coach, Campus Learning Lab, 2023 to Present
  Helped students debug web assignments, explain JavaScript fundamentals, and break down technical concepts clearly.

Projects
- ShiftPilot, a full-stack scheduling app with role-based routing, Supabase auth, PostgreSQL data, and reminder emails.
- SignalBoard, a real-time analytics dashboard with responsive filters and chart-driven reporting.
- Browser survival game with wave spawning, collision logic, and persistent high-score tracking.

Skills
JavaScript, TypeScript, React, Node.js, Supabase, PostgreSQL, HTML, CSS, Python, Postman, Git, Figma`,
    jobDescription: `Northstar Health is hiring an Associate Product Engineer to build patient onboarding flows, internal tools, and analytics surfaces used by operations teams. The role works across React interfaces, API integrations, debugging, SQL-backed product features, and release quality. Strong candidates show ownership, communicate well with design and product, and can ship polished user-facing work while improving reliability behind the scenes.`
  },
  compare: [
    {
      id: "role-1",
      label: "Role 1",
      jobTitle: "Associate Product Engineer",
      companyName: "Northstar Health",
      jobDescription: `Northstar Health is hiring an Associate Product Engineer to build patient onboarding flows, internal tools, and analytics surfaces used by operations teams. The role works across React interfaces, API integrations, debugging, SQL-backed product features, and release quality. Strong candidates show ownership, communicate well with design and product, and can ship polished user-facing work while improving reliability behind the scenes.`,
      jobUrl: ""
    },
    {
      id: "role-2",
      label: "Role 2",
      jobTitle: "Frontend Engineer",
      companyName: "Orbit Commerce",
      jobDescription: `Orbit Commerce is hiring a Frontend Engineer to build responsive React and TypeScript experiences for merchant onboarding and analytics dashboards. The role values accessibility, debugging, API integration, design collaboration, and shipping polished user-facing features with measurable product impact.`,
      jobUrl: ""
    },
    {
      id: "role-3",
      label: "Role 3",
      jobTitle: "QA Automation Engineer",
      companyName: "Blueframe Labs",
      jobDescription: `Blueframe Labs is hiring a QA Automation Engineer to create regression coverage, validate API behavior, document release risks, and collaborate with engineering on release quality. Strong candidates understand product workflows, communicate clearly, and improve testing discipline without slowing delivery.`,
      jobUrl: ""
    }
  ]
};

const demoSingleResult = {
  analysis: {
    role_title: "Associate Product Engineer",
    company_name: "Northstar Health",
    fit_score: 84,
    decision: "Strong early-career match with clear product-delivery upside",
    summary:
      "Maya reads like a credible early-career product engineer because the profile combines shipped React work, QA discipline, technical communication, and one concrete full-stack project.",
    candidate_pitch:
      "Product-minded early-career engineer with React shipping experience, API validation work, and a full-stack scheduling build that shows growing backend ownership.",
    recruiter_take:
      "The strongest signal is the combination of product execution and release quality. The next improvement is tighter SQL and analytics framing.",
    missing_keywords: ["SQL", "patient onboarding", "analytics surfaces", "release quality", "product operations"],
    matched_keywords: ["React", "API integrations", "debugging", "communication"],
    strengths: [
      { title: "Real product-shipping internship signal", detail: "The Harbor Atlas experience sounds like real product delivery, not a toy assignment." },
      { title: "Frontend plus QA range", detail: "React execution paired with endpoint validation makes the profile feel production-aware." },
      { title: "Communication is backed by evidence", detail: "The peer tech coach role proves the candidate can explain technical tradeoffs clearly." },
      { title: "Clear full-stack anchor project", detail: "ShiftPilot gives the resume one system that spans auth, data, and user workflow." }
    ],
    gaps: [
      { title: "SQL ownership is implied, not explicit", detail: "The target role values SQL-backed product work, but the resume never names one database task directly.", fix: "Rewrite the ShiftPilot bullet to mention how PostgreSQL schedule data was modeled, filtered, or surfaced in the UI." },
      { title: "Impact metrics are still light", detail: "The internship bullets describe work well but do not show scope, speed, bugs caught, or user impact.", fix: "Add one measurable result to Harbor Atlas and Finch Systems, even if the metric is release count, bugs prevented, or a team efficiency gain." },
      { title: "Health-tech workflow transfer is undersold", detail: "The candidate shape matches the role, but the resume does not explicitly connect dashboards and workflow work to onboarding or operations tooling.", fix: "Use the summary or top project bullet to frame dashboard, workflow, and API work as directly relevant to onboarding and operations surfaces." }
    ],
    rewritten_bullets: [
      { original: "Built internal dashboards in React and shipped onboarding workflow updates at Harbor Atlas.", improved: "Built React dashboards and onboarding workflow updates at Harbor Atlas, partnering with design to tighten usability before release.", why_it_works: "It stays factual, removes filler, and adds the cross-functional context recruiters care about." },
      { original: "Validated REST endpoints in Postman and wrote regression test cases at Finch Systems.", improved: "Validated REST endpoints in Postman and wrote regression coverage at Finch Systems, documenting release-blocking edge cases before handoff.", why_it_works: "This version ties the QA work to release quality instead of listing tools without consequence." },
      { original: "Built ShiftPilot, a full-stack scheduling app with role-based routing, Supabase auth, PostgreSQL data, and reminder emails.", improved: "Built ShiftPilot, a full-stack scheduling app with role-based routing, Supabase auth, PostgreSQL-backed schedules, and automated reminder emails.", why_it_works: "It keeps the original facts but tightens the language into a cleaner shipped-product bullet." }
    ],
    interview_questions: [
      { category: "Behavioral", framework: "STAR: Situation, Task, Action, Result", question: "Tell me about a time you shipped a workflow update with design or product input.", why_it_matters: "This role values product collaboration, so the strongest story is one where the candidate improved a real user flow with stakeholder context.", talking_points: ["Name the user problem and why the workflow needed to change.", "Explain what feedback from design or product changed in the final build.", "Close with how quality or usability improved before release."] },
      { category: "Technical", framework: "Problem, approach, tradeoff, outcome", question: "How did your API testing work make releases safer?", why_it_matters: "The QA experience becomes differentiated only when it translates into engineering judgment and release-quality thinking.", talking_points: ["Describe the endpoint or workflow you validated.", "Explain the edge case or tradeoff you found.", "Connect the testing work to fewer release risks or faster debugging."] },
      { category: "Role-Specific", framework: "Context, execution, impact", question: "Walk me through ShiftPilot from authentication to scheduling data.", why_it_matters: "A strong answer turns the project into evidence of full-stack thinking instead of a buzzword list.", talking_points: ["Start from the user path and role-based routing.", "Explain how auth and scheduling data connect.", "End with one improvement you would ship next."] },
      { category: "Culture Fit", framework: "Value, example, result", question: "How do you explain technical issues to teammates who are not deep in the code?", why_it_matters: "The job sits close to operations and product, so clear communication matters almost as much as implementation speed.", talking_points: ["Use one example from tech coaching or an internship handoff.", "Show how you simplified the issue without losing accuracy.", "Explain how that clarity changed the next team action."] }
    ],
    prep_plan: [
      { day: "Day 1", focus: "Resume tightening", action: "Add one concrete metric to the Harbor Atlas and Finch Systems bullets and keep the strongest language in the top third of the resume." },
      { day: "Day 2", focus: "Project walkthroughs", action: "Practice explaining ShiftPilot and SignalBoard from user flow to auth, data, and deployment decisions." },
      { day: "Day 3", focus: "Behavioral stories", action: "Prepare one story on collaboration, one on debugging, and one on improving release quality before launch." },
      { day: "Day 4", focus: "Keyword alignment", action: "Mirror the role language around SQL, onboarding, analytics, and API integrations where it honestly fits your work." },
      { day: "Day 5", focus: "Technical depth", action: "Rehearse one React state flow, one API request-response path, and one PostgreSQL-backed feature." },
      { day: "Day 6", focus: "Recruiter screen", action: "Condense your candidate pitch into a 45-second answer that explains why this role is a strong fit now." },
      { day: "Day 7", focus: "Mock interview", action: "Run a full mock screen using the generated questions and refine any answer that still sounds generic or too long." }
    ]
  },
  meta: {
    model: "demo-preview",
    generatedAt: "2026-03-19T18:15:00.000Z",
    live: false,
    resumeSource: "Built-in sample profile"
  }
};

const demoComparisonResult = {
  ranking: [
    { id: "role-1", label: "Role 1", role_title: "Associate Product Engineer", company_name: "Northstar Health", fit_score: 84, decision: "Strong early-career match with clear product-delivery upside", recruiter_take: "Best overall fit because the profile already mixes React product work with QA discipline." },
    { id: "role-2", label: "Role 2", role_title: "Frontend Engineer", company_name: "Orbit Commerce", fit_score: 79, decision: "Strong frontend fit with a lighter analytics story", recruiter_take: "This role is attractive because the resume already reads well for React, polish, and design collaboration." },
    { id: "role-3", label: "Role 3", role_title: "QA Automation Engineer", company_name: "Blueframe Labs", fit_score: 72, decision: "Credible but less direct than the product-engineering path", recruiter_take: "The QA internship helps, but the long-term story leans more toward product engineering than pure test automation." }
  ],
  results: [
    { id: "role-1", label: "Role 1", analysis: demoSingleResult.analysis, meta: demoSingleResult.meta },
    {
      id: "role-2",
      label: "Role 2",
      analysis: {
        ...demoSingleResult.analysis,
        role_title: "Frontend Engineer",
        company_name: "Orbit Commerce",
        fit_score: 79,
        decision: "Strong frontend fit with a lighter analytics story",
        summary: "This version of the profile lands well for a React-heavy frontend role because it emphasizes UI work, design collaboration, and polished shipping habits.",
        recruiter_take: "The frontend story is already strong. The biggest improvement would be adding one measurable UI or analytics outcome."
      },
      meta: demoSingleResult.meta
    },
    {
      id: "role-3",
      label: "Role 3",
      analysis: {
        ...demoSingleResult.analysis,
        role_title: "QA Automation Engineer",
        company_name: "Blueframe Labs",
        fit_score: 72,
        decision: "Credible but less direct than the product-engineering path",
        summary: "The QA internship gives real signal here, but the broader resume still reads more like a product-engineering candidate than a dedicated automation hire.",
        recruiter_take: "The fit is real, but the long-term narrative feels more compelling in product-facing engineering roles."
      },
      meta: demoSingleResult.meta
    }
  ],
  meta: {
    model: "demo-preview",
    generatedAt: "2026-03-19T18:15:00.000Z",
    live: false,
    resumeSource: "Built-in sample profile",
    comparedRoles: 3
  }
};

const state = {
  uploadFile: null,
  currentResult: null,
  currentComparison: null,
  selectedComparisonId: "",
  lastMetrics: null,
  sectionEventsSent: new Set(),
  streamBuffer: ""
};

const createElement = (tagName, className, textContent) => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (typeof textContent === "string") {
    element.textContent = textContent;
  }
  return element;
};

const formatNumber = (value) => new Intl.NumberFormat().format(Number(value) || 0);
const formatPercent = (value) => `${Math.max(0, Math.round(Number(value) || 0))}%`;
const truncate = (value, maxLength = 200) => {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
};

const setStatus = (label, tone) => {
  statusPill.textContent = label;
  statusPill.className = `status-pill ${tone}`;
};

const showBanner = (message) => {
  previewBanner.textContent = message;
  previewBanner.classList.remove("hidden");
};

const hideBanner = () => {
  previewBanner.textContent = "";
  previewBanner.classList.add("hidden");
};

const setButtonLoading = (button, loading, loadingLabel, idleLabel) => {
  button.disabled = loading;
  button.textContent = loading ? loadingLabel : idleLabel;
};

const formatTimestamp = (isoString, live) => {
  const date = new Date(isoString);
  const prefix = live ? "Live analysis" : "Demo preview";
  return Number.isNaN(date.getTime()) ? prefix : `${prefix} • ${date.toLocaleString()}`;
};

const copyText = async (text, button) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.append(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }
    const original = button.textContent;
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = original;
    }, 1200);
  } catch (error) {
    button.textContent = "Copy failed";
  }
};

const buildCopyButton = (text) => {
  const button = createElement("button", "copy-button", "Copy");
  button.type = "button";
  button.addEventListener("click", () => copyText(text, button));
  return button;
};

const getStorageItems = () => {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const setStorageItems = (items) => {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch (error) {}
};

const trackEvent = async (event, payload = {}) => {
  if (isGithubPages) {
    return null;
  }
  try {
    const response = await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload })
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data && data.snapshot) {
      state.lastMetrics = data.snapshot;
      updateMetrics(data.snapshot);
    }
    return data;
  } catch (error) {
    return null;
  }
};

const renderSectionViews = (sectionViews = {}) => {
  sectionViewList.replaceChildren();
  const labels = {
    positioning: "Positioning",
    gaps: "Gaps",
    rewrites: "Rewrites",
    questions: "Questions",
    prep: "Prep Plan",
    compare: "Comparison"
  };
  Object.entries(labels).forEach(([key, label]) => {
    const item = createElement("div", "section-view-item");
    item.append(createElement("span", "", label), createElement("strong", "", formatNumber(sectionViews[key] || 0)));
    sectionViewList.append(item);
  });
};

const updateMetrics = (snapshot) => {
  metricAnalysesValue.textContent = formatNumber(snapshot.analysesCompleted || 0);
  metricAverageFitValue.textContent = formatPercent(snapshot.averageFitScore || 0);
  metricExportsValue.textContent = formatNumber(snapshot.exports || 0);
  metricBulletsValue.textContent = formatNumber(snapshot.bulletRewrites || 0);
  insightPageViews.textContent = formatNumber(snapshot.pageViews || 0);
  insightCompletionRate.textContent = `${formatPercent(snapshot.completionRate || 0)} completion rate`;
  insightComparisons.textContent = `${formatNumber(snapshot.comparisons || 0)} multi-role comparisons`;
  insightImports.textContent = `${formatNumber(snapshot.jobUrlImports || 0)} job URL imports`;
  renderSectionViews(snapshot.sectionViews || {});
};

const loadMetrics = async () => {
  if (isGithubPages) {
    updateMetrics({
      analysesCompleted: 3,
      averageFitScore: 78,
      exports: 2,
      bulletRewrites: 9,
      pageViews: 47,
      completionRate: 51,
      comparisons: 1,
      jobUrlImports: 0,
      sectionViews: { positioning: 9, gaps: 6, rewrites: 11, questions: 8, prep: 7, compare: 4 }
    });
    return;
  }
  try {
    const response = await fetch("/api/metrics");
    if (!response.ok) {
      return;
    }
    const snapshot = await response.json();
    state.lastMetrics = snapshot;
    updateMetrics(snapshot);
  } catch (error) {}
};

const updateHeroPreview = (analysis) => {
  heroPreviewScore.textContent = formatPercent(analysis.fit_score || 0);
  heroPreviewRole.textContent = `${analysis.role_title || "Target role"}${analysis.company_name ? ` • ${analysis.company_name}` : ""}`;
  heroPreviewSummary.textContent = truncate(analysis.summary || "No summary available.", 170);
  heroPreviewKeywords.replaceChildren();
  const chips = (analysis.matched_keywords && analysis.matched_keywords.length
    ? analysis.matched_keywords
    : analysis.missing_keywords || []).slice(0, 4);
  chips.forEach((item) => heroPreviewKeywords.append(createElement("span", "keyword-chip", item)));
};

const setScoreRing = (score) => {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  scoreRing.style.setProperty("--ring-angle", `${Math.round((safeScore / 100) * 360)}deg`);
  output.fitScoreValue.textContent = String(safeScore);
};

const renderChipList = (container, items, emptyText) => {
  container.replaceChildren();
  if (!items || !items.length) {
    container.append(createElement("p", "keyword-empty", emptyText));
    return;
  }
  items.forEach((item) => container.append(createElement("span", "keyword-chip", item)));
};

const renderStackList = (container, items, emptyTitle, emptyText, mode) => {
  container.replaceChildren();
  if (!items || !items.length) {
    const card = createElement("article", "stack-item");
    card.append(createElement("h5", "", emptyTitle), createElement("p", "", emptyText));
    container.append(card);
    return;
  }
  items.forEach((item) => {
    const card = createElement("article", "stack-item");
    card.append(createElement("h5", "", item.title), createElement("p", "", item.detail));
    if (mode === "gaps") {
      card.append(createElement("div", "stack-fix", `Fix: ${item.fix}`));
    }
    container.append(card);
  });
};

const renderRewrites = (items) => {
  output.rewritesList.replaceChildren();
  if (!items || !items.length) {
    const panel = createElement("article", "rewrite-panel");
    panel.append(createElement("p", "rewrite-text", "No rewritten bullets were returned for this run."));
    output.rewritesList.append(panel);
    return;
  }
  items.forEach((item) => {
    const card = createElement("article", "rewrite-card");
    const original = createElement("section", "rewrite-panel");
    const originalHeader = createElement("div", "rewrite-panel-header");
    originalHeader.append(createElement("span", "rewrite-label", "Original"), buildCopyButton(item.original));
    original.append(originalHeader, createElement("p", "rewrite-text", item.original));
    const improved = createElement("section", "rewrite-panel accent");
    const improvedHeader = createElement("div", "rewrite-panel-header");
    improvedHeader.append(createElement("span", "rewrite-label", "Improved"), buildCopyButton(item.improved));
    improved.append(
      improvedHeader,
      createElement("p", "rewrite-text rewrite-strong", item.improved),
      createElement("p", "rewrite-reason", item.why_it_works)
    );
    card.append(original, improved);
    output.rewritesList.append(card);
  });
};

const renderQuestions = (items) => {
  output.questionsList.replaceChildren();
  if (!items || !items.length) {
    const card = createElement("article", "question-card");
    card.append(createElement("h5", "", "No interview questions returned"), createElement("p", "", "Run another analysis for a fuller interview-prep readout."));
    output.questionsList.append(card);
    return;
  }
  items.forEach((item) => {
    const card = createElement("article", "question-card");
    const topline = createElement("div", "question-topline");
    topline.append(createElement("span", "question-category", item.category || "Role-Specific"), buildCopyButton(item.question));
    const framework = createElement("p", "question-framework", item.framework);
    const list = createElement("ul", "talking-points");
    (item.talking_points || []).forEach((point) => list.append(createElement("li", "", point)));
    card.append(topline, createElement("h5", "", item.question), framework, createElement("p", "", item.why_it_matters), list);
    output.questionsList.append(card);
  });
};

const renderPrepPlan = (items) => {
  output.prepPlanList.replaceChildren();
  if (!items || !items.length) {
    const card = createElement("article", "timeline-card");
    card.append(createElement("h5", "", "No prep plan returned"), createElement("p", "", "Run another analysis for a fuller prep plan."));
    output.prepPlanList.append(card);
    return;
  }
  items.forEach((item) => {
    const card = createElement("article", "timeline-card");
    card.append(createElement("span", "timeline-day", item.day), createElement("h5", "", item.focus), createElement("p", "", item.action));
    output.prepPlanList.append(card);
  });
};

const renderAnalysis = (result) => {
  const { analysis, meta } = result;
  state.currentResult = result;
  emptyState.classList.add("hidden");
  resultsContent.classList.remove("hidden");
  exportPdfButton.disabled = false;
  setScoreRing(analysis.fit_score);
  output.roleMeta.textContent = analysis.role_title || "Role";
  output.companyMeta.textContent = analysis.company_name || "Company";
  output.decisionMeta.textContent = analysis.decision || "Assessment";
  output.resumeSourceMeta.textContent = meta.resumeSource || "Pasted resume text";
  output.summaryHeadline.textContent =
    analysis.fit_score >= 80 ? "Strong recruiting case" : analysis.fit_score >= 65 ? "Promising, but needs tightening" : "Needs stronger positioning";
  output.summaryText.textContent = analysis.summary;
  output.generatedMeta.textContent = formatTimestamp(meta.generatedAt, meta.live);
  output.candidatePitch.textContent = analysis.candidate_pitch;
  output.recruiterTake.textContent = analysis.recruiter_take;
  renderChipList(output.keywordGapList, analysis.missing_keywords || [], "No major keyword gaps were returned for this run.");
  renderChipList(output.matchedKeywordList, analysis.matched_keywords || [], "No aligned keywords were returned for this run.");
  renderStackList(output.strengthsList, analysis.strengths || [], "No strengths returned", "Run another analysis for a fuller strengths breakdown.");
  renderStackList(output.gapsList, analysis.gaps || [], "No gaps returned", "Run another analysis for a fuller gaps breakdown.", "gaps");
  renderRewrites(analysis.rewritten_bullets || []);
  renderQuestions(analysis.interview_questions || []);
  renderPrepPlan(analysis.prep_plan || []);
  updateHeroPreview(analysis);
};

const renderComparisonBoard = (comparisonResult) => {
  state.currentComparison = comparisonResult;
  state.selectedComparisonId = comparisonResult.ranking && comparisonResult.ranking[0] ? comparisonResult.ranking[0].id : "";
  comparisonBoard.classList.remove("hidden");
  comparisonList.replaceChildren();
  comparisonEmpty.classList.add("hidden");
  (comparisonResult.ranking || []).forEach((item) => {
    const card = createElement("button", `comparison-card${item.id === state.selectedComparisonId ? " comparison-card-active" : ""}`);
    card.type = "button";
    card.dataset.resultId = item.id;
    const header = createElement("div", "comparison-card-header");
    header.append(createElement("span", "comparison-rank", item.label), createElement("strong", "comparison-score", formatPercent(item.fit_score)));
    const body = createElement("div", "comparison-card-body");
    body.append(
      createElement("h5", "", `${item.role_title} • ${item.company_name}`),
      createElement("p", "comparison-copy", item.decision),
      createElement("p", "comparison-copy", item.recruiter_take)
    );
    card.append(header, body);
    card.addEventListener("click", () => setActiveComparison(item.id));
    comparisonList.append(card);
  });
};

const clearComparisonBoard = (showEmpty) => {
  state.currentComparison = null;
  state.selectedComparisonId = "";
  comparisonList.replaceChildren();
  comparisonBoard.classList.toggle("hidden", !showEmpty);
  comparisonEmpty.classList.toggle("hidden", !showEmpty);
};

const setActiveComparison = (resultId) => {
  if (!state.currentComparison) {
    return;
  }
  state.selectedComparisonId = resultId;
  [...comparisonList.children].forEach((card) => {
    card.classList.toggle("comparison-card-active", card.dataset.resultId === resultId);
  });
  const selected = (state.currentComparison.results || []).find((item) => item.id === resultId);
  if (selected) {
    renderAnalysis(selected);
  }
};

const saveHistory = (entry) => {
  const items = getStorageItems();
  items.unshift(entry);
  setStorageItems(items.slice(0, 5));
  renderHistory();
};

const restoreHistory = (entry) => {
  hydrateInputs(entry.payload);
  if (entry.type === "compare") {
    renderComparisonBoard(entry.result);
    setActiveComparison(entry.selectedId || (entry.result.ranking && entry.result.ranking[0] ? entry.result.ranking[0].id : ""));
    setStatus(entry.result.meta && entry.result.meta.live ? "Comparison Restored" : "Demo Ready", "neutral");
  } else {
    clearComparisonBoard(false);
    renderAnalysis(entry.result);
    setStatus(entry.result.meta && entry.result.meta.live ? "History Loaded" : "Demo Ready", "neutral");
  }
};

const renderHistory = () => {
  historyList.replaceChildren();
  const items = getStorageItems();
  if (!items.length) {
    historyList.append(createElement("p", "history-empty", "The last five live analyses and comparisons will appear here."));
    return;
  }
  items.forEach((entry) => {
    const button = createElement("button", "history-button");
    button.type = "button";
    const title = entry.type === "compare"
      ? `${entry.result.meta && entry.result.meta.comparedRoles ? entry.result.meta.comparedRoles : 0} role comparison`
      : `${entry.result.analysis.role_title || "Target role"} • ${entry.result.analysis.company_name || "Target company"}`;
    const meta = `${entry.type === "compare" ? "Comparison" : `Fit ${entry.result.analysis.fit_score || 0}%`} • ${formatTimestamp(entry.savedAt, entry.result.meta && entry.result.meta.live)}`;
    button.append(createElement("strong", "", title), createElement("span", "history-meta", meta));
    button.addEventListener("click", () => restoreHistory(entry));
    historyList.append(button);
  });
};

const setUploadUI = () => {
  if (!state.uploadFile) {
    fileMeta.classList.add("hidden");
    fileNameLabel.textContent = "Resume.pdf";
    uploadDropzone.classList.remove("upload-dropzone-active");
    return;
  }
  fileMeta.classList.remove("hidden");
  fileNameLabel.textContent = state.uploadFile.name;
  uploadDropzone.classList.add("upload-dropzone-active");
};

const clearSelectedFile = () => {
  state.uploadFile = null;
  resumeFileInput.value = "";
  setUploadUI();
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("Unable to read the uploaded file."));
    reader.readAsDataURL(file);
  });

const setSelectedFile = async (file) => {
  if (!file) {
    return;
  }
  const extension = (file.name.split(".").pop() || "").toLowerCase();
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Resume files must stay under 2.5 MB.");
  }
  if (!["pdf", "txt", "md", "rtf"].includes(extension)) {
    throw new Error("Upload a PDF, TXT, MD, or RTF resume file.");
  }
  state.uploadFile = {
    name: file.name,
    type: file.type || extension,
    size: file.size,
    data: await fileToBase64(file)
  };
  setUploadUI();
};

const collectMainPayload = () => ({
  jobTitle: fields.jobTitle.value.trim(),
  companyName: fields.companyName.value.trim(),
  focusMode: fields.focusMode.value,
  candidateLevel: fields.candidateLevel.value,
  jobUrl1: fields.jobUrl1.value.trim(),
  resumeText: fields.resumeText.value.trim(),
  jobDescription: fields.jobDescription.value.trim(),
  resumeFile: state.uploadFile
});

const collectJobs = () => [
  { id: "role-1", label: "Role 1", jobTitle: fields.jobTitle.value.trim(), companyName: fields.companyName.value.trim(), jobDescription: fields.jobDescription.value.trim(), jobUrl: fields.jobUrl1.value.trim() },
  { id: "role-2", label: "Role 2", jobTitle: fields.jobTitle2.value.trim(), companyName: fields.companyName2.value.trim(), jobDescription: fields.jobDescription2.value.trim(), jobUrl: fields.jobUrl2.value.trim() },
  { id: "role-3", label: "Role 3", jobTitle: fields.jobTitle3.value.trim(), companyName: fields.companyName3.value.trim(), jobDescription: fields.jobDescription3.value.trim(), jobUrl: fields.jobUrl3.value.trim() }
];

const hydrateInputs = (payload) => {
  fields.jobTitle.value = payload.jobTitle || "";
  fields.companyName.value = payload.companyName || "";
  fields.focusMode.value = payload.focusMode || "recruiter";
  fields.candidateLevel.value = payload.candidateLevel || "internship";
  fields.jobUrl1.value = payload.jobUrl1 || "";
  fields.resumeText.value = payload.resumeText || "";
  fields.jobDescription.value = payload.jobDescription || "";
  const jobs = payload.jobs || [];
  const secondary = jobs[1] || {};
  const tertiary = jobs[2] || {};
  fields.jobTitle2.value = secondary.jobTitle || "";
  fields.companyName2.value = secondary.companyName || "";
  fields.jobUrl2.value = secondary.jobUrl || "";
  fields.jobDescription2.value = secondary.jobDescription || "";
  fields.jobTitle3.value = tertiary.jobTitle || "";
  fields.companyName3.value = tertiary.companyName || "";
  fields.jobUrl3.value = tertiary.jobUrl || "";
  fields.jobDescription3.value = tertiary.jobDescription || "";
  clearSelectedFile();
};

const loadDemoScenario = (withComparison = false) => {
  hydrateInputs({
    ...demoInputs.main,
    jobs: demoInputs.compare
  });
  if (withComparison) {
    renderComparisonBoard(demoComparisonResult);
    setActiveComparison(demoComparisonResult.ranking[0].id);
  } else {
    clearComparisonBoard(false);
    renderAnalysis(demoSingleResult);
  }
  setStatus("Demo Ready", "neutral");
  hideBanner();
};

const validateSinglePayload = (payload) => {
  if (!payload.resumeText && !payload.resumeFile) {
    return "Upload a resume file or paste resume text before running the analysis.";
  }
  if (!payload.resumeFile && payload.resumeText.length < 80) {
    return "The resume text is too short to produce a useful analysis.";
  }
  if (payload.jobDescription.length < 80) {
    return "The job description is too short to produce a useful analysis.";
  }
  return "";
};

const openAnalysisModal = () => {
  state.streamBuffer = "";
  streamPreview.textContent = "Waiting for model response...";
  analysisModal.classList.remove("hidden");
  analysisModal.setAttribute("aria-hidden", "false");
  setModalProgress(0, "Preparing request...");
};

const closeAnalysisModal = () => {
  analysisModal.classList.add("hidden");
  analysisModal.setAttribute("aria-hidden", "true");
};

const setModalProgress = (percent, label) => {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  modalProgressRing.style.setProperty("--modal-progress", `${Math.round((safePercent / 100) * 360)}deg`);
  modalProgressValue.textContent = `${safePercent}%`;
  modalStageText.textContent = label;
};

const appendStreamText = (text) => {
  state.streamBuffer += text;
  streamPreview.textContent = state.streamBuffer.trim() || "Streaming output...";
  streamPreview.scrollTop = streamPreview.scrollHeight;
};

const parseSSEBlock = (block) => {
  const lines = block.split("\n");
  let event = "message";
  const dataLines = [];
  lines.forEach((line) => {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  });
  return { event, data: dataLines.join("") };
};

const readErrorResponse = async (response) => {
  const type = response.headers.get("content-type") || "";
  const text = await response.text();
  if (type.includes("application/json")) {
    try {
      const parsed = JSON.parse(text);
      return parsed.error || "The request failed.";
    } catch (error) {}
  }
  return text || "The request failed.";
};

const fetchJobFromUrl = async (slotNumber, silent = false) => {
  const urlField = slotNumber === 1 ? fields.jobUrl1 : fields[`jobUrl${slotNumber}`];
  const titleField = slotNumber === 1 ? fields.jobTitle : fields[`jobTitle${slotNumber}`];
  const companyField = slotNumber === 1 ? fields.companyName : fields[`companyName${slotNumber}`];
  const descriptionField = slotNumber === 1 ? fields.jobDescription : fields[`jobDescription${slotNumber}`];
  const url = urlField.value.trim();
  if (!url) {
    throw new Error("Paste a job URL first.");
  }
  const button = fetchButtons[slotNumber];
  setButtonLoading(button, true, "Fetching...", "Fetch Job Text");
  try {
    const response = await fetch("/api/extract-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    if (!response.ok) {
      throw new Error(await readErrorResponse(response));
    }
    const data = await response.json();
    titleField.value = data.jobTitle || titleField.value;
    companyField.value = data.companyName || companyField.value;
    descriptionField.value = data.jobDescription || "";
    await trackEvent("job_url_imported");
    if (!silent) {
      showBanner(`Loaded job text for ${slotNumber === 1 ? "the primary role" : `Role ${slotNumber}`}.`);
    }
    return data;
  } finally {
    setButtonLoading(button, false, "Fetching...", "Fetch Job Text");
  }
};

const ensureMainJobDescription = async () => {
  if (!fields.jobDescription.value.trim() && fields.jobUrl1.value.trim() && !isGithubPages) {
    await fetchJobFromUrl(1, true);
  }
};

const ensureComparisonJobs = async (jobs) => {
  for (let index = 0; index < jobs.length; index += 1) {
    const job = jobs[index];
    const slotNumber = index + 1;
    if (!job.jobDescription && job.jobUrl && !isGithubPages) {
      const data = await fetchJobFromUrl(slotNumber, true);
      job.jobTitle = data.jobTitle || job.jobTitle;
      job.companyName = data.companyName || job.companyName;
      job.jobDescription = data.jobDescription || job.jobDescription;
    }
  }
  return jobs;
};

const runStreamAnalysis = async (payload) => {
  openAnalysisModal();
  setModalProgress(8, "Uploading resume context...");
  const response = await fetch("/api/role-ready", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream"
    },
    body: JSON.stringify({ ...payload, stream: true })
  });
  if (!response.ok) {
    throw new Error(await readErrorResponse(response));
  }
  if (!response.body || typeof response.body.getReader !== "function") {
    throw new Error("Streaming is not available in this browser.");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult = null;
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() || "";
    for (const block of blocks) {
      const parsed = parseSSEBlock(block);
      if (!parsed.data) {
        continue;
      }
      if (parsed.event === "progress") {
        try {
          const data = JSON.parse(parsed.data);
          setModalProgress(data.percent, data.label);
        } catch (error) {}
      } else if (parsed.event === "token") {
        try {
          appendStreamText(JSON.parse(parsed.data).text || "");
        } catch (error) {}
      } else if (parsed.event === "final") {
        finalResult = JSON.parse(parsed.data);
      } else if (parsed.event === "error") {
        const data = JSON.parse(parsed.data);
        throw new Error(data.message || "The streamed analysis failed.");
      }
    }
    if (done) {
      break;
    }
  }
  if (!finalResult) {
    throw new Error("The streamed analysis did not return a final payload.");
  }
  setModalProgress(100, "Analysis board ready");
  await new Promise((resolve) => window.setTimeout(resolve, 240));
  return finalResult;
};

const runComparisonRequest = async (payload, jobs) => {
  const response = await fetch("/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, jobs })
  });
  if (!response.ok) {
    throw new Error(await readErrorResponse(response));
  }
  return response.json();
};

const exportPdfReport = async () => {
  if (!state.currentResult) {
    return;
  }
  if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
    window.print();
    return;
  }
  document.body.classList.add("exporting-pdf");
  try {
    const canvas = await window.html2canvas(document.querySelector(".results-panel"), {
      scale: 2,
      backgroundColor: "#071018",
      useCORS: true,
      windowWidth: document.body.scrollWidth
    });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 18;
    const renderWidth = pageWidth - margin * 2;
    const renderHeight = (canvas.height * renderWidth) / canvas.width;
    const imageData = canvas.toDataURL("image/png");
    let remainingHeight = renderHeight;
    let offsetY = margin;
    pdf.addImage(imageData, "PNG", margin, offsetY, renderWidth, renderHeight, undefined, "FAST");
    remainingHeight -= pageHeight - margin * 2;
    while (remainingHeight > 0) {
      pdf.addPage();
      offsetY = margin - (renderHeight - remainingHeight);
      pdf.addImage(imageData, "PNG", margin, offsetY, renderWidth, renderHeight, undefined, "FAST");
      remainingHeight -= pageHeight - margin * 2;
    }
    const safeRole = (state.currentResult.analysis.role_title || "role").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    pdf.save(`roleready-report-${safeRole}.pdf`);
    await trackEvent("export_pdf");
    setStatus("PDF Exported", "success");
  } finally {
    document.body.classList.remove("exporting-pdf");
  }
};

const setWorkingState = (loading, mode = "analyze") => {
  analyzeButton.disabled = loading;
  compareButton.disabled = loading;
  demoButton.disabled = loading;
  heroDemoButton.disabled = loading;
  clearButton.disabled = loading;
  chooseFileButton.disabled = loading;
  removeFileButton.disabled = loading;
  analyzeButton.textContent = mode === "analyze" && loading ? "Analyzing..." : "Analyze Resume";
  compareButton.textContent = mode === "compare" && loading ? "Comparing..." : "Compare Filled Roles";
};

const resetApp = () => {
  form.reset();
  clearSelectedFile();
  clearComparisonBoard(true);
  hideBanner();
  state.currentResult = null;
  setScoreRing(0);
  resultsContent.classList.add("hidden");
  emptyState.classList.remove("hidden");
  exportPdfButton.disabled = true;
  setStatus("Ready", "neutral");
};

const toggleBackLink = () => {
  const referrer = document.referrer || "";
  if (!referrer.includes("hasanlm23123.github.io")) {
    backToPortfolioLink.classList.add("hidden-link");
  }
};

const registerSectionTracking = () => {
  const cards = document.querySelectorAll("[data-section]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const section = entry.target.getAttribute("data-section");
        if (!section || state.sectionEventsSent.has(section)) {
          return;
        }
        state.sectionEventsSent.add(section);
        trackEvent("section_view", { section });
      });
    },
    { threshold: 0.6 }
  );
  cards.forEach((card) => observer.observe(card));
};

const runAnalyze = async () => {
  hideBanner();
  await ensureMainJobDescription();
  const payload = collectMainPayload();
  const validationError = validateSinglePayload(payload);
  if (validationError) {
    setStatus("Needs Input", "warning");
    showBanner(validationError);
    return;
  }
  if (isGithubPages) {
    clearComparisonBoard(false);
    renderAnalysis(demoSingleResult);
    setStatus("Demo Ready", "neutral");
    return;
  }
  setWorkingState(true, "analyze");
  setStatus("Streaming", "loading");
  await trackEvent("analysis_started");
  try {
    const result = await runStreamAnalysis(payload);
    clearComparisonBoard(false);
    renderAnalysis(result);
    saveHistory({
      type: "single",
      savedAt: new Date().toISOString(),
      payload: { ...payload, jobs: collectJobs() },
      result
    });
    await trackEvent("analysis_completed", {
      fitScore: result.analysis.fit_score,
      rewritesGenerated: (result.analysis.rewritten_bullets || []).length
    });
    setStatus("Live Analysis", "success");
  } catch (error) {
    setStatus("Error", "error");
    showBanner(error && error.message ? error.message : "Unable to complete the analysis.");
  } finally {
    closeAnalysisModal();
    setWorkingState(false, "analyze");
  }
};

const runCompare = async () => {
  hideBanner();
  const payload = collectMainPayload();
  if (!payload.resumeText && !payload.resumeFile) {
    setStatus("Needs Input", "warning");
    showBanner("Upload a resume file or paste resume text before comparing roles.");
    return;
  }
  let jobs = collectJobs().filter((job) => job.jobDescription || job.jobUrl);
  if (jobs.length < 2) {
    setStatus("Needs Input", "warning");
    showBanner("Fill at least two roles before running the comparison view.");
    clearComparisonBoard(true);
    return;
  }
  if (isGithubPages) {
    renderComparisonBoard(demoComparisonResult);
    setActiveComparison(demoComparisonResult.ranking[0].id);
    setStatus("Demo Compare", "neutral");
    return;
  }
  setWorkingState(true, "compare");
  setStatus("Comparing", "loading");
  try {
    jobs = await ensureComparisonJobs(jobs);
    const result = await runComparisonRequest(payload, jobs);
    renderComparisonBoard(result);
    setActiveComparison(result.ranking[0].id);
    saveHistory({
      type: "compare",
      savedAt: new Date().toISOString(),
      selectedId: result.ranking[0].id,
      payload: { ...payload, jobs },
      result
    });
    const fitScoreTotal = (result.results || []).reduce((sum, item) => sum + (item.analysis.fit_score || 0), 0);
    const rewritesGenerated = (result.results || []).reduce((sum, item) => sum + ((item.analysis.rewritten_bullets || []).length), 0);
    await trackEvent("compare_completed", {
      comparedRoles: (result.results || []).length,
      fitScoreTotal,
      rewritesGenerated
    });
    setStatus("Comparison Ready", "success");
  } catch (error) {
    setStatus("Error", "error");
    showBanner(error && error.message ? error.message : "Unable to compare the selected roles.");
  } finally {
    setWorkingState(false, "compare");
  }
};

["dragenter", "dragover"].forEach((eventName) => {
  uploadDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    uploadDropzone.classList.add("upload-dropzone-hover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  uploadDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    uploadDropzone.classList.remove("upload-dropzone-hover");
  });
});

uploadDropzone.addEventListener("drop", async (event) => {
  try {
    const file = event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null;
    await setSelectedFile(file);
    hideBanner();
  } catch (error) {
    showBanner(error.message);
  }
});

uploadDropzone.addEventListener("click", () => resumeFileInput.click());
uploadDropzone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    resumeFileInput.click();
  }
});

chooseFileButton.addEventListener("click", () => resumeFileInput.click());
resumeFileInput.addEventListener("change", async () => {
  try {
    const file = resumeFileInput.files && resumeFileInput.files[0] ? resumeFileInput.files[0] : null;
    await setSelectedFile(file);
    hideBanner();
  } catch (error) {
    showBanner(error.message);
  }
});

removeFileButton.addEventListener("click", clearSelectedFile);
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runAnalyze();
});
compareButton.addEventListener("click", runCompare);
demoButton.addEventListener("click", () => loadDemoScenario(false));
heroDemoButton.addEventListener("click", () => {
  loadDemoScenario(false);
  document.getElementById("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
});
clearButton.addEventListener("click", resetApp);
exportPdfButton.addEventListener("click", exportPdfReport);
Object.entries(fetchButtons).forEach(([slot, button]) => {
  button.addEventListener("click", async () => {
    try {
      hideBanner();
      await fetchJobFromUrl(Number(slot));
    } catch (error) {
      showBanner(error.message);
    }
  });
});

toggleBackLink();
registerSectionTracking();
renderHistory();
exportPdfButton.disabled = true;
resultsContent.classList.add("hidden");
clearComparisonBoard(true);
trackEvent("page_view");
loadMetrics();
loadDemoScenario(false);
