/* Life outside school */
(function (root) {
  'use strict';
  const D = root.PSL_DATA;

  D.events.push(
    { id: 'must_move', emoji: '🧳', title: 'Time to move', tags: ['life'], when: { flags: 'must_move', ht: [2, 3] }, weight: 200,
      text: 'You promised {partner} you would find a job nearer the new one.', fx: { unflag: 'must_move', start: 'job_hunt' } },
    { id: 'partner_job', emoji: '💼', title: 'An offer', tags: ['life', 'family'], when: { has: 'partner', stat: { yearsAtSchool: '>=2' } }, weight: 4, cooldown: 24,
      text: '{partner} is offered a great job, two hours from {school}.',
      choices: [
        { label: 'Back them. You\'ll find another school', text: 'You agree to move. You will start looking for a job in Lent.', fx: { rel: { partner: 14 }, morale: -2, flag: 'must_move' } },
        { label: 'Ask them to turn it down', text: '{partner} turns it down. It is mentioned at most dinners for a year.', fx: { rel: { partner: -14 } } },
        { label: 'Try long distance', outcomes: [
          { w: 1, byRel: { partner: 0.8 }, text: 'Weekends only. It is hard, and it works.', fx: { rel: { partner: -3 }, morale: -3 } },
          { w: 1, text: 'Long distance does not work.', fx: { removePerson: 'partner', unflag: ['dating', 'engaged', 'married'], morale: -15 } } ] },
      ] },
    { id: 'partner_moans', emoji: '😮‍💨', title: 'Term time', tags: ['life', 'family'], when: { has: 'partner', stat: { energy: '<40' } }, weight: 7,
      text: '{partner} says you have spent the whole half-term "either marking or asleep".',
      choices: [
        { label: 'Plan a proper weekend together', text: 'No marking. No school emails. You both remember why you like each other.', fx: { rel: { partner: 10 }, energy: 3, money: -150 } },
        { label: '"It\'s nearly half-term"', text: 'It is not nearly half-term. {partner} knows this.', fx: { rel: { partner: -6 } } },
      ] },
    { id: 'kid_at_school', emoji: '🎒', title: 'Your child', tags: ['life', 'family'], cast: { k: { role: 'child', age: [7, 13] } }, weight: 6, cooldown: 6,
      text: '{k} is now a pupil at {school}. A colleague has put {k} in detention.',
      choices: [
        { label: 'Back your colleague', text: '{k} sulks. Your colleague respects you.', fx: { rel: { k: -4 }, rep: 2 } },
        { label: 'Have a word with the colleague', text: 'The detention is quietly dropped. The common room notices.', fx: { rel: { k: 4 }, rep: -3, karma: -1 } },
      ] },
    { id: 'kid_baby', emoji: '👶', title: 'Family', tags: ['life', 'family'], cast: { k: { role: 'child', age: [0, 2] } }, weight: 6, cooldown: 6,
      outcomes: [
        { w: 1, text: '{k} says {k.his} first word. It is "Matron".', fx: { morale: 6 } },
        { w: 1, text: '{k} is up four times a night. You teach Year 8 on two hours of sleep.', fx: { energy: -6 } } ] },
    { id: 'kid_milestone', emoji: '🧒', title: 'Family', tags: ['life', 'family'], cast: { k: { role: 'child', age: [4, 17] } }, weight: 5,
      outcomes: [
        { w: 1, text: '{k} loses a tooth during your Year 7 lesson. The class insist on a tooth-fairy plenary.', fx: { morale: 5 } },
        { w: 1, text: '{k} asks why you are always at school. You do not have a good answer.', fx: { morale: -3, rel: { k: -2 } } },
        { w: 1, text: '{k} wins the egg-and-spoon race. You film it on two phones.', fx: { morale: 6 } },
      ] },
    { id: 'car_dies', emoji: '🚗', title: 'The car', tags: ['life', 'money'], weight: 4, cooldown: 12,
      text: 'Your car fails its MOT on eleven counts.',
      choices: [
        { label: 'Fix it', text: 'The garage bill is £1,400. The car rattles anyway.', fx: { money: -1400, morale: -2 } },
        { label: 'Buy a sensible estate', text: 'You now drive the official car of the prep school teacher.', fx: { money: -6000, morale: 3 } },
      ] },
    { id: 'ageing', emoji: '👓', title: 'Getting on', tags: ['life'], when: { age: '>=45' }, weight: 4, cooldown: 12,
      outcomes: [
        { w: 1, text: 'You need reading glasses to see the back of the classroom. Year 5 call you "Grandpa" behind your back. And to your face.', fx: { morale: -2 } },
        { w: 1, text: 'A new parent turns out to be a pupil you taught in your first year. They call you "Sir" by reflex.', fx: { morale: 5 } },
        { w: 1, text: 'You get up from the staff-match deckchair and something in your back says no.', fx: { energy: -3 } },
      ] },
    { id: 'old_pupil', emoji: '🎓', title: 'A visitor', tags: ['life', 'win'], when: { stat: { years: '>=10' } }, weight: 5, cooldown: 12,
      text: 'A former pupil, now at university reading Classics, visits to say you are the reason. They bring biscuits.', fx: { morale: 12, karma: 1 } },
    { id: 'inheritance', emoji: '📜', title: 'A bequest', tags: ['life', 'money'], when: { age: '>=35' }, weight: 1, once: true,
      text: 'A great-aunt you met twice leaves you £15,000 and a carriage clock.', fx: { money: 15000, morale: 4 } },
    { id: 'summer_job', emoji: '🏕️', title: 'Summer work', tags: ['life', 'money'], when: { ht: 4 }, weight: 4, cooldown: 12,
      text: 'A summer school offers you three weeks teaching English to wealthy teenagers in Oxford. Good money.',
      choices: [
        { label: 'Take it', text: 'Three weeks, £3,000, and a summer that feels shorter.', fx: { money: 3000, energy: -12 } },
        { label: 'Protect the holiday', text: 'You spend August doing nothing. Correct.', fx: { morale: 3 } },
      ] },
  );
})(typeof window !== 'undefined' ? window : globalThis);
