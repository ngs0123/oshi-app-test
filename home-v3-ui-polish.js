(()=>{
const DATA_KEY='oshiPrototypeData';
function oshis(){try{const v=JSON.parse(localStorage.getItem(DATA_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function appFont(){const candidates=['.app','#listScreen','body'];for(const s of candidates){const el=document.querySelector(s);if(el){const f=getComputedStyle(el).fontFamily;if(f)return f}}return 'sans-serif'}
function applyChoiceColors(){const a=oshis();document.querySelectorAll('.hv3-choice[data-id]').forEach(b=>{const o=a.find(x=>String(x.id)===String(b.dataset.id));const c=o?.color||o?.memberColor||o?.themeColor||'#222222';b.style.setProperty('color',c,'important');b.querySelectorAll('span').forEach(x=>x.style.setProperty('color',c,'important'))})}
function polishPanel(){const p=document.getElementById('hv3DirectPanel');if(!p||!p.classList.contains('open'))return;const font=appFont();p.style.setProperty('font-family',font,'important');p.querySelectorAll('*').forEach(x=>x.style.setProperty('font-family',font,'important'));
  p.style.setProperty('left','8px','important');p.style.setProperty('right','8px','important');p.style.setProperty('width','auto','important');p.style.setProperty('max-width','none','important');p.style.setProperty('transform','none','important');p.style.setProperty('box-sizing','border-box','important');
  const imageMode=!!p.querySelector('.hv3-image-box');p.style.setProperty('max-height',imageMode?'22dvh':'26dvh','important');p.style.setProperty('padding',imageMode?'10px 12px':'11px 12px','important');
  const editing=document.querySelector('#homeScreen .hv3-item.hv3-editing');if(editing){const r=editing.getBoundingClientRect();p.classList.remove('top','bottom');if(r.top<innerHeight*.52){p.classList.add('bottom');p.style.setProperty('bottom','calc(82px + env(safe-area-inset-bottom))','important');p.style.removeProperty('top')}else{p.classList.add('top');p.style.setProperty('top','calc(58px + env(safe-area-inset-top))','important');p.style.removeProperty('bottom')}}
}
const css=document.createElement('style');css.textContent=`
.hv3-direct-panel{border-radius:16px!important;overflow:auto!important}
.hv3-direct-head{margin-bottom:4px!important;min-height:30px!important}.hv3-direct-head>b{font-size:15px!important}.hv3-direct-head>button{width:30px!important;height:30px!important;font-size:17px!important}
.hv3-direct-panel label{margin:3px 0!important;font-size:10px!important;line-height:1.2!important}
.hv3-direct-panel input[type=text],.hv3-direct-panel input[type=date]{padding:7px 8px!important}
.hv3-direct-panel input[type=range]{margin:0!important}
.hv3-mini-pos{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:5px!important}.hv3-mini-grid{gap:1px 6px!important}
.hv3-direct-actions{margin-top:5px!important;gap:6px!important}.hv3-direct-actions button{padding:7px!important;border-radius:10px!important}
.hv3-image-box{display:grid!important;grid-template-columns:1fr auto!important;align-items:center!important;gap:6px!important}.hv3-image-box label{margin:0!important}.hv3-image-box .danger{white-space:nowrap!important;padding:7px 9px!important}
.hv3-choice{color:#222!important}.hv3-choice span{color:inherit!important}
`;
document.head.appendChild(css);
const obs=new MutationObserver(()=>{applyChoiceColors();polishPanel()});obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});setTimeout(()=>{applyChoiceColors();polishPanel()},700);
})();