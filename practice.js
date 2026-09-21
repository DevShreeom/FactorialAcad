import { recordAssignment, getState } from "./state.js";
const sets=[
 {id:"mains-speed-01",track:"JEE MAINS",title:"Calculus Speed Sprint 04",type:"20-question timed drill",difficulty:"Timed",questions:[["If f(x)=x²eˣ, then f''(0) is:",["0","1","2","4"],2],["lim x→0 sin(3x)/x equals:",["1","2","3","0"],3],["Derivative of ln(x²+1) is:",["1/(x²+1)","2x/(x²+1)","2/(x²+1)","x/(x²+1)"],2]]},
 {id:"advanced-algebra-01",track:"JEE ADVANCED",title:"Algebra Depth Sheet 03",type:"Multi-concept practice",difficulty:"Hard",questions:[["For a real quadratic with equal roots, its discriminant is:",["1","0","−1","Depends on a"],2],["If z is purely imaginary and |z|=2, then z² is:",["4","−4","2","−2"],2],["The coefficient of x² in (1+x)^5 is:",["5","10","15","20"],2]]},
 {id:"coordinate-fast-01",track:"JEE MAINS",title:"Coordinate Formula Recall",type:"10-minute revision set",difficulty:"Fast",questions:[["Slope of x+y=1 is:",["1","−1","0","undefined"],2],["Radius of x²+y²=25 is:",["5","10","25","√5"],2],["Distance between (0,0) and (3,4) is:",["4","5","6","7"],2]]}
];
export function renderPractice({container,toast}){
  const st=getState();
  container.innerHTML=`<div class="practice-grid">${sets.map(s=>`<article class="panel practice-card"><span class="tag ${s.track.includes("ADVANCED")?"amber":"green"}">${s.track}</span><h3>${s.title}</h3><p>${s.type} · ${s.questions.length} sample questions · ${s.difficulty}</p><button class="primary-btn" data-start="${s.id}">Start practice →</button></article>`).join("")}</div><div id="practice-run" style="margin-top:14px"></div>`;
  container.querySelectorAll("[data-start]").forEach(b=>b.onclick=()=>start(sets.find(s=>s.id===b.dataset.start)));
  function start(set){
    let answers={};const run=container.querySelector("#practice-run");
    run.innerHTML=`<div class="panel"><div class="section-head" style="margin:0 0 16px"><div><div class="eyebrow">${set.track} / ${set.difficulty}</div><h2>${set.title}</h2></div><button class="secondary-btn" id="close-practice">Close</button></div>${set.questions.map((q,i)=>`<div style="margin:20px 0"><b style="font-size:11px">${i+1}. ${q[0]}</b><div>${q[1].map((a,j)=>`<button class="answer" data-q="${i}" data-a="${j}">${String.fromCharCode(65+j)}. ${a}</button>`).join("")}</div></div>`).join("")}<button class="primary-btn" id="submit-practice">Submit attempt</button><div id="practice-result" class="muted" style="margin-top:12px"></div></div>`;
    run.querySelector("#close-practice").onclick=()=>run.innerHTML="";
    run.querySelectorAll("[data-a]").forEach(btn=>btn.onclick=()=>{answers[btn.dataset.q]=Number(btn.dataset.a);run.querySelectorAll(`[data-q="${btn.dataset.q}"]`).forEach(x=>x.classList.remove("selected"));btn.classList.add("selected")});
    run.querySelector("#submit-practice").onclick=()=>{let score=0;set.questions.forEach((q,i)=>{const chosen=answers[i];run.querySelectorAll(`[data-q="${i}"]`).forEach(x=>x.classList.remove("correct","wrong"));if(chosen!==undefined){const btn=run.querySelector(`[data-q="${i}"][data-a="${chosen}"]`);if(chosen===q[2]){score++;btn.classList.add("correct")}else btn.classList.add("wrong");}});recordAssignment(set.id,score);run.querySelector("#practice-result").innerHTML=`<strong>Score: ${score}/${set.questions.length}</strong> · Attempt saved locally.`;toast("Practice attempt saved.")};
  }
}