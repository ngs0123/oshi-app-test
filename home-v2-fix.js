(()=>{
const DATA_KEY='oshiPrototypeData';
const ACTIVE_KEY='oshiHomeActiveOshiId';
const SETTINGS_KEY='oshiHomeSettingsByOshi';
const $=id=>document.getElementById(id);
function list(){try{const v=JSON.parse(localStorage.getItem(DATA_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function active(){const a=list(),id=localStorage.getItem(ACTIVE_KEY);return (id&&a.find(o=>String(o.id)===String(id)))||a.find(o=>o.favorite)||a[0]||null}
function allSettings(){try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')}catch{return{}}}
function readData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(r.error||new Error('read failed'));r.readAsDataURL(file)})}
function compressImage(file,max=1200,quality=.82){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{let w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;const scale=Math.min(1,max/Math.max(w,h));w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);try{resolve(c.toDataURL('image/jpeg',quality))}catch(e){reject(e)}};img.onerror=()=>reject(new Error('image load failed'));img.src=String(r.result||'')};r.onerror=()=>reject(r.error||new Error('read failed'));r.readAsDataURL(file)})}
async function fileValue(id,kind){const f=$(id)?.files?.[0];if(!f)return null;if(kind==='video'){if(f.size>1500000)throw new Error('動画が大きすぎるっしょ。試作版では1.5MB以下の動画で試してね。');return await readData(f)}return await compressImage(f,kind==='bg'?1600:480,kind==='bg'?.84:.86)}
async function saveHomeFromForm(btn){const o=active();if(!o)throw new Error('推しが見つからないっしょ');const all=allSettings(),old=all[String(o.id)]||{};const s={...old};s.oshiName=$('hv2OshiName')?.value.trim()||o.name||'';s.fanName=$('hv2FanName')?.value.trim()||'わたし';s.phrase=$('hv2Phrase')?.value.trim()||'好きになって';s.startDate=$('hv2StartDate')?.value||o.startDate||'';s.showDays=!!$('hv2ShowDays')?.checked;s.showYmd=!!$('hv2ShowYmd')?.checked;s.showBirthday=!!$('hv2ShowBirthday')?.checked;s.textColor=$('hv2TextColor')?.value||'#ffffff';s.overlay=Number($('hv2Overlay')?.value||36);
const [bgImage,bgVideo,oshiIcon,fanIcon]=await Promise.all([fileValue('hv2BgImage','bg'),fileValue('hv2BgVideo','video'),fileValue('hv2OshiIcon','icon'),fileValue('hv2FanIcon','icon')]);
if(bgImage){s.backgroundType='image';s.backgroundData=bgImage}else if(bgVideo){s.backgroundType='video';s.backgroundData=bgVideo}
if(oshiIcon)s.oshiIcon=oshiIcon;if(fanIcon)s.fanIcon=fanIcon;
all[String(o.id)]=s;
try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(all))}catch(e){throw new Error('画像の保存容量を超えたっしょ。別の画像か小さめの画像で試してね。')}
if(btn){btn.textContent='保存した！';btn.disabled=true}
setTimeout(()=>{document.getElementById('hv2EditModal')?.classList.remove('open');if(typeof window.renderHome==='function')window.renderHome()},180)
}
const style=document.createElement('style');style.textContent=`#homeScreen>.homeTop{display:none!important}#homeScreen>.homeTop+#homeBody{margin-top:0!important}.hv2-modal{z-index:500!important}.hv2-save{position:relative;z-index:2;touch-action:manipulation}`;document.head.appendChild(style);
document.addEventListener('click',async e=>{const btn=e.target.closest?.('#hv2Save');if(!btn)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(btn.disabled)return;const original=btn.textContent;btn.textContent='保存中…';try{await saveHomeFromForm(btn)}catch(err){console.error(err);btn.textContent=original;btn.disabled=false;alert(err?.message||'保存できなかったっしょ')}} ,true);
})();