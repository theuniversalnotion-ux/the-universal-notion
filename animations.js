/* ════════════════════════════════════════════════════════════════════════
   THE UNIVERSAL NOTION — animations.js
   Motion system: GSAP 3.12.5 + ScrollTrigger + CustomEase

   ┌─────────────────────────────────────────────────────────────────────┐
   │  INTENSITY  ·  dial the whole site up or down                       │
   │  0   = no motion  (matches prefers-reduced-motion behaviour)        │
   │  0.5 = gentle / subtle                                              │
   │  1.0 = full scrapbook energy  ← default                            │
   └─────────────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════════════ */

const INTENSITY = 1.0;

/* ── Named duration constants (seconds) ─────────────────────────────── */
const DUR = {
  intro:  0.52,  /* per intro element                  */
  word:   0.08,  /* stagger gap between headline words  */
  card:   0.72,  /* card settle on scroll               */
  hover:  0.32,  /* hover response time                 */
  bundle: 0.70,  /* bundle element entrances            */
  cursor: 0.13,  /* cursor lag / smoothing              */
  price:  1.10,  /* price count-up duration             */
};

/* ── Named easing presets ────────────────────────────────────────────── */
const EASE = {
  settle: 'back.out(1.4)',
  bounce: 'back.out(2.5)',
  spring: 'elastic.out(1, 0.4)',
  smooth: 'power3.out',
  snap:   'power4.out',
};

/* ── Environment flags ───────────────────────────────────────────────── */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile       = window.innerWidth < 768;
const isTouch        = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

/* ── Guard: skip all motion if disabled or INTENSITY = 0 ────────────── */
if (prefersReduced || INTENSITY === 0) {
  /* Ensure all intro-animated elements are visible */
  document.querySelectorAll(
    '.badge, .h1-word, .hero p, .hero-btns a, .hero-tape, .hero-doodle, .hero-arrow-wrap'
  ).forEach(el => {
    el.style.opacity  = '';
    el.style.transform = '';
  });
} else {
  initAnimations();
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN INIT — everything is gated behind this function
═══════════════════════════════════════════════════════════════════════ */
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  /* Signal to CSS that JS animation is active (enables .js-anim rules) */
  document.body.classList.add('js-anim');

  const I = INTENSITY; /* shorthand for scaling motion amounts */

  /* ──────────────────────────────────────────────────────────────────
     1. SCROLL PROGRESS — tape-strip bar pinned to top of viewport
  ────────────────────────────────────────────────────────────────── */
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: self => gsap.set('#scroll-progress', { scaleX: self.progress }),
  });

  /* ──────────────────────────────────────────────────────────────────
     2. ACCENT DOT — small pink dot trails system cursor; desktop only
  ────────────────────────────────────────────────────────────────── */
  const cursorDot = document.getElementById('cursor-dot');
  if (cursorDot && !isTouch) {
    const xTo = gsap.quickTo(cursorDot, 'x', { duration: 0.12, ease: EASE.smooth });
    const yTo = gsap.quickTo(cursorDot, 'y', { duration: 0.12, ease: EASE.smooth });
    document.addEventListener('mousemove', e => {
      xTo(e.clientX); yTo(e.clientY);
      gsap.to(cursorDot, { opacity: 0.55, duration: 0.2, overwrite: 'auto' });
    });
    document.addEventListener('mouseleave', () =>
      gsap.to(cursorDot, { opacity: 0, duration: 0.3 })
    );
  }

  /* ──────────────────────────────────────────────────────────────────
     3. PAGE LOAD INTRO SEQUENCE — scrapbook pieces land in < 2 s
        badge → line-1 words → line-2 italic → squiggle draws
        → paragraph → buttons → tape strips → star doodles → arrow
  ────────────────────────────────────────────────────────────────── */
  const badge     = document.querySelector('.badge');
  const h1words   = document.querySelectorAll('.h1-word:not(.h1-italic)');
  const h1italic  = document.querySelectorAll('.h1-word.h1-italic');
  const squigPath = document.querySelector('.hero-squiggle path');
  const heroPara  = document.querySelector('.hero p');
  const heroBtns  = document.querySelectorAll('.hero-btns a');
  const tapes     = document.querySelectorAll('.hero-tape');
  const doodles   = document.querySelectorAll('.hero-doodle');
  const heroArrow = document.querySelector('.hero-arrow-wrap');

  /* Squiggle stroke-dashoffset trick: measure path length */
  if (squigPath) {
    const len = squigPath.getTotalLength?.() || 280;
    gsap.set(squigPath, { strokeDasharray: len, strokeDashoffset: len });
  }

  /* Set initial hidden states synchronously (before first paint flush) */
  if (badge)    gsap.set(badge,    { opacity: 0, y: -22 * I, rotation: -10 * I, scale: 0.8 });
  if (h1words.length)  gsap.set(h1words,  { opacity: 0, y: 32 * I, rotation: i => [3, -2, 4][i] * I });
  if (h1italic.length) gsap.set(h1italic, { opacity: 0, y: 20 * I, scale: 0.88 });
  if (heroPara) gsap.set(heroPara, { opacity: 0, y: 18 * I });
  if (heroBtns.length) gsap.set(heroBtns, { opacity: 0, y: 22 * I, scale: 0.92 });
  if (tapes.length) gsap.set(tapes, { opacity: 0, scaleX: 0, rotation: i => [-4, 3.5][i] });
  if (doodles.length) gsap.set(doodles, { opacity: 0, scale: 0, rotation: i => [12, -8][i] });
  if (heroArrow) gsap.set(heroArrow, { opacity: 0, y: -14 * I });

  /* Use absolute timeline positions so every element is visible by ~1.3s.
     Groups run in parallel — decorative elements overlap with content.
     t=0  badge | t=0.12 words | t=0.3 italic | t=0.5 tape+doodles
     t=0.55 squiggle | t=0.65 para | t=0.75 buttons | t=0.9 arrow     */
  const introTL = gsap.timeline({ delay: 0.06 });

  if (badge) {
    introTL.to(badge, {
      opacity: 1, y: 0, rotation: -1.5, scale: 1,
      duration: 0.45, ease: EASE.bounce,
    }, 0);
  }
  if (h1words.length) {
    introTL.to(h1words, {
      opacity: 1, y: 0, rotation: 0,
      duration: 0.42, ease: EASE.settle, stagger: 0.1,
    }, 0.12);
  }
  if (h1italic.length) {
    introTL.to(h1italic, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.4, ease: 'back.out(1.9)', stagger: 0.09,
    }, 0.30);
  }
  if (tapes.length) {
    introTL.to(tapes, {
      opacity: 1, scaleX: 1, rotation: i => [-4, 3.5][i],
      duration: 0.34, ease: EASE.snap, stagger: 0.08,
    }, 0.50);
  }
  if (doodles.length) {
    introTL.to(doodles, {
      opacity: i => [0.35, 0.45][i], scale: 1, rotation: i => [12, -8][i],
      duration: 0.42, ease: EASE.spring, stagger: 0.1,
    }, 0.58);
  }
  if (squigPath) {
    introTL.to(squigPath, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, 0.52);
  }
  if (heroPara) {
    introTL.to(heroPara, { opacity: 1, y: 0, duration: 0.36, ease: EASE.smooth }, 0.65);
  }
  if (heroBtns.length) {
    introTL.to(heroBtns, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.36, ease: EASE.bounce, stagger: 0.08,
    }, 0.75);
  }
  if (heroArrow) {
    introTL.to(heroArrow, { opacity: 1, y: 0, duration: 0.42, ease: EASE.settle }, 0.9);
  }

  /* After intro: persistent bobs */
  introTL.call(() => {
    if (badge && !isMobile) {
      gsap.to(badge, { y: -6 * I, duration: 2.2, ease: 'sine.inOut', repeat: -1, yoyo: true });
    }
    if (heroArrow && !isMobile) {
      gsap.to(heroArrow, { y: 7 * I, duration: 1.7, ease: 'sine.inOut', repeat: -1, yoyo: true });
    }
  }, null, 1.35);

  /* ──────────────────────────────────────────────────────────────────
     4. HERO MOUSE PARALLAX — layers shift at different speeds
        RAF-throttled so it never blocks 60 fps
  ────────────────────────────────────────────────────────────────── */
  const heroWrap   = document.querySelector('.hero-wrap');
  const squiggleSv = document.querySelector('.hero-squiggle');

  if (heroWrap && !isMobile && !isTouch) {
    let raf = null;

    heroWrap.addEventListener('mousemove', e => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const { left, top, width, height } = heroWrap.getBoundingClientRect();
        const cx = (e.clientX - left) / width  - 0.5; /* −0.5 → 0.5 */
        const cy = (e.clientY - top)  / height - 0.5;

        if (tapes.length)   gsap.to(tapes,    { x: cx * 18 * I,  y: cy * 8 * I,   duration: 0.9, ease: 'power1.out' });
        if (doodles.length) gsap.to(doodles,  { x: cx * -24 * I, y: cy * -14 * I, duration: 1.1, ease: 'power1.out' });
        if (squiggleSv)     gsap.to(squiggleSv, { x: cx * 11 * I, duration: 0.7, ease: 'power1.out' });
        if (heroArrow)      gsap.to(heroArrow,  { x: cx * 8 * I,  duration: 0.85, ease: 'power1.out' });
      });
    });

    heroWrap.addEventListener('mouseleave', () => {
      if (tapes.length)   gsap.to(tapes,    { x: 0, y: 0, duration: 1.2, ease: 'power2.inOut' });
      if (doodles.length) gsap.to(doodles,  { x: 0, y: 0, duration: 1.2, ease: 'power2.inOut' });
      if (squiggleSv)     gsap.to(squiggleSv, { x: 0, duration: 0.9, ease: 'power2.inOut' });
      if (heroArrow)      gsap.to(heroArrow,  { x: 0, duration: 0.9, ease: 'power2.inOut' });
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     5. MARQUEE — GSAP ticker replaces CSS animation
        Velocity-reactive: speeds up + reverses with scroll direction
  ────────────────────────────────────────────────────────────────── */
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    const LOOP_W      = 1360;      /* px for one seamless loop */
    const NORM_SPEED  = 44 * I;   /* px / second at rest */
    let   marqueeX    = 0;
    let   curSpeed    = NORM_SPEED;
    let   targetSpeed = NORM_SPEED;
    let   direction   = 1;         /* 1 = left, −1 = right */
    let   speedTimer  = null;

    marqueeTrack.style.animation = 'none'; /* hand off from CSS */

    /* Per-frame driver */
    gsap.ticker.add((_, delta) => {
      curSpeed += (targetSpeed - curSpeed) * 0.07; /* lerp */
      marqueeX -= (curSpeed * direction * delta) / 1000;
      if (marqueeX <= -LOOP_W) marqueeX += LOOP_W;
      if (marqueeX >   0)      marqueeX -= LOOP_W;
      gsap.set(marqueeTrack, { x: marqueeX });
    });

    /* Scroll velocity reaction */
    ScrollTrigger.create({
      onUpdate(self) {
        const vel = self.getVelocity();
        if (Math.abs(vel) > 80) {
          targetSpeed = Math.min(260 * I, NORM_SPEED + Math.abs(vel) * 0.07);
          direction   = vel > 0 ? 1 : -1;
          clearTimeout(speedTimer);
          speedTimer  = setTimeout(() => {
            gsap.to({ v: targetSpeed }, {
              v: NORM_SPEED, duration: 1.4, ease: 'power2.out',
              onUpdate() { targetSpeed = this.targets()[0].v; },
              onComplete() { direction = 1; },
            });
          }, 380);
        }
      },
    });

    /* Hover: slow to a stop */
    const marqueeWrap = marqueeTrack.closest('.marquee-wrap');
    if (marqueeWrap) {
      marqueeWrap.addEventListener('mouseenter', () => { targetSpeed = 0; });
      marqueeWrap.addEventListener('mouseleave', () => { targetSpeed = NORM_SPEED; });
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     6. TEMPLATE CARDS — "tossed onto the board" stagger entry
  ────────────────────────────────────────────────────────────────── */
  const allCards = [...document.querySelectorAll('.card')];

  allCards.forEach((card, idx) => {
    const tilt = parseFloat(getComputedStyle(card).getPropertyValue('--tilt')) || 0;

    if (isMobile) {
      gsap.set(card, { opacity: 1, y: 0, x: 0, rotation: 0 });
      return;
    }

    /* Cards enter from varied directions based on column */
    const col   = idx % 3;
    const fromX = (col === 0 ? -1 : col === 2 ? 1 : 0) * 28 * I;
    const fromY = (52 + (idx % 5) * 8) * I;

    gsap.set(card, { opacity: 0, y: fromY, x: fromX, rotation: tilt * 2.4 });

    ScrollTrigger.create({
      trigger: card,
      start: 'top 87%',
      onEnter: () => {
        gsap.to(card, {
          opacity: 1, y: 0, x: 0, rotation: tilt,
          duration: DUR.card,
          ease: EASE.settle,
          delay: col * 0.09 * I,
          onComplete() {
            card.querySelector('.card-sticker')?.classList.add('wobbling');
          },
        });
      },
    });
  });

  /* ── Card hover: straighten, lift, zoom cover image ── */
  if (!isTouch) {
    allCards.forEach(card => {
      const tilt = parseFloat(getComputedStyle(card).getPropertyValue('--tilt')) || 0;
      const img  = card.querySelector('.card-photo img');

      card.addEventListener('mouseenter', () => {
        gsap.to(card, { rotation: 0, y: -10 * I, duration: DUR.hover, ease: 'power2.out', overwrite: 'auto' });
        if (img) gsap.to(img, { scale: 1.05, duration: 0.4, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotation: tilt, y: 0, duration: 0.55, ease: EASE.settle, overwrite: 'auto' });
        if (img) gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' });
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     7. MAGNETIC BUTTONS — "Get Block" + "Get the Bundle"
        max shift capped at 8px × INTENSITY; springs back on leave
  ────────────────────────────────────────────────────────────────── */
  if (!isTouch) {
    document.querySelectorAll('.buy-btn, .bundle-btn').forEach(btn => {
      const MAX = 8 * I;

      btn.addEventListener('mousemove', e => {
        const r  = btn.getBoundingClientRect();
        const dx = gsap.utils.clamp(-MAX, MAX, (e.clientX - r.left  - r.width  / 2) * 0.38);
        const dy = gsap.utils.clamp(-MAX, MAX, (e.clientY - r.top   - r.height / 2) * 0.38);
        gsap.to(btn, { x: dx, y: dy, duration: 0.28, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () =>
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: EASE.spring })
      );
      /* Satisfying press state */
      btn.addEventListener('mousedown', () =>
        gsap.to(btn, { scale: 0.91, duration: 0.08, overwrite: 'auto' })
      );
      btn.addEventListener('mouseup', () =>
        gsap.to(btn, { scale: 1, duration: 0.5, ease: EASE.spring, overwrite: 'auto' })
      );
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     8. BUNDLE SECTION — the big reveal moment
        · mini covers fly in from four corners
        · card rises
        · polaroid swoops in with overshoot
        · SVG strikethrough draws across $49.90
        · $14.99 counts up from zero
        · Save 70% sticker spins and lands with a big bounce
        · subtle glow pulse on CTA after everything settles
  ────────────────────────────────────────────────────────────────── */
  const bundleSection  = document.querySelector('.bundles');
  const bundleCard     = document.querySelector('.bundle-card');
  const bundlePolaroid = document.querySelector('.bundle-polaroid');
  const bundleSave     = document.querySelector('.bundle-save');
  const strikeLine     = document.querySelector('.strikethrough-line');
  const bundlePriceEl  = document.querySelector('.bundle-price');
  const miniCovers     = [...document.querySelectorAll('.bundle-preview-mini')];

  if (bundleCard && bundleSection) {
    /* Initial hidden states */
    gsap.set(bundleCard,     { opacity: 0, y: 64 * I, rotation: -0.4 });
    gsap.set(bundlePolaroid, { opacity: 0, x: 56 * I, rotation: 8 });
    gsap.set(bundleSave,     { opacity: 0, scale: 0.25, y: -22 * I, rotation: 35 });

    /* Mini cover start positions — scattered off-screen in four corners */
    const corners    = [
      { x: -340 * I, y: -160 * I }, { x: 340 * I, y: -180 * I },
      { x: -320 * I, y:  180 * I }, { x: 320 * I,  y:  160 * I },
    ];
    const finalRots = [-12, 9, 14, -10];
    miniCovers.forEach((img, i) => {
      const c = corners[i] || { x: 0, y: -200 * I };
      gsap.set(img, { opacity: 0, x: c.x, y: c.y, rotation: c.x < 0 ? -40 : 40 });
    });

    /* Strikethrough: stroke-dashoffset trick */
    if (strikeLine) {
      gsap.set(strikeLine, { strokeDasharray: 64, strokeDashoffset: 64 });
    }

    const priceCounter = { val: 0 };

    const bundleTL = gsap.timeline({
      scrollTrigger: { trigger: bundleSection, start: 'top 62%' },
    });

    /* Mini covers fly in first */
    if (miniCovers.length) {
      bundleTL.to(miniCovers, {
        opacity: 1, x: 0, y: 0,
        rotation: i => finalRots[i] ?? 0,
        duration: 0.75, ease: EASE.settle, stagger: 0.08,
      });
    }

    /* Card rises */
    bundleTL.to(bundleCard, {
      opacity: 1, y: 0, rotation: -0.4,
      duration: DUR.bundle, ease: 'power3.out',
    }, miniCovers.length ? '-=0.4' : 0);

    /* Polaroid swoops in with overshoot */
    bundleTL.to(bundlePolaroid, {
      opacity: 1, x: 0, rotation: 2.8,
      duration: 0.9, ease: EASE.settle,
    }, '-=0.45');

    /* Strikethrough draws across the old price */
    if (strikeLine) {
      bundleTL.to(strikeLine, {
        strokeDashoffset: 0, duration: 0.52, ease: 'power2.inOut',
      }, '-=0.2');
    }

    /* New price counts up */
    if (bundlePriceEl) {
      bundleTL.to(priceCounter, {
        val: 14.99, duration: DUR.price, ease: 'power2.out',
        onUpdate() {
          bundlePriceEl.textContent = '$' + priceCounter.val.toFixed(2);
        },
      }, '-=0.45');
    }

    /* Save 70% sticker spins and lands */
    bundleTL.to(bundleSave, {
      opacity: 1, scale: 1, y: 0, rotation: 13,
      duration: 0.74, ease: 'back.out(3)',
    }, '-=0.88');

    /* Subtle glow pulse on CTA after everything lands */
    const bundleBtn = document.querySelector('.bundle-btn');
    if (bundleBtn) {
      bundleTL.call(() => {
        gsap.to(bundleBtn, {
          boxShadow: '0 0 0 8px rgba(201,75,106,0.2), 0 4px 16px rgba(201,75,106,0.35)',
          duration: 0.9, ease: 'sine.inOut', repeat: 3, yoyo: true,
          onComplete: () => { bundleBtn.style.boxShadow = ''; },
        });
      }, null, '+=0.15');
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     9. "HOW IT WORKS" FEATURE CARDS — tilt in with personality
  ────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.feature').forEach((el, i) => {
    const dir = i === 0 ? -1 : i === 2 ? 1 : 0;
    gsap.set(el, { opacity: 0, y: 36 * I, rotation: dir * 4 * I, scale: 0.95 });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 86%',
      onEnter: () => gsap.to(el, {
        opacity: 1, y: 0, rotation: 0, scale: 1,
        duration: 0.62, ease: EASE.settle,
        delay: i * 0.11 * I,
      }),
    });
  });

  /* ──────────────────────────────────────────────────────────────────
     10. "MADE BY" — entrance + tape-peel hover
  ────────────────────────────────────────────────────────────────── */
  const madeByCard = document.querySelector('.made-by-card');
  const madeByTape = document.querySelector('.made-by-tape');

  if (madeByCard) {
    gsap.set(madeByCard, { opacity: 0, y: 32 * I, rotation: 0.4 });

    ScrollTrigger.create({
      trigger: madeByCard,
      start: 'top 88%',
      onEnter: () => gsap.to(madeByCard, {
        opacity: 1, y: 0, rotation: 0.4,
        duration: 0.7, ease: EASE.settle,
      }),
    });

    if (!isTouch) {
      madeByCard.addEventListener('mouseenter', () => {
        gsap.to(madeByCard, { y: -7 * I, rotation: 0, duration: 0.32, ease: 'power2.out' });
        if (madeByTape) {
          gsap.to(madeByTape, {
            scaleX: 0.78, rotation: -5, transformOrigin: '50% 0%',
            duration: 0.4, ease: 'power2.out',
          });
        }
      });
      madeByCard.addEventListener('mouseleave', () => {
        gsap.to(madeByCard, { y: 0, rotation: 0.4, duration: 0.55, ease: EASE.settle });
        if (madeByTape) {
          gsap.to(madeByTape, {
            scaleX: 1, rotation: 0,
            duration: 0.6, ease: EASE.spring,
          });
        }
      });
    }
  }
}
/* end animations.js */
