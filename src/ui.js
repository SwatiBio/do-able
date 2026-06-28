// --- Theme ---
function getSystemTheme(){
  return window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'nord-dark':'nord-light'
}
function applyTheme(t){
  const resolved=t==='system'?getSystemTheme():t;
  document.documentElement.setAttribute('data-theme',resolved);
  const icon=document.getElementById('themeIcon');
  icon.innerHTML=resolved==='nord-dark'?'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>':'<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
}
function cycleTheme(){
  const c=getConfig();const order=['nord-dark','nord-light','system'];
  c.theme=order[(order.indexOf(c.theme)%3+1)%3]||'nord-dark';
  saveConfig(c);applyTheme(c.theme);
  const sel=document.getElementById('settingsTheme');if(sel)sel.value=c.theme
}
function setTheme(t){const c=getConfig();c.theme=t;saveConfig(c);applyTheme(t)}
if(window.matchMedia)window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{
  const c=getConfig();if(c.theme==='system')applyTheme('system')
});
// --- Navigation ---
let currentPage='dashboard';
function navigateTo(page){
  if(currentPage==='task-detail'&&detailDirty&&page!=='task-detail'){
    if(!confirm('You have unsaved changes. Leave without saving?'))return
  }
  currentPage=page;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const el=document.getElementById('page-'+page);
  if(el)el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const nav=document.querySelector(`.nav-item[data-page="${page}"]`);
  if(nav)nav.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarRing').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('open');
  renderCurrentPage()
}
function renderCurrentPage(){
  const titles={dashboard:'Dashboard',tasks:'Tasks','task-detail':'Task Detail',bin:'Bin',log:'Activity',settings:'Settings'};
  const titleEl=document.getElementById('topbarTitle');
  if(titleEl)titleEl.textContent=titles[currentPage]||'';
  switch(currentPage){
    case'dashboard':renderDashboard();break;
    case'tasks':renderCurrentView();break;
    case'task-detail':renderTaskDetailPage();break;
    case'bin':renderBin();break;
    case'log':renderActivityLog();break;
    case'settings':renderSettings();break;
  }
}

// --- Sidebar ---
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarRing').classList.toggle('open');
  document.getElementById('sidebarBackdrop').classList.toggle('open');
  const r=document.getElementById('sidebarRing');
  if(r&&r.classList.contains('ring-hint')){r.classList.remove('ring-hint');const c=getConfig();c.ring_hint_seen=true;saveConfig(c)}
}

// --- Global Search ---
let searchTimeout;
function onGlobalSearch(q){
  clearTimeout(searchTimeout);
  searchTimeout=setTimeout(()=>{navigateTo('tasks');renderCurrentView()},300)
}

// ==================== RENDER FUNCTIONS ====================

// --- Dashboard ---
function renderDashboard(){
  const tasks=getTasks().filter(t=>!t.deleted_at);
  renderNotes();
  renderDashFocusGoals();
  renderDashMyDay(tasks);
  renderDashWeekProgress();
  renderDashStreak();
  renderDashHeatmap(tasks);
  const area=document.getElementById('dashAnalytics');
  const existing=area.querySelector('.dash-empty-frog');
  if(existing)existing.remove();
  if(tasks.length===0&&frogEnabled){
    const d=document.createElement('div');d.className='dash-empty-frog';
    d.innerHTML='<svg viewBox="0 0 64 56"><path d="M17,44 L12,49 M17,44 L16,50 M17,44 L22,49" stroke="#3a7a3c" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M47,44 L42,49 M47,44 L46,50 M47,44 L52,49" stroke="#3a7a3c" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="32" cy="30" r="22" fill="#3a7a3c"/><circle cx="32" cy="30" r="20" fill="#7bc67e"/><ellipse cx="32" cy="37" rx="10" ry="8" fill="#d4f5c4"/><circle cx="20" cy="12" r="9" fill="#3a7a3c"/><circle cx="20" cy="12" r="7.5" fill="#7bc67e"/><circle cx="20" cy="12" r="4" fill="#1a1a1a"/><circle cx="18.5" cy="10.5" r="1.3" fill="white"/><circle cx="44" cy="12" r="9" fill="#3a7a3c"/><circle cx="44" cy="12" r="7.5" fill="#7bc67e"/><circle cx="44" cy="12" r="4" fill="#1a1a1a"/><circle cx="42.5" cy="10.5" r="1.3" fill="white"/><ellipse cx="14" cy="29" rx="4" ry="3" fill="#f5b8a0" opacity=".45"/><ellipse cx="50" cy="29" rx="4" ry="3" fill="#f5b8a0" opacity=".45"/><path d="M26,33 Q29,36 32,33 Q35,36 38,33" fill="none" stroke="#3a7a3c" stroke-width="1.2" stroke-linecap="round"/><rect x="24" y="26" width="16" height="14" rx="1" fill="#d4f5c4" stroke="#3a7a3c" stroke-width=".8"/><line x1="26" y1="29" x2="38" y2="29" stroke="#3a7a3c" stroke-width=".6"/><line x1="26" y1="32" x2="35" y2="32" stroke="#3a7a3c" stroke-width=".6"/><line x1="26" y1="35" x2="32" y2="35" stroke="#3a7a3c" stroke-width=".6"/></svg><span>Frog is reading... waiting for your first task!</span>';
    area.appendChild(d)
  }
}
function pickRandomTask(){
  const tasks=getTasks().filter(t=>!t.deleted_at&&t.status!=='done'&&t.status!=='cancelled');
  if(!tasks.length){document.getElementById('dashRouletteResult').textContent='No tasks to pick!';return}
  const p=tasks[Math.floor(Math.random()*tasks.length)];
  const el=document.getElementById('dashRouletteResult');
  el.innerHTML=`<a href="#" onclick="showTaskDetail('${p.id}');return false" style="color:var(--accent);text-decoration:none">→ ${escHtml(p.title)}</a>`;
  setTimeout(()=>el.innerHTML='',6000)
}
function showFocusMode(){
  const tasks=getTasks().filter(t=>!t.deleted_at);
  const today=todayStr();
  const focus=getFocus();const focusIds=focus[today]||[];
  const focusGoals=focusIds.map(id=>tasks.find(t=>t.id===id)).filter(t=>t&&t.status!=='done'&&t.status!=='cancelled');
  const overdue=tasks.filter(t=>t.due_date&&t.due_date<today&&t.status!=='done'&&t.status!=='cancelled').sort((a,b)=>(a.due_date<b.due_date?-1:1));
  const dueToday=tasks.filter(t=>t.due_date===today&&t.status!=='done'&&t.status!=='cancelled');
  const active=tasks.filter(t=>t.status!=='done'&&t.status!=='cancelled');
  let html='<div style="max-width:500px;margin:0 auto">';
  if(!active.length){
    html+='<div class="empty-state" style="padding:40px 0"><p class="text-dim">Nothing active. Enjoy the breather.</p></div>'
  }else{
    html+='<div style="text-align:center;margin-bottom:24px"><div style="font-size:15px;color:var(--text-dim);margin-bottom:4px">What matters most right now?</div></div>';
    if(focusGoals.length){
      html+='<div style="margin-bottom:20px"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--green);font-weight:600;margin-bottom:8px">Your focus goals</div>';
      focusGoals.forEach(t=>{html+=`<div class="focus-item" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);margin-bottom:4px;cursor:pointer" onclick="closeModal();showTaskDetail('${t.id}')"><span class="priority-dot ${t.priority||'medium'}"></span><span style="flex:1;font-size:14px">${escHtml(t.title)}</span></div>`});
      html+='</div>'
    }
    if(overdue.length){
      html+='<div style="margin-bottom:20px"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--red);font-weight:600;margin-bottom:8px">Overdue ('+overdue.length+')</div>';
      overdue.slice(0,3).forEach(t=>{html+=`<div class="focus-item" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);margin-bottom:4px;cursor:pointer" onclick="closeModal();showTaskDetail('${t.id}')"><span class="priority-dot ${t.priority||'medium'}"></span><span style="flex:1;font-size:14px">${escHtml(t.title)}</span><span class="text-dim text-sm">${fmtDate(t.due_date)}</span></div>`});
      if(overdue.length>3)html+='<div class="text-dim text-sm" style="padding:4px 12px">+'+(overdue.length-3)+' more</div>';
      html+='</div>'
    }
    if(dueToday.length){
      html+='<div style="margin-bottom:20px"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--accent);font-weight:600;margin-bottom:8px">Due today</div>';
      dueToday.forEach(t=>{html+=`<div class="focus-item" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);margin-bottom:4px;cursor:pointer" onclick="closeModal();showTaskDetail('${t.id}')"><span class="priority-dot ${t.priority||'medium'}"></span><span style="flex:1;font-size:14px">${escHtml(t.title)}</span></div>`});
      html+='</div>'
    }
    if(!focusGoals.length&&!overdue.length&&!dueToday.length){
      html+='<div class="empty-state" style="padding:20px 0"><p class="text-dim text-sm">Nothing overdue or due today.</p></div>'
    }
    html+='<div style="text-align:center;padding-top:12px;border-top:1px solid var(--border)"><button class="roulette-btn" onclick="closeModal();pickRandomTask();navigateTo(\'dashboard\')" style="margin:0 auto"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8L8 16M8 8l8 8"/></svg>Just pick one for me</button></div>'
  }
  html+='</div>';
  showModal(html)
}
function renderDashHeatmap(tasks){
  const today=new Date();const ds=today.toISOString().slice(0,10);
  const start=new Date(today);start.setDate(start.getDate()-370);start.setDate(start.getDate()-start.getDay());
  const doneMap={};tasks.filter(t=>t.status==='done').forEach(t=>{const d=t.updated_at?t.updated_at.slice(0,10):null;if(d)doneMap[d]=(doneMap[d]||0)+1});
  if(Object.keys(doneMap).length===0){document.getElementById('dashRecap').innerHTML='<div class="heatmap-empty"><span class="heatmap-empty-title">Activity map</span><span class="heatmap-empty-hint">Complete a task to light up your year.</span><div class="heatmap-empty-legend" aria-hidden="true"><span class="cell"></span><span class="cell l1"></span><span class="cell l2"></span><span class="cell l3"></span><span class="cell l4"></span></div></div>';return}
  const ms=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];const dl=['','Mon','','Wed','','Fri',''];
  let html='<div class="heatmap-wrapper"><table class="heatmap-table"><tr><th></th>';
  for(let w=0;w<53;w++){const d=new Date(start);d.setDate(d.getDate()+w*7);html+=`<th>${d.getDate()<=7?ms[d.getMonth()]:''}</th>`}
  html+='</tr>';
  for(let d=0;d<7;d++){
    html+=`<tr><td style="padding-right:3px">${dl[d]}</td>`;
    for(let w=0;w<53;w++){
      const cd=new Date(start);cd.setDate(cd.getDate()+w*7+d);const key=cd.toISOString().slice(0,10);
      const count=doneMap[key]||0;const lvl=count===0?'':count===1?'l1':count<=3?'l2':count<=6?'l3':'l4';
      html+=`<td><div class="heatmap-cell${lvl?' '+lvl:''}${key===ds?' heatmap-today':''}"></div></td>`
    }
    html+='</tr>'
  }
  html+=`</table><div class="heatmap-legend"><span>Less</span><div class="cell"></div><div class="cell l1"></div><div class="cell l2"></div><div class="cell l3"></div><div class="cell l4"></div><span>More</span></div></div>`;
  document.getElementById('dashRecap').innerHTML=html
}


function renderDashMyDay(tasks){
  const today=todayStr();
  const overdue=tasks.filter(t=>t.due_date&&t.due_date<today&&t.status!=='done'&&t.status!=='cancelled');
  const dueToday=tasks.filter(t=>t.due_date===today&&t.status!=='done'&&t.status!=='cancelled');
  const focus=getFocus();const focusIds=focus[today]||[];
  const focusGoals=focusIds.map(id=>tasks.find(t=>t.id===id)).filter(Boolean);
  let html='';
  if(overdue.length){
    html+=`<div style="color:var(--red);font-size:12px;font-weight:600;margin-bottom:4px">Overdue (${overdue.length})</div>`;
    overdue.slice(0,5).forEach(t=>{html+=`<div class="due-row"><span class="priority-dot ${t.priority||'medium'}"></span><a href="#" onclick="showTaskDetail('${t.id}');return false" class="task-title">${escHtml(t.title)}</a><span class="text-dim text-sm">${fmtDate(t.due_date)}</span></div>`})
  }
  if(dueToday.length){
    html+=`<div style="color:var(--accent);font-size:12px;font-weight:600;margin-bottom:4px;margin-top:${overdue.length?'8px':'0'}">Due Today (${dueToday.length})</div>`;
    dueToday.forEach(t=>{html+=`<div class="due-row"><span class="priority-dot ${t.priority||'medium'}"></span><a href="#" onclick="showTaskDetail('${t.id}');return false" class="task-title">${escHtml(t.title)}</a></div>`})
  }
  if(focusGoals.length){
    html+=`<div style="color:var(--green);font-size:12px;font-weight:600;margin-bottom:4px;margin-top:${(overdue.length||dueToday.length)?'8px':'0'}">Focus Goals (${focusGoals.filter(g=>g.status==='done').length} of ${focusGoals.length} done)</div>`;
    focusGoals.forEach(t=>{html+=`<div class="due-row" style="${t.status==='done'?'opacity:.5':''}"><span class="priority-dot ${t.priority||'medium'}"></span><a href="#" onclick="showTaskDetail('${t.id}');return false" class="task-title" style="${t.status==='done'?'text-decoration:line-through':''}">${escHtml(t.title)}</a></div>`})
  }
  if(!overdue.length&&!dueToday.length&&!focusGoals.length)html='<span class="text-dim text-sm">All clear for today! 🎯</span>';
  const card=document.getElementById('dashMyDayList');
  const header=card.querySelector('.text-dim');
  card.innerHTML='';
  if(header)card.appendChild(header);
  const content=document.createElement('div');
  content.innerHTML=html;
  card.appendChild(content);
}
function renderDashWeekProgress(){
  const activity=getActivity();
  const now=new Date();
  const weekAgo=new Date(now);weekAgo.setDate(weekAgo.getDate()-7);
  const weekAgoStr=weekAgo.toISOString();
  const twoWeeksAgo=new Date(now);twoWeeksAgo.setDate(twoWeeksAgo.getDate()-14);
  const twoWeeksAgoStr=twoWeeksAgo.toISOString();
  const thisWeek=activity.filter(e=>e.action==='completed'&&e.timestamp>=weekAgoStr).length;
  const lastWeek=activity.filter(e=>e.action==='completed'&&e.timestamp>=twoWeeksAgoStr&&e.timestamp<weekAgoStr).length;
  const el=document.getElementById('dashWeekContent');
  if(!el)return;
  if(thisWeek===0&&lastWeek===0){el.innerHTML='<div class="text-dim text-sm">Completed tasks this week will appear here.</div>';return}
  const trend=thisWeek>lastWeek?'up':thisWeek<lastWeek?'down':'same';
  const trendIcon=thisWeek>lastWeek?'↑':thisWeek<lastWeek?'↓':'=';
  const trendColor=thisWeek>lastWeek?'var(--green)':thisWeek<lastWeek?'var(--red)':'var(--text-dim)';
  el.innerHTML=`<div style="font-size:28px;font-weight:700;font-family:var(--font-serif)">${thisWeek}</div><div class="text-dim text-sm">tasks completed <span style="color:${trendColor}">${trendIcon} ${lastWeek} last week</span></div>`
}
function renderDashStreak(){
  const el=document.getElementById('dashStreak');
  if(!el)return;
  const activity=getActivity();
  const completed=activity.filter(e=>e.action==='completed');
  if(!completed.length){el.innerHTML='';return}
  const days=new Set();
  completed.forEach(e=>{const d=e.timestamp.slice(0,10);days.add(d)});
  let streak=0;
  const today=new Date();
  for(let d=new Date(today);;d.setDate(d.getDate()-1)){
    const ds=d.toISOString().slice(0,10);
    if(days.has(ds)){streak++}
    else{
      if(streak===0&&ds===today.toISOString().slice(0,10))continue;
      break
    }
  }
  if(streak===0){el.innerHTML='';return}
  el.innerHTML=`<div style="display:flex;align-items:center;gap:6px"><span style="font-size:20px">${streak>=7?'🔥':'⚡'}</span><span style="font-size:13px"><strong style="font-family:var(--font-serif);font-size:16px">${streak}</strong> day${streak!==1?'s':''} streak</span></div>`
}
// --- Notes ---
function renderNotes(){
  const notes=getNotes().sort((a,b)=>b.pinned-a.pinned||new Date(b.updated_at)-new Date(a.updated_at));
  document.getElementById('scratchList').innerHTML=notes.map(n=>`<div class="scratch-note"><div class="scratch-note-text">${escHtml(n.text)}</div><div class="scratch-note-actions"><button class="icon-btn" onclick="togglePinNote('${n.id}')" title="${n.pinned?'Unpin':'Pin'}" style="width:24px;height:24px;opacity:${n.pinned?1:0.4}">📌</button><button class="icon-btn" onclick="deleteNote('${n.id}')" title="Delete" style="width:24px;height:24px">✕</button></div></div>`).join('')
}
function addNote(){
  const inp=document.getElementById('scratchInput');
  if(!inp.value.trim())return;
  const notes=getNotes();notes.push({id:uid(),text:inp.value.trim(),pinned:false,created_at:nowISO(),updated_at:nowISO()});
  saveNotes(notes);inp.value='';renderNotes()
}
function togglePinNote(id){
  const notes=getNotes();const n=notes.find(x=>x.id===id);if(n){n.pinned=!n.pinned;n.updated_at=nowISO();saveNotes(notes)}renderNotes()
}
function deleteNote(id){
  saveNotes(getNotes().filter(n=>n.id!==id));renderNotes()
}
function renderDashFocusGoals(){
  const tasks=getTasks().filter(t=>!t.deleted_at&&t.status!=='done'&&t.status!=='cancelled');
  const focus=getFocus();const today=todayStr();
  const ids=focus[today]||[];const goals=ids.map(id=>getTasks().find(t=>t.id===id)).filter(Boolean);
  const doneCount=goals.filter(t=>t.status==='done').length;
  const selHtml=`<div class="goal-selector" style="margin-bottom:8px"><select id="dashFocusSelect" style="flex:1">${tasks.map(t=>`<option value="${t.id}">${escHtml(t.title)}</option>`).join('')}</select><button class="btn btn-primary btn-sm" onclick="addDashFocusGoal()">Add</button></div>`;
  const cntHtml=goals.length?`<div style="font-size:13px;color:var(--text-dim);margin-bottom:8px">${doneCount} of ${goals.length} done</div>`:'';
  const cardsHtml=goals.length?goals.map(t=>{
    if(t.status==='cancelled')return`<div class="focus-card" style="margin-bottom:4px;opacity:0.6"><span class="priority-dot ${t.priority||'medium'}"></span><div class="focus-card-info"><div class="focus-card-title" style="color:var(--red)">${escHtml(t.title)} <span class="text-sm" style="color:var(--red)">(cancelled)</span></div><div class="focus-card-meta">${fmtDate(t.due_date)}${(t.tags||[]).length?' · '+t.tags.join(', '):''}</div></div><button class="btn btn-secondary btn-sm" onclick="reopenFocusTask('${t.id}')">↻ Reopen</button></div>`;
    return`<div class="focus-card${t.status==='done'?' done':''}" style="margin-bottom:4px"><span class="priority-dot ${t.priority||'medium'}"></span><div class="focus-card-info"><div class="focus-card-title" onclick="cycleDashFocusStatus('${t.id}')" style="cursor:pointer${t.status==='done'?';text-decoration:line-through;color:var(--text-dim)':''}">${escHtml(t.title)}</div><div class="focus-card-meta">${fmtDate(t.due_date)}${(t.tags||[]).length?' · '+t.tags.join(', '):''}</div></div></div>`
  }).join(''):'<div style="padding:12px;background:var(--bg);border-radius:var(--radius);border:1px dashed var(--border)"><div style="font-size:13px;margin-bottom:4px">No focus goals for today</div><div class="text-dim text-sm">Pick up to 3 tasks above to prioritize what matters today.</div></div>';
  if(goals.length&&doneCount===goals.length)fireConfetti();
  document.getElementById('dashFocusGoals').innerHTML=selHtml+cntHtml+cardsHtml
}

// --- Task List ---
let taskView='list',taskSorts=[],taskColumns=JSON.parse(localStorage.getItem('doable_taskColumns')||'["priority","status","due"]'),taskPage=1,taskSearch='';

function switchTaskView(v){
  taskView=v;document.querySelectorAll('.view-toggle .icon-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  ['taskListView','taskKanbanView','taskCalendarView','taskEisenhowerView'].forEach(id=>document.getElementById(id).style.display='none');
  document.getElementById('task'+v.charAt(0).toUpperCase()+v.slice(1)+'View').style.display='';
  taskPage=1;renderCurrentView()
}
function getFilteredTasks(){
  let tasks=getTasks().filter(t=>!t.deleted_at);
  tasks=tasks.filter(t=>!t.parent_id||!foldedParents.has(t.parent_id));
  const cfg=getConfig();taskSearch=document.getElementById('globalSearch')?.value||'';
  const today=todayStr();
  if(taskSearch){const q=taskSearch.toLowerCase();tasks=tasks.filter(t=>t.title.toLowerCase().includes(q)||(t.description||'').toLowerCase().includes(q))}
  // Data filters
  if(taskFilter.status!=='all')tasks=tasks.filter(t=>t.status===taskFilter.status);
  if(taskFilter.priority!=='all')tasks=tasks.filter(t=>t.priority===taskFilter.priority);
  if(taskFilter.category!=='all')tasks=tasks.filter(t=>t.category===taskFilter.category);
  if(taskFilter.series!=='all')tasks=tasks.filter(t=>t.series_id===taskFilter.series);
  if(taskFilter.due!=='all'){
    if(taskFilter.due==='today')tasks=tasks.filter(t=>t.due_date===today);
    else if(taskFilter.due==='overdue')tasks=tasks.filter(t=>t.due_date&&t.due_date<today);
    else if(taskFilter.due==='week'){
      const end=new Date();end.setDate(end.getDate()+(7-end.getDay()));const eow=end.toISOString().slice(0,10);
      tasks=tasks.filter(t=>t.due_date&&t.due_date<=eow);
    }else if(taskFilter.due==='month'){
      const end=new Date();end.setMonth(end.getMonth()+1);end.setDate(0);const eom=end.toISOString().slice(0,10);
      tasks=tasks.filter(t=>t.due_date&&t.due_date<=eom);
    }else if(taskFilter.due==='none')tasks=tasks.filter(t=>!t.due_date)
  }
  // Sort
  const sorts=taskSorts.length?taskSorts:[{field:'created_at',dir:'desc'}];
  tasks.sort((a,b)=>{
    for(const s of sorts){
      let va=a[s.field],vb=b[s.field];
      if(s.field==='priority'){const p={high:0,medium:1,low:2};va=p[va]||1;vb=p[vb]||1}
      else if(s.field==='due_date'){va=va||'9999-99-99';vb=vb||'9999-99-99'}
      else if(s.field==='status'){const st={not_started:0,in_progress:1,done:2,cancelled:3};va=st[va]||0;vb=st[vb]||0}
      else{va=String(va||'');vb=String(vb||'')}
      if(va!==vb)return s.dir==='desc'?(va<vb?1:-1):(va<vb?-1:1)
    }
    return 0
  });
  return tasks
}
function renderListView(){
  const tasks=getFilteredTasks();const cfg=getConfig();const perPage=cfg.per_page||25;
  const totalPages=Math.ceil(tasks.length/perPage)||1;
  taskPage=Math.min(taskPage,totalPages);
  const start=(taskPage-1)*perPage;const pageTasks=tasks.slice(start,start+perPage);
  const showTags=taskColumns.includes('tags');
  const showCat=taskColumns.includes('category');
  const showAnno=taskColumns.includes('annotations');
  const showDeps=taskColumns.includes('dependencies');
  const showRecur=taskColumns.includes('recur');
  let html='';
  if(!pageTasks.length)html='<div class="empty-state"><p class="text-dim">No tasks match your filters.</p></div>';
    else{
      let cols='<th style="width:20px"></th><th style="width:36px"></th><th>Title</th><th style="width:80px">Priority</th><th style="width:100px">Status</th><th style="width:120px">Due</th>';
      if(showTags)cols+='<th style="width:120px">Tags</th>';
      if(showCat)cols+='<th style="width:100px">Category</th>';
  if(taskColumns.includes('time'))cols+='<th style="width:80px">Time</th>';
  if(showAnno)cols+='<th style="width:90px">Annotations</th>';
  if(showDeps)cols+='<th style="width:60px">Deps</th>';
  if(showRecur)cols+='<th style="width:80px">Recur</th>';
      html=`<table class="task-table"><thead><tr>${cols}</tr></thead><tbody>${pageTasks.map(t=>renderTaskRow(t)).join('')}</tbody></table>`
    }
  document.getElementById('taskListView').innerHTML=html;
  document.getElementById('taskPagination').innerHTML=totalPages>1?`<button class="btn btn-ghost btn-sm" onclick="taskPage=Math.max(1,taskPage-1);renderListView()" ${taskPage<=1?'disabled':''}>Prev</button><span>Page ${taskPage} of ${totalPages}</span><button class="btn btn-ghost btn-sm" onclick="taskPage=Math.min(${totalPages},taskPage+1);renderListView()" ${taskPage>=totalPages?'disabled':''}>Next</button>`:''
}
var foldedParents=new Set();
function renderTaskRow(t){
  const showTags=taskColumns.includes('tags');
  const showCat=taskColumns.includes('category');
  const showAnno=taskColumns.includes('annotations');
  const showDeps=taskColumns.includes('dependencies');
  const showRecur=taskColumns.includes('recur');
  const tasks=getTasks();
  const hasChildren=tasks.some(x=>x.parent_id===t.id&&!x.deleted_at);
  const isFolded=foldedParents.has(t.id);
  let titleHtml='';
  if(hasChildren)titleHtml+=`<span style="cursor:pointer;font-size:11px;margin-right:4px;user-select:none" onclick="event.stopPropagation();${isFolded?'foldedParents.delete':'foldedParents.add'}('${t.id}');renderCurrentView()">${isFolded?'▸':'▾'}</span>`;
  if(t.parent_id)titleHtml+='<span style="margin-right:4px;font-size:12px">↳</span>';
  titleHtml+=`<span class="task-title" onclick="showTaskDetail('${t.id}')">${escHtml(t.title)}</span>`;
  let cells=`<td><span class="priority-dot ${t.priority||'medium'}"></span></td><td style="text-align:center"><input type="checkbox" ${t.status==='done'?'checked':''} onchange="toggleTaskDone(this,'${t.id}')" title="Mark done"></td><td>${titleHtml}</td><td class="text-dim text-sm">${t.priority||'medium'}</td><td>${statusBadge(t.status)}</td><td class="text-sm" style="color:${t.due_date&&t.due_date<todayStr()&&t.status!=='done'&&t.status!=='cancelled'?'var(--red)':t.due_date===todayStr()?'var(--orange)':'var(--text-dim)'}">${fmtDate(t.due_date)}</td>`;
  if(taskColumns.includes('time'))cells+=`<td class="text-sm text-dim">${t.time||'—'}</td>`;
  if(showTags)cells+=`<td>${(t.tags||[]).map(tag=>`<span class="tag-pill">${escHtml(tag)}</span>`).join('')}</td>`;
  if(showCat)cells+=`<td class="text-dim text-sm">${t.category?categoryDot(t.category)+escHtml(t.category):'—'}</td>`;
  if(showAnno)cells+=`<td class="text-dim text-sm">${(t.annotations||[]).length||'—'}</td>`;
  if(showDeps){const blocksCount=t.status==='done'||t.status==='cancelled'?0:tasks.filter(x=>(x.depends_on||[]).includes(t.id)&&x.status!=='done'&&x.status!=='cancelled'&&!x.deleted_at).length;cells+=`<td class="text-dim text-sm">${(t.depends_on||[]).length||'—'}${blocksCount?` <span style="color:var(--orange);font-weight:600" title="Blocks ${blocksCount} task${blocksCount!==1?'s':''}">→${blocksCount}</span>`:''}</td>`}
  if(showRecur)cells+=`<td class="text-dim text-sm">${t.recur?escHtml(t.recur):'—'}</td>`;
  const style=t.parent_id?' style="padding-left:32px"':'';
  return `<tr class="${(t.status==='done'||t.status==='cancelled')?'task-row-done':''}"${style}>${cells}</tr>`
}
function statusBadge(s){
  const m={not_started:'Not started',in_progress:'In progress',done:'Done',cancelled:'Cancelled'};const c={not_started:'var(--text-dim)',in_progress:'var(--orange)',done:'var(--green)',cancelled:'var(--red)'};
  return `<span class="badge" style="color:${c[s]||'var(--text-dim)'}">${m[s]||s}</span>`
}
// --- Modal ---
let _modalPrevFocus=null;
function _modalFocusable(){
  return Array.from(document.getElementById('modalContent').querySelectorAll('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])')).filter(el=>el.offsetParent!==null&&!el.disabled)
}
function showModal(html){
  document.getElementById('modalContent').innerHTML=html;
  document.getElementById('modalOverlay').style.display='';
  _modalPrevFocus=document.activeElement;
  const f=_modalFocusable();
  if(f.length)setTimeout(()=>f[0].focus(),0);
  if(frogEnabled){
    const el=document.getElementById('frogCharacter');
    const overlay=document.getElementById('modalOverlay');
    const rect=overlay.getBoundingClientRect();
    el.classList.add('frog-modal-peek');
    el.style.left=(rect.left+rect.width/2-30)+'px';
    el.style.top=(rect.top-30)+'px';
    setFrogState('peek')
  }
}
function closeModal(){
  document.getElementById('modalOverlay').style.display='none';
  if(_modalPrevFocus&&_modalPrevFocus.focus)_modalPrevFocus.focus();
  _modalPrevFocus=null;
  if(frogEnabled){
    const el=document.getElementById('frogCharacter');
    el.classList.remove('frog-modal-peek');
    const p=frogRandPos();
    el.style.left=p.x+'px';el.style.top=p.y+'px';
    setFrogState('idle')
  }
}
document.addEventListener('keydown',e=>{
  const ov=document.getElementById('modalOverlay');
  if(!ov||ov.style.display==='none')return;
  if(e.key==='Escape'){closeModal();return}
  if(e.key==='Tab'){
    const f=_modalFocusable();
    if(!f.length)return;
    const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});

// --- Toast ---
function toast(msg,type='info'){
  const c=document.getElementById('toastContainer');
  const el=document.createElement('div');el.className='toast '+type;
  el.innerHTML='<span class="toast-rider"><svg viewBox="0 0 64 56"><circle cx="32" cy="30" r="20" fill="#7bc67e"/><circle cx="20" cy="12" r="7.5" fill="#7bc67e"/><circle cx="44" cy="12" r="7.5" fill="#7bc67e"/><circle cx="20" cy="12" r="3.5" fill="#1a1a1a"/><circle cx="44" cy="12" r="3.5" fill="#1a1a1a"/><circle cx="18.5" cy="10.5" r="1.3" fill="white"/><circle cx="42.5" cy="10.5" r="1.3" fill="white"/><ellipse cx="32" cy="37" rx="10" ry="8" fill="#d4f5c4"/><path d="M26,33 Q29,36 32,33 Q35,36 38,33" fill="none" stroke="#3a7a3c" stroke-width="1.2" stroke-linecap="round"/></svg> '+escHtml(msg)+'</span>';
  c.appendChild(el);setTimeout(()=>{el.style.opacity='0';el.style.transition='opacity .3s';setTimeout(()=>el.remove(),300)},3000)
}

// --- Confetti ---
function fireConfetti(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const c=document.getElementById('confettiContainer');
  const colors=['var(--red)','var(--accent)','var(--green)','var(--orange)','var(--yellow)','var(--purple)'];
  for(let i=0;i<60;i++){
    const el=document.createElement('div');el.className='confetti-piece';
    el.style.left=Math.random()*100+'%';
    el.style.background=colors[Math.floor(Math.random()*colors.length)];
    el.style.animationDelay=Math.random()*2+'s';
    el.style.borderRadius=Math.random()>.5?'50%':'2px';
    c.appendChild(el)
  }
  setTimeout(()=>c.innerHTML='',4000)
}

// --- Sample data ---
function getSampleTasks(){
  const sid=()=>uid();
  const s={welcome:sid(),homepage:sid(),loginBug:sid(),weeklyReview:sid(),depReport:sid(),deploy:sid(),morningJog:sid(),deepRead:sid(),budget:sid(),apiDocs:sid(),errorHandling:sid(),authRefactor:sid(),teamMetrics:sid(),blogPost:sid(),grocery:sid(),meditate:sid(),garden:sid(),invoice:sid(),portfolio:sid(),podcast:sid(),standup:sid()};
  const fut=new Date();fut.setDate(fut.getDate()+3);const futStr=fut.toISOString().slice(0,10);
  const nextWk=new Date();nextWk.setDate(nextWk.getDate()+9);const nextWkStr=nextWk.toISOString().slice(0,10);
  const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);const yestStr=yesterday.toISOString().slice(0,10);
  const d2ago=new Date();d2ago.setDate(d2ago.getDate()-2);const d2agoStr=d2ago.toISOString();
  const lastWk=new Date();lastWk.setDate(lastWk.getDate()-7);const lastWkStr=lastWk.toISOString().slice(0,10);
  const lastMth=new Date();lastMth.setMonth(lastMth.getMonth()-1);const lastMthStr=lastMth.toISOString();
  const _sample=true;
  return [
    {id:s.welcome,title:'Welcome to Do-able!',description:'This is your first task. Edit, tag, annotate, or mark it done to explore the app.',status:'done',priority:'medium',due_date:yestStr,category:'Getting Started',tags:['welcome','tutorial'],_sample,annotations:[{id:sid(),text:'Checked the detail page — nice layout.',timestamp:nowISO()}],created_at:d2agoStr,updated_at:nowISO(),deleted_at:null},
    {id:s.homepage,title:'Design homepage mockup',description:'Create wireframes for the landing page refresh. Include hero, feature grid, testimonial carousel.',status:'in_progress',priority:'high',due_date:futStr,category:'Design',tags:['design','frontend','mockup'],_sample,annotations:[{id:sid(),text:'Draft v1 shared in Figma',timestamp:nowISO()},{id:sid(),text:'Client wants more whitespace',timestamp:nowISO()}],created_at:lastWkStr+'T09:00:00',updated_at:nowISO(),deleted_at:null},
    {id:s.loginBug,title:'Fix login bug (Safari 403)',description:'Safari users get a 403 on /auth/login. Cookie SameSite issue suspected.',status:'not_started',priority:'high',due_date:todayStr(),category:'Development',tags:['bug','urgent','backend','security'],_sample,annotations:[{id:sid(),text:'Reproduced in Safari 18 on macOS; Chrome + Firefox unaffected.',timestamp:nowISO()},{id:sid(),text:'Root cause: SameSite=None missing Secure flag on dev cert',timestamp:nowISO()}],created_at:nowISO(),updated_at:nowISO(),deleted_at:null},
    {id:s.weeklyReview,title:'Weekly review notes',description:'Prepare agenda for Friday team sync. Discuss sprint progress and blockers.',status:'not_started',priority:'medium',due_date:futStr,category:'Meetings',tags:['recurring','team','sync'],_sample,recur:'weekly',annotations:[],created_at:lastWkStr+'T14:00:00',updated_at:nowISO(),deleted_at:null},
    {id:s.depReport,title:'Deprecated draft report',description:'Q1 analysis draft — superseded by the final version.',status:'done',priority:'low',due_date:'',category:'Reports',tags:['old','archive'],_sample,annotations:[],created_at:lastMthStr,updated_at:lastMthStr,deleted_at:d2agoStr},
    {id:s.deploy,title:'Deploy v2 to staging',description:'Push the current feature branch to staging for QA. Needs mockup sign-off first.',status:'not_started',priority:'high',due_date:futStr,category:'Development',tags:['deploy','devops'],_sample,depends_on:[s.homepage],annotations:[{id:sid(),text:'Coordinated with DevOps — they are ready for Friday',timestamp:nowISO()}],created_at:nowISO(),updated_at:nowISO(),deleted_at:null},
    {id:s.morningJog,title:'Morning jog',description:'30 min run before breakfast. Loop around the park.',status:'done',priority:'medium',due_date:yestStr,start_date:yestStr,time:'06:30',category:'Health',tags:['exercise','routine'],_sample,recur:'daily',annotations:[{id:sid(),text:'5.2 km in 28 min — new PR!',timestamp:nowISO()}],created_at:lastWkStr+'T06:30:00',updated_at:nowISO(),deleted_at:null},
    {id:s.deepRead,title:'Read "Deep Work"',description:'Finish chapters 5-7 this week. Take notes on the four deep work philosophies.',status:'in_progress',priority:'low',due_date:nextWkStr,category:'Personal',tags:['reading','learning','focus'],_sample,annotations:[{id:sid(),text:'Ch5: Monastic vs Bimodal — I lean bimodal',timestamp:nowISO()}],created_at:lastWkStr+'T20:00:00',updated_at:nowISO(),deleted_at:null},
    {id:s.budget,title:'Quarterly budget review',description:'Review Q2 spending against plan. Flag any line items over 10% of budget.',status:'not_started',priority:'high',due_date:nextWkStr,category:'Finance',tags:['budget','planning','review'],_sample,annotations:[],created_at:nowISO(),updated_at:nowISO(),deleted_at:null},
    {id:s.apiDocs,title:'Write API docs',description:'Document the new REST endpoints for the team. Include request/response examples.',status:'done',priority:'medium',due_date:lastWkStr,category:'Development',tags:['docs','api','backend'],_sample,annotations:[{id:sid(),text:'Published to internal wiki — link in #dev channel',timestamp:nowISO()}],created_at:lastMthStr,updated_at:lastWkStr+'T17:30:00',deleted_at:null},
    {id:s.errorHandling,title:'Update error handling middleware',description:'Add global try-catch wrapper for async route handlers. Return consistent error JSON shape.',status:'not_started',priority:'medium',due_date:futStr,category:'Development',tags:['backend','refactor'],_sample,depends_on:[s.loginBug],annotations:[],created_at:nowISO(),updated_at:nowISO(),deleted_at:null},
    {id:s.authRefactor,title:'Refactor auth middleware',description:'Extract JWT validation into reusable middleware. Add rate limiting.',status:'not_started',priority:'medium',due_date:nextWkStr,category:'Development',tags:['backend','security','refactor'],_sample,depends_on:[s.errorHandling],annotations:[],created_at:nowISO(),updated_at:nowISO(),deleted_at:null},
    {id:s.teamMetrics,title:'Compile team metrics',description:'Gather velocity, burndown, and cycle time data for the monthly stakeholder deck.',status:'not_started',priority:'medium',due_date:futStr,category:'Reports',tags:['metrics','team','analysis'],_sample,recur:'monthly',depends_on:[s.weeklyReview],annotations:[{id:sid(),text:'Jira dashboard already configured — just need to export',timestamp:nowISO()}],created_at:lastWkStr+'T11:00:00',updated_at:nowISO(),deleted_at:null},
    {id:s.blogPost,title:'Write blog post on accessibility',description:'Draft a post about WCAG 2.2 compliance — what changed and how to audit.',status:'in_progress',priority:'low',due_date:nextWkStr,category:'Content',tags:['writing','blog','a11y'],_sample,annotations:[{id:sid(),text:'Outline approved by marketing. Target: 1500 words.',timestamp:nowISO()}],created_at:nowISO(),updated_at:nowISO(),deleted_at:null},
    {id:s.grocery,title:'Grocery shopping',description:'Weekly run: veggies, eggs, milk, bread, oats.',status:'not_started',priority:'low',due_date:todayStr(),category:'Personal',tags:['errand','routine'],_sample,recur:'weekly',annotations:[],created_at:nowISO(),updated_at:nowISO(),deleted_at:null},
    {id:s.meditate,title:'Evening meditation',description:'10 min guided meditation using Headspace.',status:'done',priority:'medium',due_date:yestStr,start_date:yestStr,time:'21:00',category:'Health',tags:['routine','mindfulness'],_sample,recur:'daily',annotations:[{id:sid(),text:'Session 45/90 on Headspace — focus pack',timestamp:nowISO()}],created_at:yestStr+'T21:00:00',updated_at:nowISO(),deleted_at:null},
    {id:s.garden,title:'Plant spring vegetables',description:'Prepare raised beds and sow seeds for tomatoes, peppers, basil.',status:'not_started',priority:'low',due_date:futStr,category:'Personal',tags:['garden','outdoor'],_sample,annotations:[],created_at:nowISO(),updated_at:nowISO(),deleted_at:null},
    {id:s.invoice,title:'Send Q2 invoices',description:'Generate and send invoices for Q2 consulting work. Follow up on overdue payments.',status:'not_started',priority:'high',due_date:futStr,category:'Finance',tags:['billing','client'],_sample,depends_on:[s.budget],annotations:[],created_at:nowISO(),updated_at:nowISO(),deleted_at:null},
    {id:s.portfolio,title:'Update portfolio site',description:'Add new projects and case studies. Update tech stack section with recent work.',status:'in_progress',priority:'medium',due_date:nextWkStr,start_date:futStr,category:'Design',tags:['design','frontend','portfolio'],_sample,annotations:[{id:sid(),text:'Decided on Astro + Tailwind stack',timestamp:nowISO()}],created_at:lastWkStr+'T15:00:00',updated_at:nowISO(),deleted_at:null},
    {id:s.standup,title:'Daily standup',description:'Team sync — updates, blockers, priorities.',status:'not_started',priority:'medium',due_date:todayStr(),start_date:todayStr(),time:'09:00',category:'Meetings',tags:['recurring','team'],_sample,recur:'daily',annotations:[],created_at:nowISO(),updated_at:nowISO(),deleted_at:null},
    {id:s.podcast,title:'Record podcast episode',description:'Episode on "Building in public" — prep talking points and invite co-host.',status:'not_started',priority:'medium',due_date:nextWkStr,category:'Content',tags:['writing','podcast'],_sample,depends_on:[s.blogPost],annotations:[],created_at:nowISO(),updated_at:nowISO(),deleted_at:null}
  ]
}
function loadSampleData(quiet){
  const tasks=getTasks();const samples=getSampleTasks();
  samples.forEach(t=>tasks.push(t));saveTasks(tasks);
  if(!quiet)samples.forEach(t=>logActivity(t.id,'created',t.title));
  if(!quiet)toast('Sample data loaded','success');
  renderCurrentPage()
}
function loadSampleNotes(){
  const notes=getNotes();
  notes.push({id:uid(),text:'Welcome to Do-able! This is your scratch pad — pin it for quick access.',pinned:true,created_at:nowISO(),updated_at:nowISO()});
  notes.push({id:uid(),text:'Ideas for homepage: hero with product screenshot, feature grid below, testimonial carousel.',pinned:false,created_at:nowISO(),updated_at:nowISO()});
  notes.push({id:uid(),text:'Books to read this quarter: Deep Work, Atomic Habits, Designing Data-Intensive Applications',pinned:true,created_at:nowISO(),updated_at:nowISO()});
  notes.push({id:uid(),text:'Sprint retro action items: shorter standups, better Jira hygiene, pair on complex tickets',pinned:false,created_at:nowISO(),updated_at:nowISO()});
  saveNotes(notes)
}
function removeSampleTasks(){
  const tasks=getTasks();const before=tasks.length;
  const kept=tasks.filter(t=>!t._sample);
  if(kept.length===before){toast('No sample tasks to remove','info');return}
  saveTasks(kept);toast('Sample tasks removed','success');renderCurrentPage()
}

// ========== Frog Companion ==========
let frogEnabled=false,frogState='idle',frogTimer=null,frogX=1,frogY=null;
function toggleFrog(on){
  const cfg=getConfig();cfg.frog_enabled=!!on;saveConfig(cfg);
  on?startFrog():stopFrog()
}
function frogRandPos(){
  const padL=80,padR=100,padT=60,padB=80;
  const maxX=window.innerWidth-padR,minX=padL;
  const maxY=window.innerHeight-padB,minY=padT;
  return{x:minX+Math.random()*(maxX-minX),y:minY+Math.random()*(maxY-minY)}
}
function startFrog(){
  frogEnabled=true;const el=document.getElementById('frogCharacter');
  if(!el)return;el.classList.remove('frog-hidden');
  const pos=frogRandPos();frogX=0;frogY=pos.y;
  el.style.left=pos.x+'px';el.style.top=pos.y+'px';
  setFrogState('idle');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)scheduleFrogAction()
}
function stopFrog(){
  frogEnabled=false;clearTimeout(frogTimer);
  const el=document.getElementById('frogCharacter');
  if(el){el.classList.add('frog-hidden');el.className='frog-character frog-hidden'}
}
function setFrogState(state){
  const el=document.getElementById('frogCharacter');
  if(!el||!frogEnabled)return;el.className='frog-character';
  if(state==='walk'){
    const maxLeft=window.innerWidth-80;
    if(frogX===0){el.style.left=maxLeft+'px';frogX=1}
    else{el.style.left='16px';frogX=0}
    el.classList.add('frog-walk');frogState='walk';
    setTimeout(()=>{if(frogEnabled)setFrogState('idle')},4200)
  }else if(state==='peek'){
    el.classList.add('frog-peek');frogState='peek';
    setTimeout(()=>{if(frogEnabled)setFrogState('idle')},2200)
  }else if(state==='sleep'){
    el.classList.add('frog-sleep');frogState='sleep';
    setTimeout(()=>{if(frogEnabled)setFrogState('idle')},10000)
  }else if(state==='stretch'){
    el.classList.add('frog-stretch');frogState='stretch';
    setTimeout(()=>{if(frogEnabled)setFrogState('idle')},2000)
  }else if(state==='happy'){
    el.classList.add('frog-happy');frogState='happy';
    setTimeout(()=>{if(frogEnabled)setFrogState('idle')},2500)
  }else if(state==='perch'){
    const pos=frogRandPos();
    el.style.left=pos.x+'px';el.style.top=pos.y+'px';
    frogX=pos.x<(window.innerWidth/2)?0:1;frogY=pos.y;
    el.classList.add('frog-perch');frogState='perch';
    setTimeout(()=>{if(frogEnabled)setFrogState('idle')},1200)
  }else{el.classList.add('frog-idle');frogState='idle'}
}
function scheduleFrogAction(){
  clearTimeout(frogTimer);if(!frogEnabled)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const delay=12000+Math.random()*18000;
  frogTimer=setTimeout(()=>{
    if(!frogEnabled)return;
    const r=Math.random();
    let chosen='sleep';
    if(r<0.35)chosen='idle';
    else if(r<0.45)chosen='stretch';
    setFrogState(chosen);
    scheduleFrogAction()
  },delay)
}
function frogClick(){
  if(!frogEnabled)return;clearTimeout(frogTimer);
  const el=document.getElementById('frogCharacter');
  el.classList.add('frog-hopping');
  const p=frogRandPos();
  el.style.left=p.x+'px';el.style.top=p.y+'px';
  frogX=p.x<(window.innerWidth/2)?0:1;frogY=p.y;
  setFrogState('happy');
  setTimeout(()=>{
    el.classList.remove('frog-hopping');
    if(frogEnabled){setFrogState('idle');scheduleFrogAction()}
  },900)
}
(function(){const _orig=window.fireConfetti;window.fireConfetti=function(){_orig&&_orig();if(frogEnabled&&frogState!=='happy')setTimeout(()=>setFrogState('happy'),400)}})();
window.addEventListener('resize',function(){
  if(frogEnabled&&frogX===1){
    const el=document.getElementById('frogCharacter');
    if(el)el.style.left=(window.innerWidth-80)+'px'
  }
});

function requestNotifPermission(){
  if('Notification'in window&&Notification.permission==='default')
    Notification.requestPermission()
}
function checkDueTasks(){
  if(!('Notification'in window)||Notification.permission!=='granted')return;
  const tasks=getTasks().filter(t=>!t.deleted_at);
  const today=todayStr();
  const dueToday=tasks.filter(t=>t.due_date===today&&t.status!=='done'&&t.status!=='cancelled');
  const overdue=tasks.filter(t=>t.due_date&&t.due_date<today&&t.status!=='done'&&t.status!=='cancelled');
  if(dueToday.length){
    new Notification('Do-able',{body:`${dueToday.length} task${dueToday.length>1?'s are':' is'} due today`,icon:'/src/icon.svg'})
  }
  if(overdue.length){
    new Notification('Do-able',{body:`${overdue.length} overdue task${overdue.length>1?'s':''}!`,icon:'/src/icon.svg'})
  }
}

// --- Onboarding ---
function showOnboarding(){
  const html=`<div style="text-align:center;margin-bottom:16px">
    <h2 style="font-family:var(--font-serif);font-size:22px;margin-bottom:8px">Welcome to Do-able</h2>
    <p class="text-dim text-sm">A local-first task manager for people who want rich features without the cloud.</p>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
    <button class="btn btn-primary" onclick="onboardingChoice('samples')">Try sample tasks</button>
    <button class="btn btn-secondary" onclick="onboardingChoice('import')">Import from CSV</button>
    <button class="btn btn-ghost" onclick="onboardingChoice('empty')">Start empty</button>
  </div>
  <div style="border-top:1px solid var(--border);padding-top:16px;margin-bottom:16px">
    <div class="settings-label" style="margin-bottom:8px">Quick tour</div>
    <div style="font-size:13px;line-height:1.8">
      <div><strong>Kanban</strong>: drag tasks between categories</div>
      <div><strong>Calendar</strong>: time-based planning with drag-to-reschedule</div>
      <div><strong>Focus goals</strong>: pick up to 3 tasks for today</div>
      <div><strong>Eisenhower Matrix</strong>: triage by urgency and importance</div>
      <div><strong>Templates</strong>: save reusable task molds</div>
      <div><strong>Recurring series</strong>: automate repeating tasks</div>
    </div>
  </div>
  <div style="background:var(--bg);border-radius:var(--radius);padding:12px;margin-bottom:16px">
    <div class="text-sm">Personalize in <strong>Settings</strong>: categories, tags, theme, and more.</div>
  </div>
  <div style="text-align:center">
    <button class="btn btn-primary" onclick="dismissOnboarding()">Get started</button>
  </div>`;
  showModal(html)
}
function onboardingChoice(choice){
  if(choice==='samples'){loadSampleData(true);loadSampleNotes();renderCurrentPage();dismissOnboarding()}
  else if(choice==='import'){dismissOnboarding();document.getElementById('csvFileInput').click()}
  else{dismissOnboarding()}
}
function dismissOnboarding(){lsSet('onboarding_seen',true);closeModal()}

// --- Command Palette + Keyboard Shortcuts ---
const _isMac=/Mac|iPod|iPhone|iPad/.test(navigator.platform);
const _m=_isMac?'⌘':'Ctrl+';
const _s=_isMac?'⇧':'Shift+';
const _e=_isMac?'↵':'Enter';
const _paletteCommands=[
  {label:'Go to Dashboard',hint:_m+_s+'1',run:()=>navigateTo('dashboard'),group:'Navigation'},
  {label:'Go to Tasks',hint:_m+_s+'2',run:()=>navigateTo('tasks'),group:'Navigation'},
  {label:'Go to Bin',hint:_m+_s+'3',run:()=>navigateTo('bin'),group:'Navigation'},
  {label:'Go to Activity',hint:_m+_s+'4',run:()=>navigateTo('log'),group:'Navigation'},
  {label:'Go to Settings',hint:_m+_s+'5',run:()=>navigateTo('settings'),group:'Navigation'},
  {label:'Tasks: List view',hint:'',run:()=>{navigateTo('tasks');switchTaskView('list')},group:'Task views'},
  {label:'Tasks: Kanban view',hint:'',run:()=>{navigateTo('tasks');switchTaskView('kanban')},group:'Task views'},
  {label:'Tasks: Calendar view',hint:'',run:()=>{navigateTo('tasks');switchTaskView('calendar')},group:'Task views'},
  {label:'Tasks: Eisenhower view',hint:'',run:()=>{navigateTo('tasks');switchTaskView('eisenhower')},group:'Task views'},
  {label:'New task',hint:_m+_e,run:()=>{if(currentPage==='dashboard'){const i=document.getElementById('dashQuickAdd');if(i)i.focus()}else{navigateTo('tasks');setTimeout(()=>{const i=document.getElementById('quickAddInput');if(i)i.focus()},0)}},group:'Actions'},
  {label:'Focus mode',hint:_m+_s+'F',run:()=>showFocusMode(),group:'Actions'},
  {label:'Task roulette',hint:'',run:()=>{if(document.getElementById('modalOverlay').style.display!=='none')closeModal();pickRandomTask();navigateTo('dashboard')},group:'Actions'},
  {label:'Toggle theme',hint:'',run:()=>cycleTheme(),group:'Actions'},
  {label:'Toggle sidebar',hint:_m+_s+'L',run:()=>toggleSidebar(),group:'Actions'},
  {label:'Show keyboard shortcuts',hint:_m+'/',run:()=>showShortcutsHelp(),group:'Actions'}
];
let _paletteOpen=false,_paletteIdx=0,_paletteFiltered=[];
function _inField(){const ae=document.activeElement;return ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'||ae.tagName==='SELECT'||ae.isContentEditable)}
function _isOverlayOpen(){const m=document.getElementById('modalOverlay');return (m&&m.style.display!=='none')||_paletteOpen}
function togglePalette(){if(_paletteOpen)closePalette();else openPalette()}
function openPalette(){if(_isOverlayOpen()&&!_paletteOpen)return;_paletteOpen=true;_paletteIdx=0;document.getElementById('paletteOverlay').style.display='flex';const i=document.getElementById('paletteInput');i.value='';i.focus();_renderPalette('')}
function closePalette(){_paletteOpen=false;const o=document.getElementById('paletteOverlay');if(o)o.style.display='none';const i=document.getElementById('paletteInput');if(i)i.removeAttribute('aria-activedescendant')}
function _paletteFilter(q){if(!q)return _paletteCommands.slice();const ql=q.toLowerCase();return _paletteCommands.filter(c=>c.label.toLowerCase().includes(ql)).sort((a,b)=>{const ai=a.label.toLowerCase().indexOf(ql),bi=b.label.toLowerCase().indexOf(ql);return (ai<0?999:ai)-(bi<0?999:bi)})}
function _renderPalette(q){
  _paletteFiltered=_paletteFilter(q);
  if(_paletteIdx>=_paletteFiltered.length)_paletteIdx=0;
  const list=document.getElementById('paletteList');const input=document.getElementById('paletteInput');
  if(!_paletteFiltered.length){list.innerHTML='<div class="palette-empty">No matching commands</div>';input.removeAttribute('aria-activedescendant');return}
  let last='';let html='';
  _paletteFiltered.forEach((c,i)=>{if(c.group!==last){html+=`<div class="palette-group">${escHtml(c.group)}</div>`;last=c.group}const sel=i===_paletteIdx;html+=`<div class="palette-item${sel?' selected':''}" id="pa-${i}" role="option" aria-selected="${sel?'true':'false'}" data-i="${i}" onclick="_paletteSelect(${i})" onmousemove="_paletteHover(${i})"><span class="palette-label">${escHtml(c.label)}</span>${c.hint?`<span class="palette-hint">${escHtml(c.hint)}</span>`:''}</div>`});
  list.innerHTML=html;input.setAttribute('aria-activedescendant','pa-'+_paletteIdx);
}
function _paletteHover(i){if(_paletteIdx!==i){_paletteIdx=i;_paletteMarkSel()}}
function _paletteMarkSel(){document.querySelectorAll('#paletteList .palette-item').forEach(el=>{const sel=+el.dataset.i===_paletteIdx;el.classList.toggle('selected',sel);el.setAttribute('aria-selected',sel?'true':'false')});const cur=document.querySelector('#paletteList .palette-item.selected');if(cur)cur.scrollIntoView({block:'nearest'});const input=document.getElementById('paletteInput');if(input)input.setAttribute('aria-activedescendant',cur?('pa-'+_paletteIdx):'')}
function _paletteMove(d){if(!_paletteFiltered.length)return;_paletteIdx=(_paletteIdx+d+_paletteFiltered.length)%_paletteFiltered.length;_paletteMarkSel()}
function _paletteSelect(i){const c=_paletteFiltered[i];if(!c)return;closePalette();c.run()}
function showShortcutsHelp(){
  if(_paletteOpen)closePalette();
  const m=document.getElementById('modalOverlay');if(m&&m.style.display!=='none')return;
  const groups=[['Global',[['Open command palette',_m+'K'],['Show this help',_m+'/'],['Close overlay','Esc']]],['Navigation',[['Go to Dashboard',_m+_s+'1'],['Go to Tasks',_m+_s+'2'],['Go to Bin',_m+_s+'3'],['Go to Activity',_m+_s+'4'],['Go to Settings',_m+_s+'5']]],['Actions',[['New task',_m+_e],['Focus mode',_m+_s+'F'],['Toggle sidebar',_m+_s+'L'],['Toggle theme','via palette'],['Task roulette','via palette'],['Switch task view','via palette']]]];
  let html='<div class="modal-title">Keyboard shortcuts</div>';
  groups.forEach(([g,items])=>{html+=`<div class="shortcut-group">${escHtml(g)}</div>`;items.forEach(([l,k])=>{html+=`<div class="shortcut-row"><span>${escHtml(l)}</span><span class="shortcut-keys">${escHtml(k)}</span></div>`})});
  html+='<div class="modal-actions"><button class="btn" onclick="closeModal()">Close</button></div>';
  showModal(html);
}
document.addEventListener('keydown',e=>{
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&e.code==='KeyK'){e.preventDefault();togglePalette();return}
  if(mod&&e.code==='Slash'){e.preventDefault();showShortcutsHelp();return}
  if(_paletteOpen){
    if(e.code==='ArrowDown'){e.preventDefault();_paletteMove(1);return}
    if(e.code==='ArrowUp'){e.preventDefault();_paletteMove(-1);return}
    if(e.code==='Enter'){e.preventDefault();_paletteSelect(_paletteIdx);return}
    if(e.code==='Escape'){e.preventDefault();closePalette();return}
    if(e.code==='Tab'){e.preventDefault();return}
    return;
  }
  if(_isOverlayOpen())return;
  if(mod&&e.code==='Enter'){if(_inField())return;e.preventDefault();if(currentPage==='dashboard'){const i=document.getElementById('dashQuickAdd');if(i)i.focus()}else{navigateTo('tasks');setTimeout(()=>{const i=document.getElementById('quickAddInput');if(i)i.focus()},0)}return}
  if(mod&&e.shiftKey&&e.code==='KeyF'){e.preventDefault();showFocusMode();return}
  if(mod&&e.shiftKey&&e.code==='KeyL'){e.preventDefault();toggleSidebar();return}
  if(mod&&e.shiftKey&&/^Digit[1-5]$/.test(e.code)){e.preventDefault();const pages=['dashboard','tasks','bin','log','settings'];navigateTo(pages[+e.code.slice(5)-1]);return}
});
document.addEventListener('input',e=>{if(e.target&&e.target.id==='paletteInput')_renderPalette(e.target.value)});
(function(){const pt=document.getElementById('paletteTrigger');if(pt){pt.textContent=_m+'K';pt.title='Command palette ('+_m+'K)'}})();

// --- Init ---
async function init(){
  await _initApi();
  const cfg=getConfig();
  if(Object.keys(cfg).length===0){cfg.theme='nord-dark';cfg.date_mode='smart';cfg.per_page=25;cfg.frog_enabled=false;saveConfig(cfg)}
  applyTheme(cfg.theme);
  if(cfg.frog_enabled)startFrog();
  if(!cfg.ring_hint_seen){const r=document.getElementById('sidebarRing');if(r)r.classList.add('ring-hint')}
  const tasks=getTasks();
  if(!lsGet('onboarding_seen',false)&&tasks.length===0){showOnboarding()}
  const focus=getFocus();const today=todayStr();
  Object.keys(focus).forEach(d=>{if(d!==today)delete focus[d]});
  saveFocus(focus);
  requestNotifPermission();
  setTimeout(checkDueTasks,1000);
  renderCurrentPage();
  const lo=document.getElementById('loadingOverlay');
  if(lo)lo.remove()
}
