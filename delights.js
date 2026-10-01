/* ═══════════════════════════════════════════════════════════════════════
   delights.js — Small Delights
   ───────────────────────────────────────────────────────────────────────
   Three easter-egg / delight features:

   1. CONFETTI — clicking the nav logo bursts sparkle particles
   2. PAPER SWITCHER — floating palette button swaps the page tint
      (overrides --bg CSS var; 4 options; persists to localStorage)
   3. KONAMI CODE — ↑↑↓↓←→←→BA triggers a celebration moment

   TO REMOVE: delete <script src="delights.js"> and the "DELIGHTS"
   CSS block in the <style> tag. localStorage key: 'paper-color'.
═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════════════
     1. CONFETTI BURST — logo click
  ════════════════════════════════════════════════════════════════════ */

  const CONFETTI_CHARS  = ['★', '✦', '♥', '•', '◆'];
  const CONFETTI_COLORS = ['#C94B6A', '#F5C842', '#9B7FD4', '#8AAF8A', '#E8A0A8', '#C09040'];
  const CONFETTI_COUNT  = 26;

  function burst(originX, originY, count) {
    for (let i = 0; i < count; i++) {
      const el    = document.createElement('span');
      el.className = 'dl-confetti';
      el.textContent = CONFETTI_CHARS[i % CONFETTI_CHARS.length];
      el.style.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      el.style.left  = originX + 'px';
      el.style.top   = originY + 'px';
      document.body.appendChild(el);

      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const dist  = 70 + Math.random() * 120;
      const tx    = Math.cos(angle) * dist;
      const ty    = Math.sin(angle) * dist - 20; /* slight upward bias */

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(el,
          { x: 0, y: 0, scale: 0, opacity: 1, rotation: 0 },
          {
            x: tx, y: ty,
            scale: 0.55 + Math.random() * 0.9,
            opacity: 0,
            rotation: (Math.random() - 0.5) * 540,
            duration: 0.7 + Math.random() * 0.5,
            ease: 'power2.out',
            delay: Math.random() * 0.08,
            onComplete: () => el.remove(),
          }
        );
      } else {
        setTimeout(() => el.remove(), 1000);
      }
    }
  }

  const logoEl = document.querySelector('a.logo');
  if (logoEl) {
    logoEl.addEventListener('click', e => {
      const r = logoEl.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      burst(cx, cy, CONFETTI_COUNT);
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     2. PAPER COLOR SWITCHER
  ════════════════════════════════════════════════════════════════════ */

  const PAPERS = [
    { id: 'cream', bg: '#FAF5EF', label: 'Warm Cream (default)' },
    { id: 'blush', bg: '#FFF0F3', label: 'Blush Pink'           },
    { id: 'sage',  bg: '#F0F5F0', label: 'Sage'                 },
    { id: 'lav',   bg: '#F3F0FA', label: 'Lavender'             },
  ];

  /* Apply a paper color by overriding --bg at the root */
  function applyPaper(id) {
    const paper = PAPERS.find(p => p.id === id) || PAPERS[0];
    document.documentElement.style.setProperty('--bg', paper.bg);
    try { localStorage.setItem('paper-color', id); } catch (_) {}

    switcher.querySelectorAll('.dl-swatch').forEach(s => {
      s.classList.toggle('dl-swatch--active', s.dataset.paper === id);
      s.setAttribute('aria-pressed', s.dataset.paper === id ? 'true' : 'false');
    });
  }

  /* Build the switcher widget */
  const switcher = document.createElement('div');
  switcher.id        = 'dl-paper-switcher';
  switcher.className = 'dl-paper-switcher';
  switcher.setAttribute('aria-label', 'Change paper colour');
  switcher.innerHTML = `
    <div class="dl-swatches" role="group" aria-label="Paper colour options" hidden>
      ${PAPERS.map(p => `
        <button class="dl-swatch" type="button"
                data-paper="${p.id}"
                aria-label="${p.label}"
                aria-pressed="false"
                style="background:${p.bg}"></button>
      `).join('')}
    </div>
    <button class="dl-paper-toggle" type="button" aria-label="Open paper colour switcher"
            aria-expanded="false">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="5"  cy="5"  r="3" fill="currentColor" opacity="0.7"/>
        <circle cx="13" cy="5"  r="3" fill="currentColor" opacity="0.5"/>
        <circle cx="5"  cy="13" r="3" fill="currentColor" opacity="0.5"/>
        <circle cx="13" cy="13" r="3" fill="currentColor" opacity="0.35"/>
      </svg>
    </button>
  `;
  document.body.appendChild(switcher);

  const toggleBtn = switcher.querySelector('.dl-paper-toggle');
  const swatchBox = switcher.querySelector('.dl-swatches');

  toggleBtn.addEventListener('click', () => {
    const open = swatchBox.hidden;
    swatchBox.hidden = !open;
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');

    if (open && typeof gsap !== 'undefined') {
      gsap.fromTo(swatchBox,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
      );
    }
  });

  swatchBox.addEventListener('click', e => {
    const swatch = e.target.closest('.dl-swatch');
    if (!swatch) return;
    applyPaper(swatch.dataset.paper);

    /* Pop animation */
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(swatch, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    }

    /* Close panel after selecting */
    swatchBox.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (!switcher.contains(e.target)) {
      swatchBox.hidden = true;
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* Restore saved colour */
  try {
    const saved = localStorage.getItem('paper-color');
    if (saved) applyPaper(saved);
    else        applyPaper('cream');
  } catch (_) { applyPaper('cream'); }

  /* ════════════════════════════════════════════════════════════════════
     3. KONAMI CODE  ↑↑↓↓←→←→BA
  ════════════════════════════════════════════════════════════════════ */

  const KONAMI_SEQ = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'b','a',
  ];
  let konamiIdx = 0;

  document.addEventListener('keydown', e => {
    if (e.key === KONAMI_SEQ[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI_SEQ.length) {
        konamiIdx = 0;
        activateKonami();
      }
    } else {
      konamiIdx = (e.key === KONAMI_SEQ[0]) ? 1 : 0;
    }
  });

  function activateKonami() {
    /* Toast message */
    showToast('🎮 cheat code unlocked — you found the secret ✦');

    /* Confetti from centre of viewport */
    burst(window.innerWidth / 2, window.innerHeight / 2, 40);

    /* Spin all draggable stickers */
    if (typeof gsap !== 'undefined') {
      gsap.to('.dp-piece', {
        rotation: '+=720',
        duration: 1.0,
        ease: 'power2.inOut',
        stagger: 0.08,
      });
    }
  }

  /* ── Toast helper (also used by Konami) ───────────────────────────── */
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className   = 'dl-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(toast,
        { opacity: 0, y: 16 },
        {
          opacity: 1, y: 0, duration: 0.32, ease: 'back.out(1.6)',
          onComplete() {
            gsap.to(toast, {
              opacity: 0, y: -10, delay: 2.6, duration: 0.3, ease: 'power2.in',
              onComplete: () => toast.remove(),
            });
          },
        }
      );
    } else {
      setTimeout(() => toast.remove(), 3200);
    }
  }

})();
