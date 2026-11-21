# Prep School Life

A BitLife-style career simulator for prep school teachers. Start as an ECT and tap **Next ½** to move on one half-term at a time: lessons, boarding, sport, croquet, parents and promotion, all the way to Head (or burnout).

**Play:** open `index.html` in a browser. On iPhone, open it in Safari, tap Share, then Add to Home Screen. Saves stay in the browser.

## Features
- Four schools: Mudgrove ("Mudders"), Hambrook, Thornbury Court and Larkspur House, each with its own culture and hidden rules
- Career ladder from ECT to Head, with vacancies, interviews, responsibilities and qualifications
- Visible stats (Morale, Energy, Teaching, Reputation) and hidden ones (Patience, Organisation, Charisma, Ambition, Karma)
- 198 hand-written events, pupil types, relationships, family life, honours at the end of each career
- A sandbox (tap the crest) to edit stats, fire events and rewind time

## Project layout
- `src/engine.js`: game engine (pure logic, no DOM)
- `src/content.js`: schools, actions, responsibilities, honours, system events
- `src/events/*.js`: the event library, one file per area
- `src/ui.js`, `src/shell.html`: interface
- `build.py`: bundles everything into the single-file `index.html`
- `sim.js`: headless bot that plays careers to test balance (`node sim.js 300`)

## Adding an event
Add an object to `D.events.push(...)` in the right `src/events/` file, then run `python3 build.py`. See existing events for the fields (`when`, `cast`, `choices`, `outcomes`, `fx`).
