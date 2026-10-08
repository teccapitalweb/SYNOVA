(function(){
  'use strict';
  var API='https://synova-webhook-production.up.railway.app';
  var LOCAL=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)||location.hostname.endsWith('.localhost');
  var IDLE=30*60*1000;
  var area=/vip-panel/.test(location.pathname)?'panel':/vip-auth/.test(location.pathname)?'auth':'web';
  function randomId(){return (crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12)).toLowerCase();}
  function stored(store,key){try{var v=store.getItem(key);if(!v){v=randomId();store.setItem(key,v);}return v;}catch(_){return randomId();}}
  function sessionId(){
    var key='synova:analytics:sid:'+area;
    try{var at=Number(sessionStorage.getItem(key+':at')||0);if(at&&Date.now()-at>IDLE)sessionStorage.removeItem(key);sessionStorage.setItem(key+':at',String(Date.now()));}catch(_){}
    return stored(sessionStorage,key);
  }
  function section(){
    if(area==='panel')return new URLSearchParams(location.search).get('seccion')||'inicio';
    return location.pathname.replace(/^\/+|\.html$/g,'')||'inicio';
  }
  var visibleSince=document.visibilityState==='visible'?performance.now():0;
  var pending=0,currentSection=section();
  function collect(){if(visibleSince){pending+=(performance.now()-visibleSince)/1000;visibleSince=document.visibilityState==='visible'?performance.now():0;}}
  async function send(final){
    collect();var delta=Math.round(pending);if(delta<1&&!final)return;pending=0;
    var body=JSON.stringify({sid:sessionId(),vid:stored(localStorage,'synova:analytics:vid'),area:area,section:currentSection,delta:delta});
    var url=(window.__WEBHOOK_URL||API)+'/analytics/beat';
    try{
      var token='';
      if(area==='panel'&&!final&&window.__auth&&window.__auth.currentUser)token=await window.__auth.currentUser.getIdToken();
      if(final&&!token&&navigator.sendBeacon){navigator.sendBeacon(url,new Blob([body],{type:'text/plain'}));return;}
      await fetch(url,{method:'POST',keepalive:true,headers:token?{'Content-Type':'application/json','Authorization':'Bearer '+token}:{'Content-Type':'text/plain'},body:body});
    }catch(_){}
  }
  function move(){if(area!=='panel')return;void send(false);currentSection=section();}
  if(!LOCAL){
    setTimeout(function(){void send(false);},4000);
    setInterval(function(){if(document.visibilityState==='visible')void send(false);},60000);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')void send(true);else visibleSince=performance.now();});
    window.addEventListener('pagehide',function(){void send(true);});
    window.addEventListener('popstate',move);
    window.addEventListener('synova:navigation',move);
  }
})();
