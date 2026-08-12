(()=>{
const screenToToolbar={
 homeScreen:'home',
 listScreen:'list',
 settingsScreen:'menu',
 categoryScreen:'list',
 detailScreen:'list',
 registerScreen:'list'
};
function setActive(id){document.querySelectorAll('.bottom [data-toolbar-id]').forEach(b=>b.classList.toggle('active',b.dataset.toolbarId===id))}
function sync(){const active=[...document.querySelectorAll('.screen')].find(s=>s.classList.contains('active'));if(!active)return;const id=screenToToolbar[active.id]||localStorage.getItem('oshiActiveToolbar');if(id){setActive(id);localStorage.setItem('oshiActiveToolbar',id)}}
document.addEventListener('click',e=>{const b=e.target.closest?.('.bottom [data-toolbar-id]');if(!b)return;const id=b.dataset.toolbarId;localStorage.setItem('oshiActiveToolbar',id);setActive(id);setTimeout(sync,0)},true);
new MutationObserver(sync).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
setTimeout(sync,500);
})();