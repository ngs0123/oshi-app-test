(()=>{
const sortDefs={
  join:{label:'入所順',dirs:[['asc','古い方から'],['desc','新しい方から']]},
  birthYear:{label:'生まれ年順',dirs:[['desc','若い方から'],['asc','年上から']]},
  birthMonth:{label:'誕生月順',dirs:[['asc','1月から'],['desc','12月から']]}
};
function sortValue(o,key){
  if(key==='join') return o.joinDate?Date.parse(o.joinDate+'T00:00:00'):null;
  if(key==='birthYear') return o.birthDate?Number(o.birthDate.slice(0,4)):null;
  if(key==='birthMonth'){
    if(o.birthDate){const [,m,d]=o.birthDate.split('-').map(Number);return m*100+d}
    if(o.birthMonth&&o.birthDay)return Number(o.birthMonth)*100+Number(o.birthDay);
    return null;
  }
  return null;
}
function sorted(arr){
  const key=appSettings.listSortKey||'';if(!key)return [...arr];
  const dir=appSettings.listSortDir||sortDefs[key]?.dirs?.[0]?.[0]||'asc';
  return [...arr].sort((a,b)=>{
    const av=sortValue(a,key),bv=sortValue(b,key);
    if(av==null&&bv==null)return Number(a.id)-Number(b.id);
    if(av==null)return 1;if(bv==null)return -1;
    const c=av-bv;if(c!==0)return dir==='desc'?-c:c;
    return String(a.name||'').localeCompare(String(b.name||''),'ja');
  });
}
function sortLabel(){const key=appSettings.listSortKey||'';return key?`並べ替え：${sortDefs[key].label}`:'並べ替え'}
function ensureSortSheet(){
  if(document.getElementById('sortSheet'))return;
  const m=document.createElement('div');m.id='sortSheet';m.className='sortModal';m.innerHTML=`<div class="sortPanel"><div class="sortHead"><b>並べ替え</b><button type="button" id="sortClose">×</button></div><div class="sub">全体表示なら全体を、カテゴリ表示なら各カテゴリ内を並べ替えるっしょ。</div><div id="sortBody"></div></div>`;document.body.appendChild(m);
  document.getElementById('sortClose').onclick=()=>m.classList.remove('open');m.onclick=e=>{if(e.target===m)m.classList.remove('open')};
}
function renderSortSheet(){
  ensureSortSheet();const body=document.getElementById('sortBody'),key=appSettings.listSortKey||'';
  body.innerHTML=`<div class="sortChoices"><button type="button" data-sort="" class="${!key?'selected':''}">登録順</button>${Object.entries(sortDefs).map(([k,d])=>`<button type="button" data-sort="${k}" class="${key===k?'selected':''}">${d.label}</button>`).join('')}</div>${key?`<div class="sortDirTitle">向き</div><div class="sortChoices">${sortDefs[key].dirs.map(([v,l])=>`<button type="button" data-dir="${v}" class="${(appSettings.listSortDir||sortDefs[key].dirs[0][0])===v?'selected':''}">${l}</button>`).join('')}</div>`:''}`;
  body.querySelectorAll('[data-sort]').forEach(b=>b.onclick=()=>{const k=b.dataset.sort;appSettings.listSortKey=k;if(k)appSettings.listSortDir=sortDefs[k].dirs[0][0];else delete appSettings.listSortDir;saveSettings();renderSortSheet();renderList()});
  body.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>{appSettings.listSortDir=b.dataset.dir;saveSettings();renderSortSheet();renderList()});
}
window.openSortSheet=function(){renderSortSheet();document.getElementById('sortSheet').classList.add('open')};
const st=document.createElement('style');st.textContent=`.sortBar{display:flex;margin:-3px 0 12px}.sortBar button{width:100%;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:13px;padding:9px 11px;font-weight:800}.sortModal{position:fixed;inset:0;z-index:110;background:rgba(0,0,0,.25);display:none;align-items:flex-end}.sortModal.open{display:flex}.sortPanel{width:min(520px,100%);margin:auto;background:#fff;border-radius:24px 24px 0 0;padding:16px 14px calc(20px + env(safe-area-inset-bottom));box-shadow:0 -18px 55px rgba(0,0,0,.16)}.sortHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}.sortHead b{font-size:calc(20px * var(--font-scale))}.sortHead button{border:0;background:#f6f3f5;border-radius:12px;width:36px;height:36px;font-size:22px}.sortChoices{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:14px}.sortChoices button{border:1px solid var(--line);background:#fff;border-radius:14px;padding:11px 8px;color:var(--ink)}.sortChoices button.selected{border-color:var(--accent);background:var(--soft);font-weight:900}.sortDirTitle{margin-top:18px;font-size:12px;color:var(--muted);font-weight:800}`;document.head.appendChild(st);

// 入所日 / 活動開始日を編集フォームへ追加
const birthdayField=document.getElementById('birthdayMode')?.closest('.field');
if(birthdayField&&!document.getElementById('joinDate')){const f=document.createElement('div');f.className='field';f.innerHTML='<label>入所日 / 活動開始日 <span class="optional">任意</span></label><input id="joinDate" type="date"><div class="sub" style="margin-top:6px">事務所への入所日・活動開始日など、並べ替えに使える日付</div>';birthdayField.before(f)}
const oldBlank=window.blankForm;if(oldBlank)window.blankForm=function(){oldBlank();if(document.getElementById('joinDate'))document.getElementById('joinDate').value=''};
const oldFill=window.fillForm;if(oldFill)window.fillForm=function(o){oldFill(o);if(document.getElementById('joinDate'))document.getElementById('joinDate').value=o.joinDate||''};
const oldGet=window.getFormData;if(oldGet)window.getFormData=function(id){const o=oldGet(id);o.joinDate=document.getElementById('joinDate')?.value||'';return o};
const oldOpenDetail=window.openDetail;if(oldOpenDetail)window.openDetail=function(id){oldOpenDetail(id);const o=oshis.find(x=>x.id===id);if(!o?.joinDate)return;const card=document.querySelector('#detailContent .detailInfoCard');if(card&&!card.querySelector('[data-join-info]')){const el=document.createElement('div');el.className='info';el.dataset.joinInfo='1';const [y,m,d]=o.joinDate.split('-').map(Number);el.innerHTML=`<b>入所日 / 活動開始日</b>${y}年${m}月${d}日`;const bday=[...card.querySelectorAll('.info')].find(x=>x.querySelector('b')?.textContent==='誕生日');if(bday)card.insertBefore(el,bday);else card.appendChild(el)}};

// 既存カテゴリ表示ロジックはそのまま使い、元配列の順番だけ一時的に並べ替える
const oldRender=window.renderList;
window.renderList=function(){
  const original=oshis;oshis=sorted(original);
  try{oldRender()}finally{oshis=original}
  const c=document.getElementById('listContent');if(!c)return;
  const tools=c.querySelector('.listTools');if(tools){const bar=document.createElement('div');bar.className='sortBar';bar.innerHTML=`<button type="button" onclick="openSortSheet()">${sortLabel()}</button>`;tools.after(bar)}
};
setTimeout(()=>{if(document.getElementById('listScreen')?.classList.contains('active'))renderList()},80);
})();