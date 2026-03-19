const form = document.getElementById("analysisForm");
const analyzeButton = document.getElementById("analyzeButton");
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

const fields = {
  jobTitle: document.getElementById("jobTitle"),
  companyName: document.getElementById("companyName"),
  focusMode: document.getElementById("focusMode"),
  candidateLevel: document.getElementById("candidateLevel"),
  resumeText: document.getElementById("resumeText"),
  jobDescription: document.getElementById("jobDescription")
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
  strengthsList: document.getElementById("strengthsList"),
  gapsList: document.getElementById("gapsList"),
  rewritesList: document.getElementById("rewritesList"),
  questionsList: document.getElementById("questionsList"),
  prepPlanList: document.getElementById("prepPlanList")
};

const isGithubPages = window.location.hostname.endsWith("github.io");
const MAX_UPLOAD_BYTES = 2.5 * 1024 * 1024;
const HISTORY_KEY = "roleready-history-v1";

const uploadState = {
  file: null
};

const demoInputs = {
  jobTitle: "Associate Product Engineer",
  companyName: "Northstar Health",
  focusMode: "recruiter",
  candidateLevel: "new-grad",
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
  jobDescription: `Northstar Health is hiring an Associate Product Engineer to build patient onboarding flows, internal
tools, and analytics surfaces used by operations teams. The role works across React interfaces, API integrations,
debugging, SQL-backed product features, and release quality. Strong candidates show ownership, communicate well with
design and product, and can ship polished user-facing work while improving reliability behind the scenes.`
};

const demoResult = {
  analysis: {
    role_title: "Associate Product Engineer",
    company_name: "Northstar Health",
    fit_score: 84,
    decision: "Strong early-career match with clear product-delivery upside",
    summary:
      "Maya reads like a credible early-career product engineer because the profile combines shipped React work, QA discipline, technical communication, and one concrete full-stack project. The resume is strongest when framed around turning user workflows into polished, testable product surfaces.",
    candidate_pitch:
      "Product-minded early-career engineer with React shipping experience, API validation work, and a full-stack scheduling build that shows growing backend ownership. Best positioned for teams that value user-facing polish, debugging discipline, and cross-functional communication.",
    recruiter_take:
      "The strongest signal is the combination of product execution and release quality. The main next step is to make backend ownership and measurable impact read more explicitly through sharper bullets and tighter keyword alignment.",
    missing_keywords: ["SQL", "patient onboarding", "analytics surfaces", "release quality", "product operations", "API integrations"],
    strengths: [
      {
        title: "Real product-shipping internship signal",
        detail: "Harbor Atlas suggests Maya has already worked inside a delivery loop with design, release pressure, and real users in mind."
      },
      {
        title: "Frontend plus QA range",
        detail: "React execution paired with endpoint validation makes the profile look more production-aware than a typical frontend-only student resume."
      },
      {
        title: "Communication is backed by evidence",
        detail: "The peer tech coach role supports the idea that Maya can explain tradeoffs clearly and work well with non-engineering stakeholders."
      },
      {
        title: "A clear full-stack anchor project",
        detail: "ShiftPilot gives the resume one concrete system to talk through from user flow to auth, data, and notifications."
      }
    ],
    gaps: [
      {
        title: "SQL ownership is only implied",
        detail: "The job explicitly values SQL-backed product work, but the resume does not yet show one bullet that names a query, schema, or data-access decision.",
        fix: "Rewrite the ShiftPilot project bullet to mention PostgreSQL scheduling data, how records were queried or filtered, and where that data surfaced in the UI."
      },
      {
        title: "Impact metrics are still light",
        detail: "Several bullets explain responsibilities well but stop short of showing scope, speed, or quality improvements.",
        fix: "Add one measurable result to the Harbor Atlas and Finch Systems bullets, such as release count, bugs caught, dashboards shipped, or time saved during QA."
      },
      {
        title: "The health-tech domain match can be framed more directly",
        detail: "The candidate has the right engineering shape for the role, but the resume does not yet connect those skills to onboarding or operations workflows.",
        fix: "In the pitch and project summary, explicitly position dashboard, workflow, and API work as transferable to patient onboarding and internal operations tooling."
      }
    ],
    rewritten_bullets: [
      {
        original: "Built internal dashboards in React and shipped onboarding workflow updates at Harbor Atlas.",
        improved: "Built React dashboards and shipped onboarding workflow updates at Harbor Atlas, partnering with design to tighten usability before release.",
        why_it_works: "The rewrite keeps the facts intact, adds collaboration context, and removes extra words that did not improve recruiter readability."
      },
      {
        original: "Validated REST endpoints in Postman and wrote regression test cases at Finch Systems.",
        improved: "Validated REST endpoints in Postman and wrote regression coverage at Finch Systems, documenting release-blocking edge cases before handoff.",
        why_it_works: "This version sounds more production-aware because it links the QA work to release risk instead of listing tools with no outcome."
      },
      {
        original: "Built ShiftPilot, a full-stack scheduling app with role-based routing, Supabase auth, PostgreSQL data, and reminder emails.",
        improved: "Built ShiftPilot, a full-stack scheduling app with role-based routing, Supabase auth, PostgreSQL-backed schedules, and automated reminder emails.",
        why_it_works: "The rewrite is tighter, keeps the technical depth, and makes the system read like a real product instead of a class project summary."
      }
    ],
    interview_questions: [
      {
        category: "Behavioral",
        question: "Tell me about a time you shipped a product workflow with input from design or product.",
        why_it_matters: "This role values product collaboration, so interviewers will want proof that Maya can build with stakeholder context rather than coding in isolation.",
        talking_points: [
          "Explain the user problem and what changed in the workflow.",
          "Describe how design or product input affected the final build.",
          "Close with how you validated the update before release."
        ]
      },
      {
        category: "Technical",
        question: "How did your API testing work at Finch Systems make production releases safer?",
        why_it_matters: "The QA experience is a differentiator only if it translates into engineering judgment and release-quality thinking.",
        talking_points: [
          "Describe the endpoint coverage or edge cases you focused on.",
          "Explain how you documented failures clearly for the team.",
          "Connect that experience to writing more reliable product code."
        ]
      },
      {
        category: "Role-Specific",
        question: "Walk me through the architecture of ShiftPilot from authentication to scheduling data.",
        why_it_matters: "A strong answer turns the best project into evidence of full-stack thinking instead of a buzzword-heavy bullet.",
        talking_points: [
          "Start from the user flow and role-based routing.",
          "Explain how Supabase auth and PostgreSQL-backed schedules connect.",
          "Mention one tradeoff you would improve in the next iteration."
        ]
      },
      {
        category: "Collaboration",
        question: "How do you communicate technical issues to people who are not deep in the code?",
        why_it_matters: "The role sits close to operations and product, so clear communication matters almost as much as implementation speed.",
        talking_points: [
          "Use one example from tech coaching or an internship handoff.",
          "Explain how you simplify the issue without losing accuracy.",
          "Show how that communication changed the next step for the team."
        ]
      }
    ],
    prep_plan: [
      { day: "Day 1", focus: "Resume tightening", action: "Add one concrete metric to the Harbor Atlas and Finch Systems bullets and keep the strongest language in the top third of the resume." },
      { day: "Day 2", focus: "Project walkthroughs", action: "Practice explaining ShiftPilot and SignalBoard from user flow to auth, data, and deployment decisions." },
      { day: "Day 3", focus: "Behavioral stories", action: "Prepare one story on collaboration, one on debugging, and one on improving release quality before launch." },
      { day: "Day 4", focus: "Keyword alignment", action: "Mirror the role’s language around SQL, onboarding, analytics, and API integrations where it honestly fits your real work." },
      { day: "Day 5", focus: "Technical depth", action: "Rehearse a clean explanation of one React state flow, one API request-response path, and one PostgreSQL-backed feature." },
      { day: "Day 6", focus: "Recruiter screen", action: "Condense your candidate pitch into a 45-second answer that explains why this role is a strong fit right now." },
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

let streamPreviewBuffer = "";

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

const createElement = (tagName, className, textContent) => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
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
  } catch {
    button.textContent = "Copy failed";
  }
};

const buildCopyButton = (text) => {
  const button = createElement("button", "copy-button", "Copy");
  button.type = "button";
  button.addEventListener("click", () => {
    copyText(text, button);
  });
  return button;
};

const readHistory = () => {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeHistory = (items) => {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {}
};

const formatHistoryTimestamp = (isoString) => {
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? "Saved analysis" : date.toLocaleString();
};

const restoreHistoryEntry = (entry) => {
  fields.jobTitle.value = entry.payload.jobTitle || "";
  fields.companyName.value = entry.payload.companyName || "";
  fields.focusMode.value = entry.payload.focusMode || "recruiter";
  fields.candidateLevel.value = entry.payload.candidateLevel || "internship";
  fields.resumeText.value = entry.payload.resumeText || "";
  fields.jobDescription.value = entry.payload.jobDescription || "";
  clearSelectedFile();
  renderResults(entry.result);
  setStatus(entry.result.meta && entry.result.meta.live ? "History Loaded" : "Demo Ready", "neutral");

  if (entry.payload.hadUpload && !entry.payload.resumeText) {
    showBanner("Saved analysis restored. Upload the resume again if you want to rerun the analysis from the original file.");
  } else {
    hideBanner();
  }
};

const renderHistory = () => {
  historyList.replaceChildren();
  const history = readHistory();

  if (!history.length) {
    historyList.append(
      createElement("p", "history-empty", "Your last five live analyses will appear here for quick reload and comparison.")
    );
    return;
  }

  history.forEach((entry) => {
    const button = createElement("button", "history-button");
    button.type = "button";

    const title = `${entry.result.analysis.role_title || "Target role"} • ${entry.result.analysis.company_name || "Target company"}`;
    const meta = `Fit ${entry.result.analysis.fit_score || 0}% • ${formatHistoryTimestamp(entry.savedAt)}`;

    button.append(createElement("strong", "", title), createElement("span", "history-meta", meta));
    button.addEventListener("click", () => {
      restoreHistoryEntry(entry);
      document.getElementById("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    historyList.append(button);
  });
};

const saveHistoryEntry = (payload, result) => {
  const history = readHistory();
  const entry = {
    savedAt: new Date().toISOString(),
    payload: {
      jobTitle: payload.jobTitle,
      companyName: payload.companyName,
      focusMode: payload.focusMode,
      candidateLevel: payload.candidateLevel,
      resumeText: payload.resumeText,
      jobDescription: payload.jobDescription,
      hadUpload: Boolean(payload.resumeFile)
    },
    result
  };

  history.unshift(entry);
  writeHistory(history.slice(0, 5));
  renderHistory();
};

const appendEmptyCard = (container, title, detail) => {
  const card = createElement("article", "stack-item");
  card.append(createElement("h5", "", title), createElement("p", "", detail));
  container.append(card);
};

const renderKeywordGaps = (items) => {
  output.keywordGapList.replaceChildren();
  if (!items.length) {
    output.keywordGapList.append(createElement("p", "keyword-empty", "No major keyword gaps were returned for this run."));
    return;
  }

  items.forEach((item) => {
    output.keywordGapList.append(createElement("span", "keyword-chip", item));
  });
};

const renderStrengths = (items) => {
  output.strengthsList.replaceChildren();
  if (!items.length) {
    appendEmptyCard(output.strengthsList, "No strengths returned", "The provider returned a partial analysis. Run it again for a fuller strengths breakdown.");
    return;
  }

  items.forEach((item) => {
    const card = createElement("article", "stack-item");
    card.append(createElement("h5", "", item.title), createElement("p", "", item.detail));
    output.strengthsList.append(card);
  });
};

const renderGaps = (items) => {
  output.gapsList.replaceChildren();
  if (!items.length) {
    appendEmptyCard(output.gapsList, "No gaps returned", "The provider returned a partial analysis. Run it again for a fuller gaps breakdown.");
    return;
  }

  items.forEach((item) => {
    const card = createElement("article", "stack-item");
    card.append(
      createElement("h5", "", item.title),
      createElement("p", "", item.detail),
      createElement("div", "stack-fix", `Fix: ${item.fix}`)
    );
    output.gapsList.append(card);
  });
};

const renderRewrites = (items) => {
  output.rewritesList.replaceChildren();
  if (!items.length) {
    const card = createElement("article", "rewrite-card");
    card.append(createElement("div", "rewrite-panel", "No rewritten bullets returned."));
    output.rewritesList.append(card);
    return;
  }

  items.forEach((item) => {
    const card = createElement("article", "rewrite-card");

    const originalPanel = createElement("section", "rewrite-panel");
    const originalHeader = createElement("div", "rewrite-panel-header");
    originalHeader.append(createElement("span", "rewrite-label", "Original"), buildCopyButton(item.original));
    originalPanel.append(originalHeader, createElement("p", "rewrite-text", item.original));

    const improvedPanel = createElement("section", "rewrite-panel accent");
    const improvedHeader = createElement("div", "rewrite-panel-header");
    improvedHeader.append(createElement("span", "rewrite-label", "Improved"), buildCopyButton(item.improved));
    improvedPanel.append(
      improvedHeader,
      createElement("p", "rewrite-text rewrite-strong", item.improved),
      createElement("p", "rewrite-reason", item.why_it_works)
    );

    card.append(originalPanel, improvedPanel);
    output.rewritesList.append(card);
  });
};

const renderQuestions = (items) => {
  output.questionsList.replaceChildren();
  if (!items.length) {
    appendEmptyCard(output.questionsList, "No interview questions returned", "The provider returned a partial analysis. Run it again for interview questions.");
    return;
  }

  items.forEach((item) => {
    const card = createElement("article", "question-card");
    const category = createElement("span", "question-category", item.category || "Role-Specific");
    const list = createElement("ul", "talking-points");
    item.talking_points.forEach((point) => {
      list.append(createElement("li", "", point));
    });

    card.append(category, createElement("h5", "", item.question), createElement("p", "", item.why_it_matters), list);
    output.questionsList.append(card);
  });
};

const renderPrepPlan = (items) => {
  output.prepPlanList.replaceChildren();
  if (!items.length) {
    appendEmptyCard(output.prepPlanList, "No prep plan returned", "The provider returned a partial analysis. Run it again for a prep plan.");
    return;
  }

  items.forEach((item) => {
    const card = createElement("article", "timeline-card");
    card.append(
      createElement("span", "timeline-day", item.day),
      createElement("h5", "", item.focus),
      createElement("p", "", item.action)
    );
    output.prepPlanList.append(card);
  });
};

const formatTimestamp = (isoString, live) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return live ? "Live analysis" : "Demo preview";
  }

  return `${live ? "Live analysis" : "Demo preview"} • ${date.toLocaleString()}`;
};

const renderResults = ({ analysis, meta }) => {
  emptyState.classList.add("hidden");
  resultsContent.classList.remove("hidden");
  exportPdfButton.disabled = false;

  const score = Math.max(0, Math.min(100, Number(analysis.fit_score) || 0));
  scoreRing.style.setProperty("--ring-angle", `${Math.round((score / 100) * 360)}deg`);
  output.fitScoreValue.textContent = String(score);
  output.roleMeta.textContent = analysis.role_title || "Role";
  output.companyMeta.textContent = analysis.company_name || "Company";
  output.decisionMeta.textContent = analysis.decision || "Assessment";
  output.resumeSourceMeta.textContent = meta.resumeSource || "Pasted resume text";
  output.summaryHeadline.textContent =
    score >= 80 ? "Strong recruiting case" : score >= 65 ? "Promising, but needs tightening" : "Needs stronger positioning";
  output.summaryText.textContent = analysis.summary;
  output.generatedMeta.textContent = formatTimestamp(meta.generatedAt, meta.live);
  output.candidatePitch.textContent = analysis.candidate_pitch;
  output.recruiterTake.textContent = analysis.recruiter_take;

  renderKeywordGaps(analysis.missing_keywords || []);
  renderStrengths(analysis.strengths || []);
  renderGaps(analysis.gaps || []);
  renderRewrites(analysis.rewritten_bullets || []);
  renderQuestions(analysis.interview_questions || []);
  renderPrepPlan(analysis.prep_plan || []);
};

const setLoadingState = (loading) => {
  analyzeButton.disabled = loading;
  demoButton.disabled = loading;
  heroDemoButton.disabled = loading;
  clearButton.disabled = loading;
  chooseFileButton.disabled = loading;
  removeFileButton.disabled = loading;
  analyzeButton.textContent = loading ? "Analyzing..." : "Analyze Resume";
};

const setUploadUI = () => {
  if (!uploadState.file) {
    fileMeta.classList.add("hidden");
    fileNameLabel.textContent = "Resume.pdf";
    uploadDropzone.classList.remove("upload-dropzone-active");
    return;
  }

  fileMeta.classList.remove("hidden");
  fileNameLabel.textContent = uploadState.file.name;
  uploadDropzone.classList.add("upload-dropzone-active");
};

const clearSelectedFile = () => {
  uploadState.file = null;
  resumeFileInput.value = "";
  setUploadUI();
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const parts = result.split(",");
      resolve(parts.length > 1 ? parts[1] : result);
    };
    reader.onerror = () => reject(new Error("Unable to read the uploaded file."));
    reader.readAsDataURL(file);
  });

const setSelectedFile = async (file) => {
  if (!file) {
    return;
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    showBanner("Resume files must stay under 2.5 MB.");
    return;
  }

  const extension = (file.name.split(".").pop() || "").toLowerCase();
  const allowed = ["pdf", "txt", "md", "rtf"];
  if (!allowed.includes(extension)) {
    showBanner("Upload a PDF, TXT, MD, or RTF resume file.");
    return;
  }

  hideBanner();
  const data = await fileToBase64(file);
  uploadState.file = {
    name: file.name,
    type: file.type || extension,
    size: file.size,
    data
  };
  setUploadUI();
};

const collectPayload = () => ({
  jobTitle: fields.jobTitle.value.trim(),
  companyName: fields.companyName.value.trim(),
  focusMode: fields.focusMode.value,
  candidateLevel: fields.candidateLevel.value,
  resumeText: fields.resumeText.value.trim(),
  jobDescription: fields.jobDescription.value.trim(),
  resumeFile: uploadState.file
});

const applyDemoInputs = () => {
  fields.jobTitle.value = demoInputs.jobTitle;
  fields.companyName.value = demoInputs.companyName;
  fields.focusMode.value = demoInputs.focusMode;
  fields.candidateLevel.value = demoInputs.candidateLevel;
  fields.resumeText.value = demoInputs.resumeText;
  fields.jobDescription.value = demoInputs.jobDescription;
  clearSelectedFile();
};

const resetResults = () => {
  emptyState.classList.remove("hidden");
  resultsContent.classList.add("hidden");
  scoreRing.style.setProperty("--ring-angle", "0deg");
  exportPdfButton.disabled = true;
};

const clearForm = () => {
  form.reset();
  clearSelectedFile();
  hideBanner();
  resetResults();
  setStatus("Ready", "neutral");
};

const validatePayload = (payload) => {
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
  streamPreviewBuffer = "";
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

const appendStreamPreview = (text) => {
  streamPreviewBuffer += text;
  streamPreview.textContent = streamPreviewBuffer.trim() || "Streaming output...";
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

  return {
    event,
    data: dataLines.join("")
  };
};

const readErrorResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (contentType.includes("application/json")) {
    try {
      const parsed = JSON.parse(text);
      return parsed.error || "The analysis request failed.";
    } catch {
      return "The analysis request failed.";
    }
  }

  const match = text.match(/data:\s*(.+)/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      return parsed.message || "The analysis request failed.";
    } catch {}
  }

  return "The analysis request failed.";
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
    body: JSON.stringify({
      ...payload,
      stream: true
    })
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
          const payloadData = JSON.parse(parsed.data);
          setModalProgress(payloadData.percent, payloadData.label);
        } catch {}
      }

      if (parsed.event === "token") {
        try {
          const payloadData = JSON.parse(parsed.data);
          appendStreamPreview(payloadData.text || "");
        } catch {}
      }

      if (parsed.event === "final") {
        finalResult = JSON.parse(parsed.data);
      }

      if (parsed.event === "error") {
        const payloadData = JSON.parse(parsed.data);
        throw new Error(payloadData.message || "The streamed analysis failed.");
      }
    }

    if (done) {
      break;
    }
  }

  if (!finalResult) {
    throw new Error("The streamed analysis did not finish with a final payload.");
  }

  setModalProgress(100, "Analysis board ready");
  await new Promise((resolve) => {
    window.setTimeout(resolve, 280);
  });
  return finalResult;
};

const runDemo = (hydrateInputs = true) => {
  if (hydrateInputs) {
    applyDemoInputs();
  }
  renderResults(demoResult);
  setStatus("Demo Ready", "neutral");
  hideBanner();
};

const handleAnalyze = async (payload) => {
  if (isGithubPages) {
    runDemo(false);
    return demoResult;
  }

  return runStreamAnalysis(payload);
};

const toggleBackLink = () => {
  const referrer = document.referrer || "";
  if (!referrer.includes("hasanlm23123.github.io")) {
    backToPortfolioLink.classList.add("hidden-link");
  }
};

const preventDropDefaults = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

["dragenter", "dragover"].forEach((eventName) => {
  uploadDropzone.addEventListener(eventName, (event) => {
    preventDropDefaults(event);
    uploadDropzone.classList.add("upload-dropzone-hover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  uploadDropzone.addEventListener(eventName, (event) => {
    preventDropDefaults(event);
    uploadDropzone.classList.remove("upload-dropzone-hover");
  });
});

uploadDropzone.addEventListener("drop", async (event) => {
  const file = event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null;
  if (file) {
    await setSelectedFile(file);
  }
});

uploadDropzone.addEventListener("click", () => {
  resumeFileInput.click();
});

uploadDropzone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    resumeFileInput.click();
  }
});

chooseFileButton.addEventListener("click", () => {
  resumeFileInput.click();
});

resumeFileInput.addEventListener("change", async () => {
  const file = resumeFileInput.files && resumeFileInput.files[0] ? resumeFileInput.files[0] : null;
  if (file) {
    await setSelectedFile(file);
  }
});

removeFileButton.addEventListener("click", () => {
  clearSelectedFile();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideBanner();

  const payload = collectPayload();
  const validationError = validatePayload(payload);
  if (validationError) {
    setStatus("Needs Input", "warning");
    showBanner(validationError);
    return;
  }

  try {
    setLoadingState(true);
    setStatus("Streaming", "loading");
    const data = await handleAnalyze(payload);
    renderResults(data);
    if (data.meta && data.meta.live) {
      saveHistoryEntry(payload, data);
    }
    setStatus(data.meta && data.meta.live ? "Live Analysis" : "Demo Ready", data.meta && data.meta.live ? "success" : "neutral");
  } catch (error) {
    setStatus("Error", "error");
    showBanner(error && error.message ? error.message : "Unable to complete the analysis.");
  } finally {
    closeAnalysisModal();
    setLoadingState(false);
  }
});

demoButton.addEventListener("click", () => {
  runDemo();
});

heroDemoButton.addEventListener("click", () => {
  runDemo();
  document.getElementById("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
});

clearButton.addEventListener("click", clearForm);
exportPdfButton.addEventListener("click", () => {
  window.print();
});

toggleBackLink();
renderHistory();
exportPdfButton.disabled = true;
runDemo();
