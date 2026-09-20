(function(){
  const data = window.ILNU_DATA;
  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));

  // Basic text bindings
  document.title = `${data.event.title} — ${data.event.chapter}`;
  $$('[data-email]').forEach(el=>{el.href=`mailto:${data.event.email}`; if(el.tagName==='A') el.textContent=data.event.email;});
  $$('[data-instagram]').forEach(el=>el.href=data.event.instagramUrl);
  $$('[data-instagram-label]').forEach(el=>el.textContent=data.event.instagramLabel);
  $$('[data-linkedin]').forEach(el=>el.href=data.event.linkedinUrl || '#');

  // Mobile navigation
  const menuToggle=$('.menu-toggle'), nav=$('.main-nav');
  menuToggle?.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded',String(open));
  });
  $$('.main-nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuToggle?.setAttribute('aria-expanded','false')}));

  // Registration link: keep editable via site-data.js
  const registrationReady=Boolean(data.event.registrationUrl && data.event.registrationUrl.trim());
  $$('[data-registration]').forEach(el=>{
    if(registrationReady){el.href=data.event.registrationUrl;el.target='_blank';el.rel='noreferrer'}
    else {el.addEventListener('click',(e)=>{ if(el.getAttribute('href')==='#registration'){return;} e.preventDefault(); alert('Registration link is not set yet. Update event.registrationUrl in site-data.js and redeploy the site.'); });}
  });
  const regStatus=$('#registration-status');
  if(regStatus) regStatus.textContent=registrationReady?'Registration link is live.':'Registration URL is currently a placeholder in site-data.js.';

  // Committee cards and modal
  const committeeGrid=$('#committee-grid');
  data.committees.forEach(c=>{
    const card=document.createElement('button'); card.type='button'; card.className='committee-card reveal';
    card.innerHTML=`<span class="committee-code">${escapeHtml(c.short)}</span><div><h3>${escapeHtml(c.name)}</h3><p>${c.agenda ? escapeHtml(c.agenda.slice(0,112))+'…' : 'Agenda not separately listed in the brochure.'}</p></div><span class="committee-open">Open agenda</span>`;
    card.addEventListener('click',()=>openCommittee(c)); committeeGrid.appendChild(card);
  });
  const modal=$('#committee-modal');
  function openCommittee(c){
    $('#modal-short').textContent=c.short; $('#modal-title').textContent=c.name;
    $('#modal-agenda').textContent=c.agenda || 'The supplied student brochure lists International Press without a separate agenda statement.';
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  }
  $$('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
  function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';}

  // Awards
  renderAwards('#committee-awards',data.awards.perCommittee);
  renderAwards('#bureau-awards',data.awards.bureaucraticCell);
  function renderAwards(selector, rows){$(selector).innerHTML=rows.map(r=>`<div class="award-row"><span>${escapeHtml(r.label)}</span><strong>${escapeHtml(r.value)}</strong></div>`).join('');}

  // Registration
  $('#accommodation-fee').textContent=data.registration.accommodation;
  $('#travel-note').textContent=data.registration.notes[0];
  $('#fees-grid').innerHTML=data.registration.phases.map((p,i)=>`<article class="fee-card ${i===0?'current':''} reveal"><div><div class="fee-phase">${escapeHtml(p.name)}</div><div class="fee-date">${escapeHtml(p.dates)}</div></div><div class="fee-amount">${escapeHtml(p.fee)}</div></article>`).join('');

  // Sponsorship cards
  $('#sponsor-grid').innerHTML=data.sponsorship.map(s=>{
    const benefits=s.benefits.slice(0, s.featured?6:5);
    return `<article class="sponsor-card ${s.featured?'featured':''} reveal"><div><div class="tier">${escapeHtml(s.tier)}</div><h3>${escapeHtml(s.tier)}</h3><div class="price">${escapeHtml(s.price)}</div><ul class="benefit-list">${benefits.map(b=>`<li>${escapeHtml(b)}</li>`).join('')}</ul></div><div class="sponsor-action"><a class="button ${s.featured?'button-navy':'button-gold'}" href="#contact" data-sponsor="${escapeHtml(s.tier)}">Discuss this tier <span>↗</span></a></div></article>`;
  }).join('');
  $$('#sponsor-grid [data-sponsor]').forEach(a=>a.addEventListener('click',()=>{setTimeout(()=>{$('select[name="kind"]').value='Company / Sponsor'; const msg=$('textarea[name="message"]'); if(msg && !msg.value) msg.value=`I would like to discuss the ${a.dataset.sponsor} sponsorship tier for ILNU MUN Chapter VI.`},80)}));

  // Partners
  const media=data.partners.filter(p=>p.type==='Exclusive Media Partner');
  const outreach=data.partners.filter(p=>p.type==='Outreach Partner');
  $('#media-partners').innerHTML=media.map(partnerCard).join('');
  $('#outreach-partner').innerHTML=outreach.map(partnerCard).join('');
  function partnerCard(p){
    const initial=p.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2);
    const links=[`<a class="social-chip" href="${p.url}" target="_blank" rel="noreferrer">Website</a>`];
    if(p.instagram) links.push(`<a class="social-chip" href="${p.instagram}" target="_blank" rel="noreferrer">Instagram</a>`);
    if(p.linkedin) links.push(`<a class="social-chip" href="${p.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>`);
    return `<article class="partner-card reveal"><div class="partner-badge">${escapeHtml(initial)}</div><div class="partner-main"><div class="partner-type">${escapeHtml(p.type)}</div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.note)}</p><div class="partner-links">${links.join('')}</div></div></article>`;
  }

  // Gallery from brochure-extracted past-event imagery
  const galleryFiles = Array.from({length:20},(_,i)=>`assets/photos/past-${String(i+1).padStart(2,'0')}.webp`);
  $('#gallery').innerHTML=galleryFiles.map((src,i)=>`<button class="gallery-item reveal" type="button" data-img="${src}" data-caption="Past ILNUMUN glimpse ${i+1}"><img loading="lazy" src="${src}" alt="Past ILNUMUN glimpse ${i+1}"/><span class="gallery-caption">Past ILNUMUN · ${String(i+1).padStart(2,'0')}</span></button>`).join('');
  const lightbox=$('#lightbox'), lightboxImg=$('#lightbox-img'), lightboxCaption=$('#lightbox-caption');
  $$('.gallery-item').forEach(el=>el.addEventListener('click',()=>{
    lightboxImg.src=el.dataset.img; lightboxImg.alt=el.dataset.caption; lightboxCaption.textContent=el.dataset.caption; lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  }));
  $$('[data-close-lightbox]').forEach(el=>el.addEventListener('click',()=>{lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.style.overflow='';lightboxImg.src='';}));

  // Query form opens a mail draft. No data is stored on this page.
  $('#query-form').addEventListener('submit',e=>{
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    const subject=encodeURIComponent(`${f.get('kind')} query — ILNU MUN Chapter VI`);
    const body=encodeURIComponent([
      `Name: ${f.get('name')}`,
      `Email: ${f.get('email')}`,
      `Phone: ${f.get('phone')||'-'}`,
      `Type: ${f.get('kind')}`,
      `Institution / Company: ${f.get('organisation')||'-'}`,
      '',
      `${f.get('message')}`
    ].join('\n'));
    window.location.href=`mailto:${encodeURIComponent(data.event.email)}?subject=${subject}&body=${body}`;
  });

  // Small cursor light on desktop
  const glow=$('.cursor-glow');
  window.addEventListener('pointermove',e=>{if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'}});

  // Reveal on scroll
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -30px'});
  $$('.reveal').forEach(el=>io.observe(el));

  // Escape key for overlays
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.style.overflow=''}});

  function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
})();
