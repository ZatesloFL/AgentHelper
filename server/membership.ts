// My Plan — membership copy + Nic-time ledger (new personal menu, 2026-10-27).
// The app's Firestore holds a COPY of the membership (Stripe is the billing
// source of truth, Supabase is the purchase record). This module is the only
// writer to users/{uid}/membership and users/{uid}/nic_time_ledger — the
// client never writes those paths (see firestore.rules), so a user cannot
// grant themselves time. Server writes use Firebase Admin (ADC in Cloud Run).
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getApp } from 'firebase-admin/app';
import type { Request, Response } from 'express';
import { config } from './config.js';

const db = getFirestore(getApp());
const auth = getAuth(getApp());

export const MEMBERSHIP_LINKS = {
  quickstart: 'https://buy.stripe.com/28EcN5dKsgHS8pC87wbwk0d',
  basic: 'https://buy.stripe.com/4gM4gzeOwcrCcFSfzYbwk0e',
  standard: 'https://buy.stripe.com/9B68wP35OcrCdJW3Rgbwk0f',
  premium: 'https://buy.stripe.com/9B66oHfSA4ZadJWdrQbwk0g',
  basicRenewal: 'https://buy.stripe.com/dRm3cv9uc4ZaeO0afEbwk0h',
  standardRenewal: 'https://buy.stripe.com/8x26oH8q80IU6hufzYbwk0i',
  premiumRenewal: 'https://buy.stripe.com/8x228reOw63e5dq0F4bwk0j',
  virtualBasic: 'https://buy.stripe.com/4gMbJ1eOw3V6axKbjIbwk0k',
  virtualStandard: 'https://buy.stripe.com/4gM14n0XGfDO35igE2bwk0l',
  virtualPremium: 'https://buy.stripe.com/cNifZhayg77i5dqcnMbwk0m',
  inPersonBasic: 'https://buy.stripe.com/9B6aEX49S9fq5dq1J8bwk0n',
  inPersonStandard: 'https://buy.stripe.com/4gM5kD0XG63e8pCgE2bwk0o',
  inPersonPremium: 'https://buy.stripe.com/bJe3cv8q8ezK35igE2bwk0p',
  extraHour: 'https://buy.stripe.com/aFa5kDeOwezK49mbjIbwk0q',
  block5: 'https://buy.stripe.com/00waEXbCk8bm21eafEbwk0r',
  block10: 'https://buy.stripe.com/28E7sL0XG0IU35i9bAbwk0s',
};

const PLAN_MINUTES: Record<string, number> = {
  quickstart: 0,
  basic: 30,
  standard: 60,
  premium: 90,
};

function toISO(v: any): string | null {
  if (!v) return null;
  if (typeof v === 'string') return v;
  if (v.toDate) return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  return null;
}

async function recompute(uid: string) {
  const ledgerRef = db.collection('users').doc(uid).collection('nic_time_ledger');
  const snap = await ledgerRef.get();
  const now = new Date();
  let used = 0;
  let reserved = 0;
  let packageUsed = 0;
  let packageReserved = 0;
  const batch = db.batch();
  let dirty = false;
  snap.forEach((doc) => {
    const d = doc.data() as any;
    const end = d.end ? new Date(d.end) : null;
    let status = d.status;
    // Completion rollover: a reserved booking whose end time passed is used.
    if (status === 'reserved' && end && end < now) {
      status = 'used';
      batch.update(doc.ref, { status });
      dirty = true;
    }
    const mins = Number(d.durationMinutes || 0);
    const isPackage = d.bucket === 'package';
    if (status === 'used') {
      if (isPackage) packageUsed += mins; else used += mins;
    } else if (status === 'reserved') {
      if (isPackage) packageReserved += mins; else reserved += mins;
    }
  });
  if (dirty) await batch.commit();
  const membershipRef = db.collection('users').doc(uid).collection('membership').doc('current');
  // One membership doc per user: users/{uid}/membership/current. The client
  // reads it via /api/membership, never directly.
  await membershipRef.set(
    {
      usedMinutes: used,
      reservedMinutes: reserved,
      packageUsedMinutes: packageUsed,
      packageReservedMinutes: packageReserved,
      lastSyncedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return { used, reserved, packageUsed, packageReserved };
}

async function readMembership(uid: string) {
  const ref = db.collection('users').doc(uid).collection('membership').doc('current');
  const doc = await ref.get();
  const data = doc.exists ? (doc.data() as any) : {};
  const ledgerSnap = await db
    .collection('users')
    .doc(uid)
    .collection('nic_time_ledger')
    .orderBy('start', 'desc')
    .limit(50)
    .get();
  const bookings = ledgerSnap.docs.map((d) => {
    const v = d.data() as any;
    return {
      id: d.id,
      eventType: v.eventType || null,
      bucket: v.bucket || 'plan',
      start: toISO(v.start),
      end: toISO(v.end),
      durationMinutes: v.durationMinutes || 0,
      status: v.status,
      calcomBookingId: v.calcomBookingId || null,
    };
  });
  const totals = await recompute(uid);
  const fresh = doc.exists ? (await ref.get()).data() as any : data;
  const included = Number(fresh.includedMinutes ?? 0);
  const extra = Number(fresh.extraMinutes ?? 0);
  const packageTotal = Number(fresh.packageMinutes ?? 0);
  return {
    email: fresh.email || null,
    plan: fresh.plan || null,
    planName: fresh.planName || null,
    billingInterval: fresh.billingInterval || null,
    status: fresh.status || 'none',
    termMonths: fresh.termMonths || null,
    termStart: toISO(fresh.termStart),
    termEnd: toISO(fresh.termEnd),
    includedMinutes: included,
    extraMinutes: extra,
    packageMinutes: packageTotal,
    usedMinutes: totals.used,
    reservedMinutes: totals.reserved,
    packageUsedMinutes: totals.packageUsed,
    packageReservedMinutes: totals.packageReserved,
    remainingMinutes: included + extra - totals.used - totals.reserved,
    packageRemainingMinutes: packageTotal - totals.packageUsed - totals.packageReserved,
    quickStartCreditExpiresAt: toISO(fresh.quickStartCreditExpiresAt),
    quickStartPromoCode: fresh.quickStartPromoCode || null,
    lastSyncedAt: toISO(fresh.lastSyncedAt),
    lastSyncSource: fresh.lastSyncSource || null,
    bookings,
    links: MEMBERSHIP_LINKS,
  };
}

function requireSyncSecret(req: Request, res: Response): boolean {
  const secret = process.env.SYNC_SECRET || '';
  if (!secret || req.headers['x-sync-secret'] !== secret) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }
  return true;
}

export async function handleGetMembership(req: Request, res: Response) {
  try {
    const uid = req.user!.uid;
    const data = await readMembership(uid);
    res.json(data);
  } catch (e: any) {
    console.error('[membership] get failed', e?.message);
    res.status(500).json({ error: 'Could not load your plan. Please try again.' });
  }
}

// POST /api/membership/sync — from Supabase stripe-webhook forward.
// Body: { email, plan, planName, months, nicMinutes, package, packageMinutes,
//   extraMinutes, termStart, termEnd, status, quickStartCreditExpiresAt,
//   quickStartPromoCode, source }
export async function handleMembershipSync(req: Request, res: Response) {
  if (!requireSyncSecret(req, res)) return;
  try {
    const b = req.body || {};
    const email = String(b.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'email required' });
    let user;
    try {
      user = await auth.getUserByEmail(email);
    } catch {
      return res.json({ received: true, ignored: 'no_firebase_user_for_email' });
    }
    const uid = user.uid;
    const ref = db.collection('users').doc(uid).collection('membership').doc('current');
    const existing = await ref.get();
    const prev = existing.exists ? (existing.data() as any) : {};
    const isExtraOnly = !b.plan && !b.package && Number(b.extraMinutes || 0) > 0;
    const update: Record<string, any> = {
      email,
      lastSyncSource: b.source || 'stripe-webhook',
      lastSyncedAt: FieldValue.serverTimestamp(),
    };
    if (b.plan) {
      update.plan = b.plan;
      update.planName = b.planName || b.plan;
      update.termMonths = b.months ?? null;
      update.includedMinutes = b.nicMinutes ?? PLAN_MINUTES[b.plan] ?? 0;
      update.termStart = b.termStart || null;
      update.termEnd = b.termEnd || null;
      update.status = b.status || 'active';
      update.billingInterval = b.months === 1 ? 'month' : b.months === 3 ? 'quarter' : b.months === 6 ? 'half-year' : b.months === 12 ? 'year' : null;
    }
    if (b.package) {
      update.package = b.package;
      update.packageMinutes = (Number(prev.packageMinutes || 0) + Number(b.packageMinutes || 0));
    }
    if (b.extraMinutes) {
      update.extraMinutes = (Number(prev.extraMinutes || 0) + Number(b.extraMinutes || 0));
    }
    if (b.quickStartCreditExpiresAt) update.quickStartCreditExpiresAt = b.quickStartCreditExpiresAt;
    if (b.quickStartPromoCode) update.quickStartPromoCode = b.quickStartPromoCode;
    if (!isExtraOnly || b.plan || b.package) {
      // Plan/package purchases set the plan fields; extra-only purchases
      // only accumulate extraMinutes and must not overwrite the plan.
      await ref.set(update, { merge: true });
    } else {
      await ref.set(update, { merge: true });
    }
    await recompute(uid);
    res.json({ received: true, uid });
  } catch (e: any) {
    console.error('[membership] sync failed', e?.message);
    res.status(500).json({ error: 'sync failed' });
  }
}

// POST /api/nic-time/sync — from Supabase calcom-webhook forward.
// Body: { event: 'created'|'rescheduled'|'cancelled', bookingId, eventType,
//   start, end, durationMinutes, email }
export async function handleNicTimeSync(req: Request, res: Response) {
  if (!requireSyncSecret(req, res)) return;
  try {
    const b = req.body || {};
    const email = String(b.email || '').trim().toLowerCase();
    const bookingId = String(b.bookingId || '');
    if (!email || !bookingId) return res.status(400).json({ error: 'email and bookingId required' });
    let user;
    try {
      user = await auth.getUserByEmail(email);
    } catch {
      return res.json({ received: true, ignored: 'no_firebase_user_for_email' });
    }
    const uid = user.uid;
    const ref = db.collection('users').doc(uid).collection('nic_time_ledger').doc(bookingId);
    const eventType = String(b.eventType || '');
    // Only Membership Sessions draw from the plan allowance. Package
    // sessions (Virtual Setup / Lunch) draw from the package bucket.
    // Checkup and anything else is not Nic-time and is not recorded here.
    const isMembership = /membership/i.test(eventType);
    const isPackage = /virtual|setup|lunch|in-person|in_person|home visit/i.test(eventType);
    if (!isMembership && !isPackage) {
      return res.json({ received: true, ignored: 'not_nic_time_event' });
    }
    if (b.event === 'cancelled') {
      await ref.set({ status: 'released' }, { merge: true });
    } else {
      await ref.set(
        {
          eventType,
          bucket: isPackage ? 'package' : 'plan',
          start: b.start || null,
          end: b.end || null,
          durationMinutes: Number(b.durationMinutes || 0),
          status: 'reserved',
          calcomBookingId: bookingId,
        },
        { merge: true },
      );
    }
    await recompute(uid);
    res.json({ received: true, uid });
  } catch (e: any) {
    console.error('[membership] nic-time sync failed', e?.message);
    res.status(500).json({ error: 'sync failed' });
  }
}

// POST /api/admin/membership/adjust — Nic only. Body: { email, minutes,
//   bucket: 'plan'|'package'|'extra', reason }
export async function handleAdminAdjust(req: Request, res: Response) {
  try {
    const email = String(req.user?.email || '').toLowerCase();
    if (!email || !config.adminEmails.includes(email)) {
      return res.status(403).json({ error: 'This page is for the site owner.' });
    }
    const targetEmail = String(req.body?.email || '').trim().toLowerCase();
    const minutes = Number(req.body?.minutes || 0);
    const bucket = String(req.body?.bucket || 'extra');
    const reason = String(req.body?.reason || '');
    if (!targetEmail || !minutes || !reason) {
      return res.status(400).json({ error: 'email, minutes, and reason are required' });
    }
    let user;
    try {
      user = await auth.getUserByEmail(targetEmail);
    } catch {
      return res.status(404).json({ error: 'No app user with that email' });
    }
    const ref = db.collection('users').doc(user.uid).collection('membership').doc('current');
    const doc = await ref.get();
    const prev = doc.exists ? (doc.data() as any) : {};
    const field = bucket === 'package' ? 'packageMinutes' : bucket === 'extra' ? 'extraMinutes' : 'includedMinutes';
    const adjustments = Array.isArray(prev.adjustments) ? prev.adjustments : [];
    adjustments.push({ minutes, bucket, reason, at: new Date().toISOString(), by: email });
    await ref.set(
      { [field]: Number(prev[field] || 0) + minutes, adjustments, lastSyncedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    res.json({ received: true, uid: user.uid });
  } catch (e: any) {
    console.error('[membership] admin adjust failed', e?.message);
    res.status(500).json({ error: 'adjust failed' });
  }
}
