# Prep School Life

A BitLife-style career simulator for prep school teachers. Start as an ECT and tap **Next ½** to move on one half-term at a time: lessons, boarding, sport, croquet, parents and promotion, all the way to Head (or burnout).

**Play:** open `index.html` in a browser. On iPhone, open it in Safari, tap Share, then Add to Home Screen. Saves stay in the browser.

## Live mode (desktop)
On a computer, press **🎮 Live** (or turn it on from the start screen) to walk round your school in a side-on pixel-art view: the quad, chapel, classrooms, common room, Head's study, boarding house, San and playing fields. Activities happen at places (your desk, the kettle, the pews), people live in rooms, events play as scenes, and you ring the bell in the tower to move on a half-term. Controls: ← → walk, Space jump, ↑ doors, E use/talk, N bell, Esc pause, J classic view. All art is drawn in code (`src/live.js`).

## iPhone app (Swift)
`ios/PrepLife.xcodeproj` is a native SwiftUI app that bundles the game, so it runs offline with its own icon, haptics and saves kept on the phone.

1. Open `ios/PrepLife.xcodeproj` in Xcode (15 or later).
2. Click the **PrepLife** project, then **Signing & Capabilities**, and pick your Team (your Apple ID works).
3. Plug in your iPhone, choose it as the run destination, and press **Run** (⌘R).
4. First time only: on the iPhone, go to Settings → General → VPN & Device Management and trust your developer certificate.

With a free Apple ID the app runs for 7 days before you need to press Run again; a paid developer account removes that limit and allows TestFlight.

After changing any game code, run `python3 build.py`. It rebuilds `index.html` and copies it into the app at `ios/PrepLife/Resources/`.

## Features
- Four schools: Wickenden Manor ("Wickers"), Ravelstone, Thornbury Court and Larkspur House, each with its own culture and hidden rules
- Career ladder from ECT to Head, with vacancies, interviews, responsibilities and qualifications
- Visible stats (Morale, Energy, Teaching, Reputation) and hidden ones (Patience, Organisation, Charisma, Ambition, Karma)
- 198 hand-written events, pupil types, relationships, family life, honours at the end of each career
- A sandbox (tap the crest) to edit stats, fire events and rewind time

## Project layout
- `src/engine.js`: game engine (pure logic, no DOM)
- `src/content.js`: schools, actions, responsibilities, honours, system events
- `src/events/*.js`: the event library, one file per area
- `src/ui.js`, `src/shell.html`: interface
- `build.py`: bundles everything into `index.html` and the iOS app's copy
- `ios/`: the SwiftUI app (`PrepLifeApp.swift`, `GameView.swift`, icon)
- `sim.js`: headless bot that plays careers to test balance (`node sim.js 300`)

## Adding an event
Add an object to `D.events.push(...)` in the right `src/events/` file, then run `python3 build.py`. See existing events for the fields (`when`, `cast`, `choices`, `outcomes`, `fx`).
