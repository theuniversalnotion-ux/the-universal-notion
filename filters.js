/* ═══════════════════════════════════════════════════════════════════════
   filters.js — Category Filter Chips
   ───────────────────────────────────────────────────────────────────────
   Reads unique categories from the existing .card-tag elements and injects
   an "All + one chip per category" filter bar above the template grid.
   Cards fade out / in with GSAP when the active filter changes.

   TO REMOVE THIS FEATURE: delete <script src="filters.js"> in index.html
   and the "FILTERS" CSS block in the <style> tag. Nothing else changes.
═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const grid = document.querySelector('#templates .grid');
  if (!grid) return;

  const cards = [...grid.querySelectorAll('.card')];
  if (!cards.length) return;

  /* ── Collect unique categories in DOM order ──────────────────────── */
  const seen = new Set();
  const categories = []; /* [{ label, bg, color }] */

  cards.forEach(card => {
    const tag = card.querySelector('.card-tag');
    if (!tag) return;
    const label = tag.textContent.trim();
    if (seen.has(label)) return;
    seen.add(label);
    categories.push({
      label,
      bg:    tag.style.background || tag.style.backgroundColor || '',
      color: tag.style.color || '',
    });
  });

  if (!categories.length) return;

  /* ── Build the filter bar ──────────────────────────────────────────── */
  const bar = document.createElement('div');
  bar.className = 'filter-bar';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Filter templates by category');

  const makeChip = (label, bg, color, isAll) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = isAll ? 'filter-chip filter-chip--active' : 'filter-chip';
    btn.dataset.filter = isAll ? 'all' : label;
    btn.setAttribute('aria-pressed', isAll ? 'true' : 'false');
    btn.setAttribute('aria-label', isAll ? 'Show all blocks' : `Filter by ${label}`);
    btn.textContent = isAll ? 'All' : label;
    if (!isAll) {
      btn.dataset.bg    = bg;
      btn.dataset.color = color;
    }
    return btn;
  };

  bar.appendChild(makeChip('All', '', '', true));
  categories.forEach(({ label, bg, color }) => {
    bar.appendChild(makeChip(label, bg, color, false));
  });

  grid.parentNode.insertBefore(bar, grid);

  /* ── State ─────────────────────────────────────────────────────────── */
  let active = 'all';

  /* ── Filter logic ──────────────────────────────────────────────────── */
  function applyFilter(next) {
    if (next === active) return;
    active = next;

    const showing = next === 'all'
      ? cards
      : cards.filter(c => c.querySelector('.card-tag')?.textContent.trim() === next);
    const hiding = cards.filter(c => !showing.includes(c));

    if (typeof gsap !== 'undefined') {
      /* Fade out non-matching cards first, then show matching */
      if (hiding.length) {
        gsap.to(hiding, {
          opacity: 0, scale: 0.92, duration: 0.22, ease: 'power2.in',
          stagger: 0.03,
          onComplete() {
            hiding.forEach(c => { c.style.display = 'none'; });
            revealShowing();
          },
        });
      } else {
        revealShowing();
      }

      function revealShowing() {
        showing.forEach(c => {
          if (c.style.display === 'none') c.style.display = '';
        });
        gsap.fromTo(showing,
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 0.32, ease: 'back.out(1.4)', stagger: 0.05 }
        );
      }
    } else {
      /* No GSAP fallback */
      hiding.forEach(c => { c.style.display = 'none'; });
      showing.forEach(c => { c.style.display = ''; });
    }
  }

  /* ── Chip click / keyboard ─────────────────────────────────────────── */
  bar.addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    setActive(chip);
    applyFilter(chip.dataset.filter);
  });

  /* Arrow-key nav within the bar */
  bar.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const chips = [...bar.querySelectorAll('.filter-chip')];
    const idx   = chips.indexOf(document.activeElement);
    let next;
    if (e.key === 'ArrowRight') next = chips[(idx + 1) % chips.length];
    if (e.key === 'ArrowLeft')  next = chips[(idx - 1 + chips.length) % chips.length];
    if (e.key === 'Home')       next = chips[0];
    if (e.key === 'End')        next = chips[chips.length - 1];
    next?.focus();
    next && setActive(next);
    next && applyFilter(next.dataset.filter);
  });

  function setActive(chip) {
    bar.querySelectorAll('.filter-chip').forEach(c => {
      c.classList.remove('filter-chip--active');
      c.setAttribute('aria-pressed', 'false');
      c.style.removeProperty('--chip-bg');
      c.style.removeProperty('--chip-color');
    });
    chip.classList.add('filter-chip--active');
    chip.setAttribute('aria-pressed', 'true');
    if (chip.dataset.filter !== 'all') {
      chip.style.setProperty('--chip-bg',    chip.dataset.bg);
      chip.style.setProperty('--chip-color', chip.dataset.color);
    }
    /* Pop animation */
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(chip,
        { scale: 0.88 },
        { scale: 1, duration: 0.32, ease: 'back.out(2)' }
      );
    }
  }

})();
