const form = document.getElementById("analysisForm");
const analyzeButton = document.getElementById("analyzeButton");
const demoButton = document.getElementById("demoButton");
const clearButton = document.getElementById("clearButton");
const previewBanner = document.getElementById("previewBanner");
const emptyState = document.getElementById("emptyState");
const resultsContent = document.getElementById("resultsContent");
const statusPill = document.getElementById("statusPill");
const scoreRing = document.getElementById("scoreRing");

const fields = {
  jobTitle: document.getElementById("jobTitle"),
  companyName: document.getElementById("companyName"),
  focusMode: document.getElementById("focusMode"),
  candidateLevel: document.getElementById("candidateLevel"),
  resumeText: document.getElementById("resumeText"),
  jobDescription: document.getElementById("jobDescription"),
};

const output = {
  fitScoreValue: document.getElementById("fitScoreValue"),
  roleMeta: document.getElementById("roleMeta"),
  companyMeta: document.getElementById("companyMeta"),
  decisionMeta: document.getElementById("decisionMeta"),
  summaryHeadline: document.getElementById("summaryHeadline"),
  summaryText: document.getElementById("summaryText"),
  generatedMeta: document.getElementById("generatedMeta"),
  candidatePitch: document.getElementById("candidatePitch"),
  recruiterTake: document.getElementById("recruiterTake"),
  strengthsList: document.getElementById("strengthsList"),
  gapsList: document.getElementById("gapsList"),
  rewritesList: document.getElementById("rewritesList"),
  questionsList: document.getElementById("questionsList"),
  prepPlanList: document.getElementById("prepPlanList"),
};

const isGithubPages = window.location.hostname.endsWith("github.io");

const demoInputs = {
  jobTitle: "Associate Product Engineer",
  companyName: "Northstar Health",
  focusMode: "recruiter",
  candidateLevel: "new-grad",
  resumeText: `Maya Carter
University of Maryland Information Science student graduating in May 2026.

Experience
- Product Engineering Intern, Harbor Atlas, Summer 2025
  Built internal dashboards in React, shipped account workflow updates, and partnered with design to reduce QA churn before release.
- Software QA Intern, Finch Systems, 2024
  Wrote regression test cases, validated REST endpoints in Postman, and documented edge cases for the engineering team.
- Peer Tech Coach, Campus Learning Lab, 2023 to Present
  Helped students debug web assignments, explain JavaScript fundamentals, and break down technical concepts clearly.

Projects
- ShiftPilot, a full-stack scheduling app with role-based routing, Supabase auth, and automated reminder emails.
- SignalBoard, a real-time analytics dashboard with charting, filters, and responsive mobile views.
- Browser survival game with wave spawning, collision logic, and persistent high-score tracking.

Skills
JavaScript, TypeScript, React, Node.js, Supabase, PostgreSQL, HTML, CSS, Python, Postman, Git, Figma`,
  jobDescription: `Northstar Health is hiring an Associate Product Engineer to build patient onboarding flows, internal
tools, and analytics surfaces used by operations teams. The role works across React interfaces, API integrations,
debugging, and SQL-backed product features. Strong candidates show ownership, communicate well with design and product,
and can ship polished user-facing work while improving reliability behind the scenes.`,
};

const demoResult = {
  analysis: {
    role_title: "Associate Product Engineer",
    company_name: "Northstar Health",
    fit_score: 82,
    decision: "Strong new-grad candidate with product and execution signal",
    summary: "Maya reads like a practical early-career product engineer because the profile combines shipped UI work, QA discipline, technical communication, and one clear full-stack build. The strongest angle is not just coursework, but the pattern of turning user needs into polished workflows and backing that with testing awareness.",
    candidate_pitch: "Early-career product engineer with experience shipping React dashboards, validating APIs, and supporting real users through debugging and coaching. Best positioned as someone who can contribute quickly on frontend-heavy product work while growing into deeper backend ownership.",
    recruiter_take: "The profile stands out when framed around product delivery, release quality, and user empathy. The biggest improvement area is making backend and data work feel more concrete by attaching metrics, production context, and end-to-end system details to the strongest project bullets.",
    strengths: [
      {
        title: "Product-shipping internship experience",
        detail: "The Harbor Atlas internship adds real delivery signal and shows familiarity with product, design, and release pressure."
      },
      {
        title: "Frontend plus QA range",
        detail: "React delivery paired with API validation suggests a candidate who can both build user flows and catch reliability issues."
      },
      {
        title: "Good user empathy and communication",
        detail: "The tech coach role supports the idea that Maya can explain technical work clearly and think about how users experience a product."
      },
      {
        title: "Projects show initiative beyond classwork",
        detail: "A full-stack scheduling app plus a real-time dashboard give the resume more depth than a generic student project list."
      }
    ],
    gaps: [
      {
        title: "Impact metrics are still thin",
        detail: "Several bullets describe contributions clearly, but they do not quantify release scope, bug reduction, or usage impact.",
        fix: "Add metrics around dashboard usage, bugs caught, test coverage, or time saved for the team."
      },
      {
        title: "Backend ownership needs to read stronger",
        detail: "The resume references APIs and SQL, but the current bullets still lean heavier on frontend execution than system ownership.",
        fix: "Make ShiftPilot the anchor project and explain the auth flow, database design, and deployment choices."
      },
      {
        title: "Debugging under production pressure is implied, not proven",
        detail: "The QA and internship work suggest real debugging exposure, but the resume does not yet tell one specific story of diagnosing a problem end to end.",
        fix: "Prepare a concise example about finding a release blocker, tracing the issue, and communicating the fix."
      }
    ],
    rewritten_bullets: [
      {
        original: "Built internal dashboards in React and shipped workflow updates at Harbor Atlas.",
        improved: "Built and shipped internal React dashboards and account workflow updates at Harbor Atlas, partnering with design to tighten UI quality and reduce release churn before launch.",
        why_it_works: "This version makes the ownership, collaboration, and delivery impact feel more concrete."
      },
      {
        original: "Validated REST endpoints and wrote regression tests at Finch Systems.",
        improved: "Validated REST endpoints and wrote regression coverage at Finch Systems, documenting release-blocking edge cases and improving confidence ahead of engineering handoff.",
        why_it_works: "This reframes QA work as a software quality contribution rather than a generic internship task."
      },
      {
        original: "Built ShiftPilot, a scheduling app with authentication and reminder emails.",
        improved: "Built ShiftPilot, a full-stack scheduling app with role-based routing, Supabase authentication, PostgreSQL-backed scheduling data, and automated reminder emails for shift updates.",
        why_it_works: "This turns the project into a stronger full-stack systems example with clear technical depth."
      }
    ],
    interview_questions: [
      {
        question: "Tell me about a time you shipped a product workflow with input from design or product.",
        why_it_matters: "This role values product collaboration, so interviewers will want evidence that Maya can build with user and stakeholder context in mind.",
        talking_points: [
          "Describe the workflow, who you partnered with, and what the user needed.",
          "Explain the implementation decisions you made in the interface.",
          "Close with how you validated the final result before release."
        ]
      },
      {
        question: "What did you learn from validating APIs and writing regression coverage as an intern?",
        why_it_matters: "The QA experience is a real differentiator, but only if Maya can connect it to engineering judgment and release quality.",
        talking_points: [
          "Discuss how you identified edge cases and structured test coverage.",
          "Explain how those checks reduced release risk for the team.",
          "Connect that experience to writing more reliable product code."
        ]
      },
      {
        question: "How would you walk through the architecture of ShiftPilot in an interview?",
        why_it_matters: "A strong answer can turn the best project into proof of full-stack thinking instead of a resume bullet with buzzwords.",
        talking_points: [
          "Start from the user flow and explain authentication and roles.",
          "Describe where data is stored, fetched, and validated.",
          "Mention one tradeoff you would revisit in the next iteration."
        ]
      }
    ],
    prep_plan: [
      { day: "Day 1", focus: "Resume tightening", action: "Add metrics to the internship bullets and make the strongest project read more end to end." },
      { day: "Day 2", focus: "Project walkthroughs", action: "Practice explaining ShiftPilot and SignalBoard from user flow to API and data layer." },
      { day: "Day 3", focus: "Behavioral stories", action: "Prepare one story on collaboration, one on debugging, and one on improving software quality before release." },
      { day: "Day 4", focus: "Frontend depth", action: "Review form state, component design, accessibility, and the tradeoffs behind the React work shown on the resume." },
      { day: "Day 5", focus: "Backend fluency", action: "Rehearse a clean explanation of one REST flow, one SQL query pattern, and one auth decision from the main project." },
      { day: "Day 6", focus: "Company alignment", action: "Map internship and project experience to Northstar Health’s product, collaboration, and reliability expectations." },
      { day: "Day 7", focus: "Mock screen", action: "Run a full recruiter-style screen using the candidate pitch, strongest bullet rewrites, and likely interview questions." }
    ]
  },
  meta: {
    model: "demo-preview",
    generatedAt: "2026-03-19T17:00:00.000Z",
    live: false
  }
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

const appendEmptyCard = (container, title, detail) => {
  const card = createElement("article", "stack-item");
  card.append(createElement("h5", "", title), createElement("p", "", detail));
  container.append(card);
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
    card.append(createElement("div", "rewrite-original", "No rewritten bullets returned."), createElement("div", "rewrite-copy", "Run the analysis again to generate bullet rewrites."));
    output.rewritesList.append(card);
    return;
  }

  items.forEach((item) => {
    const card = createElement("article", "rewrite-card");
    const improvedWrap = createElement("div", "rewrite-copy");
    improvedWrap.append(
      createElement("span", "rewrite-label", "Improved Version"),
      createElement("h5", "", item.improved),
      createElement("p", "", item.why_it_works)
    );

    card.append(createElement("div", "rewrite-original", item.original), improvedWrap);
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
    const list = createElement("ul", "talking-points");
    item.talking_points.forEach((point) => {
      list.append(createElement("li", "", point));
    });

    card.append(createElement("h5", "", item.question), createElement("p", "", item.why_it_matters), list);
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

  const score = Math.max(0, Math.min(100, Number(analysis.fit_score) || 0));
  scoreRing.style.setProperty("--ring-angle", `${Math.round((score / 100) * 360)}deg`);
  output.fitScoreValue.textContent = String(score);
  output.roleMeta.textContent = analysis.role_title || "Role";
  output.companyMeta.textContent = analysis.company_name || "Company";
  output.decisionMeta.textContent = analysis.decision || "Assessment";
  output.summaryHeadline.textContent =
    score >= 80 ? "Strong recruiting case" : score >= 65 ? "Promising, but needs tightening" : "Needs stronger positioning";
  output.summaryText.textContent = analysis.summary;
  output.generatedMeta.textContent = formatTimestamp(meta.generatedAt, meta.live);
  output.candidatePitch.textContent = analysis.candidate_pitch;
  output.recruiterTake.textContent = analysis.recruiter_take;

  renderStrengths(analysis.strengths);
  renderGaps(analysis.gaps);
  renderRewrites(analysis.rewritten_bullets);
  renderQuestions(analysis.interview_questions);
  renderPrepPlan(analysis.prep_plan);
};

const setLoadingState = (loading) => {
  analyzeButton.disabled = loading;
  demoButton.disabled = loading;
  clearButton.disabled = loading;
  analyzeButton.textContent = loading ? "Analyzing..." : "Analyze With AI";
};

const collectPayload = () => ({
  jobTitle: fields.jobTitle.value.trim(),
  companyName: fields.companyName.value.trim(),
  focusMode: fields.focusMode.value,
  candidateLevel: fields.candidateLevel.value,
  resumeText: fields.resumeText.value.trim(),
  jobDescription: fields.jobDescription.value.trim()
});

const applyDemoInputs = () => {
  fields.jobTitle.value = demoInputs.jobTitle;
  fields.companyName.value = demoInputs.companyName;
  fields.focusMode.value = demoInputs.focusMode;
  fields.candidateLevel.value = demoInputs.candidateLevel;
  fields.resumeText.value = demoInputs.resumeText;
  fields.jobDescription.value = demoInputs.jobDescription;
};

const resetResults = () => {
  emptyState.classList.remove("hidden");
  resultsContent.classList.add("hidden");
  scoreRing.style.setProperty("--ring-angle", "0deg");
};

const clearForm = () => {
  form.reset();
  hideBanner();
  resetResults();
  setStatus("Ready", "neutral");
};

const validatePayload = (payload) => {
  if (!payload.resumeText || !payload.jobDescription) {
    return "Paste both the resume text and the job description before running the analysis.";
  }
  if (payload.resumeText.length < 80) {
    return "The resume text is too short to produce a useful analysis.";
  }
  if (payload.jobDescription.length < 80) {
    return "The job description is too short to produce a useful analysis.";
  }
  return "";
};

const runDemo = (message, hydrateInputs = true) => {
  if (hydrateInputs) {
    applyDemoInputs();
  }
  renderResults(demoResult);
  setStatus("Demo Loaded", "warning");
  if (message) {
    showBanner(message);
  } else {
    hideBanner();
  }
};

const runLiveAnalysis = async (payload) => {
  const response = await fetch("/api/role-ready", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "The analysis request failed.");
  }

  return data;
};

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
    setStatus("Running", "loading");
    const data = await runLiveAnalysis(payload);
    renderResults(data);
    setStatus("Live Analysis", "success");
  } catch (error) {
    if (isGithubPages) {
      runDemo("", false);
    } else {
      setStatus("Error", "error");
      showBanner(error.message || "Unable to complete the analysis.");
    }
  } finally {
    setLoadingState(false);
  }
});

demoButton.addEventListener("click", () => {
  hideBanner();
  runDemo();
});

clearButton.addEventListener("click", clearForm);

if (isGithubPages) {
  runDemo();
}
