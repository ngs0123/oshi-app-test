(()=>{
let rescuing=false;
const homeActive=()=>document.getElementById('homeScreen')?.classList.contains('active');
const wanted=el=>el?.closest?.('#hv3Switch,#hv3Edit,#homeScreen .hv3-item[data-direct-key]');
const css=document.createElement('style');
css.textContent=`
.hv3-sheet:not(.open),.homeSheet:not(.open),#hv3DirectPanel:not(.open),.hv3-direct-panel:not(.open),.hv3-inspector:not(.open){pointer-events:none!important}
#homeScreen .hv3-switch,#homeScreen .hv3-edit,#homeScreen .hv3-item[data-direct-key]{pointer-events:auto!important;position:absolute;z-index:120!important}
#homeScreen .hv3-shade{pointer-events:none!important}
`;
document.head.appendChild(css);
function rescue(e){
  if(rescuing||!homeActive())return;
  if(wanted(e.target))return;
  const p=e.changedTouches?.[0]||e.touches?.[0]||e;
  if(typeof p.clientX!=='number'||typeof p.clientY!=='number')return;
  const stack=document.elementsFromPoint?.(p.clientX,p.clientY)||[];
  const target=stack.map(wanted).find(Boolean);
  if(!target)return;
  rescuing=true;
  e.preventDefault?.();
  e.stopImmediatePropagation?.();
  setTimeout(()=>{try{target.click()}finally{rescuing=false}},0);
}
document.addEventListener('touchend',rescue,true);
document.addEventListener('pointerup',rescue,true);
})();