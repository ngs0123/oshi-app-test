(()=>{
const baseShow=window.show;
if(typeof baseShow==='function'){
  window.show=function(screen,remember=true){
    document.getElementById('homeScreen')?.classList.remove('active');
    return baseShow.call(this,screen,remember);
  };
}
})();