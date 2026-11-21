require('./src/engine.js'); require('./src/content.js'); require('fs').readdirSync('./src/events').forEach(f=>require('./src/events/'+f));
const P=PSL; const s=P.newGame({traits:['rugby','local'],school:'hambrook'},11);
console.log('traits',s.traits, 'charisma',s.hidden.charisma,'head rel',P.byRole(s,'head').rel);
const rv=s.people.find(p=>p.rival); console.log('rival', rv&&P.dispName(rv), rv&&P.personRoleLabel(s,rv));
const clear=()=>{let k=0;while(s.pending.length&&k++<30){const e=P.currentEvent(s);P.choose(s,e.choices[0].i);}};
clear(); let reviews=0;
for(let i=0;i<6*22&&!s.over;i++){P.advance(s); if(s.reviewPending){reviews++; s.reviewPending=false;} clear();}
console.log('reviews',reviews, JSON.stringify(s.reviews[s.reviews.length-1]));
const lines=s.log.flatMap(x=>x.lines.map(l=>l.t)).filter(t=>/rival|⚔️|Radio 4|familiar|inspector|Year 3 parent|thinly|villain/.test(t));
console.log(lines.slice(0,12)); console.log('alumni',s.alumni.length,'back',s.counters.alumniBack);
