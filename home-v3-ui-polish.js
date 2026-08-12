(()=>{
const DATA_KEY='oshiPrototypeData';
function oshis(){try{const v=JSON.parse(localStorage.getItem(DATA_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function applyChoiceColors(){const a=oshis();document.querySelectorAll('.hv3-choice[data-id]').forEach(b=>{const o=a.find(x=>String(x.id)===String(b.dataset.id));const c=o?.color||o?.memberColor||o?.themeColor||'#222222';b.style.setProperty('color',c,'important');b.querySelectorAll('*').forEach(x=>x.style.setProperty('color',c,'important'))})}
const css=document.createElement('style');css.textContent=`
.hv3-direct-panel,.hv3-direct-panel *,.hv3-sheet,.hv3-sheet *{font-family:inherit!important}
.hv3-direct-panel{left:10px!important;right:10px!important;width:auto!important;max-width:none!important;box-sizing:border-box!important;max-height:30dvh!important;padding:12px 14px!important;border-radius:18px!important;overflow:auto!important}
.hv3-direct-panel.bottom{bottom:calc(88px + env(safe-area-inset-bottom))!important}
.hv3-direct-panel.top{top:calc(58px + env(safe-area-inset-top))!important}
.hv3-direct-head{margin-bottom:6px!important}.hv3-direct-head>b{font-size:16px!important}
.hv3-direct-panel label{margin:5px 0!important;font-size:11px!important}
.hv3-mini-pos{gap:6px!important}.hv3-mini-grid{gap:2px 8px!important}
.hv3-direct-actions{margin-top:7px!important}.hv3-direct-actions button{padding:9px!important}
.hv3-image-box{display:grid!important;grid-template-columns:1fr auto!important;align-items:end!important;gap:8px!important}
.hv3-image-box label{margin:0!important}.hv3-image-box .danger{white-space:nowrap!important;padding:8px 10px!important}
.hv3-choice{color:#222!important}.hv3-choice span{color:inherit!important}
`;
document.head.appendChild(css);
new MutationObserver(()=>applyChoiceColors()).observe(document.documentElement,{subtree:true,childList:true});setTimeout(applyChoiceColors,700);
})();