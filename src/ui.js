/* Prep School Life — UI */
(function () {
  'use strict';
  const P = window.PSL, D = window.PSL_DATA;
  const $app = document.getElementById('app');
  const SAVE = 'psl.save.v1', HOF = 'psl.hof.v1';
  let S = null;            // game state
  let result = null;       // outcome card waiting to be shown
  let sheet = null;        // {tab} or {person:id}
  let scrollBottom = true;

  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // In the iOS app, saves go to native storage via the "store" handler; on the web, localStorage.
  const NATIVE = !!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.store);
  const nativeData = window.__NATIVE_STORE || {};
  const store = {
    get(k) {
      try { return JSON.parse(NATIVE ? (nativeData[k] == null ? 'null' : nativeData[k]) : localStorage.getItem(k)); } catch (e) { return null; }
    },
    set(k, v) {
      const s = JSON.stringify(v);
      if (NATIVE) { nativeData[k] = s; try { window.webkit.messageHandlers.store.postMessage({ k, v: s }); } catch (e) { } return; }
      try { localStorage.setItem(k, s); } catch (e) { }
    },
    del(k) {
      if (NATIVE) { delete nativeData[k]; try { window.webkit.messageHandlers.store.postMessage({ k }); } catch (e) { } return; }
      try { localStorage.removeItem(k); } catch (e) { }
    },
  };
  const haptic = kind => {
    try { if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptic) window.webkit.messageHandlers.haptic.postMessage(kind || 'light'); else if (navigator.vibrate) navigator.vibrate(12); } catch (e) { }
  };
  const save = () => { if (S) store.set(SAVE, S); };
  const SETTINGS = 'psl.settings.v1', ACH = 'psl.ach.v1', META = 'psl.meta.v1';
  const settings = Object.assign({ sound: true, theme: 'light' }, store.get(SETTINGS) || {});
  function applyTheme() {
    const dark = settings.theme === 'dark' || (settings.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    document.body.classList.toggle('dark', !!dark);
  }
  applyTheme();
  let audio = null;
  function chime(kind) {
    if (!settings.sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const t = audio.currentTime, base = kind === 'ach' ? 1046 : 740;
      const parts = kind === 'ach' ? [[1, .35], [1.5, .2], [2, .12]] : [[1, .45], [2.76, .22], [5.4, .1], [8.93, .05]];
      parts.forEach(([m, g], i) => {
        const o = audio.createOscillator(), v = audio.createGain();
        o.type = 'sine'; o.frequency.value = base * m;
        const st = t + (kind === 'ach' ? i * 0.09 : 0);
        v.gain.setValueAtTime(0.0001, st); v.gain.exponentialRampToValueAtTime(g * 0.4, st + 0.008);
        v.gain.exponentialRampToValueAtTime(0.0001, st + (kind === 'ach' ? 0.6 : 1.8 / Math.sqrt(m)));
        o.connect(v); v.connect(audio.destination); o.start(st); o.stop(st + 2);
      });
    } catch (e) { }
  }
  const meta = Object.assign({ schools: [], honours: [], careers: 0 }, store.get(META) || {});
  const got = store.get(ACH) || {};
  let toasts = [], toasting = false;
  function checkAch() {
    if (!S) return;
    if (S.school && !meta.schools.includes(S.school.id)) { meta.schools.push(S.school.id); store.set(META, meta); }
    if (S.over && !S.metaCounted) {
      meta.careers++; if (S.ending && !meta.honours.includes(S.ending.honour.id)) meta.honours.push(S.ending.honour.id);
      S.metaCounted = true; store.set(META, meta); save();
    }
    for (const a of D.achievements) {
      if (got[a.id]) continue;
      let ok = false; try { ok = a.test(S, meta, P); } catch (e) { }
      if (ok) { got[a.id] = new Date().toISOString().slice(0, 10); toasts.push(a); }
    }
    if (toasts.length) { store.set(ACH, got); if (!toasting) showToasts(); }
  }
  function showToasts() {
    const a = toasts.shift(); if (!a) { toasting = false; return; }
    toasting = true; chime('ach'); haptic('success');
    const t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = `<span style="font-size:24px">${esc(a.emoji)}</span><span><b>Achievement</b>${esc(a.title)}</span>`;
    document.body.appendChild(t); setTimeout(() => { t.remove(); showToasts(); }, 3600);
  }
  function crestFor(school) {
    const t = school && D.schools.find(x => x.id === school.id);
    const c = (t && t.crest) || { fill: '#f1d38a', band: '#8a2433', ink: '#18233d', letter: 'P' };
    return { svg: `<svg viewBox="0 0 44 48"><path d="M3 4h38v18c0 13-9 21-19 24C12 43 3 35 3 22z" fill="${c.fill}" stroke="#fff" stroke-width="1.5"/><path d="M3 15h38" stroke="${c.band}" stroke-width="3"/></svg>`, ink: c.ink, letter: c.letter };
  }
  const barColour = v => v >= 60 ? 'var(--good)' : v >= 30 ? 'var(--mid)' : 'var(--bad)';
  const crestSVG = (fill = '#f1d38a') => `<svg viewBox="0 0 44 48"><path d="M3 4h38v18c0 13-9 21-19 24C12 43 3 35 3 22z" fill="${fill}" stroke="#fff" stroke-width="1.5"/><path d="M3 15h38" stroke="#8a2433" stroke-width="3"/></svg>`;

  const HELP = `<div class="pop" style="border-top-color:var(--gold);max-height:88vh;overflow-y:auto;text-align:left"><div class="big">🔔</div><h2>How to play</h2>
    <p style="text-align:left;font-size:14px"><b>Tap Next ½</b> to move on one half-term. Six per school year, from Michaelmas to the summer holidays.</p>
    <p style="text-align:left;font-size:14px"><b>Time.</b> You get four ⏱ each half-term. Spend them in Activities, People and Career.</p>
    <p style="text-align:left;font-size:14px"><b>Energy.</b> Your job drains it every half-term (see Workload). Holidays give some back. Let it hit zero and you burn out.</p>
    <p style="text-align:left;font-size:14px"><b>Promotion.</b> Pass your two-year ECT induction, build Teaching and Reputation, then apply in Lent or early Summer when a post comes up.</p>
    <p style="text-align:left;font-size:14px"><b>Morale.</b> At 72%+ you're in the zone: less drain and better performance. Two half-terms in a row makes you Inspired (+1 Time). If Energy runs out while Morale is 70%+, you get one second wind a year. At 30% or below you're Jaded: more drain, and three jaded half-terms brings a crisis.</p>
    <p style="text-align:left;font-size:14px"><b>Hidden stats.</b> Patience, Organisation, Charisma, Ambition and Karma shape every outcome. You only see them at the end.</p>
    <p style="text-align:left;font-size:14px"><b>Schools.</b> Each school plays differently. Some reward things they never mention.</p>
    <p style="text-align:left;font-size:13px;color:var(--muted)">Tap your crest for the sandbox: edit stats, fire events, rewind time.</p>
    <button class="choice" id="helpok">Ring the bell</button></div>`;
  function showHelp() { const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = HELP; $app.appendChild(m); m.querySelector('#helpok').onclick = () => { S.helpSeen = true; save(); render(); }; }
  /* ---------------- Start screen ---------------- */
  function renderStart() {
    const saved = store.get(SAVE);
    const hof = store.get(HOF) || [];
    const subj = D.subjects.map(s => `<option${s === 'Latin' ? ' selected' : ''}>${s}</option>`).join('');
    $app.innerHTML = `<div class="start">
      <div class="bigcrest">${crestSVG()}<span style="position:absolute;inset:0;display:grid;place-items:center;font:700 22px Fraunces,serif;color:#18233d;padding-bottom:8px">PSL</span></div>
      <h1>Prep School Life</h1>
      <p class="tag">From ECT to Head, one half-term at a time.</p>
      ${saved && !saved.over ? `<button class="btn green" id="cont">Continue as ${esc(saved.me.title + ' ' + saved.me.last)}<br><small style="font-weight:400;opacity:.8">${esc(P.roleLabel(saved))}, ${esc(saved.school.name)}</small></button>` : ''}
      <div class="two"><div><label>First name</label><input id="f" placeholder="Random"></div><div><label>Surname</label><input id="l" placeholder="Random"></div></div>
      <div class="two"><div><label>Title</label><select id="t"><option value="">Random</option><option>Mr</option><option>Mrs</option><option>Ms</option><option>Miss</option><option>Dr</option></select></div>
      <div><label>Gender</label><select id="g"><option value="">Random</option><option value="m">Male</option><option value="f">Female</option></select></div></div>
      <div class="two"><div><label>Subject</label><select id="s"><option value="">Random</option>${subj}</select></div>
      <div><label>Start age</label><select id="a"><option value="">Random</option>${[22, 23, 24, 25, 26, 27, 28, 30, 35].map(n => `<option>${n}</option>`).join('')}</select></div></div>
      <label>Traits · pick up to two</label><div class="traits" id="traits">${D.traits.map(t => `<button class="trait" data-trait="${t.id}">${esc(t.emoji)} ${esc(t.label)}</button>`).join('')}</div>
      <div class="traitinfo" id="traitinfo">Optional. Each has a perk and a drawback.</div>
      <label>School</label><select id="sc"><option value="random">Random</option>${D.schools.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select>
      <div id="blurb" style="font-size:12.5px;opacity:.75;margin-top:6px;min-height:34px"></div>
      <button class="btn" id="go">Start a career</button>
      <button class="btn ghost" id="rand">Random teacher</button>
      <button class="btn ghost" id="achbtn">🏅 Achievements · ${Object.keys(got).length} of ${D.achievements.length}</button>
      <div class="two" style="margin-top:10px"><button class="btn ghost" style="margin:0" id="sndbtn">${settings.sound ? '🔔 Sound on' : '🔕 Sound off'}</button><button class="btn ghost" style="margin:0" id="thmbtn">${{ light: '☀️ Light', dark: '🌙 Dark', auto: '🌓 Auto' }[settings.theme]}</button></div>
      <p style="font-size:12px;opacity:.55;text-align:center;margin-top:18px">v1.1 · ${D.events.length} events · 4 schools${NATIVE ? '' : '<br>On iPhone: open in Safari, tap Share, then Add to Home Screen.'}</p>
      ${hof.length ? `<h3 style="margin:26px 0 6px">Honours board</h3>${hof.slice(-15).reverse().map(h => `<div class="hof"><span>${esc(h.emoji)} <b>${esc(h.name)}</b><br><small style="opacity:.7">${esc(h.peak)} · ${h.years} yrs · ${esc(h.ending)}</small></span><span style="text-align:right;color:#f1d38a">${esc(h.honour)}</span></div>`).join('')}` : ''}
    </div>`;
    const v = id => document.getElementById(id).value.trim();
    const picked = [];
    const info = document.getElementById('traitinfo');
    document.querySelectorAll('[data-trait]').forEach(b => b.onclick = () => {
      const id = b.dataset.trait, i = picked.indexOf(id);
      if (i >= 0) picked.splice(i, 1); else { if (picked.length >= 2) { const old = picked.shift(); document.querySelector(`[data-trait="${old}"]`).classList.remove('on'); } picked.push(id); }
      b.classList.toggle('on', picked.includes(id));
      info.innerHTML = picked.length ? picked.map(p => { const t = D.traits.find(x => x.id === p); return `<b>${esc(t.label)}:</b> ＋ ${esc(t.perk)} · − ${esc(t.drawback)}`; }).join('<br>') : 'Optional. Each has a perk and a drawback.';
    });
    document.getElementById('go').onclick = () => begin({ first: v('f'), last: v('l'), title: v('t'), gender: v('g'), subject: v('s'), age: +v('a') || undefined, school: v('sc'), traits: picked.slice() });
    document.getElementById('achbtn').onclick = renderAchPage;
    document.getElementById('sndbtn').onclick = () => { settings.sound = !settings.sound; store.set(SETTINGS, settings); if (settings.sound) chime('bell'); renderStart(); };
    document.getElementById('thmbtn').onclick = () => { settings.theme = { light: 'dark', dark: 'auto', auto: 'light' }[settings.theme]; store.set(SETTINGS, settings); applyTheme(); renderStart(); };
    const sc = document.getElementById('sc'), bl = document.getElementById('blurb');
    sc.onchange = () => { const t = D.schools.find(x => x.id === sc.value); bl.textContent = t ? `${t.blurb} ${t.boarding ? 'Boarding' : 'Day'}, ${t.gender}.` : 'A school picked at random.'; }; sc.onchange();
    document.getElementById('rand').onclick = () => begin({ traits: [D.traits[Math.floor(Math.random() * D.traits.length)].id] });
    const c = document.getElementById('cont'); if (c) c.onclick = () => { S = saved; render(); };
  }
  function achListHTML() {
    return D.achievements.map(a => `<div class="item ach ${got[a.id] ? 'got' : ''}"><span class="e">${got[a.id] ? esc(a.emoji) : '🔒'}</span><span class="t"><b>${esc(a.title)}</b><small>${esc(a.desc)}${got[a.id] ? ' · ' + esc(got[a.id]) : ''}</small></span></div>`).join('');
  }
  function renderAchPage() {
    $app.innerHTML = `<div class="hdr"><div class="who"><b>Achievements</b><small>${Object.keys(got).length} of ${D.achievements.length} · ${meta.careers} careers finished</small></div><button class="x" style="color:#fff" id="back">✕</button></div><div class="journal" style="padding-top:10px">${achListHTML()}</div>`;
    document.getElementById('back').onclick = renderStart;
  }
  function begin(o) {
    Object.keys(o).forEach(k => { if (!o[k] || (Array.isArray(o[k]) && !o[k].length)) delete o[k]; });
    if (o.title === 'Mr') o.gender = o.gender || 'm';
    if (['Mrs', 'Ms', 'Miss'].includes(o.title)) o.gender = o.gender || 'f';
    S = P.newGame(o); result = null; sheet = null; save(); render();
  }

  /* ---------------- Main game ---------------- */
  function render() {
    if (!S) return renderStart();
    if (S.over) return renderEnd();
    const st = S.stats, drain = Math.round(P.workload(S));
    const statHTML = P.VISIBLE.map(k => `<div class="stat"><div class="row"><span>${P.STAT_LABEL[k]}</span><b>${Math.round(st[k])}%</b></div><div class="bar"><i style="width:${st[k]}%;background:${barColour(st[k])}"></i></div></div>`).join('');
    const pips = Array.from({ length: S.maxTime }, (_, i) => `<span class="pip ${i < S.time ? 'on' : ''}"></span>`).join('');
    const danger = st.energy - drain <= 0;
    const jl = S.log.slice(-60).map(sec => `<div class="sec"><h3>${esc(sec.h)}<small>${esc(sec.sub)}</small></h3>${sec.lines.map(l => `<div class="line ${l.k}">${esc(l.t)}</div>`).join('')}</div>`).join('');
    $app.innerHTML = `
      <div class="hdr">
        <button class="crest" id="sandbox" aria-label="Sandbox">${crestFor(S.school).svg}<span style="color:${crestFor(S.school).ink}">${esc(crestFor(S.school).letter)}</span></button>
        <div class="who"><b>${esc(P.myName(S))}</b><small>${esc(P.roleLabel(S))}${S.career.team && S.flags.coach ? ' · ' + esc(S.career.team) + ' coach' : ''}</small><small>${esc(S.school.name)}</small></div>
        <div class="purse">Age ${S.me.age}<b>${P.money(S.money)}</b></div>
      </div>
      <div class="stats">${statHTML}
        <div class="timebar"><span class="pips">Time ${pips}${(m => m ? `<span class="chip" title="${esc(m.tip)}">${esc(m.label)}</span>` : '')(P.mood(S))}</span><span class="${danger ? 'warn' : ''}">Workload −${drain} energy${danger ? ' ⚠️' : ''}</span></div>
      </div>
      <div class="journal" id="journal">${jl}</div>
      <nav class="nav">
        <button data-tab="career"><span class="ico">🎓</span>Career</button>
        <button data-tab="act"><span class="ico">📚</span>Activities</button>
        <button class="next" id="next" ${S.pending.length ? 'disabled' : ''}><span class="ico">🔔</span>Next ½</button>
        <button data-tab="people"><span class="ico">👥</span>People</button>
        <button data-tab="life"><span class="ico">🏡</span>Life</button>
      </nav>`;
    const j = document.getElementById('journal');
    if (scrollBottom) j.scrollTop = j.scrollHeight;
    $app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { sheet = { tab: b.dataset.tab }; render(); });
    document.getElementById('next').onclick = () => { haptic('light'); chime('bell'); if (P.advance(S)) { scrollBottom = true; save(); render(); } };
    document.getElementById('sandbox').onclick = () => { sheet = { tab: 'sandbox' }; render(); };
    if (!S.helpSeen) return showHelp();
    checkAch();
    if (S.reviewPending) return showReview();
    if (sheet) renderSheet();
    if (result) renderResult();
    else if (S.pending.length) renderEvent();
  }

  function showReview() {
    const r = S.reviews[S.reviews.length - 1];
    if (!r) { S.reviewPending = false; return render(); }
    const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
    const cell = (label, val) => `<div>${esc(label)}<b>${val}</b></div>`;
    const cells = [cell('Average morale', r.morale + '%' + (r.vsMorale != null ? ` <small style="font-size:11px;color:var(--muted)">(${sign(r.vsMorale)} on last year)</small>` : '')),
      cell('Reputation', sign(r.rep)), cell('Teaching', sign(r.teaching)), cell('Net worth', (r.worth < 0 ? '−' : '+') + P.money(Math.abs(r.worth)))];
    if (r.wins || r.losses) cells.push(cell('Matches', `${r.wins}W ${r.losses}L`));
    if (r.scholarships) cells.push(cell('Scholarships', r.scholarships));
    if (r.letters) cells.push(cell('Thank-you letters', r.letters));
    if (r.leavers) cells.push(cell('Pupils waved off', r.leavers));
    if (r.detentions) cells.push(cell('Detentions given', r.detentions));
    if (r.cups) cells.push(cell('Croquet trophies', r.cups));
    if (r.inspired) cells.push(cell('Times inspired', r.inspired));
    if (r.burnouts) cells.push(cell('Burnouts', r.burnouts));
    const roleLine = r.roleStart !== r.roleEnd ? `${P.roleLabel(S, r.roleStart)} → ${P.roleLabel(S)}` : P.roleLabel(S);
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="pop" style="border-top-color:var(--gold);max-height:88vh;overflow-y:auto"><div class="big">📅</div><h2>The ${esc(r.year)} year</h2>
      <p style="margin-bottom:4px"><b>${esc(r.verdict)}</b></p><p style="font-size:13px;color:var(--muted);margin:0">${esc(roleLine)} · ${esc(r.school)} · age ${r.age}</p>
      <div class="rv">${cells.join('')}</div><button class="choice" id="rvok">On to Michaelmas</button></div>`;
    $app.appendChild(m);
    m.querySelector('#rvok').onclick = () => { S.reviewPending = false; save(); render(); };
  }
  function after(res) {
    if (res && res.text != null && !res.started) { result = res; const net = (res.fx || []).reduce((a, f) => a + (f.money ? 0 : f.d), 0); haptic(net < 0 ? 'warning' : net > 0 ? 'success' : 'light'); }
    save();
    if (S.over) { sheet = null; result = null; }
    render();
  }

  /* ---------------- Event & result modals ---------------- */
  function renderEvent() {
    const ev = P.currentEvent(S); if (!ev) return;
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="pop"><div class="big">${esc(ev.emoji)}</div><h2>${esc(ev.title)}</h2><p>${esc(ev.text)}</p>
      ${ev.choices.map(c => `<button class="choice" data-i="${c.i}" ${c.ok ? '' : 'disabled'}>${esc(c.label)}${!c.ok && c.why ? `<br><small>${esc(c.why)}</small>` : ''}</button>`).join('')}</div>`;
    $app.appendChild(m);
    m.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const r = P.choose(S, +b.dataset.i); after(r && r.text ? r : null); });
  }
  function fxChips(fx) {
    if (!fx || !fx.length) return '';
    return `<div class="fx">${fx.map(f => `<span class="${f.d > 0 ? 'up' : 'dn'}">${esc(f.k)} ${f.money ? (f.d > 0 ? '+' : '−') + P.money(Math.abs(f.d)) : (f.d > 0 ? '+' : '−') + Math.abs(f.d)}</span>`).join('')}</div>`;
  }
  function renderResult() {
    const r = result;
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="pop" style="border-top-color:var(--green)"><div class="big">${esc(r.emoji || '📜')}</div><h2>${esc(r.title || '')}</h2><p>${esc(r.text)}</p>${fxChips(r.fx)}<button class="choice" id="ok">Carry on</button></div>`;
    $app.appendChild(m);
    m.querySelector('#ok').onclick = () => { result = null; render(); };
  }

  /* ---------------- Sheets ---------------- */
  function item({ e, t, s, r, attrs = '', dis, on, bar }) {
    return `<button class="item ${on ? 'on' : ''}" ${attrs} ${dis ? 'disabled' : ''}><span class="e">${esc(e || '')}</span><span class="t"><b>${esc(t)}</b>${s ? `<small>${esc(s)}</small>` : ''}${bar != null ? `<div class="mini"><i style="width:${bar}%;background:${barColour(bar)}"></i></div>` : ''}</span><span class="r">${r || ''}</span></button>`;
  }
  const costTag = (c, ok, why) => c ? `<b style="color:var(--green)">${c} ⏱</b>${!ok && why ? `<br>${esc(why)}` : ''}` : (!ok && why ? esc(why) : '');

  function renderSheet() {
    const sc = document.createElement('div'); sc.className = 'scrim';
    let title = '', body = '';
    const tab = sheet.tab;
    if (sheet.person) { const o = personSheet(sheet.person); title = o.title; body = o.body; }
    else if (tab === 'act') { title = 'Activities'; body = actionsHTML('act'); }
    else if (tab === 'life') { title = 'Life'; body = lifeHTML(); }
    else if (tab === 'career') { title = 'Career'; body = careerHTML(); }
    else if (tab === 'people') { title = 'People'; body = peopleHTML(); }
    else if (tab === 'sandbox') { title = 'Sandbox'; body = sandboxHTML(); }
    else if (tab === 'ach') { title = 'Achievements'; body = achListHTML(); }
    else if (tab === 'reviews') { title = 'Past school years'; body = (S.reviews || []).slice().reverse().map(r => `<div class="card"><h3>${esc(r.year)} · ${esc(r.school)}</h3><div style="font-size:13.5px"><b>${esc(r.verdict)}</b><br>Morale ${r.morale}% · Rep ${r.rep >= 0 ? '+' : ''}${r.rep} · Teaching ${r.teaching >= 0 ? '+' : ''}${r.teaching}${r.wins || r.losses ? ` · ${r.wins}W ${r.losses}L` : ''}${r.scholarships ? ` · ${r.scholarships} scholarships` : ''}</div></div>`).join('') || '<div class="card">Your first review arrives at the end of the summer holidays.</div>'; }
    sc.innerHTML = `<div class="sheet"><div class="sheet-h"><h2>${esc(title)}</h2><button class="x" id="close">✕</button></div><div class="sheet-b">${body}</div></div>`;
    $app.appendChild(sc);
    sc.onclick = e => { if (e.target === sc) { sheet = null; render(); } };
    sc.querySelector('#close').onclick = () => { sheet = sheet.person ? { tab: 'people' } : ['ach', 'reviews'].includes(sheet.tab) ? { tab: 'life' } : null; render(); };
    wireSheet(sc);
  }
  function timeNote() { return `<div class="card" style="padding:8px 12px;font-size:13px">Time left this half-term: <b>${S.time}</b> of ${S.maxTime} · Energy ${Math.round(S.stats.energy)}% · Workload −${Math.round(P.workload(S))}</div>`; }

  function actionsHTML(tab) {
    const list = P.actions(S, tab); let html = tab === 'act' ? timeNote() : '', g = null;
    for (const a of list) {
      if (a.group !== g) { g = a.group; html += `<div class="grp">${esc(g)}</div>`; }
      html += item({ e: a.emoji, t: a.label, s: a.sub, r: costTag(a.cost, a.ok, a.why), attrs: `data-act="${a.id}"`, dis: !a.ok });
    }
    return html;
  }
  function careerHTML() {
    const c = S.career, b = P.budget(S);
    let h = timeNote() + `<div class="card"><h3>${esc(P.roleLabel(S))}</h3>
      <div class="kv"><span>School</span><b>${esc(S.school.name)}</b></div>
      <div class="kv"><span>Type</span><span>${S.school.boarding ? 'Boarding' : 'Day'} · ${esc(S.school.gender)} · ${'★'.repeat(S.school.prestige)}</span></div>
      <div style="font-size:12.5px;color:var(--muted);padding:4px 0">${esc((D.schools.find(x => x.id === S.school.id) || {}).blurb || '')}</div>
      <div class="kv"><span>Years teaching</span><span>${c.years} (${c.yearsAtSchool} here, ${c.yearsInRole} in role)</span></div>
      <div class="kv"><span>Salary</span><span>${P.money(P.salary(S))} a year</span></div>
      <div class="kv"><span>Performance</span><span>${Math.round(c.perf)}%</span></div>
      ${P.myTraits(S).map(t => `<div class="kv"><span>${esc(t.emoji)} ${esc(t.label)}</span><span style="text-align:right;font-size:12px">＋ ${esc(t.perk)}<br>− ${esc(t.drawback)}</span></div>`).join('')}
      ${c.role === 'ECT' ? `<div class="kv"><span>Induction</span><span>Teaching 38+ by end of year 2</span></div>` : ''}</div>`;
    const lad = P.ladder(S);
    h += `<div class="grp">Promotion</div>`;
    if (!lad.length) h += `<div class="card" style="font-size:13.5px">${c.role === 'ECT' ? 'Pass your induction first.' : c.role === 'Head' ? 'You are at the top.' : 'No promotion routes from here.'}</div>`;
    for (const L of lad) {
      const status = L.applied ? 'Applied this year' : !L.vacant ? 'No vacancy this year' : ![2, 3, 4].includes(S.ht) ? 'Applications: Lent and Summer ½1' : '';
      h += `<button class="item" data-apply="${L.role}" ${L.ok ? '' : 'disabled'}><span class="e">📈</span><span class="t"><b>Apply: ${esc(L.label)}${L.external ? ' (another school)' : ''}</b><small>${L.reqs.map(r => `<span class="req ${r.ok ? 'ok' : 'no'}">${r.ok ? '✓' : '✗'} ${esc(r.label)}</span>`).join('')}</small>${status ? `<small>${esc(status)}</small>` : ''}</span><span class="r"><b style="color:var(--green)">1 ⏱</b></span></button>`;
    }
    h += `<div class="grp">Responsibilities</div>`;
    for (const r of P.respList(S)) h += item({ e: r.emoji, t: r.label, s: `${r.sub} · −${r.drain} energy per half-term`, r: r.on ? 'Give up' : costTag(1, r.ok, r.why), attrs: `data-resp="${r.id}"`, dis: !r.ok, on: r.on });
    h += `<div class="grp">Qualifications</div>`;
    for (const q of P.quals(S)) h += item({ e: q.emoji, t: q.label, s: q.done ? 'Completed' : q.studying ? `Studying · ${q.left} half-terms left` : q.sub, r: q.done || q.studying ? '' : costTag(1, q.ok, q.why), attrs: `data-qual="${q.id}"`, dis: !q.ok, on: q.done || q.studying });
    h += `<div class="grp">Move on</div>` + item({ e: '🧳', t: 'Look for a job at another school', s: 'Same role, new school · Lent only', r: costTag(1, [2, 3].includes(S.ht) && S.time >= 1, ''), attrs: 'data-move="1"', dis: !([2, 3].includes(S.ht) && S.time >= 1) || S.career.role === 'ECT' });
    return h;
  }
  function peopleHTML() {
    const groups = [['Staff', ['head', 'deputy', 'slt', 'hod', 'bursar', 'matron', 'colleague']], ['Pupils', ['pupil']], ['Parents', ['parent']], ['Family', ['partner', 'child']]];
    let h = '';
    for (const [g, roles] of groups) {
      const ps = S.people.filter(p => roles.includes(p.role)); if (!ps.length) continue;
      h += `<div class="grp">${g}</div>`;
      for (const p of ps) h += item({ e: { head: '🎩', deputy: '📋', hod: '📘', bursar: '💼', matron: '🩹', slt: '📏', colleague: p.rival ? '⚔️' : '🧑‍🏫', pupil: p.g === 'f' ? '👧' : '👦', parent: '🧥', partner: '❤️', child: '🧸' }[p.role], t: P.dispName(p) + (p.role === 'pupil' ? '' : ''), s: P.personRoleLabel(S, p), bar: Math.round(p.rel), r: '›', attrs: `data-person="${p.id}"` });
    }
    return h;
  }
  function personSheet(id) {
    const p = S.people.find(x => x.id === id); if (!p) { sheet = { tab: 'people' }; return { title: 'People', body: peopleHTML() }; }
    let h = `<div class="card"><h3>${esc(p.role === 'pupil' ? p.first + ' ' + p.last : P.dispName(p))}</h3>
      <div class="kv"><span>${esc(P.personRoleLabel(S, p))}</span><span>${p.role === 'pupil' || p.role === 'child' ? '' : esc(p.first + ' ' + p.last)}</span></div>
      <div class="kv"><span>Relationship</span><b>${Math.round(p.rel)}%</b></div>
      ${p.role !== 'child' ? `<div class="kv"><span>Known for</span><span style="text-align:right">${esc(p.quirk)}</span></div>` : ''}
      <div class="mini"><i style="width:${p.rel}%;background:${barColour(p.rel)}"></i></div></div><div class="grp">Interact · ${S.time} time left</div>`;
    for (const a of P.personActions(S, id)) h += item({ e: a.emoji, t: a.label, s: a.sub, r: costTag(a.cost, a.ok, a.why), attrs: `data-pact="${a.id}"`, dis: !a.ok });
    return { title: P.dispName(p), body: h };
  }
  function lifeHTML() {
    const b = P.budget(S);
    let h = `<div class="card"><h3>Money</h3>
      <div class="kv"><span>Take-home pay</span><span>${P.money(b.net)} per half-term</span></div>
      ${b.extra ? `<div class="kv"><span>Tutoring</span><span>${P.money(b.extra)}</span></div>` : ''}
      <div class="kv"><span>${esc(S.home.label)}</span><span>−${P.money(b.costs.home)}</span></div>
      <div class="kv"><span>Living costs</span><span>−${P.money(b.costs.living)}</span></div>
      ${b.costs.kids ? `<div class="kv"><span>Children</span><span>−${P.money(b.costs.kids)}</span></div>` : ''}
      ${b.costs.study ? `<div class="kv"><span>Course fees</span><span>−${P.money(b.costs.study)}</span></div>` : ''}
      <div class="kv"><span><b>Each half-term</b></span><b>${P.money(b.net + b.extra - b.out)}</b></div>
      <div class="kv"><span>Net worth</span><span>${P.money(P.netWorth(S))}</span></div></div>`;
    h += `<div class="grp">Next break · ${esc(P.HT[S.ht].brk)}</div>`;
    for (const hol of D.holidays) h += item({ e: { home: '🛋️', family: '👪', cottage: '🌧️', abroad: '☀️', ski: '⛷️' }[hol.id], t: hol.label, s: hol.price ? P.money(hol.price) : 'Free', on: S.holiday && S.holiday.id === hol.id, attrs: `data-hol="${hol.id}"`, dis: hol.price > S.money + (S.holiday ? S.holiday.price : 0) });
    h += `<div class="grp">Home</div>` + `<div class="card" style="font-size:13.5px">You live in: <b>${esc(S.home.label)}</b></div>`;
    for (const o of P.housing(S)) h += item({ e: o.id === 'sell' ? '🏷️' : o.id === 'house' ? '🏡' : o.id === 'school' ? '🏫' : '🏢', t: o.label, s: o.sub, attrs: `data-home="${o.id}"`, dis: !o.ok });
    h += actionsHTML('life');
    h += `<div class="grp">Settings and extras</div>
      <button class="item" id="achsheet"><span class="e">🏅</span><span class="t"><b>Achievements</b><small>${Object.keys(got).length} of ${D.achievements.length} unlocked</small></span><span class="r">›</span></button>
      <button class="item" id="reviews"><span class="e">📅</span><span class="t"><b>Past school years</b><small>${(S.reviews || []).length} reviews</small></span><span class="r">›</span></button>
      <button class="item" id="sndtog"><span class="e">${settings.sound ? '🔔' : '🔕'}</span><span class="t"><b>Sound</b><small>${settings.sound ? 'Handbell on Next, chimes for achievements' : 'Off'}</small></span></button>
      <button class="item" id="thmtog"><span class="e">${{ light: '☀️', dark: '🌙', auto: '🌓' }[settings.theme]}</span><span class="t"><b>Theme</b><small>${{ light: 'Light', dark: 'Dark (for night duty)', auto: 'Match my phone' }[settings.theme]}</small></span></button>
      <button class="item" id="helpbtn"><span class="e">❓</span><span class="t"><b>How to play</b></span></button>`;
    return h;
  }
  function sandboxHTML() {
    const all = P.VISIBLE.concat(P.HIDDEN);
    let h = `<div class="card" style="font-size:13px">Testing tools. Hidden stats are shown here only.</div>`;
    for (const k of all) { const v = Math.round(k in S.stats ? S.stats[k] : S.hidden[k]); h += `<label style="font-size:12.5px;display:flex;justify-content:space-between">${P.STAT_LABEL[k]}${P.HIDDEN.includes(k) ? ' (hidden)' : ''}<b id="v_${k}">${v}</b></label><input type="range" min="0" max="100" value="${v}" data-sb="${k}">`; }
    h += `<div class="grp">Quick</div>
      <button class="item" data-sbq="money"><span class="e">💷</span><span class="t"><b>+£10,000</b></span></button>
      <button class="item" data-sbq="time"><span class="e">⏱</span><span class="t"><b>Refill time</b></span></button>
      <div class="grp">Set role</div><select id="sbrole" style="width:100%;padding:10px;border-radius:10px">${Object.keys(P.ROLES).map(r => `<option ${r === S.career.role ? 'selected' : ''}>${r}</option>`).join('')}</select>
      <div class="grp">Fire an event</div><select id="sbev" style="width:100%;padding:10px;border-radius:10px">${D.events.map(e => `<option value="${e.id}">${e.id}${e.manual ? ' (manual)' : ''} · fired ${S.fired[e.id] || 0}</option>`).join('')}</select>
      <button class="choice" id="sbfire">Fire event</button>
      <div class="grp">Time machine</div>`;
    (S.snaps || []).slice().reverse().forEach((sn, i) => { const idx = S.snaps.length - 1 - i; h += item({ e: '⏪', t: 'Back to ' + sn.label, attrs: `data-rewind="${idx}"` }); });
    h += `<div class="grp">Save data</div><textarea id="sbjson" readonly>${esc(JSON.stringify(Object.assign({}, S, { snaps: undefined })))}</textarea>
      <button class="choice alt" id="sbcopy">Copy save</button>
      <button class="choice alt" id="sbmenu">Main menu</button>`;
    return h;
  }

  function wireSheet(sc) {
    sc.querySelectorAll('[data-act]').forEach(b => b.onclick = () => { const r = P.doAction(S, b.dataset.act); if (r && r.started) sheet = null; after(r); });
    sc.querySelectorAll('[data-pact]').forEach(b => b.onclick = () => { const r = P.doAction(S, b.dataset.pact, sheet.person); if (r && r.started) sheet = null; after(r); });
    sc.querySelectorAll('[data-person]').forEach(b => b.onclick = () => { sheet = { person: b.dataset.person }; render(); });
    sc.querySelectorAll('[data-apply]').forEach(b => b.onclick = () => { if (P.apply(S, b.dataset.apply)) { sheet = null; after(null); } });
    sc.querySelectorAll('[data-resp]').forEach(b => b.onclick = () => { P.toggleResp(S, b.dataset.resp); after(null); });
    sc.querySelectorAll('[data-qual]').forEach(b => b.onclick = () => { P.startQual(S, b.dataset.qual); after(null); });
    sc.querySelectorAll('[data-hol]').forEach(b => b.onclick = () => { P.setHoliday(S, b.dataset.hol); after(null); });
    sc.querySelectorAll('[data-home]').forEach(b => b.onclick = () => { P.setHome(S, b.dataset.home); after(null); });
    const mv = sc.querySelector('[data-move]'); if (mv) mv.onclick = () => { S.time -= 1; P.startEvent(S, 'job_hunt', {}); sheet = null; after(null); };
    sc.querySelectorAll('[data-sb]').forEach(r => r.oninput = () => { P.sandboxSet(S, r.dataset.sb, r.value); document.getElementById('v_' + r.dataset.sb).textContent = r.value; save(); });
    sc.querySelectorAll('[data-sbq]').forEach(b => b.onclick = () => { if (b.dataset.sbq === 'money') S.money += 10000; else S.time = S.maxTime; after(null); });
    const role = sc.querySelector('#sbrole'); if (role) role.onchange = () => { S.career.role = role.value; after(null); };
    const fire = sc.querySelector('#sbfire'); if (fire) fire.onclick = () => { const ok = P.forceEvent(S, sc.querySelector('#sbev').value); if (!ok) fire.textContent = 'Could not fire (no one to cast)'; else { sheet = null; after(null); } };
    sc.querySelectorAll('[data-rewind]').forEach(b => b.onclick = () => { const st = P.rewind(S, +b.dataset.rewind); if (st) { S = st; sheet = null; result = null; after(null); } });
    const cp = sc.querySelector('#sbcopy'); if (cp) cp.onclick = () => { const t = sc.querySelector('#sbjson'); t.select(); try { navigator.clipboard.writeText(t.value).then(() => cp.textContent = 'Copied', () => cp.textContent = 'Select and copy above'); } catch (e) { cp.textContent = 'Select and copy above'; } };
    const as = sc.querySelector('#achsheet'); if (as) as.onclick = () => { sheet = { tab: 'ach' }; render(); };
    const rvb = sc.querySelector('#reviews'); if (rvb) rvb.onclick = () => { sheet = { tab: 'reviews' }; render(); };
    const st = sc.querySelector('#sndtog'); if (st) st.onclick = () => { settings.sound = !settings.sound; store.set(SETTINGS, settings); if (settings.sound) chime('bell'); render(); };
    const tt = sc.querySelector('#thmtog'); if (tt) tt.onclick = () => { settings.theme = { light: 'dark', dark: 'auto', auto: 'light' }[settings.theme]; store.set(SETTINGS, settings); applyTheme(); render(); };
    const hb = sc.querySelector('#helpbtn'); if (hb) hb.onclick = () => { S.helpSeen = false; sheet = null; render(); };
    const mn = sc.querySelector('#sbmenu'); if (mn) mn.onclick = () => { save(); S = null; sheet = null; render(); };
  }

  /* ---------------- Ending ---------------- */
  function renderEnd() {
    const e = S.ending;
    setTimeout(checkAch, 400);
    if (!S.hofSaved) {
      const hof = store.get(HOF) || [];
      hof.push({ name: e.name, emoji: e.emoji, peak: e.peak, years: e.years, ending: e.title, honour: e.honour.title });
      store.set(HOF, hof.slice(-50)); S.hofSaved = true; save();
    }
    const hid = P.HIDDEN.map(k => `<div class="kv"><span>${P.STAT_LABEL[k]}</span><b>${Math.round(e.hidden[k])}</b></div>`).join('');
    $app.innerHTML = `<div class="end"><div class="endcard">
      <div style="font-size:48px">${esc(e.emoji)}</div>
      <h1 style="margin:6px 0 0;color:var(--navy)">${esc(e.name)}</h1>
      <div style="color:var(--muted)">${esc(e.subject)} teacher · ${e.years} years in teaching · ${e.id === 'retire' ? 'retired' : e.id === 'died' ? 'died' : 'left'} at ${e.age}</div>
      <p style="margin:12px 0 0"><b>${esc(e.title)}.</b> ${esc(e.text)}</p>
      <div class="ribbon">${esc(e.honour.emoji)} ${esc(e.honour.title)}</div>
      <div style="font-size:13.5px;color:var(--muted)">${esc(e.honour.text)}</div>
      <div class="card" style="text-align:left">
        <div class="kv"><span>Highest post</span><b>${esc(e.peak)}</b></div>
        <div class="kv"><span>Schools</span><span style="text-align:right">${esc(e.schools.join(', '))}</span></div>
        <div class="kv"><span>Pupils waved off</span><span>${e.leavers}</span></div>
        <div class="kv"><span>Net worth</span><span>${P.money(e.money)}</span></div>
      </div>
      <div class="card" style="text-align:left"><h3>What they never told you</h3>${hid}${e.hambrook ? `<div class="kv"><span>Sundays in the Hambrook pew</span><b>${e.pews}</b></div><div style="font-size:12.5px;color:var(--muted);margin-top:6px">${e.pews >= 6 ? 'At Hambrook, the road to SLT ran through St Michael\'s. You found it.' : 'At Hambrook, the road to SLT ran through St Michael\'s. Now you know.'}</div>` : ''}</div>
      <button class="btn" id="again">New career</button>
      <button class="btn ghost" style="color:var(--navy);border-color:var(--line)" id="journal">Read the journal</button>
    </div></div>`;
    document.getElementById('again').onclick = () => { store.del(SAVE); S = null; render(); };
    document.getElementById('journal').onclick = () => {
      $app.innerHTML = `<div class="hdr"><div class="who"><b>${esc(e.name)}</b><small>The full journal</small></div><button class="x" style="color:#fff" id="back">✕</button></div><div class="journal">${S.log.map(sec => `<div class="sec"><h3>${esc(sec.h)}<small>${esc(sec.sub)}</small></h3>${sec.lines.map(l => `<div class="line ${l.k}">${esc(l.t)}</div>`).join('')}</div>`).join('')}</div>`;
      document.getElementById('back').onclick = renderEnd;
    };
  }

  // boot
  const saved = store.get(SAVE);
  S = null;
  render();
})();
