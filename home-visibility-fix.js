(()=>{
  const ACTIVE_KEY='oshiHomeActiveOshiId';
  const SETTINGS_KEY='oshiHomeSettingsByOshi';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function getOshis(){try{return typeof oshis!=='undefined'&&Array.isArray(oshis)?oshis:(Array.isArray(window.oshis)?window.oshis:[])}catch{return[]}}
  function activeOshi(){const list=getOshis(),id=localStorage.getItem(ACTIVE_KEY);return (id&&list.find(o=>String(o.id)===String(id)))||list.find(o=>o.favorite)||list[0]||null}
  function settings(o){let all={};try{all=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')}catch{}const s=all[String(o.id)]||{};return{backgroundType:s.backgroundType||'image',backgroundData:s.backgroundData||o.icon||'',oshiIcon:s.oshiIcon||o.icon||'',oshiName:s.oshiName||o.name||'',fanName:s.fanName||'わたし',phrase:s.phrase||'好きになって',startDate:s.startDate||o.startDate||'',showDays:s.showDays!==false,showYmd:s.showYmd!==false,showBirthday:s.showBirthday!==false,textColor:s.textColor||'#fff',overlay:s.overlay==null?36:Number(s.overlay)}}
  function parse(v){if(!v)return null;const d=new Date(v+'T00:00:00');return Number.isNaN(d.getTime())?null:d}
  function elapsed(v){const s=parse(v);if(!s)return null;const n=new Date(),t=new Date(n.getFullYear(),n.getMonth(),n.getDate());let days=Math.max(0,Math.floor((t-s)/86400000));let y=t.getFullYear()-s.getFullYear(),m=t.getMonth()-s.getMonth(),d=t.getDate()-s.getDate();if(d<0){m--;d+=new Date(t.getFullYear(),t.getMonth(),0).getDate()}if(m<0){y--;m+=12}return{days,y:Math.max(0,y),m:Math.max(0,m),d:Math.max(0,d)}}
  function fmt(v){const d=parse(v);return d?`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`:''}
  function birthday(o){if(o.birthDate)return fmt(o.birthDate);if(o.birthMonth&&o.birthDay)return`${String(o.birthMonth).padStart(2,'0')}.${String(o.birthDay).padStart(2,'0')}`;return''}
  function focusize(){
    const home=document.getElementById('homeScreen'); if(!home)return;
    // 自分の顔はホームの主役にしない。推しだけを大きく見せる。
    home.classList.add('pushFocusHome');
    const people=home.querySelector('.peopleRow');
    if(people){const blocks=people.querySelectorAll('.personBlock');if(blocks[1])blocks[1].style.display='none';const heart=people.querySelector('.heartMark');if(heart)heart.style.display='none'}
  }
  function fallback(){
    const home=document.getElementById('homeScreen'),body=document.getElementById('homeBody');
    if(!home||!body||!home.classList.contains('active')||body.children.length)return;
    const o=activeOshi();if(!o){body.innerHTML='<div class="homeEmpty"><div class="homeEmptyIcon">💘</div><b>まず推しを登録しよう</b></div>';return}
    const s=settings(o),e=elapsed(s.startDate),bd=birthday(o),bg=s.backgroundData?(s.backgroundType==='video'?`<video class="homeFullMedia" src="${s.backgroundData}" autoplay muted loop playsinline></video>`:`<img class="homeFullMedia" src="${s.backgroundData}" alt="">`):`<div class="homeFallback" style="background:${esc(o.color||'#d86aa8')}"></div>`;
    body.innerHTML=`<div class="fanHome" style="--home-text:${esc(s.textColor)};--home-overlay:${Math.max(0,Math.min(80,s.overlay))/100}">${bg}<div class="fanHomeOverlay"></div><div class="fanHomeTop"><button type="button" class="homeRoundBtn" onclick="window.showHome&&window.showHome()">☰</button><button type="button" class="homeRoundBtn" id="homeFallbackEdit">✎</button></div><div class="fanHomeContent"><div class="peopleRow"><div class="personBlock"><div class="personAvatar">${s.oshiIcon?`<img src="${s.oshiIcon}">`:'💘'}</div><b>${esc(s.oshiName)}</b></div></div>${s.fanName?`<div class="fanNameOnly">${esc(s.fanName)}</div>`:''}<div class="phrase">${esc(s.phrase)}</div>${s.startDate?`<div class="startDate">${fmt(s.startDate)}</div>`:''}${e&&s.showDays?`<div class="daysCount">${e.days.toLocaleString('ja-JP')} <small>DAYS</small></div>`:''}${e&&s.showYmd?`<div class="ymdCount">${e.y}年 ${e.m}ヶ月 ${e.d}日</div>`:''}${s.showBirthday&&bd?`<div class="birthdayLine">🎂 ${esc(bd)}</div>`:''}</div></div>`;
    const eb=document.getElementById('homeFallbackEdit');if(eb)eb.onclick=()=>{try{window.renderHome?.();setTimeout(()=>document.getElementById('homeEditBtn')?.click(),0)}catch{}};
    focusize();
  }
  const oldShow=window.showHome;
  if(typeof oldShow==='function')window.showHome=function(...a){const r=oldShow.apply(this,a);setTimeout(()=>{try{window.renderHome?.()}catch{}focusize();fallback()},0);setTimeout(()=>{focusize();fallback()},120);return r};
  const mo=new MutationObserver(()=>{if(document.getElementById('homeScreen')?.classList.contains('active')){focusize();setTimeout(fallback,0)}});
  mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  const st=document.createElement('style');st.textContent=`#homeScreen.pushFocusHome .peopleRow{justify-content:center}.pushFocusHome .peopleRow .personBlock:first-child .personAvatar{width:92px;height:92px}.pushFocusHome .fanNameOnly{font-size:calc(12px * var(--font-scale));opacity:.78;margin:-6px 0 12px}.pushFocusHome .personBlock:first-child b{font-size:calc(19px * var(--font-scale));max-width:220px}`;document.head.appendChild(st);
  setTimeout(()=>{try{if(document.getElementById('homeScreen')?.classList.contains('active'))window.renderHome?.()}catch{}focusize();fallback()},260);
})();