/* ═══════════════════════════════════════════════════════════════════════
   gumroad-overlay.js — Checkout experience polish
   ───────────────────────────────────────────────────────────────────────
   Mobile  : removes overlay checkout so Gumroad opens as a full page
   Desktop : rose-blur backdrop + fade-scale entry on the Gumroad panel
═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

  /* ── Mobile: open Gumroad page directly instead of overlay ─────── */
  if (isMobile) {
    function stripOverlay(root) {
      root.querySelectorAll('[data-gumroad-overlay-checkout]').forEach(el => {
        el.removeAttribute('data-gumroad-overlay-checkout');
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      });
    }

    stripOverlay(document);

    /* Catch dynamically-created buy links (quicklook, quiz, builder) */
    new MutationObserver(() => stripOverlay(document))
      .observe(document.body, { childList: true, subtree: true });

    return;
  }

  /* ── Desktop: backdrop styles + keyframe ───────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes gumroad-scalein {
      from { opacity: 0; transform: scale(0.93) translateY(12px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);    }
    }
    #gr-backdrop {
      position: fixed; inset: 0; z-index: 9000;
      background: rgba(201, 75, 106, 0.14);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      opacity: 0; pointer-events: none;
      transition: opacity 0.38s ease;
    }
    #gr-backdrop.gr-open {
      opacity: 1; pointer-events: auto;
    }
  `;
  document.head.appendChild(style);

  const backdrop = document.createElement('div');
  backdrop.id = 'gr-backdrop';
  document.body.appendChild(backdrop);

  let pollTimer = null;

  function show() {
    backdrop.classList.add('gr-open');

    /* Poll every 400 ms for Gumroad's iframe — reliable regardless of
       whether Gumroad removes nodes or just toggles visibility */
    clearInterval(pollTimer);
    pollTimer = setInterval(() => {
      const hasOverlay = !!document.querySelector('iframe[src*="gumroad"]');
      if (!hasOverlay) hide();
    }, 400);
  }

  function hide() {
    backdrop.classList.remove('gr-open');
    clearInterval(pollTimer);
    pollTimer = null;
  }

  /* Clicking the backdrop itself (= clicking outside Gumroad panel) closes it */
  backdrop.addEventListener('click', hide);

  /* Show on any buy-button click */
  document.addEventListener('click', e => {
    if (e.target.closest('[data-gumroad-overlay-checkout]')) show();
  });

  /* Animate Gumroad's container when it's added to the DOM */
  new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        const key = ((node.id || '') + ' ' + (typeof node.className === 'string' ? node.className : '')).toLowerCase();
        if (key.includes('gumroad')) {
          node.style.animation = 'gumroad-scalein 0.34s cubic-bezier(0.34,1.4,0.64,1) both';
        }
      }
    }
  }).observe(document.body, { childList: true });

  /* ESC also clears our backdrop */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setTimeout(hide, 160);
  });

})();
