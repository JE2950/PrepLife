/* Ranks: each role has its own activities, powers, responsibilities and events.
   ECT · Teacher · Head of Department / Housemaster · Director of Studies · Deputy Head · Head */
(function (root) {
  'use strict';
  const D = root.PSL_DATA;
  const SLT = { minRank: 3 };            // DoS, Deputy, Head
  const LEADERS = { minRank: 2 };        // HoD / Housemaster and above
  const HEAD = { role: 'Head' };

  /* ---------- Fit existing events to rank ---------- */
  D.eventPatches = {
    clash: { when: { maxRank: 3 } }, forgot_lesson: { when: { maxRank: 3 } }, miscomm: { when: { maxRank: 3 } },
    lost_scripts: { when: { maxRank: 3 } }, scrutiny: { when: { maxRank: 2 } }, why_different: { when: { maxRank: 2 } },
    mock_inspection: { when: { maxRank: 2 } }, cover_slip: { when: { maxRank: 2 } }, school_trip: { when: { maxRank: 3 } },
    ce_exams: { when: { maxRank: 3 } }, wifi: { when: { maxRank: 3 } }, board: { when: { maxRank: 3 } },
    staff_meeting: { when: { maxRank: 3 } }, inset: { when: { maxRank: 3 } }, hog_request: { when: { maxRank: 3 } },
    ham_slt: { when: { maxRank: 2 } }, ham_vision: { when: { maxRank: 3 } }, ham_drowning: { when: { maxRank: 2 } },
    head_word: { when: { maxRank: 4 } }, rival_team: { when: { maxRank: 3 } }, rival_idea: { when: { maxRank: 4 } },
    lost_book: { when: { maxRank: 3 } }, vomit: { when: { maxRank: 4 } }, cheeky_q: { when: { maxRank: 4 } },
    photocopier: { when: { maxRank: 3 } }, translation: { when: { maxRank: 4 } }, reports_season: { when: { maxRank: 3 } },
    parents_evening: { when: { maxRank: 4 } }, thb_coach_please: { when: { maxRank: 3 } }, mud_head_chat: { when: { maxRank: 4 } },
    bullying: { tags: ['pastoral'] }, governor_kid: { when: { maxRank: 3 } }, flu: { when: { maxRank: 4 } },
    head_word: { when: { maxRank: 3 } }, snow: { when: { maxRank: 4 } }, nits: { tags: ['pupils'] }, letter_home: { tags: ['pupils'] },
    premium_bonds: { weight: 1 }, kettle: { tags: ['commonroom'] }, bursar_stapler: { when: { maxRank: 4 } },
  };
  // responsibilities that belong to junior staff
  // everyday activities that stop making sense higher up
  const ACT_LIMIT = { mark: 3, help: 3, observe: 2, volunteer: 2, idea: 4, plan: 4 };
  for (const a of D.actions) if (ACT_LIMIT[a.id] != null) a.show = Object.assign({}, a.show || {}, { maxRank: ACT_LIMIT[a.id] });
  D.respPatches = { tutor: { maxRank: 2 }, divmaster: { maxRank: 2 }, resident: { maxRank: 1 }, club: { maxRank: 3 }, trips: { maxRank: 3 } };

  /* ---------- Senior portfolios (responsibilities for leaders) ---------- */
  D.resp.push(
    { id: 'safeguarding', emoji: '🛡️', label: 'Designated Safeguarding Lead', sub: 'The phone never stops. The most important job in the school.', drain: 5, show: { minRank: 3 }, onAdd: { rep: 4 } },
    { id: 'exams', emoji: '🗂️', label: 'Exams officer', sub: 'CE entries, access arrangements, papers under lock and key', drain: 3, show: { minRank: 2, maxRank: 4 } },
    { id: 'heads_assoc', emoji: '🤝', label: "Chair the local heads' group", sub: 'Network, gossip and influence', drain: 3, show: HEAD },
    { id: 'mentor_ects', emoji: '🌱', label: 'ECT mentor', sub: 'Guide the new teachers through induction', drain: 3, show: { minRank: 1, maxRank: 3 }, when: { stat: { years: '>=3' } }, why: 'After three years' },
  );

  /* ---------- "Your role" activities ---------- */
  const R = (role, a) => Object.assign({ tab: 'act', group: 'Your role' }, a, { show: Object.assign({ role }, a.show || {}) });
  D.actions.unshift(
    // ECT
    R('ECT', { id: 'portfolio', emoji: '📁', label: 'Work on your induction portfolio', sub: 'Evidence for the Teachers\' Standards. Four entries makes passing easier.',
      outcomes: [{ w: 1, text: 'You write up three lessons against the Teachers\' Standards. Your mentor is delighted.', fx: { teaching: 2, energy: -3, count: 'portfolio', rep: 1 } }] }),
    R('ECT', { id: 'mentor_mtg', emoji: '☕', label: 'Meet your mentor', sub: 'An honest hour with someone who has seen it all', show: { has: 'hod' },
      outcomes: [
        { w: 70, text: '{hod} talks you through behaviour management with a biscuit in each hand. It helps.', fx: { teaching: 3, morale: 3, rel: { hod: 4 } } },
        { w: 30, text: 'The meeting is mostly {hod} telling you about {hod.his} allotment. You leave calmer, oddly.', fx: { morale: 4, rel: { hod: 3 } } },
      ] }),
    // Teacher
    R('Teacher', { id: 'working_party', emoji: '🗃️', label: 'Join a working party', sub: 'Get noticed by SLT', show: { stat: { years: '>=2' } },
      outcomes: [
        { w: 60, by: { charisma: 0.4 }, text: 'You join the working party on homework. Your idea makes the final report, with your name on it.', fx: { rep: 4, energy: -4, ambition: 2 } },
        { w: 40, text: 'The working party meets four times and produces a laminated poster.', fx: { rep: 1, energy: -4, morale: -1 } },
      ] }),
    R('Teacher', { id: 'trainee', emoji: '🎒', label: 'Host a trainee teacher', sub: 'Teaching up, energy down', show: { stat: { years: '>=3' } },
      outcomes: [
        { w: 70, text: 'Your trainee is lovely. Watching them teach shows you three of your own bad habits.', fx: { teaching: 3, energy: -3, karma: 2 } },
        { w: 30, text: 'Your trainee teaches 7C a "fun" lesson. You spend a fortnight rebuilding order.', fx: { energy: -5, morale: -2 } },
      ] }),
    // Head of Department
    R('HoD', { id: 'dept_meeting', emoji: '👥', label: 'Run a department meeting', sub: 'Steer your team',
      outcomes: [
        { w: 60, by: { charisma: 0.5, organisation: 0.3 }, text: 'A sharp, useful meeting. Everyone leaves with a job and nobody grumbles.', fx: { rep: 3, perf: 4, energy: -2, sch: { staff: 1 } } },
        { w: 40, text: 'The meeting overruns by forty minutes on the subject of glue sticks.', fx: { energy: -3, morale: -2 } },
      ] }),
    R('HoD', { id: 'observe_dept', emoji: '🔎', label: 'Observe your department', sub: 'Spot problems before parents do', cast: { col: 'colleague' },
      outcomes: [
        { w: 60, text: 'You watch {col} teach. Good lesson. Your feedback is kind and specific.', fx: { rel: { col: 4 }, perf: 3, energy: -3 } },
        { w: 40, text: 'You watch {col} teach. It is not good. A difficult conversation follows.', fx: { rel: { col: -5 }, perf: 2, energy: -4, rep: 1 } },
      ] }),
    R('HoD', { id: 'budget_bid', emoji: '💷', label: 'Bid for department money', sub: 'Brave the Bursar', show: { has: 'bursar' },
      outcomes: [
        { w: 45, by: { charisma: 0.6 }, text: '{bursar} approves new textbooks for the whole department. Your team cheer.', fx: { rel: { bursar: -2 }, rep: 3, morale: 4 } },
        { w: 55, byRel: { bursar: 0.5 }, text: '{bursar} offers you a box of whiteboard pens and a sympathetic face.', fx: { morale: -2 } },
      ] }),
    R('HoD', { id: 'moderate', emoji: '⚖️', label: 'Moderate the exam marking', sub: 'Make the grades consistent',
      outcomes: [{ w: 1, by: { organisation: 0.5 }, text: 'You moderate every script. Two generous markers are gently corrected.', fx: { perf: 5, rep: 2, energy: -4 } }] }),
    // Housemaster
    R('Housemaster', { id: 'house_rounds', emoji: '🔦', label: 'Evening rounds of the house', sub: 'Every dorm, every night',
      outcomes: [
        { w: 70, text: 'You do your rounds. A worried boy, a broken window catch and a contraband Pot Noodle. All dealt with.', fx: { rep: 2, karma: 2, energy: -3 } },
        { w: 30, text: 'Your rounds find a Year 6 crying over a lost cuddly toy. You find it in the laundry.', fx: { karma: 3, morale: 4, energy: -3 } },
      ] }),
    R('Housemaster', { id: 'house_supper', emoji: '🍕', label: 'Host a house supper', sub: '£120 · the house loves you for it', need: { stat: { money: '>=120' } },
      outcomes: [{ w: 1, text: 'Pizza for sixty in your kitchen. The house talks about it until half-term.', fx: { money: -120, morale: 5, rep: 3 } }] }),
    R('Housemaster', { id: 'house_letter', emoji: '✉️', label: 'Write the weekly letter to parents', sub: 'Keep the parents onside',
      outcomes: [
        { w: 70, by: { charisma: 0.4 }, text: 'Your weekly letter is so charming that three parents reply just to say so.', fx: { rep: 3, energy: -2 } },
        { w: 30, text: 'You misspell a boy\'s name in the letter. His mother notices first.', fx: { rep: -1, energy: -2 } },
      ] }),
    // Director of Studies
    R('DoS', { id: 'data_dive', emoji: '📊', label: 'Analyse the school data', sub: 'Find who is slipping, and why',
      outcomes: [
        { w: 60, by: { organisation: 0.6 }, text: 'Your spreadsheet spots a dip in Year 6 maths before anyone else. Intervention groups start Monday.', fx: { rep: 4, perf: 5, energy: -3 } },
        { w: 40, text: 'The data says everything is fine. You do not believe it.', fx: { energy: -3 } },
      ] }),
    R('DoS', { id: 'plan_cpd', emoji: '🎓', label: 'Plan the staff CPD programme', sub: 'Better training means better teaching',
      outcomes: [
        { w: 55, by: { charisma: 0.4, teaching: 0.3 }, text: 'Your INSET on questioning is the first one in years that staff actually use.', fx: { rep: 4, sch: { staff: 3 }, energy: -4 } },
        { w: 45, text: 'Your INSET runs long. Someone falls asleep in the second session.', fx: { sch: { staff: -1 }, energy: -4 } },
      ] }),
    R('DoS', { id: 'scholar_prog', emoji: '📜', label: 'Run the scholarship programme', sub: 'Stretch the brightest pupils',
      outcomes: [{ w: 1, by: { teaching: 0.5 }, text: 'Your scholarship set work through past papers on Saturday mornings. Their confidence soars.', fx: { rep: 3, energy: -3, sch: { roll: 1 } } }] }),
    // Deputy Head
    R('Deputy', { id: 'corridors', emoji: '🚶', label: 'Walk the corridors', sub: 'Be seen. Calm things down.',
      outcomes: [
        { w: 70, text: 'You walk the school all morning. Behaviour improves wherever you are.', fx: { rep: 3, energy: -3, sch: { staff: 1 } } },
        { w: 30, text: 'You find two Year 8s on the roof of the music block. Nobody knows how.', fx: { rep: 2, energy: -4 } },
      ] }),
    R('Deputy', { id: 'behaviour_logs', emoji: '📒', label: 'Review the behaviour logs', sub: 'Patterns, problems, and repeat offenders',
      outcomes: [{ w: 1, by: { organisation: 0.5 }, text: 'You spot that most incidents happen on Wednesday afternoons near the Art block. You move a duty and they stop.', fx: { rep: 4, perf: 4, energy: -3 } }] }),
    R('Deputy', { id: 'calendar_plan', emoji: '🗓️', label: 'Plan next year\'s calendar', sub: 'Every fixture, trip, exeat and INSET',
      outcomes: [
        { w: 60, by: { organisation: 0.6 }, text: 'The calendar is published on time with no clashes. A small miracle.', fx: { rep: 4, energy: -5, sch: { staff: 2 } } },
        { w: 40, text: 'You schedule Sports Day on the same day as the Year 8 leavers\' trip. Nobody notices until May.', fx: { rep: -3, energy: -5 } },
      ] }),
    // Head
    R('Head', { id: 'charm_govs', emoji: '🏛️', label: 'Lunch with the Chair of Governors', sub: 'Keep the board onside',
      outcomes: [
        { w: 65, by: { charisma: 0.5 }, text: 'A long lunch. The Chair leaves convinced the school is in safe hands.', fx: { rep: 5, energy: -2, money: -60 } },
        { w: 35, text: 'The Chair spends lunch telling you how the school was run in 1987.', fx: { rep: 2, energy: -3, morale: -2 } },
      ] }),
    R('Head', { id: 'tours', emoji: '🏰', label: 'Show prospective families round', sub: 'Pupil numbers are your job now',
      outcomes: [
        { w: 60, by: { charisma: 0.6 }, text: 'Four families, four tours, three sign-ups. The Registrar buys you a coffee.', fx: { sch: { roll: 4, finance: 2 }, energy: -4 } },
        { w: 40, text: 'A prospective child bites a current one during the tour. One sign-up, from a family that admired your calm.', fx: { sch: { roll: 1 }, energy: -4 } },
      ] }),
    R('Head', { id: 'nurseries', emoji: '🧸', label: 'Visit the local nurseries', sub: 'Plant seeds for Year 3 entry',
      outcomes: [{ w: 1, text: 'You read The Gruffalo to forty four-year-olds. Several parents ask for a prospectus.', fx: { sch: { roll: 3 }, energy: -3, morale: 2 } }] }),
    R('Head', { id: 'assembly', emoji: '🎤', label: 'Give a whole-school assembly', sub: 'Set the tone',
      outcomes: [
        { w: 60, by: { charisma: 0.6 }, text: 'Your assembly on kindness is quoted back to you by a Year 4 at lunch.', fx: { rep: 3, sch: { staff: 2 }, karma: 1 } },
        { w: 40, text: 'Your PowerPoint fails. You do the whole thing from memory. It is better.', fx: { rep: 2, morale: 2 } },
      ] }),
    R('Head', { id: 'fundraise', emoji: '🏗️', label: 'Fundraise for the new building', sub: 'Dinners, donors and the Development Office',
      outcomes: [
        { w: 50, by: { charisma: 0.6 }, text: 'An old boy pledges £250,000 for the new science centre after a very good dinner.', fx: { sch: { finance: 7 }, rep: 4, energy: -5, count: 'fundraising' } },
        { w: 50, text: 'A fundraising dinner raises £3,000 and costs £4,000.', fx: { sch: { finance: -1 }, energy: -5, morale: -2 } },
      ] }),
    R('Head', { id: 'staffroom_visit', emoji: '☕', label: 'Spend break in the common room', sub: 'Stay human. Listen.',
      outcomes: [
        { w: 70, text: 'You listen more than you talk. The common room notices.', fx: { sch: { staff: 4 }, morale: 2 } },
        { w: 30, text: 'Conversation stops when you walk in. You talk about the weather and leave.', fx: { sch: { staff: 1 }, morale: -2 } },
      ] }),
  );

  /* ---------- Leadership person actions ---------- */
  const STAFF = ['deputy', 'hod', 'bursar', 'matron', 'colleague', 'slt'];
  D.personActions.push(
    { id: 'delegate', roles: ['deputy', 'slt', 'hod', 'colleague'], emoji: '📤', label: 'Delegate a job to them', sub: 'Less drain for you this half-term', show: { minRank: 2 },
      need: { test: (s, c) => (s.delegated || 0) < 8 }, why: 'You have delegated enough this half-term',
      outcomes: [
        { w: 70, byRel: { them: 0.5 }, text: '{them} takes it on without complaint and does it well.', fx: { rel: { them: -2 }, run: s => { s.delegated = (s.delegated || 0) + 6; } } },
        { w: 30, text: '{them} takes it on and does it badly. You redo half of it.', fx: { rel: { them: -4 }, run: s => { s.delegated = (s.delegated || 0) + 2; } } },
      ] },
    { id: 'recommend', roles: ['colleague'], emoji: '📈', label: 'Put them forward for promotion', show: { minRank: 3 },
      outcomes: [
        { w: 1, text: 'You recommend {them} for a Head of Year post. {them.He} gets it and will not forget who backed {them.him}.', fx: { rel: { them: 18 }, karma: 3, sch: { staff: 2 }, run: (s, c) => { const p = s.people.find(x => x.id === c.cast.them); if (p) { p.promoted = true; if (p.rival) p.rrank = Math.max(p.rrank, 2); } } } },
      ] },
    { id: 'praise_brief', roles: STAFF, emoji: '📣', label: 'Praise them in briefing', show: { minRank: 3 },
      outcomes: [{ w: 1, text: 'You thank {them} in front of the whole staff. {them.He} goes pink and works twice as hard.', fx: { rel: { them: 9 }, sch: { staff: 1 } } }] },
    { id: 'warning', roles: ['colleague', 'hod', 'matron'], emoji: '📝', label: 'Issue a formal warning', show: { minRank: 4 },
      outcomes: [
        { w: 60, text: '{them} takes the warning seriously and sharpens up.', fx: { rel: { them: -15 }, perf: 2, sch: { staff: -2 } } },
        { w: 40, text: '{them} calls the union. Months of meetings follow.', fx: { rel: { them: -20 }, energy: -6, sch: { staff: -4 } } },
      ] },
  );

  /* ---------- Hiring panels ---------- */
  const CANDS = [
    { k: 'star', desc: 'brilliant in the classroom, prickly in the common room', q: 88, fit: 30 },
    { k: 'charm', desc: 'a dazzling interview, thin on substance', q: 42, fit: 82 },
    { k: 'safe', desc: 'experienced, steady and a little dull', q: 66, fit: 66 },
    { k: 'keen', desc: 'a keen young teacher with endless energy', q: 58, fit: 74 },
    { k: 'nephew', desc: 'the Chair of Governors\' nephew', q: 38, fit: 55, politics: true },
    { k: 'cricketer', desc: 'a former county cricketer who can teach some Geography', q: 50, fit: 78, sport: true },
    { k: 'returner', desc: 'a returner after ten years in the City, sharp and impatient', q: 72, fit: 48 },
  ];
  const hireSetup = (s, ctx, P) => {
    const pool = CANDS.slice(); ctx.cands = [];
    const used = s.people.map(p => p.last).concat([s.me.last]);
    for (let i = 0; i < 3; i++) {
      const c = pool.splice(Math.floor(P.rnd(s) * pool.length), 1)[0]; const g = P.pick(s, ['m', 'f']);
      let last = P.pick(s, D.names.surnames), n = 0; while (used.includes(last) && n++ < 30) last = P.pick(s, D.names.surnames); used.push(last);
      ctx.cands.push(Object.assign({}, c, { g, first: P.pick(s, g === 'm' ? D.names.men : D.names.women), last }));
    }
    ctx.vars = {}; ctx.cands.forEach((c, i) => { ctx.vars['c' + i] = `${c.g === 'm' ? 'Mr' : 'Ms'} ${c.last}: ${c.desc}`; });
    ctx.vars.post = P.pick(s, ['a Maths teacher', 'a Head of Year 6', 'an English teacher', 'a Science teacher', 'a Games teacher', 'a French teacher']);
  };
  const hire = i => (s, ctx, P) => {
    const c = ctx.cands[i];
    const p = P.makePerson(s, 'colleague', { first: c.first, last: c.last, g: c.g, title: c.g === 'm' ? 'Mr' : 'Ms', rel: 45 + Math.round(c.fit / 4) });
    p.quality = c.q; p.hiredByYou = true;
    ctx.cast = ctx.cast || {}; ctx.cast.h = p.id;
    s.counters.hires = (s.counters.hires || 0) + 1;
    if (c.politics) s.flags.hiredNephew = true;
    s.queue.push({ id: 'hire_followup', at: s.tick + 6, ctx: { cast: { h: p.id } } });
  };
  D.events.push(
    { id: 'hiring_panel', emoji: '🧾', title: 'Interview panel', tags: ['leadership'], when: LEADERS, setup: hireSetup, weight: 9, cooldown: 6,
      text: (s) => s.career.role === 'Head' ? 'You are appointing {post}. Three candidates on the shortlist. The decision is yours.' : 'You sit on the panel to appoint {post}. Three candidates. The Head wants your recommendation.',
      choices: [
        { label: '{c0}', outcomes: [{ w: 1, text: 'You back {c0}. The appointment is made.', fx: { energy: -3, run: hire(0) } }] },
        { label: '{c1}', outcomes: [{ w: 1, text: 'You back {c1}. The appointment is made.', fx: { energy: -3, run: hire(1) } }] },
        { label: '{c2}', outcomes: [{ w: 1, text: 'You back {c2}. The appointment is made.', fx: { energy: -3, run: hire(2) } }] },
        { label: 'None of them. Re-advertise.', text: 'You re-advertise. The post stays empty for a term and everyone covers.', fx: { energy: -2, sch: { staff: -3 }, morale: -2 } },
      ] },
    { id: 'hire_followup', manual: true, emoji: '🧾', title: 'Your appointment', cast: { h: { role: 'colleague' } },
      outcomes: [
        { w: 1, when: { test: (s, c) => (s.people.find(p => p.id === c.cast.h) || {}).quality >= 70 }, text: '{h}, whom you appointed, is outstanding. Results in {h.his} classes are up and parents mention {h.him} by name.', fx: { rep: 5, morale: 5, sch: { roll: 1 }, count: 'goodHires' } },
        { w: 1, when: { test: (s, c) => { const q = (s.people.find(p => p.id === c.cast.h) || {}).quality; return q >= 50 && q < 70; } }, text: '{h}, whom you appointed, has settled in well. Solid, reliable, liked.', fx: { rep: 2, count: 'goodHires' } },
        { w: 1, when: { test: (s, c) => (s.people.find(p => p.id === c.cast.h) || {}).quality < 50 }, text: '{h}, whom you appointed, is struggling. Two parental complaints this week and a set that has lost its way.', fx: { rep: -4, morale: -4, count: 'badHires', run: (s, c, P) => P.startEvent(s, 'capability', { cast: { col: c.cast.h } }) } },
      ] },

    /* ---------- Internal promotions you decide ---------- */
    { id: 'promote_choice', emoji: '🪜', title: 'Who gets the job?', tags: ['leadership', 'slt'], when: SLT, cast: { a: 'colleague', b: 'colleague' }, weight: 8, cooldown: 8,
      setup: (s, ctx, P) => { ctx.vars = { post: P.pick(s, ['Head of Year 7', 'Head of Boarding', 'Head of Games', 'Head of Academic Enrichment', 'Head of Lower School']) }; },
      text: (s, c) => { const a = s.people.find(p => p.id === c.cast.a), b = s.people.find(p => p.id === c.cast.b); return (a && a.rival) || (b && b.rival) ? 'The {post} job is between {a} and {b}. One of them is your old rival. The decision is yours.' : 'The {post} job is between {a} and {b}. Both want it badly. The decision is yours.'; },
      choices: [
        { label: 'Promote {a}', outcomes: [
          { w: 70, text: '{a} gets the job. {b} is gracious in public and furious in private.', fx: { rel: { a: 15, b: -12 }, sch: { staff: 1 } } },
          { w: 30, text: '{a} gets the job. {b} hands in {b.his} notice a week later.', fx: { rel: { a: 15 }, removePerson: 'b', sch: { staff: -3 } } } ] },
        { label: 'Promote {b}', outcomes: [
          { w: 70, text: '{b} gets the job. {a} is gracious in public and furious in private.', fx: { rel: { b: 15, a: -12 }, sch: { staff: 1 } } },
          { w: 30, text: '{b} gets the job. {a} hands in {a.his} notice a week later.', fx: { rel: { b: 15 }, removePerson: 'a', sch: { staff: -3 } } } ] },
        { label: 'Appoint from outside', text: 'You bring someone in. {a} and {b} unite, for once, in their disappointment.', fx: { rel: { a: -8, b: -8 }, sch: { staff: -4 } } },
      ] },
    { id: 'struggling_colleague', emoji: '📉', title: 'A colleague in trouble', tags: ['leadership', 'slt'], when: SLT, cast: { col: 'colleague' }, weight: 4, cooldown: 12,
      text: 'Three parents have complained about {col} this half-term. {col.His} Year 8 set are a term behind.', fx: { run: (s, c, P) => P.startEvent(s, 'capability', { cast: { col: c.cast.col } }) } },
    { id: 'capability', manual: true, emoji: '📋', title: 'Not working out', tags: ['leadership'], cast: { col: 'colleague' },
      text: '{col} is struggling badly: complaints, missed deadlines, a set that has fallen apart. Something has to happen.',
      choices: [
        { label: 'A support plan with a mentor', outcomes: [
          { w: 1, by: { patience: 0.6 }, text: 'Six weeks of coaching. {col} turns it round. You are quietly proud.', fx: { energy: -6, karma: 4, sch: { staff: 2 }, rep: 2 } },
          { w: 1, text: 'Six weeks of support and no change. You will have to go further.', fx: { energy: -6, morale: -3 } } ] },
        { label: 'Begin formal capability', text: 'The process is long, painful and fair. {col} leaves at the end of the year.', fx: { energy: -8, sch: { staff: -4 }, rep: 2, karma: -1, removePerson: 'col' } },
        { label: 'Leave it', text: 'You leave it. The complaints keep coming, and now they mention you.', fx: { rep: -5, sch: { roll: -2 } } },
      ] },

    /* ---------- Head: money, numbers, governors ---------- */
    { id: 'staff_pay', emoji: '💷', title: 'The pay award', tags: ['head'], when: { role: 'Head', ht: 3 }, weight: 30, cooldown: 5, cast: { bur: 'bursar' },
      text: '{bur} brings next year\'s budget. The staff are hoping for a pay rise. The roof needs fixing.',
      choices: [
        { label: 'A generous 5% rise', text: 'The common room cheers. The roof leaks for another year.', fx: { sch: { staff: 12, finance: -9 }, rel: { bur: -6 } } },
        { label: 'A modest 2.5%', text: 'Nobody cheers, nobody complains. The roof gets patched.', fx: { sch: { staff: 3, finance: -3 } } },
        { label: 'A freeze', text: 'The roof is fixed. Three staff start looking at job adverts.', fx: { sch: { staff: -12, finance: 7 }, rel: { bur: 6 } } },
      ] },
    { id: 'fees', emoji: '🧾', title: 'Setting the fees', tags: ['head'], when: { role: 'Head', ht: 2 }, weight: 30, cooldown: 5,
      text: 'The governors need your recommendation on next year\'s fees.',
      choices: [
        { label: 'Freeze them', text: 'Parents are delighted. The Bursar is not.', fx: { sch: { roll: 5, finance: -7 } } },
        { label: 'Raise by 4%', text: 'In line with other schools. A few grumbles at pick-up.', fx: { sch: { finance: 3, roll: -1 } } },
        { label: 'Raise by 9%', text: 'The finances look healthy. Four families give notice.', fx: { sch: { finance: 9, roll: -7 }, rep: -2 } },
      ] },
    { id: 'exclusion', emoji: '🚪', title: 'A permanent exclusion?', tags: ['leadership', 'slt', 'pastoral'], when: { minRank: 4 }, cast: { p: { role: 'pupil', year: '>=6' } }, weight: 5, cooldown: 12,
      text: '{p.full} has been involved in a serious incident, the third this year. The staff want {p.him} gone. {p.His} parents are pleading.',
      choices: [
        { label: 'Exclude permanently', text: '{p.first} leaves. The staff feel backed. You lie awake that night.', fx: { removePerson: 'p', sch: { staff: 5, roll: -1 }, karma: -2 } },
        { label: 'One last chance, with strict conditions', outcomes: [
          { w: 1, by: { patience: 0.5 }, text: '{p.first} keeps to the conditions and finishes the year well. A risk that paid off.', fx: { rel: { p: 15 }, karma: 4, rep: 3 } },
          { w: 1, text: 'Within a month there is a fourth incident. The staff ask what it takes.', fx: { sch: { staff: -6 }, rep: -4, removePerson: 'p' } } ] },
        { label: 'A managed move to another school', text: 'A fresh start somewhere else. Everyone accepts it.', fx: { removePerson: 'p', sch: { staff: 2 } } },
      ] },
    { id: 'governors_confidence', manual: true, emoji: '🏛️', title: 'The governors are worried', tags: ['head'],
      text: 'Numbers are down and the budget is in the red. The Chair asks for a private meeting. There is talk of a vote of no confidence.',
      choices: [
        { label: 'Present a rescue plan', outcomes: [
          { w: 40, by: { charisma: 0.6, rep: 0.5 }, text: 'Your plan wins them round. One year to turn it around.', fx: { rep: -4, morale: -6, sch: { finance: 6 } } },
          { w: 40, text: 'The governors thank you for your service.', fx: { ending: 'sacked' } } ] },
        { label: 'Resign with dignity', text: 'You resign before they can vote.', fx: { ending: 'quit' } },
      ] },
    { id: 'head_staffmeeting', emoji: '🪑', title: 'You chair the staff meeting', tags: ['head', 'slt'], when: { minRank: 4 }, weight: 7,
      text: 'You are chairing the staff meeting now. The agenda has fourteen items.',
      choices: [
        { label: 'Cut it to five items and finish early', text: 'Done in thirty-five minutes. You are, briefly, the most popular person in the building.', fx: { sch: { staff: 5 }, rep: 1 } },
        { label: 'Get through all fourteen', text: 'Thorough. Exhausting. Item eleven was the recycling bins again.', fx: { sch: { staff: -2 }, energy: -2, organisation: 1 } },
        { label: 'Open the floor to concerns', outcomes: [
          { w: 1, by: { patience: 0.6 }, text: 'An honest, difficult, useful hour. Trust goes up.', fx: { sch: { staff: 6 }, energy: -3 } },
          { w: 1, text: 'It turns into a forty-minute complaint about car parking.', fx: { sch: { staff: -1 }, morale: -3, energy: -3 } } ] },
      ] },
    { id: 'slt_meeting', emoji: '🧠', title: 'SLT meeting', tags: ['slt'], when: { minRank: 3, maxRank: 4 }, weight: 8,
      text: 'Tuesday SLT. The Head wants a decision on mobile phones for boarders.',
      choices: [
        { label: 'Ban them completely', text: 'The staff applaud. The parents\' WhatsApp group explodes.', fx: { sch: { staff: 3, roll: -1 }, rep: 1 } },
        { label: 'Allow them at set times', text: 'A sensible compromise. Nobody is thrilled, which usually means it is right.', fx: { rep: 2 } },
        { label: 'Ask for a working party', text: 'The working party meets for a year and recommends "set times".', fx: { energy: -2 } },
      ] },
    { id: 'safeguarding_call', emoji: '🛡️', title: 'A disclosure', tags: ['slt', 'pastoral'], when: { flags: 'safeguarding' }, weight: 12, cooldown: 4,
      text: 'A teacher brings you a worrying disclosure from a pupil. As Safeguarding Lead, it is yours.',
      choices: [
        { label: 'Follow the procedure exactly', text: 'You log it, refer it and support the child. The right thing, done properly.', fx: { karma: 4, rep: 3, energy: -6 } },
        { label: 'Phone the parents first', text: 'You should not have. The local authority adviser explains why, at length.', fx: { rep: -6, karma: -2, energy: -4 } },
      ] },
    { id: 'ect_review', emoji: '📋', title: 'Induction review', tags: ['career'], when: { role: 'ECT', ht: [1, 3] }, weight: 30, cooldown: 2, cast: { m: 'hod' },
      text: 'Your termly induction review with {m}. {m.He} has your observation notes and your portfolio.',
      outcomes: [
        { w: 1, when: { test: s => s.stats.teaching >= 38 || (s.counters.portfolio || 0) >= 4 }, text: 'Your termly review goes well. {m} writes "on track to meet the Standards".', fx: { morale: 5, rep: 2 } },
        { w: 1, when: { test: s => s.stats.teaching < 38 && (s.counters.portfolio || 0) < 4 }, text: 'Your review is a worry. {m} says your teaching is not yet secure and your portfolio is thin. Two more entries would help.', fx: { morale: -5 } },
      ] },
    { id: 'first_lesson_disaster', emoji: '🫠', title: 'Rookie error', tags: ['classroom'], when: { role: 'ECT' }, weight: 9, cooldown: 6,
      outcomes: [
        { w: 1, text: 'You set "a quick quiz" and spend forty minutes marking it aloud. Year 7 learn nothing except that you are kind.', fx: { morale: -1, teaching: 1 } },
        { w: 1, text: 'You threaten "the whole class will stay behind" and then realise you have a duty. They know you know.', fx: { rep: -1, teaching: 1 } },
        { w: 1, text: 'A pupil asks how old you are. You tell them. This is a mistake.', fx: { morale: -1 } },
      ] },
  );

  /* ---------- More for Heads of Department ---------- */
  D.events.push(
    { id: 'hod_feud', emoji: '🥊', title: 'Department feud', tags: ['leadership'], when: { role: 'HoD' }, cast: { a: 'colleague', b: 'colleague' }, weight: 7, cooldown: 10,
      text: '{a} and {b} have stopped speaking over who teaches the top set. It is your department, so it is your problem.',
      choices: [
        { label: 'Give it to the better teacher', text: 'You decide on merit. One of them sulks for a term, but the results are good.', fx: { rel: { a: 4, b: -8 }, perf: 3 } },
        { label: 'Share it: one term each', text: 'Nobody is happy. Nobody leaves. Classic middle management.', fx: { rel: { a: -2, b: -2 }, patience: 2 } },
        { label: 'Teach it yourself', text: 'You take the top set. Both stop feuding and start complaining about you.', fx: { energy: -6, teaching: 2, rel: { a: -3, b: -3 } } },
      ] },
    { id: 'hod_complaint', emoji: '📨', title: 'A complaint about your team', tags: ['leadership', 'parents'], when: { role: 'HoD' }, cast: { col: 'colleague', par: 'parent' }, weight: 7,
      text: '{par} complains that {col} "never marks anything". As Head of Department, you have to look into it.',
      choices: [
        { label: 'Check the books properly', outcomes: [
          { w: 1, text: 'The books are well marked. You reply to {par} with evidence. Case closed.', fx: { rel: { col: 6, par: -2 }, rep: 2, energy: -3 } },
          { w: 1, text: 'The complaint is fair. You and {col} have a quiet, difficult conversation.', fx: { rel: { col: -6, par: 4 }, perf: 3, energy: -3 } } ] },
        { label: 'Back your colleague, no questions', text: '{col} is grateful. {par} copies in the Head.', fx: { rel: { col: 8, par: -8 }, rep: -1 } },
      ] },
  );

  /* ---------- More for Deputies ---------- */
  D.events.push(
    { id: 'dep_parent', emoji: '😠', title: 'Escalated', tags: ['slt', 'deputy', 'parents'], when: { role: 'Deputy' }, cast: { par: 'parent' }, weight: 8,
      text: '{par} has gone over the Head of Year\'s head. The meeting is in your office at 8am, and {par.he} has brought a solicitor friend "just to listen".',
      choices: [
        { label: 'Calm, firm and by the book', outcomes: [
          { w: 1, by: { patience: 0.5, charisma: 0.3 }, text: 'An hour later {par} leaves satisfied. The solicitor friend shakes your hand.', fx: { rep: 4, rel: { par: 6 }, energy: -4 } },
          { w: 1, text: '{par} leaves unsatisfied and writes to the governors.', fx: { rep: -3, energy: -4 } } ] },
        { label: 'Give them what they want', text: '{par} is happy. The Head of Year feels undermined and tells you so.', fx: { rel: { par: 8 }, sch: { staff: -4 } } },
      ] },
    { id: 'dep_longterm', emoji: '🤒', title: 'Long-term absence', tags: ['slt', 'deputy'], when: { role: 'Deputy' }, cast: { col: 'colleague' }, weight: 6, cooldown: 12,
      text: '{col} will be off for the rest of the term. Their classes, duties and the U11 netball team all need covering.',
      choices: [
        { label: 'Hire a supply teacher', text: 'The supply teacher is excellent and wants to stay. The Bursar does not.', fx: { sch: { finance: -3, staff: 2 }, energy: -2 } },
        { label: 'Share it round the staff', text: 'It gets done. The common room is exhausted and says so.', fx: { sch: { staff: -5, finance: 1 } } },
        { label: 'Cover the worst of it yourself', text: 'You teach eight extra lessons a week. You are a hero, and also very tired.', fx: { energy: -12, rep: 4, sch: { staff: 3 } } },
      ] },
    { id: 'head_succession', emoji: '🗝️', title: 'The Head is retiring', tags: ['slt', 'deputy'], when: { role: 'Deputy', stat: { yearsInRole: '>=3', rep: '>=70' } }, weight: 1.2, cooldown: 36,
      mods: [{ when: { school: 'mudgrove' }, x: 3 }, { when: { school: 'hambrook' }, x: 0.15 }],
      text: '{head} tells you privately that {head.he} is retiring next summer. The governors would like you to apply.',
      choices: [
        { label: 'Apply', outcomes: [
          { w: 30, by: { rep: 0.8, charisma: 0.4 }, wfn: (s) => { const t = D.schools.find(x => x.id === s.school.id); return (t && t.mods && t.mods.internalBonus || 0) * 2; }, text: 'The governors appoint you. You will be Head of the school you already know.', fx: { promote: 'Head', morale: 15, count: 'promotions', flag: 'internalHead' } },
          { w: 75, text: 'The governors go for an outside candidate. You will work for someone new.', fx: { morale: -8, count: 'interviewFails' } } ] },
        { label: 'Not yet', text: 'You stay where you are. A new Head arrives in September.', fx: { morale: -2 } },
      ] },
  );

  /* ---------- More for Heads ---------- */
  D.events.push(
    { id: 'head_snow', emoji: '❄️', title: 'Snow at 5am', tags: ['head'], when: { role: 'Head', ht: [2, 3] }, weight: 10, cooldown: 6,
      text: 'Six inches of snow at 5am. Your phone is already buzzing. Open or close? It is your call.',
      choices: [
        { label: 'Stay open', outcomes: [
          { w: 1, text: 'Most families make it in. A snowball fight on the front lawn becomes the school photograph of the year.', fx: { rep: 3, sch: { staff: -2 } } },
          { w: 1, text: 'A teacher slides into a ditch on the way in. Everyone asks why you stayed open.', fx: { rep: -4, sch: { staff: -5 } } } ] },
        { label: 'Close for the day', text: 'Lessons go online. Several parents email to ask about the fees.', fx: { sch: { staff: 4 }, rep: -1 } },
      ] },
    { id: 'head_inspection', manual: true, emoji: '🔍', title: 'Inspection, as Head', tags: ['head'],
      text: 'The inspectors call on Monday. This time it is your school, your self-evaluation and your name on the report.',
      choices: [
        { label: 'Lead from the front', outcomes: [
          { w: 1, by: { rep: 0.6, organisation: 0.5 }, text: 'The report calls the school "excellent in all areas" and singles out its leadership. The governors frame it.', fx: { rep: 10, sch: { roll: 6, staff: 4 }, morale: 10 } },
          { w: 1, text: 'The report finds "significant weaknesses" in record-keeping. The governors are not pleased.', fx: { rep: -8, sch: { roll: -5 }, morale: -8 } } ] },
        { label: 'Trust your team', outcomes: [
          { w: 1, by: { charisma: 0.4 }, wfn: s => ((s.sch && s.sch.staff) || 50) - 50, text: 'Your staff shine. The report praises "a happy, purposeful community".', fx: { rep: 7, sch: { roll: 4, staff: 6 } } },
          { w: 1, text: 'A middle leader freezes in front of the inspector. The report is "good", with caveats.', fx: { rep: -2 } } ] },
      ] },
    { id: 'head_press', emoji: '📰', title: 'The local paper', tags: ['head'], when: HEAD, weight: 5, cooldown: 12,
      text: 'A reporter from the local paper calls about a story: a Year 8 trip, a lost passport and an angry father.',
      choices: [
        { label: 'Give a calm statement', text: 'The story runs on page eleven, next to a piece about a large marrow.', fx: { rep: 1 } },
        { label: '"No comment"', text: 'The headline reads "School refuses to comment". It runs on page three.', fx: { rep: -4, sch: { roll: -2 } } },
        { label: 'Invite the reporter in', outcomes: [
          { w: 1, by: { charisma: 0.6 }, text: 'The reporter leaves with a glowing feature about your croquet team instead.', fx: { rep: 5, sch: { roll: 3 } } },
          { w: 1, text: 'The reporter finds a broken window and photographs it.', fx: { rep: -3 } } ] },
      ] },
    { id: 'head_vip', emoji: '🕶️', title: 'A very important parent', tags: ['head', 'parents'], when: HEAD, cast: { par: 'parent' }, weight: 6, cooldown: 12,
      text: '{par}, whose company sponsors the new sports hall, wants {par.child} moved up to the top set and into the 1st XI.',
      choices: [
        { label: 'Politely refuse', text: 'You hold the line. The sponsorship is "under review" for a nervous month, then renewed.', fx: { rel: { par: -10 }, karma: 4, sch: { staff: 4 } } },
        { label: 'Find a way to say yes', text: '{par.child} moves up. The 1st XI coach resigns in protest.', fx: { rel: { par: 12 }, sch: { finance: 4, staff: -8 }, karma: -4 } },
      ] },
    { id: 'head_poached', emoji: '🎣', title: 'Poached', tags: ['head'], when: { role: 'Head', notSchool: 'hambrook' }, cast: { col: 'colleague' }, weight: 5, cooldown: 12,
      text: 'Hambrook have offered {col}, one of your best teachers, a job with a £6,000 pay rise.',
      choices: [
        { label: 'Match the offer', text: '{col} stays. The Bursar reminds you, at length, that this sets a precedent.', fx: { rel: { col: 15 }, sch: { finance: -4, staff: 2 } } },
        { label: 'Offer a promotion instead', text: '{col} stays as Head of Year, delighted. It costs less than money.', fx: { rel: { col: 12 }, sch: { finance: -1, staff: 3 } } },
        { label: 'Wish them well', text: '{col} goes. The leaving speech is generous on both sides.', fx: { removePerson: 'col', sch: { staff: -4 } } },
      ] },
    { id: 'head_opening', emoji: '✂️', title: 'Cutting the ribbon', tags: ['head'], when: { role: 'Head', test: s => (s.counters.fundraising || 0) >= 2 }, weight: 20, once: true,
      text: 'The new building you raised the money for opens. A minor royal cuts the ribbon. The plaque has your name on it.', fx: { morale: 15, rep: 8, sch: { roll: 5 } } },
  );

  /* ---------- New achievements ---------- */
  D.achievements.push(
    { id: 'talentspotter', emoji: '🧾', title: 'Talent spotter', desc: 'Make three good appointments', test: s => (s.counters.goodHires || 0) >= 3 },
    { id: 'nephew', emoji: '🎩', title: 'Jobs for the boys', desc: 'Appoint the Chair of Governors\' nephew', test: s => !!s.flags.hiredNephew },
    { id: 'insider', emoji: '🗝️', title: 'From within', desc: 'Become Head of the school where you were Deputy', test: s => !!s.flags.internalHead },
    { id: 'fundraiser', emoji: '🏗️', title: 'Bricks and mortar', desc: 'Land three big donations as Head', test: s => (s.counters.fundraising || 0) >= 3 },
  );
})(typeof window !== 'undefined' ? window : globalThis);
