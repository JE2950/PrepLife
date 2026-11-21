/* Prep School Life — content. Everything here is data the engine reads.
   Event library lives at the bottom: add new events to PSL_DATA.events. */
(function (root) {
  'use strict';
  const D = root.PSL_DATA = {};
  // harder interviews for senior posts
  // Hambrook quietly rewards the pew; non-churchgoers are slightly penalised there
  const RANKPEN = (s, ctx, P) => -P.ROLES[ctx.target].rank * 11 + (s.school.id === 'hambrook' && !(ctx.newSchool) ? Math.min(30, (s.counters.pews || 0) * 1.5) - 8 : 0);

  /* ---------- The four schools ---------- */
  D.schools = [
    { id: 'mudgrove', name: 'Mudgrove', nick: 'Mudders', town: 'in the Berkshire woods', boarding: true, gender: 'boys', prestige: 4,
      blurb: 'Small, old-fashioned and close-knit. Handbells, Latin grace, a brilliant Head. Everyone is on the same team.',
      grudge: 'Hambrook', mods: { payX: 0.96, moraleBase: 7, headRel: 70, staffRel: 62, vacX: 0.7, drainX: 1.0 } },
    { id: 'hambrook', name: 'Hambrook', nick: 'Hambrook', town: 'near Ascot', boarding: true, gender: 'co-ed', prestige: 5,
      blurb: 'Shiny, polished, famous parents. A Head who runs it like a CEO and an SLT barely keeping afloat.',
      grudge: 'Mudgrove', mods: { payX: 1.08, moraleBase: -6, headRel: 35, headDrift: 35, staffRel: 47, vacX: 1.2, drainX: 1.08 } },
    { id: 'thornbury', name: 'Thornbury Court', nick: 'Thornbury', town: 'on the Wiltshire Downs', boarding: true, gender: 'co-ed', prestige: 3,
      blurb: 'Sport first, second and third. The Head of Games has more power than the Head.',
      grudge: 'Pelham Grange', mods: { payX: 1.0, moraleBase: 0, headRel: 50, staffRel: 52, vacX: 1.0, drainX: 1.05 } },
    { id: 'larkspur', name: 'Larkspur House', nick: 'Larkspur', town: 'in leafy Surrey', boarding: false, gender: 'co-ed', prestige: 2,
      blurb: 'Progressive day school. First names, forest school, restorative circles, no detentions.',
      grudge: "St Hubert's", mods: { payX: 0.92, moraleBase: 3, headRel: 55, staffRel: 55, vacX: 0.9, drainX: 0.9 } },
  ];

  /* ---------- Pupil types ---------- */
  D.pupilTypes = [
    { id: 'knowall', label: 'Know-it-all' }, { id: 'clueless', label: 'Clueless' }, { id: 'grafter', label: 'Grafter' },
    { id: 'joker', label: 'Class joker' }, { id: 'late', label: 'Late and disorganised' }, { id: 'quirky', label: 'Quirky' },
    { id: 'worrier', label: 'Worrier' }, { id: 'sporty', label: 'Lives for games' }, { id: 'chatter', label: 'Chatterbox' },
    { id: 'charmer', label: 'Charmer' }, { id: 'governor', label: 'Parent is a governor' }, { id: 'scholar', label: 'Scholar' },
  ];

  D.subjects = ['Latin', 'French', 'Maths', 'English', 'Science', 'History', 'Geography', 'Classics', 'Spanish', 'Music', 'Art', 'Computing', 'Drama', 'RS', 'Games'];

  D.names = {
    men: ['James', 'Tom', 'Charlie', 'Will', 'Ed', 'Rupert', 'Nick', 'Ben', 'Hugh', 'Simon', 'Rob', 'Giles', 'Matt', 'Olly', 'Alex', 'Sam', 'Jonty', 'Piers', 'Andrew', 'Dan'],
    women: ['Sophie', 'Kate', 'Lucy', 'Emma', 'Harriet', 'Becky', 'Clare', 'Jess', 'Annabel', 'Pippa', 'Sarah', 'Fran', 'Georgie', 'Alice', 'Helen', 'Rachel', 'Camilla', 'Laura', 'Imogen', 'Jo'],
    boys: ['Hugo', 'Freddie', 'Archie', 'Arthur', 'Rafe', 'Monty', 'Kit', 'Barnaby', 'Ollie', 'Wilf', 'Teddy', 'Alfie', 'George', 'Hector', 'Jasper', 'Max', 'Inigo', 'Ludo', 'Felix', 'Toby', 'Harry', 'Henry', 'Rory', 'Otto'],
    girls: ['Tilly', 'Hattie', 'Willow', 'Isla', 'Flora', 'Minty', 'Clemmie', 'Ottilie', 'Lottie', 'Bea', 'Poppy', 'Tabitha', 'Daisy', 'Iris', 'Matilda', 'Rosie', 'Ivy', 'Elsie', 'Wren', 'Marnie'],
    surnames: ['Fanshawe', 'Pemberton', 'Ashworth', 'Holloway', 'Carrington', 'Whitlock', 'Fairbairn', 'Mortimer', 'Beaumont', 'Trelawney', 'Granger', 'Lascelles', 'Harcourt', 'Prideaux', 'Osborne', 'Dewhurst', 'Pennington', 'Rawlins', 'Thistlethwaite', 'Blackwood', 'Ferrers', 'Merriman', 'Quayle', 'Stanhope', 'Vane', 'Wexley', 'Dunmore', 'Kettering', 'Bellamy', 'Hartigan'],
    schools: ['Fenwick Hall', "St Cuthwin's", 'Larkhaven', 'Mallowfield', "St Edric's", 'Brackenbury House', 'Cheverell Court', 'Wyncombe', 'Tallisford', 'Ravensmere', 'Hollowmere', 'Abbotsleigh Grange', "St Aldhelm's", 'Penhallow', 'Kingsferry', 'Oakhurst Manor'],
    places: ['near Ascot', 'in the Cotswolds', 'on the edge of the Downs', 'in deepest Wiltshire', 'in the Surrey Hills', 'on the Dorset coast', 'near Wokingham', 'outside Marlborough', 'in the Chilterns', 'near Sherborne', 'in rural Hampshire', 'on the Sussex Weald'],
    rivals: ['Coldharbour House', 'Brackley Court', 'Wyndham Hall', 'Fernhill', 'Ashcombe Park', "St Hubert's", 'Thornbury', 'Pelham Grange', 'Grimsbury', 'Langton Priory'],
    senior: {
      boys: ['Eton', 'Harrow', 'Winchester', 'Radley', 'Wellington', 'Marlborough', 'Charterhouse', 'Bradfield', 'Stowe', 'Sherborne', 'Tonbridge', 'Bryanston', 'Canford', 'Oundle'],
      girls: ['Wycombe Abbey', 'Downe House', 'Benenden', "Cheltenham Ladies'", 'St Mary\'s Ascot', 'Marlborough', 'Wellington', 'Bryanston', 'Sherborne Girls', 'Godolphin'],
    },
  };
  D.quirks = ['collects fountain pens', 'never misses a chapel service', 'drives a 1987 Volvo', 'has opinions about the rugby', 'quotes Wodehouse', 'keeps bees', 'is always on a diet', 'knows everyone\'s business', 'cannot work the photocopier', 'runs ultramarathons', 'plays the bagpipes', 'is secretly brilliant at bridge'];

  /* ---------- Activities (cost Time) ---------- */
  D.actions = [
    // Classroom
    { id: 'plan', tab: 'act', group: 'Classroom', emoji: '📝', label: 'Plan lessons properly', sub: 'Teaching up, energy down',
      outcomes: [
        { w: 75, by: { organisation: 0.4 }, text: 'You plan every lesson this half-term. They run like clockwork.', fx: { teaching: 2, energy: -4, perf: 4 } },
        { w: 25, text: 'You over-plan. Year 5 finish your forty-minute task in twelve.', fx: { teaching: 1, energy: -4, morale: -1 } },
      ] },
    { id: 'mark', tab: 'act', group: 'Classroom', emoji: '🖍️', label: 'Catch up on marking', sub: 'Keeps your department happy',
      outcomes: [
        { w: 65, by: { organisation: 0.6 }, text: 'You clear the pile. Your red pen runs dry.', fx: { rep: 2, energy: -4, morale: -1, rel: { hod: 3 }, perf: 3 } },
        { w: 35, text: 'You get halfway. The pile seems to breed overnight.', fx: { rep: 1, energy: -4, morale: -2 } },
      ] },
    { id: 'idea', tab: 'act', group: 'Classroom', emoji: '💡', label: 'Try something new in a lesson', sub: 'High risk, high reward',
      outcomes: [
        { w: 45, by: { teaching: 0.6, charisma: 0.3 }, text: 'Your new {subject} activity is a triumph. Pupils talk about it at lunch.', fx: { teaching: 4, morale: 5, rep: 2 } },
        { w: 35, text: 'It goes fine. Nobody remembers it by Friday.', fx: { teaching: 1 } },
        { w: 20, by: { teaching: -0.3 }, text: 'It goes badly. A pupil asks if you are feeling all right.', fx: { morale: -4, rep: -2 } },
      ] },
    { id: 'observe', tab: 'act', group: 'Classroom', emoji: '👀', label: 'Observe a colleague', sub: 'Pinch good ideas', cast: { col: 'colleague' },
      outcomes: [
        { w: 70, text: 'You watch {col} teach {col.subject}. You steal three ideas.', fx: { teaching: 3, energy: -2, rel: { col: 4 } } },
        { w: 30, text: '{col} spends the lesson showing a film. You learn nothing about {col.subject}.', fx: { energy: -1, rel: { col: -2 } } },
      ] },
    { id: 'help', tab: 'act', group: 'Classroom', emoji: '🧑‍🏫', label: 'Run a lunchtime help session', sub: 'Good for pupils, hard on you',
      outcomes: [
        { w: 70, text: 'Six pupils turn up. Two of them understand fractions now.', fx: { rep: 2, karma: 2, energy: -3, perf: 2 } },
        { w: 30, text: 'Nobody turns up. You eat your sandwich alone in the classroom.', fx: { morale: -2 } },
      ] },
    // Common room
    { id: 'coffee', tab: 'act', group: 'Common room', emoji: '☕', label: 'Hold court in the common room', sub: 'Friends, gossip, trouble', cast: { col: 'colleague' },
      outcomes: [
        { w: 55, by: { charisma: 0.4 }, text: 'You and {col} have a good laugh over the crossword.', fx: { morale: 3, rel: { col: 5 } } },
        { w: 30, text: '{col} tells you who is leaving at the end of the year. You promise to keep it quiet.', fx: { morale: 2, rel: { col: 3 }, flag: 'gossip' } },
        { w: 15, text: 'You make a joke about the Head. The Head is standing behind you.', fx: { morale: -3, rep: -3, rel: { head: -6 } } },
      ] },
    { id: 'volunteer', tab: 'act', group: 'Common room', emoji: '🙋', label: 'Volunteer for a job nobody wants', sub: 'Reputation up, energy down',
      outcomes: [
        { w: 40, text: 'You are now in charge of the lost property cupboard. It smells of shin pads.', fx: { rep: 4, energy: -4, ambition: 2 } },
        { w: 30, text: 'You agree to organise the staff Christmas raffle. It eats your weekends.', fx: { rep: 4, energy: -5, rel: { head: 3 } } },
        { w: 30, text: 'You run the school bookshop for a term. You sell eleven copies of a book on badgers.', fx: { rep: 3, energy: -3 } },
      ] },
    { id: 'seehead', tab: 'act', group: 'Common room', emoji: '🎩', label: 'Pop in to see the Head', sub: 'Get noticed', show: { has: 'head' },
      outcomes: [
        { w: 50, by: { charisma: 0.5 }, byRel: { head: 0.4 }, text: '{head} is pleased to see you and asks your views on the timetable.', fx: { rel: { head: 6 }, rep: 2 } },
        { w: 35, text: "{head}'s door is shut. You talk to the secretary about her cat instead.", fx: { morale: 1 } },
        { w: 15, text: '{head} is mid-phone call with a furious parent and waves you away.', fx: { rel: { head: -2 } } },
      ] },
    { id: 'pub', tab: 'act', group: 'Common room', emoji: '🍺', label: 'Drinks at the local with colleagues', sub: '£30 · morale and friends', cast: { col: 'colleague' }, need: { stat: { money: '>=30' } },
      outcomes: [
        { w: 80, text: 'A good evening at the pub with {col} and the Science department.', fx: { money: -30, morale: 5, energy: -1, rel: { col: 7 } } },
        { w: 20, text: 'One drink becomes five. Monday morning period one is a struggle.', fx: { money: -55, morale: 4, energy: -6, rel: { col: 8 } } },
      ] },
    // Wellbeing
    { id: 'run', tab: 'act', group: 'Wellbeing', emoji: '🏃', label: 'Run round the playing fields', sub: 'Energy and morale',
      outcomes: [
        { w: 85, text: 'You run three laps of the fields before breakfast. You feel smug all day.', fx: { energy: 4, morale: 3 } },
        { w: 15, text: 'You twist an ankle in a rabbit hole near the cricket square.', fx: { energy: -3, morale: -2 } },
      ] },
    { id: 'sleep', tab: 'act', group: 'Wellbeing', emoji: '😴', label: 'Early nights all week', sub: 'Rest up', text: 'You are in bed by half nine every night. Bliss.', fx: { energy: 9, morale: 1 } },
    { id: 'walk', tab: 'act', group: 'Wellbeing', emoji: '🌳', label: 'Walk the grounds at dusk', sub: 'Clear your head', text: 'You walk the grounds as the lights come on in the boarding houses.', fx: { morale: 4, patience: 2, energy: 2 } },
    { id: 'weekend', tab: 'act', group: 'Wellbeing', emoji: '🚗', label: 'Escape for a weekend', sub: '£250 · proper rest', need: { stat: { money: '>=250' } }, show: { not: 'resident_lock' },
      text: 'You get away for a weekend with no emails. You come back a new person.', fx: { money: -250, energy: 8, morale: 7 } },
    { id: 'church', tab: 'act', group: 'Weekend', emoji: '⛪', label: 'Go to church on Sunday', sub: 'Morning service at the parish church',
      outcomes: [
        { w: 1, when: { school: 'hambrook' }, text: 'Sunday service at St Michael\'s. You recognise a surprising number of faces from the staff car park.', fx: { morale: 1, energy: -1, karma: 1, count: { pews: 1, church: 1 } } },
        { w: 1, when: { notSchool: 'hambrook' }, text: 'A quiet hour at the village church. The vicar preaches about patience.', fx: { morale: 2, patience: 1, energy: -1, karma: 1, count: 'church' } },
      ] },
    // Life
    { id: 'love', tab: 'life', group: 'Love', emoji: '💘', label: 'Look for love', sub: 'Dating apps, friends of friends', show: { hasNot: 'partner', age: '<=55' },
      outcomes: [
        { w: 35, by: { charisma: 0.4 }, text: 'You meet someone lovely at a friend\'s barbecue.', fx: { morale: 8, newPerson: { role: 'partner', extra: { rel: 60 } }, flag: 'dating' } },
        { w: 45, text: 'Three dates, three disasters. One asks if teachers get paid in the holidays.', fx: { morale: -2 } },
        { w: 20, text: 'You spend the evening swiping. Nothing comes of it.', fx: { morale: -1 } },
      ] },
    { id: 'tutor_private', tab: 'life', group: 'Money', emoji: '📖', label: 'Advertise private tutoring', sub: 'Extra cash, less energy', show: { not: 'tutoring' },
      outcomes: [
        { w: 70, text: 'Three families sign up for weekly {subject} tutoring. About £1,200 extra each half-term.', fx: { flag: 'tutoring', morale: 2 } },
        { w: 30, text: 'Nobody bites this time.', fx: {} },
      ] },
    { id: 'stop_tutor', tab: 'life', group: 'Money', emoji: '🛑', label: 'Stop private tutoring', sub: 'Get your evenings back', cost: 0, show: { flags: 'tutoring' }, text: 'You drop your tutoring clients.', fx: { unflag: 'tutoring', energy: 3 } },
    { id: 'retire', tab: 'life', group: 'The end', emoji: '🎓', label: 'Retire', sub: 'Hang up the gown', cost: 0, show: { age: '>=58' }, start: 'retire_confirm' },
    { id: 'quit', tab: 'life', group: 'The end', emoji: '🚪', label: 'Leave teaching', sub: 'Walk away from the profession', cost: 0, start: 'quit_confirm' },
  ];

  /* ---------- Person actions ({them} = the person) ---------- */
  const STAFF = ['head', 'deputy', 'hod', 'bursar', 'matron', 'colleague', 'slt'];
  D.personActions = [
    { id: 'chat', roles: STAFF.concat(['partner']), emoji: '💬', label: 'Have a chat',
      outcomes: [
        { w: 75, text: 'You have a pleasant chat with {them}.', fx: { rel: { them: 5 }, morale: 1 } },
        { w: 25, text: '{them} talks for twenty minutes about how {them.he} {them.quirk}.', fx: { rel: { them: 3 }, energy: -1 } },
      ] },
    { id: 'advice', roles: ['head', 'deputy', 'hod', 'colleague'], emoji: '🧭', label: 'Ask for advice',
      outcomes: [
        { w: 70, text: '{them} gives you useful advice on managing a tricky class.', fx: { teaching: 2, rel: { them: 3 } } },
        { w: 30, text: '{them} tells you it was all much easier in {them.his} day.', fx: { rel: { them: 1 } } },
      ] },
    { id: 'compliment', roles: STAFF, emoji: '🌟', label: 'Pay a compliment',
      outcomes: [
        { w: 80, text: '{them} is touched by your kind words.', fx: { rel: { them: 6 }, karma: 1 } },
        { w: 20, text: '{them} suspects you want something.', fx: { rel: { them: 1 } } },
      ] },
    { id: 'complain', roles: STAFF, emoji: '😤', label: 'Complain to them',
      outcomes: [
        { w: 60, text: 'You get it off your chest. {them} looks wounded.', fx: { rel: { them: -7 }, morale: 2 } },
        { w: 40, text: '{them} agrees with every word. You bond over shared grievance.', fx: { rel: { them: 4 }, morale: 3 } },
      ] },
    { id: 'pubwith', roles: ['colleague', 'hod', 'matron', 'slt'], emoji: '🍻', label: 'Take them to the pub', sub: '£25', need: { stat: { money: '>=25' } },
      text: 'You buy {them} a drink and hear the full story of how {them.he} came to teach.', fx: { money: -25, rel: { them: 8 }, morale: 3 } },
    { id: 'raise', roles: ['head'], emoji: '💷', label: 'Ask for a pay rise', show: { not: 'bonus' }, need: { stat: { rep: '>=55' } }, why: 'Needs Reputation 55+',
      outcomes: [
        { w: 30, by: { rep: 0.6, charisma: 0.4 }, byRel: { head: 0.6 }, text: '{them} agrees to an extra allowance of £2,000 a year.', fx: { flag: 'bonus', run: s => { s.flags.bonus = 2000; }, morale: 6 } },
        { w: 50, text: '{them} says the budget is very tight this year.', fx: { rel: { them: -3 } } },
        { w: 20, text: '{them} asks if you have thought about whether teaching is really for you.', fx: { rel: { them: -8 }, morale: -5 } },
      ] },
    // pupils
    { id: 'praise', roles: ['pupil'], emoji: '⭐', label: 'Praise their work',
      outcomes: [
        { w: 80, text: '{them.first} glows. {them.He} works twice as hard all week.', fx: { rel: { them: 7 }, karma: 1 } },
        { w: 20, text: '{them.first} goes pink and hides behind {them.his} exercise book.', fx: { rel: { them: 4 } } },
      ] },
    { id: 'extra', roles: ['pupil'], emoji: '📚', label: 'Give them extra help',
      outcomes: [
        { w: 75, by: { teaching: 0.5 }, text: 'Something clicks for {them.first} in your extra session.', fx: { rel: { them: 6 }, rep: 1, energy: -2, karma: 1 } },
        { w: 25, text: '{them.first} spends the session asking about your weekend.', fx: { rel: { them: 3 }, energy: -2 } },
      ] },
    { id: 'detention', roles: ['pupil'], emoji: '⛓️', label: 'Give them a detention',
      outcomes: [
        { w: 70, text: '{them.first} serves a detention with bad grace.', fx: { rel: { them: -8 }, rep: 1, count: 'detentions' } },
        { w: 30, text: '{them.first} says it is "literally so unfair" and tells {them.his} parents.', fx: { rel: { them: -10 }, count: 'detentions' } },
      ] },
    { id: 'joke', roles: ['pupil'], emoji: '😂', label: 'Share a joke',
      outcomes: [
        { w: 60, by: { charisma: 0.5 }, text: '{them.first} laughs. You are officially cool for a day.', fx: { rel: { them: 6 } } },
        { w: 40, text: '{them.first} stares at you with pity.', fx: { rel: { them: -1 }, morale: -1 } },
      ] },
    // parents
    { id: 'phone', roles: ['parent'], emoji: '📞', label: 'Phone them with good news',
      outcomes: [
        { w: 80, text: '{them} is delighted to hear {them.child} has been working hard.', fx: { rel: { them: 8 }, rep: 1 } },
        { w: 20, text: '{them} asks why {them.child} is not in the top set, then.', fx: { rel: { them: 1 }, morale: -1 } },
      ] },
    { id: 'concern', roles: ['parent'], emoji: '📧', label: 'Email them a concern',
      outcomes: [
        { w: 50, by: { charisma: 0.4 }, text: '{them} thanks you and promises to have a word at home.', fx: { rel: { them: 3 }, rep: 1 } },
        { w: 50, text: '{them} replies at length, copying in the Head.', fx: { rel: { them: -8 }, morale: -3, rel2: 0 } },
      ] },
    // family
    { id: 'date', roles: ['partner'], emoji: '🍷', label: 'Date night', sub: '£80', need: { stat: { money: '>=80' } },
      outcomes: [
        { w: 85, text: 'A lovely evening out with {them}. You do not mention school once.', fx: { money: -80, rel: { them: 9 }, morale: 5 } },
        { w: 15, text: 'You fall asleep in the cinema. {them} is not impressed.', fx: { money: -80, rel: { them: 2 } } },
      ] },
    { id: 'propose', roles: ['partner'], emoji: '💍', label: 'Propose', show: { not: ['engaged', 'married'] }, need: { test: (s, c) => s.people.find(p => p.id === c.cast.them).rel >= 70 }, why: 'Get closer first (70+)', start: 'proposal' },
    { id: 'baby', roles: ['partner'], emoji: '👶', label: 'Try for a baby', show: { flags: 'married', not: 'expecting' }, start: 'try_baby' },
    { id: 'breakup', roles: ['partner'], emoji: '💔', label: 'End the relationship', cost: 0, start: 'breakup' },
    { id: 'play', roles: ['child'], emoji: '🧸', label: 'Spend time together',
      text: 'You spend a happy afternoon with {them}.', fx: { rel: { them: 8 }, morale: 5, energy: -1 } },
  ];

  /* ---------- Responsibilities ---------- */
  D.resp = [
    { id: 'tutor', emoji: '🗂️', label: 'Form tutor', sub: 'Pastoral care for a form', drain: 2 },
    { id: 'coach', emoji: '🏉', label: 'Coach a games team', sub: 'Matches every week of the season', drain: 4, onAdd: { team: 'U11B' } },
    { id: 'club', emoji: '🎲', label: 'Run a {subject} club', sub: 'One lunchtime a week', drain: 2 },
    { id: 'divmaster', emoji: '🧭', label: 'Division Master', sub: 'Pastoral lead for a year group', drain: 4, when: { stat: { years: '>=1' } }, why: 'After your first year', show: { gender: 'm' } },
    { id: 'divmaster', emoji: '🧭', label: 'Division Mistress', sub: 'Pastoral lead for a year group', drain: 4, when: { stat: { years: '>=1' } }, why: 'After your first year', show: { gender: 'f' } },
    { id: 'resident', emoji: '🛏️', label: 'Resident boarding tutor', sub: 'Evening and night duties; free housing', drain: 6, show: { boarding: true } },
    { id: 'croquet', emoji: '🔨', label: 'Run the croquet club', sub: 'Summer evenings on the lawn. Ruthless children.', drain: 2 },
    { id: 'trips', emoji: '🚌', label: 'Trips coordinator', sub: 'Risk assessments for days', drain: 3, when: { stat: { years: '>=2' } }, why: 'After two years' },
  ];

  /* ---------- Qualifications ---------- */
  D.quals = [
    { id: 'ma', emoji: '🎓', label: 'MA in Educational Leadership', sub: 'Two years part-time · £1,000 a half-term', length: 12, perHt: 1000, fee: 0, drain: 5, when: { stat: { years: '>=1' } }, why: 'After your first year', done: { teaching: 4, rep: 6, ambition: 5 } },
    { id: 'npqsl', emoji: '📘', label: 'NPQ in Senior Leadership', sub: 'One year · £600 fee', length: 6, fee: 600, drain: 3, when: { minRank: 2 }, why: 'Middle leaders and above', done: { rep: 6 } },
    { id: 'npqh', emoji: '📕', label: 'NPQ for Headship', sub: 'One year · £900 fee', length: 6, fee: 900, drain: 3, when: { minRank: 3 }, why: 'Senior leaders only', done: { rep: 8 } },
  ];

  /* ---------- Holidays (booked for the next break) ---------- */
  D.holidays = [
    { id: 'home', label: 'Stay at home', price: 0, rest: 0, morale: 0, text: 'You stay at home and do nothing. It is wonderful.' },
    { id: 'family', label: 'Visit family', price: 150, rest: 8, morale: 3, text: 'You visit family and get fed properly.' },
    { id: 'cottage', label: 'Cottage in Cornwall', price: 700, rest: 15, morale: 6, text: 'A week in a Cornish cottage with rain and pasties.' },
    { id: 'abroad', label: 'Somewhere hot', price: 1600, rest: 22, morale: 10, text: 'You lie by a pool and forget the names of Year 6.' },
    { id: 'ski', label: 'Skiing', price: 2200, rest: 10, morale: 12, text: 'A week in the Alps. Your legs hurt and you love it.' },
  ];

  /* ---------- Honours (first match wins) ---------- */
  D.honours = [
    { id: 'failed', emoji: '📋', title: 'Not for Everyone', text: 'Teaching chewed you up early.', test: (s, e) => e === 'induction' },
    { id: 'burnt', emoji: '🕯️', title: 'Burnt Candle', text: 'You gave everything until there was nothing left.', test: (s, e) => e === 'burnout' },
    { id: 'disgrace', emoji: '📦', title: 'Cardboard Box', text: 'Asked to leave.', test: (s, e) => e === 'sacked' },
    { id: 'head', emoji: '👑', title: 'The Head', text: 'You reached the top of the tree.', test: s => s.career.peak === 'Head' },
    { id: 'pew', emoji: '⛪', title: 'Pillar of St Michael\'s', text: 'You found the side door to the Hambrook SLT. It was in the vestry.', test: s => (s.counters.pews || 0) >= 20 },
    { id: 'croquet', emoji: '🔨', title: 'Lord of the Lawn', text: 'Your croquet teams terrorised the prep school circuit.', test: s => (s.counters.croquetCups || 0) >= 3 },
    { id: 'grudge', emoji: '⚔️', title: 'Grudge Bearer', text: 'You beat the old enemy, again and again.', test: s => (s.counters.grudgeWins || 0) >= 5 },
    { id: 'chips', emoji: '📚', title: 'Mr Chips', text: 'One school, a whole career.', test: s => s.career.yearsAtSchool >= 25 },
    { id: 'pastoral', emoji: '🫶', title: 'Safe Pair of Arms', text: 'Every homesick child knew where your door was.', test: s => s.hidden.karma >= 75 && s.flags.divmaster },
    { id: 'saint', emoji: '😇', title: 'Saint of the Common Room', text: 'Kind to everyone, always.', test: s => s.hidden.karma >= 85 },
    { id: 'touchline', emoji: '🏆', title: 'Legend of the Touchline', text: 'Your teams won and won.', test: s => (s.counters.wins || 0) >= 25 },
    { id: 'scholar', emoji: '🦉', title: 'Scholar', text: 'A truly great classroom teacher.', test: s => s.stats.teaching >= 90 },
    { id: 'nomad', emoji: '🧳', title: 'Journeyman', text: 'You taught at school after school.', test: s => (s.counters.schools || 1) >= 4 },
    { id: 'rich', emoji: '💰', title: 'Comfortable', text: 'You left with a tidy sum.', test: s => PSL.netWorth(s) >= 500000 },
    { id: 'grump', emoji: '🌧️', title: 'Old Grump', text: 'You stayed, but you never stopped complaining.', test: s => s.stats.morale < 25 },
    { id: 'steady', emoji: '🪑', title: 'Safe Pair of Hands', text: 'A steady, decent career.', test: () => true },
  ];

  /* =================================================================
     EVENT LIBRARY
     Fields: id, title, emoji, text, tags, when, weight, mods, cooldown (half-terms),
     once, manual, cast {slot: role}, choices [{label, need, outcomes|text+fx}]
     Passive events: no choices; text+fx or outcomes.
     ================================================================= */
  D.events = [
    /* ---- Manual / system events ---- */
    { id: 'first_day', manual: true, emoji: '🔔', title: 'First morning', tags: ['system'],
      text: 'It is your first morning at {school}. Chapel starts at 8.15 and you have no idea where chapel is.',
      choices: [
        { label: 'Arrive an hour early', text: 'You find your classroom, the photocopier and the one working stapler.', fx: { rep: 3, organisation: 2, energy: -3 } },
        { label: 'Arrive bang on time', text: 'You follow a crocodile of small children and hope for the best.', fx: { morale: 1 } },
        { label: 'Ask {matron} for directions', text: '{matron} walks you there and tells you which colleagues to avoid.', fx: { rel: { matron: 8 }, morale: 2 } },
      ] },
    { id: 'interview', manual: true, emoji: '🪑', title: 'Interview: {target}', tags: ['system', 'career'],
      text: 'The panel for {target} sits in a row. {head} asks what you would change in your first year.',
      choices: [
        { label: '"Everything. It needs shaking up."', outcomes: [
          { w: 25, by: { charisma: 0.5, rep: 0.6, ambition: 0.4 }, wfn: RANKPEN, text: 'Bold. The panel loves it. You get the job.', fx: { promote: true, morale: 12, count: 'promotions' } },
          { w: 60, text: 'The panel exchange looks. You do not get the job.', fx: { morale: -6, rel: { head: -3 }, count: 'interviewFails' } } ] },
        { label: '"Listen first, then change slowly."', outcomes: [
          { w: 35, by: { rep: 0.7, teaching: 0.3 }, wfn: RANKPEN, text: 'A safe, sensible answer. You get the job.', fx: { promote: true, morale: 12, count: 'promotions' } },
          { w: 55, text: 'They give it to someone with more experience.', fx: { morale: -5, count: 'interviewFails' } } ] },
        { label: 'Talk about your pupils', outcomes: [
          { w: 30, by: { rep: 0.6, karma: 0.4 }, wfn: RANKPEN, text: 'Your warmth wins the room. You get the job.', fx: { promote: true, morale: 12, count: 'promotions' } },
          { w: 55, text: 'Lovely, but they wanted a manager. Not this time.', fx: { morale: -5, count: 'interviewFails' } } ] },
      ] },
    { id: 'burnout', manual: true, emoji: '🕯️', title: 'Running on empty', tags: ['system'],
      text: 'You cried in the car park on Thursday. Your GP says you are exhausted.',
      choices: [
        { label: 'Take sick leave', text: 'You take a few weeks off. The cover teacher loses your mark book.', fx: { energy: 55, morale: 5, rep: -8, time: -4, count: 'burnouts' } },
        { label: 'Push on through', outcomes: [
          { w: 60, text: 'You get through it. Somehow.', fx: { energy: 20, morale: -12, count: 'burnouts' } },
          { w: 40, text: 'You collapse in assembly. The decision is made for you.', fx: { ending: 'burnout' } } ] },
        { label: 'Leave the profession', text: 'You write your resignation letter on the back of a worksheet.', fx: { ending: 'burnout' } },
      ] },
    { id: 'sacked', manual: true, emoji: '📦', title: "The Head's study", tags: ['system'],
      text: '{head} asks you to close the door. There have been too many complaints.',
      choices: [
        { label: 'Beg for one more chance', outcomes: [
          { w: 35, by: { charisma: 0.5 }, byRel: { head: 0.5 }, text: 'You are on a final warning. One more slip and you are out.', fx: { rep: 15, morale: -10, flag: 'final_warning' } },
          { w: 65, text: 'The decision is final.', fx: { ending: 'sacked' } } ] },
        { label: 'Resign with dignity', text: 'You resign before they can sack you.', fx: { ending: 'quit' } },
      ] },
    { id: 'retire_confirm', manual: true, emoji: '🎓', title: 'Retire?', text: 'After {years} years of chalk and fixtures, is it time?',
      choices: [{ label: 'Yes, retire now', text: 'You announce your retirement at the end of term.', fx: { ending: 'retire' } }, { label: 'Not yet', text: '', fx: { time: 0 } }] },
    { id: 'quit_confirm', manual: true, emoji: '🚪', title: 'Leave teaching?', text: 'This ends your career.',
      choices: [{ label: 'Yes, I am done', text: 'You hand in your notice.', fx: { ending: 'quit' } }, { label: 'No, stay', text: '', fx: {} }] },
    { id: 'proposal', manual: true, emoji: '💍', title: 'The question', text: 'You take {partner} for a walk and get down on one knee.',
      choices: [{ label: 'Ask', outcomes: [
        { w: 70, byRel: { partner: 1 }, text: '{partner} says yes!', fx: { flag: 'engaged', morale: 15, rel: { partner: 10 }, schedule: { id: 'wedding', in: 4 } } },
        { w: 30, text: '{partner} says it is too soon.', fx: { morale: -10, rel: { partner: -10 } } } ] }] },
    { id: 'wedding', manual: true, emoji: '💒', title: 'Wedding day', text: 'You marry {partner}. Half the common room comes.',
      when: { has: 'partner' },
      choices: [
        { label: 'Invite the whole staff', text: 'A wonderful day. The Head does the Macarena.', fx: { money: -9000, morale: 18, rep: 4, flag: 'married', unflag: 'engaged', count: 'weddings' } },
        { label: 'Keep it small', text: 'A small, perfect day.', fx: { money: -4000, morale: 15, flag: 'married', unflag: 'engaged', count: 'weddings' } },
      ] },
    { id: 'try_baby', manual: true, emoji: '👶', title: 'A family?', text: 'You and {partner} talk about children.',
      choices: [{ label: 'Go for it', outcomes: [
        { w: 60, text: 'Good news. A baby is on the way.', fx: { flag: 'expecting', schedule: { id: 'birth', in: 4 }, morale: 8 } },
        { w: 40, text: 'Not yet. You keep trying.', fx: { morale: -2 } } ] }, { label: 'Wait a while', text: 'You agree to wait.', fx: {} }] },
    { id: 'birth', manual: true, emoji: '🍼', title: 'A new arrival', text: 'Your baby is born.',
      choices: [{ label: 'Wonderful', text: 'Sleep becomes a memory.', fx: { newPerson: { role: 'child', extra: { rel: 90 } }, unflag: 'expecting', morale: 15, energy: -20 } }] },
    { id: 'breakup', manual: true, emoji: '💔', title: 'Ending it', text: 'Are you sure you want to break up with {partner}?',
      choices: [{ label: 'Yes', text: 'You and {partner} go your separate ways.', fx: { removePerson: 'partner', unflag: ['dating', 'engaged', 'married'], morale: -12 } }, { label: 'No', text: '', fx: {} }] },
    { id: 'job_hunt', manual: true, emoji: '🧳', title: 'Job hunting', tags: ['system', 'career'],
      setup: (s, ctx, P) => {
        ctx.offer = P.chance(s, Math.min(0.85, 0.35 + (s.stats.rep - 50) / 120));
        ctx.newSchool = P.makeSchool(s, s.school.id);
        ctx.vars = { ntown: ctx.newSchool.town, blurb: (P.byRole && '') , stars: '★'.repeat(ctx.newSchool.prestige), kind: ctx.newSchool.boarding ? 'boarding' : 'day', pupils: ctx.newSchool.gender };
      },
      text: (s, ctx) => ctx.offer ? 'You are offered a job at {newschool}, a {kind} {pupils} prep school {ntown} ({stars}).' : 'You send off three applications. Nobody bites this year.',
      choices: [
        { label: 'Accept the offer', show: { test: (s, c) => c.offer }, text: 'You hand in your notice and pack up your classroom.', fx: { moveSchool: true, morale: 6 } },
        { label: 'Turn it down', show: { test: (s, c) => c.offer }, text: 'You decide to stay put.', fx: {} },
        { label: 'Oh well', show: { test: (s, c) => !c.offer }, text: '', fx: { morale: -2 } },
      ] },
    { id: 'inspection', manual: true, emoji: '🔍', title: 'The inspectors are coming', tags: ['calendar'],
      text: 'The ISI phone on Monday. Inspectors arrive on Wednesday. The Head has gone pale.',
      choices: [
        { label: 'Rewrite every scheme of work', outcomes: [
          { w: 60, by: { organisation: 0.5 }, text: 'Your paperwork is immaculate. The lead inspector singles out your department.', fx: { rep: 8, energy: -15, rel: { head: 6 } } },
          { w: 40, text: 'Nobody looks at your schemes of work. You lost a week of sleep for nothing.', fx: { energy: -15, morale: -5 } } ] },
        { label: 'Teach as normal', outcomes: [
          { w: 50, by: { teaching: 0.8 }, text: 'An inspector watches you teach and writes "outstanding" in large letters.', fx: { rep: 8, teaching: 2, morale: 6 } },
          { w: 50, text: 'An inspector arrives just as a pupil is sick on the carpet.', fx: { rep: -3, morale: -3 } } ] },
        { label: 'Hide in the Art block', text: 'You spend the inspection laminating. Nobody notices.', fx: { energy: -3 } },
      ], fx: null },

    /* ---- Calendar ---- */
    { id: 'carol_service', emoji: '🕯️', title: 'The Carol Service', tags: ['calendar'], when: { ht: 1 }, cooldown: 5,
      text: 'The Carol Service. The chaplain has asked a member of staff to read a lesson.',
      choices: [
        { label: 'Volunteer to read', outcomes: [
          { w: 70, by: { charisma: 0.5 }, text: 'You read beautifully. Several mothers weep.', fx: { rep: 4, morale: 4 } },
          { w: 30, text: 'You read the wrong lesson. The choir carry on regardless.', fx: { rep: -2, morale: -3 } } ] },
        { label: 'Sing loudly at the back', text: 'You belt out the descant in Hark the Herald. It is not your part.', fx: { morale: 4 } },
        { label: 'Slip off to the staff mince pies', text: 'You eat nine mince pies in the common room.', fx: { morale: 3, energy: 2, rep: -1 } },
      ] },
    { id: 'snow', emoji: '❄️', title: 'Snow!', tags: ['calendar'], when: { ht: [2, 3] }, weight: 5,
      text: 'Six inches of snow overnight. The day pupils cannot get in.',
      choices: [
        { label: 'Lead a snowball war', text: 'You lead the staff to a famous defeat against Year 8.', fx: { morale: 8, rep: 2, energy: -2 } },
        { label: 'Set work online and stay warm', text: 'You set worksheets and spend the day in a dressing gown.', fx: { energy: 6, morale: 3 } },
        { label: 'Dig out the drive', text: 'The Bursar thanks you personally. Your back never forgives you.', fx: { rel: { bursar: 10 }, energy: -6, karma: 2 } },
      ] },
    { id: 'sports_day', emoji: '🥇', title: 'Sports Day', tags: ['calendar'], when: { ht: 5 }, cooldown: 5,
      text: 'Sports Day. The staff relay is the last event and the parents are watching.',
      choices: [
        { label: 'Run the anchor leg', outcomes: [
          { w: 50, text: 'You overtake the Head of Maths on the line. The crowd roars.', fx: { morale: 7, rep: 3, energy: -3 } },
          { w: 50, text: 'You pull a hamstring at the halfway mark and hobble home last.', fx: { morale: -3, energy: -5 } } ] },
        { label: 'Volunteer to time-keep', text: 'You hold a stopwatch for four hours and get sunburnt.', fx: { energy: -2, rep: 1 } },
      ] },
    { id: 'speech_day', emoji: '🏅', title: 'Speech Day', tags: ['calendar'], when: { ht: 5 }, cooldown: 5, cast: { p: { role: 'pupil', year: '>=7' } },
      text: '{p.full} wins the {subject} prize at Speech Day.',
      outcomes: [{ w: 1, text: '{p.full} wins the {subject} prize at Speech Day. {p.His} parents shake your hand for a full minute.', fx: { morale: 5, rep: 2, rel: { p: 5 } } }] },
    { id: 'ce_exams', emoji: '✍️', title: 'Common Entrance', tags: ['calendar', 'classroom'], when: { ht: 4 }, cooldown: 5,
      text: 'Common Entrance is three weeks away. Year 8 are nervous and so are you.',
      choices: [
        { label: 'Run evening revision sessions', outcomes: [
          { w: 70, by: { teaching: 0.4 }, text: 'Your set sail through. Two get A grades in {subject}.', fx: { rep: 6, energy: -8, perf: 6, count: 'ce_wins' } },
          { w: 30, text: 'Your set are fine. You are shattered.', fx: { rep: 2, energy: -8 } } ] },
        { label: 'Trust the teaching', outcomes: [
          { w: 50, by: { teaching: 0.8 }, text: 'They do well. You look very calm about it.', fx: { rep: 4, morale: 3 } },
          { w: 50, text: 'One pupil misses the grade for their senior school. The parents want a meeting.', fx: { rep: -5, morale: -6 } } ] },
      ] },
    { id: 'staff_party', emoji: '🎄', title: 'Staff Christmas party', tags: ['calendar', 'commonroom'], when: { ht: 1 }, cooldown: 5,
      text: 'The staff Christmas party. There is a karaoke machine and a free bar.',
      choices: [
        { label: 'Take the mic', outcomes: [
          { w: 55, by: { charisma: 0.5 }, text: 'Your Bohemian Rhapsody is the stuff of legend.', fx: { morale: 8, rep: 3 } },
          { w: 45, text: 'Someone films it. It reaches the Upper Sixth at three senior schools.', fx: { morale: -2, rep: -4 } } ] },
        { label: 'Corner the Head for a chat', show: { has: 'head' }, text: '{head} talks to you for an hour about drainage.', fx: { rel: { head: 7 }, morale: -1 } },
        { label: 'Leave early', text: 'You are in bed by ten. You hear about it all on Monday.', fx: { energy: 3 } },
      ] },
    { id: 'nits', emoji: '🪲', title: 'Nits', tags: ['pastoral'], when: { schoolGender: ['co-ed', 'girls', 'boys'] }, weight: 6,
      text: 'A nit outbreak sweeps Year 4. You itch for a week.', fx: { morale: -2 } },

    /* ---- Classroom ---- */
    { id: 'observation', emoji: '📋', title: 'Lesson observation', tags: ['classroom'], when: { maxRank: 1 }, weight: 9,
      text: '{hod} will observe your Year 7 {subject} lesson tomorrow.', show: {},
      choices: [
        { label: 'Plan a showpiece lesson', outcomes: [
          { w: 60, by: { teaching: 0.5 }, text: 'The lesson sings. {hod} writes three pages of praise.', fx: { teaching: 3, rep: 4, energy: -5, rel: { hod: 5 } } },
          { w: 40, text: 'The showpiece collapses when the projector dies.', fx: { rep: -2, morale: -4, energy: -5 } } ] },
        { label: 'Teach a normal lesson', outcomes: [
          { w: 50, by: { teaching: 0.8 }, text: '{hod} says it was solid and asks for more pace.', fx: { teaching: 2, rep: 1 } },
          { w: 50, text: 'Year 7 choose this lesson to discover the word "bottom".', fx: { rep: -3, morale: -3 } } ] },
      ], },
    { id: 'translation', emoji: '🏛️', title: 'Lost in translation', tags: ['classroom'], when: { subject: ['Latin', 'Classics'] }, cast: { p: 'pupil' }, weight: 8,
      text: '{p.first} translates "Caesar" as "salad" in a test. You frame it for the classroom wall.', fx: { morale: 3 } },
    { id: 'photocopier', emoji: '🖨️', title: 'Photocopier', tags: ['classroom'], weight: 7,
      text: 'The photocopier jams with your Year 6 test inside it. You teach from memory.', fx: { morale: -2, teaching: 1 } },
    { id: 'cheeky_q', emoji: '🙋', title: 'A personal question', tags: ['classroom'], cast: { p: 'pupil' }, weight: 9,
      text: '{p.first} puts {p.his} hand up in the middle of your lesson. "{sir}, are you married?"',
      choices: [
        { label: 'Laugh it off', outcomes: [{ w: 1, by: { charisma: 0.5 }, text: 'You turn it into a vocab lesson. The class love it.', fx: { rel: { p: 4 }, morale: 2 } }] },
        { label: 'Stern look and carry on', text: 'Silence falls. {p.first} goes very red.', fx: { rel: { p: -3 }, rep: 1 } },
        { label: 'Give them a detention', text: '{p.first} is outraged. Word gets round that you are strict.', fx: { rel: { p: -8 }, rep: 2, count: 'detentions' } },
      ] },

    /* ---- Pastoral ---- */
    { id: 'tears', emoji: '😢', title: 'Behind the pavilion', tags: ['pastoral'], cast: { p: 'pupil' }, weight: 8,
      text: 'You find {p.first} crying behind the cricket pavilion.',
      choices: [
        { label: 'Sit down and listen', outcomes: [
          { w: 1, by: { patience: 0.4 }, text: '{p.first} is homesick and missing the dog. You talk for twenty minutes. {p.He} goes off smiling.', fx: { rel: { p: 12 }, karma: 4, morale: 3 } }] },
        { label: 'Take them to {matron}', text: '{matron} produces a hot chocolate and a plaster for no injury.', fx: { rel: { p: 4, matron: 3 } } },
        { label: 'Tell them to pull themselves together', text: '{p.first} pulls {p.himself} together. Nobody feels better.', fx: { rel: { p: -10 }, karma: -4 } },
      ] },
    { id: 'homesick', emoji: '🌙', title: 'Night duty', tags: ['pastoral', 'boarding'], when: { boarding: true, flags: 'resident' }, cast: { p: 'boarder' }, weight: 10,
      text: 'At 2am {p.first} knocks on your door. {p.He} cannot sleep and wants to go home.',
      choices: [
        { label: 'Make toast and talk', text: 'Toast and Marmite fixes most things. {p.first} sleeps until the bell.', fx: { rel: { p: 10 }, karma: 3, energy: -4 } },
        { label: 'Back to bed, firmly', text: '{p.first} goes back to bed. You lie awake feeling guilty.', fx: { rel: { p: -3 }, energy: -2 } },
      ] },
    { id: 'midnight_feast', emoji: '🍫', title: 'Midnight feast', tags: ['boarding'], when: { boarding: true, flags: 'resident' }, weight: 7,
      text: 'You hear rustling in a dormitory at midnight. Contraband Haribo everywhere.',
      choices: [
        { label: 'Confiscate the lot', text: 'You confiscate enough sweets to last until Easter.', fx: { rep: 2, morale: 2 } },
        { label: 'Pretend you saw nothing', text: 'You walk past. The dorm thinks you are a legend.', fx: { morale: 2, karma: 1 } },
        { label: 'Join in', outcomes: [
          { w: 60, text: 'You eat a Freddo and tell a ghost story. Nobody tells.', fx: { morale: 5 } },
          { w: 40, text: 'Matron catches all of you. Including you.', fx: { rep: -4, rel: { matron: -8 } } } ] },
      ] },

    /* ---- Parents ---- */
    { id: 'late_email', emoji: '📧', title: '11.43pm', tags: ['parents'], cast: { par: 'parent' }, weight: 10,
      text: 'An email from {par} arrives at 11.43pm. Why did {par.child} get a B?',
      choices: [
        { label: 'Reply now, at length', text: 'You write a thoughtful reply at midnight. {par} replies at 12.05.', fx: { rel: { par: 4 }, energy: -4 } },
        { label: 'Reply tomorrow, briefly', outcomes: [
          { w: 70, text: 'A short, polite reply does the job.', fx: { rel: { par: 1 } } },
          { w: 30, text: '{par} complains to the Head that you took eleven hours to reply.', fx: { rel: { par: -6, head: -3 } } } ] },
        { label: 'Forward it to the Head', show: { has: 'head' }, text: '{head} asks why you are forwarding routine emails.', fx: { rel: { head: -4 }, energy: 2 } },
      ] },
    { id: 'hamper', emoji: '🧺', title: 'A hamper', tags: ['parents'], when: { ht: [1, 5] }, cast: { par: 'parent' }, weight: 6,
      text: 'The {par.last} family send you a hamper with a note from {par.child}. There is a whole Stilton in it.', fx: { morale: 5, rel: { par: 3 } } },
    { id: 'tutor_offer', emoji: '💷', title: 'An offer', tags: ['parents', 'money'], cast: { par: 'parent' }, weight: 6, not: null,
      when: { not: 'tutoring' },
      text: '{par} asks if you would tutor {par.child} privately over the holidays. £60 an hour.',
      choices: [
        { label: 'Accept', text: 'Easy money. Odd to see {par.child} in their kitchen.', fx: { money: 900, energy: -4, rel: { par: 6 } } },
        { label: 'Politely decline', text: 'You keep your holidays.', fx: { rel: { par: -2 } } },
      ] },

    /* ---- Sport ---- */
    { id: 'match_day', emoji: '🏟️', title: 'Match day', tags: ['sport'], when: { flags: 'coach' }, weight: 22, cooldown: 1,
      text: 'Your {team} {sport} side play {rival} away. The minibus smells of Deep Heat.',
      choices: [
        { label: 'Rousing team talk', outcomes: [
          { w: 50, by: { charisma: 0.6 }, text: 'Your team win. The team sing all the way home.', fx: { morale: 6, rep: 2, count: 'wins' } },
          { w: 50, text: 'You lose by a mile. Nobody speaks in the minibus.', fx: { morale: -3, count: 'losses' } } ] },
        { label: 'Tactical masterclass', outcomes: [
          { w: 45, by: { teaching: 0.4, organisation: 0.4 }, text: 'Your set piece wins it in the last minute.', fx: { morale: 7, rep: 3, count: 'wins' } },
          { w: 55, text: 'The opposition have a boy who is clearly sixteen. You lose.', fx: { morale: -2, count: 'losses' } } ] },
        { label: 'Let them just enjoy it', outcomes: [
          { w: 40, text: 'They enjoy it and win. Who knew?', fx: { morale: 5, karma: 2, count: 'wins' } },
          { w: 60, text: 'They enjoy it and lose heavily. Some parents mutter.', fx: { morale: 1, rep: -1, count: 'losses' } } ] },
      ] },
    { id: 'touchline_parent', emoji: '📣', title: 'Touchline parent', tags: ['sport', 'parents'], when: { flags: 'coach' }, cast: { par: 'parent' }, weight: 8,
      text: '{par} is shouting at the referee. The referee is twelve.',
      choices: [
        { label: 'Have a quiet word', outcomes: [
          { w: 60, by: { charisma: 0.5 }, text: '{par} apologises and buys the team ice creams.', fx: { rel: { par: 2 }, rep: 2 } },
          { w: 40, text: '{par} tells you {par.he} played for Harlequins. {par.He} did not.', fx: { rel: { par: -6 }, morale: -2 } } ] },
        { label: 'Ignore it', text: 'The shouting continues for the full sixty minutes.', fx: { morale: -2 } },
      ] },
    { id: 'wasps', emoji: '🐝', title: 'Match tea', tags: ['sport'], when: { flags: 'coach', season: 'summer' }, weight: 8,
      text: 'Wasps attack the jam sandwiches at match tea. A parent is stung on the lip.', fx: { morale: -1 } },
    { id: 'team_up', emoji: '📈', title: 'Promoted to the A team', tags: ['sport'], when: { flags: 'coach', test: s => (s.counters.wins || 0) >= 6 && s.career.team !== '1st XI' }, weight: 6, cooldown: 12,
      text: 'The Head of Games wants you to take a stronger side next season.',
      choices: [
        { label: 'Take the 1st team', text: 'You now run the 1st team. The pressure is real.', fx: { team: '1st XI', rep: 4, energy: -3 } },
        { label: 'Stay with your lot', text: 'You stay loyal to your team. They notice.', fx: { morale: 3, karma: 2 } },
      ] },

    /* ---- Common room & staff ---- */
    { id: 'mug', emoji: '☕', title: 'The mug', tags: ['commonroom'], cast: { col: 'colleague' }, weight: 8,
      text: '{col} is drinking from your mug. The one that says "World\'s Best Teacher".',
      choices: [
        { label: 'Say nothing', text: 'You let it go. It eats at you.', fx: { morale: -2, patience: 2 } },
        { label: 'Reclaim it in front of everyone', text: 'Common room silence. {col} hands it back without a word.', fx: { rel: { col: -8 }, morale: 3 } },
        { label: 'Buy {col} a mug of their own', text: '{col} is so touched {col.he} brings you cake.', fx: { rel: { col: 10 }, money: -8, karma: 2 } },
      ] },
    { id: 'budget_cut', emoji: '✂️', title: 'Budget cut', tags: ['career'], when: { role: 'HoD' }, weight: 8,
      text: '{bursar} has cut your department budget by forty per cent.',
      choices: [
        { label: 'Fight it in a meeting', outcomes: [
          { w: 45, by: { charisma: 0.6 }, text: 'You win back half the money.', fx: { rel: { bursar: -6 }, rep: 3, morale: 3 } },
          { w: 55, text: '{bursar} shows you a spreadsheet. You lose.', fx: { rel: { bursar: -4 }, morale: -4 } } ] },
        { label: 'Make do', text: 'Your department shares one glue stick between four classrooms.', fx: { morale: -3, rel: { bursar: 4 } } },
      ] },
    { id: 'head_word', emoji: '🎩', title: 'A word', tags: ['career'], when: { has: 'head' }, weight: 7,
      outcomes: [
        { w: 50, byRel: { head: 0.6 }, text: '{head} stops you in the corridor to say how well you are doing.', fx: { morale: 5, rep: 2 } },
        { w: 30, text: '{head} asks you to cover a lesson. It is Year 4 swimming.', fx: { energy: -3 } },
        { w: 20, byRel: { head: -0.4 }, text: '{head} asks why your reports were late.', fx: { morale: -3, rep: -2 } },
      ] },

    /* ---- Life ---- */
    { id: 'premium_bonds', emoji: '🎟️', title: 'Premium Bonds', tags: ['life', 'money'], weight: 2,
      text: 'Your Premium Bonds win £100. You buy everyone in the common room a doughnut.', fx: { money: 75, morale: 3 } },
    { id: 'overdrawn', emoji: '🏦', title: 'Overdrawn', tags: ['life', 'money'], when: { stat: { money: '<0' } }, weight: 30, cooldown: 2,
      text: 'The bank writes to say you are overdrawn. You hide the letter in a drawer.', fx: { morale: -4 } },
    { id: 'health_scare', emoji: '🩺', title: 'Health scare', tags: ['life'], when: { age: '>=45', stat: { energy: '<35' } }, weight: 6,
      text: 'Chest pains during a fire drill. The doctor says to slow down.',
      choices: [
        { label: 'Drop a responsibility', show: { test: s => s.career.resp.length > 0 }, text: 'You give up one of your extra jobs.', fx: { run: s => { const r = s.career.resp[s.career.resp.length - 1]; s.career.resp.pop(); delete s.flags[r]; }, energy: 10, morale: 2 } },
        { label: 'Book a proper holiday', text: 'You book a week of doing nothing.', fx: { energy: 15, money: -800 } },
        { label: 'Ignore the doctor', text: 'You carry on. Your chest still hurts.', fx: { energy: -5 } },
      ] },
  ];
})(typeof window !== 'undefined' ? window : globalThis);
