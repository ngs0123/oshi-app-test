(()=>{
const KEY='oshiCategoryAxes';
let axes=JSON.parse(localStorage.getItem(KEY)||'[]');
const escCat=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,7);

// 旧試作データ（options式）を階層ノード式へ移行
axes=axes.map(a=>{
  if(Array.isArray(a.nodes)) return a;
  const nodes=(a.options||[]).map(o=>({id:o.id||uid('n'),name:o.name,parentId:null}));
  return {id:a.id||uid('a'),name:a.name||'カテゴリ',nodes};
});
saveAxes();

function saveAxes(){localStorage.setItem(KEY,JSON.stringify(axes))}
function axisById(id){return axes.find(a=>String(a.id)===String(id))}
function nodeById(a,id){return (a?.nodes||[]).find(n=>String(n.id)===String(id))}
function childrenOf(a,parentId){return (a?.nodes||[]).filter(n=>String(n.parentId??'')===String(parentId??''))}
function selectedNow(){const out={};document.querySelectorAll('.categoryChoice:checked').forEach(e=>(out[e.dataset.axis]||(out[e.dataset.axis]=[])).push(e.value));return out}
function descendants(a,id){const out=[];const walk=x=>childrenOf(a,x).forEach(n=>{out.push(n.id);walk(n.id)});walk(id);return out}
function pathNames(a,id){const arr=[];let n=nodeById(a,id);while(n){arr.unshift(n.name);n=n.parentId?nodeById(a,n.parentId):null}return arr}

function renderTreeChoices(a,parentId,sel,depth=0){
  return childrenOf(a,parentId).map(n=>{
    const checked=(sel[a.id]||[]).map(String).includes(String(n.id));
    return `<div class="treeChoice" style="--depth:${depth}"><label class="choiceLabel treeLabel"><input class="categoryChoice" type="checkbox" data-axis="${a.id}" value="${n.id}" ${checked?'checked':''}><span>${escCat(n.name)}</span></label>${renderTreeChoices(a,n.id,sel,depth+1)}</div>`;
  }).join('');
}
function renderAssignments(sel={}){
  const c=document.getElementById('categoryAssignments');if(!c)return;
  if(!axes.length){c.innerHTML='<div class="categoryEmpty">まだカテゴリなし。下の「カテゴリを管理」から作れるっしょ。</div>';return}
  c.innerHTML=axes.map(a=>`<div class="categoryAssign"><b>${escCat(a.name)}</b>${a.nodes?.length?`<div class="treeChoices">${renderTreeChoices(a,null,sel)}</div>`:'<div class="categoryEmpty">まだ中身なし</div>'}</div>`).join('');
}

let managerAxisId=null,managerParentId=null;
function ensureManager(){
  if(document.getElementById('categoryManager'))return;
  const m=document.createElement('div');m.id='categoryManager';m.className='categoryModal';m.innerHTML=`<div class="categorySheet"><div class="categorySheetHead"><button class="categoryIconBtn" id="catBack" type="button">‹</button><div><b id="catTitle">カテゴリ管理</b><div class="sub" id="catPath">大きな分類から1段ずつ作れる</div></div><button class="categoryIconBtn" id="catClose" type="button">×</button></div><div id="catBody"></div></div>`;document.body.appendChild(m);
  document.getElementById('catClose').onclick=closeCategoryManager;
  document.getElementById('catBack').onclick=categoryManagerBack;
  m.addEventListener('click',e=>{if(e.target===m)closeCategoryManager()});
}
function openCategoryManager(){ensureManager();managerAxisId=null;managerParentId=null;document.getElementById('categoryManager').classList.add('open');renderCategoryManager()}
function closeCategoryManager(){document.getElementById('categoryManager')?.classList.remove('open');renderAssignments(selectedNow());if(document.getElementById('listScreen')?.classList.contains('active'))renderList()}
function categoryManagerBack(){
  if(!managerAxisId){closeCategoryManager();return}
  const a=axisById(managerAxisId);
  if(managerParentId){const p=nodeById(a,managerParentId);managerParentId=p?.parentId||null}else managerAxisId=null;
  renderCategoryManager();
}
function renderCategoryManager(){
  ensureManager();const title=document.getElementById('catTitle'),path=document.getElementById('catPath'),body=document.getElementById('catBody'),back=document.getElementById('catBack');
  if(!managerAxisId){
    title.textContent='カテゴリ管理';path.textContent='まず大きなカテゴリを作る';back.style.visibility='hidden';
    body.innerHTML=`<div class="managerExplain">例：<b>所属</b> / <b>作品</b> / <b>推し方</b> / <b>同担スタンス</b></div><div class="managerList">${axes.map(a=>`<button class="managerRow" type="button" data-axis="${a.id}"><span><b>${escCat(a.name)}</b><small>${(a.nodes||[]).length}カテゴリ</small></span><i>›</i></button>`).join('')||'<div class="categoryEmpty">まだ大カテゴリがないっしょ。</div>'}</div><div class="managerAdd"><input id="newAxisName" placeholder="大カテゴリ名 例：所属"><button type="button" id="addAxisBtn">作成</button></div>`;
    body.querySelectorAll('[data-axis]').forEach(b=>b.onclick=()=>{managerAxisId=b.dataset.axis;managerParentId=null;renderCategoryManager()});
    document.getElementById('addAxisBtn').onclick=()=>{const i=document.getElementById('newAxisName'),name=i.value.trim();if(!name)return;axes.push({id:uid('a'),name,nodes:[]});saveAxes();i.value='';renderCategoryManager()};
    return;
  }
  const a=axisById(managerAxisId);if(!a){managerAxisId=null;renderCategoryManager();return}
  back.style.visibility='visible';
  const parent=managerParentId?nodeById(a,managerParentId):null;
  title.textContent=parent?parent.name:a.name;
  path.textContent=parent?[a.name,...pathNames(a,parent.id)].join(' › '):`${a.name} の中にカテゴリを作る`;
  const kids=childrenOf(a,managerParentId);
  body.innerHTML=`<div class="managerExplain">${parent?'この中にさらにカテゴリを追加できるっしょ。':'まずこの中のカテゴリを1つずつ作成。'}</div><div class="managerList">${kids.map(n=>`<button class="managerRow" type="button" data-node="${n.id}"><span><b>${escCat(n.name)}</b><small>${childrenOf(a,n.id).length?childrenOf(a,n.id).length+'個の子カテゴリ':'タップしてさらに下を作成'}</small></span><i>›</i></button>`).join('')||'<div class="categoryEmpty">この階層にはまだ何もないっしょ。</div>'}</div><div class="managerAdd"><input id="newNodeName" placeholder="${parent?'この中のカテゴリ名':'カテゴリ名 例：KAWAII LAB.'}"><button type="button" id="addNodeBtn">追加</button></div>${!parent?`<button class="managerDanger" type="button" id="deleteAxisBtn">「${escCat(a.name)}」を削除</button>`:''}`;
  body.querySelectorAll('[data-node]').forEach(b=>b.onclick=()=>{managerParentId=b.dataset.node;renderCategoryManager()});
  document.getElementById('addNodeBtn').onclick=()=>{const i=document.getElementById('newNodeName'),name=i.value.trim();if(!name)return;a.nodes.push({id:uid('n'),name,parentId:managerParentId||null});saveAxes();i.value='';renderCategoryManager()};
  const del=document.getElementById('deleteAxisBtn');if(del)del.onclick=()=>{if(!confirm(`「${a.name}」と中のカテゴリを全部削除する？`))return;axes=axes.filter(x=>x.id!==a.id);oshis.forEach(o=>{if(o.categoryAssignments)delete o.categoryAssignments[a.id]});localStorage.setItem('oshiPrototypeData',JSON.stringify(oshis));saveAxes();managerAxisId=null;managerParentId=null;renderCategoryManager()};
}
window.openCategoryManager=openCategoryManager;
window.setCategoryGrouping=function(v){appSettings.listGroupAxis=v;saveSettings();renderList()};

const style=document.createElement('style');style.textContent=`
.listTools{display:flex;gap:8px;margin:2px 0 12px}.listTools select{flex:1;min-width:0;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:13px;padding:9px}.categoryBtn{border:1px solid var(--line);background:#fff;border-radius:13px;padding:9px 11px;font-weight:800;white-space:nowrap}.groupHead{font-size:calc(17px * var(--font-scale));font-weight:900;margin:16px 3px 7px}.groupHead small{color:var(--muted);font-size:calc(11px * var(--font-scale));font-weight:600}.groupHead.level1{margin-left:14px;font-size:calc(15px * var(--font-scale))}.groupHead.level2{margin-left:27px;font-size:calc(14px * var(--font-scale))}.categoryAssign{margin:9px 0;padding:11px;border:1px solid var(--line);border-radius:14px;background:#fff}.categoryAssign>b{display:block;margin-bottom:7px}.treeChoice{margin-left:calc(var(--depth) * 14px)}.choiceLabel{display:flex;gap:7px;align-items:center;padding:7px 8px;border-radius:10px;font-size:calc(12px * var(--font-scale))}.choiceLabel input{width:auto}.treeLabel:has(input:checked){background:var(--soft)}.categoryEmpty{padding:12px;border:1px dashed var(--line);border-radius:14px;color:var(--muted);font-size:calc(11px * var(--font-scale))}.categoryModal{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.25);display:none;align-items:flex-end}.categoryModal.open{display:flex}.categorySheet{width:min(520px,100%);max-height:82dvh;margin:auto;background:#fff;border-radius:24px 24px 0 0;padding:12px 14px calc(18px + env(safe-area-inset-bottom));overflow:auto;box-shadow:0 -18px 55px rgba(0,0,0,.16)}.categorySheetHead{position:sticky;top:-12px;z-index:2;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);display:grid;grid-template-columns:40px 1fr 40px;align-items:center;gap:8px;padding:10px 0 12px}.categorySheetHead>b{font-size:16px}.categoryIconBtn{border:0;background:#f6f3f5;border-radius:12px;width:36px;height:36px;font-size:22px}.managerExplain{font-size:13px;color:var(--muted);padding:5px 2px 11px;line-height:1.55}.managerList{display:grid;gap:8px}.managerRow{width:100%;border:1px solid var(--line);background:#fff;border-radius:15px;padding:12px 13px;display:flex;justify-content:space-between;align-items:center;text-align:left;color:var(--ink)}.managerRow span{display:grid;gap:3px}.managerRow small{color:var(--muted);font-size:11px}.managerRow i{font-style:normal;font-size:22px;color:#aaa}.managerAdd{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:14px}.managerAdd input{min-width:0;border:1px solid var(--line);border-radius:13px;padding:11px 12px}.managerAdd button{border:0;background:var(--accent);color:#fff;border-radius:13px;padding:10px 14px;font-weight:800}.managerDanger{width:100%;margin-top:18px;border:1px solid #efc9cf;background:#fff;color:#c64e60;border-radius:13px;padding:10px;font-weight:800}`;document.head.appendChild(style);

const profileStyle=document.querySelector('.profileStyleCard');if(profileStyle){const box=document.createElement('div');box.className='field';box.innerHTML='<label>カテゴリ <span class="optional">任意・複数可</span></label><div id="categoryAssignments"></div><button type="button" class="secondary" onclick="openCategoryManager()">＋ カテゴリを管理</button>';profileStyle.before(box)}
const baseBlank=window.blankForm;baseBlank&&(window.blankForm=function(){baseBlank();renderAssignments({})});
const baseFill=window.fillForm;baseFill&&(window.fillForm=function(o){baseFill(o);renderAssignments(o.categoryAssignments||{})});
const baseGet=window.getFormData;baseGet&&(window.getFormData=function(id){const o=baseGet(id);o.categoryAssignments=selectedNow();return o});

function card(o){return `<div class="card"><button class="oshiCardBtn" onclick="openDetail(${o.id})"><div class="oshiRow"><div class="avatar" style="border-color:${o.color}">${o.icon?`<img src="${o.icon}">`:escCat(o.name.slice(0,2))}</div><div class="oshiText"><div class="oshiName">${escCat(o.name)}</div><div class="meta">${escCat([o.group,o.category,o.agency].filter(Boolean).slice(0,2).join(' / ')||'詳細未設定')}</div><div class="colorline"><span class="dot" style="background:${o.color}"></span><span>${escCat(o.colorName||'カラー名未設定')}</span>${o.startDate?`<span>・${countDays(o)}日</span>`:''}</div></div><div class="chev">›</div></div></button></div>`}
function assignedTo(o,a,nodeId){const ids=(o.categoryAssignments?.[a.id]||[]).map(String);if(ids.includes(String(nodeId)))return true;return descendants(a,nodeId).some(id=>ids.includes(String(id)))}
function renderNodeGroup(a,n,depth){const direct=oshis.filter(o=>(o.categoryAssignments?.[a.id]||[]).map(String).includes(String(n.id)));const kids=childrenOf(a,n.id);const any=direct.length||kids.some(k=>oshis.some(o=>assignedTo(o,a,k.id)));if(!any)return'';let html=`<div class="groupHead level${Math.min(depth,2)}">${escCat(n.name)} <small>${oshis.filter(o=>assignedTo(o,a,n.id)).length}人</small></div>`;if(direct.length)html+=direct.map(card).join('');kids.forEach(k=>html+=renderNodeGroup(a,k,depth+1));return html}
window.renderList=function(){const c=document.getElementById('listContent'),axis=axisById(appSettings.listGroupAxis||'');if(!c)return;const tools=`<div class="listTools"><select onchange="setCategoryGrouping(this.value)"><option value="">グループ分け：なし</option>${axes.map(a=>`<option value="${a.id}" ${axis&&String(axis.id)===String(a.id)?'selected':''}>グループ分け：${escCat(a.name)}</option>`).join('')}</select><button class="categoryBtn" onclick="openCategoryManager()">カテゴリ管理</button></div>`;if(!oshis.length){c.innerHTML=tools+'<div class="empty"><div><div class="emptyIcon">💗</div><h2>まだ推しがいません</h2><p class="hint">まず1人登録してみるっしょ。</p><button class="primary" onclick="openForm()">＋ 推しを登録する</button></div></div>';return}if(!axis){c.innerHTML=tools+'<div class="sub" style="margin:3px 3px 10px">登録中の推し・'+oshis.length+'</div>'+oshis.map(card).join('');return}let html=tools;childrenOf(axis,null).forEach(n=>html+=renderNodeGroup(axis,n,0));const unc=oshis.filter(o=>!(o.categoryAssignments?.[axis.id]||[]).length);if(unc.length)html+=`<div class="groupHead">未分類 <small>${unc.length}人</small></div>${unc.map(card).join('')}`;c.innerHTML=html};
setTimeout(()=>{if(document.getElementById('listScreen')?.classList.contains('active'))renderList()},0);
})();
