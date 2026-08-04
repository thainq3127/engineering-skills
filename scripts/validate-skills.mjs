import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8").replaceAll("\r\n", "\n");

const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const requirePatterns = (label, text, patterns) => {
  for (const [description, pattern] of patterns) {
    if (!pattern.test(text)) errors.push(`${label}: missing ${description}`);
  }
};

const parseJson = (relativePath) => {
  try {
    return JSON.parse(read(relativePath));
  } catch (error) {
    errors.push(`${relativePath}: invalid JSON: ${error.message}`);
    return null;
  }
};

const plugin = parseJson(".claude-plugin/plugin.json");
parseJson(".claude-plugin/marketplace.json");
parseJson("package.json");

const promotedBuckets = ["engineering", "productivity"];
const skills = [];

const textExtensions = new Set([".md", ".yaml", ".yml", ".json", ".mjs", ".ps1"]);
const textRoots = [
  "skills/engineering",
  "skills/productivity",
  "docs/engineering",
  "docs/productivity",
  ".agents",
  ".claude-plugin",
  "scripts",
];

const visitTextFiles = (relativePath) => {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return;
  const stat = fs.statSync(absolutePath);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(absolutePath)) {
      visitTextFiles(path.join(relativePath, child));
    }
    return;
  }
  if (!textExtensions.has(path.extname(relativePath))) return;

  const text = fs.readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
  if (!text.endsWith("\n")) errors.push(`${relativePath}: missing final newline`);
  for (const [index, line] of text.split("\n").entries()) {
    if (/[ \t]+$/.test(line)) {
      errors.push(`${relativePath}:${index + 1}: trailing whitespace`);
    }
  }
};

for (const textRoot of textRoots) visitTextFiles(textRoot);
for (const textFile of ["README.md", "CONTEXT.md", "package.json"]) {
  visitTextFiles(textFile);
}

for (const bucket of fs.readdirSync(path.join(root, "skills"))) {
  const bucketPath = path.join(root, "skills", bucket);
  if (!fs.statSync(bucketPath).isDirectory()) continue;

  for (const name of fs.readdirSync(bucketPath)) {
    const skillDirectory = path.join(bucketPath, name);
    if (!fs.statSync(skillDirectory).isDirectory()) continue;

    const skillPath = path.join("skills", bucket, name, "SKILL.md");
    if (!exists(skillPath)) continue;

    const text = read(skillPath);
    const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---\n/);
    if (!frontmatterMatch) {
      errors.push(`${skillPath}: missing or malformed YAML frontmatter`);
      continue;
    }

    const frontmatter = frontmatterMatch[1];
    const declaredName = frontmatter.match(/^name:\s*["']?([^\n"']+)["']?$/m)?.[1]?.trim();
    const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim();

    if (!declaredName) errors.push(`${skillPath}: missing name`);
    if (declaredName && declaredName !== name) {
      errors.push(`${skillPath}: declared name ${declaredName} does not match directory ${name}`);
    }
    if (!description) errors.push(`${skillPath}: missing description`);

    const openAiPath = path.join("skills", bucket, name, "agents", "openai.yaml");
    if (!exists(openAiPath)) {
      errors.push(`${skillPath}: missing agents/openai.yaml`);
      continue;
    }

    const openAi = read(openAiPath);
    const userInvokedForClaude = frontmatter.includes("disable-model-invocation: true");
    const userInvokedForCodex = openAi.includes("allow_implicit_invocation: false");
    if (userInvokedForClaude !== userInvokedForCodex) {
      errors.push(`${skillPath}: Claude and Codex invocation policies disagree`);
    }

    skills.push({ bucket, name, skillPath, userInvoked: userInvokedForClaude });
  }
}

if (plugin) {
  const pluginSkills = new Set(plugin.skills);
  if (pluginSkills.size !== plugin.skills.length) {
    errors.push(".claude-plugin/plugin.json: duplicate skill entries");
  }

  const topReadme = read("README.md");
  for (const bucket of promotedBuckets) {
    const bucketReadme = read(path.join("skills", bucket, "README.md"));
    for (const skill of skills.filter((entry) => entry.bucket === bucket)) {
      const pluginPath = `./skills/${bucket}/${skill.name}`;
      if (!pluginSkills.has(pluginPath)) {
        errors.push(`${skill.name}: missing plugin entry ${pluginPath}`);
      }
      if (!topReadme.includes(`(${pluginPath}/SKILL.md)`)) {
        errors.push(`${skill.name}: missing top-level README link`);
      }
      if (!bucketReadme.includes(`(./${skill.name}/SKILL.md)`)) {
        errors.push(`${skill.name}: missing ${bucket} README link`);
      }

      const docsPath = path.join("docs", bucket, `${skill.name}.md`);
      if (!exists(docsPath)) errors.push(`${skill.name}: missing ${docsPath}`);
    }
  }
}

const workstreamSkill = skills.find((skill) => skill.name === "workstream-tracking");
if (!workstreamSkill) {
  errors.push("workstream-tracking: skill is missing");
} else if (workstreamSkill.userInvoked) {
  errors.push("workstream-tracking: must remain model-invoked");
}

const reviewComposer = skills.find((skill) => skill.name === "review-composer");
if (!reviewComposer) {
  errors.push("review-composer: promoted skill is missing");
} else if (reviewComposer.userInvoked) {
  errors.push("review-composer: must remain model-invoked so implementation and routing flows can hand off to it");
}

for (const name of [
  "ask-matt",
  "grill-with-docs",
  "to-spec",
  "to-tickets",
  "implement",
  "review-composer",
  "code-review",
  "diagnosing-bugs",
  "triage",
  "wayfinder",
  "prototype",
  "tdd",
  "domain-modeling",
  "research",
  "resolving-merge-conflicts",
  "improve-codebase-architecture",
]) {
  const skillPath = path.join("skills", "engineering", name, "SKILL.md");
  if (!read(skillPath).includes("workstream-tracking")) {
    errors.push(`${name}: missing workstream-tracking lifecycle hook`);
  }
}

for (const requiredPath of [
  "skills/engineering/setup-matt-pocock-skills/workstreams.md",
  "docs/engineering/workstream-tracking.md",
  ".agents/adr/0003-workstream-control-plane.md",
  "scripts/link-skills.ps1",
]) {
  if (!exists(requiredPath)) errors.push(`${requiredPath}: missing`);
}

const githubTrackerTemplate = read(
  "skills/engineering/setup-matt-pocock-skills/issue-tracker-github.md",
);
for (const requiredPhrase of [
  "ChatGPT Web",
  "connected `@github` MCP",
  "Codex",
  "authenticated `gh` CLI",
  "must not substitute another operator's transport",
]) {
  if (!githubTrackerTemplate.includes(requiredPhrase)) {
    errors.push(`GitHub tracker template: missing operator-routing rule ${requiredPhrase}`);
  }
}

const implementSkill = read("skills/engineering/implement/SKILL.md");
for (const requiredPhrase of [
  "`/implement` is a **Codex-owned flow by default**",
  "Never invoke `@devspace`, `@github` MCP",
  "authenticated `gh`",
]) {
  if (!implementSkill.includes(requiredPhrase)) {
    errors.push(`implement: missing operator contract ${requiredPhrase}`);
  }
}

const codeReviewSkill = read("skills/engineering/code-review/SKILL.md");
for (const requiredPhrase of [
  "`/code-review` is a **ChatGPT Web-owned flow by default**",
  "Use `@devspace`",
  "Use connected `@github` MCP",
  "Never use native Codex filesystem or shell access as a substitute, `gh`",
]) {
  if (!codeReviewSkill.includes(requiredPhrase)) {
    errors.push(`code-review: missing operator contract ${requiredPhrase}`);
  }
}

requirePatterns("code-review", codeReviewSkill, [
  ["focused review mode", /Focused mode/i],
  ["delegated worker contract", /Delegated worker mode/i],
  ["delegated lease stop condition", /Missing delegated lease is a stop condition/i],
  ["child-only write surface", /allowed write surface is this child Issue only/i],
  ["delegated prohibition on corrective issue creation", /Do not create corrective or diagnosis Issues/i],
  ["large-review route to review-composer", /route to `?\/review-composer`?/i],
]);

const reviewComposerSkill = read("skills/engineering/review-composer/SKILL.md");
requirePatterns("review-composer", reviewComposerSkill, [
  ["compose phase", /Phase 1: Compose/i],
  ["synthesize phase", /Phase 2: Synthesize/i],
  ["coverage matrix", /coverage matrix/i],
  ["ChatGPT Web operator profile", /ChatGPT Web-owned flow by default/i],
  ["native Workstream parent hierarchy", /composer parent.*native direct sub-issue of the Workstream root/is],
  ["native child hierarchy", /child.*native direct sub-issue of the composer parent/is],
  ["root-level corrective routing", /corrective or diagnosis Issue.*native direct sub-issue of the Workstream root/is],
  ["composer-only synthesis writes", /Only the composer may create corrective or diagnosis Issues/i],
  ["no silent native hierarchy fallback", /Body links are not a substitute for native hierarchy/i],
]);

const workstreamTrackingSkill = read("skills/engineering/workstream-tracking/SKILL.md");
requirePatterns("workstream-tracking", workstreamTrackingSkill, [
  ["review-composition activity", /review-composition/],
  ["delegated-review activity", /delegated-review/],
  ["review-synthesis activity", /review-synthesis/],
  ["delegated review lease", /Delegated review leases/i],
  ["non-overlapping write surfaces", /non-overlapping child-Issue write surfaces/i],
  ["composer-only Workstream writes", /composer is the sole writer/i],
  ["corrective issues outside composer", /corrective and diagnosis Issues are native direct sub-issues of the Workstream root/i],
]);

requirePatterns("implement", implementSkill, [
  ["large cumulative review route", /Handoff to `?\/review-composer`?.*several implementation or corrective tickets/is],
  ["focused review route", /Handoff directly to `?\/code-review`? only for a focused/is],
  ["Codex swarm prohibition", /Do not let Codex compose or run a review swarm/i],
]);

const askMattSkill = read("skills/engineering/ask-matt/SKILL.md");
requirePatterns("ask-matt", askMattSkill, [
  ["large cumulative review routing", /Large cumulative review.*`\/review-composer`/i],
  ["multi-ticket correction routing", /multi-ticket correction range.*`\/review-composer`/i],
  ["focused review routing", /Focused PR.*`\/code-review`/i],
  ["unknown-cause bug routing", /cause is still unclear.*`\/diagnosing-bugs`/i],
]);

const workstreamTemplate = read("skills/engineering/setup-matt-pocock-skills/workstreams.md");
requirePatterns("Workstream setup template", workstreamTemplate, [
  ["review hierarchy", /Review swarm hierarchy/i],
  ["delegated review leases", /Delegated review leases/i],
  ["composer Project placement", /add the active Review Composer parent/i],
  ["review children outside Project", /do not add review children by default/i],
  ["corrective issues outside composer", /must not be children of the composer/i],
]);

if (!exists("docs/engineering/review-composer.md")) {
  errors.push("review-composer: missing docs/engineering/review-composer.md");
}

if (errors.length > 0) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${skills.length} skills, promoted manifests, docs coverage, invocation parity, and Workstream hooks.`,
);
