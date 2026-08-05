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
  "chatgpt-project",
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

const reviewSynthesizer = skills.find((skill) => skill.name === "review-synthesizer");
if (!reviewSynthesizer) {
  errors.push("review-synthesizer: promoted skill is missing");
} else if (reviewSynthesizer.userInvoked) {
  errors.push("review-synthesizer: must remain model-invoked so completed review swarms can hand off to it");
}

const workstreamBootstrap = skills.find((skill) => skill.name === "workstream-bootstrap");
if (!workstreamBootstrap) {
  errors.push("workstream-bootstrap: promoted skill is missing");
} else if (!workstreamBootstrap.userInvoked) {
  errors.push("workstream-bootstrap: must remain user-invoked so durable provisioning requires an explicit human command");
}

for (const name of [
  "ask-matt",
  "grill-with-docs",
  "workstream-bootstrap",
  "to-spec",
  "to-tickets",
  "implement",
  "review-composer",
  "review-synthesizer",
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
  ["sanitized marker warning", /issue_read.*not proof that the marker is absent/is],
  ["raw-preserving exact issue verification", /raw-preserving GitHub issue search[\s\S]*exact expected issue number/i],
  ["launch marker rejection", /review-composer-launch:v1[\s\S]*not.*substitute/is],
]);

const toSpecSkill = read("skills/engineering/to-spec/SKILL.md");
requirePatterns("to-spec", toSpecSkill, [
  ["delivery context confirmation gate", /one explicit confirmation gate.*delivery context.*testing seams/is],
  ["delivery context product stage", /Product stage.*pre-usable.*internal-alpha.*beta.*production/is],
  ["delivery context release boundary", /Current objective[\s\S]*Critical user journeys[\s\S]*Release gate[\s\S]*Operating envelope[\s\S]*Explicit non-goals/i],
  ["no static delivery state", /Keep current values in the specification, not in static project instructions/i],
]);

const workstreamBootstrapSkill = read("skills/engineering/workstream-bootstrap/SKILL.md");
requirePatterns("workstream-bootstrap", workstreamBootstrapSkill, [
  ["Codex operator profile", /Codex-owned flow by default/i],
  ["native and gh transport", /native filesystem[\s\S]*authenticated `gh` CLI/i],
  ["bootstrap checkout boundary", /current directory is exactly the configured bootstrap checkout/i],
  ["explicit state machine", /PREFLIGHT[\s\S]*AWAIT_CONFIRMATION[\s\S]*PROVISION[\s\S]*GENERATE_CHATGPT_HANDOFF/i],
  ["durable objective before naming", /Durable objective[\s\S]*Completion conditions[\s\S]*Name and slug/i],
  ["one question interview", /Ask one question at a time/i],
  ["full confirmation packet", /Create this Workstream with the configuration above\?/i],
  ["tracking ensure provisioning", /workstream-tracking` with operation `ensure`/i],
  ["unassigned bootstrap result", /Operator: `Unassigned`[\s\S]*Activity: `Unassigned`/i],
  ["project instructions output", /ChatGPT Project instructions[\s\S]*no placeholders/i],
  ["no dynamic project state", /Do not insert dynamic execution state such as current HEAD/i],
  ["no destructive repair", /Never overwrite a non-empty path[\s\S]*delete a worktree/i],
]);

const reviewComposerSkill = read("skills/engineering/review-composer/SKILL.md");
requirePatterns("review-composer", reviewComposerSkill, [
  ["compose phase", /## Compose/i],
  ["coverage matrix", /coverage matrix/i],
  ["ChatGPT Web operator profile", /ChatGPT Web-owned flow by default/i],
  ["native Workstream parent hierarchy", /composer parent.*native direct sub-issue of the Workstream root/is],
  ["native child hierarchy", /child.*native direct child of the composer parent/is],
  ["synthesizer handoff", /name `?\/review-synthesizer`? as the next agent/i],
  ["compose-only boundary", /does not synthesize findings, issue a verdict, create corrective work/i],
  ["no silent native hierarchy fallback", /Body links are not a substitute for native hierarchy/i],
  ["frozen delivery context", /frozen Delivery Context snapshot/i],
  ["no repeated delivery confirmation", /Do not ask the user to confirm that context again/i],
  ["review evidence is not priority", /technical severity separate from delivery priority/i],
  ["visible composer protocol", /visible protocol line[\s\S]*review-composer:v1/i],
  ["visible delegated lease protocol", /Protocol: `<!-- delegated-review-lease:v1 -->`/i],
]);

const reviewSynthesizerSkill = read("skills/engineering/review-synthesizer/SKILL.md");
requirePatterns("review-synthesizer", reviewSynthesizerSkill, [
  ["ChatGPT Web operator profile", /ChatGPT Web-owned flow by default/i],
  ["explicit state machine", /COLLECT[\s\S]*AWAIT_HUMAN_EVALUATION[\s\S]*MATERIALIZE[\s\S]*HANDOFF/i],
  ["stable finding ids", /F-001/i],
  ["human approval gate", /Never skip the human evaluation gate/i],
  ["approved disposition set", /fix-now[\s\S]*defer[\s\S]*diagnose[\s\S]*verify[\s\S]*reject/i],
  ["correction boundary grouping", /Group `fix-now` findings by coherent correction boundary/i],
  ["deferred ledger", /Deferred and resolved-out findings ledger/i],
  ["root-level follow-up hierarchy", /native direct child of the Workstream root/i],
  ["exact Codex implementer handoff", /route to the configured Codex Implementer/i],
  ["upstream delivery confirmation authority", /upstream specification confirmation is authoritative/i],
  ["severity disposition separation", /severity.*does not determine delivery priority or disposition/i],
  ["product-aware finding fields", /evidence level[\s\S]*user exposure[\s\S]*likelihood[\s\S]*release relevance/i],
  ["rare risk deferral", /defer.*low-likelihood.*theoretical risks outside the confirmed operating envelope/is],
  ["materialization approval guards", /Before any GitHub write that creates follow-up work.*approval guards/is],
  ["product evaluation verdict", /PRODUCT_EVALUATION_READY/],
]);

const workstreamTrackingSkill = read("skills/engineering/workstream-tracking/SKILL.md");
requirePatterns("workstream-tracking", workstreamTrackingSkill, [
  ["review-composition activity", /review-composition/],
  ["delegated-review activity", /delegated-review/],
  ["review-synthesis activity", /review-synthesis/],
  ["delegated review lease", /Delegated review leases/i],
  ["non-overlapping write surfaces", /non-overlapping child-Issue write surfaces/i],
  ["composer composition authority", /Review Composer is the sole writer during composition/i],
  ["synthesizer synthesis authority", /Review Synthesizer becomes the sole writer during `review-synthesis`/i],
  ["corrective issues outside composer", /corrective and diagnosis Issues are native direct sub-issues of the Workstream root/i],
  ["bootstrap ensure exception", /caller is `?\/workstream-bootstrap`?[\s\S]*without first taking a Workstream claim/is],
  ["bootstrap result unassigned", /leave operator and activity as `Unassigned`/i],
  ["marker transport compatibility", /Marker transport compatibility/i],
  ["sanitized detail is not absence", /missing hidden marker.*not sufficient evidence/is],
  ["exact raw marker issue match", /raw-preserving Issue search[\s\S]*exact expected Issue number/i],
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
  ["completed swarm routing", /required children are complete.*`\/review-synthesizer`/i],
  ["focused review routing", /Focused PR.*`\/code-review`/i],
  ["unknown-cause bug routing", /cause is still unclear.*`\/diagnosing-bugs`/i],
  ["new Workstream routing", /New durable multi-session objective.*`\/workstream-bootstrap`/i],
]);

const workstreamTemplate = read("skills/engineering/setup-matt-pocock-skills/workstreams.md");
requirePatterns("Workstream setup template", workstreamTemplate, [
  ["bootstrap checkout", /Bootstrap checkout:/i],
  ["bootstrap folder slug invariant", /basename of every generated Workstream worktree must equal its canonical slug/i],
  ["bootstrap result unassigned", /newly bootstrapped root.*`Unassigned`/is],
  ["review hierarchy", /Review swarm hierarchy/i],
  ["delegated review leases", /Delegated review leases/i],
  ["composer Project placement", /add the active Review Composer parent/i],
  ["review children outside Project", /do not add review children by default/i],
  ["corrective issues outside composer", /must not be children of the composer/i],
]);

if (!exists("docs/engineering/review-composer.md")) {
  errors.push("review-composer: missing docs/engineering/review-composer.md");
}

const projectTemplate = read("chatgpt-project/instructions.template.md");
requirePatterns("ChatGPT Project skill template", projectTemplate, [
  ["repository identity", /repository: <owner\/repository>/i],
  ["workspace identity", /workspace: <absolute-or-home-relative-project-workspace-path>/i],
  ["Workstream slug identity", /workstream_slug: <workstream-slug-or-null>/i],
  ["required skill runtime", /required: true/i],
  ["default Ask Matt router", /default_router: "\/ask-matt"/i],
  ["open project workspace first", /Open `project\.workspace` with `@devspace`/i],
  ["catalog source of truth", /skills` catalog returned by that `open_workspace` call as the only available skill registry/i],
  ["exact catalog skill selection", /catalog entry whose `name` exactly equals/i],
  ["advertised skill read through devspace", /Read the complete advertised `SKILL\.md` through `@devspace` using the same project `workspaceId`/i],
  ["no separate skill workspace", /Do not open a second workspace for `~\/\.agents\/skills`/i],
  ["no path construction", /Do not construct, infer, search for, or normalize skill paths/i],
  ["no execution from memory", /Do not execute from memory/i],
  ["observable skill receipt", /Loaded skill: <exact advertised SKILL\.md path>/i],
  ["dynamic-state prohibition", /Do not store current HEAD.*active artifact/i],
]);

const bootstrapProjectTemplate = read(
  "skills/engineering/workstream-bootstrap/project-instructions.template.md",
);
if (bootstrapProjectTemplate !== projectTemplate) {
  errors.push("workstream-bootstrap: bundled Project instructions template must match chatgpt-project/instructions.template.md exactly");
}

for (const requiredPath of [
  "chatgpt-project/README.md",
  "chatgpt-project/smoke-tests.md",
  "chatgpt-project/instructions.template.md",
  "skills/engineering/workstream-bootstrap/project-instructions.template.md",
]) {
  if (!exists(requiredPath)) errors.push(`ChatGPT Project runtime: missing ${requiredPath}`);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${skills.length} skills, promoted manifests, docs coverage, Workstream hooks, and ChatGPT Project skill runtime.`,
);
