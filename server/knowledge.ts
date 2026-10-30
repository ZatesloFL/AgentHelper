import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import { config } from './config.js';
import { PRODUCTS, getEnabledProducts, getProductById } from './products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export interface KnowledgeTagCounts {
  SEEN: number;
  DOC: number;
  SAID: number;
  WEB: number;
  INFERRED: number;
  UNKNOWN: number;
  NIC: number;
}

export interface KnowledgeInfo {
  product: string;
  title: string;
  filePath: string;
  lastChecked: string;
  daysOld: number;
  isStale: boolean; // > 14 days old
  tagCounts: KnowledgeTagCounts;
  fileTagCounts: KnowledgeTagCounts;
  playbookTagCounts: KnowledgeTagCounts;
  content: string;
  playbookTitle: string;
  playbookFilePath: string;
  playbookLastChecked: string;
  playbookContent: string;
}

export type RoutineType = 'setup' | 'project' | 'checkup' | 'support';
export type VerifyMethod = 'user' | 'screen' | 'either';

export interface GuidedAppStep {
  number: number;
  title: string;
  coach: string;
  done_when: string;
  verify: VerifyMethod;
  where?: string;
  why?: string;
  if_stuck?: string;
  safety?: string;
  area?: string;
  rating?: string;
  // Backward compatibility with stored conversations
  coachPrompt?: string;
  detail: string;
}

export interface GuidedAppContract {
  goal?: string;
  do?: string;
  do_not?: string;
  ask_me_before?: string;
  report_back?: string;
  stop_if?: string;
}

export interface GuidedAppLadderRung {
  rung: number;
  name: string;
  text: string;
}

export interface GuidedAppFinish {
  summarize?: string;
  save_note?: string;
  save_contract?: string;
  save_scorecard?: string;
  next?: string;
}

export interface GuidedAppInfo {
  id: string;
  product: string;
  title: string;
  type: RoutineType;
  order: number;
  estimated_time: string;
  estimatedTime: string;
  risk: string;
  requires: string[];
  recommended_after: string[];
  summary: string;
  goal: string;
  steps: GuidedAppStep[];
  contract?: GuidedAppContract;
  ladder?: GuidedAppLadderRung[];
  finish?: GuidedAppFinish;
  rawContent: string;
}

export interface RoutineStatePayload {
  activeRoutineId: string | null;
  completedSteps: number[];
  activeStep: number | null;
}

export interface ProgressSummaryPayload {
  done?: string[];
  inProgress?: string[];
  boundariesAndPreferences?: string[];
  openQuestions?: string[];
  suggestedNextStep?: string;
  summary?: string;
  updatedAt?: string;
}

export interface UserToolProfileItem {
  id: string;
  name: string;
  category: string;
  account: 'personal' | 'work';
  sensitive: boolean;
}

export interface ToolsProfilePayload {
  devices?: string[];
  tools?: UserToolProfileItem[];
  other?: string;
  updatedAt?: string;
}

export interface CatalogToolItem {
  id: string;
  name: string;
  support: 'connector' | 'device' | 'custom' | 'browser' | 'reported' | 'unknown';
  evidence: string;
  note?: string;
}

export interface CatalogCategory {
  id: string;
  label: string;
  tools: CatalogToolItem[];
}

export interface ToolsCatalog {
  lastChecked: string;
  supportLevels: Record<string, string>;
  categories: CatalogCategory[];
}

export interface UserProjectPayload {
  projectId: string;
  title?: string;
  rung: number;
  status?: 'active' | 'paused';
  contract: {
    goal?: string;
    do?: string;
    do_not?: string;
    ask_me_before?: string;
    report_back?: string;
    stop_if?: string;
  };
}

export interface LatestAuditPayload {
  appId?: string;
  startedAt?: string;
  completedAt?: string | null;
  results?: Record<string, { rating: 'green' | 'amber' | 'red' | string; reason: string }>;
}

export interface SystemInstructionContext {
  progressSummary?: ProgressSummaryPayload | string | null;
  sessionNotes?: string[];
  routineState?: RoutineStatePayload | null;
  toolsProfile?: ToolsProfilePayload | null;
  userProjects?: UserProjectPayload[] | null;
  latestAudit?: LatestAuditPayload | null;
  recentTranscript?: Array<{ role: string; text: string }>;
  extraContext?: string;
}

export const DEFAULT_LADDER_RUNGS: GuidedAppLadderRung[] = [
  { rung: 0, name: 'Watch', text: 'Reads and reports only.' },
  { rung: 1, name: 'Draft', text: 'Prepares; you act.' },
  { rung: 2, name: 'Act with approval', text: 'Acts after you approve each time.' },
  { rung: 3, name: 'Standing rule', text: 'One narrow action without asking, reviewed weekly.' },
];

const KNOWN_FRONTMATTER_KEYS = new Set([
  'id',
  'title',
  'type',
  'order',
  'estimated_time',
  'risk',
  'requires',
  'recommended_after',
  'summary',
  'goal',
]);

const KNOWN_STEP_KEYS = new Set([
  'coach',
  'done_when',
  'verify',
  'where',
  'why',
  'if_stuck',
  'safety',
  'area',
  'rating',
]);

const KNOWN_CONTRACT_KEYS = new Set([
  'goal',
  'do',
  'do_not',
  'ask_me_before',
  'report_back',
  'stop_if',
]);

const KNOWN_FINISH_KEYS = new Set([
  'summarize',
  'save_note',
  'save_contract',
  'save_scorecard',
  'next',
]);

function stripSurroundingQuotes(val: string): string {
  const trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function countTagOccurrences(text: string, tag: string): number {
  const regex = new RegExp(`\\[[^\\]]*\\b${tag}\\b[^\\]]*\\]`, 'gi');
  return (text.match(regex) || []).length;
}

function buildTagCountsForText(text: string): KnowledgeTagCounts {
  return {
    SEEN: countTagOccurrences(text, 'SEEN'),
    DOC: countTagOccurrences(text, 'DOC'),
    SAID: countTagOccurrences(text, 'SAID'),
    WEB: countTagOccurrences(text, 'WEB'),
    INFERRED: countTagOccurrences(text, 'INFERRED'),
    UNKNOWN: countTagOccurrences(text, 'UNKNOWN'),
    NIC: countTagOccurrences(text, 'NIC'),
  };
}

export function getAvailableProducts(): string[] {
  return getEnabledProducts().map(p => p.id);
}

export function getAllRegisteredProducts(): string[] {
  return PRODUCTS.map(p => p.id);
}

export function getKnowledge(product: string = 'muse'): KnowledgeInfo {
  const registered = getProductById(product);
  const safeId = registered ? registered.id : 'muse';
  const filePath = path.join(rootDir, 'knowledge', `${safeId}.md`);
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf-8');
  } else {
    content = `# ${registered?.name || safeId}\nNo knowledge file found.`;
  }

  const playbookPath = path.join(rootDir, 'knowledge', `${safeId}-playbook.md`);
  const fallbackPlaybookPath = path.join(rootDir, 'knowledge', 'muse-playbook.md');
  let playbookContent = '';
  let resolvedPlaybookRelPath = `knowledge/${safeId}-playbook.md`;
  if (fs.existsSync(playbookPath)) {
    playbookContent = fs.readFileSync(playbookPath, 'utf-8');
  } else if (fs.existsSync(fallbackPlaybookPath)) {
    playbookContent = fs.readFileSync(fallbackPlaybookPath, 'utf-8');
    resolvedPlaybookRelPath = 'knowledge/muse-playbook.md';
  }

  // Extract last checked date
  const match = content.match(/Last checked:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  const lastChecked = match ? match[1] : '2026-10-21';

  const playbookDateMatch = playbookContent.match(/Last checked:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  const playbookLastChecked = playbookDateMatch ? playbookDateMatch[1] : lastChecked;

  const checkedDate = new Date(lastChecked);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - checkedDate.getTime());
  const daysOld = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const isStale = daysOld > 14;

  const combinedText = `${content}\n${playbookContent}`;
  const tagCounts = buildTagCountsForText(combinedText);
  const fileTagCounts = buildTagCountsForText(content);
  const playbookTagCounts = buildTagCountsForText(playbookContent);

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : registered?.name || `${safeId.toUpperCase()}`;

  const playbookTitleMatch = playbookContent.match(/^#\s+(.+)$/m);
  const playbookTitle = playbookTitleMatch
    ? playbookTitleMatch[1].trim()
    : "Nic's Playbook for Personal AI Agents";

  return {
    product: safeId,
    title,
    filePath: `knowledge/${safeId}.md`,
    lastChecked,
    daysOld,
    isStale,
    tagCounts,
    fileTagCounts,
    playbookTagCounts,
    content,
    playbookTitle,
    playbookFilePath: resolvedPlaybookRelPath,
    playbookLastChecked,
    playbookContent,
  };
}

export function getGuidedApps(product: string = 'muse'): GuidedAppInfo[] {
  const registered = getProductById(product);
  if (!registered) return [];
  const safeId = registered.id;
  const appsDir = path.join(rootDir, 'apps', safeId);
  if (!fs.existsSync(appsDir)) return [];

  let files: string[] = [];
  try {
    files = fs.readdirSync(appsDir).filter(f => f.endsWith('.md'));
  } catch (err) {
    console.warn(`Failed to read apps directory for ${safeId}:`, err);
    return [];
  }

  const apps: GuidedAppInfo[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(appsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const fallbackId = file.replace(/\.md$/, '');

      let frontMatter: Record<string, any> = {};
      let bodyContent = content;

      // Parse YAML front matter between --- lines
      const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
      if (fmMatch) {
        try {
          const parsedYaml = YAML.parse(fmMatch[1]);
          if (parsedYaml && typeof parsedYaml === 'object') {
            frontMatter = parsedYaml;
          }
          bodyContent = fmMatch[2] || '';
        } catch (yamlErr: any) {
          console.warn(`Malformed YAML front matter in ${file}:`, yamlErr?.message || yamlErr);
        }
      } else {
        console.warn(`Missing YAML front matter in ${file}; using defaults.`);
      }

      for (const key of Object.keys(frontMatter)) {
        if (!KNOWN_FRONTMATTER_KEYS.has(key)) {
          console.warn(`Unknown front matter key "${key}" in ${file}; ignoring.`);
        }
      }

      const id = typeof frontMatter.id === 'string' && frontMatter.id.trim() ? frontMatter.id.trim() : fallbackId;
      const title =
        typeof frontMatter.title === 'string' && frontMatter.title.trim()
          ? frontMatter.title.trim()
          : id;

      const rawType = typeof frontMatter.type === 'string' ? frontMatter.type.trim().toLowerCase() : 'setup';
      const type: RoutineType =
        rawType === 'setup' || rawType === 'project' || rawType === 'checkup' || rawType === 'support'
          ? rawType
          : 'setup';

      const order = typeof frontMatter.order === 'number' && !Number.isNaN(frontMatter.order)
        ? frontMatter.order
        : 99;

      const estimatedTime =
        typeof frontMatter.estimated_time === 'string' && frontMatter.estimated_time.trim()
          ? frontMatter.estimated_time.trim()
          : '10 minutes';

      const risk =
        typeof frontMatter.risk === 'string' && frontMatter.risk.trim()
          ? frontMatter.risk.trim()
          : 'low';

      const requires = Array.isArray(frontMatter.requires)
        ? frontMatter.requires.map((r: any) => String(r).trim()).filter(Boolean)
        : [];

      const recommended_after = Array.isArray(frontMatter.recommended_after)
        ? frontMatter.recommended_after.map((r: any) => String(r).trim()).filter(Boolean)
        : [];

      const summary =
        typeof frontMatter.summary === 'string' ? frontMatter.summary.trim() : '';
      const goal =
        typeof frontMatter.goal === 'string' ? frontMatter.goal.trim() : summary;

      // Split body by ## headings
      const steps: GuidedAppStep[] = [];
      let contract: GuidedAppContract | undefined = undefined;
      let ladder: GuidedAppLadderRung[] | undefined = undefined;
      let finish: GuidedAppFinish | undefined = undefined;

      const lines = bodyContent.split(/\r?\n/);
      let currentSectionType: 'none' | 'step' | 'contract' | 'ladder' | 'finish' = 'none';
      let currentStepBuilder: Partial<GuidedAppStep> | null = null;

      const flushCurrentStep = () => {
        if (currentStepBuilder && typeof currentStepBuilder.number === 'number') {
          const coach = currentStepBuilder.coach || '';
          const why = currentStepBuilder.why || '';
          const doneWhen = currentStepBuilder.done_when || '';
          steps.push({
            number: currentStepBuilder.number,
            title: currentStepBuilder.title || `Step ${currentStepBuilder.number}`,
            coach,
            done_when: doneWhen,
            verify: currentStepBuilder.verify || 'user',
            where: currentStepBuilder.where,
            why,
            if_stuck: currentStepBuilder.if_stuck,
            safety: currentStepBuilder.safety,
            area: currentStepBuilder.area,
            rating: currentStepBuilder.rating,
            coachPrompt: coach,
            detail: why || doneWhen || coach,
          });
        }
        currentStepBuilder = null;
      };

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        const headingMatch = line.match(/^##\s+(.+)$/);
        if (headingMatch) {
          flushCurrentStep();
          const headingText = headingMatch[1].trim();

          const stepHeadingMatch = headingText.match(/^Step\s+(\d+)\s*:\s*(.+)$/i);
          if (stepHeadingMatch) {
            currentSectionType = 'step';
            currentStepBuilder = {
              number: parseInt(stepHeadingMatch[1], 10),
              title: stepHeadingMatch[2].trim(),
              coach: '',
              done_when: '',
              verify: 'user',
            };
          } else if (/^Contract$/i.test(headingText)) {
            currentSectionType = 'contract';
            if (!contract) contract = {};
          } else if (/^Ladder$/i.test(headingText)) {
            currentSectionType = 'ladder';
            if (!ladder) ladder = [];
          } else if (/^Finish$/i.test(headingText)) {
            currentSectionType = 'finish';
            if (!finish) finish = {};
          } else {
            console.warn(`Unknown section "## ${headingText}" in ${file}; ignoring.`);
            currentSectionType = 'none';
          }
          continue;
        }

        if (!line.startsWith('-')) continue;
        const bulletBody = line.replace(/^-\s*/, '').trim();

        if (currentSectionType === 'step' && currentStepBuilder) {
          const kvMatch = bulletBody.match(/^([a-zA-Z0-9_]+)\s*:\s*(.*)$/);
          if (!kvMatch) {
            console.warn(`Malformed step bullet "${line}" in ${file}; ignoring.`);
            continue;
          }
          const key = kvMatch[1].trim();
          const rawVal = kvMatch[2].trim();

          if (!KNOWN_STEP_KEYS.has(key)) {
            console.warn(`Unknown step key "${key}" in ${file}; ignoring.`);
            continue;
          }

          if (key === 'coach') {
            currentStepBuilder.coach = stripSurroundingQuotes(rawVal);
          } else if (key === 'done_when') {
            currentStepBuilder.done_when = rawVal;
          } else if (key === 'verify') {
            const v = rawVal.toLowerCase();
            if (v === 'user' || v === 'screen' || v === 'either') {
              currentStepBuilder.verify = v;
            } else {
              console.warn(`Unknown verify value "${rawVal}" in ${file}; defaulting to "user".`);
              currentStepBuilder.verify = 'user';
            }
          } else if (key === 'where') {
            currentStepBuilder.where = rawVal;
          } else if (key === 'why') {
            currentStepBuilder.why = rawVal;
          } else if (key === 'if_stuck') {
            currentStepBuilder.if_stuck = rawVal;
          } else if (key === 'safety') {
            currentStepBuilder.safety = rawVal;
          } else if (key === 'area') {
            currentStepBuilder.area = rawVal;
          } else if (key === 'rating') {
            currentStepBuilder.rating = rawVal;
          }
        } else if (currentSectionType === 'contract' && contract) {
          const kvMatch = bulletBody.match(/^([a-zA-Z0-9_]+)\s*:\s*(.*)$/);
          if (!kvMatch) {
            console.warn(`Malformed Contract bullet "${line}" in ${file}; ignoring.`);
            continue;
          }
          const key = kvMatch[1].trim();
          const val = kvMatch[2].trim();
          if (!KNOWN_CONTRACT_KEYS.has(key)) {
            console.warn(`Unknown Contract key "${key}" in ${file}; ignoring.`);
            continue;
          }
          (contract as Record<string, string>)[key] = val;
        } else if (currentSectionType === 'ladder' && ladder) {
          // Format: "- 0 Watch: text" -> { rung: 0, name: "Watch", text }
          const ladderMatch = bulletBody.match(/^(\d+)\s+([^:]+):\s*(.+)$/);
          if (!ladderMatch) {
            console.warn(`Malformed Ladder bullet "${line}" in ${file}; ignoring.`);
            continue;
          }
          ladder.push({
            rung: parseInt(ladderMatch[1], 10),
            name: ladderMatch[2].trim(),
            text: ladderMatch[3].trim(),
          });
        } else if (currentSectionType === 'finish' && finish) {
          const kvMatch = bulletBody.match(/^([a-zA-Z0-9_]+)\s*:\s*(.*)$/);
          if (!kvMatch) {
            console.warn(`Malformed Finish bullet "${line}" in ${file}; ignoring.`);
            continue;
          }
          const key = kvMatch[1].trim();
          const val = kvMatch[2].trim();
          if (!KNOWN_FINISH_KEYS.has(key)) {
            console.warn(`Unknown Finish key "${key}" in ${file}; ignoring.`);
            continue;
          }
          (finish as Record<string, string>)[key] = val;
        }
      }

      flushCurrentStep();

      apps.push({
        id,
        product: safeId,
        title,
        type,
        order,
        estimated_time: estimatedTime,
        estimatedTime,
        risk,
        requires,
        recommended_after,
        summary,
        goal,
        steps,
        contract,
        ladder,
        finish,
        rawContent: content,
      });
    } catch (fileErr: any) {
      console.warn(`Failed to parse routine file ${file}:`, fileErr?.message || fileErr);
    }
  }

  const typePriority: Record<RoutineType, number> = {
    setup: 1,
    project: 2,
    checkup: 3,
    support: 4,
  };

  apps.sort((a, b) => {
    const tpA = typePriority[a.type] ?? 99;
    const tpB = typePriority[b.type] ?? 99;
    if (tpA !== tpB) return tpA - tpB;
    return (a.order ?? 99) - (b.order ?? 99);
  });

  return apps;
}

export function getToolsCatalog(): ToolsCatalog {
  const catalogPath = path.join(rootDir, 'knowledge', 'tools-catalog.json');
  try {
    if (fs.existsSync(catalogPath)) {
      const raw = fs.readFileSync(catalogPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          lastChecked: typeof parsed.lastChecked === 'string' ? parsed.lastChecked : '2026-10-21',
          supportLevels:
            parsed.supportLevels && typeof parsed.supportLevels === 'object'
              ? parsed.supportLevels
              : {},
          categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        };
      }
    }
  } catch (err) {
    console.warn('Failed to read tools-catalog.json:', err);
  }
  return {
    lastChecked: '2026-10-21',
    supportLevels: {},
    categories: [],
  };
}

export function findCatalogTool(idOrName: string): {
  tool: CatalogToolItem;
  category: CatalogCategory;
} | null {
  if (!idOrName || typeof idOrName !== 'string') return null;
  const queryStr = idOrName.trim().toLowerCase();
  if (!queryStr) return null;

  const catalog = getToolsCatalog();
  for (const cat of catalog.categories) {
    for (const tool of cat.tools || []) {
      if (
        tool.id.toLowerCase() === queryStr ||
        tool.name.toLowerCase() === queryStr ||
        tool.name.toLowerCase().includes(queryStr)
      ) {
        return { tool, category: cat };
      }
    }
  }
  return null;
}

export function normalizeDeviceName(raw: string): string | null {
  const v = String(raw || '').trim().toLowerCase();
  if (!v) return null;
  if (v === 'website' || v === 'web' || v === 'browser' || v === 'muse.ai' || v === 'computer') {
    return 'Website';
  }
  if (v === 'iphone' || v === 'ios' || v === 'ipad') {
    return 'iPhone';
  }
  if (v === 'android' || v === 'android phone') {
    return 'Android';
  }
  if (v === 'mac app' || v === 'mac' || v === 'macos' || v === 'desktop app') {
    return 'Mac app';
  }
  if (v === 'whatsapp') {
    return 'WhatsApp';
  }
  return null;
}

export function formatToolsProfileSection(toolsProfile?: ToolsProfilePayload | null): string {
  const catalog = getToolsCatalog();
  const devices = Array.isArray(toolsProfile?.devices)
    ? toolsProfile!.devices.filter(d => typeof d === 'string' && d.trim())
    : [];
  const tools = Array.isArray(toolsProfile?.tools) ? toolsProfile!.tools : [];
  const other = typeof toolsProfile?.other === 'string' ? toolsProfile.other.trim() : '';

  if (devices.length === 0 && tools.length === 0 && !other) {
    return `User's Tools Profile ("Your tools"): Not filled in yet.`;
  }

  const lines: string[] = [`User's Tools Profile ("Your tools"):`];
  if (devices.length > 0) {
    lines.push(`- Devices: ${devices.join(', ')}`);
  } else {
    lines.push(`- Devices: Not specified yet`);
  }

  if (tools.length > 0) {
    lines.push(`- Tools selected:`);
    for (const item of tools) {
      const matched = findCatalogTool(item.id);
      const supportCode = matched?.tool.support || 'unknown';
      const supportExplanation =
        catalog.supportLevels[supportCode] || 'Not confirmed either way [UNKNOWN].';
      const evidence = matched?.tool.evidence || 'UNKNOWN';
      const notePart = matched?.tool.note ? ` | Note: ${matched.tool.note}` : '';
      const sensitiveLabel = item.sensitive ? ', sensitive: true' : ', sensitive: false';
      lines.push(
        `  * ${matched?.tool.name || item.name || item.id} (id: "${item.id}", category: ${
          matched?.category.id || item.category || 'other'
        }, account: ${item.account || 'personal'}${sensitiveLabel}) -> support: "${supportCode}" (${supportExplanation}) [evidence: ${evidence}]${notePart}`
      );
    }
  } else {
    lines.push(`- Tools selected: None yet`);
  }

  if (other) {
    lines.push(`- Other tools (unlisted): ${other.slice(0, 300)} (support: "unknown" [UNKNOWN])`);
  }

  return lines.join('\n');
}

export function formatUserProjectsSection(
  product: string,
  userProjects?: UserProjectPayload[] | null
): string {
  const activeProjects = (Array.isArray(userProjects) ? userProjects : []).filter(
    p => p && typeof p.projectId === 'string' && p.projectId.trim() && p.status !== 'paused'
  );

  if (activeProjects.length === 0) {
    return `User's Active Projects ("My projects"): None saved yet.`;
  }

  const guidedApps = getGuidedApps(product);
  const lines: string[] = [`User's Active Projects ("My projects"):`];

  for (const proj of activeProjects) {
    const matchedApp = guidedApps.find(a => a.id === proj.projectId);
    const title = proj.title?.trim() || matchedApp?.title || proj.projectId;
    const rungNum = Number.isFinite(Number(proj.rung)) ? Math.max(0, Math.min(3, Math.round(Number(proj.rung)))) : 0;
    const ladder = matchedApp?.ladder && matchedApp.ladder.length > 0 ? matchedApp.ladder : DEFAULT_LADDER_RUNGS;
    const rungEntry = ladder.find(r => r.rung === rungNum) || DEFAULT_LADDER_RUNGS[rungNum] || DEFAULT_LADDER_RUNGS[0];
    const goalSummary = (proj.contract?.goal || '').trim() || matchedApp?.summary || 'No goal recorded';
    const doSummary = (proj.contract?.do || '').trim();
    const doNotSummary = (proj.contract?.do_not || '').trim();
    const oneLineSummary = [
      `Goal: ${goalSummary}`,
      doSummary ? `Do: ${doSummary}` : '',
      doNotSummary ? `Do not: ${doNotSummary}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    lines.push(
      `- Project "${title}" (project_id: "${proj.projectId}") | Current Rung: ${rungNum} (${rungEntry.name}: ${rungEntry.text}) | Contract summary: ${oneLineSummary}`
    );
  }

  return lines.join('\n');
}

export function formatLatestAuditSection(latestAudit?: LatestAuditPayload | null): string {
  if (!latestAudit || !latestAudit.results || Object.keys(latestAudit.results).length === 0) {
    return `Previous Check-up Scorecard: No previous check-up recorded yet.`;
  }

  const completedDate = latestAudit.completedAt || latestAudit.startedAt || 'earlier';
  const lines: string[] = [
    `Previous Check-up Scorecard (from ${completedDate}, routine: "${latestAudit.appId || 'safety-audit'}"):`,
  ];
  for (const [area, entry] of Object.entries(latestAudit.results)) {
    if (!entry) continue;
    lines.push(`- ${area}: ${entry.rating} — ${entry.reason || 'no reason noted'}`);
  }
  return lines.join('\n');
}

export function formatRoutineStateSection(product: string, routineState?: RoutineStatePayload | null): string {
  if (!routineState || !routineState.activeRoutineId) {
    return 'Current Routine State: None active.';
  }

  const guidedApps = getGuidedApps(product);
  const matchedApp = guidedApps.find(a => a.id === routineState.activeRoutineId);
  const completedSteps = Array.isArray(routineState.completedSteps) ? routineState.completedSteps : [];
  const activeStepNum = routineState.activeStep ?? null;

  if (!matchedApp) {
    return `Current Routine State:
- Active Routine ID: "${routineState.activeRoutineId}"
- Completed Steps: ${completedSteps.length > 0 ? completedSteps.join(', ') : 'none yet'}
- Active Step: ${activeStepNum ?? 'none'}`;
  }

  const activeStepObj = matchedApp.steps.find(s => s.number === activeStepNum);
  const nextStepNum = activeStepNum ? activeStepNum + 1 : null;
  const hasNextStep = nextStepNum ? matchedApp.steps.some(s => s.number === nextStepNum) : false;

  return `Current Routine State (ACTIVE IN UI — do NOT call launch_app again for "${matchedApp.id}"):
- Active Routine ID: "${matchedApp.id}" ("${matchedApp.title}")
- Completed Steps: [${completedSteps.join(', ')}] (${completedSteps.length}/${matchedApp.steps.length} done)
- Active Step Now: ${
    activeStepObj
      ? `Step ${activeStepObj.number}: "${activeStepObj.title}"
  - coach: "${activeStepObj.coach}"
  - done_when: ${activeStepObj.done_when}
  - verify: ${activeStepObj.verify}${activeStepObj.where ? `\n  - where: ${activeStepObj.where}` : ''}${
          activeStepObj.why ? `\n  - why: ${activeStepObj.why}` : ''
        }${activeStepObj.if_stuck ? `\n  - if_stuck: ${activeStepObj.if_stuck}` : ''}${
          activeStepObj.safety ? `\n  - safety: ${activeStepObj.safety}` : ''
        }${activeStepObj.area ? `\n  - area: ${activeStepObj.area}` : ''}${
          activeStepObj.rating ? `\n  - rating: ${activeStepObj.rating}` : ''
        }`
      : activeStepNum ?? 'All steps completed'
  }
- Coaching Reminder: Only call confirm_step (with app_id="${matchedApp.id}", step=${activeStepNum ?? 1}, evidence="screen"|"user", note="...") when Step ${activeStepNum ?? 1}'s done_when is met.${
    activeStepObj?.area
      ? ` Because this check-up step covers area "${activeStepObj.area}", also call record_audit_result({ app_id: "${matchedApp.id}", area: "${activeStepObj.area}", rating: "green"|"amber"|"red", reason: "..." }) using the step's rating guide.`
      : ''
  }${hasNextStep ? ` After confirming, ask Step ${nextStepNum}'s coach question.` : ''}`;
}

function formatEarlierSessionMemorySection(
  product: string,
  ctx?: SystemInstructionContext | string
): string {
  const contextObj: SystemInstructionContext =
    typeof ctx === 'string' ? { extraContext: ctx } : ctx || {};

  const parts: string[] = [];

  // 1. User's Tools Profile ("Your tools") with catalog support level & evidence
  parts.push(formatToolsProfileSection(contextObj.toolsProfile));

  // 2. User's Active Projects ("My projects")
  parts.push(formatUserProjectsSection(product, contextObj.userProjects));

  // 3. Previous Check-up Audit Results (so the guide can say what changed during check-ups and check for red areas)
  parts.push(formatLatestAuditSection(contextObj.latestAudit));

  // 4. Progress Summary
  const ps = contextObj.progressSummary;
  if (typeof ps === 'string' && ps.trim()) {
    parts.push(`Progress Summary:\n${ps.trim().slice(0, 1500)}`);
  } else if (ps && typeof ps === 'object') {
    const summaryLines: string[] = [];
    if (ps.summary && ps.summary.trim()) {
      summaryLines.push(`Summary: ${ps.summary.trim().slice(0, 1200)}`);
    }
    if (Array.isArray(ps.done) && ps.done.length > 0) {
      summaryLines.push(`Done: ${ps.done.slice(0, 15).join('; ')}`);
    }
    if (Array.isArray(ps.inProgress) && ps.inProgress.length > 0) {
      summaryLines.push(`In Progress: ${ps.inProgress.slice(0, 15).join('; ')}`);
    }
    if (Array.isArray(ps.boundariesAndPreferences) && ps.boundariesAndPreferences.length > 0) {
      summaryLines.push(`Boundaries & Preferences: ${ps.boundariesAndPreferences.slice(0, 15).join('; ')}`);
    }
    if (Array.isArray(ps.openQuestions) && ps.openQuestions.length > 0) {
      summaryLines.push(`Open Questions: ${ps.openQuestions.slice(0, 15).join('; ')}`);
    }
    if (ps.suggestedNextStep && ps.suggestedNextStep.trim()) {
      summaryLines.push(`Suggested Next Step: ${ps.suggestedNextStep.trim().slice(0, 400)}`);
    }
    if (summaryLines.length > 0) {
      parts.push(`Progress Summary:\n${summaryLines.join('\n')}`);
    }
  }

  // 5. Active Session Notes
  if (Array.isArray(contextObj.sessionNotes) && contextObj.sessionNotes.length > 0) {
    const formattedNotes = contextObj.sessionNotes
      .filter(n => typeof n === 'string' && n.trim())
      .slice(0, 20)
      .map(n => `- ${n.trim().slice(0, 500)}`)
      .join('\n');
    if (formattedNotes) {
      parts.push(`Active Session Notes:\n${formattedNotes}`);
    }
  }

  // 6. Extra context string if provided
  if (contextObj.extraContext && contextObj.extraContext.trim()) {
    parts.push(contextObj.extraContext.trim().slice(0, 2000));
  }

  // 7. Current Routine State
  parts.push(formatRoutineStateSection(product, contextObj.routineState));

  // 8. Recent Conversation Transcript Turns (up to last 20 turns, used for session continuity / fresh voice reconnect)
  if (Array.isArray(contextObj.recentTranscript) && contextObj.recentTranscript.length > 0) {
    const formattedTurns = contextObj.recentTranscript
      .slice(-20)
      .filter(t => t && typeof t.text === 'string' && t.text.trim())
      .map(t => {
        const roleLabel =
          t.role === 'user' ? 'User' : t.role === 'guide' || t.role === 'model' ? 'Guide' : 'System';
        return `${roleLabel}: ${t.text.trim().slice(0, 600)}`;
      })
      .join('\n');
    if (formattedTurns) {
      parts.push(`Recent Conversation Turns (last 20 turns):\n${formattedTurns}`);
    }
  }

  const body =
    parts.length > 0
      ? parts.join('\n\n')
      : 'No earlier session notes or active routine state recorded yet.';

  return `\nWhat you know from earlier sessions (you wrote this; confirm with the user before relying on it, and trust their screen over it).\n${body}\n`;
}

function formatContractAndLadderLines(app: GuidedAppInfo): string {
  const sections: string[] = [];
  if (app.contract) {
    const contractLines: string[] = [];
    if (app.contract.goal) contractLines.push(`    - goal: ${app.contract.goal}`);
    if (app.contract.do) contractLines.push(`    - do: ${app.contract.do}`);
    if (app.contract.do_not) contractLines.push(`    - do_not: ${app.contract.do_not}`);
    if (app.contract.ask_me_before) contractLines.push(`    - ask_me_before: ${app.contract.ask_me_before}`);
    if (app.contract.report_back) contractLines.push(`    - report_back: ${app.contract.report_back}`);
    if (app.contract.stop_if) contractLines.push(`    - stop_if: ${app.contract.stop_if}`);
    if (contractLines.length > 0) {
      sections.push(`  Contract:\n${contractLines.join('\n')}`);
    }
  }
  if (app.ladder && app.ladder.length > 0) {
    const ladderLines = app.ladder.map(r => `    - ${r.rung} ${r.name}: ${r.text}`);
    sections.push(`  Ladder:\n${ladderLines.join('\n')}`);
  }
  return sections.length > 0 ? `\n${sections.join('\n')}` : '';
}

/**
 * Formats the routine list for the system prompt:
 * - Only includes full step details (title, coach, done_when, verify, where, etc.) for the routine that is currently active.
 * - For all other routines, includes id, title, type, summary, step titles, and (for project routines) Contract and Ladder definitions.
 */
function formatRoutinesForSystemPrompt(
  guidedApps: GuidedAppInfo[],
  activeRoutineId?: string | null
): string {
  return guidedApps
    .map(app => {
      const isActive = Boolean(activeRoutineId && app.id === activeRoutineId);
      const contractAndLadderBlock = formatContractAndLadderLines(app);

      if (isActive) {
        const stepLines = app.steps
          .map(s => {
            const parts = [
              `  - Step ${s.number}: ${s.title}`,
              `    - coach: "${s.coach}"`,
              `    - done_when: ${s.done_when}`,
              `    - verify: ${s.verify}`,
            ];
            if (s.where) parts.push(`    - where: ${s.where}`);
            if (s.why) parts.push(`    - why: ${s.why}`);
            if (s.if_stuck) parts.push(`    - if_stuck: ${s.if_stuck}`);
            if (s.safety) parts.push(`    - safety: ${s.safety}`);
            if (s.area) parts.push(`    - area: ${s.area}`);
            if (s.rating) parts.push(`    - rating: ${s.rating}`);
            return parts.join('\n');
          })
          .join('\n');

        const finishLines: string[] = [];
        if (app.finish) {
          if (app.finish.summarize) finishLines.push(`    - summarize: ${app.finish.summarize}`);
          if (app.finish.save_note) finishLines.push(`    - save_note: ${app.finish.save_note}`);
          if (app.finish.save_contract) finishLines.push(`    - save_contract: ${app.finish.save_contract}`);
          if (app.finish.save_scorecard) finishLines.push(`    - save_scorecard: ${app.finish.save_scorecard}`);
          if (app.finish.next) finishLines.push(`    - next: ${app.finish.next}`);
        }

        return `* [ACTIVE ROUTINE] ID: "${app.id}" | Title: "${app.title}" | Type: ${app.type} (~${app.estimated_time})
  Summary: ${app.summary}
  Goal: ${app.goal}
  Steps:
${stepLines}${contractAndLadderBlock}${finishLines.length > 0 ? `\n  Finish:\n${finishLines.join('\n')}` : ''}`;
      }

      const stepTitles = app.steps.map(s => `${s.number}. ${s.title}`).join(', ');
      return `* ID: "${app.id}" | Title: "${app.title}" | Type: ${app.type} | Summary: ${app.summary}
  Step titles: ${stepTitles}${app.type === 'project' ? contractAndLadderBlock : ''}`;
    })
    .join('\n\n');
}

/**
 * Builds the system instruction injecting {{TODAY}}, the user's first name from the verified token,
 * the product display name from the registry, knowledge file content + Nic's playbook,
 * step-by-step interactive guidance rules, and earlier session memory + current routine state.
 */
export function buildSystemInstruction(
  userName: string = 'Friend',
  product: string = 'muse',
  contextOrExtra?: SystemInstructionContext | string
): string {
  const registeredProduct = getProductById(product);
  const productDisplayName = registeredProduct?.name || product;
  const knowledge = getKnowledge(product);
  const guidedApps = getGuidedApps(product);
  const todayStr = new Date().toISOString().split('T')[0];
  const firstName = (userName || 'Friend').trim().split(/\s+/)[0] || 'Friend';

  const contextObj: SystemInstructionContext =
    typeof contextOrExtra === 'string' ? { extraContext: contextOrExtra } : contextOrExtra || {};
  const activeRoutineId = contextObj.routineState?.activeRoutineId || null;

  const workflowsDescription = formatRoutinesForSystemPrompt(guidedApps, activeRoutineId);
  const earlierSessionsSection = formatEarlierSessionMemorySection(product, contextOrExtra);

  const playbookSection = knowledge.playbookContent
    ? `\nNic's playbook (his recommendations, tagged [NIC]):\n${knowledge.playbookContent}\n`
    : '';

  const template = `You are Gus, the guide inside Second Look's member app — an AI, and you say so if asked. (Penny is your teammate at the front door of the website; you are the workshop.) You help people get set up with and stay safe using consumer AI agents, starting with {{PRODUCT_NAME}}. Many of them are nervous, and they are right to be careful. Your job is to make them calmer and more capable, not to sell them anything.
You are speaking with {{FIRST_NAME}}. Use their first name naturally and sparingly.

Style: warm, plain, unhurried. Short sentences. One step at a time. Never more than one instruction per turn. Ask before assuming. Say "I'm not sure" when you are not. Do not pretend to be human. Do not use jargon without a one-line explanation.

How you work:
1. Learn the goal first. Ask what they want the agent to do for them, and how nervous they are about it. Start small.
2. When you can see their screen, say what you see before you tell them what to do ("I can see {{PRODUCT_NAME}}'s Settings page. Is that right?"). Trust what is on screen over your notes. If the screen disagrees with your notes, say so and follow the screen. Note the mismatch with save_session_note AND call report_knowledge_mismatch({ topic, notes_say, screen_shows, device }).
3. Today is {{TODAY}}. Your product notes carry a last-checked date. When you give steps from notes, say "as of {date}" if that date is more than 14 days old, and suggest sharing their screen to confirm.
4. Safety posture to teach and model: least access first. Read-only before send. No payment access at first. Use a separate, low-stakes account while learning. Review connected apps and standing permissions on a schedule. Keep a human approval step before anything that sends, buys, deletes, or shares. Explain the tradeoff, then let them choose.
5. Never ask for, repeat, or read out passwords, API keys, card numbers, government IDs, or one-time codes. If one appears on their screen, tell them to hide or close it and do not mention its contents.
6. You only guide. You never control their screen or accounts. You do not give legal, financial, or medical advice.
7. Your notes tag each claim: [SEEN] seen on a real screen, [DOC] Muse's own documentation, [SAID] the Muse agent said it, [WEB] third-party reporting, [INFERRED] a guess, [UNKNOWN] not observed, [NIC] Nic's recommendation. Never present [SAID], [INFERRED], or [UNKNOWN] as fact. When you use a [NIC] item, say 'Nic recommends…'. When the user's screen disagrees with your notes, trust the screen, say so, and call both save_session_note and report_knowledge_mismatch({ topic, notes_say, screen_shows, device }).
8. If you don't know which device the user is on (web, iPhone, Android, Mac app, WhatsApp), ask before giving directions. Menus differ.
9. Tools profile ("Your tools") rules:
   - Recommend projects that fit the user's tools.
   - For any tool marked work, remind the user to check their employer's policy before connecting it, and offer a report to Nic.
   - For tools with support 'unknown', 'custom', or 'browser', explain the tradeoff plainly and don't promise it works.
   - For tools marked sensitive, recommend read-only and Background sync set to Deny.
   - When the user mentions a tool they use in chat (e.g., "I use Outlook for work") or names their device (such as in Getting Started step 1), call update_tools_profile to save it to their tools profile. After Getting Started finishes, offer to help them fill in or review "Your tools" next.
10. Projects, task contracts, and the autonomy ladder:
   - At the end of a project routine (when Finish includes save_contract), call save_task_contract({ project_id, goal, do, do_not, ask_me_before, report_back, stop_if, rung }) with the six fields pre-filled from the routine's Contract section, replacing {placeholders} with what the user said.
   - When a user asks to move a project up a rung, check that the current rung has been working smoothly for about a week and that their last check-up has no red areas. Recommend, but let them decide.
   - When a user asks to move a project up or down a rung, walk through what the new rung means using the routine's Ladder text and the playbook's ladder rules. Update the rung with save_task_contract only after the user confirms they've changed the matching settings in Muse.
   - Never let a project with "purchases", "public posts", or "send to others" in its Do list go past rung 2. Explain why.
11. Check-ups and scorecards:
   - Check-up routine steps (safety-audit, weekly-review) have area and rating guides. After each such step, call record_audit_result({ app_id, area, rating: "green" | "amber" | "red", reason }) using the step's rating text to choose, in addition to confirm_step.
   - Use the previous check-up scorecard results in your context to tell the user what changed since their last check-up (better, same, or worse).
12. Incident help:
   - If the user says Muse did something they didn't expect (sent, bought, posted, deleted, or changed something), stay calm, offer the 'Something Unexpected Happened' routine right away (launch_app with app_id="something-went-wrong"), and lead with stopping it first.
13. Screen freshness: your view of their screen arrives as frames that can lag behind the conversation. When the user asks about something on screen, answer only from frames you have actually received. If you have not received a clear recent frame, say "Let me take a look" and wait for one instead of answering from memory or your notes. Never describe screen contents you have not seen. Exception: when the user announces they have finished a step, review it under rule 14 from their word plus the latest frame instead of waiting for a new frame.
14. Be proactive about the work, not just the screen: when screen sharing is active, do not wait to be asked. If you notice something relevant to the routine, step, or goal they are working on — they opened a new page for the next step, they look stuck on a step, something looks wrong, or they have left the app or the steps — say so in ONE short sentence naming the step and offering the next action ("I can see you've opened the Settings page. Want me to walk through it?"). If they have left the work, say so plainly and ask whether they want to turn off now and resume later (call end_voice_and_screen_share only if they choose that) or wait while they finish something quick (call pause_proactive_prompts if they choose that). If no routine is active, what they are doing in the product app itself is the work: say what you see and ask what they are trying to do, rather than staying silent for lack of a step to name. Only stay silent if a screen change is clearly unrelated to the product and their work. During a guided routine, you are watching between turns like a friend looking over their shoulder: when a step looks done, stuck, or off-track on screen, speak up without waiting to be asked — do not sit silent through a whole settings or permissions step until the user prompts you. Screen lag — say it once, then let the user drive: the first time you speak while guiding a routine with screen sharing active, say in ONE short sentence that your view of their screen can lag behind their taps, and ask them to tell you when they have clicked or finished something so you can review it right away. Say this once per routine, not every turn. When the user tells you they have done something, review it promptly against the current step from what they said plus the latest frame you have — do not wait for a new frame to prove it, and do not make them repeat themselves while you wait. Their word counts as evidence for confirm_step (evidence="user") when it matches the step's done_when. When a voice session starts, greet the user warmly by voice first — do not wait for them to speak. If you have not heard from them for a while, the server will prompt you to check in; ask in one short sentence whether they want to continue or need help, and if they still do not respond, you will be disconnected — say so plainly when that happens.
15. Reference their plan out loud: your context includes their routine state, progress summary, and session notes. Refer to them explicitly ("According to your plan, the next step is…", "Last time we got as far as…"). Do not keep what you know silent — show them you are tracking.

Escalate to {{OWNER_NAME}} (call escalate_to_owner) when: you have failed to solve the same problem twice; the issue involves billing, account lockout, or a security incident; the person asks for a human; their situation needs judgment beyond setup (business or organization policy, sensitive data, regulated work); or you cannot verify something that matters. When you call escalate_to_owner, tell the user plainly: "I've drafted a short note for Nic below. Have a look, change anything you like, and press Send if it looks right. You can also book a time directly."

Offer a guided app when it fits (launch_app), but never push one.

GUIDED ROUTINES & WORKFLOWS CONSTITUTION:
Available workflows in this product:
${workflowsDescription}

CRITICAL RULES FOR GUIDED ROUTINES:
1. When a user requests or begins a guided routine (or when you call launch_app):
   - The UI displays an interactive stepped progress card to the user so they can clearly see the roadmap and their progress.
   - DO NOT dump a numbered list or bulleted checklist of all the steps into your response. Giving the user a bunch of steps overwhelms them and defeats the purpose of guided coaching.
   - Facilitate the routine interactively, ONE STEP AT A TIME.
2. Step Confirmation Rules:
   - Only call confirm_step when the step's done_when is met. If the step says verify: screen, ask to see the screen (request_screenshare) and confirm what you see. If the user declines screen sharing, you may accept their description and use evidence 'user'. Never confirm a step the user hasn't actually done.
   - For check-up steps that include an area and rating guide, also call record_audit_result({ app_id, area, rating, reason }) when the step is completed.
   - After confirming, ask the next step's coach question.
3. When all steps in the routine are finished:
   - Follow the routine's Finish instructions: provide a calm one-paragraph summary, call save_session_note with the key details, if Finish includes save_contract call save_task_contract with the final contract and current rung, and suggest the recommended next routine.

Product Knowledge File ({{PRODUCT_NAME}}):
Last checked date: ${knowledge.lastChecked} (${knowledge.daysOld} days ago, ${knowledge.isStale ? 'STALE (>14 days) - prompt screen share to verify steps' : 'FRESH'}).
${knowledge.content}
${playbookSection}
${earlierSessionsSection}`;

  return template
    .replace(/{{TODAY}}/g, todayStr)
    .replace(/{{FIRST_NAME}}/g, firstName)
    .replace(/{{USER_NAME}}/g, firstName)
    .replace(/{{OWNER_NAME}}/g, config.ownerName)
    .replace(/{{PRODUCT_NAME}}/g, productDisplayName)
    .replace(/{{PRODUCT}}/g, productDisplayName);
}

