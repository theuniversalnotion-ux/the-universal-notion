/* ═══════════════════════════════════════════════════════════════════════
   quiz.js — "Which block are you?" Quiz
═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* Inline SVGs — no dependency on Phosphor or any external font */
  const SVG = {
    coffee:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`,
    pot:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5"/><path d="M3 11h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7z"/><path d="M1 11h2M21 11h2"/><path d="M8 5V3M16 5V3"/></svg>`,
    book:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    brush:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17c0 1.7 1.3 3 3 3s3-1.3 3-3v-1H3v1z"/><path d="M9 16V5a3 3 0 0 0-6 0v11"/><line x1="6" y1="2" x2="6" y2="5"/></svg>`,
    dollar:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    heart:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    bulb:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14z"/></svg>`,
    briefcase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    sparkle:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z"/><path d="M19 3l.67 2L22 5.67l-2.33.67L19 8.33l-.67-2.33L16 5.33l2.33-.66z"/><path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5z"/></svg>`,
    list:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></svg>`,
    pencil:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`,
    house:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  };

  const QUESTIONS = [
    {
      q: 'Your ideal Sunday looks like...',
      options: [
        { icon: 'coffee',    label: 'Brunch with everyone I love',   scores: { 0: 3, 3: 1 } },
        { icon: 'pot',       label: 'Testing a new recipe at home',  scores: { 8: 3, 9: 1 } },
        { icon: 'book',      label: 'Lost in a book or three',       scores: { 7: 3, 2: 1 } },
        { icon: 'brush',     label: 'Working on a creative project', scores: { 5: 3, 2: 1 } },
      ],
    },
    {
      q: 'What would make your life feel better right now?',
      options: [
        { icon: 'dollar',    label: 'Knowing where my money goes',   scores: { 1: 3 } },
        { icon: 'heart',     label: 'Getting on top of my health',   scores: { 4: 3, 3: 1 } },
        { icon: 'bulb',      label: 'Getting ideas out of my head',  scores: { 2: 3, 5: 1 } },
        { icon: 'briefcase', label: 'A clearer system for clients',  scores: { 6: 3, 1: 1 } },
      ],
    },
    {
      q: 'Pick the word that speaks to you:',
      options: [
        { icon: 'sparkle', label: 'Aesthetic',  scores: { 3: 3, 0: 1 } },
        { icon: 'list',    label: 'Organised',  scores: { 1: 2, 6: 1, 4: 2 } },
        { icon: 'pencil',  label: 'Creative',   scores: { 5: 3, 7: 1 } },
        { icon: 'house',   label: 'Cosy',       scores: { 8: 2, 9: 3 } },
      ],
    },
  ];

  const cards = [...document.querySelectorAll('#templates .card')];
  if (!cards.length) return;

  const templates = (window.PRODUCTS && window.PRODUCTS.length)
    ? window.PRODUCTS.map(p => ({
        name:     p.name,
        desc:     p.desc,
        cover:    p.images[0] || '',
        coverAlt: p.alt,
        tagText:  p.category,
        tagBg:    p.tagBg,
        tagColor: p.tagColor,
        link:     p.url,
        btnColor: p.btnColor,
        fbq:      p.fbq || '',
        price:    p.price,
      }))
    : cards.map(card => ({
        name:     card.querySelector('h3')?.textContent.trim()           || '',
        desc:     card.querySelector('.card-body p')?.textContent.trim() || '',
        cover:    card.querySelector('.card-photo img')?.src             || '',
        coverAlt: card.querySelector('.card-photo img')?.alt             || '',
        tagText:  card.querySelector('.card-tag')?.textContent.trim()    || '',
        tagBg:    card.querySelector('.card-tag')?.style.background      || '',
        tagColor: card.querySelector('.card-tag')?.style.color           || '',
        link:     card.querySelector('.buy-btn')?.href                   || '#',
        btnColor: card.querySelector('.buy-btn')?.style.background       || 'var(--rose)',
        fbq:      card.querySelector('.buy-btn')?.getAttribute('onclick')|| '',
        price:    card.querySelector('.price')?.textContent.trim()       || '$4.99',
      }));

  /* ── Build section ────────────────────────────────────────────────── */
  const section = document.createElement('section');
  section.className = 'quiz-section';
  section.setAttribute('aria-labelledby', 'quiz-heading');
  section.innerHTML = `
    <span class="quiz-bg-doodle quiz-bg-doodle--1" aria-hidden="true">✦</span>
    <span class="quiz-bg-doodle quiz-bg-doodle--2" aria-hidden="true">✿</span>
    <span class="quiz-bg-doodle quiz-bg-doodle--3" aria-hidden="true">★</span>
    <span class="quiz-bg-doodle quiz-bg-doodle--4" aria-hidden="true">✦</span>

    <div class="quiz-inner">
      <div class="quiz-left">
        <div class="section-label">
          <i class="ph-fill ph-pencil-simple" aria-hidden="true"></i> Find Your Block
        </div>
        <h2 class="section-title" id="quiz-heading">Which block are you?</h2>
        <p class="section-sub">3 quick questions. One perfect recommendation.</p>

        <div class="quiz-how" aria-hidden="true">
          <span class="quiz-how-pill">✦ 3 questions</span>
          <span class="quiz-how-sep">·</span>
          <span class="quiz-how-pill">✦ match your vibe</span>
          <span class="quiz-how-sep">·</span>
          <span class="quiz-how-pill">✦ get your template</span>
        </div>

        <div class="quiz-card">
          <div class="quiz-progress" aria-hidden="true">
            <div class="quiz-stars">
              ${QUESTIONS.map((_, i) => `<span class="quiz-star${i === 0 ? ' quiz-star--active' : ''}">✦</span>`).join('')}
            </div>
            <span class="quiz-step">Question <strong>1</strong> of ${QUESTIONS.length}</span>
          </div>
          <p class="quiz-question" aria-live="polite"></p>
          <div class="quiz-options" role="group" aria-label="Answer options"></div>
        </div>

        <div class="quiz-result" hidden>
          <p class="quiz-result-eyebrow" aria-live="polite">✦ Your block is...</p>
          <div class="quiz-result-card">
            <div class="quiz-result-tape" aria-hidden="true"></div>
            <img class="quiz-result-cover" src="" alt="" loading="eager">
            <div class="quiz-result-body">
              <div class="quiz-result-tag"></div>
              <h3 class="quiz-result-name"></h3>
              <p class="quiz-result-desc"></p>
              <div class="quiz-result-footer">
                <span class="quiz-result-price"></span>
                <a class="quiz-result-buy" href="#" target="_blank" rel="noopener noreferrer" data-gumroad-overlay-checkout="true">
                  Get Block <i class="ph-bold ph-arrow-right" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          </div>
          <button class="quiz-retake" type="button">↩ Take it again</button>
        </div>
      </div>

    </div>
  `;

  const anchor = document.querySelector('.builder-section') || document.querySelector('.bundles');
  anchor?.parentNode?.insertBefore(section, anchor);

  /* ── Cache refs ───────────────────────────────────────────────────── */
  const quizCard  = section.querySelector('.quiz-card');
  const starEls   = [...section.querySelectorAll('.quiz-star')];
  const stepEl    = section.querySelector('.quiz-step strong');
  const questionEl = section.querySelector('.quiz-question');
  const optionsEl  = section.querySelector('.quiz-options');
  const resultEl   = section.querySelector('.quiz-result');
  const retakeBtn  = section.querySelector('.quiz-retake');
  const resCover   = section.querySelector('.quiz-result-cover');
  const resTag     = section.querySelector('.quiz-result-tag');
  const resName    = section.querySelector('.quiz-result-name');
  const resDesc    = section.querySelector('.quiz-result-desc');
  const resPrice   = section.querySelector('.quiz-result-price');
  const resBuy     = section.querySelector('.quiz-result-buy');

  let current = 0;
  let scores  = new Array(templates.length).fill(0);

  showQuestion(0, false);

  /* ── Render a question ────────────────────────────────────────────── */
  function showQuestion(idx, animate) {
    const q = QUESTIONS[idx];

    starEls.forEach((s, i) => {
      s.classList.toggle('quiz-star--active', i === idx);
      s.classList.toggle('quiz-star--done',   i < idx);
    });
    stepEl.textContent = idx + 1;

    questionEl.textContent = q.q;
    optionsEl.innerHTML = '';

    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'quiz-option';
      btn.setAttribute('aria-label', opt.label);
      btn.innerHTML = `
        <span class="quiz-option-icon" aria-hidden="true">${SVG[opt.icon] || ''}</span>
        <span class="quiz-option-text">${opt.label}</span>
      `;

      if (typeof gsap !== 'undefined') {
        btn.addEventListener('mouseenter', () => {
          gsap.killTweensOf(btn);
          gsap.timeline()
            .to(btn, { y: -4, rotation: -2, duration: 0.09, ease: 'power1.out' })
            .to(btn, { y: 0,  rotation: 0,  duration: 0.42, ease: 'elastic.out(1.5, 0.4)' });
        });
      }

      btn.addEventListener('click', () => pick(opt.scores, btn));
      optionsEl.appendChild(btn);
    });

    if (animate && typeof gsap !== 'undefined') {
      gsap.fromTo(quizCard,
        { opacity: 0, x: 48, scale: 0.97 },
        { opacity: 1, x: 0,  scale: 1, duration: 0.38, ease: 'back.out(1.6)' }
      );
    } else if (typeof gsap !== 'undefined') {
      gsap.set(quizCard, { opacity: 1, x: 0, scale: 1 });
    }
  }

  /* ── Handle an answer pick ────────────────────────────────────────── */
  function pick(optScores, chosenBtn) {
    [...optionsEl.querySelectorAll('.quiz-option')].forEach(b => {
      b.disabled = true;
      b.classList.toggle('quiz-option--selected', b === chosenBtn);
      b.classList.toggle('quiz-option--faded',    b !== chosenBtn);
    });

    if (typeof gsap !== 'undefined') {
      gsap.to(chosenBtn, {
        scale: 1.06, duration: 0.12, ease: 'power2.out',
        onComplete: () => gsap.to(chosenBtn, { scale: 1, duration: 0.3, ease: 'elastic.out(1.4,0.5)' }),
      });
    }

    Object.entries(optScores).forEach(([id, pts]) => { scores[parseInt(id, 10)] += pts; });

    setTimeout(() => {
      current++;
      if (current < QUESTIONS.length) {
        if (typeof gsap !== 'undefined') {
          gsap.to(quizCard, {
            opacity: 0, x: -48, scale: 0.97, duration: 0.22, ease: 'power2.in',
            onComplete: () => showQuestion(current, true),
          });
        } else {
          showQuestion(current, false);
        }
      } else {
        revealResult();
      }
    }, 360);
  }

  /* ── Confetti burst ───────────────────────────────────────────────── */
  function confettiBurst() {
    const COLORS = ['#F2A8BE','#F9E4A0','#D4C5F0','#C94B6A','#A8D4C8','#F0C4A0','#F4AABA'];
    const SHAPES = ['✦','✿','★','✦','✿','★','♦'];
    const rect   = resultEl.getBoundingClientRect();
    const count  = 32;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.textContent  = SHAPES[i % SHAPES.length];
      const startX    = rect.left + rect.width  * (0.05 + Math.random() * 0.9);
      const startY    = rect.top  + rect.height * (0.05 + Math.random() * 0.3);
      el.style.cssText = [
        'position:fixed',
        `left:${startX}px`, `top:${startY}px`,
        `font-size:${9 + Math.random() * 13}px`,
        `color:${COLORS[i % COLORS.length]}`,
        'pointer-events:none', 'z-index:9999', 'user-select:none',
        'transform:translate(-50%,-50%)',
      ].join(';');
      document.body.appendChild(el);

      gsap.fromTo(el,
        { x: 0, y: 0, opacity: 1, rotation: Math.random() * 180, scale: 0.4 },
        {
          x: (Math.random() - 0.5) * 220,
          y: -(40 + Math.random() * 120),
          opacity: 0,
          rotation: Math.random() * 360 - 180,
          scale: 1.1,
          duration: 0.9 + Math.random() * 0.7,
          ease: 'power2.out',
          delay: i * 0.018,
          onComplete: () => el.remove(),
        }
      );
    }
  }

  /* ── Reveal the result card ───────────────────────────────────────── */
  function revealResult() {
    let winner = 0;
    scores.forEach((s, i) => { if (s > scores[winner]) winner = i; });
    const t = templates[winner];

    resCover.src            = t.cover;
    resCover.alt            = t.coverAlt;
    resTag.textContent      = t.tagText;
    resTag.style.background = t.tagBg;
    resTag.style.color      = t.tagColor;
    resName.textContent     = t.name;
    resDesc.textContent     = t.desc;
    resPrice.textContent    = t.price;
    resBuy.href             = t.link;
    resBuy.style.background = t.btnColor;
    if (t.fbq) resBuy.setAttribute('onclick', t.fbq);
    else        resBuy.removeAttribute('onclick');

    if (typeof gsap !== 'undefined') {
      gsap.to(quizCard, {
        opacity: 0, scale: 0.88, duration: 0.24, ease: 'power2.in',
        onComplete() {
          quizCard.hidden = true;
          resultEl.hidden = false;
          gsap.fromTo(resultEl,
            { opacity: 0, scale: 0.85, y: 28, rotation: -2 },
            {
              opacity: 1, scale: 1, y: 0, rotation: 0,
              duration: 0.55, ease: 'back.out(2)',
              onComplete: confettiBurst,
            }
          );
        },
      });
    } else {
      quizCard.hidden = true;
      resultEl.hidden = false;
    }
  }

  /* ── Retake ───────────────────────────────────────────────────────── */
  retakeBtn.addEventListener('click', () => {
    scores   = new Array(templates.length).fill(0);
    current  = 0;
    resultEl.hidden   = true;
    quizCard.hidden   = false;
    if (typeof gsap !== 'undefined') gsap.set(quizCard, { opacity: 1, x: 0, scale: 1, rotation: 0 });
    showQuestion(0, true);
  });

})();
