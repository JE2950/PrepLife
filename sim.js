// Headless auto-player: node sim.js [lives]
require('./src/engine.js'); require('./src/content.js'); require('fs').readdirSync('./src/events').forEach(f=>require('./src/events/'+f));
const P = globalThis.PSL, D = globalThis.PSL_DATA;
const N = +process.argv[2] || 1000;
const out = { endings: {}, peak: {}, honours: {}, age: [], years: [], ticks: [], fired: {}, leftovers: new Set(), errors: [], money: [], burnouts: 0 };
let seedR = 12345;
function botRand() { seedR = (seedR * 1103515245 + 12345) & 0x7fffffff; return seedR / 0x7fffffff; }
for (let life = 0; life < N; life++) {
  let s;
  try {
    s = P.newGame({}, life * 7919 + 1);
    let guard = 0;
    while (!s.over && guard++ < 400) {
      // resolve pending
      let g2 = 0;
      while (s.pending.length && !s.over && g2++ < 20) {
        const ev = P.currentEvent(s); if (!ev) break;
        const ok = ev.choices.filter(c => c.ok);
        if (!ok.length) { s.pending.shift(); continue; }
        // bot avoids quitting choices most of the time
        let c = ok[Math.floor(botRand() * ok.length)];
        if (ev.id === 'burnout') c = ok[0];
        if ((ev.id === 'retire_confirm' || ev.id === 'quit_confirm' || ev.id === 'breakup') && botRand() < 0.9) c = ok[ok.length - 1];
        P.choose(s, c.i);
      }
      if (s.over) break;
      // career moves
      for (const L of P.ladder(s)) if (L.ok && botRand() < 0.6) { P.apply(s, L.role); break; }
      if (!s.pending.length) for (const a of P.advertList(s)) if (a.ok && botRand() < 0.5) { P.applyAdvert(s, a.id); break; }
      for (const r of P.respList(s)) if (!r.on && r.ok && s.career.resp.length < 3 && botRand() < 0.08) P.toggleResp(s, r.id);
      for (const q of P.quals(s)) if (q.ok && botRand() < 0.05) P.startQual(s, q.id);
      if (botRand() < 0.15 && s.money > 2000) P.setHoliday(s, D.holidays[1 + Math.floor(botRand() * 4)].id);
      // spend time
      let g3 = 0;
      while (s.time > 0 && !s.pending.length && !s.over && g3++ < 10) {
        const tabs = ['act', 'act', 'act', 'life'];
        const acts = P.actions(s, tabs[Math.floor(botRand() * 4)]).filter(a => a.ok && a.cost > 0 && !['retire', 'quit'].includes(a.id));
        // tired bot rests
        if (s.stats.energy - P.workload(s) < 15) { P.doAction(s, 'sleep'); continue; }
        if (botRand() < 0.35 && s.people.length) {
          const p = s.people[Math.floor(botRand() * s.people.length)];
          const pa = P.personActions(s, p.id).filter(a => a.ok && a.cost > 0 && a.id !== 'breakup');
          if (pa.length) { P.doAction(s, pa[Math.floor(botRand() * pa.length)].id, p.id); continue; }
        }
        if (!acts.length) break;
        P.doAction(s, acts[Math.floor(botRand() * acts.length)].id);
      }
      while (s.pending.length && !s.over) { const ev = P.currentEvent(s); if (!ev) break; const ok = ev.choices.filter(c => c.ok); if (!ok.length) { s.pending.shift(); continue; } let c = ok[Math.floor(botRand() * ok.length)]; if (['retire_confirm', 'quit_confirm', 'breakup'].includes(ev.id)) c = ok[ok.length - 1]; if (ev.id === 'burnout') c = ok[0]; P.choose(s, c.i); }
      if (s.over) break;
      P.advance(s);
    }
    if (!s.over) out.errors.push('life ' + life + ' never ended (age ' + s.me.age + ')');
    const e = s.ending || { id: 'none', honour: { id: 'none' }, peak: '?' };
    out.endings[e.id] = (out.endings[e.id] || 0) + 1;
    out.honours[e.honour.id] = (out.honours[e.honour.id] || 0) + 1;
    out.peak[s.career.peak] = (out.peak[s.career.peak] || 0) + 1;
    out.age.push(s.me.age); out.years.push(s.career.years); out.ticks.push(s.tick); out.money.push(P.netWorth(s));
    out.burnouts += s.counters.burnouts || 0;
    for (const k in s.fired) out.fired[k] = (out.fired[k] || 0) + s.fired[k];
    for (const sec of s.log) for (const l of sec.lines) { const m = l.t.match(/\{[\w.]+\}/g); if (m) m.forEach(x => out.leftovers.add(x + ' in: ' + l.t.slice(0, 60))); if (/undefined|NaN/.test(l.t)) out.errors.push('bad text: ' + l.t); }
  } catch (err) { out.errors.push('life ' + life + ': ' + err.stack.split('\n').slice(0, 3).join(' | ')); }
}
const avg = a => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
console.log('Lives', N);
console.log('Endings', out.endings);
console.log('Peak role', out.peak);
console.log('Honours', out.honours);
console.log('End age avg', avg(out.age), 'career years avg', avg(out.years), 'median', med(out.years), 'taps (half-terms) avg', avg(out.ticks));
console.log('Net worth median', Math.round(med(out.money)), 'burnout events per life', (out.burnouts / N).toFixed(2));
const evs = D.events.map(e => e.id);
console.log('Never fired', evs.filter(x => !out.fired[x]));
console.log('Fired per life', Object.fromEntries(Object.entries(out.fired).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, (v / N).toFixed(2)])));
console.log('Leftover tokens', [...out.leftovers].slice(0, 20));
console.log('Errors', out.errors.length, out.errors.slice(0, 10));
