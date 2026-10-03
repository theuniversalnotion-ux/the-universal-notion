/* ═══════════════════════════════════════════════════════════════════════
   quiz.js — "Which block are you?" Quiz
═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const QUESTIONS = [
    {
      q: 'Your ideal Sunday looks like...',
      options: [
        { icon: 'ph-coffee',      label: 'Brunch with everyone I love',    scores: { 0: 3, 3: 1 } },
        { icon: 'ph-cooking-pot', label: 'Testing a new recipe at home',   scores: { 8: 3, 9: 1 } },
        { icon: 'ph-book-open',   label: 'Lost in a book or three',        scores: { 7: 3, 2: 1 } },
        { icon: 'ph-paint-brush', label: 'Working on a creative project',  scores: { 5: 3, 2: 1 } },
      ],
    },
    {
      q: 'What would make your life feel better right now?',
      options: [
        { icon: 'ph-currency-dollar', label: 'Knowing where my money goes', scores: { 1: 3 } },
        { icon: 'ph-heart',           label: 'Getting on top of my health', scores: { 4: 3, 3: 1 } },
        { icon: 'ph-lightbulb',       label: 'Getting ideas out of my head', scores: { 2: 3, 5: 1 } },
        { icon: 'ph-briefcase',       label: 'A clearer system for clients', scores: { 6: 3, 1: 1 } },
      ],
    },
    {
      q: 'Pick the word that speaks to you:',
      options: [
        { icon: 'ph-sparkle',       label: 'Aesthetic',  scores: { 3: 3, 0: 1 } },
        { icon: 'ph-list',          label: 'Organised',  scores: { 1: 2, 6: 1, 4: 2 } },
        { icon: 'ph-pencil-simple', label: 'Creative',   scores: { 5: 3, 7: 1 } },
        { icon: 'ph-house',         label: 'Cosy',       scores: { 8: 2, 9: 3 } },
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
        <span class="quiz-option-icon" aria-hidden="true">
          <i class="ph-fill ph-${opt.icon}"></i>
        </span>
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
