/* ═══════════════════════════════════════════════════════════════════════
   quicklook.js — Quick-Look Panel
   ───────────────────────────────────────────────────────────────────────
   Adds a "Quick Look" button on each template card photo. Clicking it
   opens a modal with the card's cover, tag, name, description, price,
   and Gumroad buy link. Keyboard-accessible: Escape closes, Tab is
   trapped inside, focus returns to the trigger on close.

   TO REMOVE THIS FEATURE: delete <script src="quicklook.js"> in
   index.html and the "QUICKLOOK" CSS block in the <style> tag.
═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const cards = [...document.querySelectorAll('#templates .card')];
  if (!cards.length) return;

  /* ── Scrape data from each card ───────────────────────────────────── */
  const data = cards.map(card => ({
    cover:    card.querySelector('.card-photo img')?.src          || '',
    coverAlt: card.querySelector('.card-photo img')?.alt          || '',
    tagText:  card.querySelector('.card-tag')?.textContent.trim() || '',
    tagBg:    card.querySelector('.card-tag')?.style.background   || '',
    tagColor: card.querySelector('.card-tag')?.style.color        || '',
    name:     card.querySelector('h3')?.textContent.trim()        || '',
    desc:     card.querySelector('.card-body p')?.textContent.trim() || '',
    price:    card.querySelector('.price')?.textContent.trim()    || '$4.99',
    link:     card.querySelector('.buy-btn')?.href                || '#',
    btnColor: card.querySelector('.buy-btn')?.style.background    || 'var(--rose)',
    fbq:      card.querySelector('.buy-btn')?.getAttribute('onclick') || '',
  }));

  /* ── Build the shared modal (one, reused for all cards) ───────────── */
  const overlay = document.createElement('div');
  overlay.className  = 'ql-overlay';
  overlay.id         = 'ql-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'ql-name');
  overlay.hidden     = true;
  overlay.innerHTML  = `
    <div class="ql-modal" tabindex="-1">
      <button class="ql-close" type="button" aria-label="Close quick look">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="ql-tape" aria-hidden="true"></div>
      <div class="ql-cover-wrap">
        <img class="ql-cover" src="" alt="" loading="eager">
      </div>
      <div class="ql-body">
        <div class="ql-tag"></div>
        <h2 class="ql-name" id="ql-name"></h2>
        <p class="ql-desc"></p>
        <div class="ql-footer">
          <span class="ql-price"></span>
          <a class="ql-buy" href="#" target="_blank" rel="noopener noreferrer">
            Get Block <i class="ph-bold ph-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const modal    = overlay.querySelector('.ql-modal');
  const closeBtn = overlay.querySelector('.ql-close');
  const coverImg = overlay.querySelector('.ql-cover');
  const tagEl    = overlay.querySelector('.ql-tag');
  const nameEl   = overlay.querySelector('.ql-name');
  const descEl   = overlay.querySelector('.ql-desc');
  const priceEl  = overlay.querySelector('.ql-price');
  const buyEl    = overlay.querySelector('.ql-buy');

  /* ── Inject "Quick Look" trigger into every card photo ───────────── */
  let lastTrigger = null;

  cards.forEach((card, i) => {
    const photo = card.querySelector('.card-photo');
    if (!photo) return;

    const btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'ql-trigger';
    btn.setAttribute('aria-label', `Quick look at ${data[i].name}`);
    btn.innerHTML = `<i class="ph-bold ph-eye" aria-hidden="true"></i> Quick Look`;
    photo.appendChild(btn);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      lastTrigger = btn;
      open(i);
    });
  });

  /* ── Open ─────────────────────────────────────────────────────────── */
  function open(i) {
    const d = data[i];

    coverImg.src               = d.cover;
    coverImg.alt               = d.coverAlt;
    tagEl.textContent          = d.tagText;
    tagEl.style.background     = d.tagBg;
    tagEl.style.color          = d.tagColor;
    nameEl.textContent         = d.name;
    descEl.textContent         = d.desc;
    priceEl.textContent        = d.price;
    buyEl.href                 = d.link;
    buyEl.style.background     = d.btnColor;
    if (d.fbq) buyEl.setAttribute('onclick', d.fbq);
    else        buyEl.removeAttribute('onclick');

    overlay.hidden = false;
    document.body.style.overflow = 'hidden'; /* prevent scroll behind */

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power2.out' });
      gsap.fromTo(modal,
        { y: 36, scale: 0.93, opacity: 0 },
        { y: 0,  scale: 1,    opacity: 1, duration: 0.40, ease: 'back.out(1.5)' }
      );
    }

    /* Focus the modal panel itself first */
    modal.focus();
  }

  /* ── Close ─────────────────────────────────────────────────────────── */
  function close() {
    if (overlay.hidden) return;

    if (typeof gsap !== 'undefined') {
      gsap.to(modal,   { y: 24, scale: 0.95, opacity: 0, duration: 0.22, ease: 'power2.in' });
      gsap.to(overlay, {
        opacity: 0, duration: 0.26, ease: 'power2.in',
        onComplete: finalise,
      });
    } else {
      finalise();
    }

    function finalise() {
      overlay.hidden = false; /* keep in DOM, just toggle hidden after anim */
      overlay.hidden = true;
      document.body.style.overflow = '';
      lastTrigger?.focus();   /* return focus to the trigger that opened it */
    }
  }

  /* ── Events ───────────────────────────────────────────────────────── */

  closeBtn.addEventListener('click', close);

  /* Backdrop click */
  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });

  /* Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });

  /* Focus trap */
  overlay.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || overlay.hidden) return;

    const focusable = [...overlay.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )].filter(el => !el.disabled && el.offsetParent !== null);

    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });

})();
