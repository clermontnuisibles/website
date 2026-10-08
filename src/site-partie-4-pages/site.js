(function(){var b=document.querySelector('.burger'),m=document.getElementById('menu');
if(b&&m){b.addEventListener('click',function(){var o=m.classList.toggle('open');b.setAttribute('aria-expanded',o)})}
var hm=document.querySelector('.has-mega>a');
if(hm){hm.addEventListener('click',function(e){if(window.matchMedia('(max-width:980px)').matches){e.preventDefault();hm.parentNode.classList.toggle('sub-open')}})}
var fb=document.querySelectorAll('.filters button'),cs=document.querySelectorAll('#cards .card');
fb.forEach(function(x){x.addEventListener('click',function(){fb.forEach(function(y){y.classList.remove('on')});x.classList.add('on');var f=x.getAttribute('data-f');
cs.forEach(function(c){c.style.display=(f==='all'||c.getAttribute('data-g')===f)?'':'none'})})});
var f=document.querySelector('form[data-formspree]');
if(f){f.addEventListener('submit',function(e){e.preventDefault();var ok=document.getElementById('ok'),ko=document.getElementById('ko'),btn=f.querySelector('button');
if(btn){btn.disabled=true;btn.textContent='Envoi…'}
fetch(f.action,{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}}).then(function(r){
if(r.ok){f.reset();f.style.display='none';ko.style.display='none';ok.style.display='block';ok.scrollIntoView({behavior:'smooth',block:'center'})}else{throw 0}
}).catch(function(){ko.style.display='block';if(btn){btn.disabled=false;btn.textContent='Envoyer'}})})}})();
