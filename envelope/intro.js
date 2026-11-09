(() => {
  const c = window.envelopeConfig || {};
  const normalize = s => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  const guest = normalize(new URLSearchParams(location.search).get('guest')) || normalize(c.guestName) || 'Quý khách';
  const cover = document.createElement('button');
  cover.id = 'envelope-intro';
  cover.type = 'button';
  cover.setAttribute('aria-label', 'Mở thiệp cưới');
  const duration = Math.max(800, Number(c.duration) || 1700);
  cover.style.setProperty('--intro-duration', duration + 'ms');
  // Only this constant template is HTML; all configurable text uses textContent.
  cover.innerHTML = `<span class="intro-closed-upper" aria-hidden="true"><img class="intro-closed-image" alt=""></span><span class="intro-closed-lower" aria-hidden="true"><img class="intro-closed-image" alt=""></span><span class="intro-closed-words" aria-hidden="true"><span class="intro-greeting"></span><span class="intro-guest"></span><span class="intro-couple"></span></span><span class="intro-stamp" aria-hidden="true"><img alt=""><span class="intro-monogram"></span></span><span class="intro-hint" aria-hidden="true">CLICK TO OPEN</span>`;
  const imageMap={'.intro-closed-image':c.closed,'.intro-stamp>img':c.seal};
  Object.entries(imageMap).forEach(([selector,src])=>cover.querySelectorAll(selector).forEach(img=>{img.src=src;img.draggable=false;}));
  const textMap={'.intro-greeting':c.greeting,'.intro-guest':guest,'.intro-couple':`${c.groom||''} & ${c.bride||''}`,'.intro-monogram':c.monogram};
  Object.entries(textMap).forEach(([selector,text])=>cover.querySelectorAll(selector).forEach(el=>el.textContent=text||''));
  if(guest.length>45)cover.querySelector('.intro-guest').style.fontSize='clamp(18px,5vw,36px)';
  const fitSeam=()=>{
    const r=cover.getBoundingClientRect(),ratio=1366/964;
    const width=Math.max(r.width,r.height*ratio),height=width/ratio;
    const dx=(width-r.width)/2,dy=(height-r.height)/2;
    cover.style.setProperty('--seam-edge',((.79*height*dx/(width/2)-dy)/r.height*100)+'%');
    cover.style.setProperty('--seam-tip',((.79*height-dy)/r.height*100)+'%');
  };
  document.body.appendChild(cover);
  const blocked = [...document.body.children].filter(e => e!==cover && !['SCRIPT','STYLE','LINK'].includes(e.tagName));
  const prior = blocked.map(e => [e,e.inert]);
  blocked.forEach(e=>e.inert=true);
  fitSeam();
  window.addEventListener('resize',fitSeam,{passive:true});
  let opening=false;
  let finished=false;
  let fallback;
  const finish = () => {
    if(finished)return;
    finished=true;
    clearTimeout(fallback);
    prior.forEach(([e,inert])=>e.inert=inert);
    window.removeEventListener('resize',fitSeam);
    cover.remove();
    document.documentElement.classList.remove('intro-pending');
    window.scrollTo({top:0,behavior:'instant'});
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('scroll'));
    const heading=document.querySelector('.ladi-headline,h1,h2');
    if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
  };
  cover.addEventListener('animationend', event => {
    if(event.target===cover && event.animationName==='intro-fade')finish();
  });
  cover.addEventListener('click',()=>{
    if(opening)return;
    opening=true;
    cover.setAttribute('aria-disabled','true');
    cover.setAttribute('aria-busy','true');
    // Keep the existing local music player and its on/off button in sync.
    if(typeof startMusicOnFirstGesture==='function')startMusicOnFirstGesture();
    cover.classList.add('intro-opening');
    // Finish on the actual last frame, rather than cutting a delayed animation short.
    fallback=setTimeout(finish,matchMedia('(prefers-reduced-motion: reduce)').matches?30:duration+1800);
  });
})();
