const _recurrenceFired=new Set();
function toggleTaskDone(el,id){
  const checked=el.checked;
  const tasks=getTasks();const t=tasks.find(x=>x.id===id);if(!t)return;
  if(checked){
    if(t.status==='done')return;
    if(!canTransition(t.status,'done')){
      el.checked=false;
      if(t.status==='cancelled')toast('Task is cancelled. Reopen it first.','error');
      else if(t.status==='deleted')toast('Task is deleted.','error');
      return
    }
    if(t.status==='not_started')t.status='in_progress';
    t.status='done';t.updated_at=nowISO();saveTasks(tasks);logActivity(id,'updated',t.title);
    fireConfetti();
    if(!_recurrenceFired.has(id)){handleRecurrence(t);_recurrenceFired.add(id)}
  }else{
    const target=canTransition(t.status,'in_progress')?'in_progress':'not_started';
    t.status=target;t.updated_at=nowISO();saveTasks(tasks);logActivity(id,'updated',t.title);
    _recurrenceFired.delete(id)
  }
  renderCurrentView()
}
// --- Sort UI ---
const sortFieldMeta={
  priority:{label:'Priority',asc:'High → Low',desc:'Low → High'},
  status:{label:'Status',asc:'Not started → Cancelled',desc:'Cancelled → Not started'},
  due_date:{label:'Due date',asc:'Earliest → Latest',desc:'Latest → Earliest'},
  title:{label:'Title',asc:'A → Z',desc:'Z → A'}
};
let sortMenuOpen=false,sortMenuStep='fields',sortMenuField='';
function toggleSortMenu(btn){
  sortMenuOpen=!sortMenuOpen;sortMenuStep='fields';
  const existing=document.getElementById('sortPopover');
  if(existing){existing.remove();return}
  if(!sortMenuOpen)return;
  renderSortMenu(btn)
}
function renderSortMenu(btn){
  let pop=document.getElementById('sortPopover');
  if(!pop){pop=document.createElement('div');pop.id='sortPopover';pop.className='sort-popover';document.body.appendChild(pop)}
  const rect=btn.getBoundingClientRect();
  pop.style.position='fixed';
  pop.style.top=(rect.bottom+4)+'px';pop.style.left=rect.left+'px';
  if(sortMenuStep==='fields'){
    pop.innerHTML=Object.entries(sortFieldMeta).map(([k,v])=>`<div class="sort-menu-item" onclick="event.stopPropagation();sortMenuField='${k}';sortMenuStep='dir';renderSortMenu(document.querySelector('.sort-btn'))"><span>${v.label}</span><span class="sub-arrow">›</span></div>`).join('')
  }else{
    const m=sortFieldMeta[sortMenuField];
    pop.innerHTML=`<div class="sort-menu-item" onclick="closeSortMenu();addSort('${sortMenuField}','asc')">${m.asc}</div><div class="sort-menu-item" onclick="closeSortMenu();addSort('${sortMenuField}','desc')">${m.desc}</div>`
  }
}
function closeSortMenu(){
  sortMenuOpen=false;const e=document.getElementById('sortPopover');
  if(e)e.remove()
}
function addSort(field,dir){
  taskSorts=[...taskSorts,{field,dir}];
  renderCurrentView()
}
function removeSort(idx){
  taskSorts=taskSorts.filter((_,i)=>i!==idx);
  renderCurrentView()
}
function renderSortBar(){
  const bar=document.getElementById('sortBar');if(!bar)return;
  let html=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div class="sort-wrapper"><button class="btn btn-ghost sort-btn" onclick="toggleSortMenu(this)" style="padding:6px 16px;font-size:13px">+ Sort</button></div><div class="sort-wrapper"><button class="btn btn-ghost filter-btn" onclick="toggleFilterMenu(this)" style="padding:6px 16px;font-size:13px">Columns</button></div>`;
  taskSorts.forEach((s,i)=>{
    const m=sortFieldMeta[s.field];
    html+=`<span class="sort-chip">${m?m.label:s.field}: ${s.dir==='asc'?m?m.asc:'↑':m?m.desc:'↓'}<span class="chip-remove" onclick="removeSort(${i})">✕</span></span>`
  });
  if(taskFilter.series!=='all'){const s=getSeries().find(x=>x.id===taskFilter.series);html+=`<span class="sort-chip" style="background:var(--purple);color:var(--bg)">Series: ${escHtml(s?s.title:taskFilter.series)}<span class="chip-remove" onclick="taskFilter.series='all';renderSortBar();renderCurrentView()">✕</span></span>`}
  html+='</div>';
  bar.innerHTML=html
}
// Close sort popover on outside click
document.addEventListener('click',function(e){
  if(sortMenuOpen&&!e.target.closest('.sort-popover')&&!e.target.closest('.sort-btn')){
    sortMenuOpen=false;const p=document.getElementById('sortPopover');
    if(p)p.remove()
  }
  if(filterMenuOpen&&!e.target.closest('.filter-popover')&&!e.target.closest('.filter-btn')){
    filterMenuOpen=false;const p=document.getElementById('filterPopover');if(p)p.remove()
  }
});

// --- Column Filter UI ---
const columnOptions=[
  {key:'time',label:'Time'},
  {key:'tags',label:'Tags'},
  {key:'category',label:'Category'},
  {key:'annotations',label:'Annotations'},
  {key:'dependencies',label:'Dependencies'},
  {key:'recur',label:'Recurrence'}
];
let taskFilter={status:'all',priority:'all',category:'all',due:'all',series:'all'};
let filterMenuOpen=false;
function setTaskFilter(field,value){
  taskFilter[field]=value;renderSortBar();renderCurrentView()
}
function clearTaskFilters(){
  taskFilter={status:'all',priority:'all',category:'all',due:'all',series:'all'};renderSortBar();renderCurrentView()
}
function filterBySeries(seriesId){
  taskFilter={status:'all',priority:'all',category:'all',due:'all',series:seriesId};
  taskView='list';navigateTo('tasks')
}
function toggleFilterMenu(btn){
  filterMenuOpen=!filterMenuOpen;
  const existing=document.getElementById('filterPopover');
  if(existing){existing.remove();return}
  if(!filterMenuOpen)return;
  renderFilterMenu(btn)
}
function renderFilterMenu(btn){
  let pop=document.getElementById('filterPopover');
  if(!pop){pop=document.createElement('div');pop.id='filterPopover';pop.className='filter-popover';document.body.appendChild(pop)}
  const rect=btn.getBoundingClientRect();
  pop.style.position='fixed';
  pop.style.top=(rect.bottom+4)+'px';pop.style.left=rect.left+'px';
  pop.innerHTML=columnOptions.map(c=>`<label class="filter-menu-item" onclick="event.stopPropagation()"><input type="checkbox" ${taskColumns.includes(c.key)?'checked':''} onchange="toggleColumn('${c.key}')"><span>${c.label}</span></label>`).join('')
}
function toggleColumn(key){
  if(taskColumns.includes(key))taskColumns=taskColumns.filter(k=>k!==key);
  else taskColumns.push(key);
  localStorage.setItem('doable_taskColumns',JSON.stringify(taskColumns));
  renderCurrentView()
}

// --- Kanban ---
function renderKanban(){
  const tasks=getFilteredTasks();
  let cats=[...new Set(tasks.map(t=>t.category).filter(Boolean))].sort();
  if(!cats.length){
    document.getElementById('taskKanbanView').innerHTML='<div class="empty-state"><p class="text-dim">Add a category to view Kanban view.</p></div>';
    return
  }
  const uncategorized=tasks.filter(t=>!t.category);
  if(uncategorized.length)cats=['__none__',...cats];
  const showTags=taskColumns.includes('tags');
  const showAnno=taskColumns.includes('annotations');
  const showDeps=taskColumns.includes('dependencies');
  const showRecur=taskColumns.includes('recur');
  const grouped=cats.map(cat=>({name:cat==='__none__'?'Uncategorized':cat,key:cat,tasks:cat==='__none__'?uncategorized:tasks.filter(t=>t.category===cat)}));
  document.getElementById('taskKanbanView').innerHTML=`<div class="kanban-board">${grouped.map(g=>`<div class="kanban-column" data-category="${escHtml(g.key)}"><div class="kanban-col-header">${categoryDot(g.name)}${escHtml(g.name)} (${g.tasks.length})</div>${g.tasks.map(t=>{
    let meta=[];
    if(t.due_date)meta.push('<span>'+fmtDate(t.due_date)+'</span>');
    if(showTags&&(t.tags||[]).length)meta.push(t.tags.map(tag=>escHtml(tag)).join(', '));
    if(showAnno&&(t.annotations||[]).length)meta.push((t.annotations||[]).length+' annotation'+((t.annotations||[]).length>1?'s':''));
    if(showDeps&&(t.depends_on||[]).length)meta.push((t.depends_on||[]).length+' dep'+((t.depends_on||[]).length>1?'s':''));
    if(showDeps&&t.status!=='done'&&t.status!=='cancelled'){const allTasks=getTasks();const bCount=allTasks.filter(x=>(x.depends_on||[]).includes(t.id)&&x.status!=='done'&&x.status!=='cancelled'&&!x.deleted_at).length;if(bCount)meta.push(`<span style="color:var(--orange);font-weight:600">blocks ${bCount}</span>`)}
    if(showRecur&&t.recur)meta.push(escHtml(t.recur));
    const catColor=getCategoryColors()[g.name];
    return`<div class="kanban-card" ${catColor?`style="border-left:3px solid ${catColor}"`:''} draggable="true" ondragstart="onDragStart(event,'${t.id}')" onclick="showTaskDetail('${t.id}')"><div class="kanban-card-row"><span class="priority-dot ${t.priority||'medium'}"></span><span class="kanban-card-title">${escHtml(t.title)}</span></div>${meta.length?'<div class="kanban-card-row text-dim text-sm">'+meta.join(' · ')+'</div>':''}</div>`
  }).join('')}<div class="kanban-drop-zone" ondrop="onDropKanban(event,'${g.key}')" ondragover="event.preventDefault();event.target.classList.add('drag-over')" ondragleave="event.target.classList.remove('drag-over')">Drop here</div></div>`).join('')}</div>`
}
let dragId=null;
function onDragStart(e,id){dragId=id;e.dataTransfer.effectAllowed='move'}
function onDropKanban(e,key){
  e.preventDefault();e.target.classList.remove('drag-over');
  if(!dragId)return;const tasks=getTasks();const t=tasks.find(x=>x.id===dragId);
  const newCat=key==='__none__'?'':key;
  if(t&&t.category!==newCat){t.category=newCat;t.updated_at=nowISO();saveTasks(tasks);logActivity(t.id,'updated',t.title);renderKanban()}
  dragId=null
}

// --- Calendar ---
let calViewDate=new Date();
let calViewMode='month';
function renderCalendar(){
  const container=document.getElementById('taskCalendarView');
  let tasks=getFilteredTasks().filter(t=>t.due_date||t.start_date);
  const m=calViewDate.getMonth();const y=calViewDate.getFullYear();
  const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const today=todayStr();

  const previewTasks=getCalPreviews(tasks);

  let html='<div class="calendar-desc">View tasks on a timeline. <strong>Month</strong> for overview, <strong>Week</strong> for hourly time-blocking. Drag tasks between days to reschedule.</div>';
  html+=`<div class="calendar-controls">
    <button class="btn btn-ghost btn-sm" onclick="calNav(-1)">←</button>`;
  if(calViewMode==='month'){
    html+=`<span style="font-weight:600;min-width:160px;text-align:center">${monthNames[m]} ${y}</span>`;
  }else{
    const mon=getMonday(calViewDate);
    const sun=new Date(mon);sun.setDate(mon.getDate()+6);
    const fmt=d=>d.getDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
    html+=`<span style="font-weight:600;min-width:200px;text-align:center">${fmt(mon)} – ${fmt(sun)}</span>`;
  }
  html+=`<button class="btn btn-ghost btn-sm" onclick="calNav(1)">→</button>
    <button class="btn btn-secondary btn-sm" onclick="calGoToday()">Today</button>
    <div style="flex:1"></div>
    <button class="btn btn-sm ${calViewMode==='month'?'btn-primary':'btn-ghost'}" onclick="calViewMode='month';renderCalendar()">Month</button>
    <button class="btn btn-sm ${calViewMode==='week'?'btn-primary':'btn-ghost'}" onclick="calViewMode='week';calViewDate=getMonday(calViewDate);renderCalendar()">Week</button>
    <input type="date" id="calJumpDate" onchange="calJumpTo(this.value)" style="width:140px;font-size:12px;padding:4px 8px" title="Jump to date">
  </div>`;

  if(tasks.length===0&&previewTasks.length===0){
    html+='<div class="empty-state" style="padding:40px 20px"><p class="text-dim">No scheduled tasks.</p><p class="text-dim text-sm">Add a due date or start date to a task to see it here.</p></div>';
  }else if(calViewMode==='week'){
    html+=renderWeekView(tasks,previewTasks,today);
  }else{
    html+=renderMonthView(tasks,previewTasks,m,y,today);
  }
  container.innerHTML=html
}

function getMonday(d){
  const date=new Date(d);const day=date.getDay();
  const diff=date.getDate()-day+(day===0?-6:1);
  date.setDate(diff);date.setHours(0,0,0,0);return date
}

function calNav(dir){
  if(calViewMode==='month'){calViewDate.setMonth(calViewDate.getMonth()+dir)}
  else{calViewDate.setDate(calViewDate.getDate()+dir*7)}
  renderCalendar()
}

function calGoToday(){
  calViewDate=new Date();
  if(calViewMode==='week')calViewDate=getMonday(calViewDate);
  renderCalendar()
}

function calJumpTo(dateStr){
  if(!dateStr)return;
  calViewDate=new Date(dateStr+'T00:00:00');
  renderCalendar()
}

function getCalPreviews(tasks){
  const result=[];const viewStart=new Date(calViewDate);
  const viewEnd=new Date(calViewDate);
  if(calViewMode==='month'){viewEnd.setMonth(viewEnd.getMonth()+1);viewEnd.setDate(0)}
  else{viewEnd.setDate(viewEnd.getDate()+6)}
  viewEnd.setHours(23,59,59,999);
  const endStr=viewEnd.toISOString().slice(0,10);
  const startStr=viewStart.toISOString().slice(0,10);
  tasks.filter(t=>t.recur&&t.due_date).forEach(t=>{
    const dueStr=t.due_date;
    if(dueStr>=startStr&&dueStr<=endStr)return;
    let next=new Date(dueStr+'T00:00:00');
    let maxIter=1000;
    while(maxIter-->0){
      if(t.recur==='daily')next.setDate(next.getDate()+1);
      else if(t.recur==='weekly')next.setDate(next.getDate()+7);
      else if(t.recur==='monthly')next.setMonth(next.getMonth()+1);
      const ns=next.toISOString().slice(0,10);
      if(ns>endStr)break;
      if(ns>=startStr){result.push({...t,id:t.id+'_p',due_date:ns,_preview:true});break}
    }
  });
  return result
}

function renderMonthView(tasks,previewTasks,m,y,today){
  const firstDay=new Date(y,m,1).getDay();
  const daysInMonth=new Date(y,m+1,0).getDate();
  const prevDays=new Date(y,m,0).getDate();
  const allTasks=[...tasks,...previewTasks];
  let html='<div class="calendar-grid">';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>html+=`<div class="calendar-day-header">${d}</div>`);
  for(let i=firstDay-1;i>=0;i--){const d=prevDays-i;html+=`<div class="calendar-day other-month"><div class="calendar-day-num">${d}</div></div>`}
  for(let d=1;d<=daysInMonth;d++){
    const ds=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const dayTasks=allTasks.filter(t=>t.due_date===ds);
    const isToday=ds===today;
    const isOverdue=!isToday&&ds<today&&dayTasks.some(t=>!t._preview&&t.status!=='done'&&t.status!=='cancelled');
    html+=`<div class="calendar-day${isToday?' today':''}${isOverdue?' overdue':''}" ondragover="event.preventDefault()" ondrop="calDrop(event,'${ds}')" onclick="toggleCalDay(this)"><div class="calendar-day-num">${d}</div>`;
    const multiDay=allTasks.filter(t=>t.start_date&&t.start_date<ds&&t.due_date&&t.due_date>=ds&&t.due_date!==ds);
    multiDay.forEach(t=>{
      const st=new Date(t.start_date+'T00:00:00');
      const en=new Date(t.due_date+'T00:00:00');
      const td=Math.round((en-st)/86400000)+1;
      const od=Math.round((new Date(ds+'T00:00:00')-st)/86400000);
      html+=`<div class="cal-multi-bar" style="background:var(--accent);left:${od/td*100}%;width:${100/td}%" title="${escHtml(t.title)}" onclick="event.stopPropagation();showTaskDetail('${t.id.replace(/_p$/,'')}')">${escHtml(t.title)}</div>`
    });
    const regTasks=dayTasks.filter(t=>!t.start_date||t.start_date===t.due_date||t.start_date>=ds);
    if(regTasks.length<=4){
      regTasks.forEach(t=>{const cls=t._preview?'cal-preview-task':'calendar-day-task';html+=`<div class="${cls}"${t._preview?'':` draggable="true" ondragstart="calDragStart(event,'${t.id}')"`} onclick="event.stopPropagation();showTaskDetail('${t.id.replace(/_p$/,'')}')">${escHtml(t.title)}</div>`})
    }else{
      html+=`<div class="calendar-day-dots">${['high','medium','low'].map(p=>regTasks.filter(t=>(t.priority||'medium')===p).length?`<span class="calendar-day-dot" style="background:${p==='high'?'var(--red)':p==='medium'?'var(--orange)':'var(--green)'}"></span>`:'').join('')}</div>`;
      html+=`<div class="calendar-day-tasks">${regTasks.filter(t=>!t._preview).map(t=>`<div class="calendar-day-task" draggable="true" ondragstart="calDragStart(event,'${t.id}')" onclick="event.stopPropagation();showTaskDetail('${t.id.replace(/_p$/,'')}')">${escHtml(t.title)}</div>`).join('')}${regTasks.filter(t=>t._preview).map(t=>`<div class="calendar-day-task cal-preview-task" onclick="event.stopPropagation();showTaskDetail('${t.id.replace(/_p$/,'')}')">${escHtml(t.title)}</div>`).join('')}</div>`
    }
    html+=`</div>`
  }
  const remaining=7-(firstDay+daysInMonth)%7;if(remaining<7)for(let d=1;d<=remaining;d++)html+=`<div class="calendar-day other-month"><div class="calendar-day-num">${d}</div></div>`;
  html+='</div>';return html
}

function renderWeekView(tasks,previewTasks,today){
  const mon=getMonday(calViewDate);
  const days=[];for(let i=0;i<7;i++){const d=new Date(mon);d.setDate(mon.getDate()+i);days.push(d)}
  const allTasks=[...tasks,...previewTasks];
  const hours=[];for(let h=7;h<=22;h++)hours.push(h);
  const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let html='<div class="calendar-week-grid">';
  html+=`<div class="calendar-time-label"></div>`;
  days.forEach(d=>{
    const ds=d.toISOString().slice(0,10);const isToday=ds===today;
    html+=`<div style="padding:8px;text-align:center;font-size:11px;font-weight:600;color:${isToday?'var(--accent)':'var(--text-dim)'};background:${isToday?'var(--bg-hover)':'var(--bg-raised)'};font-family:var(--font-mono)">${dayNames[d.getDay()]} ${d.getDate()}</div>`
  });
  hours.forEach(h=>{
    const timeStr=String(h).padStart(2,'0')+':00';
    html+=`<div class="calendar-time-label">${timeStr}</div>`;
    days.forEach(d=>{
      const ds=d.toISOString().slice(0,10);const isToday=ds===today;
      const slotTasks=allTasks.filter(t=>t.due_date===ds&&t.time&&t.time.startsWith(String(h).padStart(2,'0')));
      const noTimeTasks=allTasks.filter(t=>t.due_date===ds&&(!t.time||!t.time.startsWith(String(h).padStart(2,'0')))&&h===12);
      html+=`<div class="calendar-hour-slot${isToday?' today-col':''}" ondragover="event.preventDefault()" ondrop="calDrop(event,'${ds}')" onclick="showTimeSlotPopover(${h},'${ds}',this)">
        ${slotTasks.map(t=>`<div class="calendar-day-task${t._preview?' cal-preview-task':''}"${t._preview?'':` draggable="true" ondragstart="calDragStart(event,'${t.id}')"`} onclick="event.stopPropagation();showTaskDetail('${t.id.replace(/_p$/,'')}')">${t.time?`<span class="task-time">${t.time}</span>`:''}${escHtml(t.title)}</div>`).join('')}
        ${h===12?noTimeTasks.map(t=>`<div class="calendar-day-task${t._preview?' cal-preview-task':''}"${t._preview?'':` draggable="true" ondragstart="calDragStart(event,'${t.id}')"`} onclick="event.stopPropagation();showTaskDetail('${t.id.replace(/_p$/,'')}')">${escHtml(t.title)}</div>`).join(''):''}
      </div>`
    })
  });
  html+='</div>';return html
}

let calDragId=null;
function calDragStart(e,id){
  calDragId=id;
  e.dataTransfer.effectAllowed='move';
  e.dataTransfer.setData('text/plain',id)
}
function calDrop(e,dateStr){
  e.preventDefault();const t=e.target.closest('[class*="calendar"]');
  if(t)t.classList.remove('drag-over');
  if(!calDragId)return;
  const tasks=getTasks();const ti=tasks.find(x=>x.id===calDragId);
  if(ti&&ti.due_date!==dateStr){const oldDue=ti.due_date||'no date';ti.due_date=dateStr;ti.updated_at=nowISO();saveTasks(tasks);logActivity(ti.id,'rescheduled',oldDue+' → '+(dateStr||'no date'));toast('Rescheduled to '+dateStr,'info');renderCalendar()}
  calDragId=null
}

function toggleCalDay(el){el.classList.toggle('expanded')}

function showTimeSlotPopover(hour,dayStr,el){
  const tasks=getTasks().filter(t=>t.due_date===dayStr&&!t.time&&t.status!=='done'&&t.status!=='cancelled');
  let html='<div style="font-size:11px;font-weight:600;margin-bottom:6px">'+String(hour).padStart(2,'0')+':00</div>';
  tasks.forEach(t=>{html+=`<div style="padding:4px 0;cursor:pointer;font-size:12px" onclick="event.stopPropagation();assignTaskTime('${t.id}','${String(hour).padStart(2,'0')+':00'}')">${escHtml(t.title)}</div>`});
  html+=`<div style="border-top:1px solid var(--border);margin-top:4px;padding-top:4px;font-size:11px;cursor:pointer;color:var(--accent)" onclick="event.stopPropagation();document.getElementById('quickAddInput').focus()">+ Add at ${String(hour).padStart(2,'0')}:00</div>`;
  document.getElementById('modalContent').innerHTML=html;
  document.getElementById('modalOverlay').style.display=''
}
function assignTaskTime(id,time){
  const tasks=getTasks();const t=tasks.find(x=>x.id===id);
  if(t){t.time=time;t.updated_at=nowISO();saveTasks(tasks);logActivity(id,'updated',t.title)}
  closeModal();renderCalendar()
}

function renderEisenhower(){
  const tasks=getTasks().filter(t=>!t.deleted_at&&t.status!=='done'&&t.status!=='cancelled');
  const today=new Date();
  const isUrgent=t=>{if(!t.due_date)return false;const d=new Date(t.due_date);const diff=Math.ceil((d-today)/864e5);return diff<=3||t.due_date<todayStr()};
  const isImportant=t=>t.priority==='high'||t.priority==='medium';
  const quads={doFirst:[],schedule:[],delegate:[],eliminate:[]};
  tasks.forEach(t=>{
    if(isImportant(t)&&isUrgent(t))quads.doFirst.push(t);
    else if(isImportant(t)&&!isUrgent(t))quads.schedule.push(t);
    else if(!isImportant(t)&&isUrgent(t))quads.delegate.push(t);
    else quads.eliminate.push(t)
  });
  const card=(ts,label,color)=>`<div class="eisenhower-quad" style="border-top:3px solid ${color}"><div class="eisenhower-quad-header" style="color:${color}">${label} <span class="text-dim" style="font-weight:400">(${ts.length})</span></div>${ts.length?ts.map(t=>`<div class="eisenhower-task" onclick="showTaskDetail('${t.id}')"><span class="priority-dot ${t.priority}"></span><span>${escHtml(t.title)}</span>${t.due_date?`<span class="text-dim" style="font-size:10px;margin-left:auto">${fmtDate(t.due_date)}</span>`:''}</div>`).join(''):'<div class="text-dim text-sm" style="padding:8px 0">No tasks</div>'}</div>`;
  document.getElementById('taskEisenhowerView').innerHTML=`<div class="text-dim text-sm" style="margin-bottom:12px;font-style:italic">Tasks sorted by urgency (due ≤3 days) and importance (high/medium priority).</div><div class="eisenhower-matrix"><div class="eisenhower-col"><div class="eisenhower-label" style="text-align:right;padding-right:8px;color:var(--text-dim);font-size:11px">Urgent</div>${card(quads.doFirst,'Do First','var(--red)')}</div><div class="eisenhower-col"><div class="eisenhower-label" style="padding-left:8px;color:var(--text-dim);font-size:11px">Not Urgent</div>${card(quads.schedule,'Schedule','var(--accent)')}</div><div class="eisenhower-col"><div class="eisenhower-label" style="text-align:right;padding-right:8px;color:var(--text-dim);font-size:11px">Not Important</div>${card(quads.delegate,'Delegate','var(--orange)')}</div><div class="eisenhower-col"><div class="eisenhower-label" style="padding-left:8px;color:var(--text-dim);font-size:11px">Not Important</div>${card(quads.eliminate,'Eliminate','var(--green)')}</div></div>`
}

function populateTaskFilters(){} // no-op: filter dropdowns removed
const taskQuotes=[
  "The secret of getting ahead is getting started. - Mark Twain",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "You don't have to be extreme, just consistent.",
  "Small daily improvements over time lead to stunning results.",
  "Done is better than perfect.",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Start where you are. Use what you have. Do what you can. - Arthur Ashe",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "Your limitation is only your imagination.",
  "Push yourself because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Talent without working hard is nothing. - Cristiano Ronaldo",
  "The future depends on what you do today. - Mahatma Gandhi",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "You are stronger than you think.",
  "Progress, not perfection.",
  "The only bad workout is the one that didn't happen.",
  "Every expert was once a beginner.",
  "Do something today that your future self will thank you for.",
  "If you get tired, learn to rest, not to quit.",
  "A year from now you may wish you had started today. - Karen Lamb",
  "Little by little, one travels far. - J.R.R. Tolkien",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Don't let yesterday take up too much of today. - Will Rogers"
];
let lastQuoteIdx=-1;
function renderTaskQuote(){
  let idx;
  do{idx=Math.floor(Math.random()*taskQuotes.length)}while(idx===lastQuoteIdx);
  lastQuoteIdx=idx;
  const el=document.getElementById('taskQuote');
  if(el)el.textContent=taskQuotes[idx]
}
function renderTemplateSelect(){
  const sel=document.getElementById('templateSelect');
  if(!sel)return;
  const cur=sel.value;
  sel.innerHTML='<option value="">Apply template...</option>'+getTemplates().map(t=>`<option value="${escHtml(t.name)}">${escHtml(t.name)}</option>`).join('');
  sel.value=cur
}
function renderCurrentView(){
  populateTaskFilters();
  renderTemplateSelect();
  renderSortBar();
  const activeTasks=getTasks().filter(t=>!t.deleted_at&&t.status!=='done'&&t.status!=='cancelled');
  const hint=document.getElementById('eisenhowerHint');
  if(hint){
    if(activeTasks.length>15&&taskView!=='eisenhower'){
      hint.style.display='block';
      hint.innerHTML='<div style="margin-bottom:8px;padding:8px 12px;background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius);font-size:13px"><span style="color:var(--yellow)">\u26A0</span> <strong>'+activeTasks.length+'</strong> active tasks \u2014 <a href="#" onclick="switchTaskView(\'eisenhower\');return false" style="color:var(--accent)">try the Eisenhower Matrix</a> for priority triage</div>'
    }else{hint.style.display='none'}
  }
  if(taskView==='list')renderListView();
  else if(taskView==='kanban')renderKanban();
  else if(taskView==='calendar')renderCalendar();
  else renderEisenhower();
  renderTaskQuote()
}

// --- Quick Add ---
function parseQuickAdd(text){
  const t={priority:'medium',due_date:''};
  const pl={'high':'high','medium':'medium','low':'low'};
  const words=text.split(/\s+/);const keep=[];
  for(let i=0;i<words.length;i++){
    const w=words[i].toLowerCase();
    if(pl[w]){t.priority=pl[w];continue}
    if(w==='today'){t.due_date=todayStr();continue}
    if(w==='tomorrow'){const d=new Date();d.setDate(d.getDate()+1);t.due_date=d.toISOString().slice(0,10);continue}
    if(w==='next'&&i+1<words.length){
      const nx=words[i+1].toLowerCase();
      if(nx==='week'){const d=new Date();d.setDate(d.getDate()+7);t.due_date=d.toISOString().slice(0,10);i++;continue}
      const dm={'monday':1,'tuesday':2,'wednesday':3,'thursday':4,'friday':5,'saturday':6,'sunday':0};
      if(dm[nx]!==undefined){const d=new Date();let diff=dm[nx]-d.getDay();if(diff<=0)diff+=7;d.setDate(d.getDate()+diff);t.due_date=d.toISOString().slice(0,10);i++;continue}
    }
    keep.push(words[i])
  }
  const datePat=/^(\d{1,2})[\/-](\d{1,2})$/;
  const filtered=keep.filter(w=>{const m=w.match(datePat);if(m){const d=new Date();d.setMonth(parseInt(m[1])-1);d.setDate(parseInt(m[2]));if(d.getFullYear()<2000)d.setFullYear(new Date().getFullYear());t.due_date=d.toISOString().slice(0,10);return false}return true});
  t.title=filtered.join(' ')||text;
  return t
}
function buildTask(p){
  return {id:uid(),title:p.title,description:'',status:'not_started',priority:p.priority,due_date:p.due_date,start_date:'',time:'',category:'',tags:[],recur:null,series_id:null,depends_on:[],annotations:[],files:[],parent_id:null,created_at:nowISO(),updated_at:nowISO(),deleted_at:null}
}
function quickAddTask(){
  const inp=document.getElementById('quickAddInput');if(!inp.value.trim())return;
  const tasks=getTasks();const t=buildTask(parseQuickAdd(inp.value.trim()));
  tasks.push(t);saveTasks(tasks);logActivity(t.id,'created',t.title);inp.value='';renderCurrentView();renderTaskQuote()
}
function dashQuickAddTask(){
  const inp=document.getElementById('dashQuickAdd');if(!inp||!inp.value.trim())return;
  const tasks=getTasks();const t=buildTask(parseQuickAdd(inp.value.trim()));
  tasks.push(t);saveTasks(tasks);logActivity(t.id,'created',t.title);inp.value='';renderDashboard();toast('Task added','success')
}

// --- Task Detail ---
let detailTaskId=null;
let previousPage='dashboard';
let detailDirty=false;
let detailSnapshot=null;

function showTaskDetail(id){
  if(currentPage==='task-detail'&&detailDirty&&id!==detailTaskId){
    if(!confirm('You have unsaved changes. Leave without saving?'))return
  }
  detailTaskId=id;
  previousPage=currentPage;
  const tasks=getTasks();const t=tasks.find(x=>x.id===id);
  detailSnapshot=t?JSON.stringify(t):null;
  detailDirty=false;
  navigateTo('task-detail')
}

function renderTaskDetailPage(){
  const tasks=getTasks();const t=tasks.find(x=>x.id===detailTaskId);
  if(!t){navigateTo(previousPage);return}
  const cats=[...new Set(tasks.map(x=>x.category).filter(Boolean))];
  const allTags=[...new Set(tasks.flatMap(x=>x.tags||[]))];
  let recurringOpts='<option value="">None</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>';
  if(t.recur&&t.recur!=='')recurringOpts=recurringOpts.replace(`value="${t.recur}"`,`value="${t.recur}" selected`);
  document.getElementById('taskDetailContent').innerHTML=`
    ${(function(){
      const entries=getActivity().filter(e=>e.task_id===detailTaskId).slice(0,5);
      if(!entries.length)return'';
      const colors={created:'var(--green)',completed:'var(--accent)',deleted:'var(--red)',restored:'var(--orange)',updated:'var(--yellow)',dependency_removed:'var(--purple)',rescheduled:'#81a1c1',started:'#8fbcbb',cancelled:'#5e81ac',recurred:'#7b88a1',series_stopped:'#4c566a'};
      const labels={created:'Created',completed:'Completed',deleted:'Deleted',restored:'Restored',updated:'Updated',dependency_removed:'Dependency removed',rescheduled:'Rescheduled',started:'Started',cancelled:'Cancelled',recurred:'Recurred',series_stopped:'Series stopped'};
      return'<div style="margin-bottom:12px;padding:8px 12px;background:var(--bg);border-radius:var(--radius);border-left:3px solid var(--border)">'+entries.map(e=>`<div style="display:flex;align-items:center;gap:8px;padding:3px 0"><span class="activity-dot" style="background:${colors[e.action]||'var(--text-dim)'}"></span><span class="text-sm" style="color:var(--text-dim)">${labels[e.action]||e.action}${e.details?': '+escHtml(e.details):''}</span><span class="text-dim" style="font-size:11px;margin-left:auto">${fmtDateTime(e.timestamp)}</span></div>`).join('')+'</div>'
    })()}
    <div class="detail-form">
      <div class="detail-field">
        <input class="detail-title-input" id="detailTitle" value="${escHtml(t.title)}">
      </div>
      <div class="detail-field">
        <label>Description</label>
        <textarea id="detailDesc" rows="3">${escHtml(t.description||'')}</textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="detail-field">
          <label>Priority</label>
          <select id="detailPriority"><option value="high" ${t.priority==='high'?'selected':''}>High</option><option value="medium" ${t.priority==='medium'?'selected':''}>Medium</option><option value="low" ${t.priority==='low'?'selected':''}>Low</option></select>
        </div>
        <div class="detail-field">
          <label>Status</label>
          <select id="detailStatus"><option value="not_started" ${t.status==='not_started'?'selected':''}>Not started</option><option value="in_progress" ${t.status==='in_progress'?'selected':''}>In progress</option><option value="done" ${t.status==='done'?'selected':''}>Done</option><option value="cancelled" ${t.status==='cancelled'?'selected':''}>Cancelled</option></select>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="detail-field">
          <label>Due date</label>
          <input type="date" id="detailDue" value="${t.due_date||''}">
        </div>
        <div class="detail-field">
          <label>Start date</label>
          <input type="date" id="detailStartDate" value="${t.start_date||''}">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="detail-field">
          <label>Time</label>
          <input type="time" id="detailTime" value="${t.time||''}">
        </div>
        <div class="detail-field">
          <label>${t.category?categoryDot(t.category):''}Category</label>
          <select id="detailCategory"><option value="">None</option>${cats.map(c=>`<option value="${escHtml(c)}" ${t.category===c?'selected':''}>${escHtml(c)}</option>`).join('')}</select>
          <input id="detailCategoryNew" placeholder="Type new category, press Enter to add" style="margin-top:6px;font-size:12px;padding:6px 8px" onkeydown="if(event.key==='Enter'){event.preventDefault();addDetailCategory()}">
        </div>
      </div>
      <div class="detail-field">
        <label>Tags</label>
        <div class="text-dim text-sm" style="margin-bottom:4px">Labels for organizing and filtering</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px" id="detailTags">${(t.tags||[]).map(tag=>`<span class="tag-pill">${escHtml(tag)}<span class="tag-remove" onclick="removeDetailTag('${tag}')">✕</span></span>`).join('')}</div>
        <div style="display:flex;gap:4px"><input id="detailTagInput" placeholder="Add tag..." onkeydown="if(event.key==='Enter')addDetailTag()" list="tagSuggestions"><datalist id="tagSuggestions">${allTags.map(tag=>`<option value="${escHtml(tag)}">`).join('')}</datalist></div>
      </div>
      <div class="detail-field">
        <label>Recurrence</label>
        <div class="text-dim text-sm" style="margin-bottom:4px">Auto-create a copy when completed</div>
        <select id="detailRecur">${recurringOpts}</select>
        ${t.series_id?(()=>{const s=getSeries().find(x=>x.id===t.series_id);return s?`<div class="text-dim text-sm" style="margin-top:4px">Part of series: <a href="#" onclick="filterBySeries('${t.series_id}');return false" style="color:var(--accent)"><strong>${escHtml(s.title)}</strong></a>${s.active?` · <a href="#" onclick="stopSeriesForTask('${t.series_id}','${t.id}');return false" style="color:var(--red)">Stop recurring</a>`:' (stopped)'}</div>`:''})():''}
      </div>
      <div class="detail-field">
        <label>Dependencies</label>
        <div class="text-dim text-sm" style="margin-bottom:4px">Tasks that must be done before this one can start</div>
        ${(t.depends_on||[]).some(d=>{const dt=tasks.find(x=>x.id===d);return dt&&dt.status!=='done'&&t.status!=='cancelled'})?`<div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg-hover);border-radius:var(--radius);margin-bottom:8px;font-size:13px;color:var(--orange)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Waiting on incomplete dependencies</span></div>`:''}
        <div id="detailDeps">${(t.depends_on||[]).map(d=>{
          const dt=tasks.find(x=>x.id===d);
          if(!dt)return'';
          const sc={not_started:'var(--text-dim)',in_progress:'var(--orange)',done:'var(--green)',cancelled:'var(--red)'};
          const sl={not_started:'Not started',in_progress:'In progress',done:'Done',cancelled:'Cancelled'};
          return`<div style="display:flex;align-items:center;gap:6px;padding:4px 0"><span class="priority-dot ${dt.priority||'medium'}"></span><span class="badge" style="color:${sc[dt.status]||'var(--text-dim)'};font-size:11px;padding:1px 6px;background:var(--bg-hover)">${sl[dt.status]||dt.status}</span><a href="#" onclick="showTaskDetail('${d}');return false" style="color:var(--text);cursor:pointer;font-size:13px">${escHtml(dt.title)}</a><span class="tag-remove" onclick="removeDetailDep('${d}')" style="cursor:pointer;margin-left:auto">✕</span></div>`
        }).join('')}</div>
        ${(()=>{const bl=tasks.filter(x=>x.depends_on&&x.depends_on.includes(t.id));return bl.length?`<div style="margin-top:8px;margin-bottom:8px;font-size:13px;color:var(--text-dim)">Blocks ${bl.length} other task${bl.length>1?'s':''}</div>`:''})()}
        <div style="display:flex;gap:4px">
          <input id="detailDepInput" list="depSuggestions" placeholder="Search tasks..." autocomplete="off" onkeydown="if(event.key==='Enter')addDetailDep()">
          <datalist id="depSuggestions">${tasks.filter(x=>x.id!==t.id&&!x.deleted_at).map(x=>`<option value="${escHtml(x.title)}">`).join('')}</datalist>
          <button class="btn btn-primary btn-sm" onclick="addDetailDep()">Add</button>
        </div>
      </div>
      <div class="detail-field">
        <label>Annotations</label>
        <div class="text-dim text-sm" style="margin-bottom:4px">Timestamped comments attached to this task</div>
        ${(t.annotations&&t.annotations.length)?t.annotations.map(n=>`<div style="display:flex;align-items:flex-start;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)"><div style="flex:1;font-size:13px">${escHtml(n.text)}</div><div class="text-dim text-sm" style="flex-shrink:0">${fmtDateTime(n.timestamp)}</div></div>`).join(''):'<div class="text-dim text-sm" style="padding:4px 0">No annotations yet</div>'}
      </div>
      <div class="detail-field">
        <label>Add annotation</label>
        <div style="display:flex;gap:4px"><input id="detailAnnotationInput" placeholder="Write an annotation..." onkeydown="if(event.key==='Enter')addDetailAnnotation()"></div>
      </div>
      <div class="detail-field">
        <label>Attachments (${(t.files||[]).length}/5 · ${((t.files||[]).reduce((s,f)=>s+(f.size||0),0)/1048576).toFixed(1)} MB)</label>
        <div id="detailAttachments">${(t.files||[]).map((f,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)"><span style="font-size:12px">${escHtml(f.name)}</span><span class="text-dim text-sm">(${(f.size/1024).toFixed(0)} KB)</span><a href="${escHtml(f.data)}" download="${escHtml(f.name)}" class="text-sm">Download</a><span class="tag-remove" onclick="removeDetailFile(${i})" style="cursor:pointer;margin-left:auto">✕</span></div>`).join('')||'<div class="text-dim text-sm" style="padding:4px 0">No attachments</div>'}</div>
        <div style="margin-top:4px"><input type="file" id="detailFileInput" onchange="addDetailFile()"></div>
      </div>
      <div class="detail-field">
        <label>Subtasks</label>
        <div id="detailSubtasks">${tasks.filter(x=>x.parent_id===t.id&&!x.deleted_at).map(st=>`<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)"><input type="checkbox" ${st.status==='done'?'checked':''} onchange="toggleSubtaskStatus('${st.id}',this.checked)" style="width:14px;height:14px"><span style="font-size:13px;cursor:pointer;text-decoration:${(st.status==='done'||st.status==='cancelled')?'line-through':'none'}" onclick="showTaskDetail('${st.id}')">${escHtml(st.title)}</span><span class="tag-remove" onclick="deleteTask('${st.id}')" style="cursor:pointer;margin-left:auto">✕</span></div>`).join('')||'<div class="text-dim text-sm" style="padding:4px 0">No subtasks</div>'}</div>
        <div style="display:flex;gap:4px;margin-top:4px"><input id="detailSubtaskInput" placeholder="Add subtask..." onkeydown="if(event.key==='Enter')addDetailSubtask()"><button class="btn btn-primary btn-sm" onclick="addDetailSubtask()">Add</button></div>
      </div>
      <div class="detail-field">
        <label class="text-dim">Created ${fmtDateTime(t.created_at)} · Updated ${fmtDateTime(t.updated_at)}</label>
      </div>
      <div style="display:flex;gap:8px;justify-content:space-between">
        <button class="btn btn-danger btn-sm" onclick="deleteTask('${t.id}');navigateTo(previousPage)">Delete</button>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="saveTemplateFromDetail()">Save as Template</button>
          <button class="btn btn-primary" onclick="saveDetailTask('${t.id}')">Save</button>
        </div>
      </div>
    </div>
  `;
  const form=document.querySelector('.detail-form');
  if(form)form.addEventListener('change',()=>{detailDirty=true})
}
function addDetailCategory(){
  const inp=document.getElementById('detailCategoryNew');
  const val=inp.value.trim();
  if(!val)return;
  const sel=document.getElementById('detailCategory');
  if([...sel.options].some(o=>o.value.toLowerCase()===val.toLowerCase())){
    inp.value='';return
  }
  const opt=document.createElement('option');
  opt.value=val;opt.textContent=val;opt.selected=true;
  sel.appendChild(opt);
  inp.value='';
  toast('Category added','success');
}

function saveDetailTask(id){
  const tasks=getTasks();const t=tasks.find(x=>x.id===id);if(!t)return;
  const oldStatus=t.status;const oldDue=t.due_date||'';
  t.title=document.getElementById('detailTitle').value.trim()||t.title;
  t.description=document.getElementById('detailDesc').value;
  t.priority=document.getElementById('detailPriority').value;
  const newStatus=document.getElementById('detailStatus').value;
  if(newStatus!==oldStatus&&!canTransition(oldStatus,newStatus)){
    toast(`Cannot change from ${oldStatus} to ${newStatus}`,'error');
    return
  }
  t.status=newStatus;
  const newDue=document.getElementById('detailDue').value||'';
  t.due_date=newDue||null;
  t.start_date=document.getElementById('detailStartDate').value||null;
  t.time=document.getElementById('detailTime').value||null;
  const newCat=document.getElementById('detailCategoryNew').value.trim();
  if(newCat&&newCat!==t.category)toast('Category added','success');
  t.category=newCat||document.getElementById('detailCategory').value;
  t.recur=document.getElementById('detailRecur').value||null;
  ensureSeriesForTask(t);
  t.updated_at=nowISO();
  saveTasks(tasks);
  if(t.status!==oldStatus&&t.status==='done')handleRecurrence(t);
  if(t.status!==oldStatus&&t.status==='in_progress')logActivity(id,'started',t.title);
  if(t.status!==oldStatus&&t.status==='cancelled')logActivity(id,'cancelled',t.title);
  if(newDue!==oldDue)logActivity(id,'rescheduled',(oldDue||'no date')+' → '+(newDue||'no date'));
  logActivity(id,'updated',t.title);
  detailDirty=false;
  toast('Task saved','success');
  setTimeout(()=>navigateTo(previousPage),150)
}
function handleRecurrence(t){
  if(!t.recur)return;
  const tasks=getTasks();const due=t.due_date;
  if(!due)return;
  const d=new Date(due+'T00:00:00');
  if(t.recur==='daily')d.setDate(d.getDate()+1);
  else if(t.recur==='weekly')d.setDate(d.getDate()+7);
  else if(t.recur==='monthly')d.setMonth(d.getMonth()+1);
  const nd=d.toISOString().slice(0,10);
  const series=getSeries().find(s=>String(s.id)===String(t.series_id)&&s.active);
  const base=series||t;
  const nt={id:uid(),title:base.title,description:base.description||'',status:'not_started',priority:base.priority||'medium',due_date:nd,start_date:series?(series.start_date||''):(t.start_date||''),time:series?(series.time||null):(t.time||null),category:base.category||'',tags:[...(base.tags||[])],recur:base.recur,depends_on:[],annotations:[],files:series?JSON.parse(JSON.stringify(series.files||[])):[],series_id:t.series_id||null,parent_id:null,created_at:nowISO(),updated_at:nowISO(),deleted_at:null};
  tasks.push(nt);saveTasks(tasks);logActivity(nt.id,'created',nt.title+' (recurring)');logActivity(t.id,'recurred',nt.title)
}
function addDetailTag(){
  const inp=document.getElementById('detailTagInput');if(!inp.value.trim()||!detailTaskId)return;
  const tasks=getTasks();const t=tasks.find(x=>x.id===detailTaskId);
  if(t){if(!t.tags)t.tags=[];if(!t.tags.includes(inp.value.trim())){t.tags.push(inp.value.trim());t.updated_at=nowISO();saveTasks(tasks)}}
  inp.value='';renderTaskDetailPage()
}
function removeDetailTag(tag){
  if(!detailTaskId)return;
  const tasks=getTasks();const t=tasks.find(x=>x.id===detailTaskId);
  if(t){t.tags=(t.tags||[]).filter(x=>x!==tag);t.updated_at=nowISO();saveTasks(tasks)}
  renderTaskDetailPage()
}
function addDetailDep(){
  const inp=document.getElementById('detailDepInput');
  if(!inp||!inp.value.trim()||!detailTaskId)return;
  const tasks=getTasks();const t=tasks.find(x=>x.id===detailTaskId);
  const match=tasks.find(x=>x.title.toLowerCase()===inp.value.trim().toLowerCase()&&x.id!==detailTaskId&&!x.deleted_at);
  if(!match){toast('Task not found','error');return}
  if(t){if(!t.depends_on)t.depends_on=[];if(!t.depends_on.includes(match.id))t.depends_on.push(match.id);t.updated_at=nowISO();saveTasks(tasks)}
  inp.value='';renderTaskDetailPage()
}
function removeDetailDep(depId){
  if(!detailTaskId)return;
  const tasks=getTasks();const t=tasks.find(x=>x.id===detailTaskId);
  if(t){t.depends_on=(t.depends_on||[]).filter(x=>x!==depId);t.updated_at=nowISO();saveTasks(tasks)}
  renderTaskDetailPage()
}
function addDetailAnnotation(){
  if(!detailTaskId)return;
  const inp=document.getElementById('detailAnnotationInput');if(!inp||!inp.value.trim())return;
  const tasks=getTasks();const t=tasks.find(x=>x.id===detailTaskId);
  if(t){if(!t.annotations)t.annotations=[];t.annotations.push({id:uid(),text:inp.value.trim(),timestamp:nowISO()});t.updated_at=nowISO();saveTasks(tasks);logActivity(detailTaskId,'updated','Added annotation')}
  renderTaskDetailPage()
}

function addDetailFile(){
  if(!detailTaskId)return;
  const inp=document.getElementById('detailFileInput');if(!inp||!inp.files.length)return;
  const tasks=getTasks();const t=tasks.find(x=>x.id===detailTaskId);if(!t)return;
  if(!t.files)t.files=[];
  if(t.files.length>=5){toast('Max 5 attachments','error');inp.value='';return}
  const file=inp.files[0];
  if(file.size>2*1048576){toast('File too large (max 2 MB)','error');inp.value='';return}
  const reader=new FileReader();
  reader.onload=function(e){
    t.files.push({name:file.name,data:e.target.result,size:file.size,type:file.type});
    t.updated_at=nowISO();saveTasks(tasks);renderTaskDetailPage()
  };reader.readAsDataURL(file);
  inp.value=''
}
function removeDetailFile(idx){
  if(!detailTaskId)return;
  const tasks=getTasks();const t=tasks.find(x=>x.id===detailTaskId);
  if(t&&t.files){t.files.splice(idx,1);t.updated_at=nowISO();saveTasks(tasks)}
  renderTaskDetailPage()
}
function addDetailSubtask(){
  const inp=document.getElementById('detailSubtaskInput');if(!inp||!inp.value.trim()||!detailTaskId)return;
  const tasks=getTasks();const parent=tasks.find(x=>x.id===detailTaskId);if(!parent)return;
  const st={id:uid(),title:inp.value.trim(),description:'',status:'not_started',priority:'medium',due_date:'',start_date:'',time:'',category:'',tags:[],recur:null,series_id:null,depends_on:[],annotations:[],files:[],parent_id:detailTaskId,created_at:nowISO(),updated_at:nowISO(),deleted_at:null};
  tasks.push(st);saveTasks(tasks);logActivity(st.id,'created',st.title);inp.value='';renderTaskDetailPage()
}
function toggleSubtaskStatus(id,checked){
  const tasks=getTasks();const t=tasks.find(x=>x.id===id);
  if(!t)return;t.status=checked?'done':'not_started';t.updated_at=nowISO();
  if(t.status==='done'){logActivity(id,'completed',t.title);handleRecurrence(t)}
  saveTasks(tasks);renderTaskDetailPage()
}
function saveTemplateFromDetail(){
  if(!detailTaskId)return;
  const tasks=getTasks();const t=tasks.find(x=>x.id===detailTaskId);if(!t)return;
  const name=prompt('Template name:',t.title);if(!name)return;
  const templates=getTemplates();
  templates.push({name,title:t.title,description:t.description,priority:t.priority,category:t.category,tags:[...(t.tags||[])],recur:t.recur});
  saveTemplates(templates);toast('Template saved','success')
}
function applyTemplate(name){
  const templates=getTemplates();const tmpl=templates.find(t=>t.name===name);
  if(!tmpl)return;
  const tasks=getTasks();const t={id:uid(),title:tmpl.title,description:tmpl.description||'',status:'not_started',priority:tmpl.priority||'medium',due_date:'',start_date:'',time:'',category:tmpl.category||'',tags:[...(tmpl.tags||[])],recur:tmpl.recur||null,series_id:null,depends_on:[],annotations:[],files:[],parent_id:null,created_at:nowISO(),updated_at:nowISO(),deleted_at:null};
  if(t.recur)ensureSeriesForTask(t);
  tasks.push(t);saveTasks(tasks);logActivity(t.id,'created',t.title);renderCurrentView()
}
function deleteTemplate(name){
  if(!confirm('Delete template "'+name+'"?'))return;
  saveTemplates(getTemplates().filter(t=>t.name!==name));toast('Template deleted','success');renderSettings()
}
// --- Delete / Bin ---
function deleteTask(id){
  const tasks=getTasks();const t=tasks.find(x=>x.id===id);
  if(!t)return;
  const subtasks=tasks.filter(x=>x.parent_id===id&&!x.deleted_at);
  const dependents=tasks.filter(x=>(x.depends_on||[]).includes(id)&&!x.deleted_at);
  if(subtasks.length||dependents.length){
    let msg='Move "'+t.title+'" to bin?';
    if(subtasks.length)msg+='\n\nThis task has '+subtasks.length+' subtask'+(subtasks.length>1?'s':'')+'. They will become top-level tasks.';
    if(dependents.length)msg+='\n\n'+dependents.length+' task'+(dependents.length>1?'s depend':' depends')+' on this. The dependency will be removed.';
    if(!confirm(msg))return;
  }
  _cleanupDeletedTaskReferences(tasks,id,t.title);
  t.deleted_at=nowISO();t.updated_at=nowISO();saveTasks(tasks);
  logActivity(id,'deleted',t.title);toast('Task moved to bin','info');renderCurrentPage()
}
function _cleanupDeletedTaskReferences(tasks,id,title){
  tasks.forEach(x=>{
    if(x.parent_id===id)x.parent_id=null;
    if((x.depends_on||[]).includes(id)){
      x.depends_on=x.depends_on.filter(d=>d!==id);
      if(!x.deleted_at)logActivity(x.id,'dependency_removed',title);
    }
  });
}
function deleteTaskPermanently(id){
  const tasks=getTasks();const t=tasks.find(x=>x.id===id);
  if(!t)return;
  if(!confirm('Permanently delete "'+t.title+'"? This cannot be undone.'))return;
  _cleanupDeletedTaskReferences(tasks,id,t.title);
  saveTasks(tasks.filter(x=>x.id!==id));
  toast('Task permanently deleted','info');renderBin()
}
function renderBin(){
  const tasks=getTasks().filter(t=>t.deleted_at);
  document.getElementById('binEmpty').style.display=tasks.length?'none':'';
  document.getElementById('binBody').innerHTML=tasks.map(t=>`<tr><td><a href="#" onclick="showTaskDetail('${t.id}');return false" class="task-title">${escHtml(t.title)}</a></td><td class="text-sm text-dim">${fmtDateTime(t.deleted_at)}</td><td class="text-sm">${t.status}</td><td style="display:flex;gap:4px"><button class="btn btn-secondary btn-sm" onclick="restoreTask('${t.id}')">Restore</button><button class="btn btn-danger btn-sm" onclick="deleteTaskPermanently('${t.id}')">Delete</button></td></tr>`).join('')
}
function restoreTask(id){
  const tasks=getTasks();const t=tasks.find(x=>x.id===id);
  if(!t)return;t.deleted_at=null;t.updated_at=nowISO();saveTasks(tasks);
  logActivity(id,'restored',t.title);toast('Task restored','success');renderBin()
}
function emptyBin(){
  if(!confirm('Permanently delete all binned tasks?'))return;
  const tasks=getTasks();
  tasks.filter(t=>t.deleted_at).forEach(t=>{_cleanupDeletedTaskReferences(tasks,t.id,t.title)});
  saveTasks(tasks.filter(t=>!t.deleted_at));
  toast('Bin emptied','info');renderBin()
}

// --- Focus (Dashboard) ---
function cycleDashFocusStatus(id){
  const tasks=getTasks();const t=tasks.find(x=>x.id===id);
  if(!t||t.status==='cancelled')return;
  const cyc={not_started:'in_progress',in_progress:'done',done:'in_progress'};
  t.status=cyc[t.status]||'not_started';t.updated_at=nowISO();
  if(t.status==='done')logActivity(id,'completed',t.title);
  if(t.status==='in_progress')logActivity(id,'started',t.title);
  saveTasks(tasks);
  if(t.status==='done'&&!_recurrenceFired.has(id)){handleRecurrence(t);_recurrenceFired.add(id)}
  renderDashFocusGoals()
}
function reopenFocusTask(id){
  const tasks=getTasks();const t=tasks.find(x=>x.id===id);
  if(!t||t.status!=='cancelled')return;
  t.status='not_started';t.updated_at=nowISO();
  logActivity(id,'restored',t.title);
  saveTasks(tasks);renderDashFocusGoals()
}
function addDashFocusGoal(){
  const sel=document.getElementById('dashFocusSelect');
  if(!sel.value)return;const focus=getFocus();const today=todayStr();
  if(!focus[today])focus[today]=[];
  if(!focus[today].includes(sel.value)&&focus[today].length<3)focus[today].push(sel.value);
  saveFocus(focus);renderDashFocusGoals()
}

// --- Activity Log ---
let logPage=1;
function renderActivityLog(){
  let entries=getActivity();
  const action=document.getElementById('logFilterAction')?.value||'all';
  if(action!=='all')entries=entries.filter(e=>e.action===action);
  const perPage=25;const totalPages=Math.ceil(entries.length/perPage)||1;
  logPage=Math.min(logPage,totalPages);
  const start=(logPage-1)*perPage;const pageEntries=entries.slice(start,start+perPage);
  const colors={created:'var(--green)',completed:'var(--accent)',deleted:'var(--red)',restored:'var(--orange)',updated:'var(--yellow)',dependency_removed:'var(--purple)',rescheduled:'#81a1c1',started:'#8fbcbb',cancelled:'#5e81ac',recurred:'#7b88a1',series_stopped:'#4c566a'};
  document.getElementById('logList').innerHTML=pageEntries.length?pageEntries.map(e=>`<div class="activity-log-entry"><span class="activity-dot" style="background:${colors[e.action]||'var(--text-dim)'}"></span><span class="text-sm" style="flex:1">${escHtml(e.action)}${e.details?': '+escHtml(e.details):''}</span><span class="text-dim text-sm">${fmtDateTime(e.timestamp)}</span></div>`).join(''):'<div class="empty-state"><p class="text-dim">No activity entries.</p></div>';
  document.getElementById('logPagination').innerHTML=totalPages>1?`<button class="btn btn-ghost btn-sm" onclick="logPage=Math.max(1,logPage-1);renderActivityLog()" ${logPage<=1?'disabled':''}>Prev</button><span>Page ${logPage} of ${totalPages}</span><button class="btn btn-ghost btn-sm" onclick="logPage=Math.min(${totalPages},logPage+1);renderActivityLog()" ${logPage>=totalPages?'disabled':''}>Next</button>`:''
}

// --- Settings ---
function toggleAccordion(el){
  const sec=el.closest('.settings-section');
  if(sec)sec.classList.toggle('collapsed')
}
function renderSettings(){
  const cfg=getConfig();
  document.getElementById('settingsTheme').value=cfg.theme||'nord-dark';
  const frogCb=document.getElementById('settingsFrog');
  if(frogCb)frogCb.checked=!!cfg.frog_enabled;
  document.getElementById('settingsDateMode').value=cfg.date_mode||'smart';
  document.getElementById('settingsPerPage').value=cfg.per_page||25;
  renderSettingsCategories();
  renderSettingsTemplates();
  renderSettingsSeries()
}
function renderSettingsCategories(){
  const tasks=getTasks();
  const cats=[...new Set(tasks.map(t=>t.category).filter(Boolean))].sort();
  const el=document.getElementById('settingsCategoriesList');
  if(!el)return;
  if(!cats.length){
    el.innerHTML='<div class="text-dim text-sm" style="padding:8px 0">No categories yet.</div>';return
  }
  el.innerHTML=cats.map(cat=>{
    const count=tasks.filter(t=>t.category===cat&&!t.deleted_at).length;
    const colors=getCategoryColors();
    const c=colors[cat]||'';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="display:flex;align-items:center;gap:8px"><input type="color" value="${c||'#5e81ac'}" oninput="saveCategoryColor('${escHtml(cat)}',this.value)" title="Category color" style="width:24px;height:24px;border:none;border-radius:4px;background:none;cursor:pointer;padding:0;opacity:${c?'1':'0.3'}" onfocus="this.style.opacity='1'"><strong>${escHtml(cat)}</strong> <span class="text-dim text-sm">(${count} task${count!==1?'s':''})</span></span><div style="display:flex;gap:4px">${c?`<button class="btn btn-secondary btn-sm" onclick="saveCategoryColor('${escHtml(cat)}','');renderSettingsCategories()" title="Clear color">Clear</button>`:''}<button class="btn btn-danger btn-sm" onclick="deleteCategory('${escHtml(cat)}')">Delete</button></div></div>`
  }).join('')
}
function renderSettingsTemplates(){
  const el=document.getElementById('settingsTemplatesList');
  if(!el)return;
  const templates=getTemplates();
  if(!templates.length){
    el.innerHTML='<div class="text-dim text-sm" style="padding:8px 0">No saved templates yet.</div>';return
  }
  el.innerHTML=templates.map(t=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span><strong>${escHtml(t.name)}</strong></span><button class="btn btn-danger btn-sm" onclick="deleteTemplate('${escHtml(t.name)}')">Delete</button></div>`).join('')
}
function renderSettingsSeries(){
  const el=document.getElementById('settingsSeriesList');
  if(!el)return;
  const series=getSeries();
  if(!series.length){
    el.innerHTML='<div class="text-dim text-sm" style="padding:8px 0">No recurring series yet.</div>';return
  }
  el.innerHTML=series.map(s=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span><strong>${escHtml(s.title)}</strong> <span class="text-dim text-sm">(${escHtml(s.recur)})${s.active?'':' <span style="color:var(--text-dim)">stopped</span>'}</span></span><div style="display:flex;gap:4px"><button class="btn btn-secondary btn-sm" onclick="editSeries('${s.id}')">Edit</button>${s.active?`<button class="btn btn-secondary btn-sm" onclick="stopSeries('${s.id}')">Stop</button>`:''}<button class="btn btn-danger btn-sm" onclick="deleteSeries('${s.id}')">Delete</button></div></div>`).join('')
}
function editSeries(id){
  const series=getSeries();const s=series.find(x=>x.id===id);
  if(!s)return;
  const title=prompt('Title:',s.title);if(title===null)return;
  const recur=prompt('Recurrence (daily/weekly/monthly):',s.recur||'');if(recur===null)return;
  const priority=prompt('Priority (low/medium/high):',s.priority||'medium');if(priority===null)return;
  s.title=title;s.recur=recur||null;s.priority=priority;s.updated_at=nowISO();
  saveSeries(series);toast('Series updated. Future instances will use new values','success');renderSettingsSeries()
}
function stopSeries(id){
  const series=getSeries();const s=series.find(x=>x.id===id);
  if(!s)return;
  s.active=false;s.updated_at=nowISO();
  saveSeries(series);logActivity(null,'series_stopped',s.title);toast('Series stopped. No more new instances','info');renderSettingsSeries()
}
function deleteSeries(id){
  if(!confirm('Delete this series? Existing tasks keep their data but new instances will not be created from this series.'))return;
  const series=getSeries().filter(s=>s.id!==id);
  saveSeries(series);toast('Series deleted','success');renderSettingsSeries()
}
function deleteCategory(cat){
  if(!confirm(`Delete category "${cat}"? Tasks will become uncategorized.`))return;
  const tasks=getTasks();
  tasks.forEach(t=>{if(t.category===cat)t.category=''});
  saveTasks(tasks);
  saveCategoryColor(cat,'');
  logActivity(null,'updated',`Deleted category: ${cat}`);
  toast('Category deleted','success');
  renderSettingsCategories();
  renderCurrentView()
}
function updateConfig(key,val){
  const cfg=getConfig();cfg[key]=val;saveConfig(cfg);
  if(key==='date_mode')renderCurrentPage()
}

// --- Backup / Export ---
function createBackup(){
  const data={tasks:getTasks(),activity:getActivity(),config:getConfig(),notes:getNotes(),focus:getFocus(),templates:getTemplates(),series:getSeries(),exported_at:nowISO()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='doable-backup-'+todayStr()+'.json';a.click();URL.revokeObjectURL(a.href);
  toast('Backup downloaded','success')
}
function restoreBackup(event){
  const file=event.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const data=JSON.parse(e.target.result);
      if(data.tasks)saveTasks(data.tasks);
      if(data.activity)saveActivity(data.activity);
      if(data.config)saveConfig(data.config);
      if(data.notes)saveNotes(data.notes);
      if(data.focus)saveFocus(data.focus);
      if(data.templates)saveTemplates(data.templates);
      if(data.series)saveSeries(data.series);
      toast('Data restored from backup','success');
      renderCurrentPage()
    }catch{toast('Invalid backup file','error')}
  };reader.readAsText(file);
  event.target.value=''
}
function exportData(format){
  const tasks=getTasks().filter(t=>!t.deleted_at);
  let content='',mime='',ext='';
  if(format==='json'){content=JSON.stringify(tasks,null,2);mime='application/json';ext='json'}
  else if(format==='csv'){
    const headers=['id','title','status','priority','due_date','category','tags','created_at','annotations'];
    content=headers.join(',')+'\n'+tasks.map(t=>headers.map(h=>{
      let v=t[h];if(h==='tags')v=(t.tags||[]).join(';');if(h==='annotations')v=(t.annotations||[]).map(n=>n.text).join(';');
      return'"'+String(v||'').replace(/"/g,'""')+'"'
    }).join(',')).join('\n');
    mime='text/csv';ext='csv'
  }else if(format==='md'){
    content='# Do-able Tasks\n\n'+tasks.map(t=>`## ${t.title}\n\n- **Status:** ${t.status}\n- **Priority:** ${t.priority||'medium'}\n- **Due:** ${t.due_date||'none'}\n- **Category:** ${t.category||'none'}\n- **Tags:** ${(t.tags||[]).join(', ')||'none'}\n${t.description?'- **Description:** '+t.description+'\n':''}${(t.annotations||[]).length?'- **Annotations:**\n'+t.annotations.map(n=>`  - ${n.text}`).join('\n'):''}`).join('\n');
    mime='text/markdown';ext='md'
  }
  const blob=new Blob([content],{type:mime});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='doable-tasks.'+ext;a.click();URL.revokeObjectURL(a.href);
  toast(`Exported as ${format.toUpperCase()}`,'success')
}
function parseCSV(text){
  const rows=[];let row=[];let field='';let inQuotes=false;let i=0;
  while(i<text.length){
    const c=text[i];
    if(inQuotes){
      if(c==='"'){if(text[i+1]==='"'){field+='"';i+=2;continue}inQuotes=false;i++;continue}
      field+=c;i++;continue
    }
    if(c==='"'){inQuotes=true;i++;continue}
    if(c===','){row.push(field);field='';i++;continue}
    if(c==='\n'){row.push(field);rows.push(row);row=[];field='';i++;continue}
    if(c==='\r'){i++;continue}
    field+=c;i++
  }
  if(field||row.length){row.push(field);rows.push(row)}
  return rows
}
function importCSV(event){
  const file=event.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const rows=parseCSV(e.target.result);
      if(rows.length<2){toast('CSV is empty or has no data rows','error');return}
      const headers=rows[0].map(h=>h.trim());
      const titleIdx=headers.indexOf('title');
      if(titleIdx===-1){toast('CSV must have a "title" column','error');return}
      const tasks=getTasks();
      let imported=0;
      for(let i=1;i<rows.length;i++){
        const r=rows[i];
        if(!r.length||(r.length===1&&!r[0].trim()))continue;
        const title=(r[titleIdx]||'').trim();
        if(!title)continue;
        const getCol=(name)=>{const idx=headers.indexOf(name);return idx>=0?(r[idx]||'').trim():''};
        const tagsStr=getCol('tags');
        const annStr=getCol('annotations');
        const statusVal=getCol('status');
        const statusMap={'started':'in_progress','not_started':'not_started','in_progress':'in_progress','done':'done','cancelled':'cancelled'};
        const t={
          id:uid(),title,
          description:getCol('description'),
          status:statusMap[statusVal]||'not_started',
          priority:getCol('priority')||'medium',
          due_date:getCol('due_date'),
          start_date:getCol('start_date'),
          time:getCol('time')||'',
          category:getCol('category'),
          tags:tagsStr?tagsStr.split(';').map(s=>s.trim()).filter(Boolean):[],
          recur:getCol('recur')||null,
          series_id:null,
          depends_on:[],
          annotations:annStr?annStr.split(';').map(s=>({id:uid(),text:s.trim(),created_at:nowISO()})).filter(a=>a.text):[],
          files:[],
          parent_id:null,
          created_at:nowISO(),
          updated_at:nowISO(),
          deleted_at:null
        };
        tasks.push(t);
        logActivity(t.id,'created',t.title);
        imported++
      }
      if(!imported){toast('No valid tasks found in CSV','error');return}
      saveTasks(tasks);
      toast(`Imported ${imported} task${imported!==1?'s':''}`,'success');
      renderCurrentPage()
    }catch(err){toast('Failed to import CSV: '+err.message,'error')}
    event.target.value=''
  };
  reader.readAsText(file)
}
function stopSeriesForTask(seriesId,taskId){
  const series=getSeries();const s=series.find(x=>x.id===seriesId);
  if(!s||!s.active)return;
  s.active=false;saveSeries(series);
  const tasks=getTasks();const t=tasks.find(x=>x.id===taskId);
  if(t){t.recur=null;t.series_id=null;t.updated_at=nowISO();saveTasks(tasks)}
  logActivity(taskId,'series_stopped',s.title);toast('Recurring series stopped','info');
  renderTaskDetailPage()
}
function clearAllData(){
  if(!confirm('This will permanently delete ALL data. Are you sure?'))return;
  if(!confirm('Really? All tasks, notes, annotations, activity, everything?'))return;
  Object.keys(localStorage).filter(k=>k.startsWith(LS_PREFIX)).forEach(k=>localStorage.removeItem(k));
  if(_api.ready){_api.post('/sync/full',{tasks:[],notes:[],config:{},templates:[],series:[]}).catch(()=>{})}
  toast('All data cleared','info');renderCurrentPage()
}
