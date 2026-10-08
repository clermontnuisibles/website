(function(){var b=document.querySelector('.burger'),m=document.getElementById('menu');
if(b&&m){b.addEventListener('click',function(){var o=m.classList.toggle('open');b.setAttribute('aria-expanded',o)})}
var f=document.querySelector('form[data-formspree]');
if(f){f.addEventListener('submit',function(e){e.preventDefault();var ok=document.getElementById('ok'),ko=document.getElementById('ko'),btn=f.querySelector('button');
if(btn){btn.disabled=true;btn.textContent='Envoi…'}
fetch(f.action,{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}}).then(function(r){
if(r.ok){f.reset();f.style.display='none';ko.style.display='none';ok.style.display='block';ok.scrollIntoView({behavior:'smooth',block:'center'})}else{throw 0}
}).catch(function(){ko.style.display='block';if(btn){btn.disabled=false;btn.textContent='Envoyer ma demande'}})})}})();
