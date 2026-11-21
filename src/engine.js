/* Prep School Life — engine. Pure logic, no DOM. Works in browser and Node. */
(function (root) {
  'use strict';
  const D = () => root.PSL_DATA;

  /* ---------- RNG (mulberry32, state kept in save) ---------- */
  function rnd(s) {
    s.rng = (s.rng + 0x6D2B79F5) >>> 0;
    let t = s.rng;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const ri = (s, a, b) => a + Math.floor(rnd(s) * (b - a + 1));
  const pick = (s, arr) => arr[Math.floor(rnd(s) * arr.length)];
  const chance = (s, p) => rnd(s) < p;
  function wpick(s, items, wf) {
    let tot = 0;
    const ws = items.map(i => { const w = Math.max(0, wf(i) || 0); tot += w; return w; });
    if (tot <= 0) return null;
    let r = rnd(s) * tot;
    for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r < 0) return items[i]; }
    return items[items.length - 1];
  }
  const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
  const arr = x => x == null ? [] : Array.isArray(x) ? x : [x];

  /* ---------- Constants ---------- */
  const VISIBLE = ['morale', 'energy', 'teaching', 'rep'];
  const HIDDEN = ['patience', 'organisation', 'charisma', 'ambition', 'karma'];
  const STAT_LABEL = { morale: 'Morale', energy: 'Energy', teaching: 'Teaching', rep: 'Reputation',
    patience: 'Patience', organisation: 'Organisation', charisma: 'Charisma', ambition: 'Ambition', karma: 'Karma' };

  const HT = [
    { term: 'Michaelmas', half: 1, season: 'michaelmas', brk: 'October half-term', rest: 0.35 },
    { term: 'Michaelmas', half: 2, season: 'michaelmas', brk: 'Christmas holidays', rest: 0.7 },
    { term: 'Lent', half: 1, season: 'lent', brk: 'February half-term', rest: 0.35 },
    { term: 'Lent', half: 2, season: 'lent', brk: 'Easter holidays', rest: 0.65 },
    { term: 'Summer', half: 1, season: 'summer', brk: 'May half-term', rest: 0.35 },
    { term: 'Summer', half: 2, season: 'summer', brk: 'summer holidays', rest: 0.95 },
  ];
  const SEASON_SPORT = { michaelmas: 'rugby', lent: 'hockey', summer: 'cricket' };
  const SEASON_SPORT_G = { michaelmas: 'hockey', lent: 'netball', summer: 'cricket' };

  const ROLES = {
    ECT:         { rank: 0, drain: 30, label: () => 'ECT', pay: () => 32900 },
    Teacher:     { rank: 1, drain: 27, label: () => 'Teacher', pay: s => Math.min(34500 + 1400 * s.career.years, 50000) },
    HoD:         { rank: 2, drain: 30, label: s => 'Head of ' + s.me.subject, pay: s => Math.min(38500 + 1400 * s.career.years, 54000) + 4500 },
    Housemaster: { rank: 2, drain: 35, label: s => s.me.gender === 'f' ? 'Housemistress' : 'Housemaster', pay: s => Math.min(38500 + 1400 * s.career.years, 54000) + 7000 },
    DoS:         { rank: 3, drain: 32, label: () => 'Director of Studies', pay: () => 62000 },
    Deputy:      { rank: 4, drain: 34, label: () => 'Deputy Head', pay: () => 72000 },
    Head:        { rank: 5, drain: 36, label: s => s.me.gender === 'f' ? 'Headmistress' : 'Headmaster', pay: s => 98000 + s.school.prestige * 9000 },
  };
  const RIVAL_TITLES = [p => 'Teaches ' + p.subject, p => 'Teaches ' + p.subject, p => 'Head of ' + p.subject, () => 'Director of Studies', () => 'Deputy Head'];
  const LADDER = {
    HoD:         { from: ['Teacher'], years: 3, need: { teaching: 60 }, vac: 0.35 },
    Housemaster: { from: ['Teacher', 'HoD'], years: 5, need: { rep: 58 }, boarding: true, vac: 0.25 },
    DoS:         { from: ['HoD'], years: 7, need: { teaching: 70, rep: 62 }, vac: 0.2 },
    Deputy:      { from: ['Housemaster', 'DoS'], years: 10, need: { rep: 70 }, vac: 0.18 },
    Head:        { from: ['Deputy'], years: 13, need: { rep: 76 }, external: true, vac: 0.35 },
  };

  /* ---------- Traits ---------- */
  const myTraits = s => (s.traits || []).map(id => (D().traits || []).find(t => t.id === id)).filter(Boolean);
  const traitSum = (s, k) => myTraits(s).reduce((a, t) => a + (t[k] || 0), 0);
  const hasTrait = (s, id) => (s.traits || []).includes(id);

  /* ---------- Formatting helpers ---------- */
  const htLabel = s => `${HT[s.ht].term} ½${HT[s.ht].half} · ${s.ay}/${String((s.ay + 1) % 100).padStart(2, '0')}`;
  const roleLabel = (s, r) => ROLES[r || s.career.role].label(s);
  const myName = s => `${s.me.title} ${s.me.last}`;
  const sport = s => (s.school.gender === 'girls' ? SEASON_SPORT_G : SEASON_SPORT)[HT[s.ht].season];
  const money = n => (n < 0 ? '-£' : '£') + Math.abs(Math.round(n)).toLocaleString('en-GB');

  function dispName(p) {
    if (!p) return 'someone';
    if (p.role === 'pupil') return `${p.first} ${p.last}`;
    if (['partner', 'child'].includes(p.role)) return p.first;
    if (p.role === 'parent') return `${p.title} ${p.last}`;
    return `${p.title} ${p.last}`;
  }
  function personRoleLabel(s, p) {
    switch (p.role) {
      case 'head': return s.school.gender === 'girls' || p.g === 'f' ? 'Headmistress' : 'Headmaster';
      case 'deputy': return 'Deputy Head';
      case 'hod': return 'Head of ' + s.me.subject;
      case 'bursar': return 'Bursar';
      case 'matron': return 'Matron';
      case 'colleague': return (p.rival ? '⚔️ Your rival · ' + (RIVAL_TITLES[p.rrank] ? RIVAL_TITLES[p.rrank](p) : 'Colleague') : '') || (p.subject ? 'Teaches ' + p.subject : 'Colleague');
      case 'pupil': { const t = D().pupilTypes.find(x => x.id === p.type); return 'Year ' + p.year + (p.boarder ? ' · boarder' : '') + (t ? ' · ' + t.label : ''); }
      case 'slt': return 'Assistant Head (Teaching and Learning)';
      case 'parent': { const c = s.people.find(x => x.id === p.childId); return c ? 'Parent of ' + c.first : 'Parent'; }
      case 'partner': return s.flags.married ? (p.g === 'f' ? 'Wife' : 'Husband') : s.flags.engaged ? (p.g === 'f' ? 'Fiancée' : 'Fiancé') : 'Partner';
      case 'child': return (p.g === 'f' ? 'Daughter' : 'Son') + ' · age ' + p.age;
      default: return p.role;
    }
  }

  /* ---------- People ---------- */
  let pid = 0;
  function makePerson(s, role, extra = {}) {
    const N = D().names;
    let g = extra.g;
    if (!g) {
      if (role === 'pupil') g = s.school.gender === 'boys' ? 'm' : s.school.gender === 'girls' ? 'f' : pick(s, ['m', 'f']);
      else if (role === 'partner') g = s.me.gender === 'm' ? (chance(s, 0.9) ? 'f' : 'm') : (chance(s, 0.9) ? 'm' : 'f');
      else g = pick(s, ['m', 'f']);
    }
    const kid = role === 'pupil' || role === 'child';
    const first = kid ? pick(s, g === 'm' ? N.boys : N.girls) : pick(s, g === 'm' ? N.men : N.women);
    const p = {
      id: 'p' + (s.nextId++), role, g, first,
      last: extra.last || (role === 'child' ? s.me.last : pick(s, N.surnames)),
      title: g === 'm' ? 'Mr' : pick(s, ['Mrs', 'Ms', 'Mrs', 'Miss']),
      rel: extra.rel != null ? extra.rel : ri(s, 40, 60),
      temper: ri(s, 0, 100), kindness: ri(s, 0, 100),
      quirk: pick(s, D().quirks), seen: s.tick,
    };
    if (role === 'head' || role === 'deputy') p.title = chance(s, 0.25) ? 'Dr' : p.title;
    if (role === 'colleague') p.subject = pick(s, D().subjects.filter(x => x !== s.me.subject));
    if (role === 'pupil') { p.year = extra.year || ri(s, 3, 8); p.boarder = s.school.boarding && chance(s, 0.7); p.type = pick(s, D().pupilTypes).id; }
    if (role === 'child') p.age = 0;
    for (const k in extra) if (extra[k] !== undefined) p[k] = extra[k];
    if (!extra.last && !['pupil', 'child', 'parent', 'partner'].includes(role)) {
      const used = s.people.map(x => x.last).concat([s.me.last]);
      let n = 0; while (used.includes(p.last) && n++ < 30) p.last = pick(s, N.surnames);
    }
    s.people.push(p);
    return p;
  }

  const STAFF_ROLES = ['head', 'deputy', 'hod', 'bursar', 'matron', 'colleague', 'slt'];
  function stashStaff(s) {
    s.world = s.world || {};
    s.world[s.school.id] = { people: s.people.filter(p => STAFF_ROLES.includes(p.role)), left: s.ay };
  }
  function staffSchool(s) {
    s.people = s.people.filter(p => ['partner', 'child'].includes(p.role));
    const back = s.world && s.world[s.school.id];
    if (back) {
      back.people.forEach(p => { p.seen = s.tick; s.people.push(p); });
      if (!['HoD', 'DoS', 'Deputy', 'Head'].includes(s.career.role) && !byRole(s, 'hod')) makePerson(s, 'hod', { rel: 50 });
      s.flags.returned = true;
    } else {
      const sr = smod(s, 'staffRel', 50);
      makePerson(s, 'head', { rel: smod(s, 'headRel', 50) });
      makePerson(s, 'deputy', { rel: 50 });
      makePerson(s, 'slt', { rel: 45 });
      if (!['HoD', 'DoS', 'Deputy', 'Head'].includes(s.career.role)) makePerson(s, 'hod', { rel: sr });
      makePerson(s, 'bursar', { rel: 45 });
      makePerson(s, 'matron', { g: 'f', title: 'Mrs', rel: sr });
      for (let i = 0; i < 3; i++) makePerson(s, 'colleague', { rel: ri(s, sr - 8, sr + 8) });
      if (chance(s, 0.75)) {
        const r = makePerson(s, 'colleague', { rel: ri(s, 30, 42) });
        r.rival = true; r.subject = s.me.subject === 'Games' ? 'Geography' : pick(s, D().subjects.filter(x => x !== s.me.subject && x !== 'Games'));
        r.rrank = Math.min(ROLES[s.career.role].rank, 2); r.rrep = ri(s, 48, 62);
        r.quirk = pick(s, ['is always first to reply-all', 'laminates everything', 'quotes the inspection framework from memory', 'volunteers for everything the Head mentions', 'brings homemade flapjack to every meeting']);
      }
    }
    for (let i = 0; i < 4; i++) addPupil(s);
    if (s.career.role === 'Head') s.people = s.people.filter(p => p.role !== 'head');
    if (s.career.role === 'Deputy') s.people = s.people.filter(p => p.role !== 'deputy');
    if (['HoD', 'DoS', 'Deputy', 'Head'].includes(s.career.role)) s.people = s.people.filter(p => p.role !== 'hod');
  }
  function addPupil(s, year) {
    const p = makePerson(s, 'pupil', { rel: ri(s, 40, 65), year: year || ri(s, 3, 8) });
    if (chance(s, 0.6)) makePerson(s, 'parent', { last: p.last, childId: p.id, rel: 50 });
    return p;
  }
  const byRole = (s, r) => s.people.find(p => p.role === r);

  function makeSchool(s, exclude, forceId) {
    const pool = D().schools.filter(x => x.id !== exclude);
    const t = (forceId && D().schools.find(x => x.id === forceId)) || pick(s, pool);
    return { id: t.id, name: t.name, nick: t.nick, town: t.town, boarding: t.boarding, gender: t.gender, prestige: t.prestige };
  }
  function smod(s, k, def) { const t = D().schools.find(x => x.id === s.school.id); return t && t.mods && t.mods[k] != null ? t.mods[k] : def; }

  /* ---------- New game ---------- */
  function newGame(o = {}, seed) {
    const s = {
      v: 1, rng: (seed != null ? seed : Math.floor(Math.random() * 4294967296)) >>> 0,
      tick: 0, ht: 0, ay: o.year || 2026, nextId: 1,
      flags: {}, counters: { schools: 1 }, cd: {}, fired: {}, queue: [], pending: [], log: [],
      time: 4, maxTime: 4, sincePopup: 0, holiday: null, study: null, over: false,
    };
    const N = D().names;
    const g = o.gender === 'm' || o.gender === 'f' ? o.gender : pick(s, ['m', 'f']);
    s.me = {
      gender: g,
      first: o.first || pick(s, g === 'm' ? N.men : N.women),
      last: o.last || pick(s, N.surnames),
      title: o.title || (g === 'm' ? 'Mr' : pick(s, ['Ms', 'Miss', 'Mrs'])),
      subject: o.subject || pick(s, D().subjects),
      age: o.age || ri(s, 22, 25),
    };
    s.school = makeSchool(s, null, o.school && o.school !== 'random' ? o.school : null);
    s.stats = { morale: ri(s, 62, 80), energy: ri(s, 80, 92), teaching: ri(s, 28, 42), rep: ri(s, 42, 55) };
    s.hidden = {}; HIDDEN.forEach(k => s.hidden[k] = ri(s, 25, 75));
    s.money = ri(s, 400, 2500);
    s.home = { type: 'flat', label: 'Rented flat', cost: 1700 };
    s.career = { role: 'ECT', years: 0, yearsInRole: 0, yearsAtSchool: 0, perf: 50, resp: [], applied: {},
      inductionFails: 0, team: null, history: [{ school: s.school.name, from: s.ay }], peak: 'ECT' };
    s.people = [];
    s.traits = (o.traits || []).filter(id => (D().traits || []).some(t => t.id === id)).slice(0, 2);
    s.alumni = []; s.reviews = [];
    staffSchool(s);
    for (const t of myTraits(s)) {
      if (t.start) for (const k in t.start) {
        if (k in s.stats) s.stats[k] = clamp(s.stats[k] + t.start[k]);
        else if (k in s.hidden) s.hidden[k] = clamp(s.hidden[k] + t.start[k]);
        else if (k === 'money') s.money += t.start[k];
      }
      if (t.headRel) s.people.filter(p => STAFF_ROLES.includes(p.role)).forEach(p => p.rel = clamp(p.rel + (p.role === 'head' ? t.headRel : t.headRel / 2)));
    }
    rollVacancies(s);
    yearStart(s);
    newSection(s);
    log(s, `You join ${s.school.name}, a ${s.school.boarding ? 'boarding' : 'day'} prep school ${s.school.town}, as an ECT in ${s.me.subject}.`, 'sys');
    // schedule first inspection
    s.queue.push({ id: 'inspection', at: ri(s, 4, 18), ctx: {} });
    startEvent(s, 'first_day');
    return s;
  }

  /* ---------- Log ---------- */
  function newSection(s) { s.log.push({ h: htLabel(s), sub: 'Age ' + s.me.age, lines: [] }); if (s.log.length > 400) s.log.shift(); }
  function log(s, t, k = 'event') { s.log[s.log.length - 1].lines.push({ t, k }); }

  /* ---------- Values & conditions ---------- */
  function getVal(s, k) {
    if (k in s.stats) return s.stats[k];
    if (k in s.hidden) return s.hidden[k];
    switch (k) {
      case 'money': return s.money;
      case 'age': return s.me.age;
      case 'years': return s.career.years;
      case 'yearsInRole': return s.career.yearsInRole;
      case 'yearsAtSchool': return s.career.yearsAtSchool;
      case 'rank': return ROLES[s.career.role].rank;
      case 'prestige': return s.school.prestige;
      case 'perf': return s.career.perf;
      case 'time': return s.time;
    }
    if (k.startsWith('c:')) return s.counters[k.slice(2)] || 0;
    return 0;
  }
  function cmp(v, e) {
    if (Array.isArray(e)) return v >= e[0] && v <= e[1];
    if (typeof e === 'number') return v >= e;
    const m = /^(<=|>=|<|>|==|!=)?\s*(-?[\d.]+)$/.exec(String(e).trim());
    if (!m) return true;
    const n = +m[2];
    switch (m[1]) { case '<': return v < n; case '<=': return v <= n; case '>': return v > n; case '==': return v === n; case '!=': return v !== n; default: return v >= n; }
  }
  function check(s, w, ctx) {
    if (!w) return true;
    const rank = ROLES[s.career.role].rank;
    if (w.role && !arr(w.role).includes(s.career.role)) return false;
    if (w.notRole && arr(w.notRole).includes(s.career.role)) return false;
    if (w.minRank != null && rank < w.minRank) return false;
    if (w.maxRank != null && rank > w.maxRank) return false;
    if (w.ht != null && !arr(w.ht).includes(s.ht)) return false;
    if (w.season && !arr(w.season).includes(HT[s.ht].season)) return false;
    if (w.boarding != null && s.school.boarding !== w.boarding) return false;
    if (w.schoolGender && !arr(w.schoolGender).includes(s.school.gender)) return false;
    if (w.subject && !arr(w.subject).includes(s.me.subject)) return false;
    if (w.school && !arr(w.school).includes(s.school.id)) return false;
    if (w.notSchool && arr(w.notSchool).includes(s.school.id)) return false;
    if (w.gender && s.me.gender !== w.gender) return false;
    if (w.flags && !arr(w.flags).every(f => s.flags[f])) return false;
    if (w.any && !arr(w.any).some(f => s.flags[f])) return false;
    if (w.not && arr(w.not).some(f => s.flags[f])) return false;
    if (w.has && !arr(w.has).every(r => s.people.some(p => p.role === r))) return false;
    if (w.hasNot && arr(w.hasNot).some(r => s.people.some(p => p.role === r))) return false;
    if (w.age != null && !cmp(s.me.age, w.age)) return false;
    if (w.stat) for (const k in w.stat) if (!cmp(getVal(s, k), w.stat[k])) return false;
    if (w.test && !w.test(s, ctx || {}, API)) return false;
    return true;
  }
  function matchSpec(s, p, spec) {
    if (typeof spec === 'string') {
      if (spec === 'staff') return STAFF_ROLES.includes(p.role);
      if (spec === 'boarder') return p.role === 'pupil' && p.boarder;
      return p.role === spec;
    }
    if (spec.role && !arr(spec.role).includes(p.role) && !(arr(spec.role).includes('staff') && matchSpec(s, p, 'staff'))) return false;
    if (spec.year && !cmp(p.year || 0, spec.year)) return false;
    if (spec.rel && !cmp(p.rel, spec.rel)) return false;
    if (spec.boarder != null && !!p.boarder !== spec.boarder) return false;
    if (spec.g && p.g !== spec.g) return false;
    if (spec.type && !arr(spec.type).includes(p.type)) return false;
    if (spec.age && !cmp(p.age || 0, spec.age)) return false;
    if (spec.rival != null && !!p.rival !== spec.rival) return false;
    return true;
  }
  function resolveCast(s, cast, ctx) {
    ctx.cast = ctx.cast || {};
    for (const slot in (cast || {})) {
      if (ctx.cast[slot] && s.people.some(p => p.id === ctx.cast[slot])) continue;
      if (ctx.cast[slot]) return false; // that person has gone; drop the follow-up
      const used = Object.values(ctx.cast);
      const pool = s.people.filter(p => matchSpec(s, p, cast[slot]) && !used.includes(p.id));
      if (!pool.length) return false;
      ctx.cast[slot] = pick(s, pool).id;
    }
    return true;
  }
  function personFor(s, ctx, slot) {
    if (ctx && ctx.cast && ctx.cast[slot]) return s.people.find(p => p.id === ctx.cast[slot]);
    if (['head', 'deputy', 'hod', 'bursar', 'matron', 'partner', 'slt'].includes(slot)) return byRole(s, slot);
    return null;
  }

  /* ---------- Text tokens ---------- */
  function fmt(s, str, ctx = {}) {
    if (!str) return '';
    if (typeof str === 'function') str = str(s, ctx, API);
    return String(str).replace(/\{([\w.]+)\}/g, (m, key) => {
      const [a, b] = key.split('.');
      switch (a) {
        case 'me': return myName(s);
        case 'first': return s.me.first;
        case 'last': return s.me.last;
        case 'school': return s.school.name;
        case 'nick': return s.school.nick || s.school.name;
        case 'town': return s.school.town;
        case 'subject': return s.me.subject;
        case 'sport': return sport(s);
        case 'role': return roleLabel(s);
        case 'term': return HT[s.ht].term;
        case 'year': return s.ay + '/' + String((s.ay + 1) % 100).padStart(2, '0');
        case 'sir': return s.me.gender === 'f' ? 'Miss' : 'Sir';
        case 'years': return String(s.career.years);
        case 'team': return s.career.team || 'U11B';
        case 'target': return ctx.target ? roleLabel(s, ctx.target) : '';
        case 'rival': return ctx.rival || (ctx.rival = pick(s, D().names.rivals));
        case 'senior': return ctx.senior || (ctx.senior = pick(s, D().names.senior[s.school.gender === 'girls' ? 'girls' : 'boys']));
        case 'newschool': return ctx.newSchool ? ctx.newSchool.name : '';
      }
      if (ctx.vars && a in ctx.vars) return ctx.vars[a];
      const p = personFor(s, ctx, a);
      if (p) {
        switch (b) {
          case undefined: return dispName(p);
          case 'first': return p.first;
          case 'last': return p.last;
          case 'full': return p.first + ' ' + p.last;
          case 'he': return p.g === 'f' ? 'she' : 'he';
          case 'He': return p.g === 'f' ? 'She' : 'He';
          case 'him': return p.g === 'f' ? 'her' : 'him';
          case 'his': return p.g === 'f' ? 'her' : 'his';
          case 'himself': return p.g === 'f' ? 'herself' : 'himself';
          case 'His': return p.g === 'f' ? 'Her' : 'His';
          case 'year': return 'Year ' + p.year;
          case 'role': return personRoleLabel(s, p);
          case 'child': { const c = s.people.find(x => x.id === p.childId); return c ? c.first : 'their child'; }
          case 'subject': return p.subject || 'Maths';
          case 'quirk': return p.quirk;
        }
      }
      const FALL = { slt: 'the Assistant Head', head: 'the Head', deputy: 'the Deputy Head', hod: 'your Head of Department', bursar: 'the Bursar', matron: 'Matron', partner: 'your partner' };
      if (FALL[a]) return FALL[a];
      return m;
    });
  }

  /* ---------- Effects ---------- */
  function applyFx(s, fx, ctx = {}) {
    const sum = [];
    if (!fx) return sum;
    for (const k of VISIBLE) if (fx[k]) {
      const before = s.stats[k];
      let delta = fx[k];
      // good moods are earned: morale gains shrink as morale rises
      if (k === 'morale' && delta > 0 && before > 40) delta *= Math.max(0.2, (100 - before) / 60);
      s.stats[k] = clamp(before + delta);
      const d = Math.round(s.stats[k] - before); if (d) sum.push({ k: STAT_LABEL[k], d });
    }
    for (const k of HIDDEN) if (fx[k]) s.hidden[k] = clamp(s.hidden[k] + fx[k]);
    if (fx.money) { s.money += fx.money; sum.push({ k: 'Money', d: fx.money, money: true }); }
    if (fx.perf) s.career.perf = clamp(s.career.perf + fx.perf);
    if (fx.time) s.time = Math.max(0, s.time + fx.time);
    if (fx.rel) for (const slot in fx.rel) {
      const p = personFor(s, ctx, slot);
      if (p) { const b = p.rel; p.rel = clamp(p.rel + fx.rel[slot]); p.seen = s.tick; const d = Math.round(p.rel - b); if (d) sum.push({ k: dispName(p), d }); }
    }
    arr(fx.flag).forEach(f => s.flags[f] = true);
    arr(fx.unflag).forEach(f => delete s.flags[f]);
    if (fx.count) {
      const c = typeof fx.count === 'string' ? { [fx.count]: 1 } : fx.count;
      for (const k in c) s.counters[k] = (s.counters[k] || 0) + c[k];
    }
    arr(fx.schedule).forEach(sc => s.queue.push({ id: sc.id, at: s.tick + (sc.in || 1), ctx: sc.keep === false ? {} : JSON.parse(JSON.stringify(ctx)) }));
    arr(fx.start).forEach(id => startEvent(s, id, JSON.parse(JSON.stringify(ctx))));
    if (fx.newPerson) arr(fx.newPerson).forEach(np => {
      const p = np.role === 'pupil' ? addPupil(s, np.year) : makePerson(s, np.role, np.extra || {});
      if (np.slot) { ctx.cast = ctx.cast || {}; ctx.cast[np.slot] = p.id; }
    });
    if (fx.removePerson) arr(fx.removePerson).forEach(slot => { const p = personFor(s, ctx, slot); if (p) removePerson(s, p); });
    if (fx.addResp) addResp(s, fx.addResp);
    if (fx.removeResp) removeResp(s, fx.removeResp);
    if (fx.team) s.career.team = fx.team;
    if (fx.promote) promote(s, fx.promote === true ? ctx.target : fx.promote, ctx);
    if (fx.moveSchool) moveSchool(s, ctx.newSchool || null, fx.moveSchool === true ? null : fx.moveSchool);
    if (fx.home) s.home = Object.assign({}, fx.home);
    if (fx.log) log(s, fmt(s, fx.log, ctx), 'sys');
    if (fx.run) fx.run(s, ctx, API);
    if (fx.ending) endGame(s, fx.ending, ctx);
    return sum;
  }
  function removePerson(s, p) {
    s.people = s.people.filter(x => x.id !== p.id && !(x.role === 'parent' && x.childId === p.id));
  }

  /* ---------- Outcomes ---------- */
  function normOutcomes(o) {
    if (o.outcomes) return o.outcomes;
    return [{ w: 1, text: o.text, fx: o.fx, title: o.title }];
  }
  function outcomeWeight(s, o, ctx) {
    let w = o.w != null ? o.w : 1;
    if (o.by) for (const k in o.by) w += o.by[k] * (getVal(s, k) - 50);
    if (o.byRel) for (const slot in o.byRel) { const p = personFor(s, ctx, slot); if (p) w += o.byRel[slot] * (p.rel - 50); }
    if (o.wfn) w += o.wfn(s, ctx, API);
    if (o.when && !check(s, o.when, ctx)) w = 0;
    return Math.max(o.when ? 0 : 1, w);
  }
  function rollOutcome(s, outs, ctx) { return wpick(s, outs, o => outcomeWeight(s, o, ctx)) || outs[0]; }

  /* ---------- Events ---------- */
  const evById = id => D().events.find(e => e.id === id);
  function eventWeight(s, e, ctx) {
    let w = e.weight != null ? e.weight : 10;
    for (const m of (e.mods || [])) if (check(s, m.when, ctx)) w *= m.x;
    return w;
  }
  function eligible(s, e) {
    if (e.manual) return false;
    if (e.once && s.fired[e.id]) return false;
    const cd = e.cooldown != null ? e.cooldown : (e.choices ? 12 : 6);
    if (s.cd[e.id] != null && s.tick - s.cd[e.id] < cd) return false;
    return check(s, e.when, {});
  }
  function markFired(s, e) { s.fired[e.id] = (s.fired[e.id] || 0) + 1; s.cd[e.id] = s.tick; }

  function prep(s, e, ctx) {
    if (e.setup && e.setup(s, ctx, API) === false) return false;
    return resolveCast(s, e.cast, ctx);
  }
  function startEvent(s, id, ctx = {}) {
    const e = evById(id);
    if (!e) return false;
    if (!prep(s, e, ctx)) return false;
    if (e.choices) { s.pending.push({ id, ctx }); markFired(s, e); return true; }
    runPassive(s, e, ctx); return true;
  }
  function runPassive(s, e, ctx) {
    markFired(s, e);
    if (e.outcomes) {
      const o = rollOutcome(s, e.outcomes, ctx);
      const t = fmt(s, o.text || e.text, ctx); if (t) log(s, (e.emoji ? e.emoji + ' ' : '') + t);
      applyFx(s, o.fx, ctx);
    } else {
      const t = fmt(s, e.text, ctx); if (t) log(s, (e.emoji ? e.emoji + ' ' : '') + t);
      applyFx(s, e.fx, ctx);
    }
  }

  function rollEvents(s) {
    const pool = D().events.filter(e => eligible(s, e));
    const pops = pool.filter(e => e.choices), pass = pool.filter(e => !e.choices);
    let nPop = s.pending.length ? 0 : wpick(s, [0, 1, 2], n => [22, 58, 20][n]);
    if (s.sincePopup >= 2 && nPop === 0 && !s.pending.length) nPop = 1;
    const nPass = wpick(s, [0, 1, 2, 3], n => [10, 40, 35, 15][n]);
    const draw = (list, n, fn) => {
      const avail = list.slice();
      let got = 0, guard = 0;
      while (got < n && avail.length && guard++ < 40) {
        const e = wpick(s, avail, x => eventWeight(s, x, {}));
        if (!e) break;
        avail.splice(avail.indexOf(e), 1);
        const ctx = {};
        if (!prep(s, e, ctx)) continue;
        fn(e, ctx); got++;
      }
      return got;
    };
    const gotPop = draw(pops, nPop, (e, ctx) => { s.pending.push({ id: e.id, ctx }); markFired(s, e); });
    draw(pass, nPass, (e, ctx) => runPassive(s, e, ctx));
    s.sincePopup = (gotPop || s.pending.length) ? 0 : s.sincePopup + 1;
  }

  function currentEvent(s) {
    const pnd = s.pending[0]; if (!pnd) return null;
    const e = evById(pnd.id); if (!e) { s.pending.shift(); return currentEvent(s); }
    return {
      id: e.id, emoji: e.emoji || '📜', title: fmt(s, e.title, pnd.ctx), text: fmt(s, e.text, pnd.ctx),
      choices: e.choices.filter(c => !c.show || check(s, c.show, pnd.ctx)).map((c, i) => ({
        i: e.choices.indexOf(c), label: fmt(s, c.label, pnd.ctx), ok: !c.need || check(s, c.need, pnd.ctx), why: c.why || '',
      })),
    };
  }
  function choose(s, i) {
    const pnd = s.pending[0]; if (!pnd) return null;
    const e = evById(pnd.id), c = e.choices[i];
    if (!c || (c.need && !check(s, c.need, pnd.ctx))) return null;
    const ctx = pnd.ctx;
    const o = rollOutcome(s, normOutcomes(c), ctx);
    s.pending.shift();
    const text = fmt(s, o.text, ctx);
    if (text) log(s, (e.emoji ? e.emoji + ' ' : '') + text);
    const fx = applyFx(s, o.fx, ctx);
    return { emoji: e.emoji, title: fmt(s, o.title || e.title, ctx), text, fx };
  }

  /* ---------- Actions ---------- */
  function actions(s, tab) {
    return D().actions.filter(a => a.tab === tab && check(s, a.show || a.when, {})).map(a => ({
      id: a.id, emoji: a.emoji, label: fmt(s, a.label, {}), sub: fmt(s, a.sub, {}), group: a.group || '',
      cost: a.cost != null ? a.cost : 1, ok: check(s, a.when, {}) && s.time >= (a.cost != null ? a.cost : 1) && (!a.need || check(s, a.need, {})),
      why: a.why || '', moneyCost: a.moneyCost,
    }));
  }
  function doAction(s, id, personId) {
    const list = personId ? D().personActions : D().actions;
    const a = list.find(x => x.id === id);
    if (!a || s.over || s.pending.length) return null;
    const cost = a.cost != null ? a.cost : 1;
    const ctx = { cast: personId ? { them: personId } : {} };
    if (personId) { const p = s.people.find(x => x.id === personId); if (!p) return null; }
    if (!check(s, a.when, ctx) || (a.need && !check(s, a.need, ctx)) || s.time < cost) return null;
    if (!resolveCast(s, a.cast, ctx)) return { emoji: a.emoji, title: fmt(s, a.label, ctx), text: 'Nobody suitable is around.', fx: [] };
    s.time -= cost;
    s.counters['act_' + id] = (s.counters['act_' + id] || 0) + 1;
    if (a.start) { startEvent(s, a.start, ctx); return { started: true }; }
    const o = rollOutcome(s, normOutcomes(a), ctx);
    const text = fmt(s, o.text, ctx);
    if (text) log(s, (a.emoji ? a.emoji + ' ' : '') + text, 'action');
    const fx = applyFx(s, o.fx, ctx);
    return { emoji: a.emoji, title: fmt(s, o.title || a.label, ctx), text, fx };
  }
  function personActions(s, personId) {
    const p = s.people.find(x => x.id === personId); if (!p) return [];
    const ctx = { cast: { them: personId } };
    return D().personActions.filter(a => arr(a.roles).includes(p.role) && check(s, a.show, ctx)).map(a => ({
      id: a.id, emoji: a.emoji, label: fmt(s, a.label, ctx), sub: fmt(s, a.sub, ctx), cost: a.cost != null ? a.cost : 1,
      ok: check(s, a.when, ctx) && (!a.need || check(s, a.need, ctx)) && s.time >= (a.cost != null ? a.cost : 1), why: a.why || '',
    }));
  }

  /* ---------- Career ---------- */
  function ladder(s) {
    const out = [];
    for (const r in LADDER) {
      const L = LADDER[r];
      if (!L.from.includes(s.career.role)) continue;
      if (L.boarding && !s.school.boarding) continue;
      const reqs = [{ label: `${L.years}+ years teaching`, ok: s.career.years >= L.years }];
      for (const k in L.need) reqs.push({ label: `${STAT_LABEL[k]} ${L.need[k]}+`, ok: s.stats[k] >= L.need[k] });
      const applied = s.career.applied[r] === s.ay;
      const vacant = !!(s.vacancies && s.vacancies[r]);
      out.push({ role: r, label: roleLabel(s, r), reqs, external: !!L.external, applied, vacant,
        ok: reqs.every(x => x.ok) && vacant && !applied && s.time >= 1 && [2, 3, 4].includes(s.ht) });
    }
    return out;
  }
  function apply(s, role) {
    const L = ladder(s).find(x => x.role === role);
    if (!L || !L.ok) return null;
    s.time -= 1; s.career.applied[role] = s.ay;
    const ctx = { target: role };
    if (LADDER[role].external) ctx.newSchool = makeSchool(s, s.school.id);
    startEvent(s, 'interview', ctx);
    return true;
  }
  function promote(s, role, ctx) {
    if (!ROLES[role]) return;
    if (ctx && ctx.newSchool && LADDER[role] && LADDER[role].external) moveSchool(s, ctx.newSchool, role);
    s.career.role = role; s.career.yearsInRole = 0;
    if (ROLES[role].rank > ROLES[s.career.peak].rank) s.career.peak = role;
    // remove the person who used to hold the post
    const holder = { HoD: 'hod', Deputy: 'deputy', Head: 'head' }[role];
    if (holder) s.people = s.people.filter(p => p.role !== holder);
    if (role === 'DoS' && !byRole(s, 'hod')) makePerson(s, 'hod');
    if (role === 'Housemaster' || (role === 'Head' && s.school.boarding)) s.home = { type: 'school', label: role === 'Head' ? "The Head's House" : 'Boarding house flat', cost: 0 };
    log(s, `You are now ${roleLabel(s)}.`, 'sys');
    const rv = s.people.find(p => p.rival);
    if (rv) { rv.rel = clamp(rv.rel - 5); log(s, `⚔️ ${dispName(rv)} congratulates you through gritted teeth.`, 'sys'); if (ROLES[role].rank > rv.rrank) s.flags.beatRival = true; }
  }
  function rivalTakesJob(s, ctx) {
    const rv = s.people.find(p => p.rival);
    if (!rv || ctx.newSchool || !chance(s, 0.5)) return;
    const target = ctx.target ? ROLES[ctx.target].rank : 0;
    if (target <= 4 && rv.rrank < Math.min(target, 4)) rv.rrank = Math.min(target, 4);
    log(s, `⚔️ The job goes to your rival, ${dispName(rv)}.`, 'sys');
    s.stats.morale = clamp(s.stats.morale - 4); rv.rel = clamp(rv.rel - 4);
    s.counters.rivalBeatYou = (s.counters.rivalBeatYou || 0) + 1;
  }
  function moveSchool(s, school, role) {
    stashStaff(s);
    if (hasTrait(s, 'local') && (s.counters.schools || 1) === 1) { s.stats.morale = clamp(s.stats.morale - 12); log(s, 'Leaving the school you went to as a child hurts more than you expected. (Morale −12)', 'sys'); }
    s.school = school || makeSchool(s, s.school.id);
    s.counters.schools = (s.counters.schools || 1) + 1;
    s.career.yearsAtSchool = 0; s.career.resp.forEach(r => delete s.flags[r]); s.career.resp = []; s.career.team = null;
    if (role) s.career.role = role;
    s.career.history.push({ school: s.school.name, from: s.ay });
    if (s.home.type === 'school') s.home = { type: 'flat', label: 'Rented flat', cost: 1700 };
    staffSchool(s);
    s.stats.rep = clamp(s.stats.rep - 10);
    log(s, `You start at ${s.school.name}, ${s.school.town}.`, 'sys');
  }
  function respList(s) {
    return D().resp.filter(r => check(s, r.show, {})).map(r => ({
      id: r.id, emoji: r.emoji, label: fmt(s, r.label, {}), sub: fmt(s, r.sub, {}), on: s.career.resp.includes(r.id),
      ok: s.career.resp.includes(r.id) || (check(s, r.when, {}) && s.time >= 1), why: r.why || '', drain: r.drain,
    }));
  }
  function findResp(s, id) { return D().resp.find(x => x.id === id && check(s, x.show, {})) || D().resp.find(x => x.id === id); }
  function addResp(s, id) {
    const r = findResp(s, id); if (!r || s.career.resp.includes(id)) return;
    s.career.resp.push(id); s.flags[id] = true;
    if (r.onAdd) applyFx(s, r.onAdd, {});
  }
  function removeResp(s, id) {
    s.career.resp = s.career.resp.filter(x => x !== id); delete s.flags[id];
    if (id === 'coach') s.career.team = null;
  }
  function toggleResp(s, id) {
    if (s.over || s.pending.length) return null;
    const r = findResp(s, id); if (!r) return null;
    if (s.career.resp.includes(id)) { removeResp(s, id); applyFx(s, { rep: -3 }); log(s, `You give up ${fmt(s, r.label)}.`, 'action'); return true; }
    if (!check(s, r.when, {}) || s.time < 1) return null;
    s.time -= 1; addResp(s, id); log(s, `You take on ${fmt(s, r.label)}.`, 'action'); return true;
  }
  function quals(s) {
    return D().quals.filter(q => check(s, q.show, {})).map(q => ({
      id: q.id, emoji: q.emoji, label: q.label, sub: q.sub, done: !!s.flags['qual_' + q.id],
      studying: s.study && s.study.id === q.id, left: s.study && s.study.id === q.id ? s.study.left : 0,
      ok: !s.study && !s.flags['qual_' + q.id] && check(s, q.when, {}) && s.time >= 1 && s.money >= (q.fee || 0), why: q.why || '',
    }));
  }
  function startQual(s, id) {
    const q = quals(s).find(x => x.id === id); if (!q || !q.ok) return null;
    const Q = D().quals.find(x => x.id === id);
    s.time -= 1; s.money -= Q.fee || 0; s.study = { id, left: Q.length };
    log(s, `You enrol on ${Q.label}.`, 'action'); return true;
  }

  /* ---------- Money ---------- */
  function annualNet(g) {
    const pa = 12570, tax = Math.max(0, Math.min(g, 50270) - pa) * 0.2 + Math.max(0, Math.min(g, 125140) - 50270) * 0.4 + Math.max(0, g - 125140) * 0.45;
    const ni = Math.max(0, Math.min(g, 50270) - pa) * 0.08 + Math.max(0, g - 50270) * 0.02;
    const pension = g * 0.074;
    return g - tax - ni - pension;
  }
  function salary(s) { return Math.round(ROLES[s.career.role].pay(s) * smod(s, 'payX', 1) / 100) * 100; }
  function budget(s) {
    const net = annualNet(salary(s) + (s.flags.bonus || 0)) / 6;
    const kids = s.people.filter(p => p.role === 'child').length;
    const costs = { home: s.home.cost || 0, living: Math.round(1300 + net * 0.18 + (s.flags.married ? 400 : 0)), kids: kids * 900, study: s.study ? (D().quals.find(q => q.id === s.study.id).perHt || 0) : 0 };
    const extra = (s.flags.tutoring ? 1200 : 0);
    return { net: Math.round(net), extra, costs, out: Object.values(costs).reduce((a, b) => a + b, 0) };
  }

  /* ---------- Advance one half-term ---------- */
  function workload(s) {
    let d = ROLES[s.career.role].drain;
    for (const id of s.career.resp) {
      const r = D().resp.find(x => x.id === id); if (r) d += r.drain || 0;
      for (const t of myTraits(s)) if (t.respDrain && t.respDrain[id]) d += t.respDrain[id];
    }
    d += traitSum(s, 'drain');
    if (s.study) d += D().quals.find(q => q.id === s.study.id).drain || 0;
    d += s.people.filter(p => p.role === 'child' && p.age < 5).length * 3;
    if (s.flags.tutoring) d += 3;
    d -= (s.hidden.organisation - 50) * 0.08;
    if (s.me.age > 55) d += (s.me.age - 55) * 0.3;
    const mood = s.stats.morale >= 72 ? 0.9 : s.stats.morale <= 30 ? 1.1 : 1;
    return Math.max(8, d * smod(s, 'drainX', 1) * mood);
  }
  function snapshot(s) {
    const copy = JSON.parse(JSON.stringify(Object.assign({}, s, { snaps: undefined })));
    s.snaps = s.snaps || [];
    s.snaps.push({ label: htLabel(s), state: copy });
    if (s.snaps.length > 12) s.snaps.shift();
  }

  function advance(s) {
    if (s.over || s.pending.length) return false;
    snapshot(s);
    const h = HT[s.ht];
    // 1. the half-term's work
    const drain = workload(s);
    s.stats.energy = clamp(s.stats.energy - drain);
    let burnt = s.stats.energy <= 0;
    if (burnt && s.stats.morale >= 70 && !s.flags['wind_' + s.ay]) {
      burnt = false; s.flags['wind_' + s.ay] = true;
      s.stats.energy = 8; s.stats.morale = clamp(s.stats.morale - 15);
      log(s, '💨 Second wind. You were running on empty, but you love the job too much to stop. (Morale −15)', 'sys');
      s.counters.secondWinds = (s.counters.secondWinds || 0) + 1;
    }
    if (s.stats.teaching < 80) s.stats.teaching = clamp(s.stats.teaching + (80 - s.stats.teaching) * 0.01 + (s.hidden.ambition - 50) * 0.004);
    const target = s.stats.teaching * 0.45 + s.hidden.organisation * 0.2 + s.stats.energy * 0.2 + s.stats.morale * 0.15;
    const moodPerf = s.stats.morale >= 72 ? 5 : s.stats.morale <= 30 ? -5 : 0;
    s.career.perf = clamp(s.career.perf * 0.7 + (target + moodPerf) * 0.3);
    const repTarget = 22 + s.career.perf * 0.45 + s.career.resp.length * 4 + ROLES[s.career.role].rank * 4 + (s.hidden.charisma - 50) * 0.1;
    s.stats.rep = clamp(s.stats.rep + (repTarget - s.stats.rep) * 0.06);
    const partner = byRole(s, 'partner');
    const moraleBase = 52 + smod(s, 'moraleBase', 0) + traitSum(s, 'morale') + (s.stats.energy - 50) * 0.25 + (partner ? (partner.rel - 50) * 0.15 : -3) + (s.hidden.patience - 50) * 0.08 + (s.money < 0 ? -8 : 0);
    s.stats.morale = clamp(s.stats.morale + (moraleBase - s.stats.morale) * 0.3);
    if (s.yr) { s.yr.moraleSum += s.stats.morale; s.yr.n++; }
    s.moodHigh = s.stats.morale >= 72 ? (s.moodHigh || 0) + 1 : 0;
    s.moodLow = s.stats.morale <= 30 ? (s.moodLow || 0) + 1 : 0;
    const wasInspired = !!s.flags.inspired;
    if (s.moodHigh >= 2) s.flags.inspired = true; else delete s.flags.inspired;
    if (s.flags.inspired && !wasInspired) { log(s, '✨ You are inspired. Two half-terms of loving the job: +1 Time each half-term while it lasts.', 'sys'); s.counters.inspired = (s.counters.inspired || 0) + 1; }
    if (!s.flags.inspired && wasInspired) log(s, 'The inspiration fades. Back to four ⏱ a half-term.', 'sys');
    for (const p of s.people) { // relationships drift
      if (p.role === 'partner') p.rel = clamp(p.rel - (s.tick - p.seen > 1 ? 4 : 1));
      else if (p.role === 'head' && smod(s, 'headDrift', null) != null) p.rel = clamp(p.rel + (smod(s, 'headDrift', 50) - p.rel) * 0.12);
      else if (s.tick - p.seen > 3) p.rel = clamp(p.rel + (50 - p.rel) * 0.06);
    }
    if (s.study) {
      s.study.left--;
      if (s.study.left <= 0) {
        const Q = D().quals.find(q => q.id === s.study.id);
        s.flags['qual_' + Q.id] = true; s.study = null;
        log(s, `🎓 You complete ${Q.label}.`, 'sys'); applyFx(s, Q.done, {});
      }
    }
    // 2. the break
    const hol = s.holiday;
    const frac = Math.max(0.1, Math.min(0.98, h.rest + (hol ? hol.rest / 100 : 0) - (s.flags.resident && h.rest < 0.5 ? 0.08 : 0) + traitSum(s, 'rest')));
    const rest = (100 - s.stats.energy) * frac;
    s.stats.energy = clamp(s.stats.energy + rest);
    s.stats.morale = clamp(s.stats.morale + (rest / 14 + (hol ? hol.morale : 0)) * Math.max(0.2, (100 - s.stats.morale) / 60));
    if (hol) log(s, `🧳 ${h.brk[0].toUpperCase() + h.brk.slice(1)}: ${hol.text}`, 'sys');
    else if (h.rest >= 0.6) log(s, `🏖️ The ${h.brk} arrive. You sleep until ten for a week.`, 'sys');
    s.holiday = null;
    // 3. move the calendar
    s.tick++; s.ht = (s.ht + 1) % 6;
    if (s.ht === 0) { s.ay++; s.me.age++; }
    newSection(s);
    if (s.ht === 0) newYear(s);
    if (s.over) return true;
    // 4. money
    const b = budget(s);
    s.money += b.net + b.extra - b.out;
    // 5. events
    if (burnt) startEvent(s, 'burnout');
    if (s.stats.rep <= 3 && !s.pending.some(p => p.id === 'sacked')) startEvent(s, 'sacked');
    const due = s.queue.filter(q => q.at <= s.tick); s.queue = s.queue.filter(q => q.at > s.tick);
    due.forEach(q => startEvent(s, q.id, q.ctx || {}));
    if (s.moodLow >= 3 && !s.pending.some(p => p.id === 'jaded')) { startEvent(s, 'jaded'); s.moodLow = 0; }
    rollEvents(s);
    s.time = s.maxTime + (s.flags.inspired ? 1 : 0);
    s.counters.ticks = (s.counters.ticks || 0) + 1;
    return true;
  }

  function rollVacancies(s) {
    s.vacancies = {};
    const pewBoost = s.school.id === 'hambrook' ? Math.min(0.15, (s.counters.pews || 0) * 0.01) : 0;
    for (const r in LADDER) if (chance(s, LADDER[r].vac * (LADDER[r].external ? 1 : smod(s, 'vacX', 1)) + (LADDER[r].external ? 0 : pewBoost))) s.vacancies[r] = true;
  }
  function newYear(s) {
    rollVacancies(s);
    s.career.years++; s.career.yearsInRole++; s.career.yearsAtSchool++;
    // ECT induction (two years)
    if (s.career.role === 'ECT' && s.career.years >= 2) {
      if (s.stats.teaching >= 38 && s.stats.rep >= 25) { s.career.role = 'Teacher'; s.career.yearsInRole = 0; s.career.peak = 'Teacher'; log(s, '✅ You pass your ECT induction. You are a fully qualified teacher.', 'sys'); s.stats.morale = clamp(s.stats.morale + 8); }
      else if (++s.career.inductionFails >= 2) { endGame(s, 'induction'); return; }
      else log(s, '⚠️ Your induction is extended by a year. The mentor meetings continue.', 'sys');
    }
    // pupils move up
    for (const p of s.people.filter(x => x.role === 'pupil')) {
      p.year++;
      if (p.year > 8) {
        log(s, `🎒 ${p.first} ${p.last} leaves for ${pick(s, D().names.senior[s.school.gender === 'girls' ? 'girls' : 'boys'])}.`, 'sys'); s.counters.leavers = (s.counters.leavers || 0) + 1;
        s.alumni = s.alumni || []; s.alumni.push({ first: p.first, last: p.last, g: p.g, rel: Math.round(p.rel), type: p.type, leftAy: s.ay, school: s.school.name, used: false });
        if (s.alumni.length > 80) s.alumni.shift();
        removePerson(s, p);
      }
    }
    while (s.people.filter(x => x.role === 'pupil').length < 4) addPupil(s, chance(s, 0.6) ? 3 : ri(s, 4, 7));
    // rival climbs too
    const rv = s.people.find(p => p.rival);
    if (rv) {
      rv.rrep = clamp(rv.rrep + ri(s, -2, 6));
      if (rv.rrank < 4 && chance(s, Math.max(0, rv.rrep - 45) / 220)) {
        rv.rrank++; log(s, `⚔️ Your rival ${dispName(rv)} is now ${RIVAL_TITLES[rv.rrank](rv)}.`, 'sys');
        if (rv.rrank > ROLES[s.career.role].rank && !s.flags.rival_above) { s.flags.rival_above = true; startEvent(s, 'rival_boss', { cast: { r: rv.id } }); }
      }
    }
    // staff turnover
    for (const p of s.people.filter(x => x.role === 'colleague')) if (!(p.rival && s.pending.some(q => q.id === 'rival_boss')) && chance(s, p.rival ? 0.05 : 0.12)) {
      log(s, p.rival ? `👋 Your rival ${dispName(p)} leaves ${s.school.name}. The common room feels oddly quiet.` : `👋 ${dispName(p)} leaves ${s.school.name}.`, 'sys'); removePerson(s, p);
      const n = makePerson(s, 'colleague'); log(s, `🆕 ${dispName(n)} joins to teach ${n.subject}.`, 'sys');
    }
    const head = byRole(s, 'head');
    if (head && chance(s, 0.06)) { log(s, `🎩 ${dispName(head)} retires as Head.`, 'sys'); removePerson(s, head); const n = makePerson(s, 'head', { rel: 45 }); log(s, `${dispName(n)} arrives as the new Head.`, 'sys'); }
    // children age
    for (const c of s.people.filter(x => x.role === 'child')) c.age++;
    // mortality and retirement
    const a = s.me.age, risk = a < 50 ? 0.0004 : 0.0004 * Math.exp((a - 50) * 0.12) * (s.stats.energy < 20 ? 2 : 1);
    if (chance(s, risk)) { endGame(s, 'died'); return; }
    if (a >= 68) { endGame(s, 'retire'); return; }
    buildReview(s);
    yearStart(s);
  }
  function yearStart(s) {
    s.yr = { c: JSON.parse(JSON.stringify(s.counters)), worth: netWorth(s), rep: s.stats.rep, teaching: s.stats.teaching, role: s.career.role, school: s.school.name, moraleSum: 0, n: 0, ay: s.ay };
  }
  function buildReview(s) {
    const y = s.yr; if (!y || !y.n) return;
    const d = k => (s.counters[k] || 0) - (y.c[k] || 0);
    const r = {
      year: y.ay + '/' + String((y.ay + 1) % 100).padStart(2, '0'), age: s.me.age - 1, school: y.school, roleStart: y.role, roleEnd: s.career.role,
      morale: Math.round(y.moraleSum / y.n), rep: Math.round(s.stats.rep - y.rep), teaching: Math.round(s.stats.teaching - y.teaching),
      worth: Math.round(netWorth(s) - y.worth), wins: d('wins'), losses: d('losses'), scholarships: d('scholarships'), letters: d('letters'),
      detentions: d('detentions'), leavers: d('leavers'), promotions: d('promotions'), inspired: d('inspired'), burnouts: d('burnouts'), cups: d('croquetCups'), pews: d('pews'),
    };
    const prev = (s.reviews || [])[s.reviews.length - 1];
    r.verdict = r.burnouts ? 'A year that took more than it gave.' : r.promotions ? 'The year you moved up.' : r.inspired ? 'A year you will remember fondly.' : r.morale >= 70 ? 'A good year. You enjoyed it.' : r.morale <= 35 ? 'A hard year. You got through it.' : r.rep >= 5 ? 'A year of quiet progress.' : 'A steady year.';
    if (prev) r.vsMorale = r.morale - prev.morale;
    s.reviews = s.reviews || []; s.reviews.push(r); if (s.reviews.length > 60) s.reviews.shift();
    s.reviewPending = true;
  }

  /* ---------- Endings ---------- */
  const ENDINGS = {
    retire: { emoji: '🎓', title: 'Retired', text: 'You hand back your keys and your lanyard.' },
    quit: { emoji: '🚪', title: 'Left teaching', text: 'You leave the profession for pastures new.' },
    burnout: { emoji: '🕯️', title: 'Burnt out', text: 'The job took everything, and you walked away.' },
    sacked: { emoji: '📦', title: 'Asked to leave', text: 'You clear your desk into a cardboard box.' },
    induction: { emoji: '📋', title: 'Failed induction', text: 'Teaching was not for you, and the paperwork said so.' },
    died: { emoji: '🕊️', title: 'Died in post', text: 'The school flag flies at half-mast.' },
  };
  function honour(s, id) {
    const H = D().honours;
    for (const h of H) if (h.test(s, id)) return h;
    return H[H.length - 1];
  }
  function endGame(s, id, ctx) {
    if (s.over) return;
    s.over = true; s.pending = [];
    const h = honour(s, id);
    s.ending = Object.assign({ id }, ENDINGS[id] || ENDINGS.quit, {
      honour: { id: h.id, emoji: h.emoji, title: h.title, text: h.text },
      years: s.career.years, age: s.me.age, peak: roleLabel(s, s.career.peak), finalRole: roleLabel(s),
      schools: s.career.history.map(x => x.school), money: Math.round(netWorth(s)),
      hidden: Object.assign({}, s.hidden), stats: Object.assign({}, s.stats),
      pews: s.counters.pews || 0, hambrook: !!(s.world && s.world.hambrook) || s.school.id === 'hambrook',
      name: `${s.me.first} ${s.me.last}`, subject: s.me.subject, leavers: s.counters.leavers || 0,
    });
    log(s, `${s.ending.emoji} ${s.ending.title}. ${s.ending.text}`, 'sys');
  }
  function netWorth(s) { return s.money + (s.home.type === 'house' ? (s.home.value - s.home.mortgage) : 0); }

  /* ---------- Life helpers ---------- */
  function setHoliday(s, id) {
    const h = D().holidays.find(x => x.id === id); if (!h || s.over) return null;
    if (s.holiday) s.money += s.holiday.price; // refund previous booking
    if (s.money < h.price && h.price > 0) return null;
    s.money -= h.price; s.holiday = { id, rest: h.rest, morale: h.morale, text: h.text, price: h.price };
    return true;
  }
  function housing(s) {
    const opts = [];
    if (s.home.type !== 'flat') opts.push({ id: 'flat', label: 'Rent a flat', sub: '£1,700 per half-term', ok: true });
    if (s.home.type !== 'school' && s.school.boarding && (s.flags.resident || ROLES[s.career.role].rank >= 2)) opts.push({ id: 'school', label: 'Live in school accommodation', sub: 'Free, but you never quite leave work', ok: true });
    if (s.home.type !== 'house') {
      const price = s.housePrice || (s.housePrice = ri(s, 32, 60) * 10000);
      opts.push({ id: 'house', label: `Buy a house (${money(price)})`, sub: `Deposit ${money(price * 0.15)} · mortgage about ${money(price * 0.85 * 0.0115)} per half-term`, ok: s.money >= price * 0.15 });
    } else opts.push({ id: 'sell', label: `Sell your house (${money(s.home.value)})`, sub: `Mortgage left: ${money(s.home.mortgage)}`, ok: true });
    return opts;
  }
  function setHome(s, id) {
    if (id === 'flat') { if (s.home.type === 'house') return null; s.home = { type: 'flat', label: 'Rented flat', cost: 1700 }; }
    else if (id === 'school') s.home = { type: 'school', label: 'School accommodation', cost: 0 };
    else if (id === 'house') {
      const price = s.housePrice; if (!price || s.money < price * 0.15) return null;
      s.money -= price * 0.15; s.home = { type: 'house', label: 'Your own house', value: price, mortgage: price * 0.85, cost: Math.round(price * 0.85 * 0.0115) }; s.housePrice = null;
      log(s, `🏡 You buy a house for ${money(price)}.`, 'sys'); s.stats.morale = clamp(s.stats.morale + 8);
    } else if (id === 'sell') {
      s.money += s.home.value - s.home.mortgage; log(s, `🏷️ You sell your house for ${money(s.home.value)}.`, 'sys');
      s.home = { type: 'flat', label: 'Rented flat', cost: 1700 };
    } else return null;
    return true;
  }

  /* ---------- Sandbox ---------- */
  function sandboxSet(s, k, v) {
    if (k in s.stats) s.stats[k] = clamp(+v); else if (k in s.hidden) s.hidden[k] = clamp(+v);
    else if (k === 'money') s.money = +v; else if (k === 'role' && ROLES[v]) { s.career.role = v; }
    else if (k === 'time') s.time = +v;
  }
  function forceEvent(s, id) { const e = evById(id); if (!e) return false; const ctx = {}; if (!prep(s, e, ctx)) return false; if (e.choices) { s.pending.unshift({ id, ctx }); markFired(s, e); } else runPassive(s, e, ctx); return true; }
  function rewind(s, idx) { const snap = s.snaps && s.snaps[idx]; if (!snap) return null; const keep = s.snaps.slice(0, idx); const st = snap.state; st.snaps = keep; return st; }

  const API = {
    myTraits, hasTrait, traitSum, rivalTakesJob, buildReview,
    mood: s => s.flags.inspired ? { k: 'inspired', label: '✨ Inspired', tip: '+1 Time' } : s.stats.morale >= 72 ? { k: 'zone', label: '🔥 In the zone', tip: 'Less drain, better performance' } : s.stats.morale <= 30 ? { k: 'jaded', label: '🌧️ Jaded', tip: 'More drain, worse performance' } : null,
    VISIBLE, HIDDEN, STAT_LABEL, HT, ROLES, LADDER, ENDINGS,
    rnd, ri, pick, chance, clamp, money, fmt, check, getVal,
    newGame, advance, choose, currentEvent, actions, doAction, personActions,
    ladder, apply, respList, toggleResp, quals, startQual, salary, budget, netWorth, annualNet,
    setHoliday, housing, setHome, startEvent, forceEvent, sandboxSet, rewind, endGame,
    makeSchool, dispName, personRoleLabel, roleLabel, htLabel, myName, sport, byRole, makePerson, addPupil, workload,
  };
  root.PSL = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
