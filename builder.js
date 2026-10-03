/* ═══════════════════════════════════════════════════════════════════════
   builder.js — Bundle Builder
   ───────────────────────────────────────────────────────────────────────
   Lets visitors tap templates to build a custom set and watch a live
   total update against the bundle price. All prices read from the DOM —
   never hardcoded here.

   Template data is scraped from the existing .card elements so there
   is one source of truth: update a card's HTML and the builder follows.

   TO REMOVE THIS FEATURE: delete <script src="builder.js"> in index.html
   and the "BUILDER" CSS block in the <style> tag. Nothing else changes.
═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Read real prices from the DOM ────────────────────────────────────
     These come from what is actually rendered on the page, so they stay
     in sync if prices ever change.
  ─────────────────────────────────────────────────────────────────────── */
  const BLOCK_PRICE = parseFloat(
    document.querySelector('.card .price')?.textContent.replace(/[^0-9.]/g, '')
  ) || 4.99;

  const BUNDLE_PRICE = parseFloat(
    document.querySelector('.bundle-price')?.textContent.replace(/[^0-9.]/g, '')
  ) || 14.99;

  /* ── Load template data from window.PRODUCTS (products.js) or DOM ────
     window.PRODUCTS is the canonical source; DOM scraping is the
     progressive-enhancement fallback if products.js fails to load.
  ─────────────────────────────────────────────────────────────────────── */
  const domCards = [...document.querySelectorAll('.card')];
  const templates = (window.PRODUCTS && window.PRODUCTS.length)
    ? window.PRODUCTS.map(p => ({
        id:       p.id,
        name:     p.name,
        link:     p.url,
        cover:    p.images[0] || '',
        btnColor: p.btnColor,
        category: p.category,
        fbqCall:  p.fbq || '',
      }))
    : domCards.map((card, i) => ({
        id:       i,
        name:     card.querySelector('h3')?.textContent.trim()               || `Block ${i + 1}`,
        link:     card.querySelector('.buy-btn')?.getAttribute('href')       || '#',
        cover:    card.querySelector('.card-photo img')?.getAttribute('src') || '',
        btnColor: card.querySelector('.buy-btn')?.style.background           || 'var(--rose)',
        category: card.querySelector('.card-tag')?.textContent.trim()        || '',
        fbqCall:  card.querySelector('.buy-btn')?.getAttribute('onclick')    || '',
      }));

  if (!templates.length) return; /* bail silently if no cards exist */

  /* ── State ────────────────────────────────────────────────────────── */
  const selected = new Set(); /* Set<number> — template IDs */

  /* ── Build and insert the section ────────────────────────────────── */
  const section = document.createElement('section');
  section.className = 'builder-section';
  section.setAttribute('aria-labelledby', 'builder-heading');
  section.innerHTML = `
    <div class="builder-inner">
      <div class="section-label">
        <i class="ph-fill ph-stack" aria-hidden="true"></i> Bundle Builder
      </div>
      <h2 class="section-title" id="builder-heading">Build your set.</h2>
      <p class="section-sub">
        Tap any block to add it to your board — we'll tally the total in real time.
      </p>

      <div class="builder-picker" role="group" aria-label="Choose templates to add to your board"></div>

      <div class="builder-board">
        <div class="builder-board-header">
          <span class="builder-board-label">Your board</span>
          <button class="builder-reset" type="button"
                  aria-label="Clear all selected blocks" hidden>
            Clear board
          </button>
        </div>

        <div class="builder-slots" role="list"
             aria-live="polite" aria-label="Selected blocks">
          <p class="builder-empty-state">
            ✦ Tap a block above to add it here
          </p>
        </div>

        <div class="builder-board-footer">
          <div class="builder-summary">
            <span class="builder-count" aria-live="polite">0 blocks selected</span>
            <span class="builder-total" aria-live="polite"
                  aria-label="Running total">$0.00</span>
          </div>
        </div>
      </div>

      <div class="builder-nudge" role="status" aria-live="polite" hidden>
        <span class="builder-nudge-icon" aria-hidden="true">✨</span>
        <p class="builder-nudge-text">
          <strong>Psst —</strong> you've picked
          <strong class="nudge-count">0</strong> blocks
          for <strong class="nudge-subtotal">$0</strong>.
          The full bundle — all ${templates.length} blocks — is just
          <strong>$${BUNDLE_PRICE.toFixed(2)}</strong>.
          That's <strong class="nudge-savings">$0</strong> saved.
        </p>
        <a href="#bundle" class="builder-nudge-cta">
          Get the full bundle →
        </a>
      </div>

      <div class="builder-links" hidden
           aria-label="Buy your selected blocks individually on Gumroad">
        <p class="builder-links-heading">Buy individually on Gumroad:</p>
        <div class="builder-links-list" role="list"></div>
      </div>
    </div>
  `;

  /* Place it directly before the bundles section */
  const bundlesEl = document.querySelector('.bundles');
  bundlesEl?.parentNode?.insertBefore(section, bundlesEl);

  /* ── Populate the chip picker ─────────────────────────────────────── */
  const picker = section.querySelector('.builder-picker');
  templates.forEach(t => {
    const btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'builder-chip';
    btn.dataset.id = t.id;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', `Add ${t.name} to board`);
    btn.innerHTML = `
      <span class="builder-chip-img-wrap" aria-hidden="true">
        <img src="${esc(t.cover)}" alt="" loading="lazy" class="builder-chip-img">
        <span class="builder-chip-check" aria-hidden="true">✓</span>
      </span>
      <span class="builder-chip-name">${esc(t.name)}</span>
    `;
    picker.appendChild(btn);
  });

  /* ── Cache element references ─────────────────────────────────────── */
  const slotsEl      = section.querySelector('.builder-slots');
  const emptyEl      = section.querySelector('.builder-empty-state');
  const countEl      = section.querySelector('.builder-count');
  const totalEl      = section.querySelector('.builder-total');
  const resetBtn     = section.querySelector('.builder-reset');
  const nudgeEl      = section.querySelector('.builder-nudge');
  const nudgeCountEl = section.querySelector('.nudge-count');
  const nudgeSubEl   = section.querySelector('.nudge-subtotal');
  const nudgeSaveEl  = section.querySelector('.nudge-savings');
  const nudgeCta     = section.querySelector('.builder-nudge-cta');
  const linksEl      = section.querySelector('.builder-links');
  const linksListEl  = section.querySelector('.builder-links-list');

  /* ── Event: picker chip click / keyboard ──────────────────────────── */
  picker.addEventListener('click', e => {
    const chip = e.target.closest('.builder-chip');
    if (!chip) return;
    toggleTemplate(parseInt(chip.dataset.id, 10), chip);
  });

  /* ── Event: reset ─────────────────────────────────────────────────── */
  resetBtn.addEventListener('click', resetBoard);

  /* ── Event: nudge CTA → highlight bundle card after scroll ───────── */
  nudgeCta.addEventListener('click', () => {
    requestAnimationFrame(() => {
      const bundleCard = document.querySelector('.bundle-card');
      if (bundleCard && typeof gsap !== 'undefined') {
        /* Small delay lets the scroll animation land first */
        setTimeout(() => {
          gsap.fromTo(bundleCard,
            { boxShadow: '0 0 0 0 rgba(201,75,106,0)' },
            {
              boxShadow: '0 0 0 5px #C94B6A, 0 20px 60px rgba(201,75,106,0.28)',
              duration: 0.45, ease: 'power2.out',
              yoyo: true, repeat: 3,
              onComplete() { bundleCard.style.boxShadow = ''; },
            }
          );
        }, 420);
      }
    });
  });

  /* ═══════════════════════════════════════════════════════════════════
     CORE LOGIC
  ═══════════════════════════════════════════════════════════════════ */

  function toggleTemplate(id, chip) {
    if (selected.has(id)) {
      selected.delete(id);
      chip.setAttribute('aria-pressed', 'false');
      chip.setAttribute('aria-label', `Add ${templates[id].name} to board`);
      removeSlot(id);
    } else {
      selected.add(id);
      chip.setAttribute('aria-pressed', 'true');
      chip.setAttribute('aria-label', `Remove ${templates[id].name} from board`);
      addSlot(id);
    }
    updateUI();
  }

  /* ── Add a polaroid sticker to the board ─────────────────────────── */
  function addSlot(id) {
    const t   = templates[id];
    const rot = (Math.random() * 6 - 3).toFixed(1); /* –3° to +3° */

    const slot = document.createElement('div');
    slot.className = 'builder-slot';
    slot.dataset.id = id;
    slot.setAttribute('role', 'listitem');
    slot.style.setProperty('--slot-rot', `${rot}deg`);
    slot.setAttribute('role', 'button');
    slot.setAttribute('tabindex', '0');
    slot.setAttribute('aria-label', `Remove ${esc(t.name)} from board`);
    slot.innerHTML = `
      <div class="builder-slot-tape" aria-hidden="true"></div>
      <img class="builder-slot-img" src="${esc(t.cover)}" alt="${esc(t.name)}" loading="lazy">
      <span class="builder-slot-name">${esc(t.name)}</span>
      <span class="builder-slot-x" aria-hidden="true">×</span>
    `;

    function removeThisSlot() {
      selected.delete(id);
      const chip = picker.querySelector(`[data-id="${id}"]`);
      if (chip) {
        chip.setAttribute('aria-pressed', 'false');
        chip.setAttribute('aria-label', `Add ${t.name} to board`);
      }
      removeSlot(id);
      updateUI();
    }
    slot.addEventListener('click', removeThisSlot);
    slot.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); removeThisSlot(); }
    });

    slotsEl.appendChild(slot);

    if (typeof gsap !== 'undefined') {
      gsap.from(slot, {
        scale: 0.3, opacity: 0,
        rotation: parseFloat(rot) * 2.8,
        duration: 0.44, ease: 'back.out(2.2)',
      });
    }
  }

  /* ── Remove a slot with exit animation ──────────────────────────── */
  function removeSlot(id) {
    const slot = slotsEl.querySelector(`.builder-slot[data-id="${id}"]`);
    if (!slot) return;
    if (typeof gsap !== 'undefined') {
      gsap.to(slot, {
        scale: 0, opacity: 0, duration: 0.26, ease: 'power2.in',
        onComplete: () => slot.remove(),
      });
    } else {
      slot.remove();
    }
  }

  /* ── Update the whole UI from current state ──────────────────────── */
  const totalState = { val: 0 };
  let   totalTween = null;

  function updateUI() {
    const count     = selected.size;
    const subtotal  = count * BLOCK_PRICE;
    const showNudge = subtotal > BUNDLE_PRICE;
    const savings   = subtotal - BUNDLE_PRICE;

    emptyEl.hidden  = count > 0;
    countEl.textContent = `${count} block${count !== 1 ? 's' : ''} selected`;
    resetBtn.hidden = count === 0;

    /* Animate the running total */
    if (totalTween) totalTween.kill();
    if (typeof gsap !== 'undefined') {
      totalTween = gsap.to(totalState, {
        val: subtotal, duration: 0.38, ease: 'power2.out',
        onUpdate() { totalEl.textContent = `$${totalState.val.toFixed(2)}`; },
      });
    } else {
      totalEl.textContent = `$${subtotal.toFixed(2)}`;
    }

    /* Bundle nudge */
    const nudgeWasHidden = nudgeEl.hidden;
    nudgeEl.hidden = !showNudge;
    if (showNudge) {
      nudgeCountEl.textContent = count;
      nudgeSubEl.textContent   = `$${subtotal.toFixed(2)}`;
      nudgeSaveEl.textContent  = `$${savings.toFixed(2)}`;
      if (nudgeWasHidden && typeof gsap !== 'undefined') {
        gsap.from(nudgeEl, { y: 18, opacity: 0, duration: 0.4, ease: 'back.out(1.4)' });
      }
    }

    /* Individual Gumroad buy links */
    if (count > 0) {
      linksEl.hidden   = false;
      linksListEl.innerHTML = [...selected].map(id => {
        const t = templates[id];
        /* Preserve the fbq tracking call from the original button */
        const onclickAttr = t.fbqCall ? ` onclick="${esc(t.fbqCall)}"` : '';
        return `<a href="${esc(t.link)}"${onclickAttr}
                   target="_blank" rel="noopener noreferrer"
                   data-gumroad-overlay-checkout="true"
                   class="builder-link-btn" role="listitem"
                   style="background: ${esc(t.btnColor)}"
                   aria-label="Buy ${esc(t.name)} on Gumroad — $${BLOCK_PRICE.toFixed(2)}">
          ${esc(t.name)} <span aria-hidden="true">—</span> $${BLOCK_PRICE.toFixed(2)}
        </a>`;
      }).join('');
    } else {
      linksEl.hidden = true;
    }
  }

  /* ── Reset the board ──────────────────────────────────────────────── */
  function resetBoard() {
    selected.clear();

    picker.querySelectorAll('.builder-chip').forEach(chip => {
      const id = parseInt(chip.dataset.id, 10);
      chip.setAttribute('aria-pressed', 'false');
      chip.setAttribute('aria-label', `Add ${templates[id]?.name ?? ''} to board`);
    });

    const slots = [...slotsEl.querySelectorAll('.builder-slot')];
    if (typeof gsap !== 'undefined' && slots.length) {
      gsap.to(slots, {
        scale: 0, opacity: 0, stagger: 0.04,
        duration: 0.24, ease: 'power2.in',
        onComplete: () => slots.forEach(s => s.remove()),
      });
    } else {
      slots.forEach(s => s.remove());
    }

    updateUI();
  }

  /* ── HTML-escape helper ───────────────────────────────────────────── */
  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
