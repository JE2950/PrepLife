/* Round 3: Sport and the touchline (incl. croquet and the grudge match) */
(function (root) {
  'use strict';
  const D = root.PSL_DATA;
  const COACH = { flags: 'coach' };

  D.events.push(
    /* ---------- Refereeing ---------- */
    { id: 'ref_call', emoji: '🟨', title: 'Referee', tags: ['sport'], when: COACH, weight: 9,
      text: 'You are refereeing the home {sport} match. In the last minute, a decision could go either way. Forty parents hold their breath.',
      choices: [
        { label: 'Give it to the visitors', text: 'The visitors win. Your own side look at you as if you have defected.', fx: { karma: 2, morale: -2, rep: 1 } },
        { label: 'Give it to your side', outcomes: [
          { w: 1, text: 'Your side win. The visiting coach shakes your hand very firmly and says nothing.', fx: { morale: 3, karma: -2, count: 'wins' } },
          { w: 1, text: 'A visiting parent films your decision. It is in the {rival} newsletter by Friday.', fx: { rep: -3, karma: -2 } } ] },
        { label: 'Play advantage and hope', text: 'Advantage runs into the full-time whistle. Nobody can work out what happened, so nobody complains.', fx: { morale: 2 } },
      ] },
    { id: 'ref_abuse', emoji: '📣', title: 'Advice from the touchline', tags: ['sport', 'parents'], when: COACH, cast: { par: 'parent' }, weight: 8,
      outcomes: [
        { w: 1, text: '{par} shouts "Ref, he\'s offside!" during a cricket match. {par.He} is very sure.', fx: { morale: 2 } },
        { w: 1, text: '{par} asks if you need glasses. You are wearing glasses. You have never worn glasses.', fx: { morale: 1 } },
        { w: 1, text: 'Your own U9s appeal for every ball. Including wides. Including the ones they bowled.', fx: { morale: 2 } },
      ] },

    /* ---------- Match day ---------- */
    { id: 'minibus', emoji: '🚐', title: 'The minibus', tags: ['sport'], when: COACH, weight: 9,
      text: 'Away at {rival}. You are driving the minibus. Fourteen children, one satnav, no signal.',
      choices: [
        { label: 'Trust the satnav', outcomes: [
          { w: 1, text: 'You arrive with two minutes to spare after a tour of three farmyards.', fx: { energy: -3 } },
          { w: 1, text: 'The satnav takes you to the wrong {rival}, a care home in Swindon. You arrive at half-time.', fx: { rep: -3, morale: -3, energy: -4 } } ] },
        { label: 'Follow the other minibus', text: 'The other minibus is also lost. You have a lovely picnic in a lay-by.', fx: { morale: 3, rep: -1 } },
        { label: 'Leave an hour early', text: 'You arrive so early the opposition are still in Latin.', fx: { energy: -2, organisation: 1 } },
      ] },
    { id: 'team_sheet', emoji: '📋', title: 'Team sheet', tags: ['sport', 'parents'], when: COACH, cast: { p: 'pupil', par: 'parent' }, weight: 8,
      text: 'You pin up the team sheet. Within the hour, {par} emails to ask why {par.child} is on the bench "again".',
      choices: [
        { label: 'Explain your selection', outcomes: [
          { w: 1, by: { charisma: 0.4 }, text: '{par} accepts it and comes to cheer anyway.', fx: { rel: { par: 3 } } },
          { w: 1, text: '{par} sends a spreadsheet of {par.child}\'s tackles this season.', fx: { rel: { par: -4 }, morale: -3 } } ] },
        { label: 'Quietly start {par.child} next week', text: '{par.child} starts. You lose by forty. Everyone is happy except the scoreboard.', fx: { rel: { par: 6 }, karma: -1, count: 'losses' } },
      ] },
    { id: 'u9d', emoji: '🐣', title: 'The U9Ds', tags: ['sport'], when: COACH, weight: 7,
      outcomes: [
        { w: 1, text: 'Your U9D side lose 0 to 60. They come off the pitch convinced they have won.', fx: { morale: 4 } },
        { w: 1, text: 'Your U9Ds score their first try of the season. You sprint the length of the touchline. So does the try-scorer\'s grandmother.', fx: { morale: 7, count: 'wins' } },
        { w: 1, text: 'Halfway through the U9D match, three of your players sit down to look at a beetle.', fx: { morale: 3 } },
        { w: 1, text: 'The "everyone gets a go" rule means your goalkeeper is the one who has never seen a hockey stick. He saves a penalty.', fx: { morale: 6 } },
      ] },
    { id: 'match_tea', emoji: '🍰', title: 'Match tea', tags: ['sport'], when: COACH, weight: 6,
      outcomes: [
        { w: 1, text: 'Match tea is legendary: sausage rolls, flapjack and a fruit cake the opposition talk about all the way home.', fx: { morale: 3, rep: 1 } },
        { w: 1, text: 'Match tea at {rival} is one squash and a Rich Tea each. Your team never forgive them.', fx: { morale: 1 } },
        { w: 1, text: 'The opposition coach asks for the flapjack recipe. Your kitchen guard it like a state secret.', fx: { morale: 2 } },
      ] },
    { id: 'kit_disaster', emoji: '👕', title: 'Kit', tags: ['sport'], when: COACH, weight: 6,
      text: 'You open the kit bag at {rival}. It contains fifteen shirts in size Age 5 and a single sock.',
      choices: [
        { label: 'Play in PE kit', text: 'Your team play in whites, like a cricket side who have lost their way. They win, out of embarrassment.', fx: { morale: 3, count: 'wins' } },
        { label: 'Borrow the opposition\'s spares', text: 'Your team play in {rival} colours. A parent cheers for the wrong side all afternoon.', fx: { morale: 2 } },
      ] },

    /* ---------- Touchline parents ---------- */
    { id: 'parent_types', emoji: '🧥', title: 'The touchline', tags: ['sport', 'parents'], when: COACH, cast: { par: 'parent' }, weight: 7,
      outcomes: [
        { w: 1, text: '{par} films the entire match on an iPad held above {par.his} head. All sixty minutes.', fx: {} },
        { w: 1, text: '{par} brings a shooting stick, a flask of something and a Labrador. {par.He} has not watched a single play.', fx: { morale: 1 } },
        { w: 1, text: '{par} coaches {par.child} from the touchline, giving the opposite instruction to yours every time.', fx: { morale: -2 } },
        { w: 1, text: '{par} tells you {par.he} "played a bit at university". {par.He} means the Blues.', fx: { morale: 1 } },
        { w: 1, text: '{par} arrives at the final whistle, asks the score and leaves.', fx: {} },
      ] },

    /* ---------- Injuries and weather ---------- */
    { id: 'frozen', emoji: '🥶', title: 'Frozen pitch', tags: ['sport', 'weather'], when: { flags: 'coach', season: ['michaelmas', 'lent'], ht: [1, 2, 3] }, weight: 7,
      text: 'The pitch is frozen solid at 8am. The match is at 2.30pm. The Head of Games says to "see how it goes".',
      choices: [
        { label: 'Call it off now', text: 'Called off. A free afternoon. You mark eleven books and nap.', fx: { energy: 5 } },
        { label: 'Wait until noon', outcomes: [
          { w: 1, text: 'The sun comes out at 11.40. The match is on and glorious.', fx: { morale: 4 } },
          { w: 1, text: 'It is still frozen at noon. The opposition are already on the M4.', fx: { morale: -3, rel: { head: -2 } } } ] },
      ] },
    { id: 'concussion', emoji: '🩹', title: 'A knock', tags: ['sport', 'pastoral'], when: COACH, cast: { p: { role: 'pupil', type: ['sporty', 'grafter'] } }, weight: 6,
      text: '{p.first} takes a knock to the head. {p.He} insists {p.he} is "fine" and asks what the score is. It is the third time {p.he} has asked.',
      choices: [
        { label: 'Off, protocol, no arguments', text: 'Off, to Matron, with the protocol followed to the letter. Exactly right.', fx: { rel: { p: -2 }, rep: 3, karma: 3 } },
        { label: 'Five minutes on the bench, then see', text: '{p.first} goes back on. Matron finds out on Monday and you hear about it for a month.', fx: { rep: -6, karma: -4, rel: { matron: -8 } } },
      ] },
    { id: 'rained_off', emoji: '🌧️', title: 'Washout', tags: ['sport', 'weather'], when: { flags: 'coach', season: 'summer' }, weight: 7,
      text: 'Rain stops play at 3.10. You spend the afternoon in the pavilion teaching the U11s how to play Uno properly.', fx: { morale: 2, energy: 2 } },

    /* ---------- Croquet: the signature sport ---------- */
    { id: 'croquet_found', emoji: '🔨', title: 'The croquet lawn', tags: ['sport', 'croquet'], when: { season: 'summer', not: 'croquet' }, weight: 7, once: true,
      text: 'Behind the chapel you find a croquet lawn and a shed of mallets nobody has used since 1994. Several pupils look interested. One looks dangerous.',
      choices: [
        { label: 'Start a croquet club', text: 'The Croquet Society is reborn. Membership: nine. Rules: disputed.', fx: { addResp: 'croquet', morale: 6, rep: 2 } },
        { label: 'Leave the mallets in peace', text: 'You close the shed door. A spider inside breathes again.', fx: {} },
      ] },
    { id: 'croquet_ruthless', emoji: '🏏', title: 'Sent to the shrubbery', tags: ['sport', 'croquet'], when: { flags: 'croquet', season: 'summer' }, cast: { p: 'pupil' }, weight: 10, cooldown: 2,
      outcomes: [
        { w: 1, text: '{p.first} roquets {p.his} best friend\'s ball into the rose bed and does not apologise. A natural.', fx: { morale: 4 } },
        { w: 1, text: '{p.first} learns the word "peel" and uses it at every meal for a week.', fx: { morale: 3 } },
        { w: 1, text: 'A croquet match between {p.first} and a Year 8 runs for two hours and ends in a tie on time. Both demand a rematch.', fx: { morale: 4 } },
        { w: 1, text: 'You lose to {p.first}, aged nine, in front of the whole club. {p.He} is gracious about it. Unbearably so.', fx: { morale: 2, rel: { p: 5 } } },
      ] },
    { id: 'croquet_head', emoji: '🎩', title: 'The Head plays', tags: ['sport', 'croquet'], when: { flags: 'croquet', season: 'summer', has: 'head' }, weight: 8, cooldown: 12,
      text: '{head} wanders over to the croquet lawn and asks for "a quick game".',
      choices: [
        { label: 'Let {head} win', text: '{head} wins and talks about it in assembly. Your stock rises.', fx: { rel: { head: 8 }, karma: -1 } },
        { label: 'Play to win', outcomes: [
          { w: 1, by: { charisma: 0.4 }, text: 'You win in a ruthless display. {head} laughs, shakes your hand and asks for lessons.', fx: { rel: { head: 6 }, morale: 6 } },
          { w: 1, text: 'You send {head}\'s ball into the pond. The silence lasts until September.', fx: { rel: { head: -8 }, morale: 3 } } ] },
      ] },
    { id: 'croquet_champs', emoji: '🏆', title: 'Prep Schools Croquet', tags: ['sport', 'croquet'], when: { flags: 'croquet', ht: 5 }, cast: { p: 'pupil' }, weight: 14, cooldown: 5,
      text: 'You take a pair to the Prep Schools Croquet Championship. {p.first} is your best player and has a cold.',
      choices: [
        { label: 'Play the long game', outcomes: [
          { w: 1, by: { patience: 0.6 }, text: 'A two-hour war of attrition. Your pair win the plate. A small silver cup goes in the cabinet.', fx: { rep: 6, morale: 8, count: { wins: 2, croquetCups: 1 } } },
          { w: 1, text: 'Out in the quarter-finals to a school with its own croquet professional.', fx: { morale: -2 } } ] },
        { label: 'All-out attack', outcomes: [
          { w: 1, by: { charisma: 0.4 }, text: 'Your pair storm to the final and win on the last hoop. Grown men weep in panama hats.', fx: { rep: 8, morale: 10, count: { wins: 3, croquetCups: 1 } } },
          { w: 1, text: 'Your attack scatters balls across three lawns. Out in the first round, magnificently.', fx: { morale: 1 } } ] },
      ] },

    /* ---------- Tours, festivals, trials, Head of Games ---------- */
    { id: 'tour', emoji: '✈️', title: 'Sports tour', tags: ['sport', 'trips'], when: { flags: 'coach', ht: 3, stat: { years: '>=2' } }, weight: 6, cooldown: 12,
      text: 'The Head of Games asks you to help run the Easter rugby and hockey tour to Portugal. It eats half your holiday.',
      choices: [
        { label: 'Go on tour', outcomes: [
          { w: 1, text: 'A week of sun, matches and lost passports (found). The best week of the pupils\' year.', fx: { morale: 8, energy: -18, rep: 4, count: 'tours' } },
          { w: 1, text: 'A sickness bug sweeps the squad. You spend three nights on hotel bathroom duty.', fx: { morale: -4, energy: -22, rep: 4, count: 'tours' } } ] },
        { label: 'Not this year', text: 'You spend Easter at home. The tour photos look very sunny.', fx: { rel: {} } },
      ] },
    { id: 'festival', emoji: '🎪', title: 'Festival', tags: ['sport'], when: { flags: 'coach' }, weight: 5,
      text: 'A hockey festival: twelve schools, twenty minutes a game, and one burger van with a queue of two hundred.',
      outcomes: [
        { w: 1, by: { teaching: 0.2 }, text: 'Your side reach the final and lose on flicks. Proud day.', fx: { morale: 5, count: 'wins' } },
        { w: 1, text: 'You lose every match and win the Fair Play award. The team cheer it as if it is the cup.', fx: { morale: 4, karma: 2 } },
      ] },
    { id: 'county_trial', emoji: '🎽', title: 'County trial', tags: ['sport'], when: COACH, cast: { p: { role: 'pupil', type: ['sporty', 'grafter'], year: '>=6' } }, weight: 5, cooldown: 12,
      text: '{p.full} is invited to the county {sport} trials. {p.His} parents ask you to write a reference by tomorrow.',
      choices: [
        { label: 'Write a glowing reference', outcomes: [
          { w: 1, text: '{p.first} makes the county squad. {p.He} tells everyone you made it happen.', fx: { rel: { p: 10 }, rep: 4, morale: 5 } },
          { w: 1, text: '{p.first} misses out but gets "one to watch". {p.He} trains twice as hard.', fx: { rel: { p: 6 } } } ] },
        { label: 'Write an honest one', text: 'Honest and fair. {p.first} gets in on merit, and you sleep well.', fx: { rel: { p: 4 }, karma: 2, rep: 2 } },
      ] },
    { id: 'hog_request', emoji: '📯', title: 'The Head of Games', tags: ['sport', 'commonroom'], when: { flags: 'coach' }, cast: { col: 'colleague' }, weight: 6,
      text: '{col}, Head of Games, asks you to take an extra team on Wednesdays "just till half-term". It is never just till half-term.',
      choices: [
        { label: 'Say yes', text: 'You now run two teams. {col} owes you one. {col.He} will not remember it.', fx: { rel: { col: 6 }, energy: -6, rep: 3 } },
        { label: 'Say no', text: '{col} says "no worries" in a tone that means worries.', fx: { rel: { col: -5 } } },
      ] },

    /* ---------- The grudge match ---------- */
    { id: 'grudge', emoji: '⚔️', title: 'The grudge match', tags: ['sport', 'calendar'], when: { flags: 'coach', ht: [1, 2] },
      setup: (s, ctx, P) => { const g = D.schools.find(x => x.id === s.school.id); ctx.vars = { foe: g && g.grudge ? g.grudge : 'Coldharbour House' }; },
      weight: 12, cooldown: 5,
      text: 'The {foe} match. Nobody remembers how the feud started. Everybody remembers the 2009 result.',
      choices: [
        { label: 'Fire them up', outcomes: [
          { w: 1, by: { charisma: 0.6 }, text: 'You beat {foe}. The Head gives the school a half-holiday and you are carried off the pitch, metaphorically.', fx: { rep: 7, morale: 10, rel: { head: 6 }, count: { wins: 1, grudgeWins: 1 } } },
          { w: 1, text: 'You lose to {foe}. The walk back to the minibus is the longest of your career.', fx: { morale: -6, rep: -2, count: 'losses' } } ] },
        { label: 'Keep calm and play your game', outcomes: [
          { w: 1, by: { teaching: 0.3, organisation: 0.3 }, text: 'A tight, clever win over {foe}. The old boys write letters of thanks.', fx: { rep: 6, morale: 8, count: { wins: 1, grudgeWins: 1 } } },
          { w: 1, text: 'A draw with {foe}. Both schools claim a moral victory in their newsletters.', fx: { morale: 2 } } ] },
      ] },
  );
})(typeof window !== 'undefined' ? window : globalThis);
