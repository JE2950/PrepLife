/* Common room rivals and former pupils who come back */
(function (root) {
  'use strict';
  const D = root.PSL_DATA;
  const RIVAL = { r: { role: 'colleague', rival: true } };

  // former pupils: pick one who left at least `min` years ago and hasn't returned yet
  const alIndex = (s, min) => (s.alumni || []).findIndex(a => !a.used && s.ay - a.leftAy >= min);
  const alSetup = min => (s, ctx, P) => {
    const i = alIndex(s, min); if (i < 0) return false;
    const a = s.alumni[i];
    ctx.alum = Object.assign({}, a); ctx.good = a.rel >= 55;
    ctx.vars = { al: a.first + ' ' + a.last, alf: a.first, alsch: a.school, alhe: a.g === 'f' ? 'she' : 'he', alHe: a.g === 'f' ? 'She' : 'He', alhis: a.g === 'f' ? 'her' : 'his', yrs: String(s.ay - a.leftAy) };
  };
  const alUsed = (s, ctx) => {
    const a = ctx.alum && (s.alumni || []).find(x => x.first === ctx.alum.first && x.last === ctx.alum.last && x.leftAy === ctx.alum.leftAy);
    if (a) a.used = true; s.counters.alumniBack = (s.counters.alumniBack || 0) + 1;
  };
  const alPerson = (s, ctx, P, role, rel, extra) => {
    const a = ctx.alum; if (!a) return null;
    return P.makePerson(s, role, Object.assign({ first: a.first, last: a.last, g: a.g, rel, title: a.g === 'f' ? (role === 'parent' ? 'Mrs' : 'Ms') : 'Mr' }, extra || {}));
  };
  const good = { test: (s, c) => c.good };
  const bad = { test: (s, c) => !c.good };

  D.events.push(
    /* ---------- Rival ---------- */
    { id: 'rival_intro', emoji: '⚔️', title: 'Your rival', tags: ['rival'], cast: RIVAL, weight: 40, cooldown: 60,
      when: { test: s => !s.flags['rivalmet_' + s.school.id] },
      text: 'You notice {r} the moment you arrive. {r.He} {r.quirk}, and wants every job you want.',
      fx: { run: s => { s.flags['rivalmet_' + s.school.id] = true; } } },
    { id: 'rival_idea', emoji: '💡', title: 'Your idea', tags: ['rival', 'commonroom'], cast: RIVAL, weight: 8,
      text: 'In the staff meeting, {r} presents your idea for lunchtime revision clinics as {r.his} own. {head} loves it.',
      choices: [
        { label: 'Call it out, there and then', outcomes: [
          { w: 1, by: { charisma: 0.6 }, text: '"Lovely to see my idea taking shape, {r.first}." The room enjoys it. {r} does not.', fx: { rep: 4, rel: { r: -10 }, morale: 4 } },
          { w: 1, text: 'You sound petty. {head} asks you both to "work together on it".', fx: { rep: -2, rel: { r: -6 }, morale: -3 } } ] },
        { label: 'Have a private word afterwards', text: '{r} says {r.he} "thought it was a joint idea". Nothing changes, but {r.he} knows you know.', fx: { rel: { r: -3 }, patience: 2 } },
        { label: 'Let it go', text: 'The clinics are a success. {r} gets a mention in the newsletter.', fx: { morale: -4, karma: 2 } },
      ] },
    { id: 'rival_gossip', emoji: '🗯️', title: 'Overheard', tags: ['rival'], cast: RIVAL, weight: 6,
      text: 'You hear {r} has been telling people your Year 7s are "basically feral".',
      choices: [
        { label: 'Prove them wrong', text: 'Your Year 7s produce the best display in the school. You make sure {head} walks past it.', fx: { rep: 4, energy: -4, rel: { r: -2 } } },
        { label: 'Return fire in the pub', outcomes: [
          { w: 1, text: 'Your story about {r}\'s laminated seating plans brings the house down.', fx: { morale: 5, rel: { r: -8 }, karma: -2 } },
          { w: 1, text: 'Someone at the table is {r.his} best friend. Oops.', fx: { rep: -3, rel: { r: -8 }, karma: -2 } } ] },
        { label: 'Rise above it', text: 'You say nothing. It stings for a week.', fx: { morale: -2, patience: 2, karma: 1 } },
      ] },
    { id: 'rival_flapjack', emoji: '🍪', title: 'Flapjack', tags: ['rival'], cast: RIVAL, weight: 5,
      outcomes: [
        { w: 1, text: '{r} brings homemade flapjack to the staff meeting. Again. {head} takes two.', fx: { morale: -1 } },
        { w: 1, text: '{r} replies-all to the Head\'s email within forty seconds. With a bullet-pointed action plan.', fx: { morale: -1 } },
        { w: 1, text: '{r} has started arriving at 6.45am. Nobody knows what {r.he} does until 8.', fx: {} },
      ] },
    { id: 'rival_team', emoji: '🏉', title: 'The U13As', tags: ['rival', 'sport'], cast: RIVAL, when: { flags: 'coach' }, weight: 6, cooldown: 18,
      text: 'You and {r} both want to coach the U13As next season. The Head of Games asks you to "sort it out between you".',
      choices: [
        { label: 'Fight for it', outcomes: [
          { w: 1, by: { charisma: 0.4, rep: 0.4 }, text: 'You get the U13As. {r} gets the U9Cs and a face like thunder.', fx: { team: 'U13A', rep: 3, rel: { r: -8 } } },
          { w: 1, text: '{r} gets the U13As. You get the U9Cs. They are lovely, to be fair.', fx: { morale: -3, rel: { r: -3 } } } ] },
        { label: 'Offer to share it', text: 'Joint coaches. You argue about the back row all season, and the team wins anyway.', fx: { rel: { r: 8 }, karma: 2, count: 'wins' } },
      ] },
    { id: 'rival_wobble', emoji: '🚗', title: 'In the car park', tags: ['rival', 'pastoral'], cast: RIVAL, weight: 4, cooldown: 24,
      text: '{r}\'s observation went badly. You find {r.him} sitting in {r.his} car in the dark, not driving home.',
      choices: [
        { label: 'Knock on the window', text: 'You talk for an hour. You find out {r.he} is just as scared as you are.', fx: { rel: { r: 18 }, karma: 6, morale: 3 } },
        { label: 'Tell someone kind', text: 'You quietly tell {matron}, who knows exactly what to do.', fx: { rel: { r: 5 }, karma: 3 } },
        { label: 'Allow yourself a small smile', text: 'You drive home. The smile does not last the journey.', fx: { karma: -6, morale: -2 } },
      ] },
    { id: 'rival_truce', emoji: '🍺', title: 'A truce?', tags: ['rival'], cast: RIVAL, when: { stat: { yearsAtSchool: '>=5' } }, weight: 5, once: true,
      text: '{r} buys you a pint at the end-of-term drinks. "We should stop all this. We are on the same side, really."',
      choices: [
        { label: 'Shake on it', text: 'The rivalry ends. {r} turns out to be very good company.', fx: { rel: { r: 30 }, morale: 6, karma: 3, run: (s, c) => { const r = s.people.find(p => p.id === c.cast.r); if (r) r.rival = false; s.flags.truce = true; } } },
        { label: '"We\'ll see"', text: '{r} nods. The game goes on.', fx: { rel: { r: -2 } } },
      ] },
    { id: 'rival_boss', manual: true, emoji: '😬', title: 'Your new boss', tags: ['rival'], cast: RIVAL,
      text: '{r} is now senior to you. {r.He} books a "quick catch-up" with you for Monday at 7.30am.',
      choices: [
        { label: 'Be gracious', text: 'You congratulate {r.him} and mean most of it. {r.He} seems relieved.', fx: { rel: { r: 10 }, karma: 3, morale: -2 } },
        { label: 'Keep your head down', text: 'You attend the catch-up. It is about the photocopier budget.', fx: { morale: -5 } },
        { label: 'Start looking elsewhere', text: 'You open the job adverts that evening.', fx: { morale: -2, start: 'job_hunt' } },
      ] },

    /* ---------- Former pupils return ---------- */
    { id: 'alumni_famous', emoji: '📰', title: 'In the news', tags: ['alumni'], when: { test: s => alIndex(s, 8) >= 0 }, setup: alSetup(8), weight: 2, cooldown: 24,
      outcomes: [
        { w: 1, when: good, text: '{al}, whom you taught at {alsch}, is interviewed on Radio 4 and thanks "a teacher who made me love {subject}". That\'s you.', fx: { morale: 12, rep: 3, run: alUsed } },
        { w: 1, when: good, text: '{al}, whom you taught at {alsch}, dedicates {alhis} first novel "to the teacher who read my stories out loud". You buy six copies.', fx: { morale: 12, run: alUsed } },
        { w: 1, when: good, text: '{al}, whom you taught at {alsch}, captains England at Twickenham. In the post-match interview {alhe} name-checks "my old prep school coach".', fx: { morale: 12, rep: 4, run: alUsed } },
        { w: 1, when: bad, text: '{al}, whom you taught at {alsch}, writes a newspaper column about prep school. You are the villain in paragraph four.', fx: { morale: -6, rep: -2, run: alUsed } },
        { w: 1, when: bad, text: '{al}, whom you taught at {alsch}, does a stand-up routine on television. The bit about the strict teacher is clearly you. It kills.', fx: { morale: -3, run: alUsed } },
      ] },
    { id: 'alumni_colleague', emoji: '🧑‍🏫', title: 'A familiar face', tags: ['alumni'], when: { test: s => alIndex(s, 10) >= 0 }, setup: alSetup(10), weight: 3, cooldown: 18,
      text: 'The new member of staff is {al}, whom you taught {yrs} years ago. {alHe} still calls you "{sir}" by accident.',
      choices: [
        { label: 'Take them under your wing', outcomes: [
          { w: 1, when: good, text: '{alf} becomes your closest ally in the common room. Full circle.', fx: { morale: 8, karma: 2, run: (s, c, P) => { alPerson(s, c, P, 'colleague', 80); alUsed(s, c); } } },
          { w: 1, when: bad, text: '{alf} is polite but distant. {alHe} has clearly not forgotten that detention.', fx: { morale: -2, run: (s, c, P) => { alPerson(s, c, P, 'colleague', 30); alUsed(s, c); } } } ] },
        { label: 'Treat them like any colleague', text: 'You keep it professional. {alf} seems grateful.', fx: { run: (s, c, P) => { alPerson(s, c, P, 'colleague', 55); alUsed(s, c); } } },
      ] },
    { id: 'alumni_parent', emoji: '👨‍👧', title: 'Second generation', tags: ['alumni', 'parents'], when: { test: s => alIndex(s, 15) >= 0 }, setup: alSetup(15), weight: 3, cooldown: 18,
      text: 'A new Year 3 parent at the gate is {al}, whom you taught {yrs} years ago. {alHe} has brought {alhis} own child.',
      outcomes: [
        { w: 1, when: good, text: 'A new Year 3 parent at the gate is {al}, whom you taught {yrs} years ago. {alHe} tells {alhis} child, "This is the one I told you about." Your eyes go oddly misty.', fx: { morale: 10, run: (s, c, P) => { const k = P.makePerson(s, 'pupil', { last: c.alum.last, year: 3 }); alPerson(s, c, P, 'parent', 85, { childId: k.id }); alUsed(s, c); } } },
        { w: 1, when: bad, text: 'A new Year 3 parent at the gate is {al}, whom you taught {yrs} years ago. {alHe} asks, pointedly, whether you still give detentions for "breathing loudly".', fx: { morale: -4, run: (s, c, P) => { const k = P.makePerson(s, 'pupil', { last: c.alum.last, year: 3 }); alPerson(s, c, P, 'parent', 25, { childId: k.id }); alUsed(s, c); } } },
      ] },
    { id: 'alumni_inspector', emoji: '🔍', title: 'The lead inspector', tags: ['alumni', 'observation'], when: { test: s => alIndex(s, 12) >= 0 }, setup: alSetup(12), weight: 2, cooldown: 24,
      text: 'The lead inspector walks in with a clipboard. It is {al}, whom you last saw aged thirteen.',
      choices: [
        { label: '"Lovely to see you again!"', outcomes: [
          { w: 1, when: good, text: '{alf} beams and tells the Head you were "the best teacher I ever had". The inspection goes beautifully.', fx: { rep: 10, morale: 8, rel: { head: 6 }, run: alUsed } },
          { w: 1, when: bad, text: '{alf} smiles thinly and asks to see your marking. All of it.', fx: { rep: -5, energy: -6, morale: -4, run: alUsed } } ] },
        { label: 'Strictly professional', outcomes: [
          { w: 1, when: good, text: 'You both play it straight. {alf} winks at you on the way out.', fx: { rep: 5, morale: 4, run: alUsed } },
          { w: 1, when: bad, text: 'Professional and fair. You are surprised how relieved you are.', fx: { rep: 1, run: alUsed } } ] },
      ] },
  );
})(typeof window !== 'undefined' ? window : globalThis);
