const { normalizeText } = require("./role-ready-core");

const decodeHtmlEntities = (value) =>
  normalizeText(value)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");

const stripTags = (html) =>
  decodeHtmlEntities(
    normalizeText(html)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
  );

const readMeta = (html, key, attr) => {
  const pattern = new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([\\s\\S]*?)["']`, "i");
  const match = html.match(pattern);
  return match ? decodeHtmlEntities(match[1]) : "";
};

const parseJsonLdBlocks = (html) => {
  const matches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  const output = [];

  matches.forEach((block) => {
    const content = block
      .replace(/<script[^>]*>/i, "")
      .replace(/<\/script>/i, "")
      .trim();

    try {
      const parsed = JSON.parse(content);
      output.push(parsed);
    } catch (error) {}
  });

  return output;
};

const findJsonLdJob = (blocks) => {
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const list = Array.isArray(block) ? block : [block];

    for (let inner = 0; inner < list.length; inner += 1) {
      const item = list[inner];
      const type = normalizeText(item && item["@type"]).toLowerCase();
      if (type === "jobposting") {
        return item;
      }
    }
  }

  return null;
};

const extractLinkedInMarkup = (html) => {
  const match = html.match(/show-more-less-html__markup[^>]*>([\s\S]*?)<\/div>/i);
  return match ? stripTags(match[1]) : "";
};

const looksBlocked = (text) => {
  const lower = normalizeText(text).toLowerCase();
  return !lower || lower.includes("sign in") || lower.includes("join now") || lower.includes("captcha");
};

const guessCompanyFromTitle = (title) => {
  const cleaned = normalizeText(title);
  if (!cleaned) {
    return "";
  }

  const separators = [" - ", " | ", " at "];
  for (let index = 0; index < separators.length; index += 1) {
    const separator = separators[index];
    if (cleaned.includes(separator)) {
      return cleaned.split(separator)[1] || "";
    }
  }

  return "";
};

const extractFromHtml = (html, urlString) => {
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const openGraphTitle = readMeta(html, "og:title", "property");
  const openGraphDescription = readMeta(html, "og:description", "property");
  const metaDescription = readMeta(html, "description", "name");
  const jsonLdJob = findJsonLdJob(parseJsonLdBlocks(html));
  const linkedInDescription = extractLinkedInMarkup(html);

  const title =
    normalizeText((jsonLdJob && jsonLdJob.title) || openGraphTitle || (titleTag ? stripTags(titleTag[1]) : "")) ||
    "Job posting";

  const companyName =
    normalizeText(
      jsonLdJob &&
        jsonLdJob.hiringOrganization &&
        (jsonLdJob.hiringOrganization.name || jsonLdJob.hiringOrganization.legalName)
    ) || normalizeText(readMeta(html, "og:site_name", "property")) || guessCompanyFromTitle(title);

  const description =
    normalizeText((jsonLdJob && jsonLdJob.description) || linkedInDescription || openGraphDescription || metaDescription) ||
    stripTags(html).slice(0, 12000);

  return {
    sourceUrl: urlString,
    jobTitle: decodeHtmlEntities(title),
    companyName: decodeHtmlEntities(companyName),
    jobDescription: decodeHtmlEntities(description)
  };
};

const fetchHtml = async (urlString) => {
  const response = await fetch(urlString, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache"
    }
  });

  if (!response.ok) {
    throw new Error(`Job page request failed with status ${response.status}.`);
  }

  return response.text();
};

const buildJinaFallbackUrl = (urlString) => {
  const stripped = urlString.replace(/^https?:\/\//i, "");
  return `https://r.jina.ai/http://${stripped}`;
};

const extractJobFromUrl = async (urlString) => {
  const target = new URL(urlString);
  let html = "";

  try {
    html = await fetchHtml(target.toString());
    const extracted = extractFromHtml(html, target.toString());
    if (extracted.jobDescription.length >= 240 && !looksBlocked(extracted.jobDescription)) {
      return extracted;
    }
  } catch (error) {}

  if (target.hostname.includes("linkedin.com")) {
    const fallbackResponse = await fetch(buildJinaFallbackUrl(target.toString()), {
      method: "GET",
      headers: {
        Accept: "text/plain"
      }
    });

    if (!fallbackResponse.ok) {
      throw new Error("LinkedIn blocked the page request. Paste the job description manually for this posting.");
    }

    const text = normalizeText(await fallbackResponse.text());
    if (!text) {
      throw new Error("The job URL did not return readable text.");
    }

    return {
      sourceUrl: target.toString(),
      jobTitle: target.hostname.includes("linkedin.com") ? "LinkedIn job posting" : "Job posting",
      companyName: "",
      jobDescription: text.slice(0, 12000)
    };
  }

  if (!html) {
    html = await fetchHtml(target.toString());
  }

  const extracted = extractFromHtml(html, target.toString());
  if (extracted.jobDescription.length < 120) {
    throw new Error("The job URL did not expose enough text to extract a usable description.");
  }

  return extracted;
};

module.exports = {
  extractJobFromUrl
};
