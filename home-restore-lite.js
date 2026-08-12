(()=>{
  const wanted=localStorage.getItem('oshiStableLastScreen')||localStorage.getItem('oshiLastScreen');
  if(wanted==='homeScreen'){
    setTimeout(()=>{try{window.showHome?.()}catch(e){console.error('home restore failed',e)}},220);
  }
  const save=()=>{const id=document.querySelector('.screen.active')?.id;if(id)localStorage.setItem('oshiStableLastScreen',id)};
  const mo=new MutationObserver(save);
  document.querySelectorAll('.screen').forEach(el=>mo.observe(el,{attributes:true,attributeFilter:['class']}));
  window.addEventListener('pagehide',save);
})();