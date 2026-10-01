/* ═══════════════════════════════════════════════════════════════════════
   quiz.js — "Which block are you?" Quiz
   ───────────────────────────────────────────────────────────────────────
   3-question scoring quiz that recommends a template. Each answer adds
   points to one or more templates; the highest scorer wins. All template
   data (name, cover, link, color) is read from the existing .card DOM
   elements so there is one source of truth.

   TO REMOVE: delete <script src="quiz.js"> in index.html and the
   "QUIZ" CSS block in the <style> tag. Nothing else changes.
═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Questions & scoring ──────────────────────────────────────────── */
  /* Scores reference card index order as they appear in the DOM grid.
     Index: 0=Group Hug, 1=Budget+Finance, 2=Second Brain,
            3=Romanticize, 4=Health Tracker, 5=Content Hub,
            6=Client+Admin, 7=Reading Log, 8=Bread Board, 9=Appliance */
  const QUESTIONS = [
    {
      q: 'Your ideal Sunday looks like...',
      options: [
        { label: '☕  Brunch plans with everyone I love', scores: { 0: 3, 3: 1 } },
        { label: '🍳  Testing a new recipe at home',      scores: { 8: 3, 9: 1 } },
        { label: '📚  Lost in a book or three',           scores: { 7: 3, 2: 1 } },
        { label: '🎨  Working on a creative project',     scores: { 5: 3, 2: 1 } },
      ],
    },
    {
      q: 'What would make your life feel better right now?',
      options: [
        { label: '💸  Actually knowing where my money goes', scores: { 1: 3 } },
        { label: '🌿  Getting on top of my health habits',   scores: { 4: 3, 3: 1 } },
        { label: '🧠  Getting my ideas out of my head',      scores: { 2: 3, 5: 1 } },
        { label: '📋  A clearer system for client work',     scores: { 6: 3, 1: 1 } },
      ],
    },
    {
      q: 'Pick the word that speaks to you:',
      options: [
        { label: '✨  Aesthetic',   scores: { 3: 3, 0: 1 } },
        { label: '📊  Organised',   scores: { 1: 2, 6: 1, 4: 2 } },
        { label: '🌟  Creative',    scores: { 5: 3, 7: 1 } },
        { label: '🏡  Cosy',       scores: { 8: 2, 9: 3 } },
      ],
    },
  ];

  /* ── Read template data from existing cards ───────────────────────── */
  const cards = [...document.querySelectorAll('#templates .card')];
  if (!cards.length) return;

  const templates = cards.map(card => ({
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

  /* ── Build the section ────────────────────────────────────────────── */
  const section = document.createElement('section');
  section.className = 'quiz-section';
  section.setAttribute('aria-labelledby', 'quiz-heading');
  section.innerHTML = `
    <div class="quiz-inner">
      <div class="quiz-left">
        <div class="section-label">
          <i class="ph-fill ph-pencil-simple" aria-hidden="true"></i> Find Your Block
        </div>
        <h2 class="section-title" id="quiz-heading">Which block are you?</h2>
        <p class="section-sub">3 quick questions. One perfect recommendation.</p>

        <div class="quiz-card">
          <div class="quiz-progress" aria-hidden="true">
            <div class="quiz-dots">
              ${QUESTIONS.map((_, i) => `<span class="quiz-dot${i === 0 ? ' quiz-dot--active' : ''}"></span>`).join('')}
            </div>
            <span class="quiz-step">1 / ${QUESTIONS.length}</span>
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
                <a class="quiz-result-buy" href="#" target="_blank" rel="noopener noreferrer">
                  Get Block <i class="ph-bold ph-arrow-right" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          </div>
          <button class="quiz-retake" type="button">Take it again →</button>
        </div>
      </div>

      <aside class="quiz-aside" aria-hidden="true">
        <div class="quiz-note">
          <div class="quiz-note-tape"></div>
          <p class="quiz-note-title">how it works</p>
          <ul class="quiz-note-list">
            <li>✦ answer 3 quick questions</li>
            <li>✦ we match you to your vibe</li>
            <li>✦ get your perfect template</li>
          </ul>
          <p class="quiz-note-foot">no wrong answers ♥</p>
        </div>
        <span class="quiz-note-deco" aria-hidden="true">★</span>
      </aside>
    </div>
  `;

  /* Insert before the builder section (which sits before .bundles) */
  const anchor = document.querySelector('.builder-section') || document.querySelector('.bundles');
  anchor?.parentNode?.insertBefore(section, anchor);

  /* ── Cache refs ───────────────────────────────────────────────────── */
  const quizCard   = section.querySelector('.quiz-card');
  const dotsEls    = [...section.querySelectorAll('.quiz-dot')];
  const stepEl     = section.querySelector('.quiz-step');
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

  /* ── State ────────────────────────────────────────────────────────── */
  let current = 0;
  let scores  = new Array(templates.length).fill(0);

  showQuestion(0, false);

  /* ── Render a question ────────────────────────────────────────────── */
  function showQuestion(idx, animate) {
    const q = QUESTIONS[idx];

    dotsEls.forEach((d, i) => {
      d.classList.toggle('quiz-dot--active', i === idx);
      d.classList.toggle('quiz-dot--done',   i < idx);
    });
    stepEl.textContent     = `${idx + 1} / ${QUESTIONS.length}`;
    questionEl.textContent = q.q;

    optionsEl.innerHTML = '';
    q.options.forEach((opt, oi) => {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'quiz-option';
      btn.setAttribute('aria-label', opt.label.replace(/^\S+\s+/, '')); /* strip emoji for SR */
      btn.textContent = opt.label;
      btn.addEventListener('click', () => pick(opt.scores, btn));
      optionsEl.appendChild(btn);
    });

    if (animate && typeof gsap !== 'undefined') {
      gsap.fromTo(quizCard,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.34, ease: 'power3.out' }
      );
    } else if (typeof gsap !== 'undefined') {
      gsap.set(quizCard, { opacity: 1, x: 0 });
    }
  }

  /* ── Handle an answer pick ────────────────────────────────────────── */
  function pick(optScores, chosenBtn) {
    /* Highlight the chosen option and disable the rest */
    [...optionsEl.querySelectorAll('.quiz-option')].forEach(b => {
      b.disabled = true;
      b.classList.toggle('quiz-option--selected', b === chosenBtn);
      b.classList.toggle('quiz-option--faded',    b !== chosenBtn);
    });

    Object.entries(optScores).forEach(([id, pts]) => { scores[parseInt(id, 10)] += pts; });

    setTimeout(() => {
      current++;
      if (current < QUESTIONS.length) {
        if (typeof gsap !== 'undefined') {
          gsap.to(quizCard, {
            opacity: 0, x: -50, duration: 0.22, ease: 'power2.in',
            onComplete: () => showQuestion(current, true),
          });
        } else {
          showQuestion(current, false);
        }
      } else {
        revealResult();
      }
    }, 340);
  }

  /* ── Reveal the result card ───────────────────────────────────────── */
  function revealResult() {
    let winner = 0;
    scores.forEach((s, i) => { if (s > scores[winner]) winner = i; });
    const t = templates[winner];

    resCover.src              = t.cover;
    resCover.alt              = t.coverAlt;
    resTag.textContent        = t.tagText;
    resTag.style.background   = t.tagBg;
    resTag.style.color        = t.tagColor;
    resName.textContent       = t.name;
    resDesc.textContent       = t.desc;
    resPrice.textContent      = t.price;
    resBuy.href               = t.link;
    resBuy.style.background   = t.btnColor;
    if (t.fbq) resBuy.setAttribute('onclick', t.fbq);
    else        resBuy.removeAttribute('onclick');

    if (typeof gsap !== 'undefined') {
      gsap.to(quizCard, {
        opacity: 0, scale: 0.9, duration: 0.22, ease: 'power2.in',
        onComplete() {
          quizCard.hidden = true;
          resultEl.hidden = false;
          gsap.fromTo(resultEl,
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 0.48, ease: 'back.out(1.4)' }
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
    if (typeof gsap !== 'undefined') gsap.set(quizCard, { opacity: 1, x: 0, scale: 1 });
    showQuestion(0, true);
  });

})();
