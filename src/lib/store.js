// Persistance locale + mémoire d'apprentissage (répétition espacée).
//
// Stockage : IndexedDB (principal, durable) + localStorage (copie synchrone pour un démarrage
// instantané). Une sauvegarde automatique quotidienne est conservée (7 derniers jours).
// Les données restent dans CE navigateur : aucune synchronisation entre appareils.
import { useSyncExternalStore } from 'react';

const LS_KEY = 'chess-master-academy.v1'; // même clé que la v1 → migration automatique
const DB_NAME = 'chess-master-academy';
const VERSION = 2;
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
// Protocole : immédiat → plus tard dans la séance → J+1 → J+3 → J+7 → J+14 → J+30, puis × facilité
export const STEPS = [0, 10 * MIN, DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];
export const MASTERY = ['Nouveau', 'En apprentissage', 'Familier', 'Solide', 'Maîtrisé', 'Expert'];
export const STATUS = {
  nouvelle: 'Nouvelle',
  recurrente: 'Erreur récurrente',
  fragile: 'Fragile',
  areviser: 'À réviser',
  maitrisee: 'Maîtrisée',
  encours: 'En cours',
};

const today = () => new Date().toISOString().slice(0, 10);

function defaults() {
  return {
    version: VERSION,
    savedAt: 0,
    profile: { elo: 1105, goal: 1300, chesscomUser: '', createdAt: Date.now() },
    cards: {},
    daily: {},
    lines: {},
    exams: [],
    games: [],
    exercises: [],
    traps: {},
    plan: {},
    settings: { level: 1200 },
  };
}

function migrate(s) {
  const d = defaults();
  const out = { ...d, ...s, profile: { ...d.profile, ...(s.profile || {}) }, settings: { ...d.settings, ...(s.settings || {}) } };
  out.exams ||= [];
  out.traps ||= {};
  out.games ||= [];
  out.exercises ||= [];
  for (const c of Object.values(out.cards || {})) {
    c.history ||= [];
    c.hints ??= c.history.filter((h) => h.type === 'hint').length;
    c.errors ??= c.history.filter((h) => !['alt', 'hint', 'ok'].includes(h.type)).length;
    c.okStreak ??= c.streak || 0;
  }
  out.version = VERSION;
  return out;
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? migrate(JSON.parse(raw)) : defaults();
  } catch {
    return defaults();
  }
}

let state = loadLocal();
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

// ---------------------------------------------------------------- IndexedDB
let dbp = null;
function db() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB indisponible')); return; }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}
async function idbGet(key) {
  const d = await db();
  return new Promise((res, rej) => { const r = d.transaction('kv').objectStore('kv').get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
}
async function idbSet(key, val) {
  const d = await db();
  return new Promise((res, rej) => { const tx = d.transaction('kv', 'readwrite'); tx.objectStore('kv').put(val, key); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}

export const storageInfo = { idb: false, persisted: false, lastBackup: null, error: null };

/** Au démarrage : relit IndexedDB et garde la version la plus récente des deux stockages. */
export async function initStorage() {
  try {
    const saved = await idbGet('state');
    storageInfo.idb = true;
    if (saved && (saved.savedAt || 0) > (state.savedAt || 0)) {
      state = migrate(saved);
      try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* */ }
    } else {
      await idbSet('state', state);
    }
    const backups = (await idbGet('backups')) || {};
    const t = today();
    if (!backups[t] && Object.keys(state.cards).length) {
      backups[t] = state;
      const keys = Object.keys(backups).sort();
      while (keys.length > 7) delete backups[keys.shift()];
      await idbSet('backups', backups);
    }
    storageInfo.lastBackup = Object.keys(backups).sort().pop() || null;
  } catch (e) {
    storageInfo.error = e.message;
  }
  try {
    if (navigator.storage && navigator.storage.persist) storageInfo.persisted = await navigator.storage.persist();
  } catch { /* */ }
  emit();
}

export async function listBackups() {
  try { return (await idbGet('backups')) || {}; } catch { return {}; }
}
export async function restoreBackup(day) {
  const b = await listBackups();
  if (!b[day]) throw new Error('Sauvegarde introuvable.');
  state = migrate(b[day]);
  save();
  emit();
}

let idbTimer = null;
function save() {
  state.savedAt = Date.now();
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* quota / navigation privée */ }
  clearTimeout(idbTimer);
  idbTimer = setTimeout(() => { idbSet('state', state).catch((e) => { storageInfo.error = e.message; }); }, 250);
}
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => { idbSet('state', state).catch(() => {}); });
}

export function getState() { return state; }
export function update(fn) {
  const next = structuredClone(state);
  fn(next);
  state = next;
  save();
  emit();
}
export function useStore(sel = (s) => s) {
  return sel(useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => state));
}

export function exportData() { return JSON.stringify(state, null, 2); }
export function importData(json) {
  const s = JSON.parse(json);
  if (!s || typeof s !== 'object' || !s.cards) throw new Error('Fichier de sauvegarde invalide.');
  state = migrate(s);
  save();
  emit();
}

// ---------------------------------------------------------------- cartes
export function masteryOf(card) {
  if (!card || !card.attempts) return 0;
  const rate = card.successes / card.attempts;
  if (card.step <= 1) return 1;
  if (card.step <= 3) return 2;
  if (card.step <= 4) return 3;
  if (card.step <= 6 && !(card.interval >= 30 * DAY && rate >= 0.9)) return 4;
  return 5;
}

/** Erreurs (hors bonnes alternatives et indices) dans les `days` derniers jours. */
export function recentErrors(card, days = 30, now = Date.now()) {
  return ((card && card.history) || []).filter((h) => !['alt', 'hint', 'ok'].includes(h.type) && now - h.t < days * DAY);
}

export function statusOf(card, now = Date.now()) {
  if (!card || !card.attempts) return 'nouvelle';
  const errs = recentErrors(card, 30, now);
  if (errs.length >= 2 && (card.okStreak || 0) < 3) return 'recurrente';
  if (card.due <= now) return 'areviser';
  if (masteryOf(card) >= 4 && (card.okStreak || 0) >= 2) return 'maitrisee';
  if ((card.okStreak || 0) < 2 || errs.length) return 'fragile';
  return 'encours';
}

/** Priorité : plus c'est haut, plus la position revient vite. */
export function priorityOf(card, now = Date.now()) {
  const st = statusOf(card, now);
  const base = { recurrente: 100, areviser: 60, fragile: 40, encours: 15, maitrisee: 4, nouvelle: 20 }[st];
  const overdue = card && card.due < now ? Math.min(30, (now - card.due) / DAY) : 0;
  return base + recentErrors(card, 30, now).length * 10 - Math.min(3, (card && card.okStreak) || 0) * 6 + overdue;
}

/**
 * Enregistre un résultat.
 * result : 'ok' (seul, du premier coup) | 'hint' (trouvé avec indice) | 'alt' (bonne alternative)
 *        | 'fail' (erreur ou imprécision avant de trouver)
 * detail : { type, played, reason, hintLevel, mode }
 */
export function recordResult({ key, fen, san, side, chapterId, path, label }, result, detail = {}) {
  update((d) => {
    const now = Date.now();
    let c = d.cards[key];
    if (!c) {
      c = d.cards[key] = { key, fen, san, side, chapterId, path, label, attempts: 0, successes: 0, hints: 0, errors: 0, step: 0, ease: 2.3, interval: 0, okStreak: 0, lastReview: null, due: now, history: [] };
    }
    Object.assign(c, { fen, san, side, chapterId: chapterId || c.chapterId, path: path || c.path, label: label || c.label });
    const early = c.lastReview && now < c.due;
    c.attempts++;
    c.lastReview = now;
    const entry = { t: now, type: detail.type || result, played: detail.played || '', expected: san, reason: detail.reason || '', hint: detail.hintLevel || 0, mode: detail.mode || '' };
    if (result === 'ok') {
      c.successes++;
      c.okStreak = (c.okStreak || 0) + 1;
      // une réussite dans la même séance ne suffit pas : elle ne dépasse pas « J+1 »
      let step = early ? Math.min(Math.max(c.step, 1) + 1, 2) : Math.min(c.step + 1, STEPS.length);
      if (!early && c.okStreak >= 3 && c.ease >= 2.5 && step < STEPS.length - 1) step++;
      c.step = Math.max(c.step, step);
      c.interval = c.step < STEPS.length ? STEPS[c.step] : Math.round(Math.max(c.interval, 30 * DAY) * c.ease);
      c.ease = Math.min(3, c.ease + 0.05);
      entry.type = 'ok';
    } else if (result === 'hint') {
      c.successes += 0.5;
      c.hints = (c.hints || 0) + 1;
      c.okStreak = 0;
      c.step = Math.min(Math.max(c.step - 1, 1), 2);
      c.interval = DAY;
      c.ease = Math.max(1.3, c.ease - 0.1);
      entry.type = 'hint';
    } else if (result === 'alt') {
      c.successes += 0.5;
      c.interval = c.step >= 2 ? DAY : 10 * MIN;
      entry.type = 'alt';
    } else {
      c.errors = (c.errors || 0) + 1;
      c.okStreak = 0;
      c.step = 1;
      c.interval = STEPS[1];
      c.ease = Math.max(1.3, c.ease - 0.2);
    }
    c.history.push(entry);
    if (c.history.length > 40) c.history = c.history.slice(-40);
    c.due = now + c.interval;
    c.mastery = masteryOf(c);
    const t = today();
    const day = (d.daily[t] ||= { reviews: 0, correct: 0, hinted: 0, minutes: 0 });
    day.reviews++;
    if (result === 'ok') day.correct++;
    if (result === 'hint') day.hinted = (day.hinted || 0) + 1;
    const all = Object.values(d.cards);
    day.mastered = all.filter((x) => masteryOf(x) >= 4).length;
    day.known = all.filter((x) => masteryOf(x) >= 2).length;
  });
}

export function dueCards(s = state, side = null, now = Date.now()) {
  return Object.values(s.cards)
    .filter((c) => c.due <= now && (!side || c.side === side))
    .sort((a, b) => priorityOf(b, now) - priorityOf(a, now));
}

export function streakDays(s = state) {
  let n = 0;
  const d = new Date();
  if (!s.daily[d.toISOString().slice(0, 10)]) d.setDate(d.getDate() - 1);
  for (;;) {
    const k = d.toISOString().slice(0, 10);
    if (s.daily[k] && s.daily[k].reviews > 0) { n++; d.setDate(d.getDate() - 1); } else break;
  }
  return n;
}

export function markLine(lineId, kind, ok) {
  update((d) => {
    const l = (d.lines[lineId] ||= { learnedAt: null, tests: 0, passes: 0 });
    l.lastAt = Date.now();
    if (kind === 'learn' && !l.learnedAt) l.learnedAt = Date.now();
    if (kind === 'test') { l.tests++; if (ok) l.passes++; }
  });
}

export function saveExam(exam) {
  update((d) => { d.exams.unshift(exam); d.exams = d.exams.slice(0, 50); });
}

export function addMinutes(min) {
  if (!min) return;
  update((d) => { const day = (d.daily[today()] ||= { reviews: 0, correct: 0, minutes: 0 }); day.minutes = (day.minutes || 0) + min; });
}
