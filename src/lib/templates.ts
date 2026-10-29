// Template access with a bundled fallback (Track 3, Step 0).
//
// Firestore `templates/{slug}` is the source of truth. The app also bundles
// the four finished template records (Claude run 1) and uses them ONLY when
// Firestore has no doc for a slug — so intake and the in-app picker work for
// every finished template even before the admin import runs, and a template
// whose Firestore doc is missing never shows up as a blank error when we
// actually have its content. Firestore always wins on conflict.
import {
  getTemplate,
  listTemplates,
  templateDocFromData,
  type TemplateDoc,
} from './firebase.js';

let bundledCache: TemplateDoc[] | null = null;

async function bundledTemplates(): Promise<TemplateDoc[]> {
  if (bundledCache) return bundledCache;
  try {
    const mod = await import('../data/templateRecords.js');
    bundledCache = (mod.TEMPLATE_RECORDS || []).map((r: any) =>
      templateDocFromData(String(r?.slug || ''), r),
    );
    return bundledCache;
  } catch (err) {
    console.warn('Bundled template records unavailable:', err);
    return [];
  }
}

export async function getTemplateWithFallback(slug: string): Promise<TemplateDoc | null> {
  const fromFirestore = await getTemplate(slug);
  if (fromFirestore) return fromFirestore;
  const bundled = await bundledTemplates();
  return bundled.find((t) => t.slug === slug) || null;
}

export async function listTemplatesWithFallback(): Promise<TemplateDoc[]> {
  const fromFirestore = await listTemplates();
  const bySlug = new Map<string, TemplateDoc>();
  for (const t of await bundledTemplates()) bySlug.set(t.slug, t);
  for (const t of fromFirestore) bySlug.set(t.slug, t); // Firestore wins
  return Array.from(bySlug.values()).sort((a, b) => a.title.localeCompare(b.title));
}
