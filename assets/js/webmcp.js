// Read-only WebMCP tools for the Unofficial ServiceNow Version Tracker (sndocs.jace.pro).
// WebMCP is an early-preview browser API. The site works normally without it.
(() => {
  const modelContext = document.modelContext;
  if (!modelContext?.registerTool) return;

  const DATA_URL = "/versions.json";
  let dataPromise = null;

  const loadVersions = () => {
    dataPromise ||= fetch(DATA_URL, { credentials: "same-origin" }).then((response) => {
      if (!response.ok) throw new Error(`The version data returned HTTP ${response.status}.`);
      return response.json();
    });
    return dataPromise;
  };

  const day = (value) => (value ? String(value).slice(0, 10) : null);
  const numbers = (family) => (family.patches || []).map((patch) => String(patch.number || "")).filter(Boolean);
  const allFeatures = (family) => (family.features || []).map((feature) => String(feature));
  const listing = (items, cap) => (items.length > cap ? `${items.slice(0, cap).join(", ")} (+${items.length - cap} more)` : items.join(", "));

  const familyName = (family) => String(family.name || "");
  const haystackFor = (family) => `${familyName(family)} ${allFeatures(family).join(" ")} ${numbers(family).join(" ")}`.toLowerCase();

  const matchingFeatures = (family, terms) =>
    allFeatures(family).filter((feature) => terms.some((term) => feature.toLowerCase().includes(term)));

  // Tool results should stay close to the 1.5K character budget agents work with.
  const fit = (payload) => {
    const json = JSON.stringify(payload);
    if (json.length <= 1500) return json;
    const trimmed = { ...payload, features: (payload.features || []).slice(0, 8) };
    const shorter = JSON.stringify(trimmed);
    if (shorter.length <= 1500) return shorter;
    return JSON.stringify({ ...trimmed, features: trimmed.features.slice(0, 4) });
  };

  const safeUrl = (value) => {
    const url = new URL(value, location.origin);
    if (url.origin !== location.origin) {
      throw new Error("Only pages on sndocs.jace.pro can be opened.");
    }
    return url;
  };

  const mainText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("script, style, nav, header, footer, [aria-hidden='true']").forEach((el) => el.remove());
    return (doc.querySelector("main") || doc.body).innerText
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  modelContext.registerTool({
    name: "sndocs_search_versions",
    description: "Search ServiceNow version families, their release dates, and features. Read-only.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "A version family, feature, or patch to find, for example Rome or Performance Analytics." } },
      required: ["query"],
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: async ({ query }) => {
      const terms = String(query || "").toLowerCase().split(/\s+/).filter((term) => term.length > 1).slice(0, 8);
      if (!terms.length) return "Enter a search query.";
      const families = await loadVersions();
      const scored = [];
      for (const family of families) {
        const name = familyName(family).toLowerCase();
        const haystack = haystackFor(family);
        let score = 0;
        for (const term of terms) {
          if (name.includes(term)) score += 10;
          score += Math.min(haystack.split(term).length - 1, 6);
        }
        if (score) scored.push({ score, family });
      }
      if (!scored.length) {
        const newest = families.slice(0, 5).map(familyName);
        return `No ServiceNow version family matches "${query}". Newest tracked families: ${newest.join(", ")}.`;
      }
      const results = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ family }) => {
          const matched = matchingFeatures(family, terms);
          return {
            family: familyName(family),
            released: day(family.date),
            retired: day(family.endDate),
            patchCount: numbers(family).length,
            features: (matched.length ? matched : allFeatures(family)).slice(0, 6),
          };
        });
      return fit(results);
    },
  });

  modelContext.registerTool({
    name: "sndocs_version_details",
    description: "Get release dates, patch numbers, and features for one ServiceNow version family. Read-only.",
    inputSchema: {
      type: "object",
      properties: { family: { type: "string", description: "Version family name, for example Rome or Vancouver." } },
      required: ["family"],
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: async ({ family }) => {
      const wanted = String(family || "").trim().toLowerCase();
      if (!wanted) return "Enter a version family name.";
      const families = await loadVersions();
      const match = families.find((item) => familyName(item).toLowerCase() === wanted)
        || families.find((item) => familyName(item).toLowerCase().includes(wanted))
        || families.find((item) => wanted.includes(familyName(item).toLowerCase()));
      if (!match) {
        const newest = families.slice(0, 5).map(familyName);
        return `No version family matches "${family}". Newest tracked families: ${newest.join(", ")}.`;
      }
      const patch = (match.patches || []).slice(-1)[0] || null;
      return fit({
        family: familyName(match),
        released: day(match.date),
        retired: day(match.endDate),
        releaseNotes: match.url,
        patchCount: numbers(match).length,
        latestPatch: patch ? { number: String(patch.number || ""), date: day(patch.date) } : null,
        patchNumbers: listing(numbers(match), 20),
        features: allFeatures(match),
      });
    },
  });

  modelContext.registerTool({
    name: "sndocs_read_page",
    description: "Read the visible text of a page on sndocs.jace.pro. Only pages on this site are allowed. Read-only.",
    inputSchema: {
      type: "object",
      properties: { url: { type: "string", description: "A sndocs.jace.pro URL or path, for example /chart." } },
      required: ["url"],
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: async ({ url }) => {
      const target = safeUrl(url);
      const response = await fetch(target.href, { credentials: "same-origin" });
      if (!response.ok) return `That page returned HTTP ${response.status}.`;
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const heading = doc.querySelector("h1")?.innerText?.trim() || doc.title || target.pathname;
      return `${heading}\n\n${mainText(html).slice(0, 12000)}`;
    },
  });
})();
