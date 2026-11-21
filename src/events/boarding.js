/* Round 2: Boarding and pastoral */
(function (root) {
  'use strict';
  const D = root.PSL_DATA;
  const NIGHT = { boarding: true, test: s => !!(s.flags.resident || s.career.role === 'Housemaster') };
  const HM = { role: 'Housemaster' };
  const DOGS = ['Biscuit', 'Hector', 'Pippin', 'Bramble', 'Wellington', 'Moss', 'Juno', 'Brigadier'];
  const dogVars = (s, ctx) => { ctx.vars = Object.assign(ctx.vars || {}, { dog: s.flags.dogName || 'the dog' }); };

  D.events.push(
    /* ---------- Night duty ---------- */
    { id: 'sleepwalker', emoji: '🌙', title: '1am', tags: ['boarding', 'night'], when: NIGHT, cast: { p: 'boarder' }, weight: 7,
      text: 'At 1am {p.first} walks past you in the corridor, fast asleep, carrying a cricket bat and muttering about the Bursar.',
      choices: [
        { label: 'Steer them gently back to bed', text: '{p.first} goes back to bed without waking. {p.He} remembers nothing at breakfast.', fx: { rel: { p: 3 }, energy: -2, patience: 1 } },
        { label: 'Wake them up', text: '{p.first} wakes, screams, and wakes the whole dorm. Bedtime starts again.', fx: { energy: -5, morale: -2 } },
        { label: 'Follow to see where they go', text: '{p.first} walks to the kitchen, makes a perfect slice of toast and goes back to bed.', fx: { morale: 4, energy: -3 } },
      ] },
    { id: 'night_alarm', emoji: '🚨', title: 'Fire alarm, 3am', tags: ['boarding', 'night'], when: NIGHT, weight: 5, cooldown: 12,
      text: 'The fire alarm goes at 3am. Sixty boarders line up on the lawn in dressing gowns. Your register is one short.',
      choices: [
        { label: 'Check the register again', outcomes: [
          { w: 70, by: { organisation: 0.5 }, text: 'He was standing behind a tree the whole time. Wearing one slipper.', fx: { energy: -5 } },
          { w: 30, text: 'He is still in bed, asleep, under four duvets. The fire brigade find this very funny.', fx: { energy: -5, rep: -3, morale: -3 } } ] },
        { label: 'Run back in to check', text: 'Against every rule in the fire policy. He is in the loo. The Bursar finds out.', fx: { energy: -6, rep: -2, rel: { bursar: -6 }, karma: 2 } },
      ] },
    { id: 'dorm_war', emoji: '🪒', title: 'Dorm war', tags: ['boarding', 'night'], when: NIGHT, weight: 6,
      text: 'Dorm 3 and Dorm 4 are at war. The battlefield is the corridor and the weapon is shaving foam.',
      choices: [
        { label: 'Everyone out, mop up now', text: 'The clean-up takes until 11pm. Peace returns, sticky and resentful.', fx: { energy: -5, rep: 2 } },
        { label: 'Declare a ceasefire and a treaty', outcomes: [
          { w: 1, by: { charisma: 0.5 }, text: 'Your Treaty of Dorm 3 holds for a full term. Historians will study it.', fx: { morale: 5, energy: -2 } },
          { w: 1, text: 'The treaty collapses within the hour. Toothpaste is now involved.', fx: { energy: -6, morale: -3 } } ] },
      ] },
    { id: 'torch', emoji: '🔦', title: 'Torchlight', tags: ['boarding', 'night'], when: NIGHT, cast: { p: 'boarder' }, weight: 6,
      text: 'There is a torch glowing under {p.first}\'s duvet at midnight. {p.He} is reading.',
      choices: [
        { label: 'Confiscate the torch', text: '{p.first} hands it over. You feel like a monster.', fx: { rel: { p: -4 }, rep: 1 } },
        { label: '"Finish the chapter. Then sleep."', text: '{p.first} grins. You have made a reader for life.', fx: { rel: { p: 8 }, karma: 2 } },
      ] },
    { id: 'ghost', emoji: '👻', title: 'The ghost', tags: ['boarding', 'night'], when: NIGHT, weight: 5, once: true,
      text: 'Year 5 are convinced the house is haunted by a Victorian headmaster called Mr Gribble. Nobody will go to the loo alone.',
      choices: [
        { label: 'Debunk it calmly', text: 'You explain the noise is the boiler. Year 5 now believe the boiler is haunted.', fx: { energy: -2 } },
        { label: 'Play along, just a little', outcomes: [
          { w: 1, text: 'You mention Mr Gribble liked tidy dormitories. The house has never been so tidy.', fx: { morale: 5, rep: 2 } },
          { w: 1, text: 'Three parents email about "a culture of fear". You apologise to Mr Gribble.', fx: { rep: -3, morale: -2 } } ] },
      ] },
    { id: 'homesick_long', emoji: '🧸', title: 'Third night running', tags: ['boarding', 'pastoral'], when: NIGHT, cast: { p: { role: 'pupil', boarder: true, year: '<=6' } }, weight: 8, cooldown: 6,
      text: '{p.first} is homesick again, for the third night running. You have tried everything.',
      choices: [
        { label: 'Let them sit with you and read', text: 'You sit with {p.first} until {p.he} falls asleep on a copy of Swallows and Amazons.', fx: { rel: { p: 8 }, energy: -4, karma: 3, schedule: { id: 'homesick_over', in: 2 } } },
        { label: 'Let them chat and cry it out', text: 'Forty minutes of tears about the dog. It doesn\'t fix it. It helps a bit.', fx: { rel: { p: 6 }, energy: -4, patience: 2, schedule: { id: 'homesick_over', in: 2 } } },
        { label: '"Back to bed, you\'ll be fine"', text: '{p.first} goes back to bed. Nothing is fixed.', fx: { rel: { p: -3 }, schedule: { id: 'homesick_over', in: 3 } } },
      ] },
    { id: 'homesick_over', manual: true, emoji: '🌰', title: 'Over it', cast: { p: { role: 'pupil', boarder: true } },
      choices: null, text: '{p.first} wins a conker match against a Year 8 and forgets, quite suddenly, to be homesick.', fx: { morale: 3 } },

    /* ---------- Division Master / Mistress ---------- */
    { id: 'dm_ham_pa', emoji: '📱', title: '6.12am', tags: ['divmaster', 'parents'], when: { flags: 'divmaster', school: 'hambrook' }, cast: { par: 'parent' }, weight: 14, cooldown: 2,
      text: 'An email from {par} at 6.12am. Could you remind {par.child} to wear a vest, book {par.child} a haircut, and collect a parcel from reception? Thanks so much!!',
      choices: [
        { label: 'Do all three', text: 'You are now a personal assistant with a teaching qualification. {par} sends a heart emoji.', fx: { rel: { par: 6 }, energy: -4, morale: -2 } },
        { label: 'Reply with a gentle boundary', outcomes: [
          { w: 1, by: { charisma: 0.5 }, text: '{par} takes it well and books the haircut {par.he}self.', fx: { rel: { par: -1 }, morale: 3, patience: 1 } },
          { w: 1, text: '{par} copies in the Head and asks what exactly a Division Master is for.', fx: { rel: { par: -8, head: -3 }, morale: -4 } } ] },
        { label: 'Forward it to Matron', text: 'Matron forwards it back to you with no comment.', fx: { rel: { matron: -4 } } },
      ] },
    { id: 'dm_ham_dates', emoji: '🗓️', title: 'The exeat date', tags: ['divmaster', 'parents'], when: { flags: 'divmaster', school: 'hambrook' }, cast: { par: 'parent' }, weight: 9,
      text: '{par} has lost the exeat dates and needs them "urgently". They are on the portal, the calendar, the newsletter and a fridge magnet you sent home.', fx: { energy: -1, morale: -2, patience: -1 } },
    { id: 'dm_ham_seat', emoji: '🍽️', title: 'The seating plan', tags: ['divmaster', 'parents'], when: { flags: 'divmaster', school: 'hambrook' }, cast: { par: 'parent' }, weight: 8,
      text: '{par} wants to discuss the lunch seating plan. {par.child} is two seats away from a child whose father works for a rival hedge fund.',
      choices: [
        { label: 'Move {par.child}', text: 'You move {par.child}. Three more parents request moves by Friday.', fx: { rel: { par: 5 }, energy: -3, morale: -2 } },
        { label: 'Hold the line', text: 'You explain the plan is random. {par} does not believe in random.', fx: { rel: { par: -6 }, rep: 1 } },
      ] },
    { id: 'dm_mud_rounds', emoji: '🐸', title: 'Division rounds', tags: ['divmaster'], when: { flags: 'divmaster', school: 'mudgrove' }, cast: { p: 'pupil' }, weight: 12, cooldown: 2,
      outcomes: [
        { w: 1, text: 'On your Division rounds, {p.first} shows you a frog {p.he} is keeping in a sock. You agree it can stay until Sunday.', fx: { morale: 4, rel: { p: 4 } } },
        { w: 1, text: 'You check in on your Division. Everyone is fine. {p.first} asks if you have seen the new Bond film. You have.', fx: { morale: 3, rel: { p: 3 } } },
        { w: 1, text: 'Your Division have built a den in the rhododendrons. You are invited in for an "official inspection".', fx: { morale: 5 } },
      ] },
    { id: 'dm_mud_highlights', emoji: '📺', title: 'Highlights', tags: ['divmaster', 'sport'], when: { flags: 'divmaster', school: 'mudgrove', season: ['michaelmas', 'lent'] }, weight: 8,
      text: 'Your Division cram round the common room telly for the rugby highlights. A disputed try. All eyes turn to you.',
      choices: [
        { label: '"Clear try"', text: 'Half the room cheers. The other half write letters of protest.', fx: { morale: 4 } },
        { label: '"Held up. Never a try"', text: 'Half the room cheers. The other half write letters of protest. Same half, oddly.', fx: { morale: 4 } },
        { label: 'Explain the law, in detail', text: 'Ten minutes on the grounding law. They have all gone to bed.', fx: { morale: 1, energy: 2 } },
      ] },
    { id: 'dm_discipline', emoji: '⚖️', title: 'An appeal', tags: ['divmaster', 'pastoral'], when: { flags: 'divmaster' }, cast: { p: 'pupil', col: 'colleague' }, weight: 9,
      text: '{p.first} and two friends in your Division set off a stink bomb in prep. {col} has given them a week of detentions. They say it is unfair. They are probably right that it is a lot.',
      choices: [
        { label: 'Back your colleague', text: 'You back {col}. The boys grumble. {col} buys you a coffee.', fx: { rel: { col: 6, p: -4 }, rep: 2 } },
        { label: 'Quietly reduce it', text: 'Three days, and a letter of apology. {col} hears about it and is cool with you for a week.', fx: { rel: { col: -6, p: 6 }, karma: 1 } },
        { label: 'Find out what really happened', outcomes: [
          { w: 1, by: { patience: 0.5 }, text: 'It was a fourth boy, who owns up. Everyone feels justice was done.', fx: { rep: 3, rel: { p: 6, col: 2 }, energy: -3 } },
          { w: 1, text: 'Two days of interviews reveal nothing except that everyone hates stink bombs.', fx: { energy: -5 } } ] },
      ] },
    { id: 'dm_reports', emoji: '🖋️', title: 'Division reports', tags: ['divmaster'], when: { flags: 'divmaster', ht: [1, 3, 5] }, cast: { p: 'pupil' }, weight: 10, cooldown: 4,
      text: 'Forty Division reports to write and proofread by Friday. Twelve colleagues have used the phrase "a pleasure to teach".',
      choices: [
        { label: 'Rewrite them properly', text: 'Every report now sounds like a real person. It takes your whole weekend.', fx: { energy: -8, rep: 4 } },
        { label: 'Check names and spellings only', text: 'You catch a report that calls a boy by his brother\'s name. Good enough.', fx: { energy: -3, rep: 1 } },
        { label: 'Send them through as they are', outcomes: [
          { w: 1, text: 'Nobody notices.', fx: { energy: 2 } },
          { w: 1, text: 'A parent spots "{p.first}" in a report for a different child.', fx: { rep: -4, morale: -3 } } ] },
      ] },

    /* ---------- Matron and the San ---------- */
    { id: 'san_faker', emoji: '🤒', title: 'A mystery illness', tags: ['boarding', 'matron'], cast: { p: 'pupil' }, weight: 8,
      text: '{p.first} reports to the San with "a pain in my everything", ten minutes before your {subject} test.',
      choices: [
        { label: 'Let Matron decide', outcomes: [
          { w: 1, text: 'Matron takes one look, declares {p.first} "as fit as a butcher\'s dog" and sends {p.him} straight back.', fx: { morale: 2 } },
          { w: 1, text: 'Matron keeps {p.first} in with a temperature. It was real after all.', fx: { karma: 1 } } ] },
        { label: '"Sit the test, then we\'ll see"', text: '{p.first} makes a miraculous recovery the moment the test ends.', fx: { rel: { p: -2 }, rep: 1 } },
      ] },
    { id: 'matron_rule', emoji: '🌡️', title: "Matron's law", tags: ['boarding', 'matron'], when: { has: 'matron' }, weight: 5, once: true,
      text: '{matron} explains the rule of the San: nobody is ill unless they have a temperature or are visibly bleeding. Even then, it depends.' },
    { id: 'sock_amnesty', emoji: '🧦', title: 'Sock amnesty', tags: ['boarding', 'matron'], when: { boarding: true }, weight: 5,
      text: '{matron} declares a sock amnesty. Two hundred and fourteen odd socks. One has a name tape from 1998.', fx: { morale: 2 } },
    { id: 'matron_war', emoji: '🥾', title: 'Boot war', tags: ['boarding', 'matron', 'commonroom'], when: { has: 'matron' }, cast: { col: 'colleague' }, weight: 6,
      text: '{matron} and {col} are at war over muddy rugby boots in the corridor. Both want you on their side.',
      choices: [
        { label: 'Side with {matron}', text: '{matron} is grateful. Your shirts come back from the laundry ironed.', fx: { rel: { matron: 8, col: -5 } } },
        { label: 'Side with {col}', text: '{col} is grateful. Your shirts come back from the laundry grey.', fx: { rel: { col: 8, matron: -6 } } },
        { label: 'Build a boot rack yourself', text: 'Your wonky boot rack ends the war. Both sides claim victory.', fx: { rel: { matron: 4, col: 4 }, energy: -3, karma: 2 } },
      ] },

    /* ---------- Boarding life ---------- */
    { id: 'exeat_alone', emoji: '🏚️', title: 'Exeat weekend', tags: ['boarding'], when: { boarding: true }, cast: { p: 'boarder' }, weight: 6, cooldown: 6,
      text: 'Exeat weekend. Every boarder goes home except {p.first}, whose parents are stuck in Dubai.',
      choices: [
        { label: 'Take them out for Sunday lunch', text: 'A roast, a walk and a game of cards. {p.first} talks more than {p.he} has all term.', fx: { rel: { p: 12 }, money: -40, energy: -2, karma: 4 } },
        { label: 'Leave it to the duty team', text: '{p.first} watches films in the empty boarding house. The duty team are kind.', fx: { energy: 3 } },
      ] },
    { id: 'tuck_baron', emoji: '🍬', title: 'Tuck baron', tags: ['boarding'], when: { boarding: true }, cast: { p: { role: 'pupil', type: ['charmer', 'quirky', 'knowall'] } }, weight: 6,
      text: '{p.first} has cornered the Haribo market and is selling at four hundred per cent mark-up.',
      choices: [
        { label: 'Shut it down', text: 'You shut it down. The market crashes. Fizzy cola bottles are worthless by teatime.', fx: { rel: { p: -5 }, rep: 1 } },
        { label: 'Ask about the business model', text: '{p.first} shows you a spreadsheet. You learn more than in your last INSET.', fx: { rel: { p: 6 }, morale: 4 } },
      ] },
    { id: 'letter_home', emoji: '✉️', title: 'Letter-writing', tags: ['boarding'], when: { boarding: true }, cast: { p: 'boarder' }, weight: 7,
      outcomes: [
        { w: 1, text: '{p.first}\'s Sunday letter home reads, in full: "Dear Mum, I am alive. Love, {p.first}."', fx: { morale: 3 } },
        { w: 1, text: '{p.first}\'s letter home is four pages on the food. Three of the pages are about sausages.', fx: { morale: 2 } },
        { w: 1, text: '{p.first} writes home that you are "the best teacher, apart from when you are cross". You will take it.', fx: { morale: 4, rel: { p: 3 } } },
      ] },
    { id: 'sunday_trip', emoji: '🎳', title: 'Sunday activity', tags: ['boarding'], when: { boarding: true }, weight: 6,
      text: 'You are running this Sunday\'s activity for the boarders.',
      choices: [
        { label: 'Bowling in Reading', text: 'Forty children, forty pairs of shoes, one gutter ball record.', fx: { morale: 4, energy: -4 } },
        { label: 'A long walk with a picnic', outcomes: [
          { w: 1, text: 'Sunshine, a stream and nobody falls in. A perfect day.', fx: { morale: 6, energy: -3 } },
          { w: 1, text: 'It pours. Everybody falls in, even you.', fx: { morale: -2, energy: -5 } } ] },
        { label: 'Film in the common room', text: 'You fall asleep twenty minutes in. Nobody tells.', fx: { energy: 3 } },
      ] },
    { id: 'phone_time', emoji: '📞', title: 'Phone time', tags: ['boarding', 'parents'], when: { boarding: true }, cast: { par: 'parent' }, weight: 6,
      text: '{par} has been on a video call with {par.child} for fifty minutes. {par.He} now asks for you by name.',
      choices: [
        { label: 'Take the call', text: 'Twenty minutes on whether {par.child} is eating enough vegetables. Bedtime runs late.', fx: { rel: { par: 6 }, energy: -3 } },
        { label: 'Politely end phone time', text: 'You end phone time for everyone at the same moment. {par} is not thrilled.', fx: { rel: { par: -4 }, rep: 1 } },
      ] },
    { id: 'contraband', emoji: '📦', title: 'Under the bed', tags: ['boarding'], when: { boarding: true }, cast: { p: 'boarder' }, weight: 6,
      text: 'A shoebox under {p.first}\'s bed: six tubes of Pringles, a Nintendo Switch and a mobile phone.',
      choices: [
        { label: 'Confiscate it all', text: 'Back at the end of term. The Pringles are, regrettably, perishable.', fx: { rel: { p: -6 }, rep: 2 } },
        { label: 'Phone and Switch go; Pringles stay', text: 'A fair settlement. {p.first} respects your judgement.', fx: { rel: { p: 2 }, rep: 1 } },
        { label: 'Pretend you saw nothing', outcomes: [
          { w: 1, text: 'Nobody ever knows.', fx: { karma: -1 } },
          { w: 1, text: 'Matron finds it the next day and asks who did dorm checks.', fx: { rep: -3, rel: { matron: -5 } } } ] },
      ] },

    /* ---------- Pupils and each other ---------- */
    { id: 'fallout', emoji: '💥', title: 'Fallout', tags: ['pastoral'], cast: { p: 'pupil', q: 'pupil' }, weight: 7,
      text: '{p.first} and {q.first}, best friends since Year 3, are not speaking. The cause is a Pokémon card.',
      choices: [
        { label: 'Mediate', outcomes: [
          { w: 1, by: { patience: 0.5 }, text: 'You broker a deal involving shared custody of the card. Peace.', fx: { rel: { p: 4, q: 4 }, morale: 3 } },
          { w: 1, text: 'Your mediation creates a three-way feud that now includes you.', fx: { rel: { p: -3, q: -3 }, morale: -2 } } ] },
        { label: 'Let them sort it out', text: 'By Thursday they are best friends again and cannot remember why they fell out.', fx: {} },
      ] },
    { id: 'dorm_captain', emoji: '🗳️', title: 'Election', tags: ['boarding'], when: { boarding: true }, cast: { p: 'boarder', q: 'boarder' }, weight: 5,
      text: 'The election for captain of Dorm 4 between {p.first} and {q.first} has turned nastier than a general election. There are posters.',
      choices: [
        { label: 'Back {p.first}', text: '{p.first} wins. {q.first} demands a recount.', fx: { rel: { p: 5, q: -5 } } },
        { label: 'Run a hustings', text: 'The hustings is the best thing you see all term. {q.first} wins on a promise of more toast.', fx: { morale: 5, rel: { p: 1, q: 3 } } },
      ] },
    { id: 'group_chat', emoji: '💬', title: 'The group chat', tags: ['pastoral'], when: { boarding: false }, cast: { p: { role: 'pupil', year: '>=6' } }, weight: 7,
      text: 'The Year 7 group chat has gone sour. {p.first} has been removed and everyone knows why except {p.first}.',
      choices: [
        { label: 'Bring in the pastoral team', text: 'The group chat is shut down. Several parents learn what a group chat is.', fx: { rel: { p: 5 }, karma: 2, rep: 2 } },
        { label: 'Talk to {p.first} first', text: '{p.first} is grateful someone noticed. You keep an eye on it.', fx: { rel: { p: 8 }, karma: 2 } },
      ] },
    { id: 'frozen_out', emoji: '🛏️', title: 'Frozen out', tags: ['boarding', 'pastoral'], when: { boarding: true }, cast: { p: 'boarder' }, weight: 6, cooldown: 12,
      text: '{p.first} is being frozen out of {p.his} dorm. {p.His} bed has been apple-pied every night this week and nobody sits with {p.him} at supper.',
      choices: [
        { label: 'Deal with it properly', text: 'You talk to the dorm, log it, and tell the parents. It takes time, but it stops.', fx: { rel: { p: 12 }, karma: 4, rep: 3, energy: -5 } },
        { label: 'Move {p.first} to another dorm', text: '{p.first} settles in a new dorm. The old one hasn\'t learnt much.', fx: { rel: { p: 6 }, karma: 1 } },
        { label: '"It\'s just banter"', text: 'It is not banter.', fx: { rel: { p: -10 }, karma: -8, schedule: { id: 'bullying_followup', in: 2 } } },
      ] },

    /* ---------- Housemaster / Housemistress ---------- */
    { id: 'hm_doorbell', emoji: '🚪', title: 'The private side', tags: ['housemaster', 'parents'], when: HM, cast: { par: 'parent' }, weight: 10,
      text: '{par} rings your private front door at 9.30pm on a Sunday to drop off a cello and "have a quick word".',
      choices: [
        { label: 'Invite them in', text: 'The quick word lasts an hour. You learn more about the {par.last} family than you wished to.', fx: { rel: { par: 8 }, energy: -4 } },
        { label: 'Take the cello, book a meeting', text: '{par} is polite about it. The cello sits in your hall for a week.', fx: { rel: { par: -2 }, patience: 1 } },
      ] },
    { id: 'hm_kitchen', emoji: '🍞', title: 'In the kitchen', tags: ['housemaster', 'family'], when: { role: 'Housemaster', has: 'partner' }, weight: 8,
      text: '{partner} comes down for breakfast and finds three Year 6s in your kitchen, asking for toast.',
      choices: [
        { label: 'Make toast for everyone', text: '{partner} butters. You make tea. The Year 6s rate it five stars.', fx: { rel: { partner: 3 }, morale: 4 } },
        { label: 'Firmly back to the house side', text: '{partner} appreciates it. The Year 6s are back tomorrow.', fx: { rel: { partner: 5 } } },
      ] },
    { id: 'hm_family_time', emoji: '🕯️', title: 'Living over the shop', tags: ['housemaster', 'family'], when: { role: 'Housemaster', has: 'partner' }, weight: 6, cooldown: 6,
      text: '{partner} points out you have not had a meal together without a knock at the door since September.',
      choices: [
        { label: 'Book a night off', text: 'A deputy covers. You eat in a pub ten miles away and nobody knocks.', fx: { rel: { partner: 10 }, morale: 4, money: -70 } },
        { label: '"After exams, I promise"', text: 'Exams come and go. So does the promise.', fx: { rel: { partner: -8 } } },
      ] },
    { id: 'hm_dog', emoji: '🐕', title: 'A house dog?', tags: ['housemaster'], when: { role: 'Housemaster', not: 'dog' }, weight: 10, once: true,
      text: 'Every good boarding house has a dog. The boys have started leaving pictures of Labradors on your desk.',
      choices: [
        { label: 'Get a Labrador', text: 'Your Labrador arrives. The boys name it before you can.', fx: { flag: 'dog', run: (s, c, P) => { s.flags.dogName = P.pick(s, DOGS); }, morale: 8, money: -900 } },
        { label: 'Get a spaniel', text: 'Your spaniel arrives at speed and has not stopped since.', fx: { flag: 'dog', run: (s, c, P) => { s.flags.dogName = P.pick(s, DOGS); }, morale: 8, money: -900 } },
        { label: 'Not now', text: 'The Labrador pictures continue.', fx: {} },
      ] },
    { id: 'dog_life', emoji: '🐾', title: 'The house dog', tags: ['housemaster'], when: { flags: 'dog' }, setup: dogVars, weight: 9, cooldown: 3,
      outcomes: [
        { w: 1, text: '{dog} steals a Year 7\'s packed lunch on the coach park. The Year 7 is delighted.', fx: { morale: 3 } },
        { w: 1, text: '{dog} sleeps outside the dorm of the most homesick boy in the house. Every night.', fx: { morale: 5, karma: 1 } },
        { w: 1, text: '{dog} runs onto the pitch during the 1st XI match and fields better than the 1st XI.', fx: { morale: 4 } },
        { w: 1, text: '{dog} eats a whole set of Year 8 prep. It is, for once, true.', fx: { morale: 3 } },
      ] },
    { id: 'hm_singing', emoji: '🎤', title: 'House singing', tags: ['housemaster', 'calendar'], when: { role: 'Housemaster', ht: 3 }, weight: 10, cooldown: 5,
      text: 'The house singing competition. Your house has chosen Bohemian Rhapsody, against your advice.',
      choices: [
        { label: 'Rehearse every evening', outcomes: [
          { w: 1, by: { charisma: 0.4 }, text: 'Your house wins. The Galileo section brings the hall down.', fx: { morale: 8, rep: 4, energy: -5 } },
          { w: 1, text: 'Second place to a house that sang Jerusalem. Respectable.', fx: { morale: 2, energy: -5 } } ] },
        { label: 'Let the boys run it', text: 'Chaos. Joyful, tuneless chaos. Last place, best time.', fx: { morale: 5, rel: {} } },
      ] },
  );
})(typeof window !== 'undefined' ? window : globalThis);
