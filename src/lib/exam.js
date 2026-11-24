// Générateur d'examens adaptatifs : mélange erreurs passées, positions fragiles, révisions récentes,
// positions maîtrisées (contrôle de mémoire) et nouvelles réponses adverses des chapitres étudiés.
import { REP, cardInfo } from './repo.js';
import { statusOf, priorityOf } from './store.js';

const DAY = 864e5;
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** Tirage pondéré sans remise. */
function pick(pool, n, weight, taken) {
  const out = [];
  const items = pool.filter((x) => !taken.has(x.key)).map((x) => ({ x, w: Math.max(0.01, weight(x)) }));
  while (out.length < n && items.length) {
    const total = items.reduce((s, i) => s + i.w, 0);
    let r = Math.random() * total;
    let k = 0;
    for (; k < items.length - 1; k++) { r -= items[k].w; if (r <= 0) break; }
    const [it] = items.splice(k, 1);
    taken.add(it.x.key);
    out.push(it.x);
  }
  return out;
}

/** Évite deux positions du même chapitre à la suite quand c'est possible. */
function interleave(list) {
  const res = [];
  const rest = [...list];
  while (rest.length) {
    const prev = res[res.length - 1];
    const i = rest.findIndex((c) => !prev || c.chapterId !== prev.chapterId);
    res.push(rest.splice(i < 0 ? 0 : i, 1)[0]);
  }
  return res;
}

export function buildExam(state, side, size = 10, now = Date.now()) {
  const cards = Object.values(state.cards).filter((c) => c.side === side && c.path);
  const taken = new Set();
  const weak = cards.filter((c) => ['recurrente', 'fragile', 'areviser'].includes(statusOf(c, now)));
  const recent = cards.filter((c) => c.lastReview && now - c.lastReview < 3 * DAY);
  const mastered = cards.filter((c) => statusOf(c, now) === 'maitrisee' || statusOf(c, now) === 'encours');
  // nouvelles positions dans les chapitres déjà travaillés (autres réponses adverses)
  const studied = new Set(cards.map((c) => c.chapterId));
  const fresh = [];
  for (const n of REP[side].nodes.values()) {
    if (!n.user || state.cards[n.key]) continue;
    const ch = [...n.chapters].find((id) => studied.has(id));
    if (ch) fresh.push({ ...cardInfo(side, n, ch), depth: n.path.length });
  }

  const quota = { weak: Math.ceil(size * 0.4), recent: Math.round(size * 0.2), fresh: Math.round(size * 0.2), mastered: Math.round(size * 0.2) };
  const chosen = [
    ...pick(weak, quota.weak, (c) => priorityOf(c, now), taken),
    ...pick(recent, quota.recent, (c) => 1 + priorityOf(c, now) / 20, taken),
    ...pick(fresh, quota.fresh, (c) => 1 / (1 + c.depth / 6), taken),
    ...pick(mastered, quota.mastered, () => 1, taken),
  ];
  // compléter si un groupe est vide
  if (chosen.length < size) chosen.push(...pick(cards, size - chosen.length, (c) => priorityOf(c, now), taken));
  if (chosen.length < size) chosen.push(...pick(fresh, size - chosen.length, (c) => 1 / (1 + c.depth / 6), taken));
  if (chosen.length < size) {
    // débutant : positions du début des lignes principales
    const all = [];
    for (const n of REP[side].nodes.values()) if (n.user && !taken.has(n.key)) all.push({ ...cardInfo(side, n), depth: n.path.length });
    chosen.push(...pick(all, size - chosen.length, (c) => 1 / (1 + c.depth * c.depth), taken));
  }
  return interleave(shuffle(chosen.slice(0, size)));
}
