/* ═══════════════════════════════════════════════════════════════════════
   draggable.js — Draggable Scrapbook Pieces
   ───────────────────────────────────────────────────────────────────────
   6 small decorative stickers (fixed position) that visitors can pick up
   and move anywhere on the page. Positions persist in localStorage so
   the board remembers where you left things.

   Uses the Pointer Events API (setPointerCapture) — works for mouse and
   touch with no extra libraries.

   TO REMOVE: delete <script src="draggable.js"> in index.html and the
   "DRAGGABLE" CSS block in the <style> tag. localStorage key: 'dp-pos'.
═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Piece definitions ────────────────────────────────────────────── */
  /* xi/yi are initial positions (CSS length strings, e.g. vw/vh).
     On drag-start these are converted to px via getBoundingClientRect. */
  const PIECES = [
    {
      id:   'dp-star',
      html: `<svg class="dp-star" width="54" height="54" viewBox="0 0 52 52" aria-hidden="true">
        <polygon points="26,4 31,19 47,19 35,29 39,44 26,35 13,44 17,29 5,19 21,19"
                 fill="#F9E4A0" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
        <ellipse cx="20" cy="16" rx="7" ry="3.5" fill="rgba(255,255,255,0.32)"
                 transform="rotate(-20 20 16)"/>
      </svg>`,
      xi: '88vw', yi: '18vh', rot: 18,
    },
    {
      id:   'dp-stamp',
      html: '<div class="dp-stamp" aria-hidden="true"><div class="dp-stamp-text">CUTE</div><div class="dp-stamp-star">✦</div></div>',
      xi: '5vw',  yi: '55vh', rot: -14,
    },
  ];

  /* ── Restore saved positions from localStorage ────────────────────── */
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('dp-pos') || '{}'); } catch (_) {}

  /* ── Build and attach each piece ─────────────────────────────────── */
  PIECES.forEach(def => {
    const el = document.createElement('div');
    el.className  = 'dp-piece';
    el.id         = def.id;
    el.dataset.rot = def.rot;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML  = def.html;

    const pos = saved[def.id];
    el.style.left      = pos ? pos.left : def.xi;
    el.style.top       = pos ? pos.top  : def.yi;
    el.style.transform = `rotate(${def.rot}deg)`;

    document.body.appendChild(el);
    makeDraggable(el, def.rot);
  });

  /* ── Drag behaviour ───────────────────────────────────────────────── */
  function makeDraggable(el, baseRot) {
    let ox = 0, oy = 0;

    el.addEventListener('pointerdown', e => {
      /* Ignore secondary mouse buttons */
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();

      /* Convert current position to px so updates are stable */
      const rect = el.getBoundingClientRect();
      el.style.left = rect.left + 'px';
      el.style.top  = rect.top  + 'px';

      ox = e.clientX - rect.left;
      oy = e.clientY - rect.top;

      /* Capture so pointermove keeps firing even outside the element */
      el.setPointerCapture(e.pointerId);
      el.classList.add('dp-dragging');

      if (typeof gsap !== 'undefined') {
        gsap.killTweensOf(el);
        gsap.to(el, { scale: 1.18, duration: 0.18, ease: 'power2.out' });
      }
    });

    el.addEventListener('pointermove', e => {
      if (!el.classList.contains('dp-dragging')) return;
      el.style.left = (e.clientX - ox) + 'px';
      el.style.top  = (e.clientY - oy) + 'px';
    });

    el.addEventListener('pointerup',     release);
    el.addEventListener('pointercancel', release);

    function release() {
      if (!el.classList.contains('dp-dragging')) return;
      el.classList.remove('dp-dragging');

      /* Spring-bounce back to base rotation, scale to 1 */
      if (typeof gsap !== 'undefined') {
        gsap.to(el, {
          scale: 1, rotation: baseRot,
          duration: 0.52, ease: 'elastic.out(1, 0.45)',
        });
      }

      savePositions();
    }
  }

  /* ── Persist positions to localStorage ───────────────────────────── */
  function savePositions() {
    const data = {};
    PIECES.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) data[id] = { left: el.style.left, top: el.style.top };
    });
    try { localStorage.setItem('dp-pos', JSON.stringify(data)); } catch (_) {}
  }

})();
