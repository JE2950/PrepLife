/* Round 1: Classroom and Latin */
(function (root) {
  'use strict';
  const D = root.PSL_DATA;
  const TRIPS = ['Fishbourne Roman Palace', "Hadrian's Wall", 'the Roman Baths at Bath', 'the British Museum', 'Boulogne-sur-Mer', 'a Viking village in York', 'the Natural History Museum'];
  const PRIZES = ['the Year 8 Classics prize', 'a book token and a handshake', 'the Headmaster\'s Commendation'];

  D.events.push(
    /* ---------- Disasters ---------- */
    { id: 'vomit', emoji: '🤢', title: 'Code brown (well, orange)', tags: ['classroom'], cast: { p: 'pupil' }, weight: 7,
      text: '{p.first} is sick on the desk, halfway through your explanation of the ablative absolute.',
      choices: [
        { label: 'Evacuate the room and call Matron', text: 'Matron arrives with sawdust and a face like thunder. You lose the lesson.', fx: { energy: -2, rel: { p: 4, matron: 2 } } },
        { label: 'Teach on from the doorway', outcomes: [
          { w: 50, text: 'You finish the lesson from the corridor. Heroic, in a way.', fx: { teaching: 1, rep: 1, morale: -2 } },
          { w: 50, text: 'The smell wins. Two more pupils follow {p.first}\'s lead.', fx: { morale: -5, energy: -3 } } ] },
        { label: 'Turn it into a lesson on Roman feasts', show: { subject: ['Latin', 'Classics', 'History'] }, text: 'You explain the vomitorium myth. Year 6 will never forget it, for the wrong reasons.', fx: { teaching: 2, morale: 3, rel: { p: -3 } } },
      ] },
    { id: 'lost_scripts', emoji: '📂', title: 'Where are the scripts?', tags: ['classroom'], weight: 5, cooldown: 18,
      text: 'You have lost the Year 8 exam scripts. All of them. Reports are due on Friday.',
      choices: [
        { label: 'Tear the building apart', outcomes: [
          { w: 60, by: { organisation: 0.4 }, text: 'You find them in the boot of your car, under a cricket bag.', fx: { energy: -6, morale: 2 } },
          { w: 40, text: 'You search for two days. Nothing. You have to own up anyway.', fx: { energy: -8, rep: -4, morale: -6 } } ] },
        { label: 'Own up to {hod}', show: { has: 'hod' }, text: '{hod} sighs and helps you set a resit. Nobody is pleased, but nobody is lying.', fx: { rep: -2, rel: { hod: 2 }, karma: 2 } },
        { label: 'Give them all the grade you predicted', text: 'Nobody notices. You feel slightly sick for a term.', fx: { karma: -6, morale: -3, flag: 'fudged_marks' } },
      ] },
    { id: 'lost_book', emoji: '📕', title: 'The dog ate it', tags: ['classroom'], cast: { p: { role: 'pupil', type: ['late', 'chatter', 'clueless'] } }, weight: 9,
      text: '{p.first} has lost {p.his} exercise book for the fourth time this term. {p.He} thinks it might be in the Art block. Or Wales.',
      choices: [
        { label: 'Issue a new book, again', text: 'You hand over book number five. {p.first} writes "BOOK 5" on the front with real pride.', fx: { rel: { p: 3 }, patience: 1 } },
        { label: 'Detention to find it', outcomes: [
          { w: 60, text: '{p.first} finds it in the boot room in four minutes. It was there all along.', fx: { rel: { p: -4 }, rep: 1 } },
          { w: 40, text: '{p.first} spends the detention looking and finds three other people\'s books instead.', fx: { rel: { p: -2 }, morale: 2 } } ] },
      ] },
    { id: 'forgot_lesson', emoji: '⏰', title: 'Wait, which lesson?', tags: ['classroom'], cast: { col: 'colleague' }, weight: 6,
      text: 'You are halfway through a coffee in the common room when {col} asks why 6B are sitting in your room on their own.',
      choices: [
        { label: 'Sprint', outcomes: [
          { w: 70, text: 'You arrive red-faced. 6B have rearranged the furniture but nobody has died.', fx: { energy: -3, rep: -1 } },
          { w: 30, text: '{head} is standing in your classroom when you arrive.', fx: { energy: -3, rep: -5, rel: { head: -5 } } } ] },
        { label: 'Blame the new timetable', text: 'Everyone blames the timetable. It works, this time.', fx: { morale: 1, rel: { col: 2 } } },
      ] },
    { id: 'clash', emoji: '📅', title: 'Timetable clash', tags: ['classroom', 'admin'], weight: 7, when: { ht: [0, 2, 4] },
      text: 'The new timetable puts you with Year 5 and Year 7 at the same time, in buildings four hundred metres apart.',
      choices: [
        { label: 'Email the timetabler, politely', outcomes: [
          { w: 60, text: 'Fixed by Thursday. You lose two lessons in the meantime.', fx: { morale: -1 } },
          { w: 40, text: 'The reply says it "should be fine". It is not fine for three weeks.', fx: { morale: -4, energy: -4 } } ] },
        { label: 'Teach both classes in the corridor between', text: 'Peak prep school. The Head walks past and says nothing at all.', fx: { morale: 3, energy: -5, rep: 1 } },
      ] },
    { id: 'miscomm', emoji: '📢', title: 'Nobody told you', tags: ['classroom', 'admin'], weight: 7,
      text: 'You arrive to teach Year 6. Half the class are in Bath on a trip you did not know about. It was in Tuesday\'s bulletin, page nine.',
      outcomes: [
        { w: 50, text: 'You teach the remaining seven pupils a lesson on the trip they are missing. Morale on both sides is low.', fx: { morale: -2 } },
        { w: 50, text: 'You play hangman with the seven who stayed. Best lesson of the week.', fx: { morale: 2 } },
      ] },

    /* ---------- Kit ---------- */
    { id: 'wifi', emoji: '📶', title: 'WiFi down', tags: ['classroom', 'kit'], weight: 8,
      text: 'The WiFi dies at 8.31. Your entire lesson is a Kahoot.',
      choices: [
        { label: 'Chalk and talk, like it\'s 1987', outcomes: [
          { w: 1, by: { teaching: 0.8 }, text: 'You teach from memory on the whiteboard. The pupils are oddly impressed.', fx: { teaching: 2, morale: 2 } },
          { w: 1, by: { teaching: -0.5 }, text: 'You dry up after six minutes and resort to "read chapter three".', fx: { morale: -2 } } ] },
        { label: 'Reading lesson', text: 'Silent reading. Silence lasts four minutes.', fx: { energy: 2 } },
        { label: 'Ring IT', text: 'IT ask if you have tried turning it off and on again. You have. It is the whole school.', fx: { morale: -2 } },
      ] },
    { id: 'board', emoji: '🖥️', title: 'The board', tags: ['classroom', 'kit'], weight: 7,
      outcomes: [
        { w: 1, text: 'Your interactive board shows only a Windows update screen for a full week. You go back to a flip chart.', fx: { morale: -2 } },
        { w: 1, text: 'Your board pen stops working, so you teach by pointing at things and saying "this one".', fx: { morale: -1, teaching: -1 } },
        { w: 1, text: 'A cricket ball comes through the window and cracks your board. Nobody saw anything.', fx: { morale: -1 } },
      ] },
    { id: 'no_email', emoji: '📭', title: 'Email outage', tags: ['kit', 'commonroom'], weight: 4,
      text: 'The school email server is down all day. Staff morale reaches a five-year high.', fx: { morale: 6, energy: 3 } },
    { id: 'fire_test', emoji: '🚨', title: 'Fire alarm', tags: ['classroom'], weight: 6,
      text: 'The fire alarm goes off twenty minutes into the Year 8 mock exam.',
      choices: [
        { label: 'Confiscate the papers and line up', text: 'Out on the field for half an hour. Everyone has now discussed every answer.', fx: { morale: -2 } },
        { label: 'Leave the papers face down', outcomes: [
          { w: 70, text: 'A sensible call. The exam resumes with little fuss.', fx: { organisation: 1 } },
          { w: 30, text: 'Somebody turns over a paper as they leave. A parent emails about "integrity".', fx: { rep: -2, morale: -2 } } ] },
      ] },
    { id: 'flu', emoji: '🤧', title: 'Flu season', tags: ['classroom', 'calendar'], when: { ht: [1, 2] }, weight: 5, cooldown: 12,
      text: 'Flu sweeps the school. A third of the pupils and half the staff are off.',
      choices: [
        { label: 'Cover every gap', text: 'You teach eleven periods a day for a week. The Head mentions you by name in briefing.', fx: { energy: -12, rep: 5, rel: { head: 4 } } },
        { label: 'Dose up and do your own lessons', outcomes: [
          { w: 60, text: 'You get through it on Lemsip and stubbornness.', fx: { energy: -6 } },
          { w: 40, text: 'You catch it on Wednesday and spend a week in bed.', fx: { energy: -4, time: -2, rep: -1 } } ] },
        { label: 'Stay well away from everyone', text: 'You eat lunch in your car all week. It works.', fx: { morale: -2, rel: { head: -2 } } },
      ] },
    { id: 'school_trip', emoji: '🚌', title: 'Trip day', tags: ['classroom', 'trips'], weight: 6, cooldown: 12,
      setup: (s, ctx, P) => { ctx.vars = { trip: P.pick(s, TRIPS) }; },
      text: 'You are on the Year 7 trip to {trip}. The coach leaves at 7am. Someone is already eating crisps.',
      choices: [
        { label: 'Count heads every ten minutes', text: 'Not a single pupil lost. You deserve a medal and get a Mars bar.', fx: { energy: -6, rep: 2, organisation: 1 } },
        { label: 'Relax and enjoy it', outcomes: [
          { w: 65, text: 'A lovely day out. Three pupils buy the same plastic gladius in the gift shop.', fx: { morale: 6, energy: -4 } },
          { w: 35, text: 'You count heads on the coach home and get one fewer. He is in the gift shop.', fx: { rep: -4, morale: -4, energy: -6, count: 'lostChildren' } } ] },
      ] },

    /* ---------- Pastoral in the classroom ---------- */
    { id: 'bullying', emoji: '🛑', title: 'A quiet word', tags: ['classroom', 'pastoral'], cast: { p: 'pupil', q: 'pupil' }, weight: 7,
      text: 'At the end of the lesson {p.first} stays behind and tells you that {q.first} has been making {p.his} life a misery.',
      choices: [
        { label: 'Take it seriously and log it', text: 'You write it up and pass it to the pastoral team. It is dealt with properly.', fx: { rel: { p: 10 }, karma: 3, rep: 2, energy: -2 } },
        { label: 'Sort it out yourself', outcomes: [
          { w: 1, by: { patience: 0.5, charisma: 0.3 }, text: 'You talk to both of them. {q.first} apologises and means it.', fx: { rel: { p: 8, q: 2 }, karma: 3 } },
          { w: 1, text: 'Your chat makes things worse. {p.first}\'s parents are on the phone by Friday.', fx: { rel: { p: -4 }, rep: -4, morale: -3 } } ] },
        { label: '"Just ignore {q.him}"', text: '{p.first} nods and leaves. It is not the right answer.', fx: { rel: { p: -8 }, karma: -6, schedule: { id: 'bullying_followup', in: 2 } } },
      ] },
    { id: 'bullying_followup', manual: true, emoji: '📞', title: 'It came back', cast: { p: 'pupil' },
      text: 'The Head has a phone call from {p.first}\'s parents. They say {p.first} told a teacher weeks ago and nothing happened.',
      choices: [{ label: 'Admit it was you', text: 'You own it. The Head is disappointed but appreciates the honesty.', fx: { rep: -6, morale: -6, karma: 2 } },
        { label: 'Say nothing', text: 'Nobody works out who it was. You know, though.', fx: { karma: -6, morale: -4 } }] },

    /* ---------- Pupil types ---------- */
    { id: 'knowall', emoji: '🤓', title: 'Actually...', tags: ['classroom', 'pupils'], cast: { p: { role: 'pupil', type: 'knowall' } }, weight: 9,
      text: (s) => s.me.subject === 'Latin' || s.me.subject === 'Classics' ? '{p.first} puts {p.his} hand up to tell you it\'s pronounced "Kaiser", actually.' : '{p.first} puts {p.his} hand up to tell you that what you just said is "technically not true".',
      choices: [
        { label: 'Concede gracefully', text: 'You thank {p.first}. {p.He} is unbearable for the rest of the day.', fx: { rel: { p: 5 }, patience: 1 } },
        { label: 'Win the argument', outcomes: [
          { w: 1, by: { teaching: 0.6 }, text: 'You win, with sources. The class gasp. {p.first} will be back.', fx: { rel: { p: -3 }, teaching: 1, morale: 3 } },
          { w: 1, text: '{p.first} was right. {p.He} brings a printout the next day.', fx: { rel: { p: 2 }, morale: -3 } } ] },
      ] },
    { id: 'clueless', emoji: '😶', title: 'From the top', tags: ['classroom', 'pupils'], cast: { p: { role: 'pupil', type: 'clueless' } }, weight: 8,
      text: '{p.first} has been in your set for two years. Today {p.he} asks what a verb is.',
      choices: [
        { label: 'Start again, kindly', text: 'You go back to basics after the lesson. Something lands.', fx: { rel: { p: 8 }, patience: 2, energy: -2, karma: 2 } },
        { label: 'Put them next to a grafter', text: 'You move {p.first} next to someone sensible. It helps a bit.', fx: { rel: { p: 2 }, teaching: 1 } },
        { label: 'Despair quietly', text: 'You stare out of the window for a full minute.', fx: { morale: -3 } },
      ] },
    { id: 'grafter', emoji: '💪', title: 'Above and beyond', tags: ['classroom', 'pupils'], cast: { p: { role: 'pupil', type: ['grafter', 'scholar'] } }, weight: 7,
      text: '{p.first} hands in three extra translations {p.he} did "for fun". They are excellent.',
      choices: [
        { label: 'Send a postcard home', text: 'The postcard goes up on the {p.last} family fridge. {p.first} beams for a week.', fx: { rel: { p: 8 }, morale: 4, karma: 1 } },
        { label: 'Give them even more work', text: '{p.first} is delighted. You have created a monster.', fx: { rel: { p: 4 }, teaching: 1 } },
      ] },
    { id: 'joker', emoji: '🤡', title: 'Comedian', tags: ['classroom', 'pupils'], cast: { p: { role: 'pupil', type: 'joker' } }, weight: 9,
      text: (s) => s.me.subject === 'Latin' || s.me.subject === 'Classics' ? 'You turn back from the board. {p.first} has changed every "amo" on it to "ammo".' : 'You turn back from the board. {p.first} has drawn a moustache on every person in your diagram.',
      choices: [
        { label: 'Laugh, then move on', text: 'You laugh. The class relax. {p.first} has met {p.his} match.', fx: { rel: { p: 6 }, morale: 2 } },
        { label: 'Stony silence', text: 'The silence lasts nine seconds. {p.first} cracks first.', fx: { rel: { p: -3 }, rep: 1 } },
        { label: 'Detention', text: '{p.first} serves it and draws a moustache on you in {p.his} rough book.', fx: { rel: { p: -6 }, count: 'detentions' } },
      ] },
    { id: 'quirky', emoji: '🦄', title: 'Interesting choice', tags: ['classroom', 'pupils'], cast: { p: { role: 'pupil', type: 'quirky' } }, weight: 7,
      outcomes: [
        { w: 1, text: '{p.first} hands in {p.his} homework written in Linear B. It is, as far as you can tell, correct.', fx: { morale: 3 } },
        { w: 1, text: '{p.first} brings a stick insect called Tiberius to every lesson. Tiberius is better behaved than 7C.', fx: { morale: 2 } },
        { w: 1, text: '{p.first} answers every question this week in iambic pentameter.', fx: { morale: 3 } },
      ] },
    { id: 'chatter', emoji: '🗣️', title: 'Talking', tags: ['classroom', 'pupils'], cast: { p: { role: 'pupil', type: 'chatter' } }, weight: 7,
      text: '{p.first} has not stopped talking since the bell. {p.He} is now explaining Minecraft to the radiator.',
      choices: [
        { label: 'Move them to the front', text: '{p.first} now talks to you instead. Progress, of a kind.', fx: { rel: { p: -2 }, patience: 1 } },
        { label: 'Give them a job', text: 'You make {p.first} the official reader. {p.He} reads with feeling and voices.', fx: { rel: { p: 5 }, teaching: 1 } },
      ] },
    { id: 'charmer', emoji: '😇', title: 'Butter wouldn\'t melt', tags: ['classroom', 'pupils'], cast: { p: { role: 'pupil', type: 'charmer' } }, weight: 6,
      text: '{p.first} hasn\'t done the homework but compliments your tie so sincerely that you nearly forget.',
      choices: [
        { label: 'Let it slide', text: 'You let it go. The whole class saw that work. Expect more ties.', fx: { rel: { p: 5 }, rep: -1 } },
        { label: 'Nice try', text: '{p.first} grins, accepts the detention and thanks you for it.', fx: { rel: { p: 1 }, rep: 1, count: 'detentions' } },
      ] },
    { id: 'governor_kid', emoji: '🎩', title: 'A delicate mark', tags: ['classroom', 'pupils', 'parents'], cast: { p: { role: 'pupil', type: 'governor' } }, weight: 6,
      text: '{p.first}\'s father is Chair of Governors. {p.first} has scored 34% in the end-of-term exam.',
      choices: [
        { label: 'Report 34%', outcomes: [
          { w: 60, text: 'The father thanks you for your honesty and books a tutor.', fx: { rep: 3, karma: 3 } },
          { w: 40, text: 'The Head asks to "just have a look at the marking" with you.', fx: { rel: { head: -3 }, morale: -3, karma: 3 } } ] },
        { label: 'Find a few more marks', text: '34% becomes 51%. Nobody says a word. Ever.', fx: { karma: -5, rel: { head: 2 }, flag: 'fudged_marks' } },
        { label: 'Phone home before reports go out', text: 'A calm, honest phone call. The father is grateful for the warning.', fx: { rep: 2, karma: 2, energy: -2 } },
      ] },
    { id: 'worrier', emoji: '😰', title: 'Worried sick', tags: ['classroom', 'pupils', 'pastoral'], cast: { p: { role: 'pupil', type: 'worrier' } }, weight: 6,
      text: '{p.first} has asked you nine times whether the test on Friday "counts".',
      choices: [
        { label: 'Reassure them properly', text: 'You sit down with {p.first} and make a plan. {p.He} sleeps that night.', fx: { rel: { p: 8 }, karma: 2, energy: -1 } },
        { label: '"It doesn\'t matter at all"', text: '{p.first} now worries about why it doesn\'t matter.', fx: { rel: { p: 1 } } },
      ] },
    { id: 'sporty', emoji: '🏉', title: 'Priorities', tags: ['classroom', 'pupils'], cast: { p: { role: 'pupil', type: 'sporty' } }, weight: 6,
      text: '{p.first} asks to leave your lesson early because the U13As are "basically playing for the county".',
      choices: [
        { label: 'Let them go', text: '{p.first} scores two tries. {p.He} has no idea what the lesson was about.', fx: { rel: { p: 6 } } },
        { label: 'Absolutely not', text: '{p.first} stares at the clock for forty minutes.', fx: { rel: { p: -5 }, rep: 1 } },
      ] },

    /* ---------- Howlers ---------- */
    { id: 'howler_latin', emoji: '🏛️', title: 'Howler', tags: ['classroom', 'latin'], when: { subject: ['Latin', 'Classics'] }, cast: { p: 'pupil' }, weight: 12, cooldown: 3,
      outcomes: [
        { w: 1, text: '{p.first} translates "puella agricolam amat" as "the farmer ate the girl".', fx: { morale: 3 } },
        { w: 1, text: '{p.first} translates "veni, vidi, vici" as "I came, I saw, I conquered Vicky".', fx: { morale: 3 } },
        { w: 1, text: '{p.first} translates "cave canem" as "I am a dog, beware".', fx: { morale: 2 } },
        { w: 1, text: '{p.first} writes that "nauta" means "naughty". In fairness, some sailors were.', fx: { morale: 2 } },
        { w: 1, text: '{p.first} translates "in vino veritas" as "there is a very tasty wine".', fx: { morale: 3 } },
        { w: 1, text: '{p.first} confidently translates "mensa" as "I am a man".', fx: { morale: 2 } },
        { w: 1, text: '{p.first} writes that Hannibal crossed the Alps "with elephants, who were tired".', fx: { morale: 2 } },
        { w: 1, text: '{p.first} translates "servus" as "a waiter at a Roman Pizza Express".', fx: { morale: 3 } },
        { w: 1, text: '{p.first} parses "est" as "the opposite of west".', fx: { morale: 3 } },
        { w: 1, text: '{p.first} translates "Caesar\'s legions" as "Caesar\'s lemons". It changes the whole battle.', fx: { morale: 3 } },
      ] },
    { id: 'howler_french', emoji: '🥖', title: 'Howler', tags: ['classroom', 'french'], when: { subject: ['French', 'Spanish'] }, cast: { p: 'pupil' }, weight: 12, cooldown: 3,
      outcomes: [
        { w: 1, text: '{p.first} translates "j\'ai faim" as "I am famous".', fx: { morale: 3 } },
        { w: 1, text: '{p.first} translates "je m\'appelle" as "I phone myself".', fx: { morale: 2 } },
        { w: 1, text: '{p.first} tells the French assistant that {p.his} father is a fish. {p.He} meant "a fishmonger".', fx: { morale: 3 } },
        { w: 1, text: '{p.first} writes that "librairie" means library and refuses to believe you.', fx: { morale: 1 } },
        { w: 1, text: '{p.first} orders "un croissant avec du jambon de la piscine".', fx: { morale: 3 } },
      ] },
    { id: 'howler_general', emoji: '✏️', title: 'Howler', tags: ['classroom'], when: { test: s => !['Latin', 'Classics', 'French', 'Spanish'].includes(s.me.subject) }, cast: { p: 'pupil' }, weight: 10, cooldown: 3,
      outcomes: [
        { w: 1, text: 'In the {subject} test, {p.first} writes "Henry VIII" as the answer to every question. Twice it is correct.', fx: { morale: 2 } },
        { w: 1, text: '{p.first} labels the diagram "a sort of shape". You give a mark for honesty.', fx: { morale: 2 } },
        { w: 1, text: '{p.first} writes that Magna Carta was signed by King John\'s dog.', fx: { morale: 3 } },
      ] },

    /* ---------- Wins ---------- */
    { id: 'lightbulb', emoji: '💡', title: 'The lightbulb', tags: ['classroom', 'win'], cast: { p: { role: 'pupil', type: ['clueless', 'worrier', 'late', 'chatter'] } }, weight: 8,
      text: '{p.first}, who has struggled all year, gets every question right and looks up at you, astonished.', fx: { morale: 8, teaching: 1, rel: { p: 6 } } },
    { id: 'thank_you', emoji: '✉️', title: 'A letter', tags: ['classroom', 'win', 'parents'], cast: { par: 'parent' }, weight: 6,
      text: 'A handwritten letter from {par}: "{par.child} has started reading {subject} books in bed. Thank you." You put it in the drawer you keep for bad days.', fx: { morale: 9, rel: { par: 4 }, count: 'letters' } },
    { id: 'scholarship', emoji: '📜', title: 'Scholarship', tags: ['classroom', 'win'], when: { ht: [2, 3], stat: { years: '>=1' } }, cast: { p: { role: 'pupil', year: '>=7' } }, weight: 6, cooldown: 6,
      text: '{p.full} sits the {senior} scholarship papers this week and asks for extra help with {subject}.',
      choices: [
        { label: 'Daily sessions before breakfast', outcomes: [
          { w: 1, by: { teaching: 0.8 }, text: '{p.first} wins an academic scholarship to {senior}. {p.He} thanks you first.', fx: { rep: 8, morale: 10, energy: -8, rel: { p: 10 }, count: 'scholarships' } },
          { w: 1, text: '{p.first} misses out by a whisker. {p.He} still gets in. You are gutted for {p.him}.', fx: { energy: -8, morale: -4, rel: { p: 5 } } } ] },
        { label: 'A couple of past papers', outcomes: [
          { w: 1, by: { teaching: 0.6 }, text: '{p.first} wins an exhibition to {senior}. Not bad at all.', fx: { rep: 4, morale: 5, count: 'scholarships' } },
          { w: 1, text: 'No award this time. {p.first} shrugs it off better than you do.', fx: { morale: -2 } } ] },
      ] },

    /* ---------- Observation and scrutiny ---------- */
    { id: 'dropin', emoji: '🚪', title: 'Three minutes', tags: ['classroom', 'observation'], when: { has: 'head', maxRank: 2 }, weight: 8,
      outcomes: [
        { w: 1, by: { teaching: 0.5 }, text: '{head} walks in, watches for three minutes and leaves. You later hear the words "very impressive".', fx: { rep: 3, rel: { head: 3 } } },
        { w: 1, text: '{head} walks in for three minutes, during the only three minutes this term you have shown a video.', fx: { rep: -2, morale: -3 } },
        { w: 1, text: '{head} walks in, picks up a book, frowns at it and walks out. You never find out why.', fx: { morale: -2 } },
      ] },
    { id: 'scrutiny', emoji: '🖊️', title: 'Book scrutiny week', tags: ['classroom', 'observation'], weight: 7, cooldown: 12,
      text: '{slt} will look at a sample of exercise books on Friday. The marking policy needs three colours of pen.',
      choices: [
        { label: 'Performative marking, all three colours', text: 'Green for praise, purple for "next steps", red for the pupils\' replies to your next steps. It takes four evenings.', fx: { energy: -10, rep: 4, rel: { slt: 4 }, morale: -3 } },
        { label: 'Mark as you always do', outcomes: [
          { w: 1, by: { organisation: 0.6 }, text: 'Your books are honest and tidy. {slt} has no complaints.', fx: { rep: 1 } },
          { w: 1, text: '{slt} notes "inconsistent use of the purple pen". It goes on your file.', fx: { rep: -3, morale: -3, rel: { slt: -2 } } } ] },
        { label: 'Hide the worst books', text: 'Four books go on a quick holiday to your car. Nobody asks.', fx: { karma: -3, morale: 1 } },
      ] },
    { id: 'critical_slt', emoji: '📝', title: 'Feedback', tags: ['classroom', 'observation'], weight: 7, when: { has: 'slt', maxRank: 2 },
      text: '{slt} observes your lesson and sends fourteen action points. Number nine is "smile more". The lesson went well.',
      choices: [
        { label: 'Thank them and implement it all', text: 'You smile so much in the next lesson that a pupil asks if you are all right.', fx: { rel: { slt: 5 }, morale: -4, teaching: 1 } },
        { label: 'Ask for one positive', outcomes: [
          { w: 1, by: { charisma: 0.5 }, text: '{slt} pauses and says your questioning was "actually very good". Progress.', fx: { rel: { slt: 2 }, morale: 3 } },
          { w: 1, text: '{slt} says positives are "implied". You leave the meeting older.', fx: { rel: { slt: -4 }, morale: -4 } } ] },
        { label: 'Take it to {hod}', show: { has: 'hod' }, text: '{hod} reads the feedback, laughs and tells you not to worry.', fx: { rel: { hod: 4, slt: -3 }, morale: 2 } },
      ] },
    { id: 'why_different', emoji: '🙊', title: 'Blown cover', tags: ['classroom', 'observation'], cast: { p: { role: 'pupil', type: ['knowall', 'joker', 'chatter'] } }, weight: 6,
      text: 'With an observer at the back, {p.first} asks loudly, "Why are we doing group work? We never do group work."', fx: { rep: -2, morale: -3 } },
    { id: 'mock_inspection', emoji: '🔎', title: 'Mock inspection', tags: ['observation', 'calendar'], when: { has: 'slt' }, weight: 4, cooldown: 18,
      text: 'SLT announce a mock inspection "to keep everyone on their toes". You are on your toes. Your toes are tired.',
      choices: [
        { label: 'Play the game', text: 'You put a learning objective on the board in three colours and laminate a seating plan.', fx: { energy: -6, rep: 3 } },
        { label: 'Carry on as normal', outcomes: [
          { w: 1, by: { teaching: 0.6 }, text: 'Normal is good enough. You get a "good with outstanding features".', fx: { rep: 2, morale: 2 } },
          { w: 1, text: 'Your seating plan is "out of date". It is recorded.', fx: { rep: -2 } } ] },
      ] },
    { id: 'inspection_rumour', emoji: '🪴', title: 'Rumours', tags: ['observation'], weight: 4,
      text: 'Rumours of an inspection. New pot plants appear in reception and someone has cleaned the staff fridge.', fx: { morale: -1 } },
  );
})(typeof window !== 'undefined' ? window : globalThis);
