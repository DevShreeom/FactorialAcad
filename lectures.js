import { CHAPTER_DATA, ORDER } from "../data.js";
import { DATA as ALL_VIDEOS } from "../allVideosData.js";
import { getState, toggleProgress, isDone, saveNote, getNote } from "./state.js";

export function chapterLectures(chapter){
  const d=CHAPTER_DATA[chapter];
  if(!d) return [];
  return [...(d.fs||[]).map(x=>({...x,type:"Concept",chapter})),...(d.pyq||[]).map(x=>({...x,type:"PYQ",chapter}))];
}
export function allLectures(){
  const out=[];
  ORDER.forEach(ch=>chapterLectures(ch).forEach(x=>out.push(x)));
  return out;
}
export function videoId(url){const m=String(url).match(/[?&]v=([^&]+)/);return m?m[1]:String(url).split("/").pop()}
export function renderLibrary({container,onPlay}){
  const st=getState(); let active=st.selectedChapter||ORDER[0], query="";
  const draw=()=>{
    const list=chapterLectures(active).filter(x=>(x.title+" "+x.type).toLowerCase().includes(query.toLowerCase()));
    container.innerHTML=`<div class="library-layout">
      <aside class="panel filter-panel">
        <input id="lib-search" placeholder="Search lectures…" value="${query.replace(/"/g,"&quot;")}">
        <div class="filter-list">${ORDER.map(ch=>`<button class="filter-item ${ch===active?"active":""}" data-ch="${encodeURIComponent(ch)}">${ch}<span style="float:right">${chapterLectures(ch).length}</span></button>`).join("")}</div>
      </aside>
      <div><div class="section-head" style="margin-top:0"><div><div class="eyebrow">CHAPTER / ${active.toUpperCase()}</div><h2>${list.length} lectures</h2><p>Mark lectures complete as you move through the curriculum.</p></div></div>
      <div class="lecture-list">${list.map((x,i)=>{const id=videoId(x.url),key="lecture:"+id;return `<article class="panel lecture-row">
        <button class="lecture-number" data-done="${key}" title="Toggle completion">${isDone(key)?"✓":String(i+1).padStart(2,"0")}</button>
        <div><h3>${x.title}</h3><p>${x.type} · ${x.duration||"—"} · ${new Date(x.uploaded).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</p></div>
        <div class="lecture-actions"><button class="icon-link" data-play="${id}" data-title="${encodeURIComponent(x.title)}">Watch</button><a class="icon-link" href="${x.url}" target="_blank" rel="noopener">YouTube ↗</a></div>
      </article>`}).join("")||`<div class="panel empty">No lectures match this search.</div>`}</div></div></div>`;
    container.querySelector("#lib-search").oninput=e=>{query=e.target.value;draw()};
    container.querySelectorAll("[data-ch]").forEach(b=>b.onclick=()=>{active=decodeURIComponent(b.dataset.ch);st.selectedChapter=active;localStorage.setItem("factorial_academy_professional_v1",JSON.stringify({...getState(),selectedChapter:active}));draw()});
    container.querySelectorAll("[data-done]").forEach(b=>b.onclick=()=>{toggleProgress(b.dataset.done);draw()});
    container.querySelectorAll("[data-play]").forEach(b=>b.onclick=()=>onPlay(b.dataset.play,decodeURIComponent(b.dataset.title)));
  }; draw();
}
export function renderAllVideos({container,onPlay}){
  const rows=ALL_VIDEOS.slice(0,120);
  container.innerHTML=`<div class="section-head" style="margin-top:0"><div><div class="eyebrow">YOUTUBE ARCHIVE</div><h2>All Factorial uploads.</h2><p>Search the live video index mirrored from the existing site.</p></div><input class="search" id="all-search" style="max-width:260px" placeholder="Search video titles…"></div>
  <div class="lecture-list" id="all-video-list">${rows.map((x,i)=>`<article class="panel lecture-row"><div class="lecture-number">${String(i+1).padStart(2,"0")}</div><div><h3>${x[1]}</h3><p>${x[2]} · YouTube archive</p></div><div class="lecture-actions"><button class="icon-link" data-play="${x[0]}" data-title="${encodeURIComponent(x[1])}">Watch</button></div></article>`).join("")}</div>`;
  const draw=q=>{container.querySelector("#all-video-list").innerHTML=rows.filter(x=>x[1].toLowerCase().includes(q.toLowerCase())).map((x,i)=>`<article class="panel lecture-row"><div class="lecture-number">${String(i+1).padStart(2,"0")}</div><div><h3>${x[1]}</h3><p>${x[2]} · YouTube archive</p></div><div class="lecture-actions"><button class="icon-link" data-play="${x[0]}" data-title="${encodeURIComponent(x[1])}">Watch</button></div></article>`).join("")||`<div class="panel empty">No videos found.</div>`;container.querySelectorAll("[data-play]").forEach(b=>b.onclick=()=>onPlay(b.dataset.play,decodeURIComponent(b.dataset.title)))};
  container.querySelector("#all-search").oninput=e=>draw(e.target.value);
}