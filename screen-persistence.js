(()=>{
const KEY='oshiStableLastScreen';
const DETAIL_KEY='oshiStableLastDetailId';
let restoring=true;
function activeId(){return document.querySelector('.screen.active')?.id||''}
function reveal(){const app=document.querySelector('.app');if(app)app.classList.add('restoreReady')}
function saveCurrent(){if(restoring)return;const id=activeId();if(!id)return;localStorage.setItem(KEY,id);if(id==='detailScreen'){const detailId=localStorage.getItem('oshiLastDetailId');if(detailId)localStorage.setItem(DETAIL_KEY,detailId)}}
function restore(){const wanted=localStorage.getItem(KEY);restoring=true;try{
  if(wanted==='homeScreen'&&typeof window.showHome==='function'){window.showHome();return}
  if(wanted==='settingsScreen'&&typeof window.showSettings==='function'){window.showSettings();return}
  if(wanted==='detailScreen'&&typeof window.openDetail==='function'){
    const id=Number(localStorage.getItem(DETAIL_KEY)||localStorage.getItem('oshiLastDetailId'));
    const list=typeof oshis!=='undefined'?oshis:(window.oshis||[]);
    if(id&&Array.isArray(list)&&list.some(o=>Number(o.id)===id)){window.openDetail(id);return}
  }
  if(wanted==='listScreen'&&typeof window.showList==='function'){window.showList();return}
  // 編集画面は未保存入力を復元できないため、安全に一覧へ戻す
  if(typeof window.showList==='function')window.showList();
}finally{requestAnimationFrame(()=>{reveal();setTimeout(()=>{restoring=false;saveCurrent()},40)})}}
const obs=new MutationObserver(()=>saveCurrent());
document.querySelectorAll('.screen').forEach(el=>obs.observe(el,{attributes:true,attributeFilter:['class']}));
window.addEventListener('pagehide',saveCurrent);window.addEventListener('beforeunload',saveCurrent);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveCurrent()});
setTimeout(restore,220);
// 万一復元処理が失敗しても真っ白のままにしない保険
setTimeout(reveal,900);
})();