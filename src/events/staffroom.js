/* Round 4: Common room, SLT, senior roles, calendar set pieces */
(function (root) {
  'use strict';
  const D = root.PSL_DATA;

  D.events.push(
    /* ---------- Common room ---------- */
    { id: 'staff_meeting', emoji: '🪑', title: 'Staff meeting', tags: ['commonroom'], weight: 9,
      text: 'Monday staff meeting. Item one of fourteen: the placement of the new recycling bins.',
      choices: [
        { label: 'Contribute thoughtfully', text: 'Your point about the bins is minuted. Your point about workload is not.', fx: { rep: 1, energy: -2 } },
        { label: 'Mark under the table', outcomes: [
          { w: 1, text: 'You get through a whole set of books. Nobody notices.', fx: { energy: 2, organisation: 1 } },
          { w: 1, text: 'The Head asks your view on item nine while you are writing "see me".', fx: { rep: -2, morale: -2 } } ] },
        { label: 'Ask "Could this have been an email?"', text: 'Half the room silently loves you. The other half run the meeting.', fx: { morale: 3, rel: { head: -3 } } },
      ] },
    { id: 'inset', emoji: '🎓', title: 'INSET day', tags: ['commonroom', 'calendar'], when: { ht: [0, 2, 4] }, weight: 8, cooldown: 3,
      outcomes: [
        { w: 1, text: 'INSET on "metacognition" from a consultant who has never taught. You learn the word "metacognition".', fx: { morale: -2 } },
        { w: 1, text: 'INSET is first aid training. You practise CPR on a dummy called Annie and the Head of Maths faints.', fx: { morale: 3 } },
        { w: 1, text: 'INSET on safeguarding, which is useful, followed by a talk on the new photocopier, which is not.', fx: { teaching: 1 } },
        { w: 1, text: 'INSET ends early. The whole staff go to the pub at 2.45pm on a Tuesday.', fx: { morale: 6 } },
      ] },
    { id: 'appraisal', emoji: '🗂️', title: 'Appraisal', tags: ['commonroom', 'career'], when: { maxRank: 3 }, weight: 6, cooldown: 6,
      text: 'Your annual appraisal. You must set three SMART targets.',
      choices: [
        { label: 'Ambitious targets', outcomes: [
          { w: 1, by: { ambition: 0.5 }, text: 'Your targets impress the panel. Now you have to meet them.', fx: { rep: 3, ambition: 3, energy: -2 } },
          { w: 1, text: 'You miss all three by summer. The review is awkward.', fx: { rep: -2, morale: -3 } } ] },
        { label: 'Targets you have already met', text: 'You hit every target. It is, technically, allowed.', fx: { morale: 2, karma: -1 } },
      ] },
    { id: 'kettle', emoji: '🫖', title: 'Common room politics', tags: ['commonroom'], cast: { col: 'colleague', c2: 'colleague' }, weight: 8,
      outcomes: [
        { w: 1, text: '{col} and {c2} have not spoken since an incident with a shared lasagne in 2019. You have to sit between them at lunch.', fx: { morale: -1 } },
        { w: 1, text: 'A notice appears on the fridge: "Whoever took my yoghurt, I know who you are." Signed {col}. It was {c2}.', fx: { morale: 2 } },
        { w: 1, text: '{col} has started a staff book club. The book is eight hundred pages long and about whaling.', fx: { morale: 1 } },
        { w: 1, text: 'The common room crossword is finished by 8.20am. {col} is suspected of using an app.', fx: { morale: 1 } },
      ] },
    { id: 'staff_cricket', emoji: '🏏', title: 'Staff v Pupils', tags: ['commonroom', 'sport'], when: { ht: 5 }, weight: 7, cooldown: 5,
      text: 'The annual Staff v 1st XI cricket match. The staff side has an average age of fifty-one and one working knee.',
      choices: [
        { label: 'Open the batting', outcomes: [
          { w: 1, text: 'You score a gritty twenty-three. The staff lose by a hundred, with honour.', fx: { morale: 5, rep: 2 } },
          { w: 1, text: 'Out first ball to a Year 8 leg-spinner. The whole school sees it.', fx: { morale: -2, rep: -1 } } ] },
        { label: 'Umpire, in a straw hat', text: 'You give the Head out LBW. It is plumb. It is also career-limiting.', fx: { morale: 4, rel: { head: -3 }, karma: 2 } },
      ] },
    { id: 'leaving_do', emoji: '🥂', title: 'A leaving do', tags: ['commonroom'], when: { ht: 5 }, cast: { col: 'colleague' }, weight: 6,
      text: '{col} is leaving after eleven years. The common room asks you to give the speech.',
      choices: [
        { label: 'Funny speech', outcomes: [
          { w: 1, by: { charisma: 0.6 }, text: 'The speech kills. {col} cries laughing and the Head asks for a copy.', fx: { rep: 4, morale: 5, rel: { col: 10 } } },
          { w: 1, text: 'Your joke about the 2022 Year 8 trip lands badly. The governors were there.', fx: { rep: -3, morale: -3 } } ] },
        { label: 'Short and heartfelt', text: 'Two minutes. Not a dry eye in the common room.', fx: { rep: 2, rel: { col: 8 }, karma: 1 } },
      ] },
    { id: 'cover_slip', emoji: '📝', title: 'Cover', tags: ['commonroom'], weight: 7,
      text: 'You check the cover board. You are covering your only free period, for the third time this week, for a colleague on a course about wellbeing.', fx: { energy: -3, morale: -3 } },
    { id: 'bursar_stapler', emoji: '💼', title: 'The Bursar', tags: ['commonroom'], when: { has: 'bursar' }, weight: 6,
      outcomes: [
        { w: 1, text: '{bursar} asks you to justify, in writing, the purchase of a stapler.', fx: { morale: -2 } },
        { w: 1, text: '{bursar} turns the heating off on 1 April, as tradition demands. It snows on 2 April.', fx: { morale: -2, energy: -1 } },
        { w: 1, text: '{bursar} finds money in the budget for new classroom chairs. You suspect a miracle.', fx: { morale: 4 } },
      ] },

    /* ---------- Parents' evening, open day, admissions ---------- */
    { id: 'parents_evening', emoji: '🕖', title: 'Parents\' evening', tags: ['parents', 'calendar'], when: { ht: [1, 3] }, cast: { par: 'parent' }, weight: 9, cooldown: 3,
      text: 'Parents\' evening. Five minutes per family. {par} has brought a list, and a lawyer\'s posture.',
      choices: [
        { label: 'Stick to five minutes', text: 'You stand at minute five. {par} remains seated. A queue forms.', fx: { rel: { par: -3 }, energy: -4 } },
        { label: 'Hear them out', text: 'Twenty-five minutes. {par} leaves happy. The queue does not.', fx: { rel: { par: 8 }, energy: -6, rep: -1 } },
        { label: 'Lead with a positive', outcomes: [
          { w: 1, by: { charisma: 0.5 }, text: 'Your opening praise for {par.child} disarms {par} completely.', fx: { rel: { par: 6 }, energy: -4 } },
          { w: 1, text: '{par} says {par.he} "didn\'t come here for compliments".', fx: { rel: { par: -2 }, energy: -4 } } ] },
      ] },
    { id: 'open_day', emoji: '🏰', title: 'Open morning', tags: ['calendar', 'admissions'], when: { ht: [0, 4] }, weight: 7, cooldown: 3,
      text: 'Open morning. You must show prospective parents your classroom and look delighted for four hours.',
      choices: [
        { label: 'Full show', outcomes: [
          { w: 1, by: { charisma: 0.5 }, text: 'Two families sign up on the spot and mention you by name.', fx: { rep: 4, energy: -4, rel: { head: 4 } } },
          { w: 1, text: 'A prospective child knocks over your Roman legionary model. You smile through it.', fx: { energy: -4 } } ] },
        { label: 'Hand out leaflets in the porch', text: 'You hand out leaflets and talk to a nice grandmother about the weather.', fx: { energy: -1 } },
      ] },

    /* ---------- Calendar set pieces ---------- */
    { id: 'remembrance', emoji: '🌺', title: 'Remembrance', tags: ['calendar'], when: { ht: 1 }, weight: 9, cooldown: 5,
      text: 'The two-minute silence on the front lawn. Three hundred children, completely still. A bugler from Year 8 plays the Last Post, nearly perfectly.', fx: { morale: 3, karma: 1 } },
    { id: 'nativity', emoji: '🐑', title: 'Nativity', tags: ['calendar'], when: { ht: 1 }, weight: 7, cooldown: 5,
      outcomes: [
        { w: 1, text: 'In the pre-prep nativity a sheep pushes Mary off the stage. The front row parents do not stop filming.', fx: { morale: 4 } },
        { w: 1, text: 'The innkeeper, aged five, improvises: "Yes, loads of room!" The plot collapses. It is wonderful.', fx: { morale: 5 } },
      ] },
    { id: 'founders', emoji: '🎖️', title: 'Founder\'s Day', tags: ['calendar'], when: { ht: 4 }, weight: 6, cooldown: 5,
      text: 'Founder\'s Day. Gowns are worn. An old boy aged ninety-two speaks for forty minutes about a cricket match in 1947.',
      choices: [
        { label: 'Hang on every word', text: 'You listen, rapt. He finds you afterwards and gives you his tie.', fx: { morale: 3, karma: 1 } },
        { label: 'Discreet nap in the back row', outcomes: [
          { w: 1, text: 'Nobody notices.', fx: { energy: 3 } },
          { w: 1, text: 'You snore during the bit about the winning catch.', fx: { rep: -2, energy: 3 } } ] },
      ] },
    { id: 'leavers_dinner', emoji: '🍾', title: 'Leavers\' dinner', tags: ['calendar'], when: { ht: 5 }, cast: { p: { role: 'pupil', year: 8 } }, weight: 9, cooldown: 5,
      text: 'The Year 8 leavers\' dinner. {p.first} stands up to give a speech about the staff and gets to you.',
      outcomes: [
        { w: 1, byRel: { p: 1 }, text: '{p.first} calls you "the reason I like {subject}". You need a moment on the terrace.', fx: { morale: 10, karma: 1 } },
        { w: 1, byRel: { p: -0.5 }, text: '{p.first} does an impression of you. It is horribly accurate. The room is in pieces.', fx: { morale: 4 } },
      ] },
    { id: 'reports_season', emoji: '📑', title: 'Reports', tags: ['calendar', 'admin'], when: { ht: [1, 5] }, weight: 9, cooldown: 3,
      text: 'Reports season. Ninety reports due by Friday. The system logs you out every eleven minutes.',
      choices: [
        { label: 'Write them all properly', text: 'Ninety thoughtful reports. You see the sunrise twice.', fx: { energy: -10, rep: 4 } },
        { label: 'A good bank of comments', outcomes: [
          { w: 1, by: { organisation: 0.5 }, text: 'Your comment bank is efficient and nobody can tell.', fx: { energy: -4, rep: 1 } },
          { w: 1, text: 'A parent spots that two siblings\' reports are identical, down to the typo.', fx: { energy: -3, rep: -4 } } ] },
      ] },

    /* ---------- Head of Department ---------- */
    { id: 'hod_newbie', emoji: '🐣', title: 'Your new teacher', tags: ['career', 'hod'], when: { role: 'HoD' }, weight: 8, cooldown: 12,
      text: 'Your department\'s new ECT is lovely, keen and drowning. She asks if it gets easier.',
      choices: [
        { label: 'Mentor her properly', text: 'Weekly coffee, shared resources and a lot of reassurance. She stays, and thrives.', fx: { energy: -4, rep: 4, karma: 3 } },
        { label: '"Yes, about year five"', text: 'She laughs, then realises you are serious.', fx: { morale: 1 } },
      ] },
    { id: 'hod_results', emoji: '📈', title: 'Department results', tags: ['career', 'hod'], when: { role: 'HoD', ht: 5 }, weight: 10, cooldown: 5,
      outcomes: [
        { w: 1, by: { teaching: 0.6 }, text: 'Your department\'s CE results are the best in the school. The Head reads them out in the staff meeting.', fx: { rep: 6, morale: 6 } },
        { w: 1, text: 'Results are fine but down on last year. You are asked for "a short written analysis".', fx: { rep: -2, energy: -3 } },
      ] },
    { id: 'hod_scheme', emoji: '🗃️', title: 'New syllabus', tags: ['career', 'hod'], when: { role: 'HoD' }, weight: 6, cooldown: 18,
      text: 'The exam board announces a new syllabus. Every scheme of work, every resource, every test needs rewriting by September.',
      choices: [
        { label: 'Rewrite it all yourself', text: 'Your summer goes. The new schemes are superb.', fx: { energy: -12, rep: 6, teaching: 2 } },
        { label: 'Share it out', outcomes: [
          { w: 1, by: { charisma: 0.5 }, text: 'Your department pull together. Done by July.', fx: { energy: -4, rep: 4 } },
          { w: 1, text: 'Half the department miss the deadline. You do their bits in August.', fx: { energy: -10, morale: -4 } } ] },
      ] },

    /* ---------- Director of Studies ---------- */
    { id: 'dos_timetable', emoji: '🧩', title: 'The timetable', tags: ['career', 'slt'], when: { role: 'DoS', ht: [4, 5] }, weight: 12, cooldown: 5,
      text: 'You are building next year\'s timetable. It is a puzzle with forty pieces, no picture on the box, and the Head of Games.',
      choices: [
        { label: 'Lock yourself away for a week', outcomes: [
          { w: 1, by: { organisation: 0.8 }, text: 'A perfect timetable. Not one clash. Colleagues bring you cake.', fx: { rep: 8, energy: -10 } },
          { w: 1, text: 'You find a clash on 2 September. Eleven people find it on 3 September.', fx: { rep: -4, energy: -10, morale: -4 } } ] },
        { label: 'Give Games every Wednesday afternoon', text: 'Games are delighted. Every academic department writes to you.', fx: { rep: -2, morale: -2 } },
      ] },
    { id: 'dos_data', emoji: '📊', title: 'Data drop', tags: ['career', 'slt'], when: { role: 'DoS' }, weight: 8,
      text: 'The termly data drop is due. Three departments have not entered a single grade.',
      choices: [
        { label: 'Chase them, politely', text: 'Two comply. One replies "data is a construct".', fx: { energy: -3, morale: -2 } },
        { label: 'Fill the gaps yourself from last year', text: 'Nobody notices. The trend line is suspiciously flat.', fx: { karma: -2, energy: -2 } },
      ] },

    /* ---------- Deputy Head ---------- */
    { id: 'dep_cover', emoji: '🚑', title: '7.02am', tags: ['career', 'slt'], when: { role: 'Deputy' }, weight: 10,
      text: 'Five staff call in sick by 7.02am. You have cover to arrange, a trip leaving at 8 and an assembly to give.',
      choices: [
        { label: 'Teach two of the lessons yourself', text: 'You teach Year 4 French and Year 7 Science. Both go better than expected.', fx: { energy: -6, rep: 4 } },
        { label: 'Merge classes into the hall', text: 'Ninety children watch a nature documentary. Order is maintained, just.', fx: { energy: -2, rep: -1 } },
      ] },
    { id: 'dep_discipline', emoji: '⚖️', title: 'Serious incident', tags: ['career', 'slt', 'pastoral'], when: { role: 'Deputy' }, cast: { p: 'pupil', par: 'parent' }, weight: 7,
      text: 'A serious incident in the boot room. You must decide the sanction. One family has already rung a solicitor.',
      choices: [
        { label: 'Investigate fully, then decide', text: 'Three days of statements. A fair outcome that everyone can live with.', fx: { energy: -8, rep: 5, karma: 2 } },
        { label: 'Decide quickly and firmly', outcomes: [
          { w: 1, text: 'Quick and correct. The school breathes again.', fx: { rep: 3 } },
          { w: 1, text: 'Quick and wrong. You spend a month unwinding it.', fx: { rep: -6, energy: -6, morale: -5 } } ] },
      ] },
    { id: 'dep_head_away', emoji: '🗝️', title: 'In charge', tags: ['career', 'slt'], when: { role: 'Deputy' }, weight: 6, cooldown: 12,
      text: 'The Head is away for a week. You are in charge. On Monday, the boiler explodes.',
      choices: [
        { label: 'Keep the school open', outcomes: [
          { w: 1, by: { organisation: 0.5 }, text: 'Blankets, hot drinks and a camping stove in the kitchens. The Head returns to a legend.', fx: { rep: 8, energy: -8 } },
          { w: 1, text: 'A parent posts a photo of children in coats in class. It is in the local paper.', fx: { rep: -5, energy: -6 } } ] },
        { label: 'Close the school for two days', text: 'Sensible. Fifty parents email to ask about the fees.', fx: { rep: 1, energy: -2, morale: -2 } },
      ] },

    /* ---------- Head ---------- */
    { id: 'head_governors', emoji: '🏛️', title: 'Governors', tags: ['career', 'head'], when: { role: 'Head' }, weight: 10, cooldown: 3,
      text: 'The termly governors\' meeting. The Chair wants to talk about fees, numbers and why the website has a typo on it.',
      choices: [
        { label: 'Present a bold plan', outcomes: [
          { w: 1, by: { charisma: 0.5, rep: 0.3 }, text: 'The governors back you to the hilt.', fx: { rep: 6, morale: 6 } },
          { w: 1, text: 'The governors ask for "more detail" until after midnight.', fx: { energy: -8, morale: -4 } } ] },
        { label: 'Reassure and steady the ship', text: 'A calm meeting. The Chair takes you for lunch.', fx: { rep: 2, morale: 2 } },
      ] },
    { id: 'head_numbers', emoji: '📉', title: 'Numbers', tags: ['career', 'head'], when: { role: 'Head', ht: [2, 3] }, weight: 9, cooldown: 6,
      text: 'The Registrar brings next year\'s numbers. Year 3 entry is down by eleven pupils.',
      choices: [
        { label: 'Launch a marketing push', text: 'New brochures, a video with a drone, and a "taster day". Numbers recover. The Bursar winces at the bill.', fx: { money: 0, rep: 4, energy: -6, rel: { bursar: -6 } } },
        { label: 'Visit every local nursery yourself', text: 'Forty nurseries in six weeks. You become very good at singing Wind the Bobbin Up.', fx: { rep: 5, energy: -10, karma: 1 } },
        { label: 'Hold your nerve', outcomes: [
          { w: 1, text: 'Late joiners fill the gap by September. Phew.', fx: { morale: 4 } },
          { w: 1, text: 'The gap stays. The governors ask pointed questions.', fx: { rep: -6, morale: -5 } } ] },
      ] },
    { id: 'head_complaint', emoji: '✉️', title: 'Formal complaint', tags: ['career', 'head', 'parents'], when: { role: 'Head' }, cast: { par: 'parent' }, weight: 8,
      text: '{par} lodges a formal complaint about the Year 6 tennis team selection. It runs to eleven pages, with appendices.',
      choices: [
        { label: 'Meet in person', outcomes: [
          { w: 1, by: { charisma: 0.6 }, text: 'Forty minutes, a cup of tea, and {par} withdraws the complaint.', fx: { rel: { par: 8 }, rep: 2 } },
          { w: 1, text: '{par} records the meeting on {par.his} phone and escalates to the governors.', fx: { rel: { par: -8 }, morale: -5, energy: -4 } } ] },
        { label: 'Follow the policy to the letter', text: 'Stage one, stage two, stage three. It takes a term. The policy holds.', fx: { energy: -6, rep: 1 } },
      ] },
    { id: 'head_speech', emoji: '🎤', title: 'Speech Day address', tags: ['career', 'head', 'calendar'], when: { role: 'Head', ht: 5 }, weight: 12, cooldown: 5,
      text: 'Your Speech Day address. Eight hundred people in a marquee. A wasp is circling the lectern.',
      choices: [
        { label: 'Stirring and visionary', outcomes: [
          { w: 1, by: { charisma: 0.7 }, text: 'A standing ovation. The local paper prints a quote.', fx: { rep: 8, morale: 8 } },
          { w: 1, text: 'The wasp lands on your notes at the climax. You hit it with the Chair of Governors\' order of service.', fx: { morale: 3, rep: 1 } } ] },
        { label: 'Short, warm and funny', text: 'Eight minutes. The shortest Speech Day speech in living memory. Universally loved.', fx: { rep: 5, morale: 6 } },
      ] },
    { id: 'head_lonely', emoji: '🕯️', title: 'At the top', tags: ['career', 'head'], when: { role: 'Head' }, weight: 5, cooldown: 12,
      text: 'You realise the common room goes quiet when you walk in. It used to be you making them laugh.', fx: { morale: -5 } },
    { id: 'head_hambrook_board', emoji: '💼', title: 'The Board', tags: ['career', 'head', 'school'], when: { role: 'Head', school: 'hambrook' }, weight: 8, cooldown: 6,
      text: 'The Hambrook board want "a growth strategy for the brand", including a satellite school in Dubai.',
      choices: [
        { label: 'Champion it', text: 'You fly to Dubai twice in a term. The common room stops recognising you.', fx: { rep: 6, energy: -10, morale: -3 } },
        { label: 'Push back', outcomes: [
          { w: 1, by: { charisma: 0.5 }, text: 'You persuade the board to invest in the school you already have.', fx: { rep: 4, morale: 6, karma: 2 } },
          { w: 1, text: 'The board thank you for your input and proceed anyway.', fx: { morale: -6 } } ] },
      ] },
    { id: 'head_mudders_dog', emoji: '🐕', title: 'The Head\'s dog', tags: ['career', 'head', 'school'], when: { role: 'Head', school: 'mudgrove' }, weight: 8, cooldown: 6,
      text: 'At Mudders, the Head walks the dogs round the lake every morning. The boys now ask you about their problems on the walk.', fx: { morale: 6, karma: 2, rep: 2 } },
  );
})(typeof window !== 'undefined' ? window : globalThis);
