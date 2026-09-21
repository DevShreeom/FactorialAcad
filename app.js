import { getState, setRoute, setTheme, currentUser, logout, enroll, isEnrolled, saveNote, getNote, isDone } from "./state.js";
import { googleLogin, demoLogin, signOut, watchAuth } from "./auth.js";
import { courses, getCourse } from "./store.js";
import { renderLibrary, renderAllVideos, videoId } from "./lectures.js";
import { renderPractice } from "./practice.js";
import { renderQotd } from "./qotd.js";
import { CONFIG } from "./config.js";

const $=s=>document.querySelector(s), view=$("#app-view");
const META={
 dashboard:["Dashboard","Welcome back — here's where you left off."],
 library:["Lectures Library","Browse and track the complete curriculum."],
 store:["Course Store","Focused courses, transparent pricing and instant access."],
 videos:["My Classroom","Your enrolled lectures, notes and course workspace."],
 practice:["Practice Hub","JEE Main speed. JEE Advanced depth."],
 qotd:["Question of the Day","One sharp problem, every single day."],
 leaderboard:["Leaderboard","A lightweight progress board for the demo cohort."],
 updates:["Updates","Announcements and product notes from the Factorial team."],
 profile:["My Profile","Your study activity, enrollments and settings."],
 about:["About Factorial","The team, the product and the learning philosophy."]
};
function toast(msg){const e=document.createElement("div");e.className="toast";e.textContent=msg;$("#toast-root").appendChild(e);setTimeout(()=>e.remove(),3000)}
function modal(id,open=true){const e=$("#"+id);if(e)e.hidden=!open}
function initials(name){return (name||"G").split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase()}
function refreshUserUI(){
 const u=currentUser(), n=u?.name||"Guest student", meta=u?(u.provider==="demo"?"Local demo session":u.email):"Sign in to sync progress";
 $("#user-name").textContent=n;$("#user-meta").textContent=meta;$("#avatar").textContent=initials(n);$("#top-avatar-letter").textContent=initials(n);$("#sync-label").textContent=u?(u.provider==="demo"?"Demo workspace":"Firebase synced"):"Local demo mode";
}
function setHeader(route){const m=META[route]||META.dashboard;$("#page-title").textContent=m[0];$("#page-subtitle").textContent=m[1];document.querySelectorAll("[data-route]").forEach(b=>b.classList.toggle("active",b.dataset.route===route))}
function navigate(route){setRoute(route);setHeader(route);render(route);if(window.innerWidth<=850)$("#sidebar").classList.remove("open")}
function requireAuth(action){if(!currentUser()){openAuth();return false}action();return true}
function openAuth(){modal("auth-modal",true)}
function closeModals(){document.querySelectorAll(".modal-backdrop").forEach(x=>x.hidden=true)}
function courseCard(c){
 const owned=isEnrolled(c.id);
 return `<article class="course-card"><div class="course-cover"><span class="tag ${c.track==="Advanced"?"amber":"green"}">${c.track}</span><span class="course-glyph">${c.glyph}</span></div><div class="course-body"><div class="course-meta"><span>${c.subject}</span><span>${c.lessons} lessons · ${c.duration}</span></div><h3>${c.title}</h3><p>${c.description}</p><div class="course-price">₹${c.price}</div><button class="${owned?"secondary-btn":"primary-btn"} wide" data-course="${c.id}">${owned?"Open classroom →":"View & enroll →"}</button></div></article>`;
}
function dashboard(){
 const u=currentUser(), st=getState(), enrolled=st.enrollments.length, completed=Object.keys(st.progress).filter(k=>st.progress[k]).length;
 view.innerHTML=`<div class="hero"><div class="hero-main"><div class="eyebrow">STUDENT WORKSPACE</div><h2>${u?`Keep building,<br>${u.name.split(" ")[0]}.`:"Learn.<br>Practice.<br>Master."}</h2><p class="hero-copy">${u?"Your Factorial workspace is ready. Pick up a lecture, run a timed set or open your next course.":"Explore the Factorial system before signing in. Demo mode unlocks the full student journey in one click."}</p><div class="hero-actions"><button class="primary-btn" data-route="store">Explore courses →</button><button class="secondary-btn" data-route="practice">Practice now</button></div></div><aside class="panel hero-side"><div class="eyebrow">TODAY / IST</div><h3 style="margin:7px 0">Study plan</h3><div class="schedule"><div class="schedule-row"><b>07:00 PM</b><span>Live concept class</span></div><div class="schedule-row"><b>20 Qs</b><span>Speed drill</span></div><div class="schedule-row"><b>15 min</b><span>Formula recall</span></div><div class="schedule-row"><b>01 Q</b><span>Question of Day</span></div></div><div class="metric-grid"><div class="metric"><strong>${String(enrolled).padStart(2,"0")}</strong><span>Courses</span></div><div class="metric"><strong>${String(completed).padStart(2,"0")}</strong><span>Lectures done</span></div><div class="metric"><strong>${Object.keys(st.assignmentScores).length}</strong><span>Attempts</span></div></div></aside></div><div class="section-head"><div><div class="eyebrow">CURATED / CURRENT</div><h2>Continue your preparation.</h2><p>A small, deliberate course catalogue rather than an endless content dump.</p></div><button class="secondary-btn" data-route="store">View all courses →</button></div><div class="course-grid">${courses.slice(0,4).map(courseCard).join("")}</div>`;
 bindCourseButtons();
}
function store(){
 view.innerHTML=`<div class="section-head" style="margin-top:0"><div><div class="eyebrow">COURSE STORE</div><h2>Courses that feel like products.</h2><p>One-time demo pricing, clear outcomes and instant classroom access.</p></div><span class="tag purple">RAZORPAY READY</span></div><div class="course-grid">${courses.map(courseCard).join("")}</div><div class="panel" style="margin-top:14px;padding:18px"><b style="font-size:11px">Production payment note</b><p class="muted" style="font-size:9px;margin:5px 0 0">The prototype uses a safe local simulation by default. Add a Razorpay test key in <code>js/config.js</code> to open the real hosted checkout.</p></div>`;
 bindCourseButtons();
}
function bindCourseButtons(){
 view.querySelectorAll("[data-course]").forEach(b=>b.onclick=()=>{const c=getCourse(b.dataset.course);if(isEnrolled(c.id))navigate("videos");else checkout(c)});
 view.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>navigate(b.dataset.route));
}
function checkout(c){
 requireAuth(()=>{
  $("#checkout-body").innerHTML=`<div class="eyebrow">${c.track} / ${c.subject}</div><h2 style="font-size:25px;margin:8px 0">${c.title}</h2><p class="muted" style="font-size:10px">${c.description}</p><div class="panel checkout-summary" style="margin:18px 0;padding:16px"><div><div class="eyebrow">WHAT YOU GET</div><p style="font-size:10px;margin:7px 0 0">${c.lessons} lessons · ${c.duration} · course notes · classroom access</p></div><div class="checkout-price">₹${c.price}</div></div><div style="display:flex;gap:8px"><button class="primary-btn" id="pay-now">Continue to payment</button><button class="secondary-btn" data-close="checkout-modal">Cancel</button></div><p class="microcopy" style="margin-top:12px">No real charge in demo mode. Your enrollment is persisted locally.</p>`;
  modal("checkout-modal",true);
  $("#pay-now").onclick=()=>pay(c);
  $("#checkout-body").querySelector("[data-close]").onclick=()=>modal("checkout-modal",false);
 });
}
function pay(c){
 if(CONFIG.demoPayments||!CONFIG.razorpayKeyId||!window.Razorpay){completePurchase(c,"demo_"+Date.now());return}
 const rzp=new Razorpay({key:CONFIG.razorpayKeyId,amount:c.price*100,currency:"INR",name:CONFIG.appName,description:c.title,handler:response=>completePurchase(c,response.razorpay_payment_id)});
 rzp.open();
}
function completePurchase(c,paymentId){
 enroll(c.id);modal("checkout-modal",false);toast(`Enrollment confirmed · ${c.title}`);
 $("#onboarding-body").innerHTML=`<div class="eyebrow">ENROLLMENT CONFIRMED</div><h2 style="font-size:28px;margin:8px 0">Welcome to ${c.title}.</h2><p class="muted" style="font-size:10px">Your classroom is unlocked. Payment reference: <b>${paymentId}</b></p><div class="onboard-grid"><div class="onboard-card"><div class="eyebrow">CLASSROOM</div><h3>${c.lessons} lessons ready</h3><p class="muted" style="font-size:9px">Your relevant Factorial lectures are now available in the classroom.</p><button class="secondary-btn" id="open-classroom">Open classroom →</button></div><div class="onboard-card"><div class="eyebrow">COMMUNITY</div><h3>Stay in the loop</h3><p class="muted" style="font-size:9px">Use the existing Factorial Telegram channel for announcements and batch updates.</p><a class="secondary-btn" href="${CONFIG.contact.telegram}" target="_blank" rel="noopener">Open Telegram ↗</a></div></div>`;
 modal("onboarding-modal",true);$("#open-classroom").onclick=()=>{modal("onboarding-modal",false);navigate("videos")};
}
function library(){
 view.innerHTML=`<div id="library-root"></div>`;renderLibrary({container:$("#library-root"),onPlay:(id,title)=>openVideo(id,title)});
}
function videos(){
 const st=getState(), owned=courses.filter(c=>st.enrollments.includes(c.id));
 view.innerHTML=`<div class="section-head" style="margin-top:0"><div><div class="eyebrow">MY CLASSROOM</div><h2>${owned.length?`${owned.length} enrolled course${owned.length>1?"s":""}`:"Your classroom is waiting."}</h2><p>${owned.length?"Choose a course and continue from the lecture archive.":"Enroll in a course to unlock your focused classroom experience."}</p></div><button class="primary-btn" data-route="store">Browse store →</button></div>${owned.length?`<div class="course-grid">${owned.map(courseCard).join("")}</div>`:`<div class="panel empty">No enrollments yet. Your purchase flow is ready in the Course Store.</div>`}<div id="classroom-root" style="margin-top:14px"></div>`;
 view.querySelectorAll("[data-course]").forEach(b=>b.onclick=()=>openCourseClassroom(getCourse(b.dataset.course)));
 view.querySelector("[data-route]").onclick=()=>navigate("store");
 if(owned[0]) openCourseClassroom(owned[0]);
}
function openCourseClassroom(c){
 const root=$("#classroom-root"), all=[];
 c.chapters.forEach(ch=>{import("../data.js").then(()=>{})}); // keep the classroom render synchronous below via dynamic state.
 import("./lectures.js").then(({chapterLectures})=>{
   c.chapters.forEach(ch=>chapterLectures(ch).slice(0,8).forEach(x=>all.push({...x,courseId:c.id})));
   const first=all[0];
   root.innerHTML=`<div class="classroom"><aside class="panel playlist"><div class="eyebrow">${c.subject}</div><h3>${c.title}</h3>${all.map((x,i)=>`<button class="lesson-btn ${i===0?"active":""}" data-lesson="${i}"><b>${String(i+1).padStart(2,"0")} · ${x.type}</b><small>${x.title}</small></button>`).join("")||`<div class="empty">Course content will appear here.</div>`}</aside><div class="panel player-panel"><div id="player" class="player"></div><div class="notes-box"><div class="eyebrow">LECTURE NOTES</div><textarea id="lecture-note" placeholder="Write a note for this lecture…"></textarea><div style="display:flex;justify-content:flex-end;margin-top:7px"><button class="secondary-btn" id="save-note">Save note</button></div></div></div></div>`;
   let current=first;
   const show=x=>{current=x;const done=isDone("lecture:"+videoId(x.url));$("#player").innerHTML=`<iframe src="https://www.youtube.com/embed/${videoId(x.url)}?rel=0" title="${x.title.replace(/"/g,"&quot;")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>`;$("#lecture-note").value=getNote("note:"+videoId(x.url));$("#save-note").onclick=()=>{saveNote("note:"+videoId(x.url),$("#lecture-note").value);toast("Lecture note saved.");};};
   root.querySelectorAll("[data-lesson]").forEach(b=>b.onclick=()=>{root.querySelectorAll(".lesson-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");show(all[Number(b.dataset.lesson)])});
   if(first)show(first);
 });
}
function openVideo(id,title){view.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="video-overlay"><section class="modal wide"><button class="modal-x" id="close-video">×</button><div class="eyebrow">LECTURE PREVIEW</div><h2 style="font-size:18px">${title}</h2><div class="player" style="margin-top:12px"><iframe src="https://www.youtube.com/embed/${id}?rel=0" title="${title.replace(/"/g,"&quot;")}" allowfullscreen></iframe></div></section></div>`);$("#close-video").onclick=()=>$("#video-overlay").remove()}
function practice(){view.innerHTML=`<div class="section-head" style="margin-top:0"><div><div class="eyebrow">ASSIGNMENT HUB</div><h2>Mains speed. Advanced depth.</h2><p>Attempts are stored locally and reflected on your dashboard.</p></div></div><div id="practice-root"></div>`;renderPractice({container:$("#practice-root"),toast})}
function qotd(){view.innerHTML=`<div id="qotd-root"></div>`;renderQotd({container:$("#qotd-root"),toast})}
function leaderboard(){
 const names=["Aarav Sharma","Ishita Jain","Rohan Mehta","Ananya Gupta","Kabir Singh","Meera Rao","Dev Malhotra","Sara Khan"],st=getState(),me=currentUser()?.name||"Guest student";
 const rows=names.map((n,i)=>({name:n,done:62-i*5,score:940-i*51}));if(!names.includes(me))rows.push({name:me,done:Object.keys(st.progress).filter(k=>st.progress[k]).length,score:Object.values(st.assignmentScores).reduce((a,b)=>a+b,0)*10});
 rows.sort((a,b)=>b.score-a.score);
 view.innerHTML=`<div class="section-head" style="margin-top:0"><div><div class="eyebrow">DEMO COHORT</div><h2>Progress board.</h2><p>Illustrative local data — not a live ranking of the Factorial community.</p></div></div><div class="panel">${rows.map((r,i)=>`<div class="leader-row"><div class="rank">#${i+1}</div><div><div class="leader-name">${r.name}${r.name===me?" · you":""}</div><div class="leader-muted">${r.done} completed items</div></div><div class="leader-muted">${r.score} points</div><div class="progressbar"><i style="width:${Math.min(100,Math.max(4,r.done))}%"></i></div></div>`).join("")}</div>`;
}
function updates(){
 const items=[["01 Sep 2026","Product","Professional prototype architecture launched with course store, classroom and practice flows."],["18 Aug 2026","Content","New PYQ-led lecture indexing and chapter-level tracking improvements."],["02 Aug 2026","Community","The existing Factorial Academy experience continues to center focused lectures, PYQs and measurable progress."]];
 view.innerHTML=`<div class="section-head" style="margin-top:0"><div><div class="eyebrow">FROM THE TEAM</div><h2>Updates & changelog.</h2><p>Product notes presented in the same editorial style as the current Factorial site.</p></div></div><div class="update-grid">${items.map(x=>`<article class="panel update-card"><span class="tag purple">${x[1]}</span><div class="leader-muted" style="margin-top:13px">${x[0]}</div><h3>${x[2]}</h3><p>Designed to keep the student path clear and reduce friction between finding content and actually studying it.</p></article>`).join("")}</div>`;
}
function profile(){
 const u=currentUser(),st=getState(),completed=Object.values(st.progress).filter(Boolean).length,attempts=Object.keys(st.assignmentScores).length;
 view.innerHTML=`<div class="panel profile-head"><div class="profile-avatar">${initials(u?.name||"Guest Student")}</div><div><div class="eyebrow">STUDENT PROFILE</div><h2>${u?.name||"Guest Student"}</h2><div class="muted" style="font-size:9px">${u?.email||"Demo workspace · local only"}</div></div><div class="profile-actions"><button class="secondary-btn" id="profile-auth">${u?"Sign out":"Sign in"}</button><button class="secondary-btn" id="profile-theme">Toggle theme</button></div></div><div class="section-head"><div><div class="eyebrow">YOUR NUMBERS</div><h2>Study footprint.</h2></div></div><div class="stat-grid"><div class="panel stat-card"><div class="eyebrow">COURSES</div><h3 style="font-size:28px;margin:6px 0">${st.enrollments.length}</h3><p class="muted" style="font-size:9px">Unlocked classrooms</p></div><div class="panel stat-card"><div class="eyebrow">LECTURES</div><h3 style="font-size:28px;margin:6px 0">${completed}</h3><p class="muted" style="font-size:9px">Marked complete</p></div><div class="panel stat-card"><div class="eyebrow">ATTEMPTS</div><h3 style="font-size:28px;margin:6px 0">${attempts}</h3><p class="muted" style="font-size:9px">Practice sessions</p></div></div>`;
 $("#profile-auth").onclick=async()=>{if(u){await signOut();toast("Signed out.");refreshUserUI();navigate("dashboard")}else openAuth()};$("#profile-theme").onclick=()=>toggleTheme();
}
function about(){
 view.innerHTML=`<div class="about-grid"><div class="panel" style="padding:25px"><div class="eyebrow">FACTORIAL ACADEMY</div><h2 style="font-size:34px;letter-spacing:-2px;margin:9px 0">A study system,<br>not a content warehouse.</h2><p class="muted" style="font-size:11px">This prototype evolves the existing Factorial Academy experience into a product-led student workspace: curriculum, lectures, courses, practice and progress in one place.</p><div class="feature-list"><div class="feature"><b>01</b><div><b>Focused curriculum</b><p>Chapter-level lecture indexing sourced from the current site's content data.</p></div></div><div class="feature"><b>02</b><div><b>Course commerce</b><p>Local demo checkout with a clean path to Razorpay test/live integration.</p></div></div><div class="feature"><b>03</b><div><b>Student memory</b><p>Enrollments, notes, progress and practice attempts persist in local storage.</p></div></div></div></div><div class="panel" style="padding:25px"><div class="eyebrow">CONTACT</div><h3>Keep the loop tight.</h3><p class="muted" style="font-size:10px">Use the existing Factorial Academy channels for support and announcements.</p><div class="feature-list"><a class="secondary-btn" href="mailto:${CONFIG.contact.email}">Email the academy ↗</a><a class="secondary-btn" href="${CONFIG.contact.telegram}" target="_blank" rel="noopener">Telegram ↗</a></div><div style="margin-top:30px"><div class="eyebrow">PRODUCTION CHECKLIST</div><p class="muted" style="font-size:9px">Firebase Auth · Firestore · Razorpay · real PDFs · server-side entitlements · analytics · admin CMS.</p></div></div></div>`;
}
function render(route){
 switch(route){case"dashboard":dashboard();break;case"library":library();break;case"store":store();break;case"videos":videos();break;case"practice":practice();break;case"qotd":qotd();break;case"leaderboard":leaderboard();break;case"updates":updates();break;case"profile":profile();break;case"about":about();break;default:navigate("dashboard")}
}
function toggleTheme(){const light=!document.documentElement.classList.contains("light");setTheme(light?"light":"dark");toast(light?"Light appearance enabled":"Dark appearance enabled")}
document.querySelectorAll("[data-route]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.route)));
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>modal(b.dataset.close,false)));
$("#theme-toggle").onclick=toggleTheme;$("#mobile-menu").onclick=()=>$("#sidebar").classList.toggle("open");$("#auth-btn").onclick=()=>currentUser()?navigate("profile"):openAuth();$("#top-auth").onclick=()=>currentUser()?navigate("profile"):openAuth();
$("#demo-login").onclick=()=>{const u=demoLogin();modal("auth-modal",false);refreshUserUI();toast(`Welcome, ${u.name}.`);navigate("dashboard")};
$("#google-login").onclick=async()=>{const e=$("#auth-error");e.textContent="";try{const u=await googleLogin();modal("auth-modal",false);refreshUserUI();toast(`Signed in as ${u.name}.`);navigate("dashboard")}catch(err){e.textContent=err?.message||"Google sign-in was not completed. Use Demo Student to test locally."}};
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeModals()});
watchAuth(u=>{if(u){refreshUserUI()}});
refreshUserUI();setHeader(getState().route||"dashboard");render(getState().route||"dashboard");