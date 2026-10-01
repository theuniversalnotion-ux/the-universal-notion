/* ═══════════════════════════════════════════════════════════════════════
   quicklook.js — Quick-Look Panel
   ───────────────────────────────────────────────────────────────────────
   Opens a modal with cover image(s), tag, name, description, price, and
   Gumroad buy link. Keyboard-accessible: Escape closes, Tab is trapped,
   focus returns to the trigger on close.

   Data source: window.PRODUCTS (products.js) if available, otherwise
   falls back to scraping .card elements from the DOM.

   Gallery: if a product has multiple images[], prev/next arrows and
   dot indicators appear automatically. Add extra paths to images[] in
   products.js to enable the gallery for that product.

   TO REMOVE: delete <script src="quicklook.js"> and the QUICKLOOK
   CSS block in the <style> tag.
═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const cards = [...document.querySelectorAll('#templates .card')];
  if (!cards.length) return;

  /* ── Build product data ──────────────────────────────────────────────
     Prefer the central window.PRODUCTS; fall back to DOM scraping.
  ─────────────────────────────────────────────────────────────────────── */
  const data = (window.PRODUCTS && window.PRODUCTS.length === cards.length)
    ? window.PRODUCTS.map(p => ({
        covers:   p.images,
        coverAlt: p.alt,
        tagText:  p.category,
        tagBg:    p.tagBg,
        tagColor: p.tagColor,
        name:     p.name,
        desc:     p.desc,
        price:    p.price,
        link:     p.url,
        btnColor: p.btnColor,
        fbq:      p.fbq,
      }))
    : cards.map(card => ({
        covers:   [card.querySelector('.card-photo img')?.src || ''],
        coverAlt: card.querySelector('.card-photo img')?.alt  || '',
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

  /* ── Build the shared modal ───────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.className = 'ql-overlay';
  overlay.id        = 'ql-overlay';
  overlay.setAttribute('role',         'dialog');
  overlay.setAttribute('aria-modal',   'true');
  overlay.setAttribute('aria-labelledby', 'ql-name');
  overlay.hidden    = true;
  overlay.innerHTML = `
    <div class="ql-modal" tabindex="-1">
      <button class="ql-close" type="button" aria-label="Close quick look">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="16" y1="2" x2="2"  y2="16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="ql-tape" aria-hidden="true"></div>

      <div class="ql-cover-wrap">
        <img class="ql-cover" src="" alt="" loading="eager">

        <!-- Gallery controls — shown only when product has 2+ images -->
        <div class="ql-gallery-controls" hidden aria-label="Image gallery navigation">
          <button class="ql-gallery-prev" type="button" aria-label="Previous image">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M13 4 L7 10 L13 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="ql-gallery-dots" aria-hidden="true"></div>
          <button class="ql-gallery-next" type="button" aria-label="Next image">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M7 4 L13 10 L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="ql-body">
        <div class="ql-tag"></div>
        <h2 class="ql-name" id="ql-name"></h2>
        <p class="ql-desc"></p>
        <div class="ql-footer">
          <span class="ql-price"></span>
          <a class="ql-buy" href="#" target="_blank" rel="noopener noreferrer" data-gumroad-overlay-checkout="true">
            Get Block <i class="ph-bold ph-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const modal       = overlay.querySelector('.ql-modal');
  const closeBtn    = overlay.querySelector('.ql-close');
  const coverImg    = overlay.querySelector('.ql-cover');
  const tagEl       = overlay.querySelector('.ql-tag');
  const nameEl      = overlay.querySelector('.ql-name');
  const descEl      = overlay.querySelector('.ql-desc');
  const priceEl     = overlay.querySelector('.ql-price');
  const buyEl       = overlay.querySelector('.ql-buy');
  const galleryCtrl = overlay.querySelector('.ql-gallery-controls');
  const galleryDots = overlay.querySelector('.ql-gallery-dots');
  const prevBtn     = overlay.querySelector('.ql-gallery-prev');
  const nextBtn     = overlay.querySelector('.ql-gallery-next');

  /* ── Gallery state ────────────────────────────────────────────────── */
  let currentCovers = [];
  let currentIdx    = 0;

  function showImage(idx) {
    currentIdx = ((idx % currentCovers.length) + currentCovers.length) % currentCovers.length;
    coverImg.src = currentCovers[currentIdx];
    galleryDots.querySelectorAll('.ql-dot').forEach((d, i) => {
      d.classList.toggle('ql-dot--active', i === currentIdx);
    });
  }

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

    /* Gallery setup */
    currentCovers = d.covers && d.covers.length ? d.covers : [d.cover || ''];
    currentIdx    = 0;

    /* Build gallery dots */
    galleryDots.innerHTML = '';
    currentCovers.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.className = 'ql-dot' + (idx === 0 ? ' ql-dot--active' : '');
      galleryDots.appendChild(dot);
    });

    /* Show/hide gallery controls */
    galleryCtrl.hidden = currentCovers.length < 2;

    /* Populate fields */
    coverImg.src               = currentCovers[0];
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
    document.body.style.overflow = 'hidden';

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power2.out' });
      gsap.fromTo(modal,
        { y: 36, scale: 0.93, opacity: 0 },
        { y: 0,  scale: 1,    opacity: 1, duration: 0.40, ease: 'back.out(1.5)' }
      );
    }

    modal.focus();
  }

  /* ── Close ─────────────────────────────────────────────────────────── */
  function close() {
    if (overlay.hidden) return;

    if (typeof gsap !== 'undefined') {
      gsap.to(modal,   { y: 24, scale: 0.95, opacity: 0, duration: 0.22, ease: 'power2.in' });
      gsap.to(overlay, { opacity: 0, duration: 0.26, ease: 'power2.in', onComplete: finalise });
    } else {
      finalise();
    }

    function finalise() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      lastTrigger?.focus();
    }
  }

  /* ── Gallery navigation ───────────────────────────────────────────── */
  prevBtn.addEventListener('click', () => showImage(currentIdx - 1));
  nextBtn.addEventListener('click', () => showImage(currentIdx + 1));

  /* Swipe support for gallery */
  let swipeStartX = 0;
  coverImg.addEventListener('pointerdown', e => { swipeStartX = e.clientX; });
  coverImg.addEventListener('pointerup',   e => {
    const dx = e.clientX - swipeStartX;
    if (Math.abs(dx) > 40 && currentCovers.length > 1) {
      showImage(dx < 0 ? currentIdx + 1 : currentIdx - 1);
    }
  });

  /* ── Events ───────────────────────────────────────────────────────── */
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (overlay.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft'  && currentCovers.length > 1) showImage(currentIdx - 1);
    if (e.key === 'ArrowRight' && currentCovers.length > 1) showImage(currentIdx + 1);
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
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
  });

})();
