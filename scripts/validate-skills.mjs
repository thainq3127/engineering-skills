import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8").replaceAll("\r\n", "\n");

const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

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

for (const name of [
  "ask-matt",
  "grill-with-docs",
  "to-spec",
  "to-tickets",
  "implement",
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

if (errors.length > 0) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${skills.length} skills, promoted manifests, docs coverage, invocation parity, and Workstream hooks.`,
);
