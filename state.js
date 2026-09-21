const KEY = "factorial_academy_professional_v1";
const defaults = {
  theme:"dark", user:null, route:"dashboard", selectedChapter:"Quadratic Equations",
  enrollments:[], progress:{}, notes:{}, assignmentScores:{}, qotdAnswers:{}
};
let state = load();
const listeners = new Set();
function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return {...defaults}}}
function persist(){localStorage.setItem(KEY,JSON.stringify(state));listeners.forEach(fn=>fn(getState()))}
export function getState(){return structuredClone(state)}
export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
export function setRoute(route){state.route=route;persist()}
export function setTheme(theme){state.theme=theme;document.documentElement.classList.toggle("light",theme==="light");persist()}
export function setUser(user){state.user=user;persist()}
export function logout(){state.user=null;persist()}
export function currentUser(){return state.user}
export function isEnrolled(id){return state.enrollments.includes(id)}
export function enroll(id){if(!state.enrollments.includes(id)) state.enrollments.push(id);persist()}
export function toggleProgress(key){state.progress[key]=!state.progress[key];persist();return state.progress[key]}
export function isDone(key){return !!state.progress[key]}
export function saveNote(key,value){state.notes[key]=value;persist()}
export function getNote(key){return state.notes[key]||""}
export function recordAssignment(id,score){state.assignmentScores[id]=score;persist()}
export function answerQotd(id,answer){state.qotdAnswers[id]=answer;persist()}
export function getScoreTotal(){return Object.values(state.assignmentScores).reduce((a,b)=>a+(Number(b)||0),0)}
document.documentElement.classList.toggle("light",state.theme==="light");