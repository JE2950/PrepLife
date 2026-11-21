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
    classroom: { name: 'Your classroom', spots: [{ x: 312, id: 'desk', label: 'Your desk' }, { x: 64, id: 'shelf', label: 'Bookshelf' }] },
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
    chapelBuilding();
    mainBuilding();
    boardingBuilding();
    // san
    R(865, FLOOR - 46, 64, 46, C.wall); R(861, FLOOR - 50, 72, 5, C.roof); R(888, FLOOR - 42, 14, 6, '#ffffff'); R(894, FLOOR - 44, 2, 10, '#c0392b'); R(890, FLOOR - 40, 10, 2, '#c0392b'); doorAt(895);
    // trees, benches, field gate
    grounds();
    (ST().tall ? [110, 230, 700, 1330] : ST().modern ? [110, 700, 1250, 1330] : [110, 230, 700, 960, 1040, 1250, 1330]).forEach(tree);
    for (const p of level.platforms) { R(p.x, p.y, p.w, 3, C.wood); R(p.x + 2, p.y + 3, 2, FLOOR - p.y - 3, C.wood2); R(p.x + p.w - 4, p.y + 3, 2, FLOOR - p.y - 3, C.wood2); }
    R(1375, FLOOR - 30, 3, 30, '#eee'); R(1392, FLOOR - 30, 3, 30, '#eee'); R(1375, FLOOR - 30, 20, 2, '#eee');
    ctx.restore();
  }
  let roomId = null;
  function interiorBase(wallA, wallB) {
    const st = ST();
    const special = ['san', 'bursary', 'boarding', 'chapel'].includes(roomId);
    const wa = special ? wallA : st.inWall, wb = special ? wallB : st.inWall2;
    R(0, 0, W, FLOOR, night ? '#2a2f45' : wa);
    if (st.tall && !special) { for (let x = 0; x < W; x += 16) R(x, 16, 1, FLOOR - 60, '#ffffff10'); }
    const ph = st.tall ? 56 : st.modern ? 6 : 44;
    R(0, FLOOR - ph, W, ph, night ? '#3a2f25' : st.panel); R(0, FLOOR - ph - 2, W, 2, st.modern ? '#b0b6be' : C.wood2);
    if (!st.modern) for (let x = 0; x < W; x += 25) R(x, FLOOR - ph, 1, ph, C.wood2);
    R(0, FLOOR, W, H - FLOOR, st.floor);
    if (st.tall) { for (let x = 0; x < W; x += 10) for (let y = FLOOR; y < H; y += 6) R(x + ((y / 6) % 2) * 5, y, 5, 1, st.floor2); }
    else if (st.modern) { for (let x = 0; x < W; x += 40) R(x, FLOOR, 1, H - FLOOR, st.floor2); }
    else for (let x = 0; x < W; x += 14) R(x, FLOOR, 1, H - FLOOR, st.floor2);
    R(0, 0, W, 12, wb);
    styledDoor(22);
    decorateInterior(roomId);
    if (night) { ctx.fillStyle = '#0a1030aa'; ctx.fillRect(0, 0, W, H); }
  }
  function drawRoom(id) {
    const cr = crest(); roomId = id;
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
      const modern = ST().modern;
      R(90, 34, 180, 70, modern ? '#f4f6f8' : '#24382c'); R(88, 32, 184, 2, modern ? '#5a6470' : C.wood); R(88, 104, 184, 3, modern ? '#5a6470' : C.wood);
      const ink = modern ? '#18233d' : '#e9eee6';
      txt(boardText(), 98, 44, ink); txt('Learning objective:', 98, 66, modern ? '#2a5aa8' : '#c9d6c9'); txt(objText(), 98, 78, ink);
      for (let i = 0; i < 4; i++) { const x = 130 + i * 50; R(x, FLOOR - 14, 30, 3, C.wood); R(x + 2, FLOOR - 11, 2, 11, C.wood2); R(x + 26, FLOOR - 11, 2, 11, C.wood2); }
      R(290, FLOOR - 20, 40, 4, C.wood); R(292, FLOOR - 16, 3, 16, C.wood2); R(325, FLOOR - 16, 3, 16, C.wood2); R(300, FLOOR - 26, 12, 6, '#f4f1ea'); R(316, FLOOR - 24, 6, 4, '#8a2433');
      R(46, FLOOR - 60, 36, 58, C.wood2); for (let s = 0; s < 4; s++) for (let b = 0; b < 6; b++) R(49 + b * 5, FLOOR - 56 + s * 14, 4, 11, pickH(['#8a2433', '#2f5d46', '#18233d', '#b8902f', '#5b4a6b'], b + s));
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
    if (mg && !dlg.classList.contains('on') && !fadeTo) {
      if (mg.kind === 'croquet') { updCroquet(dt); pressed = {}; return; }
      if (mg.kind === 'lesson') updLesson(dt); else if (mg.kind === 'duty') updDuty(dt);
    }
    if (!dlg.classList.contains('on') && !fadeTo) {
      const run = keys.ShiftLeft || keys.ShiftRight;
      const sp = run ? 120 : 78;
      let ax = 0;
      if (keys.ArrowLeft || keys.KeyA) ax -= 1;
      if (keys.ArrowRight || keys.KeyD) ax += 1;
      player.vx = ax * sp; if (ax) player.face = ax;
      if ((pressed.Space || pressed.KeyW && !nearDoor()) && player.ground) { player.vy = -205; player.ground = false; }
      if ((pressed.ArrowUp || pressed.KeyW) && !mg) { const d = nearDoor(); if (d) go(d); }
      if ((pressed.KeyE || pressed.Enter) && !mg) interact();
      if (pressed.KeyN && !mg) ringBell();
      if (pressed.Escape && !mg) pauseMenu();
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
    near = mg ? null : findNear();
    tickDay(dt);
    pressed = {};
    // events waiting? play them as scenes
    if (!dlg.classList.contains('on') && !fadeTo && !mg && S.pending.length) playEvent();
  }
  function draw() {
    ctx.imageSmoothingEnabled = false;
    if (mg && mg.kind === 'croquet') { drawCroquet(); drawTags(); return; }
    if (level.id === 'quad') drawQuad(); else drawRoom(level.id);
    ctx.save(); if (level.width > W) ctx.translate(-Math.round(camX), 0);
    for (const n of npcs) drawPerson(n.x, FLOOR, n.look, n.walk ? (Math.floor(n.t * 6) % 2) + 1 : 0, n.face);
    if (mg && mg.kind === 'lesson') drawLessonKids();
    if (mg && mg.kind === 'duty') drawDutyPeople();
    if (!mg) drawTaskItems();
    drawPerson(player.x, player.y, playerLook(), player.ground && Math.abs(player.vx) > 1 ? (Math.floor(player.anim / 6) % 2) + 1 : 0, player.face);
    ctx.restore();
    if (mg && mg.kind === 'lesson') drawLessonOverlay();
    if (mg && (mg.kind === 'lesson' || mg.kind === 'duty')) {
      const left = Math.max(0, mg.dur - mg.t);
      R(120, 6, 160, 9, '#000a'); if (mg.kind === 'lesson') { R(121, 7, 158 * mg.att / 100, 7, mg.att >= 60 ? '#5fbf72' : mg.att >= 35 ? '#e3b04e' : '#e0605a'); txt('ATTENTION', 122, 16, '#ffffff'); }
      else { txt(`Stopped ${mg.caught} · escaped ${mg.escaped}`, 122, 7, '#ffffff'); }
      txt(`${Math.ceil(left)}s`, 286, 7, '#ffffff');
    }
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
    for (const c of taskCands()) cands.push(c);
    let best = null;
    for (const c of cands) { const d = Math.abs(c.x - player.x) - (c.kind === 'npc' ? 0 : c.kind === 'task' ? 8 : 5); if (d < 12 && (!best || d < best.d)) best = Object.assign(c, { d }); }
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
    if (near.kind === 'task') return doTask(near);
  }
  function drawTaskItems() {
    for (const t of liveState().tasks) {
      if (t.done || t.failed || t.have || !t.pick || t.pick.room !== level.id) continue;
      const x = t.pick.x, y = FLOOR - 6, s = Math.floor(performance.now() / 250) % 2;
      R(x - 3, y, 6, 5, t.type === 'mug' ? '#f4f1ea' : t.type === 'book' ? '#8a2433' : t.type === 'socks' ? '#5b7fb8' : '#6b4b2b');
      if (s) { R(x - 5, y - 4, 1, 1, '#f3d27a'); R(x + 5, y - 3, 1, 1, '#f3d27a'); R(x, y - 7, 1, 1, '#f3d27a'); }
    }
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
    if (s.id === 'croquet') return showDialog({ emoji: '🔨', title: 'The croquet lawn', text: 'Six hoops and the peg. Par is twelve. Roquet the red ball for a bonus stroke.', options: [{ label: 'Play a round', fn: () => { dlg.classList.remove('on'); startCroquet(); } }, { label: 'Leave it', fn: closeDialog }] });
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
    const label = P.HT[S.ht].brk, L = liveState();
    showDialog({ emoji: '🔔', title: 'Ring the bell?', text: `End the half-term now and head into the ${label}? ${L.day + 1 < DAYS_PER_HT || L.minute < DAY_END - 1 ? 'You will skip the rest of this half-term\'s school days. ' : ''}You have ${S.time} ⏱ unspent.`, options: [
      { label: 'Ring it', fn: () => { dlg.classList.remove('on'); doAdvance(); } },
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
    const L = liveState(), cur = currentSlot(), nx = nextSlot();
    const due = cur && cur.kind !== 'chapel' ? cur : nx;
    const where = due ? `${due === cur ? 'NOW' : hhmm(due.start)} · ${due.label} · ${roomLabel(due.room)}${due === cur && level.id !== due.room ? ' ⚠️ go!' : ''}` : 'Nothing timetabled. Free time.';
    const tasks = L.tasks.map(t => `<span class="${t.done ? 'ok' : t.failed ? 'no' : ''}">${t.done ? '✓' : t.failed ? '✗' : t.have ? t.item.e : '○'} ${esc(t.text)}</span>`).join('');
    hud.innerHTML += `<div class="lv-day"><b>${hhmm(Math.min(L.minute, DAY_END))}</b><span>${esc(DAY_NAMES[L.day] || '')} · day ${L.day + 1}/${DAYS_PER_HT}</span><span class="lv-next">${esc(where)}</span></div>`;
    const jb = root.querySelector('.lv-jobs'); if (jb) jb.innerHTML = `<b>📮 Pigeonhole</b>${tasks}`;
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

  /* =====================================================================
     SCHOOL STYLES: each school has its own architecture and interiors
     ===================================================================== */
  const STYLES = {
    mudgrove: { // old manor house: honey stone, tall sash windows, chimneys, cupola
      wall: '#d8c08c', wall2: '#c4a872', roof: '#4b4f58', trim: '#efe3c4', door: '#3e2a1a',
      inWall: '#5e2a2a', inWall2: '#4a2020', panel: '#4a2f1c', floor: '#7a5230', floor2: '#6a4628', light: true, tall: true,
    },
    hambrook: { // modern and polished: white render, glass, timber cladding, flat roofs
      wall: '#f1f1ec', wall2: '#dcdcd6', roof: '#3a3f47', trim: '#9fd0e6', door: '#2b3a4a',
      inWall: '#eef1f4', inWall2: '#dfe4ea', panel: '#c9ced6', floor: '#8c939c', floor2: '#7d848d', modern: true,
    },
    thornbury: { // Victorian red brick, trophies and sporting pride
      wall: '#9c4a3a', wall2: '#86402f', roof: '#4a4e5a', trim: '#cbbfa6', door: '#5f3d24',
      inWall: '#efe6cf', inWall2: '#dfd4b8', panel: '#7d5a3a', floor: '#8a6a45', floor2: '#7a5b3a', brick: true,
    },
    larkspur: { // arts and crafts: cream render, timber, green roofs, murals and bunting
      wall: '#f0e2c0', wall2: '#d9c79f', roof: '#5f8a3f', trim: '#7a5030', door: '#c0623a',
      inWall: '#f6ead0', inWall2: '#cfe3d3', panel: '#b88a5a', floor: '#b08a5a', floor2: '#9c784c', arty: true,
    },
  };
  const ST = () => STYLES[S.school.id] || STYLES.thornbury;
  function sashWindow(x, y, w, h) {
    const st = ST();
    R(x - 2, y - 2, w + 4, h + 4, st.trim); R(x, y, w, h, night ? '#f3d27a' : '#a9c7d6');
    for (let i = 1; i < 3; i++) R(x + (w * i / 3), y, 1, h, st.trim);
    R(x, y + (h >> 1), w, 2, st.trim); R(x - 3, y + h + 2, w + 6, 2, st.trim);
  }
  function modernGlass(x0, x1, top) {
    R(x0, top, x1 - x0, FLOOR - top, night ? '#3a5a78' : '#9fd0e6');
    for (let x = x0; x < x1; x += 14) R(x, top, 1, FLOOR - top, '#5a7a90');
    R(x0, top + Math.floor((FLOOR - top) / 2), x1 - x0, 1, '#5a7a90');
    if (!night) for (let x = x0 + 4; x < x1; x += 28) R(x, top + 4, 6, 18, '#d6f0fa');
  }
  function mainBuilding() {
    const st = ST(), cr = crest(), top = FLOOR - (st.tall ? 96 : 80);
    const doorXs = level.doors.filter(d => d.x > 240 && d.x < 680).map(d => d.x);
    if (st.brick) { brickBlock(240, 680, FLOOR - 80); for (let x = 255; x < 670; x += 40) { if (doorXs.some(d => Math.abs(d - x - 6) < 16)) continue; windowAt(x, FLOOR - 66, 12, 16); windowAt(x, FLOOR - 40, 12, 14); } for (const x of [275, 345, 505, 585]) windowAt(x - 6, FLOOR - 66, 12, 16);
      // Victorian clock & bell tower
      R(435, FLOOR - 128, 40, 50, C.brick); R(431, FLOOR - 132, 48, 5, C.roof); R(445, FLOOR - 146, 20, 14, C.roof2); R(454, FLOOR - 154, 2, 8, C.gold);
      R(447, FLOOR - 120, 16, 16, '#2a2a2a'); R(451, FLOOR - 117, 8, 9, C.gold); R(439, FLOOR - 98, 32, 4, cr.fill);
      R(250, FLOOR - 92, 60, 8, '#18233d'); txt('1st XV 24-0', 253, FLOOR - 91, '#f1d38a');
    }
    if (st.tall) { // manor house
      R(240, top, 440, FLOOR - top, st.wall);
      for (let y = top + 6; y < FLOOR; y += 9) R(240, y, 440, 1, st.wall2);
      R(236, top - 4, 448, 5, st.trim); R(240, top - 18, 440, 14, st.roof); R(250, top - 22, 420, 4, st.roof);
      for (const x of [262, 360, 520, 640]) { R(x, top - 40, 14, 22, st.wall2); R(x - 2, top - 42, 18, 3, st.trim); R(x + 3, top - 46, 3, 4, '#8a5a3a'); R(x + 8, top - 46, 3, 4, '#8a5a3a'); }
      for (let x = 252; x < 670; x += 36) { if (doorXs.some(d => Math.abs(d - x - 7) < 14)) { sashWindow(x, top + 10, 14, 26); continue; } sashWindow(x, top + 10, 14, 26); sashWindow(x, FLOOR - 52, 14, 30); }
      // portico + cupola over the hall
      R(400, FLOOR - 66, 52, 4, st.trim); R(396, FLOOR - 74, 60, 8, st.trim); R(410, FLOOR - 82, 32, 8, st.trim);
      for (const x of [403, 415, 435, 447]) R(x, FLOOR - 62, 4, 62, '#f3ead2');
      R(441, top - 52, 28, 30, '#f3ead2'); R(443, top - 48, 24, 20, night ? '#f3d27a' : '#2a2a2a'); R(451, top - 44, 8, 10, C.gold); R(437, top - 56, 36, 5, st.roof); R(452, top - 66, 6, 10, st.roof); R(454, top - 70, 2, 4, C.gold);
      for (let x = 244; x < 680; x += 31) { const h = hash('iv' + x); R(x, top + 2, 3, 18 + h % 34, '#3d6b35'); R(x + 2, top + 10, 3, 8 + h % 20, '#4f7f42'); }
    }
    if (st.modern) {
      R(240, FLOOR - 84, 440, 84, st.wall); R(236, FLOOR - 88, 448, 5, st.roof);
      modernGlass(262, 330, FLOOR - 76); modernGlass(530, 640, FLOOR - 76);
      for (let x = 360; x < 520; x += 6) R(x, FLOOR - 76, 3, 40, '#b0855a');
      R(240, FLOOR - 40, 440, 2, '#cfcfca');
      // slim modern clock tower
      R(444, FLOOR - 150, 22, 66, st.wall2); R(442, FLOOR - 154, 26, 5, st.roof); R(447, FLOOR - 140, 16, 10, '#111'); txt(hhmm(liveState().minute), 447, FLOOR - 139, '#5fdc7a');
      R(448, FLOOR - 126, 14, 30, night ? '#f3d27a' : '#9fd0e6');
      for (const [x, c] of [[256, cr.band], [664, cr.band]]) { R(x, FLOOR - 120, 2, 36, '#bbb'); R(x + 2, FLOOR - 120, 12, 18, c); txt('H', x + 5, FLOOR - 116, '#fff'); }
      R(300, FLOOR - 98, 120, 10, '#18233d'); txt('HAMBROOK · EXCELLENCE', 304, FLOOR - 97, '#e6eaf0');
      for (const x of [250, 330, 600, 670]) { R(x, FLOOR - 10, 10, 10, '#4f8a3c'); R(x + 2, FLOOR - 14, 6, 4, '#3f7330'); }
    }
    if (st.arty) {
      R(240, FLOOR - 74, 440, 74, st.wall); for (let x = 240; x < 680; x += 20) R(x, FLOOR - 74, 3, 74, st.trim);
      R(236, FLOOR - 80, 448, 7, st.roof); for (let x = 240; x < 680; x += 8) R(x, FLOOR - 82, 4, 2, '#7aa84f');
      for (let x = 254; x < 670; x += 38) { if (doorXs.some(d => Math.abs(d - x - 6) < 16)) continue; windowAt(x, FLOOR - 62, 12, 16); }
      // mural and bunting
      const cols = ['#e0605a', '#f3c84a', '#5fbf72', '#5b7fb8', '#b85bb8'];
      for (let i = 0; i < 9; i++) R(360 + i * 12, FLOOR - 40, 10, 14, cols[i % 5]);
      for (let x = 250; x < 670; x += 10) { R(x, FLOOR - 70 + ((x / 10) % 2), 6, 1, '#7a5030'); R(x + 1, FLOOR - 69, 4, 4, cols[(x / 10) % 5]); }
      // timber bell frame
      R(440, FLOOR - 112, 30, 32, st.trim); R(444, FLOOR - 108, 22, 24, st.wall); R(450, FLOOR - 104, 10, 10, C.gold); R(436, FLOOR - 116, 38, 5, st.roof);
      for (let i = 0; i < 6; i++) R(260 + i * 9, FLOOR - 86, 7, 4, '#2a3a5a');
    }
    for (const d of level.doors) if (d.x > 240 && d.x < 680) styledDoor(d.x, d.to === 'hall');
  }
  function styledDoor(x, wide) {
    const st = ST(), w = wide ? 18 : 14;
    if (st.modern) { R(x - w / 2 - 1, FLOOR - 28, w + 2, 28, '#5a6470'); R(x - w / 2, FLOOR - 27, w, 27, night ? '#f3d27a' : '#bfe3f0'); R(x - 1, FLOOR - 27, 1, 27, '#5a6470'); return; }
    if (st.tall) { R(x - w / 2 - 3, FLOOR - 34, w + 6, 34, st.trim); R(x - w / 2, FLOOR - 31, w, 31, st.door); R(x - w / 2, FLOOR - 37, w, 4, night ? '#f3d27a' : '#a9c7d6'); R(x + w / 2 - 4, FLOOR - 15, 2, 2, C.gold); return; }
    if (st.arty) { R(x - w / 2 - 2, FLOOR - 26, w + 4, 26, st.trim); R(x - w / 2, FLOOR - 24, w, 24, st.door); R(x - w / 2 + 3, FLOOR - 20, w - 6, 6, '#f3c84a'); return; }
    doorAt(x, '', wide);
  }
  function chapelBuilding() {
    const st = ST(), cr = crest();
    if (st.modern) { R(130, FLOOR - 64, 90, 64, st.wall); R(126, FLOOR - 68, 98, 5, st.roof); modernGlass(140, 210, FLOOR - 56); R(171, FLOOR - 100, 8, 36, st.wall2); R(168, FLOOR - 92, 14, 2, st.wall2); styledDoor(175, true); return; }
    if (st.arty) { R(130, FLOOR - 50, 90, 50, '#c0623a'); R(126, FLOOR - 58, 98, 9, st.roof); R(160, FLOOR - 38, 30, 20, '#f3c84a'); txt('HALL OF', 152, FLOOR - 70, '#5f3d24'); txt('QUIET', 158, FLOOR - 62, '#5f3d24'); styledDoor(175, true); return; }
    const stone = st.tall ? '#cfc09a' : C.stone;
    R(130, FLOOR - 70, 90, 70, stone); R(130, FLOOR - 70, 90, 2, C.stone2);
    R(165, FLOOR - 110, 20, 40, stone); R(171, FLOOR - 126, 8, 16, C.stone2); R(174, FLOOR - 132, 2, 6, C.stone2);
    R(142, FLOOR - 58, 10, 22, night ? '#f3d27a' : '#7a5aa8'); R(198, FLOOR - 58, 10, 22, night ? '#f3d27a' : '#a85a5a'); R(170, FLOOR - 100, 10, 14, cr.fill);
    styledDoor(175, true);
  }
  function boardingBuilding() {
    const st = ST();
    if (!S.school.boarding) { R(740, FLOOR - 34, 70, 34, C.wood); R(735, FLOOR - 44, 80, 10, '#3f5f33'); R(745, FLOOR - 50, 60, 6, '#7aa84f'); R(760, FLOOR - 24, 30, 24, C.wood2); txt('FOREST', 756, FLOOR - 33, '#f3ead2'); styledDoor(775); R(822, FLOOR - 22, 30, 22, '#e8f0e8'); R(820, FLOOR - 24, 34, 3, '#cfd8cf'); return; }
    if (st.modern) { R(710, FLOOR - 70, 140, 70, st.wall); R(706, FLOOR - 74, 148, 5, st.roof); for (let x = 720; x < 840; x += 22) { R(x, FLOOR - 62, 14, 14, night ? '#f3d27a' : '#9fd0e6'); if (Math.abs(x - 768) > 10) R(x, FLOOR - 38, 14, 14, night ? '#f3d27a' : '#9fd0e6'); } styledDoor(775); return; }
    if (st.tall) { R(710, FLOOR - 76, 140, 76, st.wall); R(706, FLOOR - 80, 148, 5, st.trim); R(710, FLOOR - 92, 140, 12, st.roof); for (let x = 720; x < 840; x += 26) { sashWindow(x, FLOOR - 70, 12, 20); if (Math.abs(x - 768) > 12) sashWindow(x, FLOOR - 40, 12, 22); } styledDoor(775); return; }
    if (st.arty) { R(710, FLOOR - 64, 140, 64, st.wall); R(706, FLOOR - 70, 148, 7, st.roof); for (let x = 722; x < 840; x += 24) windowAt(x, FLOOR - 54, 10, 12, night); styledDoor(775); return; }
    brickBlock(710, 850, FLOOR - 70); for (let x = 722; x < 840; x += 24) { windowAt(x, FLOOR - 58, 10, 12, night); if (x !== 770) windowAt(x, FLOOR - 34, 10, 12, night); } doorAt(775);
  }
  function cedar(x) { R(x - 3, FLOOR - 40, 6, 40, '#4a3220'); R(x - 34, FLOOR - 50, 68, 7, '#2f4f2a'); R(x - 26, FLOOR - 62, 52, 7, '#2f4f2a'); R(x - 18, FLOOR - 72, 36, 6, '#2f4f2a'); }
  function grounds() {
    const st = ST();
    if (st.tall) { cedar(1000); cedar(1230); R(1080, FLOOR - 4, 90, 4, '#5a8ab0'); R(1085, FLOOR - 6, 80, 2, '#7aa6c8'); }
    if (st.modern) { R(980, FLOOR - 60, 150, 60, '#eef1f4'); modernGlass(990, 1120, FLOOR - 52); R(976, FLOOR - 64, 158, 5, st.roof); txt('SPORTS CENTRE', 1010, FLOOR - 62, '#18233d'); }
    if (st.brick) { for (let i = 0; i < 3; i++) { R(1000 + i * 70, FLOOR - 40, 2, 40, '#eee'); R(1016 + i * 70, FLOOR - 40, 2, 40, '#eee'); R(1000 + i * 70, FLOOR - 18, 18, 2, '#eee'); } }
    if (st.arty) { R(1000, FLOOR - 26, 70, 26, '#e8f0e8'); R(998, FLOOR - 28, 74, 3, '#cfd8cf'); R(1100, FLOOR - 14, 40, 14, '#7aa84f'); txt('VEG PATCH', 1100, FLOOR - 24, '#3f5f33'); }
  }
  function decorateInterior(id) {
    const st = ST(), cr = crest();
    if (st.tall) { // high ceilings: cornice, chandelier, portraits
      R(0, 12, W, 3, '#d8c08c'); R(0, 15, W, 1, '#a8905c');
      const cx = 200; R(cx, 15, 1, 12, C.gold); R(cx - 10, 27, 21, 2, C.gold); for (const dx of [-10, -4, 4, 10]) { R(cx + dx, 23, 1, 4, C.gold); R(cx + dx, 21, 1, 2, '#f7e9a8'); }
      if (!['classroom', 'boarding', 'san'].includes(id)) { R(340, 28, 26, 32, C.gold); R(342, 30, 22, 28, '#3a2a22'); R(350, 34, 8, 8, '#d9b48e'); R(348, 42, 12, 14, '#1a1a1a'); }
      if (id === 'commonroom' || id === 'study') { R(54, 24, 2, 4, '#e9e0c8'); R(48, 28, 14, 8, '#7a5a3a'); R(46, 26, 4, 4, '#e9e0c8'); R(58, 26, 4, 4, '#e9e0c8'); }
      if (id === 'commonroom') { R(240, FLOOR - 64, 14, 64, '#4a2f1c'); R(242, FLOOR - 60, 10, 10, '#f3ead2'); R(246, FLOOR - 56, 1, 4, '#1a1a1a'); R(246, FLOOR - 44, 2, 20, C.gold); }
      if (id === 'study' || id === 'reception') { R(140, FLOOR - 40, 40, 40, '#cfc09a'); R(146, FLOOR - 30, 28, 30, '#1a1210'); R(150, FLOOR - 14, 20, 8, '#e0702a'); R(154, FLOOR - 18, 12, 4, '#f3c84a'); R(136, FLOOR - 44, 48, 5, '#cfc09a'); }
    }
    if (st.modern) {
      R(0, 12, W, 2, '#c9ced6');
      if (['classroom', 'hall', 'commonroom', 'study'].includes(id)) { R(id === 'classroom' ? 290 : 150, 36, 70, 40, '#111'); R(id === 'classroom' ? 292 : 152, 38, 66, 36, '#2a4a6a'); txt('HAMBROOK', (id === 'classroom' ? 296 : 156), 42, '#e6eaf0'); txt('2.0', (id === 'classroom' ? 296 : 156), 52, cr.band === '#18233d' ? '#9fd0e6' : '#fff'); }
      R(380, FLOOR - 30, 12, 30, '#4f8a3c'); R(382, FLOOR - 40, 8, 10, '#3f7330'); R(379, FLOOR - 8, 14, 8, '#e6e6e6');
      if (id === 'reception') { R(250, FLOOR - 50, 10, 16, '#2a2a2a'); R(252, FLOOR - 44, 6, 4, '#8a5a3a'); txt('COFFEE', 246, FLOOR - 58, '#18233d'); }
    }
    if (st.arty) {
      const cols = ['#e0605a', '#f3c84a', '#5fbf72', '#5b7fb8', '#b85bb8'];
      for (let x = 0; x < W; x += 10) { R(x, 18 + ((x / 10) % 2), 6, 1, '#7a5030'); R(x + 1, 19, 4, 4, cols[(x / 10) % 5]); }
      for (const x of [330, 360]) { R(x, FLOOR - 10, 20, 10, cols[(x / 30) % 5]); R(x + 2, FLOOR - 13, 16, 4, cols[(x / 30 + 1) % 5]); }
      if (id !== 'san') for (let i = 0; i < 5; i++) R(60 + i * 18, 30, 14, 14, cols[i]);
    }
    if (st.brick && ['hall', 'reception', 'commonroom'].includes(id)) { R(330, FLOOR - 70, 44, 50, C.wood2); for (let i = 0; i < 6; i++) R(334 + (i % 3) * 13, FLOOR - 66 + Math.floor(i / 3) * 22, 8, 12, C.gold); txt('TROPHIES', 333, FLOOR - 78, '#18233d'); }
  }

  /* =====================================================================
     THE SCHOOL DAY: clock, timetable, pigeonhole jobs, mini-games
     ===================================================================== */
  const DAYS_PER_HT = 2, DAY_START = 480, DAY_END = 1020, MIN_PER_SEC = 2.5;
  const DAY_NAMES = ['Monday', 'Wednesday'];
  const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;
  const rnd = () => Math.random();
  const pickR = a => a[Math.floor(Math.random() * a.length)];
  let mg = null; // active mini-game

  function liveState() {
    if (!S.live || S.live.ay !== S.ay || S.live.ht !== S.ht) { S.live = { ay: S.ay, ht: S.ht, day: 0, minute: DAY_START, slots: [], tasks: [], started: false }; }
    return S.live;
  }
  function lessonsPerDay() { return [3, 3, 3, 2, 1, 1][P.ROLES[S.career.role].rank] - (S.career.role === 'Housemaster' ? 1 : 0); }
  function buildDay() {
    const L = liveState();
    const periods = [[525, 585, 'Period 1'], [590, 650, 'Period 2'], [675, 735, 'Period 3'], [810, 870, 'Period 4'], [870, 960, 'Period 5']];
    const games = S.flags.coach && L.day === 1;
    const usable = periods.filter(p => !(games && p[2] === 'Period 5'));
    const n = Math.max(1, lessonsPerDay());
    const chosen = usable.slice().sort(() => rnd() - 0.5).slice(0, n).sort((a, b) => a[0] - b[0]);
    const slots = [{ start: 495, end: 520, kind: 'chapel', room: 'chapel', label: 'Chapel' }];
    for (const [s, e, lab] of chosen) slots.push({ start: s, end: e, kind: 'lesson', room: 'classroom', label: `${lab}: Year ${3 + Math.floor(rnd() * 6)} ${S.me.subject}` });
    if (L.day === 0 || S.flags.divmaster || S.flags.tutor) slots.push({ start: 650, end: 672, kind: 'duty', room: 'quad', label: 'Break duty in the quad' });
    if (games) slots.push({ start: 870, end: 960, kind: 'games', room: 'field', label: `Games: ${P.sport(S)} on the field` });
    if (P.ROLES[S.career.role].rank >= 3) slots.push({ start: 975, end: 1010, kind: 'meeting', room: 'study', label: S.career.role === 'Head' ? 'Governors\' sub-committee' : 'SLT meeting' });
    slots.sort((a, b) => a.start - b.start);
    L.slots = slots; L.minute = DAY_START; L.tasks = makeTasks(); L.started = true;
    titleCard(`${DAY_NAMES[L.day] || 'Day ' + (L.day + 1)}`, `${P.htLabel(S)} · day ${L.day + 1} of ${DAYS_PER_HT}`);
  }
  // ---------- pigeonhole jobs ----------
  const ROOMS_FOR_ITEMS = () => ['classroom', 'hall', 'chapel', 'commonroom', 'san', 'reception'].concat(S.school.boarding ? ['boarding'] : []);
  function makeTasks() {
    const pool = [];
    const pupil = S.people.find(p => p.role === 'pupil');
    pool.push({ type: 'register', text: 'Take the register to Reception by 09:00', item: { e: '📋', n: 'Register' }, have: true, drop: { room: 'reception', x: 250 }, deadline: 540, fx: { rep: 1 } });
    pool.push({ type: 'forms', text: 'Get the trip forms to the Bursary by 12:00', item: { e: '📝', n: 'Trip forms' }, have: true, drop: { room: 'bursary', x: 240 }, deadline: 720, fx: { rep: 1, rel: { bursar: 3 } } });
    if (pupil) pool.push({ type: 'book', text: `Find ${pupil.first}'s lost exercise book and put it on your desk`, item: { e: '📕', n: `${pupil.first}'s book` }, have: false, pick: { room: pickR(ROOMS_FOR_ITEMS().filter(r => r !== 'classroom')), x: 140 + Math.floor(rnd() * 200) }, drop: { room: 'classroom', x: 300 }, deadline: 960, fx: { karma: 1, morale: 1 } });
    pool.push({ type: 'socks', text: S.school.boarding ? 'Take Matron\'s spare socks to the boarding house' : 'Take Matron\'s spare socks to lost property in Reception', item: { e: '🧦', n: 'Spare socks' }, have: false, pick: { room: 'san', x: 280 }, drop: S.school.boarding ? { room: 'boarding', x: 300 } : { room: 'reception', x: 250 }, deadline: 900, fx: { rel: { matron: 5 }, morale: 1 } });
    const rival = S.people.find(p => p.rival);
    if (rival) pool.push({ type: 'mug', text: `Your mug has vanished. ${P.dispName(rival)} was last seen near it`, item: { e: '☕', n: 'Your mug' }, have: false, pick: { room: pickR(['hall', 'reception', 'chapel']), x: 150 + Math.floor(rnd() * 180) }, drop: { room: 'commonroom', x: 110 }, deadline: 1000, fx: { morale: 3 } });
    pool.push({ type: 'kit', text: 'Fetch the cricket bag from the pavilion for the Games staff', item: { e: '🎒', n: 'Kit bag' }, have: false, pick: { room: 'field', x: 160 }, drop: { room: 'commonroom', x: 300 }, deadline: 870, fx: { rep: 1, energy: -1 } });
    return pool.sort(() => rnd() - 0.5).slice(0, 3).map((t, i) => Object.assign({ id: 'task' + i, done: false, failed: false }, t));
  }
  function taskCands() {
    const L = liveState(), out = [];
    for (const t of L.tasks) {
      if (t.done || t.failed) continue;
      if (!t.have && t.pick && t.pick.room === level.id) out.push({ kind: 'task', x: t.pick.x, t, act: 'pick', label: `E · Pick up ${t.item.e} ${t.item.n}` });
      if (t.have && t.drop.room === level.id) out.push({ kind: 'task', x: t.drop.x, t, act: 'drop', label: `E · Hand over ${t.item.e} ${t.item.n}` });
    }
    return out;
  }
  function doTask(c) {
    const t = c.t;
    if (c.act === 'pick') { t.have = true; flash(`Picked up ${t.item.e} ${t.item.n}`); }
    else {
      t.done = true; const fx = P.applyFx(S, t.fx, {});
      S.counters.liveTasks = (S.counters.liveTasks || 0) + 1;
      P.log(S, `✅ Job done: ${t.text.replace(/ by \d\d:\d\d/, '')}.`, 'action');
      showDialog({ emoji: t.item.e, title: 'Job done', text: t.text.replace(/ by \d\d:\d\d/, '') + '. Sorted.', fx, options: [{ label: 'Carry on', fn: closeDialog }] });
    }
  }
  function flash(msg) { titleCardSmall(msg); }
  function titleCardSmall(msg) { card.innerHTML = `<span style="font-size:26px;color:#f1d38a">${esc(msg)}</span>`; card.classList.remove('on'); void card.offsetWidth; card.classList.add('on'); }

  // ---------- clock & timetable ----------
  function currentSlot() { const L = liveState(); return L.slots.find(s => L.minute >= s.start && L.minute < s.end && !s.done); }
  function nextSlot() { const L = liveState(); return L.slots.find(s => s.start > L.minute && !s.done && s.kind !== 'chapel'); }
  function roomLabel(id) { return id === 'quad' ? 'the quad' : (ROOMS[id] ? ROOMS[id].name : id); }
  function tickDay(dt) {
    const L = liveState();
    if (dlg.classList.contains('on') || fadeTo || mg) return;
    if (!L.started) { buildDay(); return; }
    L.minute += dt * MIN_PER_SEC;
    for (const s of L.slots) {
      if (s.done) continue;
      const inRoom = level.id === s.room;
      if (L.minute >= s.start && L.minute < s.end && inRoom) {
        if (s.kind === 'chapel') { s.done = 'yes'; P.applyFx(S, { morale: 1, karma: 1 }, {}); flash('⛪ Chapel. A hymn and a notice about lost property.'); }
        else if (s.kind === 'meeting') { s.done = 'yes'; const fx = P.applyFx(S, { rep: 2, energy: -2 }, {}); showDialog({ emoji: '🗂️', title: s.label, text: 'Forty minutes of agenda items. You make one good point and it is minuted.', fx, options: [{ label: 'Carry on', fn: closeDialog }] }); }
        else if (s.kind === 'games') { s.done = 'yes'; if (!P.startEvent(S, 'match_day')) flash('🏉 Games. Everyone gets muddy.'); }
        else if (s.kind === 'lesson') { offerLesson(s); }
        else if (s.kind === 'duty') { offerDuty(s); }
        return;
      }
      if (L.minute >= s.end) {
        s.done = 'missed';
        if (s.kind === 'lesson') { const fx = P.applyFx(S, { rep: -3, morale: -2, perf: -3 }, {}); P.log(S, `⚠️ You missed ${s.label}. The class ran riot and the Head heard.`, 'sys'); showDialog({ emoji: '⚠️', title: 'You missed a lesson', text: `${s.label}. The class ran riot and the noise reached the Head's study.`, fx, options: [{ label: 'Oh dear', fn: closeDialog }] }); return; }
        if (s.kind === 'duty') { P.applyFx(S, { rep: -2 }, {}); P.log(S, '⚠️ You missed break duty. Someone noticed.', 'sys'); flash('⚠️ You missed break duty.'); }
        if (s.kind === 'meeting' || s.kind === 'games') { P.applyFx(S, { rep: -2 }, {}); flash(`⚠️ You missed ${s.label}.`); }
      }
    }
    for (const t of L.tasks) if (!t.done && !t.failed && L.minute > t.deadline) { t.failed = true; P.applyFx(S, { rep: -1, morale: -1 }, {}); flash(`✗ Missed: ${t.item.e} ${t.item.n}`); }
    if (L.minute >= DAY_END) endDay();
  }
  function endDay() {
    const L = liveState();
    const taught = L.slots.filter(s => s.kind === 'lesson' && s.done === 'yes').length, lessons = L.slots.filter(s => s.kind === 'lesson').length;
    const jobs = L.tasks.filter(t => t.done).length;
    const last = L.day + 1 >= DAYS_PER_HT;
    UI.save();
    showDialog({ emoji: '🌇', title: `End of ${DAY_NAMES[L.day] || 'the day'}`, text: `Lessons taught: ${taught} of ${lessons}. Jobs done: ${jobs} of ${L.tasks.length}. ${last ? 'That is the half-term done. Time to ring the bell.' : 'Home, supper, bed.'}`, options: [
      last ? { label: '🔔 Ring the bell for the end of half-term', fn: () => { dlg.classList.remove('on'); doAdvance(); } }
           : { label: 'Next day', fn: () => { dlg.classList.remove('on'); L.day++; fadeTo = () => { enterScene('quad', { x: 60 }); buildDay(); afterChange(); }; } },
    ] });
    L.minute = DAY_END - 0.01;
  }
  function doAdvance() {
    UI.chime && UI.chime('bell');
    fadeTo = () => {
      P.advance(S); UI.save();
      titleCard(`${P.HT[S.ht].term} term · ${P.HT[S.ht].half === 1 ? 'first' : 'second'} half`, `${P.htLabel(S)} · Age ${S.me.age}`);
      enterScene('quad', { x: 60 });
      liveState(); afterChange();
    };
  }

  // ---------- mini-game: the lesson ----------
  const DISRUPT = { joker: 'plane', chatter: 'talk', worrier: 'hand', knowall: 'hand', grafter: 'hand', scholar: 'hand', late: 'sleep', clueless: 'sleep', charmer: 'talk', governor: 'phone', quirky: 'plane', sporty: 'talk' };
  const SEATS = [126, 146, 176, 196, 226, 246, 276, 296];
  function offerLesson(s) {
    const late = Math.max(0, Math.round(liveState().minute - s.start));
    showDialog({ emoji: '🧑‍🏫', title: s.label, text: late > 3 ? `You are ${late} minutes late. The class is already restless.` : 'The class files in and sits down. Keep their attention for the whole lesson.', options: [{ label: 'Start the lesson', fn: () => { dlg.classList.remove('on'); startLesson(s, late); } }] });
  }
  function startLesson(slot, late) {
    const real = S.people.filter(p => p.role === 'pupil');
    const types = D.pupilTypes.map(t => t.id);
    const kids = SEATS.map((x, i) => {
      const p = real[i] || { id: 'fill' + i + slot.start, first: pickR(D.names.boys.concat(D.names.girls)), role: 'pupil', g: rnd() < 0.5 ? 'm' : 'f', type: pickR(types), year: 5 };
      return { p, x, look: lookFor(p), d: null };
    });
    npcs = []; // the seated class replaces wandering people
    mg = { kind: 'lesson', slot, t: 0, dur: 40, att: Math.max(25, 72 - late * 2.5), sum: 0, n: 0, kids, next: 1.5, handled: 0, missed: 0, answered: 0 };
    player.x = 330;
  }
  function updLesson(dt) {
    const m = mg; m.t += dt;
    const tch = S.stats.teaching;
    m.next -= dt;
    if (m.next <= 0) {
      const free = m.kids.filter(k => !k.d);
      if (free.length) { const k = pickR(free); k.d = { type: DISRUPT[k.p.type] || pickR(['talk', 'plane', 'hand', 'sleep']), t: 0, life: 6.5 }; }
      m.next = (1.6 + rnd() * 1.6) * (0.75 + tch / 120);
    }
    let active = 0;
    for (const k of m.kids) if (k.d) {
      k.d.t += dt; active++;
      if (k.d.t > k.d.life) { m.att -= k.d.type === 'hand' ? 4 : 9; m.missed++; k.d = null; }
    }
    m.att += (active ? -active * 1.6 : 1.4) * dt;
    m.att = Math.max(0, Math.min(100, m.att));
    m.sum += m.att * dt; m.n += dt;
    if (pressed.KeyE || pressed.Enter || pressed.Space) {
      const k = m.kids.filter(k => k.d).sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
      if (k && Math.abs(k.x - player.x) < 16) {
        if (k.d.type === 'hand') { m.att += 9; m.answered++; } else m.att += 6;
        m.handled++; k.d = null; UI.chime && null;
      }
    }
    if (m.t >= m.dur) finishLesson();
  }
  function finishLesson() {
    const m = mg; mg = null;
    const avg = m.sum / Math.max(1, m.n);
    m.slot.done = 'yes';
    const tier = avg >= 75 ? 0 : avg >= 55 ? 1 : avg >= 35 ? 2 : 3;
    const FX = [{ teaching: 3, rep: 2, morale: 4, perf: 4, energy: -2 }, { teaching: 2, rep: 1, morale: 1, perf: 2, energy: -2 }, { teaching: 1, morale: -2, energy: -3 }, { rep: -3, morale: -5, perf: -3, energy: -4 }][tier];
    const T = ['A pin-drop lesson', 'A good lesson', 'A shaky lesson', 'Carnage'][tier];
    const TXT = [`You held them for the full hour. ${m.answered} good questions answered. Someone said "is it over already?"`, `A solid lesson. You dealt with ${m.handled} interruptions without breaking stride.`, `You got through it. ${m.missed} things got away from you.`, `The lesson collapsed. A paper aeroplane is still circling the room.`][tier];
    const fx = P.applyFx(S, FX, {});
    S.counters.liveLessons = (S.counters.liveLessons || 0) + 1;
    if (tier === 0) S.counters.liveExcellent = (S.counters.liveExcellent || 0) + 1;
    P.log(S, `🧑‍🏫 ${m.slot.label}: ${T.toLowerCase()} (attention ${Math.round(avg)}%).`, 'action');
    liveState().minute = Math.max(liveState().minute, m.slot.end);
    buildNpcs([]);
    showDialog({ emoji: ['🌟', '👍', '😬', '🔥'][tier], title: T, text: `${TXT} Average attention: ${Math.round(avg)}%.`, fx, options: [{ label: 'Bell. Next!', fn: closeDialog }] });
  }
  function drawLessonOverlay() {
    const m = mg;
    for (const k of m.kids) {
      if (!k.d) continue;
      const x = Math.round(k.x - (level.width > W ? camX : 0)), y = FLOOR - 30;
      const urgent = k.d.t > k.d.life * 0.6 && Math.floor(k.d.t * 6) % 2;
      R(x - 6, y - 8, 12, 9, urgent ? '#e0605a' : '#ffffff'); R(x - 1, y + 1, 2, 2, urgent ? '#e0605a' : '#ffffff');
      const c = '#18233d';
      if (k.d.type === 'talk') { R(x - 4, y - 4, 2, 1, c); R(x - 1, y - 4, 2, 1, c); R(x + 2, y - 4, 2, 1, c); }
      if (k.d.type === 'plane') { R(x - 4, y - 5, 8, 1, c); R(x - 2, y - 4, 5, 1, c); R(x, y - 3, 2, 1, c); }
      if (k.d.type === 'hand') { R(x - 1, y - 7, 3, 6, '#e5b48e'); R(x - 2, y - 6, 1, 3, '#e5b48e'); }
      if (k.d.type === 'sleep') { R(x - 3, y - 7, 4, 1, c); R(x, y - 6, 1, 1, c); R(x - 2, y - 5, 1, 1, c); R(x - 3, y - 4, 4, 1, c); }
      if (k.d.type === 'phone') { R(x - 2, y - 7, 4, 6, '#222'); R(x - 1, y - 6, 2, 3, '#7fb2c8'); }
    }
  }
  function drawLessonKids() { for (const k of mg.kids) drawPerson(k.x, FLOOR - 3, k.look, 0, -1); }

  // ---------- mini-game: break duty ----------
  function offerDuty(s) {
    showDialog({ emoji: '🧭', title: 'Break duty', text: 'Stop the runners ("Walk, don\'t run!"), confiscate anything that glints, and get any lost little ones to Reception.', options: [{ label: 'On duty', fn: () => { dlg.classList.remove('on'); startDuty(s); } }] });
  }
  function startDuty(slot) {
    npcs = [];
    mg = { kind: 'duty', slot, t: 0, dur: 34, kids: [], next: 0.5, caught: 0, escaped: 0, contraband: 0, lost: null, lostDone: false };
  }
  function updDuty(dt) {
    const m = mg; m.t += dt; m.next -= dt;
    const doors = [275, 345, 425, 505, 585, 650];
    if (m.next <= 0 && m.t < m.dur - 3) {
      const from = pickR(doors), to = pickR(doors.filter(d => d !== from));
      const p = { id: 'run' + m.t, first: pickR(D.names.boys.concat(D.names.girls)), role: 'pupil', g: 'm', type: 'sporty' };
      m.kids.push({ x: from, to, sp: 55 + rnd() * 45, look: lookFor(p), glint: rnd() < 0.25, t: 0 });
      m.next = 0.9 + rnd() * 1.1;
    }
    if (!m.lost && m.t > 6) { const p = { id: 'lost', first: 'Wilf', role: 'pupil', g: 'm', type: 'worrier' }; m.lost = { x: 720, look: Object.assign(lookFor(p), { h: 13 }), follow: false }; }
    for (const k of m.kids) { const d = k.to - k.x; k.x += Math.sign(d) * Math.min(Math.abs(d), k.sp * dt); k.t += dt; if (Math.abs(d) < 2) { k.gone = true; m.escaped++; } }
    m.kids = m.kids.filter(k => !k.gone && !k.caught);
    if (m.lost && m.lost.follow && !m.lostDone) { m.lost.x += (player.x - 12 * player.face - m.lost.x) * Math.min(1, dt * 4); if (Math.abs(player.x - 275) < 12) { m.lostDone = true; m.lost = null; flash('🧒 Wilf is safely at Reception'); } }
    if (pressed.KeyE || pressed.Enter) {
      const k = m.kids.slice().sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
      if (k && Math.abs(k.x - player.x) < 14) { k.caught = true; m.caught++; if (k.glint) m.contraband++; flash(k.glint ? 'Confiscated! 🍬' : 'Walk, don\'t run!'); }
      else if (m.lost && !m.lost.follow && Math.abs(m.lost.x - player.x) < 14) { m.lost.follow = true; flash('🧒 "I can\'t find Reception..." Lead him there.'); }
    }
    if (m.t >= m.dur) finishDuty();
  }
  function finishDuty() {
    const m = mg; mg = null; m.slot.done = 'yes';
    const total = m.caught + m.escaped, ratio = total ? m.caught / total : 1;
    const fx = P.applyFx(S, { rep: ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : -1, karma: m.lostDone ? 3 : 0, morale: ratio >= 0.7 ? 2 : -1, energy: -2 }, {});
    P.log(S, `🧭 Break duty: ${m.caught} runners stopped, ${m.contraband} confiscations${m.lostDone ? ', one lost Year 3 rescued' : ''}.`, 'action');
    liveState().minute = Math.max(liveState().minute, m.slot.end);
    buildNpcs([]);
    showDialog({ emoji: '🧭', title: 'Break is over', text: `You stopped ${m.caught} of ${total} runners and confiscated ${m.contraband} things.${m.lostDone ? ' Wilf got to Reception safely.' : m.lost ? ' Wilf is still wandering near the San.' : ''}`, fx, options: [{ label: 'Back to work', fn: closeDialog }] });
  }
  function drawDutyPeople() {
    const m = mg;
    for (const k of m.kids) { drawPerson(k.x, FLOOR, k.look, (Math.floor(k.t * 10) % 2) + 1, Math.sign(k.to - k.x) || 1); if (k.glint && Math.floor(k.t * 8) % 2) R(k.x + 3, FLOOR - 14, 2, 2, '#f3d27a'); }
    if (m.lost) { drawPerson(m.lost.x, FLOOR, m.lost.look, m.lost.follow ? 1 : 0, 1); if (!m.lost.follow) R(m.lost.x - 1, FLOOR - 16, 2, 2, '#7fb2c8'); }
  }

  // ---------- mini-game: croquet ----------
  const HOOPS = [[90, 170], [90, 60], [310, 60], [310, 170], [200, 140], [200, 90]], PEG = [200, 115];
  function startCroquet() {
    mg = { kind: 'croquet', ball: { x: 60, y: 200, vx: 0, vy: 0 }, red: { x: 250, y: 120, vx: 0, vy: 0 }, aim: -Math.PI / 2, power: 0, charging: false, dir: 1, hoop: 0, strokes: 0, par: 12, msg: 'Aim with ← →, hold Space for power, release to strike.', done: false, roqueted: false };
  }
  function moving(b) { return Math.abs(b.vx) + Math.abs(b.vy) > 2; }
  function updCroquet(dt) {
    const m = mg, b = m.ball, r = m.red;
    const still = !moving(b) && !moving(r);
    if (still && !m.done) {
      if (keys.ArrowLeft || keys.KeyA) m.aim -= dt * 2.2;
      if (keys.ArrowRight || keys.KeyD) m.aim += dt * 2.2;
      if (keys.Space) { m.charging = true; m.power += m.dir * dt * 1.3; if (m.power > 1) { m.power = 1; m.dir = -1; } if (m.power < 0) { m.power = 0; m.dir = 1; } }
      else if (m.charging) { m.charging = false; const sp = 40 + m.power * 260; b.vx = Math.cos(m.aim) * sp; b.vy = Math.sin(m.aim) * sp; m.strokes++; m.power = 0; m.dir = 1; m.roqueted = false; }
    }
    for (const o of [b, r]) {
      o.x += o.vx * dt; o.y += o.vy * dt; const f = Math.pow(0.35, dt); o.vx *= f; o.vy *= f;
      if (Math.abs(o.vx) + Math.abs(o.vy) < 3) { o.vx = 0; o.vy = 0; }
      if (o.x < 22 || o.x > 378) { o.vx *= -0.6; o.x = Math.max(22, Math.min(378, o.x)); }
      if (o.y < 22 || o.y > 214) { o.vy *= -0.6; o.y = Math.max(22, Math.min(214, o.y)); }
    }
    const dx = r.x - b.x, dy = r.y - b.y, dd = Math.hypot(dx, dy);
    if (dd < 6 && dd > 0) { const sp = Math.hypot(b.vx, b.vy); r.vx = dx / dd * sp * 0.9; r.vy = dy / dd * sp * 0.9; b.vx *= 0.2; b.vy *= 0.2; if (!m.roqueted) { m.roqueted = true; m.strokes = Math.max(0, m.strokes - 1); m.msg = 'Roquet! A bonus stroke.'; } }
    if (m.hoop < HOOPS.length) { const h = HOOPS[m.hoop]; if (Math.abs(b.x - h[0]) < 6 && Math.abs(b.y - h[1]) < 5) { m.hoop++; m.msg = m.hoop < HOOPS.length ? `Hoop ${m.hoop} run! Next: hoop ${m.hoop + 1}.` : 'All hoops run. Now hit the peg!'; } }
    else if (Math.hypot(b.x - PEG[0], b.y - PEG[1]) < 6) { finishCroquet(true); }
    if (m.strokes >= 24 && still) finishCroquet(false);
    if (pressed.Escape) finishCroquet(false, true);
  }
  function finishCroquet(won, quit) {
    const m = mg; mg = null;
    if (quit) return closeDialog();
    const par = won && m.strokes <= m.par;
    const first = !(liveState().croquetPlayed); liveState().croquetPlayed = true;
    const fx = first ? P.applyFx(S, par ? { morale: 6, energy: 3, rep: 1 } : won ? { morale: 4, energy: 2 } : { morale: 1 }, {}) : [];
    if (par) S.counters.croquetPar = (S.counters.croquetPar || 0) + 1;
    P.log(S, won ? `🔨 A round of croquet in ${m.strokes} strokes${par ? ', under par' : ''}.` : '🔨 You abandon a round of croquet in disgust.', 'action');
    showDialog({ emoji: '🔨', title: won ? (par ? 'Under par!' : 'Round complete') : 'Out of strokes', text: won ? `Six hoops and the peg in ${m.strokes} strokes (par ${m.par}).${first ? '' : ' (Only your first round each day counts for stats.)'}` : 'Twenty-four strokes and still not pegged out. The lawn wins today.', fx, options: [{ label: 'Play again', fn: () => { dlg.classList.remove('on'); startCroquet(); } }, { label: 'Put the mallet away', fn: closeDialog }] });
  }
  function drawCroquet() {
    const m = mg;
    R(0, 0, W, H, '#2f6b2a'); for (let y = 12; y < H - 12; y += 16) R(12, y, W - 24, 8, '#367a30');
    R(12, 12, W - 24, 2, '#f4f4f4'); R(12, H - 14, W - 24, 2, '#f4f4f4'); R(12, 12, 2, H - 24, '#f4f4f4'); R(W - 14, 12, 2, H - 24, '#f4f4f4');
    HOOPS.forEach((h, i) => { const col = i === m.hoop ? '#f3d27a' : i < m.hoop ? '#7aa070' : '#f4f4f4'; R(h[0] - 5, h[1] - 1, 2, 3, col); R(h[0] + 4, h[1] - 1, 2, 3, col); R(h[0] - 5, h[1] - 2, 11, 1, col); txt(String(i + 1), h[0] - 2, h[1] + 4, '#e9eee6'); });
    R(PEG[0] - 1, PEG[1] - 4, 3, 6, '#2a5aa8'); R(PEG[0] - 1, PEG[1] - 4, 3, 1, '#c0392b');
    R(m.red.x - 2, m.red.y - 2, 5, 5, '#c0392b'); R(m.ball.x - 2, m.ball.y - 2, 5, 5, '#2a5aa8'); R(m.ball.x - 1, m.ball.y - 2, 2, 1, '#7aa6e8');
    if (!moving(m.ball) && !moving(m.red)) { for (let i = 4; i < 30; i += 3) R(m.ball.x + Math.cos(m.aim) * i, m.ball.y + Math.sin(m.aim) * i, 1, 1, '#ffffff'); }
    R(20, 20, 60, 6, '#0006'); R(21, 21, 58 * m.power, 4, m.power > 0.8 ? '#e0605a' : '#f3d27a');
    txt(`Strokes ${m.strokes} · par ${m.par} · hoop ${Math.min(m.hoop + 1, 6)}${m.hoop >= 6 ? ' → peg' : ''}`, 90, 20, '#ffffff');
    txt(m.msg, 20, H - 26, '#ffffff');
  }

  /* ---------------- Mount / start / stop ---------------- */
  function mount() {
    if (root) return;
    root = document.createElement('div'); root.id = 'live';
    root.innerHTML = `<div class="lv-stage"><canvas width="${W}" height="${H}"></canvas><div class="lv-tags"></div><div class="lv-jobs"></div><div class="lv-card"></div><div class="lv-dlg"></div></div><div class="lv-hud"></div><div class="lv-ticker"></div><div class="lv-help">← → walk · Space jump · ↑ doors · E use/talk · N bell · Esc pause · J journal</div>`;
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
    const availW = window.innerWidth - 24, availH = window.innerHeight - 250;
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
  D.achievements.push(
    { id: 'pindrop', emoji: '🤫', title: 'Pin drop', desc: 'Teach five pin-drop lessons in Live mode', test: s => (s.counters.liveExcellent || 0) >= 5 },
    { id: 'hoopdreams', emoji: '🔨', title: 'Hoop dreams', desc: 'Go round the croquet lawn under par', test: s => (s.counters.croquetPar || 0) >= 1 },
    { id: 'busybee', emoji: '🐝', title: 'Busy bee', desc: 'Finish ten pigeonhole jobs', test: s => (s.counters.liveTasks || 0) >= 10 },
  );
  window.PSL_LIVE = { start, stop, setState, supported: () => window.matchMedia && matchMedia('(min-width: 900px) and (pointer: fine)').matches, isRunning: () => running };
})();
