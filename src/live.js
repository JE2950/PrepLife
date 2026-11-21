/* Prep School Life — Live Mode (desktop).
   A side-on pixel-art school you walk round. Same engine, same save as the classic view.
   All art is drawn in code at 400×225 and scaled up with crisp pixels. */
(function () {
  'use strict';
  const P = window.PSL, D = window.PSL_DATA;
  const W = 400, H = 225, FLOOR = 192;
  let UI = null, S = null;
  let root, cvs, ctx, hud, dlg, tags, ticker, card;
  let running = false, raf = 0, last = 0, lastS = null, hudT = 0;
  const keys = {};
  let pressed = {};

  /* ---------------- Palettes & helpers ---------------- */
  const C = {
    sky1: '#8ec5e8', sky2: '#d6ecf7', grass: '#4f8a3c', grass2: '#3f7330', path: '#c9b48a', path2: '#b39e74',
    brick: '#9c4a3a', brick2: '#86402f', mortar: '#b8664f', stone: '#cbbfa6', stone2: '#b0a487', roof: '#4a4e5a', roof2: '#3a3d47',
    wood: '#7a5030', wood2: '#5f3d24', floor: '#8a6a45', floor2: '#7a5b3a', wall: '#e9dfc6', wall2: '#d9ccae', panel: '#7d5a3a',
    glass: '#a9cfe0', glass2: '#7fb2c8', navy: '#18233d', ink: '#1d1d1f', white: '#f7f2e4', gold: '#e3b94e',
  };
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
  const pickH = (arr, h) => arr[h % arr.length];
  const season = () => P.HT[S.ht].season;
  const crest = () => { const t = D.schools.find(x => x.id === S.school.id); return (t && t.crest) || { fill: '#f1d38a', band: '#8a2433', ink: '#18233d', letter: 'P' }; };

  /* ---------------- People sprites ---------------- */
  const SKIN = ['#f1c9a5', '#e5b48e', '#c98d64', '#9b6a45', '#6e4a30', '#f4d6bd'];
  const HAIR = ['#2b1d14', '#4a3020', '#7a4b2a', '#c9a15a', '#8a8a8a', '#e3d3a8', '#b8562e', '#151515'];
  const TOPS = ['#3b4b6b', '#6b3b3b', '#3b5b4b', '#5b5b5b', '#2f3f5f', '#7a6a4a', '#4a3b5b', '#8a7a5a'];
  function lookFor(p) {
    const h = hash(p.id + p.first);
    const L = { h: 22, skin: pickH(SKIN, h), hair: pickH(HAIR, h >> 3), long: p.g === 'f' && (h >> 5) % 3 !== 0, top: pickH(TOPS, h >> 7), legs: '#2a2a33', shoe: '#1a1a1a' };
    const cr = crest();
    if (p.role === 'pupil' || p.role === 'child') {
      L.h = p.role === 'child' && p.age < 5 ? 11 : 15;
      L.top = p.role === 'pupil' ? (['#e6eaf0', '#c3b2e0', '#f1d38a'].includes(cr.fill) ? cr.band : cr.fill) : pickH(TOPS, h);
      L.legs = p.role === 'pupil' ? (p.g === 'f' ? '#3a3a4a' : '#55555f') : '#3b5b8b';
      L.tie = p.role === 'pupil' ? cr.band : null;
    }
    if (p.role === 'head') { L.gown = true; L.top = '#2a2a2a'; }
    if (p.role === 'matron') { L.top = '#5b7fb8'; L.apron = true; L.long = true; }
    if (p.role === 'bursar') { L.top = '#5a5e66'; L.tie = '#8a2433'; }
    if (p.role === 'slt' || p.role === 'deputy') L.tie = '#18233d';
    if (p.rival) L.top = '#6a2a4a';
    if (p.role === 'parent') { L.top = pickH(['#a07850', '#3d5a40', '#6a3a3a', '#2c3e58', '#b3a68a'], h); L.jacket = true; }
    return L;
  }
  function playerLook() {
    return { h: 22, skin: '#f1c9a5', hair: '#3b2416', long: S.me.gender === 'f', top: S.me.gender === 'f' ? '#5b4a6b' : '#7a6248', tweed: S.me.gender !== 'f', legs: '#3a3f4a', shoe: '#2a1a12', tie: '#8a2433',
      gown: S.career.role === 'Head', hat: scene.id === 'field' && season() === 'summer' };
  }
  function drawPerson(x, feet, L, frame, face) {
    x = Math.round(x); feet = Math.round(feet);
    const adult = L.h >= 20, kid = L.h <= 12;
    const legH = adult ? 7 : kid ? 3 : 5, torH = adult ? 8 : kid ? 4 : 6, head = adult ? 6 : kid ? 4 : 5, w = adult ? 8 : kid ? 5 : 6;
    const top = feet - legH - torH - head;
    const lx = x - (w >> 1);
    // legs
    const step = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    R(lx + 1 + step, feet - legH, 2, legH, L.legs); R(lx + w - 3 - step, feet - legH, 2, legH, L.legs);
    R(lx + 1 + step, feet - 1, 2, 1, L.shoe || '#222'); R(lx + w - 3 - step, feet - 1, 2, 1, L.shoe || '#222');
    // torso
    const ty = feet - legH - torH;
    if (L.gown) R(lx - 1, ty, w + 2, torH + legH - 2, '#1a1a1a');
    R(lx, ty, w, torH, L.top);
    if (L.tweed) for (let i = 0; i < w; i++) for (let j = 0; j < torH; j++) if ((i + j) % 3 === 0) R(lx + i, ty + j, 1, 1, '#8e7356');
    if (L.jacket) { R(lx, ty, 1, torH, '#00000033'); R(lx + w - 1, ty, 1, torH, '#00000033'); }
    if (adult) { R(lx + (w >> 1) - 1, ty, 2, 2, '#f3efe6'); }
    if (L.tie) R(lx + (w >> 1) - (adult ? 0 : 0), ty + (adult ? 2 : 1), 1, adult ? 4 : 3, L.tie);
    if (L.apron) R(lx + 1, ty + 2, w - 2, torH - 1, '#f4f1ea');
    // arms
    const sw = frame ? (frame === 1 ? 1 : -1) : 0;
    R(lx - 1, ty + 1 + sw, 1, torH - 2, L.gown ? '#1a1a1a' : L.top); R(lx + w, ty + 1 - sw, 1, torH - 2, L.gown ? '#1a1a1a' : L.top);
    R(lx - 1, ty + torH - 1 + sw, 1, 1, L.skin); R(lx + w, ty + torH - 1 - sw, 1, 1, L.skin);
    // head
    const hx = x - (head >> 1), hy = top;
    R(hx, hy, head, head, L.skin);
    R(hx, hy - 1, head, 2, L.hair);
    if (L.long) { R(hx - 1, hy, 1, head + 1, L.hair); R(hx + head, hy, 1, head + 1, L.hair); } else { R(face > 0 ? hx : hx + head - 1, hy + 1, 1, 2, L.hair); }
    const ex = face > 0 ? hx + head - 2 : hx + 1;
    R(ex, hy + 2 + (adult ? 1 : 0), 1, 1, '#1d1d1f');
    if (L.hat) { R(hx - 2, hy - 2, head + 4, 1, '#e8d39a'); R(hx, hy - 4, head, 2, '#e8d39a'); R(hx, hy - 2, head, 1, '#8a2433'); }
    if (L.gown) R(hx - 1, hy - 3, head + 2, 1, '#1a1a1a');
  }

  /* ---------------- World layout ---------------- */
  // Quad (exterior) doors; interiors are single screens.
  function quadLayout() {
    const boarding = S.school.boarding;
    return {
      id: 'quad', name: S.school.name, width: 1400, outdoor: true,
      doors: [
        { x: 175, to: 'chapel', label: 'Chapel' },
        { x: 275, to: 'reception', label: 'Reception' },
        { x: 345, to: 'classroom', label: 'Your classroom' },
        { x: 425, to: 'hall', label: 'Great Hall' },
        { x: 505, to: 'commonroom', label: 'Common Room' },
        { x: 585, to: 'study', label: S.career.role === 'Head' ? 'Your study' : "Head's study" },
        { x: 650, to: 'bursary', label: 'Bursary' },
        boarding ? { x: 775, to: 'boarding', label: 'Boarding house' } : { x: 775, to: 'forest', label: 'Forest school' },
        { x: 895, to: 'san', label: 'The San' },
        { x: 1385, to: 'field', label: 'Playing fields', edge: true },
      ],
      spots: [
        { x: 455, id: 'bell', label: 'Ring the bell · next half-term' },
        { x: 55, id: 'car', label: 'Your car · home life' },
      ],
      platforms: [{ x: 1030, w: 26, y: 180 }, { x: 1100, w: 26, y: 180 }, { x: 1180, w: 40, y: 172 }],
    };
  }
  const ROOMS = {
    chapel: { name: 'Chapel', spots: [{ x: 230, id: 'pews', label: 'Sit in the pews' }] },
    reception: { name: 'Reception', spots: [{ x: 250, id: 'visitors', label: "Visitors' book" }] },
    classroom: { name: 'Your classroom', spots: [{ x: 300, id: 'desk', label: 'Your desk' }, { x: 120, id: 'shelf', label: 'Bookshelf' }] },
    hall: { name: 'Great Hall', spots: [{ x: 200, id: 'lectern', label: 'The lectern' }] },
    commonroom: { name: 'Common Room', spots: [{ x: 110, id: 'kettle', label: 'The kettle' }, { x: 210, id: 'notice', label: 'Noticeboard · career' }, { x: 300, id: 'pigeon', label: 'Pigeonholes · people' }] },
    study: { name: "Head's study", spots: [{ x: 250, id: 'studydesk', label: 'The big desk' }, { x: 120, id: 'quals', label: 'Bookcase · qualifications' }] },
    bursary: { name: 'Bursary', spots: [{ x: 240, id: 'ledger', label: 'The ledger · money' }] },
    boarding: { name: 'Boarding house', spots: [{ x: 300, id: 'houseboard', label: 'House noticeboard' }, { x: 120, id: 'flat', label: 'Your flat · early night' }] },
    forest: { name: 'Forest school', outdoor: true, spots: [{ x: 230, id: 'firepit', label: 'The fire pit' }] },
    san: { name: 'The San', spots: [{ x: 280, id: 'sanbed', label: 'Sit down for a minute' }] },
    field: { name: 'Playing fields', outdoor: true, width: 800, spots: [{ x: 160, id: 'pavilion', label: 'The pavilion' }, { x: 640, id: 'croquet', label: 'Croquet lawn' }] },
  };
  // where each activity happens
  const SPOT_ACTIONS = {
    desk: ['plan', 'mark', 'idea', 'inspired_lesson', 'help', 'observe', 'portfolio', 'moderate', 'observe_dept', 'dept_meeting'],
    shelf: ['trainee', 'scholar_prog', 'data_dive'],
    kettle: ['coffee', 'volunteer', 'pub', 'working_party', 'mentor_mtg', 'plan_cpd', 'staffroom_visit', 'budget_bid'],
    studydesk: ['seehead', 'charm_govs', 'fundraise', 'calendar_plan', 'behaviour_logs', 'corridors'],
    lectern: ['assembly'], visitors: ['tours', 'nurseries'], pews: ['church'],
    houseboard: ['house_rounds', 'house_supper', 'house_letter'], flat: ['sleep'], sanbed: ['sleep'],
    pavilion: ['run', 'walk'], croquet: ['walk'], firepit: ['walk', 'run'],
    car: ['weekend', 'love', 'tutor_private', 'stop_tutor', 'retire', 'quit'],
  };
  function homeRoom(p) {
    switch (p.role) {
      case 'head': return 'study';
      case 'bursar': return 'bursary';
      case 'matron': return 'san';
      case 'parent': return 'reception';
      case 'partner': case 'child': return 'quad';
      case 'pupil': return p.boarder && (hash(p.id) % 2) ? 'boarding' : p.type === 'sporty' ? 'field' : 'classroom';
      default: return 'commonroom';
    }
  }

  /* ---------------- State ---------------- */
  const player = { x: 300, y: FLOOR, vx: 0, vy: 0, face: 1, ground: true, anim: 0 };
  let scene = { id: 'quad' };
  let level = null, npcs = [], camX = 0, near = null, eventCast = [], night = false, fade = 0, fadeTo = null;

  function enterScene(id, opts = {}) {
    if (id === 'quad') level = quadLayout();
    else { const r = ROOMS[id]; level = Object.assign({ id, width: r.width || W, doors: [{ x: 22, to: 'quad', label: 'Back outside' }], spots: [], platforms: [] }, r); }
    scene = { id };
    night = !!opts.night;
    // place player
    if (opts.x != null) player.x = opts.x;
    else if (id === 'quad' && opts.from) { const d = level.doors.find(x => x.to === opts.from); player.x = d ? d.x : 300; }
    else player.x = id === 'field' ? 40 : 60;
    player.y = FLOOR; player.vy = 0;
    buildNpcs(opts.cast || []);
    camX = clampCam(player.x - W / 2);
  }
  function buildNpcs(castIds) {
    npcs = []; eventCast = castIds;
    const here = S.people.filter(p => homeRoom(p) === scene.id && !castIds.includes(p.id));
    const lw = level.width;
    here.slice(0, 9).forEach((p, i) => {
      const h = hash(p.id);
      const x = 80 + ((h % 1000) / 1000) * (lw - 140);
      npcs.push({ p, x, home: x, look: lookFor(p), face: h % 2 ? 1 : -1, t: (h % 100) / 10, walk: 0 });
    });
    castIds.forEach((id, i) => {
      const p = S.people.find(x => x.id === id); if (!p) return;
      const x = Math.min(lw - 20, player.x + 26 + i * 18);
      npcs.push({ p, x, home: x, look: lookFor(p), face: -1, t: 0, walk: 0, cast: true });
    });
  }
  const clampCam = x => Math.max(0, Math.min(level.width - W, x));

  /* ---------------- Backgrounds ---------------- */
  function sky() {
    const s = season();
    let top = s === 'lent' ? '#a9bccb' : s === 'summer' ? '#7fbfe8' : '#9db8cf', bot = s === 'lent' ? '#dfe6ec' : s === 'summer' ? '#d8f0fb' : '#e8dcc4';
    if (night) { top = '#0d1430'; bot = '#26305a'; }
    const g = ctx.createLinearGradient(0, 0, 0, FLOOR); g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, FLOOR);
    if (night) { for (let i = 0; i < 40; i++) { const h = hash('st' + i); R((h % 400), (h >> 9) % 110, 1, 1, '#ffffffaa'); } R(330, 24, 9, 9, '#f4f0d8'); R(333, 24, 6, 6, '#0d1430'); }
    else for (let i = 0; i < 4; i++) { const cx = ((i * 137 + (performance.now() / 400)) % 520) - 60 - camX * 0.15; R(cx, 22 + i * 13, 30, 6, '#ffffffcc'); R(cx + 6, 18 + i * 13, 16, 5, '#ffffffcc'); }
  }
  function ground(w) {
    const s = season();
    R(0, FLOOR, w, H - FLOOR, s === 'lent' && S.ht === 2 ? '#e8eef2' : C.grass);
    for (let x = 0; x < w; x += 6) R(x + (x % 12 ? 0 : 3), FLOOR, 2, 2, s === 'lent' && S.ht === 2 ? '#d5dde4' : C.grass2);
    R(0, FLOOR + 6, w, 10, C.path); for (let x = 0; x < w; x += 9) R(x, FLOOR + 8 + (x % 2), 3, 1, C.path2);
  }
  function tree(x) {
    const s = season();
    R(x - 2, FLOOR - 34, 5, 34, '#5a3c22');
    const leaf = s === 'michaelmas' ? (S.ht === 0 ? '#c8862e' : '#a65a22') : s === 'lent' ? null : '#3f7f33';
    if (leaf) { R(x - 14, FLOOR - 58, 29, 26, leaf); R(x - 10, FLOOR - 64, 21, 8, leaf); R(x - 17, FLOOR - 48, 35, 12, leaf); }
    else { R(x - 10, FLOOR - 52, 1, 20, '#5a3c22'); R(x + 9, FLOOR - 50, 1, 18, '#5a3c22'); R(x - 6, FLOOR - 60, 1, 14, '#5a3c22'); if (S.ht === 2) R(x - 12, FLOOR - 53, 26, 2, '#f4f7fa'); }
    if (s === 'michaelmas') for (let i = 0; i < 4; i++) { const h = hash('lf' + x + i); R(x - 20 + (h % 40), FLOOR - 2 + (h >> 8) % 3, 2, 1, '#c8862e'); }
  }
  function windowAt(x, y, w, h, lit) {
    R(x - 1, y - 1, w + 2, h + 2, C.stone2); R(x, y, w, h, night || lit ? '#f3d27a' : C.glass);
    R(x + (w >> 1), y, 1, h, C.stone2); R(x, y + (h >> 1), w, 1, C.stone2);
  }
  function doorAt(x, label, wide) {
    const w = wide ? 18 : 14;
    R(x - w / 2 - 2, FLOOR - 26, w + 4, 26, C.stone2); R(x - w / 2, FLOOR - 24, w, 24, C.wood); R(x - w / 2 + 2, FLOOR - 22, w - 4, 10, C.wood2);
    R(x + w / 2 - 4, FLOOR - 12, 2, 2, C.gold);
  }
  function brickBlock(x0, x1, top) {
    R(x0, top, x1 - x0, FLOOR - top, C.brick);
    for (let y = top + 3; y < FLOOR; y += 5) for (let x = x0 + ((y / 5) % 2 ? 0 : 4); x < x1; x += 9) R(x, y, 6, 1, C.brick2);
    R(x0 - 3, top - 6, x1 - x0 + 6, 7, C.roof); R(x0 - 3, top - 7, x1 - x0 + 6, 1, C.roof2);
    if (S.school.id === 'mudgrove') for (let x = x0; x < x1; x += 23) { const h = hash('iv' + x); R(x, top + 2, 4, 20 + h % 30, '#3d6b35'); }
  }
  function drawQuad() {
    sky();
    ctx.save(); ctx.translate(-Math.round(camX * 0.3), 0);
    R(0, FLOOR - 40, 2000, 40, night ? '#1a2440' : '#9fb79a'); for (let x = 0; x < 2000; x += 70) R(x, FLOOR - 52 + (x % 3) * 4, 60, 14, night ? '#1a2440' : '#9fb79a');
    ctx.restore();
    ctx.save(); ctx.translate(-Math.round(camX), 0);
    ground(level.width);
    const cr = crest();
    // gate & car
    R(10, FLOOR - 40, 5, 40, C.stone2); R(95, FLOOR - 40, 5, 40, C.stone2);
    for (let x = 18; x < 92; x += 5) R(x, FLOOR - 34, 1, 34, '#2a2a2a'); R(15, FLOOR - 36, 80, 2, '#2a2a2a');
    R(30, FLOOR - 50, 50, 10, cr.fill); R(31, FLOOR - 49, 48, 8, cr.fill);
    R(40, FLOOR - 9, 30, 7, '#7a2c2c'); R(44, FLOOR - 14, 20, 6, '#7a2c2c'); R(46, FLOOR - 13, 7, 4, C.glass); R(55, FLOOR - 13, 7, 4, C.glass);
    R(42, FLOOR - 3, 5, 3, '#111'); R(63, FLOOR - 3, 5, 3, '#111');
    // chapel
    R(130, FLOOR - 70, 90, 70, C.stone); R(130, FLOOR - 70, 90, 2, C.stone2);
    R(165, FLOOR - 110, 20, 40, C.stone); R(171, FLOOR - 126, 8, 16, C.stone2); R(174, FLOOR - 132, 2, 6, C.stone2);
    R(142, FLOOR - 58, 10, 22, night ? '#f3d27a' : '#7a5aa8'); R(198, FLOOR - 58, 10, 22, night ? '#f3d27a' : '#a85a5a'); R(170, FLOOR - 100, 10, 14, cr.fill);
    doorAt(175, 'Chapel', true);
    // main building
    brickBlock(240, 680, FLOOR - 80);
    for (let x = 255; x < 670; x += 40) { if ([275, 345, 425, 505, 585, 650].some(d => Math.abs(d - x - 6) < 16)) continue; windowAt(x, FLOOR - 66, 12, 16); windowAt(x, FLOOR - 40, 12, 14); }
    for (const x of [275, 345, 505, 585]) windowAt(x - 6, FLOOR - 66, 12, 16);
    // bell tower
    R(435, FLOOR - 128, 40, 50, C.brick); R(431, FLOOR - 132, 48, 5, C.roof); R(445, FLOOR - 146, 20, 14, C.roof2); R(454, FLOOR - 154, 2, 8, C.gold);
    R(447, FLOOR - 120, 16, 16, '#2a2a2a'); R(451, FLOOR - 117, 8, 9, C.gold); R(454, FLOOR - 108, 2, 2, C.gold);
    R(439, FLOOR - 98, 32, 4, cr.fill); R(453, FLOOR - 98, 4, 4, cr.band);
    for (const d of level.doors) if (d.x > 240 && d.x < 680) doorAt(d.x, d.label, d.to === 'hall');
    // boarding / forest
    if (S.school.boarding) { brickBlock(710, 850, FLOOR - 70); for (let x = 722; x < 840; x += 24) { windowAt(x, FLOOR - 58, 10, 12, night); if (x !== 770) windowAt(x, FLOOR - 34, 10, 12, night); } doorAt(775); }
    else { R(740, FLOOR - 34, 70, 34, C.wood); R(735, FLOOR - 44, 80, 10, '#3f5f33'); R(760, FLOOR - 24, 30, 24, C.wood2); doorAt(775); }
    // san
    R(865, FLOOR - 46, 64, 46, C.wall); R(861, FLOOR - 50, 72, 5, C.roof); R(888, FLOOR - 42, 14, 6, '#ffffff'); R(894, FLOOR - 44, 2, 10, '#c0392b'); R(890, FLOOR - 40, 10, 2, '#c0392b'); doorAt(895);
    // trees, benches, field gate
    [110, 230, 700, 960, 1040, 1250, 1330].forEach(tree);
    for (const p of level.platforms) { R(p.x, p.y, p.w, 3, C.wood); R(p.x + 2, p.y + 3, 2, FLOOR - p.y - 3, C.wood2); R(p.x + p.w - 4, p.y + 3, 2, FLOOR - p.y - 3, C.wood2); }
    R(1375, FLOOR - 30, 3, 30, '#eee'); R(1392, FLOOR - 30, 3, 30, '#eee'); R(1375, FLOOR - 30, 20, 2, '#eee');
    ctx.restore();
  }
  function interiorBase(wallA, wallB) {
    R(0, 0, W, FLOOR, night ? '#2a2f45' : wallA);
    R(0, FLOOR - 44, W, 44, night ? '#3a2f25' : C.panel); R(0, FLOOR - 46, W, 2, C.wood2);
    for (let x = 0; x < W; x += 25) R(x, FLOOR - 44, 1, 44, C.wood2);
    R(0, FLOOR, W, H - FLOOR, C.floor); for (let x = 0; x < W; x += 14) R(x, FLOOR, 1, H - FLOOR, C.floor2);
    R(0, 0, W, 12, wallB);
    // exit door
    doorAt(22);
    if (night) { ctx.fillStyle = '#0a1030aa'; ctx.fillRect(0, 0, W, H); }
  }
  function drawRoom(id) {
    const cr = crest();
    if (id === 'field' || id === 'forest') return drawOutdoor(id);
    if (id === 'chapel') {
      interiorBase('#d8cfb8', '#c4b89c');
      for (const x of [80, 170, 260, 340]) { R(x, 30, 18, 46, '#3b3b5b'); R(x + 2, 32, 14, 42, x % 2 ? '#7a5aa8' : cr.fill); R(x + 8, 32, 2, 42, '#e3b94e'); }
      for (let x = 70; x < 380; x += 34) { R(x, FLOOR - 14, 26, 3, C.wood); R(x, FLOOR - 11, 3, 11, C.wood2); R(x + 23, FLOOR - 11, 3, 11, C.wood2); R(x, FLOOR - 24, 2, 10, C.wood); }
      R(360, FLOOR - 30, 30, 30, '#e9e2cf'); R(373, FLOOR - 44, 4, 14, C.gold); R(369, FLOOR - 40, 12, 3, C.gold);
      R(300, 90, 30, 40, C.wood2); R(303, 94, 24, 32, '#1a1a1a'); ['147', '233', '405'].forEach((n, i) => txt(n, 306, 98 + i * 10, '#e3b94e'));
    } else if (id === 'reception') {
      interiorBase('#ece3cc', '#ddd2b6');
      R(220, FLOOR - 26, 70, 26, C.wood); R(220, FLOOR - 28, 70, 3, C.wood2); R(250, FLOOR - 34, 10, 6, '#f4f1ea');
      R(90, FLOOR - 70, 40, 46, C.wood2); for (let y = 0; y < 3; y++) for (let i = 0; i < 3; i++) R(95 + i * 12, FLOOR - 66 + y * 14, 6, 8, C.gold);
      R(320, FLOOR - 16, 50, 10, '#6b3b3b'); R(320, FLOOR - 22, 50, 6, '#7b4b4b');
      crestBig(170, 40);
    } else if (id === 'classroom') {
      interiorBase('#efe6cf', '#dfd4b8');
      R(90, 34, 180, 70, '#24382c'); R(88, 32, 184, 2, C.wood); R(88, 104, 184, 3, C.wood);
      txt(boardText(), 98, 44, '#e9eee6'); txt('Learning objective:', 98, 66, '#c9d6c9'); txt(objText(), 98, 78, '#e9eee6');
      for (let i = 0; i < 4; i++) { const x = 130 + i * 50; R(x, FLOOR - 14, 30, 3, C.wood); R(x + 2, FLOOR - 11, 2, 11, C.wood2); R(x + 26, FLOOR - 11, 2, 11, C.wood2); }
      R(290, FLOOR - 20, 40, 4, C.wood); R(292, FLOOR - 16, 3, 16, C.wood2); R(325, FLOOR - 16, 3, 16, C.wood2); R(300, FLOOR - 26, 12, 6, '#f4f1ea'); R(316, FLOOR - 24, 6, 4, '#8a2433');
      R(100, FLOOR - 60, 36, 58, C.wood2); for (let s = 0; s < 4; s++) for (let b = 0; b < 6; b++) R(103 + b * 5, FLOOR - 56 + s * 14, 4, 11, pickH(['#8a2433', '#2f5d46', '#18233d', '#b8902f', '#5b4a6b'], b + s));
      windowAt(350, 40, 26, 34);
    } else if (id === 'hall') {
      interiorBase('#e6dcc4', '#d4c6a6');
      R(140, FLOOR - 24, 220, 24, C.wood); R(140, FLOOR - 26, 220, 2, C.wood2); R(145, 20, 210, 60, '#7a2433'); R(150, 22, 6, 56, '#6a1f2c'); R(344, 22, 6, 56, '#6a1f2c');
      R(196, FLOOR - 38, 10, 14, C.wood2); R(192, FLOOR - 40, 18, 3, C.wood);
      crestBig(240, 32);
      for (let x = 60; x < 135; x += 14) { R(x, FLOOR - 10, 10, 2, '#5a5a6a'); R(x + 1, FLOOR - 8, 1, 8, '#444'); R(x + 8, FLOOR - 8, 1, 8, '#444'); }
      // honours board
      R(40, 30, 50, 60, C.wood2); txt('HONOURS', 44, 34, C.gold); for (let i = 0; i < 6; i++) R(46, 46 + i * 7, 38, 1, '#d8b86a');
    } else if (id === 'commonroom') {
      interiorBase('#e2d7bd', '#cfc2a2');
      R(95, FLOOR - 24, 30, 4, C.wood); R(97, FLOOR - 20, 3, 20, C.wood2); R(120, FLOOR - 20, 3, 20, C.wood2); R(102, FLOOR - 32, 8, 8, '#cfcfcf'); R(110, FLOOR - 30, 2, 3, '#cfcfcf');
      R(190, 40, 46, 40, '#b88a5a'); for (let i = 0; i < 6; i++) { const h = hash('n' + i); R(194 + (h % 34), 44 + ((h >> 6) % 28), 8, 8, pickH(['#f4f1ea', '#f3e38a', '#bfe3f0', '#f0bfbf'], i)); }
      R(285, 34, 40, 50, C.wood2); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) R(288 + x * 9, 37 + y * 12, 8, 10, '#3a2a1a');
      for (const x of [150, 350]) { R(x, FLOOR - 16, 26, 10, '#6b4b3b'); R(x, FLOOR - 24, 26, 8, '#7b5b4b'); R(x - 3, FLOOR - 20, 4, 14, '#6b4b3b'); R(x + 25, FLOOR - 20, 4, 14, '#6b4b3b'); }
      windowAt(60, 40, 22, 30);
    } else if (id === 'study') {
      interiorBase('#d9c9a4', '#c4b089');
      R(220, FLOOR - 24, 64, 6, C.wood); R(222, FLOOR - 18, 6, 18, C.wood2); R(276, FLOOR - 18, 6, 18, C.wood2); R(240, FLOOR - 30, 14, 6, '#f4f1ea'); R(260, FLOOR - 28, 4, 4, C.gold);
      R(300, 36, 30, 38, C.gold); R(302, 38, 26, 34, '#5a4a3a'); R(311, 44, 8, 8, '#e5b48e'); R(309, 52, 12, 16, '#1a1a1a');
      R(100, FLOOR - 80, 46, 78, C.wood2); for (let s = 0; s < 5; s++) for (let b = 0; b < 8; b++) R(103 + b * 5, FLOOR - 76 + s * 15, 4, 12, pickH(['#8a2433', '#2f5d46', '#18233d', '#b8902f'], b * s + b));
      windowAt(170, 34, 28, 40);
    } else if (id === 'bursary') {
      interiorBase('#dcdcd2', '#c8c8bc');
      R(220, FLOOR - 22, 60, 5, '#5a5e66'); R(222, FLOOR - 17, 4, 17, '#4a4e56'); R(274, FLOOR - 17, 4, 17, '#4a4e56'); R(236, FLOOR - 28, 20, 6, '#2f5d46');
      R(320, FLOOR - 40, 34, 40, '#6a6e76'); R(330, FLOOR - 26, 14, 14, '#3a3e46'); R(336, FLOOR - 20, 2, 2, C.gold);
      for (let i = 0; i < 3; i++) R(100 + i * 24, FLOOR - 50, 20, 50, '#8a8e96');
      txt('TURN OFF THE LIGHTS', 150, 50, '#8a2433');
    } else if (id === 'boarding') {
      interiorBase('#e3e9ef', '#cfd8e0');
      for (let i = 0; i < 4; i++) { const x = 150 + i * 56; R(x, FLOOR - 12, 40, 4, '#7a7a8a'); R(x, FLOOR - 8, 2, 8, '#555'); R(x + 38, FLOOR - 8, 2, 8, '#555'); R(x, FLOOR - 16, 40, 4, pickH(['#5b7fb8', '#b85b5b', '#5bb87f', '#b8a45b'], i)); R(x + 2, FLOOR - 19, 8, 3, '#f4f1ea');
        R(x, FLOOR - 40, 40, 4, '#7a7a8a'); R(x, FLOOR - 44, 40, 4, pickH(['#b8a45b', '#5b7fb8', '#b85b5b', '#5bb87f'], i)); R(x, FLOOR - 40, 2, 28, '#555'); R(x + 38, FLOOR - 40, 2, 28, '#555'); }
      R(290, 40, 36, 30, '#b88a5a'); R(100, FLOOR - 40, 30, 40, '#6a5a4a');
      windowAt(60, 34, 20, 30, night);
    } else if (id === 'san') {
      interiorBase('#eef2ee', '#dde4dd');
      for (let i = 0; i < 3; i++) { const x = 120 + i * 70; R(x, FLOOR - 14, 44, 5, '#f4f4f4'); R(x, FLOOR - 9, 2, 9, '#999'); R(x + 42, FLOOR - 9, 2, 9, '#999'); R(x, FLOOR - 18, 10, 4, '#ffffff'); R(x + 10, FLOOR - 16, 34, 2, '#9fc0e0'); }
      R(340, FLOOR - 70, 30, 40, '#ffffff'); R(353, FLOOR - 64, 4, 14, '#c0392b'); R(348, FLOOR - 59, 14, 4, '#c0392b');
      txt('NO TEMPERATURE,', 60, 40, '#2f5d46'); txt('NO SICK NOTE.', 60, 50, '#2f5d46');
    }
  }
  function drawOutdoor(id) {
    sky();
    ctx.save(); ctx.translate(-Math.round(camX), 0);
    ground(level.width);
    if (id === 'forest') {
      [60, 120, 190, 280, 340].forEach(tree);
      R(220, FLOOR - 6, 22, 6, '#5a3c22'); R(226, FLOOR - 12, 10, 6, '#e0702a'); R(229, FLOOR - 16, 4, 4, '#f3c84a');
    } else {
      const s = season();
      R(120, FLOOR - 40, 80, 40, '#e9e2cf'); R(114, FLOOR - 46, 92, 7, '#2f5d46'); R(150, FLOOR - 56, 20, 10, '#e9e2cf'); R(156, FLOOR - 54, 8, 6, '#2a2a2a');
      R(125, FLOOR - 30, 20, 20, C.glass); R(175, FLOOR - 30, 20, 20, C.glass);
      if (s === 'summer') {
        R(300, FLOOR - 2, 120, 4, '#c9b48a'); for (const x of [305, 412]) { R(x, FLOOR - 14, 1, 12, '#f4f1ea'); R(x + 3, FLOOR - 14, 1, 12, '#f4f1ea'); R(x + 6, FLOOR - 14, 1, 12, '#f4f1ea'); R(x, FLOOR - 15, 7, 1, '#f4f1ea'); }
        R(470, FLOOR - 26, 50, 22, '#f4f1ea'); txt('SCORE', 478, FLOOR - 24, '#18233d'); txt('142-6', 478, FLOOR - 15, '#18233d');
      } else {
        for (const x of [290, 540]) { R(x, FLOOR - 70, 2, 70, '#f4f4f4'); R(x + 20, FLOOR - 70, 2, 70, '#f4f4f4'); R(x, FLOOR - 30, 22, 2, '#f4f4f4'); R(x - 1, FLOOR - 20, 4, 20, crest().fill); R(x + 19, FLOOR - 20, 4, 20, crest().fill); }
      }
      R(590, FLOOR - 2, 150, 2, '#5fa046');
      for (const x of [610, 650, 690, 725]) { R(x, FLOOR - 7, 1, 7, '#f4f4f4'); R(x + 5, FLOOR - 7, 1, 7, '#f4f4f4'); R(x, FLOOR - 7, 6, 1, '#f4f4f4'); }
      R(705, FLOOR - 4, 4, 4, '#2a5aa8'); R(635, FLOOR - 4, 4, 4, '#c0392b');
      [40, 760].forEach(tree);
    }
    ctx.restore();
  }
  function crestBig(x, y) { const c = crest(); R(x - 12, y, 24, 18, c.fill); R(x - 10, y + 18, 20, 4, c.fill); R(x - 6, y + 22, 12, 3, c.fill); R(x - 12, y + 6, 24, 2, c.band); txt(c.letter, x - 2, y + 9, c.ink); }
  function txt(s, x, y, col) { ctx.fillStyle = col; ctx.font = '7px monospace'; ctx.textBaseline = 'top'; ctx.fillText(s, x, y); }
  function boardText() { return ({ Latin: 'AMO AMAS AMAT', French: 'Je suis, tu es...', Maths: 'x² + 3x + 2 = 0', Classics: 'ARMA VIRUMQUE CANO', History: '1066 AND ALL THAT', Science: 'H₂O + CO₂', English: 'Show, don\'t tell.' })[S.me.subject] || S.me.subject.toUpperCase(); }
  function objText() { return ({ Latin: 'To parse the 1st conjugation', French: 'To use être in the present' })[S.me.subject] || 'To learn something today'; }

  /* ---------------- Main loop ---------------- */
  function step(dt) {
    const L = level;
    if (!dlg.classList.contains('on') && !fadeTo) {
      const run = keys.ShiftLeft || keys.ShiftRight;
      const sp = run ? 120 : 78;
      let ax = 0;
      if (keys.ArrowLeft || keys.KeyA) ax -= 1;
      if (keys.ArrowRight || keys.KeyD) ax += 1;
      player.vx = ax * sp; if (ax) player.face = ax;
      if ((pressed.Space || pressed.KeyW && !nearDoor()) && player.ground) { player.vy = -205; player.ground = false; }
      if (pressed.ArrowUp || pressed.KeyW) { const d = nearDoor(); if (d) go(d); }
      if (pressed.KeyE || pressed.Enter) interact();
      if (pressed.KeyN) ringBell();
      if (pressed.Escape) pauseMenu();
      if (pressed.KeyJ || pressed.Tab) { pressed = {}; UI.exitLive(); return; }
    } else player.vx = 0;
    player.vy += 560 * dt;
    player.x += player.vx * dt; player.y += player.vy * dt;
    player.x = Math.max(8, Math.min(L.width - 8, player.x));
    let floor = FLOOR;
    for (const p of L.platforms || []) if (player.x > p.x && player.x < p.x + p.w && player.y - player.vy * dt <= p.y + 1 && player.vy >= 0) floor = Math.min(floor, p.y);
    if (player.y >= floor) { player.y = floor; player.vy = 0; player.ground = true; } else player.ground = false;
    if (L.id === 'quad' && player.x > L.width - 10 && !fadeTo) go(L.doors.find(d => d.to === 'field'));
    if (L.id === 'field' && player.x < 10 && !fadeTo) go({ to: 'quad' });
    player.anim += Math.abs(player.vx) * dt;
    for (const n of npcs) { n.t += dt; if (!n.cast) { const target = n.home + Math.sin(n.t * 0.4) * 14; const d = target - n.x; n.walk = Math.abs(d) > 0.5 ? 1 : 0; n.x += Math.sign(d) * Math.min(Math.abs(d), 12 * dt); if (Math.abs(d) > 0.5) n.face = Math.sign(d); } else n.face = player.x < n.x ? -1 : 1; }
    camX += (clampCam(player.x - W / 2) - camX) * Math.min(1, dt * 6);
    near = findNear();
    pressed = {};
    // events waiting? play them as scenes
    if (!dlg.classList.contains('on') && !fadeTo && S.pending.length) playEvent();
  }
  function draw() {
    ctx.imageSmoothingEnabled = false;
    if (level.id === 'quad') drawQuad(); else drawRoom(level.id);
    ctx.save(); if (level.width > W) ctx.translate(-Math.round(camX), 0);
    for (const n of npcs) drawPerson(n.x, FLOOR, n.look, n.walk ? (Math.floor(n.t * 6) % 2) + 1 : 0, n.face);
    drawPerson(player.x, player.y, playerLook(), player.ground && Math.abs(player.vx) > 1 ? (Math.floor(player.anim / 6) % 2) + 1 : 0, player.face);
    ctx.restore();
    if (fade > 0) { ctx.fillStyle = `rgba(10,14,28,${fade})`; ctx.fillRect(0, 0, W, H); }
    drawTags();
  }
  function frame(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
    if (fadeTo) { fade = Math.min(1, fade + dt * 4); if (fade >= 1) { const f = fadeTo; fadeTo = null; f(); } }
    else if (fade > 0) fade = Math.max(0, fade - dt * 3);
    step(dt); draw();
    hudT = (hudT || 0) + dt; if (hudT > 0.4) { hudT = 0; updateHud(); }
    raf = requestAnimationFrame(frame);
  }

  /* ---------------- Interaction ---------------- */
  function nearDoor() { return (level.doors || []).find(d => Math.abs(d.x - player.x) < 10); }
  function findNear() {
    const cands = [];
    for (const d of level.doors || []) cands.push({ kind: 'door', x: d.x, d, label: (d.to === 'quad' ? '↑ ' : '↑ ') + d.label });
    for (const s of level.spots || []) cands.push({ kind: 'spot', x: s.x, s, label: 'E · ' + s.label });
    for (const n of npcs) cands.push({ kind: 'npc', x: n.x, n, label: 'E · ' + P.dispName(n.p) + ' (' + P.personRoleLabel(S, n.p) + ')' });
    let best = null;
    for (const c of cands) { const d = Math.abs(c.x - player.x) - (c.kind === 'npc' ? 0 : 5); if (d < 12 && (!best || d < best.d)) best = Object.assign(c, { d }); }
    return best;
  }
  function go(d) {
    if (!d) return;
    const from = level.id;
    fadeTo = () => { if (d.to === 'quad') enterScene('quad', { from }); else enterScene(d.to); };
  }
  function interact() {
    if (!near) return;
    if (near.kind === 'door') return go(near.d);
    if (near.kind === 'npc') return personMenu(near.n.p);
    if (near.kind === 'spot') return spotMenu(near.s);
  }

  /* ---------------- Dialogs ---------------- */
  let dlgSel = 0, dlgOpts = [];
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function showDialog({ emoji, title, text, fx, options }) {
    dlgOpts = options || [{ label: 'Carry on', fn: closeDialog }];
    dlgSel = dlgOpts.findIndex(o => !o.disabled); if (dlgSel < 0) dlgSel = 0;
    const chips = (fx || []).map(f => `<span class="lv-chip ${f.d > 0 ? 'up' : 'dn'}">${esc(f.k)} ${f.money ? (f.d > 0 ? '+' : '−') + P.money(Math.abs(f.d)) : (f.d > 0 ? '+' : '−') + Math.abs(f.d)}</span>`).join('');
    dlg.innerHTML = `<div class="lv-box"><div class="lv-head">${emoji ? `<span class="lv-emo">${esc(emoji)}</span>` : ''}<b>${esc(title || '')}</b></div>${text ? `<p>${esc(text)}</p>` : ''}${chips ? `<div class="lv-chips">${chips}</div>` : ''}<div class="lv-opts">${dlgOpts.map((o, i) => `<button data-i="${i}" ${o.disabled ? 'disabled' : ''}>${esc(o.label)}${o.note ? `<small>${esc(o.note)}</small>` : ''}</button>`).join('')}</div><div class="lv-hint">↑↓ choose · Enter select · Esc close</div></div>`;
    dlg.classList.add('on');
    dlg.querySelectorAll('[data-i]').forEach(b => b.onclick = () => pickOpt(+b.dataset.i));
    markSel();
  }
  function markSel() { dlg.querySelectorAll('[data-i]').forEach(b => b.classList.toggle('sel', +b.dataset.i === dlgSel)); }
  function pickOpt(i) { const o = dlgOpts[i]; if (!o || o.disabled) return; o.fn(); }
  function closeDialog() { dlg.classList.remove('on'); dlg.innerHTML = ''; afterChange(); }
  function dialogKeys(e) {
    if (!dlg.classList.contains('on')) return false;
    const n = dlgOpts.length;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') { do { dlgSel = (dlgSel + 1) % n; } while (dlgOpts[dlgSel].disabled && n > 1); markSel(); }
    else if (e.code === 'ArrowUp' || e.code === 'KeyW') { do { dlgSel = (dlgSel - 1 + n) % n; } while (dlgOpts[dlgSel].disabled && n > 1); markSel(); }
    else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') pickOpt(dlgSel);
    else if (e.code === 'Escape' && !S.pending.length) closeDialog();
    return true;
  }
  function showResult(r) {
    if (!r) return closeDialog();
    if (r.started || r.text == null) return closeDialog();
    showDialog({ emoji: r.emoji, title: r.title, text: r.text, fx: r.fx, options: [{ label: 'Carry on', fn: closeDialog }] });
  }
  function afterChange() { UI.save(); UI.checkAch(); updateHud(); if (S.over || S.reviewPending) { stop(); UI.render(); } }

  function actionOptions(ids) {
    const all = P.actions(S, 'act').concat(P.actions(S, 'life'));
    return ids.map(id => all.find(a => a.id === id)).filter(Boolean).map(a => ({
      label: `${a.emoji} ${a.label}`, note: `${a.cost ? a.cost + ' ⏱ · ' : ''}${a.ok ? a.sub || '' : a.why || (S.time < a.cost ? 'No time left this half-term' : 'Not available')}`, disabled: !a.ok,
      fn: () => { const r = P.doAction(S, a.id); UI.save(); if (r && r.started) return closeDialog(); showResult(r); },
    }));
  }
  function spotMenu(s) {
    if (s.id === 'bell') return ringBell();
    const extra = [];
    if (s.id === 'notice') {
      extra.push({ label: '🎓 Career: promotions, adverts, responsibilities', fn: () => { closeDialog(); UI.openSheet('career'); } });
      const mapped = new Set(Object.values(SPOT_ACTIONS).flat());
      const rest = P.actions(S, 'act').filter(a => !mapped.has(a.id)).map(a => a.id);
      extra.push(...actionOptions(rest));
    }
    if (s.id === 'pigeon') extra.push({ label: '👥 Everyone you know', fn: () => { closeDialog(); UI.openSheet('people'); } });
    if (s.id === 'quals') extra.push({ label: '🎓 Qualifications and career', fn: () => { closeDialog(); UI.openSheet('career'); } });
    if (s.id === 'ledger' || s.id === 'car') extra.push({ label: '🏡 Money, home, holidays and family', fn: () => { closeDialog(); UI.openSheet('life'); } });
    const opts = actionOptions(SPOT_ACTIONS[s.id] || []).concat(extra);
    if (!opts.length) return showDialog({ title: s.label, text: spotFlavour(s.id), options: [{ label: 'Leave it', fn: closeDialog }] });
    opts.push({ label: 'Leave it', fn: closeDialog });
    showDialog({ emoji: '', title: s.label, text: `${spotFlavour(s.id)} Time left: ${S.time} ⏱`, options: opts });
  }
  function spotFlavour(id) {
    return ({ desk: 'A pile of exercise books and a cold cup of tea.', kettle: 'The kettle has been on since 1994.', notice: 'Job adverts, a lost glove and a rota nobody follows.', pigeon: 'Your pigeonhole holds three memos and a satsuma.',
      studydesk: S.career.role === 'Head' ? 'Your desk. Everything stops here.' : 'You knock on the Head\'s door.', lectern: 'The whole school would be looking at you.', pews: 'Quiet. Polished wood and old hymn numbers.',
      ledger: 'Columns of numbers in the Bursar\'s neat hand.', visitors: 'Signed by a duke, two plumbers and a prospective parent called Tarquin.', car: 'Your car. Freedom, of a sort.', pavilion: 'The smell of linseed oil and old cricket whites.',
      croquet: season() === 'summer' ? 'The lawn is perfect. The hoops are cruel.' : 'The croquet lawn sleeps until summer.', houseboard: 'Rotas, a menu and a drawing of you with a moustache.', flat: 'Your flat, through the door marked Private.', sanbed: 'Matron gives you a look that says sit down, then.', shelf: 'Dog-eared copies of every textbook since 1972.', quals: 'Leather-bound books nobody has opened.', firepit: 'Smoke, sausages and a hedgehog house.' })[id] || '';
  }
  function personMenu(p) {
    const opts = P.personActions(S, p.id).map(a => ({ label: `${a.emoji} ${a.label}`, note: `${a.cost ? a.cost + ' ⏱' : ''}${!a.ok && a.why ? ' · ' + a.why : ''}`, disabled: !a.ok,
      fn: () => { const r = P.doAction(S, a.id, p.id); UI.save(); if (r && r.started) return closeDialog(); showResult(r); } }));
    opts.push({ label: 'Say goodbye', fn: closeDialog });
    const L = lookFor(p);
    showDialog({ emoji: '', title: `${P.dispName(p)} · ${P.personRoleLabel(S, p)}`, text: `Relationship ${Math.round(p.rel)}%. Known for: ${p.quirk || '—'}. Time left: ${S.time} ⏱`, options: opts });
  }
  function ringBell() {
    if (S.pending.length) return playEvent();
    const label = P.HT[S.ht].brk;
    showDialog({ emoji: '🔔', title: 'Ring the bell?', text: `End the half-term and head into the ${label}. You have ${S.time} ⏱ unspent.`, options: [
      { label: 'Ring it', fn: () => {
        dlg.classList.remove('on'); UI.chime && UI.chime('bell');
        fadeTo = () => {
          P.advance(S); UI.save();
          titleCard(`${P.HT[S.ht].term} term · ${P.HT[S.ht].half === 1 ? 'first' : 'second'} half`, `${P.htLabel(S)} · Age ${S.me.age}`);
          enterScene('quad', { x: 455 });
          afterChange();
        };
      } },
      { label: 'Not yet', fn: closeDialog },
    ] });
  }
  function titleCard(a, b) { card.innerHTML = `<b>${esc(a)}</b><span>${esc(b)}</span>`; card.classList.remove('on'); void card.offsetWidth; card.classList.add('on'); }

  /* ---------------- Events as scenes ---------------- */
  function sceneForEvent(id) {
    const e = D.events.find(x => x.id === id) || {}, t = e.tags || [];
    if (['carol_service', 'remembrance', 'nativity', 'founders'].includes(id) || t.includes('pew')) return { room: 'chapel' };
    if (['speech_day', 'leavers_dinner', 'staff_party', 'open_day', 'head_speech', 'head_staffmeeting'].includes(id)) return { room: 'hall' };
    if (['sports_day', 'staff_cricket', 'snow', 'head_snow'].includes(id)) return { room: id === 'snow' || id === 'head_snow' ? 'quad' : 'field' };
    if (t.includes('croquet') || t.includes('sport')) return { room: 'field' };
    if (t.includes('night')) return { room: S.school.boarding ? 'boarding' : 'quad', night: true };
    if (t.includes('housemaster') || t.includes('boarding')) return { room: S.school.boarding ? 'boarding' : 'classroom' };
    if (t.includes('matron')) return { room: 'san' };
    if (t.includes('head') || t.includes('slt') || t.includes('leadership') || t.includes('career') || t.includes('deputy')) return { room: S.career.role === 'Head' || ROLE_RANK() >= 3 ? 'study' : 'commonroom' };
    if (t.includes('commonroom') || t.includes('rival')) return { room: 'commonroom' };
    if (t.includes('parents') || t.includes('admissions') || t.includes('alumni')) return { room: 'reception' };
    if (t.includes('life') || t.includes('family') || t.includes('money')) return { room: 'quad', x: 60 };
    if (['classroom', 'pupils', 'latin', 'french', 'observation', 'kit', 'pastoral', 'win'].some(x => t.includes(x))) return { room: 'classroom' };
    if (t.includes('school') && S.school.id === 'larkspur' && id.startsWith('lark_forest')) return { room: 'forest' };
    return { room: level ? level.id : 'quad' };
  }
  const ROLE_RANK = () => P.ROLES[S.career.role].rank;
  function playEvent() {
    const ev = P.currentEvent(S);
    if (!ev) { afterChange(); return; }
    const pnd = S.pending[0];
    const sc = sceneForEvent(ev.id);
    const cast = Object.values((pnd && pnd.ctx && pnd.ctx.cast) || {});
    const show = () => {
      const opts = ev.choices.map(c => ({ label: c.label, disabled: !c.ok, note: !c.ok ? c.why : '', fn: () => { const r = P.choose(S, c.i); UI.save(); if (r && r.text) showResult(r); else closeDialog(); } }));
      showDialog({ emoji: ev.emoji, title: ev.title, text: ev.text, options: opts });
    };
    const moving = sc.room !== level.id || !!sc.night !== night;
    if (moving || cast.length) {
      const x = sc.x != null ? sc.x : moving ? (sc.room === 'field' ? 300 : sc.room === 'quad' ? 455 : 180) : player.x;
      fadeTo = () => { enterScene(sc.room, { night: !!sc.night, cast, x: Math.min(x, (sc.room === 'quad' ? 1300 : sc.room === 'field' ? 700 : 300)) }); show(); };
    } else show();
  }
  function pauseMenu() {
    showDialog({ emoji: '⏸️', title: 'Paused', text: `${P.myName(S)} · ${P.roleLabel(S)} · ${S.school.name}`, options: [
      { label: 'Back to the game', fn: closeDialog },
      { label: '📖 Classic view (journal and menus)', fn: () => { closeDialog(); UI.exitLive(); } },
      { label: '🎓 Career', fn: () => { closeDialog(); UI.openSheet('career'); } },
      { label: '👥 People', fn: () => { closeDialog(); UI.openSheet('people'); } },
      { label: '🏡 Life', fn: () => { closeDialog(); UI.openSheet('life'); } },
      { label: '❓ Controls', fn: () => showDialog({ title: 'Controls', text: '← → or A D to walk (Shift to hurry). Space to jump. ↑ or W at a door to go through it. E to talk or use things. N or the bell tower to ring the bell for the next half-term. Esc to pause. J for the classic journal.', options: [{ label: 'Got it', fn: closeDialog }] }) },
    ] });
  }

  /* ---------------- HUD & labels ---------------- */
  function updateHud() {
    if (!hud || !S) return;
    const st = S.stats, bar = (k, l) => `<div class="lv-stat"><span>${l}</span><i><u style="width:${st[k]}%;background:${st[k] >= 60 ? '#5fbf72' : st[k] >= 30 ? '#e3b04e' : '#e0605a'}"></u></i></div>`;
    const m = P.mood(S);
    hud.innerHTML = `<div class="lv-who"><b>${esc(P.myName(S))}</b><span>${esc(P.roleLabel(S))} · ${esc(S.school.name)}</span></div>
      <div class="lv-stats">${bar('morale', 'Morale')}${bar('energy', 'Energy')}${bar('teaching', 'Teaching')}${bar('rep', 'Rep')}</div>
      <div class="lv-meta"><span>${esc(P.htLabel(S))}</span><span>Age ${S.me.age} · ${esc(P.money(S.money))}</span><span>Time ${'●'.repeat(S.time)}${'○'.repeat(Math.max(0, S.maxTime - S.time))}${m ? ' · ' + esc(m.label) : ''}</span></div>`;
    const lines = []; for (let i = S.log.length - 1; i >= 0 && lines.length < 4; i--) { const sec = S.log[i]; for (let j = sec.lines.length - 1; j >= 0 && lines.length < 4; j--) lines.push(sec.lines[j].t); }
    ticker.innerHTML = lines.reverse().map(l => `<div>${esc(l)}</div>`).join('');
  }
  function drawTags() {
    const scale = cvs.clientWidth / W;
    const off = level.width > W ? camX : 0;
    let html = '';
    if (near) html += `<div class="lv-tag" style="left:${(near.x - off) * scale}px;top:${(FLOOR - 40) * scale}px">${esc(near.label)}</div>`;
    if (level.id !== 'quad' || true) html += `<div class="lv-room">${esc(level.id === 'quad' ? S.school.name : (level.name === "Head's study" && S.career.role === 'Head' ? 'Your study' : level.name))}</div>`;
    if (tags._h !== html) { tags.innerHTML = html; tags._h = html; }
  }

  /* ---------------- Mount / start / stop ---------------- */
  function mount() {
    if (root) return;
    root = document.createElement('div'); root.id = 'live';
    root.innerHTML = `<div class="lv-stage"><canvas width="${W}" height="${H}"></canvas><div class="lv-tags"></div><div class="lv-card"></div><div class="lv-dlg"></div></div><div class="lv-hud"></div><div class="lv-ticker"></div><div class="lv-help">← → walk · Space jump · ↑ doors · E use/talk · N bell · Esc pause · J journal</div>`;
    document.body.appendChild(root);
    cvs = root.querySelector('canvas'); ctx = cvs.getContext('2d');
    hud = root.querySelector('.lv-hud'); dlg = root.querySelector('.lv-dlg'); tags = root.querySelector('.lv-tags'); ticker = root.querySelector('.lv-ticker'); card = root.querySelector('.lv-card');
    window.addEventListener('keydown', e => {
      if (!running) return;
      if (dialogKeys(e)) { e.preventDefault(); return; }
      if (!keys[e.code]) pressed[e.code] = true; keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });
    window.addEventListener('resize', fit);
  }
  function fit() {
    if (!root) return;
    const stage = root.querySelector('.lv-stage');
    const availW = window.innerWidth - 24, availH = window.innerHeight - 210;
    const sc = Math.max(1, Math.min(availW / W, availH / H));
    stage.style.width = Math.floor(W * sc) + 'px'; stage.style.height = Math.floor(H * sc) + 'px';
  }
  function start(ui) {
    UI = ui; S = ui.getS(); mount();
    root.style.display = 'flex'; fit();
    if (!level || lastS !== S) { enterScene('quad', { x: 455 }); lastS = S; }
    updateHud();
    pressed = {}; for (const k in keys) keys[k] = false;
    if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  function stop() { running = false; cancelAnimationFrame(raf); if (root) root.style.display = 'none'; for (const k in keys) keys[k] = false; }
  function setState(s) { S = s; }
  window.PSL_LIVE = { start, stop, setState, supported: () => window.matchMedia && matchMedia('(min-width: 900px) and (pointer: fine)').matches, isRunning: () => running };
})();
