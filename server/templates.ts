import type { Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { getApp } from 'firebase-admin/app';

// Track 3, Step 0: admin-only template import. Firestore rules deny ALL
// client writes to templates/{slug} (writes only via server/Admin), so the
// finished template records (authored in Basic Memory) land through here.
// Route is registered behind requireUser + requireAdmin in server.ts.
// Body: { templates: [ <record>, ... ] } — each record must carry slug +
// title; the whole record is written as the doc (set, not merge), so an
// import is the record of truth for that slug, version included.
export async function handleImportTemplates(req: Request, res: Response) {
  try {
    const records = (req.body as any)?.templates;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Body must be { templates: [records] }.' });
    }
    if (records.length > 50) {
      return res.status(400).json({ error: 'Import at most 50 records at a time.' });
    }
    const db = getFirestore(getApp());
    const imported: string[] = [];
    const skipped: Array<{ slug: string | null; reason: string }> = [];
    for (const rec of records) {
      const slug = typeof rec?.slug === 'string' ? rec.slug.trim() : '';
      if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
        skipped.push({ slug: slug || null, reason: 'missing or invalid slug' });
        continue;
      }
      if (typeof rec?.title !== 'string' || !rec.title.trim()) {
        skipped.push({ slug, reason: 'missing title' });
        continue;
      }
      await db.collection('templates').doc(slug).set(rec);
      imported.push(slug);
    }
    return res.json({ imported, skipped, count: imported.length });
  } catch (e: any) {
    console.error('[templates] import failed', e?.message);
    return res.status(500).json({ error: 'Template import failed.' });
  }
}
