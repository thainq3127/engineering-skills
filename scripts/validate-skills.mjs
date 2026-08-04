import fs from "node:fs";
import path from "node:path";
import { checkGeneratedInstructions } from "./generate-gpt-instructions.mjs";

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
const packageJson = parseJson("package.json");
const gptManifest = parseJson("gpts/manifest.json");

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
  "gpts",
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

for (const error of checkGeneratedInstructions()) {
  errors.push(`GPT packaging: ${error}`);
}

const expectedGptIds = [
  "matt",
  "grill-with-docs",
  "engineering-planner",
  "wayfinder",
  "code-reviewer",
  "review-composer",
  "triage-operator",
];

if (packageJson) {
  for (const [scriptName, expectedCommand] of [
    ["generate:gpts", "node scripts/generate-gpt-instructions.mjs"],
    ["check:gpts", "node scripts/generate-gpt-instructions.mjs --check"],
  ]) {
    if (packageJson.scripts?.[scriptName] !== expectedCommand) {
      errors.push(`package.json: ${scriptName} must be ${expectedCommand}`);
    }
  }
}

if (gptManifest) {
  const agents = Array.isArray(gptManifest.agents) ? gptManifest.agents : [];
  const ids = agents.map((agent) => agent.id);
  for (const id of expectedGptIds) {
    if (!ids.includes(id)) errors.push(`gpts/manifest.json: missing Phase 1 GPT ${id}`);
  }
  for (const id of ids) {
    if (!expectedGptIds.includes(id)) errors.push(`gpts/manifest.json: unexpected Phase 1 GPT ${id}`);
  }
  if (new Set(ids).size !== ids.length) {
    errors.push("gpts/manifest.json: duplicate GPT ids");
  }

  for (const agent of agents) {
    const outputPath = path.join("gpts", agent.output ?? "");
    if (!exists(outputPath)) continue;
    const generated = read(outputPath);
    if (Buffer.byteLength(generated, "utf8") > 8000) {
      errors.push(`GPT ${agent.id}: generated instructions exceed the 8000-byte portability budget`);
    }
    requirePatterns(`GPT ${agent.id}`, generated, [
      ["explicit @devspace transport", /Use `@devspace` for all local workspace operations/i],
      ["explicit @github transport", /Use connected `@github` for all GitHub reads and mutations/i],
      ["forbidden ChatGPT GitHub App fallback", /ChatGPT GitHub App/i],
      ["no transport fallback", /Do not fall back/i],
      ["runtime skill loading independence", /Do not depend on automatic runtime skill loading/i],
      ["dynamic state resolution", /Project instructions are routing metadata, not execution truth/i],
      ["routing envelope", /Routing and handoff contract/i],
    ]);

    for (const skillPath of agent.canonicalSkills ?? []) {
      if (!exists(skillPath)) {
        errors.push(`GPT ${agent.id}: canonical skill does not exist: ${skillPath}`);
      }
    }
  }
}

const generatedGpt = (id) => {
  const entry = gptManifest?.agents?.find((agent) => agent.id === id);
  return entry && exists(path.join("gpts", entry.output))
    ? read(path.join("gpts", entry.output))
    : "";
};

requirePatterns("GPT matt", generatedGpt("matt"), [
  ["routing-only boundary", /front door.*produce a routing envelope, and stop/is],
  ["read-only boundary", /Matt is read-only/i],
  ["Codex execution ownership", /Implementation, diagnosis, correction, and integration remain Codex-owned/i],
  ["Grill With Docs routing", /goes to \*\*Grill With Docs\*\*/i],
]);

requirePatterns("GPT grill-with-docs", generatedGpt("grill-with-docs"), [
  ["one-question interview", /Ask exactly one substantive question at a time/i],
  ["domain glossary capture", /update `CONTEXT\.md` only for durable domain terminology/i],
  ["ADR threshold", /hard to reverse, surprising without context, and the result of a real trade-off/i],
  ["Planner handoff", /goes to \*\*Engineering Planner\*\*/i],
  ["no specification publishing", /may not publish the final specification/i],
]);

requirePatterns("GPT engineering-planner", generatedGpt("engineering-planner"), [
  ["specify/ticket modes", /Specify.*Ticket/is],
  ["ticket approval checkpoint", /Publish only after approval/i],
  ["no implementation boundary", /may not implement production code/i],
  ["Grill With Docs escalation", /Route to \*\*Grill With Docs\*\*/i],
  ["Wayfinder escalation", /Route to \*\*Wayfinder\*\*/i],
]);

requirePatterns("GPT wayfinder", generatedGpt("wayfinder"), [
  ["one decision ticket per session", /Never resolve more than one non-research decision ticket in a session/i],
  ["map as Workstream root", /canonical map.*Workstream root/is],
  ["handoff to planner", /hand off the map to \*\*Engineering Planner\*\*/i],
  ["no implementation deliverables", /produces decisions, not implementation deliverables/i],
]);

requirePatterns("GPT code-reviewer", generatedGpt("code-reviewer"), [
  ["focused mode", /Focused mode/i],
  ["delegated worker mode", /Delegated worker mode/i],
  ["lease stop condition", /missing or inconsistent lease is a stop condition/i],
  ["child-only write surface", /assigned child Issue only/i],
  ["no code mutation", /without modifying code/i],
]);

requirePatterns("GPT review-composer", generatedGpt("review-composer"), [
  ["compose phase", /\*\*Compose\*\*/i],
  ["synthesize phase", /\*\*Synthesize\*\*/i],
  ["coverage matrix", /coverage matrix/i],
  ["native hierarchy", /native direct child of the Workstream root/i],
  ["no production code mutation", /Never modify production code/i],
]);

requirePatterns("GPT triage-operator", generatedGpt("triage-operator"), [
  ["recommend before mutation", /Present the recommendation and evidence before mutation/i],
  ["no implementation claim", /must not edit production code, claim implementation/i],
  ["Codex diagnosis route", /configured Codex diagnosis flow/i],
  ["agent brief outcome", /publish a durable agent brief/i],
]);

const projectTemplate = read("gpts/project/instructions.template.md");
requirePatterns("GPT Project template", projectTemplate, [
  ["repository routing", /repository: <owner\/repository>/i],
  ["workspace routing", /workspace: <absolute-or-home-relative-workspace-path>/i],
  ["Workstream routing", /workstream_root:/i],
  ["Grill With Docs routing", /idea_sharpening: "@Grill With Docs"/i],
  ["Planner routing", /specification_and_ticketing: "@Engineering Planner"/i],
  ["dynamic-state prohibition", /Do not store current HEAD, fixed point, active artifact/i],
  ["Codex execution route", /implementation_diagnosis_correction_integration: "Codex"/i],
]);

for (const requiredPath of [
  "gpts/README.md",
  "gpts/smoke-tests.md",
  "gpts/project/instructions.template.md",
  "scripts/generate-gpt-instructions.mjs",
]) {
  if (!exists(requiredPath)) errors.push(`GPT packaging: missing ${requiredPath}`);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${skills.length} skills, promoted manifests, docs coverage, Workstream hooks, and ${expectedGptIds.length} GPT packages.`,
);
