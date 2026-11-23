/* The four schools: flavour events, plus the Ravelstone pew (drip-fed, never stated) */
(function (root) {
  'use strict';
  const D = root.PSL_DATA;
  const pews = s => s.counters.pews || 0;

  D.events.push(
    /* ---------- Wickenden Manor ("Wickers") ---------- */
    { id: 'mud_arrive', emoji: '🔔', title: 'Wickers', tags: ['school'], when: { school: 'mudgrove' }, once: true, weight: 60,
      text: 'Wickenden Manor still has a handbell, a Latin grace before lunch and a Head who knows every boy\'s dog by name. Everyone calls it Wickers.', fx: { morale: 3 } },
    { id: 'mud_sunshine', emoji: '☀️', title: 'Half holiday', tags: ['school'], when: { school: 'mudgrove', season: 'summer', has: 'head' }, weight: 8, cooldown: 6,
      text: '{head} cancels afternoon lessons because the sun has come out. The whole school goes down to the river.', fx: { morale: 7, energy: 4 } },
    { id: 'mud_grace', emoji: '🍽️', title: 'Grace', tags: ['school'], when: { school: 'mudgrove' }, weight: 6, cooldown: 18,
      text: 'The boy on grace duty is off sick. {head} looks straight at you across the dining room.',
      choices: [
        { label: 'Say it in your best Latin', outcomes: [
          { w: 1, when: { subject: ['Latin', 'Classics'] }, text: 'Word perfect. The boys look at you with new respect.', fx: { rep: 3, morale: 3 } },
          { w: 1, when: { notSchool: 'none', test: s => !['Latin', 'Classics'].includes(s.me.subject) }, text: 'You get as far as "benedic" and fall back on "Amen".', fx: { morale: -2, rep: -1 } } ] },
        { label: 'Hand it to the nearest Year 8', text: 'He says it faster than any human alive. Lunch begins.', fx: { morale: 1 } },
      ] },
    { id: 'mud_team', emoji: '🤝', title: 'Same team', tags: ['school'], when: { school: 'mudgrove' }, cast: { col: 'colleague' }, weight: 6,
      text: 'Your car dies on the A329. By the time you arrive, {col} has covered your lesson, your duty and your match. Nobody mentions it.', fx: { morale: 6, rel: { col: 6 } } },
    { id: 'mud_mud', emoji: '🌧️', title: 'Living up to the name', tags: ['school', 'sport'], when: { school: 'mudgrove', season: ['michaelmas', 'lent'] }, weight: 5,
      text: 'The pitches flood again. Matron runs out of spare socks by Wednesday.', fx: { morale: 1 } },
    { id: 'mud_head_chat', emoji: '🎩', title: 'A walk', tags: ['school', 'career'], when: { school: 'mudgrove', has: 'head' }, weight: 5, cooldown: 12,
      text: '{head} asks you to walk the dogs round the lake with {head.him}. {head.He} asks what you want to be doing in five years.',
      choices: [
        { label: 'Tell the truth', text: '{head} listens, nods and says {head.he} will see what {head.he} can do. {head.He} means it.', fx: { rel: { head: 8 }, ambition: 3, rep: 2 } },
        { label: '"Just this, really"', text: '{head} smiles. "Good. We need people who stay."', fx: { rel: { head: 5 }, morale: 3 } },
      ] },

    /* ---------- Ravelstone ---------- */
    { id: 'ham_arrive', emoji: '✨', title: 'Ravelstone', tags: ['school'], when: { school: 'hambrook' }, once: true, weight: 60,
      text: 'Ravelstone has a new sports centre, a branded water bottle for every pupil and a car park full of Range Rovers. You have not yet met the Head.', fx: { morale: -1 } },
    { id: 'ham_vision', emoji: '📊', title: 'Ravelstone 2.0', tags: ['school', 'commonroom'], when: { school: 'hambrook', has: 'head' }, weight: 7, cooldown: 12,
      text: '{head} presents the new five-year strategy at INSET. The slides say "Ravelstone 2.0". You count the word "excellence" fourteen times.',
      choices: [
        { label: 'Ask a sharp question', outcomes: [
          { w: 1, by: { charisma: 0.4 }, text: 'Your question gets a laugh from the room and a note in {head}\'s pad.', fx: { rep: 2, rel: { head: -4 }, morale: 2 } },
          { w: 1, text: 'The silence after your question goes on and on.', fx: { rel: { head: -6 }, morale: -3 } } ] },
        { label: 'Nod and play buzzword bingo', text: 'You get a full house at "synergy". Nobody notices.', fx: { morale: 3 } },
      ] },
    { id: 'ham_slt', emoji: '📨', title: 'Three emails', tags: ['school', 'admin'], when: { school: 'hambrook' }, weight: 8,
      text: 'Three members of SLT send you three different instructions about the report deadline. All three are marked "URGENT".',
      choices: [
        { label: 'Reply-all asking which is right', text: 'You get three more emails. One is from the Bursar.', fx: { morale: -3, rel: { slt: -2 } } },
        { label: 'Hit the earliest deadline', text: 'Your reports are in first. Two deadlines later move earlier.', fx: { energy: -5, rep: 2 } },
        { label: 'Wait for the fourth email', text: 'The fourth email cancels the first three.', fx: { morale: 2, energy: 2 } },
      ] },
    { id: 'ham_famous', emoji: '🚁', title: 'Arrivals', tags: ['school', 'parents'], when: { school: 'hambrook', ht: [0, 5] }, weight: 6, cooldown: 6,
      outcomes: [
        { w: 1, text: 'A helicopter lands on the 1st XI square at pick-up. The groundsman weeps.', fx: { morale: 1 } },
        { w: 1, text: 'A parent you last saw on the cover of a magazine asks you where the loos are.', fx: { morale: 2 } },
        { w: 1, text: 'The Year 5 parents\' WhatsApp group has screenshotted your homework sheet and found a typo.', fx: { morale: -3, rep: -1 } },
      ] },
    { id: 'ham_drowning', emoji: '🛟', title: 'Struggling', tags: ['school', 'commonroom'], when: { school: 'hambrook', has: 'slt' }, weight: 5,
      text: 'You find {slt} eating lunch alone at 3.40pm. {slt.He} says {slt.he} hasn\'t sat down since Tuesday.',
      choices: [
        { label: 'Offer to help', text: 'You take a job off {slt.his} list. {slt.He} looks at you as if you have offered a kidney.', fx: { rel: { slt: 10 }, energy: -4, karma: 3 } },
        { label: 'Make sympathetic noises and leave', text: 'You make sympathetic noises. You leave.', fx: {} },
      ] },
    // the pew: hints only
    { id: 'ham_pew_1', emoji: '⛪', title: 'Sunday morning', tags: ['school', 'pew'], when: { school: 'hambrook', has: 'deputy', test: s => (s.counters.pews || 0) < 2 }, weight: 6, once: true,
      text: 'Walking to the farm shop on Sunday, you see {deputy} and the Director of Studies come out of St Michael\'s together. They wave.' },
    { id: 'ham_pew_2', emoji: '🎼', title: 'Choir practice', tags: ['school', 'pew'], when: { school: 'hambrook', stat: { yearsAtSchool: '>=1' }, test: s => (s.counters.pews || 0) < 3 }, weight: 5, once: true, cast: { col: 'colleague' },
      text: '{col} mentions that the last three internal promotions all sing in the St Michael\'s choir. "Probably a coincidence," {col.he} says, not quite smiling.' },
    { id: 'ham_pew_nod', emoji: '🙂', title: 'A nod', tags: ['school', 'pew'], when: { school: 'hambrook', has: 'head', test: s => (s.counters.pews || 0) >= 3 }, weight: 9, once: true,
      text: '{head} nods to you in the corridor and says "good morning" by name. {head.He} has never done that before.', fx: { rel: { head: 8 }, morale: 2 } },
    { id: 'ham_pew_sherry', emoji: '🥂', title: 'An invitation', tags: ['school', 'pew'], when: { school: 'hambrook', test: s => (s.counters.pews || 0) >= 6 }, weight: 10, once: true,
      text: 'The vicar invites you to sherry after evensong. When you arrive, half of SLT is already there, holding small glasses.',
      choices: [
        { label: 'Go and mingle', text: 'You talk to {deputy} about the cricket for an hour. {deputy.He} calls you by your first name on Monday.', fx: { rel: { deputy: 10, head: 6 }, count: { pews: 2 }, flag: 'sherry' } },
        { label: 'Make your excuses', text: 'You go home. Everyone at the sherry has a lovely time.', fx: {} },
      ] },
    { id: 'ham_pew_pcc', emoji: '📋', title: 'Parish business', tags: ['school', 'pew'], when: { school: 'hambrook', flags: 'sherry', test: s => (s.counters.pews || 0) >= 12 }, weight: 10, once: true,
      text: 'You are asked to join the Parochial Church Council. Two of the members are on SLT. The meetings are on Thursday nights.',
      choices: [
        { label: 'Accept', text: 'Thursday nights are now about the church roof. Monday briefings feel warmer somehow.', fx: { energy: -4, rel: { head: 8, deputy: 6 }, count: { pews: 4 }, rep: 3 } },
        { label: 'Decline politely', text: 'The vicar is very understanding.', fx: {} },
      ] },
    { id: 'ham_passed_over', emoji: '🪑', title: 'The appointment', tags: ['school', 'pew'], when: { school: 'hambrook', test: s => (s.counters.interviewFails || 0) >= 1 && (s.counters.pews || 0) < 4 }, cast: { col: 'colleague' }, weight: 12, cooldown: 24,
      text: 'The post you went for goes to {col}. {col.He} reads the lesson at St Michael\'s most Sundays. You are sure that has nothing to do with it.', fx: { morale: -4 } },

    /* ---------- Thornbury Court ---------- */
    { id: 'thb_arrive', emoji: '🏉', title: 'Thornbury', tags: ['school', 'sport'], when: { school: 'thornbury' }, once: true, weight: 60,
      text: 'The first thing anyone asks you at Thornbury Court is which sports you can coach. The second is whether you can coach any more.', fx: { morale: 1 } },
    { id: 'thb_coach_please', emoji: '📣', title: 'Not really a question', tags: ['school', 'sport'], when: { school: 'thornbury', not: 'coach' }, cast: { col: 'colleague' }, weight: 12, cooldown: 6,
      text: 'The Head of Games, {col}, asks why you are not down to coach a team this term. It is not really a question.',
      choices: [
        { label: 'Take a team', text: 'You now coach the U11Bs. The Head of Games shakes your hand like you have signed for Saracens.', fx: { addResp: 'coach', rel: { col: 6 }, rep: 3 } },
        { label: 'Hold firm', text: 'You hold firm. You are given every wet-weather duty for a month.', fx: { rel: { col: -8 }, rep: -3, energy: -3 } },
      ] },
    { id: 'thb_assembly', emoji: '🏆', title: 'Assembly', tags: ['school', 'sport'], when: { school: 'thornbury' }, weight: 6,
      text: 'The Head reads out every weekend result in assembly, from the 1st XV down to the U9Ds. There is no academic news.', fx: {} },
    { id: 'thb_sevens', emoji: '🚫', title: 'Lessons cancelled', tags: ['school', 'sport'], when: { school: 'thornbury', season: ['michaelmas', 'lent'] }, weight: 6,
      text: 'Lessons are cancelled on Wednesday for a sevens tournament. Your Year 8 revision plan is now a Year 8 revision hope.', fx: { morale: -1, energy: 3 } },
    { id: 'thb_win_rep', emoji: '🥇', title: 'Hero', tags: ['school', 'sport'], when: { school: 'thornbury', flags: 'coach', test: s => (s.counters.wins || 0) >= 5 }, weight: 6, cooldown: 12,
      text: 'Your team\'s winning run makes the school magazine cover. At Thornbury, this counts for more than a doctorate.', fx: { rep: 6, morale: 4 } },

    /* ---------- Larkspur House ---------- */
    { id: 'lark_arrive', emoji: '🌱', title: 'Larkspur', tags: ['school'], when: { school: 'larkspur' }, once: true, weight: 60,
      text: 'At Larkspur House everyone uses first names, the staffroom has beanbags and the behaviour policy is a poem.', fx: { morale: 2 } },
    { id: 'lark_names', emoji: '👋', title: 'First names', tags: ['school'], when: { school: 'larkspur' }, cast: { p: 'pupil' }, weight: 6,
      text: '{p.first}, aged eight, calls you "{first}" and asks how your weekend was. You are still not used to it.', fx: { rel: { p: 3 } } },
    { id: 'lark_circle', emoji: '⭕', title: 'Restorative circle', tags: ['school', 'pastoral'], when: { school: 'larkspur' }, cast: { p: { role: 'pupil', type: ['joker', 'chatter', 'late'] } }, weight: 7,
      text: '{p.first} has flooded the boys\' loos. There are no detentions at Larkspur, so you hold a restorative circle with a talking stick.',
      choices: [
        { label: 'Commit to the circle', outcomes: [
          { w: 1, by: { patience: 0.6 }, text: '{p.first} cries, apologises and offers to mop. It works, annoyingly.', fx: { rel: { p: 8 }, patience: 2, karma: 2 } },
          { w: 1, text: '{p.first} uses the talking stick as a microphone for twenty minutes.', fx: { morale: -3, energy: -3 } } ] },
        { label: 'A firm word instead', text: 'Someone reports you for "punitive language". You have to attend a reflection meeting.', fx: { rep: -3, morale: -2 } },
      ] },
    { id: 'lark_forest', emoji: '🦔', title: 'Forest school', tags: ['school'], when: { school: 'larkspur', season: ['summer', 'michaelmas'] }, weight: 6,
      text: 'Your double lesson is replaced by forest school. You build a hedgehog house with Year 4. It is the best thing you make all year.', fx: { morale: 5, energy: 2 } },
    { id: 'lark_inset', emoji: '🥁', title: 'INSET', tags: ['school', 'commonroom'], when: { school: 'larkspur', ht: [0, 2, 4] }, weight: 6, cooldown: 6,
      text: 'INSET day is on "radical kindness" and ends with a drumming workshop.',
      choices: [
        { label: 'Drum with abandon', text: 'You find your rhythm. The Head of Science finds his inner child, loudly.', fx: { morale: 5, rel: { head: 3 } } },
        { label: 'Mark at the back', text: 'You mark a set of books to the beat. Nobody minds.', fx: { energy: 2, rep: -1 } },
      ] },
  );
})(typeof window !== 'undefined' ? window : globalThis);
