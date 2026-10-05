// Steady Apple/Safari persistence patch
// Keeps first-time setup progress and answers from appearing to reset on iPhone/iPad.
(function(){
  const STEP_KEY='steady_v07_setup_step';

  function loadStep(){
    try{return Math.max(0,Math.min(5,Number(localStorage.getItem(STEP_KEY)||0)||0))}
    catch(e){return 0}
  }
  function saveStep(n){
    try{localStorage.setItem(STEP_KEY,String(n));return true}
    catch(e){return false}
  }
  function storageAvailable(){
    try{
      const k='steady_storage_test';
      localStorage.setItem(k,'1');
      localStorage.removeItem(k);
      return true;
    }catch(e){return false}
  }
  function isAppleMobile(){
    const ua=navigator.userAgent||'';
    return /iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
  }
  function addAppleStorageHelp(){
    if(!isAppleMobile()||setupStep!==0)return;
    const card=view.querySelector('.card');
    const intro=card&&card.querySelector('p.muted');
    if(!intro||document.getElementById('iosStorageHelp'))return;
    const ok=storageAvailable();
    const box=document.createElement('div');
    box.id='iosStorageHelp';
    box.className='notice '+(ok?'':'danger')+' small';
    box.innerHTML=ok
      ?'<b>iPhone/iPad:</b> For reliable saving, open Steady in Safari, tap Share → Add to Home Screen, then open the Steady icon and complete setup there. Do not do setup inside the Messages, Gmail, Facebook, or another app’s built-in browser.'
      :'<b>Steady cannot save in this browser right now.</b> Turn off Private Browsing, open Steady in Safari, tap Share → Add to Home Screen, then open the Steady icon and complete setup there.';
    intro.insertAdjacentElement('afterend',box);
  }

  function saveCurrentSetup(){
    if(profile.setupComplete)return;
    try{saveSetupFields()}catch(e){}
    saveStep(setupStep);
  }

  const originalRenderSetup=renderSetup;
  renderSetup=function(){
    originalRenderSetup();
    addAppleStorageHelp();
  };

  const originalSetupNext=setupNext;
  setupNext=function(){
    originalSetupNext();
    if(profile.setupComplete){
      try{localStorage.removeItem(STEP_KEY)}catch(e){}
      try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
    }else{
      saveStep(setupStep);
    }
  };

  const originalSetupBack=setupBack;
  setupBack=function(){
    originalSetupBack();
    saveStep(setupStep);
  };

  const originalRestartSetup=restartSetup;
  restartSetup=function(){
    originalRestartSetup();
    saveStep(0);
  };

  let inputTimer=null;
  document.addEventListener('input',function(){
    if(profile.setupComplete)return;
    clearTimeout(inputTimer);
    inputTimer=setTimeout(saveCurrentSetup,350);
  });
  window.addEventListener('pagehide',saveCurrentSetup);
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='hidden')saveCurrentSetup();
  });

  if(!profile.setupComplete){
    const saved=loadStep();
    if(saved!==setupStep)setupStep=saved;
    renderSetup();
  }
})();
