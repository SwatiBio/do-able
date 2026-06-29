const LS_PREFIX = 'doable_';
function lsGet(key,def=null){try{const v=localStorage.getItem(LS_PREFIX+key);return v?JSON.parse(v):def}catch{return def}}
function lsSet(key,val){localStorage.setItem(LS_PREFIX+key,JSON.stringify(val))}

// === API Client ===
const _api = {
  ready: false,
  async _fetch(method, path, body) {
    try {
      const opts = { method, headers: { 'Accept': 'application/json' } };
      if (body != null) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }
      const r = await fetch('/api' + path, opts);
      if (!r.ok) throw new Error(`API ${method} ${path}: ${r.status}`);
      return r.status === 204 ? null : r.json();
    } catch(e) {
      if (method !== 'GET') _markPending();
      throw e;
    }
  },
  get(p) { return this._fetch('GET', p); },
  post(p, b) { return this._fetch('POST', p, b); },
  put(p, b) { return this._fetch('PUT', p, b); },
  del(p) { return this._fetch('DELETE', p); },
};

async function _initApi() {
  try {
    const [configRes, taskRes, noteRes, focusRes, templateRes, seriesRes] = await Promise.all([
      _api.get('/config'),
      _api.get('/tasks?flat=true&per_page=100'),
      _api.get('/notes'),
      _api.get('/focus'),
      _api.get('/templates'),
      _api.get('/series'),
    ]);

    if (taskRes && taskRes.tasks) {
      const tasks = taskRes.tasks.map(t => ({
        id: String(t.id),
        title: t.title,
        description: t.description || '',
        status: t.status || 'not_started',
        priority: t.priority || 'medium',
        due_date: t.due_date || '',
        start_date: t.start_date || '',
        time: t.time || '',
        category: t.category || '',
        tags: t.tags || [],
        recur: t.recur || null,
        depends_on: (t.depends_on || []).map(d => String(typeof d === 'object' ? d.id : d)),
        annotations: (t.annotations || []).map(n => ({ id: String(n.id), text: n.text, timestamp: n.timestamp })),
        created_at: t.created_at,
        updated_at: t.updated_at,
        deleted_at: t.deleted_at || null,
        parent_id: t.parent_id ? String(t.parent_id) : null,
        series_id: t.series_id ? String(t.series_id) : null,
        files: t.files || [],
        sample: t.sample || t._sample || undefined,
      }));
      lsSet('tasks', tasks);
    }

    const cfg = {
      theme: configRes.theme === 'auto' ? 'system' : (configRes.theme || 'nord-dark'),
      date_mode: configRes.date_mode || 'smart',
      per_page: configRes.per_page || 25,
    };
    const oldCfg = lsGet('config', {});
    cfg.frog_enabled = oldCfg.frog_enabled || false;
    cfg.category_colors = configRes.category_colors || oldCfg.category_colors || '{}';
    lsSet('config', cfg);

    if (noteRes && noteRes.notes) {
      lsSet('notes', noteRes.notes.map(n => ({
        id: String(n.id), text: n.text, pinned: !!n.pinned,
        created_at: n.created_at, updated_at: n.updated_at,
      })));
    }

    if (focusRes && focusRes.task_ids) {
      const d = new Date();
      const today = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      lsSet('focus', { [today]: focusRes.task_ids });
    }

    if (templateRes && templateRes.templates) {
      lsSet('templates', templateRes.templates.map(t => ({
        name: t.name,
        title: t.title,
        description: t.description || '',
        priority: t.priority || 'medium',
        category: t.category || '',
        tags: t.tags || [],
        recur: t.recur || null,
      })));
    }

    if (seriesRes && seriesRes.series) {
      lsSet('series', seriesRes.series.map(s => ({
        id: String(s.id),
        title: s.title,
        description: s.description || '',
        priority: s.priority || 'medium',
        category: s.category || '',
        tags: s.tags || [],
        recur: s.recur,
        start_date: s.start_date || null,
        time: s.time || null,
        files: s.files || [],
        active: s.active !== false,
        created_at: s.created_at,
        updated_at: s.updated_at,
      })));
    }

    _api.ready = true;
    console.log('API connected');
   } catch (e) {
    _api.ready = false;
    console.log('API unavailable, using localStorage');
   }
   const oi=document.getElementById('offlineIndicator');
   if(oi)oi.style.display=_api.ready?'none':'flex'
}

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function todayStr(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function nowISO(){return new Date().toISOString()}
function fmtDate(d){if(!d)return'';const dateMode=lsGet('config',{}).date_mode||'smart';if(dateMode==='iso')return d;const dt=new Date(d+'T00:00:00'),td=new Date();td.setHours(0,0,0,0);const diff=Math.round((dt-td)/86400000);if(diff===0)return'today';if(diff===1)return'tomorrow';if(diff===-1)return'yesterday';if(diff>0&&diff<=7)return`in ${diff} days`;if(diff<0&&diff>=-7)return`${-diff} days ago`;return d}
function fmtDateTime(iso){if(!iso)return'';const d=new Date(iso);const now=new Date();const diff=Math.round((now-d)/60000);if(diff<1)return'just now';if(diff<60)return`${diff}m ago`;const hrs=Math.floor(diff/60);if(hrs<24)return`${hrs}h ago`;const days=Math.floor(hrs/24);if(days<7)return`${days}d ago`;return d.toLocaleDateString()}
function escHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}

// --- Data (API-first writes, localStorage as cache) ---
function _isNumericId(id){return/^\d+$/.test(String(id))}
function _taskPayload(t){
  return{
    title:t.title,description:t.description||'',status:t.status||'not_started',priority:t.priority||'medium',
    due_date:t.due_date||null,start_date:t.start_date||null,time:t.time||null,category:t.category||'',
    tags:t.tags||[],recur:t.recur||null,
    series_id:_isNumericId(t.series_id)?Number(t.series_id):null,
    depends_on:(t.depends_on||[]).filter(d=>_isNumericId(d)).map(Number),
    depends_on_str:(t.depends_on||[]).filter(d=>!_isNumericId(d)),
    annotations:t.annotations||[],files:t.files||[],
    parent_id:_isNumericId(t.parent_id)?Number(t.parent_id):null,
    _sample:t.sample||undefined,
  }
}
function buildTask(overrides = {}) {
  return {
    id: overrides.id || uid(),
    title: overrides.title || '',
    description: overrides.description || '',
    status: overrides.status || 'not_started',
    priority: overrides.priority || 'medium',
    due_date: overrides.due_date || '',
    start_date: overrides.start_date || '',
    time: overrides.time || '',
    category: overrides.category || '',
    tags: overrides.tags || [],
    recur: overrides.recur || null,
    series_id: overrides.series_id || null,
    depends_on: overrides.depends_on || [],
    annotations: overrides.annotations || [],
    files: overrides.files || [],
    parent_id: overrides.parent_id || null,
    created_at: overrides.created_at || nowISO(),
    updated_at: overrides.updated_at || nowISO(),
    deleted_at: overrides.deleted_at || null,
    sample: overrides.sample || undefined,
  }
}
async function _syncCollection(key,route,items,toPayload,onCreated){
  const prev=lsGet(key,[]);
  const prevIds=new Set(prev.map(x=>x.id));
  const curIds=new Set(items.map(x=>x.id));
  lsSet(key,items);
  try{
    for(const p of prev){
      if(!curIds.has(p.id)&&_isNumericId(p.id))
        await _api.del('/'+route+'/'+p.id).catch(()=>{})
    }
    for(const item of items){
      const pld=toPayload(item);
      if(_isNumericId(item.id)){
        await _api.put('/'+route+'/'+item.id,pld).catch(()=>{})
      }else{
        const resp=await _api.post('/'+route,pld).catch(()=>null);
        if(resp&&resp.id){const oldId=item.id;item.id=String(resp.id);if(onCreated)onCreated(oldId,item.id)}
      }
    }
  }catch(e){_markPending()}
}
function getTasks(){return lsGet('tasks',[])}
function saveTasks(t){return _syncCollection('tasks','tasks',t,_taskPayload,(oid,nid)=>{const stored=getTasks();for(const o of stored){if(o.depends_on&&o.depends_on.includes(oid))o.depends_on=o.depends_on.map(d=>d===oid?nid:d)}lsSet('tasks',stored)})}

// === State Machine ===
const validTransitions = {
  not_started: ['in_progress'],
  in_progress: ['done', 'cancelled'],
  done: ['in_progress'],
  cancelled: ['not_started'],
};
function canTransition(from, to) {
  const allowed = (validTransitions[from] || []).includes(to);
  if (!allowed) console.warn(`State transition "${from}" → "${to}" is not a documented transition`);
  return true;
}

// === Offline Write Queue ===
function _markPending(){lsSet('_pendingSync',true)}
function _clearPending(){lsSet('_pendingSync',false)}
function _hasPending(){return !!lsGet('_pendingSync',false)}
async function _flushQueue(){
  if(!_api.ready||!_hasPending())return;
  _clearPending();
  await saveTasks(getTasks());
  await saveNotes(getNotes());
  await saveTemplates(getTemplates());
  await saveSeries(getSeries());
  if(!_hasPending()){const oi=document.getElementById('offlineIndicator');if(oi)oi.style.display='none'}
}
window.addEventListener('online',_flushQueue);
function getActivity(){return lsGet('activity',[])}
function saveActivity(a){lsSet('activity',a)}
function getConfig(){return lsGet('config',{theme:'nord-dark',date_mode:'smart',per_page:25})}
async function saveConfig(c){
  lsSet('config',c);
  try{await _api.put('/config',{theme:c.theme,date_mode:c.date_mode,per_page:c.per_page,category_colors:c.category_colors||'{}'})}catch(e){}
}
function getCategoryColors(){
  const cfg=getConfig();
  try{return typeof cfg.category_colors==='string'?JSON.parse(cfg.category_colors):(cfg.category_colors||{})}catch{return{}}
}
function saveCategoryColor(cat,color){
  const colors=getCategoryColors();
  if(color)colors[cat]=color;else delete colors[cat];
  const cfg=getConfig();cfg.category_colors=JSON.stringify(colors);saveConfig(cfg);
}
function categoryDot(cat){
  const c=getCategoryColors()[cat];
  return c?`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c};margin-right:4px;vertical-align:middle"></span>`:'';
}
function getNotes(){return lsGet('notes',[])}
function saveNotes(n){return _syncCollection('notes','notes',n,x=>({text:x.text,pinned:!!x.pinned}))}
function getFocus(){return lsGet('focus',{})}
async function saveFocus(f){
  lsSet('focus',f);
  try{
    const d=new Date();
    const t=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    await _api.put('/focus',{task_ids:f[t]||[]})
  }catch(e){}
}

function logActivity(taskId,action,details=''){
  let a=getActivity();a.unshift({id:uid(),task_id:taskId,action,details,timestamp:nowISO()});
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-10);
  a=a.filter(e=>e.timestamp>=cutoff.toISOString());
  if(a.length>500)a.length=500;saveActivity(a)
}
function getTemplates(){return lsGet('templates',[])}
function saveTemplates(t){return _syncCollection('templates','templates',t,x=>({name:x.name,title:x.title,description:x.description||'',priority:x.priority||'medium',category:x.category||'',tags:x.tags||[],recur:x.recur||null}))}
function getSeries(){return lsGet('series',[])}
function saveSeries(s){return _syncCollection('series','series',s,x=>({title:x.title,description:x.description||'',priority:x.priority||'medium',category:x.category||'',tags:x.tags||[],recur:x.recur,start_date:x.start_date||null,time:x.time||null,files:x.files||[],active:x.active!==false}))}
function ensureSeriesForTask(t){
  if(t.recur&&!t.series_id){
    const series=getSeries();
    const ns={id:uid(),title:t.title,description:t.description||'',priority:t.priority||'medium',category:t.category||'',tags:[...(t.tags||[])],recur:t.recur,start_date:t.start_date||null,time:t.time||null,files:JSON.parse(JSON.stringify(t.files||[])),active:true,created_at:nowISO(),updated_at:nowISO()};
    series.push(ns);saveSeries(series);
    t.series_id=ns.id
  }
}
